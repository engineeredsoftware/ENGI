"use client";

import React, { useEffect, useRef, memo, useCallback } from 'react';
// Icons for quick-reaction bar (lucide-react keeps bundle small & crisp)
import { ThumbsUp, Lightbulb, Bug, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import SourceDivider from '@/components/conversations/ConversationsSourceDivider/ConversationsSourceDivider';

// Re-export types from index for convenience (avoids duplication).
export interface Token {
  id: string;
  type: 'evidence_document' | 'settle_delivery' | 'attachment' | 'source' | 'command';
  text: string;
  data: any;
}

export interface Message {
  id: string;
  type: 'agent' | 'user' | 'divider';
  content: string;
  timestamp: Date;
  source?: { repoSlug: string; branch?: string | null; commitSha?: string | null };
  status?: 'sending' | 'sent' | 'error';
  errorText?: string;
  tokens?: Token[];
  actions?: {
    type: 'codeChange' | 'prCreated' | 'issueCreated';
    title: string;
    description?: string;
    url?: string;
  }[];
  // Whether content is still streaming; renders typing indicator
  isStreaming?: boolean;
}

// ---------------------------------------------------------------------------
// Inline assets
// ---------------------------------------------------------------------------
// Sub-2 kB “pop” sound encoded in base64 (44-byte mono WAV, generated once).
const POP_AUDIO_B64 =
  'data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YRAAAAAA////AA==';

interface Props {
  messages: Message[];
  renderTokenInMessage: (content: string, tokens?: Token[]) => string;
  embedProcessLogs?: boolean;
  processLogOutputDetails?: Record<string, unknown>;
  /** When true, auto-scrolls to newest unless user scrolled away */
  enableAutoScroll?: boolean;
  /** Callback to set a flag when user manually scrolls */
  onUserScroll?: (scrolled: boolean) => void;
  /** Called when user overscrolls past top to fetch older messages */
  onLoadMore?: () => Promise<void> | void;
  /** Whether a typing indicator for the assistant should be shown */
  isAssistantTyping?: boolean;
}

/**
 * MessageWaterfall – List of chat bubbles displayed newest-to-oldest near the
 * send box (flex-col-reverse).  Handles:
 *   • role colour / alignment
 *   • divider for repo source changes
 *   • actions links under assistant messages
 *   • typing indicator when assistant is streaming
 *
 * Auto-scrolls while the user has not manually scrolled away.
 */
const ConversationsMessageWaterfall = memo(function ConversationsMessageWaterfall({
  messages,
  renderTokenInMessage,
  embedProcessLogs: _embedProcessLogs,
  processLogOutputDetails: _processLogOutputDetails,
  enableAutoScroll = true,
  onUserScroll,
  onLoadMore,
  isAssistantTyping,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Audio element for bubble pop
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-highlight bubble when URL hash references a specific message
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash.startsWith('#msg-')) return;
    const targetId = hash.slice(5);
    // Wait for next paint so DOM nodes are in place
    requestAnimationFrame(() => {
      const el = document.getElementById(`msg-${targetId}`);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        el.classList.add('msg-highlight');
        setTimeout(() => el.classList.remove('msg-highlight'), 3000);
      }
    });
  }, []);

  // Play pop when new assistant bubble fully arrives (not streaming)
  const lastMsgIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(POP_AUDIO_B64);
      audioRef.current.volume = 0.25;
    }
    const last = messages[0]; // newest due to reverse order
    if (last && last.id !== lastMsgIdRef.current && last.type === 'agent' && !last.isStreaming) {
      lastMsgIdRef.current = last.id;
      // respect reduced motion (also indicates reduced sensory) and mute if set
      const prefersReduced =
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReduced) {
        // cloneNode to allow overlapping plays
        const audioClone = audioRef.current.cloneNode(true) as HTMLAudioElement;
        audioClone.play().catch(() => {});
      }
    }
  }, [messages]);

  // Auto scroll when new message arrives and user not scrolled.
  useEffect(() => {
    if (!enableAutoScroll) return;
    if (!containerRef.current) return;
    const el = containerRef.current;
    const atBottom = el.scrollTop <= 0; // because flex-col-reverse
    if (atBottom) {
      el.scrollTop = 0;
    }
  }, [messages, enableAutoScroll]);

  // Handler to detect user scroll away from bottom (inverse because reversed)
  const handleScroll = useCallback<React.UIEventHandler<HTMLDivElement>>(
    (e) => {
      const { scrollTop } = e.currentTarget;

      // Notify parent that user manually scrolled away from bottom (remember: reversed list so bottom => scrollTop <= 0)
      if (onUserScroll) {
        onUserScroll(!(scrollTop <= 0));
      }

      // Pull-to-reveal older history when overscrolled >30 px past the top
      if (onLoadMore && scrollTop < -30) {
        onLoadMore();
      }
    },
    [onUserScroll, onLoadMore],
  );

  return (
    <div
      id="message-waterfall-container"
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 flex flex-col-reverse space-y-reverse space-y-4 custom-scrollbar"
    >
      <AnimatePresence initial={false}>
        {isAssistantTyping && (
          <motion.div
            key="typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="self-end flex items-end gap-1 pr-2 mb-1"
            role="status"
            aria-label="Assistant is typing"
            aria-live="polite"
          >
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </motion.div>
        )}

        {(function() {
          const OUTPUT: Message[] = [];
          const MERGE_WINDOW_MS = 45000;
          messages.forEach((m) => {
            // Ensure timestamps are Date instances (in case messages came from JSON).
            const mTs = m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp as unknown as string);
            const last = OUTPUT[OUTPUT.length - 1];
            if (
              last &&
              m.type === 'agent' &&
              last.type === 'agent' &&
              !last.isStreaming &&
              !m.isStreaming &&
              Math.abs(mTs.getTime() - last.timestamp.getTime()) < MERGE_WINDOW_MS &&
              !m.actions && !last.actions
            ) {
              // merge contents with newline
              last.content += `\n${m.content}`;
            } else {
              OUTPUT.push({ ...m, timestamp: mTs });
            }
          });
          return OUTPUT;
        })().map((message) => {
          if (message.type === 'divider' && message.source) {
            return (
              <SourceDivider
                key={message.id}
                repoSlug={message.source.repoSlug}
                branch={message.source.branch}
                commitSha={message.source.commitSha}
              />
            );
          }

          const isUser = message.type === 'user';
          const sideCls = isUser ? 'self-start' : 'self-end';
          const bubbleCls = isUser ? 'bg-gray-700/50' : 'bg-emerald-500/20';

          const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

          return (
            <motion.div
              key={message.id}
              id={`msg-${message.id}`}
              data-msg-type={message.type}
              initial={prefersReduced ? {} : { opacity: 0, y: 6, scale: 0.98 }}
              animate={prefersReduced ? {} : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
              className={`bubble-wrapper ${sideCls} max-w-2xl`}
            >
              <div className={`group relative rounded-lg px-3 py-2 space-y-2 ${bubbleCls}`}>
                {message.isStreaming && (
                  <div className="pipeline-progress" />
                )}
                <div
                  className="message-content text-sm leading-relaxed prose prose-invert max-w-none"
                  role={message.isStreaming ? 'status' : undefined}
                  aria-live={message.isStreaming ? 'polite' : undefined}
                  dangerouslySetInnerHTML={{
                    __html: renderTokenInMessage(message.content, message.tokens),
                  }}
                />

                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-col border-t border-white/10 pt-2 space-y-1 text-xs">
                    {message.actions.map((a, i) => (
                      <a
                        key={i}
                        href={a.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-300 hover:underline"
                      >
                        {a.title}
                      </a>
                    ))}
                  </div>
                )}
                {/* Quick reaction bar */}
                <div
                  className="absolute -right-6 top-1/2 -translate-y-1/2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                >
                  {(
                    [
                      { key: 'like', label: 'Like', icon: ThumbsUp, reaction: '👍' },
                      { key: 'idea', label: 'Idea', icon: Lightbulb, reaction: '💡' },
                      { key: 'bug', label: 'Bug', icon: Bug, reaction: '🐛' },
                      { key: 'link', label: 'Copy permalink', icon: LinkIcon, reaction: '🔗' },
                    ] as const
                  ).map(({ key, label, icon: Icon, reaction }) => (
                    <button
                      key={key}
                      type="button"
                      aria-label={label}
                      className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-emerald-300 hover:scale-110 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (key === 'link') {
                          const url = `${location.origin}${location.pathname}#msg-${message.id}`;
                          navigator.clipboard.writeText(url).catch(() => {});
                        } else {
                          fetch('/api/feedback', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ messageId: message.id, reaction }),
                            credentials: 'include',
                          }).catch(() => {});
                        }
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-gray-400 mt-1 px-1 select-none timestamp-hidden">
                {(message.timestamp instanceof Date
                  ? message.timestamp
                  : new Date(message.timestamp as unknown as string)
                ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {message.status === 'sending' && ' · sending'}
                {message.status === 'error' && ' · error'}
              </div>

              {message.status === 'error' && (
                <div className="text-xs text-red-400 mt-1 px-1">
                  {message.errorText || 'Failed to send'}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});

export default ConversationsMessageWaterfall;
