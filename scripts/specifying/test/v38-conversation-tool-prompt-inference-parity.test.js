import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ARTIFACT_PATH,
  V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_REQUIRED_DISCLOSURE_POSTURES,
  V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROWS,
  V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROW_IDS,
  V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_SCHEMA_ID,
  V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_SOURCE_SAFETY_VERDICT,
  buildV38ConversationToolPromptInferenceParity,
} from '../src/canonical/conversation-tool-prompt-inference-parity.js';

test('V38 Conversation/tool prompt inference parity binds Conversation, tool prompts, telemetry, and interface entrypoints', () => {
  const report = buildV38ConversationToolPromptInferenceParity();

  assert.equal(
    V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ARTIFACT_PATH,
    '.proofs/v38/conversation-tool-prompt-inference-parity.json',
  );
  assert.equal(report.artifactId, 'v38-conversation-tool-prompt-inference-parity');
  assert.equal(report.schemaId, V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_SCHEMA_ID);
  assert.equal(report.version, 'V38');
  assert.equal(report.currentTarget, 'V37');
  assert.equal(report.sourceSafetyVerdict, V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.rowIds, [...V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROW_IDS]);
  assert.deepEqual(
    report.requiredDisclosurePostures,
    [...V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_REQUIRED_DISCLOSURE_POSTURES],
  );
  assert.equal(report.rows.length, V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROWS.length);
  assert.equal(report.coverage.rowCount, 8);
  assert.equal(report.coverage.conversationPtrrVariationsCovered, true);
  assert.equal(report.coverage.quickResponseSingleStepBypassRemoved, true);
  assert.equal(report.coverage.promptRegistryStepPromptsCovered, true);
  assert.equal(report.coverage.typedOutputSchemasCovered, true);
  assert.equal(report.coverage.sourceSafeConversationTelemetryCovered, true);
  assert.equal(report.coverage.richExecutionLogUiCovered, true);
  assert.equal(report.coverage.docCodeToolPromptFormattingCovered, true);
  assert.equal(report.coverage.toolPromptRegistryHierarchyCovered, true);
  assert.equal(report.coverage.chatGptToolPromptCarriersCovered, true);
  assert.equal(report.coverage.interfaceEntrypointsDoNotBypassStack, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawPromptTextSerialized, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.privateSettlementPayloadVisible, false);
  assert.equal(report.coverage.globalLedgerAuthorityClaimed, false);
  assert.equal(report.coverage.legacySourceRoots, false);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v38-conversation-tool-prompt-inference-parity:'));
});

test('V38 Conversation/tool prompt inference parity rows remain source-safe metadata', () => {
  const rowIds = V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROWS.map((row) => row.rowId);

  assert.deepEqual(rowIds, [...V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROW_IDS]);
  for (const row of V38_CONVERSATION_TOOL_PROMPT_INFERENCE_PARITY_ROWS) {
    assert.ok(row.rowRoot.startsWith('v38-conversation-tool-prompt-parity-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_conversation_tool_prompt_inference_parity_metadata');
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawPromptTextSerialized, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.privateSettlementPayloadVisible, false);
    assert.equal(row.globalLedgerAuthorityClaimed, false);
    assert.ok(row.forbiddenPayloadClasses.includes('raw_protected_prompts'));
    assert.ok(row.forbiddenPayloadClasses.includes('raw_model_responses_with_protected_source'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid_assetpack_source'));
  }
});
