'use client';

import { useEffect, useRef, useState } from 'react';
import RichText from '@/components/RichText';
import { ANSWER_STYLES, QUICK_PROMPTS } from '@/lib/answerStyles';
import { useQAChat, type QAMessage } from '@/lib/useQAChat';

/* ==========================================================================
 * 外部智能体接入位（AIAgentSlot）
 *
 * 此处接入外部智能体，无需实现具体对话逻辑：
 *   - 已接入的智能体：DeepSeek（服务端转发，入口见 src/app/api/chat/route.ts）
 *   - 对话链路即「问答模式工作流」：规范化 → 意图路由(LLM) → 混合检索(RAG)
 *     → 提示词与风格模板组装 → 生成 → 事实校验 → 输出后处理 → 会话记忆(/api/memory)
 *   - 若要替换为其他智能体（扣子 / Dify / 百炼 / 自建服务），
 *     只需修改 AGENT_ENDPOINT 与请求体字段，页面其余部分不需要改动
 *   - 全站还有一个可拖动的「桌面悬浮球」（src/components/QAWidget.tsx），
 *     与这里共用同一套 useQAChat 状态机与会话记忆
 * ========================================================================== */
const AGENT_ENDPOINT = '/api/chat';
const AGENT_NAME = 'deepseek';

export default function AIAgentSlot() {
  const chat = useQAChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [chat.active?.messages, chat.streaming]);

  const submit = () => {
    if (!input.trim()) return;
    void chat.send(input);
    setInput('');
  };

  return (
    <div
      id="ai-agent-container"
      data-agent={AGENT_NAME}
      data-endpoint={AGENT_ENDPOINT}
      data-workflow="qa-rag"
      className="grid gap-5 lg:grid-cols-[260px_1fr]"
    >
      {/* 历史记录列表 */}
      <aside className="glass flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="serif text-[15px] text-white/90">对话历史</h3>
          <button
            type="button"
            onClick={chat.startNew}
            className="rounded-full border border-white/14 bg-white/5 px-3 py-1 text-[12px] text-white/75 transition hover:border-gold-400/40 hover:text-gold-200"
          >
            + 新对话
          </button>
        </div>
        <div className="no-scrollbar -mr-1 flex max-h-[220px] flex-col gap-1.5 overflow-y-auto pr-1 lg:max-h-[420px]">
          {chat.sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center gap-2 rounded-xl border px-3 py-2.5 transition ${
                session.id === chat.activeId
                  ? 'border-gold-400/45 bg-gold-400/10'
                  : 'border-white/8 bg-white/3 hover:border-white/18'
              }`}
            >
              <button
                type="button"
                onClick={() => chat.setActiveId(session.id)}
                className="flex-1 text-left"
              >
                <span className="block truncate text-[13px] text-white/85">{session.title}</span>
                <span className="mt-0.5 block text-[11px] text-white/35">
                  {new Date(session.updatedAt).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </button>
              <button
                type="button"
                aria-label="删除该对话"
                onClick={() => chat.removeSession(session.id)}
                className="text-[13px] text-white/25 opacity-0 transition group-hover:opacity-100 hover:text-cinnabar-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-auto space-y-1 rounded-xl border border-white/8 bg-ink-950/60 p-3 text-[11.5px] leading-6 text-white/45">
          状态：
          <span className={chat.mode === 'deepseek' ? 'text-jade-300' : 'text-gold-300'}>
            {chat.mode === 'deepseek' ? '在线' : chat.mode ? '本地知识库' : '等待首次对话'}
          </span>
        </div>
      </aside>

      {/* 对话区 */}
      <section className="glass flex min-h-[620px] flex-col overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="relative grid h-10 w-10 place-items-center rounded-2xl border border-gold-400/40 bg-gradient-to-br from-gold-400/25 to-neon-500/25 text-[16px]">
              🪶
              <span className="absolute -inset-1 rounded-2xl border border-jade-400/20 pulse-glow" />
            </span>
            <div>
              <strong className="serif block text-[15px] text-white">非遗文化问答</strong>
              <small className="text-[11.5px] text-white/45">
                石家庄非遗文化问答 · 支持教学讲解 / 短视频口播 / 儿童版
              </small>
            </div>
          </div>
          <span className={`chip ${chat.mode === 'deepseek' ? 'chip-jade' : 'chip-gold'} !text-[11.5px]`}>
            <i className="h-1.5 w-1.5 rounded-full bg-current" />
            {chat.mode === 'deepseek' ? 'DeepSeek' : chat.mode ? '本地知识库' : '待连接'}
          </span>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-white/8 bg-ink-950/40 px-5 py-3">
          <span className="text-[12px] text-white/45">回答风格</span>
          {ANSWER_STYLES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => chat.setStyle(item.id)}
              title={item.hint}
              className={`rounded-full border px-3 py-1 text-[12px] transition ${
                chat.style === item.id
                  ? 'border-gold-400/55 bg-gold-400/15 text-gold-200'
                  : 'border-white/12 bg-white/4 text-white/60 hover:border-white/25 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <span className="ml-auto text-[11.5px] text-white/35">
            {ANSWER_STYLES.find((item) => item.id === chat.style)?.hint}
          </span>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
          {(chat.active?.messages ?? []).map((message, index) => (
            <Bubble
              key={index}
              message={message}
              pending={chat.streaming && index === (chat.active?.messages.length ?? 0) - 1}
            />
          ))}

          {(chat.active?.messages.length ?? 0) <= 1 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {QUICK_PROMPTS[chat.style].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void chat.send(suggestion)}
                  className="rounded-full border border-white/12 bg-white/4 px-3.5 py-2 text-[12.5px] text-white/70 transition hover:border-gold-400/40 hover:bg-gold-400/10 hover:text-gold-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {chat.error && (
          <div className="mx-5 mb-2 rounded-xl border border-cinnabar-500/35 bg-cinnabar-500/10 px-4 py-2.5 text-[12.5px] text-cinnabar-300">
            {chat.error}
          </div>
        )}

        <form
          className="border-t border-white/8 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              rows={2}
              placeholder="例如：正定有哪些非遗项目？它们之间有什么共同点？（Enter 发送，Shift + Enter 换行）"
              className="field min-h-[56px] flex-1 resize-none"
            />
            {chat.streaming ? (
              <button type="button" onClick={chat.stop} className="btn btn-ghost !py-3">
                停止生成
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="btn btn-primary !py-3">
                发送
              </button>
            )}
          </div>
          <p className="mt-2 text-[11.5px] text-white/35">
            回答由 AI 生成，文化细节请以传承人说明与官方资料为准。
          </p>
        </form>
      </section>
    </div>
  );
}

function Bubble({ message, pending }: { message: QAMessage; pending?: boolean }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span
        className={`mt-1 grid h-9 w-9 flex-none place-items-center rounded-2xl text-[14px] ${
          isUser
            ? 'border border-white/12 bg-white/6 text-white/80'
            : 'border border-gold-400/40 bg-gradient-to-br from-gold-400/25 to-neon-500/20'
        }`}
      >
        {isUser ? '我' : '🪶'}
      </span>
      <div className={`max-w-[86%] space-y-2 ${isUser ? '' : 'flex-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-[13.5px] leading-7 ${
            isUser
              ? 'rounded-tr-sm border border-white/12 bg-white/7 text-white/88'
              : 'rounded-tl-sm border border-gold-400/18 bg-ink-900/70 text-white/82'
          }`}
        >
          {pending && !message.content ? (
            <span className="inline-flex gap-1.5 py-1">
              <i className="h-2 w-2 animate-bounce rounded-full bg-gold-300 [animation-delay:0ms]" />
              <i className="h-2 w-2 animate-bounce rounded-full bg-gold-300 [animation-delay:140ms]" />
              <i className="h-2 w-2 animate-bounce rounded-full bg-gold-300 [animation-delay:280ms]" />
            </span>
          ) : (
            <RichText text={message.content} />
          )}
        </div>

      </div>
    </div>
  );
}
