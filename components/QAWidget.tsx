'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import RichText from '@/components/RichText';
import { ANSWER_STYLES, QUICK_PROMPTS } from '@/lib/answerStyles';
import { useQAChat } from '@/lib/useQAChat';

/**
 * 桌面悬浮球 · 问答模式工作流
 *
 * 需求：
 *  - 悬浮球固定在右下角（不可拖动，避免误拖），点击展开一个「独立网页界面」式的浮窗；
 *  - 浮窗固定 竖版 3:4 比例；
 *  - 展开时不切换页面路由（纯浮层，首页/列表页都停在原地）。
 */

// 早期版本允许拖动并保存位置，这里保留键名用于清理历史记录
const LEGACY_POS_KEY = 'sjz-ich-qa-ball';
const BALL_SIZE = 60;
const GAP = 14;
const PANEL_MAX_W = 402;

/** 这些页面本身就有完整问答界面 / 是登录页，不再叠加悬浮球 */
const HIDDEN_PREFIXES = ['/login', '/create'];

export default function QAWidget() {
  const pathname = usePathname();
  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  const [open, setOpen] = useState(false);
  const [panelSize, setPanelSize] = useState({ width: PANEL_MAX_W, height: (PANEL_MAX_W * 4) / 3 });

  const chat = useQAChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /* ---------- 3:4 浮窗尺寸：既保持比例，又保证不出屏 ---------- */
  useEffect(() => {
    const compute = () => {
      const maxWidth = Math.min(PANEL_MAX_W, window.innerWidth - 32, ((window.innerHeight * 0.8) * 3) / 4);
      const width = Math.max(250, maxWidth);
      setPanelSize({ width, height: (width * 4) / 3 });
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  /* 悬浮球固定在右下角：清理早期版本保存过的拖动位置 */
  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_POS_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  /* ---------- 浮窗位置：固定在悬浮球上方（右下角），并保证不出屏 ---------- */
  const panelStyle = useMemo(() => {
    const bottom = BALL_SIZE + 96 + GAP;
    const viewportHeight = typeof window === 'undefined' ? 900 : window.innerHeight;
    const fitsAbove = bottom + panelSize.height <= viewportHeight - GAP;
    return {
      right: 28,
      bottom: fitsAbove ? bottom : GAP,
      width: panelSize.width,
      height: panelSize.height,
    };
  }, [panelSize]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [chat.active?.messages, chat.streaming, open]);

  const submit = () => {
    if (!input.trim()) return;
    void chat.send(input);
    setInput('');
  };

  if (hidden) return null;

  return (
    <>
      <button
        type="button"
        data-qa-ball="true"
        aria-label={open ? '收起非遗问答助手' : '打开非遗问答助手'}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          right: 28,
          bottom: 96,
          width: BALL_SIZE,
          height: BALL_SIZE,
        }}
        className="group fixed z-[1200] grid select-none place-items-center rounded-full border-2 border-[#fff7ea]/75 bg-gradient-to-br from-[#b94a33] via-[#d0684c] to-[#c89241] text-[22px] text-[#fff7ea] shadow-[0_12px_30px_rgba(104,74,46,0.42)] backdrop-blur-md transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        <span className="pointer-events-none absolute inset-0 rounded-full border border-[#ffe9c8]/45 pulse-glow" />
        <span className="pointer-events-none relative">{open ? '✕' : '🪶'}</span>
        {!open && (
          <span className="pointer-events-none absolute -bottom-6 whitespace-nowrap rounded-full border border-white/12 bg-ink-950/85 px-2 py-0.5 text-[10.5px] text-white/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            非遗问答
          </span>
        )}
      </button>

      {open && (
        <section
          data-qa-panel="true"
          style={panelStyle}
          className="glass animate-rise !fixed z-[1190] flex flex-col overflow-hidden !rounded-2xl border-gold-400/25 shadow-[0_28px_80px_rgba(0,0,0,0.6)]"
        >
          <header className="flex items-center gap-2 border-b border-white/10 bg-ink-950/60 px-3 py-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-lg border border-gold-400/40 bg-gradient-to-br from-gold-400/25 to-neon-500/25 text-[12px]">
              🪶
            </span>
            <div className="min-w-0 flex-1">
              <strong className="serif block truncate text-[13px] text-white">非遗问答助手</strong>
              <span className="block truncate text-[10.5px] text-white/45">
                问答模式工作流 · {chat.mode === 'deepseek' ? 'DeepSeek 在线' : chat.mode ? '本地知识库' : '待连接'}
              </span>
            </div>
            <button
              type="button"
              onClick={chat.startNew}
              className="rounded-full border border-white/12 bg-white/5 px-2 py-0.5 text-[10.5px] text-white/65 transition hover:text-gold-200"
            >
              新对话
            </button>
            <Link
              href="/create"
              title="在新页面打开完整 AI 创作 / 工作流"
              className="rounded-full border border-white/12 bg-white/5 px-2 py-0.5 text-[10.5px] text-white/65 transition hover:text-gold-200"
            >
              完整版 ↗
            </Link>
            <button
              type="button"
              aria-label="收起"
              onClick={() => setOpen(false)}
              className="grid h-5 w-5 place-items-center rounded text-[12px] text-white/45 transition hover:text-white"
            >
              —
            </button>
          </header>

          <div className="flex flex-wrap items-center gap-1.5 border-b border-white/8 bg-ink-950/35 px-3 py-1.5">
            {ANSWER_STYLES.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.hint}
                onClick={() => chat.setStyle(item.id)}
                className={`rounded-full border px-2 py-0.5 text-[10.5px] transition ${
                  chat.style === item.id
                    ? 'border-gold-400/55 bg-gold-400/15 text-gold-200'
                    : 'border-white/10 bg-white/4 text-white/55 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {(chat.active?.messages ?? []).map((message, index) => (
              <div key={index} className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <span
                  className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-lg text-[11px] ${
                    message.role === 'user'
                      ? 'border border-white/12 bg-white/6 text-white/75'
                      : 'border border-gold-400/40 bg-gradient-to-br from-gold-400/25 to-neon-500/20'
                  }`}
                >
                  {message.role === 'user' ? '我' : '🪶'}
                </span>
                <div className={`min-w-0 max-w-[86%] space-y-1 ${message.role === 'user' ? '' : 'flex-1'}`}>
                  <div
                    className={`rounded-xl px-2.5 py-2 text-[12.5px] leading-6 ${
                      message.role === 'user'
                        ? 'rounded-tr-sm border border-white/12 bg-white/7 text-white/88'
                        : 'rounded-tl-sm border border-gold-400/18 bg-ink-900/70 text-white/82'
                    }`}
                  >
                    {chat.streaming &&
                    index === (chat.active?.messages.length ?? 0) - 1 &&
                    message.role === 'assistant' &&
                    !message.content ? (
                      <span className="inline-flex gap-1 py-1">
                        <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-300 [animation-delay:0ms]" />
                        <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-300 [animation-delay:140ms]" />
                        <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-300 [animation-delay:280ms]" />
                      </span>
                    ) : (
                      <RichText text={message.content} />
                    )}
                  </div>

                  {message.role === 'assistant' && message.meta && (
                    <div className="flex flex-wrap gap-1 px-0.5">
                      {message.meta.intentLabel && (
                        <span className="chip !py-0 !text-[9.5px]">意图：{message.meta.intentLabel}</span>
                      )}
                      {message.meta.styleLabel && (
                        <span className="chip chip-gold !py-0 !text-[9.5px]">{message.meta.styleLabel}</span>
                      )}
                      {(message.meta.sources ?? []).map((source) => (
                        <a
                          key={source.id}
                          href={source.href}
                          className="chip chip-jade !py-0 !text-[9.5px] transition hover:text-white"
                        >
                          来源：{source.name} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(chat.active?.messages.length ?? 0) <= 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_PROMPTS[chat.style].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void chat.send(suggestion)}
                    className="rounded-full border border-white/12 bg-white/4 px-2.5 py-1 text-[11px] text-white/65 transition hover:border-gold-400/40 hover:text-gold-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {chat.error && (
            <p className="mx-3 mb-1 rounded-lg border border-cinnabar-500/35 bg-cinnabar-500/10 px-2.5 py-1.5 text-[11px] text-cinnabar-300">
              {chat.error}
            </p>
          )}

          <div className="border-t border-white/10 bg-ink-950/50 p-2.5">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    submit();
                  }
                }}
                rows={1}
                placeholder="问点非遗的事…（Enter 发送 / Shift+Enter 换行）"
                className="field max-h-20 min-h-[38px] flex-1 resize-none !py-2 text-[12.5px]"
              />
              {chat.streaming ? (
                <button type="button" onClick={chat.stop} className="btn btn-ghost !px-3 !py-2 text-[12px]">
                  停止
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!input.trim()}
                  className="btn btn-primary !px-3.5 !py-2 text-[12px]"
                >
                  发送
                </button>
              )}
            </div>
            <p className="mt-1.5 text-[10px] text-white/30">回答由 AI 生成，文化细节请以官方资料为准。</p>
          </div>
        </section>
      )}
    </>
  );
}
