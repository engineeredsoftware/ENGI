import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V40_CONVERSATION_TERMINAL_EXPECTED_TOTALS,
  V40_CONVERSATION_TERMINAL_INTEGRATION_ARTIFACT_PATH,
  V40_CONVERSATION_TERMINAL_INTEGRATION_ROWS,
  V40_CONVERSATION_TERMINAL_INTEGRATION_SCHEMA_ID,
  V40_CONVERSATION_TERMINAL_INTEGRATION_SOURCE_SAFETY_VERDICT,
  V40_CONVERSATION_TERMINAL_SURFACE_IDS,
  V40_CONVERSATION_TERMINAL_VERDICTS,
  buildV40ConversationTerminalIntegration,
} from '../src/canonical/v40-conversation-terminal-integration.js';

test('V40 Conversation and product integration coverage closes cross-surface handoff and logs', () => {
  const report = buildV40ConversationTerminalIntegration();

  assert.equal(
    V40_CONVERSATION_TERMINAL_INTEGRATION_ARTIFACT_PATH,
    '.proofs/v40/conversation-terminal-integration.json',
  );
  assert.equal(report.artifactId, 'v40-conversation-terminal-integration');
  assert.equal(report.schemaId, V40_CONVERSATION_TERMINAL_INTEGRATION_SCHEMA_ID);
  assert.equal(report.version, 'V40');
  assert.equal(report.currentTarget, 'V39');
  assert.equal(report.sourceSafetyVerdict, V40_CONVERSATION_TERMINAL_INTEGRATION_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.surfaceIds, [...V40_CONVERSATION_TERMINAL_SURFACE_IDS]);
  assert.deepEqual(report.verdictIds, [...V40_CONVERSATION_TERMINAL_VERDICTS]);
  assert.equal(report.rows.length, V40_CONVERSATION_TERMINAL_INTEGRATION_ROWS.length);
  assert.equal(report.coverage.rowCount, 8);
  assert.equal(report.coverage.surfaceCount, 8);
  assert.equal(report.coverage.coveredRowCount, 8);
  assert.equal(report.coverage.missingRowCount, 0);
  assert.equal(report.coverage.blockedRowCount, 0);
  assert.equal(report.coverage.exemptRowCount, 0);
  assert.equal(report.coverage.allCriticalSurfacesClosed, true);
  assert.deepEqual(report.coverage.expectedTotals, { ...V40_CONVERSATION_TERMINAL_EXPECTED_TOTALS });
  assert.equal(report.coverage.terminalHandoffRouteCoverageClosed, true);
  assert.equal(report.coverage.conversationStreamLogCoverageClosed, true);
  assert.equal(report.coverage.conversationRouteApiCoverageClosed, true);
  assert.equal(report.coverage.writingSourceSelectorCoverageClosed, true);
  assert.equal(report.coverage.terminalReadingStateCoverageClosed, true);
  assert.equal(report.coverage.terminalHarnessLogStreamCoverageClosed, true);
  assert.equal(report.coverage.terminalAuthorityBoundaryCoverageClosed, true);
  assert.equal(report.coverage.rehearsalDocsParityCoverageClosed, true);
  assert.equal(report.coverage.promptContentRewriteDeferredToV41, true);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v40-conversation-terminal-integration:'));
});

test('V40 Conversation and product integration rows remain source-safe metadata only', () => {
  for (const row of V40_CONVERSATION_TERMINAL_INTEGRATION_ROWS) {
    assert.equal(row.verdict, 'covered');
    assert.ok(row.rowRoot.startsWith('v40-conversation-terminal-integration-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_conversation_terminal_integration_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.rawModelResponseWithProtectedSourceVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.ledgerAuthorityClaimedByConversation, false);
    assert.equal(row.valueBearingMainnetRequired, false);
    assert.ok(row.forbiddenPayloadClasses.includes('secret-values'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
    assert.ok(row.sourceRoots.length > 0);
    assert.ok(row.testPaths.length > 0);
    assert.ok(row.commandIds.length > 0);
    assert.ok(row.requiredSourceMarkers.length > 0);
    assert.ok(row.requiredTestMarkers.length > 0);
  }
});
