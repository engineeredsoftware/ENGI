import assert from 'node:assert/strict';
import test from './era-pinned-superseded-routes.js';

import {
  V44_DEPOSITOR_DEMAND_OPPORTUNITY_STATE_IDS,
  V44_DEPOSITOR_EARNINGS_SUPPLY_FORBIDDEN_PAYLOAD_IDS,
  V44_DEPOSITOR_EARNINGS_SUPPLY_OBJECT_IDS,
  V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_ARTIFACT_PATH,
  V44_DEPOSITOR_EARNINGS_SUPPLY_ROWS,
  V44_DEPOSITOR_EARNING_STATE_IDS,
  V44_DEPOSITOR_SUPPLY_RECOMMENDATION_IDS,
  buildV44DepositorEarningsSupplyOpportunities,
} from '../src/canonical/v44-depositor-earnings-supply-opportunities.js';

test('V44 Depositor earnings supply opportunities bind source-safe deposit-side economics', () => {
  const artifact = buildV44DepositorEarningsSupplyOpportunities();

  assert.equal(artifact.artifactId, 'v44-depositor-earnings-supply-opportunities');
  assert.equal(artifact.schemaId, 'bitcode.v44.depositorEarningsSupplyOpportunities.v1');
  assert.equal(artifact.version, 'V44');
  assert.equal(artifact.currentTarget, 'V43');
  assert.equal(artifact.passed, true);
  assert.match(artifact.artifactRoot, /^v44-depositor-earnings-supply-opportunities:[a-f0-9]{24}$/u);
  assert.equal(artifact.objectIds.length, V44_DEPOSITOR_EARNINGS_SUPPLY_OBJECT_IDS.length);
  assert.equal(artifact.earningStateIds.length, V44_DEPOSITOR_EARNING_STATE_IDS.length);
  assert.equal(artifact.recommendationIds.length, V44_DEPOSITOR_SUPPLY_RECOMMENDATION_IDS.length);
  assert.equal(artifact.demandOpportunityStateIds.length, V44_DEPOSITOR_DEMAND_OPPORTUNITY_STATE_IDS.length);
  assert.equal(artifact.rows.length, V44_DEPOSITOR_EARNINGS_SUPPLY_ROWS.length);
  assert.equal(artifact.sourceRoots.earningSupplyIntelligence.startsWith('packages/asset-packs-pipelines/domain/src/depositor-earning-supply-intelligence.ts:'), true);
  assert.equal(artifact.sourceRoots.depositClient.startsWith('apps/uapi/components/deposits/DepositPageClient/DepositPageClient.tsx:'), true);
  assert.equal(artifact.coverage.depositorEarningSupplyIntelligenceImplemented, true);
  assert.equal(artifact.coverage.likelyDemandImplemented, true);
  assert.equal(artifact.coverage.unfitNeedOpportunitiesImplemented, true);
  assert.equal(artifact.coverage.expectedCompensationRangesImplemented, true);
  assert.equal(artifact.coverage.earningStatementsImplemented, true);
  assert.equal(artifact.coverage.sourceSafeSupplyRecommendationsImplemented, true);
  assert.equal(artifact.coverage.depositRouteUiImplemented, true);
  assert.equal(artifact.coverage.failedPredicateIds.length, 0);
});

test('V44 Depositor earnings supply opportunities rows remain source-safe', () => {
  const artifact = buildV44DepositorEarningsSupplyOpportunities();

  assert.equal(artifact.coverage.sourceSafeMetadataOnly, true);
  assert.equal(artifact.coverage.protectedSourceVisible, false);
  assert.equal(artifact.coverage.rawSourceTextVisible, false);
  assert.equal(artifact.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(artifact.coverage.rawPromptVisible, false);
  assert.equal(artifact.coverage.rawProviderResponseVisible, false);
  assert.equal(artifact.coverage.walletPrivateMaterialVisible, false);
  assert.equal(artifact.coverage.settlementPrivatePayloadVisible, false);
  assert.equal(artifact.coverage.valueBearingMainnetAdmitted, false);
  assert.equal(artifact.forbiddenPayloadIds.length, V44_DEPOSITOR_EARNINGS_SUPPLY_FORBIDDEN_PAYLOAD_IDS.length);
  assert.equal(artifact.rows.every((row) => row.sourceSafeMetadataOnly), true);
  assert.equal(artifact.rows.every((row) => row.protectedSourceVisible === false), true);
  assert.equal(artifact.rows.every((row) => row.unpaidAssetPackSourceVisible === false), true);
  assert.equal(artifact.sourceSafetyVerdict, 'source-safe-depositor-earnings-supply-opportunity-metadata');
  assert.equal(V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_ARTIFACT_PATH, '.bitcode/v44-depositor-earnings-supply-opportunities.json');
});
