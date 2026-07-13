'use client';

/**
 * Repository context panel for Reads — thin orchestration over VCS hook + units.
 */


import React from 'react';
import type { VCSRepository } from '@bitcode/vcs-generics-core';

import BitcodeWorkspaceCard from '@/components/bitcode/pipeline/BitcodeWorkspaceCard/BitcodeWorkspaceCard';
import type { TerminalActivityRecordDraft } from '@/components/bitcode/pipeline/models/pipeline-activity-history';
import { TERMINAL_WORKSPACE_EXPLAINERS } from '@/components/bitcode/pipeline/models/workspace-explainers';
import type { TerminalRepositoryContextState } from '@/components/bitcode/pipeline/models/repository-context';
import { buildPacksHref, PACKS_ROUTE } from '@/components/bitcode/routes/ProductRoutes/product-routes';
import { jumpToShellSection } from '@/components/bitcode/pipeline/ShellReading/shell-reading';
import { useReadsRepositoryVcs } from './hooks/use-reads-repository-vcs';
import { ReadsRepositoryFieldGrid } from '@/components/reads/ReadsRepositoryFieldGrid/ReadsRepositoryFieldGrid';
import { ReadsRepositoryConnectionUnit } from '@/components/reads/ReadsRepositoryConnectionUnit/ReadsRepositoryConnectionUnit';
import { ReadsRepositorySupplyUnit } from '@/components/reads/ReadsRepositorySupplyUnit/ReadsRepositorySupplyUnit';
import { ReadsRepositoryGuidanceUnit } from '@/components/reads/ReadsRepositoryGuidanceUnit/ReadsRepositoryGuidanceUnit';

interface TerminalRepositoryContextPanelProps {
  preferredRepository?: string | null;
  onContextChange?: (context: TerminalRepositoryContextState) => void;
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  routePath?: string;
  buildRouteHref?: (params?: URLSearchParams | string | null) => string;
  // The deposit surface flattens A→B (repo selection flows straight into
  // describe/synthesize), so it hides this terminal step-advance button.
  showContinueToDeposit?: boolean;
}

export default function ReadsRepositoryContextPanel({
  preferredRepository,
  onContextChange,
  onRecordActivity,
  routePath = PACKS_ROUTE,
  buildRouteHref = buildPacksHref,
  showContinueToDeposit = true,
}: TerminalRepositoryContextPanelProps) {
  const vcs = useReadsRepositoryVcs({
    preferredRepository,
    onContextChange,
    onRecordActivity,
    routePath,
    buildRouteHref,
  });

  const {
    router,
    searchParams,
    provider,
    connectionStatus,
    inventorySource,
    repositories,
    branches,
    commits,
    defaultBranch,
    isLoadingConnection,
    isLoadingRepositories,
    isLoadingBranches,
    isLoadingCommits,
    error,
    sourceSelectionError,
    recordMessage,
    isRecording,
    selectedRepository,
    selectedBranch,
    selectedCommit,
    refreshRepositoryContext,
    handleRecordRepositoryAnchor,
  } = vcs;

  const replaceRouteParams = (mutate: (params: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    mutate(nextParams);
    if (typeof window !== 'undefined' && window.location.pathname !== routePath) return;
    router.replace(buildRouteHref(nextParams), { scroll: false });
  };

  const handleProviderChange = (option: typeof provider) => {
    replaceRouteParams((nextParams) => {
      nextParams.set('provider', option);
      nextParams.delete('repo');
      nextParams.delete('sourceBranch');
      nextParams.delete('sourceCommit');
      nextParams.delete('branch');
      nextParams.delete('commit');
    });
  };

  const handleRepositorySelect = (repository: VCSRepository | null) => {
    replaceRouteParams((nextParams) => {
      nextParams.set('provider', provider);
      if (repository) nextParams.set('repo', repository.fullName);
      else nextParams.delete('repo');
      nextParams.delete('sourceBranch');
      nextParams.delete('sourceCommit');
      nextParams.delete('branch');
      nextParams.delete('commit');
    });
  };

  const handleBranchChange = (branch: string) => {
    replaceRouteParams((nextParams) => {
      nextParams.set('provider', provider);
      if (selectedRepository) nextParams.set('repo', selectedRepository.fullName);
      nextParams.set('sourceBranch', branch);
      nextParams.delete('sourceCommit');
      nextParams.delete('branch');
      nextParams.delete('commit');
    });
  };

  const handleCommitChange = (commit: string) => {
    replaceRouteParams((nextParams) => {
      nextParams.set('provider', provider);
      if (selectedRepository) nextParams.set('repo', selectedRepository.fullName);
      if (selectedBranch) nextParams.set('sourceBranch', selectedBranch);
      nextParams.set('sourceCommit', commit);
      nextParams.delete('branch');
      nextParams.delete('commit');
    });
  };

  return (
    <BitcodeWorkspaceCard
      id="terminalRepositorySupply"
      kicker="Repository supply"
      title="Connect and select searchable supply"
      summary="Choose the GitHub repository that will anchor deposit-side supply before you move deeper into Deposit, Read, and closure."
      explainer={TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply}
      tone="emerald"
    >
      {recordMessage ? (
        <div className="mb-4 rounded-none border border-white/8 bg-white/5 px-4 py-4 text-sm leading-6 text-neutral-200">
          {recordMessage}
        </div>
      ) : null}

      <div className="grid gap-3 text-xs uppercase tracking-[0.22em] text-neutral-400 tablet:grid-cols-2">
        <div className="rounded-none border border-white/8 bg-white/5 px-4 py-3">
          <p className="text-emerald-300/85">Main action</p>
          <p className="mt-2 text-neutral-200">deposit</p>
        </div>
        <div className="rounded-none border border-white/8 bg-white/5 px-4 py-3">
          <p className="text-emerald-300/85">Boundary</p>
          <p className="mt-2 text-neutral-200">repository supply</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        <div className="space-y-5">
          <ReadsRepositoryFieldGrid
            provider={provider}
            repositories={repositories}
            branches={branches}
            commits={commits}
            defaultBranch={defaultBranch}
            selectedRepository={selectedRepository}
            selectedBranch={selectedBranch}
            selectedCommit={selectedCommit}
            connectionStatus={connectionStatus}
            isLoadingRepositories={isLoadingRepositories}
            isLoadingBranches={isLoadingBranches}
            isLoadingCommits={isLoadingCommits}
            sourceSelectionError={sourceSelectionError}
            isRecording={isRecording}
            showContinueToDeposit={showContinueToDeposit}
            onProviderChange={handleProviderChange}
            onRepositorySelect={handleRepositorySelect}
            onBranchChange={handleBranchChange}
            onCommitChange={handleCommitChange}
            onContinueToDeposit={() => jumpToShellSection('terminalSupplySelection')}
            onRecordAnchor={() => {
              void handleRecordRepositoryAnchor();
            }}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <ReadsRepositoryConnectionUnit
              provider={provider}
              connectionStatus={connectionStatus}
              inventorySource={inventorySource}
              repositories={repositories}
              isLoadingConnection={isLoadingConnection}
            />
            <ReadsRepositorySupplyUnit
              provider={provider}
              selectedRepository={selectedRepository}
              selectedBranch={selectedBranch}
              selectedCommit={selectedCommit}
              connectionStatus={connectionStatus}
              isRecording={isRecording}
              onRecordAnchor={() => {
                void handleRecordRepositoryAnchor();
              }}
            />
          </div>
        </div>

        <ReadsRepositoryGuidanceUnit
          provider={provider}
          repositoriesCount={repositories.length}
          error={error}
          selectedRepositoryReady={Boolean(
            selectedRepository && selectedBranch && selectedCommit,
          )}
          onRefresh={refreshRepositoryContext}
        />
      </div>
    </BitcodeWorkspaceCard>
  );
}

/** @deprecated Prefer ReadsRepositoryContextPanel */
export { ReadsRepositoryContextPanel as TerminalRepositoryContextPanel };
