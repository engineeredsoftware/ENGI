/**
 * Nested DataPack measurement attach / resolve.
 *
 * Hierarchy: measurement-generics carrier → product attach helpers here.
 *
 * Deposit: measurements = { absolutes, materialIdentity?, needinesses: [] omitted or empty }
 * Read: measurements = { absolutes, needinesses, materialIdentity? }
 *
 * Quantity absolute kinds are tool-authoritative (static analysis + material identity).
 * Quality absolute kinds may be judgment grounded in tool counts when real
 * inference is enabled (see measureDataPackAbsolutes).
 */

import { DATA_PACK_ABSOLUTES_CATALOG } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';
import type { DataPackMaterialIdentity } from '@bitcode/generic-measurements-domain-data-pack-material-identity';
import type {
  AbsoluteReadingStatus,
  DataPackMeasureReport,
} from '@bitcode/measurement-generics';

export type { AbsoluteReadingStatus, DataPackMeasureReport };

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
  /** Honesty class — never treat expanded-fill zeros as measured clean. */
  status?: AbsoluteReadingStatus | string;
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
  // Material-identity companion quantities (host-authoritative when measured)
  'language-concentration',
  'framework-surface',
  'dependency-class-balance',
  'external-service-coupling',
  'contract-surface',
  'type-safety-pressure',
  'observability-surface',
  'test-as-spec',
  'capability-surface',
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
  'purpose-clarity',
  'portability',
  'architectural-pattern-density',
  'change-intent-clarity',
  'data-architecture-clarity',
  'concurrency-model-clarity',
  'api-style-clarity',
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

/** Source-safe material identity bag when attached. */
export function resolvePackMaterialIdentity(
  pack: unknown,
): DataPackMaterialIdentity | null {
  if (!pack || typeof pack !== 'object') return null;
  const p = pack as Record<string, unknown>;
  const nested = p.measurements;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const mi = (nested as { materialIdentity?: unknown }).materialIdentity;
    if (mi && typeof mi === 'object' && !Array.isArray(mi)) {
      return mi as DataPackMaterialIdentity;
    }
  }
  if (p.materialIdentity && typeof p.materialIdentity === 'object') {
    return p.materialIdentity as DataPackMaterialIdentity;
  }
  return null;
}

export type AttachMeasurementsOpts = {
  withNeedinesses?: AbsoluteLike[];
  materialIdentity?: DataPackMaterialIdentity | null;
  measureReport?: DataPackMeasureReport | null;
};

/**
 * Deposit measurements attach: legal shape
 * { absolutes, materialIdentity?, measureReport? }.
 * Does not scan for or delete foreign keys — callers must project deposit packs
 * onto deposit allowlists so illegal fields never land.
 */
export function attachDepositAbsolutes(
  pack: Record<string, unknown>,
  absolutes: AbsoluteLike[],
  opts?: {
    materialIdentity?: DataPackMaterialIdentity | null;
    measureReport?: DataPackMeasureReport | null;
  },
): void {
  const materialIdentity = opts?.materialIdentity ?? null;
  const measureReport = opts?.measureReport ?? null;
  const bag: Record<string, unknown> = { absolutes };
  if (materialIdentity) bag.materialIdentity = materialIdentity;
  if (measureReport) bag.measureReport = measureReport;
  pack.measurements = bag;
  pack.absolutes = absolutes;
  if (materialIdentity) {
    pack.materialIdentity = materialIdentity;
  } else {
    delete pack.materialIdentity;
  }
  if (measureReport) {
    pack.measureReport = measureReport;
  } else {
    delete pack.measureReport;
  }
}

/**
 * Attach nested absolutes (+ optional needinesses + material identity + report).
 * Default: deposit legal shape { absolutes, materialIdentity?, measureReport? }.
 * Read: pass `{ withNeedinesses: readings }` after measuring *-fit.
 */
export function attachNestedAbsolutes(
  pack: Record<string, unknown>,
  absolutes: AbsoluteLike[],
  opts?: AttachMeasurementsOpts,
): void {
  const materialIdentity = opts?.materialIdentity ?? null;
  const measureReport = opts?.measureReport ?? null;
  if (opts?.withNeedinesses) {
    pack.measurements = {
      absolutes,
      needinesses: opts.withNeedinesses,
      ...(materialIdentity ? { materialIdentity } : {}),
      ...(measureReport ? { measureReport } : {}),
    };
    pack.absolutes = absolutes;
    if (materialIdentity) pack.materialIdentity = materialIdentity;
    else delete pack.materialIdentity;
    if (measureReport) pack.measureReport = measureReport;
    else delete pack.measureReport;
    return;
  }
  attachDepositAbsolutes(pack, absolutes, { materialIdentity, measureReport });
}

/** Source-safe measure telemetry when attached. */
export function resolvePackMeasureReport(
  pack: unknown,
): DataPackMeasureReport | null {
  if (!pack || typeof pack !== 'object') return null;
  const p = pack as Record<string, unknown>;
  const nested = p.measurements;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const mr = (nested as { measureReport?: unknown }).measureReport;
    if (mr && typeof mr === 'object' && !Array.isArray(mr)) {
      return mr as DataPackMeasureReport;
    }
  }
  if (p.measureReport && typeof p.measureReport === 'object') {
    return p.measureReport as DataPackMeasureReport;
  }
  return null;
}

/** Build a measureReport from body/coverage signals + absolute honesty counts. */
export function buildDataPackMeasureReport(input: {
  measuredFromBodies: number;
  coveredPathCount: number;
  bodyCoverageRatio?: number;
  absolutes?: AbsoluteLike[];
  toolInvocations?: number;
}): DataPackMeasureReport {
  const abs = input.absolutes || [];
  const expandedFillCount = abs.filter((a) => a.status === 'expanded-fill').length;
  const measuredKindCount = abs.filter(
    (a) => a.status === 'measured' || a.status === 'estimated',
  ).length;
  const bodies = Math.max(0, Math.floor(input.measuredFromBodies));
  const covered = Math.max(0, Math.floor(input.coveredPathCount));
  const ratio =
    typeof input.bodyCoverageRatio === 'number' && Number.isFinite(input.bodyCoverageRatio)
      ? Math.max(0, Math.min(1, input.bodyCoverageRatio))
      : covered > 0
        ? Math.max(0, Math.min(1, bodies / covered))
        : 0;
  let mode: DataPackMeasureReport['mode'] = 'path-only';
  if (bodies >= 8 && ratio >= 0.5) mode = 'deep';
  else if (bodies > 0) mode = 'thin';
  return {
    measuredFromBodies: bodies,
    coveredPathCount: covered,
    bodyCoverageRatio: Number(ratio.toFixed(4)),
    expandedFillCount,
    mode,
    ...(typeof input.toolInvocations === 'number'
      ? { toolInvocations: Math.max(0, Math.floor(input.toolInvocations)) }
      : {}),
    measuredKindCount,
  };
}

/**
 * Deposit/read finish readiness: full commercial catalogue present with finite
 * volume + magnitude per reading. Law is **all catalogue** kinds.
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
 * True when measurements is the deposit legal shape: absolutes required;
 * materialIdentity / measureReport optional; needinesses absent or empty.
 */
export function hasDepositAbsolutesOnlyShape(pack: unknown): boolean {
  if (!pack || typeof pack !== 'object') return false;
  const nested = (pack as Record<string, unknown>).measurements;
  if (!nested || typeof nested !== 'object' || Array.isArray(nested)) return false;
  const bag = nested as Record<string, unknown>;
  const keys = Object.keys(bag);
  if (!keys.includes('absolutes') || !Array.isArray(bag.absolutes)) return false;
  for (const k of keys) {
    if (k === 'absolutes' || k === 'materialIdentity' || k === 'measureReport') {
      continue;
    }
    if (k === 'needinesses') {
      const n = bag.needinesses;
      if (Array.isArray(n) && n.length > 0) return false;
      continue;
    }
    return false;
  }
  return true;
}
