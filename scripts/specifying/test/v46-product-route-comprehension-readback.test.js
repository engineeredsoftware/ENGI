import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';
import {
  V46_PRODUCT_ROUTE_CAPABILITY_IDS,
  V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_ARTIFACT_PATH,
  V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_SCHEMA_ID,
  V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_SOURCE_SAFETY_VERDICT,
  V46_PRODUCT_ROUTE_IDS,
  V46_PRODUCT_ROUTE_PATHS,
  V46_PRODUCT_ROUTE_READBACK_ROWS,
  buildV46ProductRouteComprehensionReadback,
} from '../src/canonical/v46-product-route-comprehension-readback.js';

test('V46 product route comprehension readback binds packs, read, and deposit routes', () => {
  const report = buildV46ProductRouteComprehensionReadback();

  assert.equal(V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_ARTIFACT_PATH, '.proofs/v46/product-route-comprehension-readback.json');
  assert.equal(report.artifactId, 'v46-product-route-comprehension-readback');
  assert.equal(report.schemaId, V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_SCHEMA_ID);
  assert.equal(report.version, 'V46');
  assert.equal(report.currentTarget, 'V45');
  assert.equal(report.sourceSafetyVerdict, V46_PRODUCT_ROUTE_COMPREHENSION_READBACK_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v46-product-route-comprehension-readback:'));
  assert.deepEqual(report.routeIds, [...V46_PRODUCT_ROUTE_IDS]);
  assert.deepEqual(report.routePaths, [...V46_PRODUCT_ROUTE_PATHS]);
  assert.deepEqual(report.capabilityIds, [...V46_PRODUCT_ROUTE_CAPABILITY_IDS]);
  assert.equal(report.routeRows.length, V46_PRODUCT_ROUTE_READBACK_ROWS.length);
  assert.equal(report.coverage.allRoutesCovered, true);
  assert.equal(report.coverage.allRoutePathsCovered, true);
  assert.equal(report.coverage.lowDetailDefaultsCovered, true);
  assert.equal(report.coverage.expandableProofReadbackCovered, true);
  assert.equal(report.coverage.routeOwnedStateCovered, true);
  assert.equal(report.coverage.requiredCapabilitiesCovered, true);
  assert.equal(report.coverage.routeSpecificCapabilitiesCovered, true);
  assert.equal(report.coverage.allClaimIdsKnown, true);
  assert.equal(report.coverage.allCategoryIdsKnown, true);
  assert.equal(report.coverage.allAuthorityIdsKnown, true);
  assert.equal(report.coverage.rowsMissingRequiredCopy.length, 0);
  assert.equal(report.passed, true);
});

test('V46 product route readback rows preserve source-safe disclosure boundaries', () => {
  const report = buildV46ProductRouteComprehensionReadback();

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
  assert.deepEqual(report.coverage.forbiddenPhraseHits, []);
  assert.deepEqual(report.coverage.secretMarkerHits, []);

  for (const row of report.routeRows) {
    assert.equal(row.lowDetailDefault, true);
    assert.equal(row.expandableSourceSafeDetail, true);
    assert.equal(row.routeOwnedState, true);
    assert.equal(row.proofReadbackVisible, true);
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.rawPromptVisible, false);
    assert.equal(row.interpolatedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.settlementPrivatePayloadVisible, false);
    assert.equal(row.valueBearingMainnetAdmitted, false);
    assert.ok(row.rowRoot.includes(':'));
  }
});

test('V46 product route readback rows keep route-specific product meaning distinct', () => {
  const report = buildV46ProductRouteComprehensionReadback();
  const rowById = new Map(report.routeRows.map((row) => [row.routeId, row]));

  assert.deepEqual(rowById.get('packs')?.requiredCopyTokens.slice(0, 3), [
    'Pack activity',
    'Portfolio positions, market signals, proof roots, settlement, compensation, delivery, repair.',
    'Search titles, measurements, values, proof roots',
  ]);
  assert.equal(rowById.get('packs')?.capabilityIds.includes('search-filter-sort'), true);
  assert.equal(rowById.get('read')?.capabilityIds.includes('five-step-reading'), true);
  assert.equal(rowById.get('read')?.claimIds.includes('quote-is-source-safe-offer'), true);
  assert.equal(rowById.get('deposit')?.capabilityIds.includes('five-step-depositing'), true);
  assert.equal(rowById.get('deposit')?.claimIds.includes('deposit-option-is-potential-supply'), true);
  assert.equal(rowById.get('deposit')?.operatorReading.includes('source-safe supply route'), true);
});
