/**
 * AssetPacksSynthesis domain types (checkout source catalog, candidates, results).
 *
 * Shared by the public barrel, formal pipeline, deposit validation, and option
 * projection. No runtime logic — pure type surface for the synthesis core.
 *
 * Pack/patch primitives: @bitcode/asset-packs-generics
 * Measured pack base: @bitcode/generic-asset-packs-measured-patch
 */

import type { Execution } from '@bitcode/execution-generics/Execution';
import type { MeasurementSpec } from '@bitcode/measurement-generics';
import type { AssetPackPatchDescriptor } from '@bitcode/asset-packs-generics';
import type { MeasuredPatchNeedinessPreview } from '@bitcode/generic-asset-packs-measured-patch';

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

/**
 * Catalog of the **depositor repository checkout** used by AssetPacksSynthesis.
 *
 * Not the GitHub “connected repositories” list (externals inventory).
 * Setup clones the **complete working tree at the SHA** (all files on disk).
 * This catalog is metadata + optional in-memory bodies for that same tree:
 * - `paths` — tracked paths after Forced Inclusion / Exclusion scope
 * - `samples` — bounded excerpts for LLM prompts
 * - `sources` — optional full file contents for measurement tools; loaded from
 *   the live checkout in Discovery (codebase comprehension), not a second clone
 */
export interface AssetPacksSynthesisSourceInventory {
  paths: string[];
  samples: AssetPacksSynthesisSourceSample[];
  /**
   * Full verbatim file bodies from the Host checkout (measurement only).
   * Prompt path uses `samples` only. Empty until Discovery materializes them
   * from the live workspace when provision was path-list-only.
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
 * Neediness — deposit PREVIEW of read Need-fit (v0). SEPARATE from the
 * absolute deposit composite. Source-safe: scalars + topic-level rationale only.
 * Aligned with MeasuredPatchNeedinessPreview (measured-patch base).
 */
export type AssetPackNeediness = MeasuredPatchNeedinessPreview;

/** Source-safe patch descriptor (protocol primitive; never raw source). */
export type { AssetPackPatchDescriptor };

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
