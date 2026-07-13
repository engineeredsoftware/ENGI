/**
 * Live deposit/read workbench snapshot builder (pure).
 * Projects repository context + deposited revision into a shell snapshot.
 */

import type { TerminalRepositoryContextState } from '@/components/bitcode/pipeline/models/repository-context';
import type {
  DepositReadWorkbenchShellSnapshot,
  TerminalDepositedSourceRevision,
} from '@/components/reads/models/deposit-read-workbench-types';

export function buildLiveTerminalDepositReadWorkbenchSnapshot(
  repositoryContext?: TerminalRepositoryContextState | null,
  depositedSourceRevision?: TerminalDepositedSourceRevision | null,
): DepositReadWorkbenchShellSnapshot {
  const selectedRepository = repositoryContext?.selectedRepository || null;
  if (!selectedRepository) return null;

  const providerAccount =
    repositoryContext?.connectionStatus?.username ||
    repositoryContext?.connectionStatus?.metadata?.account ||
    selectedRepository.owner.username ||
    'connected account';
  const selectedBranch =
    repositoryContext?.selectedBranch || selectedRepository.defaultBranch || 'main';
  const selectedCommit = repositoryContext?.selectedCommit || '';
  const matchingDepositedRevision =
    depositedSourceRevision?.repositoryFullName === selectedRepository.fullName
      ? depositedSourceRevision
      : null;
  const sourceBranch = matchingDepositedRevision?.branch || selectedBranch;
  const sourceCommit = matchingDepositedRevision?.commit || selectedCommit;
  const selectedRevisionLabel = sourceCommit
    ? `${selectedRepository.fullName}@${sourceBranch}:${sourceCommit.slice(0, 12)}`
    : `${selectedRepository.fullName}@${sourceBranch}`;
  const readScenarioId = `terminal-read-fit:${selectedRepository.id}`;
  const readScenarioFamily = `Terminal Read/Fit QA for ${selectedRepository.fullName}`;
  const readSummary =
    `Read the deposited source revision ${selectedRevisionLabel} for a non-mock Terminal path from wallet and GitHub readiness through Deposit, Read/Fit, AssetPack evidence, proof/finality readback, and Supabase/ledger reconciliation.`;
  const closureCriteria = [
    'Deposit evidence is bound to repository, branch, commit, and signer.',
    'Read measurement is accepted before Finding Fits discovery or blocks with a precise reason.',
    'Fit evidence references the deposited repository revision and candidate AssetPack.',
    'AssetPack, proof, finality, and reconciliation posture are visible or explicitly blocked.',
    'No mock, frontier, or protocol-demo repository is treated as live staging source.',
  ];
  const targetArtifactKinds = [
    'repository-revision',
    'fit-quality-receipt',
    'asset-pack-evidence',
    'proof-root',
    'reconciliation-readback',
  ];

  return {
    canonLabel: 'Live Bitcode staging posture',
    sourceRevision: {
      repositoryFullName: selectedRepository.fullName,
      branch: sourceBranch,
      commit: sourceCommit,
      activityId: matchingDepositedRevision?.activityId || null,
      createdAt: matchingDepositedRevision?.createdAt || null,
    },
    selection: {
      projectionPrincipal: 'buyer',
      branchMode: 'patch',
      scenarioId: readScenarioId,
      authSessionId: `${repositoryContext?.provider || 'github'}:${providerAccount}:${selectedRepository.fullName}`,
      selectedInventoryEntryIds: [selectedRepository.id],
    },
    repoSupplySummary: {
      repoCount: repositoryContext?.repositories.length || 1,
      inventoryEntryCount: repositoryContext?.repositories.length || 1,
      scenarioCount: 1,
      candidateAssetCount: 1,
    },
    scenario: {
      scenarioId: readScenarioId,
      scenarioFamily: readScenarioFamily,
      repo: selectedRepository.fullName,
      task: readSummary,
      profileShortLabel: 'Read/Fit QA',
    },
    authSession: {
      authSessionId: `${repositoryContext?.provider || 'github'}:${providerAccount}:${selectedRepository.fullName}`,
      repo: selectedRepository.fullName,
      installationAccountLogin: providerAccount,
      defaultRef: sourceBranch,
    },
    inventory: {
      activeCount: repositoryContext?.repositories.length || 1,
      filteredCount: repositoryContext?.repositories.length || 1,
      selectedCount: 1,
      selectedEntries: [
        {
          inventoryEntryId: selectedRepository.id,
          title: selectedRepository.fullName,
          artifactKind: selectedRepository.language || 'repository',
          originKind: 'repository',
          sourcePath: selectedRepository.url,
        },
      ],
    },
    depositingSurface: {
      depositIntentSummary:
        matchingDepositedRevision
          ? 'Latest proof-bearing deposit submission is pinned as the source revision for measured Read and fit evaluation.'
          : 'Live repository supply is selected for deposit before any measured Read or fit can be evaluated.',
      depositProfile: 'Read/Fit QA',
      repoSupplyRef: selectedRepository.fullName,
      selectedInventoryRefs: [selectedRepository.id],
      selectedArtifactKindCounts: { [selectedRepository.language || 'repository']: 1 },
      selectedOriginKindCounts: { repository: 1 },
      addressingRoot: `repository:${selectedRepository.id}`,
      authRoot: `${providerAccount} · ${repositoryContext?.provider || 'github'}`,
      depositAssetId: matchingDepositedRevision?.depositAssetId || null,
      proofRoot: matchingDepositedRevision?.proofRoot || null,
      measurementRoot: matchingDepositedRevision?.measurementRoot || null,
      reconciliationReadbackRoot: matchingDepositedRevision?.reconciliationReadbackRoot || null,
      depositorySearchDocumentRoot: matchingDepositedRevision?.depositorySearchDocumentRoot || null,
      lexicalDocumentRoot: matchingDepositedRevision?.lexicalDocumentRoot || null,
      vectorDocumentRoot: matchingDepositedRevision?.vectorDocumentRoot || null,
      compensationPreviewRoot: matchingDepositedRevision?.compensationPreviewRoot || null,
      sourceToSharesPreviewRoot: matchingDepositedRevision?.sourceToSharesPreviewRoot || null,
      compensationState: matchingDepositedRevision?.compensationState || null,
      compensationAllocationMethod: matchingDepositedRevision?.compensationAllocationMethod || null,
      compensationPriceAsset: matchingDepositedRevision?.compensationPriceAsset || null,
      depositorWalletId: matchingDepositedRevision?.depositorWalletId || null,
      depositoryIndexState: matchingDepositedRevision?.depositoryIndexState || null,
    },
    readingSurface: {
      parserKind: 'terminal-read-fit-parser',
      readId: readScenarioId,
      readSummary,
      taskSummary: readSummary,
      closureCriteria,
      failureModes: [
        'mock repository leakage',
        'missing repository revision evidence',
        'read review not admitted before Finding Fits discovery',
        'AssetPack fit without proof or finality posture',
        'ledger/database readback drift',
      ],
      targetArtifactKinds,
    },
    fitSurface: {
      fitSummary:
        'Only source-bound repository evidence can satisfy this Read; otherwise Bitcode must return no-worthy-fit or blocked-readiness evidence.',
      normalizationPressure: 'critical',
      decisiveKinds: targetArtifactKinds,
      overlapKinds: ['repository-revision', 'asset-pack-evidence', 'proof-root'],
      branchIntentSummary: 'Materialize only after the Read is admitted and source revision evidence remains aligned.',
      proofIntentSummary: 'Prove repository revision, read measurement, fit quality, wallet authorization, and reconciliation posture.',
      settlementIntentSummary: 'Settle only when AssetPack evidence and finality readback agree; otherwise show the blocking readiness condition.',
    },
  };
}
