/**
 * VCS Provider Factory - Zero-overhead provider instantiation
 * 
 * Manages provider lifecycle with:
 * - Lazy loading of provider implementations
 * - Instance caching for performance
 * - Type-safe provider creation
 * - Environment-based configuration
 * 
 * @doc-code
 * type: factory
 * category: vcs
 * pattern: lazy-loading
 */

import { AbstractVCSProvider } from './interface';
import { VCSConfig, VCSError, VCSProviderType } from './types';
import { log } from '@bitcode/logger';

/**
 * Provider constructor type
 */
type VCSProviderConstructor = new (config: VCSConfig) => AbstractVCSProvider;
type VCSProviderLoader = () => Promise<{ default: VCSProviderConstructor }>;

// Provider registry - populated at build time
const providerRegistry = new Map<VCSProviderType, VCSProviderLoader>();

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
 * VCS Provider Factory
 */
export class VCSProviderFactory {
  // Provider instances cache
  private static instances = new Map<string, AbstractVCSProvider>();
  
  /**
   * Register a provider loader
   */
  static registerProvider(
    type: VCSProviderType,
    loader: VCSProviderLoader
  ): void {
    providerRegistry.set(type, loader);
    log(`Registered VCS provider: ${type}`, 'info');
  }
  
  /**
   * Create or retrieve a provider instance
   */
  static async create(config: VCSConfig): Promise<AbstractVCSProvider> {
    // Generate cache key from config
    const cacheKey = this.getCacheKey(config);
    
    // Return cached instance if available
    if (this.instances.has(cacheKey)) {
      log(`Returning cached provider instance: ${config.provider}`, 'debug');
      return this.instances.get(cacheKey)!;
    }
    
    // Get provider loader
    const loader = providerRegistry.get(config.provider);
    if (!loader) {
      const available = Array.from(providerRegistry.keys()).join(', ');
      throw new VCSError(
        `Unknown VCS provider: ${config.provider}. Available providers: ${available}`,
        'UNSUPPORTED_PROVIDER'
      );
    }
    
    try {
      // Lazy load the provider module
      log(`Loading provider module: ${config.provider}`, 'debug');
      const module = await loader();
      const ProviderClass = module.default;
      
      // Instantiate provider
      const instance = new ProviderClass(config);
      
      // Cache the instance
      this.instances.set(cacheKey, instance);
      
      log(`Created ${config.provider} provider instance`, 'debug', {
        instanceUrl: config.instanceUrl
      });
      
      return instance;
    } catch (error) {
      log(`Failed to create provider: ${config.provider}`, 'error', { error });
      throw new VCSError(
        `Failed to create ${config.provider} provider: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PROVIDER_INIT_ERROR'
      );
    }
  }
  
  /**
   * Clear cached instances
   */
  static clearCache(): void {
    this.instances.clear();
  }
  
  /**
   * Create a provider from environment configuration
   */
  static async createFromEnvironment(
    provider: VCSProviderType, 
    instanceUrl?: string
  ): Promise<AbstractVCSProvider> {
    const config: VCSConfig = {
      provider,
      clientId: readProviderEnv(provider, 'CLIENT_ID'),
      clientSecret: readProviderEnv(provider, 'CLIENT_SECRET'),
      redirectUri: readProviderEnv(provider, 'REDIRECT_URI'),
      instanceUrl: instanceUrl || process.env[`${provider.toUpperCase()}_INSTANCE_URL`]
    };

    // Add GitHub App specific config
    if (provider === 'github') {
      config.appId = process.env.GITHUB_APP_ID;
      config.privateKey = process.env.GITHUB_PRIVATE_KEY;
      config.webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    }

    return this.create(config);
  }

  /**
   * Get all registered provider types
   */
  static getAvailableProviders(): VCSProviderType[] {
    return Array.from(providerRegistry.keys());
  }

  /**
   * Check if a provider is registered
   */
  static hasProvider(type: VCSProviderType): boolean {
    return providerRegistry.has(type);
  }

  /**
   * Generate cache key for provider config
   */
  private static getCacheKey(config: VCSConfig): string {
    return `${config.provider}:${config.clientId}:${config.instanceUrl || 'default'}`;
  }
}

// Register default providers — nested generic-vcs implementations (lazy-loaded).
// Package names: @bitcode/generic-vcs-{github,gitlab,bitbucket}.
// BC shims @bitcode/github|gitlab|bitbucket re-export the same modules.
VCSProviderFactory.registerProvider('github', () => import('@bitcode/generic-vcs-github'));
VCSProviderFactory.registerProvider('gitlab', () => import('@bitcode/generic-vcs-gitlab'));
VCSProviderFactory.registerProvider('bitbucket', () => import('@bitcode/generic-vcs-bitbucket'));

/**
 * Export convenience functions for type-safe provider creation
 */
export const createGitHubProvider = (config?: Partial<VCSConfig>) => 
  VCSProviderFactory.createFromEnvironment('github', config?.instanceUrl);

export const createGitLabProvider = (config?: Partial<VCSConfig>) => 
  VCSProviderFactory.createFromEnvironment('gitlab', config?.instanceUrl);

export const createBitbucketProvider = (config?: Partial<VCSConfig>) => 
  VCSProviderFactory.createFromEnvironment('bitbucket', config?.instanceUrl);
