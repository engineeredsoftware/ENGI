"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGitHubData = void 0;
const react_1 = require("react");
const api_client_1 = require("../networking/api-client");
const useGitHubData = () => {
    const [data, setData] = (0, react_1.useState)({
        accounts: [],
        repositories: [],
        branches: [],
        commits: [],
        issuesAndPRs: [],
        files: [],
        defaultBranch: null,
        isLoadingAccounts: true,
        isLoadingRepos: false,
        isLoadingBranches: false,
        isLoadingCommits: false,
        isLoadingIssues: false,
        isLoadingFiles: false,
        error: null
    });
    const loadAccounts = (0, react_1.useCallback)(async () => {
        try {
            setData(prev => ({ ...prev, isLoadingAccounts: true, error: null }));
            const accounts = await (0, api_client_1.fetchAccounts)();
            setData(prev => ({
                ...prev,
                accounts,
                isLoadingAccounts: false
            }));
        }
        catch (error) {
            setData(prev => ({
                ...prev,
                error: error.message,
                isLoadingAccounts: false
            }));
        }
    }, []); // TODO: should i add setData here and to these memoized loaders? when these are not memoized it's obviously dangerous because the data will change making the hook re-render which would create new function references each time
    const loadRepositories = (0, react_1.useCallback)(async (owner) => {
        if (!owner)
            return;
        try {
            setData(prev => ({ ...prev, isLoadingRepos: true, error: null }));
            const repositories = await (0, api_client_1.fetchRepositories)(owner);
            setData(prev => ({
                ...prev,
                repositories,
                isLoadingRepos: false
            }));
        }
        catch (error) {
            setData(prev => ({
                ...prev,
                error: error.message,
                isLoadingRepos: false
            }));
        }
    }, []);
    const loadBranches = (0, react_1.useCallback)(async (owner, repo) => {
        if (!owner || !repo)
            return;
        try {
            setData(prev => ({ ...prev, isLoadingBranches: true, error: null }));
            const { branches, defaultBranch } = await (0, api_client_1.fetchBranchesAndInfo)(owner, repo);
            setData(prev => ({
                ...prev,
                branches,
                defaultBranch,
                isLoadingBranches: false
            }));
        }
        catch (error) {
            setData(prev => ({
                ...prev,
                error: error.message,
                isLoadingBranches: false
            }));
        }
    }, []);
    const loadCommits = (0, react_1.useCallback)(async (owner, repo, branch) => {
        if (!owner || !repo || !branch)
            return;
        try {
            setData(prev => ({ ...prev, isLoadingCommits: true, error: null }));
            const commits = await (0, api_client_1.fetchCommits)(owner, repo, branch);
            setData(prev => ({
                ...prev,
                commits,
                isLoadingCommits: false
            }));
        }
        catch (error) {
            setData(prev => ({
                ...prev,
                error: error.message,
                isLoadingCommits: false
            }));
        }
    }, []);
    const loadIssuesAndPRs = (0, react_1.useCallback)(async (owner, repo) => {
        if (!owner || !repo)
            return;
        try {
            setData(prev => ({ ...prev, isLoadingIssues: true, error: null }));
            const issuesAndPRs = await (0, api_client_1.fetchIssuesAndPRs)(owner, repo);
            setData(prev => ({
                ...prev,
                issuesAndPRs,
                isLoadingIssues: false
            }));
        }
        catch (error) {
            setData(prev => ({
                ...prev,
                error: error.message,
                isLoadingIssues: false
            }));
        }
    }, []);
    const loadFiles = (0, react_1.useCallback)(async (owner, repo, path = '') => {
        if (!owner || !repo)
            return;
        try {
            setData(prev => ({ ...prev, isLoadingFiles: true, error: null }));
            const files = await (0, api_client_1.fetchFiles)(owner, repo, path);
            setData(prev => ({
                ...prev,
                files,
                isLoadingFiles: false
            }));
        }
        catch (error) {
            setData(prev => ({
                ...prev,
                error: error.message,
                isLoadingFiles: false
            }));
        }
    }, []);
    (0, react_1.useEffect)(() => {
        loadAccounts();
    }, []);
    return {
        ...data,
        loadAccounts,
        loadRepositories,
        loadBranches,
        loadCommits,
        loadIssuesAndPRs,
        loadFiles
    };
};
exports.useGitHubData = useGitHubData;
