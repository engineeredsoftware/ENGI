import { log } from '@bitcode/logger';
import type { FigmaOAuthData, FigmaConnection, FigmaUser } from './types';

export class FigmaAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Generate OAuth authorization URL for Figma
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'files:read',
      response_type: 'code'
    });

    if (state) {
      params.set('state', state);
    }

    return `https://www.figma.com/oauth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state?: string): Promise<FigmaOAuthData> {
    const response = await fetch('https://www.figma.com/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      log('[FigmaAuth] OAuth token exchange failed', 'error', {
        status: response.status,
        error: error.error,
        error_description: error.error_description
      });
      throw new Error(`OAuth token exchange failed: ${error.error_description || error.error}`);
    }

    const tokenData = await response.json();
    
    // Get user info to complete the OAuth data
    const userInfo = await this.getUserInfo(tokenData.access_token);
    
    const oauthData: FigmaOAuthData = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      user_id: userInfo.id,
      team_id: userInfo.id, // Figma doesn't have explicit teams in OAuth, use user ID
      team_name: userInfo.handle
    };
    
    log('[FigmaAuth] OAuth token exchange successful', 'info', {
      user_id: oauthData.user_id,
      team_id: oauthData.team_id,
      team_name: oauthData.team_name
    });

    return oauthData;
  }

  /**
   * Get user information using access token
   */
  async getUserInfo(accessToken: string): Promise<FigmaUser> {
    const response = await fetch('https://api.figma.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      log('[FigmaAuth] Failed to get user info', 'error', {
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
    oauthData: FigmaOAuthData,
    accessToken: string
  ): Promise<Omit<FigmaConnection, 'id' | 'created_at' | 'updated_at'>> {
    // Get user info for email and name
    const auth = new FigmaAuth('', '', ''); // Temporary instance for getUserInfo
    const userInfo = await auth.getUserInfo(accessToken);
    
    const expiresAt = oauthData.expires_in 
      ? new Date(Date.now() + oauthData.expires_in * 1000).toISOString()
      : undefined;

    return {
      user_id: userId,
      access_token: oauthData.access_token,
      refresh_token: oauthData.refresh_token,
      token_expires_at: expiresAt,
      team_id: oauthData.team_id,
      team_name: oauthData.team_name,
      user_name: userInfo.handle,
      user_email: userInfo.email
    };
  }

  /**
   * Validate access token by making a test API call
   */
  static async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.figma.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.ok;
    } catch (error) {
      log('[FigmaAuth] Token validation failed', 'error', { error });
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<FigmaOAuthData | null> {
    try {
      const response = await fetch('https://www.figma.com/api/oauth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        log('[FigmaAuth] Token refresh failed', 'error', {
          status: response.status
        });
        return null;
      }

      const tokenData = await response.json();
      const userInfo = await this.getUserInfo(tokenData.access_token);
      
      return {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || refreshToken,
        expires_in: tokenData.expires_in,
        user_id: userInfo.id,
        team_id: userInfo.id,
        team_name: userInfo.handle
      };
    } catch (error: any) {
      log('[FigmaAuth] Token refresh error', 'error', { error: error.message });
      return null;
    }
  }
}