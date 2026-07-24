/**
 * Build per-option deposit admission ledger payloads for /exchange projection.
 *
 * One admitted AssetPack = one execution row. Never embed the full session
 * admission report (candidateCount / admittedCount / report roots) — those are
 * synthesis-session metadata, not measurements of a deposited pack.
 */

import type { DepositOptionAdmissionReceipt } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-admission";
import type { DepositAssetPackOption } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-options";
import type { ProductActivityRecordDraft } from "@/components/bitcode/pipeline/models/pipeline-activity-history";
import {
  expandAbsoluteMeasurementsToFullCatalog,
  type AbsoluteMeasurementLike,
} from "@/components/exchange/models/expand-absolute-measurements";

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
  /** Buyer-facing source-safe descriptor (catalog prose; never raw source). */
  descriptor: string | null;
};

/** Weighted absolute volume 0..1 used as unsettled BTD estimate basis. */
export function optionAbsoluteKnowledgeVolume(
  option: DepositAssetPackOption | null | undefined,
): number {
  // Composite over full 46-kind catalogue with SSOT weights (legacy partial bags expand first).
  const absolutes = expandAbsoluteMeasurementsToFullCatalog(
    ((option?.measurements || []).filter(
      (m) => !m.category || m.category === "absolute",
    ) as AbsoluteMeasurementLike[]),
  );
  if (!absolutes.length) return 0;
  const weighted = absolutes.reduce(
    (sum, m) =>
      sum +
      Math.max(0, Math.min(1, Number(m.volume) || 0)) *
        Math.max(0, Number(m.weight) || 0),
    0,
  );
  const weights = absolutes.reduce(
    (sum, m) => sum + Math.max(0, Number(m.weight) || 0),
    0,
  );
  return Number((weights ? weighted / weights : 0).toFixed(4));
}

export function projectOptionAbsoluteMeasurements(
  option: DepositAssetPackOption | null | undefined,
): DepositAdmissionAbsoluteMeasurement[] {
  // Always project full commercial catalogue (46) with SSOT weights.
  const expanded = expandAbsoluteMeasurementsToFullCatalog(
    ((option?.measurements || []).filter(
      (m) => !m.category || m.category === "absolute",
    ) as AbsoluteMeasurementLike[]),
  );
  return expanded.map((m) => ({
    kind: m.measurementKind,
    category: "absolute" as const,
    label: m.label,
    volume: m.volume,
    magnitude: typeof m.magnitude === "number" ? m.magnitude : null,
    unit: typeof m.unit === "string" ? m.unit : null,
    weight: m.weight,
    evidenceRoot:
      typeof m.evidenceRoot === "string" ? m.evidenceRoot : null,
    descriptor: m.descriptor,
  }));
}

/**
 * Real AssetPack path-op patchfile for depositor download.
 * Schema matches PatchArtifact envelope (`bitcode.artifact.patch` path-op-json).
 * Source-safe: path+op only — never unpaid raw source bodies.
 */
export function buildDepositOptionPatchfileDownload(option: DepositAssetPackOption): {
  filename: string;
  mimeType: string;
  body: string;
} {
  const safeTitle = (option.title || "datapack")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const files = (option.contents?.fileChanges || []).map((fc) => ({
    path: fc.path,
    op: fc.op,
  }));
  const artifactId =
    option.roots.contentsRoot ||
    option.roots.optionRoot ||
    `datapack-patch-${option.optionId}`;
  // Protocol path-op envelope (PatchArtifact) — DataPack patchfile (source-safe).
  const fullAbsolutes = projectOptionAbsoluteMeasurements(option);
  const patchEnvelope = {
    schema: "bitcode.artifact.patch",
    artifactId,
    format: "path-op-json",
    patchSummary:
      option.contents?.patchSummary || option.summary || "DataPack patch",
    files,
    fileCount: files.length,
    // Product binding (not raw source) — full 46 commercial absolutes.
    assetPack: {
      optionId: option.optionId,
      kind: option.kind,
      title: option.title,
      summary: option.summary,
      provenantSourcePaths: option.contents?.provenantSourcePaths ?? [],
      measurements: fullAbsolutes,
      absolutes: fullAbsolutes,
      roots: option.roots,
      sourceBinding: {
        repositoryFullName: option.sourceBinding.repositoryFullName,
        sourceBranch: option.sourceBinding.sourceBranch,
        sourceCommit: option.sourceBinding.sourceCommit,
        sourcePathCount: option.sourceBinding.sourcePathCount,
      },
    },
  };
  return {
    filename: `${safeTitle || "datapack"}.path-op.json`,
    mimeType: "application/json",
    body: JSON.stringify(patchEnvelope, null, 2),
  };
}

export function buildDepositOptionAdmissionActivityDraft(input: {
  receipt: DepositOptionAdmissionReceipt;
  option: DepositAssetPackOption | null | undefined;
  synthesisRunId: string | null;
}): ProductActivityRecordDraft {
  const { receipt, option, synthesisRunId } = input;
  const absolutes = projectOptionAbsoluteMeasurements(option);
  const estimatedBtd = optionAbsoluteKnowledgeVolume(option);
  const estimatedBtdCells = Math.max(0, Math.round(estimatedBtd * 1000));

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
      assetPackKind: receipt.optionKind,
      kind: receipt.optionKind,
      admissionState: receipt.admission.state,
      depositoryAssetPackId: receipt.admission.depositoryAssetPackId,
      compensationState: receipt.compensationPreview.state,
      packActivitySyncState: receipt.packsActivitySync.state,
      packsActivityRoot: receipt.packsActivitySync.activityRoot,
      // Absolute material-property catalog for /exchange chips + detail
      measurements: absolutes,
      absolutes,
      // Unsettled commercial value: absolute-derived BTD estimate (not minted)
      estimatedBtd,
      estimatedBtdCells,
      btdHonesty: "estimate" as const,
      btdMintState: "not-minted-until-reader-settlement" as const,
      measurementRoot: option?.roots.measurementRoot || null,
      optionRoot: option?.roots.optionRoot || null,
      contentsRoot: option?.roots.contentsRoot || null,
      admissionReceiptRoot: receipt.roots.admissionReceiptRoot,
      packsActivityRootProof: receipt.roots.packsActivityRoot,
      // No patch / fileChanges on network /exchange projection (source-safety).
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
      optionKind: receipt.optionKind,
      assetPackKind: receipt.optionKind,
      reviewDecision: "approved-for-admission",
      admissionState: receipt.admission.state,
      depositoryAssetPackId: receipt.admission.depositoryAssetPackId,
      compensationState: receipt.compensationPreview.state,
      packActivitySyncState: receipt.packsActivitySync.state,
      packActivityType: receipt.packsActivitySync.activityType,
      packsRoute: receipt.packsActivitySync.route,
      synthesisRunId,
      assetPackTitle: receipt.title,
      estimatedBtd,
      estimatedBtdCells,
      btdHonesty: "estimate",
      // Per-pack only — never session optionCount/admittedCount
      measurementRoot: option?.roots.measurementRoot || null,
    },
  };
}
