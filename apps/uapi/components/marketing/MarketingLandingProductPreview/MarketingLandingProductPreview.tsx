'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  CircleStackIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

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
  verificationRows,
  verifiedAccessOrbConfig,
} from '@/components/marketing/MarketingLandingShared/MarketingLandingShared';

/**
 * Normalized depot panel header chrome (all 6 right-column panels).
 * - Title: 14px / semibold / leading-none
 * - Subtitle: mt-2 under title; 10px uppercase tight tracking
 * - Body gap: mt-3 after subtitle / chips, mt-3.5 when title-only
 */
const PANEL_TITLE =
  'text-[14px] font-semibold leading-none tracking-tight';
const PANEL_TITLE_GRADIENT = `${PANEL_TITLE} whitespace-nowrap pe-[0.12em] bg-clip-text text-transparent`;
const PANEL_SUBTITLE =
  'mt-2 whitespace-nowrap text-[10px] font-medium uppercase leading-none tracking-[0.1em] text-emerald-100/58';
const PANEL_SUBTITLE_STACK =
  'mt-2 space-y-0.5 text-[10px] font-medium uppercase leading-none tracking-[0.12em] text-emerald-100/58';
const PANEL_BADGE =
  'inline-flex shrink-0 items-center justify-center rounded-none border border-white/10 bg-white/5 px-2 py-1 text-center text-[9px] uppercase leading-none tracking-[0.12em] text-white/60';
/** Gap: subtitle → body cards (or chips → body cards). */
const PANEL_BODY_AFTER_SUBTITLE = 'mt-3';
/** Gap: title-only → body cards. */
const PANEL_BODY_AFTER_TITLE = 'mt-3.5';
/** Gap: stacked subtitle → chip row (Safe on both sides). */
const PANEL_CHIPS_AFTER_SUBTITLE = 'mt-2';
/** Vertical pad on the Secrets / Rights / On-chain chip row (both sides). */
const PANEL_CHIPS_ROW_Y = 'py-1.5';
/** Y-gap between inner content cards — all row-card panels (same flex+gap). */
const PANEL_INNER_CARD_GAP = 'gap-1.5';

/**
 * Inner content-card shells — same treatment on all 4 row panels
 * (Market · Tokenomics · Safe · Three things). Per-panel tint for identity;
 * shared opacity/fill so every row edge is equally legible.
 */
const INNER_CARD = {
  market:
    'rounded-none border border-fuchsia-200/28 bg-black/40 px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  token:
    'rounded-none border border-emerald-200/28 bg-black/40 px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  safety:
    'rounded-none border border-cyan-200/28 bg-black/40 px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  ledger:
    'rounded-none border border-orange-200/28 bg-black/40 px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
} as const;

/**
 * Containing-panel backgrounds — same chrome as Safe / Three things:
 * themed linear fill + soft radial wash + micro-grid. Soft theme edge only
 * (not a heavy frame); legibility stays on INNER_CARD rows.
 */
const PANEL_THEME = {
  measures: {
    shell:
      'relative shrink-0 overflow-hidden rounded-none border border-cyan-300/14 bg-[linear-gradient(160deg,rgba(4,14,20,0.96),rgba(4,18,22,0.94)_52%,rgba(3,12,16,0.96))] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.22)]',
    radial:
      'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,254,183,0.14),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.1),transparent_34%)]',
  },
  market: {
    shell:
      'relative shrink-0 overflow-hidden rounded-none border border-fuchsia-300/10 bg-[linear-gradient(160deg,rgba(14,6,20,0.96),rgba(12,6,18,0.94)_52%,rgba(8,4,14,0.96))] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.22)]',
    radial:
      'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,121,249,0.14),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(244,63,94,0.08),transparent_34%)]',
  },
  selling: {
    shell:
      'relative shrink-0 overflow-hidden rounded-none border border-teal-300/14 bg-[linear-gradient(160deg,rgba(4,16,18,0.96),rgba(3,14,16,0.94)_52%,rgba(3,12,14,0.96))] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.22)]',
    radial:
      'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.12),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.08),transparent_34%)]',
  },
  token: {
    shell:
      'relative shrink-0 overflow-hidden rounded-none border border-emerald-300/10 bg-[linear-gradient(160deg,rgba(4,16,14,0.96),rgba(4,14,12,0.94)_52%,rgba(3,12,10,0.96))] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.22)]',
    radial:
      'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.14),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.08),transparent_34%)]',
  },
} as const;

const PANEL_GRID =
  'pointer-events-none absolute inset-0 opacity-15 [background-image:linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]';

function ThemedPanel({
  theme,
  children,
}: {
  theme: keyof typeof PANEL_THEME;
  children: React.ReactNode;
}) {
  const { shell, radial } = PANEL_THEME[theme];
  return (
    <div className={shell}>
      <div className={radial} />
      <div className={PANEL_GRID} />
      <div className="relative">{children}</div>
    </div>
  );
}

const TITLE_GRADIENT = {
  market: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-400',
  token: 'bg-gradient-to-r from-emerald-200 via-white to-orange-200',
  safety: 'bg-gradient-to-r from-emerald-200 via-cyan-200 to-white',
  ledger: 'bg-gradient-to-r from-orange-100 via-amber-100 to-white',
  measures: 'bg-gradient-to-r from-emerald-200 via-cyan-100 to-white',
  selling: 'bg-gradient-to-r from-emerald-100 via-white to-teal-100',
  plain: 'text-emerald-100/90',
} as const;

/** Compact label+detail rows shared by Liquid Market / Tokenomics. */
function PanelRows({
  rows,
  dense = false,
  tone = 'market',
}: {
  rows: ReadonlyArray<{ label: string; detail: string }>;
  dense?: boolean;
  tone?: 'market' | 'token';
}) {
  const rowShell = tone === 'token' ? INNER_CARD.token : INNER_CARD.market;

  return (
    <ul
      className={
        dense
          ? `${PANEL_BODY_AFTER_SUBTITLE} flex flex-col ${PANEL_INNER_CARD_GAP}`
          : `${PANEL_BODY_AFTER_SUBTITLE} flex flex-col gap-2`
      }
    >
      {rows.map((row) => (
        <li key={row.label} className={rowShell}>
          {/* Sentence case + tight tracking keeps long titles one line in the column. */}
          <p className="truncate text-[12px] font-semibold leading-snug tracking-tight text-white/90">
            {row.label}
          </p>
          <p className="mt-0.5 text-[11.625px] leading-snug text-emerald-100/68">{row.detail}</p>
        </li>
      ))}
    </ul>
  );
}

function PanelTitleRow({
  title,
  badge,
  gradient = 'plain',
  className = '',
}: {
  title: string;
  badge?: string;
  gradient?: keyof typeof TITLE_GRADIENT;
  className?: string;
}) {
  const isGradient = gradient !== 'plain';
  return (
    <div className={`flex items-center justify-between gap-2 ${className}`.trim()}>
      <p
        className={
          isGradient
            ? `min-w-0 flex-1 ${PANEL_TITLE_GRADIENT} ${TITLE_GRADIENT[gradient]}`
            : `min-w-0 flex-1 ${PANEL_TITLE} ${TITLE_GRADIENT.plain}`
        }
      >
        {title}
      </p>
      {badge ? <span className={PANEL_BADGE}>{badge}</span> : null}
    </div>
  );
}

function PanelSubtitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`${PANEL_SUBTITLE} ${className}`.trim()}>{children}</p>;
}

export type ProductPreviewVariant = 'upper' | 'lower';

function DepotChrome({
  children,
  testId,
  /**
   * `mount` — opening-band upper depot (animates with page load).
   * `scroll` — production-band lower depot (matches Code ⇄ Coin whileInView).
   */
  entrance = 'mount',
}: {
  children: React.ReactNode;
  testId?: string;
  entrance?: 'mount' | 'scroll';
}) {
  const scrollInView = entrance === 'scroll';

  return (
    <motion.aside
      initial={{ opacity: 0, y: scrollInView ? 22 : 28 }}
      {...(scrollInView
        ? {
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: '-60px' },
            transition: { duration: 0.85, ease: entranceEase },
          }
        : {
            animate: { opacity: 1, y: 0 },
            transition: { duration: 1, delay: 0.12, ease: entranceEase },
          })}
      data-testid={testId}
      className="relative flex h-full w-full min-h-0 flex-col self-stretch overflow-hidden rounded-none border border-white/10 bg-white/5 p-4 shadow-[0_26px_80px_rgba(2,8,17,0.48)] backdrop-blur-xl"
      style={paintedMotionStyle}
    >
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
      <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-emerald-400/12 blur-3xl" />
      <div className="absolute -left-10 bottom-6 h-32 w-32 rounded-full bg-emerald-300/8 blur-3xl" />
      <div className="relative">{children}</div>
    </motion.aside>
  );
}

function MeasuresPanel() {
  return (
    <ThemedPanel theme="measures">
      <PanelTitleRow title="Source Measurements" gradient="measures" />

      <div className={`${PANEL_BODY_AFTER_TITLE} space-y-4`}>
        <div>
          <p className="text-[13px] font-medium text-white">Absolutes</p>
          <ul className="mt-2 space-y-1.5">
            {measurementAbsoluteItems.map((item, index) => (
              <li key={item.label}>
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-[11px] leading-4 text-emerald-50/90">
                    {item.label}
                  </p>
                  <span className="shrink-0 font-mono text-[10px] tabular-nums text-emerald-100/82">
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
            {measurementNeedinessItems.map((item, index) => {
              const isDynamic = item.detail === 'dynamic';

              return (
                <li key={item.label}>
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`min-w-0 whitespace-nowrap text-[11px] leading-4 ${
                        isDynamic ? 'text-emerald-50/88' : 'text-emerald-50/90'
                      }`}
                      title={
                        isDynamic
                          ? 'Need-inferred fit measurement synthesized for the reader’s Need, then scored'
                          : undefined
                      }
                    >
                      <span
                        className={
                          isDynamic
                            ? 'bg-gradient-to-r from-fuchsia-300 via-violet-300 to-orange-300 bg-clip-text font-semibold uppercase tracking-[0.12em] text-transparent'
                            : 'text-emerald-100/72'
                        }
                      >
                        {item.detail}
                      </span>
                      <span
                        className={`mx-1 ${
                          isDynamic ? 'text-orange-300/60' : 'text-emerald-100/45'
                        }`}
                      >
                        {isDynamic ? '*' : '·'}
                      </span>
                      {item.label}
                    </p>
                    <span
                      className={`shrink-0 font-mono text-[10px] tabular-nums ${
                        isDynamic ? 'text-orange-100/90' : 'text-emerald-100/82'
                      }`}
                    >
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
                        className={`h-full rounded-none ${
                          isDynamic
                            ? 'bg-gradient-to-r from-fuchsia-500/60 via-violet-400/70 to-orange-300/90 shadow-[0_0_10px_rgba(251,146,60,0.28)]'
                            : 'bg-gradient-to-r from-emerald-500/55 via-emerald-300/70 to-emerald-100/80'
                        }`}
                        style={{ ...animatedMotionStyle, transformOrigin: 'left center' }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-none border border-emerald-300/18 bg-emerald-400/[0.07] p-3 shadow-[inset_0_1px_0_rgba(103,254,183,0.08)]">
          <p className="whitespace-nowrap bg-gradient-to-r from-emerald-200 via-white to-emerald-100 bg-clip-text pe-[0.15em] text-[15px] font-semibold text-transparent">
            {measurementFinalFit.label}
          </p>
          <p className="mt-1 text-[11px] leading-4 text-emerald-100/72">
            {measurementFinalFit.detail}
          </p>
          <div className="mt-2.5 flex items-center gap-2.5">
            <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-none bg-black/30">
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
            <span className="shrink-0 font-mono text-[12px] font-semibold tabular-nums tracking-[0.08em] text-emerald-100">
              {measurementFinalFit.value}
            </span>
          </div>
        </div>
      </div>
    </ThemedPanel>
  );
}

function SellingPanel() {
  return (
    <ThemedPanel theme="selling">
      <PanelTitleRow title={BITCODE_PUBLIC_COPY.giveContribution.title} gradient="selling" />
      <div
        className={`${PANEL_BODY_AFTER_TITLE} space-y-3 font-mono text-[12px] leading-5 text-emerald-100/80`}
      >
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
          const bulletToneDefault =
            'bulletTone' in row
              ? (row.bulletTone as PreviewValueTone)
              : ('orange' as PreviewValueTone);

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
                    className={`inline-flex h-[2.125rem] w-[2.125rem] shrink-0 items-center justify-center rounded-none border border-white/10 bg-white/[0.04] ${iconClassName}`}
                  >
                    <RowIcon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <p className="text-[12px] uppercase tracking-[0.18em] text-emerald-200/62 tablet:text-[13px] laptop:text-[12px]">
                    {key}
                  </p>
                </div>
                <div
                  className={`mt-3 grid min-w-0 gap-x-4 gap-y-3 laptop:gap-x-3 laptop:gap-y-2 ${valuesGridClassName}`}
                >
                  {valueParts.map((valuePart) => {
                    const neonTone = valueTones?.[valuePart];
                    const bulletTone = neonTone ?? bulletToneDefault;

                    return (
                      <span
                        key={`${key}-${valuePart}`}
                        className="inline-flex min-w-0 max-w-full items-center gap-2 tablet:gap-2.5"
                      >
                        <span className="shrink-0">
                          {renderOrbitalBullet(
                            'scale-110 tablet:scale-[1.2] laptop:scale-100',
                            bulletTone,
                          )}
                        </span>
                        <span
                          className={`min-w-0 flex-1 whitespace-nowrap text-[13px] leading-5 tablet:text-[15px] laptop:text-[12px] laptop:leading-5 ${
                            neonTone ? previewValueNeonClass[neonTone] : 'text-emerald-50/95'
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
    </ThemedPanel>
  );
}

function MarketPanel() {
  return (
    <ThemedPanel theme="market">
      <PanelTitleRow
        title={BITCODE_PUBLIC_COPY.operatorFrame.title}
        badge={BITCODE_PUBLIC_COPY.operatorFrame.badge}
        gradient="market"
      />
      <PanelSubtitle>{BITCODE_PUBLIC_COPY.operatorFrame.subtitle}</PanelSubtitle>
      <PanelRows rows={BITCODE_PUBLIC_COPY.operatorFrame.rows} dense tone="market" />
    </ThemedPanel>
  );
}

function TokenPanel() {
  return (
    <ThemedPanel theme="token">
      <PanelTitleRow
        title={BITCODE_PUBLIC_COPY.sourceToSettlement.title}
        badge={BITCODE_PUBLIC_COPY.sourceToSettlement.badge}
        gradient="token"
      />
      <PanelSubtitle>{BITCODE_PUBLIC_COPY.sourceToSettlement.subtitle}</PanelSubtitle>
      <PanelRows rows={BITCODE_PUBLIC_COPY.sourceToSettlement.rows} dense tone="token" />
    </ThemedPanel>
  );
}

function SafetyPanel() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border border-cyan-300/10 bg-[linear-gradient(135deg,rgba(6,13,24,0.96),rgba(4,22,31,0.92))] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,254,183,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_34%)]" />
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute right-[22px] top-[22px] h-[48px] w-[48px] overflow-visible">
        <QuantumOrb
          size={48}
          config={verifiedAccessOrbConfig}
          initialState="active"
          interactive={false}
          respectReducedMotion={false}
        />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="pr-[3.25rem]">
          <p
            className={`${PANEL_TITLE} bg-gradient-to-r from-emerald-200 via-cyan-200 to-white bg-clip-text text-transparent`}
          >
            Safe on both sides
          </p>
          <div className={PANEL_SUBTITLE_STACK}>
            <p className="whitespace-nowrap">Private Source</p>
            <p className="whitespace-nowrap">Clean Rights</p>
            <p className="whitespace-nowrap">Fail-Closed Settle</p>
          </div>
          <div
            className={`${PANEL_CHIPS_AFTER_SUBTITLE} ${PANEL_CHIPS_ROW_Y} flex flex-nowrap items-center gap-1`}
          >
            {(
              [
                { label: 'Secrets', Icon: LockClosedIcon },
                { label: 'Rights', Icon: ShieldCheckIcon },
                { label: 'On-chain', Icon: CircleStackIcon },
              ] as const
            ).map(({ label, Icon: ChipIcon }) => (
              <span
                key={label}
                className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-none border border-emerald-300/14 bg-emerald-400/8 px-1 py-0.5 text-[7px] uppercase tracking-[0.1em] text-emerald-50/72"
              >
                <ChipIcon className="h-2 w-2 shrink-0" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className={`mt-2 flex min-h-0 flex-col ${PANEL_INNER_CARD_GAP}`}>
          {verificationRows.map(({ label, detail, Icon: VerificationIcon }) => (
            <div key={label} className={INNER_CARD.safety}>
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-none border border-white/10 bg-white/6 text-emerald-200/78">
                  <VerificationIcon className="h-3 w-3" />
                </span>
                <p className="min-w-0 truncate text-[12px] font-semibold leading-snug tracking-tight text-white/90">
                  {label}
                </p>
              </div>
              <p className="mt-1 text-[11.625px] leading-snug text-emerald-100/66">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LedgerPanel() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border border-orange-300/12 bg-[linear-gradient(160deg,rgba(23,9,0,0.96),rgba(12,8,4,0.94)_55%,rgba(4,10,16,0.96))] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.08),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <p className={`min-w-0 truncate ${PANEL_TITLE_GRADIENT} ${TITLE_GRADIENT.ledger}`}>
          {BITCODE_PUBLIC_COPY.settlementLedger.title}
        </p>
        <PanelSubtitle className="!text-orange-100/58">
          {BITCODE_PUBLIC_COPY.settlementLedger.subtitle}
        </PanelSubtitle>
        <ul className={`${PANEL_BODY_AFTER_SUBTITLE} flex min-h-0 flex-col ${PANEL_INNER_CARD_GAP}`}>
          {BITCODE_PUBLIC_COPY.settlementLedger.rows.map((row) => (
            <li key={row.label} className={INNER_CARD.ledger}>
              <p className="truncate text-[12px] font-semibold leading-snug tracking-tight text-orange-50/92">
                {row.label}
              </p>
              <p className="mt-0.5 text-[11.625px] leading-snug text-orange-100/68">{row.detail}</p>
            </li>
          ))}
        </ul>
        {BITCODE_PUBLIC_COPY.settlementLedger.footnote ? (
          <p className="mt-2 text-[10px] leading-snug text-orange-100/48">
            {BITCODE_PUBLIC_COPY.settlementLedger.footnote}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Depot panels split for the three-band landing:
 * - upper: Source Measurements + Exchanging Knowledge (aligns with hero CTAs)
 * - lower: Market · Tokenomics · Safe · Three things (production band)
 */
export const MarketingLandingProductPreview = memo(function MarketingLandingProductPreview({
  variant = 'upper',
}: {
  variant?: ProductPreviewVariant;
}) {
  if (variant === 'lower') {
    return (
      <DepotChrome testId="landing-depot-lower" entrance="scroll">
        <div className="flex items-center justify-between gap-3">
          <BitcodePill className="border-emerald-300/30 bg-emerald-400/10 text-emerald-100">
            <CircleStackIcon className="h-3.5 w-3.5" />
            Market · Token · Safety
          </BitcodePill>
          <p className="whitespace-nowrap text-right text-[10px] uppercase tracking-[0.14em] text-emerald-200/58 phone:text-[11px] phone:tracking-[0.18em]">
            Exchange posture
          </p>
        </div>

        <div className="mt-4 rounded-none border border-white/10 bg-black/30">
          <div className="grid gap-3 p-4 laptop:hidden">
            <MarketPanel />
            <TokenPanel />
            <SafetyPanel />
            <LedgerPanel />
          </div>

          <div className="hidden gap-3 p-4 laptop:grid laptop:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] laptop:items-stretch">
            <div className="flex h-full min-h-0 flex-col gap-3 self-stretch">
              <MarketPanel />
              <SafetyPanel />
            </div>
            <div className="flex h-full min-h-0 flex-col gap-3 self-stretch">
              <TokenPanel />
              <LedgerPanel />
            </div>
          </div>
        </div>
      </DepotChrome>
    );
  }

  return (
    <DepotChrome testId="landing-depot-upper">
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
            {BITCODE_PUBLIC_COPY.productPreview.rail}
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
                  The preview keeps DataPacks, source-safe measurements, and settlement posture
                  legible before the full product route opens.
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
          <MeasuresPanel />
          <SellingPanel />
        </div>

        <div className="hidden gap-3 p-4 laptop:grid laptop:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] laptop:items-stretch">
          <MeasuresPanel />
          <SellingPanel />
        </div>
      </div>
    </DepotChrome>
  );
});
