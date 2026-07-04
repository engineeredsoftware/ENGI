import type {
  DepositAssetPackOptionPolicyEvaluation,
  DepositAssetPackOptionPolicyReport,
} from './deposit-asset-pack-option-policy';
import type { DepositOptionDemandSignal } from './deposit-asset-pack-options';

export type DepositorDemandOpportunityState =
  | 'strong-demand-opportunity'
  | 'moderate-demand-opportunity'
  | 'weak-demand-opportunity';

export type DepositorEarningRangeState =
  | 'compensation-range-estimated'
  | 'repair-required-before-earning'
  | 'blocked-critical-source';

export type DepositorSupplyRecommendationAction =
  | 'approve-for-depository-review'
  | 'repair-policy-before-admission'
  | 'resynthesize-for-demand'
  | 'withhold-critical-source';

export interface DepositorEarningSupplyIntelligenceInput {
  policyReport: DepositAssetPackOptionPolicyReport;
  unfitNeedOpportunitySignals?: DepositOptionDemandSignal[] | null;
  createdAt?: string | null;
}

export interface DepositorUnfitNeedOpportunity {
  id: string;
  label: string;
  weight: number;
  state: DepositorDemandOpportunityState;
  opportunityRoot: string;
}

export interface DepositorEarningStatement {
  schema: 'bitcode.deposit.depositor-earning-statement';
  optionId: string;
  title: string;
  valueLabel: 'estimate';
  state: DepositorEarningRangeState;
  demandState: DepositAssetPackOptionPolicyEvaluation['demand']['state'];
  sourceCriticalityState: DepositAssetPackOptionPolicyEvaluation['sourceCriticality']['state'];
  roiState: DepositAssetPackOptionPolicyEvaluation['roi']['state'];
  expectedCompensationRangeSats: {
    low: number;
    expected: number;
    high: number;
    priceAsset: 'BTC';
    rangeBasis: 'estimated-future-reader-settlement-share';
  };
  expectedNetRangeSats: {
    low: number;
    expected: number;
    high: number;
  };
  sourceToShares: {
    allocationMethod: 'source-to-shares-largest-remainder';
    depositorShareBasisPoints: number;
    proofState: 'not-created-until-accepted-need-fit-and-settlement';
  };
  blockers: string[];
  warnings: string[];
  statementRoot: string;
}

export interface DepositorSupplyRecommendation {
  optionId: string;
  title: string;
  action: DepositorSupplyRecommendationAction;
  reasons: string[];
  recommendationRoot: string;
}

export interface DepositorEarningSupplyIntelligence {
  schema: 'bitcode.deposit.earning-supply-intelligence';
  intelligence: 'DepositorEarningSupplyIntelligence';
  createdAt: string;
  route: '/deposits';
  synthesisRequestId: string;
  optionCount: number;
  likelyDemand: {
    state: DepositorDemandOpportunityState;
    averageConfidence: number;
    strongestOptionId: string | null;
    strongDemandOptionCount: number;
    demandRoot: string;
  };
  unfitNeedOpportunities: {
    state: DepositorDemandOpportunityState;
    opportunityCount: number;
    opportunities: DepositorUnfitNeedOpportunity[];
    opportunityRoot: string;
  };
  earningStatements: DepositorEarningStatement[];
  supplyRecommendations: DepositorSupplyRecommendation[];
  aggregate: {
    valueLabel: 'estimate';
    eligibleEarningStatementCount: number;
    blockedCriticalSourceCount: number;
    repairRequiredCount: number;
    totalExpectedCompensationSats: number;
    expectedCompensationRangeSats: {
      low: number;
      expected: number;
      high: number;
      priceAsset: 'BTC';
    };
    sourceSafeSupplyRecommendationCount: number;
    unfitNeedOpportunityCount: number;
    aggregateRoot: string;
  };
  disclosure: {
    sourceSafeMetadataOnly: true;
    protectedSourceVisible: false;
    rawSourceTextVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
    valueBearingMainnetAdmitted: false;
  };
  roots: {
    intelligenceRoot: string;
    policyReportRoot: string;
    likelyDemandRoot: string;
    unfitNeedOpportunityRoot: string;
    earningStatementRoots: string[];
    supplyRecommendationRoots: string[];
    aggregateRoot: string;
  };
}

const FORBIDDEN_SOURCE_MARKERS = [
  'PRIVATE_SOURCE_DO_NOT_SERIALIZE',
  `BEGIN_${'PRIVATE'}_KEY`,
  'wallet_private_material',
  'raw_provider_response',
  'unpaid_assetpack_source',
  'protected_source_payload',
  'value_bearing_mainnet',
];

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function stableHash(value: unknown) {
  const text = typeof value === 'string' ? value : stableStringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function root(prefix: string, value: unknown) {
  return `${prefix}:${stableHash(value)}`;
}

function normalizedText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function boundedUnit(value: number | null | undefined, fallback: number) {
  const numeric = Number(value ?? fallback);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(1, numeric));
}

function opportunityStateFor(weight: number): DepositorDemandOpportunityState {
  if (weight >= 0.76) return 'strong-demand-opportunity';
  if (weight >= 0.56) return 'moderate-demand-opportunity';
  return 'weak-demand-opportunity';
}

function normalizedOpportunitySignals(value: DepositOptionDemandSignal[] | null | undefined) {
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

function statementStateFor(
  evaluation: DepositAssetPackOptionPolicyEvaluation,
): DepositorEarningRangeState {
  if (evaluation.sourceCriticality.state === 'blocked-critical-source') return 'blocked-critical-source';
  if (!evaluation.compensation.eligibleIfApprovedAndSelected) return 'repair-required-before-earning';
  return 'compensation-range-estimated';
}

function compensationRangeFor(evaluation: DepositAssetPackOptionPolicyEvaluation) {
  const expected = Math.max(
    0,
    Math.round(
      (evaluation.roi.estimatedGrossSats * evaluation.compensation.depositorShareBasisPoints) / 10_000,
    ),
  );
  return {
    low: Math.round(expected * 0.7),
    expected,
    high: Math.round(expected * 1.3),
    priceAsset: 'BTC' as const,
    rangeBasis: 'estimated-future-reader-settlement-share' as const,
  };
}

function netRangeFor(
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

function recommendationFor(evaluation: DepositAssetPackOptionPolicyEvaluation): DepositorSupplyRecommendation {
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

export function buildDepositorEarningSupplyIntelligence(
  input: DepositorEarningSupplyIntelligenceInput,
): DepositorEarningSupplyIntelligence {
  const createdAt = normalizedText(input.createdAt) || input.policyReport.createdAt || 'deterministic';
  const opportunities = normalizedOpportunitySignals(input.unfitNeedOpportunitySignals);
  const optionDemandAverage = input.policyReport.evaluations.length
    ? Number(
        (
          input.policyReport.evaluations.reduce(
            (sum, evaluation) => sum + evaluation.demand.weightedDemand,
            0,
          ) / input.policyReport.evaluations.length
        ).toFixed(2),
      )
    : 0;
  const strongestEvaluation = [...input.policyReport.evaluations].sort(
    (left, right) => right.demand.weightedDemand - left.demand.weightedDemand,
  )[0];
  const likelyDemandState = opportunityStateFor(optionDemandAverage);
  const opportunitiesAverage = opportunities.length
    ? opportunities.reduce((sum, opportunity) => sum + opportunity.weight, 0) / opportunities.length
    : optionDemandAverage;
  const unfitNeedState = opportunityStateFor(Number(opportunitiesAverage.toFixed(2)));

  const earningStatements = input.policyReport.evaluations.map((evaluation) => {
    const expectedCompensationRangeSats = compensationRangeFor(evaluation);
    const expectedNetRangeSats = netRangeFor(expectedCompensationRangeSats, evaluation);
    const state = statementStateFor(evaluation);
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
    high: eligibleStatements.reduce((sum, statement) => sum + statement.expectedCompensationRangeSats.high, 0),
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
  const noForbiddenMarkers = FORBIDDEN_SOURCE_MARKERS.every((marker) => !serialized.includes(marker));
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
        statement.sourceToShares.proofState ===
          'not-created-until-accepted-need-fit-and-settlement',
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
