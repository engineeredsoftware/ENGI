import { createClient } from '@bitcode/supabase';
import { log } from '@bitcode/logger';
import type { NotionConnection } from './types';

export class NotionConnections {
  /**
   * Get a user's Notion connection
   */
  static async getConnection(userId: string): Promise<NotionConnection | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_notion_connections')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        log('[NotionConnections] Failed to get connection', 'error', {
          user_id: userId,
          error: error.message
        });
        return null;
      }

      return data;
    } catch (error: any) {
      log('[NotionConnections] Failed to get connection', 'error', {
        user_id: userId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Save or update a user's Notion connection
   */
  static async saveConnection(connection: Omit<NotionConnection, 'id' | 'created_at' | 'updated_at'>): Promise<NotionConnection | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_notion_connections')
        .upsert({
          user_id: connection.user_id,
          access_token: connection.access_token,
          bot_id: connection.bot_id,
          workspace_id: connection.workspace_id,
          workspace_name: connection.workspace_name,
          workspace_icon: connection.workspace_icon,
          owner_type: connection.owner_type,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        log('[NotionConnections] Failed to save connection', 'error', {
          user_id: connection.user_id,
          workspace_id: connection.workspace_id,
          error: error.message
        });
        return null;
      }

      log('[NotionConnections] Connection saved successfully', 'info', {
        user_id: connection.user_id,
        workspace_id: connection.workspace_id,
        workspace_name: connection.workspace_name
      });

      return data;
    } catch (error: any) {
      log('[NotionConnections] Failed to save connection', 'error', {
        user_id: connection.user_id,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Delete a user's Notion connection
   */
  static async deleteConnection(userId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('user_notion_connections')
        .delete()
        .eq('user_id', userId);

      if (error) {
        log('[NotionConnections] Failed to delete connection', 'error', {
          user_id: userId,
          error: error.message
        });
        return false;
      }

      log('[NotionConnections] Connection deleted successfully', 'info', {
        user_id: userId
      });

      return true;
    } catch (error: any) {
      log('[NotionConnections] Failed to delete connection', 'error', {
        user_id: userId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Check if a user has an active Notion connection
   */
  static async hasConnection(userId: string): Promise<boolean> {
    const connection = await this.getConnection(userId);
    return connection !== null;
  }

  /**
   * Get all Notion connections (admin only)
   */
  static async getAllConnections(): Promise<NotionConnection[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('user_notion_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        log('[NotionConnections] Failed to get all connections', 'error', {
          error: error.message
        });
        return [];
      }

      return data || [];
    } catch (error: any) {
      log('[NotionConnections] Failed to get all connections', 'error', {
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
        .from('user_notion_connections')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error: any) {
      log('[NotionConnections] Failed to update last used', 'error', {
        user_id: userId,
        error: error.message
      });
    }
  }

  /**
   * Validate and refresh connection if needed
   */
  static async validateConnection(userId: string): Promise<NotionConnection | null> {
    const connection = await this.getConnection(userId);
    if (!connection) {
      return null;
    }

    // Test the connection by making a simple API call
    try {
      const response = await fetch('https://api.notion.com/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
          'Notion-Version': '2022-06-28'
        }
      });

      if (response.ok) {
        // Update last used timestamp
        await this.updateLastUsed(userId);
        return connection;
      } else {
        // Connection is invalid, remove it
        log('[NotionConnections] Connection validation failed, removing invalid connection', 'warn', {
          user_id: userId,
          workspace_id: connection.workspace_id,
          status: response.status
        });
        await this.deleteConnection(userId);
        return null;
      }
    } catch (error: any) {
      log('[NotionConnections] Connection validation error', 'error', {
        user_id: userId,
        error: error.message
      });
      return null;
    }
  }
}