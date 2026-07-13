import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  EXCHANGE_PRICING_LIQUIDITY_BANDS,
  EXCHANGE_PRICING_QUOTE_ARTIFACT_PATH,
  EXCHANGE_PRICING_QUOTE_REQUIRED_FIELD_IDS,
  EXCHANGE_PRICING_QUOTE_STATES,
  buildExchangePricingQuote,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

test('builds source-safe V36 ExchangePricingQuote rows', () => {
  const quote = buildExchangePricingQuote({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });

  assert.equal(quote.artifactId, 'v36-pricing-liquidity-fee-quote');
  assert.equal(quote.schemaId, 'bitcode.v36.exchangePricingQuote.v1');
  assert.equal(quote.version, 'V36');
  assert.equal(quote.currentTarget, 'V35');
  assert.equal(quote.passed, true);
  assert.equal(quote.sourceSafetyVerdict, 'source-safe-exchange-pricing-quote-metadata');
  assert.equal(quote.coverage.quoteCount, EXCHANGE_PRICING_QUOTE_STATES.length);
  assert.deepEqual(quote.coverage.missingRequiredQuoteStates, []);
  assert.equal(quote.coverage.allRequiredQuoteStatesCovered, true);
  assert.equal(quote.coverage.allLiquidityBandsCovered, true);
  assert.equal(quote.coverage.btcAmountCovered, true);
  assert.equal(quote.coverage.measurementWeightVolumeCovered, true);
  assert.equal(quote.coverage.liquidityBandsCovered, true);
  assert.equal(quote.coverage.wrapperAnalysisCovered, true);
  assert.equal(quote.coverage.wrapperCannotFungibilizeBtdRangeChainOfRecord, true);
  assert.equal(quote.coverage.treasuryDepositorReaderRoutesCovered, true);
  assert.equal(quote.coverage.quoteRootsCovered, true);
  assert.equal(quote.coverage.proofRootsCovered, true);
  assert.equal(quote.coverage.eventIdsCovered, true);
  assert.equal(quote.coverage.ledgerDatabaseProjectionRefsCovered, true);
  assert.equal(quote.coverage.credentialsSerialized, false);
  assert.equal(quote.coverage.privateWalletMaterialSerialized, false);
  assert.equal(quote.coverage.protectedSourceVisible, false);
  assert.equal(quote.coverage.unpaidAssetPackSourceVisible, false);
  assert.match(quote.artifactRoot, /^exchange-pricing-quote:[a-f0-9]{24}$/u);
  assert.deepEqual(quote.requiredQuoteStates, EXCHANGE_PRICING_QUOTE_STATES);
  assert.deepEqual(quote.requiredLiquidityBands, EXCHANGE_PRICING_LIQUIDITY_BANDS);
  assert.deepEqual(quote.requiredFieldIds, EXCHANGE_PRICING_QUOTE_REQUIRED_FIELD_IDS);

  for (const quoteState of EXCHANGE_PRICING_QUOTE_STATES) {
    assert.equal(quote.rows.some((row) => row.quoteState === quoteState), true, `missing ${quoteState}`);
  }

  for (const row of quote.rows) {
    assert.equal(row.canonicalObject, 'ExchangePricingQuote');
    assert.match(row.quoteRoot, /^exchange-pricing-quote:[a-f0-9]{24}$/u);
    assert.equal(row.btdRangeIdentity.rangeIdentityClass, 'non_fungible_source_share_range');
    assert.equal(row.btdRangeIdentity.sourceShareFungibility, 'not_fungible');
    assert.equal(row.btcAmount.amountSatoshis > 0, true);
    assert.match(row.btcAmount.amountBtc, /^[0-9]+\.[0-9]{8}$/u);
    assert.equal(row.measurementWeight > 0, true);
    assert.equal(row.measurementVolume > 0, true);
    assert.equal(EXCHANGE_PRICING_LIQUIDITY_BANDS.includes(row.liquidityBand.bandId), true);
    assert.equal(row.wrapperAnalysis.canMakeBtdRangeCellsFungibleChainOfRecordAssets, false);
    assert.equal(row.wrapperAnalysis.forbiddenWrapperEffect, 'wrapper analysis cannot make BTD range cells fungible chain-of-record assets');
    assert.equal(row.treasuryRoute.amountSatoshis > 0, true);
    assert.equal(row.depositorRoute.amountSatoshis > 0, true);
    assert.equal(row.readerRoute.debitSatoshis, row.btcAmount.amountSatoshis);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('wallet_private_material'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'), true);
    assert.equal(row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'), true);
    assert.equal(row.ledgerDatabaseProjectionRefs.projectionTrust, 'ledger_journal_outranks_database_projection');
    assert.equal(row.eventIds.length > 0, true);
    assert.equal(row.sourceEvidence.every((entry) => entry.present), true);

    for (const proofRootField of row.proofRootFields) {
      assert.match(row.proofRoots[proofRootField], /^exchange-proof:[a-f0-9]{24}$/u);
    }
  }

  assert.equal(EXCHANGE_PRICING_QUOTE_ARTIFACT_PATH, '.bitcode/v36-pricing-liquidity-fee-quote.json');
});

test('fails closed for payment mismatch, stale quotes, and unsupported network posture', () => {
  const quote = buildExchangePricingQuote({
    generatedAt: '2026-05-24T00:00:00.000Z',
    repoRoot,
  });
  const underpayment = quote.rows.find((row) => row.quoteState === 'underpayment_fail_closed');
  const overpayment = quote.rows.find((row) => row.quoteState === 'overpayment_fail_closed');
  const stale = quote.rows.find((row) => row.quoteState === 'stale_quote_fail_closed');
  const unsupported = quote.rows.find((row) => row.quoteState === 'unsupported_network_fail_closed');

  assert.ok(underpayment);
  assert.equal(underpayment.requestedPayment.comparison, 'underpayment');
  assert.equal(underpayment.failClosedConditions.includes('underpayment_detected'), true);

  assert.ok(overpayment);
  assert.equal(overpayment.requestedPayment.comparison, 'overpayment');
  assert.equal(overpayment.failClosedConditions.includes('overpayment_detected'), true);

  assert.ok(stale);
  assert.equal(stale.settlementWindow.quoteFreshness, 'stale_quote');
  assert.equal(stale.settlementWindow.admission, 'fail_closed_stale_quote');
  assert.equal(stale.failClosedConditions.includes('stale_quote_detected'), true);

  assert.ok(unsupported);
  assert.equal(unsupported.networkPosture, 'unsupported_network_posture');
  assert.equal(unsupported.failClosedConditions.includes('unsupported_network_posture'), true);
  assert.equal(
    quote.pricingBoundary.failureBoundary,
    'underpayment, overpayment, stale quote, or unsupported network posture fails closed',
  );
});
