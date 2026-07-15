'use client';

/**
 * Commercial product strip (left column).
 * Content-height only — parent stack equalizes space above/below via flex spacers.
 * Interface cards: Website + MCP live at launch; Conversational Extensions coming soon.
 */

import React from 'react';
import {
  ChatBubbleLeftRightIcon,
  CodeBracketSquareIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

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

const FLOW_ICONS = {
  website: ComputerDesktopIcon,
  mcp: CodeBracketSquareIcon,
  extensions: ChatBubbleLeftRightIcon,
} as const;

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
      className="relative w-full shrink-0"
    >
      <div className="rounded-none border border-emerald-300/16 bg-emerald-300/[0.045] px-4 py-4 backdrop-blur-sm phone:px-5 phone:py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-none border border-emerald-300/35 bg-emerald-300/12 px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-emerald-100">
            {copy.badge}
          </span>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-snug text-white phone:text-xl">
          {renderTitleWithHighlights(copy.title)}
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-neutral-300 phone:text-[15px]">{copy.meaning}</p>
        <ul className="mt-3 grid grid-cols-1 gap-2.5" aria-label="Product interfaces">
          {copy.flow.map((entry) => {
            const Icon = FLOW_ICONS[entry.id as keyof typeof FLOW_ICONS] ?? ComputerDesktopIcon;
            const isComingSoon = entry.status === 'coming_soon';

            return (
              <li key={entry.id}>
                <div
                  className={
                    isComingSoon
                      ? 'rounded-none border border-dashed border-white/12 bg-black/15 px-3 py-3 opacity-90'
                      : 'rounded-none border border-white/10 bg-black/25 px-3 py-3'
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex min-w-0 items-center gap-2.5">
                      <span
                        className={`inline-flex h-[2.125rem] w-[2.125rem] shrink-0 items-center justify-center rounded-none border ${
                          isComingSoon
                            ? 'border-white/8 bg-white/[0.03] text-neutral-500'
                            : 'border-emerald-300/25 bg-emerald-400/10 text-emerald-200'
                        }`}
                      >
                        {/* Mid size shared with Selling Knowledge squares (~34px square, 20px glyph). */}
                        <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <span
                        className={`text-[13px] font-semibold ${
                          isComingSoon ? 'text-neutral-400' : 'text-white'
                        }`}
                      >
                        {entry.label}
                      </span>
                    </div>
                    {isComingSoon ? (
                      <span className="shrink-0 rounded-none border border-amber-300/25 bg-amber-400/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-amber-100/80">
                        Coming soon
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-none border border-emerald-300/22 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-emerald-100/75">
                        Live
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-2 text-[12px] leading-5 phone:text-[13px] ${
                      isComingSoon ? 'text-neutral-500' : 'text-neutral-400'
                    }`}
                  >
                    {entry.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[11px] leading-5 text-neutral-400">{copy.sourceSafety}</p>
      </div>
    </section>
  );
}
