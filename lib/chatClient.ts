'use client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatMode = 'deepseek' | 'local' | 'deepseek-fallback' | 'error';

export interface ChatMeta {
  intent?: string;
  intentLabel?: string;
  intentEngine?: string;
  route?: string;
  style?: string;
  styleLabel?: string;
  engine?: string;
  sources?: { id: string; name: string; href: string }[];
  verify?: { checked?: string[]; unsupported?: string[]; numbers?: string[]; action?: string };
}

interface StreamChatOptions {
  messages: ChatMessage[];
  /** 回答风格模板：teaching / shortvideo / kids / auto */
  style?: string;
  /** 登录用户账号，用于按用户读写会话记忆 */
  user?: string | null;
  onDelta: (delta: string) => void;
  onMeta?: (meta: ChatMeta) => void;
  onMode?: (mode: ChatMode) => void;
  signal?: AbortSignal;
}

/**
 * 与服务端 /api/chat 通信（服务端再转发到 DeepSeek，避免在浏览器暴露 API Key）。
 * 服务端统一输出 SSE：data: {"delta":"..."} … data: [DONE]
 */
export async function streamChat({ messages, style, user, onDelta, onMeta, onMode, signal }: StreamChatOptions) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, style, user: user ?? undefined }),
    signal,
  });

  const mode = (response.headers.get('x-ai-mode') ?? 'local') as ChatMode;
  onMode?.(mode);

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `请求失败：${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') return mode;
      try {
        const json = JSON.parse(payload) as { delta?: string; meta?: ChatMeta };
        if (json.delta) onDelta(json.delta);
        if (json.meta) onMeta?.(json.meta);
      } catch {
        /* 忽略异常分片 */
      }
    }
  }

  return mode;
}
