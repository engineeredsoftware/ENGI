import {
  BTD_MAX_MINTABLE_SUPPLY,
  buildAssetPackSettlementUnlock,
  buildBtdAssetPackMintReceipt,
  buildBtdReadReceipt,
  buildBtdRightsTransferReceipt,
  buildSourceToSharesProof,
  buildSupabaseStagingTestnetProjectionReadback,
  reconcileLedgerDatabaseProjection,
  sourceToSharesProofToSettlementConservationCheck,
} from '../src';

const issuedAt = '2026-05-23T00:00:00.000Z';

describe('AssetPack economic traceability', () => {
  it('binds selected fits through preview, receipts, settlement, and reconciliation', () => {
    const readId = 'read-economic-traceability-1';
    const readRequestId = 'request-economic-traceability-1';
    const assetPackId = 'asset-pack-economic-traceability-1';
    const acceptedNeedRoot = 'sha256:accepted-need-root';
    const findingFitsResultRoot = 'sha256:finding-fits-root';
    const sourceSafePreviewRoot = 'sha256:source-safe-preview-root';
    const sourceManifestRoot = 'sha256:source-manifest-root';
    const accessPolicyHash = 'sha256:access-policy-root';
    const ledgerProjectionRoot = 'sha256:ledger-projection-root';
    const paidUnlockRoot = 'sha256:paid-unlock-root';
    const deliveryAdmissionRoot = 'sha256:delivery-admission-root';
    const btcFeeReceiptId = 'btc-fee-economic-traceability-1';
    const readLicenseId = 'read-license-economic-traceability-1';
    const depositorWalletId = 'wallet-depositor-economic';
    const readerWalletId = 'wallet-reader-economic';

    const sourceToShares = buildSourceToSharesProof({
      readId,
      assetPackId,
      acceptedNeedRoot,
      findingFitsResultRoot,
      fitDeposits: [
        {
          depositId: 'deposit-fit-alpha',
          assetPackId: 'fit-asset-alpha',
          depositorWalletId,
          sourceManifestRoot,
          findingFitsResultRoot,
          measurementRoot: 'sha256:measurement-alpha',
          normalizedMeasurementUnits: 80_000n,
          fitQualityBps: 9_200,
          provenanceBps: 10_000,
          accepted: true,
        },
        {
          depositId: 'deposit-fit-beta',
          assetPackId: 'fit-asset-beta',
          depositorWalletId: 'wallet-depositor-beta',
          sourceManifestRoot: 'sha256:source-manifest-beta',
          findingFitsResultRoot,
          measurementRoot: 'sha256:measurement-beta',
          normalizedMeasurementUnits: 20_000n,
          fitQualityBps: 8_500,
          provenanceBps: 9_500,
          accepted: true,
        },
      ],
      btdRange: {
        assetPackId,
        rangeStart: 500,
        rangeEndExclusive: 504,
        tokenCount: 4,
        rangeRoot: 'sha256:range-root',
        measureMintReceiptRoot: 'sha256:measuremint-root',
      },
      feeQuote: {
        quoteId: 'quote-economic-traceability-1',
        quoteRoot: 'sha256:fee-quote-root',
        grossSats: 12_345n,
      },
      paymentObservation: {
        paymentReceiptRoot: btcFeeReceiptId,
        observedDebitSats: 12_345n,
        observedCreditSats: 12_345n,
        finalityState: 'confirmed',
        txid: 'txid-economic-traceability-1',
      },
      issuedAt,
    });

    expect(sourceToShares.contributionWeights.reduce((sum, entry) => sum + entry.shareBps, 0)).toBe(10_000);
    expect(sourceToShares.settlementAllocations.reduce((sum, entry) => sum + entry.allocatedSats, 0n)).toBe(12_345n);
    expect(sourceToShares.settlementConservation.settlementAdmissible).toBe(true);

    const assetPackMintReceipt = buildBtdAssetPackMintReceipt({
      mintReceipt: {
        kind: 'btd.asset_pack_mint',
        assetPackId,
        rangeStart: 500,
        rangeEndExclusive: 504,
        tokenCount: 4,
        totalMintedBefore: 500,
        totalMintedAfter: 504,
        maxSupply: BTD_MAX_MINTABLE_SUPPLY,
        sourceManifestRoot,
        measurementReceiptRoot: 'sha256:measurement-receipt-root',
        fitReceiptRoot: findingFitsResultRoot,
        proofRoot: 'sha256:assetpack-proof-root',
        settlementJournalRoot: 'sha256:settlement-journal-root',
        dedupeReceiptRoot: 'sha256:dedupe-root',
        exchangeReceiptRoot: 'sha256:exchange-root',
        accessPolicyId: 'access-policy-economic-traceability',
        accessPolicyHash,
        mintedAtExchangeSequence: 1000n,
        issuedAt,
      },
      readId,
      depositorWalletId,
      sourceSafePreviewRoot,
      findingFitsResultRoot,
      settlementConservationRoot: sourceToShares.settlementConservation.conservationRoot,
      ledgerProjectionRoot,
      issuedAt,
    });
    expect(assetPackMintReceipt.protectedSourceVisible).toBe(false);
    expect(assetPackMintReceipt.findingFitsResultRoot).toBe(findingFitsResultRoot);
    expect(assetPackMintReceipt.sourceSafePreviewRoot).toBe(sourceSafePreviewRoot);

    const previewReadReceipt = buildBtdReadReceipt({
      assetPackId,
      readId,
      readRequestId,
      acceptedNeedRoot,
      findingFitsResultRoot,
      readerWalletId,
      depositorWalletId,
      rangeStart: 500,
      rangeEndExclusive: 504,
      sourceManifestRoot,
      sourceSafePreviewRoot,
      accessPolicyHash,
      disclosureState: 'source_safe_preview',
      readRightState: 'none',
      deliveryAdmissionState: 'blocked',
      ledgerProjectionRoot,
      protectedSourceVisible: false,
      issuedAt,
    });
    expect(previewReadReceipt.protectedSourceVisible).toBe(false);
    expect(previewReadReceipt.paidUnlockRoot).toBeNull();

    const rightsTransferReceipt = buildBtdRightsTransferReceipt({
      orderId: 'order-economic-traceability-1',
      assetPackId,
      rangeStart: 500,
      rangeEndExclusive: 504,
      fromWalletId: depositorWalletId,
      toWalletId: readerWalletId,
      readerWalletId,
      depositorWalletId,
      priceSats: 12_345n,
      accessPolicyHash,
      btcFeeReceiptId,
      btcFeeFinalityState: 'confirmed',
      readLicenseId,
      sourceSafePreviewRoot,
      paidUnlockRoot,
      deliveryAdmissionRoot,
      ledgerAnchorId: 'ledger-anchor-economic-traceability-1',
      ledgerProjectionRoot,
      exchangeSequence: 1001n,
      issuedAt,
    });
    expect(rightsTransferReceipt.protectedSourceVisible).toBe(true);
    expect(rightsTransferReceipt.deliveryAdmissionState).toBe('admitted');

    const paidReadReceipt = buildBtdReadReceipt({
      assetPackId,
      readId,
      readRequestId,
      acceptedNeedRoot,
      findingFitsResultRoot,
      readerWalletId,
      depositorWalletId,
      rangeStart: 500,
      rangeEndExclusive: 504,
      sourceManifestRoot,
      sourceSafePreviewRoot,
      accessPolicyHash,
      disclosureState: 'paid_unlocked',
      readRightState: 'licensed_read',
      paidUnlockRoot,
      deliveryAdmissionState: 'admitted',
      deliveryAdmissionRoot,
      ledgerProjectionRoot,
      protectedSourceVisible: true,
      issuedAt,
    });
    expect(paidReadReceipt.paidUnlockRoot).toBe(paidUnlockRoot);
    expect(paidReadReceipt.deliveryAdmissionRoot).toBe(deliveryAdmissionRoot);

    const unlock = buildAssetPackSettlementUnlock({
      ledgerSettlement: {
        status: 'settled',
        settlementAdmissible: true,
        assetPackId,
        ledgerAnchorId: 'ledger-anchor-economic-traceability-1',
        btcFeeReceiptId,
        ownershipEventId: 'ownership-event-economic-traceability-1',
        readLicenseId,
        depositorWalletId,
        readerWalletId,
        readback: {
          semanticMeasurement: true,
          measureMintReceipt: true,
          assetPackRange: true,
          btdCell: true,
          ownershipEvent: true,
          readLicense: true,
          mintReceipt: true,
          btcFeeTransaction: true,
          ledgerAnchor: true,
          terminalJournal: true,
          cryptoTelemetry: true,
        },
      },
      pullRequestTarget: 'https://github.com/octocat/Spoon-Knife/pull/3808',
    });
    expect(unlock).toMatchObject({
      state: 'licensed_read',
      sourceAvailable: true,
      missingReadbackKeys: [],
    });

    const readback = buildSupabaseStagingTestnetProjectionReadback({
      readbackId: 'readback-economic-traceability-1',
      lane: 'staging-testnet',
      supabaseProjectRef: 'tkpyosihuouusyaxtbau',
      restHost: 'tkpyosihuouusyaxtbau.supabase.co',
      adminCredentialState: 'provided_out_of_band',
      tableReadbacks: [
        {
          table: 'btd_asset_pack_ranges',
          expectedCount: 1,
          observedCount: 1,
          synchronized: true,
        },
      ],
      issuedAt,
    });
    const reconciliation = reconcileLedgerDatabaseProjection({
      reconciliationId: 'reconciliation-economic-traceability-1',
      ledgerFacts: [
        {
          factId: assetPackId,
          ledgerRoot: 'sha256:assetpack-ledger-root',
          finalityState: 'confirmed',
        },
      ],
      databaseFacts: [
        {
          factId: assetPackId,
          projectedLedgerRoot: 'sha256:assetpack-ledger-root',
          projectedFinalityState: 'confirmed',
          projectedObjectStorageRoot: sourceSafePreviewRoot,
        },
      ],
      objectStorageArtifacts: [
        {
          factId: assetPackId,
          artifactId: 'source-safe-preview-economic-traceability-1',
          artifactKind: 'asset_pack_source_safe_preview',
          storageRoot: sourceSafePreviewRoot,
          manifestRoot: sourceManifestRoot,
          sourceVisibility: 'source_safe',
          durable: true,
          containsProtectedSource: false,
          encrypted: false,
        },
      ],
      stagingTestnetReadback: readback,
      settlementConservationChecks: [
        sourceToSharesProofToSettlementConservationCheck(sourceToShares),
      ],
      issuedAt,
    });

    expect(reconciliation.state).toBe('aligned');
    expect(reconciliation.blocking).toBe(false);
    expect(reconciliation.settlementConservation.status).toBe('balanced');
    expect(reconciliation.repairs).toEqual([]);
    expect(reconciliation.stagingTestnetReadback?.secretValuesStored).toBe(false);
  });
});
