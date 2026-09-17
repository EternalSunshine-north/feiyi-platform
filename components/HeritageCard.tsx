'use client';

import Link from 'next/link';
import CollectButton from '@/components/CollectButton';
import type { IchItem } from '@/lib/ich';

interface HeritageCardProps {
  item: IchItem;
  /** 首页「十大非遗」使用紧凑样式 */
  compact?: boolean;
  index?: number;
}

export default function HeritageCard({ item, compact = false, index }: HeritageCardProps) {
  return (
    <article className="glass glass-hover group relative flex h-full flex-col overflow-hidden">
      {/* 悬停时左上角渐入的「详细」入口 */}
      <Link
        href={`/heritage/${item.id}`}
        aria-label={`查看${item.name}详细`}
        className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full border border-gold-400/50 bg-ink-950/85 px-3 py-1.5 text-[12.5px] font-semibold tracking-wide text-gold-200 opacity-0 -translate-x-2 -translate-y-1 backdrop-blur transition-all duration-400 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-x-0 focus-visible:translate-y-0 focus-visible:opacity-100"
      >
        详细
        <span aria-hidden="true">→</span>
      </Link>

      <div className={`card-media relative ${compact ? 'aspect-[4/3]' : 'aspect-[16/10]'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.cover} alt={item.name} loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2e1c11]/95 via-[#3a2314]/45 to-transparent" />
        <div className="on-photo absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
          <span className="chip chip-gold !py-1 !text-[11.5px]">{item.level}</span>
          <span className="chip !py-1 !text-[11.5px]">{item.category}</span>
        </div>
        {typeof index === 'number' && (
          <span className="on-photo serif absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-[#2e1c11]/55 text-[13px] text-gold-200">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="serif text-[18px] leading-7 text-white">
            <Link href={`/heritage/${item.id}`} className="transition-colors hover:text-gold-200">
              {item.name}
            </Link>
          </h3>
          <CollectButton id={item.id} variant="icon" />
        </div>

        <p className="mt-1 text-[12.5px] text-white/45">
          {item.region}
          {item.alias ? ` · 又称${item.alias}` : ''}
        </p>

        <p className={`mt-3 text-[13.5px] leading-7 text-white/62 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
          {item.summary}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <Link
            href={`/heritage/${item.id}`}
            className="text-[13px] text-gold-300/90 transition hover:text-gold-200"
          >
            了解项目详情 →
          </Link>
          <span className="text-[11.5px] text-white/35">{item.tags[2] ?? item.category}</span>
        </div>
      </div>
    </article>
  );
}
