/**
 * AssetPacksSynthesis domain types (lens, inventory, candidates, results).
 *
 * Shared by the public barrel, formal pipeline, deposit validation, and option
 * projection. No runtime logic — pure type surface for the synthesis core.
 */

import type { Execution } from '@bitcode/execution-generics/Execution';
import type { MeasurementSpec } from '@bitcode/measurement-generics';

export type AssetPacksSynthesisLens = 'deposit' | 'read';

export interface AssetPackMeasurementSpec {
  measurementKind: string;
  label: string;
  weight: number;
  guidance: string;
}

/**
 * Absolute measurements are INTRINSIC properties of digital material (the
 * synthesized AssetPack patch), independent of any reader/Need/market.
 */
export type AbsolutePropertyClass = 'quantity' | 'quality';

export interface AssetPackAbsoluteSpec extends MeasurementSpec {
  /** Weight in the absolute weighted composite (Σ = 1). */
  weight: number;
  /** Quantity (how much / how large) vs quality (how good / how fit-for-purpose). */
  propertyClass: AbsolutePropertyClass;
}

export interface AssetPacksSynthesisSourceSample {
  path: string;
  excerpt: string;
}

/** A full-content source file from the host checkout (every blob, verbatim). */
export interface AssetPacksSynthesisSourceFile {
  path: string;
  content: string;
}

export interface AssetPacksSynthesisSourceInventory {
  paths: string[];
  samples: AssetPacksSynthesisSourceSample[];
  /**
   * The FULL verbatim source of the host checkout — every tracked file's
   * content, provisioned by the primitive Host. Feeds measurement tools;
   * the bounded `samples` feed prompts. Optional for back-compat.
   */
  sources?: AssetPacksSynthesisSourceFile[];
  totalPathCount: number;
  excludedPathCount: number;
}

export interface AssetPacksSynthesisSteering {
  instructions: string | null;
  forcedExclusions: string[];
  demandContext: string[];
}

export interface AssetPacksSynthesisRequest {
  lens: AssetPacksSynthesisLens;
  repositoryFullName: string;
  sourceBranch: string | null;
  sourceCommit: string | null;
  steering: AssetPacksSynthesisSteering;
  inventory: AssetPacksSynthesisSourceInventory;
  candidateKinds: string[];
  maxCandidates?: number;
  /**
   * Optional execution-generics Execution node. When provided, the formal
   * AssetPacksSynthesis pipeline runs as nested child nodes under it.
   * When absent, a detached root Execution is created so synthesis still runs.
   */
  execution?: Execution | null;
}

export interface AssetPackCandidateMeasurement {
  measurementKind: string;
  label: string;
  weight: number;
  /** Normalized 0..1 — the value the weighted composite uses. */
  volume: number;
  /**
   * Absolutes form the weighted composite; needinesses are reader-relative
   * previews and are NEVER in the absolute composite. Optional for back-compat.
   */
  category?: 'absolute' | 'neediness';
  /** Raw count/quantity for size measurements (functions/types/files). */
  magnitude?: number;
  /** The reading's unit: functions | types | files | estimate | normalized. */
  unit?: string;
}

/**
 * Neediness — deposit-lens PREVIEW of read Need-fit (v0). SEPARATE from the
 * absolute deposit composite. Source-safe: scalars + topic-level rationale only.
 */
export interface AssetPackNeediness {
  /** Computed 0..1 = demand × (0.5 + 0.5·(1−saturation)). */
  volume: number;
  /** 0..1 estimated reading demand for the pack's knowledge. */
  demand: number;
  /** 0..1 how much the Depository already supplies the topic. */
  saturation: number;
  /** Source-safe rationale for the demand/saturation estimate. */
  rationale: string;
}

/**
 * Source-safe patch descriptor — synthesized AssetPack CONTENTS the depositor
 * reviews. NEVER raw source/code.
 */
export interface AssetPackPatchDescriptor {
  fileChanges: Array<{ path: string; op: string }>;
  patchSummary: string;
}

export interface AssetPackCandidate {
  kind: string;
  title: string;
  summary: string;
  coveredSourcePaths: string[];
  measurements: AssetPackCandidateMeasurement[];
  measurementRationale: string;
  confidence: number;
  /** The synthesized AP contents (source-safe patch descriptor). */
  patch?: AssetPackPatchDescriptor;
  /** Deposit lens only: the read-demand preview (v0). */
  neediness?: AssetPackNeediness;
}

export interface AssetPacksSynthesisInferenceAccounting {
  provider: string | null;
  model: string | null;
  totalTokens: number | null;
  durationMs: number | null;
}

export interface AssetPacksSynthesisResult {
  lens: AssetPacksSynthesisLens;
  candidates: AssetPackCandidate[];
  droppedCandidateCount: number;
  exclusionViolations: string[];
  inference: AssetPacksSynthesisInferenceAccounting;
}

/** Raw option shape accepted by validateDepositSynthesisOptions. */
export interface DepositSynthesisRawOption {
  kind: string;
  title: string;
  summary: string;
  coveredSourcePaths: string[];
  measurements: Record<string, number>;
  measurementRationale: string;
  confidence: number;
  /** Formal absolutes from Validation measure-agent (preferred over measurements). */
  absolutes?: AssetPackCandidateMeasurement[] | null;
  patch?: {
    fileChanges?: Array<{ path?: unknown; op?: unknown }>;
    patchSummary?: unknown;
  } | null;
  needinessSignal?: { demand?: number; saturation?: number; rationale?: string } | null;
}
