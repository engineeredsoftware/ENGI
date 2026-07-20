/**
 * Typed deposit Implementation handoff (agents 1/2 → 2/2 → Finish).
 *
 * Deposit AssetPack = patchfile + measurements.absolutes + metadata.
 * Construction is allowlist-only: packs are built as these types, never
 * scrubbed from a dirty super-object.
 */

import type { DepositOptionKind } from './deposit-asset-pack-synthesis-schema';

/** SOURCE-SAFE patch descriptor — path+op only; never code/diffs. */
export type DepositPatchfileDescriptor = {
  fileChanges: Array<{ path: string; op: 'create' | 'modify' | 'delete' | string }>;
  patchSummary: string;
};

/** Absolute measurement row (host/tool-authored). */
export type DepositAbsoluteReading = {
  measurementKind: string;
  label?: string;
  weight?: number;
  volume: number;
  magnitude?: number;
  unit?: string;
  category?: 'absolute' | string;
};

/**
 * Agent 1/2 output element: one patchfile + metadata per AssetPack.
 * Allowlisted fields only — no measurements object yet.
 */
export type DepositPatchfilePack = {
  kind: DepositOptionKind | string;
  title: string;
  summary: string;
  coveredSourcePaths: string[];
  confidence: number;
  patch: DepositPatchfileDescriptor;
  /**
   * Host salvage after empty/invalid model Refine.
   * May be measured for continuity; never presentable for deposit review.
   */
  salvaged?: boolean;
  salvageReason?: string;
};

/**
 * Agent 2/2 output element: measured deposit AssetPack.
 * measurements = { absolutes } only — that is the entire measurements object.
 */
export type DepositMeasuredPack = DepositPatchfilePack & {
  measurements: {
    absolutes: DepositAbsoluteReading[];
  };
  /** Legacy dual-write for dispatch validateDepositSynthesisOptions. */
  absolutes?: DepositAbsoluteReading[];
};

export type DepositPatchfilePhaseOutput = {
  success: boolean;
  semanticKind: 'asset-pack-patchfile-synthesized';
  options: DepositPatchfilePack[];
  summary: string;
  assetPack: { repository: unknown };
  patchfilePhaseComplete: true;
  measured: false;
  salvaged: boolean;
  salvageCount: number;
};

export type DepositMeasurementReportRow = {
  title: string;
  pathScopeSize: number;
  absoluteCount: number;
  measuredFromBodies: boolean;
  depositShapeOk: boolean;
  salvaged: boolean;
  ok: boolean;
};

export type DepositMeasurementsPhaseOutput = {
  success: boolean;
  semanticKind: 'asset-pack-written-asset';
  options: DepositMeasuredPack[];
  summary: string;
  assetPack: { repository: unknown };
  patchfilePhaseComplete: true;
  measured: boolean;
  presentable: boolean;
  salvaged: boolean;
  salvageCount: number;
  measurementReports: DepositMeasurementReportRow[];
};

/** Allowlist-project a gated model row into DepositPatchfilePack. */
export function toDepositPatchfilePack(raw: {
  kind?: string;
  title: string;
  summary: string;
  coveredSourcePaths: string[];
  confidence: number;
  patch: DepositPatchfileDescriptor;
  salvaged?: boolean;
  salvageReason?: string;
}): DepositPatchfilePack {
  const pack: DepositPatchfilePack = {
    kind: raw.kind ?? 'capability-slice',
    title: raw.title,
    summary: raw.summary,
    coveredSourcePaths: raw.coveredSourcePaths,
    confidence: raw.confidence,
    patch: {
      fileChanges: (raw.patch.fileChanges || []).map((fc) => ({
        path: String(fc.path),
        op: fc.op,
      })),
      patchSummary: String(raw.patch.patchSummary ?? ''),
    },
  };
  if (raw.salvaged === true) {
    pack.salvaged = true;
    pack.salvageReason = raw.salvageReason ?? 'host-salvage';
  }
  return pack;
}

/** Build a deposit measured pack (legal shape only). */
export function toDepositMeasuredPack(
  patchfile: DepositPatchfilePack,
  absolutes: DepositAbsoluteReading[],
): DepositMeasuredPack {
  return {
    kind: patchfile.kind,
    title: patchfile.title,
    summary: patchfile.summary,
    coveredSourcePaths: patchfile.coveredSourcePaths,
    confidence: patchfile.confidence,
    patch: patchfile.patch,
    ...(patchfile.salvaged === true
      ? { salvaged: true as const, salvageReason: patchfile.salvageReason }
      : {}),
    measurements: { absolutes },
    absolutes,
  };
}

/**
 * Finish / UI gate: presentable for depositor review.
 * Requires deposit legal measurements shape, required absolute volumes, not salvaged.
 */
export function isDepositPresentablePack(pack: unknown): boolean {
  if (!pack || typeof pack !== 'object') return false;
  const p = pack as DepositMeasuredPack & { salvaged?: boolean };
  if (p.salvaged === true) return false;
  const nested = p.measurements;
  if (!nested || typeof nested !== 'object' || Array.isArray(nested)) return false;
  const keys = Object.keys(nested);
  if (keys.length !== 1 || keys[0] !== 'absolutes') return false;
  const abs = nested.absolutes;
  if (!Array.isArray(abs) || abs.length === 0) return false;
  return abs.every(
    (row) =>
      typeof row?.volume === 'number' &&
      Number.isFinite(row.volume) &&
      typeof row?.magnitude === 'number' &&
      Number.isFinite(row.magnitude),
  );
}

export function countSalvagedPacks(options: unknown[]): number {
  if (!Array.isArray(options)) return 0;
  return options.filter((o) => o && typeof o === 'object' && (o as any).salvaged === true).length;
}
