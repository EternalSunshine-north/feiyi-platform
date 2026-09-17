import { NextResponse, type NextRequest } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { addWork } from '@/lib/serverStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 图像生成接口（文生图工作流第 6 步）
 *
 * 模型与 Key 都由「用户输入模块」带来：
 *   - provider=dashscope  通义万相（服务端可用 DASHSCOPE_API_KEY，或用请求里的临时 Key）
 *   - provider=openai     gpt-image（OPENAI_API_KEY / 临时 Key）
 *   - provider=local-sdxl 本地 SDXL（Stable Diffusion WebUI 的 /sdapi/v1/txt2img）
 *   - provider=custom     自建接口（按约定返回 { images | data[].url | data[].b64_json }）
 *   - provider=jimeng     即梦需要企业接入签名，这里返回接入说明
 *
 * 生成的图片会保存到 public/generated/，并可按需归档到「非遗列表 → AI 共创作品」。
 */

interface ImageRequestBody {
  provider?: string;
  model?: string;
  endpoint?: string;
  apiKey?: string;
  prompt?: string;
  negativePrompt?: string;
  aspect?: string;
  steps?: number;
  guidance?: number;
  count?: number;
  useReference?: boolean;
  references?: string[];
  archive?: boolean;
  work?: { title?: string; author?: string; source?: string; projectId?: string; license?: string };
}

const ASPECT_SIZE: Record<string, { sd: string; dash: string; w: number; h: number }> = {
  '3:4': { sd: '896x1152', dash: '768*1024', w: 896, h: 1152 },
  '16:9': { sd: '1344x768', dash: '1280*720', w: 1344, h: 768 },
  '1:1': { sd: '1024x1024', dash: '1024*1024', w: 1024, h: 1024 },
  '9:16': { sd: '768x1344', dash: '720*1280', w: 768, h: 1344 },
};

const GENERATED_DIR = path.join(process.cwd(), 'public', 'generated');

export async function GET() {
  return NextResponse.json({
    providers: [
      { id: 'dashscope', label: '通义万相', serverKey: Boolean(process.env.DASHSCOPE_API_KEY) },
      { id: 'openai', label: 'gpt-image', serverKey: Boolean(process.env.OPENAI_API_KEY) },
      { id: 'local-sdxl', label: '本地 SDXL', serverKey: true },
      { id: 'custom', label: '自定义接口', serverKey: false },
      { id: 'jimeng', label: '即梦（需企业签名）', serverKey: false },
    ],
    savedDir: '/generated',
  });
}

export async function POST(request: NextRequest) {
  let body: ImageRequestBody;
  try {
    body = (await request.json()) as ImageRequestBody;
  } catch {
    return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const provider = body.provider ?? 'custom';
  const prompt = (body.prompt ?? '').trim();
  if (!prompt) return NextResponse.json({ error: '缺少 prompt' }, { status: 400 });

  const aspect = body.aspect ?? '3:4';
  const size = ASPECT_SIZE[aspect] ?? ASPECT_SIZE['3:4'];
  const count = Math.min(4, Math.max(1, body.count ?? 2));
  const apiKey = (body.apiKey || providerKey(provider) || '').trim();

  if (provider === 'jimeng') {
    return NextResponse.json(
      {
        error: '即梦（字节）需要企业接入签名（AccessKey/SecretKey + 签名算法），当前未接入',
        hint: '可先在「自定义模型」里填写你自己的代理接口地址；或改用通义万相 / 本地 SDXL。',
      },
      { status: 501 },
    );
  }

  if (provider !== 'local-sdxl' && !apiKey) {
    return NextResponse.json(
      {
        error: '缺少该模型的 API Key',
        hint: `请在「图像模型」模块里填入临时 Key，或在 .env.local 配置 ${provider === 'dashscope' ? 'DASHSCOPE_API_KEY' : provider === 'openai' ? 'OPENAI_API_KEY' : '自定义 Key'} 后重启服务`,
      },
      { status: 400 },
    );
  }

  try {
    await fs.mkdir(GENERATED_DIR, { recursive: true });

    const payload = {
      prompt,
      negative_prompt: body.negativePrompt ?? '',
      steps: body.steps ?? 28,
      guidance: body.guidance ?? 6.5,
    };

    let urls: string[] = [];

    if (provider === 'dashscope') {
      urls = await callDashScope(body, prompt, apiKey, count, size.dash);
    } else if (provider === 'openai') {
      urls = await callOpenAI(body, prompt, apiKey, count, size.sd);
    } else {
      // 本地 SDXL 与自定义接口都是「POST 一个地址，拿回图片」
      urls = await callSelfHosted(body, prompt, apiKey, count, size);
    }

    const saved: string[] = [];
    for (let i = 0; i < urls.length; i++) {
      const localPath = await persistImage(urls[i], `${Date.now()}-${i}`);
      saved.push(localPath);
    }

    if (body.archive && saved.length > 0) {
      await addWork({
        id: `gen-${Date.now()}`,
        title: body.work?.title || prompt.slice(0, 24),
        image: saved[0],
        images: saved,
        author: body.work?.author || 'AI 共创 · 平台用户',
        source: body.work?.source || `模型：${body.model || provider}`,
        projectId: body.work?.projectId || null,
        license: body.work?.license || '仅用于学习交流与非商业展示',
        prompt,
        negativePrompt: body.negativePrompt ?? '',
        model: body.model || provider,
        provider,
        createdAt: Date.now(),
      });
    }

    return NextResponse.json({
      provider,
      model: body.model ?? '',
      images: saved,
      params: { ...payload, aspect, count, useReference: Boolean(body.useReference), references: body.references ?? [] },
      archived: Boolean(body.archive),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成失败';
    console.error('[image] 生成失败', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function providerKey(provider: string): string {
  if (provider === 'dashscope') return process.env.DASHSCOPE_API_KEY ?? '';
  if (provider === 'openai') return process.env.OPENAI_API_KEY ?? '';
  return '';
}

/** 通义万相：异步任务 + 轮询 */
async function callDashScope(
  body: ImageRequestBody,
  prompt: string,
  apiKey: string,
  count: number,
  dashSize: string,
): Promise<string[]> {
  const endpoint =
    body.endpoint || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';

  const createRes = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: body.model || 'wanx2.1-t2i-turbo',
      input: { prompt, negative_prompt: body.negativePrompt || undefined },
      parameters: { size: dashSize, n: count },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  const created = (await createRes.json()) as {
    output?: { task_id?: string };
    message?: string;
    code?: string;
  };
  if (!createRes.ok || !created.output?.task_id) {
    throw new Error(`万相创建任务失败：${created.message ?? created.code ?? createRes.status}`);
  }

  const taskId = created.output.task_id;
  for (let i = 0; i < 24; i++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const pollRes = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(20_000),
    });
    const poll = (await pollRes.json()) as {
      output?: {
        task_status?: string;
        results?: { url?: string }[];
        message?: string;
      };
    };
    const status = poll.output?.task_status;
    if (status === 'SUCCEEDED') {
      return (poll.output?.results ?? []).map((item) => item.url ?? '').filter(Boolean);
    }
    if (status === 'FAILED' || status === 'CANCELED') {
      throw new Error(`万相任务失败：${poll.output?.message ?? status}`);
    }
  }
  throw new Error('万相任务超时（约 72 秒未完成）');
}

/** OpenAI gpt-image */
async function callOpenAI(
  body: ImageRequestBody,
  prompt: string,
  apiKey: string,
  count: number,
  size: string,
): Promise<string[]> {
  const endpoint = body.endpoint || 'https://api.openai.com/v1/images/generations';
  const [w, h] = size.split('x');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: body.model || 'gpt-image-1',
      prompt,
      n: count,
      size: w === h ? '1024x1024' : w > h ? '1536x1024' : '1024x1536',
    }),
    signal: AbortSignal.timeout(120_000),
  });

  const json = (await res.json()) as {
    data?: { url?: string; b64_json?: string }[];
    error?: { message?: string };
  };
  if (!res.ok) throw new Error(`OpenAI 生成失败：${json.error?.message ?? res.status}`);

  return (json.data ?? [])
    .map((item) => item.url ?? (item.b64_json ? `data:image/png;base64,${item.b64_json}` : ''))
    .filter(Boolean);
}

/** 本地 SDXL（A1111 接口）与自定义接口 */
async function callSelfHosted(
  body: ImageRequestBody,
  prompt: string,
  apiKey: string,
  count: number,
  size: { w: number; h: number },
): Promise<string[]> {
  const endpoint = body.endpoint;
  if (!endpoint) throw new Error('缺少接口地址：请在「图像模型」模块里填写 endpoint');

  const isA1111 = endpoint.includes('sdapi') || endpoint.includes('txt2img');
  const payload = isA1111
    ? {
        prompt,
        negative_prompt: body.negativePrompt ?? '',
        steps: body.steps ?? 28,
        cfg_scale: body.guidance ?? 6.5,
        width: size.w,
        height: size.h,
        batch_size: count,
        sampler_name: 'DPM++ 2M Karras',
      }
    : {
        prompt,
        negative_prompt: body.negativePrompt ?? '',
        n: count,
        aspect: body.aspect ?? '3:4',
        steps: body.steps ?? 28,
        guidance: body.guidance ?? 6.5,
        references: body.references ?? [],
        use_reference: Boolean(body.useReference),
      };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(180_000),
  });

  if (!res.ok) throw new Error(`模型接口返回 ${res.status}：${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as {
    images?: string[];
    data?: { url?: string; b64_json?: string }[];
    output?: { results?: { url?: string }[] };
  };

  if (Array.isArray(json.images) && json.images.length > 0) {
    // A1111 返回纯 base64
    return json.images.map((item) => (item.startsWith('data:') ? item : `data:image/png;base64,${item}`));
  }
  if (Array.isArray(json.data)) {
    return json.data
      .map((item) => item.url ?? (item.b64_json ? `data:image/png;base64,${item.b64_json}` : ''))
      .filter(Boolean);
  }
  if (Array.isArray(json.output?.results)) {
    return json.output.results.map((item) => item.url ?? '').filter(Boolean);
  }
  throw new Error('接口返回格式无法识别，期望 { images | data[].url | data[].b64_json }');
}

/** 把远端 URL 或 data URL 落盘到 public/generated/ */
async function persistImage(source: string, name: string): Promise<string> {
  const safeName = `${name}.png`;
  const target = path.join(GENERATED_DIR, safeName);

  if (source.startsWith('data:')) {
    const base64 = source.split(',')[1] ?? '';
    await fs.writeFile(target, Buffer.from(base64, 'base64'));
  } else {
    const res = await fetch(source, { signal: AbortSignal.timeout(60_000) });
    if (!res.ok) throw new Error(`下载生成图失败：${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(target, buffer);
  }

  return `/generated/${safeName}`;
}
