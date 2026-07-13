/**
 * Pure builder for BTC-testnet settlement → BTD rights → repository delivery readback.
 */

import { normalizedText, stableHash } from './read-route-helpers';
import type {
  ReadRouteSessionInput,
  ReadSettlementRightsDelivery,
} from './read-route-session-types';

export function buildReadSettlementRightsDelivery(
  input: ReadRouteSessionInput = {},
): ReadSettlementRightsDelivery {
  const paymentObserved = Boolean(
    input.paymentObserved ?? (input.hasSettlementReadback || input.hasDeliveryReadback),
  );
  const finalityConfirmed =
    paymentObserved && Boolean(input.finalityConfirmed ?? input.hasDeliveryReadback);
  const rightsTransferred =
    finalityConfirmed && Boolean(input.rightsTransferred ?? input.hasDeliveryReadback);
  const deliveryMaterialized =
    rightsTransferred && Boolean(input.deliveryMaterialized ?? input.hasDeliveryReadback);
  const pullRequestReference = deliveryMaterialized
    ? normalizedText(input.deliveryPullRequestReference) ||
      `${normalizedText(input.repositoryFullName) || 'target-repository'}#read-delivery`
    : null;
  const blockers = [
    !paymentObserved ? 'BTC-testnet payment observation required' : '',
    paymentObserved && !finalityConfirmed ? 'BTC-testnet finality confirmation required' : '',
    finalityConfirmed && !rightsTransferred ? 'BTD rights transfer receipt required' : '',
    rightsTransferred && !deliveryMaterialized ? 'repository PR delivery receipt required' : '',
  ].filter(Boolean);
  const stateSeed = JSON.stringify({
    transactionId: normalizedText(input.transactionId),
    paymentObserved,
    finalityConfirmed,
    rightsTransferred,
    deliveryMaterialized,
    pullRequestReference,
  });

  return {
    schema: 'bitcode.read.settlement-rights-delivery',
    network: 'btc-testnet',
    valueBearingMainnetEnabled: false,
    paymentObservation: {
      state: paymentObserved ? 'btc-testnet-payment-observed' : 'awaiting-payment',
      observationRoot: `read-payment-observation:${stableHash(`${stateSeed}:observation`)}`,
    },
    finality: {
      state: finalityConfirmed ? 'btc-testnet-finality-confirmed' : 'awaiting-finality',
      finalityRoot: `read-settlement-finality:${stableHash(`${stateSeed}:finality`)}`,
    },
    btdRights: {
      state: rightsTransferred ? 'btd-rights-transferred' : 'rights-pending',
      rightsReceiptRoot: `read-btd-rights-receipt:${stableHash(`${stateSeed}:rights`)}`,
    },
    delivery: {
      state: deliveryMaterialized ? 'repository-pr-delivery-materialized' : 'delivery-locked',
      pullRequestReference,
      deliveryReceiptRoot: `read-delivery-receipt:${stableHash(`${stateSeed}:delivery`)}`,
    },
    guards: {
      btcFinalityBeforeBtdRights: true,
      btdRightsBeforeSourceDelivery: true,
    },
    blockers,
    readbackRoot: `read-settlement-rights-delivery:${stableHash(stateSeed)}`,
  };
}
