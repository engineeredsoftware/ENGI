/**
 * Deposit/read workbench types and pure helpers.
 * Relocated from app/terminal/terminal-deposit-read-workbench.
 */

import type { KeyValueRow, Metric } from '@/components/bitcode/pipeline/shell-reading';
import type { TerminalRepositoryContextState } from '@/components/bitcode/pipeline/models/repository-context';
export {
  TERMINAL_ENTERPRISE_READING_STEPS,
  type TerminalEnterpriseReadingStepId,
} from '@/components/reads/models/enterprise-reading-ux-state';

type InventoryEntrySnapshot = {
  inventoryEntryId?: string | null;
  title?: string | null;
  artifactKind?: string | null;
  originKind?: string | null;
  sourcePath?: string | null;
  workflowPath?: string | null;
  tags?: string[] | null;
};

export type TerminalSourceRevision = {
  repositoryFullName: string;
  branch: string;
  commit: string;
  activityId?: string | null;
  createdAt?: string | null;
};

export type TerminalDepositedSourceRevision = TerminalSourceRevision & {
  depositAssetId?: string | null;
  hasWalletOrAttestationProof?: boolean | null;
  hasAssetMeasurementEvidence?: boolean | null;
  proofRoot?: string | null;
  measurementRoot?: string | null;
  reconciliationReadbackRoot?: string | null;
  depositorySearchDocumentRoot?: string | null;
  lexicalDocumentRoot?: string | null;
  vectorDocumentRoot?: string | null;
  compensationPreviewRoot?: string | null;
  sourceToSharesPreviewRoot?: string | null;
  compensationState?: string | null;
  compensationAllocationMethod?: string | null;
  compensationPriceAsset?: string | null;
  depositorWalletId?: string | null;
  depositoryIndexState?: string | null;
};

type ShellSnapshot = {
  canonLabel?: string | null;
  sourceRevision?: TerminalSourceRevision | null;
  selection?: {
    projectionPrincipal?: string | null;
    branchMode?: string | null;
    scenarioId?: string | null;
    authSessionId?: string | null;
    selectedInventoryEntryIds?: string[] | null;
  } | null;
  repoSupplySummary?: {
    repoCount?: number | null;
    inventoryEntryCount?: number | null;
    scenarioCount?: number | null;
    candidateAssetCount?: number | null;
  } | null;
  scenario?: {
    scenarioId?: string | null;
    scenarioFamily?: string | null;
    repo?: string | null;
    task?: string | null;
    profileId?: string | null;
    profileLabel?: string | null;
    profileShortLabel?: string | null;
  } | null;
  authSession?: {
    authSessionId?: string | null;
    repo?: string | null;
    installationId?: string | number | null;
    installationAccountLogin?: string | null;
    defaultRef?: string | null;
    defaultSignerAddress?: string | null;
    appSlug?: string | null;
    permissionsRoot?: string | null;
  } | null;
  inventory?: {
    activeCount?: number | null;
    filteredCount?: number | null;
    selectedCount?: number | null;
    selectedEntries?: InventoryEntrySnapshot[] | null;
  } | null;
  depositingSurface?: {
    depositIntentSummary?: string | null;
    depositProfile?: string | null;
    repoSupplyRef?: string | null;
    selectedInventoryRefs?: string[] | null;
    selectedArtifactKindCounts?: Record<string, number> | null;
    selectedOriginKindCounts?: Record<string, number> | null;
    addressingRoot?: string | null;
    authRoot?: string | null;
    depositAssetId?: string | null;
    proofRoot?: string | null;
    measurementRoot?: string | null;
    reconciliationReadbackRoot?: string | null;
    depositorySearchDocumentRoot?: string | null;
    lexicalDocumentRoot?: string | null;
    vectorDocumentRoot?: string | null;
    compensationPreviewRoot?: string | null;
    sourceToSharesPreviewRoot?: string | null;
    compensationState?: string | null;
    compensationAllocationMethod?: string | null;
    compensationPriceAsset?: string | null;
    depositorWalletId?: string | null;
    depositoryIndexState?: string | null;
  } | null;
  readingSurface?: {
    parserKind?: string | null;
    readId?: string | null;
    readSummary?: string | null;
    taskSummary?: string | null;
    closureCriteria?: string[] | null;
    failureModes?: string[] | null;
    targetArtifactKinds?: string[] | null;
  } | null;
  fitSurface?: {
    fitSummary?: string | null;
    resultState?: string | null;
    fitResultState?: string | null;
    resultReasons?: string[] | null;
    fitResultReasons?: string[] | null;
    normalizationPressure?: string | null;
    decisiveKinds?: string[] | null;
    overlapKinds?: string[] | null;
    branchIntentSummary?: string | null;
    proofIntentSummary?: string | null;
    settlementIntentSummary?: string | null;
  } | null;
} | null;

export function buildLiveTerminalDepositReadWorkbenchSnapshot(
  repositoryContext?: TerminalRepositoryContextState | null,
  depositedSourceRevision?: TerminalDepositedSourceRevision | null,
): ShellSnapshot {
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

export type TerminalDepositReadWorkbench = {
  canonLabel: string;
  projectionPrincipal: string;
  branchMode: string;
  scenarioLabel: string;
  profileLabel: string;
  sourceRevision: TerminalSourceRevision | null;
  deposit: {
    summary: string;
    metrics: Metric[];
    rows: KeyValueRow[];
    selectedEntries: { id: string; label: string }[];
    artifactKinds: string[];
  };
  read: {
    summary: string;
    metrics: Metric[];
    rows: KeyValueRow[];
    closureCriteria: string[];
    targetKinds: string[];
  };
  fit: {
    summary: string;
    metrics: Metric[];
    rows: KeyValueRow[];
  };
};

function numberValue(value: number | null | undefined) {
  return typeof value === 'number' ? String(value) : '0';
}

function textValue(value: string | null | undefined) {
  return String(value || '').trim();
}

function listValue(values: (string | null | undefined)[] | null | undefined, fallback = '—') {
  const resolved = (values || []).map((value) => String(value || '').trim()).filter(Boolean);
  return resolved.length ? resolved.join(', ') : fallback;
}

function normalizeFitResultState(value?: string | null) {
  const resultState = textValue(value);
  if (resultState === 'worthy_fit' || resultState === 'no_worthy_fit' || resultState === 'blocked_readiness') {
    return resultState;
  }

  return 'blocked_readiness';
}

function countLabels(counts: Record<string, number> | null | undefined) {
  return Object.entries(counts || {})
    .filter(([, count]) => typeof count === 'number' && count > 0)
    .sort((left, right) => right[1] - left[1])
    .map(([label, count]) => `${label} (${count})`);
}

export function normalizeTerminalDepositReadWorkbench(
  snapshot: ShellSnapshot,
  repositoryContext?: TerminalRepositoryContextState | null,
): TerminalDepositReadWorkbench | null {
  if (!snapshot) return null;

  const selectedRepository = repositoryContext?.selectedRepository || null;
  const connectionStatus = repositoryContext?.connectionStatus || null;
  const usesRepositoryContext = Boolean(
    selectedRepository &&
      repositoryContext?.repositories.length &&
      !connectionStatus?.metadata?.mock_mode,
  );
  const providerAccount =
    String(
      connectionStatus?.username ||
        connectionStatus?.metadata?.account ||
        selectedRepository?.owner.username ||
        snapshot.authSession?.installationAccountLogin ||
        '—',
    ) || '—';
  const selectedEntries = (snapshot.inventory?.selectedEntries || [])
    .map((entry) => ({
      id: String(entry.inventoryEntryId || '').trim(),
      label:
        String(entry.title || '').trim() ||
        String(entry.sourcePath || '').trim() ||
        String(entry.workflowPath || '').trim() ||
        String(entry.inventoryEntryId || '').trim(),
    }))
    .filter((entry) => entry.id && entry.label);
  const artifactKinds = countLabels(snapshot.depositingSurface?.selectedArtifactKindCounts);
  const originKinds = countLabels(snapshot.depositingSurface?.selectedOriginKindCounts);
  const closureCriteria = (snapshot.readingSurface?.closureCriteria || [])
    .map((entry) => String(entry || '').trim())
    .filter(Boolean);
  const targetKinds = (snapshot.readingSurface?.targetArtifactKinds || [])
    .map((entry) => String(entry || '').trim())
    .filter(Boolean);
  const decisiveKinds = (snapshot.fitSurface?.decisiveKinds || [])
    .map((entry) => String(entry || '').trim())
    .filter(Boolean);
  const overlapKinds = (snapshot.fitSurface?.overlapKinds || [])
    .map((entry) => String(entry || '').trim())
    .filter(Boolean);
  const fitResultState = normalizeFitResultState(
    snapshot.fitSurface?.resultState || snapshot.fitSurface?.fitResultState,
  );
  const fitResultReason = listValue(
    snapshot.fitSurface?.resultReasons || snapshot.fitSurface?.fitResultReasons,
    'Source-bound fit posture is recorded, but AssetPack range, ledger anchor, BTC fee, settlement, and finality readback are not recorded in this staging-testnet result.',
  );
  const repositorySelectedEntries =
    usesRepositoryContext && selectedRepository
      ? [{ id: selectedRepository.id, label: selectedRepository.fullName }]
      : selectedEntries;
  const repositoryArtifactKinds =
    usesRepositoryContext && selectedRepository
      ? [selectedRepository.language || 'repository']
      : artifactKinds;
  const repositoryOriginKinds =
    usesRepositoryContext && selectedRepository
      ? ['repository']
      : originKinds;
  const repositoryLabel =
    selectedRepository?.fullName ||
    String(snapshot.authSession?.repo || snapshot.scenario?.repo || snapshot.depositingSurface?.repoSupplyRef || '—');
  const authSessionLabel =
    usesRepositoryContext && selectedRepository
      ? `${repositoryContext?.provider || 'github'}:${providerAccount}:${selectedRepository.fullName}`
      : String(snapshot.authSession?.authSessionId || snapshot.selection?.authSessionId || '—') || '—';
  const addressingRoot =
    usesRepositoryContext && selectedRepository
      ? `repository:${selectedRepository.id}`
      : String(snapshot.depositingSurface?.addressingRoot || '—');
  const authRoot =
    usesRepositoryContext && selectedRepository
      ? `${providerAccount} · ${repositoryContext?.provider || 'github'}`
      : String(snapshot.depositingSurface?.authRoot || '—');
  const depositAssetId = textValue(snapshot.depositingSurface?.depositAssetId);
  const proofRoot = textValue(snapshot.depositingSurface?.proofRoot);
  const measurementRoot = textValue(snapshot.depositingSurface?.measurementRoot);
  const reconciliationReadbackRoot = textValue(snapshot.depositingSurface?.reconciliationReadbackRoot);
  const depositorySearchDocumentRoot = textValue(snapshot.depositingSurface?.depositorySearchDocumentRoot);
  const lexicalDocumentRoot = textValue(snapshot.depositingSurface?.lexicalDocumentRoot);
  const vectorDocumentRoot = textValue(snapshot.depositingSurface?.vectorDocumentRoot);
  const compensationPreviewRoot = textValue(snapshot.depositingSurface?.compensationPreviewRoot);
  const sourceToSharesPreviewRoot = textValue(snapshot.depositingSurface?.sourceToSharesPreviewRoot);
  const compensationState = textValue(snapshot.depositingSurface?.compensationState);
  const compensationAllocationMethod = textValue(snapshot.depositingSurface?.compensationAllocationMethod);
  const compensationPriceAsset = textValue(snapshot.depositingSurface?.compensationPriceAsset);
  const depositorWalletId = textValue(snapshot.depositingSurface?.depositorWalletId);
  const depositoryIndexState = textValue(snapshot.depositingSurface?.depositoryIndexState);
  const sourceProofRootCount = [
    proofRoot,
    measurementRoot,
    reconciliationReadbackRoot,
  ].filter(Boolean).length;
  const searchDocumentRootCount = [
    depositorySearchDocumentRoot,
    lexicalDocumentRoot,
    vectorDocumentRoot,
  ].filter(Boolean).length;
  const compensationRootCount = [
    compensationPreviewRoot,
    sourceToSharesPreviewRoot,
  ].filter(Boolean).length;
  const sourceRevisionRepository = textValue(snapshot.sourceRevision?.repositoryFullName) || repositoryLabel;
  const sourceRevisionBranch =
    textValue(snapshot.sourceRevision?.branch) ||
    textValue(repositoryContext?.selectedBranch) ||
    textValue(selectedRepository?.defaultBranch) ||
    textValue(snapshot.authSession?.defaultRef) ||
    '—';
  const sourceRevisionCommit =
    textValue(snapshot.sourceRevision?.commit) || textValue(repositoryContext?.selectedCommit);
  const sourceRevision =
    sourceRevisionRepository && sourceRevisionRepository !== '—'
      ? {
          repositoryFullName: sourceRevisionRepository,
          branch: sourceRevisionBranch,
          commit: sourceRevisionCommit,
          activityId: textValue(snapshot.sourceRevision?.activityId) || null,
          createdAt: textValue(snapshot.sourceRevision?.createdAt) || null,
        }
      : null;
  const depositMetrics = usesRepositoryContext
    ? [
        { label: 'Selected refs', value: selectedRepository ? '1' : '0' },
        { label: 'Active inventory', value: numberValue(repositoryContext?.repositories.length) },
        { label: 'Repo supply entries', value: numberValue(repositoryContext?.repositories.length) },
        {
          label: 'Authenticated repos',
          value: numberValue(connectionStatus?.metadata?.repositories || repositoryContext?.repositories.length),
        },
        { label: 'Source proof roots', value: numberValue(sourceProofRootCount) },
        { label: 'Search document roots', value: numberValue(searchDocumentRootCount) },
        { label: 'Compensation roots', value: numberValue(compensationRootCount) },
      ]
    : [
        { label: 'Selected refs', value: numberValue(snapshot.inventory?.selectedCount) },
        { label: 'Active inventory', value: numberValue(snapshot.inventory?.activeCount) },
        { label: 'Repo supply entries', value: numberValue(snapshot.repoSupplySummary?.inventoryEntryCount) },
        { label: 'Authenticated repos', value: numberValue(snapshot.repoSupplySummary?.repoCount) },
        { label: 'Source proof roots', value: numberValue(sourceProofRootCount) },
        { label: 'Search document roots', value: numberValue(searchDocumentRootCount) },
        { label: 'Compensation roots', value: numberValue(compensationRootCount) },
      ];

  return {
    canonLabel: String(snapshot.canonLabel || 'Bitcode active posture').trim(),
    projectionPrincipal: String(snapshot.selection?.projectionPrincipal || 'buyer').trim() || 'buyer',
    branchMode: String(snapshot.selection?.branchMode || 'patch').trim() || 'patch',
    scenarioLabel:
      String(snapshot.scenario?.scenarioFamily || snapshot.scenario?.scenarioId || 'No active scenario').trim() ||
      'No active scenario',
    profileLabel:
      String(
        snapshot.scenario?.profileShortLabel ||
          snapshot.scenario?.profileLabel ||
          snapshot.depositingSurface?.depositProfile ||
          'Pending profile',
      ).trim() || 'Pending profile',
    sourceRevision,
    deposit: {
      summary:
        String(snapshot.depositingSurface?.depositIntentSummary || '').trim() ||
        'Supply authenticated repository material into the Bitcode deposit-side before branch and proof closure.',
      metrics: depositMetrics,
      rows: [
        {
          label: 'Repository',
          value: repositoryLabel,
        },
        {
          label: 'Source branch',
          value: sourceRevision?.branch || '—',
        },
        {
          label: 'Source commit',
          value: sourceRevision?.commit || '—',
        },
        {
          label: 'Auth session',
          value: authSessionLabel,
        },
        {
          label: 'Provider account',
          value: providerAccount,
        },
        {
          label: 'Artifact kinds',
          value: listValue(repositoryArtifactKinds),
        },
        {
          label: 'Origin kinds',
          value: listValue(repositoryOriginKinds),
        },
        {
          label: 'Addressing root',
          value: addressingRoot,
        },
        {
          label: 'Auth root',
          value: authRoot,
        },
        {
          label: 'Deposit asset',
          value: depositAssetId || '—',
        },
        {
          label: 'Depositor wallet',
          value: depositorWalletId || '—',
        },
        {
          label: 'Proof root',
          value: proofRoot || '—',
        },
        {
          label: 'Measurement root',
          value: measurementRoot || '—',
        },
        {
          label: 'Readback root',
          value: reconciliationReadbackRoot || '—',
        },
        {
          label: 'Search document root',
          value: depositorySearchDocumentRoot || '—',
        },
        {
          label: 'Lexical document root',
          value: lexicalDocumentRoot || '—',
        },
        {
          label: 'Vector document root',
          value: vectorDocumentRoot || '—',
        },
        {
          label: 'Compensation state',
          value: compensationState || '—',
        },
        {
          label: 'Compensation asset',
          value: compensationPriceAsset || '—',
        },
        {
          label: 'Source-to-shares method',
          value: compensationAllocationMethod || '—',
        },
        {
          label: 'Compensation preview root',
          value: compensationPreviewRoot || '—',
        },
        {
          label: 'Source-to-shares preview root',
          value: sourceToSharesPreviewRoot || '—',
        },
        {
          label: 'Depository index',
          value: depositoryIndexState || '—',
        },
      ],
      selectedEntries: repositorySelectedEntries,
      artifactKinds: repositoryArtifactKinds,
    },
    read: {
      summary:
        String(snapshot.readingSurface?.readSummary || snapshot.readingSurface?.taskSummary || snapshot.scenario?.task || '').trim() ||
        'Measured read is the active demand surface Bitcode must close before verification, settlement, and proof become meaningful.',
      metrics: [
        { label: 'Target kinds', value: numberValue(targetKinds.length) },
        { label: 'Closure criteria', value: numberValue(closureCriteria.length) },
        { label: 'Read scenarios', value: numberValue(snapshot.repoSupplySummary?.scenarioCount) },
        { label: 'Candidate assets', value: numberValue(snapshot.repoSupplySummary?.candidateAssetCount) },
      ],
      rows: [
        {
          label: 'Scenario',
          value: String(snapshot.scenario?.scenarioFamily || snapshot.scenario?.scenarioId || '—'),
        },
        {
          label: 'Repository',
          value: usesRepositoryContext && selectedRepository
            ? selectedRepository.fullName
            : String(snapshot.scenario?.repo || selectedRepository?.fullName || '—'),
        },
        {
          label: 'Source branch',
          value: sourceRevision?.branch || '—',
        },
        {
          label: 'Source commit',
          value: sourceRevision?.commit || '—',
        },
        {
          label: 'Profile',
          value:
            String(
              snapshot.scenario?.profileShortLabel ||
                snapshot.scenario?.profileLabel ||
                snapshot.depositingSurface?.depositProfile ||
                '—',
            ) || '—',
        },
        {
          label: 'Parser',
          value: String(snapshot.readingSurface?.parserKind || '—'),
        },
        {
          label: 'Failure modes',
          value: listValue(snapshot.readingSurface?.failureModes),
        },
        {
          label: 'Target artifact kinds',
          value: listValue(targetKinds),
        },
      ],
      closureCriteria,
      targetKinds,
    },
    fit: {
      summary:
        String(snapshot.fitSurface?.fitSummary || '').trim() ||
        'Deposit-to-Read fit stays the decisive Bitcode relation before branch, proof, and settlement are justified.',
      metrics: [
        {
          label: 'Pressure',
          value: String(snapshot.fitSurface?.normalizationPressure || 'pending'),
        },
        {
          label: 'Decisive kinds',
          value: numberValue(decisiveKinds.length),
        },
        {
          label: 'Overlap kinds',
          value: numberValue(overlapKinds.length),
        },
        {
          label: 'Branch mode',
          value: String(snapshot.selection?.branchMode || 'patch'),
        },
      ],
      rows: [
        {
          label: 'Projection',
          value: String(snapshot.selection?.projectionPrincipal || 'buyer'),
        },
        {
          label: 'Source revision',
          value: sourceRevision?.commit
            ? `${sourceRevision.repositoryFullName}@${sourceRevision.branch}:${sourceRevision.commit.slice(0, 12)}`
            : sourceRevision
              ? `${sourceRevision.repositoryFullName}@${sourceRevision.branch}`
              : '—',
        },
        {
          label: 'Fit result',
          value: fitResultState,
        },
        {
          label: 'Result reason',
          value: fitResultReason,
        },
        {
          label: 'Decisive kinds',
          value: listValue(decisiveKinds),
        },
        {
          label: 'Overlap kinds',
          value: listValue(overlapKinds),
        },
        {
          label: 'Branch intent',
          value: String(snapshot.fitSurface?.branchIntentSummary || '—'),
        },
        {
          label: 'Proof intent',
          value: String(snapshot.fitSurface?.proofIntentSummary || '—'),
        },
        {
          label: 'Settlement intent',
          value: String(snapshot.fitSurface?.settlementIntentSummary || '—'),
        },
      ],
    },
  };
}
