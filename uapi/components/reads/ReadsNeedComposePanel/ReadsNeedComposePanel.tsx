/**
 * Read Need compose + option synthesis/review (deposit Obfuscations twin).
 * Dispatches SynthesizeReadAssetPacks; settle is a separate action on selected options.
 */
"use client";

import React from "react";
import type {
  ReadSelectionEnvelope,
  ReadSynthesizedOption,
  ReadSynthesisStatus,
} from "@/components/reads/ReadPageClient/hooks/use-read-option-synthesis";
import { ReadsOptionCard } from "@/components/reads/ReadsOptionCard/ReadsOptionCard";

export function ReadsNeedComposePanel(props: {
  need: string;
  onNeedChange: (value: string) => void;
  status: ReadSynthesisStatus;
  error: string | null;
  runId: string | null;
  options: ReadSynthesizedOption[];
  envelope: ReadSelectionEnvelope | null;
  selectedIndexes: number[];
  onToggleSelect: (index: number) => void;
  onSynthesize: () => void;
  onSettleSelected: () => void;
  settleBusy?: boolean;
  settleError?: string | null;
  settleMessage?: string | null;
  canSynthesize: boolean;
}) {
  const {
    need,
    onNeedChange,
    status,
    error,
    runId,
    options,
    envelope,
    selectedIndexes,
    onToggleSelect,
    onSynthesize,
    onSettleSelected,
    settleBusy,
    settleError,
    settleMessage,
    canSynthesize,
  } = props;

  const running = status === "running";
  const hasOptions = options.length > 0;

  return (
    <section
      data-testid="reads-need-compose"
      className="border border-white/10 bg-white/[0.035] px-4 py-4"
      aria-label="Read Need and AssetPack options"
    >
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
        Need instruction
      </p>
      <h2 className="mt-2 text-lg font-semibold text-white">
        Synthesize read AssetPack options
      </h2>
      <p className="mt-2 text-sm leading-6 text-neutral-400">
        Same SDIVF shape as deposits: select a repository, write the Need, synthesize
        measured options (absolutes + *-fit needinesses), then settle selected options
        (BTC-testnet → BTD rights → PR ship).
      </p>

      <label htmlFor="reads-need-input" className="mt-4 block text-xs text-neutral-300">
        Need
      </label>
      <textarea
        id="reads-need-input"
        data-testid="reads-need-input"
        value={need}
        onChange={(e) => onNeedChange(e.target.value)}
        rows={5}
        placeholder="Describe the Need this reading repository should satisfy…"
        className="mt-2 w-full resize-y border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-neutral-600"
        disabled={running}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          data-testid="reads-synthesize-options"
          onClick={() => void onSynthesize()}
          disabled={!canSynthesize || running || !need.trim()}
          className="border border-sky-300/40 bg-sky-400/15 px-4 py-2 text-sm font-medium text-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {running ? "Synthesizing…" : "Synthesize options"}
        </button>
        {runId ? (
          <span className="font-mono text-[0.65rem] text-neutral-500">{runId}</span>
        ) : null}
        <span className="text-xs uppercase tracking-wide text-neutral-500">
          status: {status}
        </span>
      </div>

      {error ? (
        <p
          data-testid="reads-synthesize-error"
          className="mt-3 border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
        >
          {error}
        </p>
      ) : null}

      {envelope?.validationSummary ? (
        <p className="mt-3 text-xs text-neutral-400">{envelope.validationSummary}</p>
      ) : null}

      <div className="mt-6">
        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
          Source-safe proposals
        </p>
        {!hasOptions ? (
          <div
            data-testid="reads-options-await-synthesis"
            className="mt-3 border border-white/10 bg-black/20 px-4 py-6 text-sm text-neutral-400"
          >
            Measured AssetPack options appear here after synthesis — select a repository,
            describe the Need, then Synthesize.
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
      </div>

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
              : `Settle selected (${selectedIndexes.length}) → pay · BTD · PR`}
          </button>
          <span className="text-xs text-neutral-500">
            SettleAssetPacks Simple pipeline (not SDIVF)
          </span>
        </div>
      ) : null}

      {settleError ? (
        <p className="mt-3 border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {settleError}
        </p>
      ) : null}
      {settleMessage ? (
        <p
          data-testid="reads-settle-message"
          className="mt-3 border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-50"
        >
          {settleMessage}
        </p>
      ) : null}
    </section>
  );
}
