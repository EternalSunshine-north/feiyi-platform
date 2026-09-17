import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CollectButton from '@/components/CollectButton';
import HistoryRecorder from '@/components/HistoryRecorder';
import Reveal from '@/components/Reveal';
import { getIch, ichList } from '@/lib/ich';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return ichList.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getIch(id);
  if (!item) return { title: '非遗项目未找到' };
  return {
    title: `${item.name} · 石家庄非遗`,
    description: item.summary,
  };
}

export default async function HeritageDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = getIch(id);
  if (!item) notFound();

  const index = ichList.findIndex((entry) => entry.id === item.id);
  const prev = ichList[(index - 1 + ichList.length) % ichList.length];
  const next = ichList[(index + 1) % ichList.length];

  return (
    <div className="relative">
      <HistoryRecorder
        id={`ich-${item.id}`}
        type="非遗项目"
        title={item.name}
        href={`/heritage/${item.id}`}
        cover={item.cover}
      />

      {/* 头部大图 */}
      <section className="relative min-h-[440px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.cover} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2e1c11] via-[#3a2314]/80 to-[#3a2314]/45" />
        <div className="pattern-ornament opacity-10" />

        <div className="on-photo page-shell relative flex min-h-[440px] flex-col justify-end pb-10 pt-24">
          <nav className="text-[12.5px] text-white/50">
            <Link href="/" className="transition hover:text-gold-200">
              首页
            </Link>
            <span className="mx-2">/</span>
            <Link href="/heritage" className="transition hover:text-gold-200">
              非遗列表
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">{item.name}</span>
          </nav>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="chip chip-gold">{item.level}</span>
            <span className="chip">{item.category}</span>
            <span className="chip">{item.region}</span>
            {item.listed && <span className="chip chip-jade !text-[11.5px]">{item.listed}</span>}
          </div>

          <h1 className="serif mt-4 text-[clamp(28px,4vw,46px)] font-bold leading-tight text-white">
            {item.name}
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-8 text-white/72">{item.summary}</p>
          {item.imageNote && (
            <p className="on-photo mt-2 max-w-3xl text-[12px] leading-6 text-white/60">
              图片说明：{item.imageNote}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <CollectButton id={item.id} variant="solid" label="收藏该项目" />
            <a href="#gallery" className="btn btn-ghost">
              查看图片档案
            </a>
            <a href="#video" className="btn btn-ghost">
              观看影像资料
            </a>
            <Link href="/map" className="text-[13.5px] text-gold-300/90 transition hover:text-gold-200">
              在地图上定位 →
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-8 py-14 lg:grid-cols-[1fr_340px]">
        {/* 主内容 */}
        <div className="space-y-8">
          <Reveal className="glass p-7">
            <h2 className="serif text-[20px] text-white">项目介绍</h2>
            <div className="mt-4 space-y-4 text-[14.5px] leading-8 text-white/70">
              {item.background.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal className="glass p-7" delay={60}>
            <h2 className="serif text-[20px] text-white">为什么列入非遗名录</h2>
            <ul className="mt-5 space-y-4">
              {item.reason.map((text, i) => (
                <li key={i} className="flex gap-4">
                  <span className="serif mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-lg border border-gold-400/35 bg-gold-400/10 text-[12.5px] text-gold-200">
                    {i + 1}
                  </span>
                  <p className="text-[14px] leading-8 text-white/70">{text}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="grid gap-4 md:grid-cols-3" delay={90}>
            {item.significance.map((entry) => (
              <div key={entry.title} className="glass glass-hover h-full p-6">
                <h3 className="serif text-[16px] text-gold-200">{entry.title}</h3>
                <p className="mt-3 text-[13.5px] leading-7 text-white/65">{entry.text}</p>
              </div>
            ))}
          </Reveal>

          <Reveal className="glass p-7" delay={110}>
            <h2 className="serif text-[20px] text-white">传承人 · 传承方式</h2>
            <p className="mt-4 text-[14px] leading-8 text-white/70">{item.inheritance}</p>
            <p className="mt-3 text-[12.5px] leading-7 text-white/40">
              说明：素材包未附传承人详细档案，平台已预留字段，接入后台后可直接补录姓名、称号、代表作与联系方式。
            </p>
          </Reveal>

          {/* 图片档案 */}
          <Reveal id="gallery" className="glass p-7" delay={130}>
            <h2 className="serif text-[20px] text-white">图片档案</h2>
            {item.gallery.length > 0 ? (
              <>
                <p className="mt-2 text-[13px] text-white/50">
                  共 {item.gallery.length} 张{item.imageNote ? '（含同类场景示意图）' : '实拍图片'}。
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {item.gallery.map((src, i) => (
                    <figure key={src} className="card-media glass-hover relative h-44 overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`${item.name} 图片 ${i + 1}`} loading="lazy" />
                      <figcaption className="absolute bottom-0 left-0 right-0 bg-ink-950/72 px-3 py-2 text-[11.5px] text-white/70 backdrop-blur">
                        影像档案 · {String(i + 1).padStart(2, '0')}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-3 rounded-xl border border-white/10 bg-white/4 p-4 text-[13px] leading-7 text-white/55">
                该项目的实拍图片正在整理中。你可以在「AI 创作」里用提示词生成第一组视觉作品，
                生成结果会归档到「非遗列表 → AI 共创作品」。
              </p>
            )}
            {item.imageNote && (
              <p className="mt-3 text-[11.5px] leading-6 text-white/35">{item.imageNote}</p>
            )}
          </Reveal>

          {/* 影像资料 */}
          <Reveal id="video" className="glass p-7" delay={150}>
            <h2 className="serif text-[20px] text-white">影像资料</h2>
            {item.videos.length > 0 ? (
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {item.videos.map((video) => (
                  <div key={video.src} className="space-y-3">
                    <video
                      controls
                      preload="none"
                      poster={video.poster}
                      className="w-full rounded-xl border border-white/10 bg-ink-950"
                    >
                      <source src={video.src} type="video/mp4" />
                      你的浏览器不支持视频播放。
                    </video>
                    <p className="text-[12.5px] text-white/55">{video.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-white/10 bg-white/4 p-4 text-[13px] leading-7 text-white/55">
                该项目的影像资料整理中。可以先到「相关非遗」页的影像墙观看同类非遗影像。
              </p>
            )}
          </Reveal>

          {/* AI 共创作品 */}
          <Reveal className="glass p-7" delay={170}>
            <h2 className="serif text-[20px] text-white">AI 共创作品</h2>
            <p className="mt-2 text-[13px] text-white/50">
              以该项目为灵感来源的 AI 共创图，可在「AI 创作」中继续生成属于你的版本。
            </p>
            {item.aiWorks.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {item.aiWorks.map((src, i) => (
                  <div key={src} className="card-media glass-hover h-72 overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${item.name} AI 共创 ${i + 1}`} loading="lazy" />
                    <span className="chip absolute left-3 top-3 !py-1 !text-[11px]">AI 共创 {i + 1}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-white/10 bg-white/4 p-4 text-[13px] leading-7 text-white/55">
                这个项目还没有 AI 共创作品，欢迎成为第一个创作者。
              </p>
            )}
            <Link href="/create" className="btn btn-neon mt-6">
              去 AI 创作台生成新版本
            </Link>
          </Reveal>
        </div>

        {/* 侧栏 */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="glass p-6">
            <h3 className="serif text-[16px] text-white">项目信息</h3>
            <dl className="mt-4 space-y-3">
              {item.facts.map((fact) => (
                <div key={fact.label} className="flex items-start justify-between gap-4 border-b border-white/6 pb-3 last:border-0 last:pb-0">
                  <dt className="text-[12.5px] text-white/45">{fact.label}</dt>
                  <dd className="max-w-[62%] text-right text-[13px] text-white/85">{fact.value}</dd>
                </div>
              ))}
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[12.5px] text-white/45">数据来源</dt>
                <dd className="max-w-[62%] text-right text-[13px] text-white/70">{item.source}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={tag} className="chip !text-[11.5px]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="glass p-6">
            <h3 className="serif text-[16px] text-white">继续浏览</h3>
            <div className="mt-4 space-y-3">
              {[prev, next].map((entry, i) => (
                <Link
                  key={entry.id}
                  href={`/heritage/${entry.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-3 transition hover:border-gold-400/35"
                >
                  <div className="card-media h-14 w-20 flex-none overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.cover} alt={entry.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-white/40">{i === 0 ? '上一个项目' : '下一个项目'}</span>
                    <strong className="serif block truncate text-[14px] text-white/90 group-hover:text-gold-200">
                      {entry.name}
                    </strong>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/map" className="btn btn-ghost mt-5 w-full justify-center">
              在文化地图中查看
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
