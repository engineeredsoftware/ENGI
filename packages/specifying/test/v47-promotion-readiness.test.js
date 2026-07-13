import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V47_PROMOTION_READINESS_GATE_ARTIFACT_PATHS,
  V47_PROMOTION_READINESS_GENERATED_OUTPUTS,
  V47_PROMOTION_READINESS_REPORT_ARTIFACT_PATH,
  V47_PROMOTION_READINESS_REPORT_SCHEMA_ID,
  V47_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT,
  buildV47PromotionReadinessReport,
  listMissingV47PromotionReadinessSources,
} from '../src/canonical/v47-promotion-readiness-report.js';

test('builds source-safe V47 PromotionReadinessReport for V47 Promotion Readiness', () => {
  const report = buildV47PromotionReadinessReport();

  assert.equal(V47_PROMOTION_READINESS_REPORT_ARTIFACT_PATH, '.bitcode/v47-promotion-readiness-report.json');
  assert.equal(report.artifactId, 'v47-promotion-readiness-report');
  assert.equal(report.schemaId, V47_PROMOTION_READINESS_REPORT_SCHEMA_ID);
  assert.equal(report.version, 'V47');
  assert.equal(report.currentTarget, 'V46');
  assert.equal(report.sourceSafetyVerdict, V47_PROMOTION_READINESS_SOURCE_SAFETY_VERDICT);
  assert.equal(report.prePromotionPosture, 'V46 active / V47 draft');
  assert.equal(report.postPromotionPosture, 'V47 active / V48 draft');
  assert.equal(report.branchProtection.versionBranch, 'version/v47');
  assert.equal(report.branchProtection.versionPromotionPullRequestTitlePrefix, 'V47 Canonical Promotion');
  assert.equal(report.generatedArtifactPolicy.provenAppendixPath, 'BITCODE_SPEC_V47_PROVEN.md');
  assert.equal(report.coverage.gateArtifactCount, V47_PROMOTION_READINESS_GATE_ARTIFACT_PATHS.length);
  assert.deepEqual(report.coverage.generatedProofOutputs, [...V47_PROMOTION_READINESS_GENERATED_OUTPUTS]);
  assert.ok(report.validationCommands.includes('pnpm run check:v47-gate10'));
  assert.ok(
    report.validationCommands.includes('node scripts/promote-bitcode-canon.mjs --version V47 --commit HEAD --dry-run'),
  );
  assert.ok(report.artifactRoot.startsWith('v47-commercial-website-testnet-launch-promotion-readiness-report:'));
});

test('V47 PromotionReadinessReport passes with complete evidence and source-safe coverage', () => {
  const report = buildV47PromotionReadinessReport();

  assert.deepEqual(listMissingV47PromotionReadinessSources(), []);
  assert.equal(report.passed, true, `unexpected failures: ${report.failures.join('; ')}`);
  assert.equal(report.failures.length, 0);
  assert.equal(report.coverage.sourceEvidenceComplete, true);
  assert.equal(report.coverage.documentationEvidenceComplete, true);
  assert.equal(report.coverage.allGateArtifactsCovered, true);
  assert.equal(report.coverage.allGateArtifactsParseable, true);
  assert.equal(report.coverage.allGateArtifactsSourceSafe, true);
  assert.equal(report.coverage.promotionWorkflowCovered, true);
  assert.equal(report.coverage.promotionScriptCovered, true);
  assert.equal(report.coverage.provenGeneratorCovered, true);
  assert.equal(report.coverage.valueBearingMainnetAdmission, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
});
