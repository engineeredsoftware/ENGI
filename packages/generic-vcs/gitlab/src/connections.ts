import { createClient } from '@bitcode/supabase';
import { log } from '@bitcode/logger';
import type { GitLabConnection } from './types';
import { GitLabAuth } from './auth';

export class GitLabConnections {
  /**
   * Get a user's GitLab connection
   */
  static async getConnection(userId: string, instanceUrl = 'https://gitlab.com'): Promise<GitLabConnection | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_gitlab_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('gitlab_instance_url', instanceUrl)
        .single();

      if (error && error.code !== 'PGRST116') {
        log('[GitLabConnections] Failed to get connection', 'error', {
          user_id: userId,
          instance_url: instanceUrl,
          error: error.message
        });
        return null;
      }

      return data;
    } catch (error: any) {
      log('[GitLabConnections] Failed to get connection', 'error', {
        user_id: userId,
        instance_url: instanceUrl,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Save or update a user's GitLab connection
   */
  static async saveConnection(connection: Omit<GitLabConnection, 'id' | 'created_at' | 'updated_at'>): Promise<GitLabConnection | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_gitlab_connections')
        .upsert({
          user_id: connection.user_id,
          access_token: connection.access_token,
          refresh_token: connection.refresh_token,
          token_expires_at: connection.token_expires_at,
          gitlab_user_id: connection.gitlab_user_id,
          username: connection.username,
          name: connection.name,
          email: connection.email,
          avatar_url: connection.avatar_url,
          web_url: connection.web_url,
          gitlab_instance_url: connection.gitlab_instance_url,
          scopes: connection.scopes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,gitlab_instance_url'
        })
        .select()
        .single();

      if (error) {
        log('[GitLabConnections] Failed to save connection', 'error', {
          user_id: connection.user_id,
          gitlab_user_id: connection.gitlab_user_id,
          instance_url: connection.gitlab_instance_url,
          error: error.message
        });
        return null;
      }

      log('[GitLabConnections] Connection saved successfully', 'info', {
        user_id: connection.user_id,
        gitlab_user_id: connection.gitlab_user_id,
        username: connection.username,
        instance_url: connection.gitlab_instance_url
      });

      return data;
    } catch (error: any) {
      log('[GitLabConnections] Failed to save connection', 'error', {
        user_id: connection.user_id,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Delete a user's GitLab connection
   */
  static async deleteConnection(userId: string, instanceUrl = 'https://gitlab.com'): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('user_gitlab_connections')
        .delete()
        .eq('user_id', userId)
        .eq('gitlab_instance_url', instanceUrl);

      if (error) {
        log('[GitLabConnections] Failed to delete connection', 'error', {
          user_id: userId,
          instance_url: instanceUrl,
          error: error.message
        });
        return false;
      }

      log('[GitLabConnections] Connection deleted successfully', 'info', {
        user_id: userId,
        instance_url: instanceUrl
      });

      return true;
    } catch (error: any) {
      log('[GitLabConnections] Failed to delete connection', 'error', {
        user_id: userId,
        instance_url: instanceUrl,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Check if a user has an active GitLab connection
   */
  static async hasConnection(userId: string, instanceUrl = 'https://gitlab.com'): Promise<boolean> {
    const connection = await this.getConnection(userId, instanceUrl);
    return connection !== null;
  }

  /**
   * Get all GitLab connections for a user (all instances)
   */
  static async getUserConnections(userId: string): Promise<GitLabConnection[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_gitlab_connections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        log('[GitLabConnections] Failed to get user connections', 'error', {
          user_id: userId,
          error: error.message
        });
        return [];
      }

      return data || [];
    } catch (error: any) {
      log('[GitLabConnections] Failed to get user connections', 'error', {
        user_id: userId,
        error: error.message
      });
      return [];
    }
  }

  /**
   * Get all GitLab connections (admin only)
   */
  static async getAllConnections(): Promise<GitLabConnection[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_gitlab_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        log('[GitLabConnections] Failed to get all connections', 'error', {
          error: error.message
        });
        return [];
      }

      return data || [];
    } catch (error: any) {
      log('[GitLabConnections] Failed to get all connections', 'error', {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Update connection last used timestamp
   */
  static async updateLastUsed(userId: string, instanceUrl = 'https://gitlab.com'): Promise<void> {
    try {
      const supabase = createClient();
      
      await supabase
        .from('user_gitlab_connections')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('gitlab_instance_url', instanceUrl);
    } catch (error: any) {
      log('[GitLabConnections] Failed to update last used', 'error', {
        user_id: userId,
        instance_url: instanceUrl,
        error: error.message
      });
    }
  }

  /**
   * Validate and refresh connection if needed
   */
  static async validateConnection(userId: string, instanceUrl = 'https://gitlab.com'): Promise<GitLabConnection | null> {
    const connection = await this.getConnection(userId, instanceUrl);
    if (!connection) {
      return null;
    }

    // Check if token is expired
    if (connection.token_expires_at) {
      const expiresAt = new Date(connection.token_expires_at);
      const now = new Date();
      const buffer = 5 * 60 * 1000; // 5 minute buffer

      if (now.getTime() + buffer >= expiresAt.getTime()) {
        // Token is expired or about to expire, try to refresh
        if (connection.refresh_token) {
          const refreshed = await this.refreshConnection(userId, instanceUrl);
          if (refreshed) {
            return refreshed;
          }
        }
        
        // Refresh failed or no refresh token, remove invalid connection
        log('[GitLabConnections] Connection expired and refresh failed, removing', 'warn', {
          user_id: userId,
          instance_url: instanceUrl,
          expires_at: connection.token_expires_at
        });
        await this.deleteConnection(userId, instanceUrl);
        return null;
      }
    }

    // Test the connection by making a simple API call
    try {
      const isValid = await GitLabAuth.validateToken(connection.access_token, instanceUrl);

      if (isValid) {
        // Update last used timestamp
        await this.updateLastUsed(userId, instanceUrl);
        return connection;
      } else {
        // Connection is invalid, try to refresh if possible
        if (connection.refresh_token) {
          const refreshed = await this.refreshConnection(userId, instanceUrl);
          if (refreshed) {
            return refreshed;
          }
        }
        
        // Remove invalid connection
        log('[GitLabConnections] Connection validation failed, removing invalid connection', 'warn', {
          user_id: userId,
          instance_url: instanceUrl,
          gitlab_user_id: connection.gitlab_user_id
        });
        await this.deleteConnection(userId, instanceUrl);
        return null;
      }
    } catch (error: any) {
      log('[GitLabConnections] Connection validation error', 'error', {
        user_id: userId,
        instance_url: instanceUrl,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Refresh connection using refresh token
   */
  static async refreshConnection(userId: string, instanceUrl = 'https://gitlab.com'): Promise<GitLabConnection | null> {
    const connection = await this.getConnection(userId, instanceUrl);
    if (!connection?.refresh_token) {
      return null;
    }

    try {
      // Note: We'd read client credentials for refresh
      const clientId = process.env.GITLAB_CLIENT_ID;
      const clientSecret = process.env.GITLAB_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        log('[GitLabConnections] Missing OAuth credentials for refresh', 'error', {
          user_id: userId,
          instance_url: instanceUrl
        });
        return null;
      }

      const auth = new GitLabAuth(clientId, clientSecret, '', instanceUrl);
      const refreshedData = await auth.refreshAccessToken(connection.refresh_token);
      
      if (!refreshedData) {
        return null;
      }

      // Update connection with new tokens
      const updatedConnection = await this.saveConnection({
        user_id: userId,
        access_token: refreshedData.access_token,
        refresh_token: refreshedData.refresh_token,
        token_expires_at: refreshedData.expires_in 
          ? new Date(Date.now() + refreshedData.expires_in * 1000).toISOString()
          : connection.token_expires_at,
        gitlab_user_id: connection.gitlab_user_id,
        username: connection.username,
        name: connection.name,
        email: connection.email,
        avatar_url: connection.avatar_url,
        web_url: connection.web_url,
        gitlab_instance_url: instanceUrl,
        scopes: refreshedData.scope.split(' ')
      });

      log('[GitLabConnections] Connection refreshed successfully', 'info', {
        user_id: userId,
        instance_url: instanceUrl,
        gitlab_user_id: connection.gitlab_user_id
      });

      return updatedConnection;
    } catch (error: any) {
      log('[GitLabConnections] Connection refresh failed', 'error', {
        user_id: userId,
        instance_url: instanceUrl,
        error: error.message
      });
      return null;
    }
  }
}