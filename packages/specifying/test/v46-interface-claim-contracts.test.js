import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V46_INTERFACE_CLAIM_CAPABILITY_IDS,
  V46_INTERFACE_CLAIM_CONTRACTS_ARTIFACT_PATH,
  V46_INTERFACE_CLAIM_CONTRACTS_SCHEMA_ID,
  V46_INTERFACE_CLAIM_CONTRACTS_SOURCE_SAFETY_VERDICT,
  V46_INTERFACE_CLAIM_CONTRACT_ROWS,
  V46_INTERFACE_CLAIM_SURFACE_IDS,
  buildV46InterfaceClaimContracts,
} from '../src/canonical/v46-interface-claim-contracts.js';

test('V46 interface claim contracts bind API/MCP, ChatGPT App, Bitcode Chat, and package consumers', () => {
  const report = buildV46InterfaceClaimContracts();

  assert.equal(V46_INTERFACE_CLAIM_CONTRACTS_ARTIFACT_PATH, '.bitcode/v46-interface-claim-contracts.json');
  assert.equal(report.artifactId, 'v46-interface-claim-contracts');
  assert.equal(report.schemaId, V46_INTERFACE_CLAIM_CONTRACTS_SCHEMA_ID);
  assert.equal(report.version, 'V46');
  assert.equal(report.currentTarget, 'V45');
  assert.equal(report.sourceSafetyVerdict, V46_INTERFACE_CLAIM_CONTRACTS_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v46-interface-claim-contracts:'));
  assert.deepEqual(report.surfaceIds, [...V46_INTERFACE_CLAIM_SURFACE_IDS]);
  assert.deepEqual(report.capabilityIds, [...V46_INTERFACE_CLAIM_CAPABILITY_IDS]);
  assert.equal(report.interfaceRows.length, V46_INTERFACE_CLAIM_CONTRACT_ROWS.length);
  assert.equal(report.coverage.allSurfacesCovered, true);
  assert.equal(report.coverage.allClaimIdsKnown, true);
  assert.equal(report.coverage.allCategoryIdsKnown, true);
  assert.equal(report.coverage.allAuthorityIdsKnown, true);
  assert.equal(report.coverage.requiredCapabilitiesCovered, true);
  assert.equal(report.coverage.sourceFilesPresent, true);
  assert.equal(report.coverage.rowsMissingRequiredCopy.length, 0);
  assert.equal(report.passed, true);
});

test('V46 interface claim contracts preserve source-safe disclosure boundaries', () => {
  const report = buildV46InterfaceClaimContracts();

  assert.equal(report.coverage.allRowsRequireProofRootProjection, true);
  assert.equal(report.coverage.allRowsRequireDeniedStateRepair, true);
  assert.equal(report.coverage.noParallelStateAuthority, true);
  assert.equal(report.coverage.stateAdvanceRequiresProof, true);
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

  for (const row of report.interfaceRows) {
    assert.equal(row.noParallelStateAuthority, true);
    assert.equal(row.stateAdvanceRequiresProof, true);
    assert.equal(row.interfaceGuidanceOnly, true);
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.proofRootProjectionRequired, true);
    assert.equal(row.deniedStateRepairRequired, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.ok(row.rowRoot.includes(':'));
  }
});

test('V46 interface claim contract rows keep each interface role distinct', () => {
  const report = buildV46InterfaceClaimContracts();
  const rowBySurface = new Map(report.interfaceRows.map((row) => [row.surfaceId, row]));

  assert.equal(rowBySurface.get('public_api')?.capabilityIds.includes('versionless-interface-paths'), true);
  assert.equal(rowBySurface.get('mcp_api')?.capabilityIds.includes('tool-registry-contract'), true);
  assert.equal(rowBySurface.get('mcp_api')?.deniedStateRoots.includes('PROVIDER_BINDING_REQUIRED'), true);
  assert.equal(rowBySurface.get('chatgpt_app')?.capabilityIds.includes('action-registry-contract'), true);
  assert.equal(rowBySurface.get('chatgpt_app')?.deniedStateRoots.includes('CONFIRMATION_REQUIRED'), true);
  assert.equal(rowBySurface.get('bitcode_chat')?.capabilityIds.includes('terminal-delegated-handoff'), true);
  assert.equal(rowBySurface.get('bitcode_chat')?.operatorReading.includes('handoff surface'), true);
  assert.equal(rowBySurface.get('package_consumer')?.deniedStateRoots.includes('packageConsumersReadContractsOnly'), true);
});
