import { Execution } from '@bitcode/execution-generics';
import {
  buildAssetPackPreviewBoundary,
  persistAssetPackPreviewBoundary,
  summarizeAssetPackPreviewBoundary,
} from '../asset-pack-preview-boundary';
import {
  acceptReadNeed,
  buildAssetPackSourceSafePreview,
  synthesizeReadNeedForPipelineInput,
} from '../read-need';

function acceptedNeed() {
  return acceptReadNeed(
    synthesizeReadNeedForPipelineInput({
      read: {
        id: 'read-gate6',
        prompt: 'Find deposited source evidence and synthesize a source-safe AssetPack preview for settlement review.',
      },
      sourceRevision: {
        repositoryFullName: 'engineeredsoftware/ENGI',
        branch: 'main',
        commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      },
      targetArtifactKinds: ['asset-pack', 'proof-root'],
      closureCriteria: [
        'Preview measurements are source-safe.',
        'BTC quote is deterministic.',
        'Source-bearing delivery is locked before settlement.',
      ],
    }),
    '2026-05-21T00:00:00.000Z',
  );
}

function fitResult(finalScore = 0.91): any {
  return {
    schema: 'bitcode.asset-pack.fit-result',
    resultState: 'worthy_fit',
    resultReasons: ['Selected two proof-bearing fit deposits for preview synthesis.'],
    fitDepositAssetIds: ['fit-deposit-preview-1', 'fit-deposit-preview-2'],
    selectedCandidateAssetIds: ['fit-deposit-preview-1', 'fit-deposit-preview-2'],
    queryRoot: 'sha256:query-preview',
    rankingRoot: 'sha256:ranking-preview',
    searchedAssetCount: 7,
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
          assetId: 'fit-deposit-preview-1',
          title: 'Preview-ready fit deposit one',
          artifactKind: 'asset-pack',
          useTier: 'settlement-eligible',
          sourceBinding: {
            repositoryFullName: 'engineeredsoftware/ENGI',
            sourceBranch: 'main',
            sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
            contentRoot: 'sha256:content-1',
          },
          selectedUnits: [{ unitId: 'unit-1', unitKind: 'summary', path: 'README.md', unitHash: 'sha256:unit-1' }],
          scores: {
            finalScore,
            semanticScore: 0.88,
            textScore: 0.82,
            unitScore: 0.8,
            repositoryScore: 1,
            revisionScore: 1,
            artifactKindScore: 0.95,
            proofScore: 1,
            measurementScore: 0.93,
            providerScore: 0.74,
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
            matchedTerms: ['preview', 'settlement'],
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
            proofRoot: 'sha256:proof-1',
          },
          measurementEvidence: {
            hasAssetMeasurementEvidence: true,
            assetMeasurementPresent: true,
            measurementProvenanceCount: 1,
            measurementRoot: 'sha256:measurement-1',
          },
          readbackEvidence: {
            proofRootRequired: true,
            proofRootPresent: true,
            reconciliationReadbackRequired: true,
            reconciliationReadbackPresent: true,
            reconciliationReadbackRoot: 'sha256:readback-1',
          },
          rejectionReasons: [],
        },
        {
          assetId: 'fit-deposit-preview-2',
          scores: {
            finalScore: 0.86,
            semanticScore: 0.8,
          },
          proofEvidence: { proofRoot: 'sha256:proof-2' },
          measurementEvidence: { measurementRoot: 'sha256:measurement-2' },
          readbackEvidence: { reconciliationReadbackRoot: 'sha256:readback-2' },
        },
      ],
      fitDeposits: [],
      blockedCandidates: [],
      candidateRanking: [],
      rejectedCandidateCount: 0,
    },
  };
}

describe('AssetPack preview quote boundary', () => {
  it('wraps source-safe preview, deterministic BTC quote, settlement instructions, and delivery lock', () => {
    const need = acceptedNeed();
    const fit = fitResult();
    const boundary = buildAssetPackPreviewBoundary({
      need,
      fitResult: fit,
      pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/39',
      createdAt: '2026-05-21T00:00:00.000Z',
    });
    const repeated = buildAssetPackPreviewBoundary({
      need,
      fitResult: fit,
      pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/39',
      createdAt: '2026-05-21T00:00:00.000Z',
    });

    expect(boundary).toMatchObject({
      schema: 'bitcode.asset-pack.preview-boundary',
      sourceSafety: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        unpaidAssetPackSourceVisible: false,
        credentialsSerialized: false,
      },
      sourceSafePreview: {
        fit: {
          resultState: 'worthy_fit',
          scoreBand: 'high',
          fitDepositAssetIds: ['fit-deposit-preview-1', 'fit-deposit-preview-2'],
        },
        unlock: {
          sourceAvailable: false,
        },
      },
      settlementInstructions: {
        state: 'quote_ready_settlement_required',
        payer: 'reader',
        payee: 'depositor',
        serverCustody: false,
        settlementRequiredBeforeUnlock: true,
      },
      deliveryPosture: {
        state: 'withheld_until_settlement',
        sourceBearingDeliveryVisible: false,
        availableAfterSettlement: true,
      },
    });
    expect(boundary.quoteReceipt.formula).toBe('sum(measurement.weight * measurement.volume * admitted_fit_quality)');
    expect(boundary.quoteReceipt.quoteRoot).toBe(boundary.sourceSafePreview.feeQuote.quoteRoot);
    expect(boundary.quoteReceipt.sats).toBeGreaterThanOrEqual(546);
    expect(boundary.quoteReceipt.quoteRoot).toBe(repeated.quoteReceipt.quoteRoot);
    expect(boundary.quoteReceipt.deterministic).toBe(true);
    expect(boundary.quoteReceipt.weightedAdmittedVolume).toBe(boundary.sourceSafePreview.feeQuote.weightedAdmittedVolume);
    expect(boundary.settlementInstructions.sats).toBe(boundary.quoteReceipt.sats);
    expect(boundary.settlementInstructions.quoteRoot).toBe(boundary.quoteReceipt.quoteRoot);
    expect(boundary.proofRoots.boundaryRoot).toBe(repeated.proofRoots.boundaryRoot);
    expect(boundary.selectedFitProvenance.selectedCandidates).toHaveLength(2);
    expect(boundary.selectedFitProvenance.selectedCandidates[0].proofRoot).toBe('sha256:proof-1');
    expect(boundary.storageProjection.every((record) => record.sourceSafety.sourceSafeMetadataOnly)).toBe(true);
    expect(boundary.storageProjection.every((record) => record.sourceSafety.unpaidAssetPackSourceVisible === false)).toBe(true);
    expect(boundary.replayReceipt.verified).toEqual({
      quoteRootMatchesPreview: true,
      disclosureReviewRootMatchesReview: true,
      sourceManifestWithheldBeforeSettlement: true,
      settlementRequiresReaderPayment: true,
      deliveryWithheldUntilSettlement: true,
      protectedSourceLeakageAbsent: true,
    });
    expect(boundary.repairPosture.nextActions).toEqual([
      'prepare_reader_wallet_payment',
      'continue_to_settlement',
    ]);
    expect(JSON.stringify(boundary)).not.toContain('diff --git');
    expect(summarizeAssetPackPreviewBoundary(boundary)).toContain('quote');
  });

  it('records blocked preview repair posture when no worthy fit exists', () => {
    const need = acceptedNeed();
    const blockedFit = {
      ...fitResult(0),
      resultState: 'no_worthy_fit',
      resultReasons: ['No source-bound fit exceeded preview threshold.'],
      fitDepositAssetIds: [],
      selectedCandidateAssetIds: [],
      selectionTrace: {
        selectedCandidates: [],
        fitDeposits: [],
        blockedCandidates: [],
        candidateRanking: [],
        rejectedCandidateCount: 2,
      },
    };
    const boundary = buildAssetPackPreviewBoundary({ need, fitResult: blockedFit as any });

    expect(boundary.sourceSafePreview.fit.resultState).toBe('no_worthy_fit');
    expect(boundary.settlementInstructions.state).toBe('blocked_until_worthy_fit');
    expect(boundary.deliveryPosture.state).toBe('blocked_until_worthy_fit');
    expect(boundary.repairPosture.blockers).toContain('worthy_fit_missing');
    expect(boundary.repairPosture.nextActions).toEqual(
      expect.arrayContaining(['run_read_fits_finding', 'adjust_need_constraints_or_thresholds']),
    );
  });

  it('fails closed when an externally supplied preview carries protected source', () => {
    const need = acceptedNeed();
    const sourceSafePreview = buildAssetPackSourceSafePreview({
      need,
      fitResult: fitResult(),
    }) as any;
    sourceSafePreview.protectedSourceContent = 'diff --git a/app.ts b/app.ts';

    expect(() => buildAssetPackPreviewBoundary({
      need,
      sourceSafePreview,
      fitResult: fitResult(),
    })).toThrow(/protected source/);
  });

  it('persists boundary projections to execution storage', () => {
    const execution = new Execution('pipeline:asset-pack');
    const boundary = buildAssetPackPreviewBoundary({
      need: acceptedNeed(),
      fitResult: fitResult(),
    });

    persistAssetPackPreviewBoundary(execution, boundary);

    expect(execution.get('asset-pack/preview', 'boundary')?.boundaryId).toBe(boundary.boundaryId);
    expect(execution.get('asset-pack/preview', 'quoteReceipt')?.quoteRoot).toBe(boundary.quoteReceipt.quoteRoot);
    expect(execution.get('asset-pack/preview', 'settlementInstructions')?.quoteRoot).toBe(boundary.quoteReceipt.quoteRoot);
    expect(execution.get('asset-pack/preview', 'deliveryPosture')?.sourceBearingDeliveryVisible).toBe(false);
    expect(execution.get('asset-pack/preview', 'storageProjection')).toHaveLength(9);
  });
});
