/**
 * VCS Connections - Database persistence for VCS connections
 * 
 * Manages VCS authentication tokens and connection metadata.
 * Uses ORM for all database operations.
 * 
 * @doc-code
 * type: connections
 * category: vcs
 * pattern: connection-management
 */

import { UserConnectionsModel, type Database } from '@bitcode/orm';
import { VCSProviderType, VCSAuth, VCSError } from './types';
import { log } from '@bitcode/logger';
import { SupabaseClient } from '@supabase/supabase-js';

export interface SaveConnectionData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  providerUserId: string;
  providerUsername: string;
  instanceUrl?: string;
  metadata?: Record<string, unknown>;
}

interface PersistedConnectionData {
  connectionId?: unknown;
  provider_user_id?: unknown;
  provider_username?: unknown;
  access_token?: unknown;
  refresh_token?: unknown;
  token_expires_at?: unknown;
  installation_token_expires_at?: unknown;
  oauth_token?: unknown;
  instance_url?: unknown;
  /** V48-Gate3-F34: source-safe reason the last regeneration attempt failed, or null on success. */
  last_regeneration_error?: unknown;
  last_regeneration_at?: unknown;
  [key: string]: unknown;
}

function asConnectionData(value: unknown): PersistedConnectionData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as PersistedConnectionData;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Handles VCS connections in the database
 */
export class VCSConnections {
  private connections: UserConnectionsModel;
  
  constructor(supabaseClient?: SupabaseClient<Database>) {
    if (!supabaseClient) {
      throw new Error('VCSConnections requires a Supabase client');
    }
    this.connections = new UserConnectionsModel(supabaseClient);
  }
  
  /**
   * Save or update a VCS connection
   */
  async saveConnection(
    userId: string,
    provider: VCSProviderType,
    data: SaveConnectionData
  ): Promise<string> {
    try {
      const connection = await this.connections.upsert({
        user_id: userId,
        provider,
        connection_data: {
          connectionId: data.providerUserId,
          provider_user_id: data.providerUserId,
          provider_username: data.providerUsername,
          access_token: data.accessToken,
          refresh_token: data.refreshToken,
          token_expires_at: data.expiresAt?.toISOString(),
          instance_url: data.instanceUrl,
          ...data.metadata
        }
      });
      
      log('Connection saved', 'info', {
        userId,
        provider,
        providerUsername: data.providerUsername
      });
      
      return connection.id;
    } catch (error) {
      log('Failed to save connection', 'error', { error, userId, provider });
      throw new VCSError(
        `Failed to save ${provider} connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DB_ERROR'
      );
    }
  }
  
  /**
   * Get a VCS connection for a user
   */
  async getConnection(
    userId: string,
    provider?: VCSProviderType
  ): Promise<{ id: string; connectionData: any } | null> {
    try {
      log('Getting VCS connection', 'debug', { userId, provider });
      
      const connection = provider
        ? await this.connections.getByUserAndProvider(userId, provider)
        : (await this.connections.listByUserId(userId))[0];
      
      if (!connection) {
        log('No VCS connection found', 'info', { userId, provider });
        return null;
      }
      const connectionData = asConnectionData(connection.connection_data);
      
      log('VCS connection found', 'info', { 
        userId, 
        provider: connection.provider,
        connectionId: connection.id,
        hasAccessToken: !!readString(connectionData.access_token),
        providerUserId: readString(connectionData.provider_user_id)
      });
      
      return {
        id: connection.id,
        connectionData
      };
    } catch (error) {
      log('Failed to get connection', 'error', { error, userId, provider });
      return null;
    }
  }
  
  /**
   * Get auth data from connection.
   * @param options.forceRegenerate When true, always re-mint a GitHub App
   * installation token even if the stored token has not expired yet. Used by
   * explicit Refresh when the connection is Invalid (revoked install / bad
   * token that still has a future expiry).
   */
  async getAuthFromConnection(
    connectionId: string,
    options?: { forceRegenerate?: boolean },
  ): Promise<VCSAuth | null> {
    try {
      log('Getting auth from connection', 'debug', { connectionId });
      const forceRegenerate = Boolean(options?.forceRegenerate);
      
      // Check if connectionId is a valid UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(connectionId);
      
      let connection = null;
      
      if (isUUID) {
        // Try to get by database UUID
        connection = await this.connections.getById(connectionId);
      }
      
      // If not found by UUID or not a UUID, and the connectionId looks like a number (GitHub installation ID)
      if (!connection && /^\d+$/.test(connectionId)) {
        log('Looking for connection by GitHub installation ID', 'debug', { connectionId });
        
        // Try by provider_user_id first
        connection = await this.connections.getByProviderUserId('github', connectionId);
        
        // If still not found, use the installation-ID lookup.
        if (!connection) {
          const auth = await this.connections.getAuthFromConnectionByInstallationId(Number(connectionId));
          if (auth?.accessToken) {
            log('Found connection via installation ID lookup', 'info', { connectionId });
            return {
              accessToken: auth.accessToken,
              provider: auth.provider as VCSProviderType,
              connectionId: auth.installationId
            };
          }
        }
      }
      
      if (!connection) {
        log('Connection not found by any method', 'warn', { connectionId, isUUID });
        return null;
      }
      const connectionData = asConnectionData(connection.connection_data);
      
      // Check for access_token or ability to generate one
      let accessToken = readString(connectionData.access_token);
      
      // For GitHub App installations, regenerate token if expired, missing, or forced
      const installationConnectionId = readString(connectionData.connectionId);
      if (connection.provider === 'github' && installationConnectionId) {
        const tokenExpiresAt = readString(connectionData.installation_token_expires_at);
        const isExpired = tokenExpiresAt ? new Date(tokenExpiresAt) < new Date() : true;
        
        if (!accessToken || accessToken === '' || isExpired || forceRegenerate) {
          log('GitHub installation token missing, expired, or force-regenerate, regenerating', 'info', {
            connectionId,
            installationId: installationConnectionId,
            hadToken: !!accessToken,
            isExpired,
            forceRegenerate,
          });
          
          // Regenerate installation token
          try {
            const { GitHubAppAuth } = await import('@bitcode/generic-vcs-github');
            const appId = process.env.GITHUB_APP_ID;
            const privateKey = process.env.GITHUB_PRIVATE_KEY;

            if (appId && privateKey) {
              const githubApp = new GitHubAppAuth({
                appId,
                privateKey,
                clientId: process.env.GITHUB_APP_CLIENT_ID,
                clientSecret: process.env.GITHUB_APP_CLIENT_SECRET
              });

              // Don't request specific permissions - use whatever the installation has granted
              // This avoids 422 errors when requesting permissions not available to the installation
              const tokenData = await githubApp.generateInstallationToken(
                Number(installationConnectionId)
                // Omitting permissions parameter to use installation's granted permissions
              );

              accessToken = tokenData.token;

              // Update the connection with new token
              await this.updateTokens(connection.id, {
                accessToken: tokenData.token,
                expiresAt: tokenData.expiresAt
              });
              // Clear any prior failure diagnostic now that regeneration succeeded.
              await this.recordRegenerationDiagnostic(connection.id, null);

              log('GitHub installation token regenerated successfully', 'info', {
                connectionId,
                expiresAt: tokenData.expiresAt
              });
            } else {
              // V48-Gate3-F34: env misconfiguration (missing GITHUB_APP_ID/
              // GITHUB_PRIVATE_KEY on this deployment target) silently no-op'd
              // here before — the stale token then failed live validation with
              // no trace of WHY, indistinguishable from a genuinely revoked
              // installation. Persist a source-safe reason so Invalid is
              // diagnosable without server log access.
              await this.recordRegenerationDiagnostic(
                connection.id,
                'github_app_credentials_not_configured',
              );
            }
          } catch (error) {
            const reason = error instanceof Error ? error.message : 'unknown_regeneration_error';
            log('Failed to regenerate GitHub installation token', 'error', {
              connectionId,
              error
            });
            // V48-Gate3-F34: persist WHY regeneration failed (source-safe —
            // GitHub's own API error text, e.g. installation suspended/
            // uninstalled — no tokens/secrets) so a stuck-Invalid connection
            // is diagnosable from the connection status alone, without
            // needing server logs.
            await this.recordRegenerationDiagnostic(connection.id, reason);
            // Fall back to OAuth token if available
            accessToken = readString(connectionData.oauth_token);
          }
        }
      }
      
      if (!accessToken || accessToken === '') {
        log('Connection exists but has no valid access token', 'warn', { 
          connectionId,
          hasConnectionData: Object.keys(connectionData).length > 0,
          connectionDataKeys: Object.keys(connectionData),
          accessTokenValue: accessToken === '' ? 'empty string' : typeof accessToken
        });
        return null;
      }
      
      log('Auth retrieved successfully', 'info', { 
        connectionId,
        provider: connection.provider,
        hasRefreshToken: !!readString(connectionData.refresh_token)
      });
      
      const refreshToken = readString(connectionData.refresh_token);
      const tokenExpiresAt = readString(connectionData.token_expires_at);
      return {
        accessToken: accessToken,
        refreshToken,
        expiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : undefined,
        provider: connection.provider as VCSProviderType,
        connectionId: connection.id
      };
    } catch (error) {
      log('Failed to get auth from connection', 'error', { error, connectionId });
      return null;
    }
  }
  
  /**
   * Get auth by GitHub installation ID.
   */
  async getAuthFromConnectionByInstallationId(
    installationId: number
  ): Promise<VCSAuth | null> {
    try {
      const auth = await this.connections.getAuthFromConnectionByInstallationId(installationId);
      if (!auth?.accessToken) return null;
      
      return {
        accessToken: auth.accessToken,
        provider: auth.provider as VCSProviderType,
        connectionId: auth.installationId
      };
    } catch (error) {
      log('Failed to get auth by installation ID', 'error', { error, installationId });
      return null;
    }
  }
  
  /**
   * Update connection tokens
   */
  async updateTokens(
    connectionId: string,
    tokens: {
      accessToken: string;
      refreshToken?: string;
      expiresAt?: Date;
    }
  ): Promise<void> {
    try {
      const connection = await this.connections.getById(connectionId);
      if (!connection) {
        throw new VCSError('Connection not found', 'NOT_FOUND');
      }
      const connectionData = asConnectionData(connection.connection_data);
      const nextConnectionData = {
        ...connectionData,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken || readString(connectionData.refresh_token),
        token_expires_at: tokens.expiresAt?.toISOString(),
        // This is the ONLY caller of updateTokens, and it's the GitHub App
        // installation-token regeneration path in getAuthFromConnection below
        // — which decides "is the token expired" by reading
        // installation_token_expires_at (V48-Gate3-F33), not token_expires_at.
        // Writing only token_expires_at here left that check permanently
        // stale: every regeneration "succeeded" but the field the NEXT check
        // reads never moved, so it re-triggered a full regeneration on every
        // single call forever. Keep both fields in lockstep.
        installation_token_expires_at: tokens.expiresAt?.toISOString()
      } as Database['public']['Tables']['user_connections']['Update']['connection_data'];
      
      await this.connections.update(connectionId, {
        connection_data: nextConnectionData
      });
      
      log('Tokens updated', 'debug', { connectionId });
    } catch (error) {
      log('Failed to update tokens', 'error', { error, connectionId });
      throw new VCSError(
        `Failed to update tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UPDATE_ERROR'
      );
    }
  }

  /**
   * V48-Gate3-F34: persist the outcome of the last GitHub App installation
   * token regeneration attempt (source-safe reason text only — never a
   * token/secret) so a connection stuck on "Invalid" is diagnosable from the
   * stored connection alone. Best-effort: a failure here must never mask the
   * original regeneration error, so it's swallowed.
   */
  private async recordRegenerationDiagnostic(
    connectionId: string,
    reason: string | null
  ): Promise<void> {
    try {
      const connection = await this.connections.getById(connectionId);
      if (!connection) return;
      const connectionData = asConnectionData(connection.connection_data);
      const nextConnectionData = {
        ...connectionData,
        last_regeneration_error: reason,
        last_regeneration_at: new Date().toISOString()
      } as Database['public']['Tables']['user_connections']['Update']['connection_data'];

      await this.connections.update(connectionId, {
        connection_data: nextConnectionData
      });
    } catch (error) {
      log('Failed to record regeneration diagnostic', 'warn', { error, connectionId });
    }
  }

  /**
   * Delete a connection
   */
  async deleteConnection(connectionId: string): Promise<void> {
    try {
      await this.connections.delete(connectionId);
      log('Connection deleted', 'info', { connectionId });
    } catch (error) {
      log('Failed to delete connection', 'error', { error, connectionId });
      throw new VCSError(
        `Failed to delete connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DELETE_ERROR'
      );
    }
  }
  
  /**
   * List all connections for a user
   */
  async listConnections(userId: string): Promise<Array<{
    id: string;
    provider: string;
    username: string;
    createdAt: Date;
  }>> {
    try {
      const connections = await this.connections.listByUserId(userId);
      
      return connections.map(c => ({
        ...(() => {
          const connectionData = asConnectionData(c.connection_data);
          return {
            username:
              readString(connectionData.provider_username) ||
              readString(connectionData.provider_user_id) ||
              c.provider
          };
        })(),
        id: c.id,
        provider: c.provider,
        createdAt: new Date(c.created_at ?? Date.now())
      }));
    } catch (error) {
      log('Failed to list connections', 'error', { error, userId });
      return [];
    }
  }
}
