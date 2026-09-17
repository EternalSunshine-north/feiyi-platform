'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import EChart from '@/components/EChart';
import GeoMap from '@/components/GeoMap';
import Reveal from '@/components/Reveal';
import { getIch } from '@/lib/ich';
import { districtOf, mapPoints, type MapPoint } from '@/lib/mapData';
import { pushHistory } from '@/lib/store';

export default function MapPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');

  const active = useMemo(() => mapPoints.find((p) => p.id === activeId) ?? null, [activeId]);

  /** 当前点位的完整项目档案（用于在侧滑面板里展示详情与图片） */
  const activeProject = useMemo(() => (active?.ichId ? getIch(active.ichId) : undefined), [active]);

  /** 集聚点位：展示可跳转的关联项目 */
  const relatedProjects = useMemo(
    () => (active?.relatedIchIds ?? []).map((id) => getIch(id)).filter(Boolean),
    [active],
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    if (!kw) return mapPoints;
    return mapPoints.filter((p) =>
      [p.name, p.location, p.category, p.description].join(' ').includes(kw),
    );
  }, [keyword]);

  const regionStats = useMemo(() => {
    const map = new Map<string, number>();
    mapPoints.forEach((point) => {
      const key = point.location.split(' · ')[0];
      map.set(key, (map.get(key) ?? 0) + point.count);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    mapPoints.forEach((point) => map.set(point.category, (map.get(point.category) ?? 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, []);

  const totalCount = useMemo(() => mapPoints.reduce((sum, p) => sum + p.count, 0), []);

  const geoPoints = useMemo(
    () =>
      filtered.map((point) => ({
        name: point.name,
        location: point.location,
        category: point.category,
        level: point.level,
        count: point.count,
        coordinates: point.coordinates,
      })),
    [filtered],
  );

  const districtData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((point) => {
      const key = districtOf(point);
      map.set(key, (map.get(key) ?? 0) + point.count);
    });
    return Array.from(map.entries()).map(([district, count]) => ({ district, count }));
  }, [filtered]);

  const selectPoint = (point: MapPoint) => {
    setActiveId(point.id);
    pushHistory({
      id: `map-${point.id}`,
      type: '地图点位',
      title: `${point.location} · ${point.name}`,
      href: point.ichId ? `/heritage/${point.ichId}` : '/map',
      cover: point.image,
    });
  };

  const selectByName = (name: string) => {
    const point = mapPoints.find((p) => p.name === name);
    if (point) selectPoint(point);
  };

  const barOption = useMemo(
    () => ({
      grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(248,240,229,0.97)',
        borderColor: 'rgba(166,126,84,0.52)',
        textStyle: { color: '#33241a', fontSize: 12 },
      },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(166,126,84,0.26)' } },
        axisLabel: { color: 'rgba(92,68,46,0.75)', fontSize: 11 },
      },
      yAxis: {
        type: 'category',
        data: regionStats.map((item) => item.name),
        axisLabel: { color: 'rgba(66,47,32,0.88)', fontSize: 12 },
        axisLine: { lineStyle: { color: 'rgba(166,126,84,0.4)' } },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: regionStats.map((item) => item.value),
          barWidth: 12,
          itemStyle: {
            borderRadius: [0, 8, 8, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#c89241' },
                { offset: 1, color: '#b94a33' },
              ],
            },
          },
        },
      ],
    }),
    [regionStats],
  );

  const pieOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(248,240,229,0.97)',
        borderColor: 'rgba(166,126,84,0.52)',
        textStyle: { color: '#33241a', fontSize: 12 },
      },
      legend: {
        bottom: 0,
        textStyle: { color: 'rgba(80,60,40,0.85)', fontSize: 11 },
        itemWidth: 10,
        itemHeight: 10,
      },
      color: ['#b94a33', '#c89241', '#8b9d5b', '#dcae55', '#d0684c', '#a9762a', '#6e7e42'],
      series: [
        {
          type: 'pie',
          radius: ['46%', '70%'],
          center: ['50%', '44%'],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: '#f4eadb', borderWidth: 3 },
          label: { color: 'rgba(66,47,32,0.88)', fontSize: 11 },
          data: categoryStats,
        },
      ],
    }),
    [categoryStats],
  );

  return (
    <div className="relative">
      <div className="pattern-cloud" />

      <section className="page-shell relative pb-6 pt-14">
        <span className="kicker">文化地图</span>
        <h1 className="section-title mt-4">
          石家庄非遗点位分布 · <span className="gradient-text">让数据落到地图上</span>
        </h1>
        <p className="section-desc mt-4">
          使用本地行政区划数据离线渲染：区县填色表示资源数量，实心圆点对应各非遗点位，
          断网也能正常显示。点击点位即可在右侧查看项目介绍。
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: '遗产点位', value: mapPoints.length, suffix: '个' },
            { label: '覆盖县市区', value: regionStats.length, suffix: '个' },
            { label: '关联资源总数', value: totalCount, suffix: '项' },
            { label: '可跳转详情', value: mapPoints.filter((p) => p.ichId).length, suffix: '个' },
          ].map((stat) => (
            <Reveal key={stat.label} className="glass px-5 py-4">
              <span className="text-[12px] text-white/45">{stat.label}</span>
              <strong className="serif mt-1 block text-[26px] text-gold-200">
                {stat.value}
                <small className="ml-1 text-[13px] text-white/50">{stat.suffix}</small>
              </strong>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-shell grid gap-5 pb-10 lg:grid-cols-[1fr_320px]">
        <Reveal className="glass p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <span className="serif text-[15px] text-white">石家庄非遗点位分布</span>
            <span className="text-[11.5px] text-white/40">
              数据来源：本地 GeoJSON（public/geo）· 支持缩放与拖拽
            </span>
          </div>

          <GeoMap
            geoUrl="/geo/shijiazhuang.json"
            mapName="shijiazhuang"
            points={geoPoints}
            districts={districtData}
            height={580}
            onSelect={selectByName}
          />
        </Reveal>

        <Reveal className="flex flex-col gap-4" delay={80}>
          <div className="glass p-5">
            <label className="relative block">
              <span className="sr-only">搜索点位</span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索点位 / 县市区 / 类别"
                className="field !py-2.5 text-[13px]"
              />
            </label>
            <p className="mt-3 text-[12px] text-white/45">
              当前显示 {filtered.length} / {mapPoints.length} 个点位
            </p>
          </div>

          <div className="glass flex-1 p-5">
            <h3 className="serif text-[15px] text-white">资源数量排行</h3>
            <ul className="mt-4 space-y-2.5">
              {regionStats.slice(0, 10).map((item, index) => (
                <li key={item.name} className="flex items-center gap-3">
                  <span className="serif w-6 text-[12.5px] text-gold-300/80">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 truncate text-[13px] text-white/75">{item.name}</span>
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/8">
                    <i
                      className="block h-full rounded-full bg-gradient-to-r from-neon-400 to-gold-400"
                      style={{ width: `${(item.value / regionStats[0].value) * 100}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-[12.5px] text-white/60">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="page-shell grid gap-5 pb-10 lg:grid-cols-2">
        <Reveal className="glass p-6">
          <h3 className="serif text-[17px] text-white">各县市区非遗资源数量</h3>
          <p className="mt-1 text-[12.5px] text-white/45">按点位关联资源数量汇总</p>
          <EChart option={barOption} height={340} className="mt-4" />
        </Reveal>
        <Reveal className="glass p-6" delay={70}>
          <h3 className="serif text-[17px] text-white">门类分布</h3>
          <p className="mt-1 text-[12.5px] text-white/45">按文化地图点位的类别统计</p>
          <EChart option={pieOption} height={340} className="mt-4" />
        </Reveal>
      </section>

      <section className="page-shell pb-24">
        <Reveal className="section-head">
          <div>
            <span className="kicker">点位列表</span>
            <h2 className="section-title">点击任意点位查看详细介绍</h2>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((point, index) => (
            <Reveal key={point.id} delay={(index % 3) * 60}>
              <button
                type="button"
                onClick={() => selectPoint(point)}
                className={`glass glass-hover card-media group block h-40 w-full overflow-hidden rounded-2xl text-left ${
                  activeId === point.id ? 'border-gold-400/50' : ''
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={point.image} alt={point.name} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2e1c11]/95 via-[#3a2314]/45 to-transparent" />
                <span className="on-photo chip chip-gold absolute left-3 top-3 !py-1 !text-[11px]">
                  {point.count} 项资源
                </span>
                <div className="on-photo absolute inset-x-0 bottom-0 p-4">
                  <strong className="serif block text-[15px] text-white">{point.name}</strong>
                  <span className="mt-1 block text-[12px] text-white/78">
                    {point.location} · {point.category}
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {active && (
        <div className="fixed inset-0 z-[900] flex items-end justify-end bg-ink-950/50 backdrop-blur-sm lg:items-stretch">
          <button
            type="button"
            aria-label="关闭详情"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setActiveId(null)}
          />
          <aside className="animate-rise glass relative z-10 max-h-[86vh] w-full overflow-y-auto rounded-t-2xl lg:mb-6 lg:mr-6 lg:mt-24 lg:max-h-[calc(100vh-140px)] lg:w-[420px] lg:rounded-2xl">
            <div className="card-media relative h-52">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.image} alt={active.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2e1c11] to-transparent opacity-90" />
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-ink-950/80 text-white/70 transition hover:text-white"
                aria-label="关闭"
              >
                ✕
              </button>
              <div className="on-photo absolute bottom-4 left-5">
                <span className="chip chip-gold !py-1 !text-[11px]">{active.level}</span>
                <h3 className="serif mt-2 text-[22px] text-white">{active.name}</h3>
                <p className="text-[12.5px] text-white/80">
                  {active.location} · {active.category}
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                  <span className="text-[11.5px] text-white/45">关联资源</span>
                  <strong className="serif mt-1 block text-[22px] text-gold-200">{active.count} 项</strong>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                  <span className="text-[11.5px] text-white/45">坐标</span>
                  <strong className="mt-1 block text-[13.5px] text-white/85">
                    {active.coordinates[1].toFixed(2)}°N
                    <br />
                    {active.coordinates[0].toFixed(2)}°E
                  </strong>
                </div>
              </div>

              {/* 项目档案：有建档的项目直接展示完整信息 */}
              {activeProject ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.tags.map((tag) => (
                      <span key={tag} className="chip !text-[11px]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div>
                    <span className="text-[11.5px] text-white/45">项目简介</span>
                    <p className="mt-1 text-[13.5px] leading-8 text-white/75">{activeProject.summary}</p>
                  </div>

                  <div>
                    <span className="text-[11.5px] text-white/45">核心看点</span>
                    <ul className="mt-1.5 space-y-1.5">
                      {activeProject.significance.map((entry) => (
                        <li key={entry.title} className="text-[12.5px] leading-6 text-white/70">
                          <strong className="text-gold-200">{entry.title}</strong>：{entry.text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {activeProject.gallery.length > 0 && (
                    <div>
                      <span className="text-[11.5px] text-white/45">项目图片</span>
                      <div className="mt-1.5 grid grid-cols-3 gap-2">
                        {activeProject.gallery.slice(0, 3).map((src) => (
                          <div key={src} className="card-media relative h-20 overflow-hidden rounded-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={activeProject.name} loading="lazy" />
                          </div>
                        ))}
                      </div>
                      {activeProject.imageNote && (
                        <p className="mt-1.5 text-[10.5px] leading-5 text-white/35">{activeProject.imageNote}</p>
                      )}
                    </div>
                  )}

                  <dl className="grid grid-cols-2 gap-2">
                    {activeProject.facts.slice(0, 4).map((fact) => (
                      <div key={fact.label} className="rounded-xl border border-white/8 bg-white/4 p-2.5">
                        <dt className="text-[10.5px] text-white/45">{fact.label}</dt>
                        <dd className="mt-0.5 text-[12px] leading-5 text-white/80">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <p className="text-[12.5px] leading-7 text-white/55">
                    <span className="text-white/40">点位说明：</span>
                    {active.description}
                  </p>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <Link href={`/heritage/${activeProject.id}`} className="btn btn-primary">
                      查看完整档案
                    </Link>
                    <Link href="/create" className="btn btn-ghost">
                      用 AI 讲讲它
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[13.5px] leading-8 text-white/68">{active.description}</p>

                  {relatedProjects.length > 0 && (
                    <div>
                      <span className="text-[11.5px] text-white/45">该点位关联的非遗项目</span>
                      <div className="mt-2 grid gap-2">
                        {relatedProjects.map((project) =>
                          project ? (
                            <Link
                              key={project.id}
                              href={`/heritage/${project.id}`}
                              className="glass glass-hover flex items-center gap-3 p-2.5"
                            >
                              <div className="card-media relative h-12 w-16 flex-none overflow-hidden rounded-lg">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={project.cover} alt={project.name} loading="lazy" />
                              </div>
                              <div className="min-w-0">
                                <strong className="serif block truncate text-[13px] text-white">
                                  {project.name}
                                </strong>
                                <span className="text-[11px] text-white/50">
                                  {project.level} · {project.category}
                                </span>
                              </div>
                              <span className="ml-auto text-[12px] text-gold-300/90">查看 →</span>
                            </Link>
                          ) : null,
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-1">
                    <Link href="/heritage" className="btn btn-ghost">
                      去非遗列表浏览
                    </Link>
                    <Link href="/create" className="btn btn-ghost">
                      用 AI 讲讲它
                    </Link>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
