import { SupabaseClient } from '@supabase/supabase-js';
import { BaseModel } from './base';
import type { Database, Insertable, Tables, Updatable } from '../types/database';
export declare const BITCODE_EXECUTION_STORAGE_SCHEMA_PARITY: {
    readonly assetPackPhaseExecutions: "phase_executions";
    readonly assetPackVectors: "deliverable_vectors";
    readonly run_jobs: "run_jobs";
    readonly stream_logs: "stream_logs";
    readonly generated_assets: "generated_assets";
    readonly events: "events";
    readonly error_logs: "error_logs";
    readonly token_costs: "token_costs";
};
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
type RunScopedTable = 'phase_executions' | 'generated_assets' | 'token_costs';
declare abstract class RunScopedModel<T extends RunScopedTable> extends BaseModel<T> {
    listByRunId(runId: string, options?: {
        limit?: number;
    }): Promise<Tables<T>[]>;
}
declare abstract class UserScopedModel<T extends 'events' | 'error_logs' | 'stream_logs'> extends BaseModel<T> {
    listByUserId(userId: string, options?: {
        limit?: number;
    }): Promise<Tables<T>[]>;
}
export declare class AssetPackVectorsModel extends BaseModel<'deliverable_vectors'> {
    constructor(supabase: SupabaseClient<Database>);
    listByAssetPackEvidenceId(assetPackEvidenceId: string, options?: {
        limit?: number;
    }): Promise<{
        content: string;
        created_at: string | null;
        deliverable_id: string;
        embedding: string | null;
        id: string;
        metadata: import("../types/database").Json | null;
    }[]>;
}
export declare class AssetPackPhaseExecutionsModel extends RunScopedModel<'phase_executions'> {
    constructor(supabase: SupabaseClient<Database>);
}
export declare class AssetPackRunJobsModel extends BaseModel<'run_jobs'> {
    constructor(supabase: SupabaseClient<Database>);
    listByStatus(status: string, options?: {
        limit?: number;
    }): Promise<{
        claimed_at: string | null;
        claimed_by: string | null;
        created_at: string | null;
        error_message: string | null;
        id: string;
        job_type: string;
        max_retries: number | null;
        payload: import("../types/database").Json | null;
        result: import("../types/database").Json | null;
        retry_count: number | null;
        status: string | null;
        updated_at: string | null;
    }[]>;
}
export declare class AssetPackStreamLogsModel extends UserScopedModel<'stream_logs'> {
    constructor(supabase: SupabaseClient<Database>);
    listByStreamId(streamId: string, options?: {
        limit?: number;
    }): Promise<{
        created_at: string | null;
        id: string;
        log_data: import("../types/database").Json | null;
        log_type: string;
        stream_id: string;
        user_id: string | null;
    }[]>;
}
export declare class AssetPackGeneratedAssetsModel extends RunScopedModel<'generated_assets'> {
    constructor(supabase: SupabaseClient<Database>);
}
export declare class BitcodeActivityEventsModel extends UserScopedModel<'events'> {
    constructor(supabase: SupabaseClient<Database>);
}
export declare class BitcodeErrorLogsModel extends UserScopedModel<'error_logs'> {
    constructor(supabase: SupabaseClient<Database>);
}
export declare class BitcodeTokenCostsModel extends RunScopedModel<'token_costs'> {
    constructor(supabase: SupabaseClient<Database>);
}
export {};
