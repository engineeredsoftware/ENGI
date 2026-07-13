import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  CONVERSATION_HISTORY_OPERATION_IDS,
  CONVERSATION_SESSION_FIELD_IDS,
  CONVERSATION_SESSION_ROUTE_HISTORY_ARTIFACT_PATH,
  CONVERSATION_SESSION_ROUTE_HISTORY_SOURCE_SAFETY_VERDICT,
  CONVERSATION_SESSION_ROUTE_IDS,
  buildConversationSessionRouteHistory,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe ConversationSession route-history contracts', () => {
  const routeHistory = buildConversationSessionRouteHistory({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(routeHistory.artifactId, 'v37-conversation-session-route-history');
  assert.equal(routeHistory.schemaId, 'bitcode.v37.conversationSessionRouteHistory.v1');
  assert.equal(routeHistory.version, 'V37');
  assert.equal(routeHistory.currentTarget, 'V36');
  assert.equal(routeHistory.passed, true);
  assert.equal(routeHistory.sourceSafetyVerdict, CONVERSATION_SESSION_ROUTE_HISTORY_SOURCE_SAFETY_VERDICT);
  assert.equal(routeHistory.coverage.routeContractCount, CONVERSATION_SESSION_ROUTE_IDS.length);
  assert.deepEqual(routeHistory.coverage.missingRouteIds, []);
  assert.deepEqual(routeHistory.coverage.missingHistoryOperationIds, []);
  assert.deepEqual(routeHistory.coverage.missingSourceRoots, []);
  assert.equal(routeHistory.coverage.allRouteContractsCovered, true);
  assert.equal(routeHistory.coverage.allHistoryOperationsCovered, true);
  assert.equal(routeHistory.coverage.createSupported, true);
  assert.equal(routeHistory.coverage.restoreSupported, true);
  assert.equal(routeHistory.coverage.branchSupported, true);
  assert.equal(routeHistory.coverage.retrySupported, true);
  assert.equal(routeHistory.coverage.redactionSupported, true);
  assert.equal(routeHistory.coverage.streamSupported, true);
  assert.equal(routeHistory.coverage.proofRootsCovered, true);
  assert.equal(routeHistory.coverage.eventIdsCovered, true);
  assert.equal(routeHistory.coverage.routeLocalHistoryCovered, true);
  assert.equal(routeHistory.coverage.routeContractsCovered, true);
  assert.equal(routeHistory.coverage.persistenceBoundariesCovered, true);
  assert.equal(routeHistory.coverage.credentialsSerialized, false);
  assert.equal(routeHistory.coverage.protectedSourceVisible, false);
  assert.equal(routeHistory.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(routeHistory.coverage.globalLedgerAuthorityClaimed, false);
  assert.equal(routeHistory.coverage.legacySourceRoots, false);
  assert.match(routeHistory.artifactRoot, /^conversation-session-route-history:[a-f0-9]{24}$/u);

  for (const routeId of CONVERSATION_SESSION_ROUTE_IDS) {
    assert.equal(routeHistory.rows.some((row) => row.routeId === routeId), true, `missing ${routeId}`);
  }

  for (const operationId of CONVERSATION_HISTORY_OPERATION_IDS) {
    assert.equal(routeHistory.rows.some((row) => row.operationId === operationId), true, `missing ${operationId}`);
  }

  for (const row of routeHistory.rows) {
    assert.match(row.rowRoot, /^conversation-session-row:[a-f0-9]{24}$/u);
    assert.match(row.detailRoot, /^conversation-session-detail:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafetyClass, 'source_safe_conversation_session_metadata');
    assert.equal(row.sourceSafetyPosture, 'route_history_never_exposes_protected_source_or_unpaid_assetpack_content');
    assert.equal(row.persistenceBoundary.routeLocalHistory, true);
    assert.equal(row.persistenceBoundary.globalLedgerTruth, false);
    assert.equal(row.persistenceBoundary.terminalAuthorityRequiredForLedgerWork, true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('global_ledger_authority_claim'), true);
    assert.equal(row.eventIds.length > 0, true);
    assert.equal(row.historyRefs.length > 0, true);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);

    for (const sessionFieldId of CONVERSATION_SESSION_FIELD_IDS) {
      assert.equal(row.sessionFieldIds.includes(sessionFieldId), true, `missing ${sessionFieldId} on ${row.contractId}`);
    }
    for (const proofRootField of row.proofRootFields) {
      assert.match(row.proofRoots[proofRootField], /^conversation-proof:[a-f0-9]{24}$/u);
    }
  }
});

test('keeps restore, branch, retry, and redaction route history local to Conversations', () => {
  const routeHistory = buildConversationSessionRouteHistory({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const restore = routeHistory.rows.find((row) => row.operationId === 'restore');
  const branch = routeHistory.rows.find((row) => row.operationId === 'branch');
  const retry = routeHistory.rows.find((row) => row.operationId === 'retry');
  const redaction = routeHistory.rows.find((row) => row.operationId === 'redact');

  assert.ok(restore);
  assert.equal(restore.routeContract.path, '/api/conversations/[conversationId]');
  assert.equal(restore.policyDecision.decision, 'admit_owner_history_restore');

  assert.ok(branch);
  assert.equal(branch.routeContract.path, '/api/conversations/branch');
  assert.equal(branch.historyRefs.includes('conversation-history:copied-attachments'), true);

  assert.ok(retry);
  assert.equal(retry.routeContract.path, '/api/conversations/[conversationId]/stream');
  assert.equal(retry.streamState, 'retry_streaming');

  assert.ok(redaction);
  assert.equal(redaction.policyDecision.decision, 'block_forbidden_payload_classes');
  assert.equal(redaction.redactionPosture.forbiddenPayloadClasses.includes('secret_values'), true);
  assert.equal(routeHistory.disclosureBoundary.conversationRoutesMustNotExpose.includes('wallet_private_material'), true);
  assert.equal(routeHistory.sourceEvidence.every((entry) => entry.allSourceRootsPresent), true);
  assert.equal(routeHistory.requiredRouteIds.includes('api.conversations.shared_contracts'), true);
  assert.equal(CONVERSATION_SESSION_ROUTE_HISTORY_ARTIFACT_PATH, '.bitcode/v37-conversation-session-route-history.json');
});
