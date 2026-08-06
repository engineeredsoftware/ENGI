"use client";

/**
 * Conversations GitHub source selector (full / compact / icon variants).
 * Selection cascade state lives in hooks/use-github-source-selection.
 */

import React from "react";
import Select, { components } from "react-select";
import styles from "./ConversationsGithubSourceSelector.module.css";
import "@/styles/conversations/github-source-selector.css";
import { GitHubSelectors } from "@/components/bitcode/pipeline/GithubSelectors/GithubSelectors";
import { NoOptionsMessage } from "@/components/bitcode/pipeline/SelectComponents/SelectComponents";
import { useGithubSourceSelection } from "./hooks/use-github-source-selection";

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
  const {
    accounts: accountList,
    repositories: repositoryList,
    branches: branchList,
    commits: commitList,
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
  } = useGithubSourceSelection({
    initialRepoSlug,
    initialBranch,
    initialCommit,
    onChange,
  });

  if (!variant) {
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

  const mkStyles = (ctrlWidth: number, circular: boolean) => {
    const ctrlHeight = 24;
    return {
      control: (base: Record<string, unknown>) => ({
        ...base,
        width: ctrlWidth,
        minWidth: ctrlWidth,
        height: ctrlHeight,
        minHeight: ctrlHeight,
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
      indicatorsContainer: (base: Record<string, unknown>) => ({
        ...base,
        display: variant === "icon" ? "none" : base.display,
      }),
      placeholder: (base: Record<string, unknown>) => ({
        ...base,
        display: variant === "icon" ? "none" : base.display,
      }),
      singleValue: (base: Record<string, unknown>) => ({
        ...base,
        display: variant === "icon" ? "none" : base.display,
      }),
      valueContainer: (base: Record<string, unknown>) => ({
        ...base,
        padding: 0,
        justifyContent: "center",
      }),
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
            <img src={icon} width={12} height={12} alt="" style={{ minWidth: 12, minHeight: 12 }} />
    );

  const renderSmall = (
    value: { label: string; value: string } | null,
    options: Array<{ label: string; value: string }>,
    onChangeFn: (o: { value?: string } | null) => void,
    isLoading: boolean,
    icon: string,
    disabled: boolean,
  ) => (
    <Select
      value={value}
      options={options}
      onChange={onChangeFn as never}
      isLoading={isLoading}
      isDisabled={disabled}
      isSearchable
      menuPlacement="auto"
      styles={mkStyles(variant === "icon" ? 24 : 90, variant === "icon") as never}
      components={(function () {
        const ctrl: Record<string, unknown> = {
          NoOptionsMessage,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Control: (props: any) => {
            const { children, ...rest } = props;
            return (
              <components.Control {...rest}>
                <SelectIcon isLoading={isLoading} icon={icon} />
                {variant === "icon" ? null : children}
              </components.Control>
            );
          },
        };

        if (variant === "icon") {
          ctrl.IndicatorsContainer = () => null;
          ctrl.ValueContainer = () => null;
          ctrl.Placeholder = () => null;
          ctrl.SingleValue = () => null;
        }

        return ctrl as never;
      })()}
    />
  );

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {renderSmall(
        selectedAccount ? { label: selectedAccount, value: selectedAccount } : null,
        accountList.map((a: { login: string }) => ({ label: a.login, value: a.login })),
        (o) => handleAccountChange(o?.value || null),
        isLoadingAccounts,
        "/icons/repo.svg",
        false,
      )}
      {renderSmall(
        selectedRepo ? { label: selectedRepo, value: selectedRepo } : null,
        repositoryList.map((r: { name: string }) => ({ label: r.name, value: r.name })),
        (o) => handleRepoChange(o?.value || null),
        isLoadingRepos,
        "/icons/repo.svg",
        !selectedAccount,
      )}
      {renderSmall(
        selectedBranch ? { label: selectedBranch, value: selectedBranch } : null,
        branchList.map((b: { name?: string } | string) => {
          const name = typeof b === "string" ? b : b.name || "";
          return { label: name, value: name };
        }),
        (o) => handleBranchChange(o?.value || null),
        isLoadingBranches,
        "/icons/branch.svg",
        !selectedRepo,
      )}
      {renderSmall(
        selectedCommit
          ? { label: selectedCommit.slice(0, 7), value: selectedCommit }
          : null,
        commitList.map((c: { sha: string }) => ({
          label: c.sha.slice(0, 7),
          value: c.sha,
        })),
        (o) => handleCommitChange(o?.value || null),
        isLoadingCommits,
        "/icons/commit.svg",
        !selectedBranch,
      )}
    </div>
  );
}
