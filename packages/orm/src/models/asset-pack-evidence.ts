/**
 * AssetPack evidence storage model.
 *
 * The physical table name is retained by the V26 migration boundary. This
 * model is the Bitcode storage-edge translation layer for AssetPack evidence
 * and settle PR delivery records.
 */

import { BaseModel } from './base';
import { Tables, Database, Insertable, Updatable, Json } from '../types/database';
import { SupabaseClient } from '@supabase/supabase-js';

export type AssetPackEvidenceRecord = Tables<'deliverables'> & {
  name: string;
  metadata?: Record<string, any> | null;
  organization_id?: string | null;
};

function asMetadata(value: Json | null | undefined): Record<string, any> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : null;
}

function normalizeAssetPackEvidence(row: Tables<'deliverables'>): AssetPackEvidenceRecord {
  return {
    ...row,
    name: row.title,
    metadata: asMetadata(row.config),
    organization_id: asMetadata(row.config)?.organizationId ? String(asMetadata(row.config)?.organizationId) : null,
  };
}

export class AssetPackEvidenceModel extends BaseModel<'deliverables'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'deliverables');
  }

  async getById(id: string): Promise<AssetPackEvidenceRecord | null> {
    const row = await super.getById(id);
    return row ? normalizeAssetPackEvidence(row) : null;
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    orderBy?: keyof Tables<'deliverables'>;
    ascending?: boolean;
  }): Promise<AssetPackEvidenceRecord[]> {
    const rows = await super.findAll(options);
    return rows.map(normalizeAssetPackEvidence);
  }

  async getAll(options?: {
    limit?: number;
    offset?: number;
    orderBy?: keyof Tables<'deliverables'>;
    ascending?: boolean;
  }): Promise<AssetPackEvidenceRecord[]> {
    return this.findAll(options);
  }

  async create(
    data: (Insertable<'deliverables'> & {
      name?: string;
      metadata?: Record<string, any>;
      organization_id?: string | null;
    }) | any,
  ): Promise<AssetPackEvidenceRecord> {
    const created = await super.create({
      ...data,
      title: data.title ?? data.name ?? 'Untitled AssetPack evidence record',
      config: data.config ?? data.metadata ?? null,
      user_id: data.user_id ?? data.organization_id ?? 'unknown-user',
    });
    return normalizeAssetPackEvidence(created);
  }

  async update(
    id: string,
    data: (Updatable<'deliverables'> & {
      name?: string;
      metadata?: Record<string, any>;
      organization_id?: string | null;
    }) | any,
  ): Promise<AssetPackEvidenceRecord> {
    const updated = await super.update(id, {
      ...data,
      title: data.title ?? data.name,
      config: data.config ?? data.metadata,
      user_id: data.user_id ?? data.organization_id,
    });
    return normalizeAssetPackEvidence(updated);
  }

  /**
   * Find AssetPack evidence by organization.
   */
  async findByOrganization(
    organizationId: string,
    options?: { status?: Tables<'deliverables'>['status']; limit?: number }
  ): Promise<AssetPackEvidenceRecord[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', organizationId)
      .order('updated_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(normalizeAssetPackEvidence);
  }

  /**
   * Find AssetPack evidence by repository.
   */
  async findByRepository(repositoryId: string): Promise<AssetPackEvidenceRecord[]> {
    const rows = await this.findBy('template_id', repositoryId);
    return rows.map(normalizeAssetPackEvidence);
  }

  /**
   * Update AssetPack evidence status.
   */
  async updateStatus(
    assetPackEvidenceId: string,
    status: Tables<'deliverables'>['status']
  ): Promise<AssetPackEvidenceRecord> {
    return this.update(assetPackEvidenceId, { status });
  }

  /**
   * Update effectiveness score
   */
  async updateEffectiveness(
    assetPackEvidenceId: string,
    score: number
  ): Promise<AssetPackEvidenceRecord> {
    return this.update(assetPackEvidenceId, {
      effectiveness_score: Math.min(1, Math.max(0, score))
    });
  }

  /**
   * Mark as recently run
   */
  async markAsRun(assetPackEvidenceId: string): Promise<AssetPackEvidenceRecord> {
    return this.update(assetPackEvidenceId, {
      execution_count: 1,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Get high-performing AssetPack evidence records.
   */
  async getHighPerformers(limit = 10): Promise<AssetPackEvidenceRecord[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('effectiveness_score', 0.8)
      .order('effectiveness_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(normalizeAssetPackEvidence);
  }

  /**
   * Get AssetPack evidence reading attention.
   */
  async getReadingAttention(): Promise<AssetPackEvidenceRecord[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .or('status.eq.failed,effectiveness_score.lt.0.5')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(normalizeAssetPackEvidence);
  }

  /**
   * Get AssetPack evidence statistics by organization.
   */
  async getStatsByOrganization(organizationId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    avgEffectiveness: number;
  }> {
    const assetPackEvidence = await this.findByOrganization(organizationId);

    const byStatus = assetPackEvidence.reduce((acc, d) => {
      const status = d.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const withScores = assetPackEvidence.filter(d => d.effectiveness_score !== null);
    const avgEffectiveness = withScores.length > 0
      ? withScores.reduce((sum, d) => sum + (d.effectiveness_score || 0), 0) / withScores.length
      : 0;

    return {
      total: assetPackEvidence.length,
      byStatus,
      avgEffectiveness
    };
  }

  /**
   * Clone an AssetPack evidence record.
   */
  async clone(
    assetPackEvidenceId: string,
    overrides?: Partial<Tables<'deliverables'>>
  ): Promise<AssetPackEvidenceRecord> {
    const original = await this.findById(assetPackEvidenceId);
    if (!original) throw new Error('AssetPack evidence not found');

    const { id, created_at, updated_at, ...cloneData } = original;
    
    return this.create({
      ...cloneData,
      title: `${cloneData.title} (Copy)`,
      status: 'pending',
      effectiveness_score: null,
      execution_count: 0,
      ...overrides
    });
  }
}
