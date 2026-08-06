/**
 * Deposit route session builders and source-safety assertion.
 *
 * Types and step catalog: deposit-route-session-types.ts (re-exported here so
 * existing imports from deposit-route-model stay stable).
 */

import {
  assertDepositAssetPackOptionSynthesisSourceSafe,
  buildDepositAssetPackOptionSynthesis,
} from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-options";
import {
  assertDepositAssetPackOptionPolicyReportSourceSafe,
  buildDepositAssetPackOptionPolicyReport,
} from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-policy";
import {
  assertDepositAssetPackOptionAdmissionReportSourceSafe,
  buildDepositAssetPackOptionAdmissionReport,
} from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-admission";
import {
  assertDepositorEarningSupplyIntelligenceSourceSafe,
  buildDepositorEarningSupplyIntelligence,
} from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/depositor-earning-supply-intelligence";
import {
  assertOrganizationPolicyWalletAuthoritySourceSafe,
  buildOrganizationPolicyWalletAuthority,
} from "@bitcode/asset-packs-pipelines-domain/organization-policy-wallet-authority";

import {
  DEPOSIT_ROUTE_STAGE_IDS,
  DEPOSIT_ROUTE_STEPS,
  type DepositRouteSession,
  type DepositRouteSessionInput,
  type DepositRouteStepId,
  type DepositRouteStepState,
} from "./deposit-route-session-types";

export type {
  DepositRouteStepId,
  DepositRouteStepState,
  DepositRouteSessionInput,
  DepositRouteStep,
  DepositRouteSession,
} from "./deposit-route-session-types";
export { DEPOSIT_ROUTE_STEPS, DEPOSIT_ROUTE_STAGE_IDS } from "./deposit-route-session-types";

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function normalizedText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function hasReviewDecision(input: DepositRouteSessionInput) {
  return Boolean(
    input.hasReviewedOption ||
      input.optionReviewDecisions?.some(
        (decision) => decision.decision !== "pending-depositor-review",
      ),
  );
}

function resolveActiveStep(
  input: DepositRouteSessionInput,
  admittedCount = 0,
): DepositRouteStepId {
  if (input.depositStage && DEPOSIT_ROUTE_STAGE_IDS.includes(input.depositStage))
    return input.depositStage;
  if (input.hasDepositoryReadback) return "read-depository-state";
  if (input.hasSubmittedDeposit || admittedCount > 0) return "submit-deposit";
  if (hasReviewDecision(input)) return "review-options";
  if (input.optionsRequested || input.hasRepositorySource)
    return "synthesize-options";
  return "connect-source";
}

function stepState(
  input: DepositRouteSessionInput,
  stepId: DepositRouteStepId,
  activeStepId: DepositRouteStepId,
  admittedCount: number,
): DepositRouteStepState {
  const reviewed = hasReviewDecision(input);
  const submitted = Boolean(input.hasSubmittedDeposit || admittedCount > 0);
  if (stepId === activeStepId) return "current";
  if (stepId === "connect-source")
    return input.hasRepositorySource ? "complete" : "ready";
  if (stepId === "synthesize-options")
    return input.optionsRequested
      ? "complete"
      : input.hasRepositorySource
        ? "ready"
        : "blocked";
  if (stepId === "review-options")
    return reviewed ? "complete" : input.optionsRequested ? "ready" : "blocked";
  if (stepId === "submit-deposit")
    return submitted ? "complete" : reviewed ? "ready" : "blocked";
  return input.hasDepositoryReadback
    ? "complete"
    : submitted
      ? "ready"
      : "blocked";
}

function stepBlockers(
  input: DepositRouteSessionInput,
  stepId: DepositRouteStepId,
  admittedCount: number,
): string[] {
  const blockers: string[] = [];
  const reviewed = hasReviewDecision(input);
  const submitted = Boolean(input.hasSubmittedDeposit || admittedCount > 0);
  if (stepId !== "connect-source" && !input.hasRepositorySource)
    blockers.push("repository source required");
  if (
    ["review-options", "submit-deposit", "read-depository-state"].includes(
      stepId,
    ) &&
    !input.optionsRequested
  ) {
    blockers.push("deposit AssetPack options required");
  }
  if (
    ["submit-deposit", "read-depository-state"].includes(stepId) &&
    !reviewed
  ) {
    blockers.push("depositor option review required");
  }
  if (
    ["submit-deposit", "read-depository-state"].includes(stepId) &&
    reviewed &&
    admittedCount === 0
  ) {
    blockers.push("approved admissible option required");
  }
  if (stepId === "read-depository-state" && !submitted)
    blockers.push("submitted deposit required");
  return blockers;
}

export function readDepositRouteStage(
  params: URLSearchParams,
): DepositRouteStepId | null {
  const stage = params.get("depositStage")?.trim();
  return DEPOSIT_ROUTE_STAGE_IDS.includes(stage as DepositRouteStepId)
    ? (stage as DepositRouteStepId)
    : null;
}

export function writeDepositRouteStage(
  params: URLSearchParams,
  stage: DepositRouteStepId | null,
) {
  const next = new URLSearchParams(params.toString());
  if (stage) next.set("depositStage", stage);
  else next.delete("depositStage");
  return next;
}

export function buildDepositRouteSession(
  input: DepositRouteSessionInput = {},
): DepositRouteSession {
  const repositoryFullName = normalizedText(input.repositoryFullName);
  const sourceBranch = normalizedText(input.sourceBranch);
  const sourceCommit = normalizedText(input.sourceCommit);
  // Prefer the real AssetPacksSynthesis (deposit lens) result when the
  // server has produced one; the deterministic blueprint synthesis remains
  // only as the explicit bring-up fallback (V48 Gate 2, QA ledger F12).
  const synthesis =
    input.precomputedOptionSynthesis &&
    input.precomputedOptionSynthesis.request.repositoryFullName ===
      repositoryFullName
      ? input.precomputedOptionSynthesis
      : buildDepositAssetPackOptionSynthesis({
          repositoryFullName,
          sourceBranch,
          sourceCommit,
          obfuscations: input.obfuscations,
          permissibleSources: input.permissibleSources,
          depositoryDemandSignals: input.depositoryDemandSignals,
          readingDemandSignals: input.readingDemandSignals,
          existingDepositorySignals: input.existingDepositorySignals,
          createdAt: input.createdAt,
        });
  const settledDemand = input.settledDemandEstimate
    ? {
        estimatable: input.settledDemandEstimate.estimatable === true,
        demand:
          typeof input.settledDemandEstimate.demand === "number"
            ? input.settledDemandEstimate.demand
            : null,
      }
    : // No settled-corpus estimate provided → fail closed (do not invent demand).
      { estimatable: false, demand: null };
  const policy = buildDepositAssetPackOptionPolicyReport({
    synthesis,
    sourceCriticalitySignals: input.sourceCriticalitySignals,
    developmentCostSats: input.developmentCostSats,
    // Provisional settlement for ROI ranking even when demand is unestimatable;
    // earnings intelligence still zeros compensation ranges when unestimatable.
    expectedSettlementSats: input.expectedSettlementSats,
    depositorWalletId: input.depositorWalletId,
    createdAt: input.createdAt,
    settledDemand,
  });
  const admission = buildDepositAssetPackOptionAdmissionReport({
    synthesis,
    policy,
    decisions: input.optionReviewDecisions,
    reviewerId: input.reviewerId,
    telemetryRunId: normalizedText(input.transactionId),
    createdAt: input.createdAt,
  });
  const earningSupplyIntelligence = buildDepositorEarningSupplyIntelligence({
    policyReport: policy,
    unfitNeedOpportunitySignals:
      settledDemand.estimatable === false
        ? []
        : input.unfitNeedOpportunitySignals,
    createdAt: input.createdAt,
    demandUnestimatable: settledDemand.estimatable === false,
    demandUnestimatableRationale:
      input.settledDemandEstimate?.rationale ||
      "Unestimatable: settled Depository DataPack demand has not been measured.",
    settledDemand: settledDemand.demand,
    settledPackCount: input.settledDemandEstimate?.settledPackCount ?? null,
  });
  const sourceCriticalityState =
    policy.blockedCount > 0
      ? "blocked-critical-source"
      : policy.warningCount > 0
        ? "review-warning"
        : "sub-critical";
  const depositApproved =
    input.depositApproved === true ||
    admission.approvedCount > 0 ||
    admission.admittedCount > 0 ||
    Boolean(input.hasSubmittedDeposit);
  const organizationPolicyWalletAuthority =
    buildOrganizationPolicyWalletAuthority({
      route: "/deposits",
      actorId: normalizedText(input.actorId) || normalizedText(input.reviewerId),
      organizationId: normalizedText(input.organizationId),
      teamId: normalizedText(input.teamId),
      memberId: normalizedText(input.memberId),
      organizationRole: input.organizationRole || null,
      organizationPermissionGrants: input.organizationPermissionGrants || null,
      policyId: normalizedText(input.organizationPolicyId),
      policyHash: normalizedText(input.organizationPolicyHash),
      walletId: normalizedText(input.depositorWalletId),
      walletAuthorityPresent:
        input.walletAuthorityPresent ?? Boolean(input.depositorWalletId),
      sourceCriticalityState,
      sourceCriticalityApproved:
        input.sourceCriticalityApproved ?? policy.blockedCount === 0,
      depositApproved,
      expectedSettlementSats: input.expectedSettlementSats,
      depositLimitSats: input.depositLimitSats,
      accountAdmitted: Boolean(
        input.actorId || input.reviewerId || repositoryFullName,
      ),
      interfaceAdmitted: true,
      targetAnchor:
        normalizedText(input.transactionId) || repositoryFullName || "/deposits",
      createdAt: input.createdAt,
    });
  const activeStepId = resolveActiveStep(input, admission.admittedCount);
  const steps = DEPOSIT_ROUTE_STEPS.map((step) => ({
    ...step,
    state: stepState(input, step.id, activeStepId, admission.admittedCount),
    blockers: stepBlockers(input, step.id, admission.admittedCount),
  }));
  const seed = JSON.stringify({
    transactionId: normalizedText(input.transactionId),
    activeStepId,
    repositoryFullName,
    sourceBranch,
    sourceCommit,
    synthesisRoot: synthesis.roots.synthesisRoot,
    policyReportRoot: policy.roots.policyReportRoot,
    admissionReportRoot: admission.roots.admissionReportRoot,
    earningSupplyIntelligenceRoot:
      earningSupplyIntelligence.roots.intelligenceRoot,
    organizationPolicyWalletAuthorityRoot:
      organizationPolicyWalletAuthority.roots.authorityRoot,
    steps: steps.map((step) => ({
      id: step.id,
      state: step.state,
      blockers: step.blockers,
    })),
  });

  return {
    schema: "bitcode.deposit.route-session",
    route: "/deposits",
    stageCount: 5,
    activeStepId,
    steps,
    routeState: {
      transactionId: normalizedText(input.transactionId),
      depositStage: input.depositStage || null,
      repositoryFullName,
      sourceBranch,
      sourceCommit,
    },
    pipelineOwnership: {
      depositOptionPipeline: "DepositAssetPackOptionSynthesis",
      depositOptionPolicy: "DepositAssetPackOptionPolicy",
      depositOptionAdmission: "DepositAssetPackOptionAdmissionReport",
      depositorEarningSupplyIntelligence: "DepositorEarningSupplyIntelligence",
      reviewRequiredBeforeDepositAdmission: true,
      sourceCriticalityDemandRoiPolicyPresent: true,
      sourceCriticalityDemandRoiPolicySourceSafe: true,
      admissionAndIndexingPolicyPresent: true,
      retainedPipelineDebugCompatible: true,
    },
    synthesis,
    policy,
    admission,
    earningSupplyIntelligence,
    organizationPolicyWalletAuthority,
    disclosure: {
      sourceSafetyClass: "source_safe_deposit_option_route_metadata",
      lowDetailDefault: true,
      expandableSourceSafeDetail: true,
      protectedSourceVisible: false,
      rawSourceTextVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
    },
    proofRoot: `deposit-route-session:${stableHash(seed)}`,
  };
}

export function assertDepositRouteSessionSourceSafe(
  session: DepositRouteSession,
) {
  const synthesisSafety = assertDepositAssetPackOptionSynthesisSourceSafe(
    session.synthesis,
  );
  const policySafety = assertDepositAssetPackOptionPolicyReportSourceSafe(
    session.policy,
  );
  const admissionSafety =
    assertDepositAssetPackOptionAdmissionReportSourceSafe(session.admission);
  const earningSupplySafety =
    assertDepositorEarningSupplyIntelligenceSourceSafe(
      session.earningSupplyIntelligence,
    );
  const organizationSafety = assertOrganizationPolicyWalletAuthoritySourceSafe(
    session.organizationPolicyWalletAuthority,
  );
  const sourceSafe =
    synthesisSafety.admitted &&
    policySafety.admitted &&
    admissionSafety.admitted &&
    earningSupplySafety.admitted &&
    organizationSafety.admitted &&
    session.schema === "bitcode.deposit.route-session" &&
    session.route === "/deposits" &&
    session.stageCount === 5 &&
    session.pipelineOwnership.depositOptionPipeline ===
      "DepositAssetPackOptionSynthesis" &&
    session.pipelineOwnership.depositOptionPolicy ===
      "DepositAssetPackOptionPolicy" &&
    session.pipelineOwnership.depositOptionAdmission ===
      "DepositAssetPackOptionAdmissionReport" &&
    session.pipelineOwnership.depositorEarningSupplyIntelligence ===
      "DepositorEarningSupplyIntelligence" &&
    session.pipelineOwnership.reviewRequiredBeforeDepositAdmission === true &&
    session.earningSupplyIntelligence.schema ===
      "bitcode.deposit.earning-supply-intelligence" &&
    session.earningSupplyIntelligence.disclosure.sourceSafeMetadataOnly ===
      true &&
    session.earningSupplyIntelligence.disclosure.protectedSourceVisible ===
      false &&
    session.earningSupplyIntelligence.disclosure.rawSourceTextVisible ===
      false &&
    session.earningSupplyIntelligence.disclosure
      .unpaidAssetPackSourceVisible === false &&
    session.earningSupplyIntelligence.disclosure.walletPrivateMaterialVisible ===
      false &&
    session.earningSupplyIntelligence.disclosure
      .settlementPrivatePayloadVisible === false &&
    session.pipelineOwnership.sourceCriticalityDemandRoiPolicyPresent ===
      true &&
    session.pipelineOwnership.sourceCriticalityDemandRoiPolicySourceSafe ===
      true &&
    session.pipelineOwnership.admissionAndIndexingPolicyPresent === true &&
    session.organizationPolicyWalletAuthority.schema ===
      "bitcode.organization.policy-wallet-authority" &&
    session.organizationPolicyWalletAuthority.route === "/deposits" &&
    session.organizationPolicyWalletAuthority.disclosure
      .sourceSafeMetadataOnly === true &&
    session.organizationPolicyWalletAuthority.disclosure
      .protectedSourceVisible === false &&
    session.organizationPolicyWalletAuthority.disclosure
      .walletPrivateMaterialVisible === false &&
    session.disclosure.sourceSafetyClass ===
      "source_safe_deposit_option_route_metadata" &&
    session.disclosure.protectedSourceVisible === false &&
    session.disclosure.rawSourceTextVisible === false &&
    session.disclosure.unpaidAssetPackSourceVisible === false &&
    session.disclosure.rawPromptVisible === false &&
    session.disclosure.interpolatedPromptVisible === false &&
    session.disclosure.rawProviderResponseVisible === false &&
    session.disclosure.walletPrivateMaterialVisible === false;

  return {
    admitted: sourceSafe,
    reason: sourceSafe
      ? "source_safe_deposit_option_route_metadata"
      : "deposit_route_source_safety_boundary_violation",
  };
}
