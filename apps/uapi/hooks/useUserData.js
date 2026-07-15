"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutateUserData = mutateUserData;
exports.clearUserDataIdentity = clearUserDataIdentity;
exports.resetUserDataCacheForTests = resetUserDataCacheForTests;
exports.useUserData = useUserData;
// Centralised user data fetch & cache so all UI surfaces (Nav, the BTD balance
// tracker, auxillaries, etc.) share a single source of truth and avoid
// inconsistent intermediate states.
const react_1 = require("react");
const auxillary_pane_meta_1 = require("@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta");
const orm_1 = require("@bitcode/orm");
const ANONYMOUS_USER_DATA = {
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
function readRepositoryOwnerUsername(repository) {
    if (!repository || typeof repository !== 'object')
        return null;
    const repositoryRecord = repository;
    const owner = repositoryRecord.owner;
    if (owner && typeof owner === 'object') {
        const ownerRecord = owner;
        if (typeof ownerRecord.username === 'string' && ownerRecord.username.trim()) {
            return ownerRecord.username.trim();
        }
        if (typeof ownerRecord.login === 'string' && ownerRecord.login.trim()) {
            return ownerRecord.login.trim();
        }
    }
    const fullNameCandidate = typeof repositoryRecord.fullName === 'string'
        ? repositoryRecord.fullName
        : typeof repositoryRecord.full_name === 'string'
            ? repositoryRecord.full_name
            : null;
    if (!fullNameCandidate || !fullNameCandidate.includes('/'))
        return null;
    const [ownerUsername] = fullNameCandidate.split('/');
    return ownerUsername?.trim() || null;
}
function readRepositoryOwnerType(repository) {
    if (!repository || typeof repository !== 'object')
        return null;
    const owner = repository.owner;
    if (!owner || typeof owner !== 'object')
        return null;
    const ownerType = owner.type;
    return typeof ownerType === 'string' && ownerType.trim() ? ownerType.trim().toLowerCase() : null;
}
function deriveConnectedOrganizations(repositories, fallbackOrganizations) {
    if (Array.isArray(fallbackOrganizations)) {
        const normalizedOrganizations = fallbackOrganizations
            .map((organization) => (typeof organization === 'string' ? organization.trim() : ''))
            .filter(Boolean);
        if (normalizedOrganizations.length > 0) {
            return Array.from(new Set(normalizedOrganizations));
        }
    }
    return Array.from(new Set(repositories
        .filter((repository) => readRepositoryOwnerType(repository) === 'organization')
        .map((repository) => readRepositoryOwnerUsername(repository))
        .filter((organization) => Boolean(organization))));
}
function readNumericField(source, ...keys) {
    if (!source || typeof source !== 'object')
        return null;
    const record = source;
    for (const key of keys) {
        const value = record[key];
        if (typeof value === 'number' && Number.isFinite(value))
            return value;
        if (typeof value === 'string' && value.trim()) {
            const parsed = Number(value);
            if (Number.isFinite(parsed))
                return parsed;
        }
    }
    return null;
}
// ---------------------------------------------------------------------------
// Very lightweight shared cache (module-level).  We intentionally avoid adding
// a new runtime dependency (e.g. SWR or React Query) to keep the patch
// footprint minimal.
// ---------------------------------------------------------------------------
let cached = null;
let inFlight = null;
async function fetchUserData(options = {}) {
    // Return the cached object immediately if available so callers can render
    // synchronously while we start a background revalidation (handled in the
    // hook).
    if (cached && !options.revalidate)
        return cached;
    // If a request is already in-flight, return the shared promise.
    if (inFlight)
        return inFlight;
    inFlight = (async () => {
        try {
            const res = await fetch('/api/auxillaries/data');
            if (res.status === 401) {
                cached = ANONYMOUS_USER_DATA;
                return cached;
            }
            if (!res.ok)
                throw new Error(`Status ${res.status}`);
            const data = (await res.json());
            cached = data;
            return data;
        }
        finally {
            inFlight = null;
        }
    })();
    return inFlight;
}
// Force refresh (invalidates cache).  Returned promise resolves to the fresh
// value so callers can await.
async function mutateUserData() {
    cached = null;
    return fetchUserData();
}
const BITCODE_USER_DATA_CLEARED_EVENT = 'bitcode-user-data-cleared';
exports.BITCODE_USER_DATA_CLEARED_EVENT = BITCODE_USER_DATA_CLEARED_EVENT;
function buildAnonymousUserData() {
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
function clearUserDataIdentity() {
    cached = buildAnonymousUserData();
    inFlight = null;
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.removeItem('btd_balance_cached');
        }
        catch {
            // ignore
        }
        window.dispatchEvent(new CustomEvent(BITCODE_USER_DATA_CLEARED_EVENT));
    }
    return cached;
}
function resetUserDataCacheForTests() {
    if (process.env.NODE_ENV !== 'test')
        return;
    cached = null;
    inFlight = null;
}
/**
 * React hook that returns the aggregated user data plus derived convenience
 * booleans.  All components that call this hook receive the same object
 * reference (after the first fetch) which prevents divergent state and the
 * “flipping” nav bug where different widgets would overwrite each other.
 */
function useUserData() {
    const [data, setData] = (0, react_1.useState)(cached);
    const [error, setError] = (0, react_1.useState)(null);
    const [cachedBtdBalance, setCachedBtdBalance] = (0, react_1.useState)(0);
    const [isRevalidating, setIsRevalidating] = (0, react_1.useState)(false);
    const isLoading = data === null && error === null;
    (0, react_1.useEffect)(() => {
        try {
            const raw = localStorage.getItem('btd_balance_cached');
            const balance = raw ? parseInt(raw, 10) || 0 : 0;
            setCachedBtdBalance(balance);
        }
        catch {
            setCachedBtdBalance(0);
        }
    }, []);
    const refresh = (0, react_1.useCallback)(async () => {
        setIsRevalidating(true);
        try {
            const fresh = await mutateUserData();
            setData(fresh);
            const balance = typeof fresh.btdBalance === 'number' ? fresh.btdBalance : null;
            if (typeof balance === 'number') {
                try {
                    localStorage.setItem('btd_balance_cached', String(balance));
                }
                catch {
                    // ignore quota / privacy errors
                }
            }
        }
        catch (err) {
            setError(err);
        }
        finally {
            setIsRevalidating(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        let cancelled = false;
        const hadCachedDataAtMount = Boolean(cached);
        if (hadCachedDataAtMount) {
            setIsRevalidating(true);
        }
        fetchUserData({ revalidate: hadCachedDataAtMount })
            .then((d) => {
            if (!cancelled) {
                setData(d);
                const balance = typeof d.btdBalance === 'number' ? d.btdBalance : null;
                if (typeof balance === 'number') {
                    try {
                        localStorage.setItem('btd_balance_cached', String(balance));
                    }
                    catch {
                        // ignore
                    }
                }
                setIsRevalidating(false);
            }
        })
            .catch((err) => {
            if (!cancelled) {
                setError(err);
                setIsRevalidating(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);
    const hasGitHubConnection = Boolean(data?.githubConnection || data?.vcsConnections?.some(conn => conn.provider === 'github'));
    const walletConnectionStatus = data?.walletConnectionStatus && typeof data.walletConnectionStatus === 'object'
        ? data.walletConnectionStatus
        : null;
    const repositoryConnectionStatus = data?.repositoryConnectionStatus && typeof data.repositoryConnectionStatus === 'object'
        ? data.repositoryConnectionStatus
        : null;
    const hasValidGitHubConnection = repositoryConnectionStatus
        ? Boolean(repositoryConnectionStatus.connected && repositoryConnectionStatus.valid)
        : hasGitHubConnection;
    const walletCapability = (0, orm_1.readBitcodeWalletCapabilityFromProfile)(data?.profile ?? null);
    const hasWalletConnection = walletCapability.hasIdentity;
    const hasStoredVerifiedWalletConnection = walletCapability.isVerifiedSigner;
    const hasVerifiedWalletConnection = walletConnectionStatus
        ? Boolean(walletConnectionStatus.connected && walletConnectionStatus.valid)
        : hasStoredVerifiedWalletConnection;
    const walletBindingStatus = walletCapability.binding?.status ?? null;
    const repositories = Array.isArray(data?.repositories) ? data.repositories : [];
    const repositoryInventorySource = typeof data?.repositoryInventorySource === 'string'
        ? data.repositoryInventorySource
        : null;
    const organizations = deriveConnectedOrganizations(repositories, data?.organizations);
    const btdBalance = typeof data?.btdBalance === 'number' ? data.btdBalance : cachedBtdBalance;
    const btcFeeBalance = typeof data?.btcFeeBalance === 'number'
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
    const onboardedSteps = (0, auxillary_pane_meta_1.normalizeAuxillarySteps)(data?.onboardedPanes ?? data?.onboarded_steps ?? []);
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
    };
}
