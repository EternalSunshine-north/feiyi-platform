'use client';

import { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  /** 进场延迟（毫秒），用于同排元素错峰出现 */
  delay?: number;
  className?: string;
  id?: string;
  as?: 'div' | 'section' | 'li' | 'article';
}

/** 滚动进场动画容器：元素进入视口后淡入上移 */
export default function Reveal({ children, delay = 0, className = '', id, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setVisible(true);
      cleanup();
    };

    // 1) 挂载时已在视口内（首屏内容 / 超高视口）——立即显示，避免任何闪烁或不可见
    const rect = node.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < viewportH * 1.02 && rect.bottom > -120) {
      done = true;
      setVisible(true);
      return;
    }

    // 2) 滚动进场：IntersectionObserver + scroll 双重保险
    const onScroll = () => {
      const box = node.getBoundingClientRect();
      if (box.top < viewportH * 0.94 && box.bottom > 0) reveal();
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) reveal();
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
      );
      observer.observe(node);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    function cleanup() {
      observer?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }

    return cleanup;
  }, []);

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref as never}
      id={id}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
