import { SupabaseClient } from '@supabase/supabase-js';
import { BaseModel } from './base';
import type { Database, Insertable, Tables, Updatable } from '../types/database';

export const BITCODE_EXECUTION_STORAGE_SCHEMA_PARITY = {
  assetPackPhaseExecutions: 'phase_executions',
  assetPackVectors: 'deliverable_vectors',
  run_jobs: 'run_jobs',
  stream_logs: 'stream_logs',
  generated_assets: 'generated_assets',
  events: 'events',
  error_logs: 'error_logs',
  token_costs: 'token_costs',
} as const;

export type AssetPackVector = Tables<'deliverable_vectors'>;
export type AssetPackVectorInsert = Insertable<'deliverable_vectors'>;
export type AssetPackVectorUpdate = Updatable<'deliverable_vectors'>;

export type AssetPackPhaseExecution = Tables<'phase_executions'>;
export type AssetPackPhaseExecutionInsert = Insertable<'phase_executions'>;
export type AssetPackPhaseExecutionUpdate = Updatable<'phase_executions'>;

export type AssetPackRunJob = Tables<'run_jobs'>;
export type AssetPackRunJobInsert = Insertable<'run_jobs'>;
export type AssetPackRunJobUpdate = Updatable<'run_jobs'>;

export type AssetPackStreamLog = Tables<'stream_logs'>;
export type AssetPackStreamLogInsert = Insertable<'stream_logs'>;
export type AssetPackStreamLogUpdate = Updatable<'stream_logs'>;

export type AssetPackGeneratedAsset = Tables<'generated_assets'>;
export type AssetPackGeneratedAssetInsert = Insertable<'generated_assets'>;
export type AssetPackGeneratedAssetUpdate = Updatable<'generated_assets'>;

export type BitcodeActivityEvent = Tables<'events'>;
export type BitcodeActivityEventInsert = Insertable<'events'>;
export type BitcodeActivityEventUpdate = Updatable<'events'>;

export type BitcodeErrorLog = Tables<'error_logs'>;
export type BitcodeErrorLogInsert = Insertable<'error_logs'>;
export type BitcodeErrorLogUpdate = Updatable<'error_logs'>;

export type BitcodeTokenCost = Tables<'token_costs'>;
export type BitcodeTokenCostInsert = Insertable<'token_costs'>;
export type BitcodeTokenCostUpdate = Updatable<'token_costs'>;

type RunScopedTable =
  | 'phase_executions'
  | 'generated_assets'
  | 'token_costs';

abstract class RunScopedModel<T extends RunScopedTable> extends BaseModel<T> {
  async listByRunId(runId: string, options?: { limit?: number }) {
    let query = (this.client as any)
      .from(this.tableName)
      .select('*')
      .eq('run_id', runId);

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Tables<T>[];
  }
}

abstract class UserScopedModel<T extends 'events' | 'error_logs' | 'stream_logs'> extends BaseModel<T> {
  async listByUserId(userId: string, options?: { limit?: number }) {
    let query = (this.client as any)
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId);

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Tables<T>[];
  }
}

export class AssetPackVectorsModel extends BaseModel<'deliverable_vectors'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'deliverable_vectors');
  }

  async listByAssetPackEvidenceId(assetPackEvidenceId: string, options?: { limit?: number }) {
    let query = (this.client as any)
      .from(this.tableName)
      .select('*')
      .eq('deliverable_id', assetPackEvidenceId);

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as AssetPackVector[];
  }
}

export class AssetPackPhaseExecutionsModel extends RunScopedModel<'phase_executions'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'phase_executions');
  }
}

export class AssetPackRunJobsModel extends BaseModel<'run_jobs'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'run_jobs');
  }

  async listByStatus(status: string, options?: { limit?: number }) {
    let query = (this.client as any)
      .from(this.tableName)
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: true });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as AssetPackRunJob[];
  }
}

export class AssetPackStreamLogsModel extends UserScopedModel<'stream_logs'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'stream_logs');
  }

  async listByStreamId(streamId: string, options?: { limit?: number }) {
    let query = (this.client as any)
      .from(this.tableName)
      .select('*')
      .eq('stream_id', streamId);

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as AssetPackStreamLog[];
  }
}

export class AssetPackGeneratedAssetsModel extends RunScopedModel<'generated_assets'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'generated_assets');
  }
}

export class BitcodeActivityEventsModel extends UserScopedModel<'events'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'events');
  }
}

export class BitcodeErrorLogsModel extends UserScopedModel<'error_logs'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'error_logs');
  }
}

export class BitcodeTokenCostsModel extends RunScopedModel<'token_costs'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'token_costs');
  }
}
