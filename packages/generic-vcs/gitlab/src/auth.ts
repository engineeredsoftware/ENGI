import { log } from '@bitcode/logger';
import type { GitLabOAuthData, GitLabConnection, GitLabUser } from './types';

export class GitLabAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private instanceUrl: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string, instanceUrl = 'https://gitlab.com') {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.instanceUrl = instanceUrl;
  }

  /**
   * Generate OAuth authorization URL for GitLab
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'api read_user read_repository write_repository'
    });

    if (state) {
      params.set('state', state);
    }

    return `${this.instanceUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state?: string): Promise<GitLabOAuthData> {
    const response = await fetch(`${this.instanceUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri
      })
    });

    if (!response.ok) {
      const error = await response.json();
      log('[GitLabAuth] OAuth token exchange failed', 'error', {
        status: response.status,
        error: error.error,
        error_description: error.error_description
      });
      throw new Error(`OAuth token exchange failed: ${error.error_description || error.error}`);
    }

    const tokenData = await response.json();
    
    log('[GitLabAuth] OAuth token exchange successful', 'info', {
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      expires_in: tokenData.expires_in
    });

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope
    };
  }

  /**
   * Get user information using access token
   */
  async getUserInfo(accessToken: string): Promise<GitLabUser> {
    const response = await fetch(`${this.instanceUrl}/api/v4/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      log('[GitLabAuth] Failed to get user info', 'error', {
        status: response.status,
        error: error.message
      });
      throw new Error(`Failed to get user info: ${error.message}`);
    }

    return await response.json();
  }

  /**
   * Convert OAuth data to connection format
   */
  static async oauthDataToConnection(
    userId: string, 
    oauthData: GitLabOAuthData,
    instanceUrl: string,
    accessToken: string
  ): Promise<Omit<GitLabConnection, 'id' | 'created_at' | 'updated_at'>> {
    // Get user info for additional details
    const auth = new GitLabAuth('', '', '', instanceUrl);
    const userInfo = await auth.getUserInfo(accessToken);
    
    const expiresAt = oauthData.expires_in 
      ? new Date(Date.now() + oauthData.expires_in * 1000).toISOString()
      : undefined;

    return {
      user_id: userId,
      access_token: oauthData.access_token,
      refresh_token: oauthData.refresh_token,
      token_expires_at: expiresAt,
      gitlab_user_id: userInfo.id,
      username: userInfo.username,
      name: userInfo.name,
      email: userInfo.email,
      avatar_url: userInfo.avatar_url,
      web_url: userInfo.web_url,
      gitlab_instance_url: instanceUrl,
      scopes: oauthData.scope.split(' ')
    };
  }

  /**
   * Validate access token by making a test API call
   */
  static async validateToken(accessToken: string, instanceUrl = 'https://gitlab.com'): Promise<boolean> {
    try {
      const response = await fetch(`${instanceUrl}/api/v4/user`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.ok;
    } catch (error) {
      log('[GitLabAuth] Token validation failed', 'error', { error });
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GitLabOAuthData | null> {
    try {
      const response = await fetch(`${this.instanceUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        log('[GitLabAuth] Token refresh failed', 'error', {
          status: response.status
        });
        return null;
      }

      const tokenData = await response.json();
      
      return {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || refreshToken,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type,
        scope: tokenData.scope
      };
    } catch (error: any) {
      log('[GitLabAuth] Token refresh error', 'error', { error: error.message });
      return null;
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.instanceUrl}/oauth/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          token: accessToken
        })
      });

      if (response.ok) {
        log('[GitLabAuth] Token revoked successfully', 'info');
        return true;
      } else {
        log('[GitLabAuth] Token revocation failed', 'warn', {
          status: response.status
        });
        return false;
      }
    } catch (error: any) {
      log('[GitLabAuth] Token revocation error', 'error', { error: error.message });
      return false;
    }
  }
}