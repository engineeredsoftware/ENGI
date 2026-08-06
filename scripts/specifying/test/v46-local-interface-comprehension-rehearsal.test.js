import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';
import {
  V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ARTIFACT_PATH,
  V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ROWS,
  V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_SCHEMA_ID,
  V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_SOURCE_SAFETY_VERDICT,
  V46_LOCAL_INTERFACE_REHEARSAL_REQUIRED_ARTIFACT_IDS,
  V46_LOCAL_INTERFACE_REHEARSAL_STEP_IDS,
  V46_LOCAL_INTERFACE_REHEARSAL_SURFACE_IDS,
  buildV46LocalInterfaceComprehensionRehearsal,
} from '../src/canonical/v46-local-interface-comprehension-rehearsal.js';

test('V46 local interface comprehension rehearsal binds every local surface', () => {
  const report = buildV46LocalInterfaceComprehensionRehearsal();

  assert.equal(
    V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ARTIFACT_PATH,
    '.proofs/v46/local-interface-comprehension-rehearsal.json',
  );
  assert.equal(report.artifactId, 'v46-local-interface-comprehension-rehearsal');
  assert.equal(report.schemaId, V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_SCHEMA_ID);
  assert.equal(report.version, 'V46');
  assert.equal(report.currentTarget, 'V45');
  assert.equal(report.sourceSafetyVerdict, V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_SOURCE_SAFETY_VERDICT);
  assert.deepEqual(report.surfaceIds, [...V46_LOCAL_INTERFACE_REHEARSAL_SURFACE_IDS]);
  assert.deepEqual(report.stepIds, [...V46_LOCAL_INTERFACE_REHEARSAL_STEP_IDS]);
  assert.deepEqual(report.requiredArtifactIds, [...V46_LOCAL_INTERFACE_REHEARSAL_REQUIRED_ARTIFACT_IDS]);
  assert.equal(report.rows.length, V46_LOCAL_INTERFACE_COMPREHENSION_REHEARSAL_ROWS.length);
  assert.equal(report.coverage.allSurfacesCovered, true);
  assert.equal(report.coverage.allStepsCovered, true);
  assert.equal(report.coverage.allPriorArtifactsPassed, true);
  assert.equal(report.coverage.allClaimIdsKnown, true);
  assert.equal(report.coverage.allCategoryIdsKnown, true);
  assert.equal(report.coverage.allAuthorityIdsKnown, true);
  assert.equal(report.coverage.sourceFilesPresent, true);
  assert.equal(report.coverage.rowsMissingRequiredCopy.length, 0);
  assert.equal(report.passed, true);
});

test('V46 local interface comprehension rehearsal remains source-safe and local-only', () => {
  const report = buildV46LocalInterfaceComprehensionRehearsal();

  assert.equal(report.coverage.localOnly, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.noParallelStateAuthority, true);
  assert.equal(report.coverage.stateAdvanceRequiresProofRoot, true);
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
});

test('V46 local interface rows rehearse product and machine interfaces distinctly', () => {
  const report = buildV46LocalInterfaceComprehensionRehearsal();
  const rowBySurface = new Map(report.rows.map((row) => [row.surfaceId, row]));

  assert.equal(rowBySurface.get('packs_route')?.claimIds.includes('repair-fails-closed'), true);
  assert.equal(rowBySurface.get('read_route')?.claimIds.includes('quote-is-source-safe-offer'), true);
  assert.equal(rowBySurface.get('deposit_route')?.claimIds.includes('deposit-option-is-potential-supply'), true);
  assert.equal(rowBySurface.get('api_mcp')?.authorityIds.includes('interface-guidance-only'), true);
  assert.equal(rowBySurface.get('chatgpt_bitcode_chat')?.claimIds.includes('delivery-is-entitled-source-unlock'), true);
  assert.equal(rowBySurface.get('proof_telemetry_repair')?.authorityIds.includes('telemetry-observability-only'), true);

  for (const row of report.rows) {
    assert.equal(row.localOnly, true);
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.ok(row.rowRoot.startsWith('v46-local-interface-rehearsal-row:'));
    assert.ok(row.stepIds.length >= V46_LOCAL_INTERFACE_REHEARSAL_STEP_IDS.length);
  }
});
