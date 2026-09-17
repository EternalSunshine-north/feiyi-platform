'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { avatarInitial, useAuth } from '@/lib/auth';

const NAV = [
  { href: '/', label: '首页' },
  { href: '/create', label: 'AI 创作' },
  { href: '/map', label: '文化地图' },
  { href: '/heritage', label: '非遗列表' },
  { href: '/news', label: '相关非遗' },
  { href: '/me', label: '个人中心' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // 点击菜单外部 / 按 Esc 关闭用户菜单
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/10 bg-ink-950/80 backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <div className="page-shell flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-gold-400/40 bg-gradient-to-br from-gold-400/25 to-neon-500/20 text-[15px] font-bold text-gold-200 shadow-[0_0_24px_rgba(243,193,121,0.22)]">
            石
            <span className="absolute inset-0 rounded-xl border border-white/10 transition-transform duration-500 group-hover:scale-110" />
          </span>
          <span className="leading-tight">
            <strong className="serif block text-[15px] tracking-wide text-white">
              石家庄非遗 · AI 共创
            </strong>
            <small className="block text-[11px] tracking-[0.24em] text-white/45">
              INTANGIBLE CULTURE × AI
            </small>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative rounded-full px-4 py-2 text-[14px] transition-colors duration-300 ${
                isActive(item.href)
                  ? 'text-gold-200'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {item.label}
              <span
                className={`absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-gold-400 to-neon-500 transition-opacity duration-300 ${
                  isActive(item.href) ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!ready ? (
            <span className="hidden h-9 w-24 animate-pulse rounded-full bg-white/10 sm:block" />
          ) : user ? (
            <div ref={userMenuRef} className="relative flex items-center">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 py-1.5 pl-1.5 pr-3.5 text-[13px] text-white/85 transition hover:border-gold-400/40 hover:bg-gold-400/10"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-jade-400 to-neon-500 text-[12px] font-bold text-ink-950">
                  {avatarInitial(user)}
                </span>
                <span className="max-w-[92px] truncate">{user.nickname}</span>
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="glass animate-rise !absolute left-[20px] top-full z-[60] mt-2 w-48 -translate-x-1/2 overflow-hidden p-2 text-[13px] max-sm:left-auto max-sm:right-0 max-sm:translate-x-0"
                >
                  <Link
                    href="/me"
                    role="menuitem"
                    className="block rounded-lg px-3 py-2 text-white/80 transition hover:bg-white/8 hover:text-white"
                  >
                    个人中心
                  </Link>
                  <Link
                    href="/me#collections"
                    role="menuitem"
                    className="block rounded-lg px-3 py-2 text-white/80 transition hover:bg-white/8 hover:text-white"
                  >
                    我的收藏
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      router.push('/');
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-cinnabar-300 transition hover:bg-cinnabar-500/12"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary hidden !px-5 !py-2 text-[13.5px] sm:inline-flex">
              登录 / 注册
            </Link>
          )}

          <button
            type="button"
            aria-label="打开导航"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/12 bg-white/5 text-white/80 lg:hidden"
          >
            <span className="relative block h-3 w-5">
              <span
                className={`absolute left-0 h-[2px] w-5 bg-current transition-all duration-300 ${
                  open ? 'top-1.5 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-[2px] w-5 bg-current transition-all duration-300 ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 h-[2px] w-5 bg-current transition-all duration-300 ${
                  open ? 'top-1.5 -rotate-45' : 'top-3'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-rise border-t border-white/8 bg-ink-950/95 backdrop-blur-xl lg:hidden">
          <div className="page-shell grid gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-3 text-[15px] transition ${
                  isActive(item.href)
                    ? 'bg-gold-400/12 text-gold-200'
                    : 'text-white/75 hover:bg-white/6'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <Link href="/login" className="btn btn-primary mt-2 justify-center">
                登录 / 注册
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
