'use client';

/**
 * Compact production-band strip (under Code ⇄ Coin, above micro-blog).
 * Content-height only — no flex growth into residual (avoids empty lower pad
 * / inner scroll). ETH·BTC·SOL and $BTD/DataPack badges sit absolute in the
 * top-row whitespace above steps 3–4 (out of flow).
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';

import DataPackMark from '@/components/bitcode/branding/DataPackMark/DataPackMark';
import Logo from '@/components/bitcode/branding/Logo/Logo';
import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';
import {
  animatedMotionStyle,
  entranceEase,
} from '@/components/marketing/MarketingLandingShared/MarketingLandingShared';

export const MarketingLandingValueFlow = memo(function MarketingLandingValueFlow() {
  const { eyebrow, title, steps, rails } = BITCODE_PUBLIC_COPY.valueFlow;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: entranceEase }}
      data-testid="landing-value-flow"
      className="relative flex w-full shrink-0 flex-col overflow-visible rounded-none border border-emerald-300/16 bg-[linear-gradient(155deg,rgba(4,14,20,0.96),rgba(5,18,24,0.94)_48%,rgba(3,10,16,0.98))] px-3 pb-2.5 pt-2.5 shadow-[0_18px_48px_rgba(2,8,17,0.4),inset_0_1px_0_rgba(103,254,183,0.1)] tablet:px-3.5 tablet:pb-3 tablet:pt-3"
      style={animatedMotionStyle}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,254,183,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.08),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/55 to-transparent" />

      <div className="relative flex flex-col">
        {/* Title row + chip lane share the top band (chips absolute into right whitespace). */}
        <div className="relative min-w-0 pb-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-200/68">
            {eyebrow}
          </p>
          <h3 className="mt-1 max-w-[55%] bg-gradient-to-r from-emerald-200 via-white to-cyan-100 bg-clip-text text-[0.95rem] font-semibold leading-none text-transparent phone:text-[1.02rem]">
            {title}
          </h3>

          {/*
            Chips in the top-row whitespace (cols 3–4), absolute — do not grow
            the numbered card row or add lower pad.
          */}
          <div
            className="pointer-events-none absolute bottom-0 right-0 top-0 z-[1] flex w-[48%] min-w-0 items-end gap-0 pb-0.5"
            aria-hidden="true"
          >
            <div className="flex min-w-0 flex-1 items-end justify-center">
              <div className="flex flex-wrap items-center justify-center gap-0.5">
                {rails.map((rail) => (
                  <span
                    key={rail}
                    className="inline-flex items-center rounded-none border border-orange-300/35 bg-orange-400/14 px-1 py-px font-mono text-[8px] font-semibold uppercase tracking-[0.1em] text-orange-100/92 shadow-[0_0_8px_rgba(251,146,60,0.16)] phone:text-[9px]"
                  >
                    {rail}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-end justify-center">
              <div className="flex items-center justify-center gap-1">
                <span className="inline-flex h-[1.125rem] items-center gap-0.5 rounded-none border border-emerald-300/40 bg-emerald-400/14 px-1.5 shadow-[0_0_12px_rgba(103,254,183,0.22)]">
                  <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center leading-none">
                    <Logo
                      className="flex h-3 w-3 items-center justify-center leading-none"
                      height="h-3"
                      width="w-3"
                      fill="#a7f3d0"
                    />
                  </span>
                  <span className="font-mono text-[8px] font-semibold leading-none tracking-tight text-emerald-50 phone:text-[9px]">
                    $BTD
                  </span>
                </span>
                <span className="inline-flex h-[1.125rem] items-center gap-0.5 rounded-none border border-fuchsia-300/35 bg-fuchsia-500/14 px-1.5 shadow-[0_0_12px_rgba(232,121,249,0.2)]">
                  <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center leading-none">
                    <DataPackMark
                      className="block h-3 w-3"
                      height="h-3"
                      width="w-3"
                      variant="dual"
                      title={null}
                    />
                  </span>
                  <span className="text-[8px] font-semibold leading-none tracking-tight text-fuchsia-100/95 phone:text-[9px]">
                    DataPack
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <ol className="flex min-w-0 items-stretch gap-0">
          {steps.map((step, index) => {
            const isMint = index === 3;
            return (
              <li key={step.label} className="flex min-w-0 flex-1 items-stretch">
                <div
                  className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-none border px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] phone:gap-2 phone:px-2 phone:py-2 ${
                    isMint
                      ? 'border-emerald-300/45 bg-[linear-gradient(160deg,rgba(8,36,28,0.95),rgba(4,18,16,0.98))] shadow-[0_0_16px_rgba(103,254,183,0.14),inset_0_1px_0_rgba(103,254,183,0.2)]'
                      : 'border-white/14 bg-black/35'
                  }`}
                  title={step.detail}
                >
                  <span
                    className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-none border font-mono text-[8px] font-semibold tabular-nums phone:h-[1.125rem] phone:w-[1.125rem] phone:text-[9px] ${
                      isMint
                        ? 'border-emerald-300/50 bg-emerald-400/20 text-emerald-50 shadow-[0_0_10px_rgba(103,254,183,0.35)]'
                        : 'border-emerald-300/30 bg-emerald-400/12 text-emerald-100/95'
                    }`}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`min-w-0 truncate text-[10px] font-semibold leading-none tracking-tight phone:text-[11px] ${
                      isMint
                        ? 'text-emerald-50 [text-shadow:0_0_12px_rgba(103,254,183,0.45)]'
                        : 'text-white/90'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 ? (
                  <span
                    className="mx-0.5 flex w-2 shrink-0 items-center justify-center self-center text-[9px] text-emerald-300/40 phone:mx-1 phone:w-2.5"
                    aria-hidden="true"
                  >
                    →
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </motion.section>
  );
});
