import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';

import {
  V39_OPERATIONAL_TELEMETRY_EVENT_KIND_IDS,
  V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ARTIFACT_PATH,
  V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ROW_IDS,
  V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ROWS,
  V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_SCHEMA_ID,
  V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_SOURCE_SAFETY_VERDICT,
  buildV39OperationalTelemetryRepairReadback,
} from '../src/canonical/v39-operational-telemetry-repair-readback.js';

test('V39 operational telemetry repair readback report binds stream, repair, UI, and proof roots', () => {
  const report = buildV39OperationalTelemetryRepairReadback();

  assert.equal(V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ARTIFACT_PATH, '.bitcode/v39-operational-telemetry-repair-readback.json');
  assert.equal(report.artifactId, 'v39-operational-telemetry-repair-readback');
  assert.equal(report.schemaId, V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_SCHEMA_ID);
  assert.equal(report.version, 'V39');
  assert.equal(report.currentTarget, 'V38');
  assert.equal(report.sourceSafetyVerdict, V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.eventKindIds, [...V39_OPERATIONAL_TELEMETRY_EVENT_KIND_IDS]);
  assert.deepEqual(report.rowIds, [...V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ROW_IDS]);
  assert.equal(report.rows.length, V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ROWS.length);
  assert.equal(report.coverage.rowCount, 10);
  assert.equal(report.coverage.runtimeType, 'ReadingOperationalTelemetryRepairReadback');
  assert.equal(report.coverage.operatorReadbackType, 'ReadingOperationalOperatorReadback');
  assert.equal(report.coverage.eventType, 'ReadingOperationalTelemetryEvent');
  assert.ok(report.coverage.eventKindIds.includes('thricified-generation'));
  assert.ok(report.coverage.eventKindIds.includes('wallet'));
  assert.ok(report.coverage.requiredRunbookHooks.includes('open-rich-execution-log'));
  assert.ok(report.coverage.requiredRunbookHooks.includes('observe-btc-payment-finality'));
  assert.equal(report.coverage.streamEventKindsCovered, true);
  assert.equal(report.coverage.repairFinalityCovered, true);
  assert.equal(report.coverage.persistenceCovered, true);
  assert.equal(report.coverage.richLogCovered, true);
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.ok(report.artifactRoot.startsWith('v39-operational-telemetry-repair-readback:'));
});

test('V39 operational telemetry rows remain source-safe metadata only', () => {
  for (const row of V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ROWS) {
    assert.ok(row.rowRoot.startsWith('v39-operational-telemetry-repair-readback-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_reading_operational_telemetry_repair_readback_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourcePayloadSerialized, false);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.rawInterpolatedPromptVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.settlementPrivatePayloadVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.ok(row.forbiddenPayloadClasses.includes('protected-source-payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('raw-interpolated-prompts'));
    assert.ok(row.forbiddenPayloadClasses.includes('wallet-private-material'));
  }
});
