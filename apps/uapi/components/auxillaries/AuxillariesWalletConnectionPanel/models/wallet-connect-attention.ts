/**
 * Chrome Connect → Wallet attention cue.
 * Connect focuses the wallet pane and briefly highlights the required-wallet
 * section + provider connect buttons. A short-lived pending flag survives
 * dynamic pane remounts so attention still runs when Connect is clicked from
 * Profile / Externals / Interfaces.
 */

export const BITCODE_FOCUS_WALLET_CONNECT_EVENT = 'bitcode-focus-wallet-connect';

/**
 * Must match CSS animation duration (`wallet-section-attention` /
 * `wallet-connect-button-attention`). Class is removed only after the run
 * settles at rest so the border does not flash.
 */
export const WALLET_CONNECT_ATTENTION_MS = 2100;

/** Window after request during which a newly mounted panel should auto-run attention. */
const PENDING_ATTENTION_GRACE_MS = 4000;

let pendingAttentionUntil = 0;
let attentionEpoch = 0;

export function requestWalletConnectAttention() {
  attentionEpoch += 1;
  pendingAttentionUntil = Date.now() + PENDING_ATTENTION_GRACE_MS;
  if (typeof window === 'undefined') return attentionEpoch;
  window.dispatchEvent(
    new CustomEvent(BITCODE_FOCUS_WALLET_CONNECT_EVENT, {
      detail: { epoch: attentionEpoch },
    }),
  );
  return attentionEpoch;
}

/** True when Connect was requested recently and the wallet panel should cue on mount. */
export function hasPendingWalletConnectAttention() {
  return Date.now() <= pendingAttentionUntil;
}

export function clearPendingWalletConnectAttention() {
  pendingAttentionUntil = 0;
}

export function getWalletConnectAttentionEpoch() {
  return attentionEpoch;
}
