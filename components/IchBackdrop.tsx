'use client';

import { useEffect, useRef } from 'react';

// 全站非遗动态背景（米色暖调 · 依据参考图色板）
//
// 参考图特征：米白宣纸底 + 暖沙金渐变，朱红/珊瑚点缀，少量墨线。
// 这里用四层叠加：
//   1) 暖色光晕缓慢漂移（warmDrift）
//   2) 宣纸受光高光带缓慢扫过（paperSheen）
//   3) 纸纤维颗粒缓慢位移（grainShift）
//   4) 剪纸团花 / 云纹 / 缠枝纹 / 印章纹样漂浮（motifFloat）
// 外层再叠一层 canvas 金粉纸屑粒子，会随鼠标轻微避让。
export default function IchBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let dpr = 1;

    type Dust = { x: number; y: number; vx: number; vy: number; r: number; hue: number; a: number };
    let dust: Dust[] = [];
    const pointer = { x: -9999, y: -9999 };

    // 金粉配色：金 / 朱红 / 橄榄 / 蜜色
    const HUES = [38, 14, 74, 46];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(90, Math.max(24, Math.round((width * height) / 42000)));
      dust = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.35) * 0.16,
        vy: -0.06 - Math.random() * 0.14,
        r: 0.8 + Math.random() * 1.7,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
        a: 0.16 + Math.random() * 0.32,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of dust) {
        p.x += p.vx;
        p.y += p.vy;

        // 轻微避让鼠标，像被气流吹开
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.x += (dx / (dist || 1)) * force * 0.9;
          p.y += (dy / (dist || 1)) * force * 0.9;
        }

        if (p.y < -12) {
          p.y = height + 12;
          p.x = Math.random() * width;
        }
        if (p.x < -14) p.x = width + 14;
        if (p.x > width + 14) p.x = -14;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 62%, 56%, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = window.requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);

    if (reduce) {
      draw();
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    } else {
      rafRef.current = window.requestAnimationFrame(draw);
    }

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div className="ich-backdrop" aria-hidden="true">
      <span className="ich-backdrop__wash" />
      <span className="ich-backdrop__sheen" />
      <span className="ich-backdrop__grain" />
      <span className="ich-backdrop__motif ich-backdrop__motif--bloom" />
      <span className="ich-backdrop__motif ich-backdrop__motif--cloud" />
      <span className="ich-backdrop__motif ich-backdrop__motif--vine" />
      <span className="ich-backdrop__motif ich-backdrop__motif--seal" />
      <canvas ref={canvasRef} className="ich-backdrop__dust" />
    </div>
  );
}
