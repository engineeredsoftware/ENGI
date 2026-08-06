import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
export interface OrganizationBtdRegistrySource {
    organization_id: string;
    source: 'btd_registry';
    walletIds: string[];
    memberCount: number;
    membersWithWalletCount: number;
}
export interface OrganizationBtdRegistryRows extends OrganizationBtdRegistrySource {
    ownershipRows: Record<string, unknown>[];
    readLicenseRows: Record<string, unknown>[];
}
export declare function readOrganizationBtdRegistryRows(supabase: SupabaseClient<Database>, organizationId: string): Promise<OrganizationBtdRegistryRows>;
export declare function uniqueStrings(values: Array<string | null | undefined>): string[];
