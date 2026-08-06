import { assertNonEmptyString } from './constants';

export type ProjectionRepairKind =
  | 'ledger_finality_state'
  | 'ledger_anchor_root'
  | 'object_storage_artifact'
  | 'staging_testnet_readback'
  | 'product_post_state'
  | 'receipt_root'
  | 'settlement_conservation'
  | 'delivery_recovery';

export type ProjectionDriftKind =
  | 'missing_database_projection'
  | 'ledger_root_mismatch'
  | 'ledger_finality_mismatch'
  | 'database_orphan_projection'
  | 'missing_object_storage_artifact'
  | 'object_storage_root_mismatch'
  | 'staging_testnet_readback_blocked'
  | 'settlement_conservation_drift';

export type ProjectionRepairActionKind =
  | 'retry_database_readback'
  | 'retry_object_storage_write'
  | 'retry_staging_testnet_readback'
  | 'project_ledger_fact'
  | 'update_finality_state'
  | 'quarantine_database_projection'
  | 'quarantine_object_storage_artifact'
  | 'pause_settlement_unlock'
  | 'recover_delivery';

export type LedgerDatabaseReconciliationState =
  | 'aligned'
  | 'retryable'
  | 'repairable'
  | 'approval_required'
  | 'blocked';

export interface ProjectionRepairAction {
  actionId: string;
  repairId?: string;
  factId: string;
  actionKind: ProjectionRepairActionKind;
  driftKind: ProjectionDriftKind;
  summary: string;
  blocking: boolean;
  requiresOperatorApproval: boolean;
  proofRoot: string;
  issuedAt: string;
}

export interface LedgerObservedFact {
  factId: string;
  ledgerRoot: string;
  finalityState: 'prepared' | 'broadcast' | 'confirmed' | 'reorged' | 'failed';
}

export interface DatabaseProjectedFact {
  factId: string;
  projectedLedgerRoot: string;
  projectedFinalityState: 'prepared' | 'broadcast' | 'confirmed' | 'reorged' | 'failed';
  projectedObjectStorageRoot?: string;
}

export type ObjectStorageArtifactKind =
  | 'pipeline_evidence'
  | 'pipeline_telemetry'
  | 'asset_pack_source_safe_preview'
  | 'asset_pack_protected_source_encrypted'
  | 'delivery_manifest'
  | 'ledger_projection_artifact';

export type ObjectStorageSourceVisibility =
  | 'proof_public'
  | 'source_safe'
  | 'encrypted_protected_source';

export interface ObjectStorageArtifactFact {
  factId: string;
  artifactId: string;
  artifactKind: ObjectStorageArtifactKind;
  storageRoot: string;
  manifestRoot?: string;
  sourceVisibility: ObjectStorageSourceVisibility;
  durable: boolean;
  containsProtectedSource: boolean;
  encrypted: boolean;
}

export type SupabaseProjectionLane = 'local' | 'staging-testnet' | 'production-mainnet';
export type SupabaseProjectionCredentialState = 'provided_out_of_band' | 'missing';

export interface SupabaseProjectionTableReadback {
  table: string;
  expectedCount: number;
  observedCount: number;
  synchronized: boolean;
  proofRoot?: string;
}

export interface SupabaseStagingTestnetProjectionReadback {
  kind: 'btd.supabase_projection_readback';
  readbackId: string;
  lane: SupabaseProjectionLane;
  supabaseProjectRef: string;
  restHost: string;
  databaseHost?: string;
  adminCredentialState: SupabaseProjectionCredentialState;
  secretValuesStored: false;
  tableReadbacks: SupabaseProjectionTableReadback[];
  state: 'synchronized' | 'blocked';
  blockingReasons: string[];
  proofRoot: string;
  issuedAt: string;
}

export type MetaphysicalCanonicalFactKind =
  | 'private_source_metadata'
  | 'need_fit_context'
  | 'access_policy_document'
  | 'encrypted_storage_pointer'
  | 'dispute_record'
  | 'telemetry_context';

export interface MetaphysicalCanonicalFact {
  factId: string;
  factKind: MetaphysicalCanonicalFactKind;
  canonicalRoot: string;
  receiptRoot?: string;
  private: boolean;
}

export interface ProjectionRepairReceipt {
  kind: 'btd.ledger_database_projection_repair';
  repairId: string;
  factId: string;
  repairKind: ProjectionRepairKind;
  driftKind: ProjectionDriftKind;
  repairActionKind: ProjectionRepairActionKind;
  before: string;
  after: string;
  blocking: boolean;
  requiresOperatorApproval: boolean;
  proofRoot: string;
  issuedAt: string;
}

export interface SettlementConservationCheck {
  checkId: string;
  expectedDebitSats: number;
  observedDebitSats: number;
  expectedCreditSats: number;
  observedCreditSats: number;
  feeQuoteRoot?: string;
  paymentReceiptRoot?: string;
}

export interface SettlementConservationProjection {
  status: 'not_checked' | 'balanced' | 'drifted';
  checks: SettlementConservationCheck[];
  proofRoot: string;
}

export interface LedgerDatabaseReconciliationProofRoots {
  ledgerObservedRoot: string;
  databaseProjectionRoot: string;
  objectStorageRoot: string;
  metaphysicalCanonicalRoot: string;
  stagingTestnetReadbackRoot: string;
  repairPlanRoot: string;
  settlementConservationRoot: string;
}

export interface LedgerDatabaseReconciliationReport {
  kind: 'btd.ledger_database_reconciliation';
  reconciliationId: string;
  state: LedgerDatabaseReconciliationState;
  repairs: ProjectionRepairReceipt[];
  repairActions: ProjectionRepairAction[];
  driftKindCounts: Record<ProjectionDriftKind, number>;
  proofRoots: LedgerDatabaseReconciliationProofRoots;
  settlementConservation: SettlementConservationProjection;
  objectStorageArtifacts: ObjectStorageArtifactFact[];
  metaphysicalFacts: MetaphysicalCanonicalFact[];
  stagingTestnetReadback: SupabaseStagingTestnetProjectionReadback | null;
  blocking: boolean;
}

export function buildSupabaseStagingTestnetProjectionReadback(input: {
  readbackId: string;
  lane: SupabaseProjectionLane;
  supabaseProjectRef: string;
  restHost: string;
  databaseHost?: string;
  adminCredentialState: SupabaseProjectionCredentialState;
  tableReadbacks: SupabaseProjectionTableReadback[];
  issuedAt?: string;
}): SupabaseStagingTestnetProjectionReadback {
  const readbackId = assertNonEmptyString(input.readbackId, 'readbackId');
  const tableReadbacks = input.tableReadbacks.map(assertSupabaseProjectionTableReadback);
  const blockingReasons = tableReadbacks
    .filter((entry) => !entry.synchronized)
    .map(
      (entry) =>
        `${entry.table} expected ${entry.expectedCount} row(s) and observed ${entry.observedCount}.`,
    );

  if (input.adminCredentialState === 'missing') {
    blockingReasons.push('Supabase admin credential is missing from the untracked environment.');
  }

  const restHost = assertSecretFreeIdentifier(input.restHost, 'restHost');
  const databaseHost = input.databaseHost
    ? assertSecretFreeIdentifier(input.databaseHost, 'databaseHost')
    : undefined;
  const supabaseProjectRef = assertSecretFreeIdentifier(
    input.supabaseProjectRef,
    'supabaseProjectRef',
  );

  return {
    kind: 'btd.supabase_projection_readback',
    readbackId,
    lane: input.lane,
    supabaseProjectRef,
    restHost,
    databaseHost,
    adminCredentialState: input.adminCredentialState,
    secretValuesStored: false,
    tableReadbacks,
    state: blockingReasons.length ? 'blocked' : 'synchronized',
    blockingReasons,
    proofRoot: stableProofRoot('supabase-projection-readback', [
      readbackId,
      input.lane,
      supabaseProjectRef,
      restHost,
      databaseHost ?? null,
      input.adminCredentialState,
      tableReadbacks,
      blockingReasons,
    ]),
    issuedAt: input.issuedAt ?? new Date().toISOString(),
  };
}

export function reconcileLedgerDatabaseProjection(input: {
  reconciliationId: string;
  ledgerFacts: LedgerObservedFact[];
  databaseFacts: DatabaseProjectedFact[];
  objectStorageArtifacts?: ObjectStorageArtifactFact[];
  metaphysicalFacts?: MetaphysicalCanonicalFact[];
  stagingTestnetReadback?: SupabaseStagingTestnetProjectionReadback | null;
  settlementConservationChecks?: SettlementConservationCheck[];
  issuedAt?: string;
}): LedgerDatabaseReconciliationReport {
  const reconciliationId = assertNonEmptyString(input.reconciliationId, 'reconciliationId');
  const databaseByFactId = new Map(input.databaseFacts.map((fact) => [fact.factId, fact]));
  const ledgerFactIds = new Set(input.ledgerFacts.map((fact) => fact.factId));
  const objectStorageArtifacts = (input.objectStorageArtifacts ?? []).map(
    assertObjectStorageArtifactFact,
  );
  const objectStorageFactIds = new Set(objectStorageArtifacts.map((fact) => fact.factId));
  const metaphysicalFacts = (input.metaphysicalFacts ?? []).map(assertMetaphysicalFact);
  const stagingTestnetReadback = input.stagingTestnetReadback
    ? assertSupabaseStagingTestnetProjectionReadback(input.stagingTestnetReadback)
    : null;
  const settlementConservationChecks = (input.settlementConservationChecks ?? []).map(
    assertSettlementConservationCheck,
  );
  const repairs: ProjectionRepairReceipt[] = [];
  const issuedAt = input.issuedAt ?? new Date().toISOString();

  for (const ledgerFact of input.ledgerFacts) {
    assertLedgerFact(ledgerFact);
    const projected = databaseByFactId.get(ledgerFact.factId);

    if (!projected) {
      repairs.push(buildRepairReceipt({
        reconciliationId,
        factId: ledgerFact.factId,
        suffix: 'missing_projection',
        repairKind: 'ledger_anchor_root',
        driftKind: 'missing_database_projection',
        repairActionKind: 'project_ledger_fact',
        before: 'missing',
        after: ledgerFact.ledgerRoot,
        blocking: true,
        requiresOperatorApproval: true,
        issuedAt,
      }));
      continue;
    }

    if (projected.projectedLedgerRoot !== ledgerFact.ledgerRoot) {
      repairs.push(buildRepairReceipt({
        reconciliationId,
        factId: ledgerFact.factId,
        suffix: 'ledger_root',
        repairKind: 'ledger_anchor_root',
        driftKind: 'ledger_root_mismatch',
        repairActionKind: 'project_ledger_fact',
        before: projected.projectedLedgerRoot,
        after: ledgerFact.ledgerRoot,
        blocking: true,
        requiresOperatorApproval: true,
        issuedAt,
      }));
    }

    if (projected.projectedFinalityState !== ledgerFact.finalityState) {
      const finalityBlocks =
        ledgerFact.finalityState === 'confirmed' ||
        ledgerFact.finalityState === 'reorged' ||
        ledgerFact.finalityState === 'failed';
      repairs.push(buildRepairReceipt({
        reconciliationId,
        factId: ledgerFact.factId,
        suffix: 'finality',
        repairKind: 'ledger_finality_state',
        driftKind: 'ledger_finality_mismatch',
        repairActionKind:
          ledgerFact.finalityState === 'reorged' || ledgerFact.finalityState === 'failed'
            ? 'pause_settlement_unlock'
            : 'update_finality_state',
        before: projected.projectedFinalityState,
        after: ledgerFact.finalityState,
        blocking: finalityBlocks,
        requiresOperatorApproval: finalityBlocks,
        issuedAt,
      }));
    }
  }

  for (const databaseFact of input.databaseFacts) {
    assertDatabaseFact(databaseFact);
    if (ledgerFactIds.has(databaseFact.factId) || objectStorageFactIds.has(databaseFact.factId)) {
      continue;
    }
    repairs.push(buildRepairReceipt({
      reconciliationId,
      factId: databaseFact.factId,
      suffix: 'orphan_projection',
      repairKind: 'product_post_state',
      driftKind: 'database_orphan_projection',
      repairActionKind: 'quarantine_database_projection',
      before: databaseFact.projectedLedgerRoot,
      after: 'quarantined_until_ledger_observation',
      blocking: true,
      requiresOperatorApproval: true,
      issuedAt,
    }));
  }

  for (const artifact of objectStorageArtifacts) {
    const projected = databaseByFactId.get(artifact.factId);

    if (!artifact.durable) {
      repairs.push(buildRepairReceipt({
        reconciliationId,
        factId: artifact.factId,
        suffix: 'object_storage_missing',
        repairKind: 'object_storage_artifact',
        driftKind: 'missing_object_storage_artifact',
        repairActionKind: 'retry_object_storage_write',
        before: 'missing',
        after: artifact.storageRoot,
        blocking: true,
        requiresOperatorApproval: false,
        issuedAt,
      }));
    }

    if (
      projected?.projectedObjectStorageRoot &&
      projected.projectedObjectStorageRoot !== artifact.storageRoot
    ) {
      repairs.push(buildRepairReceipt({
        reconciliationId,
        factId: artifact.factId,
        suffix: 'object_storage_root',
        repairKind: 'object_storage_artifact',
        driftKind: 'object_storage_root_mismatch',
        repairActionKind: 'quarantine_object_storage_artifact',
        before: projected.projectedObjectStorageRoot,
        after: artifact.storageRoot,
        blocking: true,
        requiresOperatorApproval: true,
        issuedAt,
      }));
    }
  }

  if (stagingTestnetReadback?.state === 'blocked') {
    repairs.push(buildRepairReceipt({
      reconciliationId,
      factId: stagingTestnetReadback.readbackId,
      suffix: 'staging_testnet_readback',
      repairKind: 'staging_testnet_readback',
      driftKind: 'staging_testnet_readback_blocked',
      repairActionKind: 'retry_staging_testnet_readback',
      before: stagingTestnetReadback.blockingReasons.join('; ') || 'blocked',
      after: 'synchronized',
      blocking: true,
      requiresOperatorApproval: false,
      issuedAt,
    }));
  }

  for (const check of settlementConservationChecks) {
    if (isConservationBalanced(check)) continue;
    repairs.push(buildRepairReceipt({
      reconciliationId,
      factId: check.checkId,
      suffix: 'settlement_conservation',
      repairKind: 'settlement_conservation',
      driftKind: 'settlement_conservation_drift',
      repairActionKind: 'pause_settlement_unlock',
      before: conservationSnapshot(check, 'expected'),
      after: conservationSnapshot(check, 'observed'),
      blocking: true,
      requiresOperatorApproval: true,
      issuedAt,
    }));
  }

  const repairActions = repairs.map((repair) => buildRepairAction(repair));
  const driftKindCounts = countDriftKinds(repairs);
  const settlementConservation = buildSettlementConservationProjection(
    reconciliationId,
    settlementConservationChecks,
  );
  const proofRoots = {
    ledgerObservedRoot: stableProofRoot('ledger-observed', input.ledgerFacts),
    databaseProjectionRoot: stableProofRoot('database-projected', input.databaseFacts),
    objectStorageRoot: stableProofRoot('object-storage-artifacts', objectStorageArtifacts),
    metaphysicalCanonicalRoot: stableProofRoot('metaphysical-canonical', metaphysicalFacts),
    stagingTestnetReadbackRoot:
      stagingTestnetReadback?.proofRoot ??
      stableProofRoot('supabase-projection-readback', ['not-provided', reconciliationId]),
    repairPlanRoot: stableProofRoot('repair-plan', repairs),
    settlementConservationRoot: settlementConservation.proofRoot,
  };
  const blocking = repairs.some((repair) => repair.blocking);

  return {
    kind: 'btd.ledger_database_reconciliation',
    reconciliationId,
    state: deriveReconciliationState(repairs),
    repairs,
    repairActions,
    driftKindCounts,
    proofRoots,
    settlementConservation,
    objectStorageArtifacts,
    metaphysicalFacts,
    stagingTestnetReadback,
    blocking,
  };
}

function assertLedgerFact(fact: LedgerObservedFact): void {
  assertNonEmptyString(fact.factId, 'factId');
  assertNonEmptyString(fact.ledgerRoot, 'ledgerRoot');
}

function assertDatabaseFact(fact: DatabaseProjectedFact): void {
  assertNonEmptyString(fact.factId, 'factId');
  assertNonEmptyString(fact.projectedLedgerRoot, 'projectedLedgerRoot');
  if (fact.projectedObjectStorageRoot !== undefined) {
    assertNonEmptyString(fact.projectedObjectStorageRoot, 'projectedObjectStorageRoot');
  }
}

function assertObjectStorageArtifactFact(
  fact: ObjectStorageArtifactFact,
): ObjectStorageArtifactFact {
  assertNonEmptyString(fact.factId, 'factId');
  assertNonEmptyString(fact.artifactId, 'artifactId');
  assertNonEmptyString(fact.artifactKind, 'artifactKind');
  assertNonEmptyString(fact.storageRoot, 'storageRoot');
  if (fact.manifestRoot !== undefined) {
    assertNonEmptyString(fact.manifestRoot, 'manifestRoot');
  }
  assertNonEmptyString(fact.sourceVisibility, 'sourceVisibility');

  if (fact.containsProtectedSource && !fact.encrypted) {
    throw new Error('Object storage artifacts containing protected source must be encrypted.');
  }
  if (fact.containsProtectedSource && fact.sourceVisibility !== 'encrypted_protected_source') {
    throw new Error(
      'Object storage protected source artifacts must be marked encrypted_protected_source.',
    );
  }
  if (!fact.containsProtectedSource && fact.sourceVisibility === 'encrypted_protected_source') {
    throw new Error('Encrypted protected source visibility requires protected source content.');
  }

  return fact;
}

function assertMetaphysicalFact(fact: MetaphysicalCanonicalFact): MetaphysicalCanonicalFact {
  assertNonEmptyString(fact.factId, 'factId');
  assertNonEmptyString(fact.factKind, 'factKind');
  assertNonEmptyString(fact.canonicalRoot, 'canonicalRoot');
  if (fact.receiptRoot !== undefined) {
    assertNonEmptyString(fact.receiptRoot, 'receiptRoot');
  }
  if (fact.private !== true) {
    throw new Error('Metaphysical canonical facts must be marked private.');
  }

  return fact;
}

function assertSettlementConservationCheck(
  check: SettlementConservationCheck,
): SettlementConservationCheck {
  assertNonEmptyString(check.checkId, 'checkId');
  assertNonNegativeSats(check.expectedDebitSats, 'expectedDebitSats');
  assertNonNegativeSats(check.observedDebitSats, 'observedDebitSats');
  assertNonNegativeSats(check.expectedCreditSats, 'expectedCreditSats');
  assertNonNegativeSats(check.observedCreditSats, 'observedCreditSats');
  if (check.feeQuoteRoot !== undefined) assertNonEmptyString(check.feeQuoteRoot, 'feeQuoteRoot');
  if (check.paymentReceiptRoot !== undefined) {
    assertNonEmptyString(check.paymentReceiptRoot, 'paymentReceiptRoot');
  }
  return check;
}

function assertSupabaseProjectionTableReadback(
  check: SupabaseProjectionTableReadback,
): SupabaseProjectionTableReadback {
  assertSecretFreeIdentifier(check.table, 'table');
  assertNonNegativeSats(check.expectedCount, 'expectedCount');
  assertNonNegativeSats(check.observedCount, 'observedCount');
  if (check.proofRoot !== undefined) assertNonEmptyString(check.proofRoot, 'proofRoot');
  return check;
}

function assertSupabaseStagingTestnetProjectionReadback(
  readback: SupabaseStagingTestnetProjectionReadback,
): SupabaseStagingTestnetProjectionReadback {
  assertNonEmptyString(readback.readbackId, 'readbackId');
  assertSecretFreeIdentifier(readback.supabaseProjectRef, 'supabaseProjectRef');
  assertSecretFreeIdentifier(readback.restHost, 'restHost');
  if (readback.databaseHost !== undefined) {
    assertSecretFreeIdentifier(readback.databaseHost, 'databaseHost');
  }
  if (readback.secretValuesStored !== false) {
    throw new Error('Supabase projection readback receipts must not store secret values.');
  }
  readback.tableReadbacks.forEach(assertSupabaseProjectionTableReadback);
  assertNonEmptyString(readback.proofRoot, 'proofRoot');
  return readback;
}

function assertSecretFreeIdentifier(value: string, label: string): string {
  const identifier = assertNonEmptyString(value, label);
  if (
    /sb_secret__/u.test(identifier) ||
    /service_role/u.test(identifier) ||
    /sk-(?:proj|live|test)-/u.test(identifier) ||
    /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/u.test(identifier)
  ) {
    throw new Error(`${label} must not contain a secret value.`);
  }
  return identifier;
}

function assertNonNegativeSats(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer sat amount.`);
  }
}

function buildRepairReceipt(input: {
  reconciliationId: string;
  factId: string;
  suffix: string;
  repairKind: ProjectionRepairKind;
  driftKind: ProjectionDriftKind;
  repairActionKind: ProjectionRepairActionKind;
  before: string;
  after: string;
  blocking: boolean;
  requiresOperatorApproval: boolean;
  issuedAt: string;
}): ProjectionRepairReceipt {
  const repairId = `${input.reconciliationId}:${input.factId}:${input.suffix}`;
  return {
    kind: 'btd.ledger_database_projection_repair',
    repairId,
    factId: input.factId,
    repairKind: input.repairKind,
    driftKind: input.driftKind,
    repairActionKind: input.repairActionKind,
    before: input.before,
    after: input.after,
    blocking: input.blocking,
    requiresOperatorApproval: input.requiresOperatorApproval,
    proofRoot: stableProofRoot('projection-repair', [
      repairId,
      input.repairKind,
      input.driftKind,
      input.before,
      input.after,
    ]),
    issuedAt: input.issuedAt,
  };
}

function buildRepairAction(repair: ProjectionRepairReceipt): ProjectionRepairAction {
  return {
    actionId: `${repair.repairId}:action:${repair.repairActionKind}`,
    repairId: repair.repairId,
    factId: repair.factId,
    actionKind: repair.repairActionKind,
    driftKind: repair.driftKind,
    summary: describeRepairAction(repair),
    blocking: repair.blocking,
    requiresOperatorApproval: repair.requiresOperatorApproval,
    proofRoot: stableProofRoot('projection-repair-action', [
      repair.repairId,
      repair.repairActionKind,
      repair.proofRoot,
    ]),
    issuedAt: repair.issuedAt,
  };
}

function describeRepairAction(repair: ProjectionRepairReceipt): string {
  switch (repair.repairActionKind) {
    case 'project_ledger_fact':
      return `Project ledger fact ${repair.factId} into the database from ${repair.before} to ${repair.after}.`;
    case 'update_finality_state':
      return `Update database finality for ${repair.factId} from ${repair.before} to ${repair.after}.`;
    case 'retry_object_storage_write':
      return `Retry object-storage artifact write for ${repair.factId} before unlock or delivery.`;
    case 'retry_staging_testnet_readback':
      return `Retry staging-testnet projection readback for ${repair.factId}.`;
    case 'quarantine_database_projection':
      return `Quarantine database projection ${repair.factId} until a matching ledger observation exists.`;
    case 'quarantine_object_storage_artifact':
      return `Quarantine object-storage projection ${repair.factId} until the artifact root agrees.`;
    case 'pause_settlement_unlock':
      return `Pause settlement unlock for ${repair.factId} until the drift is reconciled.`;
    case 'recover_delivery':
      return `Recover post-settlement delivery for ${repair.factId}.`;
    case 'retry_database_readback':
      return `Retry database readback for ${repair.factId}.`;
  }
}

function countDriftKinds(repairs: ProjectionRepairReceipt[]): Record<ProjectionDriftKind, number> {
  const counts: Record<ProjectionDriftKind, number> = {
    missing_database_projection: 0,
    ledger_root_mismatch: 0,
    ledger_finality_mismatch: 0,
    database_orphan_projection: 0,
    missing_object_storage_artifact: 0,
    object_storage_root_mismatch: 0,
    staging_testnet_readback_blocked: 0,
    settlement_conservation_drift: 0,
  };
  for (const repair of repairs) {
    counts[repair.driftKind] += 1;
  }
  return counts;
}

function deriveReconciliationState(
  repairs: ProjectionRepairReceipt[],
): LedgerDatabaseReconciliationState {
  if (!repairs.length) return 'aligned';
  if (
    repairs.some(
      (repair) =>
        repair.repairActionKind === 'pause_settlement_unlock' ||
        repair.driftKind === 'settlement_conservation_drift',
    )
  ) {
    return 'blocked';
  }
  if (repairs.some((repair) => repair.requiresOperatorApproval)) return 'approval_required';
  if (repairs.some((repair) => repair.blocking)) return 'repairable';
  return 'retryable';
}

function buildSettlementConservationProjection(
  reconciliationId: string,
  checks: SettlementConservationCheck[],
): SettlementConservationProjection {
  const status = !checks.length
    ? 'not_checked'
    : checks.every(isConservationBalanced)
      ? 'balanced'
      : 'drifted';
  return {
    status,
    checks,
    proofRoot: stableProofRoot('settlement-conservation', [reconciliationId, checks]),
  };
}

function isConservationBalanced(check: SettlementConservationCheck): boolean {
  return (
    check.expectedDebitSats === check.observedDebitSats &&
    check.expectedCreditSats === check.observedCreditSats &&
    check.observedDebitSats === check.observedCreditSats
  );
}

function conservationSnapshot(
  check: SettlementConservationCheck,
  side: 'expected' | 'observed',
): string {
  if (side === 'expected') {
    return `debit:${check.expectedDebitSats};credit:${check.expectedCreditSats}`;
  }
  return `debit:${check.observedDebitSats};credit:${check.observedCreditSats}`;
}

function stableProofRoot(scope: string, value: unknown): string {
  return `btd-proof-root:${scope}:${stableHash(stableSerialize(value))}`;
}

function stableSerialize(value: unknown): string {
  if (value === null || value === undefined) return String(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  if (typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
