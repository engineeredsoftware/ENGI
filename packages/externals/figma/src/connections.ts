import { createClient } from '@bitcode/supabase';
import { log } from '@bitcode/logger';
import type { FigmaConnection } from './types';
import { FigmaAuth } from './auth';

export class FigmaConnections {
  /**
   * Get a user's Figma connection
   */
  static async getConnection(userId: string): Promise<FigmaConnection | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_figma_connections')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        log('[FigmaConnections] Failed to get connection', 'error', {
          user_id: userId,
          error: error.message
        });
        return null;
      }

      return data;
    } catch (error: any) {
      log('[FigmaConnections] Failed to get connection', 'error', {
        user_id: userId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Save or update a user's Figma connection
   */
  static async saveConnection(connection: Omit<FigmaConnection, 'id' | 'created_at' | 'updated_at'>): Promise<FigmaConnection | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_figma_connections')
        .upsert({
          user_id: connection.user_id,
          access_token: connection.access_token,
          refresh_token: connection.refresh_token,
          token_expires_at: connection.token_expires_at,
          team_id: connection.team_id,
          team_name: connection.team_name,
          user_name: connection.user_name,
          user_email: connection.user_email,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        log('[FigmaConnections] Failed to save connection', 'error', {
          user_id: connection.user_id,
          team_id: connection.team_id,
          error: error.message
        });
        return null;
      }

      log('[FigmaConnections] Connection saved successfully', 'info', {
        user_id: connection.user_id,
        team_id: connection.team_id,
        team_name: connection.team_name
      });

      return data;
    } catch (error: any) {
      log('[FigmaConnections] Failed to save connection', 'error', {
        user_id: connection.user_id,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Delete a user's Figma connection
   */
  static async deleteConnection(userId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('user_figma_connections')
        .delete()
        .eq('user_id', userId);

      if (error) {
        log('[FigmaConnections] Failed to delete connection', 'error', {
          user_id: userId,
          error: error.message
        });
        return false;
      }

      log('[FigmaConnections] Connection deleted successfully', 'info', {
        user_id: userId
      });

      return true;
    } catch (error: any) {
      log('[FigmaConnections] Failed to delete connection', 'error', {
        user_id: userId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Check if a user has an active Figma connection
   */
  static async hasConnection(userId: string): Promise<boolean> {
    const connection = await this.getConnection(userId);
    return connection !== null;
  }

  /**
   * Get all Figma connections (admin only)
   */
  static async getAllConnections(): Promise<FigmaConnection[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_figma_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        log('[FigmaConnections] Failed to get all connections', 'error', {
          error: error.message
        });
        return [];
      }

      return data || [];
    } catch (error: any) {
      log('[FigmaConnections] Failed to get all connections', 'error', {
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
        .from('user_figma_connections')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error: any) {
      log('[FigmaConnections] Failed to update last used', 'error', {
        user_id: userId,
        error: error.message
      });
    }
  }

  /**
   * Validate and refresh connection if needed
   */
  static async validateConnection(userId: string): Promise<FigmaConnection | null> {
    const connection = await this.getConnection(userId);
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
          const refreshed = await this.refreshConnection(userId);
          if (refreshed) {
            return refreshed;
          }
        }
        
        // Refresh failed or no refresh token, remove invalid connection
        log('[FigmaConnections] Connection expired and refresh failed, removing', 'warn', {
          user_id: userId,
          expires_at: connection.token_expires_at
        });
        await this.deleteConnection(userId);
        return null;
      }
    }

    // Test the connection by making a simple API call
    try {
      const response = await fetch('https://api.figma.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`
        }
      });

      if (response.ok) {
        // Update last used timestamp
        await this.updateLastUsed(userId);
        return connection;
      } else {
        // Connection is invalid, try to refresh if possible
        if (connection.refresh_token) {
          const refreshed = await this.refreshConnection(userId);
          if (refreshed) {
            return refreshed;
          }
        }
        
        // Remove invalid connection
        log('[FigmaConnections] Connection validation failed, removing invalid connection', 'warn', {
          user_id: userId,
          team_id: connection.team_id,
          status: response.status
        });
        await this.deleteConnection(userId);
        return null;
      }
    } catch (error: any) {
      log('[FigmaConnections] Connection validation error', 'error', {
        user_id: userId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Refresh connection using refresh token
   */
  static async refreshConnection(userId: string): Promise<FigmaConnection | null> {
    const connection = await this.getConnection(userId);
    if (!connection?.refresh_token) {
      return null;
    }

    try {
      // Note: We'd read client credentials for refresh, which might not be available here
      // In production, this should be done server-side with stored credentials
      const clientId = process.env.FIGMA_CLIENT_ID;
      const clientSecret = process.env.FIGMA_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        log('[FigmaConnections] Missing OAuth credentials for refresh', 'error', {
          user_id: userId
        });
        return null;
      }

      const auth = new FigmaAuth(clientId, clientSecret, '');
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
        team_id: connection.team_id,
        team_name: connection.team_name,
        user_name: connection.user_name,
        user_email: connection.user_email
      });

      log('[FigmaConnections] Connection refreshed successfully', 'info', {
        user_id: userId,
        team_id: connection.team_id
      });

      return updatedConnection;
    } catch (error: any) {
      log('[FigmaConnections] Connection refresh failed', 'error', {
        user_id: userId,
        error: error.message
      });
      return null;
    }
  }
}