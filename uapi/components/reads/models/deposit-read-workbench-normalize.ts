/**
 * Normalize live workbench snapshot into deposit/read/fit view model.
 */
import type { TerminalRepositoryContextState } from '@/components/bitcode/pipeline/models/repository-context';
import type {
  DepositReadWorkbenchShellSnapshot,
  TerminalDepositReadWorkbench,
} from '@/components/reads/models/deposit-read-workbench-types';

import {
  numberValue,
  textValue,
  listValue,
  normalizeFitResultState,
  countLabels,
} from './deposit-read-workbench-normalize-helpers';

export function normalizeTerminalDepositReadWorkbench(
  snapshot: DepositReadWorkbenchShellSnapshot,
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
