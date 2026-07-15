import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  CONVERSATION_STREAM_EVENT_CONTRACT_ARTIFACT_PATH,
  CONVERSATION_STREAM_EVENT_CONTRACT_SOURCE_SAFETY_VERDICT,
  CONVERSATION_STREAM_EVENT_KIND_IDS,
  CONVERSATION_STREAM_REQUIRED_TELEMETRY_FIELD_IDS,
  buildConversationStreamEventContract,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe ConversationStreamEvent contracts for every stream row kind', () => {
  const contract = buildConversationStreamEventContract({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(contract.artifactId, 'v37-conversation-stream-event-contract');
  assert.equal(contract.schemaId, 'bitcode.v37.conversationStreamEventContract.v1');
  assert.equal(contract.version, 'V37');
  assert.equal(contract.currentTarget, 'V36');
  assert.equal(contract.passed, true);
  assert.equal(contract.sourceSafetyVerdict, CONVERSATION_STREAM_EVENT_CONTRACT_SOURCE_SAFETY_VERDICT);
  assert.equal(contract.coverage.eventKindCount, CONVERSATION_STREAM_EVENT_KIND_IDS.length);
  assert.deepEqual(contract.coverage.missingKindIds, []);
  assert.deepEqual(contract.coverage.missingTelemetryFieldIds, []);
  assert.deepEqual(contract.coverage.missingSourceRoots, []);
  assert.equal(contract.coverage.modelDeltaCovered, true);
  assert.equal(contract.coverage.toolCallCovered, true);
  assert.equal(contract.coverage.retrievalSummaryCovered, true);
  assert.equal(contract.coverage.proofRootCovered, true);
  assert.equal(contract.coverage.retryStateCovered, true);
  assert.equal(contract.coverage.completionDecisionCovered, true);
  assert.equal(contract.coverage.errorRowCovered, true);
  assert.equal(contract.coverage.collapsedReadableStatusCovered, true);
  assert.equal(contract.coverage.expandedMetadataCovered, true);
  assert.equal(contract.coverage.proofRootsCovered, true);
  assert.equal(contract.coverage.redactionPostureCovered, true);
  assert.equal(contract.coverage.promptDisclosureCovered, true);
  assert.equal(contract.coverage.resultDisclosureCovered, true);
  assert.equal(contract.coverage.failClosedStatesCovered, true);
  assert.equal(contract.coverage.protectedSourceVisible, false);
  assert.equal(contract.coverage.credentialsSerialized, false);
  assert.equal(contract.coverage.legacySourceRoots, false);
  assert.match(contract.artifactRoot, /^conversation-stream-event-contract:[a-f0-9]{24}$/u);
  assert.equal(CONVERSATION_STREAM_EVENT_CONTRACT_ARTIFACT_PATH, '.proofs/v37/conversation-stream-event-contract.json');

  for (const kindId of CONVERSATION_STREAM_EVENT_KIND_IDS) {
    assert.equal(contract.rows.some((row) => row.kindId === kindId), true, `missing ${kindId}`);
  }
});

test('stream rows carry proof roots, redaction posture, disclosure posture, and fail-closed states', () => {
  const contract = buildConversationStreamEventContract({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  for (const row of contract.rows) {
    assert.match(row.rowRoot, /^conversation-stream-row:[a-f0-9]{24}$/u);
    assert.match(row.detailRoot, /^conversation-stream-detail:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafetyClass, 'source_safe_conversation_stream_event_metadata');
    assert.equal(row.promptDisclosurePosture, 'prompt_template_id_only');
    assert.equal(row.resultDisclosurePosture, 'parsed_result_shape_only');
    assert.equal(row.redactionPosture.protectedSourceVisible, false);
    assert.equal(row.redactionPosture.unpaidAssetPackSourceVisible, false);
    assert.equal(row.redactionPosture.rawModelResponseVisible, false);
    assert.equal(row.redactionPosture.globalLedgerAuthorityClaimed, false);
    assert.equal(row.failClosedStates.length > 0, true);
    assert.equal(row.expandedMetadataSections.length > 0, true);

    for (const fieldId of CONVERSATION_STREAM_REQUIRED_TELEMETRY_FIELD_IDS) {
      assert.equal(row.telemetryFields.includes(fieldId), true, `missing ${fieldId} on ${row.kindId}`);
    }

    for (const proofRoot of Object.values(row.proofRoots)) {
      assert.match(String(proofRoot), /^conversation-stream-proof:[a-f0-9]{24}$/u);
    }
  }
});
