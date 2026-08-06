/**
 * Resolve the preferred depositor signer address from profile + wallet status.
 * Source-safe: addresses only, no private material.
 */

export function resolvePreferredSignerAddress(input: {
  profileRecord: Record<string, unknown> | null;
  walletAuthAddress?: string | null;
  walletAddress?: string | null;
  readStringField: (
    record: Record<string, unknown> | null,
    key: string,
  ) => string | null;
}): string | null {
  const { profileRecord, walletAuthAddress, walletAddress, readStringField } =
    input;
  const profileAuthAddress = readStringField(profileRecord, "auth_address");
  const profileWalletAddress = readStringField(profileRecord, "wallet_address");
  return (
    walletAuthAddress?.trim() ||
    walletAddress?.trim() ||
    profileAuthAddress ||
    profileWalletAddress ||
    null
  );
}
