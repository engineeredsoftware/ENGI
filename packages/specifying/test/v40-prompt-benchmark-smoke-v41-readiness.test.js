import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  V40_PROMPT_BENCHMARK_SMOKE_COMMAND_IDS,
  V40_PROMPT_BENCHMARK_SMOKE_EXPECTED_TOTALS,
  V40_PROMPT_BENCHMARK_SMOKE_ROW_IDS,
  V40_PROMPT_BENCHMARK_SMOKE_ROWS,
  V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_ARTIFACT_PATH,
  V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_SOURCE_SAFETY_VERDICT,
  V40_PROMPT_BENCHMARK_SMOKE_V41_WORK_ITEM_IDS,
  buildV40PromptBenchmarkSmokeV41Readiness,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V40 prompt benchmark smoke and V41 readiness artifact', () => {
  const artifact = buildV40PromptBenchmarkSmokeV41Readiness({
    generatedAt: '2026-05-25T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.artifactId, 'v40-prompt-benchmark-smoke-v41-readiness');
  assert.equal(artifact.schemaId, 'bitcode.v40.promptBenchmarkSmokeV41Readiness.v1');
  assert.equal(artifact.version, 'V40');
  assert.equal(artifact.currentTarget, 'V39');
  assert.equal(artifact.passed, true);
  assert.equal(artifact.artifactPath, V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_ARTIFACT_PATH);
  assert.equal(artifact.sourceSafetyVerdict, V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_SOURCE_SAFETY_VERDICT);
  assert.equal(artifact.coverage.rowCount, V40_PROMPT_BENCHMARK_SMOKE_EXPECTED_TOTALS.rowCount);
  assert.equal(artifact.rows.length, V40_PROMPT_BENCHMARK_SMOKE_ROWS.length);
  assert.match(artifact.artifactRoot, /^v40-prompt-benchmark-smoke-v41-readiness:[a-f0-9]{24}$/u);
});

test('binds benchmark smoke rows, commands, V38 inventory, and V41 prompt-program worklist', () => {
  const artifact = buildV40PromptBenchmarkSmokeV41Readiness({
    generatedAt: '2026-05-25T00:00:00.000Z',
    repoRoot,
  });

  assert.deepEqual(artifact.rows.map((row) => row.rowId), [...V40_PROMPT_BENCHMARK_SMOKE_ROW_IDS]);
  assert.deepEqual(artifact.coverage.commandIds, [...V40_PROMPT_BENCHMARK_SMOKE_COMMAND_IDS]);
  assert.equal(artifact.coverage.v38BenchmarkReportPassed, true);
  assert.equal(artifact.coverage.v38BenchmarkSourceSafeMetadataOnly, true);
  assert.equal(artifact.coverage.v38BenchmarkRowCount >= 7, true);
  assert.equal(artifact.coverage.v38BenchmarkFixtureCount >= 12, true);
  assert.deepEqual(artifact.coverage.v41WorkItemIds, [...V40_PROMPT_BENCHMARK_SMOKE_V41_WORK_ITEM_IDS]);
  assert.equal(artifact.coverage.v41WorkItemCount, V40_PROMPT_BENCHMARK_SMOKE_EXPECTED_TOTALS.v41WorkItemCount);
});

test('keeps prompt benchmark smoke metadata source-safe and non-mutating', () => {
  const artifact = buildV40PromptBenchmarkSmokeV41Readiness({
    generatedAt: '2026-05-25T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.sourceSafety.sourceSafeMetadataOnly, true);
  assert.equal(artifact.sourceSafety.protectedSourceVisible, false);
  assert.equal(artifact.sourceSafety.rawPromptTextSerialized, false);
  assert.equal(artifact.sourceSafety.rawProviderResponseSerialized, false);
  assert.equal(artifact.sourceSafety.credentialsSerialized, false);
  assert.equal(artifact.sourceSafety.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.sourceSafety.promptContentRewriteAllowedInV40, false);
  assert.deepEqual(artifact.coverage.failedPredicateIds, []);

  for (const row of artifact.rows) {
    assert.match(row.rowRoot, /^v40-prompt-benchmark-smoke-row:[a-f0-9]{24}$/u);
    assert.equal(row.rawPromptTextSerialized, false);
    assert.equal(row.rawProviderResponseSerialized, false);
    assert.equal(row.promptContentRewriteAllowedInV40, false);
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.sourceRootsPresent, true);
  }
});
