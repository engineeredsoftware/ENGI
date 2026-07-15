import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

export type BtdRegistryTable =
  | 'btd_supply_state'
  | 'btd_semantic_volume_measurements'
  | 'btd_measure_mint_receipts'
  | 'btd_asset_pack_ranges'
  | 'btd_cells'
  | 'btd_ownership_events'
  | 'btd_read_licenses'
  | 'btd_mint_receipts'
  | 'btd_contributor_allocations'
  | 'btd_ancestor_edges'
  | 'btd_licensed_read_revenue_routes'
  | 'btc_fee_transactions'
  | 'btd_asset_pack_ledger_anchors'
  | 'btd_exchange_orders'
  | 'btd_rights_transfer_receipts'
  | 'btd_terminal_journal_entries'
  | 'btd_ledger_database_reconciliation_repairs'
  | 'btd_protocol_upgrade_receipts'
  | 'btd_crypto_telemetry_events';

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
export class BtdRegistryModel {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getSupplyState(): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.table('btd_supply_state')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    if (error) throw error;
    return data ?? null;
  }

  async listAssetPackRanges(assetPackId?: string): Promise<Record<string, unknown>[]> {
    let query = this.table('btd_asset_pack_ranges').select('*').order('range_start');

    if (assetPackId) {
      query = query.eq('asset_pack_id', assetPackId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  async getAssetPackRange(assetPackId: string): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.table('btd_asset_pack_ranges')
      .select('*')
      .eq('asset_pack_id', assetPackId)
      .maybeSingle();

    if (error) throw error;
    return data ?? null;
  }

  async listOwnershipClaims(input: {
    walletId: string;
    assetPackId: string;
  }): Promise<Record<string, unknown>[]> {
    const { data, error } = await this.table('btd_ownership_events')
      .select('*')
      .eq('to_wallet_id', input.walletId)
      .eq('asset_pack_id', input.assetPackId)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async listReadLicenses(input: {
    walletId: string;
    assetPackId: string;
  }): Promise<Record<string, unknown>[]> {
    const { data, error } = await this.table('btd_read_licenses')
      .select('*')
      .eq('wallet_id', input.walletId)
      .eq('asset_pack_id', input.assetPackId)
      .order('valid_from', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async listOwnershipClaimsForWallets(input: {
    walletIds: string[];
    assetPackId?: string;
  }): Promise<Record<string, unknown>[]> {
    const walletIds = uniqueStrings(input.walletIds);
    if (walletIds.length === 0) {
      return [];
    }

    let query = this.table('btd_ownership_events')
      .select('*')
      .in('to_wallet_id', walletIds)
      .order('issued_at', { ascending: false });

    if (input.assetPackId) {
      query = query.eq('asset_pack_id', input.assetPackId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  async listReadLicensesForWallets(input: {
    walletIds: string[];
    assetPackId?: string;
  }): Promise<Record<string, unknown>[]> {
    const walletIds = uniqueStrings(input.walletIds);
    if (walletIds.length === 0) {
      return [];
    }

    let query = this.table('btd_read_licenses')
      .select('*')
      .in('wallet_id', walletIds)
      .order('valid_from', { ascending: false });

    if (input.assetPackId) {
      query = query.eq('asset_pack_id', input.assetPackId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  insertSemanticVolumeMeasurement(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_semantic_volume_measurements', row);
  }

  insertMeasureMintReceipt(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_measure_mint_receipts', row);
  }

  insertAssetPackRange(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_asset_pack_ranges', row);
  }

  insertBtdCell(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_cells', row);
  }

  insertOwnershipEvent(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_ownership_events', row);
  }

  insertReadLicense(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_read_licenses', row);
  }

  insertMintReceipt(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_mint_receipts', row);
  }

  insertContributorAllocation(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_contributor_allocations', row);
  }

  insertAncestorEdge(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_ancestor_edges', row);
  }

  insertLicensedReadRevenueRoute(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_licensed_read_revenue_routes', row);
  }

  insertBtcFeeTransaction(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btc_fee_transactions', row);
  }

  insertLedgerAnchor(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_asset_pack_ledger_anchors', row);
  }

  insertExchangeOrder(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_exchange_orders', row);
  }

  updateExchangeOrder(orderId: string, row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.updateReturning('btd_exchange_orders', 'order_id', orderId, row);
  }

  insertRightsTransferReceipt(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_rights_transfer_receipts', row);
  }

  insertJournalEntry(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_terminal_journal_entries', row);
  }

  insertReconciliationRepair(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_ledger_database_reconciliation_repairs', row);
  }

  insertProtocolUpgradeReceipt(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_protocol_upgrade_receipts', row);
  }

  insertCryptoTelemetryEvent(row: Record<string, unknown>): Promise<BtdRegistryInsertResult> {
    return this.insertReturning('btd_crypto_telemetry_events', row);
  }

  private table(tableName: BtdRegistryTable): any {
    return (this.supabase as any).from(tableName);
  }

  private async insertReturning(
    tableName: BtdRegistryTable,
    row: Record<string, unknown>,
  ): Promise<BtdRegistryInsertResult> {
    const { data, error } = await this.table(tableName).insert(row).select().single();
    if (error) throw error;
    return data ?? {};
  }

  private async updateReturning(
    tableName: BtdRegistryTable,
    column: string,
    value: string,
    row: Record<string, unknown>,
  ): Promise<BtdRegistryInsertResult> {
    const { data, error } = await this.table(tableName)
      .update(row)
      .eq(column, value)
      .select()
      .single();

    if (error) throw error;
    return data ?? {};
  }
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean),
    ),
  );
}
