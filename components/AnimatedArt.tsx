'use client';

import { useEffect, useRef } from 'react';
import type { ArtEffect } from '@/lib/nationalIch';

interface AnimatedArtProps {
  effect: ArtEffect;
  /** 可选实拍/生成图片，会叠在动态视觉之下 */
  image?: string;
  label?: string;
  className?: string;
}

/** 代码绘制的动态视觉：不同非遗项目对应不同的动效语言 */
export default function AnimatedArt({ effect, image, label = '', className = '' }: AnimatedArtProps) {
  return (
    <div className={`art-visual art-${effect} ${className}`}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={label} className="art-image" />
      )}
      <span className="art-layer art-layer-1" />
      <span className="art-layer art-layer-2" />
      {effect === 'sparks' && <SparkCanvas />}
      {effect === 'sleeve' && <span className="art-sleeve-flow" />}
      {effect === 'shadow' && <span className="art-puppet" />}
      {effect === 'mask' && <span className="art-maskbox" />}
      {effect === 'seasons' && <span className="art-ring">二十四节气</span>}
      <span className="art-grain" />
    </div>
  );
}

/** 打铁花：粒子从底部击发、在空中炸开后落下 */
function SparkCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;

    type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number };
    let sparks: Spark[] = [];

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width ?? 320;
      height = rect?.height ?? 200;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const burst = () => {
      const originX = width * (0.3 + Math.random() * 0.4);
      const originY = height * (0.72 + Math.random() * 0.12);
      const count = 26 + Math.floor(Math.random() * 18);
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.7;
        const speed = 2.4 + Math.random() * 3.4;
        sparks.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          max: 46 + Math.random() * 46,
          size: 0.8 + Math.random() * 1.6,
        });
      }
      if (sparks.length > 700) sparks = sparks.slice(-700);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      // 拖尾效果
      ctx.globalCompositeOperation = 'lighter';

      for (const s of sparks) {
        s.vy += 0.045;
        s.vx *= 0.992;
        s.vy *= 0.992;
        s.x += s.vx;
        s.y += s.vy;
        s.life += 1;

        const alpha = Math.max(0, 1 - s.life / s.max);
        const hue = 32 + Math.random() * 14;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${hue}, 100%, ${58 + alpha * 22}%, ${alpha * 0.95})`;
        ctx.arc(s.x, s.y, s.size * (0.6 + alpha), 0, Math.PI * 2);
        ctx.fill();
      }

      sparks = sparks.filter((s) => s.life < s.max && s.y < height + 40);
      ctx.globalCompositeOperation = 'source-over';
      raf = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);

    if (reduce) {
      burst();
      draw();
      window.cancelAnimationFrame(raf);
      return () => window.removeEventListener('resize', resize);
    }

    const timer = window.setInterval(burst, 1200);
    burst();
    raf = window.requestAnimationFrame(draw);

    return () => {
      window.clearInterval(timer);
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="art-canvas" aria-hidden="true" />;
}
