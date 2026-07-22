'use client';

import React, { memo, useMemo, useState } from 'react';

import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';

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
  // Date-only chip (author name removed from public micro-blog meta).
  return <span>{meta}</span>;
}

export const MarketingLandingGuideCard = memo(function MarketingLandingGuideCard() {
  const posts = BITCODE_PUBLIC_COPY.guide.posts;
  const [activePostId, setActivePostId] = useState<string>(posts[0].id);
  const activePost = useMemo(
    () => posts.find((post) => post.id === activePostId) ?? posts[0],
    [activePostId, posts],
  );

  return (
    <article
      className="relative w-full max-w-none overflow-visible rounded-none border border-emerald-300/12 bg-black/25 p-4 pt-5 shadow-[0_20px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl phone:pt-6"
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

      <div className="flex min-w-0 items-center gap-2 border-b border-emerald-300/10 pb-3">
        <div className="min-w-0 flex-1">
          {/* Tighter tracking so longer titles stay one line beside the date chip. */}
          <p className="truncate bg-gradient-to-r from-emerald-200 via-emerald-100 to-white bg-clip-text pe-[0.12em] text-[11px] font-semibold uppercase leading-[1.35] tracking-[0.12em] text-transparent phone:text-[12px] phone:tracking-[0.14em]">
            {activePost.title}
          </p>
        </div>
        <div
          aria-label={activePost.meta}
          data-testid="micro-blog-meta"
          className="inline-flex shrink-0 items-center rounded-none border border-emerald-300/10 bg-emerald-400/[0.05] px-2 py-1 text-[9px] uppercase leading-4 tracking-[0.12em] text-emerald-100/58 phone:text-[10px]"
        >
          {renderMicroBlogMeta(activePost.meta)}
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-6 text-emerald-100/72">
        {renderMicroBlogBody(activePost.body, activePost.highlights)}
      </p>
    </article>
  );
});
