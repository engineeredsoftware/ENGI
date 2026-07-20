/**
 * Deposit option review, selection toggle, and batch admission handlers.
 *
 * Each confirmed deposit writes one ledger row per option with that option's
 * absolute measurements — never the full session admission report.
 */
"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { trackProductEvent } from "@/lib/product-analytics";
import {
  buildDepositRouteSession,
  writeDepositRouteStage,
  type DepositRouteSession,
} from "@/components/deposits/models/deposit-route-model";
import { buildDepositOptionAdmissionActivityDraft } from "@/components/deposits/models/deposit-admission-activity";
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

  const findOption = useCallback(
    (optionId: string) =>
      depositRouteInput?.precomputedOptionSynthesis?.options?.find(
        (entry) => entry.optionId === optionId,
      ) ?? null,
    [depositRouteInput],
  );

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
        if (admitted) {
          const option = findOption(optionId);
          await handleRecordActivity(
            buildDepositOptionAdmissionActivityDraft({
              receipt,
              option,
              synthesisRunId: depositRouteInput?.transactionId || null,
            }),
          );
          // Background: static search document + optional embed for depository search.
          try {
            const assetId =
              receipt.admission?.depositoryAssetPackId ||
              receipt.packsActivitySync?.activityId ||
              optionId;
            const coveredSourcePaths =
              option?.contents?.provenantSourcePaths ||
              option?.sourceBinding?.sourcePathRoots ||
              [];
            void fetch('/api/depository/index', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                assetId,
                title: receipt.title || option?.title || null,
                summary: option?.summary || null,
                kind: option?.kind || null,
                repositoryFullName:
                  depositRouteInput?.repositoryFullName || null,
                lifecycle: 'admitted-to-depository',
                topics: [],
                coveredSourcePaths,
              }),
            }).catch(() => {
              /* index is best-effort; admission already succeeded */
            });
          } catch {
            /* optional */
          }
        } else {
          await handleRecordActivity({
            type: "pipeline:deposit-option-review",
            status: "completed",
            summary:
              decision === "rejected-by-depositor"
                ? `Archived ${receipt.title} (re-depositable; measurements staled by time trigger resynthesis).`
                : `Recorded ${decision.replace(/-/g, " ")} for ${receipt.title}.`,
            selectAfterRecord: false,
            output: {
              assetPackTitle: receipt.title,
              optionId,
              admissionState: receipt.admission.state,
              admissionBlockers: receipt.admission.blockers,
            },
            context: {
              source: "deposit-option-review-admission",
              workbench: "deposit-option-review",
              optionId,
              reviewDecision: decision,
              admissionState: receipt.admission.state,
              synthesisRunId: depositRouteInput?.transactionId || null,
            },
          });
        }
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
      findOption,
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

    // Preview session with all selected marked approved — then only persist
    // decisions that actually admit (or archive-style non-admit).
    const previewDecisions = { ...optionReviewDecisions };
    for (const id of idsToDeposit) {
      previewDecisions[id] = "approved-for-admission";
    }
    const previewRecords = Object.entries(previewDecisions).map(
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
      optionReviewDecisions: previewRecords,
    });
    const admittedReceipts = nextSession.admission.receipts.filter(
      (entry) =>
        idsToDeposit.includes(entry.optionId) &&
        entry.admission.state === "admitted-to-depository",
    );
    const blockedReceipts = nextSession.admission.receipts.filter(
      (entry) =>
        idsToDeposit.includes(entry.optionId) &&
        entry.admission.state !== "admitted-to-depository",
    );

    // Only flip React state to admitted for packs that actually admitted.
    const nextDecisions = { ...optionReviewDecisions };
    for (const receipt of admittedReceipts) {
      nextDecisions[receipt.optionId] = "approved-for-admission";
    }
    setOptionsRequested(true);
    setOptionReviewDecisions(nextDecisions);
    setSelectedPackIds((current) =>
      current.filter((id) => !admittedReceipts.some((r) => r.optionId === id)),
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

    if (blockedReceipts.length > 0) {
      const titles = blockedReceipts.map((r) => r.title).join("; ");
      const blockers = blockedReceipts
        .flatMap((r) => r.admission.blockers)
        .slice(0, 6)
        .join(", ");
      setRunsLoadError(
        admittedReceipts.length
          ? `Admitted ${admittedReceipts.length} of ${idsToDeposit.length}. Blocked: ${titles}${blockers ? ` (${blockers})` : ""}.`
          : `No AssetPacks admitted. Blocked: ${titles}${blockers ? ` (${blockers})` : ""}.`,
      );
    }

    if (admittedReceipts.length === 0) return;

    // One ledger row per admitted option — /packs network scope keys on
    // context.source=deposit-option-review-admission + admitted-to-depository.
    try {
      for (const receipt of admittedReceipts) {
        await handleRecordActivity(
          buildDepositOptionAdmissionActivityDraft({
            receipt,
            option: findOption(receipt.optionId),
            synthesisRunId: depositRouteInput?.transactionId || null,
          }),
        );
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
    findOption,
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
