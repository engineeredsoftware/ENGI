/**
 * Build per-option deposit admission ledger payloads for /packs projection.
 *
 * One admitted AssetPack = one execution row. Never embed the full session
 * admission report (candidateCount / admittedCount / report roots) — those are
 * synthesis-session metadata, not measurements of a deposited pack.
 */

import type { DepositOptionAdmissionReceipt } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-admission";
import type { DepositAssetPackOption } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-options";
import type { ProductActivityRecordDraft } from "@/components/bitcode/pipeline/models/pipeline-activity-history";

/** Absolute measurement row projected onto pack activity (source-safe). */
export type DepositAdmissionAbsoluteMeasurement = {
  kind: string;
  category: "absolute";
  label: string;
  volume: number;
  magnitude: number | null;
  unit: string | null;
  weight: number;
  evidenceRoot: string | null;
};

export function projectOptionAbsoluteMeasurements(
  option: DepositAssetPackOption | null | undefined,
): DepositAdmissionAbsoluteMeasurement[] {
  if (!option?.measurements?.length) return [];
  return option.measurements
    .filter((m) => (m.category || "absolute") === "absolute")
    .map((m) => ({
      kind: m.measurementKind || m.id,
      category: "absolute" as const,
      label: m.label,
      volume: m.volume,
      magnitude: typeof m.magnitude === "number" ? m.magnitude : null,
      unit: typeof m.unit === "string" ? m.unit : null,
      weight: m.weight,
      evidenceRoot: m.evidenceRoot || null,
    }));
}

/**
 * Path-op patch descriptor for depositor download on /deposits review.
 * Never projected onto /packs (source-safety: patch only for owner/buyer).
 */
export function buildDepositOptionPatchfileDownload(option: DepositAssetPackOption): {
  filename: string;
  mimeType: string;
  body: string;
} {
  const safeTitle = (option.title || "asset-pack")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const body = JSON.stringify(
    {
      schema: "bitcode.deposit.asset-pack-patchfile",
      optionId: option.optionId,
      kind: option.kind,
      title: option.title,
      summary: option.summary,
      patchSummary: option.contents?.patchSummary ?? null,
      fileChanges: option.contents?.fileChanges ?? [],
      provenantSourcePaths: option.contents?.provenantSourcePaths ?? [],
      measurements: option.measurements,
      roots: option.roots,
      sourceBinding: {
        repositoryFullName: option.sourceBinding.repositoryFullName,
        sourceBranch: option.sourceBinding.sourceBranch,
        sourceCommit: option.sourceBinding.sourceCommit,
        sourcePathCount: option.sourceBinding.sourcePathCount,
      },
    },
    null,
    2,
  );
  return {
    filename: `${safeTitle || "asset-pack"}-patchfile.json`,
    mimeType: "application/json",
    body,
  };
}

export function buildDepositOptionAdmissionActivityDraft(input: {
  receipt: DepositOptionAdmissionReceipt;
  option: DepositAssetPackOption | null | undefined;
  synthesisRunId: string | null;
}): ProductActivityRecordDraft {
  const { receipt, option, synthesisRunId } = input;
  const absolutes = projectOptionAbsoluteMeasurements(option);

  return {
    type: "pipeline:deposit-option-admission",
    status: "completed",
    summary: `Admitted ${receipt.title} to the Depository.`,
    selectAfterRecord: false,
    output: {
      // Per-pack identity — not session aggregates
      assetPackTitle: receipt.title,
      optionId: receipt.optionId,
      optionKind: receipt.optionKind,
      admissionState: receipt.admission.state,
      depositoryAssetPackId: receipt.admission.depositoryAssetPackId,
      compensationState: receipt.compensationPreview.state,
      packActivitySyncState: receipt.packsActivitySync.state,
      packsActivityRoot: receipt.packsActivitySync.activityRoot,
      // Absolute material-property catalog for /packs chips + detail
      measurements: absolutes,
      absolutes,
      measurementRoot: option?.roots.measurementRoot || null,
      optionRoot: option?.roots.optionRoot || null,
      contentsRoot: option?.roots.contentsRoot || null,
      admissionReceiptRoot: receipt.roots.admissionReceiptRoot,
      packsActivityRootProof: receipt.roots.packsActivityRoot,
      // No patch / fileChanges on network /packs projection (source-safety).
      sourceBinding: option
        ? {
            repositoryFullName: option.sourceBinding.repositoryFullName,
            sourceBranch: option.sourceBinding.sourceBranch,
            sourceCommit: option.sourceBinding.sourceCommit,
            sourcePathCount: option.sourceBinding.sourcePathCount,
          }
        : null,
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
      synthesisRunId,
      assetPackTitle: receipt.title,
      // Per-pack only — never session optionCount/admittedCount
      measurementRoot: option?.roots.measurementRoot || null,
    },
  };
}
