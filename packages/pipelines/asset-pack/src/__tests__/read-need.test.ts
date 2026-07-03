import {
  acceptReadNeed,
  admitReadFitsFinding,
  buildAssetPackSourceSafePreview,
  buildShareToFeePreview,
  isAcceptedReadNeed,
  readNeedToDepositorySearchRead,
  resolveAssetPackReadRightState,
  synthesizeReadNeedForPipelineInputWithInference,
  synthesizeReadNeedForPipelineInput,
} from '../read-need';
import {
  buildDepositoryFitResultEvidence,
  runDepositorySearchForPipelineInput,
} from '../depository-search';

const input = {
  read: {
    id: 'read-1',
    prompt:
      'Find whether the deposited repository has a complete Terminal path through Deposit, Read/Fit, AssetPack evidence, proof readback, and ledger reconciliation.',
  },
  sourceRevision: {
    repositoryFullName: 'engineeredsoftware/ENGI',
    branch: 'main',
    commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
  },
};

function depositoryAsset() {
  return {
    assetId: 'deposit-asset-1',
    title: 'Deposited repository revision engineeredsoftware/ENGI',
    artifactKind: 'repository-revision',
    repositoryFullName: 'engineeredsoftware/ENGI',
    sourceBranch: 'main',
    sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
    contentRoot: 'sha256:content',
    contentUnits: [
      {
        unitId: 'deposit-asset-1:unit-1',
        unitKind: 'repository-revision',
        text:
          'Terminal path Deposit Read Fit AssetPack evidence proof root finality readback Supabase ledger reconciliation.',
      },
    ],
    verificationEvidence: {
      proofRoot: 'sha256:proof',
      measurementRoot: 'sha256:measurement',
      reconciliationReadbackRoot: 'sha256:reconciliation',
    },
    hasWalletOrAttestationProof: true,
    hasAssetMeasurementEvidence: true,
  };
}

describe('Read-Need synthesis and Finding Fits admission', () => {
  const originalRealInferenceFlag = process.env.BITCODE_ASSET_PACK_REAL_INFERENCE;

  afterEach(() => {
    if (originalRealInferenceFlag === undefined) {
      delete process.env.BITCODE_ASSET_PACK_REAL_INFERENCE;
    } else {
      process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = originalRealInferenceFlag;
    }
  });

  it('synthesizes a measured Need that remains pending until accepted', () => {
    const need = synthesizeReadNeedForPipelineInput(input);

    expect(need.schema).toBe('bitcode.read.need');
    expect(need.needId).toMatch(/^need-[a-f0-9]{16}$/);
    expect(need.reviewState).toBe('needs_acceptance');
    expect(need.measurementRoot).toMatch(/^sha256:/);
    expect(need.request).toMatchObject({
      schema: 'bitcode.read.request',
      requestId: 'read-1',
      prompt: input.read.prompt,
      repositoryFullName: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      previousNeedId: null,
    });
    expect(need.sourceConstraints).toMatchObject({
      repositoryFullName: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      protectedSourceDisclosure: 'forbidden_before_settlement',
    });
    expect(need.pricingMeasurementInputs.measurementVector).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ dimension: 'semantic_relevance' }),
        expect.objectContaining({ dimension: 'source_binding' }),
      ])
    );
    expect(need.inferenceReceipt).toMatchObject({
      schema: 'bitcode.read-need-comprehension-synthesis.inference-receipt',
      pipelineName: 'ReadNeedComprehensionSynthesis',
      needId: need.needId,
      requestId: 'read-1',
      reviewState: 'needs_acceptance',
      mode: 'deterministic-fallback',
      sourceSafety: {
        protectedSourceVisible: false,
        rawProviderResponseVisible: false,
        unpaidAssetPackSourceVisible: false,
        credentialsSerialized: false,
      },
      reviewBoundary: {
        supportsResynthesisWithFeedback: true,
        acceptedNeedRequiredForFindingFits: true,
        feedbackHistoryCount: 0,
        previousNeedId: null,
      },
    });
    expect(need.inferenceReceipt?.phaseIds).toEqual([
      'ReadNeedComprehensionSynthesis.request',
      'ReadNeedComprehensionSynthesis.comprehend',
      'ReadNeedComprehensionSynthesis.measure',
      'ReadNeedComprehensionSynthesis.review',
    ]);
    expect(need.inferenceReceipt?.agentIds).toHaveLength(4);
    expect(need.inferenceReceipt?.ptrrStepIds).toHaveLength(16);
    expect(need.inferenceReceipt?.failsafeSequenceIds).toHaveLength(48);
    expect(need.inferenceReceipt?.thinkingsGenerationIds).toHaveLength(48);
    expect(need.inferenceReceipt?.promptTemplateIds).toEqual(
      expect.arrayContaining([
        'ReadNeedComprehensionSynthesis.prompt.comprehend.need-synthesizer.agent',
        'ReadNeedComprehensionSynthesis.prompt.need-synthesis',
      ])
    );
    expect(need.inferenceReceipt?.roots.receiptRoot).toMatch(/^sha256:/);
  });

  it('carries Read Request lineage and feedback through resynthesis', () => {
    const first = synthesizeReadNeedForPipelineInput({
      ...input,
      feedback: ['Keep proof roots prominent.'],
    });
    const second = synthesizeReadNeedForPipelineInput({
      ...input,
      previousReadNeed: first,
      feedback: ['Exclude settlement completion from Need comprehension.'],
    });

    expect(second.needId).not.toBe(first.needId);
    expect(second.request.previousNeedId).toBe(first.needId);
    expect(second.feedbackHistory).toEqual([
      'Keep proof roots prominent.',
      'Exclude settlement completion from Need comprehension.',
    ]);
    expect(second.request.feedbackHistory).toEqual(second.feedbackHistory);
    expect(second.reviewState).toBe('needs_acceptance');
    expect(second.inferenceReceipt?.reviewBoundary).toMatchObject({
      feedbackHistoryCount: 2,
      previousNeedId: first.needId,
    });
  });

  it('accepts a Need as the only admissible input to strict Finding Fits search', () => {
    const accepted = acceptReadNeed(synthesizeReadNeedForPipelineInput(input), '2026-05-18T00:00:00.000Z');

    expect(isAcceptedReadNeed(accepted)).toBe(true);
    expect(accepted.inferenceReceipt).toMatchObject({
      pipelineName: 'ReadNeedComprehensionSynthesis',
      reviewState: 'accepted',
      mode: 'deterministic-fallback',
      reviewBoundary: {
        acceptedNeedRequiredForFindingFits: true,
      },
    });
    expect(admitReadFitsFinding({ acceptedReadNeed: accepted, requireAcceptedReadNeed: true })).toMatchObject({
      admitted: true,
      acceptedNeed: accepted,
      blockers: [],
    });
    expect(readNeedToDepositorySearchRead(accepted)).toMatchObject({
      id: accepted.needId,
      prompt: accepted.read.prompt,
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
    });
  });

  it('runs real-inference ReadNeedComprehension through one ThinkingsGeneration contract when enabled', async () => {
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = '1';
    const llm = jest
      .fn()
      .mockResolvedValueOnce({
        content: JSON.stringify({
          analysis: 'The reader needs a source-bound Terminal readiness AssetPack.',
          steps: ['read request', 'bound source revision', 'extract closure criteria'],
          conclusion: 'Synthesize a narrow Need for Terminal readiness evidence.',
          confidence: 0.91,
        }),
      })
      .mockResolvedValueOnce({
        content: JSON.stringify({
          quality: 0.88,
          issues: [],
          suggestions: ['Keep protected source withheld before settlement.'],
          approved: true,
        }),
      })
      .mockResolvedValueOnce({
        content: JSON.stringify({
          requirements: [
            'Find source-bound evidence for the Terminal Deposit and Reading path.',
            'Keep the Need constrained to the selected repository revision.',
          ],
          closureCriteria: [
            'Finding Fits discovery must return source-bound fit deposit ids.',
            'AssetPack preview must expose only measurements and non-source metadata before settlement.',
          ],
          failureModes: ['protected_source_disclosed_before_settlement'],
          targetArtifactKinds: ['asset-pack-evidence', 'proof-root'],
          proofExpectations: ['ThinkingsGeneration telemetry contains reasoning, judgment, and typed output.'],
        }),
      });
    const execution = fakeInferenceExecution(llm);

    const need = await synthesizeReadNeedForPipelineInputWithInference(input, execution);

    expect(llm).toHaveBeenCalledTimes(3);
    expect(need.requirements).toContain('Find source-bound evidence for the Terminal Deposit and Reading path.');
    expect(need.closureCriteria).toContain('Finding Fits discovery must return source-bound fit deposit ids.');
    expect(need.failureModes).toContain('protected_source_disclosed_before_settlement');
    expect(need.targetArtifactKinds).toEqual(['asset-pack-evidence', 'proof-root']);
    expect(need.proofExpectations).toContain(
      'ThinkingsGeneration telemetry contains reasoning, judgment, and typed output.'
    );
    expect(need.reviewState).toBe('needs_acceptance');
    expect(need.inferenceReceipt).toMatchObject({
      pipelineName: 'ReadNeedComprehensionSynthesis',
      mode: 'real-inference',
      needId: need.needId,
      reviewState: 'needs_acceptance',
    });
    expect(execution.store).toHaveBeenCalledWith('bounded-inference', 'mode', 'thinkings-generation');
    expect(execution.store).toHaveBeenCalledWith(
      'bounded-inference',
      'stack',
      expect.objectContaining({
        failsafeSequence: ['prepare-concise-context', 'chunk-then-sum', 'stitch-until-complete'],
        thinkingsGenerationStages: ['reason', 'judge', 'structured_output'],
      })
    );
    expect(execution.store).toHaveBeenCalledWith('bounded-inference', 'status', 'success');
    expect(execution.store).toHaveBeenCalledWith(
      'read-need-comprehension',
      'inferenceReceipt',
      expect.objectContaining({
        pipelineName: 'ReadNeedComprehensionSynthesis',
        mode: 'real-inference',
        ptrrStepIds: expect.arrayContaining([
          'ReadNeedComprehensionSynthesis.comprehend.need-synthesizer.try',
        ]),
      })
    );
    expect(execution.store).toHaveBeenCalledWith(
      'llm',
      'input',
      expect.objectContaining({
        failsafeSequence: ['prepare-concise-context', 'chunk-then-sum', 'stitch-until-complete'],
        generationSequence: ['reason', 'judge', 'structured_output'],
      })
    );
  });

  it('blocks strict Finding Fits search before Need acceptance', async () => {
    const result = await runDepositorySearchForPipelineInput({
      ...input,
      requireAcceptedReadNeed: true,
      depositoryAssets: [depositoryAsset()],
    });

    expect(result.resultState).toBe('blocked_readiness');
    expect(result.resultReasons).toEqual(
      expect.arrayContaining([
        'Finding Fits search requires an accepted Read-Need before depository discovery.',
        'accepted_read_need_missing',
      ])
    );
    expect(result.candidateRanking).toHaveLength(0);
  });

  it('uses the accepted Need measurement and source constraints for Finding Fits', async () => {
    const acceptedReadNeed = acceptReadNeed(
      synthesizeReadNeedForPipelineInput(input),
      '2026-05-18T00:00:00.000Z'
    );

    const result = await runDepositorySearchForPipelineInput({
      ...input,
      acceptedReadNeed,
      requireAcceptedReadNeed: true,
      depositoryAssets: [depositoryAsset()],
    });

    expect(result.resultState).toBe('worthy_fit');
    expect(result.read.id).toBe(acceptedReadNeed.needId);
    expect(result.read.sourceCommit).toBe(acceptedReadNeed.sourceConstraints.sourceCommit);
    expect(result.selectedCandidateAssetIds).toEqual(['deposit-asset-1']);
  });

  it('derives a source-safe Share-to-Fee preview from accepted Need measurements', () => {
    const acceptedReadNeed = acceptReadNeed(synthesizeReadNeedForPipelineInput(input));
    const preview = buildShareToFeePreview({
      need: acceptedReadNeed,
      admittedFitQuality: 0.75,
    });

    expect(preview).toMatchObject({
      formula: 'sum(measurement.weight * measurement.volume * admitted_fit_quality)',
      needId: acceptedReadNeed.needId,
      needMeasurementRoot: acceptedReadNeed.measurementRoot,
      finalityState: 'preview_not_paid',
      payer: 'reader',
    });
    expect(preview.feeSchedule).toMatchObject({
      satsPerWeightedVolume: 1000,
      minimumSats: 546,
      dustFloorSats: 546,
      networkFeePosture: 'reader_wallet_authorized_before_broadcast',
    });
    expect(preview.measurementVector).toBe(acceptedReadNeed.pricingMeasurementInputs.measurementVector);
    expect(preview.quoteRoot).toMatch(/^sha256:/);
    expect(preview.sats).toBeGreaterThanOrEqual(546);
  });

  it('builds a source-safe AssetPack preview without unlocking protected source', async () => {
    const acceptedReadNeed = acceptReadNeed(
      synthesizeReadNeedForPipelineInput(input),
      '2026-05-18T00:00:00.000Z'
    );
    const search = await runDepositorySearchForPipelineInput({
      ...input,
      acceptedReadNeed,
      requireAcceptedReadNeed: true,
      depositoryAssets: [depositoryAsset()],
    });
    const fitResult = buildDepositoryFitResultEvidence(search);
    const preview = buildAssetPackSourceSafePreview({
      need: acceptedReadNeed,
      fitResult,
      rangeStart: 42,
      pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/6',
      createdAt: '2026-05-18T00:00:00.000Z',
    });

    expect(preview).toMatchObject({
      schema: 'bitcode.asset-pack.source-safe-preview',
      need: {
        needId: acceptedReadNeed.needId,
        measurementRoot: acceptedReadNeed.measurementRoot,
        reviewState: 'accepted',
      },
      fit: {
        resultState: 'worthy_fit',
        selectedCandidateAssetIds: ['deposit-asset-1'],
      },
      disclosurePolicy: {
        protectedSourceDisclosure: 'forbidden_before_settlement',
      },
      settlementBoundary: {
        payer: 'reader',
        payee: 'depositor',
        serverCustody: false,
        ownershipTruth: 'asset_pack_range_and_license_rows',
      },
      unlock: {
        state: 'pending_settlement',
        sourceAvailable: false,
      },
      delivery: {
        pullRequestTarget: 'https://github.com/engineeredsoftware/ENGI/pull/6',
        availableAfterSettlement: true,
      },
    });
    expect(preview.roots.previewRoot).toMatch(/^sha256:/);
    expect(preview.roots.sourceManifestRoot).toMatch(/^sha256:/);
    expect(preview.feeQuote.quoteRoot).toMatch(/^sha256:/);
    expect(preview.rangeProjection).toMatchObject({
      status: 'projected_not_minted',
      rangeStart: 42,
    });
    expect(preview.rangeProjection.rangeEndExclusive).toBe(
      preview.rangeProjection.rangeStart! + preview.rangeProjection.tokenCount
    );
    expect(preview.disclosurePolicy.withheldBeforeSettlement).toContain('protected source content');
  });

  it('keeps owner, licensed, pending-settlement, and denied read rights distinct', () => {
    expect(resolveAssetPackReadRightState({ hasOwnerClaim: true })).toBe('owner_read');
    expect(resolveAssetPackReadRightState({
      hasReadLicense: true,
      settlementReadbackComplete: true,
    })).toBe('licensed_read');
    expect(resolveAssetPackReadRightState({ settlementPending: true })).toBe('pending_settlement');
    expect(resolveAssetPackReadRightState({ policyDenied: true })).toBe('denied');
  });
});

function fakeInferenceExecution(llm: jest.Mock) {
  const values = new Map<string, unknown>();
  let execution: any;
  execution = {
    child: jest.fn(() => execution),
    getRoot: jest.fn(() => execution),
    store: jest.fn((namespace: string, key: string, value: unknown) => {
      values.set(`${namespace}:${key}`, value);
    }),
    get: jest.fn((namespace: string, key: string) => values.get(`${namespace}:${key}`)),
    findUp: jest.fn((namespace: string, key: string) => values.get(`${namespace}:${key}`)),
    llms: {
      getDefaultLLM: jest.fn(() => llm),
    },
  };
  return execution;
}
