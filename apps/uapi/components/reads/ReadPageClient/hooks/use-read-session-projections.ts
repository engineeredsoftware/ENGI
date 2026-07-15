/**
 * Project deposited source revision, admitted read activity, and route session
 * from live runs + repository context (pure-ish memos over loaded state).
 */
"use client";

import { useMemo } from "react";
import type { ProductDepositedSourceRevision } from "@/components/reads/models/deposit-read-workbench";
import type { ProductRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";
import {
  buildReadRouteSession,
  type ReadRouteSession,
  type ReadRouteStepId,
} from "@/components/reads/models/read-route-model";

export function useReadSessionProjections(input: {
  liveRuns: WorkspaceRun[];
  repositoryContext: ProductRepositoryContextState | null;
  selectedTransactionId: string | null;
  selectedRun: WorkspaceRun | null;
  routeReadingStage: ReadRouteStepId | null;
}): {
  depositedSourceRevision: ProductDepositedSourceRevision | null;
  admittedReadActivityId: string | null;
  readRouteSession: ReadRouteSession;
} {
  const {
    liveRuns,
    repositoryContext,
    selectedTransactionId,
    selectedRun,
    routeReadingStage,
  } = input;

  const depositedSourceRevision =
    useMemo<ProductDepositedSourceRevision | null>(() => {
      const selectedRepository = repositoryContext?.selectedRepository || null;
      if (!selectedRepository) return null;
      const selectedBranch =
        repositoryContext?.selectedBranch ||
        selectedRepository.defaultBranch ||
        "main";
      const matchingSubmission = liveRuns.find(
        (run) =>
          run.contextSource === "terminal-deposit-composer" &&
          run.repository === selectedRepository.fullName &&
          run.branch === selectedBranch &&
          Boolean(run.sourceCommit) &&
          Boolean(run.candidateAssetId),
      );
      if (!matchingSubmission?.sourceCommit) return null;

      return {
        repositoryFullName: selectedRepository.fullName,
        branch: selectedBranch,
        commit: matchingSubmission.sourceCommit,
        activityId: matchingSubmission.id,
        createdAt: matchingSubmission.created_at,
        depositAssetId: matchingSubmission.candidateAssetId || null,
        hasWalletOrAttestationProof: Boolean(matchingSubmission.candidateAssetId),
        hasAssetMeasurementEvidence: Boolean(matchingSubmission.candidateAssetId),
        proofRoot: matchingSubmission.depositProofRoot || null,
        measurementRoot: matchingSubmission.depositMeasurementRoot || null,
        reconciliationReadbackRoot:
          matchingSubmission.depositReconciliationReadbackRoot || null,
        depositorySearchDocumentRoot:
          matchingSubmission.depositorySearchDocumentRoot || null,
        lexicalDocumentRoot: matchingSubmission.lexicalDocumentRoot || null,
        vectorDocumentRoot: matchingSubmission.vectorDocumentRoot || null,
        compensationPreviewRoot:
          matchingSubmission.compensationPreviewRoot || null,
        sourceToSharesPreviewRoot:
          matchingSubmission.sourceToSharesPreviewRoot || null,
        compensationState: matchingSubmission.compensationState || null,
        compensationAllocationMethod:
          matchingSubmission.compensationAllocationMethod || null,
        compensationPriceAsset:
          matchingSubmission.compensationPriceAsset || null,
        depositorWalletId: matchingSubmission.depositorWalletId || null,
        depositoryIndexState: matchingSubmission.depositoryIndexState || null,
      };
    }, [liveRuns, repositoryContext]);

  const admittedReadActivityId = useMemo(() => {
    const selectedRepository = repositoryContext?.selectedRepository || null;
    if (!selectedRepository) return null;
    const sourceBranch =
      depositedSourceRevision?.branch ||
      repositoryContext?.selectedBranch ||
      selectedRepository.defaultBranch ||
      "main";
    const sourceCommit =
      depositedSourceRevision?.commit ||
      repositoryContext?.selectedCommit ||
      null;
    const matchingRead = liveRuns.find(
      (run) =>
        run.contextSource === "terminal-deposit-read-workbench" &&
        run.contextWorkbench === "read-admission" &&
        run.repository === selectedRepository.fullName &&
        run.branch === sourceBranch &&
        (!sourceCommit || run.sourceCommit === sourceCommit),
    );
    return matchingRead?.id || null;
  }, [depositedSourceRevision, liveRuns, repositoryContext]);

  const readRouteSession = useMemo(
    () =>
      buildReadRouteSession({
        transactionId: selectedTransactionId || admittedReadActivityId || null,
        routeReadingStage,
        repositoryFullName:
          repositoryContext?.selectedRepository?.fullName || null,
        sourceBranch:
          depositedSourceRevision?.branch ||
          repositoryContext?.selectedBranch ||
          null,
        sourceCommit:
          depositedSourceRevision?.commit ||
          repositoryContext?.selectedCommit ||
          null,
        hasRepositorySource: Boolean(repositoryContext?.selectedRepository),
        hasReadMeasurement: Boolean(
          admittedReadActivityId ||
            selectedRun?.contextWorkbench === "read-admission" ||
            selectedRun?.transactionLens === "read",
        ),
        hasSynthesizedNeed: Boolean(
          admittedReadActivityId ||
            selectedRun?.contextSource === "terminal-staged-reading",
        ),
        hasAcceptedNeed: Boolean(admittedReadActivityId),
        findingFitsRunning: Boolean(
          selectedRun?.type?.includes("asset-pack") &&
            selectedRun.status === "running",
        ),
        hasSourceSafePreview: Boolean(
          selectedRun?.type?.includes("asset-pack") &&
            selectedRun.status === "completed",
        ),
        hasSettlementReadback: Boolean(
          selectedRun?.closureFocus?.toLowerCase().includes("settlement"),
        ),
        hasDeliveryReadback: Boolean(
          selectedRun?.closureFocus?.toLowerCase().includes("delivery"),
        ),
        measuredBtd: selectedRun?.measuredBtd ?? null,
        quoteSats:
          typeof selectedRun?.btcFeeUsdEquivalent === "number"
            ? Math.max(1, Math.round(selectedRun.btcFeeUsdEquivalent * 10_000))
            : null,
        settlementQuoteId: selectedRun?.id ? `quote:${selectedRun.id}` : null,
        procurementApproved: Boolean(
          selectedRun?.closureFocus?.toLowerCase().includes("settlement") ||
            selectedRun?.closureFocus?.toLowerCase().includes("delivery"),
        ),
        buyerAuthorized: true,
        walletAuthorityPresent: Boolean(
          selectedRun?.closureFocus?.toLowerCase().includes("wallet") ||
            selectedRun?.closureFocus?.toLowerCase().includes("settlement") ||
            selectedRun?.closureFocus?.toLowerCase().includes("delivery"),
        ),
      }),
    [
      admittedReadActivityId,
      depositedSourceRevision,
      repositoryContext,
      routeReadingStage,
      selectedRun,
      selectedTransactionId,
    ],
  );

  return {
    depositedSourceRevision,
    admittedReadActivityId,
    readRouteSession,
  };
}
