import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
export type BtdRegistryTable = 'btd_supply_state' | 'btd_semantic_volume_measurements' | 'btd_measure_mint_receipts' | 'btd_asset_pack_ranges' | 'btd_cells' | 'btd_ownership_events' | 'btd_read_licenses' | 'btd_mint_receipts' | 'btd_contributor_allocations' | 'btd_ancestor_edges' | 'btd_licensed_read_revenue_routes' | 'btc_fee_transactions' | 'btd_asset_pack_ledger_anchors' | 'btd_exchange_orders' | 'btd_rights_transfer_receipts' | 'btd_terminal_journal_entries' | 'btd_ledger_database_reconciliation_repairs' | 'btd_protocol_upgrade_receipts' | 'btd_crypto_telemetry_events';
export interface BtdRegistryInsertResult {
    id?: string;
    receipt_id?: string;
    order_id?: string;
    anchor_id?: string;
    journal_entry_id?: string;
    repair_id?: string;
    allocation_id?: string;
    edge_id?: string;
    payment_id?: string;
    upgrade_id?: string;
    ownership_event_id?: string;
    license_id?: string;
}
/**
 * V27 registry projection model.
 *
 * The generated database types are still V26-shaped, so this model keeps the
 * V27 table access in one typed boundary until the Supabase type generation is
 * refreshed from the V27 migration.
 */
export declare class BtdRegistryModel {
    private readonly supabase;
    constructor(supabase: SupabaseClient<Database>);
    getSupplyState(): Promise<Record<string, unknown> | null>;
    listAssetPackRanges(assetPackId?: string): Promise<Record<string, unknown>[]>;
    getAssetPackRange(assetPackId: string): Promise<Record<string, unknown> | null>;
    listOwnershipClaims(input: {
        walletId: string;
        assetPackId: string;
    }): Promise<Record<string, unknown>[]>;
    listReadLicenses(input: {
        walletId: string;
        assetPackId: string;
    }): Promise<Record<string, unknown>[]>;
    listOwnershipClaimsForWallets(input: {
        walletIds: string[];
        assetPackId?: string;
    }): Promise<Record<string, unknown>[]>;
    listReadLicensesForWallets(input: {
        walletIds: string[];
        assetPackId?: string;
    }): Promise<Record<string, unknown>[]>;
    insertSemanticVolumeMeasurement(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertMeasureMintReceipt(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertAssetPackRange(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertBtdCell(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertOwnershipEvent(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertReadLicense(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertMintReceipt(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertContributorAllocation(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertAncestorEdge(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertLicensedReadRevenueRoute(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertBtcFeeTransaction(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertLedgerAnchor(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertExchangeOrder(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    updateExchangeOrder(orderId: string, row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertRightsTransferReceipt(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertJournalEntry(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertReconciliationRepair(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertProtocolUpgradeReceipt(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    insertCryptoTelemetryEvent(row: Record<string, unknown>): Promise<BtdRegistryInsertResult>;
    private table;
    private insertReturning;
    private updateReturning;
}
