/**
 * Pure builder for Reading procurement budget / quote / settlement readiness.
 */

import {
  isExpired,
  normalizeSafeNumber,
  normalizedText,
  stableHash,
} from './read-route-helpers';
import type {
  ReadProcurementBudgetState,
  ReadProcurementGovernance,
  ReadProcurementQuoteState,
  ReadProcurementSettlementReadiness,
  ReadRouteSessionInput,
} from './read-route-session-types';

export function buildReadProcurementGovernance(
  input: ReadRouteSessionInput = {},
): ReadProcurementGovernance {
  const sourceSafePreviewVisible = Boolean(input.hasSourceSafePreview);
  const budgetEnvelopeSats = normalizeSafeNumber(input.budgetEnvelopeSats, 250_000);
  const approvalThresholdSats = normalizeSafeNumber(input.approvalThresholdSats, 100_000);
  const measurementWeight = sourceSafePreviewVisible ? 1_000 : 0;
  const measurementVolume = sourceSafePreviewVisible
    ? Math.max(1, normalizeSafeNumber(input.measuredBtd, 0))
    : 0;
  const pricePerWeightedUnitSats = 25;
  const grossSats =
    input.quoteSats !== null && input.quoteSats !== undefined
      ? normalizeSafeNumber(input.quoteSats, 0)
      : Math.round((measurementWeight * measurementVolume * pricePerWeightedUnitSats) / 1_000);
  const approvalRequired = grossSats >= approvalThresholdSats;
  const quoteExpired = isExpired(input.quoteObservedAt || input.quoteIssuedAt, input.quoteExpiresAt);
  const budgetState: ReadProcurementBudgetState =
    grossSats <= 0
      ? 'awaiting-quote'
      : grossSats > budgetEnvelopeSats
        ? 'exceeded'
        : approvalRequired && !input.procurementApproved
          ? 'approval-required'
          : 'within-budget';
  const quoteState: ReadProcurementQuoteState = !sourceSafePreviewVisible
    ? 'awaiting-preview'
    : budgetState === 'exceeded'
      ? 'blocked'
      : quoteExpired
        ? 'expired'
        : input.procurementApproved
          ? 'approved'
          : 'quoted';
  const buyerAuthorized = input.buyerAuthorized !== false;
  const walletAuthorityPresent = Boolean(input.walletAuthorityPresent);
  const procurementApproved = Boolean(input.procurementApproved) || !approvalRequired;
  const blockers = [
    !sourceSafePreviewVisible ? 'source-safe AssetPack preview required' : '',
    budgetState === 'exceeded' ? 'quote exceeds Reading budget envelope' : '',
    quoteState === 'expired' ? 'quote expired' : '',
    approvalRequired && !procurementApproved ? 'procurement approval required' : '',
    !buyerAuthorized ? 'buyer authorization required' : '',
    !walletAuthorityPresent ? 'wallet authority required' : '',
  ].filter(Boolean);
  const readiness: ReadProcurementSettlementReadiness = !sourceSafePreviewVisible
    ? 'awaiting-preview'
    : budgetState === 'exceeded'
      ? 'blocked-budget'
      : quoteState === 'expired'
        ? 'blocked-expired-quote'
        : approvalRequired && !procurementApproved
          ? 'awaiting-approval'
          : !buyerAuthorized
            ? 'awaiting-buyer-authority'
            : !walletAuthorityPresent
              ? 'awaiting-wallet-authority'
              : 'ready-for-testnet-settlement';
  const calculationSeed = JSON.stringify({
    measurementWeight,
    measurementVolume,
    pricePerWeightedUnitSats,
    grossSats,
  });
  const policySeed = JSON.stringify({
    budgetEnvelopeSats,
    approvalThresholdSats,
    grossSats,
    budgetState,
  });
  const approvalSeed = JSON.stringify({
    buyerAuthorized,
    walletAuthorityPresent,
    procurementApproved,
    approvalRequired,
  });
  const readinessSeed = JSON.stringify({ readiness, blockers, quoteState });
  const reviewSeed = JSON.stringify({
    sourceSafePreviewVisible,
    protectedSourceVisible: false,
    unpaidAssetPackSourceVisible: false,
  });

  return {
    schema: 'bitcode.read.procurement-governance',
    budgetPolicy: {
      policyId: 'reading-budget-policy:default-source-safe',
      budgetEnvelopeSats,
      approvalThresholdSats,
      quoteSats: grossSats,
      state: budgetState,
      approvalRequired,
      policyRoot: `reading-budget-policy:${stableHash(policySeed)}`,
    },
    quotePolicy: {
      quoteId: normalizedText(input.settlementQuoteId),
      state: quoteState,
      feeAsset: 'BTC',
      pricingVersion: 'measurement-weight-volume',
      issuedAt: normalizedText(input.quoteIssuedAt),
      expiresAt: normalizedText(input.quoteExpiresAt),
      quoteRoot: `reading-quote-policy:${stableHash(`${calculationSeed}:${quoteState}`)}`,
      shareToFee: {
        measurementWeight,
        measurementVolume,
        pricePerWeightedUnitSats,
        grossSats,
        deterministic: true,
        calculationRoot: `reading-share-to-fee:${stableHash(calculationSeed)}`,
      },
    },
    approval: {
      buyerAuthorized,
      walletAuthorityPresent,
      procurementApproved,
      approvalRoot: `reading-procurement-approval:${stableHash(approvalSeed)}`,
    },
    settlement: {
      readiness,
      btcBtdSettlementReady: readiness === 'ready-for-testnet-settlement',
      blockers,
      readinessRoot: `reading-settlement-readiness:${stableHash(readinessSeed)}`,
    },
    prePurchaseReview: {
      sourceSafePreviewVisible,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      walletPrivateMaterialVisible: false,
      settlementPrivatePayloadVisible: false,
      reviewRoot: `reading-pre-purchase-review:${stableHash(reviewSeed)}`,
    },
  };
}
