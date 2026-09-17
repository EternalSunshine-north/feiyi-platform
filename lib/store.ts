'use client';

/**
 * 轻量本地存储 store（收藏 / 浏览历史）
 * 使用 useSyncExternalStore 订阅，保证多组件之间状态同步且不会出现水合不一致。
 * 说明：演示项目使用 localStorage 保存用户行为；接入后端时替换为接口请求即可。
 */

import { useMemo, useSyncExternalStore } from 'react';

type Json = string;

function createJsonStore<T>(key: string, fallback: T) {
  let snapshot: Json = JSON.stringify(fallback);
  let loaded = false;
  const listeners = new Set<() => void>();

  const read = () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) snapshot = raw;
    } catch {
      /* localStorage 不可用时忽略 */
    }
    loaded = true;
  };

  const emit = () => listeners.forEach((l) => l());

  return {
    subscribe(listener: () => void) {
      if (!loaded) read();
      listeners.add(listener);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          read();
          emit();
        }
      };
      window.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', onStorage);
      };
    },
    get(): Json {
      if (!loaded) read();
      return snapshot;
    },
    getServer(): Json {
      return JSON.stringify(fallback);
    },
    set(next: T) {
      snapshot = JSON.stringify(next);
      try {
        window.localStorage.setItem(key, snapshot);
      } catch {
        /* 忽略写入失败 */
      }
      emit();
    },
  };
}

export interface HistoryRecord {
  id: string;
  type: '非遗项目' | '政策新闻' | '地图点位' | 'AI 共创';
  title: string;
  href: string;
  cover?: string;
  at: number;
}

const collected = createJsonStore<string[]>('sjz-ich-collected', []);
const history = createJsonStore<HistoryRecord[]>('sjz-ich-history', []);

/* ---------------- 收藏 ---------------- */

export function useCollectedIds(): string[] {
  const raw = useSyncExternalStore(collected.subscribe, collected.get, collected.getServer);
  return useMemo(() => {
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }, [raw]);
}

export function toggleCollected(id: string) {
  const current = parse<string[]>(collected.get(), []);
  const next = current.includes(id) ? current.filter((x) => x !== id) : [id, ...current];
  collected.set(next);
  return next.includes(id);
}

export function clearCollected() {
  collected.set([]);
}

/* ---------------- 浏览历史 ---------------- */

export function useHistoryRecords(): HistoryRecord[] {
  const raw = useSyncExternalStore(history.subscribe, history.get, history.getServer);
  return useMemo(() => {
    const list = parse<HistoryRecord[]>(raw, []);
    return [...list].sort((a, b) => b.at - a.at);
  }, [raw]);
}

export function pushHistory(record: Omit<HistoryRecord, 'at'>) {
  const current = parse<HistoryRecord[]>(history.get(), []);
  const next = [{ ...record, at: Date.now() }, ...current.filter((x) => x.id !== record.id)].slice(0, 40);
  history.set(next);
}

export function clearHistory() {
  history.set([]);
}

function parse<T>(raw: string, fallback: T): T {
  try {
    const value = JSON.parse(raw);
    return (value ?? fallback) as T;
  } catch {
    return fallback;
  }
}
