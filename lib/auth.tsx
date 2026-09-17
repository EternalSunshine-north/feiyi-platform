'use client';

/**
 * 演示用登录态：使用 localStorage 保存用户信息。
 * 生产环境请替换为真实的后端鉴权（如 NextAuth / 自建 JWT 接口）。
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface AuthUser {
  account: string;
  nickname: string;
  joinedAt: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** 首次从 localStorage 读取完成前为 false，避免闪烁与跳转误判 */
  ready: boolean;
  login: (account: string, nickname?: string) => AuthUser;
  logout: () => void;
}

const STORAGE_KEY = 'sjz-ich-user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const login = useCallback((account: string, nickname?: string) => {
    const next: AuthUser = {
      account,
      nickname: nickname?.trim() || account.split('@')[0] || '非遗体验官',
      joinedAt: Date.now(),
    };
    setUser(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    return next;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内部使用');
  return ctx;
}

export function avatarInitial(user: AuthUser | null) {
  if (!user) return '游';
  return user.nickname.slice(0, 1).toUpperCase();
}
