'use client';

// @ts-nocheck

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
} from 'react';

import RichTextInput from '@/components/conversations/ConversationsRichTextInput/ConversationsRichTextInput';
import QuantumOrb from '@/components/bitcode/effects/quantum-orb/QuantumOrb/QuantumOrb';
import MarketingPlaceholderImage from '@/components/marketing/MarketingPlaceholderImage/MarketingPlaceholderImage';
import MarketingFullScreenGallery from '@/components/marketing/MarketingFullScreenGallery/MarketingFullScreenGallery';
import type { Screenshot } from '@/components/marketing/MarketingTypes/marketing-types';

// Re-use core Conversations styles so the experience matches the in-product chat.
import '@/styles/conversations.css';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
}

// Constants that never change are defined outside the component so they don't
// get re-allocated on every render.

// A few example prompts that visitors can click.
const EXAMPLE_QUESTIONS = [
  'Ship on time?',
  'Always upgrading?',
  'Plug in easily?',
  'Guard my code?',
  'Trade data safely?',
];

// Prepared screenshot paths (these should exist in /public).  Replace with
// real assets during CMS / build step.
const SCREENSHOTS = [
  '/screenshots/sidebar-chats-chatting.png',
  '/screenshots/sidebar-chats-history.png',
  '/screenshots/sidebar-shippables.png',
  '/screenshots/sidebar-feedbacks-history.png',
];

// Convert to Screenshot objects for FullScreenGallery
const SCREENSHOT_OBJS: Screenshot[] = SCREENSHOTS.map((src, idx) => ({
  id: `conversations-${idx}`,
  src,
  alt: `Conversations screenshot ${idx + 1}`,
  type: 'component',
  category: 'conversations',
  revealingSoon: true,
}));

// Sub-components to isolate static vs dynamic rendering
const ChatHeader = memo(() => (
  <div className="relative z-10 text-center mb-14 desktop:mb-16">
    <h2 className="super-shiny-text text-3xl tablet:text-4xl laptop:text-5xl desktop:text-6xl font-bold tracking-tight mb-6 block text-[#67feb7]">
      Bitcode Chat Operator for Read Review
    </h2>
    <p className="text-base laptop:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
      One conversational interface for Read measurement, source evidence, AssetPacks, and connected review.
    </p>
  </div>
));

interface ChatWindowProps { messages: Message[] }
const MessageRow = memo(({ msg }: { msg: Message }) => (
  <div className={`message-container message-${msg.type}`}>
    <div className="message-bubble">
      <div className="message-content">
        {msg.content === '' ? (
          <span className="typing-indicator">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </span>
        ) : (
          msg.content
        )}
      </div>
    </div>
  </div>
), (p, n) => p.msg.content === n.msg.content && p.msg.type === n.msg.type);

const ChatWindow = memo(({ messages }: ChatWindowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);
  return (
    <div ref={scrollRef} className="chat-messages custom-scrollbar">
      {messages.map((m) => (
        <MessageRow key={m.id} msg={m} />
      ))}
    </div>
  );
}, (prev, next) => prev.messages.length === next.messages.length);

interface ChatInputBarProps { onSend: (text: string) => void; loading: boolean }
const ChatInputBar = memo(({ onSend, loading }: ChatInputBarProps) => (
  <div className="chat-input-container">
    {loading && <div className="mb-1 text-gray-400 text-sm">Waiting for response…</div>}
    <RichTextInput
      onSend={onSend}
      placeholder={loading ? 'Waiting for response…' : undefined}
      disabled={loading}
      enablePickers={false}
    />
  </div>
), (prev, next) => prev.loading === next.loading && prev.onSend === next.onSend);

interface ThumbnailSectionProps {
  onThumbClick: (idx: number) => void;
  galleryOpen: boolean;
  galleryStart: number;
  onGalleryClose: () => void;
}
const ThumbnailSection = memo(({ onThumbClick, galleryOpen, galleryStart, onGalleryClose }: ThumbnailSectionProps) => {
  // Build an 8-item array (4 rows × 2 cols) by duplicating existing screenshots if needed.
  const thumbs = React.useMemo(() => {
    if (SCREENSHOTS.length >= 8) return SCREENSHOTS.slice(0, 8);
    const dup = [...SCREENSHOTS, ...SCREENSHOTS];
    return dup.slice(0, 8);
  }, []);

  const [errored, setErrored] = React.useState<Record<number, boolean>>({});

  return (
    <div className="hidden desktop:block h-full w-full overflow-hidden">
      <div className="grid grid-cols-2 grid-rows-4 gap-[4px] w-full h-full">
        {thumbs.map((src, idx) => {
          const shot = SCREENSHOT_OBJS[idx % SCREENSHOTS.length];
          return (
          <button
            key={idx}
            onClick={() => onThumbClick(idx % SCREENSHOTS.length)}
            className="relative w-full h-full overflow-hidden rounded-md border border-white/10 shadow-sm bg-black/20"
          >
            {(!src || errored[idx] || shot.revealingSoon) ? (
              <MarketingPlaceholderImage stretch className="w-full h-full" type="component" category="conversations" />
            ) : (
              <img
                src={src}
                alt="Conversations screenshot thumbnail"
                className="w-full h-full object-cover"
                decoding="async"
                loading="lazy"
                onError={() => setErrored(prev => ({ ...prev, [idx]: true }))}
              />
            )}
          </button>
          );
        })}
      </div>

      {galleryOpen && (
        <MarketingFullScreenGallery
          screenshots={SCREENSHOT_OBJS}
          isOpen={galleryOpen}
          initialIndex={galleryStart}
          onClose={onGalleryClose}
        />
      )}
    </div>
  );
}, (prev, next) => prev.onThumbClick === next.onThumbClick && prev.galleryOpen === next.galleryOpen && prev.galleryStart === next.galleryStart && prev.onGalleryClose === next.onGalleryClose);

interface ChatExamplesProps { hasInteracted: boolean; sendMessage: (text: string) => void }
const ChatExamples = memo(({ hasInteracted, sendMessage }: ChatExamplesProps) => (
  <div
    className={`transition-opacity duration-500 ${hasInteracted ? 'opacity-60' : 'opacity-100'} flex flex-wrap gap-2 desktop:gap-3 justify-center desktop:justify-start mt-6 desktop:mt-0`}
  >
    {EXAMPLE_QUESTIONS.map((q) => (
      <button
        key={q}
        onClick={() => sendMessage(q)}
        className="px-3 py-1 rounded-full text-sm border border-[#67feb7]/40 text-[#67feb7] hover:bg-[#67feb7]/10 focus:outline-none focus:ring-2 focus:ring-[#67feb7]/50 transition text-left whitespace-nowrap truncate max-w-full"
      >
        {q}
      </button>
    ))}
  </div>
), (prev, next) => prev.hasInteracted === next.hasInteracted && prev.sendMessage === next.sendMessage);

// Chat box header placeholder (keeps padding for the orb overlay)
const ChatBoxHeader = memo(() => (
  <div className="chat-header h-10" />
));

/**
* Marketing-site “Chat with Conversations” section.
 * A trimmed-down but fully functional embed of the real operator.
 */
// Dynamic chat content component: handles state and streaming
const ChatDynamic: React.FC = () => {
  // The running chat transcript.
  const [messages, setMessages] = useState<Message[]>([]);
  // Loading state to disable input while streaming
  const [loading, setLoading] = useState<boolean>(false);

  // Tracks if the visitor has asked their first question (used to fade
  // example chips).
  const [hasInteracted, setHasInteracted] = useState(false);

  // DOM refs.
  const sectionRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /* Viewport visibility tracking                                        */
  /* ------------------------------------------------------------------ */

  // Lightweight IntersectionObserver helper – duplicated from InViewLazy so
  // we don’t incur an extra import at runtime (tree-shaken when compiled for
  // the server).
  function useInViewport(
    ref: React.RefObject<Element>,
    { rootMargin = '0px' }: { rootMargin?: string } = {}
  ) {
    const [inView, setInView] = useState(false);

    useEffect(() => {
      const node = ref.current;
      if (!node) return;

      if (!('IntersectionObserver' in window)) {
        setInView(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          setInView(entry.isIntersecting);
        },
        { rootMargin }
      );

      observer.observe(node);
      return () => observer.disconnect();
    }, [ref, rootMargin]);

    return inView;
  }

  // We deem the section visible once it is within 200 px of viewport so the
  // QuantumOrb has a short warm-up window but stays completely dormant while
  // the user is elsewhere on the page.
  const isSectionVisible = useInViewport(sectionRef, { rootMargin: '200px 0px' });

  // Refs to keep latest messages and loading state for stable callbacks
  const messagesRef = useRef<Message[]>(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  const loadingRef = useRef<boolean>(loading);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // In-memory cache for prompt → answer mapping during this session
  const responseCache = useRef<Record<string, string>>({});


  // Gallery modal state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);
  // Stable callback for thumbnail clicks
  const handleThumbClick = useCallback((idx: number) => {
    setGalleryStart(idx);
    setGalleryOpen(true);
  }, []);

  // Pre-computed screenshot list constant keeps renders cheap.

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (loadingRef.current || !text.trim()) return;

    // Simple in-memory cache for identical prompts within the same page
    if (responseCache.current[text.trim()]) {
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, type: 'user', content: text.trim() }, { id: `a-${Date.now()}`, type: 'agent', content: responseCache.current[text.trim()] }]);
      return;
    }
    setLoading(true);
    setHasInteracted(true);

    const uid = Date.now().toString();
    const userMsg: Message = { id: `u-${uid}`, type: 'user', content: text };
    const aid = `a-${uid}`;
    const placeholder: Message = { id: aid, type: 'agent', content: '' };
    setMessages((prev) => [...prev, userMsg, placeholder]);

    const history = [...messagesRef.current, userMsg, placeholder];
    const payload = {
      messages: history
        .filter((m) => m.content)
        .map((m) => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content })),
      pipeline: false,
    };

    // Abort any existing stream before starting a new one
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/conversations/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(`Stream error: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let done = false;
      let aiText = '';
      let buffer = '';

      // Throttle updates to at most one every 50 ms
      let lastUpdate = 0;

      const commit = () => {
        setMessages((prev) =>
          prev.map((m) => (m.id === aid ? { ...m, content: aiText } : m))
        );
      };

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split(/\n\n/);
          buffer = parts.pop() || '';
          for (const part of parts) {
            const line = part.replace(/\r?\n$/, '');
            if (!line.startsWith('data:')) continue;

            let token = line.substring(5);
            if (token.startsWith(' ')) token = token.substring(1);

            if (token.startsWith('ERROR:')) {
              const errorText = token.replace(/^ERROR:\s*/, '');
              console.error('Chat API error:', errorText);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aid
                    ? { ...m, content: 'Sorry, something went wrong. Please try again later.' }
                    : m
                )
              );
              done = true;
              break;
            }

            aiText += token;

            const now = performance.now();
            if (now - lastUpdate > 50) {
              commit();
              lastUpdate = now;
            }
          }
        }
      }

      // Flush remaining
      commit();

      // Store in cache
      responseCache.current[text.trim()] = aiText;

    } catch (err) {
      if ((err as any)?.name === 'AbortError') return; // Swallow aborts
      console.error('Chat stream error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aid
            ? { ...m, content: 'Sorry, something went wrong. Please try again later.' }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // On unmount abort any in-flight fetch
  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  // Limit number of messages to avoid unbounded growth (simple virtualisation)
  useEffect(() => {
    const MAX = 60;
    if (messages.length > MAX) {
      setMessages((prev) => prev.slice(prev.length - MAX));
    }
  }, [messages]);



  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div ref={sectionRef} className="chat-dynamic-container">
      <ChatHeader />

      {/* Two-column layout on large screens: 3/4 Conversations chat  |  1/4 sidebar (chips + thumbnails) */}
      <div className="grid grid-cols-1 desktop:grid-cols-[3fr_1fr] gap-8 max-w-7xl mx-auto w-full">
        {/* Conversations chat experience (left, 3/4) */}
        <div className="order-2 desktop:order-1 flex flex-col items-center desktop:col-start-1 desktop:col-end-2 desktop:pl-12">
          <div className="conversations-chat-container w-full h-[500px] relative bg-[rgba(3,8,22,0.95)] rounded-xl border border-[#67feb7]/20 shadow-lg text-white overflow-visible flex flex-col">
            {isSectionVisible && (
              <div className="absolute top-0 left-0 -translate-y-1/2 z-20 pointer-events-none">
                <QuantumOrb size={80} initialState="active" respectReducedMotion={false} />
              </div>
            )}
            <ChatBoxHeader />
            <ChatWindow messages={messages} />
            <ChatInputBar onSend={sendMessage} loading={loading} />
          </div>
        </div>

        {/* Sidebar: chips on top, thumbnails on bottom (right, 1/4) */}
        <div className="hidden desktop:flex flex-col h-[500px] order-1 desktop:order-2 desktop:col-start-2 desktop:col-end-3 pb-4">
          {/* Prefilled question chips (auto height, min) */}
          <div className="pb-4 flex items-start justify-center">
            <ChatExamples hasInteracted={hasInteracted} sendMessage={sendMessage} />
          </div>

          {/* Screenshot thumbnails (fills remaining space) */}
          <div className="flex-1 min-h-0">
            <ThumbnailSection
              onThumbClick={handleThumbClick}
              galleryOpen={galleryOpen}
              galleryStart={galleryStart}
              onGalleryClose={() => setGalleryOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Mobile / tablet: show example chips below the chat when sidebar collapses */}
      <div className="mt-6 desktop:hidden flex justify-center">
        <ChatExamples hasInteracted={hasInteracted} sendMessage={sendMessage} />
      </div>
    </div>
  );
};

// Static wrapper for the Chat experience section – mirrors the full-width,
// large-padding pattern of our alt background bands (e.g. Evidence Documents/Connects).
const MarketingChatExperience: React.FC = memo(() => (
  <section
    id="chat-experience"
    className="relative w-full bg-[#030816] overflow-x-visible overflow-y-hidden pt-8 tablet:pt-10 laptop:pt-12 desktop:pt-16 pb-6 tablet:pb-8 laptop:pb-10 desktop:pb-12 flex flex-col"
  >
    <div className="relative mx-auto w-full max-w-7xl px-4 tablet:px-6 desktop:px-8 wide:px-12">
      <ChatDynamic />
    </div>
  </section>
));

export default MarketingChatExperience;
