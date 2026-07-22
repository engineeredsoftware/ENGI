'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';
import MultiLineTypingAnimation from '@/components/bitcode/MultiLineTypingAnimation/MultiLineTypingAnimation';

import { MarketingLandingPillarCard } from '@/components/marketing/MarketingLandingPillarCard/MarketingLandingPillarCard';
import {
  animatedMotionStyle,
  entranceEase,
  headlineHighlights,
  headlineText,
  heroHighlightClass,
  productPillars,
} from '@/components/marketing/MarketingLandingShared/MarketingLandingShared';

// Glowing underline claim markers (`glowing-underline` / `-always`).
import '@/styles/bitcode-header-shiny-text.css';
// Same super-shiny-text highlight chrome as MultiLineTypingAnimation.
import '@/styles/shiny-text.css';

const ParticleEffect = dynamic(
  () => import('@/components/bitcode/ParticleEffect/ParticleEffect'),
  { ssr: false, loading: () => null },
);

const NEON_HIGHLIGHT_CLASS: Record<
  'purple' | 'orange' | 'green' | 'greenUnderline' | 'bold',
  string
> = {
  purple:
    'font-semibold text-fuchsia-200 [text-shadow:0_0_12px_rgba(232,121,249,0.75),0_0_28px_rgba(192,132,252,0.45)]',
  orange:
    'font-semibold text-orange-200 [text-shadow:0_0_12px_rgba(251,146,60,0.75),0_0_28px_rgba(251,191,36,0.4)]',
  green:
    'font-semibold text-emerald-200 [text-shadow:0_0_12px_rgba(103,254,183,0.75),0_0_28px_rgba(52,211,153,0.4)]',
  /*
   * Underline-only claim: body text color; green glow on the baseline stroke.
   * Uses glowing-underline-baseline (skip-ink + underline-offset) so the "p"
   * descender is gapped rather than crossed mid-stem or floated below.
   */
  greenUnderline: 'glowing-underline-baseline font-medium text-inherit',
  /** Opening claim sentence — weight only, no neon tint. */
  bold: 'font-bold text-white',
};

function renderNeonHighlights(
  body: string,
  highlights: ReadonlyArray<{
    text: string;
    tone: 'purple' | 'orange' | 'green' | 'greenUnderline' | 'bold';
  }>,
) {
  if (!highlights.length) return body;

  const pattern = new RegExp(
    `(${highlights.map((entry) => entry.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'g',
  );
  const toneByText = new Map(highlights.map((entry) => [entry.text, entry.tone]));

  return body.split(pattern).map((part, index) => {
    if (!part) return null;
    const tone = toneByText.get(part);
    if (!tone) {
      return <React.Fragment key={`neon-${index}`}>{part}</React.Fragment>;
    }
    return (
      <span key={`neon-${part}-${index}`} className={NEON_HIGHLIGHT_CLASS[tone]}>
        {part}
      </span>
    );
  });
}

const WHY_NOW_HIGHLIGHTS = [
  {
    text: 'Buying the data that trains AI is broken',
    tone: 'bold' as const,
  },
  { text: 'nine-month deals', tone: 'orange' as const },
  { text: 'lawsuits', tone: 'orange' as const },
  { text: 'buying the whole company', tone: 'orange' as const },
  { text: '~$100B', tone: 'green' as const },
  { text: '~25%', tone: 'green' as const },
  { text: 'no real exchange', tone: 'purple' as const },
  { text: 'Until now.', tone: 'green' as const },
] as const;

/** Why-now closer: same highlight particle burst as typing, looped. */
function WhyNowBody() {
  const untilNowRef = useRef<HTMLSpanElement>(null);
  const [particlesReady, setParticlesReady] = useState(false);
  const body = BITCODE_PUBLIC_COPY.whyNow.body;
  const pattern = new RegExp(
    `(${WHY_NOW_HIGHLIGHTS.map((entry) => entry.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'g',
  );
  const toneByText = new Map<string, (typeof WHY_NOW_HIGHLIGHTS)[number]['tone']>(
    WHY_NOW_HIGHLIGHTS.map((entry) => [entry.text, entry.tone]),
  );

  // Mount ParticleEffect only after the target span is painted (ref is set).
  useEffect(() => {
    setParticlesReady(Boolean(untilNowRef.current));
  }, []);

  return (
    <>
      {body.split(pattern).map((part, index) => {
        if (!part) return null;
        if (part === 'Until now.') {
          return (
            <span
              key={`until-now-${index}`}
              ref={untilNowRef}
              data-particle-highlight="why-now-until"
              className={`${heroHighlightClass} relative inline-block font-semibold`}
            >
              {part}
            </span>
          );
        }
        const tone = toneByText.get(part);
        if (!tone) {
          return <React.Fragment key={`why-now-${index}`}>{part}</React.Fragment>;
        }
        return (
          <span key={`why-now-${part}-${index}`} className={NEON_HIGHLIGHT_CLASS[tone]}>
            {part}
          </span>
        );
      })}
      {particlesReady ? (
        <ParticleEffect
          targetRef={untilNowRef}
          particleCount={56}
          duration={2200}
          delay={400}
          loop
          loopInterval={2600}
        />
      ) : null}
    </>
  );
}

/** CTA under each pillar — purple Deposit · orange Read · green Settle. */
const pillarCtas = [
  {
    pillarTitle: 'Deposit',
    href: BITCODE_PUBLIC_COPY.secondaryCta.href,
    label: BITCODE_PUBLIC_COPY.secondaryCta.label,
    className:
      'border-fuchsia-300/28 bg-fuchsia-500/12 text-fuchsia-50/88 transition-[color,background-color,border-color,box-shadow,text-shadow] duration-200 hover:border-fuchsia-300/80 hover:bg-fuchsia-500/28 hover:text-fuchsia-50 hover:shadow-[0_0_22px_rgba(232,121,249,0.28)] hover:[text-shadow:0_0_12px_rgba(232,121,249,0.55)]',
  },
  {
    pillarTitle: 'Read',
    href: BITCODE_PUBLIC_COPY.primaryCta.href,
    label: BITCODE_PUBLIC_COPY.primaryCta.label,
    className:
      'border-orange-300/28 bg-orange-400/12 text-orange-50/88 transition-[color,background-color,border-color,box-shadow,text-shadow] duration-200 hover:border-orange-300/80 hover:bg-orange-400/28 hover:text-orange-50 hover:shadow-[0_0_22px_rgba(251,146,60,0.28)] hover:[text-shadow:0_0_12px_rgba(251,146,60,0.55)]',
  },
  {
    pillarTitle: 'Settle',
    href: BITCODE_PUBLIC_COPY.tertiaryCta.href,
    label: BITCODE_PUBLIC_COPY.tertiaryCta.label,
    className:
      'border-emerald-300/28 bg-emerald-400/12 text-emerald-50/88 transition-[color,background-color,border-color,box-shadow,text-shadow] duration-200 hover:border-emerald-300/80 hover:bg-emerald-400/28 hover:text-emerald-50 hover:shadow-[0_0_22px_rgba(103,254,183,0.28)] hover:[text-shadow:0_0_12px_rgba(103,254,183,0.55)]',
  },
] as const;

/**
 * Opening column only: eyebrow → CTAs.
 * Protocol (Code⇄Coin) + micro-blog live in the lower production band on the page.
 */
export const MarketingLandingHero = memo(function MarketingLandingHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: entranceEase }}
      className="flex w-full min-h-0 flex-col justify-start self-stretch"
      style={animatedMotionStyle}
    >
      <div className="max-w-2xl space-y-4">
        <p className="max-w-xl text-[11px] uppercase tracking-[0.26em] text-emerald-200/70">
          {BITCODE_PUBLIC_COPY.eyebrow}
        </p>
        <h1 className="text-[2.35rem] font-semibold leading-[0.96] text-white phone:text-[2.9rem] tablet:text-[3.6rem] laptop:text-[4.35rem]">
          {/* Width tuned for the shorter AIs/Bitcode headline — balanced 3–4 line stack. */}
          <div className="relative max-w-[18ch] phone:max-w-[20ch] tablet:max-w-[22ch] laptop:max-w-[24ch]">
            <MultiLineTypingAnimation
              text={headlineText}
              charDelay={18}
              startDelay={140}
              align="left"
              className="text-white/92 tracking-[-0.02em]"
              highlightTexts={headlineHighlights}
            />
          </div>
        </h1>
        <p className="max-w-[42rem] text-[19px] font-medium leading-[1.5] tracking-[-0.015em] text-white/90 [text-shadow:0_0_18px_rgba(103,254,183,0.05)] phone:text-[21px] tablet:text-[23px]">
          {renderNeonHighlights(
            BITCODE_PUBLIC_COPY.description,
            BITCODE_PUBLIC_COPY.descriptionHighlights,
          )}
        </p>
        {/*
          Outside: pt-3 (~half chip) so space-y gap to hero description is
          measured to the chip top, not the card border.
          Inside: card pt = base pad + half chip so body clears the lower half
          of the absolute -translate-y-1/2 tab.
        */}
        <div className="max-w-[42rem] pt-3">
          <div
            data-testid="landing-why-now"
            className="relative rounded-none border border-emerald-300/22 bg-[linear-gradient(145deg,rgba(4,14,22,0.98),rgba(6,28,36,0.92)_48%,rgba(3,12,20,0.98))] px-4 pb-3.5 pt-[calc(0.875rem+0.75rem)] shadow-[0_18px_48px_rgba(2,8,17,0.45),0_0_40px_rgba(103,254,183,0.08),inset_0_1px_0_rgba(103,254,183,0.14)] phone:px-5 phone:pb-4 phone:pt-[calc(1rem+0.75rem)]"
          >
            {/* Bitcode chrome: hairline, radials, micro-grid (clipped so tab can overhang) */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-none">
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/75 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,254,183,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.1),transparent_36%)]" />
              <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:22px_22px]" />
              <div className="absolute inset-[1px] rounded-none border border-white/[0.06]" />
            </div>

            {/* Overhang like micro-blog tabs — half above the card border. */}
            <div className="absolute left-3 top-0 z-10 flex -translate-y-1/2 items-center phone:left-4">
              <span className="inline-flex items-center rounded-none border border-emerald-300/55 bg-[linear-gradient(135deg,rgba(8,36,32,0.98),rgba(12,52,44,0.96))] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-50 shadow-[0_10px_28px_rgba(2,8,17,0.55),0_0_28px_rgba(103,254,183,0.35),0_0_12px_rgba(103,254,183,0.45),inset_0_1px_0_rgba(103,254,183,0.28)] backdrop-blur-md [text-shadow:0_0_12px_rgba(103,254,183,0.65)]">
                Why now
              </span>
            </div>

            <p className="relative text-[15px] font-medium leading-[1.55] tracking-[-0.01em] text-white/92 [text-shadow:0_0_24px_rgba(103,254,183,0.12)] phone:text-[16px] phone:leading-[1.55]">
              <WhyNowBody />
            </p>
          </div>
        </div>
      </div>

      {/*
        Chip + pillar + CTA share one column so each chip aligns to its card
        (same grid as the buttons below).
      */}
      <div className="mt-4 grid grid-cols-1 items-stretch gap-x-2 gap-y-3 phone:mt-5 phone:grid-cols-2 phone:gap-x-3 desktop:grid-cols-3">
        {productPillars.map((pillar, index) => {
          const cta = pillarCtas.find((entry) => entry.pillarTitle === pillar.title) ?? pillarCtas[index];
          const chip = BITCODE_PUBLIC_COPY.capabilityChips[index] ?? BITCODE_PUBLIC_COPY.capabilityChips[0];

          return (
            <div key={pillar.title} className="flex min-h-0 min-w-0 flex-col gap-3">
              <span className="relative flex w-full shrink-0 items-center justify-center overflow-hidden rounded-none border border-cyan-200/18 bg-[linear-gradient(135deg,rgba(9,22,48,0.82),rgba(18,49,88,0.38))] px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100 shadow-[0_12px_28px_rgba(6,182,212,0.08)] backdrop-blur-md">
                <span
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 32px)',
                  }}
                />
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,254,183,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_34%)]" />
                <span className="absolute inset-[1px] rounded-none border border-white/8" />
                <span className="relative whitespace-nowrap">{chip}</span>
              </span>
              <div className="min-h-0 flex-1">
                <MarketingLandingPillarCard {...pillar} index={index} />
              </div>
              <Link
                href={cta.href}
                className={`inline-flex w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-none border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${cta.className}`}
              >
                {cta.label}
                <ArrowRightIcon className="h-4 w-4 shrink-0" />
              </Link>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
});
