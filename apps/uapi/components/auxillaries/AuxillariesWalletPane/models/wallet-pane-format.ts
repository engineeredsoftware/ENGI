/**
 * Pure wallet/BTD formatting helpers for AuxillariesWalletPane.
 * Profile field reads stay framework-free so cards can share them.
 */

import { readBitcodeWalletBindingFromProfile } from '@bitcode/orm';

export function formatBtdHoldings(btdBalance: number) {
  return `${btdBalance.toLocaleString()} BTD`;
}

export function formatBtcFeeBalance(balance: unknown) {
  const numericBalance =
    typeof balance === 'number'
      ? balance
      : typeof balance === 'string' && balance.trim()
        ? Number(balance)
        : null;

  if (typeof numericBalance !== 'number' || !Number.isFinite(numericBalance)) {
    return 'Binding pending';
  }

  return `${numericBalance.toLocaleString(undefined, {
    maximumFractionDigits: numericBalance >= 1 ? 4 : 8,
  })} BTC`;
}

export function formatCompactIdentifier(value: string) {
  const normalized = value.trim();
  if (normalized.length <= 22) {
    return normalized;
  }

  return `${normalized.slice(0, 10)}...${normalized.slice(-8)}`;
}

export function resolveWalletAddress(profile: Record<string, any> | null, userId: string | undefined) {
  const walletBinding = readBitcodeWalletBindingFromProfile(profile);
  if (walletBinding?.address) {
    return formatCompactIdentifier(String(walletBinding.address));
  }

  if (!userId) {
    return 'Wallet binding pending';
  }

  return `Binding pending for ${userId.slice(0, 8)}...`;
}

export function readProfileString(profile: Record<string, any> | null, ...keys: string[]) {
  if (!profile) {
    return null;
  }

  for (const key of keys) {
    const value = profile[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function readProfileNumber(profile: Record<string, any> | null, ...keys: string[]) {
  if (!profile) {
    return null;
  }

  for (const key of keys) {
    const value = profile[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

export function formatPolicyHash(hash: string | null) {
  if (!hash) {
    return 'Policy hash pending';
  }

  return hash.length > 18 ? `${hash.slice(0, 10)}...${hash.slice(-6)}` : hash;
}

export function formatReadiness(value: string | null | undefined) {
  if (!value) {
    return 'Unknown';
  }

  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function resolveBtdAccessDisclosure(profile: Record<string, any> | null) {
  const policyId = readProfileString(
    profile,
    'btdAccessPolicyId',
    'btd_access_policy_id',
    'accessPolicyId',
    'access_policy_id',
  );
  const policyHash = readProfileString(
    profile,
    'btdAccessPolicyHash',
    'btd_access_policy_hash',
    'accessPolicyHash',
    'access_policy_hash',
  );
  const rangeStart = readProfileNumber(
    profile,
    'btdRangeStart',
    'btd_range_start',
    'rangeStart',
    'range_start',
  );
  const rangeEndExclusive = readProfileNumber(
    profile,
    'btdRangeEndExclusive',
    'btd_range_end_exclusive',
    'rangeEndExclusive',
    'range_end_exclusive',
  );
  const readBranch =
    readProfileString(profile, 'btdReadBranch', 'btd_read_branch', 'readBranch', 'read_branch') ||
    'Owner-read / licensed-read';

  return {
    policyId: policyId || 'Policy id pending',
    policyHash: formatPolicyHash(policyHash),
    rawPolicyHash: policyHash,
    range:
      typeof rangeStart === 'number' &&
      typeof rangeEndExclusive === 'number' &&
      rangeEndExclusive > rangeStart
        ? `${rangeStart.toLocaleString()}-${(rangeEndExclusive - 1).toLocaleString()}`
        : 'AssetPack range pending',
    readBranch,
  };
}
