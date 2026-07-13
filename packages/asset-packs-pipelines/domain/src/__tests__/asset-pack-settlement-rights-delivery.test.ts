import { Execution } from '@bitcode/execution-generics';
import {
  buildAssetPackPreviewBoundary,
} from '../asset-pack-preview-boundary';
import {
  buildAssetPackSettlementRightsDeliveryBoundary,
  persistAssetPackSettlementRightsDeliveryBoundary,
  summarizeAssetPackSettlementRightsDeliveryBoundary,
} from '../asset-pack-settlement-rights-delivery';
import {
  acceptReadNeed,
  synthesizeReadNeedForPipelineInput,
} from '../read-need';

function acceptedNeed() {
  return acceptReadNeed(
    synthesizeReadNeedForPipelineInput({
      read: {
        id: 'read-gate7',
        prompt: 'Find deposited source evidence, synthesize a source-safe AssetPack preview, settle it, and deliver a source-bearing pull request.',
      },
      sourceRevision: {
        repositoryFullName: 'engineeredsoftware/ENGI',
        branch: 'main',
        commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      },
      targetArtifactKinds: ['asset-pack', 'pull-request', 'settlement-proof'],
      closureCriteria: [
        'BTC payment finality is confirmed.',
        'BTD rights transfer is recorded.',
        'Source-to-shares compensation conserves sats.',
        'Ledger, database, and object storage projections agree.',
      ],
    }),
    '2026-05-22T00:00:00.000Z',
  );
}

function fitResult(finalScore = 0.92): any {
  return {
    schema: 'bitcode.asset-pack.fit-result',
    resultState: 'worthy_fit',
    resultReasons: ['Selected proof-bearing fit deposits for settlement delivery.'],
    fitDepositAssetIds: ['fit-deposit-settlement-1', 'fit-deposit-settlement-2'],
    selectedCandidateAssetIds: ['fit-deposit-settlement-1', 'fit-deposit-settlement-2'],
    queryRoot: 'sha256:query-settlement',
    rankingRoot: 'sha256:ranking-settlement',
    searchedAssetCount: 9,
    embeddingPolicy: {
      provider: 'openai',
      model: 'text-embedding-3-small',
      dimensions: 1536,
      distanceMetric: 'cosine',
      vectorMatchRpc: 'match_deliverable_vectors',
    },
    selectionTrace: {
      selectedCandidates: [
        {
          assetId: 'fit-deposit-settlement-1',
          title: 'Settlement-ready fit deposit one',
          artifactKind: 'asset-pack',
          useTier: 'settlement-eligible',
          sourceBinding: {
            repositoryFullName: 'engineeredsoftware/ENGI',
            sourceBranch: 'main',
            sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
            contentRoot: 'sha256:content-settlement-1',
          },
          selectedUnits: [{ unitId: 'unit-1', unitKind: 'summary', path: 'README.md', unitHash: 'sha256:unit-1' }],
          scores: {
            finalScore,
            semanticScore: 0.9,
            textScore: 0.86,
            unitScore: 0.84,
            repositoryScore: 1,
            revisionScore: 1,
            artifactKindScore: 0.95,
            proofScore: 1,
            measurementScore: 0.94,
            providerScore: 0.78,
            penaltyMass: 0,
          },
          verification: {
            repositoryBound: true,
            sourceRevisionBound: true,
            hasWalletOrAttestationProof: true,
            hasAssetMeasurementEvidence: true,
            proofRootRequired: true,
            proofRootPresent: true,
            reconciliationReadbackRequired: true,
            reconciliationReadbackPresent: true,
            blockers: [],
            warnings: [],
          },
          recall: {
            matchedTerms: ['settlement', 'delivery'],
            matchedTargetKinds: ['asset-pack'],
            matchedUnitIds: ['unit-1'],
            providerMatchCount: 1,
            providerIds: ['lexical'],
          },
          proofEvidence: {
            hasWalletOrAttestationProof: true,
            attestationCount: 1,
            signingSurfacePresent: true,
            identitySurfacePresent: true,
            githubBoundaryPresent: true,
            githubAppAuthSurfacePresent: true,
            proofRoot: 'sha256:proof-settlement-1',
          },
          measurementEvidence: {
            hasAssetMeasurementEvidence: true,
            assetMeasurementPresent: true,
            measurementProvenanceCount: 1,
            measurementRoot: 'sha256:measurement-settlement-1',
          },
          readbackEvidence: {
            proofRootRequired: true,
            proofRootPresent: true,
            reconciliationReadbackRequired: true,
            reconciliationReadbackPresent: true,
            reconciliationReadbackRoot: 'sha256:readback-settlement-1',
          },
          rejectionReasons: [],
        },
        {
          assetId: 'fit-deposit-settlement-2',
          scores: {
            finalScore: 0.87,
            semanticScore: 0.83,
          },
          proofEvidence: { proofRoot: 'sha256:proof-settlement-2' },
          measurementEvidence: { measurementRoot: 'sha256:measurement-settlement-2' },
          readbackEvidence: { reconciliationReadbackRoot: 'sha256:readback-settlement-2' },
        },
      ],
      fitDeposits: [],
      blockedCandidates: [],
      candidateRanking: [],
      rejectedCandidateCount: 0,
    },
  };
}

function previewBoundary() {
  return buildAssetPackPreviewBoundary({
    need: acceptedNeed(),
    fitResult: fitResult(),
    pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/397',
    createdAt: '2026-05-22T00:00:00.000Z',
  });
}

describe('AssetPack settlement rights delivery boundary', () => {
  it('unlocks BTD rights, source-to-shares compensation, reconciliation, and pull-request delivery after confirmed payment', () => {
    const preview = previewBoundary();
    const boundary = buildAssetPackSettlementRightsDeliveryBoundary({
      previewBoundary: preview,
      readerWalletId: 'reader-wallet-gate7',
      depositorWalletId: 'depositor-wallet-gate7',
      createdAt: '2026-05-22T00:00:00.000Z',
    });

    expect(boundary).toMatchObject({
      schema: 'bitcode.asset-pack.settlement-rights-delivery-boundary',
      state: 'settlement_delivered',
      sourceSafety: {
        sourceSafeMetadataOnly: true,
        protectedSourcePayloadSerialized: false,
        sourceBearingDeliveryUnlockedToReader: true,
        walletPrivateMaterialVisible: false,
        credentialsSerialized: false,
      },
      paymentObservation: {
        expectedSats: preview.quoteReceipt.sats,
        observedDebitSats: preview.quoteReceipt.sats,
        observedCreditSats: preview.quoteReceipt.sats,
        serverCustody: false,
      },
      finalityReceipt: {
        finalityState: 'confirmed',
      },
      btcSettlementReadback: {
        quoteAcceptanceState: 'accepted',
        walletReadinessState: 'wallet_ready_non_custodial',
        psbtPreparationState: 'psbt_prepared_source_safe',
        psbtSignatureState: 'psbt_signed_by_reader_wallet',
        settlementFinalizationState: 'settlement_finalized',
        rightsTransferState: 'rights_transferred',
        deliveryState: 'source_unlocked_delivery',
        compensationRoutingState: 'compensation_routable',
        sourceUnlockAdmissible: true,
        serverCustody: false,
        walletPrivateMaterialVisible: false,
      },
      deliveryUnlock: {
        state: 'source_bearing_pull_request_ready',
        sourceBearingDeliveryVisibleToReader: true,
        protectedSourcePayloadSerialized: false,
      },
    });
    expect(boundary.rightsTransferReceipt?.kind).toBe('btd.rights_transfer_receipt');
    expect(boundary.btdReadReceipt?.kind).toBe('btd.read_receipt');
    expect(boundary.sourceToSharesProof?.kind).toBe('btd.source_to_shares_proof');
    expect((boundary.sourceToSharesProof as any).settlementConservation.state).toBe('balanced');
    expect((boundary.sourceToSharesProof as any).settlementAllocations).toHaveLength(2);
    expect(boundary.reconciliationReport.state).toBe('aligned');
    expect(boundary.replayReceipt.verified).toMatchObject({
      paymentMatchesQuote: true,
      finalityConfirmed: true,
      sourceToSharesConserved: true,
      rightsTransferConfirmed: true,
      reconciliationAligned: true,
      deliveryUnlockedOnlyAfterSettlement: true,
      protectedSourcePayloadAbsent: true,
    });
    expect(boundary.storageProjection.map((record) => record.recordKind)).toEqual(
      expect.arrayContaining([
        'btc_payment_observation',
        'btc_settlement_readback',
        'settlement_finality',
        'source_to_shares_compensation',
        'btd_read_receipt',
        'btd_rights_transfer',
        'delivery_unlock',
        'ledger_database_storage_reconciliation',
        'replay_receipt',
      ]),
    );
    expect(JSON.stringify(boundary)).not.toContain('diff --git');
    expect(JSON.stringify(boundary)).not.toContain('sk-proj-');
    expect(summarizeAssetPackSettlementRightsDeliveryBoundary(boundary)).toContain('rights transferred');
  });

  it('fails closed when BTC payment is underpaid', () => {
    const preview = previewBoundary();
    const boundary = buildAssetPackSettlementRightsDeliveryBoundary({
      previewBoundary: preview,
      paymentObservation: {
        observedDebitSats: preview.quoteReceipt.sats - 1,
        observedCreditSats: preview.quoteReceipt.sats - 1,
      },
      readerWalletId: 'reader-wallet-underpaid',
      depositorWalletId: 'depositor-wallet-underpaid',
      createdAt: '2026-05-22T00:00:00.000Z',
    });

    expect(boundary.state).toBe('blocked_until_compensation_conservation');
    expect(boundary.rightsTransferReceipt).toBeNull();
    expect(boundary.btdReadReceipt).toBeNull();
    expect(boundary.deliveryUnlock.state).toBe('withheld');
    expect(boundary.deliveryUnlock.sourceBearingDeliveryVisibleToReader).toBe(false);
    expect(boundary.repairPosture.blockers).toContain('source_to_shares_conservation_failed');
    expect(boundary.replayReceipt.verified.paymentMatchesQuote).toBe(false);
  });

  it.each(['prepared', 'signed', 'broadcast', 'observed'] as const)(
    'fails closed for %s BTC state before finality',
    (finalityState) => {
      const boundary = buildAssetPackSettlementRightsDeliveryBoundary({
        previewBoundary: previewBoundary(),
        finality: {
          finalityState,
          confirmations: 0,
          blockHeight: null,
        },
        createdAt: '2026-05-22T00:00:00.000Z',
      });

      expect(boundary.state).toBe('blocked_until_payment_finality');
      expect(boundary.rightsTransferReceipt).toBeNull();
      expect(boundary.btdReadReceipt).toBeNull();
      expect(boundary.deliveryUnlock.sourceBearingDeliveryVisibleToReader).toBe(false);
      expect(boundary.btcSettlementReadback).toMatchObject({
        finalityState,
        settlementFinalizationState: 'not_finalized',
        rightsTransferState: 'rights_withheld',
        deliveryState: 'delivery_withheld',
        sourceUnlockAdmissible: false,
        rightsTransferAdmissible: false,
      });
      expect(boundary.repairPosture.nextActions).toEqual(
        expect.arrayContaining(['observe_btc_payment', 'wait_for_btc_finality']),
      );
    },
  );

  it('fails closed when payment references a stale accepted BTC quote', () => {
    const preview = previewBoundary();
    const boundary = buildAssetPackSettlementRightsDeliveryBoundary({
      previewBoundary: preview,
      paymentObservation: {
        expectedSats: preview.quoteReceipt.sats - 10,
        observedDebitSats: preview.quoteReceipt.sats - 10,
        observedCreditSats: preview.quoteReceipt.sats - 10,
      },
      createdAt: '2026-05-22T00:00:00.000Z',
    });

    expect(boundary.state).toBe('blocked_until_compensation_conservation');
    expect(boundary.rightsTransferReceipt).toBeNull();
    expect(boundary.deliveryUnlock.sourceBearingDeliveryVisibleToReader).toBe(false);
    expect(boundary.btcSettlementReadback.quoteAcceptanceState).toBe('stale_quote_repair_required');
    expect(boundary.btcSettlementReadback.blockerCodes).toContain('stale_btc_quote_or_payment_mismatch');
    expect(boundary.repairPosture.blockers).toContain('stale_btc_quote_or_payment_mismatch');
    expect(boundary.repairPosture.nextActions).toEqual(
      expect.arrayContaining(['refresh_stale_btc_quote', 'observe_btc_payment']),
    );
  });

  it('fails closed when contributor compensation conservation fails after debit observation', () => {
    const preview = previewBoundary();
    const boundary = buildAssetPackSettlementRightsDeliveryBoundary({
      previewBoundary: preview,
      paymentObservation: {
        observedDebitSats: preview.quoteReceipt.sats,
        observedCreditSats: preview.quoteReceipt.sats - 1,
      },
      createdAt: '2026-05-22T00:00:00.000Z',
    });

    expect(boundary.state).toBe('blocked_until_compensation_conservation');
    expect(boundary.sourceToSharesProof).toMatchObject({
      settlementConservation: {
        state: 'underpayment',
        settlementAdmissible: false,
      },
    });
    expect(boundary.rightsTransferReceipt).toBeNull();
    expect(boundary.btcSettlementReadback.compensationRoutingState).toBe('compensation_withheld');
    expect(boundary.repairPosture.blockers).toContain('source_to_shares_conservation_failed');
  });

  it('withholds delivery when ledger, database, or object storage projections drift', () => {
    const boundary = buildAssetPackSettlementRightsDeliveryBoundary({
      previewBoundary: previewBoundary(),
      projectionMode: 'missing_database_projection',
      createdAt: '2026-05-22T00:00:00.000Z',
    });

    expect(boundary.state).toBe('blocked_until_projection_repair');
    expect(boundary.rightsTransferReceipt?.kind).toBe('btd.rights_transfer_receipt');
    expect(boundary.reconciliationReport.blocking).toBe(true);
    expect(boundary.reconciliationReport.repairs.length).toBeGreaterThan(0);
    expect(boundary.deliveryUnlock.state).toBe('withheld');
    expect(boundary.repairPosture.nextActions).toContain('repair_ledger_database_storage_projection');
  });

  it('withholds source unlock and rights delivery when repository delivery is missing', () => {
    const boundary = buildAssetPackSettlementRightsDeliveryBoundary({
      previewBoundary: previewBoundary(),
      pullRequestTarget: null,
      createdAt: '2026-05-22T00:00:00.000Z',
    });

    expect(boundary.state).toBe('blocked_until_pull_request_delivery');
    expect(boundary.rightsTransferReceipt?.kind).toBe('btd.rights_transfer_receipt');
    expect(boundary.deliveryUnlock).toMatchObject({
      state: 'withheld',
      sourceBearingDeliveryVisibleToReader: false,
      pullRequestTarget: null,
      blockerCodes: expect.arrayContaining(['pull_request_target_missing']),
    });
    expect(boundary.btcSettlementReadback).toMatchObject({
      deliveryState: 'delivery_withheld',
      sourceUnlockAdmissible: false,
    });
    expect(boundary.repairPosture.blockers).toContain('pull_request_delivery_missing');
  });

  it('persists settlement and rights delivery records onto execution state', () => {
    const execution = new Execution('asset-pack-settlement-test');
    const boundary = buildAssetPackSettlementRightsDeliveryBoundary({
      previewBoundary: previewBoundary(),
      createdAt: '2026-05-22T00:00:00.000Z',
    });

    persistAssetPackSettlementRightsDeliveryBoundary(execution, boundary);

    expect(execution.get('asset-pack/settlement', 'boundary')).toMatchObject({
      schema: 'bitcode.asset-pack.settlement-rights-delivery-boundary',
      state: 'settlement_delivered',
    });
    expect(execution.get('asset-pack/settlement', 'rightsTransferReceipt')).toMatchObject({
      kind: 'btd.rights_transfer_receipt',
    });
    expect(execution.get('asset-pack/settlement', 'deliveryUnlock')).toMatchObject({
      state: 'source_bearing_pull_request_ready',
    });
    expect(execution.get('asset-pack/settlement', 'btcSettlementReadback')).toMatchObject({
      schema: 'bitcode.asset-pack.btc-settlement-readback',
      settlementFinalizationState: 'settlement_finalized',
    });
  });
});
