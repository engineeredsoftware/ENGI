import {
  assertFinalBtdScalarVolumeAdmissible,
  buildBtdScalarVolumeQuoteConservation,
  type BtdScalarVolumeSelectedFitInput,
} from '../btd-scalar-volume-quote';
import {
  acceptReadNeed,
  buildAssetPackSourceSafePreview,
  buildShareToFeePreview,
  synthesizeReadNeedForPipelineInput,
  type AssetPackSourceSafePreview,
  type ReadNeed,
  type ReadNeedMeasurementDimension,
} from '../read-need';
import type { DepositoryFitResultEvidence } from '../depository-search';

const input = {
  read: {
    id: 'read-btd-scalar-volume-1',
    prompt:
      'Find source-bound implementation knowledge that can improve the repository Reading path, proof readback, BTC settlement, and AssetPack delivery.',
  },
  sourceRevision: {
    repositoryFullName: 'engineeredsoftware/ENGI',
    branch: 'main',
    commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
  },
};

function acceptedNeed(): ReadNeed {
  return acceptReadNeed(
    synthesizeReadNeedForPipelineInput(input),
    '2026-05-31T00:00:00.000Z',
  );
}

function fitResult(
  fits: Array<{ assetId: string; finalScore: number; semanticScore?: number }>,
): DepositoryFitResultEvidence {
  const selectedCandidates = fits.map((fit, index) => ({
    assetId: fit.assetId,
    title: `Depository AssetPack ${fit.assetId}`,
    artifactKind: 'asset-pack',
    useTier: 'settlement-eligible' as const,
    sourceBinding: {
      repositoryFullName: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      contentRoot: `sha256:content-${fit.assetId}`,
    },
    selectedUnits: [],
    scores: {
      finalScore: fit.finalScore,
      semanticScore: fit.semanticScore ?? fit.finalScore,
      textScore: 0.8,
      unitScore: 0.8,
      repositoryScore: 1,
      revisionScore: 1,
      artifactKindScore: 1,
      proofScore: 1,
      measurementScore: 1,
      providerScore: 0,
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
      matchedTerms: ['assetpack', 'proof', 'settlement'],
      matchedTargetKinds: ['asset-pack'],
      matchedUnitIds: [`unit-${index + 1}`],
      providerMatchCount: 1,
      providerIds: ['test-provider'],
    },
    proofEvidence: {
      hasWalletOrAttestationProof: true,
      attestationCount: 1,
      signingSurfacePresent: true,
      identitySurfacePresent: true,
      githubBoundaryPresent: true,
      githubAppAuthSurfacePresent: true,
      proofRoot: `sha256:proof-${fit.assetId}`,
    },
    measurementEvidence: {
      hasAssetMeasurementEvidence: true,
      assetMeasurementPresent: true,
      measurementProvenanceCount: 1,
      measurementRoot: `sha256:measurement-${fit.assetId}`,
    },
    readbackEvidence: {
      proofRootRequired: true,
      proofRootPresent: true,
      reconciliationReadbackRequired: true,
      reconciliationReadbackPresent: true,
      reconciliationReadbackRoot: `sha256:readback-${fit.assetId}`,
    },
    rejectionReasons: [],
  }));

  return {
    schema: 'bitcode.asset-pack.fit-result',
    resultState: 'worthy_fit',
    resultReasons: ['Selected source-safe Depository AssetPacks exceed the worthy-fit threshold.'],
    fitDepositAssetIds: fits.map((fit) => fit.assetId),
    selectedCandidateAssetIds: fits.map((fit) => fit.assetId),
    queryRoot: 'sha256:query-root',
    rankingRoot: `sha256:ranking-${fits.map((fit) => fit.assetId).join('-')}`,
    searchedAssetCount: fits.length,
    embeddingPolicy: { provider: 'test' },
    selectionTrace: {
      selectedCandidates,
      fitDeposits: selectedCandidates,
      blockedCandidates: [],
      candidateRanking: selectedCandidates,
      rejectedCandidateCount: 0,
    },
  } as unknown as DepositoryFitResultEvidence;
}

function previewFor(
  need: ReadNeed,
  fits: Array<{ assetId: string; finalScore: number }>,
): AssetPackSourceSafePreview {
  return buildAssetPackSourceSafePreview({
    need,
    fitResult: fitResult(fits),
    rangeStart: 50_000,
    pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/4500',
    createdAt: '2026-05-31T00:00:00.000Z',
  });
}

function selectedFit(
  assetId: string,
  units: number,
  fitQualityBps: number,
): BtdScalarVolumeSelectedFitInput {
  return {
    depositId: assetId,
    assetId,
    assetPackId: `depository-${assetId}`,
    depositorWalletId: `depositor-wallet-${assetId}`,
    sourceManifestRoot: `sha256:source-${assetId}`,
    measurementRoot: `sha256:measurement-${assetId}`,
    normalizedMeasurementUnits: units,
    fitQualityBps,
    provenanceBps: 10_000,
    accepted: true,
  };
}

describe('BTD scalar volume and deterministic quote conservation', () => {
  it('computes final Need-relative BTD scalar volume with conserved quote and one selected Fit', () => {
    const need = acceptedNeed();
    const preview = previewFor(need, [{ assetId: 'fit-a', finalScore: 0.82 }]);
    const projection = buildBtdScalarVolumeQuoteConservation({
      acceptedNeed: need,
      sourceSafePreview: preview,
      selectedFits: [selectedFit('fit-a', 820, 8200)],
      issuedAt: '2026-05-31T00:00:00.000Z',
    });

    expect(projection.schema).toBe('bitcode.btd.scalar-volume.quote-conservation');
    expect(projection.state).toBe('final_btd_scalar_volume_admissible');
    expect(projection.blockers).toEqual([]);
    expect(projection.depositPotential).toMatchObject({
      state: 'estimate_only_before_need_fit',
      measurementRoot: need.measurementRoot,
    });
    expect(projection.measurementWeightPolicy).toMatchObject({
      policyId: 'need-relative-fixed-point-weighted-volume',
      arithmetic: 'fixed-point-integer',
      rounding: 'floor-row-remainder-rooted',
      requiredWeightBpsTotal: 10_000,
    });
    expect(projection.measurementRows).toHaveLength(
      need.pricingMeasurementInputs.measurementVector.length,
    );
    expect(projection.quote).toMatchObject({
      quoteRoot: preview.feeQuote.quoteRoot,
      quoteSats: preview.feeQuote.sats,
      expectedSats: preview.feeQuote.sats,
      quoteConserved: true,
    });
    expect(projection.rangeProjection).toMatchObject({
      tokenCount: preview.rangeProjection.tokenCount,
      conservedWithScalarVolume: true,
    });
    expect(projection.sourceToShares?.proof.fitDeposits).toHaveLength(1);
    expect(projection.sourceToShares).toMatchObject({
      sourceToSharesConserved: true,
      grossSats: String(preview.feeQuote.sats),
      allocatedSats: String(preview.feeQuote.sats),
    });
    expect(assertFinalBtdScalarVolumeAdmissible(projection)).toBe(projection);
  });

  it('conserves source-to-shares settlement sats and BTD range slices across many selected Fits', () => {
    const need = acceptedNeed();
    const preview = previewFor(need, [
      { assetId: 'fit-a', finalScore: 0.82 },
      { assetId: 'fit-b', finalScore: 0.74 },
    ]);
    const projection = buildBtdScalarVolumeQuoteConservation({
      acceptedNeed: need,
      sourceSafePreview: preview,
      selectedFits: [
        selectedFit('fit-a', 820, 8200),
        selectedFit('fit-b', 740, 7400),
      ],
      issuedAt: '2026-05-31T00:00:00.000Z',
    });

    assertFinalBtdScalarVolumeAdmissible(projection);
    const proof = projection.sourceToShares!.proof;
    const shareTotal = proof.contributionWeights.reduce((sum, weight) => sum + weight.shareBps, 0);
    const allocatedSats = proof.settlementAllocations.reduce(
      (sum, allocation) => sum + allocation.allocatedSats,
      0n,
    );
    const allocatedTokenCount = proof.rangeSlices.reduce((sum, slice) => sum + slice.tokenCount, 0);

    expect(proof.fitDeposits).toHaveLength(2);
    expect(shareTotal).toBe(10_000);
    expect(allocatedSats).toBe(proof.feeQuote.grossSats);
    expect(allocatedTokenCount).toBe(proof.zeroCellRefitTail.rangeTokenCount);
    expect(proof.settlementConservation.state).toBe('balanced');
    expect(proof.settlementAllocations.map((allocation) => allocation.depositId)).toEqual([
      'fit-a',
      'fit-b',
    ]);
  });

  it('blocks final BTD when reviewed Need, selected Fit set, synthesized AssetPack, proof roots, deterministic weights, range, or quote are missing', () => {
    const need = acceptedNeed();
    const preview = previewFor(need, [{ assetId: 'fit-a', finalScore: 0.82 }]);
    const unreviewedNeed = synthesizeReadNeedForPipelineInput(input);
    const malformedWeightsNeed = {
      ...need,
      pricingMeasurementInputs: {
        ...need.pricingMeasurementInputs,
        measurementVector: [
          { dimension: 'semantic_relevance', weight: 0.5, volume: 1 },
          { dimension: 'source_binding', weight: 0.4, volume: 1 },
        ] as ReadNeedMeasurementDimension[],
      },
    };
    const malformedProofPreview = {
      ...preview,
      roots: {
        ...preview.roots,
        proofRoot: '',
        sourceManifestRoot: '',
      },
    };
    const malformedQuotePreview = {
      ...preview,
      feeQuote: {
        ...preview.feeQuote,
        sats: preview.feeQuote.sats + 1,
      },
    };
    const unassignedRangePreview = {
      ...preview,
      rangeProjection: {
        ...preview.rangeProjection,
        rangeStart: null,
        rangeEndExclusive: null,
      },
    };

    const cases = [
      {
        name: 'reviewed Need',
        projection: buildBtdScalarVolumeQuoteConservation({
          acceptedNeed: unreviewedNeed,
          sourceSafePreview: preview,
          selectedFits: [selectedFit('fit-a', 820, 8200)],
        }),
        blocker: 'reviewed_need_required',
      },
      {
        name: 'selected Fit set',
        projection: buildBtdScalarVolumeQuoteConservation({
          acceptedNeed: need,
          sourceSafePreview: preview,
          selectedFits: [],
        }),
        blocker: 'selected_fit_set_required',
      },
      {
        name: 'synthesized Need-Fit AssetPack',
        projection: buildBtdScalarVolumeQuoteConservation({
          acceptedNeed: need,
          quote: buildShareToFeePreview({ need, admittedFitQuality: 0.82 }),
          selectedFits: [selectedFit('fit-a', 820, 8200)],
        }),
        blocker: 'need_fit_assetpack_required',
      },
      {
        name: 'deterministic measurement weights',
        projection: buildBtdScalarVolumeQuoteConservation({
          acceptedNeed: malformedWeightsNeed,
          sourceSafePreview: preview,
          selectedFits: [selectedFit('fit-a', 820, 8200)],
        }),
        blocker: 'measurement_weight_policy_required',
      },
      {
        name: 'source-safe proof roots',
        projection: buildBtdScalarVolumeQuoteConservation({
          acceptedNeed: need,
          sourceSafePreview: malformedProofPreview,
          selectedFits: [selectedFit('fit-a', 820, 8200)],
        }),
        blocker: 'source_safe_proof_root_required',
      },
      {
        name: 'settlement-bound quote',
        projection: buildBtdScalarVolumeQuoteConservation({
          acceptedNeed: need,
          sourceSafePreview: {
            ...preview,
            feeQuote: null as unknown as AssetPackSourceSafePreview['feeQuote'],
          },
          selectedFits: [selectedFit('fit-a', 820, 8200)],
        }),
        blocker: 'settlement_bound_quote_required',
      },
      {
        name: 'conserved quote',
        projection: buildBtdScalarVolumeQuoteConservation({
          acceptedNeed: need,
          sourceSafePreview: malformedQuotePreview,
          selectedFits: [selectedFit('fit-a', 820, 8200)],
        }),
        blocker: 'quote_conservation_failed',
      },
      {
        name: 'assigned BTD range',
        projection: buildBtdScalarVolumeQuoteConservation({
          acceptedNeed: need,
          sourceSafePreview: unassignedRangePreview,
          selectedFits: [selectedFit('fit-a', 820, 8200)],
        }),
        blocker: 'btd_range_conservation_failed',
      },
    ];

    for (const entry of cases) {
      expect(entry.projection.state).toBe('final_btd_scalar_volume_blocked');
      expect(entry.projection.blockers).toContain(entry.blocker);
      expect(() => assertFinalBtdScalarVolumeAdmissible(entry.projection)).toThrow(
        /Final BTD scalar volume is not admissible/,
      );
    }
  });
});
