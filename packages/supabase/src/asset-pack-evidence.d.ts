/**
 * Manually-curated TypeScript interfaces for AssetPack evidence storage tables.
 *
 * These are **temporary** until we introduce automatic generation directly
 * from the Supabase Postgres schema.  Keeping them here unblocks typed API
 * routes and React hooks immediately.
 */
export interface AssetPackEvidenceRow {
    id: string;
    user_id: string;
    title: string;
    output: string | null;
    repository: string | null;
    deliverable_type: string | null;
    deliverable_id: string | null;
    deliverable_status: string | null;
    attached_urls: unknown | null;
    selected_files: unknown | null;
    created_at: string;
    run_id: string | null;
    started_at: string | null;
    finished_at: string | null;
    duration_ms: number | null;
}
export interface PipelineExecution {
    id: string;
    user_id: string;
    status: string | null;
    context: unknown | null;
    created_at: string;
    started_at: string | null;
    finished_at: string | null;
    duration_ms: number | null;
}
export interface PhaseExecution {
    id: string;
    run_id: string;
    phase: string;
    started_at: string | null;
    finished_at: string | null;
    duration_ms: number | null;
    status: string | null;
}
export interface ExecutionEvent {
    id: string;
    run_id: string;
    created_at: string;
    level: 'info' | 'warning' | 'error' | string;
    message: string;
    data: unknown | null;
}
export interface GeneratedAsset {
    id: string;
    run_id: string;
    path: string;
    url: string;
    meta: unknown | null;
    created_at: string;
}
export interface TokenCost {
    id: string;
    run_id: string;
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    cost_usd: number;
    created_at: string;
}
export interface PipelineExecutionSnapshot {
    run: PipelineExecution;
    phases: PhaseExecution[];
    events: ExecutionEvent[];
    assets: GeneratedAsset[];
    tokenCosts: TokenCost[];
}
