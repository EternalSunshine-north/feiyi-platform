import { NextResponse, type NextRequest } from 'next/server';
import { readSessions, writeSessions, type StoredSession } from '@/lib/serverStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 会话记忆管理（问答工作流第 8 步 · 按确认回执实现）
 *   GET    /api/memory?user=xxx   → 读取该用户的会话
 *   POST   /api/memory            → 保存会话（超过阈值自动摘要压缩）
 *   DELETE /api/memory?user=xxx   → 清空该用户的会话
 *
 * 存储：项目内 .data/memory/<user>.json（演示用文件存储，可替换为数据库）
 */

const KEEP_RECENT = 12; // 保留最近 12 条原文
const SUMMARY_TRIGGER = 16; // 超过 16 条触发摘要

export async function GET(request: NextRequest) {
  const user = request.nextUrl.searchParams.get('user') ?? '';
  if (!user) return NextResponse.json({ error: '缺少 user 参数' }, { status: 400 });
  const sessions = await readSessions(user);
  return NextResponse.json({
    user,
    sessions,
    policy: {
      keepRecent: KEEP_RECENT,
      summaryTrigger: SUMMARY_TRIGGER,
      summarizer: process.env.DEEPSEEK_API_KEY ? 'deepseek' : 'rule',
    },
  });
}

export async function POST(request: NextRequest) {
  let body: { user?: string; sessions?: StoredSession[] };
  try {
    body = (await request.json()) as { user?: string; sessions?: StoredSession[] };
  } catch {
    return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const user = (body.user ?? '').trim();
  if (!user) return NextResponse.json({ error: '缺少 user' }, { status: 400 });
  const sessions = Array.isArray(body.sessions) ? body.sessions : [];

  const compressed: StoredSession[] = [];
  for (const session of sessions) {
    compressed.push(await compress(session));
  }

  await writeSessions(user, compressed);
  return NextResponse.json({ ok: true, sessions: compressed, saved: compressed.length });
}

export async function DELETE(request: NextRequest) {
  const user = request.nextUrl.searchParams.get('user') ?? '';
  if (!user) return NextResponse.json({ error: '缺少 user 参数' }, { status: 400 });
  await writeSessions(user, []);
  return NextResponse.json({ ok: true });
}

/** 自动摘要：超出阈值时把较早的对话压缩成 summary，只保留最近若干条原文 */
async function compress(session: StoredSession): Promise<StoredSession> {
  if (session.messages.length <= SUMMARY_TRIGGER) return session;

  const older = session.messages.slice(0, session.messages.length - KEEP_RECENT);
  const recent = session.messages.slice(-KEEP_RECENT);
  const transcript = older
    .map((message) => `${message.role === 'user' ? '问' : '答'}：${message.content.slice(0, 160)}`)
    .join('\n');

  const summary = await summarize(transcript, session.summary);

  return { ...session, summary, messages: recent, updatedAt: Date.now() };
}

async function summarize(transcript: string, previous?: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  const fallback = `${previous ? previous + ' / ' : ''}${transcript.replace(/\s+/g, ' ').slice(0, 200)}…`;

  if (!apiKey) return fallback;

  try {
    const baseUrl = (process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com').replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-chat',
        temperature: 0.2,
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content:
              '把下面的非遗问答对话压缩成 120 字以内的中文摘要，保留用户关注的项目名与关键事实，不要评价。',
          },
          { role: 'user', content: `${previous ? `已有摘要：${previous}\n` : ''}${transcript}` },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = json.choices?.[0]?.message?.content?.trim();
    return text || fallback;
  } catch {
    return fallback;
  }
}
