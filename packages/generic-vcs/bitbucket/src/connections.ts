/**
 * Bitbucket connection helpers — wraps primitive VCSConnections (vcs-generics).
 * Provider type is always `bitbucket`.
 */

import {
  VCSConnections,
  type SaveConnectionData,
  type VCSAuth,
} from '@bitcode/vcs-generics';
import type { SupabaseClient } from '@supabase/supabase-js';

export class BitbucketConnections {
  private readonly connections: VCSConnections;

  constructor(supabase: SupabaseClient) {
    this.connections = new VCSConnections(supabase as any);
  }

  saveConnection(userId: string, data: SaveConnectionData) {
    return this.connections.saveConnection(userId, 'bitbucket', data);
  }

  getConnection(userId: string) {
    return this.connections.getConnection(userId, 'bitbucket');
  }

  getAuthFromConnection(connectionId: string): Promise<VCSAuth | null> {
    return this.connections.getAuthFromConnection(connectionId);
  }

  deleteConnection(connectionId: string) {
    return this.connections.deleteConnection(connectionId);
  }
}

export { VCSConnections };
