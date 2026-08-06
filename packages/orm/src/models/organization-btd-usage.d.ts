import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
export interface OrganizationBtdReadLicenseUsage {
    organization_id: string;
    source: 'btd_registry';
    walletIds: string[];
    licenseCount: number;
    activeLicenseCount: number;
    expiredLicenseCount: number;
    revokedLicenseCount: number;
    licensedAssetPackIds: string[];
}
export declare class OrganizationBtdUsageModel {
    private readonly supabase;
    constructor(supabase: SupabaseClient<Database>);
    getByOrganizationId(organizationId: string): Promise<OrganizationBtdReadLicenseUsage>;
    getReadLicenseUsageByOrganizationId(organizationId: string, at?: Date): Promise<OrganizationBtdReadLicenseUsage>;
}
