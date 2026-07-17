/**
 * Depositor earning and supply intelligence public entry.
 *
 * Builds estimate-labeled earning statements and supply recommendations from
 * policy reports. Package export path unchanged.
 */

import type {
  DepositorDemandOpportunityState,
  DepositorEarningRangeState,
  DepositorEarningSupplyIntelligence,
  DepositorEarningSupplyIntelligenceInput,
} from './depositor-earning-supply-intelligence-types';
import {
  EARNING_EXTRA_FORBIDDEN_MARKERS,
  compensationRangeFor,
  netRangeFor,
  normalizedOpportunitySignals,
  opportunityStateFor,
  recommendationFor,
  statementStateFor,
} from './depositor-earning-supply-intelligence-helpers';
import {
  boundedUnit,
  hasNoForbiddenSourceMarkers,
  normalizedText,
  root,
  stableStringify,
} from './deposit-source-safe-utils';

export type {
  DepositorDemandOpportunityState,
  DepositorEarningRangeState,
  DepositorEarningStatement,
  DepositorEarningSupplyIntelligence,
  DepositorEarningSupplyIntelligenceInput,
  DepositorSupplyRecommendation,
  DepositorSupplyRecommendationAction,
  DepositorUnfitNeedOpportunity,
} from './depositor-earning-supply-intelligence-types';

export function buildDepositorEarningSupplyIntelligence(
  input: DepositorEarningSupplyIntelligenceInput,
): DepositorEarningSupplyIntelligence {
  const createdAt = normalizedText(input.createdAt) || input.policyReport.createdAt || 'deterministic';
  const demandUnestimatable = input.demandUnestimatable === true;
  const opportunities = demandUnestimatable
    ? []
    : normalizedOpportunitySignals(input.unfitNeedOpportunitySignals);
  const optionDemandAverage = demandUnestimatable
    ? 0
    : input.policyReport.evaluations.length
      ? Number(
          (
            input.policyReport.evaluations.reduce(
              (sum, evaluation) => sum + evaluation.demand.weightedDemand,
              0,
            ) / input.policyReport.evaluations.length
          ).toFixed(2),
        )
      : typeof input.settledDemand === 'number' && Number.isFinite(input.settledDemand)
        ? boundedUnit(input.settledDemand, 0)
        : 0;
  const strongestEvaluation = demandUnestimatable
    ? undefined
    : [...input.policyReport.evaluations].sort(
        (left, right) => right.demand.weightedDemand - left.demand.weightedDemand,
      )[0];
  const likelyDemandState: DepositorDemandOpportunityState = demandUnestimatable
    ? 'unestimatable-demand'
    : opportunityStateFor(optionDemandAverage);
  const opportunitiesAverage = opportunities.length
    ? opportunities.reduce((sum, opportunity) => sum + opportunity.weight, 0) / opportunities.length
    : optionDemandAverage;
  const unfitNeedState: DepositorDemandOpportunityState = demandUnestimatable
    ? 'unestimatable-demand'
    : opportunityStateFor(Number(opportunitiesAverage.toFixed(2)));

  const earningStatements = input.policyReport.evaluations.map((evaluation) => {
    // Critical-source blocking outranks unestimatable demand so depositor
    // guidance still names the stronger policy gate first.
    const criticalBlocked = evaluation.sourceCriticality.state === 'blocked-critical-source';
    const expectedCompensationRangeSats =
      demandUnestimatable || criticalBlocked
        ? {
            low: 0,
            expected: 0,
            high: 0,
            priceAsset: 'BTC' as const,
            rangeBasis: 'estimated-future-reader-settlement-share' as const,
          }
        : compensationRangeFor(evaluation);
    const expectedNetRangeSats =
      demandUnestimatable || criticalBlocked
        ? { low: 0, expected: 0, high: 0 }
        : netRangeFor(expectedCompensationRangeSats, evaluation);
    const state: DepositorEarningRangeState = criticalBlocked
      ? 'blocked-critical-source'
      : demandUnestimatable
        ? 'unestimatable-demand'
        : statementStateFor(evaluation);
    const blockers = [...new Set(evaluation.compensation.blockers)].sort();
    const warnings = [...new Set(evaluation.compensation.warnings)].sort();
    const statementSeed = {
      optionId: evaluation.optionId,
      state,
      demandState: evaluation.demand.state,
      sourceCriticalityState: evaluation.sourceCriticality.state,
      roiState: evaluation.roi.state,
      expectedCompensationRangeSats,
      expectedNetRangeSats,
      blockers,
      warnings,
    };
    return {
      schema: 'bitcode.deposit.depositor-earning-statement' as const,
      optionId: evaluation.optionId,
      title: evaluation.title,
      valueLabel: 'estimate' as const,
      state,
      demandState: evaluation.demand.state,
      sourceCriticalityState: evaluation.sourceCriticality.state,
      roiState: evaluation.roi.state,
      expectedCompensationRangeSats,
      expectedNetRangeSats,
      sourceToShares: {
        allocationMethod: evaluation.compensation.allocationMethod,
        depositorShareBasisPoints: evaluation.compensation.depositorShareBasisPoints,
        proofState: evaluation.compensation.sourceToSharesProofState,
      },
      blockers,
      warnings,
      statementRoot: root('deposit-earning-statement', statementSeed),
    };
  });

  const supplyRecommendations = input.policyReport.evaluations.map(recommendationFor);
  const eligibleStatements = earningStatements.filter(
    (statement) => statement.state === 'compensation-range-estimated',
  );
  const totalExpectedCompensationSats = eligibleStatements.reduce(
    (sum, statement) => sum + statement.expectedCompensationRangeSats.expected,
    0,
  );
  const range = {
    low: eligibleStatements.reduce((sum, statement) => sum + statement.expectedCompensationRangeSats.low, 0),
    expected: totalExpectedCompensationSats,
    high: eligibleStatements.reduce(
      (sum, statement) => sum + statement.expectedCompensationRangeSats.high,
      0,
    ),
    priceAsset: 'BTC' as const,
  };
  const likelyDemandRoot = root('deposit-likely-demand', {
    likelyDemandState,
    optionDemandAverage,
    strongestOptionId: strongestEvaluation?.optionId || null,
  });
  const unfitNeedOpportunityRoot = root('deposit-unfit-need-opportunities', opportunities);
  const aggregateRoot = root('deposit-earning-supply-aggregate', {
    totalExpectedCompensationSats,
    eligibleCount: eligibleStatements.length,
    range,
    recommendationRoots: supplyRecommendations.map((entry) => entry.recommendationRoot),
    opportunityRoots: opportunities.map((entry) => entry.opportunityRoot),
  });
  const earningStatementRoots = earningStatements.map((statement) => statement.statementRoot);
  const supplyRecommendationRoots = supplyRecommendations.map(
    (recommendation) => recommendation.recommendationRoot,
  );
  const intelligenceRoot = root('deposit-earning-supply-intelligence', {
    policyReportRoot: input.policyReport.roots.policyReportRoot,
    likelyDemandRoot,
    unfitNeedOpportunityRoot,
    earningStatementRoots,
    supplyRecommendationRoots,
    aggregateRoot,
  });

  return {
    schema: 'bitcode.deposit.earning-supply-intelligence',
    intelligence: 'DepositorEarningSupplyIntelligence',
    createdAt,
    route: '/deposits',
    synthesisRequestId: input.policyReport.synthesisRequestId,
    optionCount: input.policyReport.optionCount,
    likelyDemand: {
      state: likelyDemandState,
      averageConfidence: optionDemandAverage,
      strongestOptionId: strongestEvaluation?.optionId || null,
      strongDemandOptionCount: input.policyReport.evaluations.filter(
        (evaluation) => evaluation.demand.state === 'strong-likely-demand',
      ).length,
      demandRoot: likelyDemandRoot,
    },
    unfitNeedOpportunities: {
      state: unfitNeedState,
      opportunityCount: opportunities.length,
      opportunities,
      opportunityRoot: unfitNeedOpportunityRoot,
    },
    earningStatements,
    supplyRecommendations,
    aggregate: {
      valueLabel: 'estimate',
      eligibleEarningStatementCount: eligibleStatements.length,
      blockedCriticalSourceCount: earningStatements.filter(
        (statement) => statement.state === 'blocked-critical-source',
      ).length,
      repairRequiredCount: earningStatements.filter(
        (statement) => statement.state === 'repair-required-before-earning',
      ).length,
      totalExpectedCompensationSats,
      expectedCompensationRangeSats: range,
      sourceSafeSupplyRecommendationCount: supplyRecommendations.filter(
        (recommendation) => recommendation.action === 'approve-for-depository-review',
      ).length,
      unfitNeedOpportunityCount: opportunities.length,
      aggregateRoot,
    },
    disclosure: {
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      valueBearingMainnetAdmitted: false,
    },
    roots: {
      intelligenceRoot,
      policyReportRoot: input.policyReport.roots.policyReportRoot,
      likelyDemandRoot,
      unfitNeedOpportunityRoot,
      earningStatementRoots,
      supplyRecommendationRoots,
      aggregateRoot,
    },
  };
}

export function assertDepositorEarningSupplyIntelligenceSourceSafe(
  intelligence: DepositorEarningSupplyIntelligence,
) {
  const serialized = stableStringify(intelligence);
  const noForbiddenMarkers = hasNoForbiddenSourceMarkers(serialized, EARNING_EXTRA_FORBIDDEN_MARKERS);
  const sourceSafe =
    noForbiddenMarkers &&
    intelligence.schema === 'bitcode.deposit.earning-supply-intelligence' &&
    intelligence.intelligence === 'DepositorEarningSupplyIntelligence' &&
    intelligence.route === '/deposits' &&
    intelligence.aggregate.valueLabel === 'estimate' &&
    intelligence.earningStatements.every(
      (statement) =>
        statement.schema === 'bitcode.deposit.depositor-earning-statement' &&
        statement.valueLabel === 'estimate' &&
        statement.expectedCompensationRangeSats.priceAsset === 'BTC' &&
        statement.expectedCompensationRangeSats.rangeBasis ===
          'estimated-future-reader-settlement-share' &&
        statement.sourceToShares.allocationMethod === 'source-to-shares-largest-remainder' &&
        statement.sourceToShares.proofState === 'not-created-until-accepted-need-fit-and-settlement',
    ) &&
    intelligence.disclosure.sourceSafeMetadataOnly === true &&
    intelligence.disclosure.protectedSourceVisible === false &&
    intelligence.disclosure.rawSourceTextVisible === false &&
    intelligence.disclosure.unpaidAssetPackSourceVisible === false &&
    intelligence.disclosure.rawPromptVisible === false &&
    intelligence.disclosure.interpolatedPromptVisible === false &&
    intelligence.disclosure.rawProviderResponseVisible === false &&
    intelligence.disclosure.walletPrivateMaterialVisible === false &&
    intelligence.disclosure.settlementPrivatePayloadVisible === false &&
    intelligence.disclosure.valueBearingMainnetAdmitted === false;

  return {
    admitted: sourceSafe,
    reason: sourceSafe
      ? 'source_safe_depositor_earning_supply_intelligence'
      : 'depositor_earning_supply_intelligence_source_safety_boundary_violation',
  };
}
