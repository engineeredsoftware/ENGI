/**
 * Deposit AssetPack option policy evaluation types.
 *
 * Criticality, demand, ROI, BTD potential, and compensation route contracts
 * for source-safe depositor review — no builders.
 */

import type { DepositAssetPackOption, DepositAssetPackOptionSynthesis } from './deposit-asset-pack-options-types';

export type DepositOptionCriticalityState =
  | 'sub-critical'
  | 'review-warning'
  | 'blocked-critical-source';

export type DepositOptionDemandState =
  | 'strong-likely-demand'
  | 'moderate-likely-demand'
  | 'weak-likely-demand'
  | 'unestimatable-demand';

export type DepositOptionRoiState =
  | 'positive-expected-value'
  | 'marginal-expected-value'
  | 'negative-expected-value'
  | 'blocked-criticality';

export type DepositOptionBtdPotentialState =
  | 'high-potential'
  | 'moderate-potential'
  | 'low-potential'
  | 'blocked-until-policy-repair';

export type DepositOptionCompensationState =
  | 'eligible-if-approved-and-selected'
  | 'repair-required-before-compensation'
  | 'blocked-before-compensation';

export interface DepositOptionCriticalitySignal {
  id?: string | null;
  label?: string | null;
  severity?: 'sub-critical' | 'warning' | 'critical' | null;
  weight?: number | null;
}

export interface DepositAssetPackOptionPolicyInput {
  synthesis: DepositAssetPackOptionSynthesis;
  sourceCriticalitySignals?: DepositOptionCriticalitySignal[] | null;
  developmentCostSats?: number | null;
  expectedSettlementSats?: number | null;
  depositorWalletId?: string | null;
  createdAt?: string | null;
  /** Ground demand in settled Depository AssetPack search; unestimatable fails closed. */
  settledDemand?: { estimatable: boolean; demand: number | null } | null;
}

export interface DepositAssetPackOptionPolicyEvaluation {
  schema: 'bitcode.deposit.asset-pack-option-policy-evaluation';
  optionId: string;
  optionKind: DepositAssetPackOption['kind'];
  title: string;
  policyDecision:
    | 'reviewable-positive-roi'
    | 'review-warning-before-admission'
    | 'blocked-before-admission';
  sourceCriticality: {
    state: DepositOptionCriticalityState;
    score: number;
    signalRoots: string[];
    blockers: string[];
    warnings: string[];
  };
  demand: {
    state: DepositOptionDemandState;
    confidence: number;
    weightedDemand: number;
    demandRoot: string;
  };
  roi: {
    state: DepositOptionRoiState;
    estimatedGrossSats: number;
    estimatedDevelopmentCostSats: number;
    expectedNetSats: number;
    roiMultiple: number;
    roiRoot: string;
  };
  btdPotential: {
    state: DepositOptionBtdPotentialState;
    estimatedKnowledgeVolume: number;
    estimatedBtdCells: number;
    estimateOnly: true;
    btdMintBoundary: 'not-minted-until-future-need-fit-settlement';
    rightsBoundary: 'depositor-retains-rights-until-paid-reader-settlement-transfer';
    btdPotentialRoot: string;
  };
  compensation: {
    state: DepositOptionCompensationState;
    payer: 'future-reader-after-settlement';
    payee: 'depositing-wallet';
    priceAsset: 'BTC';
    allocationMethod: 'source-to-shares-largest-remainder';
    depositorShareBasisPoints: number;
    protocolTreasuryBasisPoints: number;
    sourceToSharesProofState: 'not-created-until-accepted-need-fit-and-settlement';
    eligibleIfApprovedAndSelected: boolean;
    blockers: string[];
    warnings: string[];
    compensationRouteRoot: string;
  };
  admissionBoundary: {
    depositApprovalRequired: true;
    admissionAndIndexingOwnedBy: 'future-gate7-deposit-option-review';
    sourceBearingDisclosureBeforeSettlementVisible: false;
  };
  visibility: {
    sourceSafeMetadataOnly: true;
    protectedSourceVisible: false;
    rawSourceTextVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
  };
  roots: {
    policyEvaluationRoot: string;
    sourceCriticalityRoot: string;
    demandRoot: string;
    roiRoot: string;
    btdPotentialRoot: string;
    compensationRouteRoot: string;
  };
}

export interface DepositAssetPackOptionPolicyReport {
  schema: 'bitcode.deposit.asset-pack-option-policy-report';
  policy: 'DepositAssetPackOptionPolicy';
  reportId: string;
  createdAt: string;
  route: '/deposits';
  synthesisRequestId: string;
  optionCount: number;
  reviewablePositiveRoiCount: number;
  warningCount: number;
  blockedCount: number;
  evaluations: DepositAssetPackOptionPolicyEvaluation[];
  aggregatePolicy: {
    criticalityPolicy: 'source-safe-criticality-signals-with-depositor-review';
    demandPolicy: 'weighted-depository-reading-and-existing-supply-signals';
    roiPolicy: 'deterministic-estimated-gross-minus-development-cost';
    compensationPolicy: 'future-reader-btc-source-to-shares-route-preview';
    admissionAndIndexingOwnedBy: 'future-gate7-deposit-option-review';
  };
  sourceSafety: {
    sourceSafeMetadataOnly: true;
    protectedSourceVisible: false;
    rawSourceTextVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
  };
  roots: {
    policyReportRoot: string;
    synthesisRoot: string;
    evaluationRoots: string[];
    aggregatePolicyRoot: string;
  };
}
