/**
 * Read-side buyer measurement projection — commercial buy/no-buy legibility.
 *
 * Product law:
 * - Needinesses (*-fit) are the primary buy/no-buy signal vs the stated Need
 *   and the only driver of BTD mint volume (absolutes never mint BTD).
 * - Absolutes are secondary quality / risk gates under unpaid preview.
 * - Honesty status is a trust gate: measured ≫ estimated ≫ insufficient_evidence.
 *
 * Default unpaid card: fit trio + composite need-fit + top quality + risk chips.
 * Full absolute catalogue is secondary ("show all").
 */

export type AbsoluteHonestyStatus =
  | 'measured'
  | 'estimated'
  | 'insufficient_evidence'
  | 'expanded-fill'
  | 'not_run'
  | 'not_implemented'
  | string;

export type MeasurementReadingLike = {
  measurementKind?: string;
  kind?: string;
  label?: string;
  volume?: number;
  magnitude?: number;
  unit?: string | null;
  weight?: number;
  status?: AbsoluteHonestyStatus;
  category?: string;
  descriptor?: string;
  rationale?: string;
};

/** Catalogue weights for top commercial quality kinds (subset of Σ=1 absolutes). */
export const BUYER_QUALITY_ABSOLUTE_KINDS: ReadonlyArray<{
  measurementKind: string;
  label: string;
  weight: number;
}> = [
  { measurementKind: 'correctness-estimate', label: 'Correctness', weight: 0.0405 },
  { measurementKind: 'test-pass-rate', label: 'Test pass rate', weight: 0.03645 },
  { measurementKind: 'objectives-fidelity', label: 'Objectives fidelity', weight: 0.0324 },
  { measurementKind: 'test-strength', label: 'Test strength', weight: 0.02835 },
  { measurementKind: 'symbolic-richness', label: 'Symbolic richness', weight: 0.02835 },
  { measurementKind: 'function-count', label: 'Functions', weight: 0.02835 },
  { measurementKind: 'buildability', label: 'Buildability', weight: 0.0243 },
  { measurementKind: 'test-coverage', label: 'Test coverage', weight: 0.0243 },
  { measurementKind: 'originality', label: 'Originality', weight: 0.0243 },
  { measurementKind: 'api-surface', label: 'API surface', weight: 0.0243 },
];

/** Hard gate kinds — low cleanliness / unknown can block buy recommendation. */
export const BUYER_GATE_ABSOLUTE_KINDS = [
  'secret-safety',
  'pii-exposure',
  'license-cleanliness',
] as const;

/** Soft risk kinds — high mass/ratio warns buyer. */
export const BUYER_PENALTY_ABSOLUTE_KINDS = [
  'security-cleanliness',
  'dependency-health',
  'copyleft-risk-mass',
  'dead-code-ratio',
  'duplication-internal',
  'generated-code-mass',
] as const;

/** Static needinesses catalogue order (weights match settlement SSOT). */
export const BUYER_NEEDINESSES_STATIC: ReadonlyArray<{
  measurementKind: string;
  label: string;
  weight: number;
}> = [
  { measurementKind: 'language-fit', label: 'Language fit', weight: 0.35 },
  { measurementKind: 'domain-fit', label: 'Domain fit', weight: 0.35 },
  { measurementKind: 'interface-fit', label: 'Interface fit', weight: 0.3 },
];

const RISK_HIGH_IS_BAD = new Set([
  'pii-exposure',
  'copyleft-risk-mass',
  'dead-code-ratio',
  'duplication-internal',
  'generated-code-mass',
  'ai-generated-likelihood',
  'substitution-density',
]);

export type BuyerFitRow = {
  measurementKind: string;
  label: string;
  weight: number;
  volume: number | null;
  status: AbsoluteHonestyStatus | null;
  present: boolean;
};

export type BuyerAbsoluteChip = {
  measurementKind: string;
  label: string;
  volume: number | null;
  status: AbsoluteHonestyStatus | null;
  role: 'quality' | 'gate' | 'penalty';
  /** true when this chip is a hard no-buy concern */
  hardBlock: boolean;
  /** true when this chip is a soft caution */
  softWarn: boolean;
};

export type BuyerBuyRecommendation =
  | 'buy_recommended'
  | 'buy_with_caution'
  | 'do_not_buy'
  | 'cannot_assess';

export type ReadBuyerMeasurementProjection = {
  fitRows: BuyerFitRow[];
  needFitVolume: number | null;
  needFitSource: 'option' | 'computed' | 'missing';
  qualityChips: BuyerAbsoluteChip[];
  gateChips: BuyerAbsoluteChip[];
  penaltyChips: BuyerAbsoluteChip[];
  honesty: {
    measured: number;
    estimated: number;
    insufficient: number;
    other: number;
    total: number;
  };
  recommendation: BuyerBuyRecommendation;
  recommendationReasons: string[];
  absoluteCount: number;
  needinessCount: number;
};

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function kindOf(row: MeasurementReadingLike): string {
  return String(row.measurementKind || row.kind || '')
    .trim()
    .toLowerCase();
}

function labelOf(row: MeasurementReadingLike, fallback: string): string {
  const l = typeof row.label === 'string' ? row.label.trim() : '';
  return l || fallback;
}

function volumeOf(row: MeasurementReadingLike | undefined): number | null {
  if (!row || typeof row.volume !== 'number' || !Number.isFinite(row.volume)) return null;
  return clamp01(row.volume);
}

function statusOf(row: MeasurementReadingLike | undefined): AbsoluteHonestyStatus | null {
  if (!row || typeof row.status !== 'string' || !row.status.trim()) return null;
  return row.status.trim();
}

function indexByKind(rows: MeasurementReadingLike[]): Map<string, MeasurementReadingLike> {
  const map = new Map<string, MeasurementReadingLike>();
  for (const row of rows) {
    const k = kindOf(row);
    if (k) map.set(k, row);
  }
  return map;
}

/** Weighted mean of present *-fit needinesses (excludes composite need-fit row). */
export function computeNeedFitFromReadings(needinesses: MeasurementReadingLike[]): number | null {
  const weightByKind = new Map(
    BUYER_NEEDINESSES_STATIC.map((s) => [s.measurementKind, s.weight]),
  );
  let sumW = 0;
  let sum = 0;
  let any = false;
  for (const row of needinesses) {
    const k = kindOf(row);
    if (!k || k === 'need-fit' || !k.endsWith('-fit')) continue;
    const v = volumeOf(row);
    if (v === null) continue;
    const w =
      typeof row.weight === 'number' && Number.isFinite(row.weight) && row.weight > 0
        ? row.weight
        : weightByKind.get(k) ?? 1;
    sumW += w;
    sum += w * v;
    any = true;
  }
  if (!any || sumW <= 0) return null;
  return clamp01(sum / sumW);
}

function isHardGateBlock(
  kind: string,
  volume: number | null,
  status: AbsoluteHonestyStatus | null,
  present: boolean,
): boolean {
  // Missing gate reading is not a hard block (cannot invent fail-closed without data).
  // Present + insufficient_evidence is a hard block (unknown safety ≠ pass).
  if (!present) return false;
  if (status === 'insufficient_evidence' || status === 'not_run' || status === 'not_implemented') {
    return true;
  }
  if (volume === null) return true;
  if (RISK_HIGH_IS_BAD.has(kind)) {
    return volume >= 0.65;
  }
  // Cleanliness-style gates: low volume is bad.
  return volume < 0.35;
}

function isSoftPenaltyWarn(kind: string, volume: number | null, status: AbsoluteHonestyStatus | null): boolean {
  if (status === 'insufficient_evidence') return true;
  if (volume === null) return false;
  if (RISK_HIGH_IS_BAD.has(kind)) return volume >= 0.45;
  // Cleanliness-style penalties: low is concerning.
  return volume < 0.45;
}

function honestyCounts(absolutes: MeasurementReadingLike[]) {
  let measured = 0;
  let estimated = 0;
  let insufficient = 0;
  let other = 0;
  for (const row of absolutes) {
    const s = statusOf(row);
    if (s === 'measured') measured += 1;
    else if (s === 'estimated') estimated += 1;
    else if (s === 'insufficient_evidence' || s === 'expanded-fill') insufficient += 1;
    else other += 1;
  }
  return {
    measured,
    estimated,
    insufficient,
    other,
    total: absolutes.length,
  };
}

/**
 * Project option measurements into a compact buy/no-buy view for unpaid /reads.
 */
export function buildReadBuyerMeasurementProjection(input: {
  needinesses?: MeasurementReadingLike[] | null;
  absolutes?: MeasurementReadingLike[] | null;
  /** Option-level composite when already computed by synthesis finish. */
  needFit?: number | null;
}): ReadBuyerMeasurementProjection {
  const needinesses = Array.isArray(input.needinesses) ? input.needinesses : [];
  const absolutes = Array.isArray(input.absolutes) ? input.absolutes : [];
  const byAbs = indexByKind(absolutes);
  const byNeed = indexByKind(needinesses);

  const fitRows: BuyerFitRow[] = BUYER_NEEDINESSES_STATIC.map((spec) => {
    const row = byNeed.get(spec.measurementKind);
    return {
      measurementKind: spec.measurementKind,
      label: row ? labelOf(row, spec.label) : spec.label,
      weight: spec.weight,
      volume: volumeOf(row),
      status: statusOf(row),
      present: Boolean(row),
    };
  });

  let needFitVolume: number | null = null;
  let needFitSource: ReadBuyerMeasurementProjection['needFitSource'] = 'missing';
  if (typeof input.needFit === 'number' && Number.isFinite(input.needFit)) {
    needFitVolume = clamp01(input.needFit);
    needFitSource = 'option';
  } else {
    const computed = computeNeedFitFromReadings(needinesses);
    if (computed !== null) {
      needFitVolume = computed;
      needFitSource = 'computed';
    }
  }

  // Always show top commercial quality kinds — missing volume is a soft warn.
  const qualityChips: BuyerAbsoluteChip[] = BUYER_QUALITY_ABSOLUTE_KINDS.slice(0, 6).map(
    (spec) => {
      const row = byAbs.get(spec.measurementKind);
      const volume = volumeOf(row);
      const status = statusOf(row);
      return {
        measurementKind: spec.measurementKind,
        label: row ? labelOf(row, spec.label) : spec.label,
        volume,
        status,
        role: 'quality' as const,
        hardBlock: false,
        softWarn:
          !row ||
          status === 'insufficient_evidence' ||
          (volume !== null && volume < 0.35),
      };
    },
  );

  const gateChips: BuyerAbsoluteChip[] = BUYER_GATE_ABSOLUTE_KINDS.map((kind) => {
    const row = byAbs.get(kind);
    const volume = volumeOf(row);
    const status = statusOf(row);
    const present = Boolean(row);
    return {
      measurementKind: kind,
      label: row ? labelOf(row, kind) : kind,
      volume,
      status,
      role: 'gate' as const,
      hardBlock: isHardGateBlock(kind, volume, status, present),
      softWarn: !present,
    };
  });

  const penaltyChips: BuyerAbsoluteChip[] = BUYER_PENALTY_ABSOLUTE_KINDS.map((kind) => {
    const row = byAbs.get(kind);
    const volume = volumeOf(row);
    const status = statusOf(row);
    return {
      measurementKind: kind,
      label: row ? labelOf(row, kind) : kind,
      volume,
      status,
      role: 'penalty' as const,
      hardBlock: false,
      softWarn: isSoftPenaltyWarn(kind, volume, status),
    };
  }).filter((c) => byAbs.has(c.measurementKind) || c.softWarn);

  const honesty = honestyCounts(absolutes);
  const reasons: string[] = [];
  const hardGates = gateChips.filter((c) => c.hardBlock);
  if (hardGates.length > 0) {
    reasons.push(
      `Safety/license gate concern: ${hardGates.map((g) => g.label).join(', ')}`,
    );
  }
  if (needFitVolume === null || fitRows.every((r) => !r.present)) {
    reasons.push('Need-fit measurements missing — cannot assess fit to your Need');
  } else if (needFitVolume < 0.35) {
    reasons.push(`Low need-fit (${needFitVolume.toFixed(2)}) for this Need`);
  }
  const softPenalties = penaltyChips.filter((c) => c.softWarn);
  if (softPenalties.length > 0) {
    reasons.push(`Quality/risk caution: ${softPenalties.map((p) => p.label).join(', ')}`);
  }
  if (honesty.total > 0 && honesty.measured === 0 && honesty.estimated > 0) {
    reasons.push('All absolute measurements are estimates — treat volumes cautiously');
  }

  let recommendation: BuyerBuyRecommendation = 'cannot_assess';
  if (hardGates.length > 0) {
    recommendation = 'do_not_buy';
  } else if (needFitVolume === null || fitRows.filter((r) => r.present).length === 0) {
    recommendation = 'cannot_assess';
  } else if (needFitVolume < 0.35) {
    recommendation = 'do_not_buy';
    if (!reasons.some((r) => r.includes('Low need-fit'))) {
      reasons.push(`Low need-fit (${needFitVolume.toFixed(2)})`);
    }
  } else if (softPenalties.length > 0 || needFitVolume < 0.55) {
    recommendation = 'buy_with_caution';
  } else {
    recommendation = 'buy_recommended';
    if (reasons.length === 0) {
      reasons.push('Fit and safety gates look acceptable under unpaid measurement preview');
    }
  }

  return {
    fitRows,
    needFitVolume,
    needFitSource,
    qualityChips: qualityChips.slice(0, 6),
    gateChips,
    penaltyChips: penaltyChips.filter((c) => c.softWarn || byAbs.has(c.measurementKind)).slice(0, 6),
    honesty,
    recommendation,
    recommendationReasons: reasons,
    absoluteCount: absolutes.length,
    needinessCount: needinesses.length,
  };
}

export function recommendationLabel(rec: BuyerBuyRecommendation): string {
  switch (rec) {
    case 'buy_recommended':
      return 'Buy recommended (measurement-only)';
    case 'buy_with_caution':
      return 'Buy with caution';
    case 'do_not_buy':
      return 'Do not buy (measurement-only)';
    default:
      return 'Cannot assess — need fit measurements';
  }
}

export type SelectedOptionMeasurementInput = {
  index?: number;
  title?: string | null;
  needFit?: number | null;
  measurements?: {
    needinesses?: MeasurementReadingLike[] | null;
    absolutes?: MeasurementReadingLike[] | null;
  } | null;
};

export type SelectedSettleMeasurementGate = {
  /** True when quote/settle may proceed under measurement-only law. */
  allowed: boolean;
  /** Soft caution: settle allowed but buyer should review. */
  caution: boolean;
  blockers: string[];
  cautions: string[];
  /** Worst recommendation across selected options. */
  worstRecommendation: BuyerBuyRecommendation;
  perOption: Array<{
    index: number;
    title: string;
    recommendation: BuyerBuyRecommendation;
    needFitVolume: number | null;
    reasons: string[];
  }>;
};

/**
 * Fail-closed settle/quote preflight for selected read options.
 * - Empty selection → blocked
 * - Any option cannot_assess or do_not_buy → blocked
 * - buy_with_caution → allowed with caution messages
 * - All buy_recommended → allowed
 */
export function assessSelectedOptionsForSettle(
  options: SelectedOptionMeasurementInput[],
): SelectedSettleMeasurementGate {
  if (!Array.isArray(options) || options.length === 0) {
    return {
      allowed: false,
      caution: false,
      blockers: ['Select at least one AssetPack option to quote or settle.'],
      cautions: [],
      worstRecommendation: 'cannot_assess',
      perOption: [],
    };
  }

  const perOption = options.map((opt, i) => {
    const projection = buildReadBuyerMeasurementProjection({
      needinesses: opt.measurements?.needinesses ?? [],
      absolutes: opt.measurements?.absolutes ?? [],
      needFit: opt.needFit,
    });
    return {
      index: typeof opt.index === 'number' ? opt.index : i,
      title: (typeof opt.title === 'string' && opt.title.trim()) || `Option ${i + 1}`,
      recommendation: projection.recommendation,
      needFitVolume: projection.needFitVolume,
      reasons: projection.recommendationReasons,
    };
  });

  const blockers: string[] = [];
  const cautions: string[] = [];
  let worst: BuyerBuyRecommendation = 'buy_recommended';

  const rank: Record<BuyerBuyRecommendation, number> = {
    buy_recommended: 0,
    buy_with_caution: 1,
    cannot_assess: 2,
    do_not_buy: 3,
  };

  for (const row of perOption) {
    if (rank[row.recommendation] > rank[worst]) {
      worst = row.recommendation;
    }
    if (row.recommendation === 'do_not_buy') {
      blockers.push(
        `"${row.title}": ${row.reasons[0] || 'measurement-only do-not-buy'}`,
      );
    } else if (row.recommendation === 'cannot_assess') {
      blockers.push(
        `"${row.title}": missing need-fit measurements (BTD volume cannot be priced)`,
      );
    } else if (row.recommendation === 'buy_with_caution') {
      cautions.push(
        `"${row.title}": ${row.reasons[0] || 'buy with caution'}`,
      );
    }
  }

  return {
    allowed: blockers.length === 0,
    caution: blockers.length === 0 && cautions.length > 0,
    blockers,
    cautions,
    worstRecommendation: worst,
    perOption,
  };
}
