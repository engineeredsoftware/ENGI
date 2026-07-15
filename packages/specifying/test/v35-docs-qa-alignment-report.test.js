import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from './era-pinned-superseded-routes.js';

import {
  DOCS_QA_ALIGNMENT_IDS,
  DOCS_QA_ALIGNMENT_REPORT_ARTIFACT_PATH,
  buildDocsQaAlignmentReport,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V35 DocsQaAlignmentReport rows', () => {
  const report = buildDocsQaAlignmentReport({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v35-docs-qa-alignment-report');
  assert.equal(report.schemaId, 'bitcode.v35.docsQaAlignmentReport.v1');
  assert.equal(report.version, 'V35');
  assert.equal(report.currentTarget, 'V34');
  assert.equal(report.passed, true);
  assert.equal(report.sourceSafetyVerdict, 'source-safe-docs-qa-metadata');
  assert.equal(report.coverage.alignmentCount, DOCS_QA_ALIGNMENT_IDS.length);
  assert.deepEqual(report.coverage.missingAlignmentIds, []);
  assert.deepEqual(report.coverage.missingSourceRoots, []);
  assert.deepEqual(report.coverage.staleTokenBlockers, []);
  assert.deepEqual(report.coverage.missingGeneratedArtifacts, []);
  assert.deepEqual(report.coverage.unsupportedDisclosureClaims, []);
  assert.equal(report.coverage.allRequiredAlignmentsCovered, true);
  assert.equal(report.coverage.specFamilyRepresented, true);
  assert.equal(report.coverage.roadmapReadmeRepresented, true);
  assert.equal(report.coverage.generatedArtifactInventoryRepresented, true);
  assert.equal(report.coverage.catalogImplementationRepresented, true);
  assert.equal(report.coverage.publicDocsRepresented, true);
  assert.equal(report.coverage.internalDocsRepresented, true);
  assert.equal(report.coverage.routeDocsRepresented, true);
  assert.equal(report.coverage.interfaceDocsRepresented, true);
  assert.equal(report.coverage.generatedProofRepresented, true);
  assert.equal(report.coverage.workflowCheckerRepresented, true);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawProtectedPromptVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.match(report.artifactRoot, /^docs-qa-alignment-report:[a-f0-9]{24}$/u);

  for (const alignmentId of DOCS_QA_ALIGNMENT_IDS) {
    assert.equal(report.rows.some((row) => row.alignmentId === alignmentId), true, `missing ${alignmentId}`);
  }

  for (const row of report.rows) {
    assert.match(row.alignmentRoot, /^docs-qa-alignment-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);
    assert.deepEqual(row.missingTokens, []);
    assert.deepEqual(row.missingGeneratedArtifacts, []);
    assert.deepEqual(row.unsupportedDisclosureClaims, []);
    assert.ok(row.expectedTokens.length > 0);
    assert.ok(row.observedTokens.length > 0);
    assert.ok(row.checkedSources.length > 0);
    assert.ok(row.repairCommand.length > 0);
    assert.equal(row.validationCommand, 'pnpm run check:v35-gate6');
    assert.ok(row.failClosedResult.includes('blocked'));
    assert.ok(row.forbiddenPayload.includes('secret_values'));
    assert.ok(row.forbiddenPayload.includes('unpaid_assetpack_source'));
  }
});

test('binds docs QA to spec docs artifacts routes interfaces and workflows', () => {
  const report = buildDocsQaAlignmentReport({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const byAlignmentId = new Map(report.rows.map((row) => [row.alignmentId, row]));

  assert.ok(byAlignmentId.get('spec_family_alignment')?.expectedTokens.includes('DocsQaAlignmentReport'));
  assert.ok(byAlignmentId.get('generated_artifact_inventory_alignment')?.generatedArtifacts.includes('.bitcode/v35-docs-qa-alignment-report.json'));
  assert.ok(byAlignmentId.get('generated_artifact_inventory_alignment')?.generatedArtifacts.includes('.bitcode/v35-testnet-rollout-readiness-guide.json'));
  assert.ok(byAlignmentId.get('generated_artifact_inventory_alignment')?.generatedArtifacts.includes('.bitcode/v35-telemetry-documentation-interface-integration.json'));
  assert.ok(byAlignmentId.get('generated_artifact_inventory_alignment')?.generatedArtifacts.includes('.bitcode/v35-local-staging-telemetry-documentation-rehearsal.json'));
  assert.ok(byAlignmentId.get('catalog_implementation_alignment')?.expectedTokens.includes('buildOperatorRunbookCatalog'));
  assert.ok(byAlignmentId.get('catalog_implementation_alignment')?.expectedTokens.includes('buildTestnetRolloutReadinessGuide'));
  assert.ok(byAlignmentId.get('catalog_implementation_alignment')?.expectedTokens.includes('buildTelemetryDocumentationInterfaceIntegration'));
  assert.ok(byAlignmentId.get('catalog_implementation_alignment')?.expectedTokens.includes('buildLocalStagingTelemetryDocumentationRehearsal'));
  assert.ok(byAlignmentId.get('public_docs_disclosure_alignment')?.checkedSources.includes('apps/uapi/app/docs/bitcode-docs-content.ts'));
  assert.ok(byAlignmentId.get('internal_docs_alignment')?.checkedSources.includes('internal-docs/README.md'));
  assert.ok(byAlignmentId.get('route_docs_alignment')?.checkedSources.includes('packages/api/README.md'));
  assert.ok(byAlignmentId.get('interface_docs_alignment')?.checkedSources.includes('apps/chatgpt/README.md'));
  assert.ok(byAlignmentId.get('generated_proof_appendix_alignment')?.expectedTokens.includes('BITCODE_SPEC_V35_PROVEN.md'));
  assert.ok(byAlignmentId.get('workflow_checker_alignment')?.expectedTokens.includes('check:v35-gate6'));
  assert.ok(byAlignmentId.get('workflow_checker_alignment')?.expectedTokens.includes('check:v35-gate8'));
  assert.ok(byAlignmentId.get('workflow_checker_alignment')?.expectedTokens.includes('check:v35-gate9'));
  assert.equal(
    report.disclosureBoundary.forbiddenDocsQaData.includes('protected_source_payloads'),
    true,
  );
  assert.equal(DOCS_QA_ALIGNMENT_REPORT_ARTIFACT_PATH, '.bitcode/v35-docs-qa-alignment-report.json');
});
