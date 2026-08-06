import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  TELEMETRY_EVENT_FAMILIES,
  TELEMETRY_TAXONOMY_CATALOG_ARTIFACT_PATH,
  buildTelemetryTaxonomyCatalog,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V35 TelemetryTaxonomyCatalog event family rows', () => {
  const catalog = buildTelemetryTaxonomyCatalog({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(catalog.artifactId, 'v35-telemetry-taxonomy-catalog');
  assert.equal(catalog.schemaId, 'bitcode.v35.telemetryTaxonomyCatalog.v1');
  assert.equal(catalog.version, 'V35');
  assert.equal(catalog.currentTarget, 'V34');
  assert.equal(catalog.passed, true);
  assert.equal(catalog.sourceSafetyVerdict, 'source-safe-telemetry-taxonomy-metadata');
  assert.equal(catalog.coverage.eventFamilyCount, TELEMETRY_EVENT_FAMILIES.length);
  assert.deepEqual(catalog.coverage.missingEventFamilies, []);
  assert.deepEqual(catalog.coverage.missingSourceRoots, []);
  assert.equal(catalog.coverage.pipelineRepresented, true);
  assert.equal(catalog.coverage.executionRepresented, true);
  assert.equal(catalog.coverage.ptrrAgentRepresented, true);
  assert.equal(catalog.coverage.thricifiedGenerationRepresented, true);
  assert.equal(catalog.coverage.toolRepresented, true);
  assert.equal(catalog.coverage.ledgerRepresented, true);
  assert.equal(catalog.coverage.walletRepresented, true);
  assert.equal(catalog.coverage.storageRepresented, true);
  assert.equal(catalog.coverage.interfaceRepresented, true);
  assert.equal(catalog.coverage.deploymentRepresented, true);
  assert.equal(catalog.coverage.observerRepresented, true);
  assert.equal(catalog.coverage.repairRepresented, true);
  assert.equal(catalog.coverage.docsQaRepresented, true);
  assert.equal(catalog.coverage.promotionRepresented, true);
  assert.equal(catalog.coverage.credentialsSerialized, false);
  assert.equal(catalog.coverage.protectedSourceVisible, false);
  assert.equal(catalog.coverage.rawProtectedPromptVisible, false);
  assert.equal(catalog.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(catalog.coverage.walletPrivateMaterialVisible, false);
  assert.match(catalog.artifactRoot, /^telemetry-taxonomy-catalog:[a-f0-9]{24}$/u);

  for (const eventFamily of TELEMETRY_EVENT_FAMILIES) {
    assert.equal(catalog.rows.some((row) => row.eventFamily === eventFamily), true, `missing ${eventFamily}`);
  }

  for (const row of catalog.rows) {
    assert.match(row.taxonomyRoot, /^telemetry-taxonomy-row:[a-f0-9]{24}$/u);
    assert.equal(row.forbiddenPayload.includes('secret_values'), true);
    assert.equal(row.forbiddenPayload.includes('raw_protected_prompts'), true);
    assert.equal(row.forbiddenPayload.includes('unpaid_assetpack_source'), true);
    assert.equal(row.replayExpectation.command, 'pnpm run check:v35-telemetry-taxonomy-catalog');
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);
    assert.ok(row.redactionPosture);
    assert.ok(row.dashboardPanel);
    assert.ok(row.runbookLink);
    assert.ok(row.storageTarget);
    assert.ok(row.alertThreshold);
    assert.ok(row.correlationIds.length > 0);
    assert.ok(row.proofRootFields.length > 0);
  }
});

test('binds inference, value, storage, docs QA, and promotion telemetry boundaries', () => {
  const catalog = buildTelemetryTaxonomyCatalog({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const generation = catalog.rows.find((row) => row.eventFamily === 'thricified_generation');
  const ledger = catalog.rows.find((row) => row.eventFamily === 'ledger');
  const docsQa = catalog.rows.find((row) => row.eventFamily === 'docs_qa');
  const promotion = catalog.rows.find((row) => row.eventFamily === 'promotion');

  assert.ok(generation);
  assert.equal(generation.redactionPosture, 'prompt_roots_context_keys_raw_response_root_and_parsed_type_only');
  assert.equal(generation.proofRootFields.includes('rawResponseRoot'), true);
  assert.equal(generation.forbiddenPayload.includes('raw_model_responses_with_protected_source'), true);

  assert.ok(ledger);
  assert.equal(ledger.storageTarget, 'ledger_journal_and_database_projection');
  assert.equal(ledger.alertThreshold, 'projection_drift_critical');

  assert.ok(docsQa);
  assert.equal(docsQa.sourceRoots.includes('.proofs/v35/documentation-surface-catalog.json'), true);
  assert.equal(docsQa.runbookLink, 'runbook.docs.qa-repair');

  assert.ok(promotion);
  assert.equal(promotion.proofRootFields.includes('provenRoot'), true);
  assert.equal(promotion.sourceRoots.includes('.github/workflows/bitcode-canon-quality.yml'), true);
  assert.equal(catalog.requiredEventFamilies.includes('promotion'), true);
  assert.equal(TELEMETRY_TAXONOMY_CATALOG_ARTIFACT_PATH, '.proofs/v35/telemetry-taxonomy-catalog.json');
});
