"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vcsQueryKeys = void 0;
exports.useVCSConnections = useVCSConnections;
exports.useVCSAccounts = useVCSAccounts;
exports.useVCSRepositories = useVCSRepositories;
exports.useVCSBranches = useVCSBranches;
exports.useVCSCommits = useVCSCommits;
const react_query_1 = require("@tanstack/react-query");
/**
 * React Query keys for consistent VCS data caching
 */
exports.vcsQueryKeys = {
    all: ['vcs'],
    connections: () => [...exports.vcsQueryKeys.all, 'connections'],
    accounts: (provider) => [...exports.vcsQueryKeys.all, 'accounts', provider],
    repositories: (provider, owner) => [...exports.vcsQueryKeys.all, 'repositories', provider, owner],
    branches: (provider, owner, repo) => [...exports.vcsQueryKeys.all, 'branches', provider, owner, repo],
    commits: (provider, owner, repo, branch) => [...exports.vcsQueryKeys.all, 'commits', provider, owner, repo, branch],
};
/**
 * Build fetch function with query parameters
 */
const buildFetcher = (resource, params) => {
    const searchParams = new URLSearchParams({ resource, ...params });
    return () => fetch(`/api/vcs?${searchParams}`).then(res => {
        if (!res.ok)
            throw new Error(`Failed to fetch ${resource}`);
        return res.json();
    });
};
/**
 * Default query options for VCS data fetching
 */
const defaultQueryOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
};
/**
 * Typed React Query hooks for VCS data
 */
function useVCSConnections() {
    return (0, react_query_1.useQuery)({
        queryKey: exports.vcsQueryKeys.connections(),
        queryFn: buildFetcher('connections'),
        ...defaultQueryOptions
    });
}
function useVCSAccounts(provider) {
    return (0, react_query_1.useQuery)({
        queryKey: provider ? exports.vcsQueryKeys.accounts(provider) : [],
        queryFn: provider ? buildFetcher('accounts', { provider }) : undefined,
        enabled: !!provider,
        ...defaultQueryOptions
    });
}
function useVCSRepositories(provider, owner) {
    return (0, react_query_1.useQuery)({
        queryKey: provider && owner ? exports.vcsQueryKeys.repositories(provider, owner) : [],
        queryFn: provider && owner ? buildFetcher('repositories', { provider, owner }) : undefined,
        enabled: !!provider && !!owner,
        ...defaultQueryOptions
    });
}
function useVCSBranches(provider, owner, repo) {
    return (0, react_query_1.useQuery)({
        queryKey: provider && owner && repo
            ? exports.vcsQueryKeys.branches(provider, owner, repo) : [],
        queryFn: provider && owner && repo
            ? buildFetcher('branches', { provider, owner, repo }) : undefined,
        enabled: !!provider && !!owner && !!repo,
        ...defaultQueryOptions
    });
}
function useVCSCommits(provider, owner, repo, branch) {
    return (0, react_query_1.useQuery)({
        queryKey: provider && owner && repo && branch
            ? exports.vcsQueryKeys.commits(provider, owner, repo, branch) : [],
        queryFn: provider && owner && repo && branch
            ? buildFetcher('commits', { provider, owner, repo, branch }) : undefined,
        enabled: !!provider && !!owner && !!repo && !!branch,
        ...defaultQueryOptions
    });
}
