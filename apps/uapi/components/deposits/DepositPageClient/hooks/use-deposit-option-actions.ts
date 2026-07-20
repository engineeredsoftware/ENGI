/**
 * Deposit option review, selection toggle, and batch admission handlers.
 */
"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { trackProductEvent } from "@/lib/product-analytics";
import {
  buildDepositRouteSession,
  writeDepositRouteStage,
  type DepositRouteSession,
} from "@/components/deposits/models/deposit-route-model";
import type { DepositOptionReviewDecisionState } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-admission";
import type { ProductActivityRecordDraft } from "@/components/bitcode/pipeline/models/pipeline-activity-history";

export function useDepositOptionActions(input: {
  depositRouteInput: Parameters<typeof buildDepositRouteSession>[0];
  optionReviewDecisions: Record<string, DepositOptionReviewDecisionState>;
  setOptionReviewDecisions: Dispatch<
    SetStateAction<Record<string, DepositOptionReviewDecisionState>>
  >;
  setOptionsRequested: (value: boolean) => void;
  selectedPackIds: string[];
  setSelectedPackIds: Dispatch<SetStateAction<string[]>>;
  confirmingBatchDeposit: boolean;
  setConfirmingBatchDeposit: (value: boolean) => void;
  userId: string | null | undefined;
  preferredSignerAddress: string | null;
  readCurrentSearchParams: () => URLSearchParams;
  replaceDepositSearchParams: (params: URLSearchParams) => void;
  handleRecordActivity: (
    draft: ProductActivityRecordDraft,
  ) => Promise<unknown>;
  setRunsLoadError: (error: string | null) => void;
}) {
  const {
    depositRouteInput,
    optionReviewDecisions,
    setOptionReviewDecisions,
    setOptionsRequested,
    selectedPackIds,
    setSelectedPackIds,
    confirmingBatchDeposit,
    setConfirmingBatchDeposit,
    userId,
    preferredSignerAddress,
    readCurrentSearchParams,
    replaceDepositSearchParams,
    handleRecordActivity,
    setRunsLoadError,
  } = input;

  const handleOptionReviewDecision = useCallback(
    async (optionId: string, decision: DepositOptionReviewDecisionState) => {
      if (optionReviewDecisions[optionId] === "approved-for-admission") {
        return;
      }
      const nextDecisions = {
        ...optionReviewDecisions,
        [optionId]: decision,
      };
      setOptionsRequested(true);
      setOptionReviewDecisions(nextDecisions);

      const nextDecisionRecords = Object.entries(nextDecisions).map(
        ([entryOptionId, entryDecision]) => ({
          optionId: entryOptionId,
          decision: entryDecision,
          reviewerId: userId || preferredSignerAddress || null,
        }),
      );
      const nextSession = buildDepositRouteSession({
        ...depositRouteInput,
        optionsRequested: true,
        hasReviewedOption: true,
        optionReviewDecisions: nextDecisionRecords,
      });
      const receipt = nextSession.admission.receipts.find(
        (entry) => entry.optionId === optionId,
      );
      const admitted = receipt?.admission.state === "admitted-to-depository";
      trackProductEvent({
        name: "deposit_option_review",
        data: { decision, admitted },
      });
      replaceDepositSearchParams(
        writeDepositRouteStage(
          readCurrentSearchParams(),
          admitted ? "read-depository-state" : "review-options",
        ),
      );

      if (!receipt) return;

      try {
        await handleRecordActivity({
          type: admitted
            ? "pipeline:deposit-option-admission"
            : "pipeline:deposit-option-review",
          status: "completed",
          summary: admitted
            ? `Admitted ${receipt.title} to the Depository.`
            : decision === "rejected-by-depositor"
              ? `Archived ${receipt.title} (re-depositable; measurements staled by time trigger resynthesis).`
              : `Recorded ${decision.replace(/-/g, " ")} for ${receipt.title}.`,
          // Stay on the synthesis detail so admitted cards disable in place;
          // admission still lands in the ledger and /packs network query.
          selectAfterRecord: false,
          output: {
            assetPackTitle: receipt.title,
            depositAdmission: nextSession.admission,
            admissionState: receipt.admission.state,
            depositoryAssetPackId: receipt.admission.depositoryAssetPackId,
            compensationState: receipt.compensationPreview.state,
            packActivitySyncState: receipt.packsActivitySync.state,
            packsActivityRoot: receipt.packsActivitySync.activityRoot,
          },
          context: {
            source: "deposit-option-review-admission",
            workbench: "deposit-option-review",
            optionId,
            reviewDecision: decision,
            admissionState: receipt.admission.state,
            depositoryAssetPackId: receipt.admission.depositoryAssetPackId,
            compensationState: receipt.compensationPreview.state,
            packActivitySyncState: receipt.packsActivitySync.state,
            packActivityType: receipt.packsActivitySync.activityType,
            packsRoute: receipt.packsActivitySync.route,
            synthesisRunId: depositRouteInput?.transactionId || null,
          },
        });
      } catch (error) {
        setRunsLoadError(
          error instanceof Error
            ? error.message
            : "Unable to record deposit option review.",
        );
      }
    },
    [
      depositRouteInput,
      handleRecordActivity,
      optionReviewDecisions,
      preferredSignerAddress,
      readCurrentSearchParams,
      replaceDepositSearchParams,
      setOptionReviewDecisions,
      setOptionsRequested,
      setRunsLoadError,
      userId,
    ],
  );

  const handleToggleSelect = useCallback(
    (optionId: string) => {
      setConfirmingBatchDeposit(false);
      setSelectedPackIds((current) =>
        current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      );
    },
    [setConfirmingBatchDeposit, setSelectedPackIds],
  );

  const handleDepositSelected = useCallback(async () => {
    const idsToDeposit = selectedPackIds.filter(
      (id) => optionReviewDecisions[id] !== "approved-for-admission",
    );
    if (idsToDeposit.length === 0) return;
    if (!confirmingBatchDeposit) {
      setConfirmingBatchDeposit(true);
      return;
    }
    setConfirmingBatchDeposit(false);

    const nextDecisions = { ...optionReviewDecisions };
    for (const id of idsToDeposit) {
      nextDecisions[id] = "approved-for-admission";
    }
    setOptionsRequested(true);
    setOptionReviewDecisions(nextDecisions);
    setSelectedPackIds([]);

    const nextDecisionRecords = Object.entries(nextDecisions).map(
      ([optionId, decision]) => ({
        optionId,
        decision,
        reviewerId: userId || preferredSignerAddress || null,
      }),
    );
    const nextSession: DepositRouteSession = buildDepositRouteSession({
      ...depositRouteInput,
      optionsRequested: true,
      hasReviewedOption: true,
      optionReviewDecisions: nextDecisionRecords,
    });
    const admittedReceipts = nextSession.admission.receipts.filter(
      (entry) =>
        idsToDeposit.includes(entry.optionId) &&
        entry.admission.state === "admitted-to-depository",
    );
    trackProductEvent({
      name: "deposit_admission",
      data: {
        selectedCount: idsToDeposit.length,
        admittedCount: admittedReceipts.length,
      },
    });
    replaceDepositSearchParams(
      writeDepositRouteStage(
        readCurrentSearchParams(),
        admittedReceipts.length ? "read-depository-state" : "review-options",
      ),
    );
    if (admittedReceipts.length === 0) return;

    // One ledger row per admitted option — /packs filters network scope on
    // context.source=deposit-option-review-admission + admissionState=
    // admitted-to-depository. A single "batch" source never appears there.
    // Stay on the deposit-run detail (selectAfterRecord: false) so cards can
    // flip to the admitted/disabled state without remounting another run.
    try {
      for (const receipt of admittedReceipts) {
        await handleRecordActivity({
          type: "pipeline:deposit-option-admission",
          status: "completed",
          summary: `Admitted ${receipt.title} to the Depository.`,
          selectAfterRecord: false,
          output: {
            assetPackTitle: receipt.title,
            depositAdmission: nextSession.admission,
            admissionState: receipt.admission.state,
            depositoryAssetPackId: receipt.admission.depositoryAssetPackId,
            compensationState: receipt.compensationPreview.state,
            packActivitySyncState: receipt.packsActivitySync.state,
            packsActivityRoot: receipt.packsActivitySync.activityRoot,
          },
          context: {
            source: "deposit-option-review-admission",
            workbench: "deposit-option-review",
            optionId: receipt.optionId,
            reviewDecision: "approved-for-admission",
            admissionState: receipt.admission.state,
            depositoryAssetPackId: receipt.admission.depositoryAssetPackId,
            compensationState: receipt.compensationPreview.state,
            packActivitySyncState: receipt.packsActivitySync.state,
            packActivityType: receipt.packsActivitySync.activityType,
            packsRoute: receipt.packsActivitySync.route,
            synthesisRunId: depositRouteInput?.transactionId || null,
          },
        });
      }
    } catch (error) {
      setRunsLoadError(
        error instanceof Error
          ? error.message
          : "Unable to record deposit admission.",
      );
    }
  }, [
    confirmingBatchDeposit,
    depositRouteInput,
    handleRecordActivity,
    optionReviewDecisions,
    preferredSignerAddress,
    readCurrentSearchParams,
    replaceDepositSearchParams,
    selectedPackIds,
    setConfirmingBatchDeposit,
    setOptionReviewDecisions,
    setOptionsRequested,
    setRunsLoadError,
    setSelectedPackIds,
    userId,
  ]);

  return {
    handleOptionReviewDecision,
    handleToggleSelect,
    handleDepositSelected,
  };
}
