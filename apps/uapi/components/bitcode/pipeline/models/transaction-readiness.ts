/**
 * Wallet / repository readiness for pipeline actions (deposit, read, settle).
 * Relocated from app/terminal; product copy prefers experience language over product.
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */

export type BitcodeTransactionReadinessStatus =
  | 'connect-required'
  | 'repository-provider-pending'
  | 'wallet-binding-pending'
  | 'wallet-and-repository-pending'
  | 'repository-anchor-pending'
  | 'wallet-verification-pending'
  | 'ready';

export type BitcodeTransactionReadinessBlockerId =
  | 'connect'
  | 'repository-provider'
  | 'wallet-binding'
  | 'wallet-verification'
  | 'repository-anchor';

export interface BitcodeTransactionReadinessBlocker {
  id: BitcodeTransactionReadinessBlockerId;
  label: string;
}

export interface BitcodeTransactionReadinessInput {
  signedIn: boolean;
  hasRepositoryProvider: boolean;
  hasValidRepositoryProvider?: boolean;
  hasWalletBinding: boolean;
  hasVerifiedWalletBinding?: boolean;
  hasStoredVerifiedWalletBinding?: boolean;
  requiresRepositoryAnchor?: boolean;
  hasRepositoryAnchor?: boolean;
}

export interface BitcodeTransactionReadiness {
  status: BitcodeTransactionReadinessStatus;
  label: string;
  summary: string;
  nextAction: string;
  blockers: BitcodeTransactionReadinessBlocker[];
  canReview: true;
  canTransact: boolean;
  canSettle: boolean;
  signedIn: boolean;
  hasRepositoryProvider: boolean;
  hasValidRepositoryProvider: boolean;
  hasWalletBinding: boolean;
  hasVerifiedWalletBinding: boolean;
  hasStoredVerifiedWalletBinding: boolean;
  hasRepositoryAnchor: boolean;
  requiresRepositoryAnchor: boolean;
}

function blocker(id: BitcodeTransactionReadinessBlockerId, label: string): BitcodeTransactionReadinessBlocker {
  return { id, label };
}

export function deriveBitcodeTransactionReadiness(
  input: BitcodeTransactionReadinessInput,
): BitcodeTransactionReadiness {
  const requiresRepositoryAnchor = Boolean(input.requiresRepositoryAnchor);
  const hasRepositoryAnchor = requiresRepositoryAnchor ? Boolean(input.hasRepositoryAnchor) : true;
  const signedIn = Boolean(input.signedIn);
  const hasRepositoryProvider = Boolean(input.hasRepositoryProvider);
  const hasValidRepositoryProvider = hasRepositoryProvider
    ? Boolean(input.hasValidRepositoryProvider ?? input.hasRepositoryProvider)
    : false;
  const hasWalletBinding = Boolean(input.hasWalletBinding);
  const hasVerifiedWalletBinding = Boolean(input.hasVerifiedWalletBinding);
  const hasStoredVerifiedWalletBinding = Boolean(input.hasStoredVerifiedWalletBinding);

  let status: BitcodeTransactionReadinessStatus = 'ready';
  let label = 'ready';
  let summary =
    'Wallet identity, signing capability, and repository scope are ready. Bitcode can move from review into signed settlement and closure-bearing activity.';
  let nextAction = 'Transact, sign, or settle from Deposits, Reads, or Packs.';
  let blockers: BitcodeTransactionReadinessBlocker[] = [];

  if (!signedIn) {
    status = 'connect-required';
    label = 'connect required';
    summary =
      'Bitcode is in review-only mode. Connect first, then bind wallet identity in Wallet and repository scope in Externals before you transact, settle, or sign Bitcode activity.';
    nextAction = 'Connect, then open Wallet and Externals.';
    blockers = [
      blocker('connect', 'Operator connect'),
      blocker('wallet-binding', 'Wallet identity in Wallet'),
      blocker('repository-provider', 'Repository scope in Externals'),
    ];
  } else if (!hasRepositoryProvider && !hasWalletBinding) {
    status = 'wallet-and-repository-pending';
    label = 'wallet + repository pending';
    summary =
      'Bitcode is in review-only mode. Bind wallet identity in Wallet and attach GitHub or equivalent repository scope in Externals before you transact, settle, or sign Bitcode activity.';
    nextAction = 'Open Wallet for wallet binding, then Externals for repository scope.';
    blockers = [
      blocker('wallet-binding', 'Wallet identity in Wallet'),
      blocker('repository-provider', 'GitHub or equivalent repository scope in Externals'),
    ];
  } else if (!hasValidRepositoryProvider && !hasWalletBinding) {
    status = 'wallet-and-repository-pending';
    label = 'wallet + repository pending';
    summary =
      'Bitcode is in review-only mode. Reconnect GitHub or equivalent repository scope in Externals and bind wallet identity in Wallet before you transact, settle, or sign Bitcode activity.';
    nextAction = 'Reconnect repository scope in Externals, then confirm wallet identity in Wallet.';
    blockers = [
      blocker('wallet-binding', 'Wallet identity in Wallet'),
      blocker('repository-provider', 'Reconnect GitHub or equivalent repository scope in Externals'),
    ];
  } else if (!hasRepositoryProvider) {
    status = 'repository-provider-pending';
    label = 'repository pending';
    summary =
      'Bitcode is in review-only mode. Attach GitHub or equivalent repository scope in Externals before you transact, settle, or sign Bitcode activity.';
    nextAction = 'Open Externals and attach a repository provider.';
    blockers = [blocker('repository-provider', 'GitHub or equivalent repository scope in Externals')];
  } else if (!hasValidRepositoryProvider) {
    status = 'repository-provider-pending';
    label = 'repository reconnect required';
    summary =
      'Bitcode is in review-only mode. Reconnect GitHub or equivalent repository scope in Externals before you transact, settle, or sign Bitcode activity.';
    nextAction = 'Open Externals and restore a valid repository-provider connection.';
    blockers = [blocker('repository-provider', 'Reconnect GitHub or equivalent repository scope in Externals')];
  } else if (!hasWalletBinding) {
    status = 'wallet-binding-pending';
    label = 'wallet pending';
    summary =
      'Bitcode is in review-only mode. Bind wallet identity in Wallet before you transact, settle, or sign Bitcode activity.';
    nextAction = 'Open Wallet and bind wallet identity.';
    blockers = [blocker('wallet-binding', 'Wallet identity in Wallet')];
  } else if (!hasRepositoryAnchor) {
    status = 'repository-anchor-pending';
    label = 'repository anchor pending';
    summary =
      'Bitcode is in review-only mode. Select a repository anchor on Deposits or Reads before you transact, settle, or sign Bitcode activity.';
    nextAction = 'Choose a repository anchor on Deposits or Reads.';
    blockers = [blocker('repository-anchor', 'Selected repository anchor on Deposits or Reads')];
  } else if (!hasVerifiedWalletBinding && hasStoredVerifiedWalletBinding) {
    status = 'wallet-verification-pending';
    label = 'wallet reconnect required';
    summary =
      'Bitcode can reread the saved verified wallet signer posture in Wallet, but the live wallet-provider signing session is no longer available. Reconnect the wallet provider before you settle or sign Bitcode activity.';
    nextAction = 'Reconnect the wallet provider so verified signing access is live again.';
    blockers = [blocker('wallet-verification', 'Reconnect verified wallet-provider signing access')];
  } else if (!hasVerifiedWalletBinding) {
    status = 'wallet-verification-pending';
    label = 'wallet verification pending';
    summary =
      'Bitcode can draft transaction-bearing activity from the wallet identity saved in Wallet, but signed settlement remains staged until a verified wallet provider is connected.';
    nextAction = 'Keep drafting on Deposits or Reads, or return to Wallet when verified wallet-provider signing becomes available.';
    blockers = [blocker('wallet-verification', 'Verified wallet-provider signing access')];
  }

  return {
    status,
    label,
    summary,
    nextAction,
    blockers,
    canReview: true,
    canTransact: status === 'ready' || status === 'wallet-verification-pending',
    canSettle: status === 'ready',
    signedIn,
    hasRepositoryProvider,
    hasValidRepositoryProvider,
    hasWalletBinding,
    hasVerifiedWalletBinding,
    hasStoredVerifiedWalletBinding,
    hasRepositoryAnchor,
    requiresRepositoryAnchor,
  };
}
