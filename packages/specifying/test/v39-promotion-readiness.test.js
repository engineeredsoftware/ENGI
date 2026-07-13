import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  V39_COMMERCIAL_READING_PROMOTION_READINESS_GATE_ARTIFACT_PATHS,
  V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  buildV39CommercialReadingPromotionReadinessReport,
  generateCanonicalProvenMarkdown,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V39 CommercialReadingPromotionReadinessReport', () => {
  const report = buildV39CommercialReadingPromotionReadinessReport({
    generatedAt: '2026-05-25T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v39-promotion-readiness-report');
  assert.equal(report.schemaId, 'bitcode.v39.commercialReadingPromotionReadinessReport.v1');
  assert.equal(report.version, 'V39');
  assert.equal(report.currentTarget, 'V38');
  assert.equal(report.passed, true);
  assert.equal(report.sourceSafetyVerdict, 'source-safe-commercial-reading-promotion-readiness-metadata');
  assert.equal(report.prePromotionPosture, 'V38 active / V39 draft');
  assert.equal(report.postPromotionPosture, 'V39 active / V40 draft');
  assert.equal(report.coverage.allGateArtifactsCovered, true);
  assert.equal(report.coverage.allGateArtifactsParseable, true);
  assert.equal(report.coverage.allGateArtifactsSourceSafe, true);
  assert.equal(report.coverage.sourceEvidenceComplete, true);
  assert.equal(report.coverage.documentationEvidenceComplete, true);
  assert.equal(report.coverage.generatedProofOutputsCovered, true);
  assert.equal(report.coverage.promotionWorkflowCovered, true);
  assert.equal(report.coverage.gateQualityWorkflowCovered, true);
  assert.equal(report.coverage.canonQualityWorkflowCovered, true);
  assert.equal(report.coverage.promotionScriptCovered, true);
  assert.equal(report.coverage.specFamilyPromotionScriptCovered, true);
  assert.equal(report.coverage.runtimePromotionScriptCovered, true);
  assert.equal(report.coverage.provenGeneratorCovered, true);
  assert.equal(report.coverage.valueBearingMainnetAdmission, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawProtectedPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.deepEqual(report.coverage.missingGateArtifacts, []);
  assert.deepEqual(report.coverage.unparseableGateArtifacts, []);
  assert.deepEqual(report.coverage.sourceUnsafeGateArtifacts, []);
  assert.match(report.artifactRoot, /^commercial-reading-promotion-readiness-report:[a-f0-9]{24}$/u);
  assert.equal(
    V39_COMMERCIAL_READING_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    '.bitcode/v39-promotion-readiness-report.json',
  );

  for (const artifactPath of V39_COMMERCIAL_READING_PROMOTION_READINESS_GATE_ARTIFACT_PATHS) {
    assert.equal(report.gateArtifactEvidence.some((artifact) => artifact.relativePath === artifactPath), true, `missing ${artifactPath}`);
  }
});

test('supports V39 promotion readiness with source-safe commercial Reading artifacts', () => {
  const result = generateCanonicalProvenMarkdown({
    version: 'V39',
    canonicalCommit: '0'.repeat(40),
    canonicalCommitRecordedAt: '2026-05-25T00:00:00.000Z',
    generatedAt: '2026-05-25T00:00:00.000Z',
    worktreeState: 'clean',
  });

  assert.equal(result.data.version, 'V39');
  assert.equal(result.data.v39.promotionReadinessReport.artifactId, 'v39-promotion-readiness-report');
  assert.equal(result.data.v39.promotionReadinessReport.prePromotionPosture, 'V38 active / V39 draft');
  assert.equal(result.data.v39.promotionReadinessReport.postPromotionPosture, 'V39 active / V40 draft');
  assert.equal(result.data.v39.promotionReadinessReport.passed, true);
  assert.match(result.markdown, /V39 Promotion Readiness/);
  assert.ok(result.artifacts['.bitcode/v39-promotion-readiness-report.json']);
  assert.ok(result.artifacts['.bitcode/v39-canon-posture-drift-report.json']);
});
