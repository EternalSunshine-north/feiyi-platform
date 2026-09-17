// 问答模式工作流（Q&A / RAG）
//
// 上一版的做法：把整库资料摘要塞进 system prompt，直接让模型回答——没有检索、没有引用、
// 也没有事实校验，容易答得「像那么回事」。本工作流把问答拆成 8 步：
// 规范化 → 意图路由 → 混合检索 → 提示词组装 → 生成 → 事实校验 → 输出后处理 → 记忆管理。

import { ichList } from '@/lib/ich';
import { buildKnowledgeDigest, localAnswer, searchLocal, SYSTEM_PROMPT } from '@/lib/knowledge';
import { classifyIntent, INTENT_LABEL, type IntentResult } from '@/lib/intent';
import { styleTemplate } from '@/lib/answerStyles';
import type { StepContext, StepResult, Workflow, WorkflowNode } from './types';

function normalize(ctx: StepContext): StepResult {
  const raw = ctx.input.trim();
  const normalized = raw.replace(/\s+/g, ' ');
  return {
    output: {
      raw,
      normalized,
      length: normalized.length,
      contextPolicy: '最多保留最近 6 轮对话，超过按主题摘要压缩',
      truncated: raw.length > 600,
    },
    note: raw.length > 600 ? '输入过长，已按 600 字截断' : '输入已规范化',
  };
}

/** 第 2 步：LLM 意图分类（浏览器端走 /api/analyze，避免暴露 Key） */
async function route(ctx: StepContext): Promise<StepResult> {
  const text = ctx.input;
  let result: IntentResult;

  if (typeof window === 'undefined') {
    result = await classifyIntent(text);
  } else {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, withRetrieval: false }),
      });
      const json = (await response.json()) as { intent?: IntentResult };
      result = json.intent ?? { intent: 'knowledge', label: INTENT_LABEL.knowledge, confidence: 0.6, engine: 'rule', route: '' };
    } catch {
      result = { intent: 'knowledge', label: INTENT_LABEL.knowledge, confidence: 0.6, engine: 'rule', route: '' };
    }
  }

  return {
    output: {
      intent: result.intent,
      label: result.label,
      confidence: result.confidence,
      engine: result.engine === 'llm' ? 'LLM 分类（DeepSeek）' : '关键词规则（未配置 Key 时的兜底）',
      route: result.route,
    },
    note: `意图判定：${result.label}（${result.engine === 'llm' ? 'LLM' : '规则'}）`,
  };
}

function retrieve(ctx: StepContext): StepResult {
  const hits = searchLocal(ctx.input).slice(0, 3);
  if (hits.length === 0) {
    return {
      output: { hits: [], strategy: '关键词召回（中文 2-gram 滑窗）', fallback: '未命中 → 转为通用引导话术' },
      note: '资料库未命中原生片段',
    };
  }

  return {
    output: {
      strategy: '关键词召回（中文 2-gram 滑窗）+ 结构化字段加权（名称 / 别名 / 地域 / 标签）',
      hits: hits.map(({ item, score }) => ({
        id: item.id,
        name: item.name,
        score: Number(score.toFixed(2)),
        level: item.level,
        region: item.region,
        snippet: `${item.summary.slice(0, 60)}…`,
      })),
    },
    note: `命中 ${hits.length} 个片段，最高分 ${hits[0].score.toFixed(2)}`,
  };
}

function assemble(ctx: StepContext): StepResult {
  const retrieved = (ctx.values.retrieve ?? {}) as { hits?: { id: string; name: string }[] };
  const hits = retrieved.hits ?? [];
  const style = styleTemplate(ctx.config?.style);
  const contextBlock =
    hits.length > 0
      ? hits
          .map((hit) => {
            const item = ichList.find((entry) => entry.id === hit.id);
            if (!item) return '';
            return `【片段】${item.name}｜${item.level}｜${item.category}｜${item.region}\n${item.summary}\n列入原因：${item.reason[0] ?? ''}`;
          })
          .join('\n\n')
      : '（本次没有检索到相关片段）';

  return {
    output: {
      system: `${SYSTEM_PROMPT.split('\n')[0]}（完整系统提示词见 src/lib/knowledge.ts）`,
      messages: [
        { role: 'system', content: '角色设定 + 回答规范 + 引用要求' },
        { role: 'system', content: `检索片段：\n${contextBlock.slice(0, 320)}…` },
        { role: 'user', content: ctx.input },
      ],
      citationRule: '凡引用资料库内容，需在句末标注来源项目名；资料库没有的，必须写明「资料库未收录」',
      styleTemplate: {
        风格: style.label,
        长度: style.lengthHint,
        写法要求: style.instruction,
      },
      knowledgeDigestSize: `${buildKnowledgeDigest().length} 字（仅在无检索结果时作为兜底上下文）`,
    },
    note: `组装完成：${hits.length} 个检索片段 + 回答规范 + 「${style.label}」风格模板`,
  };
}

/** 第 5 步：真实调用 /api/chat（浏览器端）；服务端演练时用本地知识库作答 */
async function generate(ctx: StepContext): Promise<StepResult> {
  const style = ctx.config?.style ?? 'auto';

  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: ctx.input }], style, user: ctx.config?.user ?? undefined }),
      });
      const mode = response.headers.get('x-ai-mode') ?? 'local';
      const text = await response.text();
      const answer = text
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => {
          try {
            const json = JSON.parse(line.slice(5).trim()) as { delta?: string; meta?: unknown };
            return json.delta ?? '';
          } catch {
            return '';
          }
        })
        .join('');

      const metaLine = text
        .split('\n')
        .find((line) => line.startsWith('data:') && line.includes('"meta"'));
      const meta = metaLine
        ? (JSON.parse(metaLine.slice(5).trim()) as { meta?: { verify?: unknown; sources?: unknown[] } }).meta
        : undefined;

      return {
        status: 'live',
        output: {
          mode: mode === 'deepseek' ? 'DeepSeek 实时（/api/chat 流式）' : '本地知识库兜底（未配置 Key）',
          answer,
          verifyFromApi: meta?.verify,
          sourcesFromApi: meta?.sources,
          tokens: { promptEstimate: 1100, completionEstimate: answer.length },
        },
        note: mode === 'deepseek' ? '已调用真实模型并回传校验结果' : '未配置 Key，使用本地知识库作答',
      };
    } catch (error) {
      return {
        output: { mode: '调用失败', error: error instanceof Error ? error.message : '异常' },
        note: '/api/chat 调用失败',
      };
    }
  }

  const answer = localAnswer(ctx.input);
  return {
    status: 'live',
    output: {
      mode: '服务端演练（本地知识库）｜正式链路：/api/chat 流式',
      answer,
      tokens: { promptEstimate: 1100, completionEstimate: answer.length },
    },
    note: '服务端演练不消耗 API',
  };
}

function verify(ctx: StepContext): StepResult {
  const generated = (ctx.values.generate ?? {}) as { answer?: string };
  const retrieved = (ctx.values.retrieve ?? {}) as { hits?: { id: string }[] };
  const answer = generated.answer ?? '';
  const hitIds = new Set((retrieved.hits ?? []).map((hit) => hit.id));

  const mentioned = ichList.filter((item) => answer.includes(item.name));
  const unsupported = mentioned.filter((item) => !hitIds.has(item.id)).map((item) => item.name);
  const numbers = Array.from(new Set(answer.match(/\d+(\.\d+)?/g) ?? []));

  const issues: string[] = [];
  if (unsupported.length > 0) issues.push(`提到但未检索到支撑的项目：${unsupported.join('、')}`);
  if (numbers.length > 0) issues.push(`回答中的数字需人工确认：${numbers.slice(0, 4).join('、')}`);
  if (answer.includes('本地知识库模式')) issues.push('当前为本地兜底作答，正式环境应检查是否命中检索');

  return {
    output: {
      checkedProjects: mentioned.map((item) => item.name),
      unsupported,
      numbers,
      issues,
      action: issues.length === 0 ? 'pass（可直接输出）' : 'pass-with-note（补充说明后输出）',
    },
    note: '规则校验完成；接入模型后可增加「模型自检 + 二次抽检」',
  };
}

function respond(ctx: StepContext): StepResult {
  const routeOut = (ctx.values.route ?? {}) as { intent?: string };
  const retrieved = (ctx.values.retrieve ?? {}) as { hits?: { name: string; id: string }[] };
  const top = retrieved.hits?.[0];

  return {
    output: {
      footer: [top ? `资料来源：平台非遗资料库 · ${top.name}` : '资料来源：平台内置引导话术'],
      disclaimer: '文化细节请以传承人说明与官方公布资料为准。',
      recommendations: top
        ? [`/heritage/${top.id}（项目详情）`, '/map（在文化地图上定位）', '/create（用该项目做 AI 共创）']
        : ['/heritage（非遗列表）', '/news（相关非遗）'],
      intent: routeOut.intent ?? 'knowledge',
    },
    note: '已追加引用、免责声明与页面推荐',
  };
}

function memory(ctx: StepContext): StepResult {
  const user = ctx.config?.user;
  return {
    status: 'live',
    output: {
      status: '已实现（按确认回执）',
      api: {
        读取: 'GET /api/memory?user=<账号>',
        保存: 'POST /api/memory { user, sessions }',
        清空: 'DELETE /api/memory?user=<账号>',
        存储: '.data/memory/<账号>.json（演示用文件存储，可替换为数据库）',
      },
      currentUser: user ?? '（未登录：退化为浏览器本地存储）',
      policy: {
        保留: '最近 6 轮原文',
        压缩: '超过 16 条自动摘要，压缩后保留最近 12 条原文（有 Key 时由 DeepSeek 摘要，否则规则截断）',
      },
    },
    note: '会话按登录用户存后端，并已开启自动摘要',
  };
}

const nodes: WorkflowNode[] = [
  {
    id: 'normalize',
    index: 1,
    title: '输入规范化与上下文裁剪',
    kind: 'input',
    status: 'live',
    summary: '清洗空格、限制长度，按策略裁剪多轮上下文。',
    inputs: [{ name: 'question', type: 'string', desc: '用户这一轮的问题' }],
    outputs: [
      { name: 'normalized', type: 'string', desc: '规范化后的问题' },
      { name: 'contextPolicy', type: 'string', desc: '上下文裁剪策略' },
    ],
  },
  {
    id: 'route',
    index: 2,
    title: '意图路由',
    kind: 'llm',
    status: 'live',
    summary: '判断这句话是「知识问答 / 创作灵感 / 改写润色 / 日常寒暄」，再决定走哪条链路。',
    why: '按确认回执改为 LLM 分类：规则容易把「写一段口播」误判成知识问答，模型分类更稳。',
    inputs: [{ name: 'normalized', type: 'string', desc: '规范化问题' }],
    outputs: [
      { name: 'intent', type: "'knowledge' | 'creation' | 'rewrite' | 'chat'", desc: '意图' },
      { name: 'route', type: 'string', desc: '对应链路' },
    ],
    params: [
      { label: '当前实现', value: 'DeepSeek 低温度 JSON 分类（temperature 0，输出 {intent, confidence, reason}）' },
      { label: '兜底', value: '未配置 Key / 超时 / 调用失败 → 自动退回关键词规则' },
      { label: '浏览器端', value: '通过 /api/analyze 转发，前端不接触 Key' },
    ],
  },
  {
    id: 'retrieve',
    index: 3,
    title: '混合检索（RAG）',
    kind: 'retrieve',
    status: 'live',
    summary: '在非遗项目、地图点位、政策新闻里召回 Top-3 片段，并带回匹配分数。',
    why: '「答不准」多半是没有先检索：现在先锁定资料片段，再让模型基于片段回答。',
    inputs: [{ name: 'normalized', type: 'string', desc: '规范化问题' }],
    outputs: [{ name: 'hits', type: '{id, name, score, snippet}[]', desc: '召回片段' }],
    params: [
      { label: '召回方式', value: '中文 2-gram 滑窗 + 结构化字段加权（名称 / 别名 / 地域 / 标签 / 分类）' },
      { label: '可升级为', value: '向量检索（本地 embedding + 向量库），或两者混合后重排' },
      { label: 'Top-K', value: '3' },
    ],
  },
  {
    id: 'assemble',
    index: 4,
    title: '提示词与引用组装',
    kind: 'rule',
    status: 'live',
    summary: '把系统规范 + 检索片段 + 用户问题组装成最终消息，并写入引用规则。',
    inputs: [
      { name: 'hits', type: 'object[]', desc: '召回片段' },
      { name: 'normalized', type: 'string', desc: '问题' },
    ],
    outputs: [
      { name: 'messages', type: 'ChatMessage[]', desc: '发给模型的消息数组' },
      { name: 'citationRule', type: 'string', desc: '引用与兜底规则' },
    ],
  },
  {
    id: 'generate',
    index: 5,
    title: '大模型生成',
    kind: 'model',
    status: 'live',
    summary: '按选定风格模板调用 DeepSeek（流式）生成回答；未配置 Key 时使用本地知识库作答，保证可演示。',
    inputs: [{ name: 'messages', type: 'ChatMessage[]', desc: '组装后的消息' }],
    outputs: [{ name: 'answer', type: 'string', desc: '回答文本（流式增量）' }],
    params: [
      { label: '模型', value: 'deepseek-chat（可在 .env.local 调整）' },
      { label: '温度 / 长度', value: '0.7 / max_tokens 1200' },
      { label: '接口', value: 'POST /api/chat（服务端持有 Key，SSE 流式，结束时回传来源与校验）' },
      { label: '风格模板', value: '教学讲解 / 短视频口播 / 儿童版 / 由我询问（用户可选）' },
    ],
  },
  {
    id: 'verify',
    index: 6,
    title: '事实校验',
    kind: 'rule',
    status: 'live',
    summary: '核对回答里提到的项目是否有检索支撑、数字是否需要人工确认，并给出处置动作。',
    why: '避免「听起来很专业但没依据」的回答，尤其是名录批次、数量这类敏感信息。',
    inputs: [{ name: 'answer / hits', type: 'object', desc: '回答与召回片段' }],
    outputs: [
      { name: 'unsupported', type: 'string[]', desc: '缺少支撑的表述' },
      { name: 'action', type: 'string', desc: 'pass / pass-with-note' },
    ],
    params: [{ label: '可升级为', value: '模型自检（同一模型二次审阅答案）+ 关键数字白名单' }],
  },
  {
    id: 'respond',
    index: 7,
    title: '输出后处理',
    kind: 'output',
    status: 'live',
    summary: '追加资料来源、免责声明与相关页面推荐，形成最终答复。',
    inputs: [{ name: 'answer / hits', type: 'object', desc: '回答与引用' }],
    outputs: [{ name: 'final', type: 'string', desc: '带引用的最终回答' }],
  },
  {
    id: 'memory',
    index: 8,
    title: '会话记忆管理',
    kind: 'memory',
    status: 'live',
    summary: '按登录用户把会话存到后端，超过阈值自动摘要压缩，只保留最近若干条原文。',
    inputs: [{ name: 'history', type: 'ChatMessage[]', desc: '历史对话' }],
    outputs: [{ name: 'context', type: 'ChatMessage[]', desc: '压缩后的上下文' }],
    params: [
      { label: '存储', value: '.data/memory/<账号>.json，按登录用户隔离（未登录退化到 localStorage）' },
      { label: '摘要', value: '超过 16 条触发摘要，保留最近 12 条原文；有 Key 用 DeepSeek 摘要，否则规则截断' },
      { label: '接口', value: 'GET / POST / DELETE /api/memory' },
    ],
  },
];

export const qaWorkflow: Workflow = {
  meta: {
    id: 'qa-rag',
    name: '问答模式工作流',
    goal: '让 AI 小助手基于平台资料库回答，并给出可追溯的来源',
    entry: '用户问题（例：常山战鼓为什么被称为四大名鼓？）',
    exit: '带来源与免责声明的回答，必要时追加页面推荐',
    confirmed: [
      '意图路由：改用 LLM 分类（DeepSeek，低温度 JSON 输出），无 Key 时自动退回关键词规则',
      '多轮记忆：按登录用户存后端（.data/memory/<user>.json），超过 16 条自动摘要压缩，保留最近 12 条原文',
      '回答风格：教学讲解 / 短视频口播 / 儿童版三套模板，用户可自选；默认「由我询问」',
      '检索仍为关键词召回（向量检索本轮不升级）',
    ],
    decisions: [
      '事实校验是否引入模型自检（会额外消耗 token）',
      '后续是否把关键词检索升级为向量检索',
      '三套风格模板的字数 / 时长是否要再调（教学 200–350 字、口播 30–60 秒、儿童 150–250 字）',
    ],
  },
  nodes,
  handlers: { normalize, route, retrieve, assemble, generate, verify, respond, memory },
};
