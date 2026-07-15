/**
 * Read route session types — pure shapes for procurement, fit measurement, settlement, session.
 * Builders live in sibling modules; re-exported from read-route-model.ts for stable imports.
 */

import type {
  TerminalEnterpriseReadingForbiddenField,
  EnterpriseReadingStepId,
  TerminalEnterpriseReadingStepView,
  EnterpriseReadingUxStateInput,
} from '@/components/reads/models/enterprise-reading-ux-state';
import type {
  OrganizationPolicyWalletAuthority,
  OrganizationPolicyWalletAuthorityInput,
} from '@bitcode/asset-packs-pipelines-domain/organization-policy-wallet-authority';

export type ReadRouteStepId = EnterpriseReadingStepId;

export type ReadRouteSessionInput = EnterpriseReadingUxStateInput & {
  repositoryFullName?: string | null;
  sourceBranch?: string | null;
  sourceCommit?: string | null;
  readNeedId?: string | null;
  assetPackPreviewId?: string | null;
  settlementQuoteId?: string | null;
  budgetEnvelopeSats?: number | null;
  approvalThresholdSats?: number | null;
  quoteSats?: number | null;
  quoteIssuedAt?: string | null;
  quoteExpiresAt?: string | null;
  quoteObservedAt?: string | null;
  procurementApproved?: boolean;
  buyerAuthorized?: boolean;
  walletAuthorityPresent?: boolean;
  walletId?: string | null;
  actorId?: string | null;
  organizationId?: string | null;
  teamId?: string | null;
  memberId?: string | null;
  organizationRole?: OrganizationPolicyWalletAuthorityInput['organizationRole'];
  organizationPermissionGrants?: string[] | null;
  organizationPolicyId?: string | null;
  organizationPolicyHash?: string | null;
  spendLimitSats?: number | null;
  measuredBtd?: number | null;
  selectedFitIds?: string[] | null;
  paymentObserved?: boolean;
  finalityConfirmed?: boolean;
  rightsTransferred?: boolean;
  deliveryMaterialized?: boolean;
  deliveryPullRequestReference?: string | null;
};

export type ReadFitMeasurementVisualizationId =
  | 'need-coverage'
  | 'specificity'
  | 'novelty'
  | 'reuse'
  | 'risk'
  | 'evidence'
  | 'fit-confidence'
  | 'delivery-readiness';

export type ReadFitMeasurementRow = {
  measurementId:
    | 'coverage-measurement'
    | 'specificity-measurement'
    | 'novelty-measurement'
    | 'reuse-measurement'
    | 'risk-measurement'
    | 'evidence-measurement'
    | 'fit-measurement'
    | 'delivery-measurement';
  visualizationId: ReadFitMeasurementVisualizationId;
  label: string;
  measurementVolume: number;
  confidence: number;
  riskAdjustment: number;
  weight: number;
  normalizedContribution: number;
};

export type ReadFitMeasurementReview = {
  schema: 'bitcode.read.fit-measurement-review';
  visible: boolean;
  measurements: ReadFitMeasurementRow[];
  selectedFitProvenance: {
    fitIds: string[];
    depositoryAssetPackCount: number;
    provenanceRoot: string;
  };
  btdScalarVolume: number;
  quoteBasis: {
    measurementWeight: number;
    btdScalarVolume: number;
    pricePerWeightedUnitSats: number;
    grossSats: number;
    feeAsset: 'BTC';
    network: 'btc-testnet';
    deterministic: true;
    basisRoot: string;
  };
  repairBlockers: string[];
  reviewRoot: string;
};

export type ReadSettlementRightsDelivery = {
  schema: 'bitcode.read.settlement-rights-delivery';
  network: 'btc-testnet';
  valueBearingMainnetEnabled: false;
  paymentObservation: {
    state: 'awaiting-payment' | 'btc-testnet-payment-observed';
    observationRoot: string;
  };
  finality: {
    state: 'awaiting-finality' | 'btc-testnet-finality-confirmed';
    finalityRoot: string;
  };
  btdRights: {
    state: 'rights-pending' | 'btd-rights-transferred';
    rightsReceiptRoot: string;
  };
  delivery: {
    state: 'delivery-locked' | 'repository-pr-delivery-materialized';
    pullRequestReference: string | null;
    deliveryReceiptRoot: string;
  };
  guards: {
    btcFinalityBeforeBtdRights: true;
    btdRightsBeforeSourceDelivery: true;
  };
  blockers: string[];
  readbackRoot: string;
};

export type ReadProcurementBudgetState =
  | 'awaiting-quote'
  | 'within-budget'
  | 'approval-required'
  | 'exceeded';

export type ReadProcurementQuoteState =
  | 'awaiting-preview'
  | 'quoted'
  | 'expired'
  | 'approved'
  | 'blocked';

export type ReadProcurementSettlementReadiness =
  | 'awaiting-preview'
  | 'awaiting-approval'
  | 'awaiting-buyer-authority'
  | 'awaiting-wallet-authority'
  | 'ready-for-testnet-settlement'
  | 'blocked-budget'
  | 'blocked-expired-quote';

export type ReadProcurementGovernance = {
  schema: 'bitcode.read.procurement-governance';
  budgetPolicy: {
    policyId: string;
    budgetEnvelopeSats: number;
    approvalThresholdSats: number;
    quoteSats: number;
    state: ReadProcurementBudgetState;
    approvalRequired: boolean;
    policyRoot: string;
  };
  quotePolicy: {
    quoteId: string | null;
    state: ReadProcurementQuoteState;
    feeAsset: 'BTC';
    pricingVersion: 'measurement-weight-volume';
    issuedAt: string | null;
    expiresAt: string | null;
    quoteRoot: string;
    shareToFee: {
      measurementWeight: number;
      measurementVolume: number;
      pricePerWeightedUnitSats: number;
      grossSats: number;
      deterministic: true;
      calculationRoot: string;
    };
  };
  approval: {
    buyerAuthorized: boolean;
    walletAuthorityPresent: boolean;
    procurementApproved: boolean;
    approvalRoot: string;
  };
  settlement: {
    readiness: ReadProcurementSettlementReadiness;
    btcBtdSettlementReady: boolean;
    blockers: string[];
    readinessRoot: string;
  };
  prePurchaseReview: {
    sourceSafePreviewVisible: boolean;
    protectedSourceVisible: false;
    unpaidAssetPackSourceVisible: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
    reviewRoot: string;
  };
};

export type ReadRouteSession = {
  schema: 'bitcode.read.route-session';
  route: '/reads';
  stageCount: 5;
  activeStepId: ReadRouteStepId;
  steps: TerminalEnterpriseReadingStepView[];
  readObjects: {
    readRequestRecorded: boolean;
    synthesizedNeedReviewed: boolean;
    acceptedNeedPresent: boolean;
    findingFitsRequested: boolean;
    sourceSafeAssetPackPreviewPresent: boolean;
    settlementQuotePresent: boolean;
    deliveryUnlocked: boolean;
  };
  routeState: {
    transactionId: string | null;
    readingStage: ReadRouteStepId | null;
    repositoryFullName: string | null;
    sourceBranch: string | null;
    sourceCommit: string | null;
    readNeedId: string | null;
    assetPackPreviewId: string | null;
    settlementQuoteId: string | null;
  };
  pipelineOwnership: {
    readNeedPipeline: 'ReadNeedComprehensionSynthesis';
    findingFitsPipeline: 'ReadFitsFindingSynthesis';
    acceptedNeedRequiredBeforeFindingFits: true;
    previewSourceSafeBeforeSettlement: true;
    deliveryRequiresPaidReadRights: true;
    retainedTerminalDebugCompatible: true;
  };
  procurementGovernance: ReadProcurementGovernance;
  fitMeasurementReview: ReadFitMeasurementReview;
  settlementRightsDelivery: ReadSettlementRightsDelivery;
  organizationPolicyWalletAuthority: OrganizationPolicyWalletAuthority;
  disclosure: {
    sourceSafetyClass: 'source_safe_read_route_metadata';
    lowDetailDefault: true;
    expandableSourceSafeDetail: true;
    protectedSourceVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
    settlementPrivatePayloadVisible: false;
    hiddenBeforeSettlement: TerminalEnterpriseReadingForbiddenField[];
  };
  proofRoot: string;
};
