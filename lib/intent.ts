/**
 * 意图路由（问答工作流第 2 步）
 * 按确认回执：改为 LLM 分类，规则仅作为兜底（无 Key / 超时 / 部署在纯前端时）。
 */

export type Intent = 'knowledge' | 'creation' | 'rewrite' | 'chat';

export interface IntentResult {
  intent: Intent;
  label: string;
  confidence: number;
  engine: 'llm' | 'rule';
  route: string;
}

export const INTENT_LABEL: Record<Intent, string> = {
  knowledge: '非遗知识问答',
  creation: '创作灵感/文生图',
  rewrite: '改写润色',
  chat: '日常寒暄',
};

export const INTENT_ROUTE: Record<Intent, string> = {
  knowledge: '走检索增强（RAG）→ 带引用回答',
  creation: '转交文生图工作流 / 创作模板',
  rewrite: '走改写模板（保留事实、不改数据、不改名录等级）',
  chat: '轻量回答，不触发检索',
};

const RULES: { intent: Intent; words: string[] }[] = [
  { intent: 'creation', words: ['写', '生成', '海报', '文案', '脚本', '创意', '画', '设计', '封面', '口播'] },
  { intent: 'rewrite', words: ['改写', '润色', '翻译', '精简', '扩写', '改成'] },
  { intent: 'chat', words: ['你好', '谢谢', '在吗', '嗨', '再见'] },
  {
    intent: 'knowledge',
    words: ['什么', '为什么', '如何', '怎么', '哪', '介绍', '区别', '历史', '特点', '多少', '起源'],
  },
];

export function classifyIntentByRules(text: string): IntentResult {
  const scored = RULES.map((rule) => ({
    intent: rule.intent,
    score: rule.words.reduce((sum, word) => (text.includes(word) ? sum + 1 : sum), 0),
  })).sort((a, b) => b.score - a.score);

  const top = scored[0].score > 0 ? scored[0] : { intent: 'knowledge' as Intent, score: 0 };
  return {
    intent: top.intent,
    label: INTENT_LABEL[top.intent],
    confidence: top.score > 0 ? Math.min(0.9, 0.55 + top.score * 0.12) : 0.6,
    engine: 'rule',
    route: INTENT_ROUTE[top.intent],
  };
}

/** LLM 分类（服务端调用；浏览器端拿不到 Key 时会自动退回规则） */
export async function classifyIntent(text: string): Promise<IntentResult> {
  const apiKey = typeof process !== 'undefined' ? process.env.DEEPSEEK_API_KEY?.trim() : undefined;
  if (!apiKey) return classifyIntentByRules(text);

  try {
    const baseUrl = (process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com').replace(/\/$/, '');
    const model = process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-chat';
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 60,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              '你是意图分类器。把用户这句话归入以下四类之一：knowledge（非遗知识问答）、creation（创作/写文案/画图）、rewrite（改写润色）、chat（寒暄）。只输出 JSON：{"intent":"...","confidence":0-1,"reason":"不超过20字"}',
          },
          { role: 'user', content: text.slice(0, 300) },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] ?? '{}') as {
      intent?: Intent;
      confidence?: number;
      reason?: string;
    };
    if (!parsed.intent || !(parsed.intent in INTENT_LABEL)) return classifyIntentByRules(text);

    return {
      intent: parsed.intent,
      label: INTENT_LABEL[parsed.intent],
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
      engine: 'llm',
      route: INTENT_ROUTE[parsed.intent],
    };
  } catch {
    return classifyIntentByRules(text);
  }
}
