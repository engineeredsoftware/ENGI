import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_ARTIFACT_PATH,
  V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_DISCLOSURE_TIERS,
  V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_METRIC_IDS,
  V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_ROWS,
  V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_SOURCE_SAFETY_VERDICT,
  buildV41ConversationToolInterfacePromptRewrite,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V41 Conversation tool interface prompt rewrite artifact', () => {
  const artifact = buildV41ConversationToolInterfacePromptRewrite({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.artifactId, 'v41-conversation-tool-interface-prompt-rewrite');
  assert.equal(artifact.schemaId, 'bitcode.v41.conversationToolInterfacePromptRewrite.v1');
  assert.equal(artifact.version, 'V41');
  assert.equal(artifact.currentTarget, 'V40');
  assert.equal(artifact.passed, true);
  assert.equal(artifact.artifactPath, V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_ARTIFACT_PATH);
  assert.equal(artifact.sourceSafetyVerdict, V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_SOURCE_SAFETY_VERDICT);
  assert.match(artifact.artifactRoot, /^v41-conversation-tool-interface-prompt-rewrite:[a-f0-9]{24}$/u);
  assert.deepEqual(artifact.metricIds, [...V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_METRIC_IDS]);
  assert.deepEqual(artifact.disclosureTiers, [...V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_DISCLOSURE_TIERS]);
  assert.equal(artifact.rows.length, V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_ROWS.length);
});

test('covers Conversation, tool-definition, MCP, ChatGPT, product, and public API prompt surfaces', () => {
  const artifact = buildV41ConversationToolInterfacePromptRewrite({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.coverage.rowCount, 9);
  assert.equal(artifact.coverage.promptSurfaceCount >= 20, true);
  assert.equal(artifact.coverage.parserTargetCount >= 18, true);
  assert.equal(artifact.coverage.benchmarkFixtureCount >= 9, true);
  assert.equal(artifact.coverage.metricCount, V41_CONVERSATION_TOOL_INTERFACE_PROMPT_REWRITE_METRIC_IDS.length);
  assert.equal(artifact.coverage.sourceRootPresentCount, artifact.coverage.sourceRootCount);
  assert.equal(artifact.coverage.passedPredicateCount, artifact.coverage.requiredPredicateCount);
  assert.deepEqual(artifact.coverage.failedPredicateIds, []);
  assert.deepEqual(artifact.coverage.failingRowIds, []);
  assert.equal(artifact.coverage.hardeningScoreMinimum, 1);
  assert.equal(artifact.coverage.conversationPromptPartRowCount, 14);
  assert.equal(artifact.coverage.conversationPromptRowCount, 2);
  assert.equal(artifact.coverage.toolPromptRowCount >= 74, true);
  assert.equal(artifact.coverage.interfacePromptRowCount >= 10, true);
  assert.equal(artifact.coverage.v38ConversationToolParityPassed, true);
  assert.equal(artifact.coverage.gate6ReadFitsFindingHardeningPassed, true);
});

test('binds previous prompt-program dependencies and keeps payloads source-safe', () => {
  const artifact = buildV41ConversationToolInterfacePromptRewrite({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.match(
    artifact.dependencyRoots.v38ConversationToolPromptInferenceParityRoot,
    /^v38-conversation-tool-prompt-inference-parity:[a-f0-9]{24}$/u,
  );
  assert.match(artifact.dependencyRoots.gate2InventoryRoot, /^v41-promptpart-prompt-inventory:[a-f0-9]{24}$/u);
  assert.match(artifact.dependencyRoots.gate3RegistryInterpolationRoot, /^v41-registry-interpolation-contract:[a-f0-9]{24}$/u);
  assert.match(artifact.dependencyRoots.gate4ReadingPromptBenchmarkBaselineRoot, /^v41-reading-prompt-benchmark-baselines:[a-f0-9]{24}$/u);
  assert.match(artifact.dependencyRoots.gate5ReadNeedPromptHardeningRoot, /^v41-readneed-prompt-hardening:[a-f0-9]{24}$/u);
  assert.match(artifact.dependencyRoots.gate6ReadFitsFindingPromptHardeningRoot, /^v41-readfitsfinding-prompt-hardening:[a-f0-9]{24}$/u);

  assert.equal(artifact.sourceSafety.sourceSafeMetadataOnly, true);
  assert.equal(artifact.sourceSafety.rawPromptTextSerialized, false);
  assert.equal(artifact.sourceSafety.rawInterpolatedPromptSerialized, false);
  assert.equal(artifact.sourceSafety.rawProviderResponseSerialized, false);
  assert.equal(artifact.sourceSafety.protectedSourceVisible, false);
  assert.equal(artifact.sourceSafety.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.sourceSafety.credentialsSerialized, false);
  assert.equal(artifact.sourceSafety.walletPrivateMaterialVisible, false);
  assert.equal(artifact.sourceSafety.settlementPrivatePayloadVisible, false);

  for (const row of artifact.rows) {
    assert.match(row.rowRoot, /^v41-conversation-tool-interface-prompt-rewrite-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafetyClass, 'source_safe_conversation_tool_interface_prompt_rewrite_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.rawPromptTextSerialized, false);
    assert.equal(row.rawInterpolatedPromptSerialized, false);
    assert.equal(row.rawProviderResponseSerialized, false);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.settlementPrivatePayloadVisible, false);
    assert.equal(row.passed, true);
    assert.equal(row.hardeningScore, 1);
  }
});
