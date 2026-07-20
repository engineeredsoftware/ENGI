'use client';

/**
 * Commercial product strip (left column).
 * Content-height only — parent stack equalizes space above/below via flex spacers.
 * Interface cards: Whitepaper + MCP + repository are whole-row links;
 * Website is descriptive Live chrome; Conversational Extensions coming soon.
 */

import React from 'react';
import Link from 'next/link';
import {
  ArrowsRightLeftIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  CodeBracketSquareIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

import Logo from '@/components/bitcode/branding/Logo/Logo';
import AssetPackMark from '@/components/bitcode/branding/AssetPackMark/AssetPackMark';
import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';
import {
  renderClaimAnchorMarkers,
  renderLeadingClaimFootnote,
} from '@/components/marketing/MarketingLandingShared/MarketingLandingShared';

const TITLE_HIGHLIGHTS = [
  // Title order: Code ⇄ Coin (see BITCODE_PUBLIC_COPY.testnetLaunch.title).
  { text: 'Code', tone: 'green' as const },
  { text: 'Coin', tone: 'orange' as const },
];

const TITLE_HIGHLIGHT_CLASS: Record<'green' | 'orange', string> = {
  green:
    'font-semibold text-emerald-200 [text-shadow:0_0_14px_rgba(103,254,183,0.8),0_0_30px_rgba(52,211,153,0.45)]',
  orange:
    'font-semibold text-orange-200 [text-shadow:0_0_14px_rgba(251,146,60,0.8),0_0_30px_rgba(251,191,36,0.4)]',
};

/**
 * Code side (2 marks) fills the open corner left of the exchange glyph —
 * substantially larger than the 3-chain triangle (left unchanged).
 */
const CODE_MARK_SLOT =
  'inline-flex h-14 w-14 shrink-0 items-center justify-center phone:h-16 phone:w-16';
/**
 * Equal square slots for BTC / ETH / SOL.
 * Brand SVGs have very different frames (BTC logo has large empty margin;
 * ETH is tall; SOL is wide). Match *painted* mass via per-logo box size +
 * scale — not a single % object-contain.
 */
const CHAIN_MARK_SLOT =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-visible phone:h-11 phone:w-11';
/**
 * Explicit glyph boxes — BTC SVG frame is mostly empty so it needs a much
 * larger box+scale to hit ~same painted height as ETH diamond / SOL bars.
 */
const CHAIN_GLYPH = {
  btc: 'block h-12 w-12 origin-center scale-[1.55] phone:h-[3.25rem] phone:w-[3.25rem]',
  eth: 'block h-10 w-10 origin-center object-contain phone:h-11 phone:w-11',
  sol: 'block h-9 w-11 origin-center object-contain phone:h-10 phone:w-12',
} as const;

const FLOW_ICONS = {
  website: ComputerDesktopIcon,
  mcp: CodeBracketSquareIcon,
  extensions: ChatBubbleLeftRightIcon,
  repository: CodeBracketIcon,
  whitepaper: DocumentTextIcon,
} as const;

const OPEN_SOURCE_DEFAULT_BADGE = 'Open-Source';

function renderTitleWithHighlights(title: string) {
  // Split on highlight nouns and the exchange "for" so the word can become a
  // smaller inline ⇄ mark (same purple exchange glyph as the corner stack).
  const highlightAlt = TITLE_HIGHLIGHTS.map((entry) =>
    entry.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  ).join('|');
  const pattern = new RegExp(`(${highlightAlt}|\\bfor\\b)`, 'g');
  const toneByText = new Map(TITLE_HIGHLIGHTS.map((entry) => [entry.text, entry.tone]));

  return title.split(pattern).map((part, index) => {
    if (!part) return null;
    if (part === 'for') {
      return (
        <span
          key={`title-exchange-${index}`}
          className="mx-[0.2em] inline-flex translate-y-[-0.05em] items-center align-middle [filter:drop-shadow(0_0_8px_rgba(232,121,249,0.65))]"
          title="for"
        >
          <span className="sr-only">for</span>
          <ArrowsRightLeftIcon
            className="h-[0.72em] w-[0.72em] text-fuchsia-300"
            strokeWidth={2.25}
            aria-hidden="true"
          />
        </span>
      );
    }
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
      <div className="relative overflow-visible rounded-none border border-emerald-300/16 bg-emerald-300/[0.045] px-4 py-4 backdrop-blur-sm phone:px-5 phone:py-5">
        {/*
          Absolute so the exchange mark never expands card layout.
          Title is Code ⇄ Coin. Left: BTD C + AssetPack (both emerald, ~50/50 of
          prior solo mark). Right: BTC / ETH / SOL triangle with brand-matched glows.
        */}
        <div
          className="pointer-events-none absolute right-1.5 top-1.5 z-10 inline-flex items-center gap-2 phone:right-2.5 phone:top-2.5 phone:gap-2.5"
          aria-hidden="true"
          title="Code for Coin exchange"
        >
          {/* Bitcode side — C + AssetPack fill open space left of ⇄ (chain side unchanged). */}
          <span className="inline-flex items-center gap-1.5 phone:gap-2">
            <span
              className={`${CODE_MARK_SLOT} text-[#65FEB7] [filter:drop-shadow(0_0_12px_rgba(103,254,183,0.9))_drop-shadow(0_0_24px_rgba(52,211,153,0.55))]`}
            >
              <Logo
                height="h-14 phone:h-16"
                width="w-14 phone:w-16"
                fill="#65FEB7"
                className="opacity-95"
              />
            </span>
            <span
              className={`${CODE_MARK_SLOT} [filter:drop-shadow(0_0_10px_rgba(232,121,249,0.75))_drop-shadow(0_0_18px_rgba(251,146,60,0.55))]`}
            >
              <AssetPackMark
                height="h-14 phone:h-16"
                width="w-14 phone:w-16"
                className="opacity-95"
                title={null}
                variant="dual"
              />
            </span>
          </span>
          {/* Purple exchange glyph — glow outside the stroke. */}
          <span className="inline-flex shrink-0 items-center justify-center [filter:drop-shadow(0_0_8px_rgba(232,121,249,0.85))_drop-shadow(0_0_18px_rgba(192,132,252,0.55))]">
            <ArrowsRightLeftIcon
              className="h-7 w-7 text-fuchsia-300 phone:h-8 phone:w-8"
              strokeWidth={2}
            />
          </span>
          {/*
            Settlement side — optical triangle (equal painted mass):
                 BTC
              ETH   SOL
            Per-logo glyph boxes (BTC SVG has large empty frame → bigger box).
            Shadows tinted to each logo’s brand color.
          */}
          <span className="grid shrink-0 grid-cols-2 grid-rows-2 place-items-center gap-x-1 gap-y-0.5">
            <span
              className={`${CHAIN_MARK_SLOT} col-span-2 justify-self-center [filter:drop-shadow(0_0_8px_rgba(251,146,60,0.85))_drop-shadow(0_0_16px_rgba(251,191,36,0.5))]`}
            >
              <span
                className={`${CHAIN_GLYPH.btc} bg-orange-300`}
                style={{
                  maskImage: 'url(/bitcoin-logo.svg)',
                  WebkitMaskImage: 'url(/bitcoin-logo.svg)',
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                }}
              />
            </span>
            <span
              className={`${CHAIN_MARK_SLOT} [filter:drop-shadow(0_0_8px_rgba(99,102,241,0.75))_drop-shadow(0_0_16px_rgba(167,139,250,0.55))]`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG */}
              <img
                src="/ethereum-logo.svg"
                alt=""
                className={CHAIN_GLYPH.eth}
                draggable={false}
              />
            </span>
            <span
              className={`${CHAIN_MARK_SLOT} [filter:drop-shadow(0_0_8px_rgba(153,69,255,0.75))_drop-shadow(0_0_16px_rgba(25,251,155,0.4))]`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG */}
              <img
                src="/solana-logo.svg"
                alt=""
                className={CHAIN_GLYPH.sol}
                draggable={false}
              />
            </span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pr-56 phone:pr-72">
          <span className="rounded-none border border-emerald-300/35 bg-emerald-300/12 px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-emerald-100">
            {copy.badge}
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-white phone:text-3xl tablet:text-4xl">
          {renderTitleWithHighlights(copy.title)}
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-neutral-300 phone:text-[15px]">
          {renderClaimAnchorMarkers(copy.meaning)}
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-2.5" aria-label="Product interfaces">
          {copy.flow.map((entry) => {
            const Icon = FLOW_ICONS[entry.id as keyof typeof FLOW_ICONS] ?? ComputerDesktopIcon;
            const isComingSoon = entry.status === 'coming_soon';
            const isOpenSource = entry.status === 'open_source';
            const isLiveChrome = entry.status === 'live' || isOpenSource;
            const detail = typeof entry.detail === 'string' ? entry.detail.trim() : '';
            const href = typeof entry.href === 'string' && entry.href.trim() ? entry.href.trim() : null;
            const isExternal =
              Boolean((entry as { external?: boolean }).external) ||
              Boolean(href?.startsWith('http://') || href?.startsWith('https://'));
            const isRowLink = Boolean(href) && !isComingSoon;
            const openSourceBadge =
              typeof (entry as { badge?: string }).badge === 'string' &&
              (entry as { badge?: string }).badge?.trim()
                ? (entry as { badge: string }).badge.trim()
                : OPEN_SOURCE_DEFAULT_BADGE;

            const shellClass = isComingSoon
              ? 'block rounded-none border border-dashed border-white/12 bg-black/15 px-3 py-3 opacity-90'
              : isRowLink
                ? 'block rounded-none border border-white/10 bg-black/25 px-3 py-3 transition-[border-color,background-color,box-shadow] duration-200 hover:border-emerald-300/28 hover:bg-emerald-400/[0.06] hover:shadow-[0_0_18px_rgba(16,185,129,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300/50'
                : 'block rounded-none border border-white/10 bg-black/25 px-3 py-3';

            const body = (
              <>
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
                  ) : isOpenSource ? (
                    <span className="shrink-0 rounded-none border border-emerald-300/22 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-emerald-100/75">
                      {openSourceBadge}
                    </span>
                  ) : isLiveChrome ? (
                    <span className="shrink-0 rounded-none border border-emerald-300/22 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-emerald-100/75">
                      Live
                    </span>
                  ) : null}
                </div>
                {detail ? (
                  <p
                    className={`mt-2 text-[12px] leading-5 phone:text-[13px] ${
                      isComingSoon ? 'text-neutral-500' : 'text-neutral-400'
                    }`}
                  >
                    {detail}
                  </p>
                ) : null}
              </>
            );

            return (
              <li key={entry.id}>
                {isRowLink && href && isExternal ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className={shellClass}
                    aria-label={`${entry.label} (opens in a new tab)`}
                  >
                    {body}
                  </a>
                ) : isRowLink && href ? (
                  <Link href={href} className={shellClass} aria-label={entry.label}>
                    {body}
                  </Link>
                ) : (
                  <div className={shellClass}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-3 space-y-1" aria-label="Product claim notes">
          {copy.sourceSafety.map((line) => (
            <p key={line} className="text-[11px] leading-5 text-neutral-400">
              {renderLeadingClaimFootnote(line)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
