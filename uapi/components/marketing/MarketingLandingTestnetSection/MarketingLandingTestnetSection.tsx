'use client';

/**
 * Commercial product strip (left column).
 * Fills residual height when parent is flex-1 so left/right page columns share a lower edge.
 */

import React from 'react';
import Link from 'next/link';

import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';

const TITLE_HIGHLIGHTS = [
  { text: 'Bitcode', tone: 'green' as const },
  { text: 'Bitcoin', tone: 'orange' as const },
];

const TITLE_HIGHLIGHT_CLASS: Record<'green' | 'orange', string> = {
  green:
    'font-semibold text-emerald-200 [text-shadow:0_0_14px_rgba(103,254,183,0.8),0_0_30px_rgba(52,211,153,0.45)]',
  orange:
    'font-semibold text-orange-200 [text-shadow:0_0_14px_rgba(251,146,60,0.8),0_0_30px_rgba(251,191,36,0.4)]',
};

function renderTitleWithHighlights(title: string) {
  const pattern = new RegExp(
    `(${TITLE_HIGHLIGHTS.map((entry) => entry.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'g',
  );
  const toneByText = new Map(TITLE_HIGHLIGHTS.map((entry) => [entry.text, entry.tone]));

  return title.split(pattern).map((part, index) => {
    if (!part) return null;
    const tone = toneByText.get(part);
    if (!tone) {
      return <React.Fragment key={`title-${index}`}>{part}</React.Fragment>;
    }
    return (
      <span key={`title-${part}-${index}`} className={TITLE_HIGHLIGHT_CLASS[tone]}>
        {part}
      </span>
    );
  });
}

export function MarketingLandingTestnetSection() {
  const copy = BITCODE_PUBLIC_COPY.testnetLaunch;

  return (
    <section
      data-testid="landing-testnet-launch"
      aria-label="Commercial product launch readiness"
      className="relative flex h-full min-h-0 w-full flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-col rounded-none border border-emerald-300/16 bg-emerald-300/[0.045] px-4 py-4 backdrop-blur-sm phone:px-5 phone:py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-none border border-emerald-300/35 bg-emerald-300/12 px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-emerald-100">
            {copy.badge}
          </span>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-snug text-white phone:text-xl">
          {renderTitleWithHighlights(copy.title)}
        </h2>
        <p className="mt-2 text-[13px] leading-5 text-neutral-300 phone:text-[14px]">{copy.meaning}</p>
        <ol className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-2.5" aria-label="Core product flow">
          {copy.flow.map((entry) => (
            <li key={entry.step} className="min-h-0">
              <Link
                href={entry.href}
                className="flex h-full flex-col justify-center rounded-none border border-white/10 bg-black/25 px-3 py-3 transition hover:border-emerald-300/35 hover:bg-emerald-300/[0.07]"
              >
                <span className="inline-flex items-baseline gap-2">
                  <span className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-emerald-200/85">
                    {entry.step}
                  </span>
                  <span className="text-[13px] font-semibold text-white">{entry.label}</span>
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-neutral-400">{entry.detail}</span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-3 grid gap-1.5 border-t border-white/8 pt-3 text-[11px] leading-5 text-neutral-400">
          <p>{copy.trust}</p>
          <p>{copy.sourceSafety}</p>
        </div>
      </div>
    </section>
  );
}
