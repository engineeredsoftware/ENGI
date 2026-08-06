import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ARTIFACT_PATH,
  V41_PROMPT_PROGRAM_BENCHMARK_REPORT_DISCLOSURE_TIERS,
  V41_PROMPT_PROGRAM_BENCHMARK_REPORT_METRIC_IDS,
  V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ROWS,
  V41_PROMPT_PROGRAM_BENCHMARK_REPORT_SOURCE_SAFETY_VERDICT,
  buildV41PromptProgramBenchmarkReport,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V41 prompt-program benchmark report artifact', () => {
  const artifact = buildV41PromptProgramBenchmarkReport({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.artifactId, 'v41-prompt-program-benchmark-report');
  assert.equal(artifact.schemaId, 'bitcode.v41.promptProgramBenchmarkReport.v1');
  assert.equal(artifact.version, 'V41');
  assert.equal(artifact.currentTarget, 'V40');
  assert.equal(artifact.passed, true);
  assert.equal(artifact.artifactPath, V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ARTIFACT_PATH);
  assert.equal(artifact.sourceSafetyVerdict, V41_PROMPT_PROGRAM_BENCHMARK_REPORT_SOURCE_SAFETY_VERDICT);
  assert.match(artifact.artifactRoot, /^v41-prompt-program-benchmark-report:[a-f0-9]{24}$/u);
  assert.deepEqual(artifact.metricIds, [...V41_PROMPT_PROGRAM_BENCHMARK_REPORT_METRIC_IDS]);
  assert.deepEqual(artifact.disclosureTiers, [...V41_PROMPT_PROGRAM_BENCHMARK_REPORT_DISCLOSURE_TIERS]);
  assert.equal(artifact.rows.length, V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ROWS.length);
});

test('binds V38, V40, and V41 prompt benchmark and telemetry dependencies', () => {
  const artifact = buildV41PromptProgramBenchmarkReport({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(artifact.coverage.rowCount, 9);
  assert.equal(artifact.coverage.metricCount, V41_PROMPT_PROGRAM_BENCHMARK_REPORT_METRIC_IDS.length);
  assert.equal(artifact.coverage.promptProgramArtifactCount >= 10, true);
  assert.equal(artifact.coverage.telemetryReceiptCount >= 20, true);
  assert.equal(artifact.coverage.sourceRootPresentCount, artifact.coverage.sourceRootCount);
  assert.equal(artifact.coverage.passedPredicateCount, artifact.coverage.requiredPredicateCount);
  assert.deepEqual(artifact.coverage.failedPredicateIds, []);
  assert.deepEqual(artifact.coverage.failingRowIds, []);
  assert.equal(artifact.coverage.dependenciesPassing, true);
  assert.equal(artifact.coverage.v38PromptBenchmarkRowCount >= 7, true);
  assert.equal(artifact.coverage.v38InferenceTelemetryLevelCount >= 13, true);
  assert.equal(artifact.coverage.v41ReadingBenchmarkBaselineRowCount >= 10, true);
  assert.equal(artifact.coverage.v41ReadNeedHardeningRowCount >= 7, true);
  assert.equal(artifact.coverage.v41ReadFitsFindingHardeningRowCount >= 8, true);
  assert.equal(artifact.coverage.v41ConversationToolInterfaceRowCount >= 9, true);
});

test('keeps benchmark telemetry disclosure source-safe', () => {
  const artifact = buildV41PromptProgramBenchmarkReport({
    generatedAt: '2026-05-26T00:00:00.000Z',
    repoRoot,
  });

  assert.match(artifact.dependencyRoots.v38PromptBenchmarkReportRoot, /^v38-prompt-benchmark-report:[a-f0-9]{24}$/u);
  assert.match(
    artifact.dependencyRoots.v38InferenceTelemetryDisclosureRoot,
    /^v38-inference-telemetry-disclosure-report:[a-f0-9]{24}$/u,
  );
  assert.match(artifact.dependencyRoots.v38PtrrFailsafeThricifiedStackRoot, /^v38-ptrr-failsafe-thricified-stack:[a-f0-9]{24}$/u);
  assert.match(
    artifact.dependencyRoots.v38ReadFitsFindingSearchEmbeddingsRoot,
    /^v38-read-fits-finding-search:[a-f0-9]{24}$/u,
  );
  assert.match(
    artifact.dependencyRoots.v39OperationalTelemetryRepairReadbackRoot,
    /^v39-operational-telemetry-repair-readback:[a-f0-9]{24}$/u,
  );
  assert.match(artifact.dependencyRoots.v40PromptBenchmarkSmokeRoot, /^v40-prompt-benchmark-smoke-v41-readiness:[a-f0-9]{24}$/u);
  assert.match(artifact.dependencyRoots.gate2InventoryRoot, /^v41-promptpart-prompt-inventory:[a-f0-9]{24}$/u);
  assert.match(artifact.dependencyRoots.gate3RegistryInterpolationRoot, /^v41-registry-interpolation-contract:[a-f0-9]{24}$/u);
  assert.match(
    artifact.dependencyRoots.gate4ReadingPromptBenchmarkBaselineRoot,
    /^v41-reading-prompt-benchmark-baselines:[a-f0-9]{24}$/u,
  );
  assert.match(artifact.dependencyRoots.gate5ReadNeedPromptHardeningRoot, /^v41-readneed-prompt-hardening:[a-f0-9]{24}$/u);
  assert.match(artifact.dependencyRoots.gate6ReadFitsFindingPromptHardeningRoot, /^v41-readfitsfinding-prompt-hardening:[a-f0-9]{24}$/u);
  assert.match(
    artifact.dependencyRoots.gate7ConversationToolInterfacePromptRewriteRoot,
    /^v41-conversation-tool-interface-prompt-rewrite:[a-f0-9]{24}$/u,
  );

  assert.equal(artifact.sourceSafety.sourceSafeMetadataOnly, true);
  assert.equal(artifact.sourceSafety.rawPromptTextSerialized, false);
  assert.equal(artifact.sourceSafety.rawInterpolatedPromptSerialized, false);
  assert.equal(artifact.sourceSafety.rawProviderResponseSerialized, false);
  assert.equal(artifact.sourceSafety.protectedPromptSerialized, false);
  assert.equal(artifact.sourceSafety.protectedSourceVisible, false);
  assert.equal(artifact.sourceSafety.privateContextSerialized, false);
  assert.equal(artifact.sourceSafety.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.sourceSafety.credentialsSerialized, false);
  assert.equal(artifact.sourceSafety.walletPrivateMaterialVisible, false);
  assert.equal(artifact.sourceSafety.settlementPrivatePayloadVisible, false);

  for (const row of artifact.rows) {
    assert.match(row.rowRoot, /^v41-prompt-program-benchmark-report-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafetyClass, 'source_safe_prompt_program_benchmark_telemetry_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.rawPromptTextSerialized, false);
    assert.equal(row.rawInterpolatedPromptSerialized, false);
    assert.equal(row.rawProviderResponseSerialized, false);
    assert.equal(row.protectedPromptSerialized, false);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.privateContextSerialized, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.settlementPrivatePayloadVisible, false);
    assert.equal(row.passed, true);
  }
});
