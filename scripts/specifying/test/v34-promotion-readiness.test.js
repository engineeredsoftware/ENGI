import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  PROVEN_GENERATOR_ID,
  generateCanonicalProvenMarkdown,
} from '../src/index.js';

test('supports V34 promotion readiness with source-safe deployment artifacts', () => {
  const result = generateCanonicalProvenMarkdown({
    version: 'V34',
    canonicalCommit: '0123456789abcdef0123456789abcdef01234567',
    canonicalCommitRecordedAt: '2026-05-23T00:00:00.000Z',
    generatedAt: '2026-05-23T00:00:00.000Z',
    worktreeState: 'dirty-preview',
    generatorId: PROVEN_GENERATOR_ID,
    scenarioIds: ['auth-issuer-rollback'],
    branchModes: ['patch'],
  });

  assert.equal(result.data.version, 'V34');
  assert.equal(result.data.v34.promotionReadinessReport.reportId, 'v34-promotion-readiness-report');
  assert.equal(result.data.v34.promotionReadinessReport.passed, true);
  assert.equal(result.data.v34.promotionReadinessReport.sourceSafe, true);
  assert.equal(result.data.v34.promotionReadinessReport.prePromotionPosture, 'V33 active / V34 draft');
  assert.equal(result.data.v34.promotionReadinessReport.postPromotionPosture, 'V34 active / V35 draft');
  assert.equal(result.data.v34.canonicalInputReport.requiredGeneratedArtifactPaths.includes('.bitcode/v34-promotion-readiness-report.json'), true);
  assert.equal(Object.hasOwn(result.artifacts, '.bitcode/v34-promotion-readiness-report.json'), true);
  assert.match(result.markdown, /V34 Promotion Readiness/);
  assert.match(result.artifacts['.bitcode/v34-promotion-readiness-report.json'], /sourceSafe/);
});
