/**
 * After wallet Connect: if GitHub is not attached, Auxillaries navigates to
 * Externals and briefly spotlights the Repository Connection card + Install
 * GitHub App button (purple twin of the wallet Connect attention cue).
 */

export const BITCODE_FOCUS_GITHUB_CONNECT_EVENT = 'bitcode-focus-github-connect';

/** Must match CSS animation duration for github section/button attention. */
export const GITHUB_CONNECT_ATTENTION_MS = 2100;

const PENDING_ATTENTION_GRACE_MS = 4000;

let pendingAttentionUntil = 0;
let attentionEpoch = 0;

export function requestGitHubConnectAttention() {
  attentionEpoch += 1;
  pendingAttentionUntil = Date.now() + PENDING_ATTENTION_GRACE_MS;
  if (typeof window === 'undefined') return attentionEpoch;
  window.dispatchEvent(
    new CustomEvent(BITCODE_FOCUS_GITHUB_CONNECT_EVENT, {
      detail: { epoch: attentionEpoch },
    }),
  );
  return attentionEpoch;
}

export function hasPendingGitHubConnectAttention() {
  return Date.now() <= pendingAttentionUntil;
}

export function clearPendingGitHubConnectAttention() {
  pendingAttentionUntil = 0;
}

export function getGitHubConnectAttentionEpoch() {
  return attentionEpoch;
}
