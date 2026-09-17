'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import AnimatedArt from '@/components/AnimatedArt';
import GeoMap from '@/components/GeoMap';
import Reveal from '@/components/Reveal';
import VideoWall from '@/components/VideoWall';
import { nationalIchList, nationalPoints, nationalStats } from '@/lib/nationalIch';
import { newsCategories, newsList, type NewsCategory } from '@/lib/newsData';

type Filter = '全部' | NewsCategory;

const searchOf = (keyword: string) =>
  `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`;

export default function RelatedIchPage() {
  const [filter, setFilter] = useState<Filter>('全部');
  const [keyword, setKeyword] = useState('');

  const results = useMemo(() => {
    const kw = keyword.trim();
    return newsList.filter((item) => {
      if (filter !== '全部' && item.category !== filter) return false;
      if (!kw) return true;
      return [item.title, item.summary, item.source, item.tags.join(' ')].join(' ').includes(kw);
    });
  }, [filter, keyword]);

  const featured = results[0];
  const rest = results.slice(1);
  const counts = newsCategories.map((category) => ({
    category,
    count: newsList.filter((item) => item.category === category).length,
  }));

  return (
    <div className="relative">
      <div className="pattern-cloud" />

      {/* ============ 全国著名非遗文化 ============ */}
      <section className="section pt-14">
        <div className="page-shell">
          <Reveal className="section-head">
            <div>
              <span className="kicker">全国著名非遗文化</span>
              <h2 className="section-title">
                被更多人看见的<span className="gradient-text"> 中国手艺</span>
              </h2>
            </div>
            <Link href="/heritage" className="btn btn-ghost">
              看石家庄本地非遗
            </Link>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {nationalIchList.map((item, index) => (
              <Reveal key={item.id} delay={(index % 4) * 70}>
                <article className="glass glass-hover flex h-full flex-col overflow-hidden">
                  <div className="relative h-44 w-full overflow-hidden">
                    <AnimatedArt effect={item.effect} image={item.image} label={item.name} className="h-full w-full" />
                    <span className="chip chip-gold absolute left-3 top-3 !py-1 !text-[11px]">{item.level}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="serif text-[16px] text-white">{item.name}</h3>
                    <p className="mt-1 text-[11.5px] text-white/45">
                      {item.region} · {item.category}
                    </p>
                    <p className="mt-3 line-clamp-3 text-[12.5px] leading-6 text-white/62">{item.desc}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span key={tag} className="chip !py-0.5 !text-[10.5px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {item.videoKeyword && (
                      <a
                        href={searchOf(item.videoKeyword)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto pt-4 text-[12px] text-gold-300/90 transition hover:text-gold-200"
                      >
                        看相关视频 ↗
                      </a>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 非遗影像 ============ */}
      <section className="section pt-0">
        <div className="page-shell">
          <Reveal className="section-head">
            <div>
              <span className="kicker">非遗影像</span>
              <h2 className="section-title">
                热门视频里的<span className="gradient-text"> 非遗现场</span>
              </h2>
              <p className="section-desc mt-4">
                打铁花、李子柒的手作影像、蔚县打树花等，是近几年传播度最高的非遗内容；
                下方同时也放了本站素材库中的现场影像。
              </p>
            </div>
          </Reveal>

          <VideoWall />
        </div>
      </section>

      {/* ============ 政策与新闻 ============ */}
      <section className="section pt-0">
        <div className="page-shell">
          <Reveal className="section-head">
            <div>
              <span className="kicker">政策与新闻动态</span>
              <h2 className="section-title">
                非遗保护，<span className="gradient-text">看得见的行动</span>
              </h2>
            </div>
          </Reveal>

          <div className="glass mb-6 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex flex-wrap gap-2">
                {(['全部', ...newsCategories] as Filter[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`rounded-full border px-4 py-1.5 text-[13px] transition ${
                      filter === item
                        ? 'border-gold-400/55 bg-gold-400/15 text-gold-200'
                        : 'border-white/12 bg-white/4 text-white/65 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    {item}
                    <span className="ml-1.5 text-[11.5px] text-white/40">
                      {item === '全部' ? newsList.length : counts.find((c) => c.category === item)?.count}
                    </span>
                  </button>
                ))}
              </div>
              <label className="relative flex-1 md:max-w-xs">
                <span className="sr-only">搜索政策与新闻</span>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索标题 / 关键词"
                  className="field !py-2.5 text-[13px]"
                />
              </label>
            </div>
          </div>

          {!featured ? (
            <div className="glass grid place-items-center gap-3 p-16 text-center">
              <span className="serif text-[19px] text-gold-200">没有匹配的内容</span>
              <p className="text-[13.5px] text-white/55">换个关键词，或点击「全部」查看所有条目。</p>
            </div>
          ) : (
            <>
              <Reveal>
                <Link
                  href={`/news/${featured.id}`}
                  className="glass glass-hover card-media group grid gap-0 overflow-hidden rounded-2xl md:grid-cols-2"
                >
                  <div className="relative h-56 md:h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={featured.cover} alt={featured.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2e1c11]/72 to-transparent md:bg-gradient-to-r" />
                  </div>
                  <div className="p-7">
                    <div className="flex items-center gap-3">
                      <span className="chip chip-gold !text-[11.5px]">{featured.category}</span>
                      <span className="text-[12px] text-white/45">{featured.date}</span>
                    </div>
                    <h2 className="serif mt-4 text-[22px] leading-9 text-white group-hover:text-gold-200">
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-[14px] leading-8 text-white/65">{featured.summary}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {featured.tags.map((tag) => (
                        <span key={tag} className="chip !text-[11.5px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="mt-6 inline-block text-[13px] text-gold-300/90">阅读全文 →</span>
                  </div>
                </Link>
              </Reveal>

              <div className="mt-6 grid gap-4">
                {rest.map((item, index) => (
                  <Reveal key={item.id} delay={(index % 3) * 60}>
                    <Link
                      href={`/news/${item.id}`}
                      className="glass glass-hover group flex flex-col gap-4 p-5 md:flex-row md:items-center"
                    >
                      <div className="card-media relative h-32 w-full flex-none overflow-hidden rounded-xl md:h-24 md:w-40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.cover} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`chip !text-[11.5px] ${
                              item.category === '政策'
                                ? 'chip-gold'
                                : item.category === '倡议'
                                  ? 'chip-jade'
                                  : ''
                            }`}
                          >
                            {item.category}
                          </span>
                          <span className="text-[12px] text-white/40">{item.date}</span>
                          <span className="text-[12px] text-white/40">{item.source}</span>
                        </div>
                        <h3 className="serif mt-2 text-[16.5px] leading-7 text-white/92 group-hover:text-gold-200">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-[13px] leading-7 text-white/55">{item.summary}</p>
                      </div>
                      <span className="hidden text-[13px] text-gold-300/80 md:block">查看 →</span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ============ 总结：从石家庄到全国 ============ */}
      <section className="section pt-0">
        <div className="page-shell">
          <Reveal className="section-head">
            <div>
              <span className="kicker">总结</span>
              <h2 className="section-title">
                从石家庄出发，<span className="gradient-text">汇入全国非遗版图</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
            <Reveal className="glass p-7">
              <p className="text-[14.5px] leading-8 text-white/70">
                从太行山下的井陉拉花，到正定古城的常山战鼓；从耿村一千多篇口头故事，到能立在头顶的
                72 公斤高照——石家庄的非遗从来不是封闭的地方技艺，它们一直处在更大的文化交流之中：
                拉花与华北花会互文，丝弦与北方弦索腔同源，剪纸更是遍布全国的民间美术母题。
              </p>
              <p className="mt-4 text-[14.5px] leading-8 text-white/70">
                放眼全国，中国的非遗谱系更为辽阔：国家级非遗代表性项目已达 1557 项（含子项 3610 项），
                中国列入联合国教科文组织非物质文化遗产名录（名册）的项目达 44 项。打铁花、苏绣、
                景德镇制瓷、昆曲、皮影戏、川剧变脸、二十四节气……它们既是各自地域的生活方式，
                也共同构成了「中国手艺」的整体形象。
              </p>
              <p className="mt-4 text-[14.5px] leading-8 text-white/70">
                这个平台想做的事也因此变得清晰：先把石家庄的非遗记录清楚、讲明白，
                再用 AI 共创、动态视觉与影像把它接入全国传播的语境——
                <strong className="text-gold-200">从「我知道石家庄有什么」，走向「我看懂了中国的非遗」</strong>。
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {nationalStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/10 bg-white/4 p-4">
                    <span className="text-[11.5px] text-white/45">{stat.label}</span>
                    <strong className="serif mt-1 block text-[26px] text-gold-200">{stat.value}</strong>
                    <span className="text-[11px] text-white/40">{stat.unit}</span>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-[11.5px] leading-6 text-white/35">
                数据说明：国家级非遗项目与人类非遗名录数量以国务院、联合国教科文组织最新公布为准，
                此处用于说明规模量级。
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/map" className="btn btn-primary">
                  打开石家庄文化地图
                </Link>
                <Link href="/create" className="btn btn-ghost">
                  AI 共创一件作品
                </Link>
              </div>
            </Reveal>

            <Reveal className="glass p-4" delay={90}>
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="serif text-[15px] text-white">全国著名非遗分布示意</span>
                <span className="text-[11.5px] text-white/40">本地 GeoJSON · 可缩放拖拽</span>
              </div>
              <GeoMap
                geoUrl="/geo/china.json"
                mapName="china"
                points={nationalPoints}
                districts={[]}
                height={430}
                unitLabel="处"
                zoom={1.02}
                showLabels={false}
                onSelect={(name) => {
                  const target = nationalIchList.find((item) => name.includes(item.name) || item.name.includes(name));
                  if (target?.videoKeyword) {
                    window.open(searchOf(target.videoKeyword), '_blank', 'noopener');
                  }
                }}
              />
              <p className="px-2 pb-1 pt-3 text-[11.5px] leading-6 text-white/40">
                点击地图上的光点，可跳转查看该项目的相关视频；石家庄（常山战鼓）也标注在这张图上，
                方便对照「地方—全国」的位置关系。
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
