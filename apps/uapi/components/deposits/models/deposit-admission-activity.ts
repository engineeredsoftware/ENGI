/**
 * Build per-option deposit admission ledger payloads for /exchange projection.
 *
 * One admitted AssetPack = one execution row. Never embed the full session
 * admission report (candidateCount / admittedCount / report roots) — those are
 * synthesis-session metadata, not measurements of a deposited pack.
 *
 * Also builds depositor-facing DataPack review artifacts (patch + metadata +
 * measurements + identity + honesty) — product object for deposit review UX.
 */

import type { DepositOptionAdmissionReceipt } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-admission";
import type { DepositAssetPackOption } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-options";
import type { ProductActivityRecordDraft } from "@/components/bitcode/pipeline/models/pipeline-activity-history";
import {
  countExpandedFillAbsolutes,
  countMeasuredAbsolutes,
  expandAbsoluteMeasurementsToFullCatalog,
  type AbsoluteMeasurementLike,
} from "@/components/exchange/models/expand-absolute-measurements";
import { buildUnifiedDiffFromPatchFiles } from "@bitcode/generic-artifacts-patch-kind";

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
  /** Honesty: measured | estimated | expanded-fill | … */
  status?: string | null;
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
  // Always project full commercial catalogue with SSOT weights + honesty status.
  return projectOptionAbsoluteMeasurementsWithHonesty(option).map((m) => ({
    kind: m.kind,
    category: "absolute" as const,
    label: m.label,
    volume: m.volume,
    magnitude: m.magnitude,
    unit: m.unit,
    weight: m.weight,
    evidenceRoot: m.evidenceRoot,
    descriptor: m.descriptor,
    status: m.status,
  }));
}

/**
 * Real AssetPack path-op patchfile for depositor download.
 * Schema matches PatchArtifact envelope (`bitcode.artifact.patch` path-op-json).
 * Source-safe: path+op only — never unpaid raw source bodies.
 */
function optionSafeTitle(option: DepositAssetPackOption): string {
  return (option.title || "datapack")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function resolveOptionNestedBag(option: DepositAssetPackOption | null | undefined): {
  materialIdentity: Record<string, unknown> | null;
  measureReport: Record<string, unknown> | null;
  rawAbsolutes: AbsoluteMeasurementLike[];
} {
  if (!option) {
    return { materialIdentity: null, measureReport: null, rawAbsolutes: [] };
  }
  const o = option as DepositAssetPackOption & {
    materialIdentity?: unknown;
    measureReport?: unknown;
    measurements?:
      | AbsoluteMeasurementLike[]
      | {
          absolutes?: AbsoluteMeasurementLike[];
          materialIdentity?: unknown;
          measureReport?: unknown;
        };
  };
  const nested =
    o.measurements && typeof o.measurements === "object" && !Array.isArray(o.measurements)
      ? (o.measurements as {
          absolutes?: AbsoluteMeasurementLike[];
          materialIdentity?: unknown;
          measureReport?: unknown;
        })
      : null;
  const rawAbsolutes = Array.isArray(o.measurements)
    ? (o.measurements as AbsoluteMeasurementLike[])
    : Array.isArray(nested?.absolutes)
      ? nested!.absolutes!
      : [];
  const materialIdentity =
    (nested?.materialIdentity && typeof nested.materialIdentity === "object"
      ? (nested.materialIdentity as Record<string, unknown>)
      : null) ||
    (o.materialIdentity && typeof o.materialIdentity === "object"
      ? (o.materialIdentity as Record<string, unknown>)
      : null);
  const measureReport =
    (nested?.measureReport && typeof nested.measureReport === "object"
      ? (nested.measureReport as Record<string, unknown>)
      : null) ||
    (o.measureReport && typeof o.measureReport === "object"
      ? (o.measureReport as Record<string, unknown>)
      : null);
  return { materialIdentity, measureReport, rawAbsolutes };
}

/** Project absolutes with honesty status for depositor review / artifact. */
export function projectOptionAbsoluteMeasurementsWithHonesty(
  option: DepositAssetPackOption | null | undefined,
): Array<DepositAdmissionAbsoluteMeasurement & { status: string | null }> {
  const { rawAbsolutes } = resolveOptionNestedBag(option);
  const expanded = expandAbsoluteMeasurementsToFullCatalog(
    (rawAbsolutes.length
      ? rawAbsolutes
      : ((option?.measurements || []) as AbsoluteMeasurementLike[])
    ).filter((m) => !m.category || m.category === "absolute"),
  );
  return expanded.map((m) => ({
    kind: m.measurementKind,
    category: "absolute" as const,
    label: m.label,
    volume: m.volume,
    magnitude: typeof m.magnitude === "number" ? m.magnitude : null,
    unit: typeof m.unit === "string" ? m.unit : null,
    weight: m.weight,
    evidenceRoot: typeof m.evidenceRoot === "string" ? m.evidenceRoot : null,
    descriptor: m.descriptor,
    status: typeof m.status === "string" ? m.status : null,
  }));
}

/**
 * Depositor primary download: unified-diff `.patch` with full file bodies for
 * the admitted/settled material. Prefer precomputed unifiedDiff; else build
 * from fileChanges[].content.
 */
export function buildDepositOptionSourcePatchDownload(
  option: DepositAssetPackOption,
): {
  filename: string;
  mimeType: string;
  body: string;
} {
  const safeTitle = optionSafeTitle(option);
  const precomputed =
    typeof option.contents?.unifiedDiff === "string" &&
    option.contents.unifiedDiff.trim()
      ? option.contents.unifiedDiff
      : null;
  const files = (option.contents?.fileChanges || []).map((fc) => ({
    path: fc.path,
    op: fc.op,
    body: typeof fc.content === "string" ? fc.content : null,
  }));
  // Also accept patchArtifact on extended option rows from selection envelope.
  const artifact = (
    option as DepositAssetPackOption & {
      patchArtifact?: {
        unifiedDiff?: string;
        files?: Array<{ path?: string; op?: string; body?: string }>;
      };
    }
  ).patchArtifact;
  const fromArtifact =
    typeof artifact?.unifiedDiff === "string" && artifact.unifiedDiff.trim()
      ? artifact.unifiedDiff
      : null;
  const artifactFiles = Array.isArray(artifact?.files)
    ? artifact!.files!.map((f) => ({
        path: String(f.path || ""),
        op: String(f.op || "modify"),
        body: typeof f.body === "string" ? f.body : null,
      }))
    : [];
  const bodyText =
    precomputed ||
    fromArtifact ||
    buildUnifiedDiffFromPatchFiles(
      (files.some((f) => typeof f.body === "string") ? files : artifactFiles).map(
        (f) => ({
          path: f.path,
          op: f.op,
          body: f.body,
        }),
      ),
      {
        patchSummary:
          option.contents?.patchSummary || option.summary || "DataPack patch",
      },
    );
  return {
    filename: `${safeTitle || "datapack"}.patch`,
    mimeType: "text/x-diff",
    body: bodyText,
  };
}

/** Protocol path-op JSON envelope (metadata companion; not the primary .patch). */
export function buildDepositOptionPatchfileDownload(option: DepositAssetPackOption): {
  filename: string;
  mimeType: string;
  body: string;
} {
  const safeTitle = optionSafeTitle(option);
  const files = (option.contents?.fileChanges || []).map((fc) => ({
    path: fc.path,
    op: fc.op,
    ...(typeof fc.content === "string" ? { body: fc.content } : {}),
  }));
  const artifactId =
    option.roots.contentsRoot ||
    option.roots.optionRoot ||
    `datapack-patch-${option.optionId}`;
  const fullAbsolutes = projectOptionAbsoluteMeasurements(option);
  const hasBodies = files.some(
    (f) => typeof (f as { body?: string }).body === "string",
  );
  const patchEnvelope = {
    schema: "bitcode.artifact.patch",
    artifactId,
    format: hasBodies ? "unified-diff" : "path-op-json",
    patchSummary:
      option.contents?.patchSummary || option.summary || "DataPack patch",
    files,
    fileCount: files.length,
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

/**
 * Depositor-facing full DataPack review artifact.
 * Elevated product object: path-op patch + metadata + absolutes (with honesty) +
 * materialIdentity + measureReport. Source-safe (no unpaid raw source bodies).
 */
export function buildDepositOptionReviewArtifact(option: DepositAssetPackOption): {
  filename: string;
  mimeType: string;
  body: string;
} {
  const safeTitle = optionSafeTitle(option);
  const files = (option.contents?.fileChanges || []).map((fc) => ({
    path: fc.path,
    op: fc.op,
  }));
  const { materialIdentity, measureReport, rawAbsolutes } =
    resolveOptionNestedBag(option);
  const absolutes = projectOptionAbsoluteMeasurementsWithHonesty(option);
  const expandedForCounts = expandAbsoluteMeasurementsToFullCatalog(
    rawAbsolutes.length
      ? rawAbsolutes
      : ((option.measurements || []) as AbsoluteMeasurementLike[]),
  );
  const honesty = {
    measuredKindCount: countMeasuredAbsolutes(expandedForCounts),
    expandedFillCount: countExpandedFillAbsolutes(expandedForCounts),
    mode:
      (measureReport && typeof measureReport.mode === "string"
        ? measureReport.mode
        : null) || "path-only",
    measuredFromBodies:
      measureReport && typeof measureReport.measuredFromBodies === "number"
        ? measureReport.measuredFromBodies
        : 0,
    bodyCoverageRatio:
      measureReport && typeof measureReport.bodyCoverageRatio === "number"
        ? measureReport.bodyCoverageRatio
        : 0,
  };
  const artifactId =
    option.roots.optionRoot ||
    option.roots.contentsRoot ||
    `datapack-review-${option.optionId}`;
  const reviewArtifact = {
    schema: "bitcode.datapack.review-artifact",
    version: 1,
    artifactId,
    purpose: "depositor-review",
    patch: {
      format: "path-op-json",
      patchSummary:
        option.contents?.patchSummary || option.summary || "DataPack patch",
      files,
      fileCount: files.length,
    },
    metadata: {
      optionId: option.optionId,
      kind: option.kind,
      title: option.title,
      summary: option.summary,
      sourceBinding: {
        repositoryFullName: option.sourceBinding.repositoryFullName,
        sourceBranch: option.sourceBinding.sourceBranch,
        sourceCommit: option.sourceBinding.sourceCommit,
        sourcePathCount: option.sourceBinding.sourcePathCount,
      },
      provenantSourcePaths: option.contents?.provenantSourcePaths ?? [],
      roots: option.roots,
    },
    measurements: {
      absolutes,
      ...(materialIdentity ? { materialIdentity } : {}),
      ...(measureReport ? { measureReport } : {}),
    },
    honesty,
  };
  return {
    filename: `${safeTitle || "datapack"}.datapack.review.json`,
    mimeType: "application/json",
    body: JSON.stringify(reviewArtifact, null, 2),
  };
}

export function buildDepositOptionAdmissionActivityDraft(input: {
  receipt: DepositOptionAdmissionReceipt;
  option: DepositAssetPackOption | null | undefined;
  synthesisRunId: string | null;
}): ProductActivityRecordDraft {
  const { receipt, option, synthesisRunId } = input;
  const absolutes = projectOptionAbsoluteMeasurements(option);
  const { materialIdentity, measureReport } = resolveOptionNestedBag(option);
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
      measurements: {
        absolutes,
        ...(materialIdentity ? { materialIdentity } : {}),
        ...(measureReport ? { measureReport } : {}),
      },
      absolutes,
      ...(materialIdentity ? { materialIdentity } : {}),
      ...(measureReport ? { measureReport } : {}),
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
