import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  CONVERSATION_PROMOTION_READINESS_GATE_ARTIFACT_PATHS,
  CONVERSATION_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  buildConversationPromotionReadinessReport,
  generateCanonicalProvenMarkdown,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V37 ConversationPromotionReadinessReport', () => {
  const report = buildConversationPromotionReadinessReport({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(report.artifactId, 'v37-promotion-readiness-report');
  assert.equal(report.schemaId, 'bitcode.v37.conversationPromotionReadinessReport.v1');
  assert.equal(report.version, 'V37');
  assert.equal(report.currentTarget, 'V36');
  assert.equal(report.passed, true);
  assert.equal(report.sourceSafetyVerdict, 'source-safe-conversation-promotion-readiness-metadata');
  assert.equal(report.prePromotionPosture, 'V36 active / V37 draft');
  assert.equal(report.postPromotionPosture, 'V37 active / V38 draft');
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
  assert.match(report.artifactRoot, /^conversation-promotion-readiness-report:[a-f0-9]{24}$/u);
  assert.equal(
    CONVERSATION_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
    '.bitcode/v37-promotion-readiness-report.json',
  );

  for (const artifactPath of CONVERSATION_PROMOTION_READINESS_GATE_ARTIFACT_PATHS) {
    assert.equal(report.gateArtifactEvidence.some((artifact) => artifact.relativePath === artifactPath), true, `missing ${artifactPath}`);
  }
});

test('supports V37 promotion readiness with source-safe Conversations artifacts', () => {
  const result = generateCanonicalProvenMarkdown({
    version: 'V37',
    canonicalCommit: '0'.repeat(40),
    canonicalCommitRecordedAt: '2026-05-24T00:00:00.000Z',
    generatedAt: '2026-05-24T00:00:00.000Z',
    worktreeState: 'clean',
  });

  assert.equal(result.data.version, 'V37');
  assert.equal(result.data.v37.promotionReadinessReport.artifactId, 'v37-promotion-readiness-report');
  assert.equal(result.data.v37.promotionReadinessReport.prePromotionPosture, 'V36 active / V37 draft');
  assert.equal(result.data.v37.promotionReadinessReport.postPromotionPosture, 'V37 active / V38 draft');
  assert.equal(result.data.v37.promotionReadinessReport.passed, true);
  assert.match(result.markdown, /V37 Promotion Readiness/);
  assert.ok(result.artifacts['.bitcode/v37-promotion-readiness-report.json']);
  assert.ok(result.artifacts['.bitcode/v37-canon-posture-drift-report.json']);
});
