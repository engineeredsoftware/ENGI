/**
 * Relevant / Irrelevant path pickers for read Need synthesis (deposit twin).
 * Mirrors Forced Inclusion / Forced Exclusion trees on deposit Obfuscations.
 */
"use client";

import React from "react";
import { VCSFileTreePicker } from "@/components/bitcode/vcs/VCSFileTreePicker/VCSFileTreePicker";
import type { ProductRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";

export type ReadsNeedPathPickersProps = {
  isConfigLocked: boolean;
  relevantPaths: string[];
  onRelevantPathsChange: (paths: string[]) => void;
  irrelevantPaths: string[];
  onIrrelevantPathsChange: (paths: string[]) => void;
  repositoryContext: ProductRepositoryContextState | null;
};

export function ReadsNeedPathPickers({
  isConfigLocked,
  relevantPaths,
  onRelevantPathsChange,
  irrelevantPaths,
  onIrrelevantPathsChange,
  repositoryContext,
}: ReadsNeedPathPickersProps) {
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
          Relevant paths
        </span>
        <div className="mt-2">
          <VCSFileTreePicker
            aria-label="Relevant file tree"
            provider={provider}
            repositoryFullName={repositoryFullName}
            treeRef={treeRef}
            selectedPaths={relevantPaths}
            onChange={onRelevantPathsChange}
            conflictingPaths={irrelevantPaths}
            conflictLabel="Already marked irrelevant"
            disabled={isConfigLocked}
          />
        </div>
      </div>
      <div className="block">
        <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
          Irrelevant paths
        </span>
        <div className="mt-2">
          <VCSFileTreePicker
            aria-label="Irrelevant file tree"
            provider={provider}
            repositoryFullName={repositoryFullName}
            treeRef={treeRef}
            selectedPaths={irrelevantPaths}
            onChange={onIrrelevantPathsChange}
            conflictingPaths={relevantPaths}
            conflictLabel="Already marked relevant"
            disabled={isConfigLocked}
          />
        </div>
      </div>
    </div>
  );
}
