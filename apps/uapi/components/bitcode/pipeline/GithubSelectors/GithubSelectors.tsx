'use client';

import React from 'react';
/* eslint-disable react/no-multi-comp */
import Image from 'next/image';
import Select, { components } from 'react-select';
import { glassyStyles, glassyPillStyles } from '@/components/bitcode/selects/GlassySelectStyles/glassy-select-styles';
import { NoOptionsMessage } from '@/components/bitcode/pipeline/SelectComponents/SelectComponents';
import type { Account, Repository } from '@/types/api';

interface GitHubSelectorsProps {
  accounts: Account[];
  repositories: Repository[];
  branches: any[];
  commits: any[];
  selectedAccount: string | null;
  selectedRepo: string | null;
  selectedBranch: string | null;
  selectedCommit: string | null;
  isLoadingAccounts: boolean;
  isLoadingRepos: boolean;
  isLoadingBranches: boolean;
  isLoadingCommits: boolean;
  onAccountChange: (value: string | null) => void;
  onRepoChange: (value: string | null) => void;
  onBranchChange: (value: string | null) => void;
  onCommitChange: (value: string | null) => void;
}

export const GitHubSelectors = ({
  accounts,
  repositories,
  branches,
  commits,
  selectedAccount,
  selectedRepo,
  selectedBranch,
  selectedCommit,
  isLoadingAccounts,
  isLoadingRepos,
  isLoadingBranches,
  isLoadingCommits,
  onAccountChange,
  onRepoChange,
  onBranchChange,
  onCommitChange
}: GitHubSelectorsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Account Select */}
      <div data-testid="gh-account" className="relative w-48 z-[5]">
        <Select
          value={selectedAccount ? { label: selectedAccount, value: selectedAccount } : null}
          onChange={(option) => onAccountChange(option?.value || null)}
          options={accounts.map((account) => ({
            label: `${account.login} (${account.type})`,
            value: account.login,
          }))}
          isSearchable={true}
          isLoading={isLoadingAccounts}
          isDisabled={isLoadingAccounts}
        styles={{
          ...glassyStyles,
          control: (base, state) => ({
            ...glassyStyles.control(base, state),
            ...glassyPillStyles,
          }),
        }}
          components={{
            NoOptionsMessage,
            Control: ({ children, ...props }) => (
              <components.Control {...props}>
                {isLoadingAccounts ? (
                  <svg className="w-3 h-3 mx-2 text-[#67feb7] animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <Image
                    src="/icons/repo.svg"
                    width={12}
                    height={12}
                    alt=""
                    className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 transition-opacity mx-2"
                  />
                )}
                {children}
              </components.Control>
            ),
          }}
          placeholder="Account"
        />
      </div>

      {/* Repository Select */}
      <div data-testid="gh-repo" className="relative w-48">
        <Select
          value={selectedRepo ? { label: selectedRepo, value: selectedRepo } : null}
          onChange={(option) => onRepoChange(option?.value || null)}
          options={repositories.map((repo) => ({
            label: repo.name,
            value: repo.name
          }))}
          isSearchable={true}
          isLoading={isLoadingRepos}
          isDisabled={!selectedAccount || isLoadingRepos}
          styles={{
            ...glassyStyles,
            control: (base, state) => ({
              ...glassyStyles.control(base, state),
              ...glassyPillStyles,
            }),
          }}
          components={{
            NoOptionsMessage,
            Control: ({ children, ...props }) => (
              <components.Control {...props}>
                {isLoadingRepos ? (
                  <svg className="w-3 h-3 mx-2 text-[#67feb7] animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <Image
                    src="/icons/branch.svg"
                    width={12}
                    height={12}
                    alt=""
                    className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 transition-opacity mx-2"
                  />
                )}
                {children}
              </components.Control>
            ),
          }}
          placeholder="Repository"
        />
      </div>

      {/* Branch Select */}
      <div data-testid="gh-branch" className="relative w-48">
        <Select
          value={selectedBranch ? { label: selectedBranch, value: selectedBranch } : null}
          onChange={(option) => onBranchChange(option?.value || null)}
          options={branches.map((branch: any) => ({
            label: branch.name,
            value: branch.name
          }))}
          isSearchable={true}
          isLoading={isLoadingBranches}
          isDisabled={!selectedRepo || isLoadingBranches}
          styles={{
            ...glassyStyles,
            control: (base, state) => ({
              ...glassyStyles.control(base, state),
              ...glassyPillStyles,
            }),
          }}
          components={{
            NoOptionsMessage,
            Control: ({ children, ...props }) => (
              <components.Control {...props}>
                {isLoadingBranches ? (
                  <svg className="w-3 h-3 mx-2 text-[#67feb7] animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <Image
                    src="/icons/branch.svg"
                    width={12}
                    height={12}
                    alt=""
                    className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 transition-opacity mx-2"
                  />
                )}
                {children}
              </components.Control>
            ),
          }}
          placeholder="Branch"
        />
      </div>

      {/* Commit Select */}
      <div data-testid="gh-commit" className="relative w-48">
        <Select
          value={selectedCommit ? {
            label: selectedCommit.slice(0, 7),
            value: selectedCommit
          } : null}
          onChange={(option) => onCommitChange(option?.value || null)}
          options={commits.map((commit: any) => ({
            label: commit.sha.slice(0, 7),
            value: commit.sha,
          }))}
          isSearchable={true}
          isLoading={isLoadingCommits}
          isDisabled={!selectedBranch || isLoadingCommits}
          styles={{
            ...glassyStyles,
            control: (base, state) => ({
              ...glassyStyles.control(base, state),
              ...glassyPillStyles,
            }),
          }}
          components={{
            NoOptionsMessage,
            Control: ({ children, ...props }) => (
              <components.Control {...props}>
                {isLoadingCommits ? (
                  <svg className="w-3 h-3 mx-2 text-[#67feb7] animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <Image
                    src="/icons/commit.svg"
                    width={12}
                    height={12}
                    alt=""
                    className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 transition-opacity mx-2"
                  />
                )}
                {children}
              </components.Control>
            ),
          }}
          placeholder="Commit"
        />
      </div>
    </div>
  );
};
