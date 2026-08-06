import assert from 'node:assert/strict';
import { test } from './era-pinned-superseded-routes.js';
import {
  V47_DEFERRED_SURFACE_IDS,
  V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH,
  V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_SCHEMA_ID,
  V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_SOURCE_SAFETY_VERDICT,
  V47_FEATURE_EXCESS_FORBIDDEN_PAYLOAD_IDS,
  V47_FEATURE_POLICY_IDS,
  V47_LAUNCH_ROUTE_IDS,
  V47_SUPPORTING_SURFACE_IDS,
  buildV47FeatureExcessAlignmentAudit,
} from '../src/canonical/v47-feature-excess-alignment-audit.js';

test('V47 feature excess alignment audit binds launch scope and deferred surfaces', () => {
  const report = buildV47FeatureExcessAlignmentAudit();

  assert.equal(V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_ARTIFACT_PATH, '.proofs/v47/feature-excess-alignment-audit.json');
  assert.equal(report.artifactId, 'v47-feature-excess-alignment-audit');
  assert.equal(report.schemaId, V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_SCHEMA_ID);
  assert.equal(report.version, 'V47');
  assert.equal(report.currentTarget, 'V46');
  assert.equal(report.sourceSafetyVerdict, V47_FEATURE_EXCESS_ALIGNMENT_AUDIT_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v47-feature-excess-alignment-audit:'));
  assert.deepEqual(report.launchRouteIds, [...V47_LAUNCH_ROUTE_IDS]);
  assert.deepEqual(report.supportingSurfaceIds, [...V47_SUPPORTING_SURFACE_IDS]);
  assert.deepEqual(report.deferredSurfaceIds, [...V47_DEFERRED_SURFACE_IDS]);
  assert.deepEqual(report.featurePolicyIds, [...V47_FEATURE_POLICY_IDS]);
  assert.deepEqual(report.forbiddenPayloadIds, [...V47_FEATURE_EXCESS_FORBIDDEN_PAYLOAD_IDS]);
  assert.equal(report.auditRows.length, 5);
  assert.equal(report.coverage.websiteLaunchRoutesOnly, true);
  assert.equal(report.coverage.publicNavCurrentRoutesOnly, true);
  assert.equal(report.coverage.launchCtasCurrentRoutesOnly, true);
  assert.equal(report.coverage.btdDetailCurrentRoutesOnly, true);
  assert.equal(report.coverage.exchangeCompatibilityRedirectOnly, true);
  assert.equal(report.coverage.terminalDirectEntryFlaggable, true);
  assert.equal(report.coverage.conversationsDirectEntryFlaggable, true);
  assert.equal(report.coverage.nonWebsiteCommercialSurfacesDeferred, true);
  assert.equal(report.coverage.testnetBtcOnly, true);
  assert.equal(report.coverage.sourceSafePreviewOnly, true);
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.rawSourceTextVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawPromptVisible, false);
  assert.equal(report.coverage.interpolatedPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
  assert.equal(report.coverage.valueBearingMainnetEnabled, false);
});

test('V47 feature excess alignment audit fails closed through source-root predicates', () => {
  const report = buildV47FeatureExcessAlignmentAudit();

  assert.equal(report.passed, true);
  assert.equal(report.coverage.failedPredicateIds.length, 0);
  assert.equal(report.coverage.requiredPredicateCount, report.predicateResults.length);
  assert.equal(report.coverage.passedPredicateCount, report.predicateResults.length);
});
