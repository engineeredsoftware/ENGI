import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  CONVERSATION_REHEARSAL_ARTIFACT_PATH,
  CONVERSATION_REHEARSAL_FLOW_IDS,
  CONVERSATION_REHEARSAL_IDS,
  CONVERSATION_REHEARSAL_SOURCE_SAFETY_VERDICT,
  buildConversationRehearsal,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds the source-safe V37 Conversations rehearsal report', () => {
  const report = buildConversationRehearsal({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v37-conversation-rehearsal');
  assert.equal(report.schemaId, 'bitcode.v37.conversationRehearsal.v1');
  assert.equal(report.version, 'V37');
  assert.equal(report.currentTarget, 'V36');
  assert.equal(report.sourceSafetyVerdict, CONVERSATION_REHEARSAL_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.equal(report.coverage.rehearsalCount, CONVERSATION_REHEARSAL_IDS.length);
  assert.deepEqual(report.coverage.missingRehearsalIds, []);
  assert.deepEqual(report.coverage.missingFlowIds, []);
  assert.deepEqual(report.coverage.missingSourceRoots, []);
  assert.deepEqual(report.coverage.rowsMissingFlowIds, []);
  assert.deepEqual(report.coverage.rowsMissingProofRoots, []);
  assert.deepEqual(report.coverage.rowsMissingRouteUiChecks, []);
  assert.deepEqual(report.coverage.rowsMissingTelemetryChecks, []);
  assert.deepEqual(report.coverage.rowsMissingSourceSafeLogs, []);
  assert.deepEqual(report.coverage.rowsMissingValidationCommands, []);
  assert.deepEqual(report.coverage.valueBearingUnblockedRows, []);
  assert.equal(report.coverage.allRequiredRehearsalsCovered, true);
  assert.equal(report.coverage.allConversationFlowsCovered, true);
  assert.equal(report.coverage.localRehearsalCovered, true);
  assert.equal(report.coverage.stagingTestnetRehearsalCovered, true);
  assert.equal(report.coverage.routeUiChecksVisible, true);
  assert.equal(report.coverage.telemetryChecksVisible, true);
  assert.equal(report.coverage.sourceSafeLogsCovered, true);
  assert.equal(report.coverage.valueBearingMainnetVisibleAndBlocked, true);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawProtectedPromptVisible, false);
  assert.equal(report.coverage.rawModelResponseVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
  assert.equal(report.coverage.ledgerWriteAuthorityVisible, false);
  assert.equal(report.coverage.walletSigningAuthorityVisible, false);
  assert.match(report.artifactRoot, /^conversation-rehearsal:[a-f0-9]{24}$/u);
  assert.equal(CONVERSATION_REHEARSAL_ARTIFACT_PATH, '.bitcode/v37-conversation-rehearsal.json');
});

test('rehearses local and staging-testnet Conversations flows with blocked mainnet posture', () => {
  const report = buildConversationRehearsal({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const byRehearsalId = new Map(report.rows.map((row) => [row.rehearsalId, row]));
  const local = byRehearsalId.get('local_conversations_rehearsal');
  const staging = byRehearsalId.get('staging_testnet_conversations_rehearsal');
  const mainnetBlocked = byRehearsalId.get('value_bearing_mainnet_blocked_conversations_rehearsal');

  for (const rehearsalId of CONVERSATION_REHEARSAL_IDS) {
    assert.equal(report.rows.some((row) => row.rehearsalId === rehearsalId), true, `missing ${rehearsalId}`);
  }

  for (const flowId of CONVERSATION_REHEARSAL_FLOW_IDS) {
    assert.equal(local.flowIds.includes(flowId), true, `local missing ${flowId}`);
    assert.equal(staging.flowIds.includes(flowId), true, `staging missing ${flowId}`);
    assert.equal(report.coverage[`${flowId}FlowCovered`], true, `coverage missing ${flowId}`);
  }

  for (const row of report.rows) {
    assert.equal(row.canonicalObject, 'ConversationRehearsal');
    assert.match(row.rehearsalRoot, /^conversation-rehearsal-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);
    assert.ok(row.eventIds.length > 0);
    assert.ok(row.proofRootFields.length > 0);
    assert.ok(row.routeUiChecks.length > 0);
    assert.ok(row.telemetryChecks.length > 0);
    assert.ok(row.screenshotOrLogRoots.length > 0);
    assert.ok(row.validationCommands.length > 0);
    assert.equal(row.valueBearingMainnetAdmission, false);
    assert.ok(row.allowedPayloadFields.includes('flowIds'));
    assert.ok(row.allowedPayloadFields.includes('proofRoots'));
    assert.ok(row.allowedPayloadFields.includes('screenshotOrLogRoots'));
    assert.ok(row.forbiddenPayloadFields.includes('secret_values'));
    assert.ok(row.forbiddenPayloadFields.includes('unpaid_assetpack_source'));
    assert.ok(row.forbiddenPayloadFields.includes('ledger_write_authority'));

    for (const proofRootField of row.proofRootFields) {
      assert.match(row.proofRoots[proofRootField], /^conversation-rehearsal-[a-z-]+:[a-f0-9]{24}$/u);
    }
  }

  assert.equal(local.laneId, 'local');
  assert.equal(staging.laneId, 'staging-testnet');
  assert.equal(mainnetBlocked.laneId, 'value-bearing-mainnet');
  assert.equal(mainnetBlocked.failClosedResult.includes('remains blocked'), true);
  assert.equal(report.lanePosture.valueBearingMainnet, 'blocked_future_canon_required');
});
