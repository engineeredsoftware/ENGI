/**
 * AssetPack evidence storage model.
 *
 * The physical table name is retained by the V26 migration boundary. This
 * model is the Bitcode storage-edge translation layer for AssetPack evidence
 * and settle PR delivery records.
 */
import { BaseModel } from './base';
import { Tables, Database, Insertable, Updatable } from '../types/database';
import { SupabaseClient } from '@supabase/supabase-js';
export type AssetPackEvidenceRecord = Tables<'deliverables'> & {
    name: string;
    metadata?: Record<string, any> | null;
    organization_id?: string | null;
};
export declare class AssetPackEvidenceModel extends BaseModel<'deliverables'> {
    constructor(supabase: SupabaseClient<Database>);
    getById(id: string): Promise<AssetPackEvidenceRecord | null>;
    findAll(options?: {
        limit?: number;
        offset?: number;
        orderBy?: keyof Tables<'deliverables'>;
        ascending?: boolean;
    }): Promise<AssetPackEvidenceRecord[]>;
    getAll(options?: {
        limit?: number;
        offset?: number;
        orderBy?: keyof Tables<'deliverables'>;
        ascending?: boolean;
    }): Promise<AssetPackEvidenceRecord[]>;
    create(data: (Insertable<'deliverables'> & {
        name?: string;
        metadata?: Record<string, any>;
        organization_id?: string | null;
    }) | any): Promise<AssetPackEvidenceRecord>;
    update(id: string, data: (Updatable<'deliverables'> & {
        name?: string;
        metadata?: Record<string, any>;
        organization_id?: string | null;
    }) | any): Promise<AssetPackEvidenceRecord>;
    /**
     * Find AssetPack evidence by organization.
     */
    findByOrganization(organizationId: string, options?: {
        status?: Tables<'deliverables'>['status'];
        limit?: number;
    }): Promise<AssetPackEvidenceRecord[]>;
    /**
     * Find AssetPack evidence by repository.
     */
    findByRepository(repositoryId: string): Promise<AssetPackEvidenceRecord[]>;
    /**
     * Update AssetPack evidence status.
     */
    updateStatus(assetPackEvidenceId: string, status: Tables<'deliverables'>['status']): Promise<AssetPackEvidenceRecord>;
    /**
     * Update effectiveness score
     */
    updateEffectiveness(assetPackEvidenceId: string, score: number): Promise<AssetPackEvidenceRecord>;
    /**
     * Mark as recently run
     */
    markAsRun(assetPackEvidenceId: string): Promise<AssetPackEvidenceRecord>;
    /**
     * Get high-performing AssetPack evidence records.
     */
    getHighPerformers(limit?: number): Promise<AssetPackEvidenceRecord[]>;
    /**
     * Get AssetPack evidence reading attention.
     */
    getReadingAttention(): Promise<AssetPackEvidenceRecord[]>;
    /**
     * Get AssetPack evidence statistics by organization.
     */
    getStatsByOrganization(organizationId: string): Promise<{
        total: number;
        byStatus: Record<string, number>;
        avgEffectiveness: number;
    }>;
    /**
     * Clone an AssetPack evidence record.
     */
    clone(assetPackEvidenceId: string, overrides?: Partial<Tables<'deliverables'>>): Promise<AssetPackEvidenceRecord>;
}
