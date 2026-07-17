/**
 * Deposit route session types and step catalog (pure shapes, no builders).
 *
 * Builders and source-safety assertions live in deposit-route-model.ts.
 * Import types from either file — deposit-route-model re-exports these.
 */

import type { DepositAssetPackOptionSynthesis } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-options";
import type { DepositAssetPackOptionPolicyReport } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-policy";
import type {
  DepositAssetPackOptionAdmissionReport,
  DepositOptionReviewDecision,
} from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-admission";
import type { DepositorEarningSupplyIntelligence } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/depositor-earning-supply-intelligence";
import type {
  OrganizationPolicyWalletAuthority,
  OrganizationPolicyWalletAuthorityInput,
} from "@bitcode/asset-packs-pipelines-domain/organization-policy-wallet-authority";
import type {
  DepositOptionDemandSignal,
  DepositOptionSynthesisRequest,
} from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-options";
import type { DepositOptionCriticalitySignal } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-policy";

export type DepositRouteStepId =
  | "connect-source"
  | "synthesize-options"
  | "review-options"
  | "submit-deposit"
  | "read-depository-state";

export type DepositRouteStepState = "complete" | "current" | "blocked" | "ready";

export interface DepositRouteSessionInput extends DepositOptionSynthesisRequest {
  depositStage?: DepositRouteStepId | null;
  transactionId?: string | null;
  /**
   * Real synthesis from the AssetPacksSynthesis pipeline (deposit lens),
   * produced server-side by POST /api/deposit/synthesize-options. When
   * present it replaces the deterministic blueprint synthesis (V48 Gate 2,
   * QA ledger F12).
   */
  precomputedOptionSynthesis?: DepositAssetPackOptionSynthesis | null;
  sourceCriticalitySignals?: DepositOptionCriticalitySignal[] | null;
  unfitNeedOpportunitySignals?: DepositOptionDemandSignal[] | null;
  /** Settled Depository AssetPack demand estimate (search-grounded). */
  settledDemandEstimate?: {
    estimatable: boolean;
    demand: number | null;
    saturation?: number | null;
    settledPackCount?: number | null;
    matchedPackCount?: number | null;
    rationale?: string | null;
  } | null;
  developmentCostSats?: number | null;
  expectedSettlementSats?: number | null;
  depositorWalletId?: string | null;
  depositApproved?: boolean | null;
  depositLimitSats?: number | null;
  sourceCriticalityApproved?: boolean | null;
  actorId?: string | null;
  organizationId?: string | null;
  teamId?: string | null;
  memberId?: string | null;
  organizationRole?: OrganizationPolicyWalletAuthorityInput["organizationRole"];
  organizationPermissionGrants?: string[] | null;
  organizationPolicyId?: string | null;
  organizationPolicyHash?: string | null;
  walletAuthorityPresent?: boolean | null;
  optionReviewDecisions?: DepositOptionReviewDecision[] | null;
  reviewerId?: string | null;
  hasRepositorySource?: boolean;
  optionsRequested?: boolean;
  hasReviewedOption?: boolean;
  hasSubmittedDeposit?: boolean;
  hasDepositoryReadback?: boolean;
}

export interface DepositRouteStep {
  id: DepositRouteStepId;
  label: string;
  state: DepositRouteStepState;
  lowDetailGuidance: string;
  blockers: string[];
}

export interface DepositRouteSession {
  schema: "bitcode.deposit.route-session";
  route: "/deposits";
  stageCount: 5;
  activeStepId: DepositRouteStepId;
  steps: DepositRouteStep[];
  routeState: {
    transactionId: string | null;
    depositStage: DepositRouteStepId | null;
    repositoryFullName: string | null;
    sourceBranch: string | null;
    sourceCommit: string | null;
  };
  pipelineOwnership: {
    depositOptionPipeline: "DepositAssetPackOptionSynthesis";
    depositOptionPolicy: "DepositAssetPackOptionPolicy";
    depositOptionAdmission: "DepositAssetPackOptionAdmissionReport";
    depositorEarningSupplyIntelligence: "DepositorEarningSupplyIntelligence";
    reviewRequiredBeforeDepositAdmission: true;
    sourceCriticalityDemandRoiPolicyPresent: true;
    sourceCriticalityDemandRoiPolicySourceSafe: true;
    admissionAndIndexingPolicyPresent: true;
    retainedPipelineDebugCompatible: true;
  };
  synthesis: DepositAssetPackOptionSynthesis;
  policy: DepositAssetPackOptionPolicyReport;
  admission: DepositAssetPackOptionAdmissionReport;
  earningSupplyIntelligence: DepositorEarningSupplyIntelligence;
  organizationPolicyWalletAuthority: OrganizationPolicyWalletAuthority;
  disclosure: {
    sourceSafetyClass: "source_safe_deposit_option_route_metadata";
    lowDetailDefault: true;
    expandableSourceSafeDetail: true;
    protectedSourceVisible: false;
    rawSourceTextVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawPromptVisible: false;
    interpolatedPromptVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
  };
  proofRoot: string;
}

export const DEPOSIT_ROUTE_STEPS: Array<{
  id: DepositRouteStepId;
  label: string;
  lowDetailGuidance: string;
}> = [
  {
    id: "connect-source",
    label: "Connect source",
    lowDetailGuidance:
      "Select repository, branch, commit, and source scope for candidate AssetPack option synthesis.",
  },
  {
    id: "synthesize-options",
    label: "Synthesize AssetPack options",
    lowDetailGuidance:
      "Use source-safe repository context plus demand signals to propose multiple options.",
  },
  {
    id: "review-options",
    label: "Review source-safe options",
    lowDetailGuidance:
      "Inspect measurements, demand posture, and policy boundaries without exposing protected source.",
  },
  {
    id: "submit-deposit",
    label: "Submit deposit",
    lowDetailGuidance:
      "Record approved source supply with wallet and repository readiness through the existing deposit composer.",
  },
  {
    id: "read-depository-state",
    label: "Read depository state",
    lowDetailGuidance:
      "Reread proof roots, searchability, compensation preview, and indexing posture from activity state.",
  },
];

export const DEPOSIT_ROUTE_STAGE_IDS = DEPOSIT_ROUTE_STEPS.map(
  (step) => step.id,
);
