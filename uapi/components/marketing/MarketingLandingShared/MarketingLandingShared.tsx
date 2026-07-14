'use client';

import React from 'react';
import {
  CircleStackIcon,
  CubeTransparentIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  LinkIcon,
  LockClosedIcon,
  ScaleIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

import { minimalPreset } from '@/components/bitcode/effects/quantum-orb';
import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';

export const entranceEase = [0.16, 1, 0.3, 1] as const;

export const animatedMotionStyle: React.CSSProperties = {
  willChange: 'transform, opacity',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
};

export const paintedMotionStyle: React.CSSProperties = {
  ...animatedMotionStyle,
  contain: 'paint',
};

// Keep descriptions near-identical length (~79–80 chars) so all three wrap to four lines.
export const productPillars = [
  {
    title: 'Sell',
    description: 'Deposit repositories as measured AssetPack supply buyers can find and settle.',
    Icon: CubeTransparentIcon,
  },
  {
    title: 'Buy',
    description: 'State a Need, compare fit measurements, and pick source-safe AssetPack options.',
    Icon: ScaleIcon,
  },
  {
    title: 'Settle',
    description: 'Pay in BTC; BTD rights and delivery unlock with proof-backed finality after pay.',
    Icon: CurrencyDollarIcon,
  },
] as const;

/**
 * Marketing depot measurements: per-metric Absolutes + Needinesses (small bars),
 * then Final Fit (BTD volume) as the standout summary axis.
 */
export const measurementAbsoluteItems = [
  { label: 'functions', value: 92 },
  { label: 'types', value: 88 },
  { label: 'file span', value: 76 },
  { label: 'symbolic richness', value: 90 },
  { label: 'modularity', value: 84 },
  { label: 'correctness', value: 96 },
  { label: 'objectives fidelity', value: 91 },
  { label: 'computational usage', value: 78 },
] as const;

export const measurementNeedinessItems = [
  { label: 'language fit', value: 94, detail: 'static' },
  { label: 'domain fit', value: 88, detail: 'static' },
  { label: 'interface fit', value: 82, detail: 'static' },
  { label: 'Need-inferred *-fit', value: 79, detail: 'dynamic' },
] as const;

export const measurementFinalFit = {
  label: 'Final Fit',
  value: 73,
  detail: 'BTD volume — weighted scalar over needinesses-fits for the settled AssetPack',
} as const;

export const measureCardReadNeed = 'Need: auth migration rollback for monorepo services';

export const measureCardAxes = [
  { label: 'Quality', value: 96 },
  { label: 'Fit', value: 84 },
  { label: 'Trust', value: 73 },
] as const;

export const previewRows = [
  {
    key: 'what sellers ship',
    valueParts: ['code', 'docs', 'diagrams', 'PDFs'],
    accentClassName: 'from-cyan-400/18 via-sky-400/8 to-transparent',
    Icon: DocumentTextIcon,
    // 2×2 — short chips must stay single-line.
    valuesGridClassName: 'grid-cols-2',
    iconClassName: 'text-white/58',
  },
  {
    key: 'proven at deposit',
    valueParts: ['commits', 'author', 'paths', 'SHA'],
    accentClassName: 'from-fuchsia-400/18 via-purple-400/8 to-transparent',
    Icon: LinkIcon,
    // 2×2 with short "author" (was authorship) so nothing wraps mid-word.
    valuesGridClassName: 'grid-cols-2',
    iconClassName: 'text-white/58',
  },
  {
    key: 'what buyers inspect',
    valueParts: ['measurements', 'fit', 'proof roots'],
    accentClassName: 'from-emerald-400/18 via-teal-400/8 to-transparent',
    Icon: Squares2X2Icon,
    // Three stacked rows — never a tight multi-col that letter-breaks words.
    valuesGridClassName: 'grid-cols-1',
    iconClassName: 'text-white/58',
  },
  {
    key: 'what settles',
    // 2×2: BTC | BTD / AssetPacks | Delivery — all single-line tokens.
    valueParts: ['BTC', 'BTD', 'AssetPacks', 'Delivery'],
    accentClassName: 'from-orange-400/18 via-amber-300/8 to-transparent',
    Icon: CurrencyDollarIcon,
    valuesGridClassName: 'grid-cols-2',
    iconClassName: 'text-white/58',
  },
] as const;

export const measuremintCandles = [
  { left: '8%', wickTop: '38%', wickHeight: '28%', bodyTop: '49%', bodyHeight: '12%', bullish: true },
  { left: '18%', wickTop: '44%', wickHeight: '20%', bodyTop: '52%', bodyHeight: '10%', bullish: false },
  { left: '30%', wickTop: '34%', wickHeight: '30%', bodyTop: '45%', bodyHeight: '14%', bullish: true },
  { left: '42%', wickTop: '46%', wickHeight: '18%', bodyTop: '53%', bodyHeight: '8%', bullish: false },
  { left: '56%', wickTop: '40%', wickHeight: '26%', bodyTop: '48%', bodyHeight: '12%', bullish: true },
  { left: '68%', wickTop: '48%', wickHeight: '18%', bodyTop: '55%', bodyHeight: '9%', bullish: false },
  { left: '80%', wickTop: '36%', wickHeight: '30%', bodyTop: '46%', bodyHeight: '15%', bullish: true },
  { left: '90%', wickTop: '45%', wickHeight: '22%', bodyTop: '52%', bodyHeight: '10%', bullish: false },
] as const;

export const verificationRows = [
  {
    label: 'Seller writes',
    detail: 'deposited supply is measured publicly before any buyer pays',
    status: 'public',
    Icon: CircleStackIcon,
  },
  {
    label: 'Buyer rights',
    detail: 'settled AssetPack rights transfer only after BTC finality; BTD records volume',
    status: 'private*',
    Icon: LockClosedIcon,
  },
  {
    label: 'Public proofs',
    detail: 'anyone can audit measurements and settlement without seeing protected source',
    status: 'verified',
    Icon: ShieldCheckIcon,
  },
] as const;

export const compactPreviewCards = [
  {
    title: 'Packs',
    body: 'Network ledger of AssetPack activity',
    detail: 'Audit supply, settlement, and delivery before you trade.',
  },
  {
    title: 'Deposit',
    body: 'Sell measured AssetPack options',
    detail: 'Synthesize, review, and admit repository supply.',
  },
  {
    title: 'Read',
    body: 'Buy against a Need',
    detail: 'Compare fit, quote, and settle source-safe packs.',
  },
] as const;

export const verifiedAccessOrbConfig = {
  ...minimalPreset,
  backgroundColors: ['#0d2f29', '#0f766e', '#6ee7b7'],
  glowColor: '#34d399',
  particleColor: '#6ee7b7',
  coreGlowIntensity: 0.22,
  showBackground: false,
  showWavyBlobs: true,
  showParticles: true,
  showGlowEffects: true,
  showShadow: true,
  speed: 18,
} as const;

export const headlineText = BITCODE_PUBLIC_COPY.headline;
export const heroHighlightClass = 'super-shiny-text special-text text-[rgba(103,254,183,0.95)]';
export const headlineHighlights = [
  { text: 'trade technical knowledge', className: heroHighlightClass },
  { text: 'Bitcode', className: `${heroHighlightClass} font-semibold text-white` },
] as const;

export function renderOrbitalBullet(className = '', variant: 'purple' | 'orange' | 'green' = 'purple') {
  const outerRingClassName =
    variant === 'orange'
      ? 'border-orange-400/46'
      : variant === 'green'
        ? 'border-emerald-400/52'
        : 'border-fuchsia-400/46';
  const innerRingClassName =
    variant === 'orange'
      ? 'border-orange-300/32'
      : variant === 'green'
        ? 'border-emerald-300/38'
        : 'border-purple-300/32';
  const coreClassName =
    variant === 'orange'
      ? 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.48)]'
      : variant === 'green'
        ? 'bg-emerald-300 shadow-[0_0_12px_rgba(103,254,183,0.58)]'
        : 'bg-fuchsia-300 shadow-[0_0_10px_rgba(232,121,249,0.48)]';
  const planetClassName =
    variant === 'orange'
      ? 'bg-orange-200 shadow-[0_0_6px_rgba(251,146,60,0.42)]'
      : variant === 'green'
        ? 'bg-emerald-100 shadow-[0_0_8px_rgba(103,254,183,0.52)]'
        : 'bg-purple-200 shadow-[0_0_6px_rgba(216,180,254,0.42)]';

  return (
    <span className={`relative inline-flex h-5 w-5 shrink-0 items-center justify-center ${className}`}>
      {/* Square chrome; flying particle dots stay circular. */}
      <span className={`absolute inset-0 rounded-none border ${outerRingClassName}`} />
      <span className={`absolute inset-[2.5px] rounded-none border ${innerRingClassName}`} />
      <span className={`absolute inset-[8px] rounded-none ${coreClassName}`} />
      <span
        className={`absolute left-1/2 top-1/2 h-[2.25px] w-[2.25px] -translate-x-1/2 -translate-y-[8px] rounded-full ${planetClassName}`}
      />
      <span
        className={`absolute left-1/2 top-1/2 h-[2.25px] w-[2.25px] translate-x-[6px] -translate-y-1/2 rounded-full ${planetClassName}`}
      />
      <span
        className={`absolute left-1/2 top-1/2 h-[2.25px] w-[2.25px] -translate-x-1/2 translate-y-[6px] rounded-full ${planetClassName}`}
      />
      <span
        className={`absolute left-1/2 top-1/2 h-[2.25px] w-[2.25px] -translate-x-[8px] -translate-y-1/2 rounded-full ${planetClassName}`}
      />
    </span>
  ) as React.ReactNode;
}

export function renderTrailingOrangeAsterisk(value: string, asteriskClassName = '') {
  if (!value.endsWith('*')) {
    return value;
  }

  return (
    <>
      {value.slice(0, -1)}
      <span className={`ml-[0.16em] inline-block leading-none text-orange-300 ${asteriskClassName}`.trim()}>*</span>
    </>
  ) as React.ReactNode;
}
