import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  V41_PROMPTPART_PROMPT_INVENTORY_ARTIFACT_PATH,
  V41_PROMPTPART_PROMPT_INVENTORY_SOURCE_SAFETY_VERDICT,
  V41_PROMPT_INVENTORY_REQUIRED_FIELD_IDS,
  V41_PROMPT_INVENTORY_REQUIRED_SURFACE_IDS,
  buildV41PromptPartPromptInventory,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V41 PromptPart and Prompt inventory artifact', () => {
  const artifact = buildV41PromptPartPromptInventory({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.artifactId, 'v41-promptpart-prompt-inventory');
  assert.equal(artifact.schemaId, 'bitcode.v41.promptpartPromptInventory.v1');
  assert.equal(artifact.version, 'V41');
  assert.equal(artifact.currentTarget, 'V40');
  assert.equal(artifact.passed, true);
  assert.equal(artifact.artifactPath, V41_PROMPTPART_PROMPT_INVENTORY_ARTIFACT_PATH);
  assert.equal(artifact.sourceSafetyVerdict, V41_PROMPTPART_PROMPT_INVENTORY_SOURCE_SAFETY_VERDICT);
  assert.match(artifact.artifactRoot, /^v41-promptpart-prompt-inventory:[a-f0-9]{24}$/u);
});

test('catalogues raw PromptParts, composed Prompts, registry owners, and benchmark bindings', () => {
  const artifact = buildV41PromptPartPromptInventory({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.deepEqual(artifact.coverage.requiredSurfaceIds, [...V41_PROMPT_INVENTORY_REQUIRED_SURFACE_IDS]);
  assert.deepEqual(artifact.coverage.requiredFieldIds, [...V41_PROMPT_INVENTORY_REQUIRED_FIELD_IDS]);
  assert.equal(artifact.coverage.promptPartRowCount >= 1000, true);
  assert.equal(artifact.coverage.promptRowCount >= 20, true);
  assert.equal(artifact.coverage.genericPromptPartCount >= 50, true);
  assert.equal(artifact.coverage.specificPromptPartCount >= 1000, true);
  assert.equal(artifact.coverage.readingPromptRowCount >= 5, true);
  assert.equal(artifact.coverage.conversationPromptRowCount >= 1, true);
  assert.equal(artifact.coverage.toolPromptRowCount >= 5, true);
  assert.equal(artifact.coverage.promptRowsWithRegistryPaths >= 10, true);
  assert.equal(artifact.coverage.benchmarkFixtureCount >= 5, true);
  assert.equal(artifact.coverage.v38BenchmarkReportPassed, true);
  assert.equal(artifact.coverage.v40BenchmarkSmokePassed, true);
});

test('keeps inventory metadata source-safe and useful for later prompt rewrites', () => {
  const artifact = buildV41PromptPartPromptInventory({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.sourceSafety.sourceSafeMetadataOnly, true);
  assert.equal(artifact.sourceSafety.rawPromptTextSerialized, false);
  assert.equal(artifact.sourceSafety.rawProviderResponseSerialized, false);
  assert.equal(artifact.sourceSafety.credentialsSerialized, false);
  assert.equal(artifact.sourceSafety.unpaidAssetPackSourceVisible, false);
  assert.deepEqual(artifact.failures, []);

  const readNeedPromptPart = artifact.promptPartRows.find((row) =>
    row.promptFamilyIds.includes('ReadNeedComprehensionSynthesis'),
  );
  const findingFitsPrompt = artifact.promptRows.find((row) =>
    row.promptFamilyIds.includes('ReadFitsFindingSynthesis'),
  );

  assert.ok(readNeedPromptPart);
  assert.ok(findingFitsPrompt);
  assert.equal(readNeedPromptPart.rawPromptTextSerialized, false);
  assert.equal(findingFitsPrompt.rawPromptTextSerialized, false);
  assert.ok(readNeedPromptPart.benchmarkFixtureIds.length > 0);
  assert.ok(findingFitsPrompt.validationCommand.includes('check:v41-gate'));
});
