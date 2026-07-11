'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import BitcodeChipCloud from '@/components/bitcode/pipeline/BitcodeChipCloud';
import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer';
import BitcodeMetricGrid from '@/components/bitcode/pipeline/BitcodeMetricGrid';

import TerminalWorkspaceCard from './TerminalWorkspaceCard';
import {
  buildTerminalSupplySelectionDraft,
  type TerminalActivityRecordDraft,
} from './terminal-activity-history';
import {
  TERMINAL_INLINE_EXPLAINERS,
  TERMINAL_WORKSPACE_EXPLAINERS,
} from './terminal-workspace-explainers';
import { normalizeTerminalSupplySelection, type TerminalSupplySelectionState } from './terminal-supply-selection';
import {
  getProviderLabel,
  getRepositoryInventorySourceLabel,
  type TerminalRepositoryContextState,
} from './terminal-repository-context';
import { useTerminalShellBridge } from './terminal-shell-bridge';
import { jumpToShellSection } from './terminal-shell-reading';
import { buildTerminalHref } from './terminal-routes';

interface TerminalSupplySelectionPanelProps {
  repositoryContext?: TerminalRepositoryContextState | null;
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  buildRouteHref?: (params?: URLSearchParams | string | null) => string;
}

function formatRepositoryOptionLabel(
  repository: TerminalRepositoryContextState['repositories'][number],
  providerLabel: string,
) {
  const language = repository.language || 'source';
  const branch = repository.defaultBranch || 'main';
  const visibility = repository.private ? 'private' : 'public';
  return `${repository.fullName} - ${providerLabel} source / ${branch} / ${visibility} / ${language}`;
}

function formatSelectedCommit(value?: string | null) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue.slice(0, 12) : 'commit pending';
}

export default function TerminalSupplySelectionPanel({
  repositoryContext = null,
  onRecordActivity,
  buildRouteHref = buildTerminalHref,
}: TerminalSupplySelectionPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { snapshot, runControl } = useTerminalShellBridge();
  const [searchValue, setSearchValue] = useState('');
  const [recordMessage, setRecordMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const usesRepositoryContext = Boolean(
    repositoryContext?.selectedRepository &&
      repositoryContext.repositories.length > 0 &&
      !repositoryContext.connectionStatus?.metadata?.mock_mode,
  );
  const selection = useMemo<TerminalSupplySelectionState | null>(
    () => normalizeTerminalSupplySelection(snapshot, repositoryContext, usesRepositoryContext ? '' : searchValue),
    [repositoryContext, searchValue, snapshot, usesRepositoryContext],
  );

  useEffect(() => {
    if (usesRepositoryContext) return;
    setSearchValue(selection?.searchTerm || '');
  }, [selection?.searchTerm, usesRepositoryContext]);

  const selectedEntryLabels = useMemo(
    () => selection?.filteredEntries.filter((entry) => entry.selected).slice(0, 6).map((entry) => entry.title) || [],
    [selection],
  );
  const selectedRepositoryId = repositoryContext?.selectedRepository?.id || '';
  const selectedRepository = repositoryContext?.selectedRepository || null;
  const providerLabel = getProviderLabel(repositoryContext?.provider || 'github');
  const inventorySourceLabel = getRepositoryInventorySourceLabel(repositoryContext?.inventorySource);
  const providerAccount =
    repositoryContext?.connectionStatus?.username ||
    repositoryContext?.connectionStatus?.metadata?.account ||
    repositoryContext?.selectedRepository?.owner.username ||
    'connected account';

  const handleRecordSelection = async () => {
    if (!selection || !onRecordActivity) return;

    setIsRecording(true);
    setRecordMessage(null);

    try {
      await onRecordActivity(buildTerminalSupplySelectionDraft(selection));
      setRecordMessage('Selected deposit-side supply recorded into the Bitcode activity ledger.');
    } catch (error) {
      setRecordMessage(error instanceof Error ? error.message : 'Unable to record deposit-side selection.');
    } finally {
      setIsRecording(false);
    }
  };

  const selectRepository = (repositoryId: string) => {
    if (!usesRepositoryContext || !repositoryContext) return;
    const repository = repositoryContext.repositories.find((candidate) => candidate.id === repositoryId);
    if (!repository) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('provider', repositoryContext.provider);
    nextParams.set('repo', repository.fullName);
    nextParams.delete('sourceBranch');
    nextParams.delete('sourceCommit');
    nextParams.delete('branch');
    nextParams.delete('commit');
    router.replace(buildRouteHref(nextParams), { scroll: false });
  };

  const selectRepositoryEntry = (entryId: string) => {
    if (!usesRepositoryContext || !repositoryContext) {
      void runControl((controls) => controls.toggleInventoryEntry?.(entryId));
      return;
    }

    selectRepository(entryId.replace(/^repository:/, ''));
  };

  if (!selection) {
    return (
      <TerminalWorkspaceCard
        id="terminalSupplySelection"
        kicker="Deposit-side supply"
        title="Search and select supply for the current deposit draft"
        summary="Loading repository-bound supply, selected inventory, and intake controls."
        explainer={TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory}
      >
        <p className="text-sm leading-6 text-neutral-300">Loading deposit-side supply…</p>
      </TerminalWorkspaceCard>
    );
  }

  return (
    <TerminalWorkspaceCard
      id="terminalSupplySelection"
      kicker="Deposit-side supply"
      title={usesRepositoryContext ? 'Choose the repository you are depositing' : 'Search and select supply for the current deposit draft'}
      summary={
        usesRepositoryContext
          ? 'Select one connected repository as the source boundary for this Deposit. The inventory selector carries provider, branch, visibility, and language detail so the rest of the Deposit flow reads one source.'
          : 'Bind the active auth session, narrow the available inventory, and keep only the supply you want in the current deposit draft before moving into deposit and read.'
      }
      explainer={TERMINAL_WORKSPACE_EXPLAINERS.supplyInventory}
      headerAside={
        <BitcodeMetricGrid
          metrics={[
            { label: 'Selected refs', value: String(selection.selectedCount) },
            { label: 'Filtered inventory', value: String(selection.filteredCount) },
            { label: usesRepositoryContext ? 'Connected accounts' : 'Auth sessions', value: String(selection.authSessions.length) },
            { label: usesRepositoryContext ? 'Supply kinds' : 'Artifact kinds', value: String(selection.kindOptions.length) },
          ]}
          columnsClassName="tablet:grid-cols-2"
          itemClassName="rounded-2xl border border-white/8 bg-black/20 px-4 py-4"
          labelClassName="text-[0.62rem] uppercase tracking-[0.16em] text-emerald-300/85"
          valueClassName="text-sm font-semibold text-neutral-200"
        />
      }
    >
      {recordMessage ? (
        <div className="mt-4 rounded-[1.3rem] border border-white/8 bg-white/5 px-4 py-4 text-sm leading-6 text-neutral-200">
          {recordMessage}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        <div className={`grid gap-4 ${usesRepositoryContext ? 'lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.8fr)]' : 'lg:grid-cols-3'}`}>
          {usesRepositoryContext && repositoryContext ? (
            <div className="rounded-[1.5rem] border border-emerald-400/18 bg-emerald-400/10 px-4 py-4">
              <span className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.24em] text-emerald-200/85">
                <span>Repository inventory</span>
                <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.providerRepository} />
              </span>
              <select
                aria-label="Repository inventory"
                value={selectedRepositoryId}
                onChange={(event) => selectRepository(event.target.value)}
                className="mt-3 w-full rounded-xl border border-emerald-300/20 bg-[rgba(10,15,30,0.92)] px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-300/50"
              >
                {repositoryContext.repositories.map((repository) => (
                  <option key={repository.id} value={repository.id}>
                    {formatRepositoryOptionLabel(repository, providerLabel)}
                  </option>
                ))}
              </select>
              {selectedRepository ? (
                <div className="mt-4 rounded-[1.25rem] border border-emerald-300/15 bg-black/20 px-4 py-4">
                  <p className="text-base font-semibold text-white">{selectedRepository.fullName}</p>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-5">
                    {[
                      { label: 'Source', value: `${providerLabel} / ${inventorySourceLabel}` },
                      { label: 'Branch', value: repositoryContext.selectedBranch || selectedRepository.defaultBranch || 'main' },
                      { label: 'Commit', value: formatSelectedCommit(repositoryContext.selectedCommit) },
                      { label: 'Visibility', value: selectedRepository.private ? 'private' : 'public' },
                      { label: 'Language', value: selectedRepository.language || 'not specified' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-white/8 bg-white/5 px-3 py-3">
                        <p className="text-[0.62rem] uppercase tracking-[0.18em] text-emerald-100/70">{item.label}</p>
                        <p className="mt-1 text-neutral-100">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {selectedRepository.topics?.length ? (
                    <BitcodeChipCloud
                      chips={selectedRepository.topics.slice(0, 6)}
                      className="mt-4"
                      chipClassName="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-emerald-100"
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
              <span className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.24em] text-neutral-400">
                <span>Auth session</span>
                <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.authSession} />
              </span>
              <select
                value={selection.selectedAuthSessionId}
                onChange={(event) => {
                  void runControl((controls) => controls.setAuthSession?.(event.target.value));
                }}
                disabled={selection.authSessions.length <= 1}
                className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40"
              >
                {selection.authSessions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
            {usesRepositoryContext ? (
              <>
                <span className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.24em] text-neutral-400">
                  <span>Depositing from</span>
                  <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.authSession} />
                </span>
                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-neutral-100">
                  <p>{providerAccount}</p>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-500">
                    GitHub · repository source
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.24em] text-neutral-400">
                  <span>Artifact kind</span>
                  <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.artifactKind} />
                </span>
                <select
                  value={selection.selectedKind}
                  onChange={(event) => {
                    void runControl((controls) => controls.setInventoryKind?.(event.target.value));
                  }}
                  className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40"
                >
                  {selection.kindOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          {!usesRepositoryContext ? (
            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
              <span className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.24em] text-neutral-400">
                <span>Inventory search</span>
                <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.inventorySearch} />
              </span>
              <input
                value={searchValue}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setSearchValue(nextValue);
                  void runControl((controls) => controls.setInventorySearch?.(nextValue));
                }}
                placeholder="Search repo supply..."
                className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400/40"
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5">
          <div className="flex items-center gap-2">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">Flow continuity</p>
            <BitcodeInlineExplainer explainer={TERMINAL_WORKSPACE_EXPLAINERS.depositReadChain} />
          </div>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {usesRepositoryContext
              ? 'The selected repository is the source boundary for this Deposit. Record the selection, then continue when you are ready to describe issuer, provenance, and intent.'
              : 'Selected supply stays attached to the current deposit flow. Continue into Deposit when you are ready to describe issuer, provenance, and intent.'}
          </p>
          {selectedEntryLabels.length ? (
            <BitcodeChipCloud
              chips={selectedEntryLabels}
              className="mt-4"
              chipClassName="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-200"
            />
          ) : null}
          <button
            type="button"
            onClick={() => jumpToShellSection('terminalDepositComposer')}
            className="mt-4 rounded-[1.3rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15"
          >
            Continue to Deposit flow
          </button>
          <button
            type="button"
            disabled={isRecording}
            onClick={() => {
              void handleRecordSelection();
            }}
            className="mt-3 rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRecording ? 'Recording selection…' : 'Record deposit selection'}
          </button>
        </div>
      </div>

      {!usesRepositoryContext ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {selection.filteredEntries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => {
                selectRepositoryEntry(entry.id);
              }}
              className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                entry.selected
                  ? 'border-emerald-400/35 bg-emerald-400/10'
                  : 'border-white/8 bg-black/20 hover:border-white/16 hover:bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{entry.title}</p>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.2em] text-neutral-500">{entry.kind}</p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] ${
                    entry.selected
                      ? 'border-emerald-300/35 bg-emerald-300/15 text-emerald-100'
                      : 'border-white/10 bg-white/5 text-neutral-200'
                  }`}
                >
                  {entry.selected ? 'selected' : 'available'}
                </span>
              </div>
              {entry.subtitle ? <p className="mt-3 text-sm leading-6 text-neutral-300">{entry.subtitle}</p> : null}
              {entry.tags.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.tags.slice(0, 4).map((tag) => (
                    <span
                      key={`${entry.id}-${tag}`}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </TerminalWorkspaceCard>
  );
}
