import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_ARTIFACT_PATH,
  V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_SOURCE_SAFETY_VERDICT,
  V38_INFERENCE_TELEMETRY_DISCLOSURE_ROWS,
  V38_INFERENCE_TELEMETRY_DISCLOSURE_TIER_IDS,
  V38_INFERENCE_TELEMETRY_EVENT_KIND_IDS,
  V38_INFERENCE_TELEMETRY_REQUIRED_LEVEL_IDS,
  buildV38InferenceTelemetryDisclosureReport,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V38 inference telemetry disclosure report', () => {
  const report = buildV38InferenceTelemetryDisclosureReport({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v38-inference-telemetry-disclosure-report');
  assert.equal(report.schemaId, 'bitcode.v38.inferenceTelemetryDisclosureReport.v1');
  assert.equal(report.version, 'V38');
  assert.equal(report.currentTarget, 'V37');
  assert.equal(report.passed, true);
  assert.equal(report.artifactPath, V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_ARTIFACT_PATH);
  assert.equal(report.sourceSafetyVerdict, V38_INFERENCE_TELEMETRY_DISCLOSURE_REPORT_SOURCE_SAFETY_VERDICT);
  assert.deepEqual(report.telemetryLevelIds, [...V38_INFERENCE_TELEMETRY_REQUIRED_LEVEL_IDS]);
  assert.deepEqual(report.disclosureTierIds, [...V38_INFERENCE_TELEMETRY_DISCLOSURE_TIER_IDS]);
  assert.deepEqual(report.eventKindIds, [...V38_INFERENCE_TELEMETRY_EVENT_KIND_IDS]);
  assert.equal(report.rows.length, V38_INFERENCE_TELEMETRY_DISCLOSURE_ROWS.length);
  assert.equal(report.failures.length, 0);
  assert.match(report.artifactRoot, /^v38-inference-telemetry-disclosure-report:[a-f0-9]{24}$/u);
});

test('covers all required inference telemetry levels and disclosure tiers', () => {
  const report = buildV38InferenceTelemetryDisclosureReport({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.coverage.rowCount, 8);
  assert.equal(report.coverage.requiredTelemetryLevelCount, V38_INFERENCE_TELEMETRY_REQUIRED_LEVEL_IDS.length);
  assert.deepEqual(report.coverage.missingTelemetryLevelIds, []);
  assert.equal(report.coverage.disclosureTierCount, V38_INFERENCE_TELEMETRY_DISCLOSURE_TIER_IDS.length);
  assert.deepEqual(report.coverage.missingDisclosureTierIds, []);
  assert.deepEqual(report.coverage.missingEventKindIds, []);
  assert.equal(report.coverage.gate2InventoryRoot.startsWith('v38-inference-surface-inventory:'), true);
  assert.equal(report.coverage.gate3StackRoot.startsWith('v38-ptrr-failsafe-thricified-stack:'), true);
  assert.equal(report.coverage.gate4PromptBenchmarkRoot.startsWith('v38-prompt-benchmark-report:'), true);
  assert.equal(report.coverage.v35TelemetryTaxonomyRoot.startsWith('telemetry-taxonomy-catalog:'), true);
  assert.equal(report.coverage.v37ConversationStreamRoot.startsWith('conversation-stream-event-contract:'), true);
});

test('proves metadata-only disclosure without serializing protected inference payloads', () => {
  const report = buildV38InferenceTelemetryDisclosureReport({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.coverage.requiredPredicateCount, report.coverage.passedPredicateCount);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.promptPayloadVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.legacySourceRoots, false);
  assert.equal(report.coverage.sanitizeDeleteCount >= 4, true);
  assert.equal(report.coverage.readingTelemetryCount > 0, true);
  assert.equal(report.coverage.inferenceAuditCount > 0, true);

  for (const row of report.rows) {
    assert.match(row.rowRoot, /^v38-inference-telemetry-disclosure-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafetyClass, 'source_safe_inference_telemetry_disclosure_metadata');
    assert.equal(row.promptPayloadVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.sourceRootVisibleOnly, true);
    assert.equal(row.proofRootFields.length > 0, true);
    assert.equal(row.failClosedStates.length > 0, true);
  }
});

test('anchors stream UI, prompt interpolation, raw response roots, parsed output, and schema verdict predicates', () => {
  const report = buildV38InferenceTelemetryDisclosureReport({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const predicateIds = report.sourcePredicateResults.map((result) => result.id);

  for (const requiredPredicateId of [
    'pipeline.stream-emits-phase-events',
    'ptrr.adapter-infers-agent-events',
    'failsafe.instrumentation-logs-failsafe-events',
    'generation.source-stores-prompt-template-and-interpolated-prompt',
    'generation.source-stores-raw-and-parsed-output',
    'tool.adapter-maps-tool-results',
    'prompt.observability-records-template-and-interpolation-flags',
    'schema.observability-records-raw-and-parsed-evidence',
    'stream.terminal-harness-carries-reading-telemetry',
    'stream.v35-and-v37-catalogs-bound',
  ]) {
    assert.equal(predicateIds.includes(requiredPredicateId), true, `missing ${requiredPredicateId}`);
  }
});
