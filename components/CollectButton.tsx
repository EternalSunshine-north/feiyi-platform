'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { toggleCollected, useCollectedIds } from '@/lib/store';

interface CollectButtonProps {
  id: string;
  variant?: 'chip' | 'solid' | 'icon';
  label?: string;
  className?: string;
}

/** 收藏按钮：未登录点击会跳转登录页 */
export default function CollectButton({
  id,
  variant = 'chip',
  label = '收藏',
  className = '',
}: CollectButtonProps) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const ids = useCollectedIds();
  const active = ids.includes(id);

  const onClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!ready) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    toggleCollected(id);
  };

  const base = 'inline-flex items-center gap-1.5 transition-all duration-300 select-none';
  const styles =
    variant === 'solid'
      ? `btn ${active ? 'btn-neon' : 'btn-ghost'} ${className}`
      : variant === 'icon'
        ? `${base} h-9 w-9 justify-center rounded-full border ${
            active
              ? 'border-gold-400/60 bg-gold-400/18 text-gold-200'
              : 'border-white/14 bg-ink-950/70 text-white/60 hover:border-gold-400/40 hover:text-gold-200'
          } ${className}`
        : `${base} rounded-full border px-3 py-1.5 text-[12.5px] ${
            active
              ? 'border-gold-400/55 bg-gold-400/15 text-gold-200'
              : 'border-white/14 bg-ink-950/60 text-white/70 hover:border-gold-400/40 hover:text-gold-200'
          } ${className}`;

  return (
    <button type="button" onClick={onClick} className={styles} aria-pressed={active}>
      <span aria-hidden="true">{active ? '★' : '☆'}</span>
      {variant !== 'icon' && <span>{active ? '已收藏' : label}</span>}
      {variant === 'icon' && <span className="sr-only">{active ? '已收藏' : label}</span>}
    </button>
  );
}
