'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ichList } from '@/lib/ich';

interface Slide {
  id: string;
  name: string;
  category: string;
  level: string;
  image: string;
}

const INTERVAL = 4500;

function toSlides(): Slide[] {
  return ichList.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    level: item.level,
    image: item.cover,
  }));
}

/**
 * 首页 Banner 轮播图
 * - 位于首屏文字内容的下方，整块为一个轮播 Banner
 * - 自动播放（悬停暂停）、左右切换、指示点、进度条
 * - 每张图可点击跳转到对应非遗项目详情
 */
export default function HeroShowcase() {
  const slides = useMemo(toSlides, []);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const current = slides[index];

  return (
    <section
      aria-label="非遗文化轮播图"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="glass glass-hover relative h-[260px] overflow-hidden !rounded-2xl sm:h-[320px] lg:h-[420px]">
        {slides.map((slide, i) => (
          <Link
            key={slide.id}
            href={`/heritage/${slide.id}`}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            className={`slide-layer ${i === index ? 'is-active' : ''}`}
            aria-label={`查看${slide.name}详情`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.image} alt={slide.name} className={`slide-img ${i === index ? 'is-active' : ''}`} />
            <span className="absolute inset-0 bg-gradient-to-t from-[#2e1c11]/96 via-[#3a2314]/45 to-transparent" />
            <span className="on-photo absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-5 md:p-7">
              <span className="block">
                <span className="chip chip-gold !text-[11.5px]">{slide.level}</span>
                <strong className="serif mt-2 block text-[20px] text-white md:text-[26px]">{slide.name}</strong>
                <span className="mt-1 block text-[12.5px] text-white/80">
                  {slide.category} · 点击查看项目详情 →
                </span>
              </span>
              <span className="hidden text-[12px] text-white/70 md:block">
                {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </span>
          </Link>
        ))}

        {/* 左右切换 */}
        <button
          type="button"
          aria-label="上一张"
          onClick={() => go(index - 1)}
          className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-[#2e1c11]/45 text-[16px] text-[#fff8ec] backdrop-blur transition hover:bg-[#2e1c11]/70"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="下一张"
          onClick={() => go(index + 1)}
          className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-[#2e1c11]/45 text-[16px] text-[#fff8ec] backdrop-blur transition hover:bg-[#2e1c11]/70"
        >
          ›
        </button>

        {/* 进度条 */}
        <span className="absolute inset-x-0 bottom-0 z-10 block h-1 bg-[#2e1c11]/40">
          <span
            key={`${index}-${paused ? 'paused' : 'run'}`}
            className={`slide-progress ${paused ? 'is-paused' : ''}`}
            style={{ animationDuration: `${INTERVAL}ms` }}
          />
        </span>
      </div>

      {/* 指示点 */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`切换到${slide.name}`}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? 'w-7 bg-gradient-to-r from-cinnabar-500 to-gold-400' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
        <span className="ml-3 text-[11.5px] text-white/40">
          当前：{current.name}
        </span>
      </div>
    </section>
  );
}
