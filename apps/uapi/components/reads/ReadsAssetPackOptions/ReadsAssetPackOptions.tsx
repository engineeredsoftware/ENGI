/**
 * Read AssetPack options list + settle footer (deposit AssetPackOptions twin).
 */
"use client";

import React from "react";
import type {
  ReadSelectionEnvelope,
  ReadSynthesizedOption,
} from "@/components/reads/ReadPageClient/hooks/use-read-option-synthesis";
import { ReadsOptionCard } from "@/components/reads/ReadsOptionCard/ReadsOptionCard";

export function ReadsAssetPackOptions(props: {
  options: ReadSynthesizedOption[];
  envelope: ReadSelectionEnvelope | null;
  selectedIndexes: number[];
  onToggleSelect: (index: number) => void;
  onSettleSelected: () => void;
  settleBusy?: boolean;
  settleError?: string | null;
  settleMessage?: string | null;
}) {
  const {
    options,
    envelope,
    selectedIndexes,
    onToggleSelect,
    onSettleSelected,
    settleBusy,
    settleError,
    settleMessage,
  } = props;

  const hasOptions = options.length > 0;

  return (
    <section
      data-testid="reads-asset-pack-options"
      className="border border-white/10 bg-white/[0.035] px-4 py-4"
      aria-label="Read AssetPack options"
    >
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-orange-200/80">
        Source-safe proposals
      </p>
      <h2 className="mt-2 text-lg font-semibold text-white">AssetPack options</h2>

      {envelope?.validationSummary ? (
        <p className="mt-2 text-xs text-neutral-400">{envelope.validationSummary}</p>
      ) : null}

      {!hasOptions ? (
        <div
          data-testid="reads-options-await-synthesis"
          className="mt-3 border border-white/10 bg-black/20 px-4 py-6 text-sm text-neutral-400"
        >
          Measured AssetPack options appear here after synthesis — select a repository
          and SHA, describe the Need, set Relevant / Irrelevant paths, then Synthesize.
        </div>
      ) : (
        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          {options.map((opt) => (
            <ReadsOptionCard
              key={opt.index}
              option={opt}
              selected={selectedIndexes.includes(opt.index)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}

      {hasOptions ? (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            data-testid="reads-settle-selected"
            onClick={() => void onSettleSelected()}
            disabled={selectedIndexes.length === 0 || settleBusy}
            className="border border-emerald-300/40 bg-emerald-400/15 px-4 py-2 text-sm font-medium text-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {settleBusy
              ? "Settling…"
              : `Settle selected (${selectedIndexes.length})`}
          </button>
          {settleError ? (
            <p className="text-sm text-rose-200">{settleError}</p>
          ) : null}
          {settleMessage ? (
            <p className="text-sm text-emerald-100/90">{settleMessage}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
