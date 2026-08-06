import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  EXCHANGE_REHEARSAL_ARTIFACT_PATH,
  EXCHANGE_REHEARSAL_FLOW_IDS,
  EXCHANGE_REHEARSAL_IDS,
  EXCHANGE_REHEARSAL_SOURCE_SAFETY_VERDICT,
  buildExchangeRehearsal,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds the source-safe V36 Exchange rehearsal report', () => {
  const report = buildExchangeRehearsal({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v36-exchange-rehearsal');
  assert.equal(report.schemaId, 'bitcode.v36.exchangeRehearsal.v1');
  assert.equal(report.version, 'V36');
  assert.equal(report.currentTarget, 'V35');
  assert.equal(report.sourceSafetyVerdict, EXCHANGE_REHEARSAL_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.equal(report.coverage.rehearsalCount, EXCHANGE_REHEARSAL_IDS.length);
  assert.deepEqual(report.coverage.missingRehearsalIds, []);
  assert.deepEqual(report.coverage.missingFlowIds, []);
  assert.deepEqual(report.coverage.missingSourceRoots, []);
  assert.deepEqual(report.coverage.rowsMissingFlowIds, []);
  assert.deepEqual(report.coverage.rowsMissingProofRoots, []);
  assert.deepEqual(report.coverage.rowsMissingLedgerDatabaseSync, []);
  assert.deepEqual(report.coverage.rowsMissingSourceSafeLogs, []);
  assert.deepEqual(report.coverage.rowsMissingValidationCommands, []);
  assert.deepEqual(report.coverage.valueBearingUnblockedRows, []);
  assert.equal(report.coverage.allRequiredRehearsalsCovered, true);
  assert.equal(report.coverage.allExchangeFlowsCovered, true);
  assert.equal(report.coverage.localRehearsalCovered, true);
  assert.equal(report.coverage.stagingTestnetRehearsalCovered, true);
  assert.equal(report.coverage.ledgerDatabaseSynchronizationVisible, true);
  assert.equal(report.coverage.sourceSafeLogsCovered, true);
  assert.equal(report.coverage.valueBearingMainnetVisibleAndBlocked, true);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawProtectedPromptVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.privatePaymentCredentialsVisible, false);
  assert.equal(report.coverage.objectStoragePrivateBytesVisible, false);
  assert.match(report.artifactRoot, /^exchange-rehearsal:[a-f0-9]{24}$/u);
  assert.equal(EXCHANGE_REHEARSAL_ARTIFACT_PATH, '.proofs/v36/exchange-rehearsal.json');
});

test('rehearses local and staging-testnet Exchange flows with blocked mainnet posture', () => {
  const report = buildExchangeRehearsal({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const byRehearsalId = new Map(report.rows.map((row) => [row.rehearsalId, row]));
  const local = byRehearsalId.get('local_exchange_rehearsal');
  const staging = byRehearsalId.get('staging_testnet_exchange_rehearsal');
  const mainnetBlocked = byRehearsalId.get('value_bearing_mainnet_blocked_rehearsal');

  for (const rehearsalId of EXCHANGE_REHEARSAL_IDS) {
    assert.equal(report.rows.some((row) => row.rehearsalId === rehearsalId), true, `missing ${rehearsalId}`);
  }

  for (const flowId of EXCHANGE_REHEARSAL_FLOW_IDS) {
    assert.equal(local.flowIds.includes(flowId), true, `local missing ${flowId}`);
    assert.equal(staging.flowIds.includes(flowId), true, `staging missing ${flowId}`);
    assert.equal(report.coverage[`${flowId}FlowCovered`], true, `coverage missing ${flowId}`);
  }

  for (const row of report.rows) {
    assert.equal(row.canonicalObject, 'ExchangeRehearsal');
    assert.match(row.rehearsalRoot, /^exchange-rehearsal-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);
    assert.ok(row.eventIds.length > 0);
    assert.ok(row.proofRootFields.length > 0);
    assert.ok(row.ledgerDatabaseSyncChecks.length > 0);
    assert.ok(row.screenshotOrLogRoots.length > 0);
    assert.ok(row.validationCommands.length > 0);
    assert.equal(row.valueBearingMainnetAdmission, false);
    assert.ok(row.allowedPayloadFields.includes('flowIds'));
    assert.ok(row.allowedPayloadFields.includes('proofRoots'));
    assert.ok(row.allowedPayloadFields.includes('screenshotOrLogRoots'));
    assert.ok(row.forbiddenPayloadFields.includes('secret_values'));
    assert.ok(row.forbiddenPayloadFields.includes('unpaid_assetpack_source'));

    for (const proofRootField of row.proofRootFields) {
      assert.match(row.proofRoots[proofRootField], /^exchange-rehearsal-[a-z-]+:[a-f0-9]{24}$/u);
    }
  }

  assert.equal(local.laneId, 'local');
  assert.equal(staging.laneId, 'staging-testnet');
  assert.equal(mainnetBlocked.laneId, 'value-bearing-mainnet');
  assert.equal(mainnetBlocked.failClosedResult.includes('remains blocked'), true);
  assert.equal(report.lanePosture.valueBearingMainnet, 'blocked_future_canon_required');
});
