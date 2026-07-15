import assert from 'node:assert/strict';
import test from './era-pinned-superseded-browser-proofs.js';

import {
  V40_BROWSER_E2E_VISUAL_EXPECTED_TOTALS,
  V40_BROWSER_E2E_VISUAL_PROOF_ARTIFACT_PATH,
  V40_BROWSER_E2E_VISUAL_PROOF_SCHEMA_ID,
  V40_BROWSER_E2E_VISUAL_PROOF_SOURCE_SAFETY_VERDICT,
  V40_BROWSER_E2E_VISUAL_ROWS,
  V40_BROWSER_E2E_VISUAL_SURFACE_IDS,
  V40_BROWSER_E2E_VISUAL_VERDICTS,
  buildV40BrowserE2eVisualProof,
} from '../src/canonical/v40-browser-e2e-visual-proof.js';

test('V40 browser E2E visual proof closes product surface browser coverage', () => {
  const report = buildV40BrowserE2eVisualProof();

  assert.equal(V40_BROWSER_E2E_VISUAL_PROOF_ARTIFACT_PATH, '.bitcode/v40-browser-e2e-visual-proof.json');
  assert.equal(report.artifactId, 'v40-browser-e2e-visual-proof');
  assert.equal(report.schemaId, V40_BROWSER_E2E_VISUAL_PROOF_SCHEMA_ID);
  assert.equal(report.version, 'V40');
  assert.equal(report.currentTarget, 'V39');
  assert.equal(report.sourceSafetyVerdict, V40_BROWSER_E2E_VISUAL_PROOF_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.surfaceIds, [...V40_BROWSER_E2E_VISUAL_SURFACE_IDS]);
  assert.deepEqual(report.verdictIds, [...V40_BROWSER_E2E_VISUAL_VERDICTS]);
  assert.equal(report.rows.length, V40_BROWSER_E2E_VISUAL_ROWS.length);
  assert.equal(report.coverage.rowCount, 8);
  assert.equal(report.coverage.coveredRowCount, 8);
  assert.equal(report.coverage.missingRowCount, 0);
  assert.equal(report.coverage.blockedRowCount, 0);
  assert.equal(report.coverage.exemptRowCount, 0);
  assert.equal(report.coverage.allCriticalSurfacesClosed, true);
  assert.deepEqual(report.coverage.expectedTotals, { ...V40_BROWSER_E2E_VISUAL_EXPECTED_TOTALS });
  assert.equal(report.coverage.terminalBrowserFlowCoverageClosed, true);
  assert.equal(report.coverage.conversationBrowserFlowCoverageClosed, true);
  assert.equal(report.coverage.auxillariesBrowserFlowCoverageClosed, true);
  assert.equal(report.coverage.exchangeBrowserFlowCoverageClosed, true);
  assert.equal(report.coverage.docsBrowserFlowCoverageClosed, true);
  assert.equal(report.coverage.responsiveViewportCoverageClosed, true);
  assert.equal(report.coverage.visualBaselineCoverageClosed, true);
  assert.equal(report.coverage.accessibilityCoverageClosed, true);
  assert.equal(report.coverage.screenshotOnlyApproval, false);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v40-browser-e2e-visual-proof:'));
});

test('V40 browser E2E visual rows remain source-safe metadata only', () => {
  for (const row of V40_BROWSER_E2E_VISUAL_ROWS) {
    assert.equal(row.verdict, 'covered');
    assert.ok(row.rowRoot.startsWith('v40-browser-e2e-visual-proof-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_browser_e2e_visual_proof_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.rawModelResponseWithProtectedSourceVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.screenshotOnlyApproval, false);
    assert.equal(row.valueBearingMainnetRequired, false);
    assert.ok(row.forbiddenPayloadClasses.includes('secret-values'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
    assert.ok(row.sourceRoots.length > 0);
    assert.ok(row.testPaths.length > 0);
    assert.ok(row.commandIds.length > 0);
    assert.ok(row.requiredSourceMarkers.length > 0);
    assert.ok(row.requiredTestMarkers.length > 0);
  }
});
