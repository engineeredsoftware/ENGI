/**
 * Selection cascade for GitHub account → repo → branch → commit in conversations.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useGitHubData } from '@/hooks/useGitHubData';

export interface UseGithubSourceSelectionArgs {
  initialRepoSlug?: string;
  initialBranch?: string | null;
  initialCommit?: string | null;
  onChange: (cfg: {
    repoSlug: string;
    branch?: string | null;
    commitSha?: string | null;
  }) => void;
}

export function useGithubSourceSelection({
  initialRepoSlug,
  initialBranch,
  initialCommit,
  onChange,
}: UseGithubSourceSelectionArgs) {
  const {
    accounts,
    repositories,
    branches,
    commits,
    defaultBranch,
    isLoadingAccounts,
    isLoadingRepos,
    isLoadingBranches,
    isLoadingCommits,
    loadRepositories,
    loadBranches,
    loadCommits,
  } = useGitHubData();

  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(() => {
    if (initialRepoSlug && initialRepoSlug.includes('/')) {
      return initialRepoSlug.split('/')[1] || null;
    }
    return null;
  });
  const [selectedBranch, setSelectedBranch] = useState<string | null>(
    initialBranch ?? null,
  );
  const [selectedCommit, setSelectedCommit] = useState<string | null>(
    initialCommit ?? null,
  );

  const [flashRepo, setFlashRepo] = useState(false);
  const [flashBranch, setFlashBranch] = useState(false);
  const [flashCommit, setFlashCommit] = useState(false);

  const triggerFlash = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true);
    setTimeout(() => setter(false), 1200);
  };

  useEffect(() => {
    const el = document.querySelector('[data-testid="gh-repo"]') as HTMLElement | null;
    if (!el) return;
    if (flashRepo) el.classList.add('auto-flash');
    else el.classList.remove('auto-flash');
  }, [flashRepo]);

  useEffect(() => {
    const el = document.querySelector('[data-testid="gh-branch"]') as HTMLElement | null;
    if (!el) return;
    if (flashBranch) el.classList.add('auto-flash');
    else el.classList.remove('auto-flash');
  }, [flashBranch]);

  useEffect(() => {
    const el = document.querySelector('[data-testid="gh-commit"]') as HTMLElement | null;
    if (!el) return;
    if (flashCommit) el.classList.add('auto-flash');
    else el.classList.remove('auto-flash');
  }, [flashCommit]);

  useEffect(() => {
    if (accounts.length === 0 || selectedAccount || isLoadingAccounts) return;

    if (initialRepoSlug && initialRepoSlug.includes('/')) {
      const accountFromSlug = initialRepoSlug.split('/')[0];
      const matchingAccount = accounts.find((a) => a.login === accountFromSlug);
      if (matchingAccount) {
        setSelectedAccount(matchingAccount.login);
        return;
      }
    }

    if (accounts[0]) {
      setSelectedAccount(accounts[0].login);
    }
  }, [accounts.length, isLoadingAccounts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedAccount && !isLoadingAccounts) {
      loadRepositories(selectedAccount);
      setSelectedRepo(null);
      setSelectedBranch(null);
      setSelectedCommit(null);
    }
  }, [selectedAccount, isLoadingAccounts, loadRepositories]);

  useEffect(() => {
    if (selectedRepo || repositories.length === 0) return;
    if (!selectedAccount || isLoadingRepos) return;

    const repoNames = repositories.map((r: { name?: string } | string) =>
      typeof r === 'string' ? r : r.name,
    );

    if (initialRepoSlug) {
      const slugParts = initialRepoSlug.split('/');
      const repoFromSlug = slugParts.length === 2 ? slugParts[1] : null;
      if (repoFromSlug && repoNames.includes(repoFromSlug)) {
        setSelectedRepo(repoFromSlug);
        return;
      }
    }

    setSelectedRepo(repoNames[0] as string);
    triggerFlash(setFlashRepo);
  }, [repositories, selectedRepo, initialRepoSlug, selectedAccount, isLoadingRepos]);

  useEffect(() => {
    if (selectedAccount && selectedRepo) {
      loadBranches(selectedAccount, selectedRepo);
      setSelectedBranch(null);
      setSelectedCommit(null);
    }
  }, [selectedAccount, selectedRepo, loadBranches]);

  useEffect(() => {
    if (branches.length === 0 || selectedBranch || isLoadingBranches) return;

    const branchNames = branches.map((b: { name?: string } | string) =>
      typeof b === 'string' ? b : b.name,
    );

    if (initialBranch && branchNames.includes(initialBranch)) {
      setSelectedBranch(initialBranch);
      triggerFlash(setFlashBranch);
    } else if (defaultBranch && branchNames.includes(defaultBranch)) {
      setSelectedBranch(defaultBranch);
      triggerFlash(setFlashBranch);
    } else if (branchNames[0]) {
      setSelectedBranch(branchNames[0] as string);
      triggerFlash(setFlashBranch);
    }
  }, [branches.length, isLoadingBranches]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedAccount && selectedRepo && selectedBranch) {
      loadCommits(selectedAccount, selectedRepo, selectedBranch);
      setSelectedCommit(null);
    }
  }, [selectedAccount, selectedRepo, selectedBranch, loadCommits]);

  useEffect(() => {
    if (commits.length === 0 || selectedCommit || isLoadingCommits) return;

    if (initialCommit) {
      const match = commits.find((c: { sha: string }) => c.sha === initialCommit);
      if (match) {
        setSelectedCommit(initialCommit);
        triggerFlash(setFlashCommit);
        return;
      }
    }
    if (commits[0]) {
      setSelectedCommit(commits[0].sha);
      triggerFlash(setFlashCommit);
    }
  }, [commits.length, isLoadingCommits]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedAccount && selectedRepo) {
      onChange({
        repoSlug: `${selectedAccount}/${selectedRepo}`,
        branch: selectedBranch || null,
        commitSha: selectedCommit || null,
      });
    } else {
      onChange({ repoSlug: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount, selectedRepo, selectedBranch, selectedCommit]);

  const handleAccountChange = useCallback((val: string | null) => {
    setSelectedAccount(val);
  }, []);
  const handleRepoChange = useCallback((val: string | null) => {
    setSelectedRepo(val);
  }, []);
  const handleBranchChange = useCallback((val: string | null) => {
    setSelectedBranch(val);
  }, []);
  const handleCommitChange = useCallback((val: string | null) => {
    setSelectedCommit(val);
  }, []);

  return {
    accounts: Array.isArray(accounts) ? accounts : [],
    repositories: Array.isArray(repositories) ? repositories : [],
    branches: Array.isArray(branches) ? branches : [],
    commits: Array.isArray(commits) ? commits : [],
    selectedAccount,
    selectedRepo,
    selectedBranch,
    selectedCommit,
    isLoadingAccounts,
    isLoadingRepos,
    isLoadingBranches,
    isLoadingCommits,
    handleAccountChange,
    handleRepoChange,
    handleBranchChange,
    handleCommitChange,
  };
}
