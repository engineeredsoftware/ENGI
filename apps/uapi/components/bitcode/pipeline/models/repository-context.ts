/**
 * Shared repository connection / inventory context for pipeline experiences
 * (Deposits, Reads, Packs).
 *
 * V48 naming: not Terminal-owned. Product surfaces import from this Bitcode
 * pipeline model. Temporary Terminal* aliases remain until residual cockpit
 * callers migrate.
 *
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */

import type { VCSBranch, VCSCommit, VCSProviderType, VCSRepository } from '@bitcode/vcs-generics-core';

export type RepositoryInventorySource =
  | 'stored_repository_inventory'
  | 'live_provider_inventory'
  | 'mock_repository_inventory';

/** @deprecated Prefer `RepositoryInventorySource`. */
export type TerminalRepositoryInventorySource = RepositoryInventorySource;

export type RepositoryConnectionStatus = {
  connected: boolean;
  provider: VCSProviderType;
  valid: boolean;
  username?: string;
  instanceUrl?: string;
  metadata?: {
    repositories?: number;
    account?: string;
    status?: string;
    mock_mode?: boolean;
    supported?: boolean;
  };
};

/** @deprecated Prefer `RepositoryConnectionStatus`. */
export type TerminalRepositoryConnectionStatus = RepositoryConnectionStatus;

export type RepositoryContextState = {
  provider: VCSProviderType;
  connectionStatus: RepositoryConnectionStatus | null;
  inventorySource: RepositoryInventorySource | null;
  repositories: VCSRepository[];
  selectedRepository: VCSRepository | null;
  branches?: VCSBranch[];
  commits?: VCSCommit[];
  defaultBranch?: string | null;
  selectedBranch?: string | null;
  selectedCommit?: string | null;
  isLoadingBranches?: boolean;
  isLoadingCommits?: boolean;
  sourceSelectionError?: string | null;
};

/** @deprecated Prefer `RepositoryContextState`. */
export type TerminalRepositoryContextState = RepositoryContextState;

export const REPOSITORY_PROVIDERS: VCSProviderType[] = ['github'];

/** @deprecated Prefer `REPOSITORY_PROVIDERS`. */
export const TERMINAL_REPOSITORY_PROVIDERS = REPOSITORY_PROVIDERS;

export function normalizeRepositoryProvider(_value?: string | null): VCSProviderType {
  return 'github';
}

export function deriveSelectedRepository(
  repositories: VCSRepository[],
  requestedRepository?: string | null,
  preferredRepository?: string | null,
) {
  if (!repositories.length) return null;

  const byRequested =
    requestedRepository &&
    repositories.find(
      (repository) =>
        repository.fullName === requestedRepository ||
        repository.id === requestedRepository ||
        repository.name === requestedRepository,
    );
  if (byRequested) return byRequested;

  const byPreferred =
    preferredRepository &&
    repositories.find(
      (repository) =>
        repository.fullName === preferredRepository ||
        repository.id === preferredRepository ||
        repository.name === preferredRepository,
    );
  if (byPreferred) return byPreferred;

  return repositories[0];
}

export function deriveSelectedBranch(
  branches: VCSBranch[],
  requestedBranch?: string | null,
  preferredBranch?: string | null,
) {
  if (!branches.length) return null;

  const normalizedRequestedBranch = requestedBranch?.trim();
  const byRequested =
    normalizedRequestedBranch &&
    branches.find((branch) => branch.name === normalizedRequestedBranch);
  if (byRequested) return byRequested.name;

  const normalizedPreferredBranch = preferredBranch?.trim();
  const byPreferred =
    normalizedPreferredBranch &&
    branches.find((branch) => branch.name === normalizedPreferredBranch);
  if (byPreferred) return byPreferred.name;

  return branches[0]?.name || null;
}

/** Sentinel for "track the branch head" commit selection (not a git object id). */
export const DEPOSIT_COMMIT_LATEST_REF = 'latest';

/** True when the URL/request wants the live branch head (default). */
export function isLatestCommitRef(value?: string | null): boolean {
  const normalized = value?.trim().toLowerCase();
  return !normalized || normalized === DEPOSIT_COMMIT_LATEST_REF;
}

/**
 * Resolve the effective commit SHA for synthesis / checkout.
 * - `latest` / empty → head of the loaded commits list (`commits[0]`)
 * - explicit sha → that sha (even if the list has not loaded yet)
 */
export function deriveSelectedCommit(
  commits: VCSCommit[],
  requestedCommit?: string | null,
) {
  if (isLatestCommitRef(requestedCommit)) {
    return commits[0]?.sha || null;
  }

  const normalizedRequestedCommit = requestedCommit!.trim();
  if (!commits.length) return normalizedRequestedCommit;

  const byRequested = commits.find(
    (commit) => commit.sha === normalizedRequestedCommit,
  );
  if (byRequested) return byRequested.sha;
  return normalizedRequestedCommit;
}

export function getProviderLabel(provider: VCSProviderType) {
  if (provider === 'gitlab') return 'GitLab';
  if (provider === 'bitbucket') return 'Bitbucket';
  return 'GitHub';
}

export function getRepositoryInventorySourceLabel(
  source: RepositoryInventorySource | null | undefined,
) {
  if (source === 'stored_repository_inventory') return 'stored protocol inventory';
  if (source === 'live_provider_inventory') return 'live provider inventory';
  if (source === 'mock_repository_inventory') return 'mock review inventory';
  return 'inventory pending';
}
