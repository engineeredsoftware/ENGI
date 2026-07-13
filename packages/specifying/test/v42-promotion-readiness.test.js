import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  V42_PROMOTION_READINESS_GATE_ARTIFACT_PATHS,
  V42_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  buildV42PromotionReadinessReport,
  generateCanonicalProvenMarkdown,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V42 PromotionReadinessReport', () => {
  const report = buildV42PromotionReadinessReport({
    generatedAt: '2026-05-25T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v42-promotion-readiness-report');
  assert.equal(report.schemaId, 'bitcode.v42.promotionReadinessReport.v1');
  assert.equal(report.version, 'V42');
  assert.equal(report.currentTarget, 'V41');
  assert.equal(report.passed, true);
  assert.equal(report.sourceSafetyVerdict, 'source-safe-v42-reliable-mvp-promotion-readiness-metadata');
  assert.equal(report.prePromotionPosture, 'V41 active / V42 draft');
  assert.equal(report.postPromotionPosture, 'V42 active / V43 draft');
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
  assert.match(report.artifactRoot, /^reliable-mvp-promotion-readiness-report:[a-f0-9]{24}$/u);
  assert.equal(
    V42_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    '.bitcode/v42-promotion-readiness-report.json',
  );

  for (const artifactPath of V42_PROMOTION_READINESS_GATE_ARTIFACT_PATHS) {
    assert.equal(report.gateArtifactEvidence.some((artifact) => artifact.relativePath === artifactPath), true, `missing ${artifactPath}`);
  }
});

test('supports V42 promotion readiness with source-safe reliable MVP artifacts', () => {
  const result = generateCanonicalProvenMarkdown({
    version: 'V42',
    canonicalCommit: '0'.repeat(40),
    canonicalCommitRecordedAt: '2026-05-25T00:00:00.000Z',
    generatedAt: '2026-05-25T00:00:00.000Z',
    worktreeState: 'clean',
  });

  assert.equal(result.data.version, 'V42');
  assert.equal(result.data.v42.promotionReadinessReport.artifactId, 'v42-promotion-readiness-report');
  assert.equal(result.data.v42.promotionReadinessReport.prePromotionPosture, 'V41 active / V42 draft');
  assert.equal(result.data.v42.promotionReadinessReport.postPromotionPosture, 'V42 active / V43 draft');
  assert.equal(result.data.v42.promotionReadinessReport.passed, true);
  assert.match(result.markdown, /V42 Promotion Readiness/);
  assert.ok(result.artifacts['.bitcode/v42-promotion-readiness-report.json']);
  assert.ok(result.artifacts['.bitcode/v42-canon-posture-drift-report.json']);
});
