/**
 * Settlement BTD amount from **needinesses only** (V48 law).
 *
 * Absolutes never mint BTD. BTD is the normalized scalar of technical knowledge
 * FIT to an industrial paid-for Need, proven only by BTC settlement for an
 * AssetPack.
 *
 * Formula:
 *   weightedNeedinessesSum = Σ (w_i * clamp01(v_i))
 *   weightSum              = Σ w_i
 *   needFitVolume          = weightSum > 0 ? weightedNeedinessesSum / weightSum : 0
 *   amountBaseUnits        = floor(needFitVolume * 10^BTD_DECIMALS)
 *
 * When catalogue weights sum to 1, needFitVolume equals the weighted mean
 * (need-fit composite). Dynamic rows re-normalize via the same division.
 */

import { createHash } from 'crypto';
import { BTD_DECIMALS_SCALE } from './types';

/**
 * Static needinesses catalogue weights (mirror of
 * ASSET_PACK_NEEDINESSES_CATALOG). Kept local so settlement math does not
 * pull agent-factory graphs into `@bitcode/btd` consumers/tests.
 */
const NEEDINESSES_CATALOGUE_WEIGHTS: Record<string, number> = {
  'language-fit': 0.35,
  'domain-fit': 0.35,
  'interface-fit': 0.3,
};

export type NeedinessRowForSettlement = {
  measurementKind?: string;
  kind?: string;
  volume?: number;
  weight?: number;
  category?: string;
};

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
  rows: Array<{
    measurementKind: string;
    volume: number;
    weight: number;
    contribution: number;
  }>;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function rowKind(row: NeedinessRowForSettlement): string | null {
  if (typeof row.measurementKind === 'string' && row.measurementKind.trim()) {
    return row.measurementKind.trim();
  }
  if (typeof row.kind === 'string' && row.kind.trim()) return row.kind.trim();
  return null;
}

function catalogueWeight(kind: string): number | null {
  const weight = NEEDINESSES_CATALOGUE_WEIGHTS[kind];
  return typeof weight === 'number' ? weight : null;
}

/**
 * Extract needinesses array from an AssetPack option / measurements bag.
 * Accepts nested `{ needinesses: [...] }` or a flat array of readings.
 */
export function extractNeedinessesForSettlement(source: unknown): NeedinessRowForSettlement[] {
  if (!source) return [];
  if (Array.isArray(source)) {
    return source.filter((row) => row && typeof row === 'object') as NeedinessRowForSettlement[];
  }
  if (typeof source !== 'object') return [];
  const record = source as Record<string, unknown>;
  if (Array.isArray(record.needinesses)) {
    return record.needinesses.filter(
      (row) => row && typeof row === 'object',
    ) as NeedinessRowForSettlement[];
  }
  if (record.measurements && typeof record.measurements === 'object') {
    return extractNeedinessesForSettlement(record.measurements);
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
  needinessesInput: unknown,
  options?: { assetPackKey?: string },
): SettlementBtdFromNeedinessesResult {
  const needinesses = extractNeedinessesForSettlement(needinessesInput);
  const rows: SettlementBtdFromNeedinessesResult['rows'] = [];
  let weightedNeedinessesSum = 0;
  let weightSum = 0;

  for (const row of needinesses) {
    const kind = rowKind(row);
    if (!kind) continue;
    // Exclude composite need-fit if present as a stored row (derived only).
    if (kind === 'need-fit') continue;
    // All needinesses kinds must end with -fit (product law).
    if (!kind.endsWith('-fit')) continue;
    const volume = clamp01(typeof row.volume === 'number' ? row.volume : Number.NaN);
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
        assetPackKey: options?.assetPackKey || null,
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
