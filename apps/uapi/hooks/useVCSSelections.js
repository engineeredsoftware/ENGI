"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVCSSelections = useVCSSelections;
const react_1 = require("react");
/**
 * Build API URL with query parameters
 */
const buildApiUrl = (resource, params) => {
    const searchParams = new URLSearchParams({ resource, ...params });
    return `/api/vcs?${searchParams}`;
};
/**
 * Provider-specific data transformers for consistent option formatting
 */
const transformers = {
    github: {
        accounts: (data) => data.accounts.map((acc) => ({
            label: `${acc.login} (${acc.type})`,
            value: acc.login
        })),
        repositories: (data) => data.repositories.map((repo) => ({
            label: repo.name,
            value: repo.name
        }))
    },
    gitlab: {
        accounts: (data) => data.namespaces.map((ns) => ({
            label: `${ns.full_path} (${ns.kind})`,
            value: ns.full_path
        })),
        repositories: (data) => data.repositories.map((repo) => ({
            label: repo.name,
            value: repo.name
        }))
    },
    bitbucket: {
        accounts: (data) => data.workspaces.map((ws) => ({
            label: ws.name,
            value: ws.slug
        })),
        repositories: (data) => data.repositories.map((repo) => ({
            label: repo.name,
            value: repo.name
        }))
    }
};
/**
 * Fetch VCS data with client-side caching (1 minute TTL)
 */
const clientCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute client cache
const fetchVCSData = async (url) => {
    // Check client cache first
    const cached = clientCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401 || response.status === 404) {
                return null;
            }
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `Failed to fetch from ${url}`);
        }
        const data = await response.json();
        // Store in client cache
        clientCache.set(url, { data, timestamp: Date.now() });
        return data;
    }
    catch (error) {
        console.error('VCS fetch error:', error);
        // Re-throw to be caught by caller
        throw error;
    }
};
/**
 * Hook for managing VCS selection state with cascading data loading
 */
function useVCSSelections({ provider, account, repo, branch }) {
    // Core state for VCS selections
    const [connections, setConnections] = (0, react_1.useState)([]);
    const [accounts, setAccounts] = (0, react_1.useState)([]);
    const [repositories, setRepositories] = (0, react_1.useState)([]);
    const [branches, setBranches] = (0, react_1.useState)([]);
    const [commits, setCommits] = (0, react_1.useState)([]);
    const [defaultBranch, setDefaultBranch] = (0, react_1.useState)(null);
    // Loading states for each data type
    const [isLoadingAccounts, setIsLoadingAccounts] = (0, react_1.useState)(false);
    const [isLoadingRepos, setIsLoadingRepos] = (0, react_1.useState)(false);
    const [isLoadingBranches, setIsLoadingBranches] = (0, react_1.useState)(false);
    const [isLoadingCommits, setIsLoadingCommits] = (0, react_1.useState)(false);
    // Error state
    const [error, setError] = (0, react_1.useState)(null);
    const clearError = (0, react_1.useCallback)(() => setError(null), []);
    // Load VCS connections on mount
    (0, react_1.useEffect)(() => {
        const loadConnections = async () => {
            try {
                const data = await fetchVCSData(buildApiUrl('connections'));
                if (data?.connections) {
                    setConnections(data.connections);
                }
                else {
                    setConnections([]);
                }
            }
            catch {
                setConnections([]);
            }
        };
        loadConnections();
    }, []);
    // Load accounts when provider changes
    (0, react_1.useEffect)(() => {
        if (!provider) {
            setAccounts([]);
            setRepositories([]);
            setBranches([]);
            setCommits([]);
            return;
        }
        const loadAccounts = async () => {
            setIsLoadingAccounts(true);
            try {
                const data = await fetchVCSData(buildApiUrl('accounts', { provider }));
                if (data && transformers[provider]) {
                    setAccounts(transformers[provider].accounts(data));
                }
                else {
                    setAccounts([]);
                }
            }
            catch {
                setAccounts([]);
            }
            setIsLoadingAccounts(false);
        };
        loadAccounts();
    }, [provider]);
    // Load repositories when account changes
    (0, react_1.useEffect)(() => {
        // Clear downstream data immediately when dependencies change
        setRepositories([]);
        setBranches([]);
        setCommits([]);
        if (!provider || !account) {
            return;
        }
        const loadRepositories = async () => {
            setIsLoadingRepos(true);
            setError(null);
            try {
                const data = await fetchVCSData(buildApiUrl('repositories', { provider, owner: account }));
                if (data && transformers[provider]) {
                    setRepositories(transformers[provider].repositories(data));
                }
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load repositories';
                setError(errorMessage);
                console.error('Repository loading error:', errorMessage);
            }
            finally {
                setIsLoadingRepos(false);
            }
        };
        loadRepositories();
    }, [provider, account]);
    // Load branches when repository changes
    (0, react_1.useEffect)(() => {
        // Clear downstream data immediately
        setBranches([]);
        setCommits([]);
        if (!provider || !account || !repo) {
            return;
        }
        const loadBranches = async () => {
            setIsLoadingBranches(true);
            try {
                const data = await fetchVCSData(buildApiUrl('branches', { provider, owner: account, repo }));
                if (data) {
                    setBranches(data.branches.map((b) => ({
                        label: typeof b === 'string' ? b : b.name,
                        value: typeof b === 'string' ? b : b.name
                    })));
                    setDefaultBranch(data.defaultBranch || null);
                }
                else {
                    setBranches([]);
                    setDefaultBranch(null);
                }
            }
            catch {
                setBranches([]);
                setDefaultBranch(null);
            }
            setIsLoadingBranches(false);
        };
        loadBranches();
    }, [provider, account, repo]);
    // Load commits when branch changes
    (0, react_1.useEffect)(() => {
        // Clear immediately
        setCommits([]);
        if (!provider || !account || !repo || !branch) {
            return;
        }
        const loadCommits = async () => {
            setIsLoadingCommits(true);
            try {
                const data = await fetchVCSData(buildApiUrl('commits', { provider, owner: account, repo, branch }));
                if (data) {
                    setCommits(data.commits.map((commit) => ({
                        label: commit.sha.slice(0, 7),
                        value: commit.sha
                    })));
                }
                else {
                    setCommits([]);
                }
            }
            catch {
                setCommits([]);
            }
            setIsLoadingCommits(false);
        };
        loadCommits();
    }, [provider, account, repo, branch]);
    // Return memoized result to prevent unnecessary re-renders
    return (0, react_1.useMemo)(() => ({
        connections,
        accounts,
        repositories,
        branches,
        commits,
        isLoadingAccounts,
        isLoadingRepos,
        isLoadingBranches,
        isLoadingCommits,
        defaultBranch,
        error,
        clearError
    }), [
        connections,
        accounts,
        repositories,
        branches,
        commits,
        isLoadingAccounts,
        isLoadingRepos,
        isLoadingBranches,
        isLoadingCommits,
        defaultBranch,
        error,
        clearError
    ]);
}
