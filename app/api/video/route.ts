import { NextResponse, type NextRequest } from 'next/server';
import { ichList } from '@/lib/ich';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 视频生成接口（「视频生成模块工作流」）
//
// 全自动调用，前端不需要填任何模型或 Key：
//   1) 优先使用服务端配置的视频模型（.env.local 里的 DASHSCOPE_API_KEY 等），直接出片；
//   2) 没有视频模型时，用服务端 DEEPSEEK_API_KEY 自动生成「分镜脚本」，
//      再由前端用素材图 + 分镜字幕自动合成一段可播放的短视频（浏览器本地渲染，无需外部模型）。
//
// 返回：
//   { mode: 'provider', videos: string[], ... }            直接拿到视频地址
//   { mode: 'local-render', title, shots: [...], ... }     按分镜在浏览器本地合成

interface VideoRequestBody {
  prompt?: string;
  projectId?: string;
  duration?: number;
  aspect?: string;
  fps?: number;
}

interface Shot {
  image: string;
  text: string;
  caption: string;
  duration: number;
}

const ASPECT_SIZE: Record<string, string> = {
  '16:9': '1280*720',
  '9:16': '720*1280',
  '1:1': '960*960',
  '3:4': '768*1024',
};

// 没有锁定项目时使用的通用素材（均来自本站素材包）
const FALLBACK_IMAGES = [
  '/ich/bg/zhangu.jpg',
  '/ich/bg/lahua.jpg',
  '/ich/bg/jianzhi.jpg',
  '/ich/bg/gaozhao.jpg',
  '/ich/bg/shehuo.jpg',
];

export async function GET() {
  return NextResponse.json({
    // 视频模型（可选）：配置后会优先使用
    videoProviders: [
      { id: 'dashscope', label: '通义万相 · 视频', serverKey: Boolean(process.env.DASHSCOPE_API_KEY) },
      { id: 'kling', label: '可灵 AI', serverKey: Boolean(process.env.KLING_ACCESS_KEY) },
    ],
    // 分镜脚本模型：始终由服务端调用，前端无需配置
    scriptModel: {
      provider: 'deepseek',
      model: process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-chat',
      serverKey: Boolean(process.env.DEEPSEEK_API_KEY),
    },
    localRender: true,
  });
}

export async function POST(request: NextRequest) {
  let body: VideoRequestBody;
  try {
    body = (await request.json()) as VideoRequestBody;
  } catch {
    return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const prompt = (body.prompt ?? '').trim();
  if (!prompt) return NextResponse.json({ error: '请先填写视频提示词' }, { status: 400 });

  const duration = Math.min(30, Math.max(5, body.duration ?? 15));
  const aspect = body.aspect ?? '16:9';
  const fps = body.fps ?? 24;
  const project = ichList.find((item) => item.id === body.projectId) ?? matchProject(prompt);

  // 1) 服务端配了视频模型 → 直接出片
  const dashscopeKey = process.env.DASHSCOPE_API_KEY?.trim();
  if (dashscopeKey) {
    try {
      const videos = await callDashScopeVideo(prompt, dashscopeKey, duration, aspect, fps, project?.summary);
      if (videos.length > 0) {
        return NextResponse.json({
          mode: 'provider',
          provider: 'dashscope',
          engine: '通义万相 · 视频',
          title: project ? `${project.name} · AI 短片` : '非遗 AI 短片',
          videos,
          note: '已由服务端视频模型自动生成',
        });
      }
    } catch (error) {
      console.error('[video] 视频模型调用失败，转为本地合成', error);
    }
  }

  // 2) 自动生成分镜脚本（服务端持有 Key，前端无需配置）
  const script = await buildStoryboard({ prompt, duration, aspect, project });

  return NextResponse.json({
    mode: 'local-render',
    engine: script.engine,
    title: script.title,
    aspect,
    fps,
    shots: script.shots,
    note:
      script.engine === 'deepseek'
        ? '分镜脚本由平台自动调用 DeepSeek 生成，视频在浏览器本地合成'
        : '平台未取得脚本回复，已按提示词生成基础分镜，视频在浏览器本地合成',
  });
}

/** 关键词匹配项目（与文生图工作流同一套逻辑，保证提示词里的非遗名能被识别） */
function matchProject(text: string) {
  const hit = ichList
    .map((item) => {
      let score = 0;
      if (text.includes(item.name)) score += 10;
      if (item.alias && text.includes(item.alias)) score += 8;
      if (text.includes(item.region)) score += 4;
      if (text.includes(item.category)) score += 3;
      item.tags.forEach((tag) => {
        if (text.includes(tag)) score += 2;
      });
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);
  return hit[0]?.score > 0 ? hit[0].item : undefined;
}

async function buildStoryboard(options: {
  prompt: string;
  duration: number;
  aspect: string;
  project?: (typeof ichList)[number];
}): Promise<{ engine: string; title: string; shots: Shot[] }> {
  const { prompt, duration, aspect, project } = options;
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  let engine = 'fallback';
  let title = project ? `${project.name} · AI 短片` : '非遗主题短片';
  let raw: { title?: string; shots?: { text?: string; caption?: string; duration?: number }[] } | null = null;

  if (apiKey) {
    const baseUrl = (process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com').replace(/\/$/, '');
    const model = process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-chat';
    const context = project
      ? [
          `非遗项目：${project.name}（${project.level}｜${project.category}｜${project.region}）`,
          `项目概要：${project.summary}`,
          `可引用元素：${project.tags.join('、')}`,
          `事实约束：${project.facts.map((f) => `${f.label}=${f.value}`).join('；')}`,
        ].join('\n')
      : '（未锁定具体非遗项目，请按提示词中的地域与题材处理）';

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          max_tokens: 900,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: [
                '你是「石家庄非遗文化 · AI 共创平台」的短视频分镜师，负责把一句话需求扩写成非遗主题短视频分镜。',
                '只输出 JSON，不要任何解释文字，结构如下：',
                '{"title":"片名（12字内）","shots":[{"text":"画面描述（30字内，写明景别/主体/光线）","caption":"屏幕字幕（18字内，中文口语，可作解说）","duration":3}]}',
                'shots 数量 3–5 个，各镜头 duration 合计接近目标时长。',
                '必须尊重非遗事实：服饰、道具、动作、地域不要混搭；不确定的细节不要编造。',
              ].join('\n'),
            },
            {
              role: 'user',
              content: `提示词：${prompt}\n目标时长：${duration} 秒\n画幅：${aspect}\n\n【项目资料】\n${context}`,
            },
          ],
        }),
        signal: AbortSignal.timeout(45_000),
      });

      if (res.ok) {
        const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const content = json.choices?.[0]?.message?.content ?? '';
        raw = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] ?? '{}') as {
          title?: string;
          shots?: { text?: string; caption?: string; duration?: number }[];
        };
        if (raw?.shots?.length) {
          engine = 'deepseek';
          title = raw.title?.trim() || title;
        }
      } else {
        console.error('[video] DeepSeek 分镜生成失败', res.status);
      }
    } catch (error) {
      console.error('[video] DeepSeek 分镜请求异常', error);
    }
  }

  const images = project
    ? [...project.gallery, ...project.aiWorks, project.cover].filter(Boolean)
    : FALLBACK_IMAGES;

  const rawShots = raw?.shots?.length
    ? raw.shots.slice(0, 5)
    : fallbackShots(prompt, duration, project?.name);

  // 单镜头时长：按分镜给出的比例归一化到目标总时长
  const total = rawShots.reduce((sum, shot) => sum + (Number(shot.duration) || 3), 0) || 1;
  const shots: Shot[] = rawShots.map((shot, index) => ({
    image: images[index % images.length],
    text: (shot.text ?? '').trim() || '非遗场景镜头',
    caption: (shot.caption ?? '').trim() || prompt.slice(0, 18),
    duration: Math.max(2, Math.round(((Number(shot.duration) || 3) / total) * duration)),
  }));

  return { engine, title, shots };
}

/** 无模型回复时的基础分镜（保证功能可用） */
function fallbackShots(prompt: string, duration: number, projectName?: string) {
  const each = Math.max(2, Math.round(duration / 4));
  const subject = projectName ?? '非遗';
  return [
    { text: `远景：${subject}所在的环境与空间，交代地域氛围`, caption: `${subject}，从这里开始`, duration: each },
    { text: `中景：${subject}的核心动作或工艺细节`, caption: prompt.slice(0, 18), duration: each },
    { text: '特写：手部、道具或纹样的细节质感', caption: '细节里，是几代人的手艺', duration: each },
    { text: '收尾：主体与环境同框，画面缓慢拉远', caption: '让它被更多人看见', duration: each },
  ];
}

// 通义万相 · 视频（异步任务 + 轮询），仅在服务端配置了 DASHSCOPE_API_KEY 时使用
async function callDashScopeVideo(
  prompt: string,
  apiKey: string,
  duration: number,
  aspect: string,
  fps: number,
  projectSummary?: string,
): Promise<string[]> {
  const endpoint = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis';
  const size = ASPECT_SIZE[aspect] ?? '1280*720';
  const finalPrompt = projectSummary ? `${prompt}。文化参考：${projectSummary}` : prompt;

  const createRes = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: process.env.DASHSCOPE_VIDEO_MODEL?.trim() || 'wanx2.1-t2v-turbo',
      input: { prompt: finalPrompt },
      parameters: { size, duration, fps, prompt_extend: true },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  const created = (await createRes.json()) as {
    output?: { task_id?: string };
    message?: string;
    code?: string;
  };
  if (!createRes.ok || !created.output?.task_id) {
    throw new Error(`万相视频创建任务失败：${created.message ?? created.code ?? createRes.status}`);
  }

  const taskId = created.output.task_id;
  for (let i = 0; i < 40; i++) {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    const pollRes = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(20_000),
    });
    const poll = (await pollRes.json()) as {
      output?: { task_status?: string; video_url?: string; message?: string };
    };
    const status = poll.output?.task_status;
    if (status === 'SUCCEEDED') return poll.output?.video_url ? [poll.output.video_url] : [];
    if (status === 'FAILED' || status === 'CANCELED') {
      throw new Error(`万相视频任务失败：${poll.output?.message ?? status}`);
    }
  }
  throw new Error('万相视频任务超时（约 160 秒未完成）');
}
