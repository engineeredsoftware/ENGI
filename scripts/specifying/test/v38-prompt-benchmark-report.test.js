import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  V38_PROMPT_BENCHMARK_DISCLOSURE_TIER_IDS,
  V38_PROMPT_BENCHMARK_METRIC_IDS,
  V38_PROMPT_BENCHMARK_REPORT_ARTIFACT_PATH,
  V38_PROMPT_BENCHMARK_REPORT_SOURCE_SAFETY_VERDICT,
  V38_PROMPT_BENCHMARK_ROWS,
  V38_PROMPT_BENCHMARK_SUBJECT_KIND_IDS,
  buildV38PromptBenchmarkReport,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V38 PromptPart and Prompt benchmark report', () => {
  const report = buildV38PromptBenchmarkReport({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v38-prompt-benchmark-report');
  assert.equal(report.schemaId, 'bitcode.v38.promptBenchmarkReport.v1');
  assert.equal(report.version, 'V38');
  assert.equal(report.currentTarget, 'V37');
  assert.equal(report.passed, true);
  assert.equal(report.artifactPath, V38_PROMPT_BENCHMARK_REPORT_ARTIFACT_PATH);
  assert.equal(report.sourceSafetyVerdict, V38_PROMPT_BENCHMARK_REPORT_SOURCE_SAFETY_VERDICT);
  assert.deepEqual(report.subjectKindIds, [...V38_PROMPT_BENCHMARK_SUBJECT_KIND_IDS]);
  assert.deepEqual(report.metricIds, [...V38_PROMPT_BENCHMARK_METRIC_IDS]);
  assert.deepEqual(report.disclosureTierIds, [...V38_PROMPT_BENCHMARK_DISCLOSURE_TIER_IDS]);
  assert.equal(report.rows.length, V38_PROMPT_BENCHMARK_ROWS.length);
  assert.equal(report.failures.length, 0);
  assert.match(report.artifactRoot, /^v38-prompt-benchmark-report:[a-f0-9]{24}$/u);
});

test('covers active Reading, Conversation, and tool-definition benchmark suites', () => {
  const report = buildV38PromptBenchmarkReport({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.coverage.rowCount, 7);
  assert.equal(report.coverage.promptPartSuiteCount, 3);
  assert.equal(report.coverage.completePromptSuiteCount, 3);
  assert.equal(report.coverage.benchmarkInfrastructureSuiteCount, 1);
  assert.equal(report.coverage.fixtureCount >= 12, true);
  assert.equal(report.coverage.expectedTypedOutputQualityCount >= 24, true);
  assert.equal(report.coverage.gate2InventoryRoot.length > 0, true);
  assert.equal(report.coverage.gate3StackRoot.length > 0, true);

  const rowIds = report.rows.map((row) => row.rowId);
  for (const requiredRowId of [
    'benchmark:runner-and-doc-comment-infrastructure',
    'promptpart:generic-ptrr-failsafe-thricified-foundation',
    'promptpart:read-need-comprehension-specific',
    'promptpart:read-fits-finding-specific',
    'prompt:reading-pipeline-agent-prompts',
    'prompt:conversation-system-prompt',
    'prompt:tool-definition-doc-code-prompts',
  ]) {
    assert.equal(rowIds.includes(requiredRowId), true, `missing ${requiredRowId}`);
  }
});

test('proves source metadata and benchmark predicates without serializing protected prompt payloads', () => {
  const report = buildV38PromptBenchmarkReport({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.coverage.requiredPredicateCount, report.coverage.passedPredicateCount);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.equal(report.coverage.promptPartDocCommentCount > 0, true);
  assert.equal(report.coverage.promptDocCommentCount > 0, true);
  assert.equal(report.coverage.benchmarkDefinitionCount > 0, true);
  assert.equal(report.coverage.promptPartExportCount > 0, true);
  assert.equal(report.coverage.promptConstructionCount > 0, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.legacySourceRoots, false);

  for (const row of report.rows) {
    assert.match(row.rowRoot, /^v38-prompt-benchmark-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafetyClass, 'source_safe_prompt_benchmark_metadata');
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawPromptTextSerialized, false);
    assert.equal(row.rawProviderResponseSerialized, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.sourceRootsPresent, true);
    assert.equal(Array.isArray(row.fixtureInputs), true);
    assert.equal(row.fixtureInputs.every((fixture) => /^v38-prompt-benchmark-fixture:[a-f0-9]{24}$/u.test(fixture.fixtureRoot)), true);
  }

  const predicateIds = report.sourcePredicateResults.map((result) => result.id);
  for (const requiredPredicateId of [
    'benchmark.runner-defines-promptpart-benchmark',
    'benchmark.runner-defines-complete-prompt-benchmark',
    'promptpart.read-need-contract-names-pipeline',
    'promptpart.read-fits-depository-search-names-tools',
    'prompt.reading-contract-has-template-ids',
    'prompt.conversation-requires-hierarchy',
    'prompt.tool-format-usable-tools-present',
  ]) {
    assert.equal(predicateIds.includes(requiredPredicateId), true, `missing ${requiredPredicateId}`);
  }
});
