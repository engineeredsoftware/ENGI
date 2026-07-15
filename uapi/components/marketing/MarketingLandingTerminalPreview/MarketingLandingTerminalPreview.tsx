'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CircleStackIcon, EyeIcon } from '@heroicons/react/24/outline';

import BitcodePill from '@/components/bitcode/branding/BitcodePill/BitcodePill';
import { QuantumOrb } from '@/components/bitcode/effects/quantum-orb';
import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';

import {
  animatedMotionStyle,
  compactPreviewCards,
  entranceEase,
  measurementAbsoluteItems,
  measurementFinalFit,
  measurementNeedinessItems,
  paintedMotionStyle,
  previewRows,
  previewValueNeonClass,
  type PreviewValueTone,
  renderOrbitalBullet,
  renderTrailingOrangeAsterisk,
  verificationRows,
  verifiedAccessOrbConfig,
} from '@/components/marketing/MarketingLandingShared/MarketingLandingShared';

/** Operator-frame mode chips: Packs purple, Deposit green, Read orange, Proofs white. */
const OPERATOR_MODE_BULLET: Record<string, 'purple' | 'orange' | 'green' | 'white'> = {
  Packs: 'purple',
  Deposit: 'green',
  Read: 'orange',
  Proofs: 'white',
};

export const MarketingLandingTerminalPreview = memo(function MarketingLandingTerminalPreview() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.12, ease: entranceEase }}
      className="relative flex h-full min-h-0 flex-col self-stretch overflow-hidden rounded-none border border-white/10 bg-white/5 p-4 shadow-[0_26px_80px_rgba(2,8,17,0.48)] backdrop-blur-xl"
      style={paintedMotionStyle}
    >
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
      <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-emerald-400/12 blur-3xl" />
      <div className="absolute -left-10 bottom-6 h-32 w-32 rounded-full bg-emerald-300/8 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <BitcodePill className="border-emerald-300/30 bg-emerald-400/10 text-emerald-100">
            <CircleStackIcon className="h-3.5 w-3.5" />
            A Data Marketplace
          </BitcodePill>
          <p className="whitespace-nowrap text-right text-[10px] uppercase tracking-[0.14em] text-emerald-200/58 phone:text-[11px] phone:tracking-[0.18em]">
            A Knowledge Depot, An Endless Economy
          </p>
        </div>

        <div className="mt-4 rounded-none border border-white/10 bg-black/30">
          <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
            <div className="flex shrink-0 items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
            </div>
            <p className="min-w-0 text-right text-[9px] uppercase leading-snug tracking-[0.12em] text-emerald-200/60 phone:text-[10px] phone:tracking-[0.16em] laptop:text-[11px] laptop:tracking-[0.18em]">
              {BITCODE_PUBLIC_COPY.terminalPreview.rail}
            </p>
          </div>

          <div className="grid gap-3 p-4 laptop:hidden">
            <div className="rounded-none border border-white/8 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/72">
                    Compact depot view
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-emerald-100/62">
                    The preview keeps AssetPacks, source-safe measurements, and settlement posture legible before the full product route opens.
                  </p>
                </div>
                <span className="inline-flex min-w-[92px] items-center justify-center rounded-none border border-emerald-300/12 bg-emerald-400/6 px-2.5 py-1 font-mono text-center text-[10px] uppercase tracking-[0.18em] text-emerald-50/72">
                  static preview
                </span>
              </div>
              <div className="mt-4 grid gap-3">
                {compactPreviewCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-none border border-white/8 bg-black/20 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/72">
                      {card.title}
                    </p>
                    <p className="mt-2 text-[13px] font-medium leading-5 text-white/88">{card.body}</p>
                    <p className="mt-2 text-[11px] leading-5 text-emerald-100/60">{card.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-none border border-white/8 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-[15px] font-semibold leading-none text-transparent">
                  {BITCODE_PUBLIC_COPY.operatorFrame.title}
                </p>
                <span className="inline-flex min-w-[92px] shrink-0 items-center justify-center rounded-none border border-white/10 bg-white/5 px-2.5 py-1.5 text-center text-[10px] uppercase leading-4 tracking-[0.16em] text-white/60">
                  {BITCODE_PUBLIC_COPY.operatorFrame.badge}
                </span>
              </div>
              <p className="mt-1 text-[12px] uppercase leading-4 tracking-[0.12em] text-emerald-100/58">
                {BITCODE_PUBLIC_COPY.operatorFrame.subtitle}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {BITCODE_PUBLIC_COPY.operatorFrame.modes.map((surface) => (
                  <span
                    key={surface}
                    className="inline-flex items-center gap-2 rounded-none border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/84"
                  >
                    {renderOrbitalBullet(
                      'scale-100',
                      OPERATOR_MODE_BULLET[surface] ?? 'purple',
                    )}
                    {surface}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mosaic: equal gap-3; columns stretch; last card per column flex-1 so bottoms meet. */}
          <div className="hidden gap-3 p-4 laptop:grid laptop:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] laptop:grid-rows-1 laptop:items-stretch">
            <div className="flex h-full min-h-0 flex-col gap-3 self-stretch">
              <div className="shrink-0 rounded-none border border-white/8 bg-white/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/72">
                  Source Measurements
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-[13px] font-medium text-white">Absolutes</p>
                    <ul className="mt-2 space-y-1.5">
                      {measurementAbsoluteItems.map((item, index) => (
                        <li key={item.label}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="min-w-0 truncate text-[11px] leading-4 text-emerald-100/70">
                              {item.label}
                            </p>
                            <span className="shrink-0 font-mono text-[10px] tabular-nums text-emerald-200/68">
                              {item.value}
                            </span>
                          </div>
                          <div className="mt-1 h-1 overflow-hidden rounded-none bg-white/6">
                            <div className="h-full origin-left" style={{ width: `${item.value}%` }}>
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{
                                  duration: 0.7,
                                  delay: 0.28 + index * 0.03,
                                  ease: entranceEase,
                                }}
                                className="h-full rounded-none bg-gradient-to-r from-emerald-500/55 via-emerald-300/70 to-emerald-100/80"
                                style={{ ...animatedMotionStyle, transformOrigin: 'left center' }}
                              />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-[13px] font-medium text-white">Needinesses</p>
                    <ul className="mt-2 space-y-1.5">
                      {measurementNeedinessItems.map((item, index) => (
                        <li key={item.label}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="min-w-0 truncate text-[11px] leading-4 text-emerald-100/70">
                              <span className="text-emerald-100/48">{item.detail}</span>
                              <span className="mx-1 text-emerald-100/28">·</span>
                              {item.label}
                            </p>
                            <span className="shrink-0 font-mono text-[10px] tabular-nums text-emerald-200/68">
                              {item.value}
                            </span>
                          </div>
                          <div className="mt-1 h-1 overflow-hidden rounded-none bg-white/6">
                            <div className="h-full origin-left" style={{ width: `${item.value}%` }}>
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{
                                  duration: 0.7,
                                  delay: 0.48 + index * 0.04,
                                  ease: entranceEase,
                                }}
                                className="h-full rounded-none bg-gradient-to-r from-emerald-500/55 via-emerald-300/70 to-emerald-100/80"
                                style={{ ...animatedMotionStyle, transformOrigin: 'left center' }}
                              />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-none border border-emerald-300/18 bg-emerald-400/[0.07] p-3 shadow-[inset_0_1px_0_rgba(103,254,183,0.08)]">
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="bg-gradient-to-r from-emerald-200 via-white to-emerald-100 bg-clip-text text-[15px] font-semibold text-transparent">
                          {measurementFinalFit.label}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-emerald-100/72">
                          {measurementFinalFit.detail}
                        </p>
                      </div>
                      <span className="shrink-0 text-[14px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
                        {measurementFinalFit.value}
                      </span>
                    </div>
                    <div className="mt-2.5 h-2.5 overflow-hidden rounded-none bg-black/30">
                      <div
                        className="h-full origin-left"
                        style={{ width: `${measurementFinalFit.barPercent}%` }}
                      >
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 1, delay: 0.55, ease: entranceEase }}
                          className="h-full rounded-none bg-gradient-to-r from-emerald-500/80 via-emerald-300 to-white shadow-[0_0_14px_rgba(103,254,183,0.35)]"
                          style={{ ...animatedMotionStyle, transformOrigin: 'left center' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 rounded-none border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 bg-clip-text text-[15px] font-semibold leading-none text-transparent">
                    {BITCODE_PUBLIC_COPY.operatorFrame.title}
                  </p>
                  <span className="inline-flex min-w-[92px] shrink-0 items-center justify-center rounded-none border border-white/10 bg-white/5 px-2.5 py-1.5 text-center text-[10px] uppercase leading-4 tracking-[0.16em] text-white/60">
                    {BITCODE_PUBLIC_COPY.operatorFrame.badge}
                  </span>
                </div>
                {/* Full-width subtitle — avoids one-word-per-line squeeze beside the badge. */}
                <p className="mt-1 text-[12px] uppercase leading-4 tracking-[0.12em] text-emerald-100/58">
                  {BITCODE_PUBLIC_COPY.operatorFrame.subtitle}
                </p>
                <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 laptop:gap-x-4 laptop:gap-y-3">
                  {BITCODE_PUBLIC_COPY.operatorFrame.modes.map((surface) => (
                    <li
                      key={surface}
                      className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-3 tablet:grid-cols-[32px_minmax(0,1fr)] tablet:gap-4 laptop:grid-cols-[24px_minmax(0,1fr)] laptop:gap-3"
                    >
                      {renderOrbitalBullet(
                        'scale-110 tablet:scale-[1.25] laptop:scale-100',
                        OPERATOR_MODE_BULLET[surface] ?? 'purple',
                      )}
                      <span className="text-left text-[15px] leading-snug text-white/90 tablet:text-[17px] laptop:text-[13px]">
                        {surface}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border border-cyan-300/12 bg-[linear-gradient(135deg,rgba(6,13,24,0.96),rgba(4,22,31,0.92))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,254,183,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_34%)]" />
                <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:28px_28px]" />
                <div className="pointer-events-none absolute right-8 top-8 h-[72px] w-[72px] overflow-visible">
                  <QuantumOrb
                    size={72}
                    config={verifiedAccessOrbConfig}
                    initialState="active"
                    interactive={false}
                    respectReducedMotion={false}
                  />
                </div>

                <div className="relative flex min-h-0 flex-1 flex-col">
                  <div className="pr-20">
                    <div className="min-w-0">
                      <p className="bg-gradient-to-r from-emerald-200 via-cyan-200 to-white bg-clip-text text-sm font-semibold text-transparent">
                        Source Safety
                      </p>
                      <div className="mt-1 space-y-0.5 text-[11px] uppercase leading-4 tracking-[0.14em] text-emerald-100/58">
                        <p className="whitespace-nowrap">Public Measures</p>
                        <p className="whitespace-nowrap">Private Source</p>
                        <p className="whitespace-nowrap">Auditable Trade</p>
                      </div>
                    </div>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-none border border-emerald-300/14 bg-emerald-400/8 px-2 py-1 text-[8px] uppercase tracking-[0.14em] text-emerald-50/72">
                      <EyeIcon className="h-3 w-3" />
                      Fitting Pays
                    </span>
                  </div>

                  <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3">
                    {verificationRows.map(({ label, detail, status, Icon: VerificationIcon }) => (
                      <div
                        key={label}
                        className="flex min-h-0 flex-1 flex-col justify-center rounded-none border border-white/8 bg-black/20 px-3 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-none border border-white/10 bg-white/6 text-emerald-200/78">
                              <VerificationIcon className="h-3.5 w-3.5" />
                            </span>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/88">
                              {label}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-none border border-cyan-200/12 bg-cyan-400/8 px-2 py-0.5 text-[8px] uppercase tracking-[0.14em] text-cyan-100/72">
                            {renderTrailingOrangeAsterisk(
                              status,
                              'origin-center scale-[1.875] tablet:scale-[2.125] laptop:scale-[1.75]',
                            )}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] leading-5 text-emerald-100/66">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-full min-h-0 flex-col gap-3 self-stretch">
              <div className="shrink-0 rounded-none border border-white/8 bg-white/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/72">
                  {BITCODE_PUBLIC_COPY.giveContribution.title}
                </p>
                <div className="mt-4 space-y-3 font-mono text-[12px] leading-5 text-emerald-100/80">
                  {previewRows.map((row) => {
                    const {
                      key,
                      valueParts,
                      Icon: RowIcon,
                      accentClassName,
                      valuesGridClassName,
                      iconClassName,
                    } = row;
                    const valueTones =
                      'valueTones' in row
                        ? (row.valueTones as Partial<Record<string, PreviewValueTone>>)
                        : undefined;

                    return (
                      <div
                        key={key}
                        className="relative overflow-hidden rounded-none border border-white/6 bg-black/20 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      >
                        <span className={`absolute inset-0 bg-gradient-to-r opacity-45 ${accentClassName}`} />
                        <span className="absolute inset-[1px] rounded-none border border-white/6" />
                        <div className="relative">
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-white/10 bg-white/[0.04] ${iconClassName}`}
                            >
                              {/* Larger glyph; square chrome stays h-9 w-9. */}
                              <RowIcon className="h-6 w-6" strokeWidth={1.5} />
                            </span>
                            <p className="text-[12px] uppercase tracking-[0.18em] text-emerald-200/62 tablet:text-[13px] laptop:text-[12px]">
                              {key}
                            </p>
                          </div>
                          <div
                            className={`mt-3 grid min-w-0 gap-x-4 gap-y-3 text-emerald-50/88 laptop:gap-x-3 laptop:gap-y-2 ${valuesGridClassName}`}
                          >
                            {valueParts.map((valuePart) => {
                              const tone = valueTones?.[valuePart];

                              return (
                                <span
                                  key={`${key}-${valuePart}`}
                                  className="inline-flex min-w-0 max-w-full items-center gap-2 tablet:gap-2.5"
                                >
                                  <span className="shrink-0">
                                    {renderOrbitalBullet(
                                      'scale-110 tablet:scale-[1.2] laptop:scale-100',
                                      tone ?? 'orange',
                                    )}
                                  </span>
                                  <span
                                    className={`min-w-0 flex-1 whitespace-nowrap text-[13px] leading-5 tablet:text-[15px] laptop:text-[12px] laptop:leading-5 ${
                                      tone ? previewValueNeonClass[tone] : ''
                                    }`}
                                  >
                                    {valuePart}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 rounded-none border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  {/* Same chrome as Marketplace title/badge; keep emerald→orange gradient unique. */}
                  <p className="min-w-0 whitespace-nowrap bg-gradient-to-r from-emerald-200 via-white to-orange-200 bg-clip-text text-[15px] font-semibold leading-none text-transparent">
                    {BITCODE_PUBLIC_COPY.sourceToSettlement.title}
                  </p>
                  <span className="inline-flex shrink-0 items-center justify-center rounded-none border border-white/10 bg-white/5 px-1.5 py-1.5 text-center text-[10px] uppercase leading-4 tracking-[0.14em] text-white/60">
                    {BITCODE_PUBLIC_COPY.sourceToSettlement.badge}
                  </span>
                </div>
                {/* Full-width subtitle — avoids one-word-per-line squeeze beside the badge. */}
                <p className="mt-1 text-[12px] uppercase leading-4 tracking-[0.12em] text-emerald-100/58">
                  {BITCODE_PUBLIC_COPY.sourceToSettlement.subtitle}
                </p>
                <p className="mt-3 text-[14px] leading-6 text-emerald-100/72">
                  Commits, citations, authorship, and metadata stay attached as deposit-side context for later proof and settlement.
                </p>
                <div className="mt-4 rounded-none border border-emerald-300/12 bg-emerald-400/6 p-3">
                  <div className="grid gap-3">
                    <span className="inline-flex min-w-0 items-center justify-center gap-2 rounded-none border border-white/10 bg-black/20 px-3 py-2.5 text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-50/90">
                      <span className="text-emerald-200/52">
                        {BITCODE_PUBLIC_COPY.sourceToSettlement.stages[0].number}
                      </span>
                      {BITCODE_PUBLIC_COPY.sourceToSettlement.stages[0].stage}
                    </span>
                    <div className="grid gap-2">
                      {[
                        BITCODE_PUBLIC_COPY.sourceToSettlement.stages.slice(1, 3),
                        BITCODE_PUBLIC_COPY.sourceToSettlement.stages.slice(3, 5),
                      ].map((row, rowIndex) => (
                        <div
                          key={`canonical-middle-row-${rowIndex}`}
                          className="grid grid-cols-[minmax(0,1fr)_18px_minmax(0,1fr)] items-center gap-2"
                        >
                          <span className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-none border border-white/10 bg-black/20 px-2 py-1.5 text-[9px] font-mono uppercase tracking-[0.1em] text-emerald-50/90">
                            <span className="text-emerald-200/52">{row[0].number}</span>
                            {row[0].stage}
                          </span>
                          <ArrowRightIcon className="h-3.5 w-3.5 text-emerald-200/32" />
                          <span className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-none border border-white/10 bg-black/20 px-2 py-1.5 text-[9px] font-mono uppercase tracking-[0.1em] text-emerald-50/90">
                            <span className="text-emerald-200/52">{row[1].number}</span>
                            {row[1].stage}
                          </span>
                        </div>
                      ))}
                    </div>
                    <span className="inline-flex min-w-0 items-center justify-center gap-2 rounded-none border border-white/10 bg-black/20 px-3 py-2.5 text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-50/90">
                      <span className="text-emerald-200/52">
                        {BITCODE_PUBLIC_COPY.sourceToSettlement.stages[5].number}
                      </span>
                      {BITCODE_PUBLIC_COPY.sourceToSettlement.stages[5].stage}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border border-orange-300/16 bg-[linear-gradient(160deg,rgba(23,9,0,0.96),rgba(12,8,4,0.94)_55%,rgba(4,10,16,0.96))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.08),transparent_32%)]" />
                <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]" />
                <div className="relative flex min-h-0 flex-1 flex-col">
                  <p className="whitespace-nowrap bg-gradient-to-r from-orange-100 via-amber-100 to-white bg-clip-text text-[13px] font-semibold tracking-tight text-transparent">
                    {BITCODE_PUBLIC_COPY.settlementLedger.title}
                  </p>
                  <p className="mt-0.5 whitespace-nowrap text-[10px] uppercase tracking-[0.14em] text-orange-100/58">
                    {BITCODE_PUBLIC_COPY.settlementLedger.subtitle}
                  </p>
                  <ul className="mt-3 flex min-h-0 flex-1 flex-col gap-3">
                    {BITCODE_PUBLIC_COPY.settlementLedger.rows.map((row) => (
                      <li
                        key={row.label}
                        className="flex min-h-0 flex-1 flex-col justify-center rounded-none border border-orange-200/10 bg-black/25 px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-50/92">
                          {row.label}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-4 text-orange-100/68">{row.detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
});
