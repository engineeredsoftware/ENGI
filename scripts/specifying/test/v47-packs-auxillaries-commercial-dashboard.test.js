import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V47_AUXILLARIES_PANE_IDS,
  V47_PACKS_AUXILLARIES_DASHBOARD_ARTIFACT_PATH,
  V47_PACKS_AUXILLARIES_DASHBOARD_ROWS,
  V47_PACKS_AUXILLARIES_DASHBOARD_SCHEMA_ID,
  V47_PACKS_AUXILLARIES_DASHBOARD_SOURCE_SAFETY_VERDICT,
  V47_PACKS_AUXILLARIES_FORBIDDEN_PAYLOAD_IDS,
  V47_PACKS_DASHBOARD_ACTIVITY_TYPE_IDS,
  V47_PACKS_DASHBOARD_DETAIL_SECTION_IDS,
  V47_PACKS_DASHBOARD_STATE_FACET_IDS,
  buildV47PacksAuxillariesCommercialDashboard,
} from '../src/canonical/v47-packs-auxillaries-commercial-dashboard.js';

test('V47 packs/auxillaries commercial dashboard binds the operator launch surfaces', () => {
  const report = buildV47PacksAuxillariesCommercialDashboard();

  assert.equal(
    V47_PACKS_AUXILLARIES_DASHBOARD_ARTIFACT_PATH,
    '.bitcode/v47-packs-auxillaries-commercial-dashboard.json',
  );
  assert.equal(report.artifactId, 'v47-packs-auxillaries-commercial-dashboard');
  assert.equal(report.schemaId, V47_PACKS_AUXILLARIES_DASHBOARD_SCHEMA_ID);
  assert.equal(report.version, 'V47');
  assert.equal(report.currentTarget, 'V46');
  assert.equal(report.sourceSafetyVerdict, V47_PACKS_AUXILLARIES_DASHBOARD_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v47-packs-auxillaries-commercial-dashboard:'));
  assert.deepEqual(report.activityTypeIds, [...V47_PACKS_DASHBOARD_ACTIVITY_TYPE_IDS]);
  assert.deepEqual(report.stateFacetIds, [...V47_PACKS_DASHBOARD_STATE_FACET_IDS]);
  assert.deepEqual(report.detailSectionIds, [...V47_PACKS_DASHBOARD_DETAIL_SECTION_IDS]);
  assert.deepEqual(report.auxillariesPaneIds, [...V47_AUXILLARIES_PANE_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V47_PACKS_AUXILLARIES_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.completionRows.length, V47_PACKS_AUXILLARIES_DASHBOARD_ROWS.length);
  assert.ok(
    report.completionRows.some(
      (row) => row.rowId === 'pack-activity-master-detail' && row.route === '/packs',
    ),
  );
  assert.ok(report.completionRows.some((row) => row.rowId === 'repair-surface' && row.route === '/packs'));
  assert.ok(
    report.completionRows.some(
      (row) => row.rowId === 'auxillaries-identity-teams-wallets-histories' && row.route === '/auxillaries',
    ),
  );
});

test('V47 packs/auxillaries commercial dashboard preserves source-safe launch boundaries', () => {
  const report = buildV47PacksAuxillariesCommercialDashboard();

  assert.equal(report.passed, true);
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.equal(report.coverage.requiredPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.passedPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.masterDetailComplete, true);
  assert.equal(report.coverage.searchAndFiltersComplete, true);
  assert.equal(report.coverage.historiesReadbackComplete, true);
  assert.equal(report.coverage.rightsStateTrackingComplete, true);
  assert.equal(report.coverage.repairSurfaceComplete, true);
  assert.equal(report.coverage.auxillariesLaunchReadinessComplete, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.valueBearingMainnetEnabled, false);
});
