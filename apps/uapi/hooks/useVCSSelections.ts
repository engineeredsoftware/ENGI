import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { VCSProviderType, VCSConnection } from '@bitcode/vcs-generics';

/**
 * Simple option type for select dropdowns
 */
type SelectOption = {
  label: string;
  value: string;
};

/**
 * Hook parameters for VCS selection state
 */
interface UseVCSSelectionsParams {
  provider: VCSProviderType | null;
  account: string | null;
  repo: string | null;
  branch: string | null;
}

/**
 * Return type with all VCS selection data and loading states
 */
interface UseVCSSelectionsReturn {
  connections: VCSConnection[];
  accounts: SelectOption[];
  repositories: SelectOption[];
  branches: SelectOption[];
  commits: SelectOption[];
  isLoadingAccounts: boolean;
  isLoadingRepos: boolean;
  isLoadingBranches: boolean;
  isLoadingCommits: boolean;
  defaultBranch: string | null;
  error: string | null;
  clearError: () => void;
}

/**
 * Build API URL with query parameters
 */
const buildApiUrl = (resource: string, params?: Record<string, string>) => {
  const searchParams = new URLSearchParams({ resource, ...params });
  return `/api/vcs?${searchParams}`;
};

/**
 * Provider-specific data transformers for consistent option formatting
 */
const transformers = {
  github: {
    accounts: (data: any): SelectOption[] => 
      data.accounts.map((acc: any) => ({
        label: `${acc.login} (${acc.type})`,
        value: acc.login
      })),
    repositories: (data: any): SelectOption[] =>
      data.repositories.map((repo: any) => ({
        label: repo.name,
        value: repo.name
      }))
  },
  gitlab: {
    accounts: (data: any): SelectOption[] =>
      data.namespaces.map((ns: any) => ({
        label: `${ns.full_path} (${ns.kind})`,
        value: ns.full_path
      })),
    repositories: (data: any): SelectOption[] =>
      data.repositories.map((repo: any) => ({
        label: repo.name,
        value: repo.name
      }))
  },
  bitbucket: {
    accounts: (data: any): SelectOption[] =>
      data.workspaces.map((ws: any) => ({
        label: ws.name,
        value: ws.slug
      })),
    repositories: (data: any): SelectOption[] =>
      data.repositories.map((repo: any) => ({
        label: repo.name,
        value: repo.name
      }))
  }
} as const;

/**
 * Fetch VCS data with client-side caching (1 minute TTL)
 */
const clientCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute client cache

const fetchVCSData = async <T,>(url: string): Promise<T | null> => {
  // Check client cache first
  const cached = clientCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
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
  } catch (error) {
    console.error('VCS fetch error:', error);
    // Re-throw to be caught by caller
    throw error;
  }
};

/**
 * Hook for managing VCS selection state with cascading data loading
 */
export function useVCSSelections({
  provider,
  account,
  repo,
  branch
}: UseVCSSelectionsParams): UseVCSSelectionsReturn {
  // Core state for VCS selections
  const [connections, setConnections] = useState<VCSConnection[]>([]);
  const [accounts, setAccounts] = useState<SelectOption[]>([]);
  const [repositories, setRepositories] = useState<SelectOption[]>([]);
  const [branches, setBranches] = useState<SelectOption[]>([]);
  const [commits, setCommits] = useState<SelectOption[]>([]);
  const [defaultBranch, setDefaultBranch] = useState<string | null>(null);
  
  // Loading states for each data type
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  // Load VCS connections on mount
  useEffect(() => {
    const loadConnections = async () => {
      try {
        const data = await fetchVCSData<any>(buildApiUrl('connections'));
        if (data?.connections) {
          setConnections(data.connections);
        } else {
          setConnections([]);
        }
      } catch {
        setConnections([]);
      }
    };
    
    loadConnections();
  }, []);

  // Load accounts when provider changes
  useEffect(() => {
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
        const data = await fetchVCSData<any>(buildApiUrl('accounts', { provider }));
        
        if (data && transformers[provider]) {
          setAccounts(transformers[provider].accounts(data));
        } else {
          setAccounts([]);
        }
      } catch {
        setAccounts([]);
      }
      setIsLoadingAccounts(false);
    };

    loadAccounts();
  }, [provider]);

  // Load repositories when account changes
  useEffect(() => {
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
        const data = await fetchVCSData<any>(
          buildApiUrl('repositories', { provider, owner: account })
        );
        
        if (data && transformers[provider]) {
          setRepositories(transformers[provider].repositories(data));
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load repositories';
        setError(errorMessage);
        console.error('Repository loading error:', errorMessage);
      } finally {
        setIsLoadingRepos(false);
      }
    };

    loadRepositories();
  }, [provider, account]);

  // Load branches when repository changes
  useEffect(() => {
    // Clear downstream data immediately
    setBranches([]);
    setCommits([]);
    
    if (!provider || !account || !repo) {
      return;
    }

    const loadBranches = async () => {
      setIsLoadingBranches(true);
      try {
        const data = await fetchVCSData<any>(
          buildApiUrl('branches', { provider, owner: account, repo })
        );
        
        if (data) {
          setBranches(data.branches.map((b: any) => ({
            label: typeof b === 'string' ? b : b.name,
            value: typeof b === 'string' ? b : b.name
          })));
          setDefaultBranch(data.defaultBranch || null);
        } else {
          setBranches([]);
          setDefaultBranch(null);
        }
      } catch {
        setBranches([]);
        setDefaultBranch(null);
      }
      setIsLoadingBranches(false);
    };

    loadBranches();
  }, [provider, account, repo]);

  // Load commits when branch changes
  useEffect(() => {
    // Clear immediately
    setCommits([]);
    
    if (!provider || !account || !repo || !branch) {
      return;
    }

    const loadCommits = async () => {
      setIsLoadingCommits(true);
      try {
        const data = await fetchVCSData<any>(
          buildApiUrl('commits', { provider, owner: account, repo, branch })
        );
        
        if (data) {
          setCommits(data.commits.map((commit: any) => ({
            label: commit.sha.slice(0, 7),
            value: commit.sha
          })));
        } else {
          setCommits([]);
        }
      } catch {
        setCommits([]);
      }
      setIsLoadingCommits(false);
    };

    loadCommits();
  }, [provider, account, repo, branch]);

  // Return memoized result to prevent unnecessary re-renders
  return useMemo(() => ({
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
