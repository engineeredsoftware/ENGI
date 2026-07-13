/**
 * Base VCS Service - Common functionality for all VCS providers
 * 
 * Provides shared logic for:
 * - Token management
 * - Provider creation
 * - Error handling
 */

import { VCSProviderFactory, VCSAuth } from '@bitcode/vcs-generics';
import { log } from '@bitcode/logger';

export abstract class VCSServiceBase {
  protected abstract readonly providerType: string;
  
  /**
   * Create a VCS provider instance with proper configuration
   */
  protected async createProvider() {
    const provider = this.providerType.toUpperCase();
    
    return VCSProviderFactory.create({
      provider: this.providerType as any,
      clientId: process.env[`${provider}_CLIENT_ID`] || process.env[`${provider}_APP_CLIENT_ID`] || '',
      clientSecret: process.env[`${provider}_CLIENT_SECRET`] || process.env[`${provider}_APP_CLIENT_SECRET`] || '',
      redirectUri: process.env.VCS_REDIRECT_URI || '',
      instanceUrl: process.env[`${provider}_INSTANCE_URL`]
    });
  }
  
  /**
   * Build auth object from connection data
   */
  protected buildAuth(connectionData: any): VCSAuth {
    return {
      accessToken: connectionData.access_token || connectionData.oauth_token || '',
      refreshToken: connectionData.refresh_token,
      expiresAt: connectionData.token_expires_at ? 
        new Date(connectionData.token_expires_at) : undefined
    };
  }
  
  /**
   * Log operation with context
   */
  protected log(message: string, level: 'info' | 'warn' | 'error' | 'debug', context?: any) {
    log(`${this.providerType}Service: ${message}`, level, {
      provider: this.providerType,
      ...context
    });
  }
}