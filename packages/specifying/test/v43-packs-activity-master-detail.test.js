import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V43_PACKS_ACTIVITY_MASTER_DETAIL_ARTIFACT_PATH,
  V43_PACKS_ACTIVITY_MASTER_DETAIL_SCHEMA_ID,
  V43_PACKS_ACTIVITY_MASTER_DETAIL_SOURCE_SAFETY_VERDICT,
  V43_PACK_ACTIVITY_DETAIL_SECTION_IDS,
  V43_PACK_ACTIVITY_FILTER_IDS,
  V43_PACK_ACTIVITY_SEARCH_FIELD_IDS,
  V43_PACK_ACTIVITY_SORT_IDS,
  V43_PACK_ACTIVITY_TYPE_IDS,
  buildV43PacksActivityMasterDetail,
} from '../src/canonical/v43-packs-activity-master-detail.js';

test('V43 packs activity master-detail artifact binds source-safe route/API/UI contracts', () => {
  const report = buildV43PacksActivityMasterDetail();

  assert.equal(V43_PACKS_ACTIVITY_MASTER_DETAIL_ARTIFACT_PATH, '.bitcode/v43-packs-activity-master-detail.json');
  assert.equal(report.artifactId, 'v43-packs-activity-master-detail');
  assert.equal(report.schemaId, V43_PACKS_ACTIVITY_MASTER_DETAIL_SCHEMA_ID);
  assert.equal(report.version, 'V43');
  assert.equal(report.currentTarget, 'V42');
  assert.equal(report.sourceSafetyVerdict, V43_PACKS_ACTIVITY_MASTER_DETAIL_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v43-packs-activity-master-detail:'));
  assert.deepEqual(report.typeIds, [...V43_PACK_ACTIVITY_TYPE_IDS]);
  assert.deepEqual(report.searchFieldIds, [...V43_PACK_ACTIVITY_SEARCH_FIELD_IDS]);
  assert.deepEqual(report.sortIds, [...V43_PACK_ACTIVITY_SORT_IDS]);
  assert.deepEqual(report.filterIds, [...V43_PACK_ACTIVITY_FILTER_IDS]);
  assert.deepEqual(report.detailSectionIds, [...V43_PACK_ACTIVITY_DETAIL_SECTION_IDS]);
  assert.equal(report.contractRows.length, 4);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawPromptVisible, false);
  assert.equal(report.coverage.interpolatedPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.packActivityContractsImplemented, true);
  assert.equal(report.coverage.packsActivityApiImplemented, true);
});
