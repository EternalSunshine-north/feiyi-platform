import { NextResponse, type NextRequest } from 'next/server';
import { ichList } from '@/lib/ich';
import { classifyIntent, INTENT_LABEL } from '@/lib/intent';
import { SYSTEM_PROMPT, buildKnowledgeDigest, localAnswer, searchLocal } from '@/lib/knowledge';
import { styleTemplate, type AnswerStyle } from '@/lib/answerStyles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 问答模式工作流 · 在线链路
 *
 * 1 规范化 → 2 意图路由（LLM，规则兜底）→ 3 混合检索（RAG）→ 4 提示词与引用组装
 * → 5 大模型生成（DeepSeek 流式 / 本地兜底）→ 6 事实校验 → 7 输出后处理（来源 + 免责 + 推荐）
 * 第 8 步会话记忆由 /api/memory 负责。
 *
 * 前端协议（SSE）：
 *   data: {"delta":"..."}                    流式增量
 *   data: {"meta":{...}}                     结束时回传意图、来源、校验结果
 *   data: [DONE]
 */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const encoder = new TextEncoder();
const sse = (payload: unknown) => encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);

export async function GET() {
  return NextResponse.json({
    agent: 'deepseek',
    configured: Boolean(process.env.DEEPSEEK_API_KEY),
    model: process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-chat',
    endpoint: '/api/chat',
    workflow: 'qa-rag',
    steps: ['normalize', 'route', 'retrieve', 'assemble', 'generate', 'verify', 'respond', 'memory'],
  });
}

export async function POST(request: NextRequest) {
  let body: { messages?: ChatMessage[]; style?: AnswerStyle; user?: string };
  try {
    body = (await request.json()) as { messages?: ChatMessage[]; style?: AnswerStyle; user?: string };
  } catch {
    return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const messages: ChatMessage[] = incoming
    .filter((message) => message && typeof message.content === 'string' && message.content.trim())
    .slice(-12)
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content.slice(0, 4000),
    }));

  if (messages.length === 0) return NextResponse.json({ error: '缺少对话内容' }, { status: 400 });

  const question = [...messages].reverse().find((message) => message.role === 'user')?.content ?? '';
  const style = styleTemplate(body.style);

  // 2 意图路由
  const intent = await classifyIntent(question);
  // 3 混合检索
  const hits = intent.intent === 'chat' ? [] : searchLocal(question).slice(0, 3);

  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  const baseUrl = (process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com').replace(/\/$/, '');
  const model = process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-chat';

  const meta = {
    intent: intent.intent,
    intentLabel: INTENT_LABEL[intent.intent],
    intentEngine: intent.engine,
    route: intent.route,
    style: style.id,
    styleLabel: style.label,
    sources: hits.map(({ item }) => ({ id: item.id, name: item.name, href: `/heritage/${item.id}` })),
    engine: apiKey ? 'deepseek' : 'local',
  };

  if (!apiKey) {
    // 5' 本地兜底：不用模型也能演示，风格模板以标注形式体现
    const answer = `${localAnswer(question)}\n\n> 回答风格「${style.label}」：${style.instruction}\n> 配置 DEEPSEEK_API_KEY 后，将由模型按该风格改写。`;
    return streamText(answer, meta, hits);
  }

  // 4 提示词与引用组装
  const contextBlock =
    hits.length > 0
      ? hits
          .map(({ item }) => {
            return `【片段】${item.name}｜${item.level}｜${item.category}｜${item.region}\n${item.summary}\n列入原因：${item.reason[0] ?? ''}\n背景：${(item.background[0] ?? '').slice(0, 80)}`;
          })
          .join('\n\n')
      : '（本次未检索到相关片段，请按资料库未收录处理）';

  const system = [
    SYSTEM_PROMPT,
    '',
    `【回答风格：${style.label}（${style.lengthHint}）】`,
    style.instruction,
    '',
    '【引用规则】凡使用下面检索片段的内容，需在句末标注来源项目名；资料库没有的，写明「资料库未收录」。',
    intent.intent === 'creation'
      ? '【额外提示】用户在做创作类请求，可在回答末尾建议他到「AI 创作」页用文生图工作流出图。'
      : '',
    '',
    '【检索片段】',
    contextBlock,
    '',
    '【资料库全量摘要（仅在需要时参考，不要整段复述）】',
    buildKnowledgeDigest().slice(0, 4000),
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.7,
        max_tokens: 1400,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
      signal: AbortSignal.timeout(90_000),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => '');
      console.error('[DeepSeek] 调用失败', upstream.status, detail.slice(0, 300));
      return streamText(
        `（DeepSeek 调用失败，已切换本地知识库）\n\n${localAnswer(question)}`,
        { ...meta, engine: 'local' },
        hits,
      );
    }

    return new Response(transform(upstream.body, meta, hits), {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'x-ai-mode': 'deepseek',
      },
    });
  } catch (error) {
    console.error('[DeepSeek] 请求异常', error);
    return streamText(
      `（DeepSeek 网络异常，已切换本地知识库）\n\n${localAnswer(question)}`,
      { ...meta, engine: 'local' },
      hits,
    );
  }
}

type Hit = { item: (typeof ichList)[number]; score: number };

function streamText(text: string, meta: UnknownMeta, hits: Hit[]) {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const chunks = text.match(/[\s\S]{1,6}/g) ?? [text];
      for (const chunk of chunks) {
        controller.enqueue(sse({ delta: chunk }));
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      controller.enqueue(sse({ meta: { ...meta, verify: verifyAnswer(text, hits) } }));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'x-ai-mode': meta.engine === 'deepseek' ? 'deepseek' : 'local',
    },
  });
}

/** 6 事实校验：边转发边累计文本，结束时把校验结果一起回传 */
function transform(upstream: ReadableStream<Uint8Array>, meta: UnknownMeta, hits: Hit[]) {
  const decoder = new TextDecoder();
  const encoderLocal = new TextEncoder();
  let buffer = '';
  let full = '';

  return upstream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const parts = buffer.split('\n');
        buffer = parts.pop() ?? '';

        for (const raw of parts) {
          const line = raw.trim();
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          if (payload === '[DONE]') continue;
          try {
            const json = JSON.parse(payload) as { choices?: { delta?: { content?: string } }[] };
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              full += delta;
              controller.enqueue(encoderLocal.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            }
          } catch {
            /* 忽略异常分片 */
          }
        }
      },
      flush(controller) {
        controller.enqueue(sse({ meta: { ...meta, verify: verifyAnswer(full, hits) } }));
        controller.enqueue(encoderLocal.encode('data: [DONE]\n\n'));
      },
    }),
  );
}

interface UnknownMeta {
  intent: string;
  intentLabel: string;
  intentEngine: string;
  route: string;
  style: string;
  styleLabel: string;
  sources: { id: string; name: string; href: string }[];
  engine: string;
}

/** 事实校验：提到的项目是否有检索支撑 + 数字需人工确认 */
function verifyAnswer(answer: string, hits: Hit[]) {
  const hitIds = new Set(hits.map((hit) => hit.item.id));
  const mentioned = ichList.filter((item) => answer.includes(item.name));
  const unsupported = mentioned.filter((item) => !hitIds.has(item.id)).map((item) => item.name);
  const numbers = Array.from(new Set(answer.match(/\d+(\.\d+)?/g) ?? []));

  return {
    checked: mentioned.map((item) => item.name),
    unsupported,
    numbers: numbers.slice(0, 6),
    action: unsupported.length || numbers.length ? 'pass-with-note' : 'pass',
  };
}
