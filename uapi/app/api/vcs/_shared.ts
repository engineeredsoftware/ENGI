import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { createClient } from '@bitcode/supabase/ssr/server';
import {
  VCSConnections,
  VCSProviderFactory,
  type VCSProviderType,
  type VCSRepository,
} from '@bitcode/vcs-generics';

import {
  buildMockVcsConnectionStatus,
  buildMockVcsRepositories,
  isAuxillariesMockMode,
} from '../../../lib/mock-review-mode';

const providerSchema = z.enum(['github', 'gitlab', 'bitbucket']);

export type ProviderRouteContext =
  | { params: { provider: string } }
  | { params: Promise<{ provider: string }> };

type StoredConnection = Awaited<ReturnType<VCSConnections['getConnection']>>;
type StoredRepositoryInventoryRow = {
  provider_repo_id?: string | null;
  repo_name?: string | null;
  repo_full_name?: string | null;
  repo_owner?: string | null;
  repo_description?: string | null;
  repo_url?: string | null;
  repo_language?: string | null;
  repo_default_branch?: string | null;
  repo_private?: boolean | null;
  repo_created_at?: string | null;
  repo_updated_at?: string | null;
  repo_data?: Record<string, unknown> | null;
};

export type RepositoryInventorySource =
  | 'stored_repository_inventory'
  | 'live_provider_inventory'
  | 'mock_repository_inventory';

export async function resolveRouteProvider(context: ProviderRouteContext): Promise<VCSProviderType> {
  const params = await context.params;
  return providerSchema.parse(params.provider);
}

export function isMockVcsMode() {
  return isAuxillariesMockMode();
}

export function getMockConnectionStatus(provider: VCSProviderType) {
  return buildMockVcsConnectionStatus(provider);
}

export function getMockRepositories(provider: VCSProviderType): VCSRepository[] {
  return buildMockVcsRepositories(provider);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function readBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((entry) => (typeof entry === 'string' ? entry.trim() : '')).filter(Boolean)
    : [];
}

function readDate(value: unknown) {
  const stringValue = readString(value);
  if (!stringValue) return undefined;
  const parsed = new Date(stringValue);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

const sensitiveConnectionDataKeys = new Set([
  'access_token',
  'accesstoken',
  'oauth_token',
  'oauthtoken',
  'refresh_token',
  'refreshtoken',
  'token',
  'client_secret',
  'clientsecret',
  'private_key',
  'privatekey',
]);

function sanitizeConnectionMetadata(connectionData: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(connectionData).filter(([key]) => !sensitiveConnectionDataKeys.has(key.toLowerCase())),
  );
}

function hasConnectionTokenEvidence(connectionData: Record<string, unknown>) {
  return Array.from(sensitiveConnectionDataKeys).some((key) => {
    const value = connectionData[key];
    return typeof value === 'string' ? Boolean(value.trim()) : Boolean(value);
  });
}

function readConnectionScopes(connectionData: Record<string, unknown>) {
  const raw = connectionData.scopes ?? connectionData.scope ?? connectionData.permissions;
  if (Array.isArray(raw)) {
    return raw.map((entry) => (typeof entry === 'string' ? entry.trim() : '')).filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw.split(/[,\s]+/u).map((entry) => entry.trim()).filter(Boolean);
  }
  if (isRecord(raw)) {
    return Object.entries(raw)
      .filter(([, value]) => value === true || value === 'read' || value === 'write')
      .map(([key, value]) => `${key}:${value}`);
  }
  return [];
}

function mapStoredRepositoryInventoryRowToRepository(row: StoredRepositoryInventoryRow): VCSRepository | null {
  const repoData = isRecord(row.repo_data) ? row.repo_data : null;
  const repoDataOwner = repoData && isRecord(repoData.owner) ? repoData.owner : null;
  const fullName = readString(row.repo_full_name) || readString(repoData?.fullName);
  const name = readString(row.repo_name) || readString(repoData?.name);
  const ownerUsername = readString(row.repo_owner) || readString(repoDataOwner?.username);

  if (!fullName || !name || !ownerUsername) {
    return null;
  }

  const ownerId = readString(repoDataOwner?.id) || ownerUsername;
  const ownerType =
    repoDataOwner?.type === 'user' || repoDataOwner?.type === 'workspace'
      ? repoDataOwner.type
      : 'organization';

  return {
    id:
      readString(row.provider_repo_id) ||
      readString(repoData?.id) ||
      fullName,
    name,
    fullName,
    description: readString(row.repo_description) || readString(repoData?.description) || undefined,
    private: readBoolean(row.repo_private) ?? readBoolean(repoData?.private) ?? false,
    defaultBranch:
      readString(row.repo_default_branch) || readString(repoData?.defaultBranch) || 'main',
    url: readString(row.repo_url) || readString(repoData?.url) || '',
    cloneUrl: readString(repoData?.cloneUrl) || '',
    sshUrl: readString(repoData?.sshUrl) || undefined,
    owner: {
      id: ownerId,
      username: ownerUsername,
      type: ownerType,
    },
    createdAt: readDate(row.repo_created_at) || readDate(repoData?.createdAt),
    updatedAt: readDate(row.repo_updated_at) || readDate(repoData?.updatedAt),
    language: readString(row.repo_language) || readString(repoData?.language) || undefined,
    topics: readStringArray(repoData?.topics),
    archived: readBoolean(repoData?.archived) ?? undefined,
    fork: readBoolean(repoData?.fork) ?? undefined,
    forksCount:
      typeof repoData?.forksCount === 'number' ? repoData.forksCount : undefined,
    starsCount:
      typeof repoData?.starsCount === 'number' ? repoData.starsCount : undefined,
    size: typeof repoData?.size === 'number' ? repoData.size : undefined,
  };
}

export async function readStoredRepositoryInventory(
  supabase: SupabaseClient<any>,
  userId: string,
  provider: VCSProviderType,
) {
  const { data, error } = await supabase
    .from('vcs_repositories')
    .select([
      'provider_repo_id',
      'repo_name',
      'repo_full_name',
      'repo_owner',
      'repo_description',
      'repo_url',
      'repo_language',
      'repo_default_branch',
      'repo_private',
      'repo_created_at',
      'repo_updated_at',
      'repo_data',
    ].join(','))
    .eq('user_id', userId)
    .eq('provider', provider)
    .order('repo_full_name', { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data || []) as StoredRepositoryInventoryRow[];
  return rows
    .map((row: StoredRepositoryInventoryRow) => mapStoredRepositoryInventoryRowToRepository(row))
    .filter((repository: VCSRepository | null): repository is VCSRepository => Boolean(repository));
}

export async function getRouteSupabaseUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { supabase, user, error };
}

export async function getStoredConnection(
  supabase: SupabaseClient<any>,
  userId: string,
  provider: VCSProviderType,
) {
  const manager = new VCSConnections(supabase);
  const connection = await manager.getConnection(userId, provider);
  return { manager, connection };
}

export function readInstanceUrl(request: Request) {
  return new URL(request.url).searchParams.get('instance_url') || undefined;
}

export function buildDisconnectedConnectionStatus(provider: VCSProviderType) {
  return {
    connected: false,
    provider,
    valid: false,
    tokenPresenceClass: 'missing',
    scopesClass: 'missing',
    lastReadbackStatus: 'not_attempted',
    lastReadbackAt: null,
    blocker: `connects.${provider}.connect_provider`,
  };
}

export function buildStoredConnectionStatus(
  provider: VCSProviderType,
  connection: NonNullable<StoredConnection>,
  valid: boolean,
) {
  const connectionData = (connection.connectionData || {}) as Record<string, unknown>;
  const scopes = readConnectionScopes(connectionData);

  return {
    connected: true,
    provider,
    valid,
    username:
      typeof connectionData.provider_username === 'string'
        ? connectionData.provider_username
        : typeof connectionData.username === 'string'
          ? connectionData.username
          : undefined,
    instanceUrl:
      typeof connectionData.instance_url === 'string' ? connectionData.instance_url : undefined,
    expiresAt:
      typeof connectionData.token_expires_at === 'string'
        ? connectionData.token_expires_at
        : undefined,
    tokenPresenceClass: hasConnectionTokenEvidence(connectionData)
      ? 'present_source_safe'
      : valid
        ? 'unknown'
        : 'invalid',
    scopes,
    scopesClass: scopes.length ? undefined : 'unknown',
    lastReadbackStatus: valid ? 'succeeded' : 'failed',
    lastReadbackAt: new Date().toISOString(),
    blocker: valid ? null : `connects.${provider}.reauthorize_provider`,
    metadata: sanitizeConnectionMetadata(connectionData),
  };
}

export async function validateStoredConnection(
  manager: VCSConnections,
  provider: VCSProviderType,
  connection: NonNullable<StoredConnection>,
  instanceUrl?: string,
) {
  const auth = await manager.getAuthFromConnection(connection.id);
  if (!auth) {
    return false;
  }

  const vcsProvider = await VCSProviderFactory.createFromEnvironment(provider, instanceUrl);
  return vcsProvider.validateToken(auth);
}

export async function listLiveProviderRepositories(
  manager: VCSConnections,
  provider: VCSProviderType,
  connection: NonNullable<StoredConnection>,
  instanceUrl?: string,
) {
  const auth = await manager.getAuthFromConnection(connection.id);
  if (!auth) {
    return [];
  }

  const resolvedInstanceUrl =
    instanceUrl ||
    (typeof connection.connectionData?.instance_url === 'string'
      ? connection.connectionData.instance_url
      : undefined);
  const vcsProvider = await VCSProviderFactory.createFromEnvironment(provider, resolvedInstanceUrl);
  return vcsProvider.listRepositories(auth, {
    type: 'all',
    perPage: 100,
  });
}

function serializeRepositoryData(repository: VCSRepository) {
  return {
    id: repository.id,
    name: repository.name,
    fullName: repository.fullName,
    description: repository.description,
    private: repository.private,
    defaultBranch: repository.defaultBranch,
    url: repository.url,
    cloneUrl: repository.cloneUrl,
    sshUrl: repository.sshUrl,
    owner: repository.owner,
    createdAt: repository.createdAt?.toISOString(),
    updatedAt: repository.updatedAt?.toISOString(),
    language: repository.language,
    topics: repository.topics || [],
    archived: repository.archived,
    fork: repository.fork,
    forksCount: repository.forksCount,
    starsCount: repository.starsCount,
    size: repository.size,
  };
}

async function persistLiveRepositoryInventory(
  supabase: SupabaseClient<any>,
  userId: string,
  provider: VCSProviderType,
  repositories: VCSRepository[],
) {
  if (repositories.length === 0) return;

  const rows = repositories.map((repository) => ({
    user_id: userId,
    provider,
    provider_repo_id: repository.id || repository.fullName,
    repo_name: repository.name,
    repo_full_name: repository.fullName,
    repo_owner: repository.owner.username,
    repo_description: repository.description || null,
    repo_language: repository.language || null,
    repo_default_branch: repository.defaultBranch || 'main',
    repo_private: repository.private,
    repo_url: repository.url || null,
    repo_data: serializeRepositoryData(repository),
    repo_created_at: repository.createdAt?.toISOString() || null,
    repo_updated_at: repository.updatedAt?.toISOString() || null,
  }));

  const { error } = await supabase
    .from('vcs_repositories')
    .upsert(rows, {
      onConflict: 'user_id,provider,provider_repo_id',
    });

  if (error) {
    throw error;
  }
}

export async function listBitcodeRepositoriesForConnection({
  supabase,
  userId,
  manager,
  provider,
  connection,
  instanceUrl,
  /** When false, never hit the live provider (stale/uninstalled installs). */
  allowLiveInventory = true,
}: {
  supabase: SupabaseClient<any>;
  userId: string;
  manager: VCSConnections;
  provider: VCSProviderType;
  connection: NonNullable<StoredConnection>;
  instanceUrl?: string;
  allowLiveInventory?: boolean;
}) {
  const storedRepositories = await readStoredRepositoryInventory(supabase, userId, provider).catch(
    () => [] as VCSRepository[],
  );
  if (storedRepositories.length > 0) {
    return {
      repositories: storedRepositories,
      inventorySource: 'stored_repository_inventory' as RepositoryInventorySource,
    };
  }

  if (!allowLiveInventory) {
    return {
      repositories: [] as VCSRepository[],
      inventorySource: 'stored_repository_inventory' as RepositoryInventorySource,
    };
  }

  try {
    const liveRepositories = await listLiveProviderRepositories(
      manager,
      provider,
      connection,
      instanceUrl,
    );
    await persistLiveRepositoryInventory(supabase, userId, provider, liveRepositories).catch(
      () => undefined,
    );

    return {
      repositories: liveRepositories,
      inventorySource: 'live_provider_inventory' as RepositoryInventorySource,
    };
  } catch {
    // Uninstalled / revoked provider sessions must not 500 the Auxillaries
    // Externals pane — return empty inventory so the UI can reconnect.
    return {
      repositories: [] as VCSRepository[],
      inventorySource: 'stored_repository_inventory' as RepositoryInventorySource,
    };
  }
}
