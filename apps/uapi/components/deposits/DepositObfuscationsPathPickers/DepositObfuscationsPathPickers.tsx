'use client';

/**
 * Permissible sources / Impermissible sources file-tree pickers for deposit synthesis.
 * Paths are mutually exclusive; concept-level withholding stays in Obfuscations.
 * Internal state still uses forcedInclusions / forcedExclusions field names.
 */

import React from "react";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import { VCSFileTreePicker } from "@/components/bitcode/vcs/VCSFileTreePicker/VCSFileTreePicker";
import {
  DepositExcludePathsIcon,
  DepositIncludePathsIcon,
} from "@/components/deposits/DepositObfuscationsPathIcons/DepositObfuscationsPathIcons";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/components/deposits/models/deposit-explainers";
import type { ProductRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";

export type DepositObfuscationsPathPickersProps = {
  isConfigLocked: boolean;
  forcedInclusions: string[];
  onForcedInclusionsChange: (paths: string[]) => void;
  forcedExclusions: string[];
  onForcedExclusionsChange: (paths: string[]) => void;
  repositoryContext: ProductRepositoryContextState | null;
};

export function DepositObfuscationsPathPickers({
  isConfigLocked,
  forcedInclusions,
  onForcedInclusionsChange,
  forcedExclusions,
  onForcedExclusionsChange,
  repositoryContext,
}: DepositObfuscationsPathPickersProps) {
  const provider = repositoryContext?.provider ?? "github";
  const repositoryFullName =
    repositoryContext?.selectedRepository?.fullName ?? null;
  const treeRef =
    repositoryContext?.selectedCommit ||
    repositoryContext?.selectedBranch ||
    null;

  return (
    <div className="mt-4 grid gap-4 tablet:grid-cols-2">
      <div className="block">
        <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
          <DepositIncludePathsIcon />
          <span>Permissible sources</span>
          <span onClick={(event) => event.stopPropagation()}>
            <BitcodeInlineExplainer
              explainer={DEPOSIT_SECTION_EXPLAINERS.forcedInclusions}
              triggerAriaLabel="More info about permissible sources"
            />
          </span>
        </span>
        <div className="mt-2">
          <VCSFileTreePicker
            aria-label="Permissible sources file tree"
            provider={provider}
            repositoryFullName={repositoryFullName}
            treeRef={treeRef}
            selectedPaths={forcedInclusions}
            onChange={onForcedInclusionsChange}
            conflictingPaths={forcedExclusions}
            conflictLabel="Already in impermissible sources"
            disabled={isConfigLocked}
          />
        </div>
      </div>
      <div className="block">
        <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
          <DepositExcludePathsIcon />
          <span>Impermissible sources</span>
          <span onClick={(event) => event.stopPropagation()}>
            <BitcodeInlineExplainer
              explainer={DEPOSIT_SECTION_EXPLAINERS.forcedExclusions}
              triggerAriaLabel="More info about impermissible sources"
            />
          </span>
        </span>
        <div className="mt-2">
          <VCSFileTreePicker
            aria-label="Impermissible sources file tree"
            provider={provider}
            repositoryFullName={repositoryFullName}
            treeRef={treeRef}
            selectedPaths={forcedExclusions}
            onChange={onForcedExclusionsChange}
            conflictingPaths={forcedInclusions}
            conflictLabel="Already in permissible sources"
            disabled={isConfigLocked}
          />
        </div>
        <span className="mt-1 block text-xs leading-5 text-neutral-500">
          Impermissible sources never enter AssetPack knowledge synthesis: they
          are removed from the source inventory before measurement, and
          candidates that touch them are dropped fail-closed. Concept-level
          withholding belongs in Obfuscations above.
        </span>
      </div>
    </div>
  );
}
