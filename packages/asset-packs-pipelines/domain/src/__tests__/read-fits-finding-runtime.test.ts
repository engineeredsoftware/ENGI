import { Execution } from '@bitcode/execution-generics';
import {
  acceptReadNeed,
  admitReadFitsFinding,
  synthesizeReadNeedForPipelineInput,
} from '../read-need';
import {
  buildDepositoryFitResultEvidence,
  runDepositorySearchForPipelineInput,
  searchDepositoryAssetSpace,
  type DepositoryAsset,
} from '../depository-search';
import {
  buildReadFitsFindingRuntime,
  buildReadFitsFindingRuntimeForPipelineInput,
  persistReadFitsFindingRuntime,
  summarizeReadFitsFindingRuntime,
} from '../read-fits-finding-runtime';

const sourceRevision = {
  repositoryFullName: 'engineeredsoftware/ENGI',
  branch: 'main',
  commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
};

const readInput = {
  read: {
    id: 'read-fits-runtime',
    prompt:
      'Find source-bound fit deposits for Deposit, Reading, AssetPack preview, proof root readback, and ledger reconciliation.',
  },
  sourceRevision,
  targetArtifactKinds: [
    'repository-revision',
    'fit-quality-receipt',
    'asset-pack-evidence',
    'proof-root',
    'reconciliation-readback',
  ],
  closureCriteria: [
    'Fit deposits must bind repository, branch, commit, proof root, measurement root, and reconciliation readback root.',
  ],
  failureModes: ['mock repository leakage', 'missing proof root readback'],
};

function depositoryAsset(overrides: Partial<DepositoryAsset> = {}): DepositoryAsset {
  const assetId = overrides.assetId || 'fit-deposit-runtime-1';
  return {
    assetId,
    title: 'Reading source-bound fit deposit',
    summary:
      'Source-safe summary for Deposit, Reading, AssetPack preview, proof root, and ledger reconciliation.',
    artifactKind: 'repository-revision',
    repositoryFullName: sourceRevision.repositoryFullName,
    sourceBranch: sourceRevision.branch,
    sourceCommit: sourceRevision.commit,
    contentRoot: `sha256:${assetId}-content`,
    contentUnits: [
      {
        unitId: `${assetId}:unit-1`,
        unitKind: 'repository-revision',
        text:
          'product path Deposit Read Finding Fits AssetPack preview proof root finality readback Supabase ledger reconciliation.',
        unitHash: `sha256:${assetId}-unit`,
      },
    ],
    verificationEvidence: {
      proofRoot: `sha256:${assetId}-proof`,
      measurementRoot: `sha256:${assetId}-measurement`,
      reconciliationReadbackRoot: `sha256:${assetId}-reconciliation`,
    },
    hasWalletOrAttestationProof: true,
    hasAssetMeasurementEvidence: true,
    ...overrides,
  };
}

function acceptedNeed() {
  return acceptReadNeed(
    synthesizeReadNeedForPipelineInput(readInput),
    '2026-05-18T00:00:00.000Z',
  );
}

describe('ReadFitsFinding runtime, ranking, and replay', () => {
  it('builds a source-safe runtime around many-fit search results', async () => {
    const acceptedReadNeed = acceptedNeed();
    const search = await runDepositorySearchForPipelineInput({
      ...readInput,
      acceptedReadNeed,
      requireAcceptedReadNeed: true,
      depositoryAssets: [
        depositoryAsset({ assetId: 'fit-deposit-runtime-1' }),
        depositoryAsset({ assetId: 'fit-deposit-runtime-2', title: 'product proof readback second fit' }),
      ],
    });
    const fitResult = buildDepositoryFitResultEvidence(search);
    const runtime = buildReadFitsFindingRuntime({
      admission: admitReadFitsFinding({ acceptedReadNeed, requireAcceptedReadNeed: true }),
      result: search,
      fitResult,
    });

    expect(runtime.schema).toBe('bitcode.read-fits-finding-runtime');
    expect(runtime.pipelineName).toBe('ReadFitsFindingSynthesis');
    expect(runtime.acceptedNeed).toMatchObject({
      needId: acceptedReadNeed.needId,
      requestId: acceptedReadNeed.request.requestId,
      reviewState: 'accepted',
      measurementRoot: acceptedReadNeed.measurementRoot,
    });
    expect(runtime.findingFitsAdmission).toEqual({ admitted: true, blockers: [] });
    expect(runtime.resultState).toBe('worthy_fit');
    expect(runtime.searchSummary).toMatchObject({
      searchedAssetCount: 2,
      rankedCandidateCount: 2,
      selectedCandidateCount: 2,
      fitDepositCount: 2,
      blockedCandidateCount: 0,
      rejectedCandidateCount: 0,
    });
    expect(runtime.searchSummary.fitDepositAssetIds).toEqual([
      'fit-deposit-runtime-1',
      'fit-deposit-runtime-2',
    ]);
    expect(runtime.queryPlan.channelIds).toEqual([
      'lexical',
      'symbolic',
      'path',
      'metadata',
      'measurement',
      'embedding-vector',
      'provider-specific',
    ]);
    expect(runtime.embeddingPolicy).toMatchObject({
      provider: 'openai',
      model: 'text-embedding-3-small',
      dimensions: 1536,
      vectorStore: {
        rpc: 'match_deliverable_vectors',
        distanceMetric: 'cosine',
      },
    });
    expect(runtime.telemetryReceipts[0]).toMatchObject({
      schema: 'bitcode.read-fits-finding.telemetry-receipt',
      phaseIds: expect.arrayContaining(['ReadFitsFindingSynthesis.discovery']),
    });
    expect(runtime.telemetryReceipts[0].phaseIds).toHaveLength(7);
    expect(runtime.telemetryReceipts[0].agentIds).toHaveLength(8);
    expect(runtime.telemetryReceipts[0].ptrrStepIds).toHaveLength(32);
    expect(runtime.telemetryReceipts[0].failsafeSequenceIds).toHaveLength(96);
    expect(runtime.telemetryReceipts[0].thinkingsGenerationIds).toHaveLength(96);
    expect(runtime.replayReceipt).toMatchObject({
      schema: 'bitcode.read-fits-finding.replay-receipt',
      replayMode: 'source-safe-query-ranking-selected-fit-replay',
      acceptedNeedId: acceptedReadNeed.needId,
      resultState: 'worthy_fit',
      queryPlanRoot: search.queryPlan.queryPlanRoot,
      queryRoot: search.queryRoot,
      rankingRoot: search.rankingRoot,
      selectedFitProvenanceRoot: search.searchReceipt.selectedFitProvenanceRoot,
      verified: {
        queryPlanRootMatchesSearchReceipt: true,
        queryRootMatchesSearchReceipt: true,
        rankingRootMatchesSearchReceipt: true,
        selectedFitProvenanceRootMatchesSearchReceipt: true,
        embeddingPolicyMatchesSearchReceipt: true,
        candidateCountsMatchSearchReceipt: true,
      },
    });
    expect(runtime.storageProjection.map((record) => record.recordKind)).toEqual(
      expect.arrayContaining([
        'accepted_need_admission',
        'query_plan',
        'search_channel',
        'candidate_ranking',
        'selected_fit_provenance',
        'fit_result',
        'replay_receipt',
        'repair_posture',
        'telemetry_receipt',
      ]),
    );
    expect(runtime.storageProjection.every((record) => record.sourceSafety.protectedSourceVisible === false)).toBe(true);
    expect(runtime.storageProjection.every((record) => record.sourceSafety.rawProviderResponseVisible === false)).toBe(true);
    expect(runtime.searchSummary.selectedCandidateCount).toBe(2);
    expect(runtime.searchSummary.fitDepositAssetIds).toEqual(['fit-deposit-runtime-1', 'fit-deposit-runtime-2']);
    expect(runtime.sourceSafety).toMatchObject({
      sourceSafetyClass: 'source_safe_read_fits_finding_runtime_metadata',
      protectedSourceVisible: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
    });
    expect(JSON.stringify(runtime)).not.toContain('product path Deposit Read Finding Fits');
  });

  it('blocks and records repair posture when the accepted Need is missing', async () => {
    const runtime = await buildReadFitsFindingRuntimeForPipelineInput({
      ...readInput,
      requireAcceptedReadNeed: true,
      depositoryAssets: [depositoryAsset()],
    });

    expect(runtime.acceptedNeed).toBeNull();
    expect(runtime.resultState).toBe('blocked_readiness');
    expect(runtime.findingFitsAdmission.admitted).toBe(false);
    expect(runtime.findingFitsAdmission.blockers).toContain('accepted_read_need_missing');
    expect(runtime.repairPosture.nextActions).toContain('accept_read_need');
    expect(runtime.searchSummary.rankedCandidateCount).toBe(0);
    expect(runtime.replayReceipt.acceptedNeedId).toBeNull();
  });

  it('records adjustment repair posture when no worthy fit is found', async () => {
    const acceptedReadNeed = acceptedNeed();
    const search = await searchDepositoryAssetSpace({
      read: {
        id: 'read-no-worthy-fit',
        prompt: 'Plan a bakery loyalty marketing landing page with seasonal menu photography.',
        repositoryFullName: null,
        sourceBranch: null,
        sourceCommit: null,
        targetArtifactKinds: ['marketing-copy'],
        closureCriteria: ['Landing page copy is ready for a cafe promotion.'],
        failureModes: [],
      },
      assets: [depositoryAsset()],
    });
    const runtime = buildReadFitsFindingRuntime({
      admission: admitReadFitsFinding({ acceptedReadNeed, requireAcceptedReadNeed: true }),
      result: search,
    });

    expect(runtime.resultState).toBe('no_worthy_fit');
    expect(runtime.repairPosture.nextActions).toContain('adjust_need_constraints_or_thresholds');
    expect(runtime.repairPosture.sourceSafeReason).toContain('Finding Fits remains repairable');
  });

  it('records source-safe blocked repair posture for proof or readback gaps', async () => {
    const acceptedReadNeed = acceptedNeed();
    const runtime = await buildReadFitsFindingRuntimeForPipelineInput({
      ...readInput,
      acceptedReadNeed,
      requireAcceptedReadNeed: true,
      targetArtifactKinds: ['marketing-copy'],
      depositoryAssets: [
        depositoryAsset({
          verificationEvidence: null,
          hasWalletOrAttestationProof: false,
          hasAssetMeasurementEvidence: true,
        }),
      ],
    });

    expect(runtime.resultState).toBe('blocked_readiness');
    expect(runtime.repairPosture.nextActions).toContain('repair_candidate_proof');
    expect(runtime.repairPosture.sourceSafeReason).toContain('Finding Fits remains repairable');
  });

  it('persists replay, source-safe ranking, and repair records to execution storage', async () => {
    const execution = new Execution('read-fits-runtime-test');
    const acceptedReadNeed = acceptedNeed();
    const search = await runDepositorySearchForPipelineInput({
      ...readInput,
      acceptedReadNeed,
      requireAcceptedReadNeed: true,
      depositoryAssets: [depositoryAsset()],
    }, execution as any);
    const runtime = buildReadFitsFindingRuntime({
      admission: admitReadFitsFinding({ acceptedReadNeed, requireAcceptedReadNeed: true }),
      result: search,
    });

    persistReadFitsFindingRuntime(execution as any, runtime);

    expect(execution.get('read/finding-fits', 'runtime')).toMatchObject({
      schema: 'bitcode.read-fits-finding-runtime',
      resultState: 'worthy_fit',
    });
    expect(execution.get('read/finding-fits', 'replayReceipt')).toMatchObject({
      replayRoot: runtime.replayReceipt.replayRoot,
    });
    expect(execution.get('depository/search', 'sourceSafeCandidateRanking')[0]).toMatchObject({
      assetId: 'fit-deposit-runtime-1',
      selectedUnits: [
        expect.objectContaining({
          unitId: 'fit-deposit-runtime-1:supply-index-source-safe-unit',
          unitKind: 'depository-supply-index',
        }),
      ],
    });
    expect(execution.get('fit', 'sourceSafeResult')).toMatchObject({
      schema: 'bitcode.asset-pack.fit-result',
      resultState: 'worthy_fit',
    });
  });

  it('summarizes runtime evidence for source-safe UI and protocol readback', async () => {
    const acceptedReadNeed = acceptedNeed();
    const search = await runDepositorySearchForPipelineInput({
      ...readInput,
      acceptedReadNeed,
      requireAcceptedReadNeed: true,
      depositoryAssets: [depositoryAsset()],
    });
    const runtime = buildReadFitsFindingRuntime({
      admission: admitReadFitsFinding({ acceptedReadNeed, requireAcceptedReadNeed: true }),
      result: search,
    });
    const summary = summarizeReadFitsFindingRuntime(runtime);

    expect(summary).toMatchObject({
      schema: 'bitcode.read-fits-finding-runtime',
      pipelineName: 'ReadFitsFindingSynthesis',
      resultState: 'worthy_fit',
      storageRecordCount: runtime.storageProjection.length,
      telemetryReceiptCount: 1,
      pipelineContract: {
        phaseCount: 7,
        ptrrAgentCount: 8,
        ptrrStepCount: 32,
        thinkingsGenerationCount: 96,
      },
    });
    expect(JSON.stringify(summary)).not.toContain('product path Deposit Read Finding Fits');
  });
});
