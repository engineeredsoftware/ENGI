// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bitcodeVersionAtLeast } from './version-posture.js';
import {
  V46_PROTOCOL_CLAIM_AUTHORITY_IDS,
  V46_PROTOCOL_CLAIM_ROWS,
  V46_PROTOCOL_PRIVATE_PAYLOAD_IDS,
  V46_PROTOCOL_SOURCE_SAFE_FIELD_IDS,
} from './v46-protocol-comprehension-object-model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V46_PROOF_READBACK_OPERATOR_EXPLANATION_ARTIFACT_PATH =
  '.bitcode/v46-proof-readback-operator-explanation.json';
export const V46_PROOF_READBACK_OPERATOR_EXPLANATION_SCHEMA_ID =
  'bitcode.v46.proofReadbackOperatorExplanation.v1';
export const V46_PROOF_READBACK_OPERATOR_EXPLANATION_VERSION = 'V46';
export const V46_PROOF_READBACK_OPERATOR_EXPLANATION_CURRENT_TARGET = 'V45';
export const V46_PROOF_READBACK_OPERATOR_EXPLANATION_SOURCE_SAFETY_VERDICT =
  'source-safe-proof-readback-operator-explanation';

export const V46_PROOF_READBACK_EVIDENCE_CLASS_IDS = Object.freeze([
  'canonical_spec_generated_proof',
  'execution_workflow_receipt',
  'ledger_journal',
  'database_projection',
  'object_storage_root',
  'telemetry_stream',
  'wallet_provider_receipt',
  'repository_delivery_receipt',
  'repair_reconciliation_receipt',
]);

export const V46_PROOF_READBACK_REQUIRED_OPERATOR_QUESTION_IDS = Object.freeze([
  'what_evidence_is_this',
  'what_can_it_authorize',
  'what_can_it_not_authorize',
  'what_stronger_evidence_must_agree',
  'what_repair_happens_on_conflict',
]);

export const V46_PROOF_READBACK_OPERATOR_DECISION_IDS = Object.freeze([
  'state-advancement-requires-required-proof-root',
  'telemetry-is-observability-only',
  'database-projection-is-not-ledger-truth',
  'payment-observation-is-not-finality',
  'wallet-provider-receipt-is-non-custodial-authority',
  'repository-delivery-receipt-is-entitled-source-unlock',
  'repair-reconciliation-fails-closed',
  'interfaces-explain-without-parallel-authority',
]);

const SOURCE_PATHS = Object.freeze({
  activePointer: 'BITCODE_SPEC.txt',
  spec: 'BITCODE_SPEC_V46.md',
  delta: 'BITCODE_SPEC_V46_DELTA.md',
  notes: 'BITCODE_SPEC_V46_NOTES.md',
  parity: 'BITCODE_SPEC_V46_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  v45Spec: 'BITCODE_SPEC_V45.md',
  v45Proven: 'BITCODE_SPEC_V45_PROVEN.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  packageIndex: 'scripts/specifying/src/index.js',
  packageTypes: 'scripts/specifying/src/index.d.ts',
  packageSource: 'scripts/specifying/src/canonical/v46-proof-readback-operator-explanation.js',
  packageTest: 'scripts/specifying/test/v46-proof-readback-operator-explanation.test.js',
  generator: 'scripts/generate-v46-proof-readback-operator-explanation.mjs',
  checker: 'scripts/check-v46-gate6-proof-readback-operator-explanation.mjs',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  v40LedgerStorageSync: 'scripts/specifying/src/canonical/v40-ledger-storage-sync.js',
  v39OperationalTelemetryReadback:
    'scripts/specifying/src/canonical/v39-operational-telemetry-repair-readback.js',
  distributedExecutionReceipt: 'packages/pipeline-hosts/src/distributed-execution-runtime-receipt.ts',
  btdReceipts: 'packages/btd/src/receipts.ts',
  btdReconciliation: 'packages/btd/src/reconciliation.ts',
  btdSettlement: 'packages/btd/src/settlement.ts',
  btdWallet: 'packages/btd/src/wallet.ts',
  btdBtcFeeOperation: 'packages/btd/src/btc-fee-operation.ts',
  settlementBoundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
  settlementBoundaryTest:
    'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
  localStagingRehearsal: 'packages/asset-packs-pipelines/domain/src/reading-local-staging-rehearsal.ts',
  uapiLedgerStorageSync: 'apps/uapi/app/bitcode-ledger-storage-sync.ts',
  uapiLedgerStorageSyncTest: 'apps/uapi/tests/bitcodeLedgerStorageSync.test.ts',
});

export const V46_PROOF_READBACK_OPERATOR_EXPLANATION_SOURCE_ROOTS = Object.freeze({
  ...SOURCE_PATHS,
});

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJ', 'hbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

const FORBIDDEN_EXPLANATION_PHRASES = Object.freeze([
  'database is ledger truth',
  'telemetry advances state',
  'provider observation is final settlement',
  'payment observation is finality',
  'repository delivery receipt bypasses rights',
  'proof roots reveal source',
  'wallet provider receipt contains private keys',
  'interfaces create protocol authority',
  'value-bearing mainnet operation is live',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function sourceRoot(repoRoot, sourcePath) {
  return `${sourcePath}:${digest(readSource(repoRoot, sourcePath))}`;
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function claimExists(claimId) {
  return V46_PROTOCOL_CLAIM_ROWS.some((row) => row.claimId === claimId);
}

function authorityExists(authorityId) {
  return V46_PROTOCOL_CLAIM_AUTHORITY_IDS.includes(authorityId);
}

function requiredTokensPresent(repoRoot, row) {
  const joined = row.sourcePaths.map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
  return row.requiredCopyTokens.every((token) => joined.includes(token));
}

function scanSourcesForMarkers(repoRoot, sourcePaths, markers) {
  const joined = sourcePaths.map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
  return markers.filter((marker) => marker && joined.includes(marker));
}

function proofReadbackRow({
  evidenceClassId,
  label,
  authorityIds,
  claimIds,
  sourcePaths,
  requiredCopyTokens,
  canAuthorize,
  cannotAuthorize,
  strongerEvidenceRequired,
  conflictBehavior,
  repairStates,
  operatorExplanation,
}) {
  return {
    evidenceClassId,
    label,
    authorityIds,
    claimIds,
    sourcePaths,
    requiredCopyTokens,
    canAuthorize,
    cannotAuthorize,
    strongerEvidenceRequired,
    conflictBehavior,
    repairStates,
    operatorQuestionIds: [...V46_PROOF_READBACK_REQUIRED_OPERATOR_QUESTION_IDS],
    operatorExplanation,
    noParallelStateAuthority: true,
    stateAdvanceRequiresProofRoot: true,
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
    rawPromptVisible: false,
    interpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    valueBearingMainnetAdmitted: false,
    sourceSafeFieldIds: [...V46_PROTOCOL_SOURCE_SAFE_FIELD_IDS],
    privatePayloadIdsNeverSerialized: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    rowRoot: `v46-proof-readback-row:${digest(JSON.stringify({ evidenceClassId, authorityIds, claimIds }))}`,
  };
}

export const V46_PROOF_READBACK_OPERATOR_EXPLANATION_ROWS = Object.freeze([
  proofReadbackRow({
    evidenceClassId: 'canonical_spec_generated_proof',
    label: 'Canonical Specification And Generated Proof',
    authorityIds: ['canonical-specification', 'generated-proof'],
    claimIds: ['operator-evidence-is-source-safe-readback', 'repair-fails-closed'],
    sourcePaths: [SOURCE_PATHS.v45Spec, SOURCE_PATHS.v45Proven, SOURCE_PATHS.spec],
    requiredCopyTokens: [
      'Bitcode state advances only by proof-backed readback',
      'generated proof appendix',
      'proof-backed readback is the only state advancement',
    ],
    canAuthorize:
      'Defines protocol law, accepted evidence classes, proof-family roots, and source-safe repair expectations.',
    cannotAuthorize:
      'Cannot by itself prove a live payment, BTD rights transfer, source unlock, or repository delivery happened.',
    strongerEvidenceRequired: ['ledger_journal', 'wallet_provider_receipt', 'repository_delivery_receipt'],
    conflictBehavior: 'prefer-active-canon-and-generated-proof-family-then-fail-closed-to-repair',
    repairStates: ['stale_spec_pointer', 'missing_generated_proof', 'conflicting_generated_artifact'],
    operatorExplanation:
      'Spec and generated proof say what may count as evidence; runtime state still needs boundary readback from the relevant system.',
  }),
  proofReadbackRow({
    evidenceClassId: 'execution_workflow_receipt',
    label: 'Execution And Workflow Receipt',
    authorityIds: ['generated-proof'],
    claimIds: ['operator-evidence-is-source-safe-readback', 'telemetry-is-observability-only'],
    sourcePaths: [SOURCE_PATHS.distributedExecutionReceipt, SOURCE_PATHS.v39OperationalTelemetryReadback, SOURCE_PATHS.v45Spec],
    requiredCopyTokens: [
      'bitcode.distributed_execution_runtime_receipt',
      'proofRoot',
      'repairPosture',
      'Telemetry is observability only',
    ],
    canAuthorize:
      'Proves that an execution, worker, PTRR agent, tool, proof generation, storage write, or repair job ran and produced roots.',
    cannotAuthorize:
      'Cannot alone settle BTC, transfer BTD rights, admit source delivery, or override ledger/database/storage repair posture.',
    strongerEvidenceRequired: ['ledger_journal', 'database_projection', 'object_storage_root'],
    conflictBehavior: 'receipt-output-must-reconcile-with-ledger-storage-and-proof-or-enter-repair',
    repairStates: ['missing_parent_receipt', 'failed_execution', 'unreconciled_output_root'],
    operatorExplanation:
      'Execution receipts are replay and provenance evidence; they explain work performed but do not own commercial finality.',
  }),
  proofReadbackRow({
    evidenceClassId: 'ledger_journal',
    label: 'Ledger Journal',
    authorityIds: ['ledger-readback'],
    claimIds: [
      'payment-observation-is-not-finality',
      'finality-authorizes-rights-and-delivery',
      'compensation-follows-source-to-shares',
    ],
    sourcePaths: [
      SOURCE_PATHS.settlementBoundary,
      SOURCE_PATHS.settlementBoundaryTest,
      SOURCE_PATHS.btdReceipts,
      SOURCE_PATHS.v40LedgerStorageSync,
    ],
    requiredCopyTokens: [
      'AssetPackSettlementFinalityReceipt',
      'finalityState',
      'blocked_until_payment_finality',
      'ledger:database-storage-reconciliation',
    ],
    canAuthorize:
      'Provides payment/finality and settlement readback required before BTD rights, delivery unlock, and compensation allocation.',
    cannotAuthorize:
      'Cannot expose source without matching rights, storage, repository delivery, and reconciliation evidence.',
    strongerEvidenceRequired: ['wallet_provider_receipt', 'database_projection', 'object_storage_root', 'repository_delivery_receipt'],
    conflictBehavior: 'ledger-finality-conflict-blocks-rights-delivery-and-compensation',
    repairStates: ['underpayment', 'unconfirmed_finality', 'reorged_or_failed_finality', 'ledger_root_mismatch'],
    operatorExplanation:
      'Ledger readback is the payment and finality boundary; payment observation remains non-final until policy confirms finality.',
  }),
  proofReadbackRow({
    evidenceClassId: 'database_projection',
    label: 'Database Projection',
    authorityIds: ['database-projection'],
    claimIds: ['operator-evidence-is-source-safe-readback', 'repair-fails-closed'],
    sourcePaths: [SOURCE_PATHS.btdReconciliation, SOURCE_PATHS.uapiLedgerStorageSync, SOURCE_PATHS.uapiLedgerStorageSyncTest],
    requiredCopyTokens: [
      'DatabaseProjectedFact',
      'LedgerDatabaseReconciliationReport',
      'databaseProjectionRoot',
      'missing_database_projection',
    ],
    canAuthorize:
      'Provides queryable read-model state and operator/product projection once reconciled to stronger proof and ledger roots.',
    cannotAuthorize:
      'Cannot override ledger finality, object-storage custody, wallet authority, repository delivery, or proof-contract law.',
    strongerEvidenceRequired: ['ledger_journal', 'object_storage_root', 'wallet_provider_receipt'],
    conflictBehavior: 'database-projection-is-repaired-or-quarantined-when-stronger-roots-disagree',
    repairStates: ['missing_database_projection', 'database_orphan_projection', 'ledger_finality_mismatch'],
    operatorExplanation:
      'Database rows make state readable; they are projections, not stronger truth than ledger, storage, wallet, or delivery readback.',
  }),
  proofReadbackRow({
    evidenceClassId: 'object_storage_root',
    label: 'Object Storage And Protected-Source Root',
    authorityIds: ['object-storage-root'],
    claimIds: ['delivery-is-entitled-source-unlock', 'operator-evidence-is-source-safe-readback'],
    sourcePaths: [SOURCE_PATHS.btdReconciliation, SOURCE_PATHS.settlementBoundary, SOURCE_PATHS.v40LedgerStorageSync],
    requiredCopyTokens: [
      'ObjectStorageArtifactFact',
      'asset_pack_protected_source_encrypted',
      'objectStorageRoot',
      'storage:artifact-lock-and-source-safe-projection',
    ],
    canAuthorize:
      'Proves custody, source-safe projection, encrypted protected-source storage, delivery manifest, and withheld bundle roots.',
    cannotAuthorize:
      'Cannot grant Reader visibility without settlement finality, BTD rights transfer, and repository delivery receipt.',
    strongerEvidenceRequired: ['ledger_journal', 'repository_delivery_receipt', 'repair_reconciliation_receipt'],
    conflictBehavior: 'storage-root-conflict-blocks-source-unlock-until-projection-repair',
    repairStates: ['missing_object_storage_artifact', 'object_storage_root_mismatch', 'stale_storage_manifest'],
    operatorExplanation:
      'Storage roots prove what exists and where custody sits; entitlement still requires settlement, rights, and delivery readback.',
  }),
  proofReadbackRow({
    evidenceClassId: 'telemetry_stream',
    label: 'Telemetry Stream',
    authorityIds: ['telemetry-observability-only'],
    claimIds: ['telemetry-is-observability-only', 'operator-evidence-is-source-safe-readback'],
    sourcePaths: [SOURCE_PATHS.v39OperationalTelemetryReadback, SOURCE_PATHS.distributedExecutionReceipt, SOURCE_PATHS.v45Spec],
    requiredCopyTokens: [
      'telemetry stream',
      'Telemetry is observability only',
      'operator readback',
      'source_safe_reading_operational_telemetry_repair_readback_metadata',
    ],
    canAuthorize:
      'Explains live progress, event lineage, prompt/result disclosure posture, repair hooks, and stream UI readback.',
    cannotAuthorize:
      'Cannot advance AssetPack lifecycle, BTC settlement, BTD rights, source unlock, repository delivery, or compensation.',
    strongerEvidenceRequired: ['execution_workflow_receipt', 'ledger_journal', 'repository_delivery_receipt'],
    conflictBehavior: 'telemetry-conflict-is-debug-signal-not-state-truth',
    repairStates: ['missing_event_root', 'stale_stream_state', 'conflicting_operator_readback'],
    operatorExplanation:
      'Telemetry is the running-system narrative; it remains observability and troubleshooting evidence only.',
  }),
  proofReadbackRow({
    evidenceClassId: 'wallet_provider_receipt',
    label: 'Wallet And Provider Receipt',
    authorityIds: ['wallet-provider-receipt'],
    claimIds: ['payment-observation-is-not-finality', 'finality-authorizes-rights-and-delivery'],
    sourcePaths: [
      SOURCE_PATHS.btdWallet,
      SOURCE_PATHS.btdBtcFeeOperation,
      SOURCE_PATHS.settlementBoundary,
      SOURCE_PATHS.uapiLedgerStorageSync,
    ],
    requiredCopyTokens: [
      'WalletSignerSession',
      'serverCustody: false',
      'wallet_provider_session',
      'server_custody_rejected',
    ],
    canAuthorize:
      'Proves non-custodial wallet posture, provider session, signing capability, and payment-observation boundary.',
    cannotAuthorize:
      'Cannot be treated as final settlement and never serializes wallet private material or server custody.',
    strongerEvidenceRequired: ['ledger_journal', 'canonical_spec_generated_proof'],
    conflictBehavior: 'wallet-provider-conflict-blocks-payment-and-requires-wallet-repair',
    repairStates: ['address_authorization_required', 'wrong_network_blocked', 'server_custody_blocked'],
    operatorExplanation:
      'Wallet/provider receipts prove user-controlled signing and payment observation posture; finality still comes from ledger readback.',
  }),
  proofReadbackRow({
    evidenceClassId: 'repository_delivery_receipt',
    label: 'Repository Delivery Receipt',
    authorityIds: ['repository-delivery-receipt'],
    claimIds: ['delivery-is-entitled-source-unlock', 'finality-authorizes-rights-and-delivery'],
    sourcePaths: [SOURCE_PATHS.settlementBoundary, SOURCE_PATHS.settlementBoundaryTest, SOURCE_PATHS.uapiLedgerStorageSync],
    requiredCopyTokens: [
      'pull_request_after_settlement',
      'source_bearing_pull_request_ready',
      'blocked_until_pull_request_delivery',
      'deliveryRoot',
    ],
    canAuthorize:
      'Proves entitled repository delivery after settlement finality, BTD rights transfer, compensation, and storage reconciliation.',
    cannotAuthorize:
      'Cannot bypass quote, finality, rights transfer, source-to-shares conservation, or storage proof.',
    strongerEvidenceRequired: ['ledger_journal', 'object_storage_root', 'repair_reconciliation_receipt'],
    conflictBehavior: 'delivery-missing-keeps-source-withheld-and-enters-repair',
    repairStates: ['pull_request_delivery_missing', 'delivery_withheld', 'recover_pull_request_delivery'],
    operatorExplanation:
      'Repository delivery receipt is the source-unlock readback boundary for an entitled Reader, not public source permission.',
  }),
  proofReadbackRow({
    evidenceClassId: 'repair_reconciliation_receipt',
    label: 'Repair And Reconciliation Receipt',
    authorityIds: ['generated-proof', 'database-projection', 'ledger-readback', 'object-storage-root'],
    claimIds: ['repair-fails-closed', 'operator-evidence-is-source-safe-readback'],
    sourcePaths: [
      SOURCE_PATHS.btdReconciliation,
      SOURCE_PATHS.settlementBoundary,
      SOURCE_PATHS.settlementBoundaryTest,
      SOURCE_PATHS.v40LedgerStorageSync,
    ],
    requiredCopyTokens: [
      'ProjectionRepairReceipt',
      'repairPosture',
      'repair_ledger_database_storage_projection',
      'repair:drift-finality-delivery-recovery',
    ],
    canAuthorize:
      'Records mismatch class, blocker, retry action, operator approval need, proof roots, and the source-safe repair posture.',
    cannotAuthorize:
      'Cannot silently turn conflicting evidence into success or expose source while repair is unresolved.',
    strongerEvidenceRequired: ['canonical_spec_generated_proof', 'ledger_journal', 'object_storage_root', 'repository_delivery_receipt'],
    conflictBehavior: 'every-evidence-mismatch-fails-closed-to-source-safe-repair',
    repairStates: ['projection_repair', 'finality_repair', 'delivery_recovery', 'operator_approval_required'],
    operatorExplanation:
      'Repair receipts are how operators explain and replay disagreement; unresolved repair keeps the narrower source-safe state.',
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_PATHS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('active-pointer-supports-v46-draft-or-later', SOURCE_PATHS.activePointer, bitcodeVersionAtLeast(sources.activePointer, 'V45')),
    predicateResult(
      'spec-defines-gate6-law',
      SOURCE_PATHS.spec,
      sources.spec.includes('V46 proof readback operator explanation law') &&
        sources.spec.includes(V46_PROOF_READBACK_OPERATOR_EXPLANATION_ARTIFACT_PATH),
    ),
    predicateResult(
      'delta-records-gate6',
      SOURCE_PATHS.delta,
      sources.delta.includes('Gate 6: Proof Readback And Source-Safe Operator Explanation') &&
        sources.delta.includes(V46_PROOF_READBACK_OPERATOR_EXPLANATION_ARTIFACT_PATH),
    ),
    predicateResult(
      'notes-records-gate6',
      SOURCE_PATHS.notes,
      sources.notes.includes('V46 proof readback operator explanation atom') &&
        sources.notes.includes('evidence authority ladder'),
    ),
    predicateResult(
      'parity-records-gate6',
      SOURCE_PATHS.parity,
      sources.parity.includes('V46ProofReadbackOperatorExplanation') &&
        sources.parity.includes(V46_PROOF_READBACK_OPERATOR_EXPLANATION_ARTIFACT_PATH),
    ),
    predicateResult(
      'roadmap-records-gate6-closure',
      SOURCE_PATHS.roadmap,
      sources.roadmap.includes('V46 Gate 6 closure anchor') &&
        sources.roadmap.includes('V46ProofReadbackOperatorExplanation') &&
        sources.roadmap.includes(V46_PROOF_READBACK_OPERATOR_EXPLANATION_ARTIFACT_PATH),
    ),
    predicateResult(
      'readmes-document-gate6',
      SOURCE_PATHS.readme,
      sources.readme.includes('V46 Gate 6') && sources.protocolReadme.includes('V46ProofReadbackOperatorExplanation'),
    ),
    predicateResult(
      'v45-proof-readback-law-present',
      SOURCE_PATHS.v45Spec,
      sources.v45Spec.includes('Bitcode state advances only by proof-backed readback') &&
        sources.v45Spec.includes('Telemetry is observability only') &&
        sources.v45Spec.includes('Provider observation is not final settlement'),
    ),
    predicateResult(
      'distributed-execution-receipts-are-source-safe',
      SOURCE_PATHS.distributedExecutionReceipt,
      sources.distributedExecutionReceipt.includes('bitcode.distributed_execution_runtime_receipt') &&
        sources.distributedExecutionReceipt.includes('protectedSourceVisible: false') &&
        sources.distributedExecutionReceipt.includes('receiptRoot'),
    ),
    predicateResult(
      'ledger-storage-sync-binds-finality-repair-delivery',
      SOURCE_PATHS.v40LedgerStorageSync,
      sources.v40LedgerStorageSync.includes('blocked_until_payment_finality') &&
        sources.v40LedgerStorageSync.includes('ledger:database-storage-reconciliation') &&
        sources.v40LedgerStorageSync.includes('delivery:post-settlement-pull-request-unlock'),
    ),
    predicateResult(
      'telemetry-readback-is-observability-only',
      SOURCE_PATHS.v39OperationalTelemetryReadback,
      sources.v45Spec.includes('Telemetry is observability only') &&
        sources.v39OperationalTelemetryReadback.includes('operator readback') &&
        sources.v39OperationalTelemetryReadback.includes('source_safe_reading_operational_telemetry_repair_readback_metadata'),
    ),
    predicateResult(
      'reconciliation-defines-database-storage-repair',
      SOURCE_PATHS.btdReconciliation,
      sources.btdReconciliation.includes('LedgerDatabaseReconciliationReport') &&
        sources.btdReconciliation.includes('DatabaseProjectedFact') &&
        sources.btdReconciliation.includes('ObjectStorageArtifactFact') &&
        sources.btdReconciliation.includes('ProjectionRepairReceipt'),
    ),
    predicateResult(
      'wallet-boundary-is-no-custody',
      SOURCE_PATHS.btdWallet,
      sources.btdWallet.includes('WalletSignerSession') &&
        sources.btdWallet.includes('serverCustody: false') &&
        sources.btdWallet.includes('Bitcode wallet sessions must not custody user private keys'),
    ),
    predicateResult(
      'settlement-boundary-blocks-until-finality-and-delivery',
      SOURCE_PATHS.settlementBoundary,
      sources.settlementBoundary.includes('AssetPackSettlementFinalityReceipt') &&
        sources.settlementBoundary.includes('blocked_until_payment_finality') &&
        sources.settlementBoundary.includes('blocked_until_pull_request_delivery') &&
        sources.settlementBoundary.includes('AssetPackSettlementRightsDeliveryRepairPosture'),
    ),
    predicateResult(
      'settlement-tests-cover-fail-closed-delivery',
      SOURCE_PATHS.settlementBoundaryTest,
      sources.settlementBoundaryTest.includes('fails closed for %s BTC state before finality') &&
        sources.settlementBoundaryTest.includes('withholds delivery when ledger, database, or object storage projections drift') &&
        sources.settlementBoundaryTest.includes('withholds source unlock and rights delivery when repository delivery is missing'),
    ),
    predicateResult(
      'uapi-ledger-storage-sync-contract-present',
      SOURCE_PATHS.uapiLedgerStorageSync,
      sources.uapiLedgerStorageSync.includes('BITCODE_LEDGER_STORAGE_SYNC_CONTRACT') &&
        sources.uapiLedgerStorageSync.includes('walletPrivateMaterialVisible: false') &&
        sources.uapiLedgerStorageSync.includes('sourceBearingDeliveryVisibleBeforeSettlement: false'),
    ),
    predicateResult(
      'package-exports-gate6',
      SOURCE_PATHS.packageIndex,
      sources.packageIndex.includes("v46-proof-readback-operator-explanation.js") &&
        sources.packageTypes.includes('V46_PROOF_READBACK_OPERATOR_EXPLANATION_ARTIFACT_PATH'),
    ),
    predicateResult(
      'package-test-covers-gate6',
      SOURCE_PATHS.packageTest,
      sources.packageTest.includes('V46 proof readback operator explanation') &&
        sources.packageTest.includes('telemetry_stream'),
    ),
    predicateResult(
      'generator-and-checker-exist',
      SOURCE_PATHS.generator,
      sources.generator.includes('buildV46ProofReadbackOperatorExplanation') &&
        sources.checker.includes('V46 Gate 6 proof readback operator explanation check'),
    ),
    predicateResult(
      'package-json-scripts',
      SOURCE_PATHS.packageJson,
      sources.packageJson.includes('generate:v46-proof-readback-operator-explanation') &&
        sources.packageJson.includes('check:v46-gate6'),
    ),
    predicateResult(
      'workflows-run-gate6',
      SOURCE_PATHS.gateWorkflow,
      sources.gateWorkflow.includes('check-v46-gate6-proof-readback-operator-explanation.mjs') &&
        sources.canonWorkflow.includes('check-v46-gate6-proof-readback-operator-explanation.mjs'),
    ),
  ];
}

export function buildV46ProofReadbackOperatorExplanation(input = {}) {
  const repoRoot = input.repoRoot ? path.resolve(input.repoRoot) : DEFAULT_REPO_ROOT;
  const rows = V46_PROOF_READBACK_OPERATOR_EXPLANATION_ROWS.map((row) => ({
    ...row,
    sourceRoots: row.sourcePaths.map((sourcePath) => sourceRoot(repoRoot, sourcePath)),
    sourceFilesPresent: row.sourcePaths.every((sourcePath) => sourceExists(repoRoot, sourcePath)),
    requiredCopyPresent: requiredTokensPresent(repoRoot, row),
  }));
  const sourcePathsToScan = [
    SOURCE_PATHS.spec,
    SOURCE_PATHS.delta,
    SOURCE_PATHS.notes,
    SOURCE_PATHS.parity,
    SOURCE_PATHS.roadmap,
    SOURCE_PATHS.readme,
    SOURCE_PATHS.protocolReadme,
    SOURCE_PATHS.packageTest,
    SOURCE_PATHS.generator,
    SOURCE_PATHS.checker,
  ];
  const predicateResults = buildPredicateResults(repoRoot);
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  const allAuthorityIds = rows.flatMap((row) => row.authorityIds);
  const allClaimIds = rows.flatMap((row) => row.claimIds);
  const rowsMissingRequiredCopy = rows.filter((row) => !row.requiredCopyPresent).map((row) => row.evidenceClassId);
  const rowsMissingSourceFiles = rows.filter((row) => !row.sourceFilesPresent).map((row) => row.evidenceClassId);
  const forbiddenPhraseHits = scanSourcesForMarkers(repoRoot, sourcePathsToScan, FORBIDDEN_EXPLANATION_PHRASES);
  const secretMarkerHits = scanSourcesForMarkers(repoRoot, sourcePathsToScan, SECRET_MARKERS);

  const coverage = {
    predicateCount: predicateResults.length,
    failedPredicateIds,
    evidenceClassCount: rows.length,
    allEvidenceClassesCovered: V46_PROOF_READBACK_EVIDENCE_CLASS_IDS.every((id) =>
      rows.some((row) => row.evidenceClassId === id),
    ),
    allAuthorityIdsKnown: allAuthorityIds.every(authorityExists),
    allClaimIdsKnown: allClaimIds.every(claimExists),
    allOperatorQuestionsCovered: V46_PROOF_READBACK_REQUIRED_OPERATOR_QUESTION_IDS.every((id) =>
      rows.every((row) => row.operatorQuestionIds.includes(id)),
    ),
    allRowsHaveConflictBehavior: rows.every((row) => row.conflictBehavior.length > 0),
    allRowsHaveRepairStates: rows.every((row) => row.repairStates.length > 0),
    allRowsNameStrongerEvidence: rows.every((row) => row.strongerEvidenceRequired.length > 0),
    sourceFilesPresent: rows.every((row) => row.sourceFilesPresent),
    rowsMissingSourceFiles,
    rowsMissingRequiredCopy,
    noParallelStateAuthority: rows.every((row) => row.noParallelStateAuthority),
    stateAdvanceRequiresProofRoot: rows.every((row) => row.stateAdvanceRequiresProofRoot),
    sourceSafeMetadataOnly: rows.every((row) => row.sourceSafeMetadataOnly),
    protectedSourceVisible: rows.some((row) => row.protectedSourceVisible),
    unpaidAssetPackSourceVisible: rows.some((row) => row.unpaidAssetPackSourceVisible),
    rawPromptVisible: rows.some((row) => row.rawPromptVisible),
    interpolatedPromptVisible: rows.some((row) => row.interpolatedPromptVisible),
    rawProviderResponseVisible: rows.some((row) => row.rawProviderResponseVisible),
    credentialsSerialized: rows.some((row) => row.credentialsSerialized),
    walletPrivateMaterialVisible: rows.some((row) => row.walletPrivateMaterialVisible),
    settlementPrivatePayloadVisible: rows.some((row) => row.settlementPrivatePayloadVisible),
    valueBearingMainnetAdmitted: rows.some((row) => row.valueBearingMainnetAdmitted),
    telemetryObservabilityOnly: rows.some((row) => row.evidenceClassId === 'telemetry_stream' && row.cannotAuthorize.includes('Cannot advance')),
    databaseProjectionNotLedgerTruth: rows.some((row) => row.evidenceClassId === 'database_projection' && row.cannotAuthorize.includes('Cannot override ledger finality')),
    paymentObservationNotFinality: rows.some((row) => row.evidenceClassId === 'wallet_provider_receipt' && row.cannotAuthorize.includes('final settlement')),
    repositoryDeliveryRequiresEntitlement: rows.some((row) => row.evidenceClassId === 'repository_delivery_receipt' && row.canAuthorize.includes('entitled repository delivery')),
    repairFailsClosed: rows.some((row) => row.evidenceClassId === 'repair_reconciliation_receipt' && row.conflictBehavior.includes('fails-closed')),
    forbiddenPhraseHits,
    secretMarkerHits,
  };

  const proofRoots = {
    rowSetRoot: `sha256:${digest(JSON.stringify(rows.map((row) => row.rowRoot)))}`,
    predicateRoot: `sha256:${digest(JSON.stringify(predicateResults))}`,
    coverageRoot: `sha256:${digest(JSON.stringify(coverage))}`,
  };

  return {
    artifactId: 'v46-proof-readback-operator-explanation',
    schemaId: V46_PROOF_READBACK_OPERATOR_EXPLANATION_SCHEMA_ID,
    version: V46_PROOF_READBACK_OPERATOR_EXPLANATION_VERSION,
    currentTarget: V46_PROOF_READBACK_OPERATOR_EXPLANATION_CURRENT_TARGET,
    generatedAt: input.generatedAt || '2026-06-02T00:00:00.000Z',
    artifactPath: V46_PROOF_READBACK_OPERATOR_EXPLANATION_ARTIFACT_PATH,
    sourceSafetyVerdict: V46_PROOF_READBACK_OPERATOR_EXPLANATION_SOURCE_SAFETY_VERDICT,
    evidenceClassIds: [...V46_PROOF_READBACK_EVIDENCE_CLASS_IDS],
    operatorQuestionIds: [...V46_PROOF_READBACK_REQUIRED_OPERATOR_QUESTION_IDS],
    operatorDecisionIds: [...V46_PROOF_READBACK_OPERATOR_DECISION_IDS],
    proofReadbackRows: rows,
    predicateResults,
    coverage,
    proofRoots: {
      ...proofRoots,
      artifactRoot: `sha256:${digest(JSON.stringify({ rows: rows.map((row) => row.rowRoot), coverage, proofRoots }))}`,
    },
    sourceSafety: {
      sourceSafeMetadataOnly: coverage.sourceSafeMetadataOnly,
      protectedSourceVisible: coverage.protectedSourceVisible,
      unpaidAssetPackSourceVisible: coverage.unpaidAssetPackSourceVisible,
      rawPromptVisible: coverage.rawPromptVisible,
      interpolatedPromptVisible: coverage.interpolatedPromptVisible,
      rawProviderResponseVisible: coverage.rawProviderResponseVisible,
      credentialsSerialized: coverage.credentialsSerialized,
      walletPrivateMaterialVisible: coverage.walletPrivateMaterialVisible,
      settlementPrivatePayloadVisible: coverage.settlementPrivatePayloadVisible,
      valueBearingMainnetAdmitted: coverage.valueBearingMainnetAdmitted,
      privatePayloadIdsNeverSerialized: [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS],
    },
    passed:
      failedPredicateIds.length === 0 &&
      coverage.allEvidenceClassesCovered &&
      coverage.allAuthorityIdsKnown &&
      coverage.allClaimIdsKnown &&
      coverage.allOperatorQuestionsCovered &&
      coverage.allRowsHaveConflictBehavior &&
      coverage.allRowsHaveRepairStates &&
      coverage.allRowsNameStrongerEvidence &&
      coverage.sourceFilesPresent &&
      coverage.rowsMissingRequiredCopy.length === 0 &&
      coverage.noParallelStateAuthority &&
      coverage.stateAdvanceRequiresProofRoot &&
      coverage.sourceSafeMetadataOnly &&
      !coverage.protectedSourceVisible &&
      !coverage.unpaidAssetPackSourceVisible &&
      !coverage.rawPromptVisible &&
      !coverage.interpolatedPromptVisible &&
      !coverage.rawProviderResponseVisible &&
      !coverage.credentialsSerialized &&
      !coverage.walletPrivateMaterialVisible &&
      !coverage.settlementPrivatePayloadVisible &&
      !coverage.valueBearingMainnetAdmitted &&
      coverage.telemetryObservabilityOnly &&
      coverage.databaseProjectionNotLedgerTruth &&
      coverage.paymentObservationNotFinality &&
      coverage.repositoryDeliveryRequiresEntitlement &&
      coverage.repairFailsClosed &&
      coverage.forbiddenPhraseHits.length === 0 &&
      coverage.secretMarkerHits.length === 0,
  };
}
