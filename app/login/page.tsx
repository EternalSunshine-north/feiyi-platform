'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { user, ready, login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [account, setAccount] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [nextPath, setNextPath] = useState('/me');

  // 读取回跳地址（不使用 useSearchParams，避免静态渲染时要求 Suspense）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    if (next && next.startsWith('/')) setNextPath(next);
  }, []);

  useEffect(() => {
    if (ready && user) router.replace(nextPath);
  }, [ready, user, router, nextPath]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!account.trim()) {
      setError('请输入账号（手机号 / 邮箱 / 用户名）');
      return;
    }
    if (password.trim().length < 4) {
      setError('密码至少 4 位（演示环境不做真实校验）');
      return;
    }
    setError(null);
    login(account.trim(), mode === 'register' ? nickname : undefined);
    router.replace(nextPath);
  };

  return (
    <div className="relative grid min-h-[calc(100vh-72px)] place-items-center overflow-hidden px-6 py-16">
      <div className="pattern-ornament" />
      <div className="glow-orb left-1/4 top-10 h-72 w-72 bg-neon-500/22" />
      <div className="glow-orb right-1/4 bottom-10 h-72 w-72 bg-gold-400/18" />

      <div className="glass relative grid w-full max-w-4xl gap-0 overflow-hidden lg:grid-cols-2">
        {/* 左侧介绍 */}
        <div className="relative hidden flex-col justify-between border-r border-white/8 bg-ink-900/60 p-8 lg:flex">
          <div className="pattern-cloud" />
          <div className="relative">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-gold-400/40 bg-gradient-to-br from-gold-400/25 to-neon-500/20 text-[18px] font-bold text-gold-200">
              石
            </span>
            <h2 className="serif mt-6 text-[24px] leading-9 text-white">
              登录后，
              <br />
              把非遗变成你的创作素材
            </h2>
            <ul className="mt-6 space-y-3 text-[13.5px] leading-7 text-white/60">
              <li>· AI 创作与智能体问答</li>
              <li>· 收藏喜欢的非遗项目</li>
              <li>· 个人中心查看浏览足迹</li>
            </ul>
          </div>
          <p className="relative text-[12px] leading-6 text-white/35">
            演示环境：账号信息仅保存在本地浏览器（localStorage），不会上传服务器。
          </p>
        </div>

        {/* 右侧表单 */}
        <div className="p-8">
          <div className="flex gap-2">
            {(['login', 'register'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`flex-1 rounded-full border px-4 py-2 text-[13.5px] transition ${
                  mode === item
                    ? 'border-gold-400/55 bg-gold-400/15 text-gold-200'
                    : 'border-white/12 bg-white/4 text-white/65 hover:text-white'
                }`}
              >
                {item === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[13px] text-white/60">账号</span>
              <input
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="手机号 / 邮箱 / 用户名"
                className="field"
                autoComplete="username"
              />
            </label>

            {mode === 'register' && (
              <label className="block">
                <span className="mb-2 block text-[13px] text-white/60">昵称</span>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="展示在个人中心的昵称"
                  className="field"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-[13px] text-white/60">密码</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="演示环境随意填写（≥4 位）"
                className="field"
                autoComplete="current-password"
              />
            </label>

            {error && (
              <p className="rounded-xl border border-cinnabar-500/35 bg-cinnabar-500/10 px-4 py-2.5 text-[12.5px] text-cinnabar-300">
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary w-full justify-center">
              {mode === 'login' ? '登录并继续' : '注册并登录'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-[12.5px] text-white/45">
            <Link href="/" className="transition hover:text-gold-200">
              ← 以游客身份继续浏览
            </Link>
            <span>登录后可回跳：{nextPath}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
