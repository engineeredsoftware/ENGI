import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH,
  DOCUMENTATION_SURFACE_IDS,
  buildDocumentationSurfaceCatalog,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V35 DocumentationSurfaceCatalog rows', () => {
  const catalog = buildDocumentationSurfaceCatalog({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(catalog.artifactId, 'v35-documentation-surface-catalog');
  assert.equal(catalog.schemaId, 'bitcode.v35.documentationSurfaceCatalog.v1');
  assert.equal(catalog.version, 'V35');
  assert.equal(catalog.currentTarget, 'V34');
  assert.equal(catalog.passed, true);
  assert.equal(catalog.sourceSafetyVerdict, 'source-safe-documentation-surface-metadata');
  assert.equal(catalog.coverage.surfaceCount, DOCUMENTATION_SURFACE_IDS.length);
  assert.deepEqual(catalog.coverage.missingRequiredSurfaceIds, []);
  assert.deepEqual(catalog.coverage.missingSourceRoots, []);
  assert.equal(catalog.coverage.publicDocsRepresented, true);
  assert.equal(catalog.coverage.internalDocsRepresented, true);
  assert.equal(catalog.coverage.routeDocsRepresented, true);
  assert.equal(catalog.coverage.packageDocsRepresented, true);
  assert.equal(catalog.coverage.generatedArtifactsRepresented, true);
  assert.equal(catalog.coverage.apiInterfaceDocsRepresented, true);
  assert.equal(catalog.coverage.credentialsSerialized, false);
  assert.equal(catalog.coverage.protectedSourceVisible, false);
  assert.equal(catalog.coverage.legacySourceRoots, false);
  assert.match(catalog.artifactRoot, /^documentation-surface-catalog:[a-f0-9]{24}$/u);

  for (const surfaceId of DOCUMENTATION_SURFACE_IDS) {
    assert.equal(catalog.rows.some((row) => row.surfaceId === surfaceId), true, `missing ${surfaceId}`);
  }

  for (const row of catalog.rows) {
    assert.match(row.rowRoot, /^documentation-surface-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceSafetyClass, 'source_safe_documentation_metadata');
    assert.equal(row.forbiddenContent.includes('secret_values'), true);
    assert.equal(row.forbiddenContent.includes('unpaid_assetpack_source'), true);
    assert.equal(row.freshnessChecks[0].command, 'pnpm run check:v35-documentation-surface-catalog');
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);
  }
});

test('binds public docs and generated artifacts without protected source exposure', () => {
  const catalog = buildDocumentationSurfaceCatalog({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const publicDocs = catalog.rows.find((row) => row.surfaceId === 'public_docs_surface');
  const generatedArtifacts = catalog.rows.find((row) => row.surfaceId === 'generated_artifact_docs');

  assert.ok(publicDocs);
  assert.equal(publicDocs.disclosureClass, 'public_source_safe');
  assert.equal(publicDocs.sourceRoots.includes('uapi/app/docs/bitcode-docs-content.ts'), true);
  assert.equal(publicDocs.linkedGeneratedArtifacts.includes(DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH), true);
  assert.equal(publicDocs.forbiddenContent.includes('protected_source_payloads'), true);

  assert.ok(generatedArtifacts);
  assert.equal(generatedArtifacts.linkedGeneratedArtifacts.includes('.bitcode/v35-spec-family-report.json'), true);
  assert.equal(generatedArtifacts.linkedGeneratedArtifacts.includes(DOCUMENTATION_SURFACE_CATALOG_ARTIFACT_PATH), true);
  assert.equal(generatedArtifacts.proofCoverage.includes('generated-artifact-stability-check'), true);
});
