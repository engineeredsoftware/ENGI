import { log } from '@bitcode/logger';
import type { NotionOAuthData, NotionConnection, NotionWorkspace } from './types';

export class NotionAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Generate OAuth authorization URL for Notion
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      owner: 'user',
      redirect_uri: this.redirectUri
    });

    if (state) {
      params.set('state', state);
    }

    return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state?: string): Promise<NotionOAuthData> {
    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri
      })
    });

    if (!response.ok) {
      const error = await response.json();
      log('[NotionAuth] OAuth token exchange failed', 'error', {
        status: response.status,
        error: error.error,
        error_description: error.error_description
      });
      throw new Error(`OAuth token exchange failed: ${error.error_description || error.error}`);
    }

    const data = await response.json() as NotionOAuthData;
    
    log('[NotionAuth] OAuth token exchange successful', 'info', {
      workspace_id: data.workspace_id,
      workspace_name: data.workspace_name,
      bot_id: data.bot_id,
      owner_type: data.owner.type
    });

    return data;
  }

  /**
   * Convert OAuth data to connection format
   */
  static oauthDataToConnection(
    userId: string, 
    oauthData: NotionOAuthData
  ): Omit<NotionConnection, 'id' | 'created_at' | 'updated_at'> {
    return {
      user_id: userId,
      access_token: oauthData.access_token,
      bot_id: oauthData.bot_id,
      workspace_id: oauthData.workspace_id,
      workspace_name: oauthData.workspace_name,
      workspace_icon: oauthData.workspace_icon,
      owner_type: oauthData.owner.type
    };
  }

  /**
   * Validate access token by making a test API call
   */
  static async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.notion.com/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Notion-Version': '2022-06-28'
        }
      });

      return response.ok;
    } catch (error) {
      log('[NotionAuth] Token validation failed', 'error', { error });
      return false;
    }
  }

  /**
   * Get workspace information using access token
   */
  static async getWorkspaceInfo(accessToken: string): Promise<NotionWorkspace | null> {
    try {
      const response = await fetch('https://api.notion.com/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Notion-Version': '2022-06-28'
        }
      });

      if (!response.ok) {
        return null;
      }

      const user = await response.json();
      
      if (user.bot?.workspace_name) {
        return {
          id: user.bot.owner?.workspace?.id || 'unknown',
          name: user.bot.workspace_name,
          icon: undefined // Bot user doesn't provide workspace icon
        };
      }

      return null;
    } catch (error) {
      log('[NotionAuth] Failed to get workspace info', 'error', { error });
      return null;
    }
  }

  /**
   * Revoke access token
   */
  static async revokeToken(accessToken: string): Promise<boolean> {
    try {
      // Notion doesn't provide a token revocation endpoint
      // The integration will be deactivated when removed from the workspace
      // We just validate the token is still active
      return await NotionAuth.validateToken(accessToken);
    } catch (error) {
      log('[NotionAuth] Token revocation check failed', 'error', { error });
      return false;
    }
  }
}