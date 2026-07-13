import { buildAssetPackPreviewBoundary } from '../asset-pack-preview-boundary';
import {
  buildAssetPackSettlementRightsDeliveryBoundary,
} from '../asset-pack-settlement-rights-delivery';
import {
  assertBtdBtcCompensationStatementsSourceSafe,
  buildBtdBtcCompensationStatements,
} from '../btd-btc-compensation-statements';
import {
  acceptReadNeed,
  synthesizeReadNeedForPipelineInput,
} from '../read-need';

function acceptedNeed() {
  return acceptReadNeed(
    synthesizeReadNeedForPipelineInput({
      read: {
        id: 'read-accounting',
        prompt: 'Settle an AssetPack, account for BTD/BTC rights, compensate contributors, and reconcile projections.',
      },
      sourceRevision: {
        repositoryFullName: 'engineeredsoftware/ENGI',
        branch: 'main',
        commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      },
      targetArtifactKinds: ['asset-pack', 'settlement-proof', 'compensation-statement'],
      closureCriteria: [
        'BTC payment finality is observed.',
        'BTD range rights are transferred.',
        'Source-to-shares contributor allocations conserve sats.',
        'Ledger, database, and object storage reconcile.',
      ],
    }),
    '2026-05-29T00:00:00.000Z',
  );
}

function fitResult(finalScore = 0.93): any {
  return {
    schema: 'bitcode.asset-pack.fit-result',
    resultState: 'worthy_fit',
    resultReasons: ['Selected proof-bearing fit deposits for BTD/BTC accounting.'],
    fitDepositAssetIds: ['fit-deposit-accounting-1', 'fit-deposit-accounting-2'],
    selectedCandidateAssetIds: ['fit-deposit-accounting-1', 'fit-deposit-accounting-2'],
    queryRoot: 'sha256:query-accounting',
    rankingRoot: 'sha256:ranking-accounting',
    searchedAssetCount: 11,
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
          assetId: 'fit-deposit-accounting-1',
          title: 'Accounting fit deposit one',
          artifactKind: 'asset-pack',
          useTier: 'settlement-eligible',
          sourceBinding: {
            repositoryFullName: 'engineeredsoftware/ENGI',
            sourceBranch: 'main',
            sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
            contentRoot: 'sha256:content-accounting-1',
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
            providerScore: 0.8,
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
            matchedTerms: ['settlement', 'accounting'],
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
            proofRoot: 'sha256:proof-accounting-1',
          },
          measurementEvidence: {
            hasAssetMeasurementEvidence: true,
            assetMeasurementPresent: true,
            measurementProvenanceCount: 1,
            measurementRoot: 'sha256:measurement-accounting-1',
          },
          readbackEvidence: {
            proofRootRequired: true,
            proofRootPresent: true,
            reconciliationReadbackRequired: true,
            reconciliationReadbackPresent: true,
            reconciliationReadbackRoot: 'sha256:readback-accounting-1',
          },
          rejectionReasons: [],
        },
        {
          assetId: 'fit-deposit-accounting-2',
          scores: {
            finalScore: 0.88,
            semanticScore: 0.84,
          },
          proofEvidence: { proofRoot: 'sha256:proof-accounting-2' },
          measurementEvidence: { measurementRoot: 'sha256:measurement-accounting-2' },
          readbackEvidence: { reconciliationReadbackRoot: 'sha256:readback-accounting-2' },
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
    pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/441',
    createdAt: '2026-05-29T00:00:00.000Z',
  });
}

describe('BTD/BTC compensation statements', () => {
  it('accounts confirmed settlement, BTD range transfer, contributor compensation, and reconciliation', () => {
    const settlementBoundary = buildAssetPackSettlementRightsDeliveryBoundary({
      previewBoundary: previewBoundary(),
      readerWalletId: 'reader-wallet-accounting',
      depositorWalletId: 'depositor-wallet-accounting',
      createdAt: '2026-05-29T00:00:00.000Z',
    });
    const statements = buildBtdBtcCompensationStatements({
      settlementBoundary,
      createdAt: '2026-05-29T00:00:00.000Z',
    });

    expect(statements).toMatchObject({
      schema: 'bitcode.asset-pack.btd-btc-compensation-statements',
      statements: 'BtdBtcCompensationStatements',
      state: 'settlement-accounted',
      btdRange: {
        rangeState: 'transferred-to-reader',
        rangeSliceCount: 2,
      },
      btcSettlement: {
        state: 'final-settlement-observed',
        valueLabel: 'final-settlement',
        serverCustody: false,
      },
      reconciliation: {
        ledgerDatabaseObjectStorageAligned: true,
      },
      disclosure: {
        sourceSafeMetadataOnly: true,
        protectedSourcePayloadSerialized: false,
        walletPrivateMaterialVisible: false,
      },
    });
    expect(statements.contributorCompensationStatements).toHaveLength(2);
    expect(statements.depositorEarningSummaries).toHaveLength(2);
    expect(statements.treasuryRoutes).toHaveLength(2);
    expect(statements.aggregate.allocatedContributorSats).toBe(statements.aggregate.finalSettlementSats);
    expect(statements.aggregate.unallocatedSats).toBe(0);
    expect(statements.aggregate.sourceToSharesAdmissible).toBe(true);
    expect(statements.roots.accountingRoot).toMatch(/^btd-btc-compensation-statements:/);
    expect(JSON.stringify(statements)).not.toContain('diff --git');
    expect(JSON.stringify(statements)).not.toContain('PRIVATE_SOURCE_DO_NOT_SERIALIZE');
    assertBtdBtcCompensationStatementsSourceSafe(statements);
  });

  it('marks finality-pending settlement without transferring source-bearing visibility', () => {
    const settlementBoundary = buildAssetPackSettlementRightsDeliveryBoundary({
      previewBoundary: previewBoundary(),
      finality: {
        finalityState: 'broadcast',
        confirmations: 0,
        blockHeight: null,
      },
      createdAt: '2026-05-29T00:00:00.000Z',
    });
    const statements = buildBtdBtcCompensationStatements({ settlementBoundary });

    expect(statements.state).toBe('pending-btc-finality');
    expect(statements.btcSettlement.state).toBe('observed-payment-pending-finality');
    expect(statements.btdRange.rangeState).toBe('allocated-pending-rights');
    expect(statements.contributorCompensationStatements[0].state).toBe('pending-settlement-finality');
    expect(statements.aggregate.sourceBearingDeliveryUnlockedToReader).toBe(false);
    expect(statements.treasuryRoutes[0].routeState).toBe('pending-finality');
  });

  it('surfaces conservation repair when payment accounting is underpaid', () => {
    const preview = previewBoundary();
    const settlementBoundary = buildAssetPackSettlementRightsDeliveryBoundary({
      previewBoundary: preview,
      paymentObservation: {
        observedDebitSats: preview.quoteReceipt.sats - 4,
        observedCreditSats: preview.quoteReceipt.sats - 4,
      },
      createdAt: '2026-05-29T00:00:00.000Z',
    });
    const statements = buildBtdBtcCompensationStatements({ settlementBoundary });

    expect(statements.state).toBe('repair-required');
    expect(statements.btcSettlement.state).toBe('repair-required');
    expect(statements.contributorCompensationStatements[0].state).toBe('repair-required');
    expect(statements.repair.blockers).toContain('source_to_shares_conservation_failed');
    expect(statements.aggregate.sourceToSharesAdmissible).toBe(false);
  });
});
