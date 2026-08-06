/**
 * Pipeline Runs Model - Meta model kept for historical/reference data; canonical user-visible records are pipeline executions
 *
 * Captures all generic pipeline execution data from pipelines-generics.
 * Specific pipeline types (asset-pack, measure, etc.) extend this.
 */
import { BaseModel } from './base';
import { Tables, Insertable, Updatable, Database } from '../types/database';
import { SupabaseClient } from '@supabase/supabase-js';
export type PipelineRun = Tables<'pipeline_runs'>;
export type PipelineRunInsert = Insertable<'pipeline_runs'>;
export type PipelineRunUpdate = Updatable<'pipeline_runs'>;
export interface PipelineExecutionData {
    pipelineType: 'asset-pack' | 'measure' | 'patch';
    pipelineName: string;
    pipelineVersion: string;
    executionId: string;
    correlationId: string;
    parentExecutionId?: string;
    startedAt: string;
    completedAt?: string;
    duration?: number;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    currentPhase?: 'setup' | 'discovery' | 'implementation' | 'validation' | 'finish';
    currentAgent?: string;
    iterationCount?: number;
    maxIterations?: number;
    input: Record<string, any>;
    output?: Record<string, any>;
    metrics: {
        totalTokensUsed: number;
        totalMeasuredBtd: number;
        totalDuration: number;
        phases: Record<string, {
            duration: number;
            tokensUsed: number;
            measuredBtd: number;
            success: boolean;
            agentsInvoked: string[];
        }>;
        agents: Record<string, {
            invocationCount: number;
            totalTokens: number;
            totalDuration: number;
            averageConfidence: number;
        }>;
    };
    artifacts: {
        filesCreated: string[];
        filesModified: string[];
        filesDeleted: string[];
        testsAdded: number;
        testsPassing: number;
        documentation: string[];
        coverage?: number;
    };
    validation: {
        testsPass: boolean;
        lintingPass?: boolean;
        typeCheckPass?: boolean;
        securityScanPass?: boolean;
        issues: Array<{
            type: 'error' | 'warning' | 'info';
            message: string;
            file?: string;
            line?: number;
        }>;
    };
    error?: {
        message: string;
        stack?: string;
        phase?: string;
        agent?: string;
    };
    executionState: Record<string, Record<string, any>>;
}
export declare class PipelineRunsModel extends BaseModel<'pipeline_runs'> {
    constructor(supabase: SupabaseClient<Database>);
    /**
    * Create new pipeline run (meta) record
     */
    create(data: PipelineRunInsert): Promise<PipelineRun>;
    /**
     * Get run by execution ID
     */
    getByExecutionId(executionId: string): Promise<PipelineRun | null>;
    /**
     * List runs by type
     */
    listByType(pipelineType: string, options?: {
        userId?: string;
        limit?: number;
        offset?: number;
        status?: string;
    }): Promise<{
        data: PipelineRun[];
        count: number;
    }>;
    /**
     * Update run with execution results
     */
    updateWithResults(executionId: string, results: {
        output?: Record<string, any>;
        metrics?: Partial<PipelineExecutionData['metrics']>;
        artifacts?: Partial<PipelineExecutionData['artifacts']>;
        validation?: Partial<PipelineExecutionData['validation']>;
        executionState?: Record<string, Record<string, any>>;
        status?: PipelineExecutionData['status'];
        completedAt?: string;
        duration?: number;
    }): Promise<PipelineRun>;
    /**
     * Mark run as failed
     */
    markFailed(executionId: string, error: {
        message: string;
        stack?: string;
        phase?: string;
        agent?: string;
    }): Promise<PipelineRun>;
    /**
     * Mark run as cancelled
     */
    markCancelled(executionId: string, cancellation: {
        message: string;
        cancelledAt: string;
        userId: string;
    }): Promise<PipelineRun>;
    /**
     * Get active runs for user
     */
    getActiveRuns(userId: string): Promise<PipelineRun[]>;
}
