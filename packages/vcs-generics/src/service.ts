/**
 * VCS Service Layer - High-level service for VCS operations
 * 
 * Provides a clean, unified interface to VCS operations with:
 * - Built-in resilience patterns
 * - Intelligent caching
 * - Connection management
 * - Provider abstraction
 * 
 * @doc-code
 * type: service
 * category: vcs
 * pattern: service-layer
 */

import { AbstractVCSProvider } from './interface';
import { VCSAuth, VCSRepository, VCSBranch, VCSPullRequest, VCSIssue, VCSCommit, VCSTreeItem, ListReposOptions, ListPROptions, ListIssuesOptions } from './types';
import { VCSProviderFactory } from './factory';
import { VCSConnections } from './connections';
import { log } from '@bitcode/logger';
// TODO: Import from @bitcode/pipeline-recovery when package is available
interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  enabled?: boolean;
}

// Simple circuit breaker implementation
function withCircuitBreaker<T>(fn: () => Promise<T>, options?: any): Promise<T> {
  return fn(); // For now, just pass through
}
type SupabaseClientLike = {
  from(table: string): unknown;
};

/**
 * VCS Service configuration
 */
export interface VCSServiceConfig {
  supabaseClient: SupabaseClientLike;
  cache?: CacheOptions;
  resilience?: {
    retry?: { attempts: number; backoff: 'linear' | 'exponential' };
    circuitBreaker?: { threshold: number; timeout: number };
  };
}

/**
 * VCS Service - The clean abstraction layer for all VCS operations
 * 
 * @example
 * ```typescript
 * const vcsService = new VCSService({ supabaseClient });
 * const repos = await vcsService.listRepositories(userId);
 * ```
 */
export class VCSService {
  private connections: VCSConnections;
  private providers = new Map<string, AbstractVCSProvider>();
  private cache?: Map<string, { data: unknown; expires: number }>;
  private config: VCSServiceConfig;

  constructor(config: VCSServiceConfig) {
    this.config = config;
    this.connections = new VCSConnections(config.supabaseClient as any);
    
    if (config.cache?.enabled) {
      this.cache = new Map();
    }
  }

  /**
   * Execute an operation with a VCS provider - handles all the complexity
   * 
   * Fast Path: Cached results return immediately
   * Slow Path: Full provider initialization with resilience
   */
  private async withProvider<T>(
    connectionId: string | number,
    operation: (provider: AbstractVCSProvider, auth: VCSAuth) => Promise<T>
  ): Promise<T> {
    log('withProvider called', 'debug', { 
      connectionId, 
      isNumericConnectionId: typeof connectionId === 'number' 
    });
    
    // Numeric connection IDs are GitHub installation IDs.
    const auth = typeof connectionId === 'number'
      ? await this.connections.getAuthFromConnectionByInstallationId(connectionId)
      : await this.connections.getAuthFromConnection(connectionId);

    if (!auth) {
      log('No auth found for connection', 'error', { connectionId });
      throw new Error(`No VCS connection found for ${connectionId}`);
    }
    
    log('Auth retrieved for provider operation', 'info', { 
      connectionId,
      provider: auth.provider,
      hasAccessToken: !!auth.accessToken
    });
    if (!auth.provider) {
      throw new Error(`VCS auth missing provider for connection ${connectionId}`);
    }
    const providerType = auth.provider;

    // Get or create provider instance (lazy loading)
    const providerKey = `${providerType}-${auth.connectionId || connectionId}`;
    let provider = this.providers.get(providerKey);
    
    if (!provider) {
      // Use GitHub App credentials when available for GitHub provider
      const clientId = providerType === 'github' && process.env.GITHUB_APP_CLIENT_ID
        ? process.env.GITHUB_APP_CLIENT_ID
        : process.env[`${providerType.toUpperCase()}_CLIENT_ID`] || '';
      
      const clientSecret = providerType === 'github' && process.env.GITHUB_APP_CLIENT_SECRET
        ? process.env.GITHUB_APP_CLIENT_SECRET
        : process.env[`${providerType.toUpperCase()}_CLIENT_SECRET`] || '';
      
      log('Creating new provider instance', 'info', { 
        provider: providerType,
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        isGitHubApp: providerType === 'github' && !!process.env.GITHUB_APP_CLIENT_ID
      });
      
      provider = await VCSProviderFactory.create({
        provider: providerType,
        clientId,
        clientSecret,
        redirectUri:
          providerType === 'github'
            ? process.env.GITHUB_APP_REDIRECT_URI || process.env.GITHUB_REDIRECT_URI || process.env.VCS_REDIRECT_URI || ''
            : process.env[`${providerType.toUpperCase()}_REDIRECT_URI`] || process.env.VCS_REDIRECT_URI || '',
        // Add GitHub App specific config
        ...(providerType === 'github' ? {
          appId: process.env.GITHUB_APP_ID,
          privateKey: process.env.GITHUB_PRIVATE_KEY,
          webhookSecret: process.env.GITHUB_WEBHOOK_SECRET
        } : {})
      });
      
      this.providers.set(providerKey, provider);
    }

    // Execute with resilience patterns if configured
    if (this.config.resilience) {
      const wrappedOperation = () => operation(provider!, auth);
      
      let resilientOperation = wrappedOperation;
      
      if (this.config.resilience.retry) {
        // TODO: Use withRetry when available
        resilientOperation = wrappedOperation;
      }
      
      if (this.config.resilience.circuitBreaker) {
        const previousOp = resilientOperation;
        resilientOperation = () => withCircuitBreaker(
          previousOp,
          this.config.resilience!.circuitBreaker!
        );
      }
      
      return resilientOperation();
    }

    return operation(provider, auth);
  }

  /**
   * Get cached or fetch pattern - simple and powerful
   */
  private async cached<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    if (!this.cache) {
      return fetcher();
    }

    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      log('Cache hit', 'debug', { key });
      return cached.data as T;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      expires: Date.now() + (this.config.cache?.ttl || 5 * 60 * 1000)
    });
    
    return data;
  }

  /**
   * List repositories for a user
   * Clean, simple, resilient
   */
  async listRepositories(userId: string, options?: ListReposOptions): Promise<VCSRepository[]> {
    const cacheKey = `repos:${userId}:${options?.page || 1}`;
    
    log('Listing repositories for user', 'info', { userId, options });
    
    return this.cached(cacheKey, async () => {
      const connection = await this.connections.getConnection(userId);
      if (!connection) {
        log('No VCS connection found when listing repos', 'error', { userId });
        throw new Error(`No VCS connection found for user ${userId}`);
      }
      
      log('Found connection, fetching repositories', 'info', { 
        userId, 
        connectionId: connection.id,
        connectionDataConnectionId: connection.connectionData?.connectionId,
        hasConnectionData: !!connection.connectionData
      });

      // Use the connectionId from the connection_data (GitHub installation ID), not the database UUID
      const connectionIdToUse = connection.connectionData?.connectionId || connection.connectionData?.provider_user_id || connection.id;
      
      const repos = await this.withProvider(connectionIdToUse, (provider, auth) =>
        provider.listRepositories(auth, options)
      );
      
      log('Repositories fetched successfully', 'info', { 
        userId, 
        repositoryCount: repos.length 
      });
      
      return repos;
    });
  }

  /**
   * Get repository details
   */
  async getRepository(connectionId: string | number, owner: string, repo: string): Promise<VCSRepository> {
    const cacheKey = `repo:${connectionId}:${owner}/${repo}`;
    
    return this.cached(cacheKey, async () => {
      return this.withProvider(connectionId, (provider, auth) =>
        provider.getRepository(auth, owner, repo)
      );
    });
  }

  /**
   * List branches for a repository
   */
  async listBranches(connectionId: string | number, owner: string, repo: string): Promise<VCSBranch[]> {
    const cacheKey = `branches:${connectionId}:${owner}/${repo}`;
    
    return this.cached(cacheKey, async () => {
      return this.withProvider(connectionId, (provider, auth) =>
        provider.listBranches(auth, owner, repo)
      );
    });
  }

  /**
   * List pull requests
   */
  async listPullRequests(connectionId: string | number, owner: string, repo: string, options?: ListPROptions): Promise<VCSPullRequest[]> {
    const cacheKey = `prs:${connectionId}:${owner}/${repo}:${options?.state || 'all'}`;
    
    return this.cached(cacheKey, async () => {
      return this.withProvider(connectionId, (provider, auth) =>
        provider.listPullRequests(auth, owner, repo, options)
      );
    });
  }

  /**
   * List issues
   */
  async listIssues(connectionId: string | number, owner: string, repo: string, options?: ListIssuesOptions): Promise<VCSIssue[]> {
    const cacheKey = `issues:${connectionId}:${owner}/${repo}:${options?.state || 'all'}`;
    
    return this.cached(cacheKey, async () => {
      return this.withProvider(connectionId, async (provider, auth) => {
        if (!provider.listIssues) {
          throw new Error('Provider does not support issues');
        }
        return provider.listIssues(auth, owner, repo, options);
      });
    });
  }

  /**
   * List commits for a branch
   */
  async listCommits(connectionId: string | number, owner: string, repo: string, options?: { branch?: string; since?: Date; until?: Date }): Promise<VCSCommit[]> {
    const cacheKey = `commits:${connectionId}:${owner}/${repo}:${options?.branch || 'default'}`;
    
    return this.cached(cacheKey, async () => {
      return this.withProvider(connectionId, async (provider, auth) => {
        if (!provider.listCommits) {
          throw new Error('Provider does not support commit listing');
        }
        return provider.listCommits(auth, owner, repo, options);
      });
    });
  }

  /**
   * Get repository content (files/folders)
   */
  async getRepositoryContent(connectionId: string | number, owner: string, repo: string, path: string = '', ref?: string): Promise<VCSTreeItem[]> {
    const cacheKey = `content:${connectionId}:${owner}/${repo}:${path}:${ref || 'default'}`;
    
    return this.cached(cacheKey, async () => {
      return this.withProvider(connectionId, async (provider, auth) => {
        if (!provider.listFiles) {
          throw new Error('Provider does not support file listing');
        }
        return provider.listFiles(auth, owner, repo, path, ref);
      });
    });
  }

  /**
   * Clear cache for specific patterns
   * Useful after mutations
   */
  clearCache(pattern?: string): void {
    if (!this.cache) return;
    
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const [key] of Array.from(this.cache.entries())) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
