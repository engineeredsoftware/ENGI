import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { VCSProvider } from '@bitcode/vcs-generics';

/**
 * React Query keys for consistent VCS data caching
 */
export const vcsQueryKeys = {
  all: ['vcs'] as const,
  connections: () => [...vcsQueryKeys.all, 'connections'] as const,
  accounts: (provider: VCSProvider) => [...vcsQueryKeys.all, 'accounts', provider] as const,
  repositories: (provider: VCSProvider, owner: string) => 
    [...vcsQueryKeys.all, 'repositories', provider, owner] as const,
  branches: (provider: VCSProvider, owner: string, repo: string) => 
    [...vcsQueryKeys.all, 'branches', provider, owner, repo] as const,
  commits: (provider: VCSProvider, owner: string, repo: string, branch: string) => 
    [...vcsQueryKeys.all, 'commits', provider, owner, repo, branch] as const,
} as const;

/**
 * Build fetch function with query parameters
 */
const buildFetcher = (resource: string, params?: Record<string, string>) => {
  const searchParams = new URLSearchParams({ resource, ...params });
  return () => fetch(`/api/vcs?${searchParams}`).then(res => {
    if (!res.ok) throw new Error(`Failed to fetch ${resource}`);
    return res.json();
  });
};

/**
 * Default query options for VCS data fetching
 */
const defaultQueryOptions: Partial<UseQueryOptions> = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  retry: 1,
  refetchOnWindowFocus: false,
};

/**
 * Typed React Query hooks for VCS data
 */
export function useVCSConnections() {
  return useQuery({
    queryKey: vcsQueryKeys.connections(),
    queryFn: buildFetcher('connections'),
    ...defaultQueryOptions
  });
}

export function useVCSAccounts(provider: VCSProvider | null) {
  return useQuery({
    queryKey: provider ? vcsQueryKeys.accounts(provider) : [],
    queryFn: provider ? buildFetcher('accounts', { provider }) : undefined,
    enabled: !!provider,
    ...defaultQueryOptions
  });
}

export function useVCSRepositories(provider: VCSProvider | null, owner: string | null) {
  return useQuery({
    queryKey: provider && owner ? vcsQueryKeys.repositories(provider, owner) : [],
    queryFn: provider && owner ? buildFetcher('repositories', { provider, owner }) : undefined,
    enabled: !!provider && !!owner,
    ...defaultQueryOptions
  });
}

export function useVCSBranches(
  provider: VCSProvider | null, 
  owner: string | null, 
  repo: string | null
) {
  return useQuery({
    queryKey: provider && owner && repo 
      ? vcsQueryKeys.branches(provider, owner, repo) : [],
    queryFn: provider && owner && repo 
      ? buildFetcher('branches', { provider, owner, repo }) : undefined,
    enabled: !!provider && !!owner && !!repo,
    ...defaultQueryOptions
  });
}

export function useVCSCommits(
  provider: VCSProvider | null,
  owner: string | null,
  repo: string | null,
  branch: string | null
) {
  return useQuery({
    queryKey: provider && owner && repo && branch 
      ? vcsQueryKeys.commits(provider, owner, repo, branch) : [],
    queryFn: provider && owner && repo && branch 
      ? buildFetcher('commits', { provider, owner, repo, branch }) : undefined,
    enabled: !!provider && !!owner && !!repo && !!branch,
    ...defaultQueryOptions
  });
}