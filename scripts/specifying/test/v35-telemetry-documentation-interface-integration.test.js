import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  TELEMETRY_DOCUMENTATION_INTERFACE_IDS,
  TELEMETRY_DOCUMENTATION_INTERFACE_INTEGRATION_ARTIFACT_PATH,
  buildTelemetryDocumentationInterfaceIntegration,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V35 TelemetryDocumentationInterfaceIntegration rows', () => {
  const report = buildTelemetryDocumentationInterfaceIntegration({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v35-telemetry-documentation-interface-integration');
  assert.equal(report.schemaId, 'bitcode.v35.telemetryDocumentationInterfaceIntegration.v1');
  assert.equal(report.version, 'V35');
  assert.equal(report.currentTarget, 'V34');
  assert.equal(report.passed, true);
  assert.equal(report.sourceSafetyVerdict, 'source-safe-interface-integration-metadata');
  assert.equal(report.coverage.integrationCount, TELEMETRY_DOCUMENTATION_INTERFACE_IDS.length);
  assert.deepEqual(report.coverage.missingIntegrationIds, []);
  assert.deepEqual(report.coverage.missingSourceRoots, []);
  assert.deepEqual(report.coverage.rowsMissingDocsLinks, []);
  assert.deepEqual(report.coverage.rowsMissingEventIds, []);
  assert.deepEqual(report.coverage.rowsMissingProofRoots, []);
  assert.deepEqual(report.coverage.rowsMissingRunbooks, []);
  assert.deepEqual(report.coverage.rowsMissingRedactionPosture, []);
  assert.deepEqual(report.coverage.rowsMissingAllowedPayloadFields, []);
  assert.deepEqual(report.coverage.rowsMissingForbiddenPayloadFields, []);
  assert.deepEqual(report.coverage.rowsMissingRoutePayloadSurfaces, []);
  assert.equal(report.coverage.allRequiredInterfacesCovered, true);
  assert.equal(report.coverage.terminalCovered, true);
  assert.equal(report.coverage.auxillariesCovered, true);
  assert.equal(report.coverage.apiCovered, true);
  assert.equal(report.coverage.mcpApiCovered, true);
  assert.equal(report.coverage.chatGptAppCovered, true);
  assert.equal(report.coverage.packageReadmesCovered, true);
  assert.equal(report.coverage.internalDocsCovered, true);
  assert.equal(report.coverage.publicDocsCovered, true);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawProtectedPromptVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.match(report.artifactRoot, /^telemetry-documentation-interface-integration:[a-f0-9]{24}$/u);

  for (const integrationId of TELEMETRY_DOCUMENTATION_INTERFACE_IDS) {
    assert.equal(report.rows.some((row) => row.integrationId === integrationId), true, `missing ${integrationId}`);
  }

  for (const row of report.rows) {
    assert.match(row.integrationRoot, /^telemetry-docs-interface-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);
    assert.ok(row.docsLinks.length > 0);
    assert.ok(row.eventIds.length > 0);
    assert.ok(row.proofRootFields.length > 0);
    assert.ok(row.runbookLinks.length > 0);
    assert.ok(row.redactionPosture.length > 0);
    assert.ok(row.routePayloadSurfaces.length > 0);
    assert.ok(row.validationCommands.length > 0);
    assert.ok(row.failClosedResult.includes('blocks'));
    assert.ok(row.allowedPayloadFields.includes('eventIds'));
    assert.ok(row.allowedPayloadFields.includes('proofRoots'));
    assert.ok(row.allowedPayloadFields.includes('docsLinks'));
    assert.ok(row.allowedPayloadFields.includes('runbookLinks'));
    assert.ok(row.allowedPayloadFields.includes('redactionPosture'));
    assert.ok(row.forbiddenPayloadFields.includes('secret_values'));
    assert.ok(row.forbiddenPayloadFields.includes('unpaid_assetpack_source'));
  }
});

test('binds active interface surfaces to docs telemetry runbooks and proof roots', () => {
  const report = buildTelemetryDocumentationInterfaceIntegration({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const byIntegrationId = new Map(report.rows.map((row) => [row.integrationId, row]));

  assert.ok(byIntegrationId.get('terminal')?.docsLinks.includes('/docs/product-workspace'));
  assert.ok(byIntegrationId.get('terminal')?.eventFamilies.includes('pipeline'));
  assert.ok(byIntegrationId.get('auxillaries')?.docsLinks.includes('/docs/auxillaries'));
  assert.ok(byIntegrationId.get('api')?.sourceRoots.includes('packages/api/src/routes/btd-crypto.ts'));
  assert.ok(byIntegrationId.get('mcp_api')?.sourceRoots.includes('apps/mcp/README.md'));
  assert.ok(byIntegrationId.get('chatgpt_app')?.sourceRoots.includes('apps/chatgpt/README.md'));
  assert.ok(byIntegrationId.get('package_readmes')?.packageOwnedContracts.includes('DocumentationSurfaceCatalog'));
  assert.ok(byIntegrationId.get('internal_docs')?.eventFamilies.includes('promotion'));
  assert.ok(byIntegrationId.get('public_docs')?.sourceRoots.includes('apps/uapi/app/docs/bitcode-docs-content.ts'));
  assert.ok(report.coverage.observedEventFamilies.includes('docs_qa'));
  assert.ok(report.coverage.observedRunbookLinks.includes('runbook.docs.qa-repair'));
  assert.equal(
    report.disclosureBoundary.forbiddenInterfacePayload.includes('protected_source_payloads'),
    true,
  );
  assert.equal(
    TELEMETRY_DOCUMENTATION_INTERFACE_INTEGRATION_ARTIFACT_PATH,
    '.proofs/v35/telemetry-documentation-interface-integration.json',
  );
});
