/**
 * Typed deposit Implementation handoff:
 *   plan → patchfile write → measurements → commercial NL.
 *
 * Deposit AssetPack =
 *   metadata (kind, title, summary, coveredSourcePaths, confidence)
 *   + patch descriptor { fileChanges, patchSummary }  // create|modify only
 *   + patchArtifact (ONE formal AssetPackPatchArtifact handle per pack)
 *   + measurements.absolutes
 *   + commercialTitle / commercialDescription (buyer product brief; grounded in full patch)
 *
 * Construction is allowlist-only.
 */

import type { DepositOptionKind } from './deposit-asset-pack-synthesis-schema';
import {
  hasDepositAbsolutesOnlyShape,
  hasRequiredAbsolutes,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-pack-measurements';

/**
 * Patch descriptor for deposit Implementation.
 * path+op always; optional `content` is depositor-owned full file body for the
 * admitted/settled material (bound from checkout at patchfile write).
 * Never shown on unpaid Exchange surfaces.
 */
export type DepositPatchfileDescriptor = {
  fileChanges: Array<{
    path: string;
    /** Commercial deposit .patch: create|modify only (no deletions). */
    op: 'create' | 'modify' | string;
    /** Full file body when attached for depositor review / settle. */
    content?: string;
  }>;
  patchSummary: string;
};

/**
 * Singular written patchfile artifact handle (7th field).
 * Built by the patchfile-write agent. Carries path+op always; file bodies when
 * checkout sources were available. `unifiedDiff` is the depositor .patch text.
 */
export type DepositPatchArtifactHandle = {
  artifactId: string;
  assetPackId: string;
  schema: string;
  productSchema: string;
  format: string;
  patchSummary: string;
  fileCount: number;
  files: Array<{ path: string; op: string; body?: string | null }>;
  name: string;
  /** JSON product envelope (may include bodies for owner persistence). */
  envelopeJson: string;
  /**
   * Unified-diff text of the full admitted material when bodies were bound.
   * Download as `{title}.patch` for the depositor.
   */
  unifiedDiff?: string | null;
  /** True when every non-delete path has a body (complete material). */
  bodiesComplete?: boolean;
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
  /** Honesty: measured vs expanded-fill vs insufficient_evidence, etc. */
  status?:
    | 'measured'
    | 'estimated'
    | 'insufficient_evidence'
    | 'expanded-fill'
    | 'not_run'
    | 'not_implemented'
    | string;
};

/** Measure-session honesty telemetry attached with absolutes. */
export type DepositMeasureReport = {
  measuredFromBodies: number;
  coveredPathCount: number;
  bodyCoverageRatio: number;
  expandedFillCount: number;
  mode: 'deep' | 'thin' | 'path-only';
  toolInvocations?: number;
  measuredKindCount?: number;
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
 * After measurements agent: measured deposit DataPack.
 * materialIdentity is buyer-visible multi-valued identity (domain bag).
 * measureReport is honesty telemetry for the measure session.
 * commercialTitle / commercialDescription are attached by the commercial-NL agent.
 */
export type DepositMeasuredPack = DepositPatchfilePack & {
  measurements: {
    absolutes: DepositAbsoluteReading[];
    materialIdentity?: Record<string, unknown> | null;
    measureReport?: DepositMeasureReport | null;
  };
  absolutes?: DepositAbsoluteReading[];
  materialIdentity?: Record<string, unknown> | null;
  measureReport?: DepositMeasureReport | null;
  /** Buyer product commercial title (grounded in real .patch material). */
  commercialTitle?: string;
  /**
   * Rich buyer commercial description from full patch + measurements.
   * Product surfaces may show this pre-settle; full file bodies stay rights-gated.
   */
  commercialDescription?: string;
};

/** After commercial-NL agent: measured pack + commercial prose. */
export type DepositCommercialPack = DepositMeasuredPack & {
  commercialTitle: string;
  commercialDescription: string;
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

export type DepositCommercialNlPhaseOutput = {
  success: boolean;
  semanticKind: 'asset-pack-commercial-nl';
  options: DepositCommercialPack[];
  summary: string;
  assetPack: { repository: unknown };
  patchPlanComplete: true;
  patchfileWritten: boolean;
  measured: boolean;
  presentable: boolean;
  salvaged: boolean;
  salvageCount: number;
  commercialNlComplete: boolean;
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
  materialIdentity?: Record<string, unknown> | null,
  measureReport?: DepositMeasureReport | null,
): DepositMeasuredPack {
  const bag: DepositMeasuredPack['measurements'] = { absolutes };
  if (materialIdentity) bag.materialIdentity = materialIdentity;
  if (measureReport) bag.measureReport = measureReport;
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
    measurements: bag,
    absolutes,
    ...(materialIdentity ? { materialIdentity } : {}),
    ...(measureReport ? { measureReport } : {}),
  };
}

/** Attach commercial NL prose onto a measured pack (agent 4/4). */
export function toDepositCommercialPack(
  measured: DepositMeasuredPack,
  commercial: { commercialTitle: string; commercialDescription: string },
): DepositCommercialPack {
  const title = String(commercial.commercialTitle || '').trim() || measured.title;
  const description =
    String(commercial.commercialDescription || '').trim() || measured.summary;
  return {
    ...measured,
    commercialTitle: title,
    commercialDescription: description,
  };
}

/** True when commercial prose is present and non-trivial. */
export function hasCommercialNl(pack: unknown): boolean {
  if (!pack || typeof pack !== 'object') return false;
  const p = pack as DepositCommercialPack;
  return (
    typeof p.commercialTitle === 'string' &&
    p.commercialTitle.trim().length >= 8 &&
    typeof p.commercialDescription === 'string' &&
    p.commercialDescription.trim().length >= 80
  );
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
 * patch artifact + measurements.absolutes (full commercial catalogue)
 * + not salvaged + no delete ops + bodies complete when claimed.
 */
export function isDepositPresentablePack(pack: unknown): boolean {
  if (!pack || typeof pack !== 'object') return false;
  const p = pack as DepositMeasuredPack & {
    salvaged?: boolean;
    patch?: DepositPatchfileDescriptor;
    patchArtifact?: DepositPatchArtifactHandle;
  };
  if (p.salvaged === true) return false;
  if (!hasPatchArtifact(p)) return false;
  if (!hasDepositAbsolutesOnlyShape(p)) return false;
  if (!hasRequiredAbsolutes(p)) return false;
  // No deletions in commercial deposit patch.
  const changes =
    p.patchArtifact?.files ||
    p.patch?.fileChanges ||
    [];
  for (const c of changes) {
    if (String((c as { op?: string }).op || '').toLowerCase() === 'delete') {
      return false;
    }
  }
  // When artifact claims body completeness, require true.
  if (p.patchArtifact && p.patchArtifact.bodiesComplete === false) {
    return false;
  }
  return true;
}

export function countSalvagedPacks(options: unknown[]): number {
  if (!Array.isArray(options)) return 0;
  return options.filter((o) => o && typeof o === 'object' && (o as any).salvaged === true).length;
}
