import { log } from '@bitcode/logger';
import type { JiraOAuthData, JiraConnection, JiraUser, JiraAccessibleResource } from './types';

export class JiraAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Generate OAuth authorization URL for Jira Cloud
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      audience: 'api.atlassian.com',
      client_id: this.clientId,
      scope: 'read:jira-user read:jira-work write:jira-work manage:jira-project manage:jira-configuration offline_access',
      redirect_uri: this.redirectUri,
      state: state || '',
      response_type: 'code',
      prompt: 'consent'
    });

    return `https://auth.atlassian.com/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state?: string): Promise<JiraOAuthData> {
    const response = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri
      })
    });

    if (!response.ok) {
      const error = await response.json();
      log('[JiraAuth] OAuth token exchange failed', 'error', {
        status: response.status,
        error: error.error,
        error_description: error.error_description
      });
      throw new Error(`OAuth token exchange failed: ${error.error_description || error.error}`);
    }

    const tokenData = await response.json();
    
    log('[JiraAuth] OAuth token exchange successful', 'info', {
      scope: tokenData.scope,
      token_type: tokenData.token_type
    });

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
      token_type: tokenData.token_type
    };
  }

  /**
   * Get accessible Jira resources for the user
   */
  async getAccessibleResources(accessToken: string): Promise<JiraAccessibleResource[]> {
    const response = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      log('[JiraAuth] Failed to get accessible resources', 'error', {
        status: response.status,
        error: error.message
      });
      throw new Error(`Failed to get accessible resources: ${error.message}`);
    }

    return await response.json();
  }

  /**
   * Get user information using access token
   */
  async getUserInfo(accessToken: string, cloudId: string): Promise<JiraUser> {
    const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      log('[JiraAuth] Failed to get user info', 'error', {
        status: response.status,
        error: error.errorMessages
      });
      throw new Error(`Failed to get user info: ${error.errorMessages?.[0] || 'Unknown error'}`);
    }

    return await response.json();
  }

  /**
   * Create Basic Auth header for API token authentication
   */
  static createBasicAuthHeader(email: string, apiToken: string): string {
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    return `Basic ${auth}`;
  }

  /**
   * Validate API token by making a test API call
   */
  static async validateApiToken(baseUrl: string, email: string, apiToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${baseUrl}/rest/api/3/myself`, {
        headers: {
          'Authorization': JiraAuth.createBasicAuthHeader(email, apiToken),
          'Accept': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      log('[JiraAuth] API token validation failed', 'error', { error });
      return false;
    }
  }

  /**
   * Validate OAuth access token by making a test API call
   */
  static async validateOAuthToken(accessToken: string, cloudId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      log('[JiraAuth] OAuth token validation failed', 'error', { error });
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<JiraOAuthData | null> {
    try {
      const response = await fetch('https://auth.atlassian.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        log('[JiraAuth] Token refresh failed', 'error', {
          status: response.status
        });
        return null;
      }

      const tokenData = await response.json();
      
      return {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || refreshToken,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
        token_type: tokenData.token_type
      };
    } catch (error: any) {
      log('[JiraAuth] Token refresh error', 'error', { error: error.message });
      return null;
    }
  }

  /**
   * Convert OAuth data to connection format
   */
  static async oauthDataToConnection(
    userId: string, 
    oauthData: JiraOAuthData,
    accessToken: string,
    cloudId: string,
    baseUrl: string
  ): Promise<Omit<JiraConnection, 'id' | 'created_at' | 'updated_at'>> {
    // Get user info for account details
    const auth = new JiraAuth('', '', ''); // Temporary instance for getUserInfo
    const userInfo = await auth.getUserInfo(accessToken, cloudId);
    
    const expiresAt = oauthData.expires_in 
      ? new Date(Date.now() + oauthData.expires_in * 1000).toISOString()
      : undefined;

    return {
      user_id: userId,
      base_url: baseUrl,
      cloud_id: cloudId,
      access_token: oauthData.access_token,
      refresh_token: oauthData.refresh_token,
      token_expires_at: expiresAt,
      account_id: userInfo.accountId,
      display_name: userInfo.displayName,
      email_address: userInfo.emailAddress,
      auth_type: 'oauth'
    };
  }

  /**
   * Create connection format for API token authentication
   */
  static async apiTokenToConnection(
    userId: string,
    baseUrl: string,
    email: string,
    apiToken: string
  ): Promise<Omit<JiraConnection, 'id' | 'created_at' | 'updated_at'>> {
    // Get user info to verify the token and get account details
    const response = await fetch(`${baseUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': JiraAuth.createBasicAuthHeader(email, apiToken),
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to validate API token: ${error.errorMessages?.[0] || 'Invalid credentials'}`);
    }

    const userInfo: JiraUser = await response.json();

    return {
      user_id: userId,
      base_url: baseUrl,
      email,
      api_token: apiToken,
      account_id: userInfo.accountId,
      display_name: userInfo.displayName,
      email_address: userInfo.emailAddress,
      auth_type: 'api_token'
    };
  }
}