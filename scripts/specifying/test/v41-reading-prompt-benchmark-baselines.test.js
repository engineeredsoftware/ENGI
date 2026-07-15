import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  V41_READING_PROMPT_BENCHMARK_BASELINES_ARTIFACT_PATH,
  V41_READING_PROMPT_BENCHMARK_BASELINES_SOURCE_SAFETY_VERDICT,
  V41_READING_PROMPT_BENCHMARK_DISCLOSURE_TIERS,
  V41_READING_PROMPT_BENCHMARK_METRIC_IDS,
  V41_READING_PROMPT_BENCHMARK_PIPELINE_IDS,
  buildV41ReadingPromptBenchmarkBaselines,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V41 Reading prompt benchmark baseline artifact', () => {
  const artifact = buildV41ReadingPromptBenchmarkBaselines({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.artifactId, 'v41-reading-prompt-benchmark-baselines');
  assert.equal(artifact.schemaId, 'bitcode.v41.readingPromptBenchmarkBaselines.v1');
  assert.equal(artifact.version, 'V41');
  assert.equal(artifact.currentTarget, 'V40');
  assert.equal(artifact.passed, true);
  assert.equal(artifact.artifactPath, V41_READING_PROMPT_BENCHMARK_BASELINES_ARTIFACT_PATH);
  assert.equal(artifact.sourceSafetyVerdict, V41_READING_PROMPT_BENCHMARK_BASELINES_SOURCE_SAFETY_VERDICT);
  assert.match(artifact.artifactRoot, /^v41-reading-prompt-benchmark-baselines:[a-f0-9]{24}$/u);
  assert.deepEqual(artifact.pipelineIds, [...V41_READING_PROMPT_BENCHMARK_PIPELINE_IDS]);
  assert.deepEqual(artifact.metricIds, [...V41_READING_PROMPT_BENCHMARK_METRIC_IDS]);
  assert.deepEqual(artifact.disclosureTiers, [...V41_READING_PROMPT_BENCHMARK_DISCLOSURE_TIERS]);
});

test('covers Reading UX steps, both Reading pipelines, fixtures, parser targets, and registry contracts', () => {
  const artifact = buildV41ReadingPromptBenchmarkBaselines({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.coverage.rowCount, 10);
  assert.equal(artifact.coverage.readNeedBaselineRowCount >= 3, true);
  assert.equal(artifact.coverage.readFitsBaselineRowCount >= 7, true);
  assert.equal(artifact.coverage.uxStepCount >= 5, true);
  assert.equal(artifact.coverage.benchmarkFixtureCount >= 6, true);
  assert.equal(artifact.coverage.parserTargetCount >= 20, true);
  assert.equal(artifact.coverage.registryContractCount >= 8, true);
  assert.equal(artifact.coverage.sourceRootPresentCount, artifact.coverage.sourceRootCount);
  assert.equal(artifact.coverage.passedPredicateCount, artifact.coverage.requiredPredicateCount);
  assert.deepEqual(artifact.coverage.failedPredicateIds, []);
  assert.deepEqual(artifact.coverage.failingRowIds, []);
});

test('binds Gate 2 inventory, Gate 3 contracts, and prior prompt benchmark artifacts without leaking prompt payloads', () => {
  const artifact = buildV41ReadingPromptBenchmarkBaselines({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.coverage.readNeedInventoryPromptPartRowCount > 0, true);
  assert.equal(artifact.coverage.readNeedInventoryPromptRowCount > 0, true);
  assert.equal(artifact.coverage.readFitsInventoryPromptPartRowCount > 0, true);
  assert.equal(artifact.coverage.readFitsInventoryPromptRowCount > 0, true);
  assert.match(artifact.dependencyRoots.gate2InventoryRoot, /^v41-promptpart-prompt-inventory:[a-f0-9]{24}$/u);
  assert.match(artifact.dependencyRoots.gate3RegistryInterpolationRoot, /^v41-registry-interpolation-contract:[a-f0-9]{24}$/u);
  assert.match(artifact.dependencyRoots.v38PromptBenchmarkReportRoot, /^v38-prompt-benchmark-report:[a-f0-9]{24}$/u);
  assert.match(artifact.dependencyRoots.v40PromptBenchmarkSmokeRoot, /^v40-prompt-benchmark-smoke-v41-readiness:[a-f0-9]{24}$/u);
  assert.equal(artifact.sourceSafety.sourceSafeMetadataOnly, true);
  assert.equal(artifact.sourceSafety.rawPromptTextSerialized, false);
  assert.equal(artifact.sourceSafety.rawInterpolatedPromptSerialized, false);
  assert.equal(artifact.sourceSafety.rawProviderResponseSerialized, false);
  assert.equal(artifact.sourceSafety.protectedSourceVisible, false);
  assert.equal(artifact.sourceSafety.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.sourceSafety.credentialsSerialized, false);

  for (const row of artifact.rows) {
    assert.match(row.rowRoot, /^v41-reading-prompt-baseline-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafetyClass, 'source_safe_reading_prompt_benchmark_baseline_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.rawPromptTextSerialized, false);
    assert.equal(row.rawInterpolatedPromptSerialized, false);
    assert.equal(row.rawProviderResponseSerialized, false);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.passed, true);
    assert.equal(row.baselineScore >= row.baselineThreshold, true);
  }
});
