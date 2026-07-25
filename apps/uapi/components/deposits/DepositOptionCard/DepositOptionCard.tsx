'use client';

/**
 * Single deposit AssetPack option card — contents, policy rows, neediness,
 * select/archive/resynthesize controls. Parent list owns batch deposit footer.
 */

import React from "react";
import { Anchor } from "lucide-react";
import type { DepositOptionReviewDecisionState } from "@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs/deposit-asset-pack-option-admission";
import type { DepositRouteSession } from "@/components/deposits/models/deposit-route-model";
import type { DepositSettledDemandEstimate } from "@/components/deposits/models/deposit-settled-demand";
import type {
  DepositRealSynthesis,
  DepositRealSynthesisOption,
} from "@/components/deposits/models/deposit-real-synthesis";
import {
  buildDepositOptionPatchfileDownload,
  buildDepositOptionReviewArtifact,
} from "@/components/deposits/models/deposit-admission-activity";
import {
  countExpandedFillAbsolutes,
  countMeasuredAbsolutes,
  expandAbsoluteMeasurementsToFullCatalog,
  type AbsoluteMeasurementLike,
} from "@/components/exchange/models/expand-absolute-measurements";

function resolveOptionMeasureReport(option: DepositRealSynthesisOption): {
  measuredFromBodies: number;
  coveredPathCount: number;
  bodyCoverageRatio: number;
  expandedFillCount: number;
  mode: string;
  measuredKindCount?: number;
} | null {
  const o = option as unknown as Record<string, unknown>;
  const nested = o.measurements;
  const fromNested =
    nested && typeof nested === "object" && !Array.isArray(nested)
      ? (nested as { measureReport?: unknown }).measureReport
      : null;
  const raw = fromNested || o.measureReport;
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.measuredFromBodies !== "number") return null;
  return {
    measuredFromBodies: r.measuredFromBodies,
    coveredPathCount:
      typeof r.coveredPathCount === "number" ? r.coveredPathCount : 0,
    bodyCoverageRatio:
      typeof r.bodyCoverageRatio === "number" ? r.bodyCoverageRatio : 0,
    expandedFillCount:
      typeof r.expandedFillCount === "number" ? r.expandedFillCount : 0,
    mode: typeof r.mode === "string" ? r.mode : "path-only",
    measuredKindCount:
      typeof r.measuredKindCount === "number" ? r.measuredKindCount : undefined,
  };
}

function resolveOptionMaterialIdentity(
  option: DepositRealSynthesisOption,
): {
  inventories?: Array<{
    kind?: string;
    label?: string;
    items?: Array<{
      id?: string;
      label?: string;
      class?: string | null;
      fileHitCount?: number;
      usageShare?: number;
      scope?: string;
    }>;
    totalCount?: number;
  }>;
  compositions?: Array<{ kind?: string; label?: string; primary?: string | null }>;
  tagSets?: Array<{ kind?: string; tags?: string[]; primary?: string | null }>;
} | null {
  const o = option as unknown as Record<string, unknown>;
  const nested = o.measurements;
  const fromNested =
    nested && typeof nested === "object" && !Array.isArray(nested)
      ? (nested as { materialIdentity?: unknown }).materialIdentity
      : null;
  const raw = fromNested || o.materialIdentity;
  if (!raw || typeof raw !== "object") return null;
  return raw as {
    inventories?: Array<{
      kind?: string;
      label?: string;
      items?: Array<{
        id?: string;
        label?: string;
        class?: string | null;
        fileHitCount?: number;
        usageShare?: number;
        scope?: string;
      }>;
      totalCount?: number;
    }>;
    compositions?: Array<{
      kind?: string;
      label?: string;
      primary?: string | null;
    }>;
    tagSets?: Array<{ kind?: string; tags?: string[]; primary?: string | null }>;
  };
}

function statusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case "measured":
      return "border-emerald-300/35 bg-emerald-300/12 text-emerald-100";
    case "estimated":
      return "border-sky-300/35 bg-sky-300/10 text-sky-100";
    case "expanded-fill":
      return "border-white/10 bg-white/[0.04] text-neutral-500";
    case "not_run":
    case "not_implemented":
      return "border-amber-300/30 bg-amber-300/10 text-amber-100/90";
    case "insufficient_evidence":
      return "border-rose-300/25 bg-rose-300/8 text-rose-100/85";
    default:
      return "border-white/10 bg-white/[0.04] text-neutral-500";
  }
}

function statusLabel(status: string | null | undefined): string {
  switch (status) {
    case "measured":
      return "measured";
    case "estimated":
      return "estimated";
    case "expanded-fill":
      return "catalogue fill";
    case "not_run":
      return "not run";
    case "not_implemented":
      return "not implemented";
    case "insufficient_evidence":
      return "insufficient evidence";
    default:
      return "unknown";
  }
}

export type DepositOptionCardProps = {
  option: DepositRealSynthesisOption;
  realSynthesis: NonNullable<DepositRealSynthesis>;
  depositRouteSession: DepositRouteSession;
  reviewDecision: DepositOptionReviewDecisionState;
  selected: boolean;
  resynthesisOpen: boolean;
  resynthesisInstructions: string;
  settledDemandEstimate: DepositSettledDemandEstimate | null;
  onOptionReviewDecision: (
    optionId: string,
    decision: DepositOptionReviewDecisionState,
  ) => void | Promise<void>;
  onToggleSelect: (optionId: string) => void;
  onResynthesisForOptionIdChange: (optionId: string | null) => void;
  onResynthesisInstructionsChange: (value: string) => void;
  onResynthesize: (optionId: string, instructions: string) => void | Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRecordActivity: (draft: any) => void | Promise<unknown>;
};

export function DepositOptionCard(props: DepositOptionCardProps) {
  const {
    option,
    realSynthesis,
    depositRouteSession,
    reviewDecision,
    selected,
    resynthesisOpen,
    resynthesisInstructions,
    settledDemandEstimate,
    onOptionReviewDecision,
    onToggleSelect,
    onResynthesisForOptionIdChange,
    onResynthesisInstructionsChange,
    onResynthesize,
    onRecordActivity,
  } = props;

  const reviewed = reviewDecision !== "pending-depositor-review";
  const policyEvaluation = depositRouteSession.policy.evaluations.find(
    (evaluation) => evaluation.optionId === option.optionId,
  );
  const admissionReceipt = depositRouteSession.admission.receipts.find(
    (receipt) => receipt.optionId === option.optionId,
  );
  /** True only when the pack is actually in the Depository — not mere review decision. */
  const admittedToDepository =
    admissionReceipt?.admission.state === "admitted-to-depository";
  const downloadJsonFile = (file: {
    filename: string;
    mimeType: string;
    body: string;
  }) => {
    const blob = new Blob([file.body], { type: file.mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };
  const handleDownloadPatchfile = () => {
    downloadJsonFile(buildDepositOptionPatchfileDownload(option));
  };
  const handleDownloadReviewArtifact = () => {
    downloadJsonFile(buildDepositOptionReviewArtifact(option));
  };
  const earningStatement =
    depositRouteSession.earningSupplyIntelligence.earningStatements.find(
      (statement) => statement.optionId === option.optionId,
    );
  const supplyRecommendation =
    depositRouteSession.earningSupplyIntelligence.supplyRecommendations.find(
      (recommendation) => recommendation.optionId === option.optionId,
    );
  const projection = realSynthesis.reviewProjections.find(
    (entry) => entry.optionId === option.optionId,
  );

  return (
    <article
      data-testid={`deposit-option-${option.kind}`}
      className={`grid min-w-0 gap-4 border px-4 py-4 ${
        reviewed
          ? "border-violet-300/38 bg-violet-300/10"
          : "border-white/10 bg-black/20"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
            {option.kind}
          </p>
          <button
            type="button"
            aria-label="Anchor this AssetPack to the activity ledger"
            title="Anchor AssetPack to the activity ledger"
            onClick={() => {
              void onRecordActivity({
                type: "pipeline:deposit-option-anchor",
                status: "completed",
                summary: `Anchored ${option.title} to the activity ledger.`,
                selectAfterRecord: false,
                output: {
                  assetPackTitle: option.title,
                  optionId: option.optionId,
                  optionRoots: option.roots,
                },
                context: {
                  source: "deposit-option-anchor",
                  workbench: "deposit-option-review",
                  optionId: option.optionId,
                },
              });
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-neutral-300 transition hover:border-emerald-300/35 hover:bg-emerald-300/10"
          >
            <Anchor className="h-3.5 w-3.5" />
          </button>
        </div>
        <h3 className="mt-2 text-base font-semibold text-white">{option.title}</h3>
        <p className="mt-2 text-sm leading-6 text-neutral-400">{option.summary}</p>
        {option.contents ? (
          // The deposit/no-deposit decision payload: what Bitcode RECEIVES if
          // this AssetPack is deposited — synthesized AP contents + provenant
          // source files.
          <div className="mt-3 border border-emerald-300/20 bg-emerald-300/[0.05] px-3 py-3">
            <p className="text-[0.58rem] font-medium uppercase tracking-[0.16em] text-emerald-200/85">
              If deposited, Bitcode receives
            </p>
            {option.contents.patchSummary ? (
              <p className="mt-2 break-words text-xs leading-5 text-neutral-300">
                {option.contents.patchSummary}
              </p>
            ) : null}
            {option.contents.fileChanges.length > 0 ? (
              <div className="mt-2">
                <p className="text-[0.56rem] uppercase tracking-[0.14em] text-neutral-500">
                  Synthesized contents · {option.contents.fileChanges.length}{" "}
                  file
                  {option.contents.fileChanges.length === 1 ? "" : "s"}
                </p>
                <ul className="mt-1 max-h-32 space-y-0.5 overflow-y-auto break-all font-mono text-[0.7rem]">
                  {option.contents.fileChanges.map((change) => (
                    <li
                      key={`${change.op}:${change.path}`}
                      className="flex items-baseline gap-1.5"
                    >
                      <span
                        className={`shrink-0 uppercase ${
                          change.op === "create"
                            ? "text-emerald-300/80"
                            : change.op === "delete"
                              ? "text-rose-300/80"
                              : "text-amber-300/80"
                        }`}
                      >
                        {change.op}
                      </span>
                      <span className="text-neutral-400">{change.path}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-2">
              <p className="text-[0.56rem] uppercase tracking-[0.14em] text-neutral-500">
                Provenant source · {option.contents.provenantSourceCount} file
                {option.contents.provenantSourceCount === 1 ? "" : "s"} available
                to Bitcode
              </p>
              <ul className="mt-1 max-h-32 overflow-y-auto break-all font-mono text-[0.7rem] text-neutral-400">
                {option.contents.provenantSourcePaths.map((path) => (
                  <li key={path}>{path}</li>
                ))}
              </ul>
            </div>
            {projection?.measurementRationale ? (
              <p className="mt-2 break-words text-[0.7rem] leading-5 text-neutral-500">
                {projection.measurementRationale}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                data-testid={`deposit-option-download-review-${option.kind}`}
                onClick={handleDownloadReviewArtifact}
                className="border border-violet-300/35 bg-violet-300/12 px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-violet-50 transition hover:border-violet-200/50 hover:bg-violet-300/18"
              >
                Download DataPack artifact
              </button>
              <button
                type="button"
                data-testid={`deposit-option-download-patch-${option.kind}`}
                onClick={handleDownloadPatchfile}
                className="border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/50 hover:bg-emerald-300/16"
              >
                Download path-op patch
              </button>
            </div>
          </div>
        ) : projection ? (
          <details className="mt-2 text-xs leading-5 text-neutral-400">
            <summary className="cursor-pointer text-neutral-300">
              Covered source ({projection.coveredSourcePaths.length} paths)
            </summary>
            <ul className="mt-1 max-h-32 overflow-y-auto break-all font-mono">
              {projection.coveredSourcePaths.map((path) => (
                <li key={path}>{path}</li>
              ))}
            </ul>
            <p className="mt-2 text-neutral-500">
              {projection.measurementRationale}
            </p>
          </details>
        ) : null}
      </div>

      <dl className="grid gap-2">
        {policyEvaluation ? (
          <>
            <div className="border border-emerald-300/15 bg-emerald-300/[0.04] px-3 py-2">
              <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                Policy
              </dt>
              <dd className="mt-1 text-sm text-emerald-100">
                {admittedToDepository
                  ? "admitted-to-depository"
                  : policyEvaluation.policyDecision}
              </dd>
              {admittedToDepository &&
              policyEvaluation.policyDecision === "blocked-before-admission" ? (
                <p className="mt-1 text-[0.7rem] leading-5 text-amber-100/90">
                  Depositor confirmed deposit. Soft policy signals (ROI / demand /
                  compensation) remain estimates — not active blocks.
                </p>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                  Criticality
                </dt>
                <dd className="mt-1 text-sm text-neutral-200">
                  {policyEvaluation.sourceCriticality.state}
                </dd>
              </div>
              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                  Demand
                </dt>
                <dd className="mt-1 text-sm text-neutral-200">
                  {policyEvaluation.demand.state === "unestimatable-demand" ? (
                    <span className="text-amber-100/95">Unestimatable</span>
                  ) : (
                    policyEvaluation.demand.state
                  )}
                </dd>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                  ROI
                </dt>
                <dd className="mt-1 text-sm text-neutral-200">
                  {policyEvaluation.roi.state} /{" "}
                  {policyEvaluation.roi.expectedNetSats} sats net
                </dd>
              </div>
              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                  BTD potential
                </dt>
                <dd className="mt-1 text-sm text-neutral-200">
                  {policyEvaluation.btdPotential.state}
                </dd>
              </div>
            </div>
            <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
              <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                Compensation
              </dt>
              <dd className="mt-1 text-sm text-neutral-200">
                {policyEvaluation.compensation.state}
              </dd>
            </div>
            <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
              <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                {"BTC source-to-shares preview"}
              </dt>
              <dd className="mt-1 text-sm text-neutral-200">
                depositor{" "}
                {policyEvaluation.compensation.depositorShareBasisPoints / 100}%
                / treasury{" "}
                {policyEvaluation.compensation.protocolTreasuryBasisPoints /
                  100}
                % / {policyEvaluation.compensation.sourceToSharesProofState}
              </dd>
            </div>
            {admissionReceipt ? (
              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                  Admission
                </dt>
                <dd className="mt-1 text-sm text-neutral-200">
                  {admissionReceipt.admission.state} /{" "}
                  {admissionReceipt.packsActivitySync.state}
                </dd>
              </div>
            ) : null}
            {earningStatement ? (
              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                  Earning estimate
                </dt>
                <dd className="mt-1 text-sm text-neutral-200">
                  {earningStatement.state === "unestimatable-demand" ? (
                    <span className="text-amber-100/95">
                      Unestimatable
                      {settledDemandEstimate?.rationale ? (
                        <span className="mt-1 block text-[0.7rem] leading-5 text-neutral-400">
                          {settledDemandEstimate.rationale}
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    <>
                      {earningStatement.expectedCompensationRangeSats.low}-
                      {earningStatement.expectedCompensationRangeSats.high} sats
                      / {earningStatement.state}
                    </>
                  )}
                </dd>
              </div>
            ) : null}
            {supplyRecommendation ? (
              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                  Recommendation
                </dt>
                <dd className="mt-1 text-sm text-neutral-200">
                  {supplyRecommendation.action}
                </dd>
              </div>
            ) : null}
          </>
        ) : null}
        <DepositOptionNeedinessBlock
          option={option}
          policyDemandState={policyEvaluation?.demand.state}
          settledDemandEstimate={settledDemandEstimate}
        />
        {(() => {
          // Flat array (legacy UI) or nested { absolutes } from selection envelope.
          const rawMeasurements = Array.isArray(option.measurements)
            ? option.measurements
            : Array.isArray(
                  (option.measurements as { absolutes?: unknown } | undefined)
                    ?.absolutes,
                )
              ? (option.measurements as { absolutes: AbsoluteMeasurementLike[] })
                  .absolutes
              : [];
          const expanded = expandAbsoluteMeasurementsToFullCatalog(
            rawMeasurements as AbsoluteMeasurementLike[],
          );
          const measureReport = resolveOptionMeasureReport(option);
          const materialIdentity = resolveOptionMaterialIdentity(option);
          const measuredCount =
            measureReport?.measuredKindCount ?? countMeasuredAbsolutes(expanded);
          const fillCount =
            measureReport?.expandedFillCount ??
            countExpandedFillAbsolutes(expanded);
          const depInventory =
            materialIdentity?.inventories?.find(
              (inv) =>
                inv.kind === "dependencies" ||
                /depend/i.test(String(inv.label || "")),
            ) || materialIdentity?.inventories?.[0];
          const depItems = Array.isArray(depInventory?.items)
            ? [...depInventory.items]
                .sort(
                  (a, b) =>
                    (b.usageShare ?? 0) - (a.usageShare ?? 0) ||
                    (b.fileHitCount ?? 0) - (a.fileHitCount ?? 0),
                )
                .slice(0, 12)
            : [];

          return (
            <>
              {/* Measure honesty strip — bodies / coverage / fill counts. */}
              <div
                data-testid="deposit-option-measure-report"
                className="border border-violet-300/25 bg-violet-300/[0.06] px-3 py-2"
              >
                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-violet-100/80">
                  Measure report
                </dt>
                <dd className="mt-1 text-xs leading-5 text-neutral-300">
                  {measureReport ? (
                    <>
                      Measured from{" "}
                      <span className="text-violet-100">
                        {measureReport.measuredFromBodies}
                      </span>{" "}
                      file
                      {measureReport.measuredFromBodies === 1 ? "" : "s"}
                      {" · "}
                      coverage{" "}
                      {(measureReport.bodyCoverageRatio * 100).toFixed(0)}%
                      {" · "}
                      mode{" "}
                      <span className="uppercase tracking-wide text-violet-100/90">
                        {measureReport.mode}
                      </span>
                      {" · "}
                      {measuredCount} measured / estimated
                      {" · "}
                      {fillCount} catalogue fill
                    </>
                  ) : (
                    <>
                      {measuredCount} measured / estimated · {fillCount}{" "}
                      catalogue fill
                      {expanded.length > 0
                        ? ` · ${expanded.length} catalogue rows`
                        : ""}
                    </>
                  )}
                </dd>
              </div>

              {/* Material identity — languages / frameworks / deps by usage. */}
              {materialIdentity ? (
                <div
                  data-testid="deposit-option-material-identity"
                  className="border border-cyan-300/20 bg-cyan-300/[0.05] px-3 py-3"
                >
                  <p className="text-[0.58rem] uppercase tracking-[0.14em] text-cyan-100/85">
                    Material identity
                  </p>
                  {Array.isArray(materialIdentity.compositions) &&
                  materialIdentity.compositions.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {materialIdentity.compositions.slice(0, 6).map((c) => (
                        <li
                          key={String(c.kind || c.label)}
                          className="border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[0.65rem] text-cyan-50/90"
                        >
                          {c.label || c.kind}
                          {c.primary ? `: ${c.primary}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {depItems.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">
                        Dependencies by usage
                        {typeof depInventory?.totalCount === "number"
                          ? ` · ${depInventory.totalCount} total`
                          : ""}
                      </p>
                      <ul className="mt-1 max-h-36 space-y-0.5 overflow-y-auto font-mono text-[0.68rem]">
                        {depItems.map((item) => (
                          <li
                            key={String(item.id || item.label)}
                            className="flex flex-wrap items-baseline gap-x-2 text-neutral-300"
                          >
                            <span className="text-neutral-100">
                              {item.label || item.id}
                            </span>
                            {item.class ? (
                              <span className="text-neutral-500">
                                {item.class}
                              </span>
                            ) : null}
                            {typeof item.fileHitCount === "number" ? (
                              <span className="text-neutral-500">
                                hits {item.fileHitCount}
                              </span>
                            ) : null}
                            {typeof item.usageShare === "number" ? (
                              <span className="text-cyan-100/70">
                                {(item.usageShare * 100).toFixed(0)}% usage
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-2 text-[0.7rem] text-neutral-500">
                      No dependency inventory on this measure (manifests may be
                      outside pack scope).
                    </p>
                  )}
                  {Array.isArray(materialIdentity.tagSets) &&
                  materialIdentity.tagSets.some(
                    (t) => Array.isArray(t.tags) && t.tags.length > 0,
                  ) ? (
                    <ul className="mt-2 flex flex-wrap gap-1">
                      {materialIdentity.tagSets
                        .flatMap((t) => t.tags || [])
                        .slice(0, 10)
                        .map((tag) => (
                          <li
                            key={tag}
                            className="border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[0.62rem] text-neutral-400"
                          >
                            {tag}
                          </li>
                        ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              {/* Full commercial catalogue — honesty badge per row. */}
              {expanded.map((measurement) => {
                const status =
                  typeof measurement.status === "string"
                    ? measurement.status
                    : null;
                const isFill = status === "expanded-fill";
                return (
                  <div
                    key={measurement.measurementKind || measurement.id}
                    className={`border px-3 py-2 ${
                      isFill
                        ? "border-white/6 bg-white/[0.02]"
                        : "border-white/8 bg-white/[0.035]"
                    }`}
                  >
                    <dt className="flex flex-wrap items-center gap-2 text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                      <span>{measurement.label}</span>
                      <span
                        className={`rounded-sm border px-1.5 py-0.5 text-[0.52rem] font-medium normal-case tracking-normal ${statusBadgeClass(status)}`}
                      >
                        {statusLabel(status)}
                      </span>
                    </dt>
                    <dd
                      className={`mt-1 text-sm ${isFill ? "text-neutral-500" : "text-neutral-200"}`}
                    >
                      {isFill ? (
                        <span className="text-xs">
                          Not measured — catalogue placeholder
                        </span>
                      ) : typeof measurement.magnitude === "number" ? (
                        <>
                          {measurement.magnitude}
                          {measurement.unit &&
                          measurement.unit !== "normalized" &&
                          measurement.unit !== "estimate"
                            ? ` ${measurement.unit}`
                            : ""}
                          <span className="text-neutral-500">
                            {" "}
                            · {(measurement.volume * 100).toFixed(0)}% / weight{" "}
                            {measurement.weight.toFixed(3)}
                          </span>
                        </>
                      ) : (
                        <>
                          {(measurement.volume * 100).toFixed(0)}% / weight{" "}
                          {measurement.weight.toFixed(3)}
                        </>
                      )}
                    </dd>
                    {!isFill &&
                    typeof measurement.descriptor === "string" &&
                    measurement.descriptor.trim() ? (
                      <p className="mt-1 text-[0.68rem] leading-5 text-neutral-500">
                        {measurement.descriptor.trim()}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </>
          );
        })()}
      </dl>

      <details className="border border-emerald-300/15 bg-emerald-300/[0.04] px-3 py-3">
        <summary className="cursor-pointer text-[0.62rem] uppercase tracking-[0.16em] text-emerald-100/85">
          Option roots + full details
        </summary>
        <dl className="mt-2 grid gap-2">
          <div>
            <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">
              optionId
            </dt>
            <dd className="break-all font-mono text-[0.66rem] text-neutral-300">
              {option.optionId}
            </dd>
          </div>
          {Object.entries(option.roots).map(([label, value]) => (
            <div key={label}>
              <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">
                {label}
              </dt>
              <dd className="break-all font-mono text-[0.66rem] text-neutral-300">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        {!option.contents ? (
          <button
            type="button"
            data-testid={`deposit-option-download-patch-fallback-${option.kind}`}
            onClick={handleDownloadPatchfile}
            className="mt-3 border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/50 hover:bg-emerald-300/16"
          >
            Download patchfile
          </button>
        ) : null}
      </details>

      <div className="grid gap-2">
        {/* North-star step D: select packs to deposit; one batch action admits
            the selected set. Archive (re-depositable) and Resynthesize are secondary. */}
        {admittedToDepository ? (
          <p className="border border-emerald-300/30 bg-emerald-300/12 px-4 py-3 text-sm font-medium text-emerald-100">
            Admitted to Depository — permanent
          </p>
        ) : reviewDecision === "approved-for-admission" &&
          admissionReceipt &&
          admissionReceipt.admission.state !== "admitted-to-depository" ? (
          <p className="border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            Not admitted
            {admissionReceipt.admission.blockers.length
              ? `: ${admissionReceipt.admission.blockers.join(", ")}`
              : " — policy blocked."}
          </p>
        ) : (
          <>
            <button
              type="button"
              data-testid={`deposit-option-select-${option.kind}`}
              aria-pressed={selected}
              onClick={() => onToggleSelect(option.optionId)}
              className={`border px-4 py-3 text-sm font-medium transition ${
                selected
                  ? "border-emerald-300/45 bg-emerald-300/18 text-emerald-100 hover:border-emerald-200/60 hover:bg-emerald-300/24"
                  : "border-white/15 bg-white/[0.04] text-neutral-200 hover:border-emerald-300/35 hover:bg-emerald-300/10"
              }`}
            >
              {selected ? "Selected for deposit ✓" : "Select for deposit"}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  void onOptionReviewDecision(
                    option.optionId,
                    "rejected-by-depositor",
                  );
                }}
                className="border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-neutral-200 transition hover:border-sky-300/30 hover:bg-sky-300/10"
              >
                {reviewDecision === "rejected-by-depositor"
                  ? "Archived"
                  : "Archive"}
              </button>
              <button
                type="button"
                onClick={() =>
                  onResynthesisForOptionIdChange(
                    resynthesisOpen ? null : option.optionId,
                  )
                }
                className="border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-neutral-200 transition hover:border-amber-300/30 hover:bg-amber-300/10"
              >
                {resynthesisOpen ? "Cancel resynthesis" : "Resynthesize"}
              </button>
            </div>
            {resynthesisOpen ? (
              <div className="grid gap-2 border border-amber-300/20 bg-amber-300/[0.04] px-3 py-3">
                <label className="text-[0.6rem] uppercase tracking-[0.16em] text-amber-100/80">
                  Optional new synthesis instructions
                </label>
                <textarea
                  rows={2}
                  value={resynthesisInstructions}
                  onChange={(event) =>
                    onResynthesisInstructionsChange(event.target.value)
                  }
                  placeholder="Steer the re-run, or leave blank to resynthesize with current instructions…"
                  className="w-full border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none transition focus:border-amber-300/40"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = resynthesisInstructions.trim();
                    onResynthesisForOptionIdChange(null);
                    onResynthesisInstructionsChange("");
                    void onResynthesize(option.optionId, trimmed);
                  }}
                  className="border border-amber-300/35 bg-amber-300/15 px-3 py-2 text-xs font-medium text-amber-100 transition hover:border-amber-200/55 hover:bg-amber-300/22"
                >
                  Resynthesize now
                </button>
              </div>
            ) : null}
          </>
        )}
        {reviewDecision === "rejected-by-depositor" ? (
          <p className="text-xs leading-5 text-neutral-400">
            Archived — visible in your packs and re-depositable anytime;
            measurements go stale over time, so re-deposit triggers resynthesis.
          </p>
        ) : null}
        <p className="text-[0.66rem] uppercase tracking-[0.14em] text-neutral-500">
          {reviewDecision === "approved-for-admission"
            ? "admitted to depository"
            : reviewDecision === "rejected-by-depositor"
              ? "archived by depositor"
              : selected
                ? "selected for deposit"
                : "Pending depositor review"}
        </p>
      </div>
    </article>
  );
}

/** Neediness / est. read demand — settled-Depository grounded, fail-closed. */
function DepositOptionNeedinessBlock({
  option,
  policyDemandState,
  settledDemandEstimate,
}: {
  option: DepositRealSynthesisOption;
  policyDemandState: string | undefined;
  settledDemandEstimate: DepositSettledDemandEstimate | null;
}) {
  // Prefer settled-Depository grounding over LLM-invented neediness.
  const rationale =
    option.neediness?.rationale || settledDemandEstimate?.rationale || "";
  const unestimatable =
    settledDemandEstimate?.estimatable === false ||
    policyDemandState === "unestimatable-demand" ||
    rationale.startsWith("Unestimatable");
  if (unestimatable) {
    return (
      <div className="min-w-0 border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2">
        <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-amber-200/85">
          Neediness · est. read demand
        </dt>
        <dd className="mt-1 text-sm text-amber-100/95">Unestimatable</dd>
        {rationale ? (
          <dd className="mt-1 break-words text-[0.7rem] leading-5 text-neutral-400">
            {rationale}
          </dd>
        ) : (
          <dd className="mt-1 break-words text-[0.7rem] leading-5 text-neutral-400">
            Unestimatable: settled Depository DataPack demand has not been
            measured for this option.
          </dd>
        )}
      </div>
    );
  }
  // Settled-grounded display: prefer option neediness when already grounded;
  // else fall back to corpus estimate.
  const demand = option.neediness?.demand ?? settledDemandEstimate?.demand ?? null;
  const saturation =
    option.neediness?.saturation ?? settledDemandEstimate?.saturation ?? null;
  const volume =
    option.neediness?.volume ??
    settledDemandEstimate?.needinessVolume ??
    (typeof demand === "number" && typeof saturation === "number"
      ? demand * (0.5 + 0.5 * (1 - saturation))
      : null);
  if (
    typeof volume !== "number" ||
    typeof demand !== "number" ||
    typeof saturation !== "number"
  ) {
    return (
      <div className="min-w-0 border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2">
        <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-amber-200/85">
          Neediness · est. read demand
        </dt>
        <dd className="mt-1 text-sm text-amber-100/95">Unestimatable</dd>
        <dd className="mt-1 break-words text-[0.7rem] leading-5 text-neutral-400">
          Unestimatable: no settled Depository neediness signal for this
          AssetPack option.
        </dd>
      </div>
    );
  }
  return (
    <div className="min-w-0 border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2">
      <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-amber-200/85">
        Neediness · est. read demand
      </dt>
      <dd className="mt-1 text-sm text-neutral-100">
        {(volume * 100).toFixed(0)}%
        <span className="text-neutral-500">
          {" "}
          · demand {(demand * 100).toFixed(0)}% · saturation{" "}
          {(saturation * 100).toFixed(0)}%
        </span>
      </dd>
      {rationale || settledDemandEstimate?.rationale ? (
        <dd className="mt-1 break-words text-[0.7rem] leading-5 text-neutral-400">
          {rationale || settledDemandEstimate?.rationale}
        </dd>
      ) : null}
    </div>
  );
}
