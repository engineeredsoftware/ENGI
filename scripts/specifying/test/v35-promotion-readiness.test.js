import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_GATE_ARTIFACT_PATHS,
  DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  buildDocumentationTelemetryPromotionReadinessReport,
  generateCanonicalProvenMarkdown,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V35 DocumentationTelemetryPromotionReadinessReport', () => {
  const report = buildDocumentationTelemetryPromotionReadinessReport({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v35-documentation-telemetry-promotion-readiness-report');
  assert.equal(report.schemaId, 'bitcode.v35.documentationTelemetryPromotionReadinessReport.v1');
  assert.equal(report.version, 'V35');
  assert.equal(report.currentTarget, 'V34');
  assert.equal(report.passed, true);
  assert.equal(report.sourceSafetyVerdict, 'source-safe-promotion-readiness-metadata');
  assert.equal(report.prePromotionPosture, 'V34 active / V35 draft');
  assert.equal(report.postPromotionPosture, 'V35 active / V36 draft');
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
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.deepEqual(report.coverage.missingGateArtifacts, []);
  assert.deepEqual(report.coverage.unparseableGateArtifacts, []);
  assert.deepEqual(report.coverage.sourceUnsafeGateArtifacts, []);
  assert.match(report.artifactRoot, /^documentation-telemetry-promotion-readiness-report:[a-f0-9]{24}$/u);
  assert.equal(
    DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    '.bitcode/v35-documentation-telemetry-promotion-readiness-report.json',
  );

  for (const artifactPath of DOCUMENTATION_TELEMETRY_PROMOTION_READINESS_GATE_ARTIFACT_PATHS) {
    assert.equal(report.gateArtifactEvidence.some((artifact) => artifact.relativePath === artifactPath), true, `missing ${artifactPath}`);
  }
});

test('supports V35 promotion readiness with source-safe telemetry documentation artifacts', () => {
  const result = generateCanonicalProvenMarkdown({
    version: 'V35',
    canonicalCommit: '0'.repeat(40),
    canonicalCommitRecordedAt: '2026-05-24T00:00:00.000Z',
    generatedAt: '2026-05-24T00:00:00.000Z',
    worktreeState: 'clean',
  });

  assert.equal(result.data.version, 'V35');
  assert.equal(result.data.v35.promotionReadinessReport.artifactId, 'v35-documentation-telemetry-promotion-readiness-report');
  assert.equal(result.data.v35.promotionReadinessReport.prePromotionPosture, 'V34 active / V35 draft');
  assert.equal(result.data.v35.promotionReadinessReport.postPromotionPosture, 'V35 active / V36 draft');
  assert.equal(result.data.v35.promotionReadinessReport.passed, true);
  assert.match(result.markdown, /V35 Promotion Readiness/);
  assert.ok(result.artifacts['.bitcode/v35-documentation-telemetry-promotion-readiness-report.json']);
  assert.ok(result.artifacts['.bitcode/v35-canon-posture-drift-report.json']);
});
