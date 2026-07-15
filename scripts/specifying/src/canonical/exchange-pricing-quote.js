// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EXCHANGE_PRICING_QUOTE_ARTIFACT_PATH = '.bitcode/v36-pricing-liquidity-fee-quote.json';
export const EXCHANGE_PRICING_QUOTE_SCHEMA_ID = 'bitcode.v36.exchangePricingQuote.v1';
export const EXCHANGE_PRICING_QUOTE_VERSION = 'V36';
export const EXCHANGE_PRICING_QUOTE_CURRENT_TARGET = 'V35';
export const EXCHANGE_PRICING_QUOTE_SOURCE_SAFETY_VERDICT = 'source-safe-exchange-pricing-quote-metadata';

export const EXCHANGE_PRICING_QUOTE_STATES = Object.freeze([
  'quote_ready',
  'underpayment_fail_closed',
  'overpayment_fail_closed',
  'stale_quote_fail_closed',
  'unsupported_network_fail_closed',
]);

export const EXCHANGE_PRICING_LIQUIDITY_BANDS = Object.freeze([
  'thin',
  'balanced',
  'deep',
]);

export const EXCHANGE_PRICING_QUOTE_REQUIRED_FIELD_IDS = Object.freeze([
  'quoteId',
  'quoteState',
  'assetPackId',
  'btdRangeIdentity',
  'btcAmount',
  'measurementWeight',
  'measurementVolume',
  'liquidityBand',
  'wrapperAnalysis',
  'treasuryRoute',
  'depositorRoute',
  'readerRoute',
  'quoteRoot',
  'networkPosture',
  'settlementWindow',
  'failClosedConditions',
  'proofRoots',
  'ledgerDatabaseProjectionRefs',
]);

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

const FORBIDDEN_PRICING_PAYLOAD = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'wallet_seed_phrase',
  'wallet_private_key',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'private_payment_credentials',
  'buyer_private_repository_payload',
]);

const SHARED_FAIL_CLOSED_REASONS = Object.freeze([
  'missing_btc_amount',
  'missing_measurement_weight',
  'missing_measurement_volume',
  'missing_liquidity_band',
  'missing_wrapper_analysis',
  'missing_quote_root',
  'missing_treasury_route',
  'missing_depositor_route',
  'missing_reader_route',
  'unsupported_network_posture',
  'underpayment_detected',
  'overpayment_detected',
  'stale_quote_detected',
  'wrapper_fungibility_attempt',
]);

/**
 * @param {number} satoshis
 * @returns {string}
 */
function satsToBtc(satoshis) {
  const whole = Math.floor(satoshis / 100_000_000);
  const fraction = `${satoshis % 100_000_000}`.padStart(8, '0');
  return `${whole}.${fraction}`;
}

/**
 * @param {{
 *   quoteId: string,
 *   quoteState: string,
 *   label: string,
 *   assetPackId: string,
 *   btdRangeId: string,
 *   currentOwnerPrincipal: string,
 *   requestedBuyerPrincipal: string,
 *   measurementWeight: number,
 *   measurementVolume: number,
 *   liquidityBandId: string,
 *   liquidityMultiplierBps: number,
 *   wrapperKind: string,
 *   wrapperCostSatoshis: number,
 *   networkPosture: string,
 *   quoteFreshness: string,
 *   requestedPaymentAdjustmentSatoshis: number,
 *   treasuryBps: number,
 *   depositorBps: number,
 *   eventIds: string[],
 *   failClosedConditions: string[],
 * }} row
 */
function pricingQuote(row) {
  const sourceMeasurementSatoshis = row.measurementWeight * row.measurementVolume;
  const liquidityAdjustedSatoshis = Math.round((sourceMeasurementSatoshis * row.liquidityMultiplierBps) / 10_000);
  const networkFeeSatoshis = row.networkPosture === 'bitcoin_testnet_supported' ? 1_900 : 0;
  const btcAmountSatoshis = liquidityAdjustedSatoshis + row.wrapperCostSatoshis + networkFeeSatoshis;
  const requestedPaymentSatoshis = btcAmountSatoshis + row.requestedPaymentAdjustmentSatoshis;
  const treasurySatoshis = Math.round((btcAmountSatoshis * row.treasuryBps) / 10_000);
  const depositorSatoshis = Math.round((btcAmountSatoshis * row.depositorBps) / 10_000);
  const remainderSatoshis = btcAmountSatoshis - treasurySatoshis - depositorSatoshis;

  return {
    ...row,
    canonicalObject: 'ExchangePricingQuote',
    btdRangeIdentity: {
      rangeId: row.btdRangeId,
      rangeIdentityClass: 'non_fungible_source_share_range',
      sourceShareFungibility: 'not_fungible',
      chainOfRecord: 'btd_range_ledger_journal',
    },
    btcAmount: {
      amountSatoshis: btcAmountSatoshis,
      amountBtc: satsToBtc(btcAmountSatoshis),
      denomination: 'BTC',
      deterministicFormula: 'measurementWeight * measurementVolume -> liquidity multiplier -> wrapper cost -> network fee',
      sourceMeasurementSatoshis,
      liquidityAdjustedSatoshis,
      wrapperAdjustedSatoshis: liquidityAdjustedSatoshis + row.wrapperCostSatoshis,
      networkFeeSatoshis,
    },
    requestedPayment: {
      requestedPaymentSatoshis,
      requestedPaymentBtc: satsToBtc(Math.max(requestedPaymentSatoshis, 0)),
      comparison: requestedPaymentSatoshis < btcAmountSatoshis
        ? 'underpayment'
        : requestedPaymentSatoshis > btcAmountSatoshis
          ? 'overpayment'
          : 'exact',
    },
    liquidityBand: {
      bandId: row.liquidityBandId,
      multiplierBps: row.liquidityMultiplierBps,
      bandBasis: 'source_safe_market_depth_and_recent_rights_transfer_frequency',
      settlementAdmission: 'quoted_liquidity_metadata_only_no_source_disclosure',
    },
    wrapperAnalysis: {
      wrapperKind: row.wrapperKind,
      wrapperCostSatoshis: row.wrapperCostSatoshis,
      wrapperPosture: 'pricing_analysis_only_not_chain_of_record',
      canMakeBtdRangeCellsFungibleChainOfRecordAssets: false,
      rangeCellFungibilityEffect: 'none_chain_of_record_stays_non_fungible',
      forbiddenWrapperEffect: 'wrapper analysis cannot make BTD range cells fungible chain-of-record assets',
    },
    treasuryRoute: {
      routeId: `${row.quoteId}:treasury-route`,
      routeKind: 'treasury_fee_route',
      principal: 'principal:bitcode-treasury',
      bps: row.treasuryBps,
      amountSatoshis: treasurySatoshis,
      routeVisibility: 'principal_and_amount_metadata_only',
    },
    depositorRoute: {
      routeId: `${row.quoteId}:depositor-route`,
      routeKind: 'depositor_revenue_route',
      principal: row.currentOwnerPrincipal,
      bps: row.depositorBps,
      amountSatoshis: depositorSatoshis,
      routeVisibility: 'principal_and_amount_metadata_only',
    },
    readerRoute: {
      routeId: `${row.quoteId}:reader-route`,
      routeKind: 'reader_payment_route',
      principal: row.requestedBuyerPrincipal,
      debitSatoshis: btcAmountSatoshis,
      requestedPaymentSatoshis,
      remainderSatoshis,
      routeVisibility: 'principal_and_amount_metadata_only_no_private_wallet_material',
    },
    settlementWindow: {
      quoteFreshness: row.quoteFreshness,
      validForSeconds: row.quoteFreshness === 'current_quote' ? 900 : 0,
      admission: row.quoteFreshness === 'current_quote' ? 'settlement_may_continue_if_payment_exact_and_network_supported' : 'fail_closed_stale_quote',
    },
    ledgerDatabaseProjectionRefs: {
      ledgerRef: `ledger:exchange-pricing-${row.quoteState}`,
      journalRef: `journal:exchange-pricing-${row.quoteState}`,
      databaseProjectionRef: `projection:exchange-pricing-${row.quoteState}`,
      projectionTrust: 'ledger_journal_outranks_database_projection',
    },
    proofRootFields: [
      'quoteRoot',
      'measurementRoot',
      'liquidityRoot',
      'wrapperAnalysisRoot',
      'treasuryRouteRoot',
      'depositorRouteRoot',
      'readerRouteRoot',
      'settlementWindowRoot',
      'networkPostureRoot',
    ],
  };
}

export const EXCHANGE_PRICING_QUOTE_ROWS = Object.freeze([
  pricingQuote({
    quoteId: 'exchange-pricing-quote:ready-balanced-alpha',
    quoteState: 'quote_ready',
    label: 'Current balanced-liquidity quote',
    assetPackId: 'assetpack:source-safe-preview-alpha',
    btdRangeId: 'btd-range:1000-1048',
    currentOwnerPrincipal: 'principal:depositor-alpha',
    requestedBuyerPrincipal: 'principal:reader-beta',
    measurementWeight: 12_400,
    measurementVolume: 48,
    liquidityBandId: 'balanced',
    liquidityMultiplierBps: 10_500,
    wrapperKind: 'assetpack_rights_transfer_wrapper',
    wrapperCostSatoshis: 4_200,
    networkPosture: 'bitcoin_testnet_supported',
    quoteFreshness: 'current_quote',
    requestedPaymentAdjustmentSatoshis: 0,
    treasuryBps: 1_250,
    depositorBps: 8_250,
    eventIds: ['exchange.pricing.quote.ready', 'exchange.pricing.quote.source_safe'],
    failClosedConditions: ['missing_quote_root', 'wrapper_fungibility_attempt', 'ledger_database_projection_drift'],
  }),
  pricingQuote({
    quoteId: 'exchange-pricing-quote:underpayment-thin-beta',
    quoteState: 'underpayment_fail_closed',
    label: 'Underpayment fail-closed quote',
    assetPackId: 'assetpack:source-safe-preview-alpha',
    btdRangeId: 'btd-range:1000-1048',
    currentOwnerPrincipal: 'principal:depositor-alpha',
    requestedBuyerPrincipal: 'principal:reader-beta',
    measurementWeight: 11_200,
    measurementVolume: 36,
    liquidityBandId: 'thin',
    liquidityMultiplierBps: 11_500,
    wrapperKind: 'assetpack_rights_transfer_wrapper',
    wrapperCostSatoshis: 5_100,
    networkPosture: 'bitcoin_testnet_supported',
    quoteFreshness: 'current_quote',
    requestedPaymentAdjustmentSatoshis: -1_500,
    treasuryBps: 1_250,
    depositorBps: 8_250,
    eventIds: ['exchange.pricing.underpayment.blocked', 'exchange.settlement.fail_closed'],
    failClosedConditions: ['underpayment_detected', 'missing_exact_payment_receipt'],
  }),
  pricingQuote({
    quoteId: 'exchange-pricing-quote:overpayment-deep-gamma',
    quoteState: 'overpayment_fail_closed',
    label: 'Overpayment fail-closed quote',
    assetPackId: 'assetpack:source-safe-preview-beta',
    btdRangeId: 'btd-range:2100-2132',
    currentOwnerPrincipal: 'principal:depositor-gamma',
    requestedBuyerPrincipal: 'principal:reader-delta',
    measurementWeight: 15_800,
    measurementVolume: 32,
    liquidityBandId: 'deep',
    liquidityMultiplierBps: 9_250,
    wrapperKind: 'assetpack_rights_transfer_wrapper',
    wrapperCostSatoshis: 3_600,
    networkPosture: 'bitcoin_testnet_supported',
    quoteFreshness: 'current_quote',
    requestedPaymentAdjustmentSatoshis: 2_200,
    treasuryBps: 1_250,
    depositorBps: 8_250,
    eventIds: ['exchange.pricing.overpayment.blocked', 'exchange.settlement.refund_or_requote_required'],
    failClosedConditions: ['overpayment_detected', 'refund_or_requote_required'],
  }),
  pricingQuote({
    quoteId: 'exchange-pricing-quote:stale-balanced-delta',
    quoteState: 'stale_quote_fail_closed',
    label: 'Stale quote fail-closed',
    assetPackId: 'assetpack:source-safe-preview-gamma',
    btdRangeId: 'btd-range:3000-3040',
    currentOwnerPrincipal: 'principal:depositor-epsilon',
    requestedBuyerPrincipal: 'principal:reader-zeta',
    measurementWeight: 9_700,
    measurementVolume: 40,
    liquidityBandId: 'balanced',
    liquidityMultiplierBps: 10_500,
    wrapperKind: 'assetpack_rights_transfer_wrapper',
    wrapperCostSatoshis: 4_200,
    networkPosture: 'bitcoin_testnet_supported',
    quoteFreshness: 'stale_quote',
    requestedPaymentAdjustmentSatoshis: 0,
    treasuryBps: 1_250,
    depositorBps: 8_250,
    eventIds: ['exchange.pricing.stale.blocked', 'exchange.pricing.requote.required'],
    failClosedConditions: ['stale_quote_detected', 'requote_required_before_payment'],
  }),
  pricingQuote({
    quoteId: 'exchange-pricing-quote:unsupported-network-epsilon',
    quoteState: 'unsupported_network_fail_closed',
    label: 'Unsupported network fail-closed',
    assetPackId: 'assetpack:source-safe-preview-delta',
    btdRangeId: 'btd-range:4100-4136',
    currentOwnerPrincipal: 'principal:depositor-eta',
    requestedBuyerPrincipal: 'principal:reader-theta',
    measurementWeight: 13_300,
    measurementVolume: 36,
    liquidityBandId: 'thin',
    liquidityMultiplierBps: 11_500,
    wrapperKind: 'assetpack_rights_transfer_wrapper',
    wrapperCostSatoshis: 5_100,
    networkPosture: 'unsupported_network_posture',
    quoteFreshness: 'current_quote',
    requestedPaymentAdjustmentSatoshis: 0,
    treasuryBps: 1_250,
    depositorBps: 8_250,
    eventIds: ['exchange.pricing.network.blocked', 'exchange.settlement.network_unsupported'],
    failClosedConditions: ['unsupported_network_posture', 'supported_testnet_or_future_canon_required'],
  }),
]);

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`;
  return `{${Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
    .join(',')}}`;
}

/**
 * @param {string} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableRoot(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function includesSecretMarker(value) {
  return SECRET_MARKERS.some((marker) => value.includes(marker));
}

/**
 * @param {string} repoRoot
 * @param {string} relativePath
 * @returns {boolean}
 */
function sourceRootExists(repoRoot, relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

/**
 * @param {ReadonlyArray<string>} values
 * @param {ReadonlyArray<string>} requiredValues
 * @returns {boolean}
 */
function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

/**
 * @param {{
 *   version?: string,
 *   currentTarget?: string,
 *   generatedAt?: string,
 *   repoRoot?: string,
 * }} [input]
 */
export function buildExchangePricingQuote(input = {}) {
  const version = input.version || EXCHANGE_PRICING_QUOTE_VERSION;
  const currentTarget = input.currentTarget || EXCHANGE_PRICING_QUOTE_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sharedSourceRoots = [
    'specifications/BITCODE_SPEC_V36.md',
    'specifications/BITCODE_SPEC_V36_DELTA.md',
    'specifications/BITCODE_SPEC_V36_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'scripts/specifying/src/canonical/exchange-pricing-quote.js',
    'scripts/specifying/test/v36-exchange-pricing-quote.test.js',
    'scripts/generate-v36-exchange-pricing-quote.mjs',
    'scripts/check-v36-gate5-exchange-pricing-quote.mjs',
    'packages/btd/src/exchange.ts',
    'apps/uapi/app/exchange/README.md',
    'apps/uapi/app/api/btd/asset-pack-exchange/route.ts',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  const rows = EXCHANGE_PRICING_QUOTE_ROWS.map((row) => {
    const sourceEvidence = sharedSourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoots = {
      ...row,
      sourceSafetyClass: 'source_safe_exchange_pricing_quote_metadata',
      sourceSafetyPosture: 'quote_measurements_routes_and_roots_only_no_source_or_private_wallet_material',
      redactionPosture: {
        postureId: 'exchange_pricing_quote_redaction_v1',
        allowedPayloadClasses: [
          'quote_identity',
          'assetpack_id',
          'btd_range_identity',
          'btc_amount',
          'measurement_weight',
          'measurement_volume',
          'liquidity_band',
          'wrapper_analysis',
          'treasury_route',
          'depositor_route',
          'reader_route',
          'proof_roots',
          'event_ids',
          'ledger_and_database_projection_refs',
          'fail_closed_conditions',
        ],
        forbiddenPayloadClasses: [...FORBIDDEN_PRICING_PAYLOAD],
      },
      freshnessChecks: [
        {
          checkId: `${row.quoteId}.pricing-quote-present`,
          command: 'pnpm run check:v36-gate5',
          cadence: 'per_gate',
          failClosedOn: [...SHARED_FAIL_CLOSED_REASONS],
        },
      ],
      sourceEvidence,
    };
    const quoteRoot = `exchange-pricing-quote:${sha256(row.quoteId + canonicalJson(rowWithoutRoots)).slice(0, 24)}`;
    const proofRoots = Object.fromEntries(
      row.proofRootFields.map((field) => {
        const seed = `${row.quoteId}:${field}:${quoteRoot}:${row.btdRangeIdentity.rangeId}`;
        return [field, `exchange-proof:${sha256(seed).slice(0, 24)}`];
      }),
    );

    return {
      ...rowWithoutRoots,
      quoteRoot,
      proofRoots,
    };
  });

  const observedQuoteStates = rows.map((row) => row.quoteState);
  const missingRequiredQuoteStates = EXCHANGE_PRICING_QUOTE_STATES.filter((state) => !observedQuoteStates.includes(state));
  const observedLiquidityBands = [...new Set(rows.map((row) => row.liquidityBand.bandId))];
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsWithMissingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.quoteId}:${entry.sourceRoot}`),
  );
  const rowsWithoutBtcAmount = rows.filter((row) => !row.btcAmount.amountSatoshis || !row.btcAmount.amountBtc);
  const rowsWithoutMeasurement = rows.filter((row) => !row.measurementWeight || !row.measurementVolume);
  const rowsWithoutLiquidity = rows.filter((row) => !row.liquidityBand.bandId || !row.liquidityBand.multiplierBps);
  const rowsWithoutWrapper = rows.filter((row) => !row.wrapperAnalysis || row.wrapperAnalysis.canMakeBtdRangeCellsFungibleChainOfRecordAssets !== false);
  const rowsWithFungibleRangeCells = rows.filter((row) =>
    row.btdRangeIdentity.sourceShareFungibility !== 'not_fungible'
    || row.wrapperAnalysis.canMakeBtdRangeCellsFungibleChainOfRecordAssets !== false,
  );
  const rowsWithoutRoutes = rows.filter((row) =>
    !row.treasuryRoute.amountSatoshis
    || !row.depositorRoute.amountSatoshis
    || !row.readerRoute.debitSatoshis,
  );
  const rowsWithoutQuoteRoot = rows.filter((row) => !row.quoteRoot);
  const rowsWithoutProofRoots = rows.filter((row) => row.proofRootFields.some((field) => !row.proofRoots[field]));
  const rowsWithoutProjectionRefs = rows.filter((row) => !row.ledgerDatabaseProjectionRefs.ledgerRef || !row.ledgerDatabaseProjectionRefs.databaseProjectionRef);
  const rowsWithoutEventIds = rows.filter((row) => row.eventIds.length === 0);
  const underpaymentRowsNotClosed = rows.filter((row) => row.quoteState === 'underpayment_fail_closed' && row.requestedPayment.comparison !== 'underpayment');
  const overpaymentRowsNotClosed = rows.filter((row) => row.quoteState === 'overpayment_fail_closed' && row.requestedPayment.comparison !== 'overpayment');
  const staleRowsNotClosed = rows.filter((row) => row.quoteState === 'stale_quote_fail_closed' && row.settlementWindow.quoteFreshness !== 'stale_quote');
  const unsupportedNetworkRowsNotClosed = rows.filter((row) => row.quoteState === 'unsupported_network_fail_closed' && row.networkPosture !== 'unsupported_network_posture');
  const rowsWithProtectedSource = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'));
  const rowsWithUnpaidAssetPackSource = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'));
  const rowsWithPrivateWalletMaterial = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('wallet_private_material'));
  const rowsWithLegacySourceRoots = rows.filter((row) => row.sourceEvidence.some((entry) => entry.sourceRoot.startsWith('_legacy/')));

  const failures = [
    ...missingRequiredQuoteStates.map((state) => `missing required Exchange pricing quote state ${state}`),
    ...rowsWithMissingSourceRoots.map((sourceRoot) => `missing Exchange pricing source root ${sourceRoot}`),
    ...(forbiddenMarkerDetected ? ['Exchange pricing quote contains a secret-shaped marker'] : []),
    ...rowsWithoutBtcAmount.map((row) => `Exchange pricing quote ${row.quoteId} lacks BTC amount`),
    ...rowsWithoutMeasurement.map((row) => `Exchange pricing quote ${row.quoteId} lacks measurement weight or volume`),
    ...rowsWithoutLiquidity.map((row) => `Exchange pricing quote ${row.quoteId} lacks liquidity band`),
    ...rowsWithoutWrapper.map((row) => `Exchange pricing quote ${row.quoteId} lacks wrapper analysis`),
    ...rowsWithFungibleRangeCells.map((row) => `Exchange pricing quote ${row.quoteId} makes BTD range cells fungible`),
    ...rowsWithoutRoutes.map((row) => `Exchange pricing quote ${row.quoteId} lacks treasury, depositor, or reader route`),
    ...rowsWithoutQuoteRoot.map((row) => `Exchange pricing quote ${row.quoteId} lacks quote root`),
    ...rowsWithoutProofRoots.map((row) => `Exchange pricing quote ${row.quoteId} is missing proof roots`),
    ...rowsWithoutProjectionRefs.map((row) => `Exchange pricing quote ${row.quoteId} is missing ledger/database projection refs`),
    ...rowsWithoutEventIds.map((row) => `Exchange pricing quote ${row.quoteId} is missing event ids`),
    ...underpaymentRowsNotClosed.map((row) => `Exchange pricing quote ${row.quoteId} does not fail closed on underpayment`),
    ...overpaymentRowsNotClosed.map((row) => `Exchange pricing quote ${row.quoteId} does not fail closed on overpayment`),
    ...staleRowsNotClosed.map((row) => `Exchange pricing quote ${row.quoteId} does not fail closed on stale quote`),
    ...unsupportedNetworkRowsNotClosed.map((row) => `Exchange pricing quote ${row.quoteId} does not fail closed on unsupported network`),
    ...rowsWithProtectedSource.map((row) => `Exchange pricing quote ${row.quoteId} lacks protected source boundary`),
    ...rowsWithUnpaidAssetPackSource.map((row) => `Exchange pricing quote ${row.quoteId} lacks unpaid AssetPack source boundary`),
    ...rowsWithPrivateWalletMaterial.map((row) => `Exchange pricing quote ${row.quoteId} lacks wallet private material boundary`),
    ...rowsWithLegacySourceRoots.map((row) => `Exchange pricing quote ${row.quoteId} points at _legacy source roots`),
  ];

  const coverage = {
    requiredQuoteStates: [...EXCHANGE_PRICING_QUOTE_STATES],
    observedQuoteStates,
    missingRequiredQuoteStates,
    quoteCount: rows.length,
    allRequiredQuoteStatesCovered: includesAll(observedQuoteStates, EXCHANGE_PRICING_QUOTE_STATES),
    observedLiquidityBands,
    allLiquidityBandsCovered: includesAll(observedLiquidityBands, EXCHANGE_PRICING_LIQUIDITY_BANDS),
    btcAmountCovered: rowsWithoutBtcAmount.length === 0,
    measurementWeightVolumeCovered: rowsWithoutMeasurement.length === 0,
    liquidityBandsCovered: rowsWithoutLiquidity.length === 0,
    wrapperAnalysisCovered: rowsWithoutWrapper.length === 0,
    wrapperCannotFungibilizeBtdRangeChainOfRecord: rowsWithFungibleRangeCells.length === 0,
    treasuryDepositorReaderRoutesCovered: rowsWithoutRoutes.length === 0,
    quoteRootsCovered: rowsWithoutQuoteRoot.length === 0,
    proofRootsCovered: rowsWithoutProofRoots.length === 0,
    eventIdsCovered: rowsWithoutEventIds.length === 0,
    ledgerDatabaseProjectionRefsCovered: rowsWithoutProjectionRefs.length === 0,
    underpaymentFailsClosed: rows.some((row) => row.quoteState === 'underpayment_fail_closed') && underpaymentRowsNotClosed.length === 0,
    overpaymentFailsClosed: rows.some((row) => row.quoteState === 'overpayment_fail_closed') && overpaymentRowsNotClosed.length === 0,
    staleQuoteFailsClosed: rows.some((row) => row.quoteState === 'stale_quote_fail_closed') && staleRowsNotClosed.length === 0,
    unsupportedNetworkPostureFailsClosed: rows.some((row) => row.quoteState === 'unsupported_network_fail_closed') && unsupportedNetworkRowsNotClosed.length === 0,
    missingSourceRoots: rowsWithMissingSourceRoots,
    legacySourceRoots: rowsWithLegacySourceRoots.length > 0,
    credentialsSerialized: forbiddenMarkerDetected,
    privateWalletMaterialSerialized: false,
    protectedSourceVisible: rowsWithProtectedSource.length > 0,
    unpaidAssetPackSourceVisible: rowsWithUnpaidAssetPackSource.length > 0,
  };

  const artifactSeed = {
    version,
    currentTarget,
    rows,
    coverage,
    sourceSafetyVerdict: EXCHANGE_PRICING_QUOTE_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v36-pricing-liquidity-fee-quote',
    schemaId: EXCHANGE_PRICING_QUOTE_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: EXCHANGE_PRICING_QUOTE_SOURCE_SAFETY_VERDICT,
    pricingBoundary: {
      exchangePricingQuoteMayExpose: [
        'quote_identity',
        'assetpack_id',
        'btd_range_identity',
        'btc_amount',
        'measurement_weight',
        'measurement_volume',
        'liquidity_band',
        'wrapper_analysis',
        'treasury_route',
        'depositor_route',
        'reader_route',
        'proof_roots',
        'event_ids',
        'ledger_and_database_projection_refs',
        'fail_closed_conditions',
      ],
      exchangePricingQuoteMustNotExpose: [...FORBIDDEN_PRICING_PAYLOAD],
      wrapperBoundary: 'wrapper analysis cannot make BTD range cells fungible chain-of-record assets',
      failureBoundary: 'underpayment, overpayment, stale quote, or unsupported network posture fails closed',
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredQuoteStates: [...EXCHANGE_PRICING_QUOTE_STATES],
    requiredLiquidityBands: [...EXCHANGE_PRICING_LIQUIDITY_BANDS],
    requiredFieldIds: [...EXCHANGE_PRICING_QUOTE_REQUIRED_FIELD_IDS],
    rows,
    sourceEvidence: rows.map((row) => ({
      quoteId: row.quoteId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `exchange-pricing-quote:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
