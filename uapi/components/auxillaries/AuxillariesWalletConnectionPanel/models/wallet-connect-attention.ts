/**
 * Chrome Connect → Wallet attention cue.
 * Connect no longer toggles Create Account; it focuses the wallet pane and
 * briefly highlights the required-wallet section + provider connect buttons.
 */

export const BITCODE_FOCUS_WALLET_CONNECT_EVENT = 'bitcode-focus-wallet-connect';

/** How long the strong attention highlight stays active. */
export const WALLET_CONNECT_ATTENTION_MS = 2200;

export function requestWalletConnectAttention() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(BITCODE_FOCUS_WALLET_CONNECT_EVENT));
}
