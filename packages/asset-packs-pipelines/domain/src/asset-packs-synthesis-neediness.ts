/**
 * Deposit neediness computation (read-demand preview).
 *
 * neediness = clamp01(demand × (0.5 + 0.5·(1 − saturation))).
 * Source-safe: scalars + topic-level rationale only — never raw source.
 */

import type { AssetPackNeediness } from './asset-packs-synthesis-types';

/** Clamp a number into [0, 1] with two-decimal fixed precision. */
export function clampVolume(value: number): number {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}

/**
 * Compute neediness (v0): demand gates, scarcity boosts. A demanded, underserved
 * pack scores highest; a saturated or undemanded pack scores low.
 */
export function computeNeediness(demand: number, saturation: number): number {
  const d = clampVolume(Number.isFinite(demand) ? demand : 0);
  const s = clampVolume(Number.isFinite(saturation) ? saturation : 0);
  return clampVolume(d * (0.5 + 0.5 * (1 - s)));
}

/** Build the neediness preview from a raw per-pack signal (deposit lens). */
export function buildNeedinessFromSignal(signal: {
  demand?: unknown;
  saturation?: unknown;
  rationale?: unknown;
} | null | undefined): AssetPackNeediness | undefined {
  if (!signal || typeof signal !== 'object') return undefined;
  const demand = clampVolume(
    Number.isFinite(Number((signal as { demand?: unknown }).demand))
      ? Number((signal as { demand?: unknown }).demand)
      : 0,
  );
  const saturation = clampVolume(
    Number.isFinite(Number((signal as { saturation?: unknown }).saturation))
      ? Number((signal as { saturation?: unknown }).saturation)
      : 0,
  );
  return {
    volume: computeNeediness(demand, saturation),
    demand,
    saturation,
    rationale: String((signal as { rationale?: unknown }).rationale ?? '').trim(),
  };
}
