/**
 * Relocated from app/terminal/bitcode-transaction-route-readiness.ts.
 * @see BITCODE_SPEC_V48.md frontend architecture workstream
 */

import { deriveBitcodeTransactionReadiness } from '@/components/bitcode/pipeline/models/transaction-readiness';
import {
  hydrateBitcodeProfile,
  readBitcodeWalletCapabilityFromProfile,
} from '@bitcode/orm';
import { createClient } from '@bitcode/supabase/ssr/server';
import {
  VCSConnections,
  VCSProviderFactory,
  type VCSProviderType,
  type VCSRepository,
} from '@bitcode/vcs';

import { buildMockVcsRepositories, isAuxillariesMockMode } from '@/lib/mock-review-mode';
import { readBitcodeWalletConnectionStatus } from '@/app/api/wallet/_shared';

type StatusError = Error & { statusCode?: number | undefined };
type RepositoryInventoryMatchBasis = 'stored_repository_inventory' | 'live_provider_inventory';

function createStatusError(message: string, statusCode: number): StatusError {
  const error = new Error(message) as StatusError;
  error.statusCode = statusCode;
  return error;
}

function normalizeRepositoryProvider(value: unknown): VCSProviderType {
  if (value === 'gitlab' || value === 'bitbucket' || value === 'github') {
    return value;
  }

  return 'github';
}

function normalizeRepositoryAnchor(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function providerLabel(provider: VCSProviderType): string {
  if (provider === 'gitlab') return 'GitLab';
  if (provider === 'bitbucket') return 'Bitbucket';
  return 'GitHub';
}

function repositoryMatchesAnchor(repository: VCSRepository, repositoryAnchor: string): boolean {
  return (
    repository.fullName === repositoryAnchor ||
    repository.id === repositoryAnchor ||
    repository.name === repositoryAnchor
  );
}

async function findStoredRepositoryInventoryMatch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  repositoryProvider: VCSProviderType,
  repositoryAnchor: string,
) {
  const exactMatchResult = await supabase
    .from('vcs_repositories')
    .select('repo_full_name')
    .eq('user_id', userId)
    .eq('provider', repositoryProvider)
    .eq('repo_full_name', repositoryAnchor)
    .maybeSingle();

  if (exactMatchResult.error) {
    throw createStatusError(exactMatchResult.error.message, 500);
  }

  if (typeof exactMatchResult.data?.repo_full_name === 'string') {
    return {
      hasStoredInventory: true,
      matchedRepositoryFullName: exactMatchResult.data.repo_full_name,
    };
  }

  const storedInventoryPresenceResult = await supabase
    .from('vcs_repositories')
    .select('repo_full_name')
    .eq('user_id', userId)
    .eq('provider', repositoryProvider)
    .limit(1)
    .maybeSingle();

  if (storedInventoryPresenceResult.error) {
    throw createStatusError(storedInventoryPresenceResult.error.message, 500);
  }

  return {
    hasStoredInventory: Boolean(storedInventoryPresenceResult.data?.repo_full_name),
    matchedRepositoryFullName: null,
  };
}

async function findLiveRepositoryInventoryMatch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  repositoryProvider: VCSProviderType,
  repositoryAnchor: string,
) {
  if (isAuxillariesMockMode()) {
    const matchedRepository = buildMockVcsRepositories(repositoryProvider).find((repository) =>
      repositoryMatchesAnchor(repository, repositoryAnchor),
    );
    return matchedRepository?.fullName || null;
  }

  const manager = new VCSConnections(supabase as any);
  const connection = await manager.getConnection(userId, repositoryProvider);

  if (!connection) {
    return null;
  }

  const auth = await manager.getAuthFromConnection(connection.id);
  if (!auth) {
    return null;
  }

  try {
    const instanceUrl =
      typeof connection.connectionData?.instance_url === 'string'
        ? connection.connectionData.instance_url
        : undefined;
    const provider = await VCSProviderFactory.createFromEnvironment(repositoryProvider, instanceUrl);
    const repositories = await provider.listRepositories(auth, {
      type: 'all',
      perPage: 100,
    });
    const matchedRepository = repositories.find((repository) =>
      repositoryMatchesAnchor(repository, repositoryAnchor),
    );

    return matchedRepository?.fullName || null;
  } catch (error) {
    throw createStatusError(
      `Unable to verify the repository anchor against the connected ${providerLabel(repositoryProvider)} inventory.`,
      500,
    );
  }
}

async function readBitcodeRepositoryProviderReadiness(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  repositoryProvider: VCSProviderType,
) {
  if (isAuxillariesMockMode()) {
    return {
      hasRepositoryProvider: true,
      hasValidRepositoryProvider: true,
    };
  }

  const manager = new VCSConnections(supabase as any);
  const connection = await manager.getConnection(userId, repositoryProvider);
  if (!connection) {
    return {
      hasRepositoryProvider: false,
      hasValidRepositoryProvider: false,
    };
  }

  const auth = await manager.getAuthFromConnection(connection.id);
  if (!auth) {
    return {
      hasRepositoryProvider: true,
      hasValidRepositoryProvider: false,
    };
  }

  try {
    const instanceUrl =
      typeof connection.connectionData?.instance_url === 'string'
        ? connection.connectionData.instance_url
        : undefined;
    const provider = await VCSProviderFactory.createFromEnvironment(repositoryProvider, instanceUrl);
    const valid = await provider.validateToken(auth);

    return {
      hasRepositoryProvider: true,
      hasValidRepositoryProvider: Boolean(valid),
    };
  } catch {
    return {
      hasRepositoryProvider: true,
      hasValidRepositoryProvider: false,
    };
  }
}

async function readBitcodeWalletProviderSigningReadiness(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  profile: Record<string, unknown> | null,
) {
  if (isAuxillariesMockMode()) {
    return {
      hasStoredVerifiedWalletBinding: true,
      hasVerifiedWalletBinding: true,
    };
  }

  const walletCapability = readBitcodeWalletCapabilityFromProfile(profile);
  const walletConnectionStatus = await readBitcodeWalletConnectionStatus({
    supabase,
    userId,
    profile,
  }).catch(() => null);

  return {
    hasStoredVerifiedWalletBinding: walletCapability.binding?.status === 'verified',
    hasVerifiedWalletBinding: Boolean(walletConnectionStatus?.connected && walletConnectionStatus?.valid),
  };
}

async function requireBitcodeRepositoryInventoryMatch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  repositoryProvider: VCSProviderType,
  repositoryAnchor: string | null,
) {
  if (!repositoryAnchor) {
    return null;
  }

  const storedInventoryMatch = await findStoredRepositoryInventoryMatch(
    supabase,
    userId,
    repositoryProvider,
    repositoryAnchor,
  );
  if (storedInventoryMatch.matchedRepositoryFullName) {
    return {
      basis: 'stored_repository_inventory' as RepositoryInventoryMatchBasis,
      matchedRepositoryFullName: storedInventoryMatch.matchedRepositoryFullName,
    };
  }

  if (storedInventoryMatch.hasStoredInventory) {
    throw createStatusError(
      `Bitcode write admission rejected the repository anchor because ${repositoryAnchor} is not present in the connected ${providerLabel(repositoryProvider)} repository inventory.`,
      409,
    );
  }

  const liveInventoryMatch = await findLiveRepositoryInventoryMatch(
    supabase,
    userId,
    repositoryProvider,
    repositoryAnchor,
  );
  if (liveInventoryMatch) {
    return {
      basis: 'live_provider_inventory' as RepositoryInventoryMatchBasis,
      matchedRepositoryFullName: liveInventoryMatch,
    };
  }

  throw createStatusError(
    `Bitcode write admission rejected the repository anchor because ${repositoryAnchor} is not present in the connected ${providerLabel(repositoryProvider)} repository inventory.`,
    409,
  );
}

export function readBitcodeRepositoryAnchorFromBody(body: Record<string, unknown>): string | null {
  return (
    normalizeRepositoryAnchor(body.repositoryAnchor) ||
    normalizeRepositoryAnchor(body.repositoryFullName) ||
    normalizeRepositoryAnchor(body.sourceRepo)
  );
}

export function readBitcodeRepositoryProviderFromBody(body: Record<string, unknown>): VCSProviderType {
  return normalizeRepositoryProvider(
    body.repositoryProvider ?? body.provider ?? body.repositoryProviderType,
  );
}

export async function requireBitcodeSignedTransactionReadiness(
  body: Record<string, unknown>,
  options: { requiresRepositoryAnchor?: boolean } = {},
) {
  const requiresRepositoryAnchor = options.requiresRepositoryAnchor ?? true;
  const repositoryAnchor = readBitcodeRepositoryAnchorFromBody(body);
  const repositoryProvider = readBitcodeRepositoryProviderFromBody(body);
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    const readiness = deriveBitcodeTransactionReadiness({
      signedIn: false,
      hasRepositoryProvider: false,
      hasWalletBinding: false,
      hasVerifiedWalletBinding: false,
      requiresRepositoryAnchor,
      hasRepositoryAnchor: Boolean(repositoryAnchor),
    });
    throw createStatusError(readiness.summary, 401);
  }

  const [profileResult, providerReadiness] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle(),
    readBitcodeRepositoryProviderReadiness(supabase, user.id, repositoryProvider),
  ]);

  if (profileResult.error) {
    throw createStatusError(profileResult.error.message, 500);
  }

  const profile = hydrateBitcodeProfile(profileResult.data ?? null);
  const walletCapability = readBitcodeWalletCapabilityFromProfile(profile);
  const walletSigningReadiness = await readBitcodeWalletProviderSigningReadiness(
    supabase,
    user.id,
    (profile as Record<string, unknown> | null) ?? null,
  );
  const readiness = deriveBitcodeTransactionReadiness({
    signedIn: true,
    hasRepositoryProvider: providerReadiness.hasRepositoryProvider,
    hasValidRepositoryProvider: providerReadiness.hasValidRepositoryProvider,
    hasWalletBinding: walletCapability.hasIdentity,
    hasVerifiedWalletBinding: walletSigningReadiness.hasVerifiedWalletBinding,
    hasStoredVerifiedWalletBinding: walletSigningReadiness.hasStoredVerifiedWalletBinding,
    requiresRepositoryAnchor,
    hasRepositoryAnchor: Boolean(repositoryAnchor),
  });

  if (!readiness.canSettle) {
    throw createStatusError(readiness.summary, 409);
  }

  const repositoryInventoryMatch = await requireBitcodeRepositoryInventoryMatch(
    supabase,
    user.id,
    repositoryProvider,
    repositoryAnchor,
  );

  return {
    userId: user.id,
    readiness,
    repositoryProvider,
    repositoryAnchor,
    repositoryInventoryMatch,
  };
}
