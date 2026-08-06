/**
 * Deposit AssetPack option synthesis public entry (blueprint path).
 *
 * Builds deterministic source-safe options for /deposits review and asserts the
 * source-safety boundary. Types and pure helpers are co-located siblings;
 * package export path `./deposit-asset-pack-options` remains this file.
 */

import type {
  DepositAssetPackOption,
  DepositAssetPackOptionReviewState,
  DepositAssetPackOptionSynthesis,
  DepositOptionSynthesisRequest,
} from './deposit-asset-pack-options-types';
import {
  OPTION_BLUEPRINTS,
  confidenceFor,
  measurementsFor,
  normalizedList,
  normalizedSignals,
  signalRoots,
} from './deposit-asset-pack-options-helpers';
import {
  hasNoForbiddenSourceMarkers,
  normalizedText,
  root,
  stableHash,
  stableStringify,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/deposit-source-safe-utils';

export type {
  DepositAssetPackOption,
  DepositAssetPackOptionKind,
  DepositAssetPackOptionMeasurement,
  DepositAssetPackOptionReviewState,
  DepositAssetPackOptionSynthesis,
  DepositOptionDemandSignal,
  DepositOptionSynthesisRequest,
} from './deposit-asset-pack-options-types';

export function buildDepositAssetPackOptionSynthesis(
  request: DepositOptionSynthesisRequest = {},
): DepositAssetPackOptionSynthesis {
  const repositoryFullName = normalizedText(request.repositoryFullName);
  const sourceBranch = normalizedText(request.sourceBranch);
  const sourceCommit = normalizedText(request.sourceCommit);
  const obfuscations = normalizedText(request.obfuscations);
  const permissibleSources = normalizedList(request.permissibleSources);
  const depositoryDemandSignals = normalizedSignals(request.depositoryDemandSignals);
  const readingDemandSignals = normalizedSignals(request.readingDemandSignals);
  const existingDepositorySignals = normalizedSignals(request.existingDepositorySignals);
  const sourcePathRoots = permissibleSources.map((path) => root('deposit-option-source-path', path));
  const hasRepository = Boolean(repositoryFullName);
  const hasRevision = Boolean(sourceBranch && sourceCommit);
  const signalCount =
    depositoryDemandSignals.length + readingDemandSignals.length + existingDepositorySignals.length;
  const createdAt = normalizedText(request.createdAt) || 'deterministic';
  const requestRoot = root('deposit-option-request', {
    repositoryFullName,
    sourceBranch,
    sourceCommit,
    depositorInstructionRoot: obfuscations ? root('deposit-option-instructions', obfuscations) : null,
    sourcePathRoots,
    depositoryDemandSignals,
    readingDemandSignals,
    existingDepositorySignals,
  });

  const options = OPTION_BLUEPRINTS.map((blueprint, index): DepositAssetPackOption => {
    const optionId = `deposit-option-${index + 1}-${stableHash({
      kind: blueprint.kind,
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      sourcePathRoots,
    })}`;
    const confidence = confidenceFor({
      blueprintBias: blueprint.measurementBias,
      hasRepository,
      hasRevision,
      sourcePathCount: sourcePathRoots.length,
      signalCount,
    });
    const measurements = measurementsFor({
      optionId,
      confidence,
      sourcePathCount: sourcePathRoots.length,
      signalCount,
    });
    const reviewState: DepositAssetPackOptionReviewState = !hasRepository
      ? 'blocked-source-binding'
      : sourcePathRoots.length === 0
        ? 'blocked-empty-source'
        : 'reviewable-source-safe-option';
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
      confidence,
    };
    const reviewBoundary = {
      state: reviewState,
      decision: 'pending-depositor-review' as const,
      depositAdmissionBoundary: 'not-admitted-until-depositor-approval' as const,
      btdMintBoundary: 'not-minted-by-deposit-option' as const,
      settlementBoundary: 'future-reader-settlement-required-for-source-bearing-assetpack' as const,
    };
    const optionBase = {
      optionId,
      kind: blueprint.kind,
      title: blueprint.title,
      summary: blueprint.summary,
      sourceBinding,
      demandAlignment,
      measurements,
      reviewBoundary,
    };

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

  return {
    schema: 'bitcode.deposit.asset-pack-option-synthesis',
    pipeline: 'DepositAssetPackOptionSynthesis',
    requestId: requestRoot,
    createdAt,
    request: {
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      depositorInstructionRoot: obfuscations ? root('deposit-option-instructions', obfuscations) : null,
      sourcePathRoots,
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
  };
}

export function assertDepositAssetPackOptionSynthesisSourceSafe(
  synthesis: DepositAssetPackOptionSynthesis,
) {
  const serialized = stableStringify(synthesis);
  const noForbiddenMarkers = hasNoForbiddenSourceMarkers(serialized);
  const sourceSafe =
    synthesis.schema === 'bitcode.deposit.asset-pack-option-synthesis' &&
    synthesis.pipeline === 'DepositAssetPackOptionSynthesis' &&
    synthesis.reviewBoundary.route === '/deposits' &&
    synthesis.sourceSafety.sourceSafeMetadataOnly === true &&
    synthesis.sourceSafety.protectedSourceVisible === false &&
    synthesis.sourceSafety.rawSourceTextVisible === false &&
    synthesis.sourceSafety.unpaidAssetPackSourceVisible === false &&
    synthesis.sourceSafety.rawPromptVisible === false &&
    synthesis.sourceSafety.interpolatedPromptVisible === false &&
    synthesis.sourceSafety.rawProviderResponseVisible === false &&
    synthesis.sourceSafety.walletPrivateMaterialVisible === false &&
    synthesis.options.every(
      (option) =>
        option.visibility.sourceSafeMetadataOnly === true &&
        option.visibility.protectedSourceVisible === false &&
        option.visibility.rawSourceTextVisible === false &&
        option.visibility.unpaidAssetPackSourceVisible === false &&
        option.sourceBinding.protectedSourceVisibleInOption === false &&
        option.reviewBoundary.decision === 'pending-depositor-review' &&
        option.reviewBoundary.depositAdmissionBoundary === 'not-admitted-until-depositor-approval' &&
        option.reviewBoundary.btdMintBoundary === 'not-minted-by-deposit-option',
    ) &&
    noForbiddenMarkers;

  return {
    admitted: sourceSafe,
    reason: sourceSafe
      ? 'source_safe_deposit_asset_pack_option_synthesis'
      : 'deposit_option_source_safety_boundary_violation',
  };
}
