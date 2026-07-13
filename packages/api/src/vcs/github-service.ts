/**
 * GitHub Service - Business logic for GitHub VCS operations
 * 
 * Handles:
 * - Token refresh for expired installation tokens
 * - Organization/account discovery
 * - Repository operations with proper auth
 */

import { VCSProviderFactory, VCSAuth, VCSCache } from '@bitcode/vcs-generics';
import { GitHubAppAuth } from '@bitcode/generic-vcs-github';
import { log } from '@bitcode/logger';

export interface GitHubConnectionData {
  access_token?: string;
  installation_token?: string;
  oauth_token?: string;
  refresh_token?: string;
  installation_token_expires_at?: string;
  token_expires_at?: string;
  connectionId?: string | number;  // Generic field - holds GitHub installation ID
  instance_url?: string;
}

export class GitHubService {
  /**
   * Get a valid auth object, refreshing tokens if needed
   */
  static async getValidAuth(
    connectionData: GitHubConnectionData,
    userId?: string,
    supabase?: any
  ): Promise<VCSAuth> {
    // Generic connectionId field holds the GitHub installation ID
    const installationId = connectionData.connectionId;
    
    log('getValidAuth called', 'debug', {
      hasInstallationId: !!installationId,
      installationId,
      hasInstallationToken: !!connectionData.installation_token,
      hasAccessToken: !!connectionData.access_token,
      hasOAuthToken: !!connectionData.oauth_token,
      userId
    });
    
    // Check if we have an installation token and if it's expired
    if (installationId) {
      const expiresAt = connectionData.installation_token_expires_at ? 
        new Date(connectionData.installation_token_expires_at) : null;
      
      // Proactively refresh 5 minutes before expiry to avoid race conditions
      const now = new Date();
      const refreshThreshold = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
      
      // Always refresh if no token, if expired, if expiry is unknown, or if expiring soon
      const needsRefresh = !connectionData.installation_token || 
                          !expiresAt || 
                          expiresAt < refreshThreshold;
      
      if (needsRefresh) {
        log('Installation token needs refresh', 'warn', {
          installationId,
          hasToken: !!connectionData.installation_token,
          currentTokenPrefix: connectionData.installation_token?.substring(0, 10),
          expiresAt: expiresAt?.toISOString(),
          refreshThreshold: refreshThreshold.toISOString(),
          now: now.toISOString(),
          reason: !connectionData.installation_token ? 'no token' : 
                  !expiresAt ? 'no expiry' : 
                  expiresAt < now ? 'expired' : 'expiring soon'
        });
        
        // Refresh the installation token
        try {
          const refreshedToken = await this.refreshInstallationToken(
            Number(installationId)
          );
          
          if (refreshedToken) {
            log('Token refresh successful', 'info', {
              installationId,
              newTokenPrefix: refreshedToken.token.substring(0, 10),
              expiresAt: refreshedToken.expiresAt.toISOString()
            });
          // Update the connection data with new token only if we have a proper supabase client
          // Skip if supabase is null (API route will handle it)
          if (userId && supabase && supabase.from) {
            const updatedData = {
              ...connectionData,
              installation_token: refreshedToken.token,
              installation_token_expires_at: refreshedToken.expiresAt.toISOString(),
              access_token: refreshedToken.token // Also update primary token
            };
            
            const { error } = await supabase
              .from('user_connections')
              .update({ 
                connection_data: updatedData,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId)
              .eq('provider', 'github');
              
            if (error) {
              log('Failed to update connection with refreshed token', 'error', { 
                userId, 
                error: error.message 
              });
            } else {
              log('Updated connection with refreshed token', 'info', { 
                userId,
                tokenPrefix: refreshedToken.token.substring(0, 10)
              });
              
              // Update the connectionData object to reflect the new token
              connectionData.installation_token = refreshedToken.token;
              connectionData.installation_token_expires_at = refreshedToken.expiresAt.toISOString();
              connectionData.access_token = refreshedToken.token;
              
              // Clear VCS cache for this user to ensure fresh data with new token
              const cache = new VCSCache();
              cache.clear(`vcs:*${userId}*`);
              log('Cleared VCS cache after token refresh', 'debug', { userId });
            }
          }
          
          log('Returning refreshed token', 'info', {
            tokenPrefix: refreshedToken.token.substring(0, 10),
            expiresAt: refreshedToken.expiresAt.toISOString()
          });
          
            return {
              accessToken: refreshedToken.token,
              expiresAt: refreshedToken.expiresAt
            };
          } else {
            log('Token refresh returned null', 'error', {
              installationId
            });
            throw new Error('Failed to refresh installation token');
          }
        } catch (error) {
          log('Token refresh failed', 'error', {
            installationId,
            error: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined
          });
          
          // Never fall back to expired tokens - this causes "Bad credentials" errors
          // According to GitHub API docs, expired tokens must not be used
          throw new Error(`Failed to refresh GitHub installation token: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        // Token is still valid
        log('Using existing valid token', 'debug', {
          tokenPrefix: connectionData.installation_token?.substring(0, 10),
          expiresAt: expiresAt?.toISOString()
        });
        
        return {
          accessToken: connectionData.installation_token!,
          expiresAt
        };
      }
    }
    
    // Fall back to OAuth token if available
    if (connectionData.oauth_token || connectionData.access_token) {
      return {
        accessToken: connectionData.oauth_token || connectionData.access_token || '',
        refreshToken: connectionData.refresh_token
      };
    }
    
    throw new Error('No valid authentication token available');
  }
  
  /**
   * Refresh an expired installation token
   */
  static async refreshInstallationToken(installationId: number): Promise<{
    token: string;
    expiresAt: Date;
  } | null> {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_PRIVATE_KEY;
    const clientId = process.env.GITHUB_APP_CLIENT_ID || process.env.SUPABASE_AUTH_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET || process.env.SUPABASE_AUTH_GITHUB_CLIENT_SECRET;
    
    if (!appId || !privateKey) {
      log('GitHub App credentials not configured, cannot refresh token', 'error', {
        hasAppId: !!appId,
        hasPrivateKey: !!privateKey,
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        installationId
      });
      return null;
    }
    
    try {
      const githubApp = new GitHubAppAuth({
        appId,
        privateKey,
        clientId: clientId || undefined,
        clientSecret: clientSecret || undefined
      });
      
      // Don't request specific permissions - use whatever the installation has granted
      // This avoids 422 errors when requesting permissions not available to the installation
      const tokenData = await githubApp.generateInstallationToken(
        installationId
        // Omitting permissions parameter to use installation's granted permissions
      );
      
      log('Installation token refreshed successfully', 'info', {
        installationId,
        expiresAt: tokenData.expiresAt,
        tokenPrefix: tokenData.token.substring(0, 10)
      });
      
      return {
        token: tokenData.token,
        expiresAt: tokenData.expiresAt
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log('Failed to refresh installation token', 'error', {
        installationId,
        error: errorMessage,
        errorStack: error instanceof Error ? error.stack : undefined
      });
      
      // Check for specific error cases
      if (errorMessage.includes('Installation not found')) {
        log('Installation may have been removed or suspended', 'error', { installationId });
      } else if (errorMessage.includes('Private key')) {
        log('Invalid private key format', 'error');
      } else if (errorMessage.includes('permissions requested are not granted')) {
        log('Installation does not have required permissions. Using installation defaults.', 'warn', { installationId });
      }
      
      return null;
    }
  }
  
  /**
   * Get organization/account info for the connection
   */
  static async getAccounts(
    connectionData: GitHubConnectionData,
    userId?: string,
    supabase?: any
  ): Promise<Array<{
    id: string | number;
    login: string;
    type: string;
    name: string;
    avatar_url?: string;
    url?: string;
  }>> {
    const accounts = [];
    
    try {
      // Generic connectionId field holds the GitHub installation ID  
      const installationId = connectionData.connectionId;
      
      // If we have an installation ID, get the installation details to find the organization
      if (installationId) {
        const appId = process.env.GITHUB_APP_ID;
        const privateKey = process.env.GITHUB_PRIVATE_KEY;
        const clientId = process.env.GITHUB_APP_CLIENT_ID || process.env.SUPABASE_AUTH_GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET || process.env.SUPABASE_AUTH_GITHUB_CLIENT_SECRET;
        
        if (appId && privateKey) {
          const githubApp = new GitHubAppAuth({
            appId,
            privateKey,
            clientId: clientId || undefined,
            clientSecret: clientSecret || undefined
          });
          
          try {
            // Get installation details which includes the account (organization)
            const installation = await githubApp.getInstallation(Number(installationId));
            
            if (installation && installation.account) {
              const account = installation.account;
              accounts.push({
                id: account.id,
                login: account.login,
                type: account.type === 'Organization' ? 'Organization' : 'User',
                name: account.name || account.login,
                avatar_url: account.avatar_url || '',
                url: account.html_url || `https://github.com/${account.login}`
              });
              
              log('Got organization from installation', 'info', {
                installationId,
                organization: account.login,
                type: account.type
              });
              
              return accounts;
            }
          } catch (installationError) {
            log('Failed to get installation details, falling back to repository extraction', 'warn', {
              installationId,
              error: installationError instanceof Error ? installationError.message : String(installationError)
            });
          }
        }
      }
      
      // Fallback: Try to extract from repositories if installation lookup fails
      const auth = await this.getValidAuth(connectionData, userId, supabase);
      
      const provider = await VCSProviderFactory.create({
        provider: 'github',
        clientId: process.env.GITHUB_CLIENT_ID || process.env.GITHUB_APP_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_APP_CLIENT_SECRET || '',
        redirectUri: process.env.VCS_REDIRECT_URI || ''
      });
      
      const repos = await provider.listRepositories(auth, { perPage: 5 });
      
      const ownerMap = new Map();
      for (const repo of repos) {
        if (!ownerMap.has(repo.owner.id)) {
          ownerMap.set(repo.owner.id, {
            id: repo.owner.id,
            login: repo.owner.username,
            type: repo.owner.type === 'organization' ? 'Organization' : 'User',
            name: repo.owner.username,
            avatar_url: '',
            url: `https://github.com/${repo.owner.username}`
          });
        }
      }
      
      if (ownerMap.size > 0) {
        accounts.push(...ownerMap.values());
        
        log('Extracted accounts from repositories', 'info', {
          accountCount: ownerMap.size,
          accounts: Array.from(ownerMap.values()).map(a => ({
            login: a.login,
            type: a.type
          }))
        });
      } else {
        log('No accounts found from repos, using default', 'warn');
        accounts.push({
          id: connectionData.connectionId || 'default',
          login: 'All Repositories',
          type: 'User',
          name: 'All Repositories',
          avatar_url: '',
          url: ''
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log('Failed to get GitHub accounts', 'error', { 
        error: errorMessage,
        installationId: connectionData.connectionId
      });
      
      accounts.push({
        id: connectionData.connectionId || 'default',
        login: 'All Repositories',
        type: 'User',
        name: 'All Repositories',
        avatar_url: '',
        url: ''
      });
    }
    
    return accounts;
  }
  
  /**
   * List repositories with automatic token refresh
   */
  static async listRepositories(
    connectionData: GitHubConnectionData,
    userId?: string,
    supabase?: any,
    options?: any
  ) {
    // Get a valid auth token (with refresh if needed)
    const auth = await this.getValidAuth(connectionData, userId, supabase);
    
    // Create provider
    const provider = await VCSProviderFactory.create({
      provider: 'github',
      clientId: process.env.GITHUB_CLIENT_ID || process.env.GITHUB_APP_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_APP_CLIENT_SECRET || '',
      redirectUri: process.env.VCS_REDIRECT_URI || ''
    });
    
    // List repositories
    return provider.listRepositories(auth, options);
  }
  
  /**
   * List commits with automatic token refresh
   */
  static async listCommits(
    connectionData: GitHubConnectionData,
    owner: string,
    repo: string,
    options?: { branch?: string; since?: Date; until?: Date; perPage?: number },
    userId?: string,
    supabase?: any
  ) {
    // Get a valid auth token (with refresh if needed)
    const auth = await this.getValidAuth(connectionData, userId, supabase);
    
    // Create provider
    const provider = await VCSProviderFactory.create({
      provider: 'github',
      clientId: process.env.GITHUB_CLIENT_ID || process.env.GITHUB_APP_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_APP_CLIENT_SECRET || '',
      redirectUri: process.env.VCS_REDIRECT_URI || ''
    });
    
    // List commits - provider now has this method
    if (!provider.listCommits) {
      throw new Error('GitHub provider does not support commit listing');
    }

    return provider.listCommits(auth, owner, repo, options);
  }
}
