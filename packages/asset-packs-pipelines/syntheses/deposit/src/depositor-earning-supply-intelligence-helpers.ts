/**
 * Pure helpers for depositor earning ranges and supply recommendations.
 *
 * Maps policy evaluations into estimate-labeled compensation bands and
 * action recommendations without inventing settled demand.
 */

import type { DepositOptionDemandSignal } from './deposit-asset-pack-options-types';
import type { DepositAssetPackOptionPolicyEvaluation } from './deposit-asset-pack-option-policy-types';
import type {
  DepositorDemandOpportunityState,
  DepositorEarningRangeState,
  DepositorEarningStatement,
  DepositorSupplyRecommendation,
  DepositorSupplyRecommendationAction,
} from './depositor-earning-supply-intelligence-types';
import { boundedUnit, normalizedText, root } from '@bitcode/asset-packs-pipelines-syntheses-domain/deposit-source-safe-utils';

/** Extra forbidden markers beyond the shared base set for earning intelligence. */
export const EARNING_EXTRA_FORBIDDEN_MARKERS = [
  'protected_source_payload',
  'value_bearing_mainnet',
] as const;

export function opportunityStateFor(weight: number): DepositorDemandOpportunityState {
  if (weight >= 0.76) return 'strong-demand-opportunity';
  if (weight >= 0.56) return 'moderate-demand-opportunity';
  return 'weak-demand-opportunity';
}

export function normalizedOpportunitySignals(value: DepositOptionDemandSignal[] | null | undefined) {
  return (value || [])
    .map((signal, index) => {
      const weight = boundedUnit(signal.weight, 0.5);
      const label =
        normalizedText(signal.label) ||
        normalizedText(signal.summary) ||
        `Unfit Need opportunity ${index + 1}`;
      const id = normalizedText(signal.id) || `unfit-need-opportunity-${index + 1}`;
      return {
        id,
        label,
        weight,
        state: opportunityStateFor(weight),
        opportunityRoot: root('deposit-unfit-need-opportunity', { id, label, weight }),
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function statementStateFor(
  evaluation: DepositAssetPackOptionPolicyEvaluation,
): DepositorEarningRangeState {
  if (evaluation.sourceCriticality.state === 'blocked-critical-source') return 'blocked-critical-source';
  if (!evaluation.compensation.eligibleIfApprovedAndSelected) return 'repair-required-before-earning';
  return 'compensation-range-estimated';
}

export function compensationRangeFor(evaluation: DepositAssetPackOptionPolicyEvaluation) {
  const expected = Math.max(
    0,
    Math.round((evaluation.roi.estimatedGrossSats * evaluation.compensation.depositorShareBasisPoints) / 10_000),
  );
  return {
    low: Math.round(expected * 0.7),
    expected,
    high: Math.round(expected * 1.3),
    priceAsset: 'BTC' as const,
    rangeBasis: 'estimated-future-reader-settlement-share' as const,
  };
}

export function netRangeFor(
  range: DepositorEarningStatement['expectedCompensationRangeSats'],
  evaluation: DepositAssetPackOptionPolicyEvaluation,
) {
  const developmentCost = evaluation.roi.estimatedDevelopmentCostSats;
  return {
    low: range.low - developmentCost,
    expected: range.expected - developmentCost,
    high: range.high - developmentCost,
  };
}

export function recommendationFor(
  evaluation: DepositAssetPackOptionPolicyEvaluation,
): DepositorSupplyRecommendation {
  const action: DepositorSupplyRecommendationAction =
    evaluation.sourceCriticality.state === 'blocked-critical-source'
      ? 'withhold-critical-source'
      : !evaluation.compensation.eligibleIfApprovedAndSelected
        ? 'repair-policy-before-admission'
        : evaluation.demand.state === 'weak-likely-demand' || evaluation.roi.state !== 'positive-expected-value'
          ? 'resynthesize-for-demand'
          : 'approve-for-depository-review';
  const reasons = [
    evaluation.sourceCriticality.state,
    evaluation.demand.state,
    evaluation.roi.state,
    evaluation.compensation.state,
  ];
  return {
    optionId: evaluation.optionId,
    title: evaluation.title,
    action,
    reasons,
    recommendationRoot: root('deposit-supply-recommendation', {
      optionId: evaluation.optionId,
      action,
      reasons,
    }),
  };
}
