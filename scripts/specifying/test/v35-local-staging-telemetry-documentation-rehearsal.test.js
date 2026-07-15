import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_ARTIFACT_PATH,
  LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_IDS,
  buildLocalStagingTelemetryDocumentationRehearsal,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V35 LocalStagingTelemetryDocumentationRehearsal rows', () => {
  const report = buildLocalStagingTelemetryDocumentationRehearsal({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v35-local-staging-telemetry-documentation-rehearsal');
  assert.equal(report.schemaId, 'bitcode.v35.localStagingTelemetryDocumentationRehearsal.v1');
  assert.equal(report.version, 'V35');
  assert.equal(report.currentTarget, 'V34');
  assert.equal(report.passed, true);
  assert.equal(report.sourceSafetyVerdict, 'source-safe-rehearsal-metadata');
  assert.equal(report.coverage.rehearsalCount, LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_IDS.length);
  assert.deepEqual(report.coverage.missingRehearsalIds, []);
  assert.deepEqual(report.coverage.missingSourceRoots, []);
  assert.deepEqual(report.coverage.rowsMissingRequiredPhases, []);
  assert.deepEqual(report.coverage.rowsMissingDocsSurfaces, []);
  assert.deepEqual(report.coverage.rowsMissingEventIds, []);
  assert.deepEqual(report.coverage.rowsMissingProofRoots, []);
  assert.deepEqual(report.coverage.rowsMissingDashboards, []);
  assert.deepEqual(report.coverage.rowsMissingRunbooks, []);
  assert.deepEqual(report.coverage.rowsMissingDocsQa, []);
  assert.deepEqual(report.coverage.rowsMissingEvidence, []);
  assert.deepEqual(report.coverage.rowsMissingSourceSafeLogs, []);
  assert.deepEqual(report.coverage.valueBearingUnblockedRows, []);
  assert.equal(report.coverage.localRehearsalCovered, true);
  assert.equal(report.coverage.stagingTestnetRehearsalCovered, true);
  assert.equal(report.coverage.valueBearingMainnetVisibleAndBlocked, true);
  assert.equal(report.coverage.documentationDiscoveryCovered, true);
  assert.equal(report.coverage.telemetryEventEmissionCovered, true);
  assert.equal(report.coverage.dashboardRunbookLookupCovered, true);
  assert.equal(report.coverage.docsQaCovered, true);
  assert.equal(report.coverage.incidentDrillCovered, true);
  assert.equal(report.coverage.sourceSafeProofRootReviewCovered, true);
  assert.equal(report.coverage.documentationSurfacesCovered, true);
  assert.equal(report.coverage.interfaceSurfacesCovered, true);
  assert.equal(report.coverage.docsQaBindingsCovered, true);
  assert.equal(report.coverage.rolloutGuideBindingsCovered, true);
  assert.equal(report.coverage.runbookLinksCovered, true);
  assert.equal(report.coverage.dashboardPanelsCovered, true);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawProtectedPromptVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.match(report.artifactRoot, /^local-staging-telemetry-documentation-rehearsal:[a-f0-9]{24}$/u);

  for (const rehearsalId of LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_IDS) {
    assert.equal(report.rows.some((row) => row.rehearsalId === rehearsalId), true, `missing ${rehearsalId}`);
  }

  for (const row of report.rows) {
    assert.match(row.rehearsalRoot, /^telemetry-docs-rehearsal-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);
    assert.ok(row.docsSurfaceIds.length > 0);
    assert.ok(row.interfaceIds.length > 0);
    assert.ok(row.eventIds.length > 0);
    assert.ok(row.proofRootFields.length > 0);
    assert.ok(row.dashboardPanelIds.length > 0);
    assert.ok(row.runbookLinks.length > 0);
    assert.ok(row.docsQaIds.length > 0);
    assert.ok(row.evidenceRoots.length > 0);
    assert.ok(row.screenshotOrLogRoots.length > 0);
    assert.ok(row.validationCommands.length > 0);
    assert.equal(row.valueBearingMainnetAdmission, false);
    assert.ok(row.allowedPayloadFields.includes('eventIds'));
    assert.ok(row.allowedPayloadFields.includes('proofRoots'));
    assert.ok(row.allowedPayloadFields.includes('runbookIds'));
    assert.ok(row.forbiddenPayloadFields.includes('secret_values'));
    assert.ok(row.forbiddenPayloadFields.includes('unpaid_assetpack_source'));
  }
});

test('binds local and staging rehearsals to docs telemetry runbooks and blocked mainnet posture', () => {
  const report = buildLocalStagingTelemetryDocumentationRehearsal({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const byRehearsalId = new Map(report.rows.map((row) => [row.rehearsalId, row]));

  assert.ok(byRehearsalId.get('local_telemetry_documentation_rehearsal')?.laneId === 'local');
  assert.ok(byRehearsalId.get('local_telemetry_documentation_rehearsal')?.phases.includes('telemetry_event_emission'));
  assert.ok(byRehearsalId.get('staging_testnet_telemetry_documentation_rehearsal')?.laneId === 'staging-testnet');
  assert.ok(byRehearsalId.get('staging_testnet_telemetry_documentation_rehearsal')?.eventFamilies.includes('ledger'));
  assert.ok(byRehearsalId.get('dashboard_runbook_lookup_rehearsal')?.runbookLinks.includes('runbook.ledger.reconciliation-repair'));
  assert.ok(byRehearsalId.get('docs_qa_incident_drill')?.docsQaIds.includes('workflow_checker_alignment'));
  assert.ok(byRehearsalId.get('source_safe_proof_root_review')?.laneId === 'mainnet-ready-dry-run');
  assert.ok(byRehearsalId.get('value_bearing_mainnet_blocked_rehearsal')?.failClosedResult.includes('remains blocked'));
  assert.equal(report.lanePosture.valueBearingMainnet, 'blocked_future_canon_required');
  assert.equal(
    report.disclosureBoundary.forbiddenRehearsalPayload.includes('protected_source_payloads'),
    true,
  );
  assert.equal(
    LOCAL_STAGING_TELEMETRY_DOCUMENTATION_REHEARSAL_ARTIFACT_PATH,
    '.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json',
  );
});
