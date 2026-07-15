// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EXCHANGE_REHEARSAL_ARTIFACT_PATH = '.bitcode/v36-exchange-rehearsal.json';
export const EXCHANGE_REHEARSAL_SCHEMA_ID = 'bitcode.v36.exchangeRehearsal.v1';
export const EXCHANGE_REHEARSAL_VERSION = 'V36';
export const EXCHANGE_REHEARSAL_CURRENT_TARGET = 'V35';
export const EXCHANGE_REHEARSAL_SOURCE_SAFETY_VERDICT = 'source-safe-exchange-rehearsal-metadata';

export const EXCHANGE_REHEARSAL_IDS = Object.freeze([
  'local_exchange_rehearsal',
  'staging_testnet_exchange_rehearsal',
  'ledger_database_synchronization_rehearsal',
  'source_safe_screenshot_log_rehearsal',
  'value_bearing_mainnet_blocked_rehearsal',
]);

export const EXCHANGE_REHEARSAL_FLOW_IDS = Object.freeze([
  'list',
  'bid',
  'ask',
  'cancel',
  'accept',
  'settle',
  'repair',
  'history',
]);

const EXCHANGE_REHEARSAL_PHASE_IDS = Object.freeze([
  'market_activity_listing',
  'intent_order_lifecycle',
  'rights_transfer_preview',
  'pricing_quote_review',
  'settlement_reconciliation',
  'dispute_repair_review',
  'history_review',
  'source_safe_evidence_review',
]);

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

const FORBIDDEN_REHEARSAL_PAYLOAD = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'wallet_seed_phrase',
  'wallet_private_key',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'buyer_private_repository_payload',
  'private_payment_credentials',
  'object_storage_private_bytes',
]);

const ALLOWED_REHEARSAL_FIELDS = Object.freeze([
  'rehearsalId',
  'laneId',
  'flowIds',
  'phaseIds',
  'eventIds',
  'proofRoots',
  'ledgerDatabaseSyncChecks',
  'screenshotOrLogRoots',
  'validationCommands',
  'summaryCounts',
  'sourceSafetyClass',
]);

const SHARED_SOURCE_ROOTS = Object.freeze([
  'BITCODE_SPEC_V36.md',
  'BITCODE_SPEC_V36_DELTA.md',
  'BITCODE_SPEC_V36_NOTES.md',
  'BITCODE_SPEC_V36_PARITY_MATRIX.md',
  'SPECIFICATIONS_ROADMAP.md',
  '.bitcode/v36-exchange-activity-book.json',
  '.bitcode/v36-exchange-intent-order-contracts.json',
  '.bitcode/v36-exchange-rights-transfer-review.json',
  '.bitcode/v36-pricing-liquidity-fee-quote.json',
  '.bitcode/v36-exchange-settlement-reconciliation.json',
  '.bitcode/v36-exchange-dispute-repair-revenue-route.json',
  '.bitcode/v36-exchange-ux-proof.json',
]);

const rehearsalRows = Object.freeze([
  row({
    rehearsalId: 'local_exchange_rehearsal',
    laneId: 'local',
    title: 'Local Exchange rehearsal',
    purpose:
      'Exercise every source-safe Exchange flow on a local app/runtime lane before staging-testnet use.',
    phaseIds: EXCHANGE_REHEARSAL_PHASE_IDS,
    flowIds: EXCHANGE_REHEARSAL_FLOW_IDS,
    sourceRoots: [
      'apps/uapi/app/packs/PacksPageClient.tsx',
      'apps/uapi/app/packs/page.tsx',
      'apps/uapi/app/api/packs/activity/route.ts',
      'apps/uapi/app/exchange/README.md',
      'apps/uapi/tests/packsPageClient.test.tsx',
      'apps/uapi/tests/packActivityModel.test.ts',
      'apps/uapi/tests/exchangeTerminalHandoff.test.ts',
      '.github/workflows/bitcode-gate-quality.yml',
    ],
    ledgerDatabaseSyncChecks: [
      'local.exchange.ledger-root-to-database-projection.root',
      'local.exchange.order-history-replay.root',
      'local.exchange.repair-required-on-projection-drift.root',
    ],
    screenshotOrLogRoots: [
      'local-exchange-list-bid-ask-redacted-log-root',
      'local-exchange-cancel-accept-settle-repair-history-redacted-screenshot-root',
    ],
    validationCommands: [
      'pnpm run check:v36-gate2',
      'pnpm run check:v36-gate8',
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/packsPageClient.test.tsx tests/packActivityModel.test.ts tests/exchangeTerminalHandoff.test.ts --runInBand',
    ],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'staging_testnet_exchange_rehearsal',
    laneId: 'staging-testnet',
    title: 'Staging-testnet Exchange rehearsal',
    purpose:
      'Exercise every source-safe Exchange flow against staging-testnet projection and telemetry posture without value-bearing mainnet unlock.',
    phaseIds: EXCHANGE_REHEARSAL_PHASE_IDS,
    flowIds: EXCHANGE_REHEARSAL_FLOW_IDS,
    sourceRoots: [
      'apps/uapi/app/packs/PacksPageClient.tsx',
      'apps/uapi/app/api/packs/activity/route.ts',
      'apps/uapi/components/bitcode/pipeline/BitcodeTransactionsDataTable/BitcodeTransactionsDataTable.tsx',
      'apps/uapi/components/bitcode/pipeline/PipelineExecutionLog/PipelineExecutionLog.tsx',
      'apps/uapi/components/bitcode/pipeline/models/pipeline-run-data.ts',
      'apps/uapi/components/bitcode/routes/ProductRoutes/product-routes.ts',
    ],
    ledgerDatabaseSyncChecks: [
      'staging-testnet.exchange.ledger-root-to-database-projection.root',
      'staging-testnet.exchange.settlement-receipt-to-delivery-state.root',
      'staging-testnet.exchange.repair-event-to-history-projection.root',
    ],
    screenshotOrLogRoots: [
      'staging-testnet-exchange-flow-redacted-log-root',
      'staging-testnet-exchange-history-redacted-screenshot-root',
    ],
    validationCommands: [
      'pnpm run check:v36-gate6',
      'pnpm run check:v36-gate7',
      'pnpm run check:v36-gate8',
    ],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'ledger_database_synchronization_rehearsal',
    laneId: 'staging-testnet',
    title: 'Ledger/database synchronization rehearsal',
    purpose:
      'Prove Exchange settlement, repair, and history rows can be replayed from ledger roots into database projections with drift blockers.',
    phaseIds: ['settlement_reconciliation', 'dispute_repair_review', 'history_review', 'source_safe_evidence_review'],
    flowIds: ['settle', 'repair', 'history'],
    sourceRoots: [
      'packages/specifying/src/canonical/exchange-settlement-reconciliation.js',
      'packages/specifying/src/canonical/exchange-dispute-repair-revenue-route.js',
      'packages/btd/src/journal.ts',
      'packages/btd/src/journal.ts',
    ],
    ledgerDatabaseSyncChecks: [
      'exchange.settlement.ledger-root-dominates-database-projection.root',
      'exchange.repair.database-projection-repaired-from-ledger.root',
      'exchange.history.database-projection-replayed-from-ledger.root',
    ],
    screenshotOrLogRoots: ['ledger-database-synchronization-redacted-log-root'],
    validationCommands: ['pnpm run check:v36-gate6', 'pnpm run check:v36-gate7'],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'source_safe_screenshot_log_rehearsal',
    laneId: 'local',
    title: 'Source-safe screenshot and log rehearsal',
    purpose:
      'Review Exchange screenshots, log streams, metadata accordions, and generated proof roots without source-bearing payload disclosure.',
    phaseIds: ['market_activity_listing', 'history_review', 'source_safe_evidence_review'],
    flowIds: ['list', 'history'],
    sourceRoots: [
      'apps/uapi/app/packs/PacksPageClient.tsx',
      'apps/uapi/components/bitcode/activity/PackActivityModel/pack-activity-model.ts',
      'apps/uapi/components/bitcode/pipeline/models/pipeline-run-activity.ts',
      'apps/uapi/tests/pipelineExecutionLogHeader.test.tsx',
      'packages/specifying/src/canonical/exchange-ux-proof.js',
    ],
    ledgerDatabaseSyncChecks: ['exchange.source-safe-log-root-to-event-root.root'],
    screenshotOrLogRoots: [
      'exchange-collapsed-status-redacted-screenshot-root',
      'exchange-expanded-metadata-redacted-log-root',
    ],
    validationCommands: [
      'pnpm run check:v36-gate8',
      'pnpm --dir apps/uapi exec jest --runTestsByPath tests/pipelineExecutionLogHeader.test.tsx --runInBand',
    ],
    valueBearingMainnetAdmission: false,
  }),
  row({
    rehearsalId: 'value_bearing_mainnet_blocked_rehearsal',
    laneId: 'value-bearing-mainnet',
    title: 'Value-bearing mainnet blocked Exchange rehearsal',
    purpose:
      'Make the blocked value-bearing mainnet boundary visible for every Exchange flow while preserving local and staging-testnet rehearsal paths.',
    phaseIds: ['pricing_quote_review', 'settlement_reconciliation', 'source_safe_evidence_review'],
    flowIds: EXCHANGE_REHEARSAL_FLOW_IDS,
    sourceRoots: [
      'BITCODE_SPEC_V36.md',
      'packages/specifying/src/canonical/exchange-pricing-quote.js',
      'packages/specifying/src/canonical/exchange-settlement-reconciliation.js',
      'packages/specifying/src/canonical/exchange-rights-transfer-review.js',
    ],
    ledgerDatabaseSyncChecks: [
      'value-bearing-mainnet.exchange.non-admission.root',
      'value-bearing-mainnet.exchange.no-broadcast.root',
      'value-bearing-mainnet.exchange.no-source-unlock.root',
    ],
    screenshotOrLogRoots: ['value-bearing-mainnet-exchange-blocked-redacted-log-root'],
    validationCommands: ['pnpm run check:v36-gate5', 'pnpm run check:v36-gate6'],
    valueBearingMainnetAdmission: false,
  }),
]);

export const EXCHANGE_REHEARSAL_ROWS = rehearsalRows;

/**
 * @param {{
 *   rehearsalId: string,
 *   laneId: string,
 *   title: string,
 *   purpose: string,
 *   phaseIds: readonly string[],
 *   flowIds: readonly string[],
 *   sourceRoots: readonly string[],
 *   ledgerDatabaseSyncChecks: readonly string[],
 *   screenshotOrLogRoots: readonly string[],
 *   validationCommands: readonly string[],
 *   valueBearingMainnetAdmission: boolean,
 * }} input
 */
function row(input) {
  const eventIds = input.flowIds.map((flowId) => `exchange.${input.laneId}.${flowId}.rehearsed`);
  const proofRoots = {
    flowRoot: prefixedRoot('exchange-rehearsal-flow', {
      rehearsalId: input.rehearsalId,
      flowIds: input.flowIds,
    }),
    ledgerRoot: prefixedRoot('exchange-rehearsal-ledger', input.ledgerDatabaseSyncChecks),
    databaseProjectionRoot: prefixedRoot('exchange-rehearsal-database', {
      rehearsalId: input.rehearsalId,
      ledgerDatabaseSyncChecks: input.ledgerDatabaseSyncChecks,
    }),
    telemetryRoot: prefixedRoot('exchange-rehearsal-telemetry', eventIds),
    sourceSafetyRoot: prefixedRoot('exchange-rehearsal-source-safety', input.screenshotOrLogRoots),
  };

  return {
    ...input,
    canonicalObject: 'ExchangeRehearsal',
    sourceRoots: [...SHARED_SOURCE_ROOTS, ...input.sourceRoots],
    eventIds,
    proofRoots,
    proofRootFields: Object.keys(proofRoots).sort(),
    allowedPayloadFields: ALLOWED_REHEARSAL_FIELDS,
    forbiddenPayloadFields: FORBIDDEN_REHEARSAL_PAYLOAD,
    sourceSafetyClass: EXCHANGE_REHEARSAL_SOURCE_SAFETY_VERDICT,
    sourceSafetyRule:
      'Exchange rehearsal evidence may expose source-safe ids, event ids, proof roots, lane ids, flow ids, validation commands, screenshot/log roots, and summary counts only.',
    failClosedResult:
      input.laneId === 'value-bearing-mainnet'
        ? `${input.rehearsalId} remains blocked until future canon explicitly admits value-bearing mainnet Exchange settlement`
        : `${input.rehearsalId} blocks when flow coverage, ledger/database synchronization, source-safe logs, validation commands, proof roots, or source evidence are incomplete`,
  };
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`;
  const record = /** @type {Record<string, unknown>} */ (value);
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(',')}}`;
}

/**
 * @param {string} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableRoot(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
}

/**
 * @param {string} prefix
 * @param {unknown} value
 * @returns {string}
 */
function prefixedRoot(prefix, value) {
  return `${prefix}:${stableRoot(value).slice('sha256:'.length, 'sha256:'.length + 24)}`;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function includesSecretMarker(value) {
  return SECRET_MARKERS.some((marker) => value.includes(marker));
}

/**
 * @param {string} repoRoot
 * @param {string} relativePath
 * @returns {boolean}
 */
function sourceRootExists(repoRoot, relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

/**
 * @param {ReadonlyArray<string>} values
 * @param {ReadonlyArray<string>} requiredValues
 * @returns {boolean}
 */
function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

/**
 * @param {{
 *   version?: string,
 *   currentTarget?: string,
 *   generatedAt?: string,
 *   repoRoot?: string,
 * }} [input]
 */
export function buildExchangeRehearsal(input = {}) {
  const version = input.version || EXCHANGE_REHEARSAL_VERSION;
  const currentTarget = input.currentTarget || EXCHANGE_REHEARSAL_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const rows = rehearsalRows.map((sourceRow) => {
    const sourceEvidence = sourceRow.sourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoot = {
      ...sourceRow,
      sourceEvidence,
      replayExpectation: {
        command: 'pnpm run check:v36-exchange-rehearsal',
        failClosedOn: [
          'missing_rehearsal',
          'missing_local_lane',
          'missing_staging_testnet_lane',
          'missing_exchange_flow',
          'missing_ledger_database_sync',
          'missing_source_safe_log_root',
          'value_bearing_mainnet_unblocked',
          'source_unsafe_rehearsal_payload',
        ],
      },
    };

    return {
      ...rowWithoutRoot,
      rehearsalRoot: `exchange-rehearsal-row:${sha256(sourceRow.rehearsalId + canonicalJson(rowWithoutRoot)).slice(0, 24)}`,
    };
  });

  const observedRehearsalIds = rows.map((row) => row.rehearsalId);
  const missingRehearsalIds = EXCHANGE_REHEARSAL_IDS.filter((id) => !observedRehearsalIds.includes(id));
  const observedLaneIds = Array.from(new Set(rows.map((row) => row.laneId))).sort();
  const observedFlowIds = Array.from(new Set(rows.flatMap((row) => row.flowIds))).sort();
  const observedPhaseIds = Array.from(new Set(rows.flatMap((row) => row.phaseIds))).sort();
  const localRows = rows.filter((row) => row.laneId === 'local');
  const stagingRows = rows.filter((row) => row.laneId === 'staging-testnet');
  const valueBearingRows = rows.filter((row) => row.laneId === 'value-bearing-mainnet');
  const missingFlowIds = EXCHANGE_REHEARSAL_FLOW_IDS.filter((flowId) => !observedFlowIds.includes(flowId));
  const missingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.rehearsalId}:${entry.sourceRoot}`),
  );
  const rowsMissingFlowIds = rows
    .filter((row) => row.laneId !== 'value-bearing-mainnet' && row.flowIds.length === 0)
    .map((row) => row.rehearsalId);
  const rowsMissingProofRoots = rows
    .filter((row) => row.proofRootFields.length === 0 || row.proofRootFields.some((field) => typeof row.proofRoots[field] !== 'string'))
    .map((row) => row.rehearsalId);
  const rowsMissingLedgerDatabaseSync = rows
    .filter((row) => row.ledgerDatabaseSyncChecks.length === 0)
    .map((row) => row.rehearsalId);
  const rowsMissingSourceSafeLogs = rows
    .filter((row) => row.screenshotOrLogRoots.length === 0)
    .map((row) => row.rehearsalId);
  const rowsMissingValidationCommands = rows
    .filter((row) => row.validationCommands.length === 0)
    .map((row) => row.rehearsalId);
  const valueBearingUnblockedRows = valueBearingRows
    .filter((row) => row.valueBearingMainnetAdmission !== false)
    .map((row) => row.rehearsalId);
  const serializedRows = canonicalJson(rows);
  const credentialsSerialized = includesSecretMarker(serializedRows);
  const localAllFlowsCovered = localRows.some((row) => includesAll(row.flowIds, EXCHANGE_REHEARSAL_FLOW_IDS));
  const stagingAllFlowsCovered = stagingRows.some((row) => includesAll(row.flowIds, EXCHANGE_REHEARSAL_FLOW_IDS));

  const failures = [
    ...missingRehearsalIds.map((id) => `missing exchange rehearsal ${id}`),
    ...missingFlowIds.map((id) => `missing exchange rehearsal flow ${id}`),
    ...missingSourceRoots.map((sourceRoot) => `missing exchange rehearsal source root ${sourceRoot}`),
    ...rowsMissingFlowIds.map((id) => `missing flow ids for ${id}`),
    ...rowsMissingProofRoots.map((id) => `missing proof roots for ${id}`),
    ...rowsMissingLedgerDatabaseSync.map((id) => `missing ledger/database synchronization checks for ${id}`),
    ...rowsMissingSourceSafeLogs.map((id) => `missing source-safe screenshot/log roots for ${id}`),
    ...rowsMissingValidationCommands.map((id) => `missing validation commands for ${id}`),
    ...valueBearingUnblockedRows.map((id) => `value-bearing mainnet is not blocked for ${id}`),
    ...(localAllFlowsCovered ? [] : ['local Exchange rehearsal does not cover every required flow']),
    ...(stagingAllFlowsCovered ? [] : ['staging-testnet Exchange rehearsal does not cover every required flow']),
    ...(credentialsSerialized ? ['Exchange rehearsal contains a secret-shaped marker'] : []),
  ];

  const coverage = {
    requiredRehearsalIds: [...EXCHANGE_REHEARSAL_IDS],
    observedRehearsalIds,
    missingRehearsalIds,
    requiredFlowIds: [...EXCHANGE_REHEARSAL_FLOW_IDS],
    observedFlowIds,
    missingFlowIds,
    observedLaneIds,
    observedPhaseIds,
    rehearsalCount: rows.length,
    allRequiredRehearsalsCovered: includesAll(observedRehearsalIds, EXCHANGE_REHEARSAL_IDS),
    allExchangeFlowsCovered: includesAll(observedFlowIds, EXCHANGE_REHEARSAL_FLOW_IDS),
    localRehearsalCovered: observedLaneIds.includes('local') && localAllFlowsCovered,
    stagingTestnetRehearsalCovered: observedLaneIds.includes('staging-testnet') && stagingAllFlowsCovered,
    ledgerDatabaseSynchronizationVisible: rows.every((row) => row.ledgerDatabaseSyncChecks.length > 0),
    sourceSafeLogsCovered: rows.every((row) => row.screenshotOrLogRoots.length > 0),
    valueBearingMainnetVisibleAndBlocked:
      observedLaneIds.includes('value-bearing-mainnet') && valueBearingRows.length > 0 && valueBearingUnblockedRows.length === 0,
    listFlowCovered: observedFlowIds.includes('list'),
    bidFlowCovered: observedFlowIds.includes('bid'),
    askFlowCovered: observedFlowIds.includes('ask'),
    cancelFlowCovered: observedFlowIds.includes('cancel'),
    acceptFlowCovered: observedFlowIds.includes('accept'),
    settleFlowCovered: observedFlowIds.includes('settle'),
    repairFlowCovered: observedFlowIds.includes('repair'),
    historyFlowCovered: observedFlowIds.includes('history'),
    rowsMissingFlowIds,
    rowsMissingProofRoots,
    rowsMissingLedgerDatabaseSync,
    rowsMissingSourceSafeLogs,
    rowsMissingValidationCommands,
    valueBearingUnblockedRows,
    missingSourceRoots,
    credentialsSerialized,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    privatePaymentCredentialsVisible: false,
    objectStoragePrivateBytesVisible: false,
  };

  const artifactSeed = {
    version,
    currentTarget,
    rows,
    coverage,
    sourceSafetyVerdict: EXCHANGE_REHEARSAL_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v36-exchange-rehearsal',
    schemaId: EXCHANGE_REHEARSAL_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: EXCHANGE_REHEARSAL_SOURCE_SAFETY_VERDICT,
    disclosureBoundary: {
      allowedRehearsalFields: [...ALLOWED_REHEARSAL_FIELDS],
      forbiddenRehearsalPayload: [...FORBIDDEN_REHEARSAL_PAYLOAD],
      rehearsalRule:
        'Local and staging-testnet Exchange rehearsal evidence may expose source-safe ids, proof roots, flow ids, validation commands, screenshot/log roots, and summary counts only; it must not expose secrets, source-bearing AssetPack content, raw protected prompts, buyer repository private data, wallet private material, private payment credentials, or object-storage private bytes.',
    },
    lanePosture: {
      local: 'developer_workstation_source_safe_exchange_rehearsal',
      stagingTestnet: 'full_stack_non_value_exchange_testnet_rehearsal',
      mainnetReadyDryRun: 'watch_only_dry_run_without_value_bearing_unlock',
      valueBearingMainnet: 'blocked_future_canon_required',
    },
    rows,
    coverage,
    sourceEvidence: rows.map((row) => ({
      rehearsalId: row.rehearsalId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `exchange-rehearsal:${sha256(canonicalJson(artifactSeed)).slice(0, 24)}`,
    passed: failures.length === 0,
    failures,
    validationCommand: 'pnpm run check:v36-gate9',
  };
}
