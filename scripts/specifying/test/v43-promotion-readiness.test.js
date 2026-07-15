import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  V43_PROMOTION_READINESS_GATE_ARTIFACT_PATHS,
  V43_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  buildV43PromotionReadinessReport,
  generateCanonicalProvenMarkdown,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V43 PromotionReadinessReport', () => {
  const report = buildV43PromotionReadinessReport({
    generatedAt: '2026-05-29T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v43-promotion-readiness-report');
  assert.equal(report.schemaId, 'bitcode.v43.promotionReadinessReport.v1');
  assert.equal(report.version, 'V43');
  assert.equal(report.currentTarget, 'V42');
  assert.equal(report.passed, true);
  assert.equal(report.sourceSafetyVerdict, 'source-safe-v43-product-routes-agentic-depositing-promotion-metadata');
  assert.equal(report.prePromotionPosture, 'V42 active / V43 draft');
  assert.equal(report.postPromotionPosture, 'V43 active / V44 draft');
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
  assert.match(report.artifactRoot, /^v43-product-route-promotion-readiness-report:[a-f0-9]{24}$/u);
  assert.equal(
    V43_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    '.bitcode/v43-promotion-readiness-report.json',
  );

  for (const artifactPath of V43_PROMOTION_READINESS_GATE_ARTIFACT_PATHS) {
    assert.equal(report.gateArtifactEvidence.some((artifact) => artifact.relativePath === artifactPath), true, `missing ${artifactPath}`);
  }
});

test('supports V43 promotion readiness with source-safe product routes and agentic depositing artifacts', () => {
  const result = generateCanonicalProvenMarkdown({
    version: 'V43',
    canonicalCommit: '0'.repeat(40),
    canonicalCommitRecordedAt: '2026-05-29T00:00:00.000Z',
    generatedAt: '2026-05-29T00:00:00.000Z',
    worktreeState: 'clean',
  });

  assert.equal(result.data.version, 'V43');
  assert.equal(result.data.v43.promotionReadinessReport.artifactId, 'v43-promotion-readiness-report');
  assert.equal(result.data.v43.promotionReadinessReport.prePromotionPosture, 'V42 active / V43 draft');
  assert.equal(result.data.v43.promotionReadinessReport.postPromotionPosture, 'V43 active / V44 draft');
  assert.equal(result.data.v43.promotionReadinessReport.passed, true);
  assert.match(result.markdown, /V43 Promotion Readiness/);
  assert.ok(result.artifacts['.bitcode/v43-promotion-readiness-report.json']);
  assert.ok(result.artifacts['.bitcode/v43-canon-posture-drift-report.json']);
});
