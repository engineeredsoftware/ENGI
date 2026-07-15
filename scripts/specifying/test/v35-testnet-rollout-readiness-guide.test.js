import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  TESTNET_ROLLOUT_GUIDE_IDS,
  TESTNET_ROLLOUT_LANE_IDS,
  TESTNET_ROLLOUT_READINESS_GUIDE_ARTIFACT_PATH,
  buildTestnetRolloutReadinessGuide,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V35 TestnetRolloutReadinessGuide rows', () => {
  const guide = buildTestnetRolloutReadinessGuide({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(guide.artifactId, 'v35-testnet-rollout-readiness-guide');
  assert.equal(guide.schemaId, 'bitcode.v35.testnetRolloutReadinessGuide.v1');
  assert.equal(guide.version, 'V35');
  assert.equal(guide.currentTarget, 'V34');
  assert.equal(guide.passed, true);
  assert.equal(guide.sourceSafetyVerdict, 'source-safe-rollout-guide-metadata');
  assert.equal(guide.coverage.guideCount, TESTNET_ROLLOUT_GUIDE_IDS.length);
  assert.equal(guide.coverage.laneCount, TESTNET_ROLLOUT_LANE_IDS.length);
  assert.deepEqual(guide.coverage.missingGuideIds, []);
  assert.deepEqual(guide.coverage.missingLaneIds, []);
  assert.deepEqual(guide.coverage.missingSourceRoots, []);
  assert.deepEqual(guide.coverage.rowsMissingCommands, []);
  assert.deepEqual(guide.coverage.rowsMissingExamples, []);
  assert.deepEqual(guide.coverage.rowsMissingBlockers, []);
  assert.deepEqual(guide.coverage.rowsMissingRehearsalEvidence, []);
  assert.deepEqual(guide.coverage.rowsMissingValidation, []);
  assert.equal(guide.coverage.allRequiredGuidesCovered, true);
  assert.equal(guide.coverage.allRequiredLanesCovered, true);
  assert.equal(guide.coverage.localDistinguished, true);
  assert.equal(guide.coverage.stagingTestnetDistinguished, true);
  assert.equal(guide.coverage.publicTestnetDistinguished, true);
  assert.equal(guide.coverage.mainnetReadyDryRunDistinguished, true);
  assert.equal(guide.coverage.valueBearingMainnetVisibleAndBlocked, true);
  assert.equal(guide.coverage.credentialsSerialized, false);
  assert.equal(guide.coverage.protectedSourceVisible, false);
  assert.equal(guide.coverage.rawProtectedPromptVisible, false);
  assert.equal(guide.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(guide.coverage.walletPrivateMaterialVisible, false);
  assert.match(guide.artifactRoot, /^testnet-rollout-readiness-guide:[a-f0-9]{24}$/u);

  for (const guideId of TESTNET_ROLLOUT_GUIDE_IDS) {
    assert.equal(guide.rows.some((row) => row.guideId === guideId), true, `missing ${guideId}`);
  }

  for (const row of guide.rows) {
    assert.match(row.guideRoot, /^testnet-rollout-guide-row:[a-f0-9]{24}$/u);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);
    assert.ok(row.workflowStages.length > 0);
    assert.ok(row.reproducibleCommands.length > 0);
    assert.ok(row.guideExamples.length > 0);
    assert.ok(row.knownBlockers.length > 0);
    assert.ok(row.rehearsalEvidence.length > 0);
    assert.ok(row.validationCommands.length > 0);
    assert.ok(row.failClosedResult.includes('blocks'));
    assert.ok(row.forbiddenDisclosure.includes('secret_values'));
    assert.ok(row.forbiddenDisclosure.includes('unpaid_assetpack_source'));
  }
});

test('distinguishes rollout audiences lanes caveats blockers and rehearsal evidence', () => {
  const guide = buildTestnetRolloutReadinessGuide({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const byGuideId = new Map(guide.rows.map((row) => [row.guideId, row]));

  assert.ok(byGuideId.get('contributor_onboarding')?.sourceRoots.includes('AGENTS.md'));
  assert.ok(
    byGuideId
      .get('local_development')
      ?.reproducibleCommands.includes(
        'pnpm --filter @bitcode/specifying test -- --test-name-pattern specifying-package-boundary',
      ),
  );
  assert.ok(byGuideId.get('operator_use')?.rehearsalEvidence.includes('.bitcode/v35-operator-runbook-catalog.json'));
  assert.ok(byGuideId.get('enterprise_reader_flow')?.workflowStages.includes('review-assetpack-preview'));
  assert.ok(byGuideId.get('depositor_flow')?.knownBlockers.includes('protected source visible in rollout docs'));
  assert.ok(byGuideId.get('interface_consumer_flow')?.sourceRoots.includes('apps/chatgpt/README.md'));
  assert.deepEqual(byGuideId.get('environment_lane_posture')?.laneIds, TESTNET_ROLLOUT_LANE_IDS);
  assert.ok(byGuideId.get('wallet_settlement_caveats')?.workflowStages.includes('rights-transfer-readback'));
  assert.ok(byGuideId.get('known_blockers')?.knownBlockers.includes('mainnet value-bearing admission requested before future canon'));
  assert.ok(byGuideId.get('rehearsal_evidence')?.rehearsalEvidence.includes('.bitcode/v34-promotion-readiness-report.json'));
  assert.equal(guide.lanePosture.valueBearingMainnet, 'blocked_future_canon_required');
  assert.equal(
    guide.disclosureBoundary.forbiddenRolloutData.includes('wallet_private_material'),
    true,
  );
  assert.equal(TESTNET_ROLLOUT_READINESS_GUIDE_ARTIFACT_PATH, '.bitcode/v35-testnet-rollout-readiness-guide.json');
});
