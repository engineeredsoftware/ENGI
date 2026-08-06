import { SupabaseClient } from '@supabase/supabase-js';
import { BaseModel } from './base';
import type { Database, Tables, Insertable, Updatable, Json } from '../types/database';
export type PipelineExecution = Tables<'executions'>;
export type PipelineExecutionInsert = Insertable<'executions'>;
export type PipelineExecutionUpdate = Updatable<'executions'>;
export type PipelineExecutionReadModel = PipelineExecution & {
    metadata?: Record<string, any> | null;
    result?: Json | null;
    error_message?: string | null;
    execution_time_ms?: number | null;
};
export declare class PipelineExecutionsModel extends BaseModel<'executions'> {
    constructor(supabase: SupabaseClient<Database>);
    getById(id: string): Promise<PipelineExecutionReadModel | null>;
    findAll(options?: {
        limit?: number;
        offset?: number;
        orderBy?: keyof PipelineExecution;
        ascending?: boolean;
    }): Promise<PipelineExecutionReadModel[]>;
    getAll(options?: {
        limit?: number;
        offset?: number;
        orderBy?: keyof PipelineExecution;
        ascending?: boolean;
    }): Promise<PipelineExecutionReadModel[]>;
    create(data: (PipelineExecutionInsert & {
        metadata?: Record<string, any>;
        result?: Json | null;
        error_message?: string | null;
        execution_time_ms?: number | null;
    }) | any): Promise<PipelineExecutionReadModel>;
    update(id: string, data: (PipelineExecutionUpdate & {
        metadata?: Record<string, any>;
        result?: Json | null;
        error_message?: string | null;
        execution_time_ms?: number | null;
    }) | any): Promise<PipelineExecutionReadModel>;
    getByAssetPackEvidenceId(assetPackEvidenceId: string): Promise<PipelineExecutionReadModel[]>;
}
