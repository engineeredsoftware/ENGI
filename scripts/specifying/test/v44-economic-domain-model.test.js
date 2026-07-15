import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V44_ECONOMIC_DOMAIN_MODEL_ARTIFACT_PATH,
  V44_ECONOMIC_DOMAIN_MODEL_SCHEMA_ID,
  V44_ECONOMIC_DOMAIN_MODEL_SOURCE_SAFETY_VERDICT,
  V44_ECONOMIC_DOMAIN_ROWS,
  V44_ECONOMIC_OBJECT_IDS,
  V44_ECONOMIC_RECEIPT_TAXONOMY_IDS,
  V44_ECONOMIC_SOURCE_SAFE_FIELD_IDS,
  V44_ECONOMIC_VALUE_LABEL_IDS,
  buildV44EconomicDomainModel,
} from '../src/canonical/v44-economic-domain-model.js';

test('V44 economic domain model binds source-safe objects, receipts, and value labels', () => {
  const report = buildV44EconomicDomainModel();

  assert.equal(V44_ECONOMIC_DOMAIN_MODEL_ARTIFACT_PATH, '.bitcode/v44-economic-domain-model.json');
  assert.equal(report.artifactId, 'v44-economic-domain-model');
  assert.equal(report.schemaId, V44_ECONOMIC_DOMAIN_MODEL_SCHEMA_ID);
  assert.equal(report.version, 'V44');
  assert.equal(report.currentTarget, 'V43');
  assert.equal(report.sourceSafetyVerdict, V44_ECONOMIC_DOMAIN_MODEL_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v44-economic-domain-model:'));
  assert.deepEqual(report.economicObjectIds, [...V44_ECONOMIC_OBJECT_IDS]);
  assert.deepEqual(report.receiptTaxonomyIds, [...V44_ECONOMIC_RECEIPT_TAXONOMY_IDS]);
  assert.deepEqual(report.valueLabelIds, [...V44_ECONOMIC_VALUE_LABEL_IDS]);
  assert.deepEqual(report.sourceSafeFieldIds, [...V44_ECONOMIC_SOURCE_SAFE_FIELD_IDS]);
  assert.equal(report.domainRows.length, V44_ECONOMIC_DOMAIN_ROWS.length);
  assert.equal(report.coverage.economicObjectsModeled, true);
  assert.equal(report.coverage.receiptTaxonomyModeled, true);
  assert.equal(report.coverage.valueLabelsComplete, true);
  assert.equal(report.coverage.portfolioPositionCovered, true);
  assert.equal(report.coverage.marketSignalsCovered, true);
  assert.equal(report.coverage.quoteStatesCovered, true);
  assert.equal(report.coverage.settlementStatesCovered, true);
  assert.equal(report.coverage.compensationStatementsCovered, true);
  assert.equal(report.coverage.governanceDecisionsCovered, true);
  assert.equal(report.coverage.repairCasesCovered, true);
  assert.equal(report.coverage.budgetPoliciesCovered, true);
  assert.equal(report.coverage.supplyOpportunitiesCovered, true);
  assert.equal(report.coverage.networkRehearsalCovered, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawPromptVisible, false);
  assert.equal(report.coverage.interpolatedPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
  assert.equal(report.coverage.valueBearingMainnetAdmitted, false);
});

test('V44 economic domain rows do not serialize protected source or value-bearing mainnet admission', () => {
  const report = buildV44EconomicDomainModel();

  for (const row of report.domainRows) {
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.valueBearingMainnetAdmitted, false);
    assert.ok(Array.isArray(row.receiptTaxonomyIds));
    assert.ok(row.receiptTaxonomyIds.length > 0);
    assert.ok(Array.isArray(row.valueLabelIds));
    assert.ok(row.valueLabelIds.length > 0);
    assert.ok(Array.isArray(row.privateFieldsNeverSerialized));
    assert.ok(row.privateFieldsNeverSerialized.length > 0);
  }
});
