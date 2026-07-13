import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V44_ENTERPRISE_PRODUCT_UX_ARTIFACT_PATH,
  V44_ENTERPRISE_PRODUCT_UX_CAPABILITY_IDS,
  V44_ENTERPRISE_PRODUCT_UX_FORBIDDEN_PAYLOAD_IDS,
  V44_ENTERPRISE_PRODUCT_UX_OBJECT_IDS,
  V44_ENTERPRISE_PRODUCT_UX_ROUTE_IDS,
  V44_ENTERPRISE_PRODUCT_UX_SCHEMA_ID,
  V44_ENTERPRISE_PRODUCT_UX_SOURCE_SAFETY_VERDICT,
  buildV44EnterpriseProductUx,
} from '../src/canonical/v44-enterprise-product-ux.js';

test('V44 enterprise product UX artifact binds route polish and proof contracts', () => {
  const report = buildV44EnterpriseProductUx();

  assert.equal(V44_ENTERPRISE_PRODUCT_UX_ARTIFACT_PATH, '.bitcode/v44-enterprise-product-ux.json');
  assert.equal(report.artifactId, 'v44-enterprise-product-ux');
  assert.equal(report.schemaId, V44_ENTERPRISE_PRODUCT_UX_SCHEMA_ID);
  assert.equal(report.version, 'V44');
  assert.equal(report.currentTarget, 'V43');
  assert.equal(report.sourceSafetyVerdict, V44_ENTERPRISE_PRODUCT_UX_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v44-enterprise-product-ux:'));
  assert.deepEqual(report.objectIds, [...V44_ENTERPRISE_PRODUCT_UX_OBJECT_IDS]);
  assert.deepEqual(report.routeIds, [...V44_ENTERPRISE_PRODUCT_UX_ROUTE_IDS]);
  assert.deepEqual(report.capabilityIds, [...V44_ENTERPRISE_PRODUCT_UX_CAPABILITY_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V44_ENTERPRISE_PRODUCT_UX_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.contractRows.length, 6);
  assert.equal(report.coverage.sharedEnterpriseSummaryImplemented, true);
  assert.equal(report.coverage.sharedKeyboardNavigationImplemented, true);
  assert.equal(report.coverage.sharedExpandableProofDetailImplemented, true);
  assert.equal(report.coverage.packsEnterpriseUxImplemented, true);
  assert.equal(report.coverage.readEnterpriseUxImplemented, true);
  assert.equal(report.coverage.depositEnterpriseUxImplemented, true);
  assert.equal(report.coverage.denseEconomicTableImplemented, true);
  assert.equal(report.coverage.visualRegressionTestHooksImplemented, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawSourceTextVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.credentialsVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
  assert.equal(report.coverage.valueBearingMainnetAdmitted, false);
});
