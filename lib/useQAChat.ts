'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import type { AnswerStyle } from '@/lib/answerStyles';
import { streamChat, type ChatMessage, type ChatMeta, type ChatMode } from '@/lib/chatClient';

/**
 * 问答模式工作流的客户端状态机（对话框 / 悬浮球 / 全屏页共用一份逻辑）
 *
 * 对应工作流：规范化 → 意图路由(LLM) → 混合检索 → 提示词与风格组装 → 生成
 *            → 事实校验 → 输出后处理 → 会话记忆(/api/memory)
 */

export interface QAMessage extends ChatMessage {
  meta?: ChatMeta;
}

export interface QASession {
  id: string;
  title: string;
  style?: AnswerStyle;
  summary?: string;
  messages: QAMessage[];
  updatedAt: number;
}

export const QA_GREETING: QAMessage = {
  role: 'assistant',
  content:
    '你好，我是「非遗小助手」👋\n\n我可以解答石家庄非遗项目的来历、技艺细节与传播方式，也能按你要的风格改写内容。\n\n直接在下面提问就行，需要特定风格（教学讲解 / 短视频口播 / 儿童版）就在上方切换。',
};

const LOCAL_KEY = 'sjz-ich-ai-sessions';

export function useQAChat(options: { greeting?: QAMessage } = {}) {
  const greeting = options.greeting ?? QA_GREETING;
  const { user } = useAuth();
  const [sessions, setSessions] = useState<QASession[]>([]);
  const [activeId, setActiveId] = useState('');
  const [style, setStyle] = useState<AnswerStyle>('auto');
  const [streaming, setStreaming] = useState(false);
  const [mode, setMode] = useState<ChatMode | null>(null);
  const [memoryEngine, setMemoryEngine] = useState('本地浏览器');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadedRef = useRef(false);

  const createSession = useCallback(
    (messages: QAMessage[] = [greeting]): QASession => ({
      id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '新的对话',
      style: 'auto',
      messages,
      updatedAt: Date.now(),
    }),
    [greeting],
  );

  /* 载入会话记忆：登录用户读后端，未登录读浏览器 */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (user) {
        try {
          const res = await fetch(`/api/memory?user=${encodeURIComponent(user.account)}`);
          const json = (await res.json()) as { sessions?: QASession[] };
          if (!cancelled && json.sessions && json.sessions.length > 0) {
            setSessions(json.sessions);
            setActiveId(json.sessions[0].id);
            setStyle((json.sessions[0].style as AnswerStyle) ?? 'auto');
            setMemoryEngine('后端存储（按用户 · 自动摘要）');
            loadedRef.current = true;
            return;
          }
        } catch {
          /* 读不到就用本地 */
        }
      }

      let restored: QASession[] = [];
      try {
        const raw = window.localStorage.getItem(LOCAL_KEY);
        if (raw) restored = JSON.parse(raw) as QASession[];
      } catch {
        /* ignore */
      }
      if (!cancelled) {
        const list = restored.length > 0 ? restored : [createSession()];
        setSessions(list);
        setActiveId(list[0].id);
        setMemoryEngine(user ? '后端存储（新建会话）' : '本地浏览器（登录后可存后端）');
        loadedRef.current = true;
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, createSession]);

  /* 持久化：浏览器端防抖写入（登录用户走 /api/memory，会触发自动摘要） */
  useEffect(() => {
    if (!loadedRef.current || sessions.length === 0) return;
    const timer = window.setTimeout(async () => {
      if (user) {
        try {
          const res = await fetch('/api/memory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: user.account, sessions: sessions.slice(0, 12) }),
          });
          const json = (await res.json()) as { sessions?: QASession[] };
          if (json.sessions) {
            setSessions((prev) => (JSON.stringify(prev) === JSON.stringify(json.sessions) ? prev : json.sessions!));
            setMemoryEngine('后端存储（按用户 · 自动摘要）');
          }
        } catch {
          /* ignore */
        }
      } else {
        try {
          window.localStorage.setItem(LOCAL_KEY, JSON.stringify(sessions.slice(0, 12)));
        } catch {
          /* ignore */
        }
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [sessions, user]);

  const active = useMemo(
    () => sessions.find((session) => session.id === activeId) ?? sessions[0],
    [sessions, activeId],
  );

  const updateActive = useCallback(
    (updater: (session: QASession) => QASession) => {
      setSessions((prev) => prev.map((session) => (session.id === activeId ? updater(session) : session)));
    },
    [activeId],
  );

  const startNew = useCallback(() => {
    abortRef.current?.abort();
    const session = createSession();
    session.style = style;
    setSessions((prev) => [session, ...prev].slice(0, 12));
    setActiveId(session.id);
    setStreaming(false);
    setError(null);
  }, [createSession, style]);

  const removeSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const next = prev.filter((session) => session.id !== id);
        if (next.length === 0) {
          const fallback = createSession();
          setActiveId(fallback.id);
          return [fallback];
        }
        if (id === activeId) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId, createSession],
  );

  const send = useCallback(
    async (raw?: string) => {
      const question = (raw ?? '').trim();
      if (!question || streaming) return;

      const userMessage: QAMessage = { role: 'user', content: question };
      const baseMessages = [...(active?.messages ?? [greeting]), userMessage];

      updateActive((session) => ({
        ...session,
        title: session.messages.length <= 1 ? question.slice(0, 18) : session.title,
        style,
        messages: [...baseMessages, { role: 'assistant', content: '' }],
        updatedAt: Date.now(),
      }));
      setStreaming(true);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChat({
          messages: baseMessages,
          style,
          user: user?.account ?? null,
          signal: controller.signal,
          onMode: setMode,
          onMeta: (meta) => {
            setSessions((prev) =>
              prev.map((session) => {
                if (session.id !== activeId) return session;
                const messages = [...session.messages];
                const last = messages[messages.length - 1];
                messages[messages.length - 1] = { ...last, meta };
                return { ...session, messages, updatedAt: Date.now() };
              }),
            );
          },
          onDelta: (delta) => {
            setSessions((prev) =>
              prev.map((session) => {
                if (session.id !== activeId) return session;
                const messages = [...session.messages];
                const last = messages[messages.length - 1];
                messages[messages.length - 1] = { ...last, content: last.content + delta };
                return { ...session, messages, updatedAt: Date.now() };
              }),
            );
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '未知错误';
        setError(`智能体调用失败：${message}`);
        updateActive((session) => {
          const messages = [...session.messages];
          const last = messages[messages.length - 1];
          if (last?.role === 'assistant' && !last.content) {
            messages[messages.length - 1] = {
              ...last,
              content: '抱歉，智能体暂时无法应答，请稍后再试，或检查 .env.local 中的 DeepSeek 配置。',
            };
          }
          return { ...session, messages };
        });
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [active, activeId, greeting, streaming, style, updateActive, user],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  return {
    user,
    sessions,
    active,
    activeId,
    setActiveId,
    style,
    setStyle,
    streaming,
    mode,
    memoryEngine,
    error,
    send,
    stop,
    startNew,
    removeSession,
  };
}
