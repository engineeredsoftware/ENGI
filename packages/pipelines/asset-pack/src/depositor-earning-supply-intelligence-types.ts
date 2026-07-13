/**
 * Depositor earning and supply intelligence types.
 *
 * Estimate-labeled compensation ranges, unfit-Need opportunities, and supply
 * recommendations for /deposits — never value-bearing mainnet admissions.
 */

import type {
  DepositAssetPackOptionPolicyEvaluation,
  DepositAssetPackOptionPolicyReport,
} from './deposit-asset-pack-option-policy-types';
import type { DepositOptionDemandSignal } from './deposit-asset-pack-options-types';

export type DepositorDemandOpportunityState =
  | 'strong-demand-opportunity'
  | 'moderate-demand-opportunity'
  | 'weak-demand-opportunity'
  | 'unestimatable-demand';

export type DepositorEarningRangeState =
  | 'compensation-range-estimated'
  | 'repair-required-before-earning'
  | 'blocked-critical-source'
  | 'unestimatable-demand';

export type DepositorSupplyRecommendationAction =
  | 'approve-for-depository-review'
  | 'repair-policy-before-admission'
  | 'resynthesize-for-demand'
  | 'withhold-critical-source';

export interface DepositorEarningSupplyIntelligenceInput {
  policyReport: DepositAssetPackOptionPolicyReport;
  unfitNeedOpportunitySignals?: DepositOptionDemandSignal[] | null;
  createdAt?: string | null;
  /**
   * When true (or when no demand signals and no settled estimate), likely demand
   * and compensation are marked unestimatable rather than inventing placeholders.
   */
  demandUnestimatable?: boolean | null;
  demandUnestimatableRationale?: string | null;
  /** Settled-corpus demand 0..1 when estimatable; ignored when unestimatable. */
  settledDemand?: number | null;
  settledPackCount?: number | null;
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
