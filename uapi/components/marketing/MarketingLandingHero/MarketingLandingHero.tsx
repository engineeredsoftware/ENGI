'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

import Logo from '@/components/bitcode/branding/Logo/Logo';
import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';
import MultiLineTypingAnimation from '@/components/bitcode/MultiLineTypingAnimation/MultiLineTypingAnimation';

import { MarketingLandingGuideCard } from '@/components/marketing/MarketingLandingGuideCard/MarketingLandingGuideCard';
import { MarketingLandingPillarCard } from '@/components/marketing/MarketingLandingPillarCard/MarketingLandingPillarCard';
import {
  animatedMotionStyle,
  entranceEase,
  headlineHighlights,
  headlineText,
  productPillars,
} from '@/components/marketing/MarketingLandingShared/MarketingLandingShared';

export const MarketingLandingHero = memo(function MarketingLandingHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: entranceEase }}
      className="flex flex-col justify-center"
      style={animatedMotionStyle}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 shadow-[0_0_28px_rgba(103,254,183,0.14)]">
          <Logo height="h-7" width="w-7" />
        </div>
      </div>

      <div className="mt-4 max-w-2xl space-y-4 phone:mt-5">
        <p className="max-w-xl text-[11px] uppercase tracking-[0.26em] text-emerald-200/70">
          {BITCODE_PUBLIC_COPY.eyebrow}
        </p>
        <h1 className="text-[2.35rem] font-semibold leading-[0.96] text-white phone:text-[2.9rem] tablet:text-[3.6rem] laptop:text-[4.35rem]">
          <div className="relative max-w-[13ch] phone:max-w-[14ch] tablet:max-w-[15ch] laptop:max-w-[16ch]">
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
          {BITCODE_PUBLIC_COPY.description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-emerald-200/68 phone:mt-5">
        {BITCODE_PUBLIC_COPY.capabilityChips.map((item) => (
          <span
            key={item}
            className="relative overflow-hidden rounded-[18px] border border-cyan-200/18 bg-[linear-gradient(135deg,rgba(9,22,48,0.82),rgba(18,49,88,0.38))] px-3 py-2 text-cyan-100 shadow-[0_12px_28px_rgba(6,182,212,0.08)] backdrop-blur-md"
          >
            <span
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 32px)',
              }}
            />
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,254,183,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_34%)]" />
            <span className="absolute inset-[1px] rounded-[17px] border border-white/8" />
            <span className="relative">{item}</span>
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 phone:mt-5 phone:grid-cols-2 phone:gap-3 desktop:grid-cols-3">
        {productPillars.map((pillar, index) => (
          <MarketingLandingPillarCard key={pillar.title} {...pillar} index={index} />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 phone:mt-5">
        <Link
          href={BITCODE_PUBLIC_COPY.primaryCta.href}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-300/24 bg-emerald-400/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50 transition-colors hover:border-emerald-300/42 hover:bg-emerald-400/16"
        >
          {BITCODE_PUBLIC_COPY.primaryCta.label}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <Link
          href={BITCODE_PUBLIC_COPY.secondaryCta.href}
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/84 transition-colors hover:border-white/24 hover:bg-white/10"
        >
          {BITCODE_PUBLIC_COPY.secondaryCta.label}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <MarketingLandingGuideCard />
    </motion.section>
  );
});
