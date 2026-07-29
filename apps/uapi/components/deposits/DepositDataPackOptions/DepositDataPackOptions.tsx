'use client';

/**
 * Deposit AssetPack options review panel — proposals list shell + batch deposit.
 * Per-option card body lives in DepositOptionCard; parent owns synthesis state.
 */

import React from "react";
import Link from "next/link";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/components/deposits/models/deposit-explainers";
import { DepositOptionCard } from "@/components/deposits/DepositOptionCard/DepositOptionCard";
import type { DepositDataPackOptionsProps } from "./DepositDataPackOptions.types";

export type {
  DepositDataPackOptionsProps,
  DepositRealSynthesis,
  DepositRealSynthesisOption,
} from "./DepositDataPackOptions.types";

export function DepositDataPackOptions(props: DepositDataPackOptionsProps) {
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
    onRecordActivity,
  } = props;

  const options = realSynthesis ? depositRouteSession.synthesis.options : [];

  return (
    <section
      id="deposit-section-review"
      className="min-w-0 max-w-full overflow-x-hidden border border-white/10 bg-white/[0.035] px-4 py-4"
      aria-label="Deposit DataPack options"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
            Source-Safe Proposals
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
            <span>DataPack Options</span>
            <BitcodeInlineExplainer
              explainer={DEPOSIT_SECTION_EXPLAINERS.options}
            />
          </h2>
        </div>
      </div>

      {realSynthesis?.synthesis?.inference ? (
        <p
          data-testid="deposit-synthesis-inference"
          className="mt-3 border border-emerald-300/12 bg-emerald-300/[0.05] px-3 py-2 text-xs leading-5 text-emerald-100/90"
        >
          Measured by DataPack synthesis (deposit lens):{" "}
          {realSynthesis.synthesis.inference.model || "configured model"}
          {typeof realSynthesis.synthesis.inference.totalTokens === "number"
            ? ` · ${realSynthesis.synthesis.inference.totalTokens.toLocaleString()} tokens`
            : ""}
          {typeof realSynthesis.synthesis.inference.durationMs === "number"
            ? ` · ${(realSynthesis.synthesis.inference.durationMs / 1000).toFixed(1)}s`
            : ""}
          {realSynthesis.synthesis.exclusionPosture
            ? ` · ${realSynthesis.synthesis.exclusionPosture.impermissibleSourceCount} exclusions, ${realSynthesis.synthesis.exclusionPosture.excludedPathCount} paths withheld`
            : ""}
          {" · "}
          46 commercial absolutes (Σ weights = 1)
        </p>
      ) : null}

      {!realSynthesis ? (
        <div
          data-testid="deposit-options-await-synthesis"
          className="mt-5 border border-white/10 bg-black/20 px-4 py-6 text-sm leading-6 text-neutral-400"
        >
          Measured DataPack options appear here after synthesis — select a
          repository, describe what to synthesize, then Synthesize.
        </div>
      ) : null}

      {/*
        Each cell must min-w-0 + contain overflow so long commercial/patch text
        cannot paint into neighboring columns (multi-card bleed).
      */}
      <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 phone:grid-cols-2 laptop:grid-cols-3">
        {realSynthesis
          ? options.map((option) => {
              const reviewDecision =
                optionReviewDecisions[option.optionId] ||
                "pending-depositor-review";
              return (
                <div
                  key={option.optionId}
                  className="min-w-0 max-w-full overflow-hidden"
                >
                  <DepositOptionCard
                    option={option}
                    realSynthesis={realSynthesis}
                    depositRouteSession={depositRouteSession}
                    reviewDecision={reviewDecision}
                    selected={selectedPackIds.includes(option.optionId)}
                    resynthesisOpen={resynthesisForOptionId === option.optionId}
                    resynthesisInstructions={resynthesisInstructions}
                    settledDemandEstimate={settledDemandEstimate}
                    onOptionReviewDecision={onOptionReviewDecision}
                    onToggleSelect={onToggleSelect}
                    onResynthesisForOptionIdChange={
                      onResynthesisForOptionIdChange
                    }
                    onResynthesisInstructionsChange={
                      onResynthesisInstructionsChange
                    }
                    onResynthesize={onResynthesize}
                    onRecordActivity={onRecordActivity}
                  />
                </div>
              );
            })
          : null}
      </div>

      {realSynthesis ? (
        <div
          className="mt-4 border border-emerald-300/20 bg-emerald-300/[0.04] px-4 py-4"
          aria-label="Deposit selected DataPacks"
        >
          {depositRouteSession.admission.admittedCount > 0 ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-emerald-300/35 bg-emerald-300/15 px-4 py-3">
              <p className="text-sm font-medium text-emerald-100">
                ✓ {depositRouteSession.admission.admittedCount} DataPack
                {depositRouteSession.admission.admittedCount === 1 ? "" : "s"}{" "}
                deposited to the Depository — permanent.
              </p>
              <Link
                href="/exchange?type=depository-assetpack"
                className="inline-flex items-center border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-medium text-emerald-100 transition hover:border-emerald-200/45 hover:bg-emerald-300/18"
              >
                View on Exchange
              </Link>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-300">
              {selectedPackIds.length === 0
                ? "Select the DataPacks you want to deposit, then deposit the set in one step."
                : `${selectedPackIds.length} DataPack${
                    selectedPackIds.length === 1 ? "" : "s"
                  } selected for deposit.`}
            </p>
            <button
              type="button"
              data-testid="deposit-selected-packs"
              disabled={selectedPackIds.length === 0}
              onClick={() => {
                void onDepositSelected();
              }}
              className={`border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                confirmingBatchDeposit
                  ? "border-amber-300/45 bg-amber-300/15 text-amber-100 hover:border-amber-200/60 hover:bg-amber-300/20"
                  : "border-emerald-300/30 bg-emerald-300/14 text-emerald-100 hover:border-emerald-200/50 hover:bg-emerald-300/20"
              }`}
            >
              {confirmingBatchDeposit
                ? `Confirm deposit of ${selectedPackIds.length} DataPack${
                    selectedPackIds.length === 1 ? "" : "s"
                  }`
                : selectedPackIds.length
                  ? `Deposit ${selectedPackIds.length} selected DataPack${
                      selectedPackIds.length === 1 ? "" : "s"
                    }`
                  : "Deposit selected DataPacks"}
            </button>
          </div>
          {confirmingBatchDeposit ? (
            <p className="mt-3 text-xs leading-5 text-amber-100/85">
              Deposit is final: the selected DataPacks are admitted to the
              Bitcode Depository permanently. Confirm to deposit, or change the
              selection to stand down.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
