/**
 * AssetPacksSynthesis — the single Bitcode synthesis/measurement pipeline
 * (V48 architecture law, QA ledger F12).
 *
 * Depositing and Reading are the same operation at the core: measuring
 * source knowledge into commercially legible AssetPack candidates. The
 * variance between them is carried entirely by the lens:
 *   - steering (depositor instructions vs. read Need),
 *   - the available measurement catalog (deposit: source-coverage /
 *     demand-alignment / reuse-likelihood; read adds need-fit and friends),
 *   - candidate framing (deposit options vs. need-fitting packs).
 *
 * This file is the public barrel: re-exports types, catalogs, inventory helpers,
 * neediness, and fail-closed validation; owns synthesizeAssetPackCandidates
 * (formal pipeline registration + post-inference admission).
 *
 * Impermissible sources are honored fail-closed at BOTH ends: excluded
 * paths are removed from the inventory before any prompt is built, and any
 * candidate whose covered paths violate the exclusions (or reference paths
 * outside the real inventory) is dropped after inference.
 */

import { z } from 'zod';

import { Execution } from '@bitcode/execution-generics/Execution';

import {
  synthesizeAssetPackCandidatesFormal,
  sumLlmTokensFromExecutionTree,
  type FormalSynthesisRawOption,
} from './asset-packs-synthesis-pipeline';
import { isAssetPackRealInferenceEnabled } from './runtime-inference-policy';
import { measurementCatalogForLens } from './asset-packs-synthesis-catalogs';
import { isPathExcluded } from './asset-packs-synthesis-inventory';
import { clampVolume } from './asset-packs-synthesis-neediness';
import { assertSourceSafeCandidates } from './asset-packs-synthesis-validate';
import type {
  AssetPackCandidate,
  AssetPacksSynthesisRequest,
  AssetPacksSynthesisResult,
} from './asset-packs-synthesis-types';

export { sumLlmTokensFromExecutionTree };

// ---- Types -----------------------------------------------------------------
export type {
  AbsolutePropertyClass,
  AssetPackAbsoluteSpec,
  AssetPackCandidate,
  AssetPackCandidateMeasurement,
  AssetPackMeasurementSpec,
  AssetPackNeediness,
  AssetPackPatchDescriptor,
  AssetPacksSynthesisInferenceAccounting,
  AssetPacksSynthesisLens,
  AssetPacksSynthesisRequest,
  AssetPacksSynthesisResult,
  AssetPacksSynthesisSourceFile,
  AssetPacksSynthesisSourceInventory,
  AssetPacksSynthesisSourceSample,
  AssetPacksSynthesisSteering,
  DepositSynthesisRawOption,
} from './asset-packs-synthesis-types';

// ---- Catalogs --------------------------------------------------------------
export {
  ASSET_PACK_ABSOLUTES_CATALOG,
  ASSET_PACK_ABSOLUTE_KINDS,
  DEPOSIT_MEASUREMENT_CATALOG,
  DEPOSIT_NEEDINESS_MEASUREMENT,
  READ_MEASUREMENT_CATALOG,
  measurementCatalogForLens,
} from './asset-packs-synthesis-catalogs';

// ---- Neediness -------------------------------------------------------------
export {
  buildNeedinessFromSignal,
  clampVolume,
  computeNeediness,
} from './asset-packs-synthesis-neediness';

// ---- Inventory / path scope ------------------------------------------------
export {
  applyExclusionsToInventory,
  applyInventoryScope,
  isPathExcluded,
  isPathForcedIncluded,
  normalizeForcedPathList,
  pickInventorySamples,
  projectInventoryForPrompt,
} from './asset-packs-synthesis-inventory';

// ---- Fail-closed validation ------------------------------------------------
export {
  assertSourceSafeCandidates,
  validateDepositSynthesisOptions,
} from './asset-packs-synthesis-validate';

/**
 * Run formal AssetPacksSynthesis inference and admit candidates fail-closed.
 * Requires real inference; empty inventory throws.
 */
export async function synthesizeAssetPackCandidates(
  request: AssetPacksSynthesisRequest,
): Promise<AssetPacksSynthesisResult> {
  if (!isAssetPackRealInferenceEnabled()) {
    throw new Error(
      'AssetPacksSynthesis requires BITCODE_ASSET_PACK_REAL_INFERENCE so candidates carry real measurements.',
    );
  }
  if (request.inventory.paths.length === 0) {
    throw new Error('Repository inventory is empty after impermissible sources; nothing to synthesize.');
  }

  const catalog = measurementCatalogForLens(request.lens);
  const maxCandidates = Math.max(1, Math.min(4, request.maxCandidates ?? 4));
  const startedAt = Date.now();

  const candidateSchema = z.object({
    kind: z.string().min(1),
    title: z.string().min(8).max(160),
    summary: z.string().min(40).max(900),
    coveredSourcePaths: z.array(z.string().min(1)).min(1).max(40),
    measurements: z.record(z.string(), z.coerce.number().min(0).max(1)),
    measurementRationale: z.string().min(20).max(700),
    confidence: z.coerce.number().min(0).max(1),
  });
  const candidateSetSchema = z.object({
    options: z.array(candidateSchema).min(1).max(maxCandidates),
  });

  // Formal pipeline on real primitives; layered system prompt composed inside
  // the pipeline from the execution prompt registry.
  const execution = request.execution ?? new Execution('asset-packs-synthesis');
  const outcome = await synthesizeAssetPackCandidatesFormal(
    {
      lens: request.lens,
      repositoryFullName: request.repositoryFullName,
      sourceBranch: request.sourceBranch,
      sourceCommit: request.sourceCommit,
      steering: request.steering,
      inventory: request.inventory,
      candidateKinds: request.candidateKinds,
      maxCandidates,
    },
    candidateSetSchema as unknown as z.ZodType<{ options: FormalSynthesisRawOption[] }>,
    execution,
  );

  const inventoryPathSet = new Set(request.inventory.paths);
  const allowedKinds = new Set(request.candidateKinds);
  const exclusionViolations: string[] = [];
  const candidates: AssetPackCandidate[] = [];
  for (const option of outcome.options) {
    const coveredSourcePaths = [...new Set(option.coveredSourcePaths.map((path) => path.trim()).filter(Boolean))];
    const unknownPaths = coveredSourcePaths.filter((path) => !inventoryPathSet.has(path));
    const excludedPaths = coveredSourcePaths.filter((path) =>
      isPathExcluded(path, request.steering.impermissibleSources),
    );
    if (unknownPaths.length > 0 || excludedPaths.length > 0 || coveredSourcePaths.length === 0) {
      exclusionViolations.push(
        `${option.title}: ${excludedPaths.length ? `excluded paths ${excludedPaths.join(', ')}` : ''}${
          unknownPaths.length ? ` unknown paths ${unknownPaths.join(', ')}` : ''
        }`.trim(),
      );
      continue;
    }

    const measurements = catalog.map((spec) => ({
      measurementKind: spec.measurementKind,
      label: spec.label,
      weight: spec.weight,
      volume: clampVolume(option.measurements[spec.measurementKind] ?? 0),
    }));

    candidates.push({
      kind: allowedKinds.has(option.kind) ? option.kind : request.candidateKinds[0],
      title: option.title.trim(),
      summary: option.summary.trim(),
      coveredSourcePaths,
      measurements,
      measurementRationale: option.measurementRationale.trim(),
      confidence: clampVolume(option.confidence),
    });
  }

  if (candidates.length === 0) {
    throw new Error(
      `AssetPacksSynthesis produced no admissible candidates${
        exclusionViolations.length ? ` (violations: ${exclusionViolations.join(' | ')})` : ''
      }.`,
    );
  }

  assertSourceSafeCandidates(candidates, request.inventory);

  return {
    lens: request.lens,
    candidates,
    droppedCandidateCount: outcome.options.length - candidates.length,
    exclusionViolations,
    inference: {
      provider: outcome.provider,
      model: outcome.model,
      totalTokens: outcome.totalTokens,
      durationMs: Date.now() - startedAt,
    },
  };
}
