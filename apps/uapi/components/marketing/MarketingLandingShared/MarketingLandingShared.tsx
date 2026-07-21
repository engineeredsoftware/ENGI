'use client';

import React from 'react';
import {
  CheckBadgeIcon,
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

// Color order: Deposit purple · Read orange · Settle green.
export const productPillars = [
  {
    title: 'Deposit',
    description: 'Provide source material to be measured for indexing.',
    Icon: CubeTransparentIcon,
  },
  {
    title: 'Read',
    description: 'Describe your needs to receive candidates to review.',
    Icon: ScaleIcon,
  },
  {
    title: 'Settle',
    description:
      'Tokens are exchanged between depositor and reader.',
    Icon: CurrencyDollarIcon,
  },
] as const;

/**
 * Marketing depot measurements: per-metric Absolutes + Needinesses (small bars),
 * then Packs' BTD Volume as the standout summary axis (display value ≠ 0–100 bar).
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
  // Dynamic Need-inferred fits (several rows signal many are synthesized & measured).
  { label: 'need 1 fit', value: 79, detail: 'dynamic' },
  { label: 'need 2 fit', value: 74, detail: 'dynamic' },
  { label: 'need 3 fit', value: 71, detail: 'dynamic' },
] as const;

export const measurementFinalFit = {
  label: "Exchange BTD Volume",
  /** Display volume (not a 0–100 score). */
  value: 431,
  /** Marketing bar fill only — volume is not a percentage axis. */
  barPercent: 86,
  detail: 'BTD volume — weighted scalar over needinesses-fits for the settled AssetPack',
} as const;

export const measureCardAxes = [
  { label: 'Quantity', value: 73 },
  { label: 'Quality', value: 84 },
  { label: 'Fit', value: 96 },
] as const;

/** Neon tone for highlighted mosaic chips (bullet + glowing label). */
export type PreviewValueTone = 'orange' | 'green' | 'purple' | 'white';

export const previewValueNeonClass: Record<PreviewValueTone, string> = {
  green:
    'font-semibold text-emerald-200 [text-shadow:0_0_12px_rgba(103,254,183,0.75),0_0_28px_rgba(52,211,153,0.4)]',
  orange:
    'font-semibold text-orange-200 [text-shadow:0_0_12px_rgba(251,146,60,0.75),0_0_28px_rgba(251,191,36,0.4)]',
  purple:
    'font-semibold text-fuchsia-200 [text-shadow:0_0_12px_rgba(232,121,249,0.75),0_0_28px_rgba(192,132,252,0.45)]',
  white:
    'font-semibold text-white [text-shadow:0_0_12px_rgba(255,255,255,0.8),0_0_28px_rgba(255,255,255,0.38)]',
};

export const previewRows = [
  {
    key: 'Trading',
    valueParts: ['code', 'files', 'designs', 'data'],
    // All orbital bullets green; no neon label glow on the 2×2 chips.
    bulletTone: 'green' as PreviewValueTone,
    accentClassName: 'from-emerald-400/18 via-teal-400/8 to-transparent',
    Icon: DocumentTextIcon,
    // 2×2 — short chips must stay single-line.
    valuesGridClassName: 'grid-cols-2',
    iconClassName: 'text-white/58',
  },
  {
    key: "Seller's View",
    valueParts: ['permitted source', 'obfuscations', 'synthesized pack'],
    bulletTone: 'purple' as PreviewValueTone,
    valueTones: {
      obfuscations: 'purple',
    } satisfies Partial<Record<string, PreviewValueTone>>,
    accentClassName: 'from-fuchsia-400/18 via-purple-400/8 to-transparent',
    Icon: LinkIcon,
    // Three stacked rows — match Buyer's View layout.
    valuesGridClassName: 'grid-cols-1',
    iconClassName: 'text-white/58',
  },
  {
    key: "Buyer's View",
    valueParts: ['measurements', 'needs-fits scores', 'knowledge volume'],
    bulletTone: 'orange' as PreviewValueTone,
    valueTones: {
      'needs-fits scores': 'orange',
    } satisfies Partial<Record<string, PreviewValueTone>>,
    accentClassName: 'from-orange-400/18 via-amber-300/8 to-transparent',
    Icon: Squares2X2Icon,
    // Three stacked rows — never a tight multi-col that letter-breaks words.
    valuesGridClassName: 'grid-cols-1',
    iconClassName: 'text-white/58',
  },
  {
    key: 'Settlement',
    // 2×2: Crypto | BTD / DataPacks | Ship — pay rails are multi-chain Crypto.
    valueParts: ['Crypto', 'BTD', 'DataPacks', 'Ship'],
    valueTones: {
      Crypto: 'orange',
      BTD: 'green',
      DataPacks: 'purple',
      Ship: 'white',
    } satisfies Partial<Record<string, PreviewValueTone>>,
    accentClassName: 'from-orange-400/18 via-amber-300/8 to-transparent',
    Icon: CurrencyDollarIcon,
    valuesGridClassName: 'grid-cols-2',
    iconClassName: 'text-white/58',
  },
] as const;

/** Measuremint underlay — vertical scale 1.4× vs original, centers preserved; width/left unchanged. */
export const measuremintCandles = [
  { left: '8%', wickTop: '32.4%', wickHeight: '39.2%', bodyTop: '46.6%', bodyHeight: '16.8%', bullish: true },
  { left: '18%', wickTop: '40%', wickHeight: '28%', bodyTop: '50%', bodyHeight: '14%', bullish: false },
  { left: '30%', wickTop: '28%', wickHeight: '42%', bodyTop: '42.2%', bodyHeight: '19.6%', bullish: true },
  { left: '42%', wickTop: '42.4%', wickHeight: '25.2%', bodyTop: '51.4%', bodyHeight: '11.2%', bullish: false },
  { left: '56%', wickTop: '34.8%', wickHeight: '36.4%', bodyTop: '45.6%', bodyHeight: '16.8%', bullish: true },
  { left: '68%', wickTop: '44.4%', wickHeight: '25.2%', bodyTop: '53.2%', bodyHeight: '12.6%', bullish: false },
  { left: '80%', wickTop: '30%', wickHeight: '42%', bodyTop: '43%', bodyHeight: '21%', bullish: true },
  { left: '90%', wickTop: '40.6%', wickHeight: '30.8%', bodyTop: '50%', bodyHeight: '14%', bullish: false },
] as const;

export const verificationRows = [
  {
    label: 'Depositing',
    detail: 'AssetPacks are securely measured; rights and payments are settled.',
    status: 'public',
    Icon: CircleStackIcon,
  },
  {
    label: 'Reading',
    detail:
      'Bitcode finds deposited AssetPacks to synthesize new AssetPacks to satisfy your needs.',
    status: 'private',
    Icon: LockClosedIcon,
  },
  {
    label: 'Proofs',
    detail: 'Generated proofs of deployed protocol implementation to all live activity.',
    status: 'verified',
    Icon: ShieldCheckIcon,
  },
  {
    label: 'Immutable',
    detail: 'The on-chain settlement ledger establishes an auditable knowledge-market.',
    status: 'final',
    Icon: CheckBadgeIcon,
  },
] as const;

export const compactPreviewCards = [
  {
    title: 'Exchange',
    body: 'Network ledger of AssetPack activity',
    detail: 'Audit supply, settlement, and delivery before you trade.',
  },
  {
    title: 'Deposit',
    body: 'Sell measured DataPack options',
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
  { text: 'Trade technical data', className: heroHighlightClass },
  { text: 'Bitcode', className: `${heroHighlightClass} font-semibold text-white` },
] as const;

export function renderOrbitalBullet(
  className = '',
  variant: 'purple' | 'orange' | 'green' | 'white' = 'purple',
) {
  const outerRingClassName =
    variant === 'orange'
      ? 'border-orange-400/46'
      : variant === 'green'
        ? 'border-emerald-400/52'
        : variant === 'white'
          ? 'border-white/48'
          : 'border-fuchsia-400/46';
  const innerRingClassName =
    variant === 'orange'
      ? 'border-orange-300/32'
      : variant === 'green'
        ? 'border-emerald-300/38'
        : variant === 'white'
          ? 'border-white/34'
          : 'border-purple-300/32';
  const coreClassName =
    variant === 'orange'
      ? 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.48)]'
      : variant === 'green'
        ? 'bg-emerald-300 shadow-[0_0_12px_rgba(103,254,183,0.58)]'
        : variant === 'white'
          ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.62)]'
          : 'bg-fuchsia-300 shadow-[0_0_10px_rgba(232,121,249,0.48)]';
  const planetClassName =
    variant === 'orange'
      ? 'bg-orange-200 shadow-[0_0_6px_rgba(251,146,60,0.42)]'
      : variant === 'green'
        ? 'bg-emerald-100 shadow-[0_0_8px_rgba(103,254,183,0.52)]'
        : variant === 'white'
          ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.55)]'
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

/**
 * Claim anchors in marketing body + footnotes.
 * - `*`   emerald — ERC-1155 / BTD token posture
 * - `**`  orange  — AssetPacks
 * - `***` cyan    — Measurements / source-safety
 * Parse longest markers first so `***` is not split into `*` + `**`.
 */
export function renderClaimAnchorMarkers(value: string, markerClassName = '') {
  const parts = value.split(/(\*\*\*|\*\*|\*)/g);
  return parts.map((part, index) => {
    if (part === '***') {
      return (
        <span
          key={`claim-anchor-3-${index}`}
          className={`mx-[0.06em] inline-block align-super text-[0.72em] font-semibold leading-none text-cyan-300 [text-shadow:0_0_10px_rgba(34,211,238,0.55)] ${markerClassName}`.trim()}
          aria-hidden="true"
        >
          ***
        </span>
      );
    }
    if (part === '**') {
      return (
        <span
          key={`claim-anchor-2-${index}`}
          className={`mx-[0.06em] inline-block align-super text-[0.72em] font-semibold leading-none text-orange-300 [text-shadow:0_0_10px_rgba(251,146,60,0.55)] ${markerClassName}`.trim()}
          aria-hidden="true"
        >
          **
        </span>
      );
    }
    if (part === '*') {
      return (
        <span
          key={`claim-anchor-1-${index}`}
          className={`mx-[0.06em] inline-block align-super text-[0.72em] font-semibold leading-none text-emerald-300 [text-shadow:0_0_10px_rgba(103,254,183,0.55)] ${markerClassName}`.trim()}
          aria-hidden="true"
        >
          *
        </span>
      );
    }
    if (!part) return null;
    return <React.Fragment key={`claim-anchor-text-${index}`}>{part}</React.Fragment>;
  }) as React.ReactNode;
}

/** Leading claim marker only (`*`, `**`, or `***`); body text without the marker. */
export function splitLeadingClaimAnchor(value: string): {
  marker: '*' | '**' | '***' | null;
  body: string;
} {
  const trimmed = value.trimStart();
  if (trimmed.startsWith('***')) {
    return { marker: '***', body: trimmed.slice(3).trimStart() };
  }
  if (trimmed.startsWith('**')) {
    return { marker: '**', body: trimmed.slice(2).trimStart() };
  }
  if (trimmed.startsWith('*')) {
    return { marker: '*', body: trimmed.slice(1).trimStart() };
  }
  return { marker: null, body: value };
}

/**
 * Footnote line with the claim marker fixed at the start (left column),
 * so multi-line wrap never leaves the asterisk trailing.
 */
export function renderLeadingClaimFootnote(value: string) {
  const { marker, body } = splitLeadingClaimAnchor(value);
  if (!marker) {
    return <span>{body}</span>;
  }
  const markerNode =
    marker === '***' ? (
      <span
        className="inline-block shrink-0 text-[0.85em] font-semibold leading-none text-cyan-300 [text-shadow:0_0_10px_rgba(34,211,238,0.55)]"
        aria-hidden="true"
      >
        ***
      </span>
    ) : marker === '**' ? (
      <span
        className="inline-block shrink-0 text-[0.85em] font-semibold leading-none text-orange-300 [text-shadow:0_0_10px_rgba(251,146,60,0.55)]"
        aria-hidden="true"
      >
        **
      </span>
    ) : (
      <span
        className="inline-block shrink-0 text-[0.85em] font-semibold leading-none text-emerald-300 [text-shadow:0_0_10px_rgba(103,254,183,0.55)]"
        aria-hidden="true"
      >
        *
      </span>
    );

  return (
    <span className="flex items-start gap-1.5">
      <span className="mt-[0.15em] w-[1.35rem] shrink-0 text-left">{markerNode}</span>
      <span className="min-w-0 flex-1">{body}</span>
    </span>
  );
}
