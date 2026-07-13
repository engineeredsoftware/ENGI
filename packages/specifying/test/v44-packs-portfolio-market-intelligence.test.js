import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  V44_PACKS_MARKET_FACET_IDS,
  V44_PACKS_MARKET_SIGNAL_IDS,
  V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_ARTIFACT_PATH,
  V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_SCHEMA_ID,
  V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_SOURCE_SAFETY_VERDICT,
  V44_PACKS_PORTFOLIO_VIEW_IDS,
  buildV44PacksPortfolioMarketIntelligence,
} from '../src/canonical/v44-packs-portfolio-market-intelligence.js';

test('V44 Packs portfolio market intelligence binds source-safe route operation', () => {
  const report = buildV44PacksPortfolioMarketIntelligence();

  assert.equal(
    V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_ARTIFACT_PATH,
    '.bitcode/v44-packs-portfolio-market-intelligence.json',
  );
  assert.equal(report.artifactId, 'v44-packs-portfolio-market-intelligence');
  assert.equal(report.schemaId, V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_SCHEMA_ID);
  assert.equal(report.version, 'V44');
  assert.equal(report.currentTarget, 'V43');
  assert.equal(report.sourceSafetyVerdict, V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_SOURCE_SAFETY_VERDICT);
  assert.ok(report.artifactRoot.startsWith('v44-packs-portfolio-market-intelligence:'));
  assert.deepEqual(report.portfolioViewIds, [...V44_PACKS_PORTFOLIO_VIEW_IDS]);
  assert.deepEqual(report.marketSignalIds, [...V44_PACKS_MARKET_SIGNAL_IDS]);
  assert.deepEqual(report.marketFacetIds, [...V44_PACKS_MARKET_FACET_IDS]);
  assert.equal(report.coverage.portfolioPositionsImplemented, true);
  assert.equal(report.coverage.savedFiltersImplemented, true);
  assert.equal(report.coverage.organizationViewsImplemented, true);
  assert.equal(report.coverage.marketSignalsImplemented, true);
  assert.equal(report.coverage.unfitNeedSignalsImplemented, true);
  assert.equal(report.coverage.settlementFacetsImplemented, true);
  assert.equal(report.coverage.compensationFacetsImplemented, true);
  assert.equal(report.coverage.proofRootDrilldownImplemented, true);
  assert.equal(report.coverage.apiProjectionImplemented, true);
  assert.equal(report.coverage.uiProjectionImplemented, true);
  assert.equal(report.coverage.noSourceLeakTestsImplemented, true);
});

test('V44 Packs portfolio market intelligence rows remain source-safe', () => {
  const report = buildV44PacksPortfolioMarketIntelligence();

  for (const row of report.rows) {
    assert.equal(row.sourceSafeMetadataOnly, true);
    assert.equal(row.protectedSourceVisible, false);
    assert.equal(row.unpaidAssetPackSourceVisible, false);
  }
  assert.equal(report.coverage.sourceSafeMetadataOnly, true);
  assert.equal(report.coverage.protectedSourceVisible, false);
  assert.equal(report.coverage.unpaidAssetPackSourceVisible, false);
  assert.equal(report.coverage.rawPromptVisible, false);
  assert.equal(report.coverage.interpolatedPromptVisible, false);
  assert.equal(report.coverage.rawProviderResponseVisible, false);
  assert.equal(report.coverage.credentialsSerialized, false);
  assert.equal(report.coverage.walletPrivateMaterialVisible, false);
  assert.equal(report.coverage.settlementPrivatePayloadVisible, false);
});
