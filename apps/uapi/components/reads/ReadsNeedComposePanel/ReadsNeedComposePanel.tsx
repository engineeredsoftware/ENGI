/**
 * Read Need compose + option synthesis/review (deposit Obfuscations twin).
 * Free-text Need + Relevant / Irrelevant path pickers + synthesize CTA.
 * Options list and settle live in the parent detail grid (deposit parity).
 */
"use client";

import React from "react";
import type {
  ReadSynthesisStatus,
} from "@/components/reads/ReadPageClient/hooks/use-read-option-synthesis";
import type { TerminalRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import { ReadsNeedPathPickers } from "@/components/reads/ReadsNeedPathPickers/ReadsNeedPathPickers";

export function ReadsNeedComposePanel(props: {
  need: string;
  onNeedChange: (value: string) => void;
  relevantPaths: string[];
  onRelevantPathsChange: (paths: string[]) => void;
  irrelevantPaths: string[];
  onIrrelevantPathsChange: (paths: string[]) => void;
  repositoryContext: TerminalRepositoryContextState | null;
  status: ReadSynthesisStatus;
  error: string | null;
  runId: string | null;
  onSynthesize: () => void;
  canSynthesize: boolean;
  isConfigLocked?: boolean;
}) {
  const {
    need,
    onNeedChange,
    relevantPaths,
    onRelevantPathsChange,
    irrelevantPaths,
    onIrrelevantPathsChange,
    repositoryContext,
    status,
    error,
    runId,
    onSynthesize,
    canSynthesize,
    isConfigLocked = false,
  } = props;

  const running = status === "running" || isConfigLocked;

  return (
    <section
      data-testid="reads-need-compose"
      className={`border border-white/10 bg-white/[0.035] px-4 py-4 ${
        isConfigLocked ? "opacity-80" : ""
      }`}
      aria-label="Read Need and path steering"
      aria-disabled={isConfigLocked ? true : undefined}
    >
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-orange-200/80">
        Option synthesis
      </p>
      <h2 className="mt-2 text-lg font-semibold text-white">Need</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-400">
        Select a repository and commit, describe the Need, optionally steer with
        Relevant and Irrelevant paths, then synthesize measured AssetPack options.
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

      <ReadsNeedPathPickers
        isConfigLocked={running}
        relevantPaths={relevantPaths}
        onRelevantPathsChange={onRelevantPathsChange}
        irrelevantPaths={irrelevantPaths}
        onIrrelevantPathsChange={onIrrelevantPathsChange}
        repositoryContext={repositoryContext}
      />

      <button
        type="button"
        data-testid="reads-synthesize-options"
        onClick={() => void onSynthesize()}
        disabled={!canSynthesize || running || !need.trim()}
        className="mt-4 inline-flex w-full items-center justify-center border border-emerald-300/25 bg-emerald-300/12 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-200/45 hover:bg-emerald-300/18 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-neutral-500"
      >
        {running
          ? "Synthesizing with AssetPacksSynthesis…"
          : "Synthesize AssetPack Options"}
      </button>
      {runId || status !== "idle" ? (
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          {runId ? (
            <span className="font-mono text-[0.65rem]">{runId}</span>
          ) : null}
          <span className="uppercase tracking-wide">status: {status}</span>
        </div>
      ) : null}

      {error ? (
        <p
          data-testid="reads-synthesize-error"
          className="mt-3 border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
