import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  V40_PROMOTION_READINESS_GATE_ARTIFACT_PATHS,
  V40_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  buildV40PromotionReadinessReport,
  generateCanonicalProvenMarkdown,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V40 PromotionReadinessReport', () => {
  const report = buildV40PromotionReadinessReport({
    generatedAt: '2026-05-25T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v40-promotion-readiness-report');
  assert.equal(report.schemaId, 'bitcode.v40.promotionReadinessReport.v1');
  assert.equal(report.version, 'V40');
  assert.equal(report.currentTarget, 'V39');
  assert.equal(report.passed, true);
  assert.equal(report.sourceSafetyVerdict, 'source-safe-exhaustive-testing-promotion-readiness-metadata');
  assert.equal(report.prePromotionPosture, 'V39 active / V40 draft');
  assert.equal(report.postPromotionPosture, 'V40 active / V41 draft');
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
  assert.match(report.artifactRoot, /^exhaustive-testing-promotion-readiness-report:[a-f0-9]{24}$/u);
  assert.equal(
    V40_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    '.bitcode/v40-promotion-readiness-report.json',
  );

  for (const artifactPath of V40_PROMOTION_READINESS_GATE_ARTIFACT_PATHS) {
    assert.equal(report.gateArtifactEvidence.some((artifact) => artifact.relativePath === artifactPath), true, `missing ${artifactPath}`);
  }
});

test('supports V40 promotion readiness with source-safe exhaustive testing artifacts', () => {
  const result = generateCanonicalProvenMarkdown({
    version: 'V40',
    canonicalCommit: '0'.repeat(40),
    canonicalCommitRecordedAt: '2026-05-25T00:00:00.000Z',
    generatedAt: '2026-05-25T00:00:00.000Z',
    worktreeState: 'clean',
  });

  assert.equal(result.data.version, 'V40');
  assert.equal(result.data.v40.promotionReadinessReport.artifactId, 'v40-promotion-readiness-report');
  assert.equal(result.data.v40.promotionReadinessReport.prePromotionPosture, 'V39 active / V40 draft');
  assert.equal(result.data.v40.promotionReadinessReport.postPromotionPosture, 'V40 active / V41 draft');
  assert.equal(result.data.v40.promotionReadinessReport.passed, true);
  assert.match(result.markdown, /V40 Promotion Readiness/);
  assert.ok(result.artifacts['.bitcode/v40-promotion-readiness-report.json']);
  assert.ok(result.artifacts['.bitcode/v40-canon-posture-drift-report.json']);
});
