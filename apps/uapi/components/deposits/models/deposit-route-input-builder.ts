/**
 * Builds DepositRouteSessionInput from live deposit page state.
 *
 * Keeps provisional ROI/settlement heuristics and organization/wallet authority
 * wiring out of the page client so the client only owns React state + IO.
 */

import type { DepositOptionReviewDecision } from "@bitcode/asset-packs-pipelines-domain/deposit-asset-pack-option-admission";
import type { DepositOptionCriticalitySignal } from "@bitcode/asset-packs-pipelines-domain/deposit-asset-pack-option-policy";
import type { ProductRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import type { DepositRouteSession } from "@/components/deposits/models/deposit-route-model";
import type { DepositRouteStepId } from "@/components/deposits/models/deposit-route-model";
import type {
  DepositSettledDemandEstimate,
  DepositSettledDemandSignals,
} from "@/components/deposits/models/deposit-settled-demand";

export type BuildDepositRouteInputArgs = {
  transactionId: string | null;
  depositStage: DepositRouteStepId | null | undefined;
  repositoryContext: ProductRepositoryContextState | null;
  obfuscations: string;
  forcedInclusions: string[];
  settledDemandSignals: DepositSettledDemandSignals;
  settledDemandEstimate: DepositSettledDemandEstimate | null;
  sourceCriticalitySignals: DepositOptionCriticalitySignal[];
  preferredSignerAddress: string | null;
  hasVerifiedWalletConnection: boolean;
  hasValidGitHubConnection: boolean;
  actorId: string | null;
  optionsRequested: boolean;
  precomputedOptionSynthesis: DepositRouteSession["synthesis"] | null;
  hasReviewedOption: boolean;
  hasSubmittedDeposit: boolean;
  hasDepositoryReadback: boolean;
  liveRunsLength: number;
};

/**
 * Assemble the input object consumed by `buildDepositRouteSession`.
 * Expected settlement sats remain provisional ranking aids only; earnings
 * display still shows Unestimatable when demand is not estimatable.
 */
export function buildDepositRouteInput(args: BuildDepositRouteInputArgs) {
  const {
    transactionId,
    depositStage,
    repositoryContext,
    obfuscations,
    forcedInclusions,
    settledDemandSignals,
    settledDemandEstimate,
    sourceCriticalitySignals,
    preferredSignerAddress,
    hasVerifiedWalletConnection,
    hasValidGitHubConnection,
    actorId,
    optionsRequested,
    precomputedOptionSynthesis,
    hasReviewedOption,
    hasSubmittedDeposit,
    hasDepositoryReadback,
    liveRunsLength,
  } = args;

  return {
    transactionId,
    depositStage,
    repositoryFullName:
      repositoryContext?.selectedRepository?.fullName || null,
    sourceBranch: repositoryContext?.selectedBranch || null,
    sourceCommit: repositoryContext?.selectedCommit || null,
    obfuscations,
    forcedInclusions,
    depositoryDemandSignals: settledDemandSignals.depositoryDemandSignals,
    readingDemandSignals: settledDemandSignals.readingDemandSignals,
    existingDepositorySignals: settledDemandSignals.existingDepositorySignals,
    unfitNeedOpportunitySignals:
      settledDemandSignals.unfitNeedOpportunitySignals,
    settledDemandEstimate: settledDemandEstimate
      ? {
          estimatable: settledDemandEstimate.estimatable,
          demand: settledDemandEstimate.demand,
          saturation: settledDemandEstimate.saturation,
          settledPackCount: settledDemandEstimate.settledPackCount,
          matchedPackCount: settledDemandEstimate.matchedPackCount,
          rationale: settledDemandEstimate.rationale,
        }
      : {
          estimatable: false,
          demand: null,
          settledPackCount: 0,
          rationale:
            "Unestimatable: settled Depository demand has not been measured yet.",
        },
    sourceCriticalitySignals,
    developmentCostSats: Math.max(1600, 1200 + forcedInclusions.length * 240),
    expectedSettlementSats:
      settledDemandEstimate?.estimatable &&
      typeof settledDemandEstimate.demand === "number"
        ? Math.max(
            1200,
            Math.round(
              1800 +
                settledDemandEstimate.demand * 4200 +
                forcedInclusions.length * 240 +
                liveRunsLength * 40,
            ),
          )
        : Math.max(
            2000,
            1200 + forcedInclusions.length * 240 + liveRunsLength * 40,
          ),
    depositorWalletId: preferredSignerAddress
      ? "connected-depositor-wallet"
      : null,
    walletAuthorityPresent: hasVerifiedWalletConnection,
    actorId,
    organizationId:
      repositoryContext?.selectedRepository?.owner?.username ||
      repositoryContext?.selectedRepository?.fullName?.split("/")[0] ||
      null,
    teamId: repositoryContext?.selectedRepository?.fullName
      ? `repository:${repositoryContext.selectedRepository.fullName}`
      : null,
    memberId: actorId || preferredSignerAddress || null,
    organizationRole:
      hasValidGitHubConnection && hasVerifiedWalletConnection
        ? ("admin" as const)
        : ("member" as const),
    organizationPermissionGrants: [
      "deposit:synthesize_options",
      ...(hasVerifiedWalletConnection
        ? ["deposit:approve_option", "deposit:submit"]
        : []),
    ],
    sourceCriticalityApproved: true,
    reviewerId: actorId || preferredSignerAddress || null,
    hasRepositorySource: Boolean(repositoryContext?.selectedRepository),
    optionsRequested,
    precomputedOptionSynthesis,
    hasReviewedOption,
    hasSubmittedDeposit,
    hasDepositoryReadback,
  };
}

export type DepositOptionReviewDecisionRecords =
  DepositOptionReviewDecision[];
