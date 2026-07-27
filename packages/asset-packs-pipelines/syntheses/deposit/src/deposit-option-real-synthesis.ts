/**
 * Deposit lens adapter over AssetPacksSynthesis (V48 Gate 2, QA ledger F12/F14).
 *
 * The single AssetPacksSynthesis pipeline measures source into candidates;
 * this adapter steers it with the deposit lens (depositor instructions,
 * protected-IP exclusions, depository demand context) and translates the
 * resulting candidates into the V43/V47 deposit option law: the emitted
 * synthesis keeps the `bitcode.deposit.asset-pack-option-synthesis` schema,
 * root format, review boundaries, and source-safety posture, so the
 * existing policy and admission builders consume it unchanged.
 *
 * Types/helpers are co-located siblings; this file remains the public entry.
 */

import {
  buildSynthesisAssetPack,
  synthesisAssetPackToDepositContents,
} from '@bitcode/generic-asset-packs-synthesis';
import { buildUnifiedDiffFromPatchFiles } from '@bitcode/generic-artifacts-patch-kind';
import {
  applyInventoryScope,
  isPathImpermissible,
  isPathPermissible,
  normalizeSourcePathList,
  synthesizeAssetPackCandidates,
  type AssetPacksSynthesisResult,
  type AssetPacksSynthesisSourceInventory,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis';
import type {
  DepositAssetPackOption,
  DepositAssetPackOptionMeasurement,
  DepositOptionSynthesisRequest,
} from './deposit-asset-pack-options-types';
import type {
  DepositOptionReviewProjection,
  RealDepositAssetPackOptionSynthesis,
} from './deposit-option-real-synthesis-types';
import {
  DEPOSIT_OPTION_KINDS,
  candidateKind,
  normalizedSignals,
  signalRoots,
} from './deposit-option-real-synthesis-helpers';
import { normalizedText, root, stableHash } from '@bitcode/asset-packs-pipelines-syntheses-domain/deposit-source-safe-utils';

export {
  applyInventoryScope,
  isPathImpermissible,
  isPathPermissible,
  normalizeSourcePathList,
};
export type { AssetPacksSynthesisSourceInventory };
export type {
  DepositOptionReviewProjection,
  RealDepositAssetPackOptionSynthesis,
} from './deposit-option-real-synthesis-types';

/**
 * Formal single-agent deposit-option synthesis fixture path.
 * Product deposit synthesis is `runExecutionPipelineSDIVFSynthesizeDepositAssetPacks` via `/api/deposit/synthesize-options`.
 * Do not call this from product routes.
 */
export async function synthesizeRealDepositOptionCandidates(input: {
  repositoryFullName: string;
  sourceBranch: string | null;
  sourceCommit: string | null;
  obfuscations: string | null;
  impermissibleSources: string[];
  demandContext: string[];
  inventory: AssetPacksSynthesisSourceInventory;
  execution?: import('@bitcode/execution-generics/Execution').Execution | null;
}): Promise<AssetPacksSynthesisResult> {
  return synthesizeAssetPackCandidates({
    lens: 'deposit',
    repositoryFullName: input.repositoryFullName,
    sourceBranch: input.sourceBranch,
    sourceCommit: input.sourceCommit,
    steering: {
      instructions: input.obfuscations,
      impermissibleSources: input.impermissibleSources,
      demandContext: input.demandContext,
    },
    inventory: input.inventory,
    candidateKinds: DEPOSIT_OPTION_KINDS,
    maxCandidates: 4,
    execution: input.execution ?? null,
  });
}

export function buildRealDepositAssetPackOptionSynthesis(
  request: DepositOptionSynthesisRequest & { impermissibleSources?: string[] | null },
  result: AssetPacksSynthesisResult,
  inventory: AssetPacksSynthesisSourceInventory,
): { synthesis: RealDepositAssetPackOptionSynthesis; reviewProjections: DepositOptionReviewProjection[] } {
  const repositoryFullName = normalizedText(request.repositoryFullName);
  const sourceBranch = normalizedText(request.sourceBranch);
  const sourceCommit = normalizedText(request.sourceCommit);
  const obfuscations = normalizedText(request.obfuscations);
  const impermissibleSources = normalizeSourcePathList(request.impermissibleSources);
  const depositoryDemandSignals = normalizedSignals(request.depositoryDemandSignals);
  const readingDemandSignals = normalizedSignals(request.readingDemandSignals);
  const existingDepositorySignals = normalizedSignals(request.existingDepositorySignals);
  const exclusionRoots = impermissibleSources.map((entry) => root('deposit-option-ip-exclusion', entry));
  const createdAt = normalizedText(request.createdAt) || new Date().toISOString();

  const requestRoot = root('deposit-option-request', {
    repositoryFullName,
    sourceBranch,
    sourceCommit,
    depositorInstructionRoot: obfuscations ? root('deposit-option-instructions', obfuscations) : null,
    synthesisMode: 'real-bounded-inference',
    pipelineCore: 'AssetPacksSynthesis',
    exclusionRoots,
    inventoryPathCount: inventory.paths.length,
    depositoryDemandSignals,
    readingDemandSignals,
    existingDepositorySignals,
  });

  const reviewProjections: DepositOptionReviewProjection[] = [];
  const options = result.candidates.map((candidate, index): DepositAssetPackOption => {
    const sourcePathRoots = candidate.coveredSourcePaths.map((path) =>
      root('deposit-option-source-path', path),
    );
    const optionId = `deposit-option-real-${index + 1}-${stableHash({
      kind: candidate.kind,
      title: candidate.title,
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      sourcePathRoots,
    })}`;
    const measurements: DepositAssetPackOptionMeasurement[] = candidate.measurements.map(
      (measurement) => ({
        id: `${optionId}:${measurement.measurementKind}`,
        label: measurement.label,
        measurementKind: measurement.measurementKind,
        weight: measurement.weight,
        volume: measurement.volume,
        // V48 Gate 3: carry the absolutes provenance (category + size magnitude/unit).
        ...(measurement.category ? { category: measurement.category } : {}),
        ...(typeof measurement.magnitude === 'number' ? { magnitude: measurement.magnitude } : {}),
        ...(measurement.unit ? { unit: measurement.unit } : {}),
        // Instance descriptor generated when/after measureDataPackAbsolutes.
        ...(typeof measurement.descriptor === 'string' && measurement.descriptor.trim()
          ? { descriptor: measurement.descriptor.trim() }
          : {}),
        ...(typeof measurement.status === 'string' && measurement.status.trim()
          ? { status: measurement.status.trim() }
          : {}),
        evidenceRoot: root('deposit-option-measurement', {
          measurementKind: measurement.measurementKind,
          weight: measurement.weight,
          volume: measurement.volume,
          status: measurement.status ?? null,
          rationaleRoot: root('deposit-option-measurement-rationale', candidate.measurementRationale),
          coveredSourcePathRoots: sourcePathRoots,
        }),
      }),
    );
    const sourceBinding = {
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      sourcePathRoots,
      sourcePathCount: sourcePathRoots.length,
      rawSourceStoredExternally: true as const,
      protectedSourceVisibleInOption: false as const,
    };
    const demandAlignment = {
      posture: 'source-safe-demand-signals-only' as const,
      depositorySignalRoots: signalRoots('deposit-option-depository-demand-signal', depositoryDemandSignals),
      readingSignalRoots: signalRoots('deposit-option-reading-demand-signal', readingDemandSignals),
      existingDepositorySignalRoots: signalRoots(
        'deposit-option-existing-supply-signal',
        existingDepositorySignals,
      ),
      confidence: candidate.confidence,
    };
    const reviewBoundary = {
      state: 'reviewable-source-safe-option' as const,
      decision: 'pending-depositor-review' as const,
      depositAdmissionBoundary: 'not-admitted-until-depositor-approval' as const,
      btdMintBoundary: 'not-minted-by-deposit-option' as const,
      settlementBoundary: 'future-reader-settlement-required-for-source-bearing-assetpack' as const,
    };
    // Project through SynthesisAssetPack → deposit contents.
    // Deposit measurements = absolutes only. Neediness is Read-pipeline only.
    // Rehydrate modify bodies from checkout inventory when Implementation lost
    // content through projection — depositor must see full .patch material.
    const hostExtra = candidate as unknown as {
      patchArtifact?: {
        unifiedDiff?: string | null;
        bodiesComplete?: boolean;
        files?: Array<{ path?: string; op?: string; body?: string }>;
      };
      patch?: {
        fileChanges?: Array<{ path?: string; op?: string; content?: string }>;
      };
      commercialTitle?: string;
      commercialDescription?: string;
      materialIdentity?: Record<string, unknown> | null;
      measureReport?: Record<string, unknown> | null;
    };
    const inventoryBodies = new Map<string, string>();
    for (const s of inventory.sources || []) {
      if (s && typeof s.path === 'string' && typeof s.content === 'string') {
        const key = s.path.replace(/\\/g, '/').replace(/^\.?\//, '').trim();
        if (key && !inventoryBodies.has(key)) inventoryBodies.set(key, s.content);
      }
    }
    const bodyByPath = new Map<string, string>();
    // Priority: artifact files → patch content → checkout inventory (modify).
    for (const f of hostExtra.patchArtifact?.files || []) {
      if (typeof f?.path === 'string' && typeof f?.body === 'string') {
        bodyByPath.set(
          f.path.replace(/\\/g, '/').replace(/^\.?\//, '').trim(),
          f.body,
        );
      }
    }
    for (const fc of hostExtra.patch?.fileChanges || candidate.patch?.fileChanges || []) {
      const path = String(fc.path || '')
        .replace(/\\/g, '/')
        .replace(/^\.?\//, '')
        .trim();
      if (!path || bodyByPath.has(path)) continue;
      if (typeof (fc as { content?: string }).content === 'string') {
        bodyByPath.set(path, (fc as { content: string }).content);
      }
    }
    const plannedChanges = (
      candidate.patch?.fileChanges?.length
        ? candidate.patch.fileChanges
        : hostExtra.patchArtifact?.files || []
    ).map((fc) => {
      const path = String(fc.path || '')
        .replace(/\\/g, '/')
        .replace(/^\.?\//, '')
        .trim();
      const opRaw = String(fc.op || 'modify').toLowerCase();
      const op = opRaw === 'create' ? 'create' : 'modify';
      let content = path ? bodyByPath.get(path) : undefined;
      // Rehydrate modify (and existing-path create) from depositor checkout.
      if (path && content === undefined && inventoryBodies.has(path)) {
        content = inventoryBodies.get(path);
      }
      return {
        path,
        op,
        ...(typeof content === 'string' ? { content } : {}),
      };
    }).filter((fc) => fc.path);

    const synthesisPack = buildSynthesisAssetPack({
      assetPackId: optionId,
      title: candidate.title,
      summary: candidate.summary,
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      sourcePathRoots: candidate.coveredSourcePaths,
      patchSummary: candidate.patch?.patchSummary ?? candidate.summary,
      fileChanges: plannedChanges,
      measurements: {
        absolutes: measurements.map((m) => ({
          id: m.id,
          label: m.label,
          measurementKind: m.measurementKind,
          weight: m.weight,
          volume: m.volume,
          category: 'absolute' as const,
          // SynthesisMeasurementReading requires magnitude+unit; host fills when absent.
          magnitude: typeof m.magnitude === 'number' ? m.magnitude : m.volume,
          unit: typeof m.unit === 'string' && m.unit.length > 0 ? m.unit : 'normalized',
          evidenceRoot: m.evidenceRoot,
          ...(m.descriptor ? { descriptor: m.descriptor } : {}),
          ...(m.status ? { status: m.status } : {}),
        })),
        // Deposit options are absolutes-only; neediness is Read-pipeline only.
        // SynthesisMeasurementsByKind still requires the nested key present.
        needinesses: [],
      },
      provenantSourcePaths: candidate.coveredSourcePaths,
    });
    const contents = synthesisAssetPackToDepositContents(synthesisPack);
    // Always rebuild unifiedDiff from bound bodies (depositor primary .patch).
    const boundFiles = contents.fileChanges.map((fc) => ({
      path: fc.path,
      op: fc.op,
      body: typeof fc.content === 'string' ? fc.content : null,
    }));
    const hasBoundBodies = boundFiles.some((f) => typeof f.body === 'string');
    if (hasBoundBodies) {
      (contents as { unifiedDiff?: string | null }).unifiedDiff =
        typeof hostExtra.patchArtifact?.unifiedDiff === 'string' &&
        hostExtra.patchArtifact.unifiedDiff.includes('diff --git') &&
        (hostExtra.patchArtifact.unifiedDiff.includes('\n+') ||
          hostExtra.patchArtifact.unifiedDiff.includes('\n-'))
          ? hostExtra.patchArtifact.unifiedDiff
          : buildUnifiedDiffFromPatchFiles(boundFiles, {
              patchSummary: contents.patchSummary,
            });
    } else if (typeof hostExtra.patchArtifact?.unifiedDiff === 'string') {
      (contents as { unifiedDiff?: string | null }).unifiedDiff =
        hostExtra.patchArtifact.unifiedDiff;
    }
    // Prefer commercial-NL agent output when present (buyer product brief).
    const commercialTitle =
      (typeof candidate.commercialTitle === 'string' &&
      candidate.commercialTitle.trim().length >= 8
        ? candidate.commercialTitle.trim()
        : null) ||
      (typeof hostExtra.commercialTitle === 'string' &&
      hostExtra.commercialTitle.trim().length >= 8
        ? hostExtra.commercialTitle.trim()
        : null);
    const commercialDescription =
      (typeof candidate.commercialDescription === 'string' &&
      candidate.commercialDescription.trim().length >= 40
        ? candidate.commercialDescription.trim()
        : null) ||
      (typeof hostExtra.commercialDescription === 'string' &&
      hostExtra.commercialDescription.trim().length >= 40
        ? hostExtra.commercialDescription.trim()
        : null);
    const displayTitle = commercialTitle || candidate.title;
    const displaySummary = commercialDescription || candidate.summary;

    const materialIdentity =
      candidate.materialIdentity || hostExtra.materialIdentity || null;
    const measureReport =
      candidate.measureReport || hostExtra.measureReport || null;

    const optionBase = {
      optionId,
      kind: candidateKind(candidate),
      title: displayTitle,
      summary: displaySummary,
      sourceBinding,
      demandAlignment,
      measurements,
      contents,
      reviewBoundary,
      ...(commercialTitle ? { commercialTitle } : {}),
      ...(commercialDescription ? { commercialDescription } : {}),
      ...(materialIdentity ? { materialIdentity } : {}),
      ...(measureReport ? { measureReport } : {}),
      ...(hostExtra.patchArtifact
        ? {
            patchArtifact: {
              ...hostExtra.patchArtifact,
              // Align artifact files with rehydrated contents for download builders.
              files: contents.fileChanges.map((fc) => ({
                path: fc.path,
                op: fc.op,
                ...(typeof fc.content === 'string' ? { body: fc.content } : {}),
              })),
              unifiedDiff:
                (contents as { unifiedDiff?: string | null }).unifiedDiff ??
                hostExtra.patchArtifact.unifiedDiff ??
                null,
              bodiesComplete: contents.fileChanges.every(
                (fc) => typeof fc.content === 'string',
              ),
            },
          }
        : {}),
    };

    reviewProjections.push({
      optionId,
      title: displayTitle,
      coveredSourcePaths: candidate.coveredSourcePaths,
      measurementRationale: candidate.measurementRationale,
    });

    return {
      schema: 'bitcode.deposit.asset-pack-option',
      ...optionBase,
      policyBoundary: {
        sourceCriticalityPolicy: 'deferred-to-gate6',
        demandRoiPolicy: 'deferred-to-gate6',
        compensationPolicy: 'deferred-to-gate6',
      },
      visibility: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        rawSourceTextVisible: false,
        unpaidAssetPackSourceVisible: false,
        rawPromptVisible: false,
        interpolatedPromptVisible: false,
        rawProviderResponseVisible: false,
        walletPrivateMaterialVisible: false,
      },
      roots: {
        optionRoot: root('deposit-asset-pack-option', optionBase),
        sourceBindingRoot: root('deposit-option-source-binding', sourceBinding),
        demandAlignmentRoot: root('deposit-option-demand-alignment', demandAlignment),
        measurementRoot: root('deposit-option-measurements', measurements),
        contentsRoot: root('deposit-option-contents', contents),
        reviewBoundaryRoot: root('deposit-option-review-boundary', reviewBoundary),
      },
    };
  });

  const optionRoots = options.map((option) => option.roots.optionRoot);
  const synthesisRoot = root('deposit-asset-pack-option-synthesis', {
    requestRoot,
    optionRoots,
    createdAt,
  });

  const synthesis: RealDepositAssetPackOptionSynthesis = {
    schema: 'bitcode.deposit.asset-pack-option-synthesis',
    pipeline: 'DepositAssetPackOptionSynthesis',
    requestId: requestRoot,
    createdAt,
    request: {
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      depositorInstructionRoot: obfuscations ? root('deposit-option-instructions', obfuscations) : null,
      sourcePathRoots: [...new Set(options.flatMap((option) => option.sourceBinding.sourcePathRoots))],
    },
    options,
    optionCount: options.length,
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
    },
    reviewBoundary: {
      route: '/deposits',
      defaultDecisionState: 'pending-depositor-review',
      approvedOptionsAdmittedBy: 'future-gate7-deposit-option-review',
      sourceCriticalityDemandRoiPolicyOwnedBy: 'future-gate6-policy',
    },
    roots: {
      requestRoot,
      synthesisRoot,
      optionRoots,
    },
    synthesisMode: 'real-bounded-inference',
    pipelineCore: 'AssetPacksSynthesis',
    inference: result.inference,
    exclusionPosture: {
      impermissibleSourceCount: impermissibleSources.length,
      exclusionRoots,
      excludedPathCount: inventory.excludedPathCount,
      droppedCandidateCount: result.droppedCandidateCount,
    },
  };

  return { synthesis, reviewProjections };
}
