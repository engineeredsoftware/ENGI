'use client';

import React, { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';

import { animatedMotionStyle, entranceEase } from '@/components/marketing/MarketingLandingShared/MarketingLandingShared';

function renderMicroBlogBody(body: string, highlights: readonly string[]) {
  if (!highlights.length) return body;

  const escapedHighlights = highlights.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escapedHighlights.join('|')})`, 'g');

  return body.split(pattern).map((part, index) => {
    if (!part) return null;
    const isHighlighted = highlights.includes(part);

    return isHighlighted ? (
      <span key={`${part}-${index}`} className="text-emerald-300 [text-shadow:0_0_16px_rgba(101,254,183,0.45)]">
        {part}
      </span>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    );
  });
}

function renderMicroBlogMeta(meta: string) {
  const parts = meta.split(/\s+\*\s+|\s+•\s+/);
  if (parts.length !== 2) return <span>{meta}</span>;

  return (
    <span aria-hidden="true" className="inline-flex items-center gap-2.5">
      <span>{parts[0]}</span>
      <span
        className="mt-px size-1 rounded-full"
        style={{
          backgroundColor: 'rgba(255,255,255,0.88)',
          boxShadow: '0 0 10px rgba(255,255,255,0.32), 0 0 16px rgba(101,254,183,0.35)',
        }}
      />
      <span>{parts[1]}</span>
    </span>
  );
}

export const MarketingLandingGuideCard = memo(function MarketingLandingGuideCard() {
  const posts = BITCODE_PUBLIC_COPY.guide.posts;
  const [activePostId, setActivePostId] = useState<string>(posts[0].id);
  const activePost = useMemo(
    () => posts.find((post) => post.id === activePostId) ?? posts[0],
    [activePostId, posts],
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: entranceEase }}
      className="relative w-full max-w-none overflow-visible rounded-none border border-emerald-300/12 bg-black/25 p-4 pt-5 shadow-[0_20px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl phone:pt-6"
      style={animatedMotionStyle}
    >
      <div className="absolute left-0 top-0 flex -translate-y-1/2 flex-wrap items-center gap-2">
        {posts.map((post) => {
          const isActive = post.id === activePost.id;

          return (
            <button
              key={post.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActivePostId(post.id)}
              className={`inline-flex items-center rounded-none border px-3 py-1 text-[10px] uppercase tracking-[0.18em] shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl transition ${
                isActive
                  ? 'border-emerald-300/18 bg-emerald-400/[0.09] text-emerald-50'
                  : 'border-emerald-300/10 bg-emerald-400/[0.05] text-emerald-100/58 hover:border-emerald-300/16 hover:bg-emerald-400/[0.08] hover:text-emerald-100/78'
              }`}
            >
              {post.tab}
            </button>
          );
        })}
      </div>

      <div className="border-b border-emerald-300/10 pb-3 laptop:grid laptop:grid-cols-[minmax(0,1fr)_auto] laptop:items-center laptop:gap-4">
        <div className="min-w-0 laptop:pr-2">
          <p className="whitespace-nowrap bg-gradient-to-r from-emerald-200 via-emerald-100 to-white bg-clip-text text-[11px] font-semibold uppercase leading-[1.35] tracking-[0.18em] text-transparent phone:text-[12px] phone:tracking-[0.22em]">
            {activePost.title}
          </p>
        </div>
        <div
          aria-label={activePost.meta}
          data-testid="micro-blog-meta"
          className="mt-3 inline-flex max-w-full flex-wrap items-center rounded-none border border-emerald-300/10 bg-emerald-400/[0.05] px-2.5 py-1 text-[9px] uppercase leading-4 tracking-[0.18em] text-emerald-100/58 phone:text-[10px] laptop:mt-0 laptop:justify-self-start"
        >
          {renderMicroBlogMeta(activePost.meta)}
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-6 text-emerald-100/72">
        {renderMicroBlogBody(activePost.body, activePost.highlights)}
      </p>
    </motion.article>
  );
});
