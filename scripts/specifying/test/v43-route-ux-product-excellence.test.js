import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V43_ROUTE_UX_FIELD_IDS,
  V43_ROUTE_UX_FORBIDDEN_PAYLOAD_IDS,
  V43_ROUTE_UX_OBJECT_IDS,
  V43_ROUTE_UX_PRODUCT_EXCELLENCE_ARTIFACT_PATH,
  V43_ROUTE_UX_PRODUCT_EXCELLENCE_SCHEMA_ID,
  V43_ROUTE_UX_PRODUCT_EXCELLENCE_SOURCE_SAFETY_VERDICT,
  buildV43RouteUxProductExcellence,
} from '../src/canonical/v43-route-ux-product-excellence.js';

test('V43 route UX product excellence artifact binds shared route polish contracts', () => {
  const report = buildV43RouteUxProductExcellence();

  assert.equal(V43_ROUTE_UX_PRODUCT_EXCELLENCE_ARTIFACT_PATH, '.bitcode/v43-route-ux-product-excellence.json');
  assert.equal(report.artifactId, 'v43-route-ux-product-excellence');
  assert.equal(report.schemaId, V43_ROUTE_UX_PRODUCT_EXCELLENCE_SCHEMA_ID);
  assert.equal(report.version, 'V43');
  assert.equal(report.currentTarget, 'V42');
  assert.equal(report.sourceSafetyVerdict, V43_ROUTE_UX_PRODUCT_EXCELLENCE_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v43-route-ux-product-excellence:'));
  assert.deepEqual(report.objectIds, [...V43_ROUTE_UX_OBJECT_IDS]);
  assert.deepEqual(report.fieldIds, [...V43_ROUTE_UX_FIELD_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V43_ROUTE_UX_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.contractRows.length, 5);
  assert.equal(report.coverage.sharedRouteShellImplemented, true);
  assert.equal(report.coverage.sharedStepGridImplemented, true);
  assert.equal(report.coverage.keyboardCurrentStepImplemented, true);
  assert.equal(report.coverage.productRouteStatePanelsImplemented, true);
  assert.equal(report.coverage.loadingEmptyErrorStatesImplemented, true);
  assert.equal(report.coverage.progressiveDisclosureImplemented, true);
  assert.equal(report.coverage.packsRouteUsesSharedShell, true);
  assert.equal(report.coverage.readRouteUsesSharedShell, true);
  assert.equal(report.coverage.depositRouteUsesSharedShell, true);
  assert.equal(report.coverage.selfReferentialProductCopyReduced, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawSourceTextVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
});
