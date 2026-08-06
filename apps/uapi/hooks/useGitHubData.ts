import { useState, useEffect, useCallback } from 'react';
import {
  Account,
  Repository,
  IssueOrPR,
  RepoFile
} from '../types/api';
import {
  fetchAccounts,
  fetchRepositories,
  fetchBranchesAndInfo,
  fetchCommits,
  fetchIssuesAndPRs,
  fetchFiles
} from '../networking/api-client';

export interface GitHubData {
  accounts: Account[];
  repositories: Repository[];
  branches: string[];
  commits: any[];
  issuesAndPRs: IssueOrPR[];
  files: RepoFile[];
  defaultBranch: string | null;
  isLoadingAccounts: boolean;
  isLoadingRepos: boolean;
  isLoadingBranches: boolean;
  isLoadingCommits: boolean;
  isLoadingIssues: boolean;
  isLoadingFiles: boolean;
  error: string | null;
}

export const useGitHubData = () => {
  const [data, setData] = useState<GitHubData>({
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

  const loadAccounts = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoadingAccounts: true, error: null }));
      const accounts = await fetchAccounts();
      setData(prev => ({
        ...prev,
        accounts,
        isLoadingAccounts: false
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: (error as Error).message,
        isLoadingAccounts: false
      }));
    }
  }, []); // TODO: should i add setData here and to these memoized loaders? when these are not memoized it's obviously dangerous because the data will change making the hook re-render which would create new function references each time

  const loadRepositories = useCallback(async (owner: string) => {
    if (!owner) return;
    try {
      setData(prev => ({ ...prev, isLoadingRepos: true, error: null }));
      const repositories = await fetchRepositories(owner);
      setData(prev => ({
        ...prev,
        repositories: Array.isArray(repositories) ? repositories : [],
        isLoadingRepos: false
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: (error as Error).message,
        isLoadingRepos: false
      }));
    }
  }, []);

  const loadBranches = useCallback(async (owner: string, repo: string) => {
    if (!owner || !repo) return;
    try {
      setData(prev => ({ ...prev, isLoadingBranches: true, error: null }));
      const { branches, defaultBranch } = await fetchBranchesAndInfo(owner, repo);
      setData(prev => ({
        ...prev,
        branches: Array.isArray(branches) ? branches : [],
        defaultBranch,
        isLoadingBranches: false
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: (error as Error).message,
        isLoadingBranches: false
      }));
    }
  }, []);

  const loadCommits = useCallback(async (owner: string, repo: string, branch: string) => {
    if (!owner || !repo || !branch) return;
    try {
      setData(prev => ({ ...prev, isLoadingCommits: true, error: null }));
      const commits = await fetchCommits(owner, repo, branch);
      setData(prev => ({
        ...prev,
        commits: Array.isArray(commits) ? commits : [],
        isLoadingCommits: false
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: (error as Error).message,
        isLoadingCommits: false
      }));
    }
  }, []);

  const loadIssuesAndPRs = useCallback(async (owner: string, repo: string) => {
    if (!owner || !repo) return;
    try {
      setData(prev => ({ ...prev, isLoadingIssues: true, error: null }));
      const issuesAndPRs = await fetchIssuesAndPRs(owner, repo);
      setData(prev => ({
        ...prev,
        issuesAndPRs,
        isLoadingIssues: false
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: (error as Error).message,
        isLoadingIssues: false
      }));
    }
  }, []);

  const loadFiles = useCallback(async (owner: string, repo: string, path: string = '') => {
    if (!owner || !repo) return;
    try {
      setData(prev => ({ ...prev, isLoadingFiles: true, error: null }));
      const files = await fetchFiles(owner, repo, path);
      setData(prev => ({
        ...prev,
        files: Array.isArray(files) ? files : [],
        isLoadingFiles: false
      }));
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: (error as Error).message,
        isLoadingFiles: false
      }));
    }
  }, []);

  useEffect(() => {
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
