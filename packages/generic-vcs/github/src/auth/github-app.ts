/**
 * GitHub App Authentication
 * 
 * Handles JWT generation and installation access token creation for GitHub Apps.
 * Separate from OAuth flow - used for repository access via installations.
 */

import { log } from '@bitcode/logger';
import { generateGitHubAppJWT } from './jwt-helper';

export interface GitHubAppConfig {
  appId: string;
  privateKey: string;
  clientId?: string;
  clientSecret?: string;
}

export interface InstallationAccessToken {
  token: string;
  expiresAt: Date;
  permissions: Record<string, string>;
  repositorySelection?: 'all' | 'selected';
  repositories?: Array<{ id: number; name: string }>;
}

/**
 * GitHub App authentication handler
 */
export class GitHubAppAuth {
  private appId: string;
  private privateKey: string;
  private clientId?: string;
  private clientSecret?: string;
  
  constructor(config: GitHubAppConfig) {
    this.appId = config.appId;
    this.privateKey = config.privateKey;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
  }
  
  /**
   * Generate a JWT for GitHub App authentication
   * 
   * GitHub Apps authenticate using JWTs signed with their private key.
   * The JWT is valid for 10 minutes.
   */
  async generateJWT(): Promise<string> {
    try {
      const jwt = generateGitHubAppJWT(this.appId, this.privateKey);
      
      log('Generated GitHub App JWT', 'debug', { 
        appId: this.appId,
        expiresIn: '10 minutes'
      });
      
      return jwt;
    } catch (error) {
      log('Failed to generate GitHub App JWT', 'error', { 
        appId: this.appId, 
        error 
      });
      throw new Error(`Failed to generate GitHub App JWT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Generate an installation access token
   * 
   * Installation access tokens are used to make API calls on behalf of an installation.
   * They expire after 1 hour.
   */
  async generateInstallationToken(
    installationId: number,
    options?: {
      repositories?: string[];
      permissions?: Record<string, string>;
    }
  ): Promise<InstallationAccessToken> {
    try {
      // Generate JWT for authentication
      const jwt = await this.generateJWT();
      
      // Request body for installation token
      const body: any = {};
      if (options?.repositories) {
        body.repositories = options.repositories;
      }
      if (options?.permissions) {
        body.permissions = options.permissions;
      }
      
      // Request installation access token from GitHub
      const response = await fetch(
        `https://api.github.com/app/installations/${installationId}/access_tokens`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        log('Failed to generate installation token', 'error', {
          installationId,
          status: response.status,
          error: errorText
        });
        throw new Error(`Failed to generate installation token: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      log('Generated installation access token', 'info', {
        installationId,
        expiresAt: data.expires_at,
        permissions: data.permissions,
        repositorySelection: data.repository_selection,
        repositoryCount: data.repositories?.length
      });
      
      return {
        token: data.token,
        expiresAt: new Date(data.expires_at),
        permissions: data.permissions || {},
        repositorySelection: data.repository_selection,
        repositories: data.repositories
      };
    } catch (error) {
      log('Failed to generate installation token', 'error', {
        installationId,
        error
      });
      throw error;
    }
  }
  
  /**
   * Get installation details
   * 
   * Fetches information about a specific installation
   */
  async getInstallation(installationId: number): Promise<any> {
    try {
      const jwt = await this.generateJWT();
      
      const response = await fetch(
        `https://api.github.com/app/installations/${installationId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get installation: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      log('Retrieved installation details', 'debug', {
        installationId,
        account: data.account?.login,
        repositorySelection: data.repository_selection
      });
      
      return data;
    } catch (error) {
      log('Failed to get installation', 'error', {
        installationId,
        error
      });
      throw error;
    }
  }
  
  /**
   * List installations for the authenticated app
   * 
   * Returns all installations of this GitHub App
   */
  async listInstallations(): Promise<any[]> {
    try {
      const jwt = await this.generateJWT();
      
      const response = await fetch(
        'https://api.github.com/app/installations',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to list installations: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      log('Listed installations', 'debug', {
        count: data.length
      });
      
      return data;
    } catch (error) {
      log('Failed to list installations', 'error', { error });
      throw error;
    }
  }
  
  /**
   * Verify webhook payload from GitHub
   * 
   * GitHub sends webhooks with a signature that can be verified
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      log('Failed to verify webhook signature', 'error', { error });
      return false;
    }
  }
}

/**
 * Factory function to create GitHub App auth from environment
 */
export function createGitHubAppAuth(): GitHubAppAuth | null {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY;
  
  if (!appId || !privateKey) {
    log('GitHub App credentials not configured', 'warn', {
      hasAppId: !!appId,
      hasPrivateKey: !!privateKey
    });
    return null;
  }
  
  return new GitHubAppAuth({
    appId,
    privateKey,
    clientId: process.env.GITHUB_APP_CLIENT_ID,
    clientSecret: process.env.GITHUB_APP_CLIENT_SECRET
  });
}