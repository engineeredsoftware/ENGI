'use client';

/**
 * Deposit Obfuscations / option-synthesis configuration panel.
 * Presentational shell: path pickers and anchor controls are co-located units.
 */

import React from "react";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/components/deposits/models/deposit-explainers";
import { DEPOSIT_OBFUSCATIONS_PLACEHOLDER } from "@/components/deposits/models/deposit-format";
import type { ProductRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import type { DepositObfuscationsAnchor } from "@/components/deposits/models/deposit-activity-ledger";
import { DepositObfuscationsAnchorControls } from "@/components/deposits/DepositObfuscationsAnchorControls/DepositObfuscationsAnchorControls";
import { DepositObfuscationsPathPickers } from "@/components/deposits/DepositObfuscationsPathPickers/DepositObfuscationsPathPickers";

export type { DepositObfuscationsAnchor };

export type DepositObfuscationsPanelProps = {
  isConfigLocked: boolean;
  obfuscations: string;
  onObfuscationsChange: (value: string) => void;
  obfuscationsAnchors: DepositObfuscationsAnchor[];
  obfuscationsAnchorName: string;
  onObfuscationsAnchorNameChange: (value: string) => void;
  isObfuscationsAnchorPopoverOpen: boolean;
  onObfuscationsAnchorPopoverOpenChange: (open: boolean) => void;
  isAnchoringObfuscations: boolean;
  obfuscationsAnchorMessage: string | null;
  onAnchorObfuscations: () => void | Promise<void>;
  onDeleteObfuscationsAnchor: (id: string) => void | Promise<void>;
  forcedInclusions: string[];
  onForcedInclusionsChange: (paths: string[]) => void;
  forcedExclusions: string[];
  onForcedExclusionsChange: (paths: string[]) => void;
  repositoryContext: ProductRepositoryContextState | null;
  /** Selected repository full name (enables synthesize when set). */
  repositoryFullName: string | null | undefined;
  onSynthesize: () => void | Promise<void>;
  synthesisStatus: string;
  optionsRequested: boolean;
  synthesisRunId: string | null;
  isRunReviewLocked?: boolean;
};

export function DepositObfuscationsPanel(props: DepositObfuscationsPanelProps) {
  const {
    isConfigLocked,
    obfuscations,
    onObfuscationsChange,
    obfuscationsAnchors,
    obfuscationsAnchorName,
    onObfuscationsAnchorNameChange,
    isObfuscationsAnchorPopoverOpen,
    onObfuscationsAnchorPopoverOpenChange,
    isAnchoringObfuscations,
    obfuscationsAnchorMessage,
    onAnchorObfuscations,
    onDeleteObfuscationsAnchor,
    forcedInclusions,
    onForcedInclusionsChange,
    forcedExclusions,
    onForcedExclusionsChange,
    repositoryContext,
    repositoryFullName,
    onSynthesize,
    synthesisStatus,
    isRunReviewLocked = false,
  } = props;

  return (
    <section
      id="deposit-section-synthesize"
      className={`border border-white/10 bg-white/[0.035] px-4 py-4 ${
        isConfigLocked ? "opacity-80" : ""
      }`}
      aria-disabled={isConfigLocked ? true : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
            Option synthesis
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
            <span>Obfuscations</span>
            <BitcodeInlineExplainer
              explainer={DEPOSIT_SECTION_EXPLAINERS.obfuscations}
            />
          </h2>
        </div>
        <DepositObfuscationsAnchorControls
          isConfigLocked={isConfigLocked}
          obfuscations={obfuscations}
          obfuscationsAnchors={obfuscationsAnchors}
          obfuscationsAnchorName={obfuscationsAnchorName}
          onObfuscationsAnchorNameChange={onObfuscationsAnchorNameChange}
          isObfuscationsAnchorPopoverOpen={isObfuscationsAnchorPopoverOpen}
          onObfuscationsAnchorPopoverOpenChange={
            onObfuscationsAnchorPopoverOpenChange
          }
          isAnchoringObfuscations={isAnchoringObfuscations}
          onAnchorObfuscations={onAnchorObfuscations}
          onDeleteObfuscationsAnchor={onDeleteObfuscationsAnchor}
          onLoadAnchor={(anchor) => {
            onObfuscationsChange(anchor.text);
            onObfuscationsAnchorNameChange(anchor.name || "");
            onForcedInclusionsChange(anchor.forcedInclusions);
            onForcedExclusionsChange(anchor.forcedExclusions);
          }}
          onClear={() => {
            onObfuscationsChange("");
            onObfuscationsAnchorNameChange("");
            onForcedInclusionsChange([]);
            onForcedExclusionsChange([]);
            onObfuscationsAnchorPopoverOpenChange(false);
          }}
          forcedInclusionsLength={forcedInclusions.length}
          forcedExclusionsLength={forcedExclusions.length}
        />
      </div>
      <div className="mt-4 block">
        <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
          <label htmlFor="deposit-obfuscations-input">
            What to obfuscate or withhold
          </label>
          <span onClick={(event) => event.stopPropagation()}>
            <BitcodeInlineExplainer
              explainer={DEPOSIT_SECTION_EXPLAINERS.whatToObfuscate}
              triggerAriaLabel="More info about this field"
            />
          </span>
        </span>
        <textarea
          id="deposit-obfuscations-input"
          value={obfuscations}
          onChange={(event) => onObfuscationsChange(event.target.value)}
          readOnly={isConfigLocked}
          disabled={isConfigLocked}
          placeholder={DEPOSIT_OBFUSCATIONS_PLACEHOLDER}
          className="mt-2 min-h-[8rem] w-full border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-neutral-100 outline-none transition focus:border-emerald-300/35 disabled:cursor-not-allowed disabled:opacity-70"
        />
        {obfuscationsAnchorMessage ? (
          <p className="mt-2 text-xs leading-5 text-neutral-400">
            {obfuscationsAnchorMessage}
          </p>
        ) : null}
      </div>
      <DepositObfuscationsPathPickers
        isConfigLocked={isConfigLocked}
        forcedInclusions={forcedInclusions}
        onForcedInclusionsChange={onForcedInclusionsChange}
        forcedExclusions={forcedExclusions}
        onForcedExclusionsChange={onForcedExclusionsChange}
        repositoryContext={repositoryContext}
      />
      {isRunReviewLocked ? (
        // Historical run detail freezes the configuration that produced that
        // run. Compose (incl. post-failure re-edit) stays editable until the
        // next synthesize.
        <p
          data-testid="deposit-obfuscations-run-loaded-note"
          className="mt-4 text-xs leading-5 text-neutral-500"
        >
          Run configuration is locked for this pipeline detail. Select Back on
          Deposit to start a new synthesis.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => {
            void onSynthesize();
          }}
          disabled={!repositoryFullName || synthesisStatus === "running"}
          className="mt-4 inline-flex w-full items-center justify-center border border-emerald-300/25 bg-emerald-300/12 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-200/45 hover:bg-emerald-300/18 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-neutral-500"
        >
          {synthesisStatus === "running"
            ? "Synthesizing with AssetPacksSynthesis…"
            : "Synthesize AssetPack Options"}
        </button>
      )}
    </section>
  );
}
