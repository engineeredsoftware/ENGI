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
  ArrowsUpDownIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  CodeBracketSquareIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

import Logo from '@/components/bitcode/branding/Logo/Logo';
import DataPackMark from '@/components/bitcode/branding/DataPackMark/DataPackMark';
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
 * substantially larger than the 3-chain triangle (chain side unchanged).
 */
const CODE_MARK_SLOT =
  'inline-flex h-14 w-14 shrink-0 items-center justify-center phone:h-16 phone:w-16 tablet:h-[4.5rem] tablet:w-[4.5rem] laptop:h-[5.25rem] laptop:w-[5.25rem]';

/**
 * Compact bond between Bitcode C and DataPack — reads as one commercial
 * package (not the purple exchange ⇄ on the settlement side).
 */
function CodePackBondMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Paired nodes — protocol + pack */}
      <circle cx="7" cy="10" r="3.1" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="21" cy="10" r="3.1" stroke="currentColor" strokeWidth="1.75" />
      {/* Primary bond */}
      <path
        d="M10.1 10h7.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Bundle hash — “package deal” weight without looking like ⇄ */}
      <path
        d="M12.4 7.15h3.2M12.4 12.85h3.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

/**
 * Equal square slots for settlement 2×2 (reading order):
 *   fiat group · BTC
 *   ETH        · SOL
 * Fiat nest is a Bitcode “lattice” 2×2 ($ € ¥ ₽) with a center × bond.
 * Brand SVGs have very different frames (BTC logo has large empty margin;
 * ETH is tall; SOL is wide). Match *painted* mass via per-logo box size +
 * scale — not a single % object-contain.
 */
const CHAIN_MARK_SLOT =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-visible phone:h-12 phone:w-12 tablet:h-10 tablet:w-10 laptop:h-11 laptop:w-11';
/**
 * Explicit glyph boxes — BTC SVG frame is mostly empty so it needs a much
 * larger box+scale to hit ~same painted height as ETH diamond / SOL bars.
 */
const CHAIN_GLYPH = {
  /**
   * BTC SVG path is slightly design-tilted in the Pixelmator export; −10° CSS
   * straightens the B upright next to ETH/SOL without overshoot (−15° was past vertical).
   */
  btc: 'block h-11 w-11 origin-center scale-[1.5] rotate-[-10deg] phone:h-12 phone:w-12 tablet:h-12 tablet:w-12 tablet:scale-[1.55] laptop:h-[3.25rem] laptop:w-[3.25rem]',
  eth: 'block h-11 w-11 origin-center object-contain phone:h-12 phone:w-12 tablet:h-10 tablet:w-10 laptop:h-11 laptop:w-11',
  sol: 'block h-9 w-11 origin-center object-contain phone:h-10 phone:w-12 tablet:h-9 tablet:w-11 laptop:h-10 laptop:w-12',
  /** Nested fiat mini-cells in the lattice group. */
  fiat: 'relative z-[1] inline-flex h-[1.1rem] w-[1.1rem] shrink-0 items-center justify-center text-[0.9rem] font-semibold leading-none phone:h-[1.2rem] phone:w-[1.2rem] phone:text-[0.95rem] tablet:h-[1.05rem] tablet:w-[1.05rem] tablet:text-[0.88rem] laptop:h-[1.15rem] laptop:w-[1.15rem] laptop:text-[0.95rem]',
} as const;

/**
 * Fiat rail group — four currency marks in a 2×2 with Bitcode lattice chrome:
 * soft frame, diagonal × bond (protocol cross), emerald core node.
 * Reads as one commercial “fiat package” beside BTC / ETH / SOL.
 */
function FiatRailGroupMark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`relative inline-grid h-11 w-11 shrink-0 grid-cols-2 grid-rows-2 place-items-center overflow-visible phone:h-12 phone:w-12 tablet:h-10 tablet:w-10 laptop:h-11 laptop:w-11 ${className}`}
      aria-hidden="true"
    >
      {/* Lattice plate + × bond + core (under the glyphs). */}
      <svg
        viewBox="0 0 40 40"
        className="pointer-events-none absolute inset-0 h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="fiat-lattice-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#67FEB7" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#34d399" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#67FEB7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fiat-x-stroke" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a7f3d0" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="#c4b5fd" stopOpacity="0.75" />
            <stop offset="1" stopColor="#7dd3fc" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {/* Soft field */}
        <circle cx="20" cy="20" r="18.5" fill="url(#fiat-lattice-glow)" />
        {/* Square frame — Bitcode tile language */}
        <rect
          x="2.5"
          y="2.5"
          width="35"
          height="35"
          rx="1.5"
          stroke="rgba(103,254,183,0.28)"
          strokeWidth="0.9"
        />
        <rect
          x="5"
          y="5"
          width="30"
          height="30"
          rx="1"
          stroke="rgba(167,139,250,0.18)"
          strokeWidth="0.7"
          strokeDasharray="2.2 2.4"
        />
        {/* Diagonal × — exchange / multi-rail cross */}
        <path
          d="M9 9 L31 31 M31 9 L9 31"
          stroke="url(#fiat-x-stroke)"
          strokeWidth="1.15"
          strokeLinecap="square"
          opacity="0.9"
        />
        {/* Crosshair ticks at mid-edges */}
        <path
          d="M20 4.5 V8.5 M20 31.5 V35.5 M4.5 20 H8.5 M31.5 20 H35.5"
          stroke="rgba(103,254,183,0.35)"
          strokeWidth="0.85"
          strokeLinecap="square"
        />
        {/* Protocol core */}
        <circle cx="20" cy="20" r="2.6" fill="rgba(4,16,24,0.85)" stroke="rgba(103,254,183,0.85)" strokeWidth="1" />
        <circle cx="20" cy="20" r="1.05" fill="#67FEB7" fillOpacity="0.95" />
      </svg>
      <span
        className={`${CHAIN_GLYPH.fiat} text-emerald-200/95 [text-shadow:0_0_8px_rgba(110,231,183,0.95)] [filter:drop-shadow(0_0_3px_rgba(110,231,183,0.55))]`}
        title="USD"
      >
        $
      </span>
      <span
        className={`${CHAIN_GLYPH.fiat} text-sky-200/95 [text-shadow:0_0_8px_rgba(125,211,252,0.9)] [filter:drop-shadow(0_0_3px_rgba(125,211,252,0.5))]`}
        title="EUR"
      >
        €
      </span>
      <span
        className={`${CHAIN_GLYPH.fiat} text-rose-200/95 [text-shadow:0_0_8px_rgba(251,113,133,0.85)] [filter:drop-shadow(0_0_3px_rgba(251,113,133,0.45))]`}
        title="CNY"
      >
        ¥
      </span>
      <span
        className={`${CHAIN_GLYPH.fiat} text-violet-200/95 [text-shadow:0_0_8px_rgba(196,181,253,0.9)] [filter:drop-shadow(0_0_3px_rgba(167,139,250,0.5))]`}
        title="RUB"
      >
        ₽
      </span>
    </span>
  );
}

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
          className="mx-[0.2em] inline-flex shrink-0 translate-y-[-0.05em] items-center align-middle [filter:drop-shadow(0_0_8px_rgba(232,121,249,0.65))]"
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
  // Phone badge: first word on line 1, remainder on line 2 (balanced wrap).
  const badgeWords = copy.badge.trim().split(/\s+/);
  const badgeLead = badgeWords[0] ?? copy.badge;
  const badgeTrail = badgeWords.slice(1).join(' ');

  return (
    <section
      data-testid="landing-testnet-launch"
      aria-label="Commercial product launch readiness"
      className="relative w-full shrink-0"
    >
      <div className="relative overflow-hidden rounded-none border border-emerald-300/16 bg-emerald-300/[0.045] px-4 py-4 backdrop-blur-sm phone:overflow-visible phone:px-5 phone:py-5 tablet:overflow-visible">
        {/*
          Phone: badge | vertical icon column (package → ⇅ → rails), larger marks.
          Tablet+: horizontal strip absolute top-right (row + ⇄), as before.
        */}
        <div className="flex min-w-0 items-start justify-between gap-3 tablet:block">
          <div className="min-w-0 flex-1 tablet:max-w-[calc(100%-17rem)] desktop:max-w-[calc(100%-19rem)]">
            {/*
              Intentional Productionized / Protocol break — balanced 2-line badge.
            */}
            <span className="inline-flex shrink-0 flex-col items-center justify-center rounded-none border border-emerald-300/35 bg-emerald-300/12 px-2 py-1.5 text-center text-[0.58rem] font-medium uppercase leading-[1.15] tracking-[0.12em] text-emerald-100 phone:px-2.5 phone:text-[0.62rem] phone:tracking-[0.14em] tablet:inline-block tablet:max-w-none tablet:px-2.5 tablet:py-1 tablet:text-left tablet:text-[0.62rem] tablet:tracking-[0.18em] tablet:leading-none">
              <span className="block tablet:inline">{badgeLead}</span>
              {badgeTrail ? (
                <span className="block tablet:ml-1 tablet:inline">{badgeTrail}</span>
              ) : null}
            </span>
            <h2 className="mt-2.5 text-2xl font-semibold leading-tight tracking-tight text-white phone:mt-3 phone:text-3xl phone:leading-none tablet:whitespace-nowrap tablet:text-4xl">
              {renderTitleWithHighlights(copy.title)}
            </h2>
            {/*
              Phone: meaning sits in the left column under the title (whitespace
              beside the icon stack). Tablet+ is full-width under the header.
            */}
            <p className="mt-2 text-[14px] leading-6 text-neutral-300 phone:text-[15px] tablet:hidden">
              {renderClaimAnchorMarkers(copy.meaning)}
            </p>
          </div>

          <div
            className="pointer-events-none relative z-10 flex w-[38%] max-w-[9.5rem] shrink-0 flex-col items-center gap-1.5 phone:w-[40%] phone:max-w-[10.5rem] phone:gap-2 tablet:absolute tablet:right-2.5 tablet:top-2.5 tablet:w-auto tablet:max-w-none tablet:flex-row tablet:items-center tablet:gap-2 laptop:right-2.5 laptop:top-2.5 laptop:gap-2.5"
            aria-hidden="true"
            title="Code for Coin exchange"
          >
            <span
              className="inline-flex items-center"
              title="Bitcode protocol + DataPack (package deal)"
            >
              <span
                className={`${CODE_MARK_SLOT} translate-x-2.5 text-[#65FEB7] phone:translate-x-3 tablet:translate-x-4 laptop:translate-x-5 [filter:drop-shadow(0_0_12px_rgba(103,254,183,0.9))_drop-shadow(0_0_24px_rgba(52,211,153,0.55))]`}
              >
                <Logo
                  height="h-14 phone:h-16 tablet:h-[4.5rem] laptop:h-[5.25rem]"
                  width="w-14 phone:w-16 tablet:w-[4.5rem] laptop:w-[5.25rem]"
                  fill="#65FEB7"
                  className="origin-center rotate-[16.5deg] opacity-95"
                />
              </span>
              <span
                className="relative z-10 -ml-3 -mr-1 translate-x-1 inline-flex shrink-0 items-center justify-center text-[#65FEB7] phone:-ml-3.5 phone:translate-x-1 tablet:-ml-5 tablet:-mr-1.5 tablet:translate-x-1.5 laptop:-ml-6 laptop:-mr-2 laptop:translate-x-2 [filter:drop-shadow(0_0_8px_rgba(103,254,183,0.75))]"
                aria-hidden="true"
              >
                <CodePackBondMark className="h-6 w-8 opacity-95 phone:h-7 phone:w-9 tablet:h-7 tablet:w-9 laptop:h-8 laptop:w-10" />
              </span>
              <span
                className={`${CODE_MARK_SLOT} [filter:drop-shadow(0_0_12px_rgba(103,254,183,0.9))_drop-shadow(0_0_24px_rgba(52,211,153,0.55))]`}
              >
                <DataPackMark
                  height="h-14 phone:h-16 tablet:h-[4.5rem] laptop:h-[5.25rem]"
                  width="w-14 phone:w-16 tablet:w-[4.5rem] laptop:w-[5.25rem]"
                  className="opacity-95"
                  title={null}
                  variant="dual"
                />
              </span>
            </span>
            {/*
              Phone column uses vertical ⇅; tablet+ row keeps horizontal ⇄.
            */}
            <span className="inline-flex shrink-0 items-center justify-center [filter:drop-shadow(0_0_8px_rgba(232,121,249,0.85))_drop-shadow(0_0_18px_rgba(192,132,252,0.55))]">
              <ArrowsUpDownIcon
                className="h-6 w-6 text-fuchsia-300 phone:h-7 phone:w-7 tablet:hidden"
                strokeWidth={2}
              />
              <ArrowsRightLeftIcon
                className="hidden h-7 w-7 text-fuchsia-300 tablet:block laptop:h-8 laptop:w-8"
                strokeWidth={2}
              />
            </span>
            <span
              className="grid shrink-0 grid-cols-2 grid-rows-2 place-items-center gap-x-1.5 gap-y-1"
              aria-label="Settlement rails: fiat USD Euro Yuan and Ruble, Bitcoin, Ethereum, and Solana"
            >
              <FiatRailGroupMark />
              <span
                className={`${CHAIN_MARK_SLOT} [filter:drop-shadow(0_0_8px_rgba(251,146,60,0.85))_drop-shadow(0_0_16px_rgba(251,191,36,0.5))]`}
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
                  aria-hidden="true"
                />
              </span>
              <span
                className={`${CHAIN_MARK_SLOT} [filter:drop-shadow(0_0_8px_rgba(99,102,241,0.75))_drop-shadow(0_0_16px_rgba(167,139,250,0.55))]`}
              >
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
                <img
                  src="/solana-logo.svg"
                  alt=""
                  className={CHAIN_GLYPH.sol}
                  draggable={false}
                />
              </span>
            </span>
          </div>
        </div>

        {/* Tablet+: full-width body under header (phone meaning is in the left column). */}
        <p className="mt-2 hidden text-[14px] leading-6 text-neutral-300 phone:text-[15px] tablet:block">
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
                      {/* Mid size shared with Exchanging Knowledge squares (~34px square, 20px glyph). */}
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
