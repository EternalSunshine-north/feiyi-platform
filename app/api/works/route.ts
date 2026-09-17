import { NextResponse, type NextRequest } from 'next/server';
import { addWork, readWorks, removeWork } from '@/lib/serverStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** AI 共创作品归档：生成结果会出现在「非遗列表 → AI 共创作品」 */

export async function GET() {
  const works = await readWorks();
  return NextResponse.json({ works, count: works.length });
}

export async function POST(request: NextRequest) {
  let body: {
    id?: string;
    title?: string;
    image?: string;
    images?: string[];
    author?: string;
    source?: string;
    projectId?: string | null;
    license?: string;
    prompt?: string;
    negativePrompt?: string;
    model?: string;
    provider?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 });
  }

  if (!body.image) return NextResponse.json({ error: '缺少 image' }, { status: 400 });

  const works = await addWork({
    id: body.id ?? `work-${Date.now()}`,
    title: body.title ?? '未命名 AI 共创作品',
    image: body.image,
    images: body.images,
    author: body.author ?? 'AI 共创 · 平台用户',
    source: body.source ?? 'AI 共创',
    projectId: body.projectId ?? null,
    license: body.license,
    prompt: body.prompt,
    negativePrompt: body.negativePrompt,
    model: body.model,
    provider: body.provider,
    createdAt: Date.now(),
  });

  return NextResponse.json({ ok: true, works });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });
  const works = await removeWork(id);
  return NextResponse.json({ ok: true, works });
}
