'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { VCSBranch, VCSCommit, VCSProviderType } from '@bitcode/vcs-core';

import BitcodeChipCloud from '@/components/bitcode/execution/BitcodeChipCloud';
import BitcodeInlineExplainer from '@/components/bitcode/execution/BitcodeInlineExplainer';
import BitcodeMetricGrid from '@/components/bitcode/execution/BitcodeMetricGrid';
import type { BitcodeExplainer } from '@/components/bitcode/execution/bitcode-transaction-types';
import { openAuxillaries } from '@/app/auxillaries/components/AuxillariesProvider';
import {
  buildBitcoinWalletDepositAuthorizationMessage,
  signBitcoinWalletMessage,
  type BitcoinWalletProviderId,
} from '@/lib/bitcoin-wallet-client';

import TerminalWorkspaceCard from './TerminalWorkspaceCard';
import {
  type TerminalActivityRecordDraft,
  readTerminalRouteError,
} from './terminal-activity-history';
import {
  TERMINAL_INLINE_EXPLAINERS,
  TERMINAL_WORKSPACE_EXPLAINERS,
} from './terminal-workspace-explainers';
import {
  normalizeTerminalDepositComposer,
  type TerminalDepositComposerState,
} from './terminal-deposit-composer';
import { useTerminalShellBridge } from './terminal-shell-bridge';
import { jumpToShellSection } from './terminal-shell-reading';
import type { BitcodeTransactionReadiness } from './bitcode-transaction-readiness';

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting'; message?: string }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

type TerminalDepositResponseEvidence = {
  proofRoot?: string | null;
  measurementRoot?: string | null;
  reconciliationReadbackRoot?: string | null;
  depositorySearchDocumentRoot?: string | null;
  lexicalDocumentRoot?: string | null;
  vectorDocumentRoot?: string | null;
  compensationPreviewRoot?: string | null;
  sourceToSharesPreviewRoot?: string | null;
  compensationPreview?: {
    state?: string | null;
    readiness?: {
      eligibleForFindingFits?: boolean | null;
      eligibleForCompensationIfSelected?: boolean | null;
      blockers?: string[] | null;
      warnings?: string[] | null;
    } | null;
    compensationRoute?: {
      priceAsset?: string | null;
      allocationMethod?: string | null;
      sourceToSharesProofState?: string | null;
      btdMintBoundary?: string | null;
      btdRightsTransferBoundary?: string | null;
    } | null;
  } | null;
  depositorBoundary?: {
    walletId?: string | null;
  } | null;
  indexState?: {
    lexical?: string | null;
    vector?: string | null;
  } | null;
};

interface TerminalDepositComposerProps {
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  repositoryAnchor?: string | null;
  repositoryProvider?: VCSProviderType | null;
  repositoryBranch?: string | null;
  repositoryCommit?: string | null;
  repositoryBranches?: VCSBranch[];
  repositoryCommits?: VCSCommit[];
  isLoadingRepositoryBranches?: boolean;
  isLoadingRepositoryCommits?: boolean;
  onRepositorySourceBranchChange?: (branch: string) => void;
  onRepositorySourceCommitChange?: (commit: string) => void;
  transactionReadiness: BitcodeTransactionReadiness;
  showDemonstrationDraft?: boolean;
  preferredSignerAddress?: string | null;
  preferredSignerLabel?: string | null;
  preferredSignerProvider?: string | null;
}

function FieldHeading({
  children,
  explainer,
  badge,
  className = 'text-neutral-400',
}: {
  children: React.ReactNode;
  explainer?: BitcodeExplainer;
  badge?: string;
  className?: string;
}) {
  return (
    <span className={`flex flex-wrap items-center gap-2 text-[0.66rem] uppercase tracking-[0.24em] ${className}`}>
      <span>{children}</span>
      {badge ? (
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[0.54rem] tracking-[0.14em] text-current/70">
          {badge}
        </span>
      ) : null}
      {explainer ? <BitcodeInlineExplainer explainer={explainer} /> : null}
    </span>
  );
}

function formatCommitOption(commit: VCSCommit) {
  const shortSha = commit.sha.slice(0, 7);
  const title = commit.message.split('\n')[0]?.trim() || 'Commit';
  return `${shortSha} - ${title}`;
}

function normalizeBitcoinWalletProviderId(value: string | null | undefined): BitcoinWalletProviderId | null {
  if (value === 'xverse' || value === 'unisat' || value === 'leather' || value === 'okx-bitcoin') {
    return value;
  }
  return null;
}

export default function TerminalDepositComposer({
  onRecordActivity,
  repositoryAnchor,
  repositoryProvider,
  repositoryBranch,
  repositoryCommit,
  repositoryBranches = [],
  repositoryCommits = [],
  isLoadingRepositoryBranches = false,
  isLoadingRepositoryCommits = false,
  onRepositorySourceBranchChange,
  onRepositorySourceCommitChange,
  transactionReadiness,
  showDemonstrationDraft = true,
  preferredSignerAddress,
  preferredSignerLabel,
  preferredSignerProvider,
}: TerminalDepositComposerProps) {
  const { snapshot, runControl } = useTerminalShellBridge();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [artifactKind, setArtifactKind] = useState('');
  const [artifactType, setArtifactType] = useState('');
  const [sourceRepo, setSourceRepo] = useState('');
  const [sourceCommit, setSourceCommit] = useState('');
  const [workflowRunId, setWorkflowRunId] = useState('');
  const [signerAddress, setSignerAddress] = useState('');
  const [visualPreview, setVisualPreview] = useState('');
  const [workingNote, setWorkingNote] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: 'idle' });
  const repositoryAnchorValue = String(repositoryAnchor || '').trim();
  const repositoryBranchValue = String(repositoryBranch || '').trim();
  const repositoryCommitValue = String(repositoryCommit || '').trim();
  const preferredSignerAddressValue = String(preferredSignerAddress || '').trim();
  const signerAddressUsesWalletDefault = Boolean(preferredSignerAddressValue && signerAddress === preferredSignerAddressValue);
  const usesLiveRepositoryAnchor = Boolean(repositoryAnchorValue);
  const hasSelectedSourceRevision =
    !usesLiveRepositoryAnchor || Boolean(repositoryBranchValue && repositoryCommitValue);
  const composer = useMemo<TerminalDepositComposerState | null>(
    () => {
      if (!showDemonstrationDraft && repositoryAnchorValue) {
        return {
          authSessionId: `${repositoryProvider || 'github'}:${repositoryAnchorValue}`,
          sourceRepo: repositoryAnchorValue,
          signerAddress: '',
          selectedInventoryEntryIds: [],
          selectedEntries: [],
          selectedCount: 1,
        };
      }

      return normalizeTerminalDepositComposer(showDemonstrationDraft ? snapshot : null);
    },
    [repositoryAnchorValue, repositoryProvider, showDemonstrationDraft, snapshot],
  );
  const effectiveAuthSessionId = usesLiveRepositoryAnchor
    ? `${repositoryProvider || 'github'}:${repositoryAnchorValue}`
    : composer?.authSessionId || '';
  const selectedSupplyCount = usesLiveRepositoryAnchor ? 1 : composer?.selectedCount || 0;
  const selectedInventoryEntryIds = usesLiveRepositoryAnchor ? [] : composer?.selectedInventoryEntryIds || [];
  const displayedSourceRepo = usesLiveRepositoryAnchor ? repositoryAnchorValue : sourceRepo;
  const displayedSourceCommit = usesLiveRepositoryAnchor ? repositoryCommitValue : sourceCommit;
  const preferredBitcoinWalletProvider = normalizeBitcoinWalletProviderId(preferredSignerProvider);

  useEffect(() => {
    setSignerAddress((current) => {
      if (preferredSignerAddressValue && (!current || current === composer?.signerAddress)) {
        return preferredSignerAddressValue;
      }
      return current || composer?.signerAddress || '';
    });
    if (repositoryAnchorValue) {
      setSourceRepo(repositoryAnchorValue);
      return;
    }
    setSourceRepo((current) => current || composer?.sourceRepo || '');
  }, [composer?.signerAddress, composer?.sourceRepo, preferredSignerAddressValue, repositoryAnchorValue]);

  const selectedEntryLabels = useMemo(() => {
    if (repositoryAnchorValue) return [repositoryAnchorValue];
    return composer?.selectedEntries.slice(0, 5).map((entry) => entry.title) || [];
  }, [composer, repositoryAnchorValue]);
  const depositPreviewRows = useMemo(
    () => [
      { label: 'Repository', value: displayedSourceRepo || 'Not selected' },
      { label: 'Branch', value: repositoryBranchValue || (usesLiveRepositoryAnchor ? 'Not selected' : 'Optional') },
      { label: 'Commit', value: displayedSourceCommit ? displayedSourceCommit.slice(0, 12) : usesLiveRepositoryAnchor ? 'Not selected' : 'Optional' },
      { label: 'Wallet signer', value: signerAddress || 'Not selected' },
      { label: 'Wallet proof', value: preferredBitcoinWalletProvider ? `${preferredSignerLabel || preferredBitcoinWalletProvider} signs before submit` : 'No live wallet provider selected' },
      { label: 'Selected supply', value: String(selectedSupplyCount) },
    ],
    [
      displayedSourceCommit,
      displayedSourceRepo,
      preferredBitcoinWalletProvider,
      preferredSignerLabel,
      repositoryBranchValue,
      selectedSupplyCount,
      signerAddress,
      usesLiveRepositoryAnchor,
    ],
  );
  const settlementReady = transactionReadiness.canSettle;
  const walletSigningRequired = transactionReadiness.blockers.some((entry) => entry.id === 'wallet-verification');
  const repositoryReconnectRequired = transactionReadiness.blockers.some((entry) => entry.id === 'repository-provider');

  const canSubmit = Boolean(
    composer &&
      (selectedSupplyCount > 0 || content.trim()) &&
      (title.trim() || selectedSupplyCount > 0) &&
      (author.trim() || effectiveAuthSessionId) &&
      hasSelectedSourceRevision &&
      settlementReady,
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!composer) return;
    if (!settlementReady) {
      setSubmitState({ kind: 'error', message: transactionReadiness.summary });
      return;
    }
    setSubmitState({ kind: 'submitting', message: preferredBitcoinWalletProvider ? 'Requesting wallet signature…' : 'Submitting deposit to Bitcode…' });

    try {
      const issuedAt = new Date().toISOString();
      const nonce = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const walletAuthorizationMessage =
        preferredBitcoinWalletProvider && signerAddress.trim()
          ? buildBitcoinWalletDepositAuthorizationMessage({
              repository: displayedSourceRepo || repositoryAnchorValue || composer.sourceRepo || 'unknown',
              branch: repositoryBranchValue || null,
              commit: displayedSourceCommit || null,
              signerAddress: signerAddress.trim(),
              title: title.trim() || selectedEntryLabels[0] || null,
              issuedAt,
              nonce,
            })
          : null;
      const walletAuthorizationProof =
        walletAuthorizationMessage && preferredBitcoinWalletProvider
          ? await signBitcoinWalletMessage({
              message: walletAuthorizationMessage,
              preferredProviderId: preferredBitcoinWalletProvider,
              address: signerAddress,
            })
          : null;

      setSubmitState({ kind: 'submitting', message: 'Submitting deposit to Bitcode…' });
      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          author,
          artifactKind,
          artifactType,
          authSessionId: effectiveAuthSessionId || undefined,
          inventoryEntryIds: selectedInventoryEntryIds,
          repositoryAnchor: repositoryAnchorValue || composer.sourceRepo || undefined,
          repositoryProvider: repositoryProvider || undefined,
          sourceRepo: displayedSourceRepo || undefined,
          sourceBranch: repositoryBranchValue || undefined,
          sourceRef: repositoryBranchValue || undefined,
          sourceCommit: displayedSourceCommit || undefined,
          workflowRunId,
          signerAddress,
          signingAlgorithm: walletAuthorizationProof ? 'bitcoin_message_signature' : undefined,
          keySource: walletAuthorizationProof ? `${walletAuthorizationProof.provider}-browser-wallet` : undefined,
          walletAuthorizationProof: walletAuthorizationProof
            ? {
                kind: 'bitcode_deposit_authorization',
                provider: walletAuthorizationProof.provider,
                providerLabel: walletAuthorizationProof.providerLabel,
                signerAddress: walletAuthorizationProof.address || signerAddress || null,
                message: walletAuthorizationProof.message,
                signature: walletAuthorizationProof.signature,
                signedAt: walletAuthorizationProof.signedAt,
                proofKind: walletAuthorizationProof.proofKind,
              }
            : undefined,
          visualPreview,
          operatorNote: workingNote,
          tags: tags
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean),
          content,
        }),
      });

      if (!response.ok) {
        setSubmitState({ kind: 'error', message: await readTerminalRouteError(response, 'Deposit failed.') });
        return;
      }

      const payload = (await response.json()) as {
        asset?: {
          assetId?: string | null;
          title?: string | null;
          depositoryEvidence?: TerminalDepositResponseEvidence | null;
        };
        depositoryEvidence?: TerminalDepositResponseEvidence | null;
      };
      const depositoryEvidence = payload.depositoryEvidence || payload.asset?.depositoryEvidence || null;
      const compensationPreview = depositoryEvidence?.compensationPreview || null;

      await runControl((controls) => controls.refresh?.());
      setTitle('');
      setAuthor('');
      setArtifactKind('');
      setArtifactType('');
      setSourceRepo(repositoryAnchorValue || composer.sourceRepo || '');
      setSourceCommit('');
      setWorkflowRunId('');
      setVisualPreview('');
      setWorkingNote('');
      setTags('');
      setContent('');
      try {
        await onRecordActivity?.({
          type: 'agentic-execution:asset-pack',
          detailSection: 'transaction',
          summary:
            payload.asset?.title ||
            title.trim() ||
            `Submitted ${selectedSupplyCount || 1} candidate Bitcode deposit asset pack${selectedSupplyCount === 1 ? '' : 's'}.`,
          context: {
            source: 'terminal-deposit-composer',
            authSessionId: effectiveAuthSessionId || null,
            selectedInventoryEntryIds,
            selectedInventoryTitles: selectedEntryLabels,
            repositoryAnchor: repositoryAnchorValue || null,
            sourceBranch: repositoryBranchValue || null,
            sourceCommit: displayedSourceCommit || null,
            walletAuthorizationSigned: Boolean(walletAuthorizationProof),
            candidateAssetId: payload.asset?.assetId || null,
            depositProofRoot: depositoryEvidence?.proofRoot || null,
            depositMeasurementRoot: depositoryEvidence?.measurementRoot || null,
            depositReconciliationReadbackRoot: depositoryEvidence?.reconciliationReadbackRoot || null,
            depositorySearchDocumentRoot: depositoryEvidence?.depositorySearchDocumentRoot || null,
            lexicalDocumentRoot: depositoryEvidence?.lexicalDocumentRoot || null,
            vectorDocumentRoot: depositoryEvidence?.vectorDocumentRoot || null,
            compensationPreviewRoot: depositoryEvidence?.compensationPreviewRoot || null,
            sourceToSharesPreviewRoot: depositoryEvidence?.sourceToSharesPreviewRoot || null,
            compensationState: compensationPreview?.state || null,
            compensationAllocationMethod: compensationPreview?.compensationRoute?.allocationMethod || null,
            compensationPriceAsset: compensationPreview?.compensationRoute?.priceAsset || null,
            compensationEligibleForFindingFits:
              compensationPreview?.readiness?.eligibleForFindingFits ?? null,
            compensationEligibleIfSelected:
              compensationPreview?.readiness?.eligibleForCompensationIfSelected ?? null,
            depositorWalletId: depositoryEvidence?.depositorBoundary?.walletId || null,
            depositoryIndexState: depositoryEvidence?.indexState?.vector || depositoryEvidence?.indexState?.lexical || null,
          },
          output: {
            asset: payload.asset || null,
            depositoryEvidence,
          },
        });
      } catch (recordError) {
        const message =
          recordError instanceof Error
            ? `${recordError.message} The deposit still landed in the Bitcode protocol state.`
            : 'The deposit landed in the Bitcode protocol state, but the ledger row could not be recorded.';
        setSubmitState({ kind: 'error', message });
        return;
      }
      setSubmitState({
        kind: 'success',
        message:
          'Candidate deposit submitted into the Bitcode repo-authenticated flow and recorded into the Bitcode activity ledger.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Deposit failed.';
      setSubmitState({ kind: 'error', message });
    }
  };

  if (!composer) {
    return (
      <TerminalWorkspaceCard
        id="terminalDepositComposer"
        kicker="Deposit intake"
        title="Draft and submit a deposit"
        summary="Reading selected supply, issuer continuity, and the current deposit draft posture."
        explainer={TERMINAL_WORKSPACE_EXPLAINERS.depositComposer}
      >
        <p className="mt-4 text-sm leading-6 text-neutral-300">Loading the current deposit draft…</p>
      </TerminalWorkspaceCard>
    );
  }

  return (
    <TerminalWorkspaceCard
      id="terminalDepositComposer"
      kicker="Deposit intake"
      title="Draft and submit a deposit"
      summary="Build a deposit from selected supply, add provenance overrides where needed, and keep the working draft resumable before Read, fit, and closure."
      explainer={TERMINAL_WORKSPACE_EXPLAINERS.depositComposer}
      headerAside={
        <BitcodeMetricGrid
          metrics={[
            {
              label: usesLiveRepositoryAnchor ? 'Repository' : 'Session',
              value: usesLiveRepositoryAnchor ? repositoryAnchorValue : composer.authSessionId || 'none bound',
            },
            { label: 'Selected supply', value: String(selectedSupplyCount) },
          ]}
          columnsClassName="tablet:grid-cols-2"
          itemClassName="rounded-2xl border border-white/8 bg-black/20 px-4 py-4"
          labelClassName="text-[0.62rem] uppercase tracking-[0.16em] text-emerald-300/85"
          valueClassName="text-sm font-semibold text-neutral-200"
        />
      }
    >

      <div className="mt-6 grid gap-5">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
              <FieldHeading explainer={TERMINAL_INLINE_EXPLAINERS.assetTitleOverride} badge="Optional">
                Asset title override
              </FieldHeading>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Repo artifact bundle title"
                className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400/40"
              />
            </label>

            <label className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
              <FieldHeading explainer={TERMINAL_INLINE_EXPLAINERS.authorOverride} badge="Optional">
                Author override
              </FieldHeading>
              <input
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Operator or issuer label"
                className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400/40"
              />
            </label>

            <label className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
              <FieldHeading explainer={TERMINAL_INLINE_EXPLAINERS.artifactKind} badge="Optional">
                Artifact kind
              </FieldHeading>
              <input
                value={artifactKind}
                onChange={(event) => setArtifactKind(event.target.value)}
                placeholder="patch, runbook, config…"
                className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400/40"
              />
            </label>

            <label className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
              <FieldHeading explainer={TERMINAL_INLINE_EXPLAINERS.artifactType} badge="Optional">
                Artifact type
              </FieldHeading>
              <input
                value={artifactType}
                onChange={(event) => setArtifactType(event.target.value)}
                placeholder="markdown, yaml, ts, bundle…"
                className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400/40"
              />
            </label>

            <div
              className={`rounded-[1.5rem] border px-4 py-4 ${
                usesLiveRepositoryAnchor
                  ? 'border-emerald-400/18 bg-emerald-400/10'
                  : 'border-white/8 bg-black/20'
              }`}
            >
              <FieldHeading
                explainer={TERMINAL_INLINE_EXPLAINERS.sourceRepo}
                badge={usesLiveRepositoryAnchor ? 'Selected' : 'Required'}
                className={usesLiveRepositoryAnchor ? 'text-emerald-200/85' : 'text-neutral-400'}
              >
                <span>{usesLiveRepositoryAnchor ? 'Selected source repo' : 'Source repo'}</span>
              </FieldHeading>
              <input
                value={displayedSourceRepo}
                onChange={(event) => setSourceRepo(event.target.value)}
                readOnly={usesLiveRepositoryAnchor}
                placeholder="repo boundary override"
                className={`mt-3 w-full rounded-xl border px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 ${
                  usesLiveRepositoryAnchor
                    ? 'border-emerald-300/20 bg-[rgba(10,15,30,0.92)]'
                    : 'border-white/10 bg-[rgba(10,15,30,0.88)] focus:border-emerald-400/40'
                }`}
              />
              {usesLiveRepositoryAnchor ? (
                <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-emerald-100/70">
                  Selected from deposit-side supply
                </p>
              ) : null}
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
              <FieldHeading
                badge={usesLiveRepositoryAnchor ? 'Required' : 'Optional'}
                explainer={
                  usesLiveRepositoryAnchor
                    ? TERMINAL_INLINE_EXPLAINERS.sourceBranch
                    : TERMINAL_INLINE_EXPLAINERS.sourceCommit
                }
              >
                <span>{usesLiveRepositoryAnchor ? 'Source branch' : 'Source commit / ref'}</span>
              </FieldHeading>
              {usesLiveRepositoryAnchor ? (
                <>
                  <select
                    aria-label="Deposit source branch"
                    value={repositoryBranchValue}
                    disabled={isLoadingRepositoryBranches || repositoryBranches.length === 0}
                    onChange={(event) => onRepositorySourceBranchChange?.(event.target.value)}
                    className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {repositoryBranches.length ? null : <option value="">No branches loaded</option>}
                    {repositoryBranches.map((branch) => (
                      <option key={branch.name} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-500">
                    {isLoadingRepositoryBranches ? 'Loading branches…' : 'Changing branch refreshes commit refs'}
                  </p>
                </>
              ) : (
                <input
                  value={sourceCommit}
                  onChange={(event) => setSourceCommit(event.target.value)}
                  placeholder="commit or branch override"
                  className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400/40"
                />
              )}
            </div>

            {usesLiveRepositoryAnchor ? (
              <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
                <FieldHeading explainer={TERMINAL_INLINE_EXPLAINERS.sourceCommit} badge="Required">
                  <span>Source commit / ref</span>
                </FieldHeading>
                <select
                  aria-label="Deposit source commit"
                  value={repositoryCommitValue}
                  disabled={!repositoryBranchValue || isLoadingRepositoryCommits || repositoryCommits.length === 0}
                  onChange={(event) => onRepositorySourceCommitChange?.(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {repositoryCommits.length ? null : <option value="">No commits loaded</option>}
                  {repositoryCommits.map((commit) => (
                    <option key={commit.sha} value={commit.sha}>
                      {formatCommitOption(commit)}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-500">
                  {isLoadingRepositoryCommits ? 'Loading commits…' : 'Exact source materialization uses this commit SHA'}
                </p>
              </div>
            ) : null}

            <label className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
              <FieldHeading explainer={TERMINAL_INLINE_EXPLAINERS.workflowRunId} badge="Optional">
                Workflow run override
              </FieldHeading>
              <input
                value={workflowRunId}
                onChange={(event) => setWorkflowRunId(event.target.value)}
                placeholder="workflow run id"
                className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400/40"
              />
            </label>

            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
              <FieldHeading
                explainer={TERMINAL_INLINE_EXPLAINERS.signerAddress}
                badge={preferredSignerAddressValue ? 'Connected wallet' : 'Required'}
              >
                <span>Signer address</span>
              </FieldHeading>
              <input
                value={signerAddress}
                onChange={(event) => setSignerAddress(event.target.value)}
                readOnly={Boolean(preferredSignerAddressValue)}
                placeholder="signer address"
                className={`mt-3 w-full rounded-xl border px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 ${
                  preferredSignerAddressValue
                    ? 'border-emerald-300/20 bg-[rgba(10,15,30,0.92)]'
                    : 'border-white/10 bg-[rgba(10,15,30,0.88)] focus:border-emerald-400/40'
                }`}
              />
              {signerAddressUsesWalletDefault ? (
                <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-emerald-100/70">
                  Defaulted from {preferredSignerLabel || 'connected wallet'}
                </p>
              ) : null}
            </div>
          </div>

          <label className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
            <FieldHeading explainer={TERMINAL_INLINE_EXPLAINERS.visualPreview} badge="Optional">
              Visual preview
            </FieldHeading>
            <textarea
              value={visualPreview}
              onChange={(event) => setVisualPreview(event.target.value)}
              rows={3}
              placeholder="Compact preview text for the submitted deposit"
              className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400/40"
            />
          </label>

          <label className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
            <FieldHeading explainer={TERMINAL_INLINE_EXPLAINERS.workingNote} badge="Optional">
              Working note
            </FieldHeading>
            <textarea
              value={workingNote}
              onChange={(event) => setWorkingNote(event.target.value)}
              rows={3}
              placeholder="Optional intake note for the active draft"
              className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400/40"
            />
          </label>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <label className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
              <FieldHeading explainer={TERMINAL_INLINE_EXPLAINERS.tags} badge="Optional">
                Tags
              </FieldHeading>
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="comma-separated tags"
                className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400/40"
              />
            </label>

            <label className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
              <FieldHeading explainer={TERMINAL_INLINE_EXPLAINERS.rawFallbackContent} badge="Optional">
                Raw fallback content
              </FieldHeading>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={4}
                placeholder="Manual content when repo inventory is not enough on its own"
                className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-emerald-400/40"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="basis-full rounded-[1.4rem] border border-emerald-400/18 bg-emerald-400/8 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-emerald-100/80">
                  Full deposit preview
                </p>
                <span className="rounded-full border border-emerald-300/20 bg-black/20 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-emerald-100/75">
                  Wallet-authenticated
                </span>
              </div>
              <dl className="mt-3 grid gap-2 text-xs text-neutral-300 sm:grid-cols-2 lg:grid-cols-3">
                {depositPreviewRows.map((row) => (
                  <div key={row.label} className="min-w-0 rounded-xl border border-white/8 bg-black/18 px-3 py-2">
                    <dt className="text-[0.58rem] uppercase tracking-[0.16em] text-neutral-500">{row.label}</dt>
                    <dd className="mt-1 truncate text-neutral-100" title={row.value}>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-[0.66rem] uppercase tracking-[0.2em] text-neutral-300">
              <span>Submission</span>
              <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.depositSubmission} />
            </div>
            <button
              type="submit"
              disabled={!canSubmit || submitState.kind === 'submitting'}
              className="rounded-[1.4rem] border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitState.kind === 'submitting' ? submitState.message ?? 'Submitting deposit to Bitcode…' : 'Submit deposit to Bitcode'}
            </button>
            {!settlementReady && walletSigningRequired ? (
              <button
                type="button"
                onClick={() => openAuxillaries('auxillaries', 'wallet')}
                className="rounded-[1.4rem] border border-amber-300/30 bg-amber-300/10 px-5 py-3 text-sm font-medium text-amber-100 transition hover:border-amber-300/50 hover:bg-amber-300/15"
              >
                Open Wallet signing
              </button>
            ) : null}
            {!settlementReady && repositoryReconnectRequired ? (
              <button
                type="button"
                onClick={() => openAuxillaries('auxillaries', 'externals')}
                className="rounded-[1.4rem] border border-amber-300/30 bg-amber-300/10 px-5 py-3 text-sm font-medium text-amber-100 transition hover:border-amber-300/50 hover:bg-amber-300/15"
              >
                Open GitHub connection
              </button>
            ) : null}
            <button
              type="button"
              disabled={submitState.kind !== 'success'}
              onClick={() => jumpToShellSection('terminalNeedSurface')}
              className="rounded-[1.4rem] border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to Read
            </button>
          </div>

          {submitState.kind !== 'idle' ? (
            <div
              className={`rounded-[1.3rem] border px-4 py-4 text-sm ${
                submitState.kind === 'error'
                  ? 'border-rose-400/25 bg-rose-400/10 text-rose-100'
                  : submitState.kind === 'success'
                    ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
                    : 'border-white/10 bg-black/20 text-neutral-200'
              }`}
            >
              {submitState.kind === 'submitting' ? submitState.message ?? 'Submitting deposit to Bitcode…' : submitState.message}
            </div>
          ) : null}
        </form>

        <aside className="space-y-4">
          <div
            className={`rounded-[1.5rem] border px-5 py-5 text-sm leading-6 ${
              settlementReady
                ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
                : 'border-amber-400/25 bg-amber-400/10 text-amber-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-current/80">
                Transaction readiness
              </p>
              <BitcodeInlineExplainer
                explainer={TERMINAL_INLINE_EXPLAINERS.transactionReadiness}
                triggerClassName="h-4.5 w-4.5 border-current/20 bg-current/10 text-[0.58rem] text-current"
              />
            </div>
            <p className="mt-3 text-current">{transactionReadiness.summary}</p>
            {transactionReadiness.blockers.length ? (
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-current/80">
                Pending: {transactionReadiness.blockers.map((entry) => entry.label).join(' · ')}
              </p>
            ) : null}
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">Selected supply</p>
            <p className="mt-3 text-sm leading-6 text-neutral-300">
              {selectedSupplyCount
                ? usesLiveRepositoryAnchor
                  ? `Bitcode will bind ${repositoryAnchorValue}${repositoryBranchValue ? ` on ${repositoryBranchValue}` : ''}${repositoryCommitValue ? ` at ${repositoryCommitValue.slice(0, 12)}` : ''} as the selected repository source for this deposit.`
                  : `Bitcode will bind ${selectedSupplyCount} selected repo artifact${selectedSupplyCount === 1 ? '' : 's'} into this deposit.`
                : 'No repo artifacts are currently selected. Use raw fallback content or select inventory above.'}
            </p>
            {usesLiveRepositoryAnchor && !hasSelectedSourceRevision ? (
              <p className="mt-3 rounded-[1.1rem] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
                Select a branch and commit before submitting the deposit so source materialization can fetch an exact snapshot.
              </p>
            ) : null}
            {selectedEntryLabels.length ? (
              <BitcodeChipCloud
                chips={selectedEntryLabels}
                className="mt-4"
                chipClassName="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-200"
              />
            ) : null}
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">After depositing</p>
            <p className="mt-3 text-sm leading-6 text-neutral-300">
              Submitting refreshes the working chain so selected supply, measured demand, fit, and later branch, proof,
              and settlement reads stay aligned in the same Bitcode Terminal.
            </p>
            <dl className="mt-4 grid gap-2 text-xs text-neutral-300">
              <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2">
                <dt className="text-[0.58rem] uppercase tracking-[0.16em] text-neutral-500">Compensation route</dt>
                <dd className="mt-1 text-neutral-100">BTC source-to-shares preview if this deposit is selected into a paid AssetPack</dd>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2">
                <dt className="text-[0.58rem] uppercase tracking-[0.16em] text-neutral-500">Pre-fit boundary</dt>
                <dd className="mt-1 text-neutral-100">No BTD mint or source-bearing reader visibility at deposit admission</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </TerminalWorkspaceCard>
  );
}
