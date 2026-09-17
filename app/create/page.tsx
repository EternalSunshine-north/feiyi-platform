'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AIAgentSlot from '@/components/AIAgentSlot';
import Protected from '@/components/Protected';
import Reveal from '@/components/Reveal';
import VideoStudio from '@/components/VideoStudio';
import { featuredWorks } from '@/lib/works';

type CreateTab = 'qa' | 'video';

export default function CreatePage() {
  const [tab, setTab] = useState<CreateTab>('qa');

  // 支持 /create?tab=qa 与 /create?tab=video 直达，刷新后保持当前模块
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('tab');
    if (value === 'video' || value === 'qa') setTab(value);
  }, []);

  const switchTab = (next: CreateTab) => {
    setTab(next);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', next === 'video' ? '/create?tab=video' : '/create?tab=qa');
    }
  };

  return (
    <Protected hint="AI 创作需要登录后使用">
      <div className="relative">
        <div className="pattern-cloud" />

        {/* ============ 页头 ============ */}
        <section className="page-shell relative pb-6 pt-14">
          <span className="kicker">AI 创作</span>
          <h1 className="section-title mt-4">
            两个独立模块，<span className="gradient-text">问答与视频生成</span>
          </h1>
        </section>

        {/* ============ 模块标签页（交互与「非遗列表」的 Tab 一致） ============ */}
        <section className="page-shell">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: 'qa', label: '【问答模式工作流】' },
                { key: 'video', label: '【视频生成模块工作流】' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => switchTab(item.key)}
                className={`rounded-full border px-5 py-2 text-[13.5px] transition ${
                  tab === item.key
                    ? 'border-gold-400/55 bg-gold-400/15 text-gold-200'
                    : 'border-white/12 bg-white/4 text-white/65 hover:border-white/25 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* ============ 模块一：问答模式工作流 ============ */}
        <section className={`page-shell pb-20 pt-6 ${tab === 'qa' ? '' : 'hidden'}`}>
          <p className="section-desc">直接提问即可，回答只给最终结果。</p>
          <div className="mt-5">
            <AIAgentSlot />
          </div>
        </section>

        {/* ============ 模块二：视频生成模块工作流 ============ */}
        <section className={`page-shell pb-24 pt-6 ${tab === 'video' ? '' : 'hidden'}`}>
          {/* 推荐非遗作品（置于视频生成模块上方） */}
          <Reveal className="section-head">
            <div>
              <span className="kicker">推荐非遗作品</span>
              <h2 className="section-title !text-[24px]">
                AI 共创 × 传统纹样的<span className="gradient-text"> 当代回响</span>
              </h2>
              <p className="section-desc mt-3">
                作品来自平台用户的 AI 共创与实拍影像档案，每件作品都标注了作者 / 来源与关联项目。
              </p>
            </div>
            <Link href="/heritage?tab=works" className="btn btn-ghost">
              查看全部 AI 共创作品
            </Link>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredWorks.map((work, index) => (
              <Reveal key={work.id} delay={(index % 4) * 70}>
                <Link
                  href={work.ichId ? `/heritage/${work.ichId}` : '/heritage'}
                  className="glass glass-hover card-media group block h-72 overflow-hidden rounded-2xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={work.image} alt={work.title} loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2e1c11]/95 via-[#3a2314]/20 to-transparent opacity-90" />
                  <span className="on-photo absolute left-3 top-3 chip !py-1 !text-[11px]">{work.kind}</span>
                  <div className="on-photo absolute inset-x-0 bottom-0 p-4">
                    <h3 className="serif text-[14.5px] leading-6 text-white">{work.title}</h3>
                    <p className="mt-1 text-[11.5px] text-white/75">
                      {work.author} · {work.source}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* 视频生成（全自动） */}
          <Reveal className="section-head mt-14">
            <div>
              <span className="kicker">视频生成</span>
              <h2 className="section-title !text-[24px]">用提示词生成非遗短视频</h2>
              <p className="section-desc mt-3">
                平台自动生成分镜并合成视频，你只需要写清楚想拍什么。
              </p>
            </div>
          </Reveal>

          <Reveal className="glass p-6 md:p-7">
            <VideoStudio />
          </Reveal>
        </section>
      </div>
    </Protected>
  );
}
