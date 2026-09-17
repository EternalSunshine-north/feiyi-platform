import { NextResponse, type NextRequest } from 'next/server';
import { classifyIntent } from '@/lib/intent';
import { searchLocal } from '@/lib/knowledge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 分析接口：意图分类（LLM，带规则兜底）+ 检索召回
 * 供工作流演练页（浏览器端）调用，避免在前端暴露模型 Key。
 */
export async function POST(request: NextRequest) {
  let body: { text?: string; withRetrieval?: boolean };
  try {
    body = (await request.json()) as { text?: string; withRetrieval?: boolean };
  } catch {
    return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const text = (body.text ?? '').trim();
  if (!text) return NextResponse.json({ error: '缺少 text' }, { status: 400 });

  const intent = await classifyIntent(text);
  const hits = body.withRetrieval === false ? [] : searchLocal(text).slice(0, 3);

  return NextResponse.json({
    intent,
    hits: hits.map(({ item, score }) => ({
      id: item.id,
      name: item.name,
      score: Number(score.toFixed(2)),
      level: item.level,
      region: item.region,
      snippet: `${item.summary.slice(0, 60)}…`,
    })),
  });
}
