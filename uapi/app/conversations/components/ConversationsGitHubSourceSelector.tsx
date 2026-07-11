"use client";

import React, { useState, useEffect, useCallback } from "react";
import Select, { components } from "react-select";
import styles from './ConversationsGithubSourceSelector.module.css';
import '@/styles/conversations/github-source-selector.css';
import { useGitHubData } from "@/hooks/useGitHubData";
import { GitHubSelectors } from "@/components/bitcode/execution/github-selectors";
import { NoOptionsMessage } from "@/components/bitcode/execution/select-components";

interface Props {
  /** Initial full repo slug (e.g. "owner/repo") */
  initialRepoSlug?: string;
  /** Initial branch name (optional) */
  initialBranch?: string | null;
  /** Initial commit SHA (optional) */
  initialCommit?: string | null;
  /** Callback fired whenever a selection changes */
  onChange: (cfg: {
    repoSlug: string;
    branch?: string | null;
    commitSha?: string | null;
  }) => void;

  /** visual density variant */
  variant?: "icon" | "compact";
}

export default function ConversationsGitHubSourceSelector({
  initialRepoSlug,
  initialBranch,
  initialCommit,
  onChange,
  variant,
}: Props) {
  // ------------------------------------------------------------------
  // Hook: Load GitHub data (accounts → repos → branches → commits)
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // Local selection state (account / repo / branch / commit)
  // ------------------------------------------------------------------
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const [selectedRepo, setSelectedRepo] = useState<string | null>(() => {
    if (initialRepoSlug && initialRepoSlug.includes("/")) {
      return initialRepoSlug.split("/")[1] || null;
    }
    return null;
  });

  const [selectedBranch, setSelectedBranch] = useState<string | null>(
    initialBranch ?? null,
  );

  const [selectedCommit, setSelectedCommit] = useState<string | null>(
    initialCommit ?? null,
  );

  // ------------------------------------------------------------------
  // Flash indicators when the component auto-selects a value so users know
  // something happened implicitly.
  // ------------------------------------------------------------------

  const [flashRepo, setFlashRepo] = useState(false);
  const [flashBranch, setFlashBranch] = useState(false);
  const [flashCommit, setFlashCommit] = useState(false);

  const triggerFlash = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true);
    setTimeout(() => setter(false), 1200);
  };

  // Apply flash class to elements via data-testid (works for both full & compact variants)
  useEffect(() => {
    const el = document.querySelector('[data-testid="gh-repo"]') as HTMLElement | null;
    if (!el) return;
    if (flashRepo) {
      el.classList.add('auto-flash');
    } else {
      el.classList.remove('auto-flash');
    }
  }, [flashRepo]);

  useEffect(() => {
    const el = document.querySelector('[data-testid="gh-branch"]') as HTMLElement | null;
    if (!el) return;
    if (flashBranch) {
      el.classList.add('auto-flash');
    } else {
      el.classList.remove('auto-flash');
    }
  }, [flashBranch]);

  useEffect(() => {
    const el = document.querySelector('[data-testid="gh-commit"]') as HTMLElement | null;
    if (!el) return;
    if (flashCommit) {
      el.classList.add('auto-flash');
    } else {
      el.classList.remove('auto-flash');
    }
  }, [flashCommit]);

  // ------------------------------------------------------------------
  // Side-effects: Incrementally load data as selections are made
  // ------------------------------------------------------------------
  
  // Auto-select account when accounts finish loading
  useEffect(() => {
    if (accounts.length === 0 || selectedAccount || isLoadingAccounts) return;
    
    // If we have an initial repo slug, try to match the account
    if (initialRepoSlug && initialRepoSlug.includes("/")) {
      const accountFromSlug = initialRepoSlug.split("/")[0];
      const matchingAccount = accounts.find(a => a.login === accountFromSlug);
      if (matchingAccount) {
        setSelectedAccount(matchingAccount.login);
        return;
      }
    }
    
    // Otherwise auto-select first account
    if (accounts[0]) {
      setSelectedAccount(accounts[0].login);
    }
  }, [accounts.length, isLoadingAccounts]); // Don't include selectedAccount to avoid loop
  
  // When the account changes, fetch its repositories.
  useEffect(() => {
    // Only load repos when we have an account and accounts are fully loaded
    if (selectedAccount && !isLoadingAccounts) {
      loadRepositories(selectedAccount);
      // Reset downstream selections to avoid mismatched state.
      setSelectedRepo(null);
      setSelectedBranch(null);
      setSelectedCommit(null);
    }
  }, [selectedAccount, isLoadingAccounts, loadRepositories]);

  // Auto-select repository once the list finishes loading.  This mirrors the
  // behaviour we already apply for branches/commits so the full hierarchy can
  // cascade automatically when an `initialRepoSlug` is provided *or* when the
  // account only contains a single repository.  We purposely defer the
  // selection until after `repositories` resolves to avoid wiping an explicit
  // choice the user makes when switching accounts.
  useEffect(() => {
    // Skip if we already have a repo selected (covers the common case where
    // the user manually chose a repo after changing the account).
    if (selectedRepo || repositories.length === 0) return;
    
    // Only proceed if we have an account selected and repos are not loading
    if (!selectedAccount || isLoadingRepos) return;

    // Try to restore the repo from the initial slug if it exists in the
    // fetched list; otherwise default to the first repository.
    const repoNames = repositories.map((r: any) => (typeof r === 'string' ? r : r.name));

    if (initialRepoSlug) {
      const slugParts = initialRepoSlug.split('/');
      const repoFromSlug = slugParts.length === 2 ? slugParts[1] : null;
      if (repoFromSlug && repoNames.includes(repoFromSlug)) {
        setSelectedRepo(repoFromSlug);
        return;
      }
    }

    // Fallback: auto-select the first repo in the list.
        setSelectedRepo(repoNames[0]);
        triggerFlash(setFlashRepo);
  }, [repositories, selectedRepo, initialRepoSlug, selectedAccount, isLoadingRepos]);

  // When the repository changes, fetch its branches.
  useEffect(() => {
    if (selectedAccount && selectedRepo) {
      loadBranches(selectedAccount, selectedRepo);
      setSelectedBranch(null);
      setSelectedCommit(null);
    }
  }, [selectedAccount, selectedRepo, loadBranches]);

  // Auto-select default branch once branches finish loading.
  useEffect(() => {
    // Only run when branches load and we don't have a branch selected
    if (branches.length === 0 || selectedBranch || isLoadingBranches) return;
    
    const branchNames = branches.map((b: any) => (typeof b === "string" ? b : b.name));

    if (initialBranch && branchNames.includes(initialBranch)) {
      setSelectedBranch(initialBranch);
      triggerFlash(setFlashBranch);
    } else if (defaultBranch && branchNames.includes(defaultBranch)) {
      setSelectedBranch(defaultBranch);
      triggerFlash(setFlashBranch);
    } else if (branchNames[0]) {
      setSelectedBranch(branchNames[0]);
      triggerFlash(setFlashBranch);
    }
  }, [branches.length, isLoadingBranches]); // Remove selectedBranch from deps to avoid loop

  // When the branch changes, fetch commits.
  useEffect(() => {
    if (selectedAccount && selectedRepo && selectedBranch) {
      loadCommits(selectedAccount, selectedRepo, selectedBranch);
      setSelectedCommit(null);
    }
  }, [selectedAccount, selectedRepo, selectedBranch, loadCommits]);

  // Auto-select latest commit when commits load.
  useEffect(() => {
    // Only run when commits load and we don't have a commit selected
    if (commits.length === 0 || selectedCommit || isLoadingCommits) return;
    
    if (initialCommit) {
      const match = commits.find((c: any) => c.sha === initialCommit);
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
  }, [commits.length, isLoadingCommits]); // Remove selectedCommit from deps to avoid loop

  // ------------------------------------------------------------------
  // Propagate selection changes to parent component.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (selectedAccount && selectedRepo) {
      onChange({
        repoSlug: `${selectedAccount}/${selectedRepo}`,
        branch: selectedBranch || null,
        commitSha: selectedCommit || null,
      });
    } else {
      onChange({ repoSlug: "" });
    }
    // We intentionally exclude `onChange` from deps to avoid infinite loops –
    // the callback is expected to be stable (e.g. from `useCallback`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount, selectedRepo, selectedBranch, selectedCommit]);

  // ------------------------------------------------------------------
  // Stable event handlers passed into <GitHubSelectors />
  // ------------------------------------------------------------------
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

  const accountList = Array.isArray(accounts) ? accounts : [];
  const repositoryList = Array.isArray(repositories) ? repositories : [];
  const branchList = Array.isArray(branches) ? branches : [];
  const commitList = Array.isArray(commits) ? commits : [];

  // ------------------------------------------------------------------
  // Render – choose implementation based on `variant`
  // ------------------------------------------------------------------

  if (!variant) {
    // Use existing full-size shared component
    return (
      <GitHubSelectors
        accounts={accountList}
        repositories={repositoryList}
        branches={branchList}
        commits={commitList}
        selectedAccount={selectedAccount}
        selectedRepo={selectedRepo}
        selectedBranch={selectedBranch}
        selectedCommit={selectedCommit}
        isLoadingAccounts={isLoadingAccounts}
        isLoadingRepos={isLoadingRepos}
        isLoadingBranches={isLoadingBranches}
        isLoadingCommits={isLoadingCommits}
        onAccountChange={handleAccountChange}
        onRepoChange={handleRepoChange}
        onBranchChange={handleBranchChange}
        onCommitChange={handleCommitChange}
      />
    );
  }

  // ------------------------------------------------------------------
  // Compact variant – use shared component but override width to shrink.
  // ------------------------------------------------------------------

  if (variant === "compact") {
    return (
      <div className={styles.compactGhSelectors}>
        <GitHubSelectors
          accounts={accountList}
          repositories={repositoryList}
          branches={branchList}
          commits={commitList}
          selectedAccount={selectedAccount}
          selectedRepo={selectedRepo}
          selectedBranch={selectedBranch}
          selectedCommit={selectedCommit}
          isLoadingAccounts={isLoadingAccounts}
          isLoadingRepos={isLoadingRepos}
          isLoadingBranches={isLoadingBranches}
          isLoadingCommits={isLoadingCommits}
          onAccountChange={handleAccountChange}
          onRepoChange={handleRepoChange}
          onBranchChange={handleBranchChange}
          onCommitChange={handleCommitChange}
        />
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Icon (super-compact) – custom lightweight row with perfect circles.
  // ------------------------------------------------------------------

  // helper to construct react-select styles (icon variant only)
  // - `ctrlWidth` controls the horizontal size the user sees ("icon" = small
  //   square; "compact" = wider pill to fit text).
  // - We always force a tight `ctrlHeight` (24px) and *also* apply
  //   `minHeight` to override the default 38 px from react-select.  This is
  //   the root cause of the oval / vertically-stretched controls that were
  //   showing up in Conversations fullscreen.
  const mkStyles = (ctrlWidth: number, circular: boolean) => {
    const ctrlHeight = 24; // consistent height across both variants

    return {
      control: (base: any, _state: any) => ({
        ...base,
        width: ctrlWidth,
        minWidth: ctrlWidth,
        height: ctrlHeight,
        minHeight: ctrlHeight, // override react-select default (38px)
        lineHeight: `${ctrlHeight}px`,
        padding: 0,
        backgroundColor: "#0f0f0f",
        borderColor: "rgba(103,254,183,0.4)",
        borderRadius: circular ? "50%" : base.borderRadius,
        boxShadow: "none",
        "&:hover": { borderColor: "rgba(103,254,183,0.6)" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }),
      indicatorsContainer: (base: any) => ({
        ...base,
        display: variant === "icon" ? "none" : base.display,
      }),
      placeholder: (base: any) => ({
        ...base,
        display: variant === "icon" ? "none" : base.display,
      }),
      singleValue: (base: any) => ({
        ...base,
        display: variant === "icon" ? "none" : base.display,
      }),
      valueContainer: (base: any) => ({ ...base, padding: 0, justifyContent: "center" }),
    } as const;
  };

  const SelectIcon = ({ isLoading, icon }: { isLoading: boolean; icon: string }) =>
    isLoading ? (
      <svg
        className="w-3 h-3 text-[#67feb7] animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        style={{ minWidth: 12, minHeight: 12 }}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
    ) : (
      <img src={icon} width={12} height={12} style={{ minWidth: 12, minHeight: 12 }} />
    );

  const renderSmall = (
    value: any,
    options: any,
    onChangeFn: any,
    isLoading: boolean,
    icon: string,
    disabled: boolean,
  ) => (
    <Select
      value={value}
      options={options}
      onChange={onChangeFn}
      isLoading={isLoading}
      isDisabled={disabled}
      isSearchable
      menuPlacement="auto"
      styles={mkStyles(variant === "icon" ? 24 : 90, variant === "icon")}
      components={(function () {
        // base components
        const ctrl = {
          NoOptionsMessage,
          Control: (props: any) => {
            const { children, ...rest } = props;
            return (
            <components.Control {...rest}>
              <SelectIcon isLoading={isLoading} icon={icon} />
              {variant === "icon" ? null : children}
            </components.Control>
            );
          },
        } as any;

        if (variant === "icon") {
          ctrl.IndicatorsContainer = () => null;
          ctrl.ValueContainer = () => null;
          ctrl.Placeholder = () => null;
          ctrl.SingleValue = () => null;
        }

        return ctrl;
      })()}
    />
  );

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {renderSmall(
        selectedAccount ? { label: selectedAccount, value: selectedAccount } : null,
        accountList.map((a) => ({ label: a.login, value: a.login })),
        (o: any) => handleAccountChange(o?.value || null),
        isLoadingAccounts,
        "/icons/repo.svg",
        false,
      )}
      {renderSmall(
        selectedRepo ? { label: selectedRepo, value: selectedRepo } : null,
        repositoryList.map((r) => ({ label: r.name, value: r.name })),
        (o: any) => handleRepoChange(o?.value || null),
        isLoadingRepos,
        "/icons/repo.svg",
        !selectedAccount,
      )}
      {renderSmall(
        selectedBranch ? { label: selectedBranch, value: selectedBranch } : null,
        branchList.map((b: any) => {
          const name = typeof b === "string" ? b : b.name;
          return { label: name, value: name };
        }),
        (o: any) => handleBranchChange(o?.value || null),
        isLoadingBranches,
        "/icons/branch.svg",
        !selectedRepo,
      )}
      {renderSmall(
        selectedCommit ? { label: selectedCommit.slice(0, 7), value: selectedCommit } : null,
        commitList.map((c: any) => ({ label: c.sha.slice(0, 7), value: c.sha })),
        (o: any) => handleCommitChange(o?.value || null),
        isLoadingCommits,
        "/icons/commit.svg",
        !selectedBranch,
      )}
    </div>
  );
}
