/**
 * Shared repository connection / inventory context for pipeline experiences
 * (Deposits, Reads, Packs).
 *
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */

import type { VCSBranch, VCSCommit, VCSProviderType, VCSRepository } from '@bitcode/vcs-generics-core';

export type RepositoryInventorySource =
  | 'stored_repository_inventory'
  | 'live_provider_inventory'
  | 'mock_repository_inventory';

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

export const REPOSITORY_PROVIDERS: VCSProviderType[] = ['github'];

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
  const normalizedRequestedBranch = requestedBranch?.trim();
  // Explicit URL / Load-anchor branch wins even before the branch list loads
  // (or when the list is paginated). Falling back to default here used to let
  // the route-sync effect rewrite sourceBranch + wipe sourceCommit.
  if (normalizedRequestedBranch) {
    if (!branches.length) return normalizedRequestedBranch;
    const byRequested = branches.find(
      (branch) => branch.name === normalizedRequestedBranch,
    );
    if (byRequested) return byRequested.name;
    return normalizedRequestedBranch;
  }

  if (!branches.length) return null;

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
 * - explicit sha (full or unique short prefix) → that sha, expanded to full
 *   when the commits list is loaded so SearchableSelect keys match
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

  const exact = commits.find((commit) => commit.sha === normalizedRequestedCommit);
  if (exact) return exact.sha;

  // Load-anchor / ledger often surfaces short SHAs (7+) while the commit list
  // keys are full object ids — prefix-match and expand so the picker paints.
  if (normalizedRequestedCommit.length >= 7) {
    const prefixMatches = commits.filter((commit) =>
      commit.sha.startsWith(normalizedRequestedCommit),
    );
    if (prefixMatches.length === 1) return prefixMatches[0]!.sha;
  }

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
