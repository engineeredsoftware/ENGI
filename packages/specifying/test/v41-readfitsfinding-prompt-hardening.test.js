import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  V41_READFITSFINDING_PROMPT_HARDENING_ARTIFACT_PATH,
  V41_READFITSFINDING_PROMPT_HARDENING_DISCLOSURE_TIERS,
  V41_READFITSFINDING_PROMPT_HARDENING_METRIC_IDS,
  V41_READFITSFINDING_PROMPT_HARDENING_SOURCE_SAFETY_VERDICT,
  buildV41ReadFitsFindingPromptHardening,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V41 ReadFitsFinding prompt hardening artifact', () => {
  const artifact = buildV41ReadFitsFindingPromptHardening({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.artifactId, 'v41-readfitsfinding-prompt-hardening');
  assert.equal(artifact.schemaId, 'bitcode.v41.readFitsFindingPromptHardening.v1');
  assert.equal(artifact.version, 'V41');
  assert.equal(artifact.currentTarget, 'V40');
  assert.equal(artifact.passed, true);
  assert.equal(artifact.artifactPath, V41_READFITSFINDING_PROMPT_HARDENING_ARTIFACT_PATH);
  assert.equal(artifact.sourceSafetyVerdict, V41_READFITSFINDING_PROMPT_HARDENING_SOURCE_SAFETY_VERDICT);
  assert.match(artifact.artifactRoot, /^v41-readfitsfinding-prompt-hardening:[a-f0-9]{24}$/u);
  assert.deepEqual(artifact.metricIds, [...V41_READFITSFINDING_PROMPT_HARDENING_METRIC_IDS]);
  assert.deepEqual(artifact.disclosureTiers, [...V41_READFITSFINDING_PROMPT_HARDENING_DISCLOSURE_TIERS]);
});

test('covers search breadth, selected-fit provenance, AssetPack context, and settlement boundaries', () => {
  const artifact = buildV41ReadFitsFindingPromptHardening({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.coverage.rowCount, 8);
  assert.equal(artifact.coverage.promptSurfaceCount >= 12, true);
  assert.equal(artifact.coverage.parserTargetCount >= 15, true);
  assert.equal(artifact.coverage.benchmarkFixtureCount >= 4, true);
  assert.equal(artifact.coverage.sourceRootPresentCount, artifact.coverage.sourceRootCount);
  assert.equal(artifact.coverage.passedPredicateCount, artifact.coverage.requiredPredicateCount);
  assert.deepEqual(artifact.coverage.failedPredicateIds, []);
  assert.deepEqual(artifact.coverage.failingRowIds, []);
  assert.equal(artifact.coverage.hardeningScoreMinimum, 1);
  assert.equal(artifact.coverage.readFitsInventoryPromptPartRowCount > 0, true);
  assert.equal(artifact.coverage.readFitsInventoryPromptRowCount > 0, true);
  assert.equal(artifact.coverage.gate4ReadFitsBaselineRowCount >= 7, true);
  assert.equal(artifact.coverage.gate5ReadNeedHardeningRowCount, 7);
});

test('binds Gate 2 through Gate 5 dependencies and keeps payloads source-safe', () => {
  const artifact = buildV41ReadFitsFindingPromptHardening({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.match(artifact.dependencyRoots.gate2InventoryRoot, /^v41-promptpart-prompt-inventory:[a-f0-9]{24}$/u);
  assert.match(artifact.dependencyRoots.gate3RegistryInterpolationRoot, /^v41-registry-interpolation-contract:[a-f0-9]{24}$/u);
  assert.match(artifact.dependencyRoots.gate4ReadingPromptBenchmarkBaselineRoot, /^v41-reading-prompt-benchmark-baselines:[a-f0-9]{24}$/u);
  assert.match(artifact.dependencyRoots.gate5ReadNeedPromptHardeningRoot, /^v41-readneed-prompt-hardening:[a-f0-9]{24}$/u);
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
    assert.match(row.rowRoot, /^v41-readfitsfinding-prompt-hardening-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafetyClass, 'source_safe_readfitsfinding_prompt_hardening_metadata');
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
