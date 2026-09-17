import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import HistoryRecorder from '@/components/HistoryRecorder';
import Reveal from '@/components/Reveal';
import { getNews, newsList } from '@/lib/newsData';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return newsList.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getNews(id);
  if (!item) return { title: '内容未找到' };
  return { title: `${item.title} · 政策新闻`, description: item.summary };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = getNews(id);
  if (!item) notFound();

  const index = newsList.findIndex((entry) => entry.id === item.id);
  const prev = newsList[(index - 1 + newsList.length) % newsList.length];
  const next = newsList[(index + 1) % newsList.length];
  const related = newsList
    .filter((entry) => entry.id !== item.id && entry.category === item.category)
    .slice(0, 3);

  return (
    <article className="relative">
      <HistoryRecorder
        id={`news-${item.id}`}
        type="政策新闻"
        title={item.title}
        href={`/news/${item.id}`}
        cover={item.cover}
      />

      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.cover} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2e1c11] via-[#3a2314]/86 to-[#3a2314]/60" />
        <div className="on-photo page-shell relative pb-12 pt-24">
          <nav className="text-[12.5px] text-white/50">
            <Link href="/" className="transition hover:text-gold-200">
              首页
            </Link>
            <span className="mx-2">/</span>
            <Link href="/news" className="transition hover:text-gold-200">
              相关非遗
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">{item.category}</span>
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="chip chip-gold">{item.category}</span>
            <span className="text-[12.5px] text-white/50">{item.date}</span>
            <span className="text-[12.5px] text-white/50">{item.source}</span>
          </div>
          <h1 className="serif mt-4 max-w-4xl text-[clamp(24px,3.4vw,38px)] font-bold leading-[1.35] text-white">
            {item.title}
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-8 text-white/70">{item.summary}</p>
        </div>
      </section>

      <section className="page-shell grid gap-8 py-12 lg:grid-cols-[1fr_320px]">
        <Reveal className="glass p-7">
          <div className="space-y-5 text-[15px] leading-9 text-white/75">
            {item.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="chip !text-[11.5px]">
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-6 text-[12px] leading-6 text-white/35">
            本页为平台示例内容，接入真实政策文件或新闻源后可直接替换；涉及政策条款请以官方发布原文为准。
          </p>
        </Reveal>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="glass p-6">
            <h3 className="serif text-[16px] text-white">同类内容</h3>
            <div className="mt-4 space-y-3">
              {related.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/news/${entry.id}`}
                  className="group block rounded-xl border border-white/8 bg-white/3 p-3 transition hover:border-gold-400/35"
                >
                  <span className="text-[11.5px] text-gold-300/80">{entry.date}</span>
                  <strong className="serif mt-1 block text-[13.5px] leading-6 text-white/88 group-hover:text-gold-200">
                    {entry.title}
                  </strong>
                </Link>
              ))}
            </div>
          </div>

          <div className="glass p-6">
            <h3 className="serif text-[16px] text-white">上下篇</h3>
            <div className="mt-4 space-y-3">
              {[prev, next].map((entry, i) => (
                <Link
                  key={entry.id}
                  href={`/news/${entry.id}`}
                  className="block rounded-xl border border-white/8 bg-white/3 p-3 transition hover:border-gold-400/35"
                >
                  <span className="text-[11px] text-white/40">{i === 0 ? '上一篇' : '下一篇'}</span>
                  <strong className="serif mt-1 block text-[13.5px] leading-6 text-white/85">
                    {entry.title}
                  </strong>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </article>
  );
}
