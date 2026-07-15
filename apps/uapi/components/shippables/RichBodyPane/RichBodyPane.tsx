"use client";

// Unified scrollable markdown container used by all Shippable cards so they
// look identical (same padding, scrollbar, accent colour, etc.).

import React from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from '@/components/bitcode/media/SyntaxHighlighter/SyntaxHighlighter';

interface Props {
  children: string; // raw markdown
  /** Tailwind colour prefix without shade, e.g. 'purple' or 'emerald'. */
  accent?: 'purple' | 'emerald' | 'sky' | 'blue';
  /** Maximum height in pixels before scrollbars appear (auto-height below that). */
  maxHeight?: number; // px
  /** Text size class inside prose (prose-sm, prose-xs ...) */
  size?: 'sm' | 'xs';
}

const accentDefaults: Record<string, { main: string; border: string }> = {
  purple: { main: 'purple-300', border: 'purple-500/10' },
  emerald: { main: 'emerald-300', border: 'emerald-500/10' },
  sky: { main: 'sky-300', border: 'sky-500/10' },
  blue: { main: 'blue-300', border: 'blue-500/10' },
};

const DEFAULT_MAX = 120;

const RichBodyPane: React.FC<Props> = ({
  children,
  accent = 'purple',
  maxHeight = DEFAULT_MAX,
  size = 'sm',
}) => {
  const accentConf = accentDefaults[accent] ?? accentDefaults.purple;

  const proseBase = `prose prose-${size} prose-invert max-w-none`;
  const proseAccent = `prose-headings:mb-2 prose-headings:mt-3 prose-headings:font-semibold prose-headings:text-${accentConf.main} prose-a:text-${accentConf.main} prose-a:no-underline hover:prose-a:text-${accentConf.main} hover:prose-a:underline prose-blockquote:border-l-${accent}-300/50 prose-blockquote:bg-black/20 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-md prose-pre:bg-black/30 prose-pre:p-2 prose-pre:rounded-md prose-pre:border prose-pre:border-${accent}-500/10 prose-code:text-${accent}-200 prose-code:bg-black/40 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-${accent}-500/20 prose-strong:text-white prose-strong:font-semibold prose-em:text-${accent}-200 prose-li:marker:text-${accent}-400`;

  const scrollbarVariant = accent === 'purple'
    ? 'custom-scrollbar--thumb-purple'
    : accent === 'emerald'
      ? 'custom-scrollbar-emerald'
      : 'custom-scrollbar-blue';

  return (
    <div
      className={`overflow-y-auto custom-scrollbar ${scrollbarVariant} pr-2 bg-black/20 p-3 rounded-md flex-1 min-h-0`}
      style={{ maxHeight: `${maxHeight}px` }}
    >
      <ReactMarkdown
        className={`${proseBase} ${proseAccent}`}
        components={{
          table: ({ node, ...props }) => (
            <div
              className={`overflow-x-auto my-4 rounded-md border border-${accent}-500/20 bg-black/20`}
            >
              <table {...props} className="min-w-full" />
            </div>
          ),
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <CodeBlock
                language={match[1]}
                className={className}
                style={{ fontSize: size === 'xs' ? '0.7rem' : '0.75rem' }}
              >
                {children as string}
              </CodeBlock>
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default RichBodyPane;
