/**
 * AssetPacksSynthesis — formal synthesis of DataPack **candidates**
 * (patch + metadata). Absolute measurements are host-attached (measure stack),
 * not invented by the synthesis LLM.
 *
 * Deposit vs read variance: steering, synthesis policy guidance, candidate framing.
 * Formal absolute KINDs live in DATA_PACK_ABSOLUTES_CATALOG only.
 *
 * Impermissible sources are fail-closed at both ends: inventory filter before
 * prompts; drop candidates that cover excluded/unknown paths after inference.
 */

import { z } from 'zod';

import { Execution } from '@bitcode/execution-generics/Execution';

import {
  synthesizeAssetPackCandidatesFormal,
  sumLlmTokensFromExecutionTree,
  type FormalSynthesisRawOption,
} from './asset-packs-synthesis-pipeline';
import { isAssetPackRealInferenceEnabled } from './runtime-inference-policy';
import { isPathImpermissible } from './asset-packs-synthesis-inventory';
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
  DATA_PACK_ABSOLUTES_CATALOG,
  DATA_PACK_ABSOLUTES_PRODUCT_CATALOG,
  DATA_PACK_WEIGHTED_ABSOLUTE_KINDS,
  assertDataPackAbsolutesCatalogWeights,
  DEPOSIT_SYNTHESIS_POLICY_CATALOG,
  READ_SYNTHESIS_POLICY_CATALOG,
  synthesisPolicyCatalogForMode,
  DEPOSIT_NEEDINESS_MEASUREMENT,
  /** @deprecated Use DEPOSIT_SYNTHESIS_POLICY_CATALOG */
  DEPOSIT_MEASUREMENT_CATALOG,
  /** @deprecated Use READ_SYNTHESIS_POLICY_CATALOG */
  READ_MEASUREMENT_CATALOG,
  /** @deprecated Use synthesisPolicyCatalogForMode */
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
  applyInventoryScope,
  isPathImpermissible,
  isPathPermissible,
  normalizeSourcePathList,
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

  const maxCandidates = Math.max(1, Math.min(4, request.maxCandidates ?? 4));
  const startedAt = Date.now();

  // Patch + metadata only. Absolute volumes are host-measured (not LLM-invented).
  const candidateSchema = z
    .object({
      kind: z.string().min(1),
      title: z.string().min(8).max(160),
      summary: z.string().min(40).max(900),
      coveredSourcePaths: z.array(z.string().min(1)).min(1).max(40),
      synthesisRationale: z.string().min(20).max(700).optional(),
      measurementRationale: z.string().min(20).max(700).optional(),
      confidence: z.coerce.number().min(0).max(1),
      // Accept but ignore legacy volume maps from older models.
      measurements: z.record(z.string(), z.coerce.number().min(0).max(1)).optional(),
    })
    .refine(
      (row) =>
        Boolean(
          (row.synthesisRationale && row.synthesisRationale.trim().length >= 20) ||
            (row.measurementRationale && row.measurementRationale.trim().length >= 20),
        ),
      { message: 'synthesisRationale (or legacy measurementRationale) required' },
    );
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
      isPathImpermissible(path, request.steering.impermissibleSources),
    );
    if (unknownPaths.length > 0 || excludedPaths.length > 0 || coveredSourcePaths.length === 0) {
      exclusionViolations.push(
        `${option.title}: ${excludedPaths.length ? `excluded paths ${excludedPaths.join(', ')}` : ''}${
          unknownPaths.length ? ` unknown paths ${unknownPaths.join(', ')}` : ''
        }`.trim(),
      );
      continue;
    }

    const rationale = String(
      option.synthesisRationale ?? option.measurementRationale ?? '',
    ).trim();

    candidates.push({
      kind: allowedKinds.has(option.kind) ? option.kind : request.candidateKinds[0],
      title: option.title.trim(),
      summary: option.summary.trim(),
      coveredSourcePaths,
      // Empty until host measure stack attaches DATA_PACK_ABSOLUTES_CATALOG rows.
      measurements: [],
      measurementRationale: rationale,
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
