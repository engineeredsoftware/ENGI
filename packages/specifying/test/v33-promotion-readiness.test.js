import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  PROVEN_GENERATOR_ID,
  generateCanonicalProvenMarkdown,
} from '../src/index.js';

test('supports V33 promotion readiness with source-safe interface artifacts', () => {
  const result = generateCanonicalProvenMarkdown({
    version: 'V33',
    canonicalCommit: '0123456789abcdef0123456789abcdef01234567',
    canonicalCommitRecordedAt: '2026-05-22T00:00:00.000Z',
    generatedAt: '2026-05-22T00:00:00.000Z',
    worktreeState: 'dirty-preview',
    generatorId: PROVEN_GENERATOR_ID,
    scenarioIds: ['auth-issuer-rollback'],
    branchModes: ['patch'],
  });

  assert.equal(result.data.version, 'V33');
  assert.equal(result.data.v33.promotionReadinessReport.reportId, 'v33-promotion-readiness-report');
  assert.deepEqual(
    result.data.v33.promotionReadinessReport.failures,
    result.data.v33.draftPreview
      ? [
          'packages/specifying/README.md is missing Gate 10 token V33 Gate 10',
          'packages/specifying/README.md is missing Gate 10 token V33` active, `V34` draft',
        ]
      : [],
  );
  assert.equal(result.data.v33.promotionReadinessReport.passed, result.data.v33.draftPreview ? false : true);
  assert.equal(result.data.v33.promotionReadinessReport.sourceSafe, true);
  assert.equal(result.data.v33.promotionReadinessReport.postPromotionPosture, 'V33 active / V34 draft');
  assert.equal(result.data.v33.canonicalInputReport.requiredGeneratedArtifactPaths.includes('.bitcode/v33-promotion-readiness-report.json'), true);
  assert.equal(Object.hasOwn(result.artifacts, '.bitcode/v33-promotion-readiness-report.json'), true);
  assert.match(result.markdown, /V33 Promotion Readiness/);
  assert.match(result.artifacts['.bitcode/v33-promotion-readiness-report.json'], /sourceSafe/);
});
