import {
  advanceBtcFeeQuote,
  advanceBtcFeeTransactionReceipt,
  applyAssetPackSettlementUnlockToPreview,
  assertBtdRightsTransferReceipt,
  assertSourceToSharesSettlementAdmissible,
  buildAssetPackSettlementUnlock,
  buildBtcFeeOperationPosture,
  buildBtcFeeQuote,
  buildBtdAssetPackMintReceipt,
  buildBtdMintDraft,
  buildBtdReadReceipt,
  buildBtdRightsTransferReceipt,
  buildPreparedBtcFeeTransactionReceipt,
  buildSourceToSharesProof,
  buildSupabaseStagingTestnetProjectionReadback,
  createBtdMeasureMintState,
  createWalletSignerSession,
  reconcileLedgerDatabaseProjection,
  REQUIRED_ASSET_PACK_SETTLEMENT_READBACK_KEYS,
  sourceToSharesProofToSettlementConservationCheck,
} from '../src';

const issuedAt = '2026-05-22T00:00:00.000Z';
const expiresAt = '2026-05-22T00:30:00.000Z';

function authorizedSession(overrides: Record<string, unknown> = {}) {
  return createWalletSignerSession({
    walletSessionId: 'wallet-session-v32-gate5',
    walletId: 'wallet-reader-v32-gate5',
    userId: 'reader-v32-gate5',
    address: 'tb1qbitcodereaderv32gate500000000000000000',
    network: 'testnet',
    nonce: 'nonce-v32-gate5',
    capabilities: ['psbt_sign', 'message_sign', 'rights_transfer'],
    authorizationProof: {
      proofKind: 'message_signature',
      message: 'Authorize Bitcode BTC fee settlement for V32 Gate 5.',
      signature: 'signature-v32-gate5',
      verifiedAt: issuedAt,
    },
    expiresAt,
    ...overrides,
  });
}

function acceptedQuote(overrides: Record<string, unknown> = {}) {
  return advanceBtcFeeQuote(
    buildBtcFeeQuote({
      quoteId: 'quote-v32-gate5',
      feePurpose: 'licensed_read',
      network: 'testnet',
      sats: 1200n,
      satsPerVbyte: 4,
      measurementRoot: 'measurement-root-v32-gate5',
      relatedAssetPackId: 'asset-pack-v32-gate5',
      issuedAt,
      expiresAt,
      ...overrides,
    }),
    { state: 'accepted' },
  );
}

function preparedReceipt() {
  return buildPreparedBtcFeeTransactionReceipt({
    receiptId: 'btc-fee-v32-gate5',
    feePurpose: 'licensed_read',
    payerSession: authorizedSession(),
    psbt: 'cHNidP8BAHECAAAAA',
    satsPaid: 1200n,
    satsPerVbyte: 4,
    exchangeSequence: 52n,
    terminalJournalRoot: 'terminal-journal-root-v32-gate5',
    relatedAssetPackId: 'asset-pack-v32-gate5',
    relatedOrderId: 'order-v32-gate5',
    issuedAt,
  });
}

function receiptAt(finalityState: 'prepared' | 'signed' | 'broadcast' | 'confirmed' | 'replaced' | 'reorged' | 'failed') {
  const prepared = preparedReceipt();
  if (finalityState === 'prepared') return prepared;
  const signed = advanceBtcFeeTransactionReceipt(prepared, {
    finalityState: 'signed',
    psbt: 'signed-psbt-v32-gate5',
  });
  if (finalityState === 'signed') return signed;
  if (finalityState === 'failed') {
    return advanceBtcFeeTransactionReceipt(signed, { finalityState: 'failed' });
  }
  const broadcast = advanceBtcFeeTransactionReceipt(signed, {
    finalityState: 'broadcast',
    txid: 'txid-v32-gate5',
  });
  if (finalityState === 'broadcast') return broadcast;
  return advanceBtcFeeTransactionReceipt(broadcast, {
    finalityState,
    txid:
      finalityState === 'confirmed'
        ? 'txid-v32-gate5'
        : `${finalityState}-txid-v32-gate5`,
    confirmations: finalityState === 'confirmed' ? 6 : 0,
  });
}

function sourceToSharesProof(overrides: Record<string, unknown> = {}) {
  return buildSourceToSharesProof({
    readId: 'read-v32-gate5',
    assetPackId: 'asset-pack-v32-gate5',
    acceptedNeedRoot: 'accepted-need-root-v32-gate5',
    findingFitsResultRoot: 'finding-fits-root-v32-gate5',
    fitDeposits: [
      {
        depositId: 'deposit-v32-gate5-a',
        assetPackId: 'fit-asset-v32-gate5-a',
        depositorWalletId: 'wallet-depositor-v32-gate5-a',
        sourceManifestRoot: 'source-root-v32-gate5-a',
        findingFitsResultRoot: 'finding-fits-root-v32-gate5-a',
        measurementRoot: 'measurement-root-v32-gate5-a',
        normalizedMeasurementUnits: 30_000n,
        fitQualityBps: 10_000,
        provenanceBps: 10_000,
        accepted: true,
      },
      {
        depositId: 'deposit-v32-gate5-b',
        assetPackId: 'fit-asset-v32-gate5-b',
        depositorWalletId: 'wallet-depositor-v32-gate5-b',
        sourceManifestRoot: 'source-root-v32-gate5-b',
        findingFitsResultRoot: 'finding-fits-root-v32-gate5-b',
        measurementRoot: 'measurement-root-v32-gate5-b',
        normalizedMeasurementUnits: 10_000n,
        fitQualityBps: 10_000,
        provenanceBps: 10_000,
        accepted: true,
      },
    ],
    btdRange: {
      assetPackId: 'asset-pack-v32-gate5',
      rangeStart: 100,
      rangeEndExclusive: 104,
      tokenCount: 4,
      rangeRoot: 'range-root-v32-gate5',
      measureMintReceiptRoot: 'measuremint-root-v32-gate5',
    },
    feeQuote: {
      quoteId: 'quote-v32-gate5',
      quoteRoot: 'quote-root-v32-gate5',
      grossSats: 1200n,
    },
    paymentObservation: {
      paymentReceiptRoot: 'payment-root-v32-gate5',
      observedDebitSats: 1200n,
      observedCreditSats: 1200n,
      finalityState: 'confirmed',
      txid: 'txid-v32-gate5',
    },
    issuedAt,
    ...overrides,
  });
}

function settledReadback() {
  return Object.fromEntries(
    REQUIRED_ASSET_PACK_SETTLEMENT_READBACK_KEYS.map((key) => [key, true]),
  );
}

describe('V32 Gate 5 ledger BTD settlement failure-state coverage', () => {
  it('covers BTC quote, PSBT, broadcast, finality, replacement, reorg, and failure phases', () => {
    const quoted = buildBtcFeeOperationPosture({
      quote: acceptedQuote(),
      payerSession: authorizedSession(),
      at: issuedAt,
    });
    expect(quoted).toMatchObject({
      phase: 'quoted',
      canPreparePsbt: true,
      canSettle: false,
      noServerCustody: true,
    });

    expect(
      ['prepared', 'signed', 'broadcast', 'confirmed', 'replaced', 'reorged', 'failed'].map(
        (finalityState) =>
          buildBtcFeeOperationPosture({
            quote: acceptedQuote({ quoteId: `quote-${finalityState}` }),
            receipt: receiptAt(finalityState as ReturnType<typeof receiptAt>['finalityState']),
            payerSession: authorizedSession(),
            at: issuedAt,
          }).phase,
      ),
    ).toEqual(['psbt_ready', 'signed', 'broadcast', 'confirmed', 'replaced', 'reorged', 'failed']);

    const confirmed = buildBtcFeeOperationPosture({
      quote: acceptedQuote({ quoteId: 'quote-confirmed-settle' }),
      receipt: receiptAt('confirmed'),
      payerSession: authorizedSession(),
      at: issuedAt,
    });
    expect(confirmed).toMatchObject({
      canSettle: true,
      psbtHandoffState: 'finality_observed',
      broadcastState: 'confirmed',
    });
  });

  it('fails closed with actionable BTC blocked-readiness receipts', () => {
    const blockers = [
      buildBtcFeeOperationPosture({
        quote: acceptedQuote({ quoteId: 'quote-missing-session' }),
        at: issuedAt,
      }).blockedReadiness?.blockerId,
      buildBtcFeeOperationPosture({
        quote: acceptedQuote({ quoteId: 'quote-network-mismatch' }),
        payerSession: authorizedSession({ network: 'signet' }),
        at: issuedAt,
      }).blockedReadiness?.blockerId,
      buildBtcFeeOperationPosture({
        quote: acceptedQuote({ quoteId: 'quote-capability-missing' }),
        payerSession: authorizedSession({ capabilities: ['message_sign'] }),
        at: issuedAt,
      }).blockedReadiness?.blockerId,
      buildBtcFeeOperationPosture({
        quote: acceptedQuote({ quoteId: 'quote-server-custody' }),
        payerSession: {
          ...authorizedSession(),
          serverCustody: true,
        } as never,
        at: issuedAt,
      }).blockedReadiness?.blockerId,
      buildBtcFeeOperationPosture({
        quote: acceptedQuote({ network: 'mainnet', quoteId: 'quote-mainnet-blocked' }),
        payerSession: authorizedSession({
          walletSessionId: 'wallet-session-mainnet-v32-gate5',
          walletId: 'wallet-mainnet-v32-gate5',
          address: 'bc1qbitcodereaderv32gate500000000000000000',
          network: 'mainnet',
        }),
        environment: 'production-mainnet',
        at: issuedAt,
      }).blockedReadiness?.blockerId,
      buildBtcFeeOperationPosture({
        payerSession: authorizedSession(),
        at: issuedAt,
      }).blockedReadiness?.blockerId,
      buildBtcFeeOperationPosture({
        quote: acceptedQuote({
          quoteId: 'quote-expired-v32-gate5',
          issuedAt: '2026-05-22T00:00:00.000Z',
          expiresAt: '2026-05-22T00:01:00.000Z',
        }),
        payerSession: authorizedSession(),
        at: '2026-05-22T00:02:00.000Z',
      }).blockedReadiness?.blockerId,
      buildBtcFeeOperationPosture({
        quote: buildBtcFeeQuote({
          quoteId: 'quote-not-accepted-v32-gate5',
          feePurpose: 'licensed_read',
          network: 'testnet',
          sats: 1200n,
          measurementRoot: 'measurement-root-v32-gate5',
          issuedAt,
          expiresAt,
        }),
        payerSession: authorizedSession(),
        at: issuedAt,
      }).blockedReadiness?.blockerId,
    ];

    expect(blockers).toEqual([
      'wallet-signer-session',
      'wallet-network',
      'wallet-capability',
      'wallet-server-custody',
      'network-policy',
      'fee-quote',
      'fee-quote-expired',
      'fee-quote-not-accepted',
    ]);
  });

  it('keeps BTD receipt mint/read/rights-transfer boundaries source-safe until paid finality', () => {
    const mintDraft = buildBtdMintDraft({
      assetPackId: 'asset-pack-v32-gate5',
      readId: 'read-v32-gate5',
      acceptedNeed: true,
      acceptedFit: true,
      sourceManifestRoot: 'source-root-v32-gate5',
      fitReceiptRoot: 'fit-root-v32-gate5',
      proofRoot: 'proof-root-v32-gate5',
      dedupeReceiptRoot: 'dedupe-root-v32-gate5',
      settlementJournalRoot: 'settlement-root-v32-gate5',
      exchangeReceiptRoot: 'exchange-root-v32-gate5',
      accessPolicyId: 'policy-v32-gate5',
      accessPolicyHash: 'policy-hash-v32-gate5',
      semanticUnits: [
        {
          unitId: 'unit-v32-gate5',
          proofReceiptRoot: 'unit-proof-root-v32-gate5',
          dedupeReceiptRoot: 'unit-dedupe-root-v32-gate5',
          fitAccepted: true,
          normalizedUnits: 10_000n,
        },
      ],
      measureMintState: createBtdMeasureMintState({ curveParameter: 10_000n }),
      exchangeSequence: 52n,
      actorId: 'actor-v32-gate5',
      issuedAt,
      depositorWalletId: 'wallet-depositor-v32-gate5',
      sourceSafePreviewRoot: 'source-safe-preview-root-v32-gate5',
      findingFitsResultRoot: 'finding-fits-root-v32-gate5',
      settlementConservationRoot: 'settlement-conservation-root-v32-gate5',
      ledgerProjectionRoot: 'ledger-projection-root-v32-gate5',
    });
    const mintReceipt = buildBtdAssetPackMintReceipt({
      mintReceipt: mintDraft.mintReceipt!,
      readId: 'read-v32-gate5',
      depositorWalletId: 'wallet-depositor-v32-gate5',
      sourceSafePreviewRoot: 'source-safe-preview-root-v32-gate5',
      findingFitsResultRoot: 'finding-fits-root-v32-gate5',
      settlementConservationRoot: 'settlement-conservation-root-v32-gate5',
      ledgerProjectionRoot: 'ledger-projection-root-v32-gate5',
      issuedAt,
    });
    const previewRead = buildBtdReadReceipt({
      assetPackId: 'asset-pack-v32-gate5',
      readId: 'read-v32-gate5',
      readRequestId: 'read-request-v32-gate5',
      acceptedNeedRoot: 'accepted-need-root-v32-gate5',
      findingFitsResultRoot: 'finding-fits-root-v32-gate5',
      readerWalletId: 'wallet-reader-v32-gate5',
      depositorWalletId: 'wallet-depositor-v32-gate5',
      rangeStart: mintReceipt.rangeStart,
      rangeEndExclusive: mintReceipt.rangeEndExclusive,
      sourceManifestRoot: 'source-root-v32-gate5',
      sourceSafePreviewRoot: 'source-safe-preview-root-v32-gate5',
      accessPolicyHash: 'policy-hash-v32-gate5',
      disclosureState: 'source_safe_preview',
      readRightState: 'none',
      deliveryAdmissionState: 'blocked',
      ledgerProjectionRoot: 'ledger-projection-root-v32-gate5',
      issuedAt,
    });

    expect(mintReceipt).toMatchObject({
      disclosureState: 'source_safe_preview',
      protectedSourceVisible: false,
    });
    expect(previewRead).toMatchObject({
      disclosureState: 'source_safe_preview',
      protectedSourceVisible: false,
      paidUnlockRoot: null,
    });
    expect(() =>
      buildBtdReadReceipt({
        ...previewRead,
        protectedSourceVisible: true,
      }),
    ).toThrow('Protected source cannot be visible before paid unlock.');
    expect(() =>
      buildBtdRightsTransferReceipt({
        orderId: 'order-v32-gate5',
        assetPackId: 'asset-pack-v32-gate5',
        rangeStart: mintReceipt.rangeStart,
        rangeEndExclusive: mintReceipt.rangeEndExclusive,
        fromWalletId: 'wallet-depositor-v32-gate5',
        toWalletId: 'wallet-reader-v32-gate5',
        readerWalletId: 'wallet-reader-v32-gate5',
        depositorWalletId: 'wallet-depositor-v32-gate5',
        priceSats: 1200n,
        accessPolicyHash: 'policy-hash-v32-gate5',
        btcFeeReceiptId: 'btc-fee-v32-gate5',
        btcFeeFinalityState: 'broadcast',
        readLicenseId: 'read-license-v32-gate5',
        sourceSafePreviewRoot: 'source-safe-preview-root-v32-gate5',
        paidUnlockRoot: 'paid-unlock-root-v32-gate5',
        deliveryAdmissionRoot: 'delivery-admission-root-v32-gate5',
        ledgerAnchorId: 'ledger-anchor-v32-gate5',
        ledgerProjectionRoot: 'ledger-projection-root-v32-gate5',
        exchangeSequence: 53n,
        issuedAt,
      }),
    ).toThrow('Rights transfer receipt requires confirmed BTC fee finality.');

    const transfer = buildBtdRightsTransferReceipt({
      orderId: 'order-v32-gate5',
      assetPackId: 'asset-pack-v32-gate5',
      rangeStart: mintReceipt.rangeStart,
      rangeEndExclusive: mintReceipt.rangeEndExclusive,
      fromWalletId: 'wallet-depositor-v32-gate5',
      toWalletId: 'wallet-reader-v32-gate5',
      readerWalletId: 'wallet-reader-v32-gate5',
      depositorWalletId: 'wallet-depositor-v32-gate5',
      priceSats: 1200n,
      accessPolicyHash: 'policy-hash-v32-gate5',
      btcFeeReceiptId: 'btc-fee-v32-gate5',
      btcFeeFinalityState: 'confirmed',
      readLicenseId: 'read-license-v32-gate5',
      sourceSafePreviewRoot: 'source-safe-preview-root-v32-gate5',
      paidUnlockRoot: 'paid-unlock-root-v32-gate5',
      deliveryAdmissionRoot: 'delivery-admission-root-v32-gate5',
      ledgerAnchorId: 'ledger-anchor-v32-gate5',
      ledgerProjectionRoot: 'ledger-projection-root-v32-gate5',
      exchangeSequence: 53n,
      issuedAt,
    });

    expect(assertBtdRightsTransferReceipt(transfer)).toMatchObject({
      btcFeeFinalityState: 'confirmed',
      deliveryAdmissionState: 'admitted',
      protectedSourceVisible: true,
    });
  });

  it('proves source-to-shares conservation and feeds settlement drift into reconciliation', () => {
    const balanced = sourceToSharesProof();
    expect(assertSourceToSharesSettlementAdmissible(balanced).settlementConservation).toMatchObject({
      state: 'balanced',
      settlementAdmissible: true,
    });
    expect(balanced.settlementAllocations.map((allocation) => allocation.allocatedSats)).toEqual([
      900n,
      300n,
    ]);

    const underpaid = sourceToSharesProof({
      paymentObservation: {
        paymentReceiptRoot: 'payment-root-underpaid-v32-gate5',
        observedDebitSats: 1199n,
        observedCreditSats: 1199n,
        finalityState: 'confirmed',
      },
    });
    expect(underpaid.settlementConservation).toMatchObject({
      state: 'underpayment',
      settlementAdmissible: false,
    });
    expect(() => assertSourceToSharesSettlementAdmissible(underpaid)).toThrow(/not admissible/);

    const report = reconcileLedgerDatabaseProjection({
      reconciliationId: 'reconciliation-source-to-shares-v32-gate5',
      ledgerFacts: [],
      databaseFacts: [],
      settlementConservationChecks: [
        sourceToSharesProofToSettlementConservationCheck(underpaid),
      ],
      issuedAt,
    });
    expect(report).toMatchObject({
      state: 'blocked',
      blocking: true,
      driftKindCounts: {
        settlement_conservation_drift: 1,
      },
    });
    expect(report.repairActions[0]).toMatchObject({
      actionKind: 'pause_settlement_unlock',
      requiresOperatorApproval: true,
    });
  });

  it('classifies ledger, database, object-storage, staging, and conservation projection repair states', () => {
    const stagingReadback = buildSupabaseStagingTestnetProjectionReadback({
      readbackId: 'readback-v32-gate5',
      lane: 'staging-testnet',
      supabaseProjectRef: 'tkpyosihuouusyaxtbau',
      restHost: 'tkpyosihuouusyaxtbau.supabase.co',
      adminCredentialState: 'missing',
      tableReadbacks: [
        {
          table: 'btd_terminal_journal_entries',
          expectedCount: 4,
          observedCount: 3,
          synchronized: false,
        },
      ],
      issuedAt,
    });
    const report = reconcileLedgerDatabaseProjection({
      reconciliationId: 'reconciliation-v32-gate5',
      ledgerFacts: [
        {
          factId: 'missing-database-v32-gate5',
          ledgerRoot: 'sha256:ledger-root-missing-database',
          finalityState: 'confirmed',
        },
        {
          factId: 'ledger-root-mismatch-v32-gate5',
          ledgerRoot: 'sha256:ledger-root-true',
          finalityState: 'confirmed',
        },
        {
          factId: 'ledger-finality-mismatch-v32-gate5',
          ledgerRoot: 'sha256:ledger-root-finality',
          finalityState: 'reorged',
        },
      ],
      databaseFacts: [
        {
          factId: 'ledger-root-mismatch-v32-gate5',
          projectedLedgerRoot: 'sha256:ledger-root-stale',
          projectedFinalityState: 'confirmed',
        },
        {
          factId: 'ledger-finality-mismatch-v32-gate5',
          projectedLedgerRoot: 'sha256:ledger-root-finality',
          projectedFinalityState: 'broadcast',
        },
        {
          factId: 'orphan-database-v32-gate5',
          projectedLedgerRoot: 'sha256:orphan-ledger-root',
          projectedFinalityState: 'prepared',
        },
        {
          factId: 'object-root-mismatch-v32-gate5',
          projectedLedgerRoot: 'sha256:object-ledger-root',
          projectedFinalityState: 'confirmed',
          projectedObjectStorageRoot: 'sha256:database-storage-root',
        },
      ],
      objectStorageArtifacts: [
        {
          factId: 'object-missing-v32-gate5',
          artifactId: 'artifact-missing-v32-gate5',
          artifactKind: 'pipeline_evidence',
          storageRoot: 'sha256:artifact-root',
          sourceVisibility: 'proof_public',
          durable: false,
          containsProtectedSource: false,
          encrypted: false,
        },
        {
          factId: 'object-root-mismatch-v32-gate5',
          artifactId: 'artifact-root-mismatch-v32-gate5',
          artifactKind: 'delivery_manifest',
          storageRoot: 'sha256:artifact-storage-root',
          sourceVisibility: 'proof_public',
          durable: true,
          containsProtectedSource: false,
          encrypted: false,
        },
        {
          factId: 'protected-source-v32-gate5',
          artifactId: 'protected-source-v32-gate5',
          artifactKind: 'asset_pack_protected_source_encrypted',
          storageRoot: 'sha256:protected-source-root',
          sourceVisibility: 'encrypted_protected_source',
          durable: true,
          containsProtectedSource: true,
          encrypted: true,
        },
      ],
      stagingTestnetReadback: stagingReadback,
      settlementConservationChecks: [
        {
          checkId: 'settlement-drift-v32-gate5',
          expectedDebitSats: 1200,
          observedDebitSats: 1199,
          expectedCreditSats: 1200,
          observedCreditSats: 1199,
          feeQuoteRoot: 'quote-root-v32-gate5',
          paymentReceiptRoot: 'payment-root-v32-gate5',
        },
      ],
      issuedAt,
    });

    expect(stagingReadback).toMatchObject({
      state: 'blocked',
      secretValuesStored: false,
    });
    expect(report.state).toBe('blocked');
    expect(report.driftKindCounts).toMatchObject({
      missing_database_projection: 1,
      ledger_root_mismatch: 1,
      ledger_finality_mismatch: 1,
      database_orphan_projection: 1,
      missing_object_storage_artifact: 1,
      object_storage_root_mismatch: 1,
      staging_testnet_readback_blocked: 1,
      settlement_conservation_drift: 1,
    });
    expect(report.repairActions.map((action) => action.actionKind)).toEqual(
      expect.arrayContaining([
        'project_ledger_fact',
        'pause_settlement_unlock',
        'quarantine_database_projection',
        'retry_object_storage_write',
        'quarantine_object_storage_artifact',
        'retry_staging_testnet_readback',
      ]),
    );
    expect(report.objectStorageArtifacts.find((artifact) => artifact.containsProtectedSource)).toMatchObject({
      sourceVisibility: 'encrypted_protected_source',
      encrypted: true,
    });
  });

  it('withholds AssetPack source until settlement readback and PR delivery agree', () => {
    const pending = buildAssetPackSettlementUnlock({
      ledgerSettlement: {
        status: 'settled',
        settlementAdmissible: true,
        assetPackId: 'asset-pack-v32-gate5',
        btcFeeReceiptId: 'btc-fee-v32-gate5',
        readback: {
          semanticMeasurement: true,
        },
      },
      pullRequestTarget: null,
    });
    expect(pending).toMatchObject({
      state: 'pending_settlement',
      sourceAvailable: false,
      deliveryAvailable: false,
    });
    expect(pending.missingReadbackKeys).toEqual(
      REQUIRED_ASSET_PACK_SETTLEMENT_READBACK_KEYS.filter(
        (key) => key !== 'semanticMeasurement',
      ),
    );

    const unlocked = buildAssetPackSettlementUnlock({
      ledgerSettlement: {
        status: 'settled',
        settlementAdmissible: true,
        assetPackId: 'asset-pack-v32-gate5',
        btcFeeReceiptId: 'btc-fee-v32-gate5',
        readLicenseId: 'read-license-v32-gate5',
        ownershipEventId: 'ownership-event-v32-gate5',
        ledgerAnchorId: 'ledger-anchor-v32-gate5',
        depositorWalletId: 'wallet-depositor-v32-gate5',
        readerWalletId: 'wallet-reader-v32-gate5',
        readback: settledReadback(),
      },
      pullRequestTarget: 'octocat/Spoon-Knife#123',
    });

    expect(unlocked).toMatchObject({
      state: 'licensed_read',
      sourceAvailable: true,
      settlementAdmissible: true,
      deliveryAvailable: true,
      missingReadbackKeys: [],
    });
    expect(
      applyAssetPackSettlementUnlockToPreview(
        {
          accessPolicy: { readRightState: 'none' },
          unlock: { sourceAvailable: false },
          delivery: { availableAfterSettlement: true },
        },
        unlocked,
      ),
    ).toMatchObject({
      accessPolicy: { readRightState: 'licensed_read' },
      unlock: { sourceAvailable: true },
      delivery: { pullRequestTarget: 'octocat/Spoon-Knife#123' },
    });
  });
});
