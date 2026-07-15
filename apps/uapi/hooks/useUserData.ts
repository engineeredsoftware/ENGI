"use client";

// Centralised user data fetch & cache so all UI surfaces (Nav, the BTD balance
// tracker, auxillaries, etc.) share a single source of truth and avoid
// inconsistent intermediate states.

import { useState, useEffect, useCallback } from 'react';

import { normalizeAuxillarySteps } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';
import { bitcodeQaTelemetry, compactBitcodeAddress } from '@bitcode/auth/qa-telemetry';
import {
  BITCODE_LOCAL_WALLET_EVENT,
  mergeLocalBitcodeWalletIdentity,
} from '@bitcode/auth/wallet-local';
import { readBitcodeWalletCapabilityFromProfile } from '@bitcode/orm';

type UserRepositoryInventorySource =
  | 'stored_repository_inventory'
  | 'live_provider_inventory'
  | 'mock_repository_inventory';

type RepositoryConnectionStatus = {
  connected?: boolean;
  valid?: boolean;
  provider?: string;
  username?: string;
  instanceUrl?: string;
  expiresAt?: string;
  metadata?: {
    repositories?: number;
    account?: string;
    status?: string;
    mock_mode?: boolean;
    supported?: boolean;
  } | null;
} | null;

type WalletConnectionStatus = {
  connected?: boolean;
  provider?: string | null;
  valid?: boolean;
  address?: string | null;
  verificationState?: 'manual' | 'pending' | 'verified' | null;
  metadata?: {
    source?: 'profile_manual' | 'wallet_provider_connection' | 'mock';
    connectionAddress?: string | null;
    matchesBindingAddress?: boolean;
    connectedAt?: string | null;
    network?: string | null;
    proofKind?: string | null;
    persistence?: 'server' | 'local' | null;
    paymentAddress?: string | null;
    authAddress?: string | null;
    addressType?: string | null;
    mock_mode?: boolean;
  } | null;
} | null;

export interface AggregatedUserData {
  profile?: any | null;
  vcsConnections?: any[];
  githubConnection?: any | null;
  walletConnectionStatus?: WalletConnectionStatus;
  repositoryConnectionStatus?: RepositoryConnectionStatus;
  repositories?: any[];
  repositoryInventorySource?: UserRepositoryInventorySource | null;
  organizations?: string[];
  btdBalance?: number;
  btcFeeBalance?: number | null;
  recentBtdAssetPacks?: Array<{
    assetPackId: string;
    label?: string;
    rangeStart?: number;
    rangeEndExclusive?: number;
    acquiredAt?: string | null;
  }>;
  modelPreferences?: any | null;
  templatePreferences?: any | null;
  notificationPosture?: any | null;
  dataSharingPosture?: any | null;
  profileState?: any | null;
  auxillariesContract?: any | null;
  connectionReadiness?: any[];
  interfaceAdmissions?: any[];
  walletBtdPaneState?: any | null;
  organizationAuthority?: any | null;
  readinessDiagnostics?: any[];
  recoveryRuns?: any[];
  telemetryProofHooks?: any[];
  onboardedPanes?: string[];
  onboarded_steps?: string[];
  isOnboardingComplete?: boolean;
}

const ANONYMOUS_USER_DATA: AggregatedUserData = {
  profile: null,
  githubConnection: null,
  walletConnectionStatus: null,
  repositoryConnectionStatus: null,
  repositories: [],
  repositoryInventorySource: null,
  organizations: [],
  btdBalance: 0,
  btcFeeBalance: null,
  recentBtdAssetPacks: [],
  modelPreferences: null,
  templatePreferences: null,
  notificationPosture: null,
  dataSharingPosture: null,
  profileState: null,
  auxillariesContract: null,
  connectionReadiness: [],
  interfaceAdmissions: [],
  walletBtdPaneState: null,
  organizationAuthority: null,
  readinessDiagnostics: [],
  recoveryRuns: [],
  telemetryProofHooks: [],
  onboardedPanes: [],
  onboarded_steps: [],
  isOnboardingComplete: false,
};

function readRepositoryOwnerUsername(repository: unknown) {
  if (!repository || typeof repository !== 'object') return null;
  const repositoryRecord = repository as Record<string, unknown>;
  const owner = repositoryRecord.owner;

  if (owner && typeof owner === 'object') {
    const ownerRecord = owner as Record<string, unknown>;
    if (typeof ownerRecord.username === 'string' && ownerRecord.username.trim()) {
      return ownerRecord.username.trim();
    }
    if (typeof ownerRecord.login === 'string' && ownerRecord.login.trim()) {
      return ownerRecord.login.trim();
    }
  }

  const fullNameCandidate =
    typeof repositoryRecord.fullName === 'string'
      ? repositoryRecord.fullName
      : typeof repositoryRecord.full_name === 'string'
        ? repositoryRecord.full_name
        : null;
  if (!fullNameCandidate || !fullNameCandidate.includes('/')) return null;

  const [ownerUsername] = fullNameCandidate.split('/');
  return ownerUsername?.trim() || null;
}

function readRepositoryOwnerType(repository: unknown) {
  if (!repository || typeof repository !== 'object') return null;
  const owner = (repository as Record<string, unknown>).owner;
  if (!owner || typeof owner !== 'object') return null;

  const ownerType = (owner as Record<string, unknown>).type;
  return typeof ownerType === 'string' && ownerType.trim() ? ownerType.trim().toLowerCase() : null;
}

function deriveConnectedOrganizations(
  repositories: unknown[],
  fallbackOrganizations: unknown,
) {
  if (Array.isArray(fallbackOrganizations)) {
    const normalizedOrganizations = fallbackOrganizations
      .map((organization) => (typeof organization === 'string' ? organization.trim() : ''))
      .filter(Boolean);
    if (normalizedOrganizations.length > 0) {
      return Array.from(new Set(normalizedOrganizations));
    }
  }

  return Array.from(
    new Set(
      repositories
        .filter((repository) => readRepositoryOwnerType(repository) === 'organization')
        .map((repository) => readRepositoryOwnerUsername(repository))
        .filter((organization): organization is string => Boolean(organization)),
    ),
  );
}

function readNumericField(source: unknown, ...keys: string[]) {
  if (!source || typeof source !== 'object') return null;
  const record = source as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Very lightweight shared cache (module-level).  We intentionally avoid adding
// a new runtime dependency (e.g. SWR or React Query) to keep the patch
// footprint minimal.
// ---------------------------------------------------------------------------

let cached: AggregatedUserData | null = null;
let inFlight: Promise<AggregatedUserData> | null = null;
/** Bumped on Disconnect so in-flight fetches cannot restore cleared identity. */
let cacheGeneration = 0;

async function fetchUserData(options: { revalidate?: boolean } = {}): Promise<AggregatedUserData> {
  // Return the cached object immediately if available so callers can render
  // synchronously while we start a background revalidation (handled in the
  // hook).
  if (cached && !options.revalidate) {
    bitcodeQaTelemetry('debug', 'user-data', 'cache-hit', {
      hasProfile: Boolean(cached.profile),
      hasWallet: Boolean(cached.walletConnectionStatus?.connected),
      btdBalance: cached.btdBalance ?? null,
      btcFeeBalance: cached.btcFeeBalance ?? null,
    });
    return cached;
  }

  // If a request is already in-flight, return the shared promise.
  if (inFlight) {
    bitcodeQaTelemetry('debug', 'user-data', 'inflight-reuse', {
      revalidate: Boolean(options.revalidate),
    });
    return inFlight;
  }

  const generationAtStart = cacheGeneration;

  inFlight = (async () => {
    try {
      bitcodeQaTelemetry('info', 'user-data', 'fetch-start', {
        revalidate: Boolean(options.revalidate),
        hadCache: Boolean(cached),
      });
      const res = await fetch('/api/auxillaries/data');
      // Disconnect may have wiped identity while this request was in flight.
      if (generationAtStart !== cacheGeneration) {
        bitcodeQaTelemetry('info', 'user-data', 'fetch-stale-after-clear');
        return cached ?? buildAnonymousUserData();
      }
      if (res.status === 401) {
        cached = mergeLocalBitcodeWalletIdentity(buildAnonymousUserData());
        bitcodeQaTelemetry('info', 'user-data', 'anonymous-read', {
          localWallet: cached.walletConnectionStatus
            ? {
                provider: cached.walletConnectionStatus.provider,
                valid: cached.walletConnectionStatus.valid,
                address: compactBitcodeAddress(cached.walletConnectionStatus.address),
              }
            : null,
        });
        return cached;
      }
      if (!res.ok) {
        bitcodeQaTelemetry('warn', 'user-data', 'fetch-failed', {
          status: res.status,
          statusText: res.statusText,
        });
        throw new Error(`Status ${res.status}`);
      }
      const data = (await res.json()) as AggregatedUserData;
      if (generationAtStart !== cacheGeneration) {
        bitcodeQaTelemetry('info', 'user-data', 'fetch-stale-after-clear');
        return cached ?? buildAnonymousUserData();
      }
      cached = mergeLocalBitcodeWalletIdentity(data);
      bitcodeQaTelemetry('info', 'user-data', 'read', {
        hasProfile: Boolean(cached.profile),
        hasWallet: Boolean(cached.walletConnectionStatus?.connected),
        walletProvider: cached.walletConnectionStatus?.provider ?? null,
        walletAddress: compactBitcodeAddress(cached.walletConnectionStatus?.address),
        btdBalance: cached.btdBalance ?? null,
        btcFeeBalance: cached.btcFeeBalance ?? null,
      });
      return cached;
    } catch (error) {
      bitcodeQaTelemetry('error', 'user-data', 'fetch-error', {
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

// Force refresh (invalidates cache).  Returned promise resolves to the fresh
// value so callers can await.
export async function mutateUserData(): Promise<AggregatedUserData> {
  cached = null;
  return fetchUserData();
}

/** Browser event: Disconnect / sign-out optimistically wiped shared user data. */
export const BITCODE_USER_DATA_CLEARED_EVENT = 'bitcode-user-data-cleared';

function buildAnonymousUserData(): AggregatedUserData {
  return {
    ...ANONYMOUS_USER_DATA,
    repositories: [],
    organizations: [],
    recentBtdAssetPacks: [],
    connectionReadiness: [],
    interfaceAdmissions: [],
    readinessDiagnostics: [],
    recoveryRuns: [],
    telemetryProofHooks: [],
    onboardedPanes: [],
    onboarded_steps: [],
  };
}

/**
 * Optimistically wipe shared user/wallet posture so Connect chrome and panes
 * flip immediately on Disconnect — before Supabase signOut + network revalidate.
 */
export function clearUserDataIdentity(): AggregatedUserData {
  cacheGeneration += 1;
  cached = buildAnonymousUserData();
  inFlight = null;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem('btd_balance_cached');
    } catch {
      // ignore quota / privacy errors
    }
    window.dispatchEvent(new CustomEvent(BITCODE_USER_DATA_CLEARED_EVENT));
  }
  bitcodeQaTelemetry('info', 'user-data', 'identity-cleared');
  return cached;
}

export function resetUserDataCacheForTests() {
  if (process.env.NODE_ENV !== 'test') return;
  cacheGeneration += 1;
  cached = null;
  inFlight = null;
}

/**
 * React hook that returns the aggregated user data plus derived convenience
 * booleans.  All components that call this hook receive the same object
 * reference (after the first fetch) which prevents divergent state and the
 * “flipping” nav bug where different widgets would overwrite each other.
 */
export function useUserData() {
  const [data, setData] = useState<AggregatedUserData | null>(cached);
  const [error, setError] = useState<unknown>(null);
  const [cachedBtdBalance, setCachedBtdBalance] = useState(0);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const isLoading = data === null && error === null;

  useEffect(() => {
    try {
      const raw = localStorage.getItem('btd_balance_cached');
      const balance = raw ? parseInt(raw, 10) || 0 : 0;
      setCachedBtdBalance(balance);
    } catch {
      setCachedBtdBalance(0);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRevalidating(true);
    bitcodeQaTelemetry('info', 'user-data', 'refresh-start', {
      hadCurrentData: Boolean(data),
    });
    try {
      const fresh = await mutateUserData();
      setData(fresh);
      const balance = typeof fresh.btdBalance === 'number' ? fresh.btdBalance : null;
      if (typeof balance === 'number') {
        try {
          localStorage.setItem('btd_balance_cached', String(balance));
        } catch {
          // ignore quota / privacy errors
        }
      }
      bitcodeQaTelemetry('info', 'user-data', 'refresh-success', {
        hasProfile: Boolean(fresh.profile),
        hasWallet: Boolean(fresh.walletConnectionStatus?.connected),
        walletProvider: fresh.walletConnectionStatus?.provider ?? null,
        walletAddress: compactBitcodeAddress(fresh.walletConnectionStatus?.address),
        btdBalance: fresh.btdBalance ?? null,
        btcFeeBalance: fresh.btcFeeBalance ?? null,
      });
    } catch (err) {
      setError(err);
      bitcodeQaTelemetry('error', 'user-data', 'refresh-failed', {
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsRevalidating(false);
    }
  }, [data]);

  useEffect(() => {
    const refreshAfterLocalWalletChange = () => {
      bitcodeQaTelemetry('info', 'user-data', 'local-wallet-change');
      void refresh();
    };
    const refreshAfterStorageChange = (event: StorageEvent) => {
      if (event.key !== 'bitcode_local_wallet_identity') return;
      refreshAfterLocalWalletChange();
    };
    const applyClearedIdentity = () => {
      bitcodeQaTelemetry('info', 'user-data', 'identity-cleared-applied');
      setData(buildAnonymousUserData());
      setCachedBtdBalance(0);
      setError(null);
    };

    window.addEventListener(BITCODE_LOCAL_WALLET_EVENT, refreshAfterLocalWalletChange);
    window.addEventListener('storage', refreshAfterStorageChange);
    window.addEventListener(BITCODE_USER_DATA_CLEARED_EVENT, applyClearedIdentity);
    return () => {
      window.removeEventListener(BITCODE_LOCAL_WALLET_EVENT, refreshAfterLocalWalletChange);
      window.removeEventListener('storage', refreshAfterStorageChange);
      window.removeEventListener(BITCODE_USER_DATA_CLEARED_EVENT, applyClearedIdentity);
    };
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    const hadCachedDataAtMount = Boolean(cached);
    if (hadCachedDataAtMount) {
      setIsRevalidating(true);
    }
    bitcodeQaTelemetry('info', 'user-data', 'mount-fetch-start', {
      hadCachedDataAtMount,
    });
    fetchUserData({ revalidate: hadCachedDataAtMount })
      .then((d) => {
        if (!cancelled) {
          setData(d);
          const balance = typeof d.btdBalance === 'number' ? d.btdBalance : null;
          if (typeof balance === 'number') {
            try {
              localStorage.setItem('btd_balance_cached', String(balance));
            } catch {
              // ignore
            }
          }
          setIsRevalidating(false);
          bitcodeQaTelemetry('info', 'user-data', 'mount-fetch-success', {
            hasProfile: Boolean(d.profile),
            hasWallet: Boolean(d.walletConnectionStatus?.connected),
            btdBalance: d.btdBalance ?? null,
            btcFeeBalance: d.btcFeeBalance ?? null,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setIsRevalidating(false);
          bitcodeQaTelemetry('error', 'user-data', 'mount-fetch-failed', {
            message: err instanceof Error ? err.message : String(err),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasGitHubConnection = Boolean(
    data?.githubConnection || data?.vcsConnections?.some(conn => conn.provider === 'github')
  );
  const walletConnectionStatus =
    data?.walletConnectionStatus && typeof data.walletConnectionStatus === 'object'
      ? data.walletConnectionStatus
      : null;
  const repositoryConnectionStatus =
    data?.repositoryConnectionStatus && typeof data.repositoryConnectionStatus === 'object'
      ? data.repositoryConnectionStatus
      : null;
  const hasValidGitHubConnection =
    repositoryConnectionStatus
      ? Boolean(repositoryConnectionStatus.connected && repositoryConnectionStatus.valid)
      : hasGitHubConnection;
  const walletCapability = readBitcodeWalletCapabilityFromProfile(
    (data?.profile as Record<string, unknown> | null | undefined) ?? null,
  );
  const hasWalletConnection = walletCapability.hasIdentity;
  const hasStoredVerifiedWalletConnection = walletCapability.isVerifiedSigner;
  const hasVerifiedWalletConnection =
    walletConnectionStatus
      ? Boolean(walletConnectionStatus.connected && walletConnectionStatus.valid)
      : hasStoredVerifiedWalletConnection;
  const walletBindingStatus = walletCapability.binding?.status ?? null;
  const repositories = Array.isArray(data?.repositories) ? data.repositories : [];
  const repositoryInventorySource =
    typeof data?.repositoryInventorySource === 'string'
      ? (data.repositoryInventorySource as UserRepositoryInventorySource)
      : null;
  const organizations = deriveConnectedOrganizations(repositories, data?.organizations);
  const btdBalance = typeof data?.btdBalance === 'number' ? data.btdBalance : cachedBtdBalance;
  const btcFeeBalance =
    typeof data?.btcFeeBalance === 'number'
      ? data.btcFeeBalance
      : readNumericField(data?.profile, 'btcFeeBalance', 'btc_fee_balance', 'btc_balance');
  const recentBtdAssetPacks = Array.isArray(data?.recentBtdAssetPacks) ? data.recentBtdAssetPacks : [];
  const connectionReadiness = Array.isArray(data?.connectionReadiness) ? data.connectionReadiness : [];
  const interfaceAdmissions = Array.isArray(data?.interfaceAdmissions) ? data.interfaceAdmissions : [];
  const walletBtdPaneState =
    data?.walletBtdPaneState && typeof data.walletBtdPaneState === 'object'
      ? data.walletBtdPaneState
      : null;
  const organizationAuthority =
    data?.organizationAuthority && typeof data.organizationAuthority === 'object'
      ? data.organizationAuthority
      : null;
  const recoveryRuns = Array.isArray(data?.recoveryRuns) ? data.recoveryRuns : [];
  const telemetryProofHooks = Array.isArray(data?.telemetryProofHooks) ? data.telemetryProofHooks : [];

  const onboardedSteps = normalizeAuxillarySteps(data?.onboardedPanes ?? data?.onboarded_steps ?? []);
  const isOnboardingComplete = data?.isOnboardingComplete || false;

  return {
    data,
    hasGitHubConnection,
    hasValidGitHubConnection,
    hasWalletConnection,
    hasStoredVerifiedWalletConnection,
    hasVerifiedWalletConnection,
    walletBindingStatus,
    walletConnectionStatus,
    repositoryConnectionStatus,
    repositories,
    repositoryInventorySource,
    organizations,
    btdBalance,
    btcFeeBalance,
    recentBtdAssetPacks,
    connectionReadiness,
    interfaceAdmissions,
    walletBtdPaneState,
    organizationAuthority,
    recoveryRuns,
    telemetryProofHooks,
    isLoading,
    isRevalidating,
    error,
    refresh,
    isOnboardingComplete,
    onboardedSteps
  } as const;
}
