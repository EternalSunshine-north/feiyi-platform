'use client';

import { useEffect, useRef, useState } from 'react';

// 视频生成模块工作流（全自动）
//
// 用户只写一句提示词 → 服务端自动调用模型生成分镜脚本（Key 在服务端，前端无需配置）
// → 浏览器用素材图 + 分镜字幕本地合成可播放的短视频（canvas + MediaRecorder）。
// 若服务端配置了视频模型（DASHSCOPE_API_KEY），则直接返回模型生成的视频地址。

interface Shot {
  image: string;
  text: string;
  caption: string;
  duration: number;
}

interface VideoResponse {
  mode?: 'provider' | 'local-render';
  engine?: string;
  title?: string;
  aspect?: string;
  fps?: number;
  shots?: Shot[];
  videos?: string[];
  note?: string;
  error?: string;
}

const STYLE_CHIPS = ['剪纸质感', '水墨写意', '纪实跟拍', '节庆花会', '正定古城', '太行山色'];
const DURATION_CHIPS = [10, 15, 20];
const ASPECT_CHIPS = ['16:9', '9:16', '1:1'];
const FPS_CHIPS = [24, 30];

const ASPECT_PX: Record<string, [number, number]> = {
  '16:9': [1280, 720],
  '9:16': [720, 1280],
  '1:1': [900, 900],
};

export default function VideoStudio() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(15);
  const [aspect, setAspect] = useState('16:9');
  const [fps, setFps] = useState(24);
  const [status, setStatus] = useState<'idle' | 'script' | 'render' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<VideoResponse | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const append = (text: string) =>
    setPrompt((prev) => (prev.includes(text) ? prev : `${prev}${prev ? '，' : ''}${text}`));

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const generate = async () => {
    if (!prompt.trim() || status === 'script' || status === 'render') return;
    setStatus('script');
    setProgress(0);
    setError(null);
    setResult(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }

    try {
      const response = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration, aspect, fps }),
      });
      const json = (await response.json()) as VideoResponse;
      if (!response.ok) throw new Error(json.error ?? '生成失败');

      setResult(json);

      // 服务端有视频模型：直接用返回的视频
      if (json.mode === 'provider' && json.videos?.length) {
        setVideoUrl(json.videos[0]);
        setStatus('done');
        return;
      }

      // 否则在浏览器本地合成
      const shots = json.shots ?? [];
      if (shots.length === 0) throw new Error('没有拿到分镜内容');
      setStatus('render');
      setRendering(true);
      const blob = await renderShots({
        shots,
        aspect: json.aspect ?? aspect,
        fps: json.fps ?? fps,
        title: json.title ?? '非遗主题短片',
        canvas: canvasRef.current,
        onProgress: setProgress,
      });
      setRendering(false);
      setVideoUrl(URL.createObjectURL(blob));
      setStatus('done');
    } catch (err) {
      setRendering(false);
      setStatus('error');
      setError(err instanceof Error ? err.message : '生成失败，请稍后重试');
    }
  };

  const busy = status === 'script' || status === 'render';

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* 左：输入 */}
      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-[13px] text-white/60">视频提示词</span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={4}
            placeholder="例如：傍晚的正定古城庙会，常山战鼓鼓阵由远及近，镜头缓慢推进，暖色灯光"
            className="field resize-none"
          />
        </label>

        <div>
          <span className="mb-2 block text-[13px] text-white/60">快速插入风格词</span>
          <div className="flex flex-wrap gap-2">
            {STYLE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => append(chip)}
                className="rounded-full border border-white/12 bg-white/4 px-3 py-1.5 text-[12px] text-white/65 transition hover:border-gold-400/40 hover:text-gold-200"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Group label="时长（秒）">
            {DURATION_CHIPS.map((value) => (
              <Pill key={value} active={duration === value} onClick={() => setDuration(value)}>
                {value}s
              </Pill>
            ))}
          </Group>
          <Group label="画幅">
            {ASPECT_CHIPS.map((value) => (
              <Pill key={value} active={aspect === value} onClick={() => setAspect(value)}>
                {value}
              </Pill>
            ))}
          </Group>
          <Group label="帧率">
            {FPS_CHIPS.map((value) => (
              <Pill key={value} active={fps === value} onClick={() => setFps(value)}>
                {value}fps
              </Pill>
            ))}
          </Group>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={generate} disabled={busy || !prompt.trim()} className="btn btn-primary">
            {status === 'script' ? '生成分镜中…' : status === 'render' ? `合成视频中… ${Math.round(progress)}%` : '生成视频'}
          </button>
          <span className="text-[12px] text-white/45">
            模型由平台自动调用，无需填写接口与密钥
          </span>
        </div>

        {busy && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-cinnabar-500 to-gold-400 transition-[width] duration-300"
              style={{ width: `${status === 'script' ? 6 : progress}%` }}
            />
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-cinnabar-500/35 bg-cinnabar-500/10 px-4 py-3 text-[12.5px] text-cinnabar-300">
            {error}
          </p>
        )}

        {result?.note && !error && (
          <p className="text-[11.5px] leading-6 text-white/40">{result.note}</p>
        )}
      </div>

      {/* 右：结果 + 分镜 */}
      <div className="space-y-4">
        <span className="block text-[13px] text-white/60">生成结果</span>

        {/* 合成中的画布（同时作为预览） */}
        <canvas
          ref={canvasRef}
          className={`w-full rounded-xl border border-white/10 bg-[#2e1c11]/70 ${rendering ? '' : 'hidden'}`}
        />

        {videoUrl && !rendering ? (
          <div className="space-y-3">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              loop
              className="w-full rounded-xl border border-white/10 bg-[#2e1c11]/70"
            />
            <a href={videoUrl} download={`${(result?.title ?? '非遗短片').replace(/\s+/g, '')}.webm`} className="btn btn-ghost">
              下载视频
            </a>
          </div>
        ) : !rendering ? (
          <div className="grid h-[280px] place-items-center rounded-2xl border border-dashed border-white/14 bg-white/3 text-center">
            <div>
              <span className="serif block text-[16px] text-gold-200">还没有生成视频</span>
              <p className="mt-2 text-[12.5px] text-white/45">写一句提示词，点击「生成视频」即可</p>
            </div>
          </div>
        ) : null}

        {(result?.shots?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <div className="flex items-center justify-between">
              <span className="serif text-[14px] text-white">{result?.title ?? '分镜脚本'}</span>
              <span className="chip !py-0.5 !text-[10.5px]">
                {result?.engine === 'deepseek' ? '分镜由平台自动生成' : '基础分镜'}
              </span>
            </div>
            <ol className="mt-3 space-y-3">
              {(result?.shots ?? []).map((shot, index) => (
                <li key={index} className="flex gap-3">
                  <div className="card-media relative h-16 w-24 flex-none overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={shot.image} alt={shot.text} loading="lazy" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-white/40">
                      镜头 {index + 1} · {shot.duration}s
                    </span>
                    <p className="text-[12.5px] leading-6 text-white/75">{shot.text}</p>
                    <p className="text-[11.5px] leading-6 text-gold-300/85">字幕：{shot.caption}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-2 block text-[13px] text-white/60">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
        active
          ? 'border-gold-400/55 bg-gold-400/15 text-gold-200'
          : 'border-white/12 bg-white/4 text-white/65 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------- 浏览器本地视频合成 ------------------------- */

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function pickMimeType(): string {
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(type)) return type;
  }
  return 'video/webm';
}

async function renderShots(options: {
  shots: Shot[];
  aspect: string;
  fps: number;
  title: string;
  canvas: HTMLCanvasElement | null;
  onProgress: (value: number) => void;
}): Promise<Blob> {
  const { shots, aspect, fps, title, canvas, onProgress } = options;
  if (!canvas) throw new Error('画布初始化失败');
  if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
    throw new Error('当前浏览器不支持本地视频合成，请使用 Chrome / Edge 最新版本');
  }

  const [width, height] = ASPECT_PX[aspect] ?? ASPECT_PX['16:9'];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('画布上下文创建失败');

  const images = await Promise.all(shots.map((shot) => loadImage(shot.image)));
  const total = shots.reduce((sum, shot) => sum + shot.duration, 0);

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType: pickMimeType(), videoBitsPerSecond: 4_000_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const finished = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
  });

  recorder.start(200);

  const scale = width / 1280;
  const drawCover = (image: HTMLImageElement | null, progress: number, fade: number) => {
    if (!image) {
      ctx.fillStyle = '#2e1c11';
      ctx.fillRect(0, 0, width, height);
      return;
    }
    const zoom = 1.04 + 0.08 * progress;
    const drawW = width * zoom;
    const drawH = (image.height / image.width) * drawW;
    const offsetY = (height - drawH) / 2 - (progress - 0.5) * 14 * scale;
    const offsetX = (width - drawW) / 2;
    ctx.globalAlpha = fade;
    ctx.drawImage(image, offsetX, offsetY, drawW, drawH);
    ctx.globalAlpha = 1;
  };

  const drawCaption = (caption: string, alpha: number) => {
    const gradient = ctx.createLinearGradient(0, height * 0.55, 0, height);
    gradient.addColorStop(0, 'rgba(46,28,17,0)');
    gradient.addColorStop(1, `rgba(46,28,17,${0.9 * alpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height * 0.5, width, height * 0.5);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#fff8ec';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = `600 ${Math.round(44 * scale)}px "PingFang SC","Microsoft YaHei",sans-serif`;
    ctx.fillText(caption.slice(0, 20), width / 2, height - 64 * scale);

    ctx.globalAlpha = 0.85 * alpha;
    ctx.font = `500 ${Math.round(24 * scale)}px "PingFang SC","Microsoft YaHei",sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ebc489';
    ctx.fillText(title.slice(0, 22), 48 * scale, 64 * scale);
    ctx.globalAlpha = 1;
  };

  const startedAt = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const elapsed = (performance.now() - startedAt) / 1000;
      if (elapsed >= total) {
        onProgress(100);
        resolve();
        return;
      }
      onProgress(Math.min(99, (elapsed / total) * 100));

      let acc = 0;
      let index = 0;
      for (let i = 0; i < shots.length; i++) {
        if (elapsed < acc + shots[i].duration) {
          index = i;
          break;
        }
        acc += shots[i].duration;
      }
      const shot = shots[index];
      const local = (elapsed - acc) / shot.duration;
      const fade = Math.min(1, local / 0.12) * Math.min(1, (1 - local) / 0.1);

      ctx.clearRect(0, 0, width, height);
      drawCover(images[index], local, Math.max(0.25, fade));
      drawCaption(shot.caption, Math.max(0.3, Math.min(1, local / 0.1)));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  recorder.stop();
  return finished;
}
