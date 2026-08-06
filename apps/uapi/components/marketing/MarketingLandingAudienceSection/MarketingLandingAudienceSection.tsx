'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';
import {
  animatedMotionStyle,
  entranceEase,
  landingAudienceViewport,
} from '@/components/marketing/MarketingLandingShared/MarketingLandingShared';

function AudienceColumn({
  eyebrow,
  headline,
  pain,
  bullets,
  inPractice,
  cta,
  accent,
}: {
  eyebrow: string;
  headline: string;
  pain: string;
  bullets: readonly string[];
  inPractice: string;
  cta: { href: string; label: string };
  accent: 'orange' | 'fuchsia';
}) {
  const borderClass =
    accent === 'orange'
      ? 'border-orange-300/16'
      : 'border-fuchsia-300/16';
  const eyebrowClass =
    accent === 'orange'
      ? 'text-orange-200/72'
      : 'text-fuchsia-200/72';
  const ctaClass =
    accent === 'orange'
      ? 'border-orange-300/28 bg-orange-400/12 text-orange-50/90 hover:border-orange-300/80 hover:bg-orange-400/28 hover:shadow-[0_0_22px_rgba(251,146,60,0.28)]'
      : 'border-fuchsia-300/28 bg-fuchsia-500/12 text-fuchsia-50/90 hover:border-fuchsia-300/80 hover:bg-fuchsia-500/28 hover:shadow-[0_0_22px_rgba(232,121,249,0.28)]';

  return (
    <div
      className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-none border ${borderClass} bg-white/[0.04] px-5 pb-6 pt-5 shadow-[0_22px_60px_rgba(2,8,17,0.4)] backdrop-blur-xl tablet:px-6 tablet:pb-7 tablet:pt-6`}
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${eyebrowClass}`}
      >
        {eyebrow}
      </p>
      <h2 className="mt-3 bg-gradient-to-r from-emerald-200 via-white to-emerald-100 bg-clip-text text-[1.55rem] font-semibold leading-tight text-transparent phone:text-[1.75rem]">
        {headline}
      </h2>
      <p className="mt-3 text-[14px] leading-6 text-emerald-50/78 tablet:text-[15px]">
        {pain}
      </p>
      <ul className="mt-5 space-y-2.5">
        {bullets.map((bullet) => (
          <li
            key={bullet}
            className="flex gap-2.5 text-[13px] leading-5 text-white/88"
          >
            <span
              className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-none bg-emerald-300 shadow-[0_0_8px_rgba(103,254,183,0.55)]"
              aria-hidden="true"
            />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 flex-1 text-[13px] italic leading-6 text-emerald-100/62">
        In practice: {inPractice}
      </p>
      <Link
        href={cta.href}
        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-none border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition-[color,background-color,border-color,box-shadow] duration-200 ${ctaClass}`}
      >
        {cta.label}
        <ArrowRightIcon className="h-4 w-4 shrink-0" />
      </Link>
    </div>
  );
}

export const MarketingLandingAudienceSection = memo(
  function MarketingLandingAudienceSection() {
    const buyers = BITCODE_PUBLIC_COPY.audienceBuyers;
    const sellers = BITCODE_PUBLIC_COPY.audienceSellers;

    return (
      <motion.section
        id="landing-audience"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        // Same scroll gate as MarketingLandingScrollCue (shared constant).
        viewport={landingAudienceViewport}
        transition={{ duration: 0.8, ease: entranceEase }}
        data-testid="landing-audience-sections"
        // z-10: always paint above the scroll cue during crossfade.
        className="relative z-10 w-full scroll-mt-28 pb-1 tablet:pb-1.5 laptop:pb-2"
        style={animatedMotionStyle}
      >
        {/* Same column template + gaps as hero | depot above so outer/inner corners align. */}
        <div className="grid w-full items-stretch gap-4 laptop:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] tablet:gap-5 laptop:gap-6">
          <AudienceColumn
            eyebrow={buyers.eyebrow}
            headline={buyers.headline}
            pain={buyers.pain}
            bullets={buyers.bullets}
            inPractice={buyers.inPractice}
            cta={buyers.cta}
            accent="orange"
          />
          <AudienceColumn
            eyebrow={sellers.eyebrow}
            headline={sellers.headline}
            pain={sellers.pain}
            bullets={sellers.bullets}
            inPractice={sellers.inPractice}
            cta={sellers.cta}
            accent="fuchsia"
          />
        </div>
      </motion.section>
    );
  },
);
