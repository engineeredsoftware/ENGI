/**
 * Raw BTD volume from **needinesses only** (product law).
 *
 * Absolutes never drive BTD volume. Needinesses fits score → rawV base units.
 * Apply `applyBtdSupplyDecay` for scarcity, then mint on settle to depositor
 * BTD payout slices only. Buyers pay ETH|BTC|SOL at spot — never BTD.
 *
 * Formula:
 *   weightedNeedinessesSum = Σ (w_i * clamp01(v_i))
 *   weightSum              = Σ w_i
 *   needFitVolume          = weightSum > 0 ? weightedNeedinessesSum / weightSum : 0
 *   amountBaseUnits (rawV) = floor(needFitVolume * 10^BTD_DECIMALS)
 *
 * All inputs are strongly typed. Boundary adapters that accept wire JSON live
 * in the settle API layer — this module never takes `unknown`.
 */

import { createHash } from 'crypto';
import { BTD_DECIMALS_SCALE } from './types';

/**
 * Static needinesses catalogue weights (mirror of
 * ASSET_PACK_NEEDINESSES_CATALOG). Kept local so settlement math does not
 * pull agent-factory graphs into `@bitcode/btd` consumers/tests.
 */
const NEEDINESSES_CATALOGUE_WEIGHTS: Readonly<Record<string, number>> = {
  'language-fit': 0.35,
  'domain-fit': 0.35,
  'interface-fit': 0.3,
};

/**
 * Canonical needinesses reading for settlement BTD mint.
 * `measurementKind` must end with `-fit` (product law); validated at compute time.
 */
export interface NeedinessReadingForSettlement {
  measurementKind: string;
  /** Normalized volume in [0, 1]. */
  volume: number;
  /** Optional row weight; catalogue weight used when omitted. */
  weight?: number;
  magnitude?: number;
  unit?: string | null;
  category?: 'neediness';
}

/**
 * Wire-compat alias used by some option cards that emit `kind` instead of
 * `measurementKind`. Both forms are fully typed — not `unknown`.
 */
export interface NeedinessReadingKindAlias {
  kind: string;
  volume: number;
  weight?: number;
  magnitude?: number;
  unit?: string | null;
  category?: 'neediness';
}

export type NeedinessRowInput = NeedinessReadingForSettlement | NeedinessReadingKindAlias;

export interface AbsoluteReadingForSettlement {
  measurementKind?: string;
  kind?: string;
  volume: number;
  magnitude?: number;
  weight?: number;
  unit?: string | null;
  category?: 'absolute';
}

/** Nested measurements bag on a settle-bound AssetPack option. */
export interface AssetPackMeasurementsForSettlement {
  absolutes?: readonly AbsoluteReadingForSettlement[];
  needinesses: readonly NeedinessRowInput[];
}

/** Option-shaped carrier that only exposes measurements. */
export interface MeasurementsCarrierForSettlement {
  measurements: AssetPackMeasurementsForSettlement;
}

/** Needinesses-only bag (no absolutes). */
export interface NeedinessesBagForSettlement {
  needinesses: readonly NeedinessRowInput[];
}

/**
 * Every accepted shape for needinesses-derived BTD mint input.
 * Exhaustive union — no `unknown`.
 */
export type SettlementBtdNeedinessesSource =
  | readonly NeedinessRowInput[]
  | NeedinessesBagForSettlement
  | AssetPackMeasurementsForSettlement
  | MeasurementsCarrierForSettlement;

export interface SettlementBtdContributionRow {
  measurementKind: string;
  volume: number;
  weight: number;
  contribution: number;
}

export interface SettlementBtdFromNeedinessesResult {
  schema: 'bitcode.settle.btd-from-needinesses';
  needinessesCount: number;
  weightedNeedinessesSum: number;
  weightSum: number;
  /** Normalized need-fit scalar in [0, 1]. */
  needFitVolume: number;
  /** Fungible BTD base units to mint (18 decimals). */
  amountBaseUnits: bigint;
  /** Human-readable whole-token equivalent (needFitVolume for unit-scale mint). */
  amountBtd: number;
  proofRoot: string;
  rows: SettlementBtdContributionRow[];
}

export interface SettlementBtdComputeOptions {
  assetPackKey?: string;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function isNeedinessReadingKindAlias(row: NeedinessRowInput): row is NeedinessReadingKindAlias {
  return 'kind' in row && typeof (row as NeedinessReadingKindAlias).kind === 'string';
}

function isNeedinessReadingForSettlement(
  row: NeedinessRowInput,
): row is NeedinessReadingForSettlement {
  return (
    'measurementKind' in row &&
    typeof (row as NeedinessReadingForSettlement).measurementKind === 'string'
  );
}

function rowKind(row: NeedinessRowInput): string | null {
  if (isNeedinessReadingForSettlement(row) && row.measurementKind.trim()) {
    return row.measurementKind.trim();
  }
  if (isNeedinessReadingKindAlias(row) && row.kind.trim()) {
    return row.kind.trim();
  }
  return null;
}

function catalogueWeight(kind: string): number | null {
  const weight = NEEDINESSES_CATALOGUE_WEIGHTS[kind];
  return typeof weight === 'number' ? weight : null;
}

function isMeasurementsCarrier(
  source: SettlementBtdNeedinessesSource,
): source is MeasurementsCarrierForSettlement {
  return (
    !Array.isArray(source) &&
    'measurements' in source &&
    typeof (source as MeasurementsCarrierForSettlement).measurements === 'object' &&
    (source as MeasurementsCarrierForSettlement).measurements !== null
  );
}

function isNeedinessesCarrier(
  source: SettlementBtdNeedinessesSource,
): source is NeedinessesBagForSettlement | AssetPackMeasurementsForSettlement {
  return (
    !Array.isArray(source) &&
    'needinesses' in source &&
    Array.isArray(
      (source as NeedinessesBagForSettlement | AssetPackMeasurementsForSettlement).needinesses,
    )
  );
}

/**
 * Extract needinesses rows from a strongly typed settlement source.
 */
export function extractNeedinessesForSettlement(
  source: SettlementBtdNeedinessesSource,
): NeedinessRowInput[] {
  // Array.isArray does not always eliminate `readonly T[]` from the union for
  // exhaustiveness (`never`) checks — handle each admitted shape and fail closed.
  if (Array.isArray(source)) {
    return [...source];
  }
  if (isMeasurementsCarrier(source)) {
    return [...(source.measurements.needinesses ?? [])];
  }
  if (isNeedinessesCarrier(source)) {
    return [...source.needinesses];
  }
  return [];
}

/**
 * Convert needFit ∈ [0,1] to 18-decimal base units without float precision loss
 * beyond 1e9 micro-resolution of the unit interval.
 */
export function needFitVolumeToBaseUnits(needFitVolume: number): bigint {
  const v = clamp01(needFitVolume);
  if (v <= 0) return 0n;
  const micro = BigInt(Math.round(v * 1e9));
  return (micro * BTD_DECIMALS_SCALE) / 1_000_000_000n;
}

/**
 * Compute fungible BTD mint amount from needinesses measurements only.
 * Fail-closed: empty / all-invalid needinesses → amount 0 (caller must block mint).
 */
export function computeSettlementBtdFromNeedinesses(
  needinessesInput: SettlementBtdNeedinessesSource,
  options?: SettlementBtdComputeOptions,
): SettlementBtdFromNeedinessesResult {
  const needinesses = extractNeedinessesForSettlement(needinessesInput);
  const rows: SettlementBtdContributionRow[] = [];
  let weightedNeedinessesSum = 0;
  let weightSum = 0;

  for (const row of needinesses) {
    const kind = rowKind(row);
    if (!kind) continue;
    // Exclude composite need-fit if present as a stored row (derived only).
    if (kind === 'need-fit') continue;
    // All needinesses kinds must end with -fit (product law).
    if (!kind.endsWith('-fit')) continue;
    const volume = clamp01(row.volume);
    if (!Number.isFinite(volume)) continue;
    const weight =
      typeof row.weight === 'number' && Number.isFinite(row.weight) && row.weight > 0
        ? row.weight
        : catalogueWeight(kind) ?? 1;
    const contribution = weight * volume;
    weightedNeedinessesSum += contribution;
    weightSum += weight;
    rows.push({ measurementKind: kind, volume, weight, contribution });
  }

  const needFitVolume = weightSum > 0 ? clamp01(weightedNeedinessesSum / weightSum) : 0;
  const amountBaseUnits = needFitVolumeToBaseUnits(needFitVolume);

  const proofRoot = createHash('sha256')
    .update(
      JSON.stringify({
        schema: 'bitcode.settle.btd-from-needinesses',
        assetPackKey: options?.assetPackKey ?? null,
        needFitVolume,
        weightedNeedinessesSum,
        weightSum,
        amountBaseUnits: amountBaseUnits.toString(),
        rows: rows.map((r) => r.measurementKind),
      }),
    )
    .digest('hex');

  return {
    schema: 'bitcode.settle.btd-from-needinesses',
    needinessesCount: rows.length,
    weightedNeedinessesSum,
    weightSum,
    needFitVolume,
    amountBaseUnits,
    amountBtd: needFitVolume,
    proofRoot: `btd-needinesses:${proofRoot}`,
    rows,
  };
}

export function assertPositiveSettlementBtd(
  result: SettlementBtdFromNeedinessesResult,
): SettlementBtdFromNeedinessesResult {
  if (result.needinessesCount === 0) {
    throw new Error(
      'Settlement BTD mint requires at least one valid needinesses *-fit measurement (absolutes never mint BTD).',
    );
  }
  if (result.amountBaseUnits <= 0n) {
    throw new Error('Settlement BTD mint amount must be positive after needinesses weighting.');
  }
  return result;
}
