/**
 * @param {any} state
 * @returns {any[]}
 */
export function buildProofLog(state) {
  return [...state.receipts]
    .slice()
    .reverse()
    .map((/** @type {any} */ receipt, index) => ({
      step: index + 1,
      type: receipt.type,
      receiptId: receipt.receiptId,
      issuedAt: receipt.issuedAt,
      summary: summarizeReceipt(receipt)
    }));
}

/**
 * @param {any} receipt
 * @returns {string}
 */
function summarizeReceipt(receipt) {
  if (receipt.type === 'deposit') {
    return `Committed asset ${receipt.assetId} into the public depot surface.`;
  }
  if (receipt.type === 'bundle_issuance') {
    return `Issued private bundle ${receipt.bundleId} for a licensed read.`;
  }
  if (receipt.type === 'allocation') {
    return `Allocated ${receipt.totalUnits} units across contributing assets.`;
  }
  if (receipt.type === 'utility') {
    return `Recorded utility uplift of ${receipt.upliftBp} bp for bundle ${receipt.bundleId}.`;
  }
  return 'Inspectable public event.';
}
