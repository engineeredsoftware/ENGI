import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  PROVEN_GENERATOR_ID,
  generateCanonicalProvenMarkdown,
} from '../src/index.js';

test('supports V32 promotion proof generation hardening with source-safe generated artifact diffs', () => {
  const result = generateCanonicalProvenMarkdown({
    version: 'V32',
    canonicalCommit: '0123456789abcdef0123456789abcdef01234567',
    canonicalCommitRecordedAt: '2026-05-22T00:00:00.000Z',
    generatedAt: '2026-05-22T00:00:00.000Z',
    worktreeState: 'dirty-preview',
    generatorId: PROVEN_GENERATOR_ID,
    scenarioIds: ['auth-issuer-rollback'],
    branchModes: ['patch'],
  });

  assert.equal(result.data.version, 'V32');
  assert.equal(result.data.v32.promotionProofGenerationHardening.reportId, 'v32-promotion-proof-generation-hardening');
  assert.equal(result.data.v32.promotionProofGenerationHardening.passed, true);
  assert.equal(result.data.v32.promotionProofGenerationHardening.sourceSafe, true);
  assert.equal(result.data.v32.promotionProofGenerationHardening.modes.check.outputClass, 'source-safe generated artifact diffs');
  assert.equal(result.data.v32.promotionProofGenerationHardening.branchProtection.directMainPushAdmitted, false);
  assert.equal(result.data.v32.canonicalInputReport.requiredGeneratedArtifactPaths.includes('.bitcode/v32-promotion-proof-generation-hardening.json'), true);
  assert.equal(result.data.v32.promotionReadinessReport.reportId, 'v32-promotion-readiness-report');
  assert.equal(result.data.v32.promotionReadinessReport.sourceSafe, true);
  assert.deepEqual(
    result.data.v32.promotionReadinessReport.failures,
    result.data.v32.draftPreview
      ? [
          'scripts/specifying/README.md is missing Gate 10 token V32 Gate 10',
          'scripts/specifying/README.md is missing Gate 10 token V32` active, `V33` draft',
        ]
      : [],
  );
  assert.equal(result.data.v32.promotionReadinessReport.passed, result.data.v32.draftPreview ? false : true);
  assert.equal(result.data.v32.promotionReadinessReport.postPromotionPosture, 'V32 active / V33 draft');
  assert.equal(result.data.v32.canonicalInputReport.requiredGeneratedArtifactPaths.includes('.bitcode/v32-promotion-readiness-report.json'), true);
  assert.equal(Object.hasOwn(result.artifacts, '.bitcode/v32-promotion-proof-generation-hardening.json'), true);
  assert.equal(Object.hasOwn(result.artifacts, '.bitcode/v32-promotion-readiness-report.json'), true);
  assert.match(result.markdown, /v32PromotionProofGenerationHardeningPassed/);
  assert.match(result.artifacts['.bitcode/v32-promotion-proof-generation-hardening.json'], /source-safe generated artifact diffs/);
  assert.match(result.artifacts['.bitcode/v32-promotion-readiness-report.json'], /source-safe/);
});
