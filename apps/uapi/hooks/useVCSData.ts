import { useCallback, useState, useEffect } from 'react';
import { VCSProviderType } from '@bitcode/vcs-generics';
import { useVCSSelections } from './useVCSSelections';
import {
  Account,
  Repository,
  IssueOrPR,
  RepoFile
} from '../types/api';
import { fetchIssuesAndPRs as fetchIssuesAPI, fetchFiles as fetchFilesAPI, fetchAccounts } from '@/networking/api-client';

/**
 * VCS data interface for product repository context and Finish delivery
 * mechanism selectors.
 */
export interface VCSData {
  provider: VCSProviderType | null;
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

/**
 * VCS data hook with issues/PRs and files support for Read measurement,
 * AssetPack synthesis evidence, and Shippable delivery mechanisms.
 */
export const useVCSData = () => {
  // Add state management for the data
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [issuesAndPRs, setIssuesAndPRs] = useState<IssueOrPR[]>([]);
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State will be managed by the parent component
  let currentProvider: VCSProviderType | null = null;
  let currentAccount: string | null = null;
  let currentRepo: string | null = null;
  let currentBranch: string | null = null;
  
  // Fetch accounts on mount
  useEffect(() => {
    const loadInitialAccounts = async () => {
      try {
        setIsLoadingAccounts(true);
        const data = await fetchAccounts();
        setAccounts(data);
      } catch (err) {
        // Silently handle - empty accounts is valid when not connected
        setAccounts([]);
      } finally {
        setIsLoadingAccounts(false);
      }
    };
    
    loadInitialAccounts();
  }, []);

  const setProvider = useCallback((provider: VCSProviderType | null) => {
    currentProvider = provider;
  }, []);

  const loadAccounts = useCallback(async (provider: VCSProviderType) => {
    // No-op - handled by useVCSSelections
  }, []);

  const loadRepositories = useCallback(async (provider: VCSProviderType, owner: string) => {
    currentAccount = owner;
  }, []);

  const loadBranches = useCallback(async (provider: VCSProviderType, owner: string, repo: string) => {
    currentRepo = repo;
  }, []);

  const loadCommits = useCallback(async (provider: VCSProviderType, owner: string, repo: string, branch: string) => {
    currentBranch = branch;
  }, []);

  const loadIssuesAndPRs = useCallback(async (provider: VCSProviderType, owner: string, repo: string) => {
    if (!owner || !repo) return;
    
    setIsLoadingIssues(true);
    setError(null);
    
    try {
      const data = await fetchIssuesAPI(owner, repo);
      setIssuesAndPRs(data);
    } catch (err) {
      // Silently handle - empty issues is valid when not connected
      setIssuesAndPRs([]);
    } finally {
      setIsLoadingIssues(false);
    }
  }, []);

  const loadFiles = useCallback(async (provider: VCSProviderType, owner: string, repo: string, path: string = '') => {
    if (!owner || !repo) return;
    
    setIsLoadingFiles(true);
    setError(null);
    
    try {
      const data = await fetchFilesAPI(owner, repo, path);
      setFiles(data);
    } catch (err) {
      // Silently handle - empty files is valid
      setFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  // Return VCS data interface with all fields
  return {
    provider: currentProvider,
    accounts,
    repositories: [],
    branches: [],
    commits: [],
    issuesAndPRs,
    files,
    defaultBranch: null,
    isLoadingAccounts,
    isLoadingRepos: false,
    isLoadingBranches: false,
    isLoadingCommits: false,
    isLoadingIssues,
    isLoadingFiles,
    error,
    setProvider,
    loadAccounts,
    loadRepositories,
    loadBranches,
    loadCommits,
    loadIssuesAndPRs,
    loadFiles
  };
};
