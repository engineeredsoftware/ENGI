/**
 * Nested AssetPack measurement attach / resolve.
 *
 * Deposit: measurements = { absolutes } only. Built by assignment of a legal
 * object — never by deleting foreign keys from a dirty bag.
 *
 * Read: measurements = { absolutes, needinesses }. Neediness lives only on Read.
 *
 * Quantity absolute kinds are tool-authoritative (static analysis).
 * Quality absolute kinds may be judgment grounded in tool counts when real
 * inference is enabled (see measureDataPackAbsolutes).
 */

import { DATA_PACK_ABSOLUTES_CATALOG } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

export type AbsoluteLike = {
  measurementKind: string;
  label?: string;
  weight?: number;
  volume: number;
  magnitude?: number;
  unit?: string;
  category?: string;
  /** Source-safe instance prose for this reading (attached at measure time). */
  descriptor?: string;
  kind?: string;
};

/** Tool-authoritative structure quantity kinds (static analysis / path span). */
export const DEPOSIT_QUANTITY_ABSOLUTE_KINDS = [
  'function-count',
  'type-count',
  'file-span',
  'symbolic-richness',
  'modularity',
  'lang-span',
  'test-surface',
  'api-surface',
  'dependency-span',
  'doc-signal',
  'data-flow-depth',
  'symbol-connectivity',
  'control-complexity',
  'config-surface',
] as const;

/** Judgment-grounded quality kinds (may use measure-agent under real inference). */
export const DEPOSIT_QUALITY_ABSOLUTE_KINDS = [
  'correctness-estimate',
  'objectives-fidelity',
  'computational-usage',
  'coherence',
  'completeness',
  'capability-clarity',
  'documentation-alignment',
] as const;

export function resolvePackAbsolutes(pack: unknown): AbsoluteLike[] {
  if (!pack || typeof pack !== 'object') return [];
  const p = pack as Record<string, unknown>;
  const nested = p.measurements;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const abs = (nested as { absolutes?: unknown }).absolutes;
    if (Array.isArray(abs)) return abs as AbsoluteLike[];
  }
  if (Array.isArray(p.absolutes)) return p.absolutes as AbsoluteLike[];
  if (Array.isArray(nested)) {
    return (nested as AbsoluteLike[]).filter(
      (m) => !m?.category || m.category === 'absolute',
    );
  }
  return [];
}

/** Read-pipeline only. Deposit packs do not use this. */
export function resolvePackNeedinesses(pack: unknown): AbsoluteLike[] {
  if (!pack || typeof pack !== 'object') return [];
  const p = pack as Record<string, unknown>;
  const nested = p.measurements;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const n = (nested as { needinesses?: unknown }).needinesses;
    if (Array.isArray(n)) return n as AbsoluteLike[];
  }
  if (Array.isArray(nested)) {
    return (nested as AbsoluteLike[]).filter((m) => m?.category === 'neediness');
  }
  return [];
}

/**
 * Deposit measurements attach: assign legal shape only.
 * Does not scan for or delete foreign keys — callers must project deposit packs
 * onto DepositMeasuredPack (allowlist) so illegal fields never land.
 */
export function attachDepositAbsolutes(
  pack: Record<string, unknown>,
  absolutes: AbsoluteLike[],
): void {
  pack.measurements = { absolutes };
  pack.absolutes = absolutes;
}

/**
 * Attach nested absolutes.
 * Default: deposit legal shape { absolutes }.
 * Read: pass `{ withNeedinesses: readings }` after measuring *-fit.
 */
export function attachNestedAbsolutes(
  pack: Record<string, unknown>,
  absolutes: AbsoluteLike[],
  opts?: { withNeedinesses?: AbsoluteLike[] },
): void {
  if (opts?.withNeedinesses) {
    pack.measurements = {
      absolutes,
      needinesses: opts.withNeedinesses,
    };
    pack.absolutes = absolutes;
    return;
  }
  attachDepositAbsolutes(pack, absolutes);
}

/**
 * Deposit/read finish readiness: full commercial catalogue present with finite
 * volume + magnitude per reading. Law is **all 46** kinds (not legacy 11).
 * Missing host signals must still attach volume 0 / magnitude 0, not omit rows.
 */
export function hasRequiredAbsolutes(pack: unknown): boolean {
  const abs = resolvePackAbsolutes(pack);
  if (abs.length < DATA_PACK_ABSOLUTES_CATALOG.length) return false;
  return abs.every(
    (m) =>
      typeof m.volume === 'number' &&
      Number.isFinite(m.volume) &&
      typeof m.magnitude === 'number' &&
      Number.isFinite(m.magnitude),
  );
}

/**
 * True when measurements is exactly the deposit legal shape: only `absolutes`.
 * Used by presentable / Validation structure checks — not a "contamination scrub".
 */
export function hasDepositAbsolutesOnlyShape(pack: unknown): boolean {
  if (!pack || typeof pack !== 'object') return false;
  const nested = (pack as Record<string, unknown>).measurements;
  if (!nested || typeof nested !== 'object' || Array.isArray(nested)) return false;
  const keys = Object.keys(nested);
  if (keys.length !== 1 || keys[0] !== 'absolutes') return false;
  return Array.isArray((nested as { absolutes: unknown }).absolutes);
}
