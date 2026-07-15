import test from 'node:test';
import assert from 'node:assert/strict';
import {
  V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_ARTIFACT_PATH,
  V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_SCHEMA_ID,
  V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_SURFACES,
  V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_STAGE_IDS,
  buildV39InterfaceConversationProductParity,
} from '../src/canonical/v39-interface-conversation-product-parity.js';

test('V39 interface and Conversation product parity artifact covers source-safe no-bypass surfaces', () => {
  const artifact = buildV39InterfaceConversationProductParity();

  assert.equal(artifact.artifactId, 'v39-interface-conversation-product-parity');
  assert.equal(artifact.schemaId, V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_SCHEMA_ID);
  assert.equal(artifact.version, 'V39');
  assert.equal(artifact.currentTarget, 'V38');
  assert.equal(artifact.coverage.runtimeType, 'ReadingInterfaceProductParity');
  assert.equal(artifact.coverage.rowCount, 9);
  assert.deepEqual(artifact.coverage.surfaces, [...V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_SURFACES]);
  assert.deepEqual(artifact.coverage.stageIds, [...V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_STAGE_IDS]);
  assert.equal(artifact.coverage.protectedSourcePayloadSerialized, false);
  assert.equal(artifact.coverage.rawProviderResponseVisible, false);
  assert.equal(artifact.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.coverage.credentialsSerialized, false);
  assert.equal(V39_INTERFACE_CONVERSATION_PRODUCT_PARITY_ARTIFACT_PATH, '.bitcode/v39-interface-conversation-product-parity.json');
});
