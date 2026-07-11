"use client";

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import MetalPlate from '@/components/bitcode/metal-plate';
import { ScrollContainer } from '@/components/bitcode/panels/ScrollContainer';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
const CodeBlock = dynamic(() => import('@/components/bitcode/media/syntax-highlighter'), { ssr: false });

type Shippable = {
  url?: string;
  number?: number;
  title?: string;
  description?: string;
};

export interface ShippablesCardsPanelProps {
  shippables: {
    pullRequest?: Shippable | null;
  };
  autoScrollOnAnimation?: boolean;
}

const childVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] },
  },
} as const;

const scaledTextFadeVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.33, 1, 0.68, 1], staggerChildren: 0.08 },
  },
} as const;

export default function ShippablesCardsPanel({
  shippables,
  autoScrollOnAnimation = true,
}: ShippablesCardsPanelProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const pr = shippables.pullRequest;

  const hasAny = !!pr;
  if (!hasAny) return null;

  return (
    <motion.div
      variants={scaledTextFadeVariants}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 laptop:grid-cols-2 desktop:grid-cols-3 gap-6"
      ref={sectionRef}
      onAnimationStart={() => {
        if (autoScrollOnAnimation) scrollToSection(sectionRef);
      }}
    >
      {pr && (
        <motion.div variants={childVariants} initial="initial" animate="animate">
          <MetalPlate
            headline="Pull Request"
            mainColor="#34d399"
            glowColor="#6ee7b7"
            intense
            icon={
              <svg className="w-5 h-5 text-emerald-300 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4" />
              </svg>
            }
            linkUrl={pr.url}
            linkTitle="View Pull Request"
            className="flex flex-col"
          >
            <div className="mt-3 flex flex-col space-y-3 text-gray-200">
              {pr.title && <div className="text-lg font-semibold text-white/90">{pr.title}</div>}
              {pr.description && (
                <ScrollContainer className="text-gray-400 text-sm mt-2 max-h-[100px] pr-2 bg-black/20 p-3 mb-3">
                  <ReactMarkdown
                    className="prose prose-invert max-w-none prose-base prose-headings:mb-3 prose-headings:mt-5 prose-headings:font-semibold prose-headings:text-emerald-300 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-purple-300 prose-a:no-underline hover:prose-a:text-purple-200 hover:prose-a:underline prose-blockquote:border-l-emerald-300/50 prose-blockquote:bg-black/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:-md prose-pre:bg-black/30 prose-pre:p-3 prose-pre: prose-pre:border prose-pre:border-purple-500/10 prose-code:text-emerald-200 prose-code:bg-black/40 prose-code:px-1 prose-code:py-0.5 prose-code: prose-code:border prose-code:border-emerald-500/20 prose-strong:text-white prose-strong:font-semibold prose-em:text-purple-200 prose-li:marker:text-emerald-400 prose-ol:pl-6 prose-ol:my-4 prose-ul:pl-6 prose-ul:my-4 prose-li:my-1 prose-table:border-collapse prose-table:w-full prose-thead:bg-black/30 prose-th:p-2 prose-th:text-emerald-300 prose-th:font-medium prose-td:p-2 prose-td:border-t prose-td:border-purple-500/10 prose-img: prose-img:max-w-full prose-img:shadow-lg"
                    components={{
                      code: ({ node, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <CodeBlock language={match[1]} className={className} style={{ fontSize: '0.75rem' }}>
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
                    {pr.description}
                  </ReactMarkdown>
                </ScrollContainer>
              )}
            </div>
          </MetalPlate>
        </motion.div>
      )}
    </motion.div>
  );
}
