import type { Metadata } from 'next';
import '@/styles/tailwind.css';
import '@/styles/globals.scss';
import { AuthProvider } from '@/lib/auth';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import QAWidget from '@/components/QAWidget';
import IchBackdrop from '@/components/IchBackdrop';

export const metadata: Metadata = {
  title: '石家庄非遗文化 · AI 艺术共创平台',
  description:
    '融合石家庄非物质文化遗产展示与 AI 艺术创作的 Web 平台：非遗资料库、文化地图、政策新闻与 AI 智能体共创。',
  keywords: ['石家庄非遗', '非物质文化遗产', '井陉拉花', '常山战鼓', 'AI 共创', '文化地图'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          {/* 非遗动态背景（米色暖调，依据参考图色板生成） */}
          <IchBackdrop />
          <SiteHeader />
          <main className="pt-[72px]">{children}</main>
          <SiteFooter />
          {/* 桌面悬浮球：全站可用，点击展开 3:4 竖版问答浮窗（不切换路由） */}
          <QAWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
