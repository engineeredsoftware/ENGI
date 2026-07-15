import {
  BITCODE_LEDGER_STORAGE_SYNC_CONTRACT,
  BITCODE_LEDGER_STORAGE_SYNC_REPAIR_STATES,
  BITCODE_LEDGER_STORAGE_SYNC_SURFACES,
  summarizeBitcodeLedgerStorageSyncContract,
} from '@/app/bitcode-ledger-storage-sync';

describe('BITCODE_LEDGER_STORAGE_SYNC_CONTRACT', () => {
  it('binds settlement, rights, storage, wallet, and delivery readbacks without source-bearing leakage', () => {
    const summary = summarizeBitcodeLedgerStorageSyncContract();

    expect(summary).toMatchObject({
      surfaceCount: 3,
      repairStateCount: 4,
      sourceSafe: true,
      serverCustodyAdmitted: false,
      sourceBearingDeliveryVisibleBeforeSettlement: false,
      sourceBearingDeliveryVisibleAfterSettlementAndRights: true,
    });
    expect(summary.systemCount).toBeGreaterThanOrEqual(9);
    expect(summary.requiredReadbackCount).toBeGreaterThanOrEqual(12);
    expect(summary.interfaceStateCount).toBeGreaterThanOrEqual(12);
    expect(summary.evidenceFileCount).toBeGreaterThanOrEqual(8);

    expect(BITCODE_LEDGER_STORAGE_SYNC_CONTRACT.sourceSafety).toMatchObject({
      protectedSourcePayloadSerialized: false,
      unpaidAssetPackSourceVisible: false,
      rawProtectedPromptVisible: false,
      rawProviderResponseVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      privateSettlementPayloadVisible: false,
      serverCustodyAdmitted: false,
    });
  });

  it('keeps source-bearing pull-request delivery locked until settlement and BTD rights readback agree', () => {
    const delivery = BITCODE_LEDGER_STORAGE_SYNC_SURFACES.find(
      (surface) => surface.id === 'post-settlement-pull-request-delivery',
    );

    expect(delivery?.requiredReadbacks).toEqual(
      expect.arrayContaining([
        'delivery_unlock',
        'pull_request_after_settlement',
        'source_bearing_pull_request_ready',
        'rights_transfer_root',
      ]),
    );
    expect(BITCODE_LEDGER_STORAGE_SYNC_CONTRACT.deliveryBoundary).toMatchObject({
      previewVisibleBeforeSettlement: true,
      sourceBearingDeliveryVisibleBeforeSettlement: false,
      sourceBearingDeliveryVisibleWithoutBtdRights: false,
      sourceBearingDeliveryVisibleAfterSettlementAndRights: true,
      deliveryMechanism: 'pull_request_after_settlement',
    });
  });

  it('represents synchronization drift as repairable fail-closed states', () => {
    expect(BITCODE_LEDGER_STORAGE_SYNC_REPAIR_STATES).toEqual([
      'blocked_until_payment_finality',
      'blocked_until_compensation_conservation',
      'blocked_until_projection_repair',
      'blocked_until_pull_request_delivery',
    ]);
  });
});
