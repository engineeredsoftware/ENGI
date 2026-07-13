import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V46_PROTOCOL_CLAIM_AUTHORITY_IDS,
  V46_PROTOCOL_CLAIM_CATEGORY_IDS,
  V46_PROTOCOL_CLAIM_ROWS,
  V46_PROTOCOL_COMPREHENSION_OBJECT_IDS,
  V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH,
  V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_SCHEMA_ID,
  V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_SOURCE_SAFETY_VERDICT,
  V46_PROTOCOL_DISCLOSURE_BOUNDARY_IDS,
  V46_PROTOCOL_FORBIDDEN_CLAIM_IDS,
  V46_PROTOCOL_OBJECT_ROWS,
  V46_PROTOCOL_PRIVATE_PAYLOAD_IDS,
  V46_PROTOCOL_SOURCE_SAFE_FIELD_IDS,
  buildV46ProtocolComprehensionObjectModel,
} from '../src/canonical/v46-protocol-comprehension-object-model.js';

test('V46 protocol comprehension object model binds source-safe objects and claim taxonomy', () => {
  const report = buildV46ProtocolComprehensionObjectModel();

  assert.equal(V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_ARTIFACT_PATH, '.bitcode/v46-protocol-comprehension-object-model.json');
  assert.equal(report.artifactId, 'v46-protocol-comprehension-object-model');
  assert.equal(report.schemaId, V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_SCHEMA_ID);
  assert.equal(report.version, 'V46');
  assert.equal(report.currentTarget, 'V45');
  assert.equal(report.sourceSafetyVerdict, V46_PROTOCOL_COMPREHENSION_OBJECT_MODEL_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v46-protocol-comprehension-object-model:'));
  assert.deepEqual(report.objectIds, [...V46_PROTOCOL_COMPREHENSION_OBJECT_IDS]);
  assert.deepEqual(report.claimCategoryIds, [...V46_PROTOCOL_CLAIM_CATEGORY_IDS]);
  assert.deepEqual(report.claimAuthorityIds, [...V46_PROTOCOL_CLAIM_AUTHORITY_IDS]);
  assert.deepEqual(report.disclosureBoundaryIds, [...V46_PROTOCOL_DISCLOSURE_BOUNDARY_IDS]);
  assert.deepEqual(report.forbiddenClaimIds, [...V46_PROTOCOL_FORBIDDEN_CLAIM_IDS]);
  assert.deepEqual(report.sourceSafeFieldIds, [...V46_PROTOCOL_SOURCE_SAFE_FIELD_IDS]);
  assert.deepEqual(report.privatePayloadIdsNeverSerialized, [...V46_PROTOCOL_PRIVATE_PAYLOAD_IDS]);
  assert.equal(report.objectRows.length, V46_PROTOCOL_OBJECT_ROWS.length);
  assert.equal(report.claimRows.length, V46_PROTOCOL_CLAIM_ROWS.length);
  assert.equal(report.coverage.assetPackCommodityCovered, true);
  assert.equal(report.coverage.btdScalarVolumeCovered, true);
  assert.equal(report.coverage.btcQuoteSettlementCovered, true);
  assert.equal(report.coverage.sourceUnlockDeliveryCovered, true);
  assert.equal(report.coverage.contributorCompensationCovered, true);
  assert.equal(report.coverage.interfaceClaimsCovered, true);
  assert.equal(report.coverage.protocolLawClaimCovered, true);
  assert.equal(report.coverage.productGuidanceClaimCovered, true);
  assert.equal(report.coverage.operatorEvidenceClaimCovered, true);
  assert.equal(report.coverage.investorFramingClaimCovered, true);
  assert.equal(report.coverage.telemetryObservabilityClaimCovered, true);
  assert.equal(report.coverage.previewQuoteSettlementRightsDeliveryCovered, true);
  assert.equal(report.coverage.compensationRepairClaimsCovered, true);
  assert.equal(report.coverage.noForbiddenClaimCollapsed, true);
  assert.equal(report.passed, true);
});

test('V46 protocol comprehension rows do not serialize source or value-bearing mainnet authority', () => {
  const report = buildV46ProtocolComprehensionObjectModel();

  for (const row of [...report.objectRows, ...report.claimRows]) {
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

test('V46 protocol claim taxonomy separates law, guidance, evidence, framing, and state claims', () => {
  const report = buildV46ProtocolComprehensionObjectModel();
  const categorySet = new Set(report.claimRows.map((row) => row.claimCategoryId));
  const authoritySet = new Set(report.claimRows.map((row) => row.authorityId));

  for (const id of ['protocol-law', 'product-guidance', 'investor-framing', 'telemetry-observability']) {
    assert.equal(categorySet.has(id), true);
  }
  for (const id of ['preview-claim', 'quote-claim', 'settlement-claim', 'rights-claim', 'repair-claim']) {
    assert.equal(categorySet.has(id), true);
  }
  assert.equal(authoritySet.has('canonical-specification'), true);
  assert.equal(authoritySet.has('generated-proof'), true);
  assert.equal(authoritySet.has('ledger-readback'), true);
  assert.equal(authoritySet.has('telemetry-observability-only'), true);
  assert.equal(authoritySet.has('public-education-only'), true);

  for (const forbiddenId of V46_PROTOCOL_FORBIDDEN_CLAIM_IDS) {
    assert.equal(
      report.coverage.noForbiddenClaimCollapsed,
      true,
      `forbidden claim ${forbiddenId} must be represented as a blocked interpretation`,
    );
  }
});
