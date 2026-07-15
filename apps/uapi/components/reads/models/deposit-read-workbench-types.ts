/**
 * Deposit/read workbench domain types (pure).
 * Shared by snapshot builders, normalizers, and pipeline host drafts.
 */

import type { KeyValueRow, Metric } from '@/components/bitcode/pipeline/ShellReading/shell-reading';

export type InventoryEntrySnapshot = {
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

/** Raw shell / bridge snapshot shape consumed by normalize. */
export type DepositReadWorkbenchShellSnapshot = {
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
