/**
 * Deposit AssetPack option policy public entry.
 *
 * Builds source-safe policy evaluations (criticality, demand, ROI, compensation)
 * and asserts serialization boundaries. Package export path unchanged.
 */

import type {
  DepositAssetPackOptionPolicyEvaluation,
  DepositAssetPackOptionPolicyInput,
  DepositAssetPackOptionPolicyReport,
} from './deposit-asset-pack-option-policy-types';
import {
  btdPotentialFor,
  compensationFor,
  demandFor,
  normalizedCriticalitySignals,
  policyDecisionFor,
  positiveInteger,
  roiFor,
  sourceCriticalityFor,
  sumSignalWeights,
} from './deposit-asset-pack-option-policy-helpers';
import {
  hasNoForbiddenSourceMarkers,
  normalizedText,
  root,
  stableStringify,
} from './deposit-source-safe-utils';

export type {
  DepositAssetPackOptionPolicyEvaluation,
  DepositAssetPackOptionPolicyInput,
  DepositAssetPackOptionPolicyReport,
  DepositOptionBtdPotentialState,
  DepositOptionCompensationState,
  DepositOptionCriticalitySignal,
  DepositOptionCriticalityState,
  DepositOptionDemandState,
  DepositOptionRoiState,
} from './deposit-asset-pack-option-policy-types';

export function buildDepositAssetPackOptionPolicyReport(
  input: DepositAssetPackOptionPolicyInput,
): DepositAssetPackOptionPolicyReport {
  const createdAt = normalizedText(input.createdAt) || 'deterministic';
  const sourceCriticalitySignals = normalizedCriticalitySignals(input.sourceCriticalitySignals);
  const demandSignalWeight =
    input.synthesis.options.reduce((sum, option) => sum + option.demandAlignment.confidence, 0) +
    sumSignalWeights(
      input.synthesis.options.flatMap((option) =>
        option.measurements.map((measurement) => ({
          id: measurement.id,
          label: measurement.label,
          weight: measurement.volume * measurement.weight,
        })),
      ),
    );
  const developmentCostSats = positiveInteger(
    input.developmentCostSats,
    Math.max(
      1200,
      Math.round(850 + input.synthesis.optionCount * 275 + input.synthesis.request.sourcePathRoots.length * 180),
    ),
  );
  const expectedSettlementSats = positiveInteger(
    input.expectedSettlementSats,
    Math.max(
      2500,
      Math.round(2800 + demandSignalWeight * 450 + input.synthesis.request.sourcePathRoots.length * 220),
    ),
  );
  const depositorWalletId = normalizedText(input.depositorWalletId);

  const evaluations = input.synthesis.options.map((option): DepositAssetPackOptionPolicyEvaluation => {
    const sourceCriticality = sourceCriticalityFor({ option, signals: sourceCriticalitySignals });
    const demand = demandFor(option, input.settledDemand);
    const roi = roiFor({
      option,
      demand,
      criticality: sourceCriticality,
      developmentCostSats,
      expectedSettlementSats,
    });
    const btdPotential = btdPotentialFor({ option, demand, roi, criticality: sourceCriticality });
    const compensation = compensationFor({
      option,
      criticality: sourceCriticality,
      roi,
      depositorWalletId,
      demandUnestimatable: demand.state === 'unestimatable-demand',
    });
    const policyDecision = policyDecisionFor({ criticality: sourceCriticality, roi, compensation });
    const admissionBoundary = {
      depositApprovalRequired: true as const,
      admissionAndIndexingOwnedBy: 'future-gate7-deposit-option-review' as const,
      sourceBearingDisclosureBeforeSettlementVisible: false as const,
    };
    const visibility = {
      sourceSafeMetadataOnly: true as const,
      protectedSourceVisible: false as const,
      rawSourceTextVisible: false as const,
      unpaidAssetPackSourceVisible: false as const,
      rawPromptVisible: false as const,
      interpolatedPromptVisible: false as const,
      rawProviderResponseVisible: false as const,
      walletPrivateMaterialVisible: false as const,
      settlementPrivatePayloadVisible: false as const,
    };
    const policyEvaluationRoot = root('deposit-policy-evaluation', {
      optionId: option.optionId,
      policyDecision,
      sourceCriticality,
      demand,
      roi,
      btdPotential,
      compensation,
      admissionBoundary,
      visibility,
    });

    return {
      schema: 'bitcode.deposit.asset-pack-option-policy-evaluation',
      optionId: option.optionId,
      optionKind: option.kind,
      title: option.title,
      policyDecision,
      sourceCriticality,
      demand,
      roi,
      btdPotential,
      compensation,
      admissionBoundary,
      visibility,
      roots: {
        policyEvaluationRoot,
        sourceCriticalityRoot: root('deposit-policy-criticality', sourceCriticality),
        demandRoot: demand.demandRoot,
        roiRoot: roi.roiRoot,
        btdPotentialRoot: btdPotential.btdPotentialRoot,
        compensationRouteRoot: compensation.compensationRouteRoot,
      },
    };
  });
  const aggregatePolicy = {
    criticalityPolicy: 'source-safe-criticality-signals-with-depositor-review' as const,
    demandPolicy: 'weighted-depository-reading-and-existing-supply-signals' as const,
    roiPolicy: 'deterministic-estimated-gross-minus-development-cost' as const,
    compensationPolicy: 'future-reader-btc-source-to-shares-route-preview' as const,
    admissionAndIndexingOwnedBy: 'future-gate7-deposit-option-review' as const,
  };
  const evaluationRoots = evaluations.map((evaluation) => evaluation.roots.policyEvaluationRoot);
  const aggregatePolicyRoot = root('deposit-policy-aggregate', aggregatePolicy);
  const policyReportRoot = root('deposit-policy-report', {
    synthesisRequestId: input.synthesis.requestId,
    evaluationRoots,
    aggregatePolicyRoot,
    createdAt,
  });

  return {
    schema: 'bitcode.deposit.asset-pack-option-policy-report',
    policy: 'DepositAssetPackOptionPolicy',
    reportId: policyReportRoot,
    createdAt,
    route: '/deposits',
    synthesisRequestId: input.synthesis.requestId,
    optionCount: evaluations.length,
    reviewablePositiveRoiCount: evaluations.filter(
      (evaluation) => evaluation.policyDecision === 'reviewable-positive-roi',
    ).length,
    warningCount: evaluations.filter(
      (evaluation) => evaluation.policyDecision === 'review-warning-before-admission',
    ).length,
    blockedCount: evaluations.filter(
      (evaluation) => evaluation.policyDecision === 'blocked-before-admission',
    ).length,
    evaluations,
    aggregatePolicy,
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
    },
    roots: {
      policyReportRoot,
      synthesisRoot: input.synthesis.roots.synthesisRoot,
      evaluationRoots,
      aggregatePolicyRoot,
    },
  };
}

export function assertDepositAssetPackOptionPolicyReportSourceSafe(
  report: DepositAssetPackOptionPolicyReport,
) {
  const serialized = stableStringify(report);
  const noForbiddenMarkers = hasNoForbiddenSourceMarkers(serialized);
  const sourceSafe =
    report.schema === 'bitcode.deposit.asset-pack-option-policy-report' &&
    report.policy === 'DepositAssetPackOptionPolicy' &&
    report.route === '/deposits' &&
    report.aggregatePolicy.admissionAndIndexingOwnedBy === 'future-gate7-deposit-option-review' &&
    report.sourceSafety.sourceSafeMetadataOnly === true &&
    report.sourceSafety.protectedSourceVisible === false &&
    report.sourceSafety.rawSourceTextVisible === false &&
    report.sourceSafety.unpaidAssetPackSourceVisible === false &&
    report.sourceSafety.rawPromptVisible === false &&
    report.sourceSafety.interpolatedPromptVisible === false &&
    report.sourceSafety.rawProviderResponseVisible === false &&
    report.sourceSafety.walletPrivateMaterialVisible === false &&
    report.sourceSafety.settlementPrivatePayloadVisible === false &&
    report.evaluations.every(
      (evaluation) =>
        evaluation.admissionBoundary.admissionAndIndexingOwnedBy === 'future-gate7-deposit-option-review' &&
        evaluation.admissionBoundary.sourceBearingDisclosureBeforeSettlementVisible === false &&
        evaluation.btdPotential.estimateOnly === true &&
        evaluation.btdPotential.btdMintBoundary === 'not-minted-until-future-need-fit-settlement' &&
        evaluation.compensation.priceAsset === 'BTC' &&
        evaluation.compensation.sourceToSharesProofState ===
          'not-created-until-accepted-need-fit-and-settlement' &&
        evaluation.visibility.sourceSafeMetadataOnly === true &&
        evaluation.visibility.protectedSourceVisible === false &&
        evaluation.visibility.rawSourceTextVisible === false &&
        evaluation.visibility.unpaidAssetPackSourceVisible === false &&
        evaluation.visibility.walletPrivateMaterialVisible === false,
    ) &&
    noForbiddenMarkers;

  return {
    admitted: sourceSafe,
    reason: sourceSafe
      ? 'source_safe_deposit_asset_pack_option_policy'
      : 'deposit_option_policy_source_safety_boundary_violation',
  };
}
