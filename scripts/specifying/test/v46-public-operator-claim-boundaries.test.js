import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';
import {
  V46_PUBLIC_OPERATOR_ALLOWED_DATA_CLASSES,
  V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_ARTIFACT_PATH,
  V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_SCHEMA_ID,
  V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_SOURCE_SAFETY_VERDICT,
  V46_PUBLIC_OPERATOR_SURFACE_IDS,
  V46_PUBLIC_OPERATOR_SURFACE_KIND_IDS,
  V46_PUBLIC_OPERATOR_SURFACE_ROWS,
  buildV46PublicOperatorClaimBoundaries,
} from '../src/canonical/v46-public-operator-claim-boundaries.js';

test('V46 public/operator claim boundaries bind public docs, landing, and operator surfaces', () => {
  const report = buildV46PublicOperatorClaimBoundaries();

  assert.equal(V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_ARTIFACT_PATH, '.proofs/v46/public-operator-claim-boundaries.json');
  assert.equal(report.artifactId, 'v46-public-operator-claim-boundaries');
  assert.equal(report.schemaId, V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_SCHEMA_ID);
  assert.equal(report.version, 'V46');
  assert.equal(report.currentTarget, 'V45');
  assert.equal(report.sourceSafetyVerdict, V46_PUBLIC_OPERATOR_CLAIM_BOUNDARIES_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v46-public-operator-claim-boundaries:'));
  assert.deepEqual(report.surfaceIds, [...V46_PUBLIC_OPERATOR_SURFACE_IDS]);
  assert.deepEqual(report.surfaceKindIds, [...V46_PUBLIC_OPERATOR_SURFACE_KIND_IDS]);
  assert.deepEqual(report.allowedDataClasses, [...V46_PUBLIC_OPERATOR_ALLOWED_DATA_CLASSES]);
  assert.equal(report.surfaceRows.length, V46_PUBLIC_OPERATOR_SURFACE_ROWS.length);
  assert.equal(report.coverage.landingCovered, true);
  assert.equal(report.coverage.publicDocsCovered, true);
  assert.equal(report.coverage.operatorDocsCovered, true);
  assert.equal(report.coverage.readmesCovered, true);
  assert.equal(report.coverage.specFamilyCovered, true);
  assert.equal(report.coverage.requiredClaimCategoriesCovered, true);
  assert.equal(report.coverage.requiredClaimAuthoritiesCovered, true);
  assert.equal(report.coverage.allClaimIdsKnown, true);
  assert.equal(report.coverage.allCategoryIdsKnown, true);
  assert.equal(report.coverage.allAuthorityIdsKnown, true);
  assert.equal(report.coverage.rowsMissingRequiredCopy.length, 0);
  assert.equal(report.passed, true);
});

test('V46 public/operator surfaces never serialize source, secrets, or value-bearing authority', () => {
  const report = buildV46PublicOperatorClaimBoundaries();

  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.valueBearingMainnetAdmitted, false);
  assert.deepEqual(report.coverage.forbiddenPhraseHits, []);
  assert.deepEqual(report.coverage.secretMarkerHits, []);

  for (const row of report.surfaceRows) {
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.rawPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.equal(row.valueBearingMainnetAdmitted, false);
    assert.ok(row.rowRoot.includes(':'));
  }
});

test('V46 public/operator claim rows preserve proof authority and compatibility boundaries', () => {
  const report = buildV46PublicOperatorClaimBoundaries();
  const rowById = new Map(report.surfaceRows.map((row) => [row.surfaceId, row]));

  assert.deepEqual(rowById.get('landing-preview')?.requiredCopyTokens, [
    'The preview keeps AssetPacks, source-safe measurements, and settlement posture legible',
    'static preview',
    'Packs',
    'Deposit',
    'Read',
  ]);
  assert.equal(rowById.get('public-docs-protocol-page')?.requiredCopyTokens.includes('protocol-v26'), true);
  assert.equal(rowById.get('public-docs-protocol-page')?.operatorReading.includes('compatibility alias'), true);
  assert.equal(rowById.get('operator-internal-readme')?.blockedDataClasses.includes('wallet-private-material'), true);
  assert.equal(rowById.get('v46-spec-family')?.claimIds.includes('finality-authorizes-rights-and-delivery'), true);
});
