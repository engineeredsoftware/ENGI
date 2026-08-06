/**
 * Canonical Ethereum wallet user resolution.
 *
 * Product law: MetaMask/EIP-1193 Connect authenticates as the principal
 * Bitcode user for that address — never merely attaches the wallet to whatever
 * session is already open.
 *
 * Priority:
 *  1. Auth user for deterministic wallet email (0x…@ethereum.wallet.bitcode.local)
 *  2. Else bound owner with active GitHub (oldest first)
 *  3. Else oldest bound owner
 *  4. Else null (caller creates wallet-email user)
 */

export const ETHEREUM_WALLET_CONNECTION_PROVIDERS = [
  'metamask',
  'coinbase',
  'brave',
  'rainbow',
  'injected',
  'walletconnect',
  'unknown',
] as const;

export type BoundWalletUserRow = {
  userId: string;
  /** Earliest evidence of ownership (connection/profile created_at). */
  boundAt: string | null;
  hasActiveGithub: boolean;
};

export function normalizeEthereumAddress(address: string): string {
  return address.trim().toLowerCase();
}

export function connectionDataMatchesEthereumAddress(
  connectionData: unknown,
  address: string,
): boolean {
  const normalized = normalizeEthereumAddress(address);
  if (!normalized) return false;
  const data =
    connectionData && typeof connectionData === 'object' && !Array.isArray(connectionData)
      ? (connectionData as Record<string, unknown>)
      : null;
  if (!data) return false;
  for (const key of ['wallet_address', 'address', 'auth_address', 'payment_address'] as const) {
    const value = data[key];
    if (typeof value === 'string' && value.trim().toLowerCase() === normalized) {
      return true;
    }
  }
  return false;
}

export function profileSettingsMatchEthereumAddress(
  settings: unknown,
  address: string,
): boolean {
  const normalized = normalizeEthereumAddress(address);
  if (!normalized) return false;
  const root =
    settings && typeof settings === 'object' && !Array.isArray(settings)
      ? (settings as Record<string, unknown>)
      : null;
  if (!root) return false;
  const bitcodeProfile =
    root.bitcodeProfile && typeof root.bitcodeProfile === 'object'
      ? (root.bitcodeProfile as Record<string, unknown>)
      : null;
  const walletBinding =
    (bitcodeProfile?.walletBinding && typeof bitcodeProfile.walletBinding === 'object'
      ? (bitcodeProfile.walletBinding as Record<string, unknown>)
      : null) ??
    (root.walletBinding && typeof root.walletBinding === 'object'
      ? (root.walletBinding as Record<string, unknown>)
      : null);
  const value = walletBinding?.address;
  return typeof value === 'string' && value.trim().toLowerCase() === normalized;
}

/**
 * Pure canonical picker. `boundUsers` should already be unique by userId.
 *
 * Priority (Connect = land on the principal that already has product state):
 *  1. Bound owner with active GitHub (oldest first) — Externals/repos live here
 *  2. Wallet-email principal, if they already appear in boundUsers or alone
 *  3. Oldest bound owner
 *  4. walletEmailUserId if no bounds yet
 *
 * Preferring GitHub-owning bound users avoids "same MetaMask, empty Externals"
 * when a legacy profile already claimed the install on a different user_id.
 */
export function resolveCanonicalEthereumWalletUserId(input: {
  walletEmailUserId: string | null;
  boundUsers: BoundWalletUserRow[];
}): string | null {
  const sorted = [...input.boundUsers].sort((a, b) => {
    const at = a.boundAt ? Date.parse(a.boundAt) : Number.POSITIVE_INFINITY;
    const bt = b.boundAt ? Date.parse(b.boundAt) : Number.POSITIVE_INFINITY;
    if (at !== bt) return at - bt;
    return a.userId.localeCompare(b.userId);
  });

  const withGithub = sorted.find((row) => row.hasActiveGithub);
  if (withGithub) return withGithub.userId;

  if (
    input.walletEmailUserId &&
    sorted.some((row) => row.userId === input.walletEmailUserId)
  ) {
    return input.walletEmailUserId;
  }

  if (sorted[0]?.userId) return sorted[0].userId;
  return input.walletEmailUserId;
}

/** Merge bound rows by userId, keeping earliest boundAt and OR-ing github. */
export function mergeBoundWalletUserRows(
  rows: BoundWalletUserRow[],
): BoundWalletUserRow[] {
  const byId = new Map<string, BoundWalletUserRow>();
  for (const row of rows) {
    if (!row.userId) continue;
    const existing = byId.get(row.userId);
    if (!existing) {
      byId.set(row.userId, { ...row });
      continue;
    }
    const existingAt = existing.boundAt ? Date.parse(existing.boundAt) : Number.POSITIVE_INFINITY;
    const nextAt = row.boundAt ? Date.parse(row.boundAt) : Number.POSITIVE_INFINITY;
    byId.set(row.userId, {
      userId: row.userId,
      boundAt:
        nextAt < existingAt ? row.boundAt : existing.boundAt,
      hasActiveGithub: existing.hasActiveGithub || row.hasActiveGithub,
    });
  }
  return [...byId.values()];
}
