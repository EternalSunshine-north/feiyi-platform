'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import HeritageCard from '@/components/HeritageCard';
import Reveal from '@/components/Reveal';
import { ichCategories, ichList, ichRegions } from '@/lib/ich';
import { featuredWorks } from '@/lib/works';
import { useCollectedIds } from '@/lib/store';

type SortKey = 'default' | 'level' | 'region';
type Tab = 'projects' | 'works';

interface WorkEntry {
  id: string;
  image: string;
  title: string;
  author: string;
  source: string;
  projectId: string;
  projectName: string;
  category: string;
  level: string;
  region: string;
}

/** 由图像模型真实生成、归档到后端的作品 */
interface GeneratedWork {
  id: string;
  title: string;
  image: string;
  images?: string[];
  author: string;
  source: string;
  projectId?: string | null;
  license?: string;
  prompt?: string;
  model?: string;
  createdAt: number;
}

export default function HeritagePage() {
  const [tab, setTab] = useState<Tab>('projects');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('全部');
  const [region, setRegion] = useState('全部');
  const [level, setLevel] = useState('全部');
  const [onlyCollected, setOnlyCollected] = useState(false);
  const [sort, setSort] = useState<SortKey>('default');
  const collectedIds = useCollectedIds();
  const [generated, setGenerated] = useState<GeneratedWork[]>([]);

  /** 读取后端归档的 AI 生成作品（api/image 生成时自动写入） */
  useEffect(() => {
    fetch('/api/works')
      .then((res) => res.json())
      .then((json: { works?: GeneratedWork[] }) => setGenerated(json.works ?? []))
      .catch(() => setGenerated([]));
  }, []);

  const removeGenerated = async (id: string) => {
    try {
      const res = await fetch(`/api/works?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const json = (await res.json()) as { works?: GeneratedWork[] };
      setGenerated(json.works ?? []);
    } catch {
      /* 忽略 */
    }
  };

  // 支持首页统计卡片跳转：/heritage?tab=works
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'works') setTab('works');
  }, []);

  /** AI 共创作品：把每个项目的 AI 共创图整理成可检索的作品列表 */
  const works = useMemo<WorkEntry[]>(() => {
    const list: WorkEntry[] = [];
    ichList.forEach((item) => {
      item.aiWorks.forEach((src, i) => {
        const matched = featuredWorks.find((work) => work.image === src);
        list.push({
          id: `${item.id}-ai-${i + 1}`,
          image: src,
          title: matched?.title ?? `${item.name} · AI 共创 ${String(i + 1).padStart(2, '0')}`,
          author: matched?.author ?? 'AI 共创 · 平台用户',
          source: matched?.source ?? `${item.name}素材延伸`,
          projectId: item.id,
          projectName: item.name,
          category: item.category,
          level: item.level,
          region: item.region,
        });
      });
    });
    return list;
  }, []);

  const results = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    let list = ichList.filter((item) => {
      if (category !== '全部' && item.category !== category) return false;
      if (region !== '全部' && item.region !== region) return false;
      if (level !== '全部' && item.level !== level) return false;
      if (onlyCollected && !collectedIds.includes(item.id)) return false;
      if (!kw) return true;
      const haystack = [
        item.name,
        item.alias ?? '',
        item.category,
        item.region,
        item.summary,
        item.tags.join(' '),
        item.background.join(' '),
        item.inheritance,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(kw);
    });

    if (sort === 'level') {
      list = [...list].sort((a, b) => (a.level === b.level ? 0 : a.level === '国家级' ? -1 : 1));
    } else if (sort === 'region') {
      list = [...list].sort((a, b) => a.region.localeCompare(b.region, 'zh-CN'));
    }
    return list;
  }, [keyword, category, region, level, onlyCollected, collectedIds, sort]);

  const workResults = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return works.filter((work) => {
      if (category !== '全部' && work.category !== category) return false;
      if (region !== '全部' && work.region !== region) return false;
      if (!kw) return true;
      return [work.title, work.author, work.source, work.projectName, work.category]
        .join(' ')
        .toLowerCase()
        .includes(kw);
    });
  }, [works, keyword, category, region]);

  const reset = () => {
    setKeyword('');
    setCategory('全部');
    setRegion('全部');
    setLevel('全部');
    setOnlyCollected(false);
    setSort('default');
  };

  const count = tab === 'projects' ? results.length : workResults.length;

  return (
    <div className="relative">
      <div className="pattern-cloud" />
      <section className="page-shell relative pb-8 pt-14">
        <span className="kicker">非遗资料库</span>
        <h1 className="section-title mt-4">
          非遗列表 · <span className="gradient-text">项目与 AI 共创作品</span>
        </h1>

        {/* 分类切换 */}
        <div className="mt-8 flex flex-wrap gap-2">
          {(
            [
              { key: 'projects', label: `非遗项目（${ichList.length}）` },
              { key: 'works', label: `AI 共创作品（${works.length}）` },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
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

        {/* 检索与筛选 */}
        <div className="glass mt-4 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <span className="sr-only">搜索</span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={
                  tab === 'projects'
                    ? '搜索项目名称、地域、技艺关键词，如：剪纸 / 正定 / 战鼓 / 浮雕'
                    : '搜索作品名称、作者、来源项目，如：拉花 / 剪纸 / AI 共创'
                }
                className="field pl-10"
              />
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35">
                ⌕
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="field !w-auto !py-2.5 text-[13px]"
              >
                <option value="全部">全部地域</option>
                {ichRegions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {tab === 'projects' && (
                <>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="field !w-auto !py-2.5 text-[13px]"
                  >
                    <option value="全部">全部等级</option>
                    <option value="国家级">国家级</option>
                    <option value="省级">省级</option>
                  </select>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="field !w-auto !py-2.5 text-[13px]"
                  >
                    <option value="default">默认排序</option>
                    <option value="level">按等级排序</option>
                    <option value="region">按地域排序</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setOnlyCollected((v) => !v)}
                    className={`btn !px-4 !py-2.5 text-[13px] ${
                      onlyCollected ? 'btn-neon' : 'btn-ghost'
                    }`}
                  >
                    ★ 只看收藏
                  </button>
                </>
              )}

              <button type="button" onClick={reset} className="btn btn-ghost !px-4 !py-2.5 text-[13px]">
                重置
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {['全部', ...ichCategories].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition ${
                  category === item
                    ? 'border-gold-400/55 bg-gold-400/15 text-gold-200'
                    : 'border-white/12 bg-white/4 text-white/65 hover:border-white/25 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-5 text-[13px] text-white/45">
          共检索到 <strong className="text-gold-200">{count}</strong> {tab === 'projects' ? '个项目' : '幅作品'}
          {tab === 'projects' && onlyCollected && ` · 已收藏 ${collectedIds.length} 项`}
        </p>
      </section>

      <section className="page-shell pb-24">
        {tab === 'projects' ? (
          results.length === 0 ? (
            <div className="glass grid place-items-center gap-3 p-16 text-center">
              <span className="serif text-[20px] text-gold-200">没有找到匹配的项目</span>
              <p className="text-[13.5px] text-white/55">
                试试更短的关键词，或点击「重置」查看全部 {ichList.length} 个项目。
              </p>
              <button type="button" onClick={reset} className="btn btn-ghost mt-2">
                重置筛选
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((item, index) => (
                <Reveal key={item.id} delay={(index % 4) * 60}>
                  <HeritageCard item={item} />
                </Reveal>
              ))}
            </div>
          )
        ) : workResults.length === 0 ? (
          <div className="glass grid place-items-center gap-3 p-16 text-center">
            <span className="serif text-[20px] text-gold-200">没有找到匹配的 AI 共创作品</span>
            <p className="text-[13.5px] text-white/55">换个关键词，或到「AI 创作」生成属于你的版本。</p>
            <Link href="/create" className="btn btn-neon mt-2">
              去 AI 创作
            </Link>
          </div>
        ) : (
          <>
            {generated.length > 0 && (
              <div className="mb-8">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h3 className="serif text-[17px] text-white">最新生成的作品</h3>
                  <span className="chip chip-jade !text-[11px]">
                    由「图像模型」模块真实生成 · {generated.length} 幅
                  </span>
                  <span className="text-[12px] text-white/40">
                    生成时已按你的设置写入署名与授权范围
                  </span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {generated.map((work) => (
                    <article key={work.id} className="glass glass-hover flex h-full flex-col overflow-hidden">
                      <a
                        href={work.image}
                        target="_blank"
                        rel="noreferrer"
                        className="card-media relative block h-64 overflow-hidden"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={work.image} alt={work.title} loading="lazy" />
                        <span className="chip chip-gold absolute left-3 top-3 !py-1 !text-[11px]">AI 生成</span>
                      </a>
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="serif text-[15px] leading-6 text-white">{work.title}</h3>
                        <p className="mt-1 text-[12px] text-white/48">{work.author}</p>
                        <p className="mt-1 text-[11.5px] text-white/35">{work.source}</p>
                        {work.prompt && (
                          <p className="mt-2 line-clamp-3 text-[11.5px] leading-5 text-white/45">
                            提示词：{work.prompt}
                          </p>
                        )}
                        {work.license && (
                          <p className="mt-1 text-[11px] leading-5 text-white/30">授权：{work.license}</p>
                        )}
                        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                          {work.projectId ? (
                            <Link
                              href={`/heritage/${work.projectId}`}
                              className="text-[12.5px] text-gold-300/90 transition hover:text-gold-200"
                            >
                              关联项目 →
                            </Link>
                          ) : (
                            <span className="text-[11.5px] text-white/35">未关联项目</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeGenerated(work.id)}
                            className="text-[11.5px] text-white/35 transition hover:text-cinnabar-300"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workResults.map((work, index) => (
              <Reveal key={work.id} delay={(index % 4) * 60}>
                <article className="glass glass-hover group flex h-full flex-col overflow-hidden">
                  <Link
                    href={`/heritage/${work.projectId}`}
                    className="card-media relative block h-64 overflow-hidden"
                    aria-label={`查看${work.projectName}详情`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={work.image} alt={work.title} loading="lazy" />
                    <span className="chip chip-gold absolute left-3 top-3 !py-1 !text-[11px]">
                      AI 共创
                    </span>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/95 to-transparent p-3">
                      <span className="text-[11.5px] text-white/60">{work.author}</span>
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="serif text-[15px] leading-6 text-white">{work.title}</h3>
                    <p className="mt-1 text-[12px] text-white/48">{work.source}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="chip !py-0.5 !text-[11px]">{work.category}</span>
                      <span className="chip !py-0.5 !text-[11px]">{work.region}</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                      <Link
                        href={`/heritage/${work.projectId}`}
                        className="text-[12.5px] text-gold-300/90 transition hover:text-gold-200"
                      >
                        关联：{work.projectName} →
                      </Link>
                      <Link href="/create" className="chip !text-[11px] transition hover:text-gold-200">
                        我也要共创
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
