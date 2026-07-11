/* eslint-disable react/no-multi-comp */
"use client";
import React, { useCallback, useMemo } from 'react';
import Image from 'next/image';
import Select, { components, SingleValue } from 'react-select';
import { VCSProviderType } from '@bitcode/vcs-core';
import { VCSIconSelector } from '@/components/bitcode/vcs/VCSIconSelector/VCSIconSelector';
import { Github, GitBranch } from 'lucide-react';
import { glassyStyles, glassyPillStyles } from '@/components/bitcode/selects/GlassySelectStyles/glassy-select-styles';

/**
 * Simple option type for select dropdowns
 */
type SelectOption = {
  label: string;
  value: string;
};

/**
 * Props interface for VCS source selectors
 */
interface VCSSourceSelectorsProps {
  // Selected values
  selectedProvider: VCSProviderType | null;
  selectedAccount: string | null;
  selectedRepo: string | null;
  selectedBranch: string | null;
  selectedCommit: string | null;
  // Data provided by page-level hooks
  connections: any[];
  accounts: SelectOption[];
  repositories: SelectOption[];
  branches: SelectOption[];
  commits: SelectOption[];
  defaultBranch?: string | null;
  isLoadingAccounts: boolean;
  isLoadingRepos: boolean;
  isLoadingBranches: boolean;
  isLoadingCommits: boolean;
  error?: string | null;
  clearError?: () => void;
  // Event handlers
  onProviderChange: (provider: VCSProviderType | null) => void;
  onAccountChange: (value: string | null) => void;
  onRepoChange: (value: string | null) => void;
  onBranchChange: (value: string | null) => void;
  onCommitChange: (value: string | null) => void;
  // Optional load notifications for auto-select logic
  onAccountsLoaded?: (accounts: SelectOption[]) => void;
  onReposLoaded?: (repos: SelectOption[]) => void;
  onBranchesLoaded?: (branches: SelectOption[], defaultBranch: string | null) => void;
  onCommitsLoaded?: (commits: SelectOption[]) => void;
}

/**
 * Provider icon mapping
 */
const PROVIDER_ICONS = {
  github: Github,
  gitlab: GitBranch,
  bitbucket: GitBranch
} as const;

/**
 * Loading spinner component
 */
const LoadingSpinner = React.memo(() => (
  <svg className="w-3 h-3 mx-2 text-[#67feb7] animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
));
LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Reusable VCS select component
 */
const VCSSelect = React.memo(({
  value,
  options,
  onChange,
  isLoading,
  isDisabled,
  placeholder,
  testId,
  icon
}: {
  value: string | null;
  options: SelectOption[];
  onChange: (value: string | null) => void;
  isLoading: boolean;
  isDisabled: boolean;
  placeholder: string;
  testId: string;
  icon: React.ReactNode;
}) => {
  const selectedOption = useMemo(
    () => value ? options.find(o => o.value === value) : null,
    [value, options]
  );

  const handleChange = useCallback(
    (option: SingleValue<SelectOption>) => onChange(option?.value || null),
    [onChange]
  );

  return (
    <div data-testid={testId} className="relative w-48">
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isSearchable={true}
        isLoading={isLoading}
        isDisabled={isDisabled}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        styles={{
          ...glassyStyles,
          control: (base, state) => ({
            ...glassyStyles.control(base, state),
            ...glassyPillStyles,
          }),
        }}
        components={{
          Control: ({ children, ...props }) => (
            <components.Control {...props}>
              {isLoading ? <LoadingSpinner /> : icon}
              {children}
            </components.Control>
          ),
        }}
        placeholder={placeholder}
      />
    </div>
  );
});
VCSSelect.displayName = 'VCSSelect';

/**
 * Main VCS source selectors component
 */
export const VCSSourceSelectors = React.memo((props: VCSSourceSelectorsProps) => {
  const {
    selectedProvider,
    selectedAccount,
    selectedRepo,
    selectedBranch,
    selectedCommit,
    onProviderChange,
    onAccountChange,
    onRepoChange,
    onBranchChange,
    onCommitChange,
    onAccountsLoaded,
    onReposLoaded,
    onBranchesLoaded,
    onCommitsLoaded,
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
  } = props;

  // Notify parent when accounts load
  React.useEffect(() => {
    if (accounts.length > 0 && onAccountsLoaded) {
      onAccountsLoaded(accounts);
    }
  }, [accounts, onAccountsLoaded]);

  // Notify parent when repos load
  React.useEffect(() => {
    if (repositories.length > 0 && onReposLoaded) {
      onReposLoaded(repositories);
    }
  }, [repositories, onReposLoaded]);

  // Notify parent when branches load  
  React.useEffect(() => {
    if (branches.length > 0 && onBranchesLoaded) {
      onBranchesLoaded(branches, defaultBranch ?? null);
    }
  }, [branches, defaultBranch, onBranchesLoaded]);

  // Notify parent when commits load
  React.useEffect(() => {
    if (commits.length > 0 && onCommitsLoaded) {
      onCommitsLoaded(commits);
    }
  }, [commits, onCommitsLoaded]);

  // Memoized provider icon
  const ProviderIcon = useMemo(
    () => selectedProvider ? PROVIDER_ICONS[selectedProvider] : GitBranch,
    [selectedProvider]
  );

  // Memoized icon components
  const accountIcon = useMemo(
    () => <ProviderIcon className="w-3 h-3 mx-2 opacity-70" />,
    [ProviderIcon]
  );

  const repoIcon = useMemo(
    () => (
      <Image
        src="/icons/branch.svg"
        width={12}
        height={12}
        alt=""
        className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 transition-opacity mx-2"
      />
    ),
    []
  );

  const branchIcon = useMemo(
    () => (
      <Image
        src="/icons/branch.svg"
        width={12}
        height={12}
        alt=""
        className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 transition-opacity mx-2"
      />
    ),
    []
  );

  const commitIcon = useMemo(
    () => (
      <Image
        src="/icons/commit.svg"
        width={12}
        height={12}
        alt=""
        className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 transition-opacity mx-2"
      />
    ),
    []
  );

  return (
    <>
      {/* Show error if present */}
      {error && (
        <div className="w-full mb-2">
          <div className="px-3 py-2 text-xs text-red-400 bg-red-900/20 border border-red-500/20 flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={clearError} 
              className="ml-2 text-red-300 hover:text-red-200 underline text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-2">
        {/* VCS Provider Icon Selector */}
        <VCSIconSelector
          value={selectedProvider}
          connections={connections}
          onChange={onProviderChange}
        />

      <VCSSelect
        value={selectedAccount}
        options={accounts}
        onChange={onAccountChange}
        isLoading={isLoadingAccounts}
        isDisabled={!selectedProvider || isLoadingAccounts}
        placeholder="Organization"
        testId="vcs-account"
        icon={accountIcon}
      />

      <VCSSelect
        value={selectedRepo}
        options={repositories}
        onChange={onRepoChange}
        isLoading={isLoadingRepos}
        isDisabled={!selectedAccount || isLoadingRepos}
        placeholder="Repository"
        testId="vcs-repo"
        icon={repoIcon}
      />

      <VCSSelect
        value={selectedBranch}
        options={branches}
        onChange={onBranchChange}
        isLoading={isLoadingBranches}
        isDisabled={!selectedRepo || isLoadingBranches}
        placeholder="Branch"
        testId="vcs-branch"
        icon={branchIcon}
      />

      <VCSSelect
        value={selectedCommit}
        options={commits}
        onChange={onCommitChange}
        isLoading={isLoadingCommits}
        isDisabled={!selectedBranch || isLoadingCommits}
        placeholder="Commit"
        testId="vcs-commit"
        icon={commitIcon}
        />
      </div>
    </>
  );
});

VCSSourceSelectors.displayName = 'VCSSourceSelectors';
