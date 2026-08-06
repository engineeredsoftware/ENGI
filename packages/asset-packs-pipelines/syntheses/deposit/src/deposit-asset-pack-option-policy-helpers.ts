/**
 * Pure policy scoring helpers for deposit AssetPack option policy reports.
 *
 * Criticality, demand, ROI, BTD potential, and compensation route math —
 * deterministic and source-safe (roots only, never raw source).
 */

import type { DepositAssetPackOption, DepositOptionDemandSignal } from './deposit-asset-pack-options-types';
import type {
  DepositAssetPackOptionPolicyEvaluation,
  DepositOptionBtdPotentialState,
  DepositOptionCompensationState,
  DepositOptionCriticalitySignal,
  DepositOptionCriticalityState,
  DepositOptionDemandState,
  DepositOptionRoiState,
} from './deposit-asset-pack-option-policy-types';
import { boundedUnit, normalizedText, root } from '@bitcode/asset-packs-pipelines-syntheses-domain/deposit-source-safe-utils';

export function positiveInteger(value: number | null | undefined, fallback: number) {
  const numeric = Number(value ?? fallback);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.round(numeric));
}

export function normalizedCriticalitySignals(value: DepositOptionCriticalitySignal[] | null | undefined) {
  return (value || [])
    .map((signal, index) => ({
      id: normalizedText(signal.id) || `criticality-signal-${index + 1}`,
      label: normalizedText(signal.label) || `Criticality signal ${index + 1}`,
      severity: signal.severity || 'warning',
      weight: boundedUnit(signal.weight, 0.5),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function sumSignalWeights(signals: DepositOptionDemandSignal[] | undefined) {
  return (signals || []).reduce((sum, signal) => sum + boundedUnit(signal.weight, 0.5), 0);
}

export function optionMeasurementVolume(option: DepositAssetPackOption) {
  if (!option.measurements.length) return 0;
  const weighted = option.measurements.reduce(
    (sum, measurement) => sum + boundedUnit(measurement.volume, 0) * boundedUnit(measurement.weight, 0),
    0,
  );
  const weights = option.measurements.reduce((sum, measurement) => sum + boundedUnit(measurement.weight, 0), 0);
  return Number((weights ? weighted / weights : 0).toFixed(4));
}

export function sourceCriticalityFor(input: {
  option: DepositAssetPackOption;
  signals: ReturnType<typeof normalizedCriticalitySignals>;
}) {
  const signalRoots = input.signals.map((signal) => root('deposit-policy-criticality-signal', signal));
  const criticalWeight = input.signals
    .filter((signal) => signal.severity === 'critical')
    .reduce((sum, signal) => sum + signal.weight, 0);
  const warningWeight = input.signals
    .filter((signal) => signal.severity === 'warning')
    .reduce((sum, signal) => sum + signal.weight, 0);
  const subCriticalWeight = input.signals
    .filter((signal) => signal.severity === 'sub-critical')
    .reduce((sum, signal) => sum + signal.weight, 0);
  const sourceBreadthRisk = Math.min(0.2, input.option.sourceBinding.sourcePathCount * 0.025);
  const score = Number(
    Math.max(
      0,
      Math.min(1, 0.22 + criticalWeight * 0.55 + warningWeight * 0.22 - subCriticalWeight * 0.18 + sourceBreadthRisk),
    ).toFixed(2),
  );
  const state: DepositOptionCriticalityState =
    criticalWeight >= 0.75 || score >= 0.78
      ? 'blocked-critical-source'
      : score >= 0.48 || warningWeight > subCriticalWeight
        ? 'review-warning'
        : 'sub-critical';
  const blockers = state === 'blocked-critical-source' ? ['critical_source_policy_block'] : [];
  const warnings = [
    ...(state === 'review-warning' ? ['depositor_review_required_for_source_criticality'] : []),
    ...(!input.signals.length ? ['source_criticality_signals_missing'] : []),
  ];

  return {
    state,
    score,
    signalRoots,
    blockers,
    warnings,
  };
}

export function demandFor(
  option: DepositAssetPackOption,
  settledDemand?: { estimatable: boolean; demand: number | null } | null,
) {
  // Prefer settled-Depository search. If unestimatable, do not fall back to
  // synthetic confidence from hardcoded demand signals.
  if (settledDemand && settledDemand.estimatable === false) {
    return {
      state: 'unestimatable-demand' as const,
      confidence: 0,
      weightedDemand: 0,
      demandRoot: root('deposit-policy-demand', {
        optionId: option.optionId,
        estimatable: false,
        depositorySignalRoots: option.demandAlignment.depositorySignalRoots,
      }),
    };
  }
  const settled =
    settledDemand?.estimatable && typeof settledDemand.demand === 'number'
      ? Math.max(0, Math.min(1, settledDemand.demand))
      : null;
  // Blend option alignment confidence with settled-corpus demand when present.
  const base = option.demandAlignment.confidence;
  const weightedDemand = Number(
    Math.max(0, Math.min(1, settled == null ? base : settled * 0.72 + base * 0.28)).toFixed(2),
  );
  const state: DepositOptionDemandState =
    weightedDemand >= 0.76
      ? 'strong-likely-demand'
      : weightedDemand >= 0.56
        ? 'moderate-likely-demand'
        : 'weak-likely-demand';

  return {
    state,
    confidence: weightedDemand,
    weightedDemand,
    demandRoot: root('deposit-policy-demand', {
      optionId: option.optionId,
      confidence: weightedDemand,
      settledDemand: settled,
      depositorySignalRoots: option.demandAlignment.depositorySignalRoots,
      readingSignalRoots: option.demandAlignment.readingSignalRoots,
      existingDepositorySignalRoots: option.demandAlignment.existingDepositorySignalRoots,
    }),
  };
}

export function roiFor(input: {
  option: DepositAssetPackOption;
  demand: ReturnType<typeof demandFor>;
  criticality: ReturnType<typeof sourceCriticalityFor>;
  developmentCostSats: number;
  expectedSettlementSats: number;
}) {
  const measurementVolume = optionMeasurementVolume(input.option);
  const kindMultiplier =
    input.option.kind === 'capability-slice'
      ? 1
      : input.option.kind === 'implementation-pattern'
        ? 0.92
        : 0.84;
  const criticalityDiscount =
    input.criticality.state === 'sub-critical'
      ? 1
      : input.criticality.state === 'review-warning'
        ? 0.76
        : 0;
  // Demand honesty: when settled demand is unestimatable, do not invent a demand
  // percentage — but still rank ROI from measurement volume × provisional
  // settlement so reviewable options are not all forced to negative ROI (full-stack
  // incompleteness: option roots > 0 with positive ROI options stuck at 0).
  const demandUnestimatable = input.demand.state === 'unestimatable-demand';
  const demandWeight = demandUnestimatable
    ? Math.max(0.45, measurementVolume)
    : input.demand.weightedDemand;
  const settlementBase = demandUnestimatable
    ? Math.max(input.expectedSettlementSats, Math.round(input.developmentCostSats * 1.55 + 900))
    : input.expectedSettlementSats;
  const estimatedGrossSats = Math.round(
    settlementBase * demandWeight * (0.62 + measurementVolume * 0.38) * kindMultiplier * criticalityDiscount,
  );
  const expectedNetSats = estimatedGrossSats - input.developmentCostSats;
  const roiMultiple = Number(
    (input.developmentCostSats > 0 ? estimatedGrossSats / input.developmentCostSats : 0).toFixed(2),
  );
  const state: DepositOptionRoiState =
    input.criticality.state === 'blocked-critical-source'
      ? 'blocked-criticality'
      : expectedNetSats < 0
        ? 'negative-expected-value'
        : roiMultiple < 1.25
          ? 'marginal-expected-value'
          : 'positive-expected-value';
  const roiRoot = root('deposit-policy-roi', {
    optionId: input.option.optionId,
    state,
    estimatedGrossSats,
    estimatedDevelopmentCostSats: input.developmentCostSats,
    expectedNetSats,
    roiMultiple,
    demandUnestimatable,
  });

  return {
    state,
    estimatedGrossSats,
    estimatedDevelopmentCostSats: input.developmentCostSats,
    expectedNetSats,
    roiMultiple,
    roiRoot,
  };
}

export function btdPotentialFor(input: {
  option: DepositAssetPackOption;
  demand: ReturnType<typeof demandFor>;
  roi: ReturnType<typeof roiFor>;
  criticality: ReturnType<typeof sourceCriticalityFor>;
}) {
  const estimatedKnowledgeVolume = Number(
    (optionMeasurementVolume(input.option) * input.demand.weightedDemand).toFixed(4),
  );
  const estimatedBtdCells = Math.max(0, Math.round(estimatedKnowledgeVolume * 1000));
  const state: DepositOptionBtdPotentialState =
    input.criticality.state === 'blocked-critical-source' || input.roi.state === 'negative-expected-value'
      ? 'blocked-until-policy-repair'
      : estimatedKnowledgeVolume >= 0.64
        ? 'high-potential'
        : estimatedKnowledgeVolume >= 0.42
          ? 'moderate-potential'
          : 'low-potential';
  const btdPotentialRoot = root('deposit-policy-btd-potential', {
    optionId: input.option.optionId,
    state,
    estimatedKnowledgeVolume,
    estimatedBtdCells,
  });

  return {
    state,
    estimatedKnowledgeVolume,
    estimatedBtdCells,
    estimateOnly: true as const,
    btdMintBoundary: 'not-minted-until-future-need-fit-settlement' as const,
    rightsBoundary: 'depositor-retains-rights-until-paid-reader-settlement-transfer' as const,
    btdPotentialRoot,
  };
}

export function compensationFor(input: {
  option: DepositAssetPackOption;
  criticality: ReturnType<typeof sourceCriticalityFor>;
  roi: ReturnType<typeof roiFor>;
  depositorWalletId: string | null;
  demandUnestimatable?: boolean;
}) {
  const blockers = [
    ...input.criticality.blockers,
    ...(input.roi.state === 'negative-expected-value' ? ['negative_expected_value'] : []),
    ...(input.roi.state === 'blocked-criticality' ? ['criticality_blocks_compensation'] : []),
    ...(!input.depositorWalletId ? ['depositor_wallet_missing'] : []),
    ...(input.option.reviewBoundary.state !== 'reviewable-source-safe-option' ? ['option_not_reviewable'] : []),
    // Demand unestimatable is honesty for earnings display — not a hard admission
    // block (warn only). Settlement compensation remains estimate-labeled.
  ];
  const warnings = [
    ...input.criticality.warnings,
    ...(input.roi.state === 'marginal-expected-value' ? ['marginal_expected_value'] : []),
    ...(input.demandUnestimatable ? ['demand_unestimatable_from_settled_depository'] : []),
  ];
  const eligibleIfApprovedAndSelected = blockers.length === 0;
  const state: DepositOptionCompensationState = eligibleIfApprovedAndSelected
    ? 'eligible-if-approved-and-selected'
    : input.criticality.state === 'blocked-critical-source' || input.roi.state === 'negative-expected-value'
      ? 'blocked-before-compensation'
      : 'repair-required-before-compensation';
  const compensationRoute = {
    optionId: input.option.optionId,
    state,
    payer: 'future-reader-after-settlement',
    payee: 'depositing-wallet',
    priceAsset: 'BTC',
    allocationMethod: 'source-to-shares-largest-remainder',
    depositorShareBasisPoints: 8000,
    protocolTreasuryBasisPoints: 2000,
    sourceToSharesProofState: 'not-created-until-accepted-need-fit-and-settlement',
    depositorWalletRoot: input.depositorWalletId ? root('deposit-policy-wallet', input.depositorWalletId) : null,
    blockers,
    warnings,
  };

  return {
    state,
    payer: 'future-reader-after-settlement' as const,
    payee: 'depositing-wallet' as const,
    priceAsset: 'BTC' as const,
    allocationMethod: 'source-to-shares-largest-remainder' as const,
    depositorShareBasisPoints: 8000,
    protocolTreasuryBasisPoints: 2000,
    sourceToSharesProofState: 'not-created-until-accepted-need-fit-and-settlement' as const,
    eligibleIfApprovedAndSelected,
    blockers: [...new Set(blockers)].sort(),
    warnings: [...new Set(warnings)].sort(),
    compensationRouteRoot: root('deposit-policy-compensation-route', compensationRoute),
  };
}

export function policyDecisionFor(input: {
  criticality: ReturnType<typeof sourceCriticalityFor>;
  roi: ReturnType<typeof roiFor>;
  compensation: ReturnType<typeof compensationFor>;
}): DepositAssetPackOptionPolicyEvaluation['policyDecision'] {
  if (
    input.criticality.state === 'blocked-critical-source' ||
    input.roi.state === 'negative-expected-value' ||
    input.roi.state === 'blocked-criticality' ||
    input.compensation.state === 'blocked-before-compensation'
  ) {
    return 'blocked-before-admission';
  }
  // Demand-unestimatable is honesty for earnings, not a demotion of measured
  // options out of reviewable-positive-roi (full-stack completeness).
  const materialWarnings = input.compensation.warnings.filter(
    (warning) => warning !== 'demand_unestimatable_from_settled_depository',
  );
  if (
    input.criticality.state === 'review-warning' ||
    input.roi.state === 'marginal-expected-value' ||
    materialWarnings.length
  ) {
    return 'review-warning-before-admission';
  }
  return 'reviewable-positive-roi';
}
