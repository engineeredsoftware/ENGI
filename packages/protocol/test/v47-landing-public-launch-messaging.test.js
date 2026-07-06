import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';
import {
  V47_LANDING_MESSAGING_FORBIDDEN_PAYLOAD_IDS,
  V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH,
  V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ROWS,
  V47_LANDING_PUBLIC_LAUNCH_MESSAGING_SCHEMA_ID,
  V47_LANDING_PUBLIC_LAUNCH_MESSAGING_SOURCE_SAFETY_VERDICT,
  V47_LAUNCH_MESSAGE_IDS,
  V47_LAUNCH_MESSAGE_SURFACE_IDS,
  V47_PRESERVED_V46_CLAIM_TOKEN_IDS,
  buildV47LandingPublicLaunchMessaging,
} from '../src/canonical/v47-landing-public-launch-messaging.js';

test('V47 landing/public launch messaging binds the launch narrative surfaces', () => {
  const report = buildV47LandingPublicLaunchMessaging();

  assert.equal(
    V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ARTIFACT_PATH,
    '.bitcode/v47-landing-public-launch-messaging.json',
  );
  assert.equal(report.artifactId, 'v47-landing-public-launch-messaging');
  assert.equal(report.schemaId, V47_LANDING_PUBLIC_LAUNCH_MESSAGING_SCHEMA_ID);
  assert.equal(report.version, 'V47');
  assert.equal(report.currentTarget, 'V46');
  assert.equal(report.sourceSafetyVerdict, V47_LANDING_PUBLIC_LAUNCH_MESSAGING_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v47-landing-public-launch-messaging:'));
  assert.deepEqual(report.messageIds, [...V47_LAUNCH_MESSAGE_IDS]);
  assert.deepEqual(report.surfaceIds, [...V47_LAUNCH_MESSAGE_SURFACE_IDS]);
  assert.deepEqual(report.preservedClaimTokenIds, [...V47_PRESERVED_V46_CLAIM_TOKEN_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V47_LANDING_MESSAGING_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.completionRows.length, V47_LANDING_PUBLIC_LAUNCH_MESSAGING_ROWS.length);
  assert.ok(report.completionRows.some((row) => row.rowId === 'testnet-meaning-messaging' && row.route === '/'));
  assert.ok(report.completionRows.some((row) => row.rowId === 'public-docs-testnet-card' && row.route === '/docs'));
  assert.ok(
    report.completionRows.some((row) => row.rowId === 'v46-claim-boundary-preservation' && row.route === '/'),
  );
});

test('V47 landing/public launch messaging preserves source-safe claim boundaries', () => {
  const report = buildV47LandingPublicLaunchMessaging();

  assert.equal(report.passed, true);
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.equal(report.coverage.requiredPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.passedPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.testnetMeaningComplete, true);
  assert.equal(report.coverage.coreFlowMessagingComplete, true);
  assert.equal(report.coverage.proofBackedTrustComplete, true);
  assert.equal(report.coverage.sourceSafePositioningComplete, true);
  assert.equal(report.coverage.docsTestnetCardComplete, true);
  assert.equal(report.coverage.v46ClaimBoundariesPreserved, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.valueBearingMainnetEnabled, false);
});
