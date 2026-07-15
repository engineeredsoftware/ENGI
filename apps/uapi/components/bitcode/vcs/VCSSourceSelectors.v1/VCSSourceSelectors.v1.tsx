"use client";
import React, { useCallback, useMemo } from 'react';
import Image from 'next/image';
import Select, { components, SingleValue } from 'react-select';
import { VCSProviderType } from '@bitcode/vcs-generics-core';
import { VCSProviderSelector } from '@/components/bitcode/vcs/VCSProviderSelector/VCSProviderSelector';
import { Github, GitBranch } from 'lucide-react';
import { customStyles, pillStyles } from '@/styles/select-styles';
import { NoOptionsMessage } from '@/components/bitcode/pipeline/SelectComponents/SelectComponents';
import { useVCSSelections } from '@/hooks/useVCSSelections';

/**
 * Simplified types - just what we read
 */
type SelectOption = {
  label: string;
  value: string;
};

/**
 * Clear, focused props interface
 * Zero configuration, just callbacks
 */
interface VCSSourceSelectorsProps {
  selectedProvider: VCSProviderType | null;
  selectedAccount: string | null;
  selectedRepo: string | null;
  selectedBranch: string | null;
  selectedCommit: string | null;
  onProviderChange: (provider: VCSProviderType | null) => void;
  onAccountChange: (value: string | null) => void;
  onRepoChange: (value: string | null) => void;
  onBranchChange: (value: string | null) => void;
  onCommitChange: (value: string | null) => void;
}

/**
 * Const maps for zero runtime cost
 */
const PROVIDER_ICONS = {
  github: Github,
  gitlab: GitBranch,
  bitbucket: GitBranch
} as const;

/**
 * Memoized spinner component
 */
const LoadingSpinner = React.memo(() => (
  <svg className="w-3 h-3 mx-2 text-[#67feb7] animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
));
LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Extract select component for reusability
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
        styles={{
          ...customStyles,
          control: (base, state) => ({
            ...customStyles.control(base, state),
            ...pillStyles,
          }),
        }}
        components={{
          NoOptionsMessage,
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
 * Main component focused on composition
 * All data fetching delegated to the hook
 */
export const VCSSourceSelectors = React.memo(({
  selectedProvider,
  selectedAccount,
  selectedRepo,
  selectedBranch,
  selectedCommit,
  onProviderChange,
  onAccountChange,
  onRepoChange,
  onBranchChange,
  onCommitChange
}: VCSSourceSelectorsProps) => {
  // Single hook for all VCS data
  const {
    connections,
    accounts,
    repositories,
    branches,
    commits,
    isLoadingAccounts,
    isLoadingRepos,
    isLoadingBranches,
    isLoadingCommits
  } = useVCSSelections({
    provider: selectedProvider,
    account: selectedAccount,
    repo: selectedRepo,
    branch: selectedBranch
  });

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
    <div className="flex flex-wrap items-center gap-2">
      {/* VCS Provider Selector - only show if multiple connections */}
      {connections.length > 1 && (
        <div className="relative w-48 z-[6]">
          <VCSProviderSelector
            value={selectedProvider || undefined}
            onValueChange={onProviderChange}
            className="h-9"
            showUsername={false}
          />
        </div>
      )}

      <VCSSelect
        value={selectedAccount}
        options={accounts}
        onChange={onAccountChange}
        isLoading={isLoadingAccounts}
        isDisabled={!selectedProvider || isLoadingAccounts}
        placeholder={selectedProvider ? "Account" : "Select provider first"}
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
  );
});

VCSSourceSelectors.displayName = 'VCSSourceSelectors';
