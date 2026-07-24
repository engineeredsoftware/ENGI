/**
 * Typed deposit Implementation handoff (plan → patchfile write → measurements).
 *
 * Deposit AssetPack =
 *   metadata (kind, title, summary, coveredSourcePaths, confidence)
 *   + patch descriptor { fileChanges, patchSummary }
 *   + patchArtifact (ONE formal AssetPackPatchArtifact handle per pack)  // 7th
 *   + measurements.absolutes
 *
 * Construction is allowlist-only.
 */

import type { DepositOptionKind } from './deposit-asset-pack-synthesis-schema';
import {
  hasDepositAbsolutesOnlyShape,
  hasRequiredAbsolutes,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-pack-measurements';

/** SOURCE-SAFE patch descriptor — path+op only; never code/diffs. */
export type DepositPatchfileDescriptor = {
  fileChanges: Array<{ path: string; op: 'create' | 'modify' | 'delete' | string }>;
  patchSummary: string;
};

/**
 * Review-safe handle for the singular written patchfile artifact (7th field).
 * Built by the patchfile-write agent via buildAssetPackPatchArtifact (path-op-json).
 * No file bodies in default product projection.
 */
export type DepositPatchArtifactHandle = {
  artifactId: string;
  assetPackId: string;
  schema: string;
  productSchema: string;
  format: string;
  patchSummary: string;
  fileCount: number;
  files: Array<{ path: string; op: string }>;
  name: string;
  /** Serialized path-op-json product envelope (source-safe). */
  envelopeJson: string;
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
  /** Source-safe instance prose for this reading (attached at measure time). */
  descriptor?: string;
};

/**
 * After patch-plan agent: six fields + optional salvage.
 * No patchArtifact yet (write agent owns that).
 */
export type DepositPatchPlanPack = {
  kind: DepositOptionKind | string;
  title: string;
  summary: string;
  coveredSourcePaths: string[];
  confidence: number;
  patch: DepositPatchfileDescriptor;
  salvaged?: boolean;
  salvageReason?: string;
};

/**
 * After patchfile-write agent: plan pack + formal patchfile artifact.
 */
export type DepositPatchfilePack = DepositPatchPlanPack & {
  patchArtifact: DepositPatchArtifactHandle;
};

/**
 * After measurements agent: measured deposit AssetPack.
 */
export type DepositMeasuredPack = DepositPatchfilePack & {
  measurements: {
    absolutes: DepositAbsoluteReading[];
  };
  absolutes?: DepositAbsoluteReading[];
};

export type DepositPatchPlanPhaseOutput = {
  success: boolean;
  semanticKind: 'asset-pack-patch-plan';
  options: DepositPatchPlanPack[];
  summary: string;
  assetPack: { repository: unknown };
  patchPlanComplete: true;
  patchfileWritten: false;
  measured: false;
  salvaged: boolean;
  salvageCount: number;
};

export type DepositPatchfileWritePhaseOutput = {
  success: boolean;
  semanticKind: 'asset-pack-patchfile-written';
  options: DepositPatchfilePack[];
  summary: string;
  assetPack: { repository: unknown };
  patchPlanComplete: true;
  patchfileWritten: boolean;
  measured: false;
  salvaged: boolean;
  salvageCount: number;
  patchArtifacts: DepositPatchArtifactHandle[];
};

export type DepositMeasurementReportRow = {
  title: string;
  pathScopeSize: number;
  absoluteCount: number;
  measuredFromBodies: boolean;
  depositShapeOk: boolean;
  hasPatchArtifact: boolean;
  patchArtifactId?: string;
  salvaged: boolean;
  ok: boolean;
};

export type DepositMeasurementsPhaseOutput = {
  success: boolean;
  semanticKind: 'asset-pack-written-asset';
  options: DepositMeasuredPack[];
  summary: string;
  assetPack: { repository: unknown };
  patchPlanComplete: true;
  patchfileWritten: boolean;
  measured: boolean;
  presentable: boolean;
  salvaged: boolean;
  salvageCount: number;
  measurementReports: DepositMeasurementReportRow[];
};

/** @deprecated Use DepositPatchPlanPack — plan agent output before artifact write. */
export type DepositPatchfilePhaseOutput = DepositPatchPlanPhaseOutput;

export function toDepositPatchPlanPack(raw: {
  kind?: string;
  title: string;
  summary: string;
  coveredSourcePaths: string[];
  confidence: number;
  patch: DepositPatchfileDescriptor;
  salvaged?: boolean;
  salvageReason?: string;
}): DepositPatchPlanPack {
  const pack: DepositPatchPlanPack = {
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

/** @deprecated Use toDepositPatchPlanPack. */
export const toDepositPatchfilePack = toDepositPatchPlanPack;

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
    patchArtifact: patchfile.patchArtifact,
    ...(patchfile.salvaged === true
      ? { salvaged: true as const, salvageReason: patchfile.salvageReason }
      : {}),
    measurements: { absolutes },
    absolutes,
  };
}

export function hasPatchArtifact(pack: unknown): boolean {
  if (!pack || typeof pack !== 'object') return false;
  const a = (pack as { patchArtifact?: DepositPatchArtifactHandle }).patchArtifact;
  return (
    !!a &&
    typeof a.artifactId === 'string' &&
    a.artifactId.length > 0 &&
    typeof a.envelopeJson === 'string' &&
    a.envelopeJson.length > 0 &&
    Array.isArray(a.files) &&
    a.files.length > 0
  );
}

/**
 * Presentable for depositor review:
 * patch artifact + measurements.absolutes only (full 46 commercial catalogue)
 * + not salvaged.
 */
export function isDepositPresentablePack(pack: unknown): boolean {
  if (!pack || typeof pack !== 'object') return false;
  const p = pack as DepositMeasuredPack & { salvaged?: boolean };
  if (p.salvaged === true) return false;
  if (!hasPatchArtifact(p)) return false;
  // Same commercial law as finish readiness: all 46 with finite volume+magnitude.
  if (!hasDepositAbsolutesOnlyShape(p)) return false;
  return hasRequiredAbsolutes(p);
}

export function countSalvagedPacks(options: unknown[]): number {
  if (!Array.isArray(options)) return 0;
  return options.filter((o) => o && typeof o === 'object' && (o as any).salvaged === true).length;
}
