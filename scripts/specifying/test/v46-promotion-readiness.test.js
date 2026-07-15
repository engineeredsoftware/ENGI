import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  V46_PROMOTION_READINESS_GATE_ARTIFACT_PATHS,
  V46_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  buildV46PromotionReadinessReport,
  generateCanonicalProvenMarkdown,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V46 PromotionReadinessReport', () => {
  const report = buildV46PromotionReadinessReport({
    generatedAt: '2026-06-02T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v46-promotion-readiness-report');
  assert.equal(report.schemaId, 'bitcode.v46.promotionReadinessReport.v1');
  assert.equal(report.version, 'V46');
  assert.equal(report.currentTarget, 'V45');
  assert.equal(report.passed, true);
  assert.equal(report.sourceSafetyVerdict, 'source-safe-v46-protocol-comprehension-promotion-metadata');
  assert.equal(report.prePromotionPosture, 'V45 active / V46 draft');
  assert.equal(report.postPromotionPosture, 'V46 active / V47 draft');
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
  assert.match(report.artifactRoot, /^v46-protocol-comprehension-promotion-readiness-report:[a-f0-9]{24}$/u);
  assert.equal(
    V46_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    '.bitcode/v46-promotion-readiness-report.json',
  );

  for (const artifactPath of V46_PROMOTION_READINESS_GATE_ARTIFACT_PATHS) {
    assert.equal(report.gateArtifactEvidence.some((artifact) => artifact.relativePath === artifactPath), true, `missing ${artifactPath}`);
  }
});

test('supports V46 promotion readiness with source-safe protocol comprehension artifacts', () => {
  const result = generateCanonicalProvenMarkdown({
    version: 'V46',
    canonicalCommit: '0'.repeat(40),
    canonicalCommitRecordedAt: '2026-06-02T00:00:00.000Z',
    generatedAt: '2026-06-02T00:00:00.000Z',
    worktreeState: 'clean',
  });

  assert.equal(result.data.version, 'V46');
  assert.equal(result.data.v46.promotionReadinessReport.artifactId, 'v46-promotion-readiness-report');
  assert.equal(result.data.v46.promotionReadinessReport.prePromotionPosture, 'V45 active / V46 draft');
  assert.equal(result.data.v46.promotionReadinessReport.postPromotionPosture, 'V46 active / V47 draft');
  assert.equal(result.data.v46.promotionReadinessReport.passed, true);
  assert.match(result.markdown, /V46 Promotion Readiness/);
  assert.ok(result.artifacts['.bitcode/v46-promotion-readiness-report.json']);
  assert.ok(result.artifacts['.bitcode/v46-canon-posture-drift-report.json']);
});
