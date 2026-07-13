import assert from 'node:assert/strict';
import test from 'node:test';

import {
  V40_API_INTEGRATION_CONTRACTS_ARTIFACT_PATH,
  V40_API_INTEGRATION_CONTRACTS_SCHEMA_ID,
  V40_API_INTEGRATION_CONTRACTS_SOURCE_SAFETY_VERDICT,
  V40_API_INTEGRATION_CONTRACT_ROWS,
  V40_API_INTEGRATION_SURFACE_IDS,
  V40_API_INTEGRATION_VERDICTS,
  buildV40ApiIntegrationContracts,
} from '../src/canonical/v40-api-integration-contracts.js';

test('V40 API integration contracts close route and interface contract surfaces', () => {
  const report = buildV40ApiIntegrationContracts();

  assert.equal(V40_API_INTEGRATION_CONTRACTS_ARTIFACT_PATH, '.bitcode/v40-api-integration-contracts.json');
  assert.equal(report.artifactId, 'v40-api-integration-contracts');
  assert.equal(report.schemaId, V40_API_INTEGRATION_CONTRACTS_SCHEMA_ID);
  assert.equal(report.version, 'V40');
  assert.equal(report.currentTarget, 'V39');
  assert.equal(report.sourceSafetyVerdict, V40_API_INTEGRATION_CONTRACTS_SOURCE_SAFETY_VERDICT);
  assert.equal(report.passed, true);
  assert.deepEqual(report.surfaceIds, [...V40_API_INTEGRATION_SURFACE_IDS]);
  assert.deepEqual(report.verdictIds, [...V40_API_INTEGRATION_VERDICTS]);
  assert.equal(report.rows.length, V40_API_INTEGRATION_CONTRACT_ROWS.length);
  assert.equal(report.coverage.rowCount, 10);
  assert.equal(report.coverage.surfaceCount, 10);
  assert.equal(report.coverage.coveredRowCount, 10);
  assert.equal(report.coverage.missingRowCount, 0);
  assert.equal(report.coverage.blockedRowCount, 0);
  assert.equal(report.coverage.exemptRowCount, 0);
  assert.equal(report.coverage.allCriticalSurfacesClosed, true);
  assert.equal(report.coverage.uapiRouteContractsClosed, true);
  assert.equal(report.coverage.packageApiContractsClosed, true);
  assert.equal(report.coverage.mcpInterfaceContractsClosed, true);
  assert.equal(report.coverage.chatgptInterfaceContractsClosed, true);
  assert.equal(report.coverage.persistenceAuthorizationContractsClosed, true);
  assert.equal(report.coverage.responseSchemaContractsClosed, true);
  assert.deepEqual(report.coverage.failedPredicateIds, []);
  assert.ok(report.artifactRoot.startsWith('v40-api-integration-contracts:'));
});

test('V40 API integration contract rows remain source-safe metadata only', () => {
  for (const row of V40_API_INTEGRATION_CONTRACT_ROWS) {
    assert.equal(row.verdict, 'covered');
    assert.ok(row.rowRoot.startsWith('v40-api-integration-contract-row:'));
    assert.equal(row.sourceSafetyClass, 'source_safe_api_integration_contract_metadata');
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.rawProtectedPromptVisible, false);
    assert.equal(row.rawProviderResponseVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
    assert.equal(row.credentialsSerialized, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.ok(row.forbiddenPayloadClasses.includes('secret-values'));
    assert.ok(row.forbiddenPayloadClasses.includes('unpaid-assetpack-source'));
    assert.ok(row.routeFamilies.length > 0);
    assert.ok(row.sourceRoots.length > 0);
    assert.ok(row.testPaths.length > 0);
    assert.ok(row.commandIds.length > 0);
  }
});
