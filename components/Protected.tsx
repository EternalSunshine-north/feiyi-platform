'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

interface ProtectedProps {
  children: React.ReactNode;
  /** 未登录时的说明文案 */
  hint?: string;
}

/**
 * 登录守卫：AI 创作、收藏、个人中心等内容需要登录后使用。
 * 未登录时自动跳转到 /login 并带上回跳地址。
 */
export default function Protected({ children, hint = '该功能需要登录后使用' }: ProtectedProps) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready || user) return;
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const next = encodeURIComponent(`${pathname}${search}`);
    router.replace(`/login?next=${next}`);
  }, [ready, user, router, pathname]);

  if (!ready || !user) {
    return (
      <div className="page-shell grid min-h-[52vh] place-items-center pt-28">
        <div className="glass grid max-w-md place-items-center gap-4 p-10 text-center">
          <span className="grid h-12 w-12 animate-pulse place-items-center rounded-full border border-gold-400/40 bg-gold-400/10 text-gold-200">
            ✦
          </span>
          <p className="serif text-[16px] text-white/90">{hint}</p>
          <p className="text-[13px] text-white/50">正在校验登录状态，未登录将自动跳转到登录页…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
