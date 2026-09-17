import Link from 'next/link';
import CollectButton from '@/components/CollectButton';
import CountUp from '@/components/CountUp';
import HeroShowcase from '@/components/HeroShowcase';
import Particles from '@/components/Particles';
import Reveal from '@/components/Reveal';
import { ichList } from '@/lib/ich';
import { mapPoints } from '@/lib/mapData';
import { featuredContents, platformStats, testimonials } from '@/lib/works';

export default function HomePage() {
  const topTen = ichList.slice(0, 10);
  const highlightContent = featuredContents.slice(0, 3);
  const moreContent = featuredContents.slice(3);
  const marqueeRowOne = testimonials.slice(0, 3);
  const marqueeRowTwo = testimonials.slice(3);

  return (
    <>
      {/* ============ 首屏 · 平台简介（文字在上，轮播图在下） ============ */}
      <section className="relative overflow-hidden pb-16 pt-14 md:pb-20 md:pt-20">
        <div className="pattern-ornament" />
        <div className="glow-orb -left-24 top-10 h-72 w-72 bg-neon-500/25" />
        <div className="glow-orb right-0 top-40 h-80 w-80 bg-cinnabar-500/20" />
        <Particles className="absolute inset-0 h-full w-full opacity-70" density={1.05} />

        <div className="page-shell relative">
          <div className="max-w-4xl">
            <div className="animate-rise flex items-center gap-3">
              <span className="seal">非</span>
              <div className="flex flex-col">
                <span className="kicker">SHIJIAZHUANG · INTANGIBLE CULTURE</span>
                <span className="mt-1 text-[11.5px] text-white/45">
                  {ichList.length} 项非遗项目 · {mapPoints.length} 个文化地图点位 · AI 共创
                </span>
              </div>
            </div>
            <h1 className="animate-rise mt-5 text-[clamp(30px,4.6vw,58px)] font-bold leading-[1.16] tracking-tight">
              <span className="serif block text-white">让石家庄非遗，</span>
              <span className="gradient-text serif block">与 AI 一起被看见</span>
            </h1>
            <p className="animate-rise mt-6 max-w-3xl text-[15.5px] leading-8 text-white/68">
              这是一座把「石家庄非物质文化遗产」与「AI 艺术共创」放在一起的平台：
              您可以在文化地图上找到散落在太行山与滹沱河之间的非遗点位，查阅项目档案与影像资料，
              也可以把拉花的动作、战鼓的鼓谱与传统纹样，变成属于你的新作品。
            </p>

            <div className="animate-rise mt-9 flex flex-wrap items-center gap-4">
              <Link href="/heritage" className="btn btn-primary">
                进入非遗资料库
              </Link>
              <Link href="/create" className="btn btn-ghost">
                AI 共创体验
              </Link>
              <Link href="/map" className="text-[13.5px] text-gold-300/90 transition hover:text-gold-200">
                先看文化地图 →
              </Link>
            </div>

            <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
              {platformStats.map((stat) => (
                <Reveal key={stat.label}>
                  <Link
                    href={stat.href}
                    className="glass glass-hover group block h-full px-4 py-4"
                    title={stat.hint}
                  >
                    <dt className="text-[11.5px] tracking-wide text-white/45">{stat.label}</dt>
                    <dd className="serif mt-1 text-[26px] text-gold-200">
                      <CountUp value={stat.value} suffix={stat.suffix} />
                    </dd>
                    <span className="mt-1 block text-[11px] text-white/35 transition group-hover:text-gold-300/90">
                      {stat.hint} →
                    </span>
                  </Link>
                </Reveal>
              ))}
            </dl>
          </div>

          {/* Banner 轮播图：位于文字内容下方 */}
          <div className="mt-12 md:mt-14">
            <HeroShowcase />
          </div>
        </div>
      </section>

      {/* ============ 十大非遗（竖排纵向列表） ============ */}
      <section id="top-ten" className="section relative scroll-mt-24">
        <div className="pattern-cloud" />
        <div className="page-shell relative">
          <Reveal className="section-head">
            <div>
              <span className="kicker">石家庄十大非遗文化</span>
              <h2 className="section-title">
                十项代表性非遗，读懂一座城的
                <span className="gradient-text"> 手艺与脾性</span>
              </h2>
              <p className="section-desc mt-4">
                自上而下依次浏览十项非遗，点击任意一条即可查看介绍、历史、传承与影像资料。
              </p>
            </div>
            <Link href="/heritage" className="btn btn-ghost">
              查看全部项目
            </Link>
          </Reveal>

          <div className="grid gap-3">
            {topTen.map((item, index) => (
              <Reveal key={item.id} delay={(index % 5) * 45}>
                <article className="glass glass-hover group flex flex-col gap-4 p-4 md:flex-row md:items-center md:p-5">
                  <span className="serif flex-none text-[20px] leading-none text-gold-300/85 md:w-10 md:text-center">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <Link
                    href={`/heritage/${item.id}`}
                    className="card-media relative h-40 w-full flex-none overflow-hidden rounded-xl md:h-24 md:w-40"
                    aria-label={`查看${item.name}详情`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.cover} alt={item.name} loading="lazy" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="chip chip-gold !text-[11.5px]">{item.level}</span>
                      <span className="chip !text-[11.5px]">{item.category}</span>
                      <span className="text-[12px] text-white/45">{item.region}</span>
                    </div>
                    <h3 className="serif mt-2 text-[17px] leading-7 text-white">
                      <Link
                        href={`/heritage/${item.id}`}
                        className="transition group-hover:text-gold-200"
                      >
                        {item.name}
                      </Link>
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-7 text-white/55">{item.summary}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3 md:flex-none md:flex-col md:items-end">
                    <CollectButton id={item.id} variant="chip" />
                    <Link
                      href={`/heritage/${item.id}`}
                      className="text-[13px] text-gold-300/90 transition hover:text-gold-200"
                    >
                      查看 →
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 文化精选内容 ============ */}
      <section id="contents" className="section scroll-mt-24">
        <div className="page-shell">
          <Reveal className="section-head">
            <div>
              <span className="kicker">文化精选</span>
              <h2 className="section-title">
                文章 · 图文 · <span className="gradient-text">影像</span>
              </h2>
            </div>
            <Link href="/news" className="btn btn-ghost">
              更多政策与新闻
            </Link>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-3">
            {highlightContent.map((content, index) => (
              <Reveal key={content.id} delay={index * 90}>
                <Link
                  href={content.href}
                  className="glass glass-hover card-media group flex h-full min-h-[300px] flex-col justify-end overflow-hidden p-6"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.cover}
                    alt={content.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2e1c11]/96 via-[#3a2314]/72 to-transparent" />
                  <div className="on-photo relative">
                    <span className="chip chip-gold !text-[11.5px]">{content.type}</span>
                    <h3 className="serif mt-3 text-[17px] leading-7 text-white">{content.title}</h3>
                    <p className="mt-2 text-[13px] leading-6 text-white/80">{content.desc}</p>
                    <span className="mt-3 block text-[11.5px] text-white/65">{content.meta}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {moreContent.map((content, index) => (
              <Reveal key={content.id} delay={index * 80}>
                <Link href={content.href} className="glass glass-hover flex items-center gap-4 p-4">
                  <div className="card-media relative h-16 w-24 flex-none overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={content.cover} alt={content.title} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11.5px] text-gold-300/80">{content.type}</span>
                    <h3 className="serif mt-1 truncate text-[14.5px] text-white/90">{content.title}</h3>
                    <p className="mt-1 line-clamp-1 text-[12px] text-white/45">{content.desc}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 用户评价 ============ */}
      <section id="reviews" className="section scroll-mt-24">
        <div className="page-shell">
          <Reveal className="section-head">
            <div>
              <span className="kicker">用户评价</span>
              <h2 className="section-title">
                他们在平台上<span className="gradient-text"> 找到了什么</span>
              </h2>
            </div>
            <span className="chip">示例评价 · 来自平台用户与非遗志愿者</span>
          </Reveal>
        </div>

        <div className="space-y-4 overflow-hidden">
          <div className="marquee-track gap-4">
            {[...marqueeRowOne, ...marqueeRowOne, ...marqueeRowOne, ...marqueeRowOne].map((item, index) => (
              <TestimonialCard key={`${item.id}-${index}`} {...item} />
            ))}
          </div>
          <div className="marquee-track gap-4 [animation-direction:reverse] [animation-duration:56s]">
            {[...marqueeRowTwo, ...marqueeRowTwo, ...marqueeRowTwo, ...marqueeRowTwo].map((item, index) => (
              <TestimonialCard key={`${item.id}-${index}`} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ 结尾 CTA ============ */}
      <section className="section pt-0">
        <div className="page-shell">
          <Reveal className="glass relative overflow-hidden p-10 text-center">
            <div className="pattern-ornament" />
            <div className="glow-orb left-1/2 top-0 h-64 w-64 -translate-x-1/2 bg-gold-400/18" />
            <div className="relative">
              <span className="kicker justify-center">开始你的非遗共创</span>
              <h2 className="section-title mt-4">
                读懂传统，<span className="gradient-text">再创造传统</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[14.5px] leading-8 text-white/65">
                登录后即可进行 AI 共创、收藏喜欢的非遗项目，并在个人中心查看你的收藏与浏览足迹。
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/create" className="btn btn-primary">
                  进入 AI 创作
                </Link>
                <Link href="/login" className="btn btn-ghost">
                  登录 / 注册
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function TestimonialCard({
  name,
  role,
  initial,
  content,
  rating,
}: {
  name: string;
  role: string;
  initial: string;
  content: string;
  rating: number;
}) {
  return (
    <article className="glass w-[330px] flex-none p-5 sm:w-[380px]">
      <div className="flex items-center gap-3">
        <span className="serif grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold-400/30 to-neon-500/25 text-[14px] text-gold-200">
          {initial}
        </span>
        <div>
          <strong className="block text-[14px] text-white/90">{name}</strong>
          <span className="text-[11.5px] text-white/45">{role}</span>
        </div>
        <span className="ml-auto text-[12px] text-gold-300/90">{'★'.repeat(rating)}</span>
      </div>
      <p className="mt-4 text-[13.5px] leading-7 text-white/65">{content}</p>
    </article>
  );
}
