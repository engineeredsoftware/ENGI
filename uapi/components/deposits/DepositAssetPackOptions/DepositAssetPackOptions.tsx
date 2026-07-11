/**
 * Deposit AssetPack options review panel — proposals, selection, batch deposit.
 * Presentational; parent owns synthesis results, review decisions, and deposit handlers.
 */
"use client";

import React from "react";
import Link from "next/link";
import { Anchor, Sparkles } from "lucide-react";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import { TelemetryExplainerTrigger } from "@/components/bitcode/pipeline/TelemetryExplainerTrigger/TelemetryExplainerTrigger";
import { formatSats } from "@/components/deposits/models/deposit-format";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/components/deposits/models/deposit-explainers";
import type { DepositRouteSession } from "@/components/deposits/models/deposit-route-model";
import type { DepositOptionReviewDecisionState } from "@bitcode/pipeline-asset-pack/deposit-asset-pack-option-admission";
import type { DepositSettledDemandEstimate } from "@/components/deposits/DepositRouteStateAside/DepositRouteStateAside";

export type DepositRealSynthesis = {
  synthesis: DepositRouteSession["synthesis"] & {
    synthesisMode?: string;
    inference?: {
      provider: string | null;
      model: string | null;
      totalTokens: number | null;
      durationMs: number | null;
    };
    exclusionPosture?: {
      forcedExclusionCount: number;
      excludedPathCount: number;
      droppedCandidateCount: number;
    };
  };
  reviewProjections: Array<{
    optionId: string;
    title: string;
    coveredSourcePaths: string[];
    measurementRationale: string;
  }>;
} | null;

export type DepositAssetPackOptionsProps = {
  realSynthesis: DepositRealSynthesis;
  depositRouteSession: DepositRouteSession;
  optionReviewDecisions: Record<string, DepositOptionReviewDecisionState>;
  selectedPackIds: string[];
  confirmingBatchDeposit: boolean;
  resynthesisForOptionId: string | null;
  resynthesisInstructions: string;
  settledDemandEstimate: DepositSettledDemandEstimate;
  onOptionReviewDecision: (
    optionId: string,
    decision: DepositOptionReviewDecisionState,
  ) => void | Promise<void>;
  onToggleSelect: (optionId: string) => void;
  onDepositSelected: () => void | Promise<void>;
  onResynthesisForOptionIdChange: (optionId: string | null) => void;
  onResynthesisInstructionsChange: (value: string) => void;
  onResynthesize: (optionId: string, instructions: string) => void | Promise<void>;
  onAnchorOption: (option: DepositRouteSession["synthesis"]["options"][number]) => void | Promise<void>;
  onRecordActivity: (draft: any) => void | Promise<unknown>;
};

export function DepositAssetPackOptions(props: DepositAssetPackOptionsProps) {
  const {
    realSynthesis,
    depositRouteSession,
    optionReviewDecisions,
    selectedPackIds,
    confirmingBatchDeposit,
    resynthesisForOptionId,
    resynthesisInstructions,
    settledDemandEstimate,
    onOptionReviewDecision,
    onToggleSelect,
    onDepositSelected,
    onResynthesisForOptionIdChange,
    onResynthesisInstructionsChange,
    onResynthesize,
    onAnchorOption,
    onRecordActivity,
  } = props;

  return (
            <section
              id="deposit-section-review"
              className="border border-white/10 bg-white/[0.035] px-4 py-4"
              aria-label="Deposit AssetPack options"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
                    Source-Safe Proposals
                  </p>
                  <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                    <span>AssetPack Options</span>
                    <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.options} />
                  </h2>
                </div>
                {/* <span className="border border-emerald-300/15 bg-emerald-300/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.16em] text-emerald-100">
                  {depositRouteSession.synthesis.pipeline.replace(/([a-z])([A-Z])/g, "$1 $2")}
                </span> */}
              </div>
              {realSynthesis?.synthesis?.inference ? (
                <p
                  data-testid="deposit-synthesis-inference"
                  className="mt-3 border border-emerald-300/12 bg-emerald-300/[0.05] px-3 py-2 text-xs leading-5 text-emerald-100/90"
                >
                  Measured by AssetPacksSynthesis (deposit lens):{" "}
                  {realSynthesis.synthesis.inference.model || "configured model"}
                  {typeof realSynthesis.synthesis.inference.totalTokens ===
                    "number"
                    ? ` · ${realSynthesis.synthesis.inference.totalTokens.toLocaleString()} tokens`
                    : ""}
                  {typeof realSynthesis.synthesis.inference.durationMs ===
                    "number"
                    ? ` · ${(realSynthesis.synthesis.inference.durationMs / 1000).toFixed(1)}s`
                    : ""}
                  {realSynthesis.synthesis.exclusionPosture
                    ? ` · ${realSynthesis.synthesis.exclusionPosture.forcedExclusionCount} exclusions, ${realSynthesis.synthesis.exclusionPosture.excludedPathCount} paths withheld`
                    : ""}
                </p>
              ) : null}
              {!realSynthesis ? (
                <div
                  data-testid="deposit-options-await-synthesis"
                  className="mt-5 border border-white/10 bg-black/20 px-4 py-6 text-sm leading-6 text-neutral-400"
                >
                  Measured AssetPack options appear here after synthesis —
                  select a repository, describe what to synthesize, then
                  Synthesize.
                </div>
              ) : null}
              <div className="mt-5 grid gap-3 xl:grid-cols-3">
                {(realSynthesis
                  ? depositRouteSession.synthesis.options
                  : []
                ).map((option) => {
                  const reviewDecision =
                    optionReviewDecisions[option.optionId] ||
                    "pending-depositor-review";
                  const reviewed =
                    reviewDecision !== "pending-depositor-review";
                  const policyEvaluation =
                    depositRouteSession.policy.evaluations.find(
                      (evaluation) => evaluation.optionId === option.optionId,
                    );
                  const admissionReceipt =
                    depositRouteSession.admission.receipts.find(
                      (receipt) => receipt.optionId === option.optionId,
                    );
                  const earningStatement =
                    depositRouteSession.earningSupplyIntelligence.earningStatements.find(
                      (statement) => statement.optionId === option.optionId,
                    );
                  const supplyRecommendation =
                    depositRouteSession.earningSupplyIntelligence.supplyRecommendations.find(
                      (recommendation) =>
                        recommendation.optionId === option.optionId,
                    );
                  return (
                    <article
                      key={option.optionId}
                      data-testid={`deposit-option-${option.kind}`}
                      className={`grid min-w-0 gap-4 border px-4 py-4 ${reviewed
                        ? "border-emerald-300/38 bg-emerald-300/10"
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
                        <h3 className="mt-2 text-base font-semibold text-white">
                          {option.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-neutral-400">
                          {option.summary}
                        </p>
                        {option.contents ? (
                          // The deposit/no-deposit decision payload: what Bitcode
                          // RECEIVES if this AssetPack is deposited — the synthesized
                          // AP contents + the provenant source files.
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
                                  Synthesized contents · {option.contents.fileChanges.length} file
                                  {option.contents.fileChanges.length === 1 ? "" : "s"}
                                </p>
                                <ul className="mt-1 max-h-32 space-y-0.5 overflow-y-auto break-all font-mono text-[0.7rem]">
                                  {option.contents.fileChanges.map((change) => (
                                    <li
                                      key={`${change.op}:${change.path}`}
                                      className="flex items-baseline gap-1.5"
                                    >
                                      <span
                                        className={`shrink-0 uppercase ${change.op === "create"
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
                                {option.contents.provenantSourceCount === 1 ? "" : "s"} available to
                                Bitcode
                              </p>
                              <ul className="mt-1 max-h-32 overflow-y-auto break-all font-mono text-[0.7rem] text-neutral-400">
                                {option.contents.provenantSourcePaths.map((path) => (
                                  <li key={path}>{path}</li>
                                ))}
                              </ul>
                            </div>
                            {(() => {
                              const projection = realSynthesis?.reviewProjections.find(
                                (entry) => entry.optionId === option.optionId,
                              );
                              return projection?.measurementRationale ? (
                                <p className="mt-2 break-words text-[0.7rem] leading-5 text-neutral-500">
                                  {projection.measurementRationale}
                                </p>
                              ) : null;
                            })()}
                          </div>
                        ) : (
                          (() => {
                            const projection = realSynthesis?.reviewProjections.find(
                              (entry) => entry.optionId === option.optionId,
                            );
                            if (!projection) return null;
                            return (
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
                            );
                          })()
                        )}
                      </div>
                      <dl className="grid gap-2">
                        {policyEvaluation ? (
                          <>
                            <div className="border border-emerald-300/15 bg-emerald-300/[0.04] px-3 py-2">
                              <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                                Policy
                              </dt>
                              <dd className="mt-1 text-sm text-emerald-100">
                                {policyEvaluation.policyDecision}
                              </dd>
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
                                  {policyEvaluation.demand.state ===
                                  "unestimatable-demand" ? (
                                    <span className="text-amber-100/95">
                                      Unestimatable
                                    </span>
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
                                  {policyEvaluation.roi.expectedNetSats} sats
                                  net
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
                                {policyEvaluation.compensation
                                  .depositorShareBasisPoints / 100}
                                % / treasury{" "}
                                {policyEvaluation.compensation
                                  .protocolTreasuryBasisPoints / 100}
                                % /{" "}
                                {
                                  policyEvaluation.compensation
                                    .sourceToSharesProofState
                                }
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
                                  {earningStatement.state ===
                                  "unestimatable-demand" ? (
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
                                      {
                                        earningStatement
                                          .expectedCompensationRangeSats.low
                                      }
                                      -
                                      {
                                        earningStatement
                                          .expectedCompensationRangeSats.high
                                      }{" "}
                                      sats / {earningStatement.state}
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
                        {(() => {
                          // Prefer settled-Depository grounding over LLM-invented neediness.
                          const rationale =
                            option.neediness?.rationale ||
                            settledDemandEstimate?.rationale ||
                            "";
                          const unestimatable =
                            settledDemandEstimate?.estimatable === false ||
                            policyEvaluation?.demand.state ===
                              "unestimatable-demand" ||
                            rationale.startsWith("Unestimatable");
                          if (unestimatable) {
                            return (
                              <div className="min-w-0 border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2">
                                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-amber-200/85">
                                  Neediness · est. read demand
                                </dt>
                                <dd className="mt-1 text-sm text-amber-100/95">
                                  Unestimatable
                                </dd>
                                {rationale ? (
                                  <dd className="mt-1 break-words text-[0.7rem] leading-5 text-neutral-400">
                                    {rationale}
                                  </dd>
                                ) : (
                                  <dd className="mt-1 break-words text-[0.7rem] leading-5 text-neutral-400">
                                    Unestimatable: settled Depository AssetPack
                                    demand has not been measured for this option.
                                  </dd>
                                )}
                              </div>
                            );
                          }
                          // Settled-grounded display: prefer option neediness when
                          // already grounded; else fall back to corpus estimate.
                          const demand =
                            option.neediness?.demand ??
                            settledDemandEstimate?.demand ??
                            null;
                          const saturation =
                            option.neediness?.saturation ??
                            settledDemandEstimate?.saturation ??
                            null;
                          const volume =
                            option.neediness?.volume ??
                            settledDemandEstimate?.needinessVolume ??
                            (typeof demand === "number" &&
                            typeof saturation === "number"
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
                                <dd className="mt-1 text-sm text-amber-100/95">
                                  Unestimatable
                                </dd>
                                <dd className="mt-1 break-words text-[0.7rem] leading-5 text-neutral-400">
                                  Unestimatable: no settled Depository neediness
                                  signal for this AssetPack option.
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
                                  · demand {(demand * 100).toFixed(0)}% ·
                                  saturation {(saturation * 100).toFixed(0)}%
                                </span>
                              </dd>
                              {rationale || settledDemandEstimate?.rationale ? (
                                <dd className="mt-1 break-words text-[0.7rem] leading-5 text-neutral-400">
                                  {rationale || settledDemandEstimate?.rationale}
                                </dd>
                              ) : null}
                            </div>
                          );
                        })()}
                        {option.measurements.map((measurement) => (
                          <div
                            key={measurement.id}
                            className="border border-white/8 bg-white/[0.035] px-3 py-2"
                          >
                            <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                              {measurement.label}
                            </dt>
                            <dd className="mt-1 text-sm text-neutral-200">
                              {typeof measurement.magnitude === "number" ? (
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
                                    {measurement.weight.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <>
                                  {(measurement.volume * 100).toFixed(0)}% / weight{" "}
                                  {measurement.weight.toFixed(2)}
                                </>
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <details className="border border-emerald-300/15 bg-emerald-300/[0.04] px-3 py-3">
                        <summary className="cursor-pointer text-[0.62rem] uppercase tracking-[0.16em] text-emerald-100/85">
                          Option roots
                        </summary>
                        <dl className="mt-2 grid gap-2">
                          {Object.entries(option.roots).map(
                            ([label, value]) => (
                              <div key={label}>
                                <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">
                                  {label}
                                </dt>
                                <dd className="break-all font-mono text-[0.66rem] text-neutral-300">
                                  {value}
                                </dd>
                              </div>
                            ),
                          )}
                        </dl>
                      </details>
                      <div className="grid gap-2">
                        {/* North-star step D: select packs to deposit; one batch
                            action admits the selected set. Archive
                            (re-depositable) and Resynthesize are secondary. */}
                        {reviewDecision === "approved-for-admission" ? (
                          <p className="border border-emerald-300/30 bg-emerald-300/12 px-4 py-3 text-sm font-medium text-emerald-100">
                            Admitted to Depository — permanent
                          </p>
                        ) : (
                          <>
                            <button
                              type="button"
                              data-testid={`deposit-option-select-${option.kind}`}
                              aria-pressed={selectedPackIds.includes(
                                option.optionId,
                              )}
                              onClick={() => onToggleSelect(option.optionId)}
                              className={`border px-4 py-3 text-sm font-medium transition ${selectedPackIds.includes(option.optionId)
                                ? "border-emerald-300/45 bg-emerald-300/18 text-emerald-100 hover:border-emerald-200/60 hover:bg-emerald-300/24"
                                : "border-white/15 bg-white/[0.04] text-neutral-200 hover:border-emerald-300/35 hover:bg-emerald-300/10"
                                }`}
                            >
                              {selectedPackIds.includes(option.optionId)
                                ? "Selected for deposit ✓"
                                : "Select for deposit"}
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
                                    resynthesisForOptionId === option.optionId
                                      ? null
                                      : option.optionId,
                                  )
                                }
                                className="border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-neutral-200 transition hover:border-amber-300/30 hover:bg-amber-300/10"
                              >
                                {resynthesisForOptionId === option.optionId
                                  ? "Cancel resynthesis"
                                  : "Resynthesize"}
                              </button>
                            </div>
                            {resynthesisForOptionId === option.optionId ? (
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
                                    void onResynthesize(
                                      option.optionId,
                                      trimmed,
                                    );
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
                            Archived — visible in your packs and re-depositable
                            anytime; measurements go stale over time, so
                            re-deposit triggers resynthesis.
                          </p>
                        ) : null}
                        <p className="text-[0.66rem] uppercase tracking-[0.14em] text-neutral-500">
                          {reviewDecision === "approved-for-admission"
                            ? "admitted to depository"
                            : reviewDecision === "rejected-by-depositor"
                              ? "archived by depositor"
                              : selectedPackIds.includes(option.optionId)
                                ? "selected for deposit"
                                : "Pending depositor review"}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
              {realSynthesis ? (
                <div
                  className="mt-4 border border-emerald-300/20 bg-emerald-300/[0.04] px-4 py-4"
                  aria-label="Deposit selected AssetPacks"
                >
                  {depositRouteSession.admission.admittedCount > 0 ? (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-emerald-300/35 bg-emerald-300/15 px-4 py-3">
                      <p className="text-sm font-medium text-emerald-100">
                        ✓ {depositRouteSession.admission.admittedCount} AssetPack
                        {depositRouteSession.admission.admittedCount === 1
                          ? ""
                          : "s"}{" "}
                        deposited to the Depository — permanent.
                      </p>
                      <Link
                        href="/packs?type=depository-assetpack"
                        className="inline-flex items-center border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-medium text-emerald-100 transition hover:border-emerald-200/45 hover:bg-emerald-300/18"
                      >
                        View in your packs
                      </Link>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-neutral-300">
                      {selectedPackIds.length === 0
                        ? "Select the AssetPacks you want to deposit, then deposit the set in one step."
                        : `${selectedPackIds.length} AssetPack${selectedPackIds.length === 1 ? "" : "s"
                        } selected for deposit.`}
                    </p>
                    <button
                      type="button"
                      data-testid="deposit-selected-packs"
                      disabled={selectedPackIds.length === 0}
                      onClick={() => {
                        void onDepositSelected();
                      }}
                      className={`border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${confirmingBatchDeposit
                        ? "border-amber-300/45 bg-amber-300/15 text-amber-100 hover:border-amber-200/60 hover:bg-amber-300/20"
                        : "border-emerald-300/30 bg-emerald-300/14 text-emerald-100 hover:border-emerald-200/50 hover:bg-emerald-300/20"
                        }`}
                    >
                      {confirmingBatchDeposit
                        ? `Confirm deposit of ${selectedPackIds.length} AssetPack${selectedPackIds.length === 1 ? "" : "s"
                        }`
                        : selectedPackIds.length
                          ? `Deposit ${selectedPackIds.length} selected AssetPack${selectedPackIds.length === 1 ? "" : "s"
                          }`
                          : "Deposit selected AssetPacks"}
                    </button>
                  </div>
                  {confirmingBatchDeposit ? (
                    <p className="mt-3 text-xs leading-5 text-amber-100/85">
                      Deposit is final: the selected AssetPacks are admitted to
                      the Bitcode Depository permanently. Confirm to deposit, or
                      change the selection to stand down.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>

  );
}
