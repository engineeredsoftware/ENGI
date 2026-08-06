import { createClient } from '@bitcode/supabase';
import { log } from '@bitcode/logger';
import type { JiraConnection } from './types';
import { JiraAuth } from './auth';

export class JiraConnections {
  /**
   * Get a user's Jira connection
   */
  static async getConnection(userId: string): Promise<JiraConnection | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_jira_connections')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        log('[JiraConnections] Failed to get connection', 'error', {
          user_id: userId,
          error: error.message
        });
        return null;
      }

      return data;
    } catch (error: any) {
      log('[JiraConnections] Failed to get connection', 'error', {
        user_id: userId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Save or update a user's Jira connection
   */
  static async saveConnection(connection: Omit<JiraConnection, 'id' | 'created_at' | 'updated_at'>): Promise<JiraConnection | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_jira_connections')
        .upsert({
          user_id: connection.user_id,
          base_url: connection.base_url,
          cloud_id: connection.cloud_id,
          access_token: connection.access_token,
          refresh_token: connection.refresh_token,
          token_expires_at: connection.token_expires_at,
          email: connection.email,
          api_token: connection.api_token,
          account_id: connection.account_id,
          display_name: connection.display_name,
          email_address: connection.email_address,
          auth_type: connection.auth_type,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        log('[JiraConnections] Failed to save connection', 'error', {
          user_id: connection.user_id,
          base_url: connection.base_url,
          auth_type: connection.auth_type,
          error: error.message
        });
        return null;
      }

      log('[JiraConnections] Connection saved successfully', 'info', {
        user_id: connection.user_id,
        base_url: connection.base_url,
        auth_type: connection.auth_type,
        account_id: connection.account_id
      });

      return data;
    } catch (error: any) {
      log('[JiraConnections] Failed to save connection', 'error', {
        user_id: connection.user_id,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Delete a user's Jira connection
   */
  static async deleteConnection(userId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('user_jira_connections')
        .delete()
        .eq('user_id', userId);

      if (error) {
        log('[JiraConnections] Failed to delete connection', 'error', {
          user_id: userId,
          error: error.message
        });
        return false;
      }

      log('[JiraConnections] Connection deleted successfully', 'info', {
        user_id: userId
      });

      return true;
    } catch (error: any) {
      log('[JiraConnections] Failed to delete connection', 'error', {
        user_id: userId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Check if a user has an active Jira connection
   */
  static async hasConnection(userId: string): Promise<boolean> {
    const connection = await this.getConnection(userId);
    return connection !== null;
  }

  /**
   * Get all Jira connections (admin only)
   */
  static async getAllConnections(): Promise<JiraConnection[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_jira_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        log('[JiraConnections] Failed to get all connections', 'error', {
          error: error.message
        });
        return [];
      }

      return data || [];
    } catch (error: any) {
      log('[JiraConnections] Failed to get all connections', 'error', {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Update connection last used timestamp
   */
  static async updateLastUsed(userId: string): Promise<void> {
    try {
      const supabase = createClient();
      
      await supabase
        .from('user_jira_connections')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error: any) {
      log('[JiraConnections] Failed to update last used', 'error', {
        user_id: userId,
        error: error.message
      });
    }
  }

  /**
   * Validate and refresh connection if needed
   */
  static async validateConnection(userId: string): Promise<JiraConnection | null> {
    const connection = await this.getConnection(userId);
    if (!connection) {
      return null;
    }

    // Check if OAuth token is expired
    if (connection.auth_type === 'oauth' && connection.token_expires_at) {
      const expiresAt = new Date(connection.token_expires_at);
      const now = new Date();
      const buffer = 5 * 60 * 1000; // 5 minute buffer

      if (now.getTime() + buffer >= expiresAt.getTime()) {
        // Token is expired or about to expire, try to refresh
        if (connection.refresh_token) {
          const refreshed = await this.refreshConnection(userId);
          if (refreshed) {
            return refreshed;
          }
        }
        
        // Refresh failed or no refresh token, remove invalid connection
        log('[JiraConnections] Connection expired and refresh failed, removing', 'warn', {
          user_id: userId,
          expires_at: connection.token_expires_at
        });
        await this.deleteConnection(userId);
        return null;
      }
    }

    // Test the connection by making a simple API call
    try {
      let isValid = false;

      if (connection.auth_type === 'oauth' && connection.access_token && connection.cloud_id) {
        isValid = await JiraAuth.validateOAuthToken(connection.access_token, connection.cloud_id);
      } else if (connection.auth_type === 'api_token' && connection.email && connection.api_token) {
        isValid = await JiraAuth.validateApiToken(connection.base_url, connection.email, connection.api_token);
      }

      if (isValid) {
        // Update last used timestamp
        await this.updateLastUsed(userId);
        return connection;
      } else {
        // Connection is invalid, try to refresh if possible (OAuth only)
        if (connection.auth_type === 'oauth' && connection.refresh_token) {
          const refreshed = await this.refreshConnection(userId);
          if (refreshed) {
            return refreshed;
          }
        }
        
        // Remove invalid connection
        log('[JiraConnections] Connection validation failed, removing invalid connection', 'warn', {
          user_id: userId,
          base_url: connection.base_url,
          auth_type: connection.auth_type
        });
        await this.deleteConnection(userId);
        return null;
      }
    } catch (error: any) {
      log('[JiraConnections] Connection validation error', 'error', {
        user_id: userId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Refresh OAuth connection using refresh token
   */
  static async refreshConnection(userId: string): Promise<JiraConnection | null> {
    const connection = await this.getConnection(userId);
    if (!connection?.refresh_token || connection.auth_type !== 'oauth') {
      return null;
    }

    try {
      const clientId = process.env.JIRA_CLIENT_ID;
      const clientSecret = process.env.JIRA_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        log('[JiraConnections] Missing OAuth credentials for refresh', 'error', {
          user_id: userId
        });
        return null;
      }

      const auth = new JiraAuth(clientId, clientSecret, '');
      const refreshedData = await auth.refreshAccessToken(connection.refresh_token);
      
      if (!refreshedData) {
        return null;
      }

      // Update connection with new tokens
      const updatedConnection = await this.saveConnection({
        user_id: userId,
        base_url: connection.base_url,
        cloud_id: connection.cloud_id,
        access_token: refreshedData.access_token,
        refresh_token: refreshedData.refresh_token,
        token_expires_at: refreshedData.expires_in 
          ? new Date(Date.now() + refreshedData.expires_in * 1000).toISOString()
          : connection.token_expires_at,
        account_id: connection.account_id,
        display_name: connection.display_name,
        email_address: connection.email_address,
        auth_type: 'oauth'
      });

      log('[JiraConnections] Connection refreshed successfully', 'info', {
        user_id: userId,
        base_url: connection.base_url
      });

      return updatedConnection;
    } catch (error: any) {
      log('[JiraConnections] Connection refresh failed', 'error', {
        user_id: userId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Create OAuth connection from authorization data
   */
  static async createOAuthConnection(
    userId: string,
    baseUrl: string,
    cloudId: string,
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
  ): Promise<JiraConnection | null> {
    try {
      const clientId = process.env.JIRA_CLIENT_ID;
      const clientSecret = process.env.JIRA_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        throw new Error('Missing OAuth credentials');
      }

      const auth = new JiraAuth(clientId, clientSecret, '');
      const userInfo = await auth.getUserInfo(accessToken, cloudId);
      
      const expiresAt = expiresIn 
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : undefined;

      const connectionData: Omit<JiraConnection, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        base_url: baseUrl,
        cloud_id: cloudId,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt,
        account_id: userInfo.accountId,
        display_name: userInfo.displayName,
        email_address: userInfo.emailAddress,
        auth_type: 'oauth'
      };

      return await this.saveConnection(connectionData);
    } catch (error: any) {
      log('[JiraConnections] Failed to create OAuth connection', 'error', {
        user_id: userId,
        base_url: baseUrl,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Create API token connection
   */
  static async createApiTokenConnection(
    userId: string,
    baseUrl: string,
    email: string,
    apiToken: string
  ): Promise<JiraConnection | null> {
    try {
      const connectionData = await JiraAuth.apiTokenToConnection(userId, baseUrl, email, apiToken);
      return await this.saveConnection(connectionData);
    } catch (error: any) {
      log('[JiraConnections] Failed to create API token connection', 'error', {
        user_id: userId,
        base_url: baseUrl,
        email,
        error: error.message
      });
      return null;
    }
  }
}