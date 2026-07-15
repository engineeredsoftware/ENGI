import assert from 'node:assert/strict';
import test from './era-pinned-superseded-browser-proofs.js';

import {
  V39_ENTERPRISE_READING_STEP_IDS,
  V39_ENTERPRISE_READING_UX_ROW_IDS,
  V39_ENTERPRISE_READING_UX_ROWS,
  V39_ENTERPRISE_READING_UX_STATE_ARTIFACT_PATH,
  V39_ENTERPRISE_READING_UX_STATE_SCHEMA_ID,
  V39_ENTERPRISE_READING_UX_STATE_SOURCE_SAFETY_VERDICT,
  buildV39EnterpriseReadingUxState,
} from '../src/canonical/v39-enterprise-reading-ux-state.js';

test('V39 enterprise Reading UX state report binds five stages, route state, stream logs, and proofs', () => {
  const report = buildV39EnterpriseReadingUxState();

  assert.equal(V39_ENTERPRISE_READING_UX_STATE_ARTIFACT_PATH, '.proofs/v39/enterprise-reading-ux-state.json');
  assert.equal(report.artifactId, 'v39-enterprise-reading-ux-state');
  assert.equal(report.schemaId, V39_ENTERPRISE_READING_UX_STATE_SCHEMA_ID);
  assert.equal(report.version, 'V39');
  assert.equal(report.currentTarget, 'V38');
  assert.equal(report.sourceSafetyVerdict, V39_ENTERPRISE_READING_UX_STATE_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.rowIds, [...V39_ENTERPRISE_READING_UX_ROW_IDS]);
  assert.deepEqual(report.stepIds, [...V39_ENTERPRISE_READING_STEP_IDS]);
  assert.equal(report.rows.length, V39_ENTERPRISE_READING_UX_ROWS.length);
  assert.equal(report.coverage.rowCount, 9);
  assert.equal(report.coverage.stepCount, 5);
  assert.equal(report.coverage.routeStageContractCovered, true);
  assert.equal(report.coverage.conversationHandoffCovered, true);
  assert.equal(report.coverage.terminalQueryReadbackCovered, true);
  assert.equal(report.coverage.streamLogIntegrationCovered, true);
  assert.equal(report.coverage.componentTestsCovered, true);
  assert.equal(report.coverage.browserProofWorkflowCovered, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.lowDetailDefault, true);
  assert.equal(report.coverage.expandableSourceSafeDetail, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawProtectedPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
  assert.equal(report.coverage.ledgerAuthorityClaimed, false);
  assert.equal(report.coverage.legacySourceRoots, false);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v39-enterprise-reading-ux-state:'));
});

test('V39 enterprise Reading UX rows remain source-safe metadata only', () => {
  for (const row of V39_ENTERPRISE_READING_UX_ROWS) {
    assert.ok(row.rowRoot.startsWith('v39-enterprise-reading-ux-state-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_enterprise_reading_ux_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.lowDetailDefault, true);
    assert.equal(row.expandableSourceSafeDetail, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.settlementPrivatePayloadVisible, false);
    assert.equal(row.ledgerAuthorityClaimed, false);
    assert.ok(row.forbiddenPayloadClasses.includes('protected-source-payloads'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
  }
});
