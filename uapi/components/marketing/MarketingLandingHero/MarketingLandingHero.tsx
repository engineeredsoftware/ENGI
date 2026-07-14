'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';
import MultiLineTypingAnimation from '@/components/bitcode/MultiLineTypingAnimation/MultiLineTypingAnimation';

import { MarketingLandingGuideCard } from '@/components/marketing/MarketingLandingGuideCard/MarketingLandingGuideCard';
import { MarketingLandingPillarCard } from '@/components/marketing/MarketingLandingPillarCard/MarketingLandingPillarCard';
import { MarketingLandingTestnetSection } from '@/components/marketing/MarketingLandingTestnetSection/MarketingLandingTestnetSection';
import {
  animatedMotionStyle,
  entranceEase,
  headlineHighlights,
  headlineText,
  productPillars,
} from '@/components/marketing/MarketingLandingShared/MarketingLandingShared';

const DESCRIPTION_HIGHLIGHT_CLASS: Record<'purple' | 'orange', string> = {
  purple:
    'font-semibold text-fuchsia-200 [text-shadow:0_0_12px_rgba(232,121,249,0.75),0_0_28px_rgba(192,132,252,0.45)]',
  orange:
    'font-semibold text-orange-200 [text-shadow:0_0_12px_rgba(251,146,60,0.75),0_0_28px_rgba(251,191,36,0.4)]',
};

function renderDescriptionWithHighlights(
  body: string,
  highlights: ReadonlyArray<{ text: string; tone: 'purple' | 'orange' }>,
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
      return <React.Fragment key={`desc-${index}`}>{part}</React.Fragment>;
    }
    return (
      <span key={`desc-${part}-${index}`} className={DESCRIPTION_HIGHLIGHT_CLASS[tone]}>
        {part}
      </span>
    );
  });
}

/** CTA under each pillar — order and colors match Sell · Buy · Settle columns. */
const pillarCtas = [
  {
    pillarTitle: 'Sell',
    href: BITCODE_PUBLIC_COPY.secondaryCta.href,
    label: BITCODE_PUBLIC_COPY.secondaryCta.label,
    className:
      'border-fuchsia-300/28 bg-fuchsia-500/12 text-fuchsia-50 hover:border-fuchsia-300/48 hover:bg-fuchsia-500/18',
  },
  {
    pillarTitle: 'Buy',
    href: BITCODE_PUBLIC_COPY.primaryCta.href,
    label: BITCODE_PUBLIC_COPY.primaryCta.label,
    className:
      'border-emerald-300/28 bg-emerald-400/12 text-emerald-50 hover:border-emerald-300/48 hover:bg-emerald-400/18',
  },
  {
    pillarTitle: 'Settle',
    href: BITCODE_PUBLIC_COPY.tertiaryCta.href,
    label: BITCODE_PUBLIC_COPY.tertiaryCta.label,
    className:
      'border-orange-300/28 bg-orange-400/12 text-orange-50 hover:border-orange-300/48 hover:bg-orange-400/18',
  },
] as const;

export const MarketingLandingHero = memo(function MarketingLandingHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: entranceEase }}
      // Full column height so testnet can pin to the shared lower edge with Data Depot.
      className="flex h-full min-h-0 flex-col justify-start self-stretch"
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
        <p className="max-w-[42rem] text-[17px] font-medium leading-[1.5] tracking-[-0.015em] text-white/90 [text-shadow:0_0_18px_rgba(103,254,183,0.05)] phone:text-[19px] tablet:text-[21px]">
          {renderDescriptionWithHighlights(
            BITCODE_PUBLIC_COPY.description,
            BITCODE_PUBLIC_COPY.descriptionHighlights,
          )}
        </p>
      </div>

      <div className="mt-4 flex flex-nowrap gap-2 overflow-x-auto text-[11px] uppercase tracking-[0.18em] text-emerald-200/68 phone:mt-5 phone:tracking-[0.22em]">
        {BITCODE_PUBLIC_COPY.capabilityChips.map((item) => (
          <span
            key={item}
            className="relative shrink-0 overflow-hidden rounded-none border border-cyan-200/18 bg-[linear-gradient(135deg,rgba(9,22,48,0.82),rgba(18,49,88,0.38))] px-3 py-2 text-cyan-100 shadow-[0_12px_28px_rgba(6,182,212,0.08)] backdrop-blur-md"
          >
            <span
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 32px)',
              }}
            />
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,254,183,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_34%)]" />
            <span className="absolute inset-[1px] rounded-none border border-white/8" />
            <span className="relative whitespace-nowrap">{item}</span>
          </span>
        ))}
      </div>

      {/* Pillar + CTA share one column so each button sits under its card; cards stretch equal height. */}
      <div className="mt-4 grid grid-cols-1 items-stretch gap-x-2 gap-y-3 phone:mt-5 phone:grid-cols-2 phone:gap-x-3 desktop:grid-cols-3">
        {productPillars.map((pillar, index) => {
          const cta = pillarCtas.find((entry) => entry.pillarTitle === pillar.title) ?? pillarCtas[index];

          return (
            <div key={pillar.title} className="flex min-h-0 min-w-0 flex-col gap-3">
              <div className="min-h-0 flex-1">
                <MarketingLandingPillarCard {...pillar} index={index} />
              </div>
              <Link
                href={cta.href}
                className={`inline-flex w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-none border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${cta.className}`}
              >
                {cta.label}
                <ArrowRightIcon className="h-4 w-4 shrink-0" />
              </Link>
            </div>
          );
        })}
      </div>

      <MarketingLandingGuideCard />

      {/* Fills residual left-column space; lower edge aligns with Data Depot. */}
      <MarketingLandingTestnetSection />
    </motion.section>
  );
});
