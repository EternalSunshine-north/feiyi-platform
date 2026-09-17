import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative grid min-h-[70vh] place-items-center overflow-hidden px-6">
      <div className="pattern-ornament" />
      <div className="glass relative max-w-lg p-10 text-center">
        <span className="serif text-[56px] leading-none text-gold-200">404</span>
        <h1 className="serif mt-4 text-[22px] text-white">这一页暂时没有非遗档案</h1>
        <p className="mt-3 text-[13.5px] leading-7 text-white/60">
          你访问的页面不存在，也可能该非遗项目还在整理中。可以先回到首页，或到非遗列表继续浏览。
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            返回首页
          </Link>
          <Link href="/heritage" className="btn btn-ghost">
            查看非遗列表
          </Link>
        </div>
      </div>
    </div>
  );
}
