import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { motion, AnimatePresence } from 'framer-motion';

// Styling mirrors Conversations (tailwind classes). Storybook already loads global CSS
// so we can reuse those classes here without importing component tree.

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

// Simple bubble renderer mirroring Conversations aesthetics.
function Bubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const base = 'px-3 py-2 rounded-lg max-w-2xl text-sm whitespace-pre-wrap';
  const bg = role === 'user' ? 'bg-gray-700/50' : 'bg-emerald-500/20';
  const align = role === 'user' ? 'self-start' : 'self-end';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${base} ${bg} ${align}`}
    >
      {content || <span className="opacity-30">…</span>}
    </motion.div>
  );
}

// Waterfall layout: flex-col-reverse so newest is near the input like Conversations.
function Waterfall({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col-reverse space-y-reverse space-y-3 custom-scrollbar"
      style={{ maxHeight: 500, background: 'theme(colors.slate.900)', borderRadius: 8 }}
    >
      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} content={m.content} />
        ))}
      </AnimatePresence>
    </div>
  );
}

const meta: Meta = {
  title: 'Conversations/Waterfall',
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Streaming demo – assistant tokens arrive gradually
export const Streaming: Story = {
  render: () => {
    const [messages, setMessages] = useState<Message[]>([
      { id: 'u1', role: 'user', content: 'Generate a catchy product tagline.' },
      { id: 'a1', role: 'assistant', content: '', isStreaming: true },
    ]);

    useEffect(() => {
      const tokens = ['"', 'Innovate', ' your', ' future', '"'];
      let idx = 0;
      const interval = setInterval(() => {
        idx += 1;
        setMessages((prev) =>
          prev.map((m) =>
            m.isStreaming ? { ...m, content: tokens.slice(0, idx).join('') } : m,
          ),
        );
        if (idx === tokens.length) {
          clearInterval(interval);
          setMessages((prev) => prev.map((m) => ({ ...m, isStreaming: false })));
        }
      }, 400);
      return () => clearInterval(interval);
    }, []);

    return <Waterfall messages={messages} />;
  },
};

// 2. Pipeline run finished – include user, assistant, and result summary
export const PipelineComplete: Story = {
  render: () => {
    const sample: Message[] = [
      { id: 'u1', role: 'user', content: 'Create an onboarding email campaign.' },
      { id: 'a1', role: 'assistant', content: 'Sure! Starting campaign generator …' },
      { id: 'a2', role: 'assistant', content: '✅ Campaign created. Preview here: https://…' },
    ];
    return <Waterfall messages={sample} />;
  },
};

// 3. History with multiple runs / Shippables
export const ConversationHistory: Story = {
  render: () => {
    const msgs: Message[] = [
      { id: 'u0', role: 'user', content: 'Initial setup for analytics.' },
      { id: 'a0', role: 'assistant', content: 'Analytics pipeline deployed ✔' },
      { id: 'u1', role: 'user', content: 'Add funnel charts.' },
      { id: 'a1', role: 'assistant', content: 'Funnel charts added in dashboard v2.' },
      { id: 'u2', role: 'user', content: 'Ship to production.' },
      { id: 'a2', role: 'assistant', content: '🚀 Deployed! All systems go.' },
    ];
    return <Waterfall messages={msgs} />;
  },
};

// 4. Waterfall + RichTextInput demo
import RichTextInput from '@/components/conversations/ConversationsRichTextInput/ConversationsRichTextInput';

export const WithInput: Story = {
  render: () => {
    const [messages, setMessages] = useState<Message[]>([]);
    return (
      <div className="flex flex-col w-full max-w-2xl gap-4">
        <Waterfall messages={messages} />
        <RichTextInput
          onSend={(text) =>
            setMessages((prev) => [
              { id: `u-${Date.now()}`, role: 'user', content: text },
              ...prev,
            ])
          }
        />
      </div>
    );
  },
};
