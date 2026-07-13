/**
 * @bitcode/vcs-generics — VCS primitive abstraction layer.
 *
 * Hierarchy:
 *   @bitcode/vcs-generics                 # this package (types, AbstractVCSProvider, factory, service)
 *     → @bitcode/generic-vcs-github       # packages/generic-vcs/github
 *     → @bitcode/generic-vcs-gitlab
 *     → @bitcode/generic-vcs-bitbucket
 *     → @bitcode/generic-vcs-git          # Git operation bridge over providers
 *
  *
 * @doc-package
 * version: 1.0.0
 * pattern: provider-abstraction
 * philosophy: "One interface, many providers"
 */

// ==================== TYPES ====================
export * from './types';

// ==================== INTERFACE ====================
export type { AbstractVCSProvider } from './interface';

// ==================== PROVIDER ====================
export { VCSProvider } from './provider';
export {
  VCSAuthError,
  VCSPermissionError,
  VCSNotFoundError,
  VCSConflictError,
  VCSValidationError,
  VCSRateLimitError
} from './provider';

// ==================== FACTORY ====================
export { VCSProviderFactory, createGitHubProvider, createGitLabProvider, createBitbucketProvider } from './factory';
// Stable provider factory aliases
export { VCSProviderFactory as VCSFactory } from './factory';

// ==================== CONNECTIONS ====================
export { VCSConnections } from './connections';
export { VCSConnections as VCSConnectionManager } from './connections';

// Historical helper names (stubs for build stability)
import type { VCSConfig, VCSProviderType } from './types';

function readProviderEnv(provider: VCSProviderType, key: 'CLIENT_ID' | 'CLIENT_SECRET' | 'REDIRECT_URI') {
  const upper = provider.toUpperCase();
  if (provider === 'github') {
    return (
      process.env[`GITHUB_APP_${key}`] ||
      process.env[`GITHUB_${key}`] ||
      (key === 'REDIRECT_URI' ? process.env.VCS_REDIRECT_URI : undefined) ||
      ''
    );
  }

  return process.env[`${upper}_${key}`] || (key === 'REDIRECT_URI' ? process.env.VCS_REDIRECT_URI : undefined) || '';
}

/**
 * Provider config from environment for route helpers.
 */
export function getVCSConfig(provider: VCSProviderType, instanceUrl?: string): VCSConfig {
  const upper = provider.toUpperCase();
  const cfg: VCSConfig = {
    provider,
    clientId: readProviderEnv(provider, 'CLIENT_ID'),
    clientSecret: readProviderEnv(provider, 'CLIENT_SECRET'),
    redirectUri: readProviderEnv(provider, 'REDIRECT_URI'),
    instanceUrl: instanceUrl || process.env[`${upper}_INSTANCE_URL`]
  } as VCSConfig;

  if (provider === 'github') {
    (cfg as any).appId = process.env.GITHUB_APP_ID;
    (cfg as any).privateKey = process.env.GITHUB_PRIVATE_KEY;
    (cfg as any).webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  }
  return cfg;
}

/**
 * Minimal default scopes for OAuth initiation.
 */
export function getProviderScopes(provider: VCSProviderType): string[] {
  switch (provider) {
    case 'github':
      return ['repo', 'read:user', 'user:email'];
    case 'gitlab':
      return ['api', 'read_user', 'read_repository', 'write_repository'];
    case 'bitbucket':
      return ['account', 'repository', 'repository:write'];
    default:
      return [];
  }
}

/**
 * Identity mapping for webhook events; routes can further normalize per provider.
 */
export function mapWebhookEvents(_provider: VCSProviderType, events: any): any {
  return events;
}
export type { SaveConnectionData } from './connections';

// ==================== CACHE ====================
export { VCSCache, buildCacheKey } from './cache';
export type { CacheOptions } from './cache';

// ==================== SERVICE ====================
export { VCSService } from './service';
export type { VCSServiceConfig } from './service';

/**
 * Usage Examples:
 * 
 * // Direct provider usage
 * const provider = await createGitHubProvider();
 * const repos = await provider.listRepositories(auth);
 * 
 * // Service layer usage (recommended)
 * const vcsService = new VCSService({
 *   cache: { enabled: true, ttl: 300000 },
 *   resilience: { retry: { attempts: 3 } }
 * });
 * const repos = await vcsService.listRepositories(userId);
 * 
 */

// Version for provider support tracking
export const VCS_VERSION = '1.0.0';

// Feature flags for gradual rollout
export const VCS_FEATURES = {
  CACHE_ENABLED: true,
  RETRY_ENABLED: true,
  CIRCUIT_BREAKER_ENABLED: true,
  LAZY_LOADING_ENABLED: true
} as const;
