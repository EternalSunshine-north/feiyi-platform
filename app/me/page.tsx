'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import CollectButton from '@/components/CollectButton';
import Protected from '@/components/Protected';
import Reveal from '@/components/Reveal';
import { avatarInitial, useAuth } from '@/lib/auth';
import { ichList } from '@/lib/ich';
import { clearHistory, useCollectedIds, useHistoryRecords } from '@/lib/store';

export default function MePage() {
  const { user, logout } = useAuth();
  const collectedIds = useCollectedIds();
  const history = useHistoryRecords();

  const collectedItems = useMemo(
    () => ichList.filter((item) => collectedIds.includes(item.id)),
    [collectedIds],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof history>();
    history.forEach((record) => {
      const key = new Date(record.at).toLocaleDateString('zh-CN');
      const list = map.get(key) ?? [];
      list.push(record);
      map.set(key, list);
    });
    return Array.from(map.entries());
  }, [history]);

  return (
    <Protected hint="个人中心需要登录后查看">
      <div className="relative">
        <div className="pattern-cloud" />
        <section className="page-shell relative pb-8 pt-14">
          <span className="kicker">个人中心</span>
          <h1 className="section-title mt-4">
            {user?.nickname}的<span className="gradient-text">非遗足迹</span>
          </h1>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
            <Reveal className="glass flex flex-wrap items-center gap-5 p-6">
              <span className="serif grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-jade-400 to-neon-500 text-[22px] font-bold text-ink-950">
                {avatarInitial(user ?? null)}
              </span>
              <div className="min-w-0">
                <strong className="serif block text-[20px] text-white">{user?.nickname}</strong>
                <span className="mt-1 block text-[13px] text-white/55">账号：{user?.account}</span>
                <span className="mt-0.5 block text-[12.5px] text-white/40">
                  加入时间：
                  {user ? new Date(user.joinedAt).toLocaleDateString('zh-CN') : '—'}
                </span>
              </div>
              <div className="ml-auto flex flex-wrap gap-3">
                <Link href="/create" className="btn btn-primary !py-2.5">
                  AI 创作
                </Link>
                <button type="button" onClick={logout} className="btn btn-ghost !py-2.5">
                  退出登录
                </button>
              </div>
            </Reveal>

            <Reveal className="glass grid grid-cols-3 gap-3 p-6" delay={60}>
              {[
                { label: '我的收藏', value: collectedItems.length, unit: '项' },
                { label: '浏览记录', value: history.length, unit: '条' },
                { label: '收录项目', value: ichList.length, unit: '项' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <span className="text-[11.5px] text-white/45">{stat.label}</span>
                  <strong className="serif mt-1 block text-[24px] text-gold-200">{stat.value}</strong>
                  <span className="text-[11px] text-white/35">{stat.unit}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* 我的收藏 */}
        <section id="collections" className="page-shell scroll-mt-24 pb-12">
          <Reveal className="section-head">
            <div>
              <span className="kicker">我的收藏</span>
              <h2 className="section-title !text-[26px]">收藏的非遗项目</h2>
            </div>
            <Link href="/heritage" className="btn btn-ghost !py-2.5">
              去非遗列表逛逛
            </Link>
          </Reveal>

          {collectedItems.length === 0 ? (
            <div className="glass grid place-items-center gap-3 p-14 text-center">
              <span className="serif text-[18px] text-gold-200">还没有收藏任何项目</span>
              <p className="text-[13.5px] text-white/55">
                在非遗列表或详情页点击「☆ 收藏」，项目就会出现在这里。
              </p>
              <Link href="/heritage" className="btn btn-primary mt-2">
                浏览非遗项目
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {collectedItems.map((item, index) => (
                <Reveal key={item.id} delay={(index % 4) * 60}>
                  <div className="glass glass-hover card-media group h-44 overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.cover} alt={item.name} loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2e1c11]/95 via-[#3a2314]/45 to-transparent" />
                    <span className="on-photo chip chip-gold absolute left-3 top-3 !py-1 !text-[11px]">
                      {item.level}
                    </span>
                    <div className="on-photo absolute inset-x-0 bottom-0 p-4">
                      <Link href={`/heritage/${item.id}`} className="serif block text-[15px] text-white">
                        {item.name}
                      </Link>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11.5px] text-white/78">{item.region}</span>
                        <CollectButton id={item.id} variant="chip" />
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {/* 浏览历史 */}
        <section className="page-shell pb-24">
          <Reveal className="section-head">
            <div>
              <span className="kicker">浏览历史</span>
              <h2 className="section-title !text-[26px]">最近看过的内容</h2>
            </div>
            {history.length > 0 && (
              <button type="button" onClick={clearHistory} className="btn btn-ghost !py-2.5">
                清空历史
              </button>
            )}
          </Reveal>

          {history.length === 0 ? (
            <div className="glass grid place-items-center gap-3 p-14 text-center">
              <span className="serif text-[18px] text-gold-200">暂无浏览记录</span>
              <p className="text-[13.5px] text-white/55">
                浏览非遗详情页、政策新闻或点击地图点位后，记录会自动出现在这里。
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map(([date, records]) => (
                <div key={date}>
                  <h3 className="serif text-[14px] tracking-wide text-gold-300/85">{date}</h3>
                  <div className="mt-3 grid gap-3">
                    {records.map((record) => (
                      <Link
                        key={record.id}
                        href={record.href}
                        className="glass glass-hover flex items-center gap-4 p-4"
                      >
                        {record.cover ? (
                          <div className="card-media h-14 w-20 flex-none overflow-hidden rounded-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={record.cover} alt={record.title} className="h-full w-full object-cover" loading="lazy" />
                          </div>
                        ) : (
                          <span className="grid h-14 w-20 flex-none place-items-center rounded-lg border border-white/10 bg-white/4 text-[12px] text-white/45">
                            {record.type}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="chip !py-0.5 !text-[11px]">{record.type}</span>
                            <span className="text-[11.5px] text-white/35">
                              {new Date(record.at).toLocaleTimeString('zh-CN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <strong className="serif mt-1.5 block truncate text-[14.5px] text-white/90">
                            {record.title}
                          </strong>
                        </div>
                        <span className="text-[12.5px] text-gold-300/80">继续浏览 →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Protected>
  );
}
