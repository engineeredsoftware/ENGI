#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v32-ledger-btd-settlement-failure-state-coverage.json';
const GENERATED_AT = '2026-05-22T00:00:00.000Z';

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
]);
const SECRET_PATTERN = new RegExp(SECRET_MARKERS.map(escapeRegex).join('|'), 'u');

const sourceFiles = Object.freeze([
  'packages/btd/src/btc-fee-operation.ts',
  'packages/btd/src/bitcoin-fees.ts',
  'packages/btd/src/receipts.ts',
  'packages/btd/src/reconciliation.ts',
  'packages/btd/src/source-to-shares.ts',
  'packages/btd/src/settlement.ts',
]);

const testFiles = Object.freeze([
  'packages/btd/__tests__/btc-fee-operation.test.ts',
  'packages/btd/__tests__/reconciliation.test.ts',
  'packages/btd/__tests__/source-to-shares.test.ts',
  'packages/btd/__tests__/api-boundaries.test.ts',
  'packages/btd/__tests__/v32-ledger-btd-settlement-failure-states.test.ts',
  'apps/uapi/tests/terminalJournalReconciliation.test.ts',
  'apps/uapi/tests/terminalWalletBtcOperation.test.ts',
  'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts',
]);

const btcOperationPhases = Object.freeze([
  'blocked',
  'quoted',
  'psbt_ready',
  'signed',
  'broadcast',
  'confirmed',
  'replaced',
  'reorged',
  'failed',
]);

const btcBlockedReadinessBlockers = Object.freeze([
  'wallet-signer-session',
  'wallet-network',
  'wallet-capability',
  'wallet-server-custody',
  'network-policy',
  'fee-quote',
  'fee-quote-expired',
  'fee-quote-not-accepted',
  'psbt-handoff',
  'broadcast',
  'finality',
]);

const btcFinalityStates = Object.freeze([
  'prepared',
  'signed',
  'broadcast',
  'confirmed',
  'replaced',
  'reorged',
  'failed',
]);

const btdReceiptTypes = Object.freeze([
  'btd.asset_pack_mint_receipt',
  'btd.read_receipt',
  'btd.rights_transfer_receipt',
]);

const sourceToSharesStates = Object.freeze([
  'balanced',
  'overpayment',
  'underpayment',
  'drifted',
  'zero_cell_refit_tail',
]);

const projectionDriftKinds = Object.freeze([
  'missing_database_projection',
  'ledger_root_mismatch',
  'ledger_finality_mismatch',
  'database_orphan_projection',
  'missing_object_storage_artifact',
  'object_storage_root_mismatch',
  'staging_testnet_readback_blocked',
  'settlement_conservation_drift',
]);

const projectionRepairActionKinds = Object.freeze([
  'retry_database_readback',
  'retry_object_storage_write',
  'retry_staging_testnet_readback',
  'project_ledger_fact',
  'update_finality_state',
  'quarantine_database_projection',
  'quarantine_object_storage_artifact',
  'pause_settlement_unlock',
  'recover_delivery',
]);

const requiredSettlementReadbackKeys = Object.freeze([
  'semanticMeasurement',
  'measureMintReceipt',
  'assetPackRange',
  'btdCell',
  'ownershipEvent',
  'readLicense',
  'mintReceipt',
  'btcFeeTransaction',
  'ledgerAnchor',
  'terminalJournal',
  'cryptoTelemetry',
]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortJson(entry)]),
  );
}

function stableStringify(value) {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`;
}

function scanTokens(relativePath, tokens) {
  const text = read(relativePath);
  return {
    relativePath,
    digest: sha256(text),
    requiredTokens: tokens.map((token) => ({
      token,
      present: text.includes(token),
    })),
  };
}

function allTokensPresent(scan) {
  return scan.requiredTokens.every((entry) => entry.present);
}

function buildSurfaceCoverage() {
  return [
    {
      surfaceId: 'protocol-btd',
      stateClasses: ['success', 'blocked', 'repair'],
      proofSubjects: [
        'BtcFeeOperationPosture',
        'BtdAssetPackMintReceipt',
        'BtdReadReceipt',
        'BtdRightsTransferReceipt',
        'SourceToSharesProof',
      ],
      failClosedBoundary: 'protected source remains hidden until paid unlock, delivery admission, and confirmed BTC finality agree',
    },
    {
      surfaceId: 'ledger',
      stateClasses: ['success', 'blocked', 'repair'],
      proofSubjects: ['BTC fee finality', 'BTD ownership transfer', 'BTD journal root', 'ledger projection root'],
      failClosedBoundary: 'rights transfer requires confirmed BTC fee finality before ownership/read rights move',
    },
    {
      surfaceId: 'database',
      stateClasses: ['success', 'blocked', 'repair'],
      proofSubjects: ['Supabase projection readback', 'database projection roots', 'secret-free projection receipts'],
      failClosedBoundary: 'database drift pauses unlock and never serializes admin credential values',
    },
    {
      surfaceId: 'object-storage',
      stateClasses: ['success', 'blocked', 'repair'],
      proofSubjects: ['durable source-safe artifact', 'encrypted protected source artifact', 'delivery manifest root'],
      failClosedBoundary: 'protected AssetPack source must be encrypted and unavailable before paid delivery',
    },
    {
      surfaceId: 'settlement-disclosure-delivery',
      stateClasses: ['success', 'blocked', 'repair'],
      proofSubjects: ['readback keys', 'pull-request target', 'AssetPackSettlementUnlock'],
      failClosedBoundary: 'sourceAvailable remains false until settlement readback and PR delivery agree',
    },
  ];
}

export function buildV32LedgerBtdSettlementFailureStateCoverage() {
  const sourceEvidence = [
    scanTokens('packages/btd/src/btc-fee-operation.ts', [
      'BtcFeeOperationPhase',
      'BtcFeeBlockedReadinessBlockerId',
      'buildBtcFeeOperationPosture',
      'network-policy',
      'fee-quote-not-accepted',
    ]),
    scanTokens('packages/btd/src/bitcoin-fees.ts', [
      'BtcFeeFinalityState',
      'advanceBtcFeeTransactionReceipt',
      'Confirmed BTC fee receipt requires at least one confirmation.',
      'serverCustody: false',
    ]),
    scanTokens('packages/btd/src/receipts.ts', [
      'BtdAssetPackMintReceipt',
      'BtdReadReceipt',
      'BtdRightsTransferReceipt',
      'Protected source cannot be visible before paid unlock.',
      'Rights transfer receipt requires confirmed BTC fee finality.',
    ]),
    scanTokens('packages/btd/src/reconciliation.ts', [
      'ProjectionDriftKind',
      'ProjectionRepairActionKind',
      'secretValuesStored: false',
      'Object storage artifacts containing protected source must be encrypted.',
      'settlement_conservation_drift',
    ]),
    scanTokens('packages/btd/src/source-to-shares.ts', [
      'SourceToSharesProof',
      'noOverpayment',
      'noUnderpayment',
      'settlementAdmissible',
      'zero_cell_refit_tail',
    ]),
    scanTokens('packages/btd/src/settlement.ts', [
      'REQUIRED_ASSET_PACK_SETTLEMENT_READBACK_KEYS',
      'sourceAvailable',
      'deliveryAvailable',
      'Protected source remains withheld',
    ]),
    scanTokens('packages/btd/__tests__/v32-ledger-btd-settlement-failure-states.test.ts', [
      'V32 Gate 5 ledger BTD settlement failure-state coverage',
      'fails closed with actionable BTC blocked-readiness receipts',
      'keeps BTD receipt mint/read/rights-transfer boundaries source-safe until paid finality',
      'classifies ledger, database, object-storage, staging, and conservation projection repair states',
      'withholds AssetPack source until settlement readback and PR delivery agree',
    ]),
  ];
  const passed = sourceEvidence.every(allTokensPresent);

  return {
    artifactId: 'v32-ledger-btd-settlement-failure-state-coverage',
    schemaId: 'bitcode.v32.ledgerBtdSettlementFailureStateCoverage.v1',
    version: 'V32',
    currentTarget: 'V31',
    sourceCommit: 'draft-gate-5-source-derived',
    generatedAt: GENERATED_AT,
    sourceSafetyVerdict: 'source-safe-economic-proof-metadata',
    artifactPath: ARTIFACT_PATH,
    surfaceCoverage: buildSurfaceCoverage(),
    btcFeeCoverage: {
      feeAsset: 'BTC',
      pricingVersion: 'measurement-weight-volume',
      phases: [...btcOperationPhases],
      blockedReadinessBlockers: [...btcBlockedReadinessBlockers],
      finalityStates: [...btcFinalityStates],
      networkPolicies: ['local', 'staging-testnet', 'production-mainnet'],
      mainnetPolicy: 'value-bearing mainnet requires explicit operational approval',
      signerBoundary: 'no server custody',
    },
    btdReceiptCoverage: {
      receiptTypes: [...btdReceiptTypes],
      disclosureStates: ['blocked', 'source_safe_preview', 'paid_unlocked'],
      deliveryAdmissionStates: ['blocked', 'admitted'],
      readRightStates: ['none', 'owner_read', 'licensed_read'],
      finalityRequirement: 'rights transfer requires confirmed BTC fee finality',
      sourceBoundary: 'protected source cannot be visible before paid unlock',
    },
    sourceToSharesCoverage: {
      states: [...sourceToSharesStates],
      invariants: ['noOverpayment', 'noUnderpayment', 'allocationConserved', 'settlementAdmissible'],
      allocationMethod: 'largest_remainder',
      proofArtifactPath: '.bitcode/v30-settlement-source-to-shares-proof.json',
      v32ClosureArtifactPath: ARTIFACT_PATH,
    },
    reconciliationCoverage: {
      states: ['aligned', 'retryable', 'repairable', 'approval_required', 'blocked'],
      driftKinds: [...projectionDriftKinds],
      repairActionKinds: [...projectionRepairActionKinds],
      objectStorageVisibility: ['proof_public', 'source_safe', 'encrypted_protected_source'],
      stagingTestnetProjectRef: 'tkpyosihuouusyaxtbau',
      secretValuesStored: false,
    },
    settlementUnlockCoverage: {
      requiredReadbackKeys: [...requiredSettlementReadbackKeys],
      unlockStates: ['pending_settlement', 'licensed_read', 'denied'],
      deliveryRequirement: 'pull-request target required for protected source delivery',
      preSettlementVisibility: 'source-safe preview only',
    },
    sourceEvidence,
    validationCommands: [
      'pnpm run generate:v32-ledger-btd-settlement-failure-states',
      'pnpm run check:v32-ledger-btd-settlement-failure-states',
      'pnpm --filter @bitcode/btd test -- --runTestsByPath __tests__/v32-ledger-btd-settlement-failure-states.test.ts',
      'pnpm run check:v32-gate5',
    ],
    passed,
  };
}

function parseArgs(argv) {
  return {
    write: argv.includes('--write'),
    check: argv.includes('--check'),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/generate-v32-ledger-btd-settlement-failure-states.mjs [--write|--check]',
      '',
      'Generates or checks the V32 Gate 5 source-safe ledger/BTD settlement failure-state proof artifact.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  if (!args.write && !args.check) {
    throw new Error('Pass --write to generate the artifact or --check to verify it.');
  }

  const artifact = buildV32LedgerBtdSettlementFailureStateCoverage();
  const serialized = stableStringify(artifact);
  if (SECRET_PATTERN.test(serialized)) {
    throw new Error('V32 Gate 5 proof artifact contains a secret-shaped marker.');
  }
  if (!artifact.passed) {
    throw new Error('V32 Gate 5 proof artifact source evidence is incomplete.');
  }

  const absoluteArtifactPath = path.join(repoRoot, ARTIFACT_PATH);
  if (args.write) {
    mkdirSync(path.dirname(absoluteArtifactPath), { recursive: true });
    writeFileSync(absoluteArtifactPath, serialized);
    process.stdout.write(`Wrote ${ARTIFACT_PATH}\n`);
    return;
  }

  if (!existsSync(absoluteArtifactPath)) {
    throw new Error(`Missing ${ARTIFACT_PATH}. Run pnpm run generate:v32-ledger-btd-settlement-failure-states.`);
  }
  const current = readFileSync(absoluteArtifactPath, 'utf8');
  if (current !== serialized) {
    throw new Error(`${ARTIFACT_PATH} is stale. Run pnpm run generate:v32-ledger-btd-settlement-failure-states.`);
  }
  process.stdout.write(`Checked ${ARTIFACT_PATH}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
