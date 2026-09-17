import Link from 'next/link';

const columns = [
  {
    title: '探索平台',
    links: [
      { href: '/heritage', label: '非遗资料库' },
      { href: '/map', label: '文化地图' },
      { href: '/news', label: '相关非遗' },
      { href: '/create', label: 'AI 共创' },
    ],
  },
  {
    title: '热门项目',
    links: [
      { href: '/heritage/jingxing-lahua', label: '井陉拉花' },
      { href: '/heritage/changshan-zhangu', label: '常山战鼓' },
      { href: '/heritage/wuji-jianzhi', label: '无极剪纸' },
      { href: '/heritage/shijiazhuang-sixian', label: '石家庄丝弦' },
    ],
  },
  {
    title: '关于',
    links: [
      { href: '/news', label: '保护与传播倡议' },
      { href: '/me', label: '个人中心' },
      { href: '/login', label: '登录 / 注册' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/8 bg-ink-950/70">
      <div className="pattern-cloud" />
      <div className="fret-divider mx-auto max-w-[1240px] opacity-35" />
      <div className="page-shell relative grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-3">
            <span className="seal">遗</span>
            <strong className="serif text-[16px] text-white">石家庄非遗 · AI 艺术共创平台</strong>
          </div>
          <p className="mt-4 max-w-sm text-[13.5px] leading-7 text-white/55">
            以数字化档案整理石家庄非物质文化遗产，并用 AI 智能体把传统纹样、唱腔与技艺语汇带进当代创作。
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="serif text-[14px] tracking-[0.2em] text-gold-300/90">{col.title}</h4>
            <ul className="mt-4 grid gap-2.5">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-white/60 transition hover:text-gold-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="page-shell relative border-t border-white/8 py-5 text-[12px] text-white/35 md:flex md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} 石家庄非遗文化 · AI 艺术共创平台 · 教学演示项目</span>
      </div>
    </footer>
  );
}
