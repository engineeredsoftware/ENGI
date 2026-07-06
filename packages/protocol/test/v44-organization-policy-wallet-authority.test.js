import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';
import {
  V44_ORGANIZATION_POLICY_ACTION_IDS,
  V44_ORGANIZATION_POLICY_OBJECT_IDS,
  V44_ORGANIZATION_POLICY_ROUTE_IDS,
  V44_ORGANIZATION_POLICY_ROWS,
  V44_ORGANIZATION_POLICY_STATE_IDS,
  V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_ARTIFACT_PATH,
  V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_SCHEMA_ID,
  V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_SOURCE_SAFETY_VERDICT,
  buildV44OrganizationPolicyWalletAuthority,
} from '../src/canonical/v44-organization-policy-wallet-authority.js';

test('V44 organization policy wallet authority artifact is source-safe and complete', () => {
  const artifact = buildV44OrganizationPolicyWalletAuthority();

  assert.equal(V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_ARTIFACT_PATH, '.bitcode/v44-organization-policy-wallet-authority.json');
  assert.equal(artifact.artifactId, 'v44-organization-policy-wallet-authority');
  assert.equal(artifact.schemaId, V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_SCHEMA_ID);
  assert.equal(artifact.version, 'V44');
  assert.equal(artifact.currentTarget, 'V43');
  assert.equal(artifact.sourceSafetyVerdict, V44_ORGANIZATION_POLICY_WALLET_AUTHORITY_SOURCE_SAFETY_VERDICT);
  assert.equal(artifact.passed, true);
  assert.match(artifact.artifactRoot, /^v44-organization-policy-wallet-authority:/);
  assert.deepEqual(artifact.objectIds, [...V44_ORGANIZATION_POLICY_OBJECT_IDS]);
  assert.deepEqual(artifact.routeIds, [...V44_ORGANIZATION_POLICY_ROUTE_IDS]);
  assert.deepEqual(artifact.actionIds, [...V44_ORGANIZATION_POLICY_ACTION_IDS]);
  assert.deepEqual(artifact.stateIds, [...V44_ORGANIZATION_POLICY_STATE_IDS]);
  assert.equal(artifact.coverage.organizationPolicyWalletAuthorityImplemented, true);
  assert.equal(artifact.coverage.btdDepositActionsImplemented, true);
  assert.equal(artifact.coverage.readRouteAuthorityImplemented, true);
  assert.equal(artifact.coverage.depositRouteAuthorityImplemented, true);
  assert.equal(artifact.coverage.packsGovernanceReadbackImplemented, true);
  assert.equal(artifact.coverage.testsImplemented, true);
  assert.equal(artifact.coverage.sourceSafeMetadataOnly, true);
  assert.equal(artifact.coverage.protectedSourceVisible, false);
  assert.equal(artifact.coverage.rawSourceTextVisible, false);
  assert.equal(artifact.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.coverage.walletPrivateMaterialVisible, false);
  assert.equal(artifact.coverage.valueBearingMainnetAdmitted, false);
});

test('V44 organization policy rows bind BTD, routes, Packs, tests, and workflow evidence', () => {
  const artifact = buildV44OrganizationPolicyWalletAuthority();
  const rowIds = artifact.rows.map((row) => row.rowId);

  assert.equal(artifact.rows.length, V44_ORGANIZATION_POLICY_ROWS.length);
  assert.ok(rowIds.includes('btd-deposit-actions'));
  assert.ok(rowIds.includes('source-safe-governance-statement'));
  assert.ok(rowIds.includes('read-route-authority'));
  assert.ok(rowIds.includes('deposit-route-authority'));
  assert.ok(rowIds.includes('packs-governance-readback'));

  for (const row of artifact.rows) {
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.walletPrivateMaterialVisible, false);
    assert.ok(row.rowRoot.startsWith('v44-organization-policy-row:'));
    assert.ok(row.requiredFields.length > 0);
  }
});
