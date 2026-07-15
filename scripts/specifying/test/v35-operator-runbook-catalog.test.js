import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  OPERATOR_RUNBOOK_CATALOG_ARTIFACT_PATH,
  OPERATOR_RUNBOOK_IDS,
  TELEMETRY_EVENT_FAMILIES,
  buildOperatorRunbookCatalog,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V35 OperatorRunbookCatalog rows', () => {
  const catalog = buildOperatorRunbookCatalog({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(catalog.artifactId, 'v35-operator-runbook-catalog');
  assert.equal(catalog.schemaId, 'bitcode.v35.operatorRunbookCatalog.v1');
  assert.equal(catalog.version, 'V35');
  assert.equal(catalog.currentTarget, 'V34');
  assert.equal(catalog.passed, true);
  assert.equal(catalog.sourceSafetyVerdict, 'source-safe-runbook-metadata');
  assert.equal(catalog.coverage.runbookCount, OPERATOR_RUNBOOK_IDS.length);
  assert.equal(catalog.coverage.dashboardPanelCount, OPERATOR_RUNBOOK_IDS.length);
  assert.equal(catalog.coverage.alertCount, OPERATOR_RUNBOOK_IDS.length);
  assert.equal(catalog.coverage.incidentClassCount, OPERATOR_RUNBOOK_IDS.length);
  assert.deepEqual(catalog.coverage.missingRunbookIds, []);
  assert.deepEqual(catalog.coverage.missingEventFamilyBindings, []);
  assert.deepEqual(catalog.coverage.missingSourceRoots, []);
  assert.equal(catalog.coverage.allRequiredRunbooksCovered, true);
  assert.equal(catalog.coverage.allTelemetryFamiliesBound, true);
  assert.equal(catalog.coverage.credentialsSerialized, false);
  assert.equal(catalog.coverage.protectedSourceVisible, false);
  assert.equal(catalog.coverage.rawProtectedPromptVisible, false);
  assert.equal(catalog.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(catalog.coverage.walletPrivateMaterialVisible, false);
  assert.match(catalog.artifactRoot, /^operator-runbook-catalog:[a-f0-9]{24}$/u);

  for (const runbookId of OPERATOR_RUNBOOK_IDS) {
    assert.equal(catalog.rows.some((row) => row.runbookId === runbookId), true, `missing ${runbookId}`);
  }

  for (const eventFamily of TELEMETRY_EVENT_FAMILIES) {
    assert.equal(catalog.rows.some((row) => row.eventFamily === eventFamily), true, `missing ${eventFamily}`);
  }

  for (const row of catalog.rows) {
    assert.match(row.runbookRoot, /^operator-runbook-row:[a-f0-9]{24}$/u);
    assert.ok(row.dashboardPanel.startsWith('dashboard.'));
    assert.ok(row.alertId.startsWith(`alert.${row.eventFamily}.`));
    assert.ok(row.alertThreshold.length > 0);
    assert.ok(row.incidentClass.length > 0);
    assert.ok(row.escalationPath.length >= 2);
    assert.ok(row.commandSequence.length > 0);
    assert.ok(row.verificationCommands.includes('pnpm run check:v35-gate5'));
    assert.ok(row.safeDataAllowed.includes('proof_roots'));
    assert.ok(row.forbiddenData.includes('secret_values'));
    assert.ok(row.forbiddenData.includes('wallet_private_material'));
    assert.ok(row.forbiddenData.includes('unpaid_assetpack_source'));
    assert.ok(row.proofRootBasis.length > 0);
    assert.ok(row.repairReferences.length > 0);
    assert.ok(row.postIncidentDocsUpdates.length > 0);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);
    assert.equal(row.replayExpectation.command, 'pnpm run check:v35-operator-runbook-catalog');
  }
});

test('binds runbooks to telemetry taxonomy dashboards alerts and incidents', () => {
  const catalog = buildOperatorRunbookCatalog({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const byEventFamily = new Map(catalog.rows.map((row) => [row.eventFamily, row]));

  assert.equal(byEventFamily.get('pipeline')?.dashboardPanel, 'dashboard.pipeline.health');
  assert.equal(byEventFamily.get('pipeline')?.runbookId, 'runbook.pipeline.execution-repair');
  assert.equal(byEventFamily.get('execution')?.incidentClass, 'execution_orphan_or_missing_completion');
  assert.equal(byEventFamily.get('ptrr_agent')?.runbookId, 'runbook.inference.ptrr-agent-debug');
  assert.equal(byEventFamily.get('thricified_generation')?.incidentClass, 'thricified_generation_redaction_or_parse_failure');
  assert.equal(byEventFamily.get('tool')?.runbookId, 'runbook.tools.policy-denial');
  assert.equal(byEventFamily.get('ledger')?.escalationPath.includes('settlement approver'), true);
  assert.equal(byEventFamily.get('wallet')?.incidentClass, 'wallet_signing_or_policy_failure');
  assert.equal(byEventFamily.get('storage')?.repairReferences.includes('DeploymentStoragePosture'), true);
  assert.equal(byEventFamily.get('interface')?.runbookId, 'runbook.interfaces.auth-denial');
  assert.equal(byEventFamily.get('deployment')?.incidentClass, 'deployment_lane_or_secret_availability_failure');
  assert.equal(byEventFamily.get('observer')?.alertThreshold, 'finality_lag_warning');
  assert.equal(byEventFamily.get('repair')?.runbookId, 'runbook.repair.failed');
  assert.equal(byEventFamily.get('docs_qa')?.runbookId, 'runbook.docs.qa-repair');
  assert.equal(byEventFamily.get('promotion')?.runbookId, 'runbook.promotion.blocked');
  assert.equal(
    catalog.disclosureBoundary.operatorRule.includes('source-safe metadata'),
    true,
  );
  assert.equal(OPERATOR_RUNBOOK_CATALOG_ARTIFACT_PATH, '.proofs/v35/operator-runbook-catalog.json');
});
