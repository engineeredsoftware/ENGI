// @ts-check
// @ts-nocheck

import crypto from 'node:crypto';

export const BITCOIN_DEMONSTRATION_SERVICE_ID = 'bitcode.v23.bitcoin-demonstration-service';
export const BITCOIN_DEMONSTRATION_SERVICE_MODE = 'stubbed-testnet-demonstration-service';

export const BITCOIN_DEMONSTRATION_NETWORKS = {
  'audited-base-layer-purchase': 'bitcoin-testnet4',
  'repeated-read-payment': 'lightning-testnet',
  'checkpointed-sidechain-bridge': 'liquid-testnet'
};

export const BITCOIN_DEMONSTRATION_CARRIER_TYPES = {
  'audited-base-layer-purchase': 'psbt',
  'repeated-read-payment': 'bolt11-invoice',
  'checkpointed-sidechain-bridge': 'sidechain-transfer-intent'
};

/**
 * @param {unknown} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * @param {string} value
 * @param {number} [size=12]
 * @returns {string}
 */
function shortId(value, size = 12) {
  return sha256(value).slice(0, size);
}

/**
 * @param {string} paymentMode
 * @returns {string}
 */
function explorerBaseUrl(paymentMode) {
  if (paymentMode === 'audited-base-layer-purchase') return 'https://mempool.space/testnet4';
  if (paymentMode === 'repeated-read-payment') return 'https://amboss.space/testnet';
  return 'https://liquid.network/testnet';
}

/**
 * @param {{
 *   intentId: string,
 *   buyerId: string,
 *   readId: string,
 *   assetPackId: string,
 *   bundleId: string,
 *   paymentMode: string,
 *   unitDenomination: string,
 *   meteredMicroUnits?: string | undefined
 * }} input
 * @returns {{
 *   serviceId: string,
 *   serviceMode: string,
 *   requestId: string,
 *   receiptId: string,
 *   carrierType: string,
 *   network: string,
 *   requestPreview: Record<string, unknown>,
 *   carrier: Record<string, unknown>,
 *   receipt: Record<string, unknown>
 * }}
 */
export function buildBitcoinDemonstrationPaymentCarrier({
  intentId,
  buyerId,
  readId,
  assetPackId,
  bundleId,
  paymentMode,
  unitDenomination,
  meteredMicroUnits
}) {
  const network = BITCOIN_DEMONSTRATION_NETWORKS[paymentMode];
  const carrierType = BITCOIN_DEMONSTRATION_CARRIER_TYPES[paymentMode];
  const requestId = `btc_demo_req_${shortId(`${intentId}:${paymentMode}:request`)}`;
  const receiptId = `btc_demo_receipt_${shortId(`${intentId}:${paymentMode}:receipt`)}`;
  const requestPreview = {
    buyerId,
    readId,
    assetPackId,
    bundleId,
    paymentMode,
    unitDenomination,
    meteredMicroUnits,
    transportMode: BITCOIN_DEMONSTRATION_SERVICE_MODE
  };
  const carrier =
    carrierType === 'psbt'
      ? {
          carrierType,
          encoding: 'base64',
          network,
          psbtBase64: Buffer.from(JSON.stringify({
            version: 'v23-demo-psbt',
            intentId,
            buyerId,
            bundleId,
            meteredMicroUnits
          })).toString('base64'),
          receiveAddress: `tb1qbitcode${shortId(intentId, 20)}`,
          changeAddress: `tb1qchange${shortId(buyerId, 18)}`
        }
      : carrierType === 'bolt11-invoice'
        ? {
            carrierType,
            network,
            invoice: `lnbcrt1bitcode${shortId(`${intentId}:${bundleId}`, 28)}`,
            paymentHash: sha256(`${intentId}:invoice`),
            descriptionHash: sha256(`${bundleId}:description`)
          }
        : {
            carrierType,
            network,
            sidechainAsset: 'L-BTC-testnet',
            bridgeTransferId: `lbtc_bridge_${shortId(`${intentId}:bridge`)}`,
            checkpointIntentRef: `liquid-testnet:checkpoint:${shortId(`${bundleId}:checkpoint`)}`,
            peggedAddress: `tex1qq${shortId(`${intentId}:peg`, 22)}`
          };
  const referenceId =
    carrierType === 'psbt'
      ? `bitcoin-testnet4:tx:${shortId(`${intentId}:tx`, 16)}`
      : carrierType === 'bolt11-invoice'
        ? `lightning-testnet:invoice:${shortId(`${intentId}:invoice`, 16)}`
        : `liquid-testnet:checkpoint:${shortId(`${intentId}:checkpoint`, 16)}`;
  const receipt = {
    receiptId,
    referenceId,
    explorerUrl: `${explorerBaseUrl(paymentMode)}/${carrierType === 'bolt11-invoice' ? 'payment' : 'tx'}/${shortId(referenceId, 32)}`,
    serviceExecution: 'deterministic-stubbed-testnet',
    observedAt: 'stubbed-local-execution'
  };
  return {
    serviceId: BITCOIN_DEMONSTRATION_SERVICE_ID,
    serviceMode: BITCOIN_DEMONSTRATION_SERVICE_MODE,
    requestId,
    receiptId,
    carrierType,
    network,
    requestPreview,
    carrier,
    receipt
  };
}

/**
 * @param {{
 *   intentId: string,
 *   paymentMode: string,
 *   branchName: string,
 *   publicationState: string,
 *   publicRoot: string,
 *   privateRoot: string
 * }} input
 * @returns {{
 *   serviceId: string,
 *   serviceMode: string,
 *   requestId: string,
 *   receiptId: string,
 *   network: string,
 *   anchorRef: string,
 *   publicationEnvelope: Record<string, unknown>,
 *   receipt: Record<string, unknown>
 * }}
 */
export function buildBitcoinDemonstrationAnchorPublication({
  intentId,
  paymentMode,
  branchName,
  publicationState,
  publicRoot,
  privateRoot
}) {
  const requestId = `btc_demo_anchor_req_${shortId(`${intentId}:${branchName}:request`)}`;
  const receiptId = `btc_demo_anchor_receipt_${shortId(`${intentId}:${branchName}:receipt`)}`;
  const network = paymentMode === 'checkpointed-sidechain-bridge'
    ? 'bitcoin-testnet4+liquid-testnet-checkpoint'
    : 'bitcoin-testnet4';
  const anchorTxId = shortId(`${publicRoot}:${privateRoot}:${branchName}`, 32);
  const anchorRef = `${network}:anchor:${anchorTxId}`;
  const publicationEnvelope = paymentMode === 'audited-base-layer-purchase'
    ? {
        carrierType: 'taproot-commitment',
        internalKey: shortId(`${publicRoot}:taproot-key`, 32),
        commitmentPreview: publicRoot
      }
    : {
        carrierType: 'checkpoint-batch',
        batchId: `btc_demo_batch_${shortId(`${intentId}:batch`)}`,
        publicRoot,
        privateRoot
      };
  return {
    serviceId: BITCOIN_DEMONSTRATION_SERVICE_ID,
    serviceMode: BITCOIN_DEMONSTRATION_SERVICE_MODE,
    requestId,
    receiptId,
    network,
    anchorRef,
    publicationEnvelope,
    receipt: {
      receiptId,
      anchorTxId,
      anchorRef,
      explorerUrl: `${explorerBaseUrl('audited-base-layer-purchase')}/tx/${anchorTxId}`,
      serviceExecution: 'deterministic-stubbed-testnet',
      publishedAt: publicationState.startsWith('published') ? 'stubbed-testnet-publication' : null
    }
  };
}

/**
 * @returns {Record<string, unknown>}
 */
export function buildBitcoinDemonstrationServiceDescriptor() {
  return {
    serviceId: BITCOIN_DEMONSTRATION_SERVICE_ID,
    serviceMode: BITCOIN_DEMONSTRATION_SERVICE_MODE,
    executionClass: 'deterministic-local-demonstration-service',
    supportedPaymentModes: Object.keys(BITCOIN_DEMONSTRATION_NETWORKS),
    networksByMode: BITCOIN_DEMONSTRATION_NETWORKS,
    carrierTypesByMode: BITCOIN_DEMONSTRATION_CARRIER_TYPES,
    anchorPublicationMode: 'taproot-commitment-or-checkpoint-batch',
    sidechainMode: 'checkpointed-sidechain-bridge',
    liveMainnetExecution: false,
    liveThirdPartyExecution: false,
    firstGateUse: 'assemble spend carriers, anchor receipts, and sidechain checkpoint stand-ins for V23 demonstration runs'
  };
}
