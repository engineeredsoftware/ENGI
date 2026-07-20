/**
 * Rehydrate deposit option review decisions from the activity ledger.
 *
 * optionReviewDecisions is React state; after confirm-deposit + remount (or
 * returning to a synthesis run detail) it starts empty even when admission
 * rows already exist. Scan liveRuns for deposit-option-review-admission
 * receipts that match the current synthesis option set.
 */

import type { DepositOptionReviewDecisionState } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-admission";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";

const ADMISSION_SOURCES = new Set([
  "deposit-option-review-admission",
  // Pre-fix batch rows (never matched /packs); still rehydrate if present.
  "deposit-batch-admission",
]);

function isReviewDecision(
  value: string | null | undefined,
): value is DepositOptionReviewDecisionState {
  return (
    value === "approved-for-admission" ||
    value === "rejected-by-depositor" ||
    value === "pending-depositor-review" ||
    value === "needs-resynthesis"
  );
}

/**
 * Build a decision map for options currently on the synthesis surface.
 * Local (in-session) decisions should be merged on top by the caller.
 */
export function hydrateOptionReviewDecisionsFromRuns(input: {
  optionIds: string[];
  liveRuns: WorkspaceRun[];
  /** Current synthesis run id — prefers admissions stamped for this run. */
  synthesisRunId?: string | null;
}): Record<string, DepositOptionReviewDecisionState> {
  const optionIdSet = new Set(input.optionIds.filter(Boolean));
  if (optionIdSet.size === 0) return {};

  const decisions: Record<string, DepositOptionReviewDecisionState> = {};
  const synthesisRunId = input.synthesisRunId?.trim() || null;

  for (const run of input.liveRuns) {
    const source = run.contextSource || null;
    if (!source || !ADMISSION_SOURCES.has(source)) continue;

    // Prefer rows explicitly linked to this synthesis; still accept undated
    // ledger rows (pre-synthesisRunId stamp) when optionIds match.
    if (
      synthesisRunId &&
      run.synthesisRunId &&
      run.synthesisRunId !== synthesisRunId
    ) {
      continue;
    }

    const optionId = run.admissionOptionId || null;
    if (optionId && optionIdSet.has(optionId)) {
      if (run.admissionState === "admitted-to-depository") {
        decisions[optionId] = "approved-for-admission";
      } else if (isReviewDecision(run.reviewDecision)) {
        // Never downgrade an admitted decision from another matching row.
        if (decisions[optionId] !== "approved-for-admission") {
          decisions[optionId] = run.reviewDecision;
        }
      }
    }
  }

  return decisions;
}
