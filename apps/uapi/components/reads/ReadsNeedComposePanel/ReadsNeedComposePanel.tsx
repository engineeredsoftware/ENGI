/**
 * Read Need compose + option synthesis/review (deposit Obfuscations twin).
 * Free-text Need + Relevant / Irrelevant path pickers + synthesize CTA.
 * Anchor controls mirror DepositObfuscationsAnchorControls (save/load/clear).
 * Options list and settle live in the parent detail grid (deposit parity).
 * Cancel lives only on ReadsPipelineTelemetry (header right) — not here.
 */
"use client";

import React from "react";
import type {
  ReadSynthesisStatus,
} from "@/components/reads/ReadPageClient/hooks/use-read-option-synthesis";
import type { RepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import { ProductSynthesizeAssetPackOptionsButton } from "@/components/bitcode/routes/ProductSynthesizeAssetPackOptionsButton/ProductSynthesizeAssetPackOptionsButton";
import { ReadsNeedPathPickers } from "@/components/reads/ReadsNeedPathPickers/ReadsNeedPathPickers";
import { ReadsNeedAnchorControls } from "@/components/reads/ReadsNeedAnchorControls/ReadsNeedAnchorControls";
import type { ReadNeedAnchor } from "@/components/reads/models/read-activity-ledger";

export function ReadsNeedComposePanel(props: {
  need: string;
  onNeedChange: (value: string) => void;
  relevantPaths: string[];
  onRelevantPathsChange: (paths: string[]) => void;
  irrelevantPaths: string[];
  onIrrelevantPathsChange: (paths: string[]) => void;
  repositoryContext: RepositoryContextState | null;
  status: ReadSynthesisStatus;
  error: string | null;
  runId: string | null;
  onSynthesize: () => void;
  canSynthesize: boolean;
  isConfigLocked?: boolean;
  needAnchors?: readonly ReadNeedAnchor[];
  needAnchorName?: string;
  onNeedAnchorNameChange?: (value: string) => void;
  isNeedAnchorPopoverOpen?: boolean;
  onNeedAnchorPopoverOpenChange?: (open: boolean) => void;
  isAnchoringNeed?: boolean;
  needAnchorMessage?: string | null;
  onAnchorNeed?: () => void | Promise<void>;
  onDeleteNeedAnchor?: (id: string) => void | Promise<void>;
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
    needAnchors = [],
    needAnchorName = "",
    onNeedAnchorNameChange,
    isNeedAnchorPopoverOpen = false,
    onNeedAnchorPopoverOpenChange,
    isAnchoringNeed = false,
    needAnchorMessage = null,
    onAnchorNeed,
    onDeleteNeedAnchor,
  } = props;

  const running = status === "running" || isConfigLocked;
  const anchorsEnabled = Boolean(onAnchorNeed && onNeedAnchorNameChange);

  return (
    <section
      data-testid="reads-need-compose"
      className={`border border-white/10 bg-white/[0.035] px-4 py-4 ${
        isConfigLocked ? "opacity-80" : ""
      }`}
      aria-label="Read Need and path steering"
      aria-disabled={isConfigLocked ? true : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-orange-200/80">
            Option synthesis
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">Need</h2>
        </div>
        {anchorsEnabled ? (
          <ReadsNeedAnchorControls
            isConfigLocked={running}
            need={need}
            needAnchors={needAnchors}
            needAnchorName={needAnchorName}
            onNeedAnchorNameChange={onNeedAnchorNameChange!}
            isNeedAnchorPopoverOpen={isNeedAnchorPopoverOpen}
            onNeedAnchorPopoverOpenChange={(open) =>
              onNeedAnchorPopoverOpenChange?.(open)
            }
            isAnchoringNeed={isAnchoringNeed}
            onAnchorNeed={onAnchorNeed!}
            onDeleteNeedAnchor={(id) => {
              void onDeleteNeedAnchor?.(id);
            }}
            onLoadAnchor={(anchor) => {
              onNeedChange(anchor.text);
              onNeedAnchorNameChange?.(anchor.name || "");
              onRelevantPathsChange(anchor.relevantPaths);
              onIrrelevantPathsChange(anchor.irrelevantPaths);
            }}
            onClear={() => {
              onNeedChange("");
              onNeedAnchorNameChange?.("");
              onRelevantPathsChange([]);
              onIrrelevantPathsChange([]);
              onNeedAnchorPopoverOpenChange?.(false);
            }}
            relevantPathsLength={relevantPaths.length}
            irrelevantPathsLength={irrelevantPaths.length}
          />
        ) : null}
      </div>
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
      {needAnchorMessage ? (
        <p
          data-testid="reads-need-anchor-message"
          className="mt-2 text-xs leading-5 text-neutral-400"
        >
          {needAnchorMessage}
        </p>
      ) : null}

      <ReadsNeedPathPickers
        isConfigLocked={running}
        relevantPaths={relevantPaths}
        onRelevantPathsChange={onRelevantPathsChange}
        irrelevantPaths={irrelevantPaths}
        onIrrelevantPathsChange={onIrrelevantPathsChange}
        repositoryContext={repositoryContext}
      />

      <ProductSynthesizeAssetPackOptionsButton
        data-testid="reads-synthesize-options"
        onClick={onSynthesize}
        disabled={!canSynthesize || !need.trim() || running}
        running={running && status === "running"}
      />
      {runId || status !== "idle" ? (
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          {runId ? (
            <span className="font-mono text-[0.65rem]">{runId}</span>
          ) : null}
          <span className="uppercase tracking-wide">status: {status}</span>
          {status === "cancelled" ? (
            <span
              data-testid="reads-synthesis-cancelled-badge"
              className="border border-rose-300/25 bg-rose-300/10 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-rose-100"
            >
              Cancelled
            </span>
          ) : null}
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
