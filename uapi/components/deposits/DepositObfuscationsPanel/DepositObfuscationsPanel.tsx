/**
 * Deposit Obfuscations / option-synthesis configuration panel.
 * Presentational: parent owns anchors, path pickers state, and synthesize dispatch.
 */
"use client";

import React from "react";
import { Anchor, RefreshCw, Sparkles } from "lucide-react";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import { SearchableSelect } from "@/components/bitcode/forms/SearchableSelect/SearchableSelect";
import { VCSFileTreePicker } from "@/components/bitcode/vcs/VCSFileTreePicker/VCSFileTreePicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/Popover/Popover";
import {
  DepositExcludePathsIcon,
  DepositIncludePathsIcon,
  ObfuscationsAnchorDescription,
} from "@/components/deposits/DepositObfuscationsPathIcons/DepositObfuscationsPathIcons";
import { formatObfuscationsAnchorDescription } from "@/components/bitcode/pipeline/models/pipeline-activity-history";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/components/deposits/models/deposit-explainers";
import {
  DEPOSIT_OBFUSCATIONS_PLACEHOLDER,
} from "@/components/deposits/models/deposit-format";
import type { TerminalRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";

export type DepositObfuscationsAnchor = {
  id: string;
  name?: string;
  text: string;
  repositoryFullName?: string;
  forcedInclusions?: string[];
  forcedExclusions?: string[];
};

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
  repositoryContext: TerminalRepositoryContextState | null;
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
    optionsRequested,
    synthesisRunId,
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
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.obfuscations} />
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {obfuscationsAnchors.length > 0 ? (
                      <div className="w-56">
                        <SearchableSelect
                          aria-label="Load a previously anchored Obfuscations configuration"
                          items={obfuscationsAnchors.map((anchor) => ({
                            key: anchor.id,
                            label:
                              anchor.name ||
                              anchor.repositoryFullName ||
                              "Obfuscations anchor",
                            // Sub-text: clipped body | include icon+count | exclude
                            // icon+count — same icons as the picker section headers.
                            description: (
                              <ObfuscationsAnchorDescription
                                text={anchor.text}
                                forcedInclusions={anchor.forcedInclusions}
                                forcedExclusions={
                                  anchor.forcedExclusions
                                }
                              />
                            ),
                            searchText: [
                              anchor.name,
                              anchor.repositoryFullName,
                              formatObfuscationsAnchorDescription({
                                text: anchor.text,
                                forcedInclusions: anchor.forcedInclusions,
                                forcedExclusions:
                                  anchor.forcedExclusions,
                              }),
                            ]
                              .filter(Boolean)
                              .join(" "),
                            deletable: true,
                          }))}
                          value={null}
                          disabled={isConfigLocked}
                          onSelect={(key) => {
                            if (isConfigLocked) return;
                            const anchor = obfuscationsAnchors.find(
                              (entry) => entry.id === key,
                            );
                            if (!anchor) return;
                            onObfuscationsChange(anchor.text);
                            onObfuscationsAnchorNameChange(anchor.name || "");
                            onForcedInclusionsChange(anchor.forcedInclusions);
                            onForcedExclusionsChange(anchor.forcedExclusions);
                          }}
                          onDeleteItem={
                            isConfigLocked
                              ? undefined
                              : (key) => {
                                  void onDeleteObfuscationsAnchor(key);
                                }
                          }
                          // One-shot load-in: always shows the placeholder, never
                          // a selected value — no check indicator in the list.
                          showSelectionIndicator={false}
                          placeholder="Load anchor..."
                          searchPlaceholder="Search anchors..."
                          emptyMessage="No anchors yet."
                          className="h-9"
                        />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      aria-label="Clear obfuscations"
                      title="Clear obfuscations"
                      disabled={
                        isConfigLocked ||
                        (!obfuscations &&
                          !obfuscationsAnchorName &&
                          forcedInclusions.length === 0 &&
                          forcedExclusions.length === 0)
                      }
                      onClick={() => {
                        onObfuscationsChange("");
                        onObfuscationsAnchorNameChange("");
                        onForcedInclusionsChange([]);
                        onForcedExclusionsChange([]);
                        onObfuscationsAnchorPopoverOpenChange(false);
                      }}
                      className="border border-white/10 px-2.5 py-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-neutral-300 transition hover:border-rose-300/35 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Clear
                    </button>
                    <Popover
                      open={isObfuscationsAnchorPopoverOpen}
                      onOpenChange={(open) => {
                        // Require Obfuscations body before opening the name popover.
                        if (isConfigLocked) return;
                        if (open && !obfuscations.trim()) return;
                        if (isAnchoringObfuscations) return;
                        onObfuscationsAnchorPopoverOpenChange(open);
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label="Anchor obfuscations to the activity ledger"
                          title="Anchor obfuscations to the activity ledger"
                          disabled={
                            isConfigLocked ||
                            !obfuscations.trim() ||
                            isAnchoringObfuscations
                          }
                          className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/5 text-neutral-200 transition hover:border-emerald-300/35 hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isAnchoringObfuscations ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Anchor className="h-4 w-4" />
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        sideOffset={6}
                        className="w-64 border-white/10 bg-neutral-950 p-3 text-neutral-100 shadow-xl"
                      >
                        <p className="text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500">
                          Name this anchor
                        </p>
                        <input
                          id="deposit-obfuscations-anchor-name"
                          type="text"
                          value={obfuscationsAnchorName}
                          onChange={(event) =>
                            onObfuscationsAnchorNameChange(
                              event.target.value.slice(0, 80),
                            )
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void onAnchorObfuscations();
                            }
                            if (event.key === "Escape") {
                              event.preventDefault();
                              onObfuscationsAnchorPopoverOpenChange(false);
                            }
                          }}
                          placeholder="Optional name"
                          maxLength={80}
                          autoFocus
                          aria-label="Obfuscations anchor name"
                          className="mt-2 h-9 w-full border border-white/10 bg-black/40 px-2.5 text-xs text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-emerald-300/35"
                        />
                        <p className="mt-1.5 text-[0.68rem] leading-4 text-neutral-500">
                          Shown as the label when reloading. Leave blank to use
                          the repository name.
                        </p>
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onObfuscationsAnchorPopoverOpenChange(false)
                            }
                            disabled={isAnchoringObfuscations}
                            className="border border-white/10 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-neutral-300 transition hover:border-white/25 disabled:opacity-40"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void onAnchorObfuscations();
                            }}
                            disabled={
                              !obfuscations.trim() || isAnchoringObfuscations
                            }
                            className="inline-flex items-center gap-1.5 border border-emerald-300/30 bg-emerald-300/12 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-200/45 hover:bg-emerald-300/18 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {isAnchoringObfuscations ? (
                              <RefreshCw
                                className="h-3 w-3 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <Anchor
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                            )}
                            Save anchor
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Sparkles
                      className="h-5 w-5 text-emerald-200"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="mt-4 block">
                  <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
                    <label htmlFor="deposit-obfuscations-input">What to obfuscate or withhold</label>
                    <span onClick={(event) => event.stopPropagation()}>
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.whatToObfuscate} triggerAriaLabel="More info about this field" />
                    </span>
                  </span>
                  <textarea
                    id="deposit-obfuscations-input"
                    value={obfuscations}
                    onChange={(event) =>
                      onObfuscationsChange(event.target.value)
                    }
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
                {/* File-tree pickers over the selected repository·branch·
                    commit. Forced Inclusion and Forced Exclusions are MUTUALLY
                    EXCLUSIVE — a path picked on one side is disabled on the
                    other. Concept-level withholding belongs to Obfuscations. */}
                <div className="mt-4 grid gap-4 tablet:grid-cols-2">
                  <div className="block">
                    <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
                      <DepositIncludePathsIcon />
                      <span>Forced Inclusion</span>
                      <span onClick={(event) => event.stopPropagation()}>
                        <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.forcedInclusions} triggerAriaLabel="More info about this field" />
                      </span>
                    </span>
                    <div className="mt-2">
                      <VCSFileTreePicker
                        aria-label="Forced Inclusion file tree"
                        provider={repositoryContext?.provider ?? "github"}
                        repositoryFullName={
                          repositoryContext?.selectedRepository?.fullName ?? null
                        }
                        treeRef={
                          repositoryContext?.selectedCommit ||
                          repositoryContext?.selectedBranch ||
                          null
                        }
                        selectedPaths={forcedInclusions}
                        onChange={onForcedInclusionsChange}
                        conflictingPaths={forcedExclusions}
                        conflictLabel="Already a Forced Exclusion"
                        disabled={isConfigLocked}
                      />
                    </div>
                  </div>
                  <div className="block">
                    <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
                      <DepositExcludePathsIcon />
                      <span>Forced Exclusions</span>
                      <span onClick={(event) => event.stopPropagation()}>
                        <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.forcedExclusions} triggerAriaLabel="More info about this field" />
                      </span>
                    </span>
                    <div className="mt-2">
                      <VCSFileTreePicker
                        aria-label="Forced Exclusions file tree"
                        provider={repositoryContext?.provider ?? "github"}
                        repositoryFullName={
                          repositoryContext?.selectedRepository?.fullName ?? null
                        }
                        treeRef={
                          repositoryContext?.selectedCommit ||
                          repositoryContext?.selectedBranch ||
                          null
                        }
                        selectedPaths={forcedExclusions}
                        onChange={onForcedExclusionsChange}
                        conflictingPaths={forcedInclusions}
                        conflictLabel="Already a Forced Inclusion"
                        disabled={isConfigLocked}
                      />
                    </div>
                    <span className="mt-1 block text-xs leading-5 text-neutral-500">
                      Forced Exclusions never enter AssetPack knowledge
                      synthesis: they are removed from the source inventory
                      before measurement, and candidates that touch them are
                      dropped fail-closed. Concept-level withholding belongs in
                      Obfuscations above.
                    </span>
                  </div>
                </div>
                {isRunReviewLocked ? (
                  // Historical run detail freezes the configuration that
                  // produced that run. Compose (incl. post-failure re-edit)
                  // stays editable until the next synthesize.
                  <p
                    data-testid="deposit-obfuscations-run-loaded-note"
                    className="mt-4 text-xs leading-5 text-neutral-500"
                  >
                    Run configuration is locked for this pipeline detail.
                    Select Back on Deposit to start a new synthesis.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      void onSynthesize();
                    }}
                    disabled={
                      !repositoryFullName ||
                      synthesisStatus === "running"
                    }
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
