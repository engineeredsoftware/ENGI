import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  V45_PROMOTION_READINESS_GATE_ARTIFACT_PATHS,
  V45_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  buildV45PromotionReadinessReport,
  generateCanonicalProvenMarkdown,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V45 PromotionReadinessReport', () => {
  const report = buildV45PromotionReadinessReport({
    generatedAt: '2026-05-31T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v45-promotion-readiness-report');
  assert.equal(report.schemaId, 'bitcode.v45.promotionReadinessReport.v1');
  assert.equal(report.version, 'V45');
  assert.equal(report.currentTarget, 'V44');
  assert.equal(report.passed, true);
  assert.equal(report.sourceSafetyVerdict, 'source-safe-v45-knowledge-commoditization-promotion-metadata');
  assert.equal(report.prePromotionPosture, 'V44 active / V45 draft');
  assert.equal(report.postPromotionPosture, 'V45 active / V46 draft');
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
  assert.match(report.artifactRoot, /^v45-knowledge-commoditization-promotion-readiness-report:[a-f0-9]{24}$/u);
  assert.equal(
    V45_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    '.bitcode/v45-promotion-readiness-report.json',
  );

  for (const artifactPath of V45_PROMOTION_READINESS_GATE_ARTIFACT_PATHS) {
    assert.equal(report.gateArtifactEvidence.some((artifact) => artifact.relativePath === artifactPath), true, `missing ${artifactPath}`);
  }
});

test('supports V45 promotion readiness with source-safe knowledge commoditization artifacts', () => {
  const result = generateCanonicalProvenMarkdown({
    version: 'V45',
    canonicalCommit: '0'.repeat(40),
    canonicalCommitRecordedAt: '2026-05-31T00:00:00.000Z',
    generatedAt: '2026-05-31T00:00:00.000Z',
    worktreeState: 'clean',
  });

  assert.equal(result.data.version, 'V45');
  assert.equal(result.data.v45.promotionReadinessReport.artifactId, 'v45-promotion-readiness-report');
  assert.equal(result.data.v45.promotionReadinessReport.prePromotionPosture, 'V44 active / V45 draft');
  assert.equal(result.data.v45.promotionReadinessReport.postPromotionPosture, 'V45 active / V46 draft');
  assert.equal(result.data.v45.promotionReadinessReport.passed, true);
  assert.match(result.markdown, /V45 Promotion Readiness/);
  assert.ok(result.artifacts['.bitcode/v45-promotion-readiness-report.json']);
  assert.ok(result.artifacts['.bitcode/v45-canon-posture-drift-report.json']);
});
