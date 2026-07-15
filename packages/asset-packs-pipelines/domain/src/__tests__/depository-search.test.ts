// @ts-nocheck
import assetPack, {
  normalizePipelineDepositoryAssets,
  searchDepositoryAssetSpace,
  type DepositoryAsset,
  type DepositorySearchRead,
} from '../index';
import { Execution } from '@bitcode/execution-generics';

const read: DepositorySearchRead = {
  id: 'read-terminal-fit',
  prompt:
    'Read the deposited repository revision and determine whether it contains a complete non-mock product path through Deposit, Read/Fit, AssetPack evidence, proof finality readback, and Supabase ledger reconciliation.',
  repositoryFullName: 'engineeredsoftware/ENGI',
  sourceBranch: 'main',
  sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
  targetArtifactKinds: [
    'repository-revision',
    'fit-quality-receipt',
    'asset-pack-evidence',
    'proof-root',
    'reconciliation-readback',
  ],
  closureCriteria: [
    'Deposit evidence is bound to repository, branch, commit, and signer.',
    'Fit evidence references the deposited repository revision and candidate AssetPack.',
  ],
  failureModes: ['mock repository leakage', 'missing proof finality posture'],
};

function asset(overrides: Partial<DepositoryAsset> = {}): DepositoryAsset {
  return {
    assetId: 'asset_repository-revision-deposit-engineeredsoftware-engi',
    title: 'Deposited ENGI repository revision',
    summary:
      'Repository revision evidence for Deposit, Read/Fit, AssetPack evidence, proof-root, finality readback, and Supabase ledger reconciliation.',
    artifactKind: 'repository-revision',
    artifactType: 'repository/revision',
    repositoryFullName: 'engineeredsoftware/ENGI',
    sourceBranch: 'main',
    sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
    contentRoot: 'sha256:test-content-root',
    contentUnits: [
      {
        unitId: 'asset_repository-revision-deposit-engineeredsoftware-engi:unit-1',
        unitKind: 'repository-revision',
        text:
          'product commercial path records repository revision Deposit evidence, measured Read, Fit quality receipt, AssetPack evidence, proof-root, finality readback, wallet authorization, and reconciliation readback.',
        codeAnalysisFacts: {
          symbols: ['ProductDepositReadWorkbench', 'AssetPackPipelineHarness'],
          paths: ['apps/uapi/components/reads/models/deposit-read-workbench.ts'],
          configKeys: ['BITCODE_PIPELINE_STREAM_TO_DATABASE'],
          stackTags: ['terminal', 'assetpack', 'supabase'],
          constraints: ['no mock repository leakage', 'source revision proof'],
        },
      },
    ],
    signingSurface: { payloadHash: 'sha256:signed' },
    githubBoundary: { sourceProvider: 'github', sourceRepo: 'engineeredsoftware/ENGI' },
    assetMeasurement: { targetKindCount: 5 },
    measurementProvenance: [{ stage: 'deposit-measurement' }],
    verificationEvidence: {
      proofRoot: 'sha256:test-proof-root',
      measurementRoot: 'sha256:test-measurement-root',
      reconciliationReadbackRoot: 'sha256:test-reconciliation-readback-root',
    },
    ...overrides,
  };
}

function findStored(execution: any, namespace: string, key: string): any {
  const value = execution?.get?.(namespace, key);
  if (value !== undefined) return value;
  for (const child of execution?.children?.values?.() || []) {
    const childValue = findStored(child, namespace, key);
    if (childValue !== undefined) return childValue;
  }
  return undefined;
}

describe('AssetPack depository search', () => {
  it('returns a worthy fit only for source-bound proof-bearing deposited assets', async () => {
    const result = await searchDepositoryAssetSpace({
      read,
      assets: [asset()],
    });

    expect(result.resultState).toBe('worthy_fit');
    expect(result.fitDepositAssetIds).toEqual([
      'asset_repository-revision-deposit-engineeredsoftware-engi',
    ]);
    expect(result.fitDeposits).toHaveLength(1);
    expect(result.selectedCandidateAssetIds).toEqual([
      'asset_repository-revision-deposit-engineeredsoftware-engi',
    ]);
    expect(result.selectedCandidates[0].verification.repositoryBound).toBe(true);
    expect(result.selectedCandidates[0].verification.sourceRevisionBound).toBe(true);
    expect(result.selectedCandidates[0].ranking.finalScore).toBeGreaterThanOrEqual(
      result.thresholds.worthyScore
    );
    expect(result.embeddingPolicy).toMatchObject({
      provider: 'openai',
      model: 'text-embedding-3-small',
      dimensions: 1536,
      vectorStore: {
        table: 'deliverable_vectors',
        rpc: 'match_deliverable_vectors',
        distanceMetric: 'cosine',
      },
    });
    expect(result.queryPlan).toMatchObject({
      schema: 'bitcode.asset-pack.depository-search.query-plan',
      pipelineName: 'ReadFitsFindingSynthesis',
      derivedFrom: 'accepted-read-need',
      channelIds: [
        'lexical',
        'symbolic',
        'path',
        'metadata',
        'measurement',
        'embedding-vector',
        'provider-specific',
      ],
      targetArtifactKindCount: 5,
      repositoryConstraintPresent: true,
      sourceRevisionConstraintPresent: true,
    });
    expect(result.queryPlan.queryPlanRoot).toMatch(/^sha256:/);
    expect(result.searchReceipt).toMatchObject({
      schema: 'bitcode.read-fits-finding-synthesis.search-receipt',
      pipelineName: 'ReadFitsFindingSynthesis',
      receiptMode: 'source-safe-depository-search-and-embeddings',
      searchChannelIds: result.queryPlan.channelIds,
      toolIds: [
        'ReadFitsFindingSynthesis.tool.lexical-depository-search',
        'ReadFitsFindingSynthesis.tool.vector-depository-search',
        'ReadFitsFindingSynthesis.tool.verification-evidence',
        'ReadFitsFindingSynthesis.tool.vcs-create-pull-request',
      ],
      candidateCounts: {
        ranked: 1,
        selected: 1,
        fitDeposits: 1,
        blocked: 0,
        rejected: 0,
      },
      sourceSafety: {
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        rawProviderResponseVisible: false,
        unpaidAssetPackSourceVisible: false,
        credentialsSerialized: false,
      },
    });
    expect(result.searchReceipt.phaseIds).toHaveLength(7);
    expect(result.searchReceipt.agentIds).toHaveLength(8);
    expect(result.searchReceipt.ptrrStepIds).toHaveLength(32);
    expect(result.searchReceipt.failsafeSequenceIds).toHaveLength(96);
    expect(result.searchReceipt.thinkingsGenerationIds).toHaveLength(96);
    expect(result.searchReceipt.roots.receiptRoot).toMatch(/^sha256:/);
    expect(result.searchReceipt.selectedFitProvenanceRoot).toMatch(/^sha256:/);
    expect(result.candidateRanking[0].ranking.channelScores).toMatchObject({
      lexical: expect.any(Number),
      symbolic: expect.any(Number),
      path: expect.any(Number),
      metadata: expect.any(Number),
      measurement: 1,
      embeddingVector: expect.any(Number),
      providerSpecific: expect.any(Number),
    });
    expect(result.queryRoot).toMatch(/^sha256:/);
    expect(result.rankingRoot).toMatch(/^sha256:/);
  });

  it('discovers every qualifying fit deposit above the configured thresholds for implementation context', async () => {
    const result = await searchDepositoryAssetSpace({
      read,
      assets: [
        asset({ assetId: 'fit-deposit-1', title: 'product path deposit one' }),
        asset({
          assetId: 'fit-deposit-2',
          title: 'product path deposit two',
          contentRoot: 'sha256:test-content-root-two',
          contentUnits: [
            {
              unitId: 'fit-deposit-2:unit-1',
              unitKind: 'repository-revision',
              text:
                'Deposit Read Fit AssetPack evidence proof-root finality readback and Supabase ledger reconciliation for product.',
            },
          ],
        }),
      ],
    });

    expect(result.resultState).toBe('worthy_fit');
    expect(result.fitDepositAssetIds).toEqual(['fit-deposit-1', 'fit-deposit-2']);
    expect(result.fitDeposits.map((fit) => fit.assetId)).toEqual(result.fitDepositAssetIds);
    expect(result.selectedCandidateAssetIds).toEqual(result.fitDepositAssetIds);
    expect(result.searchReceipt.candidateCounts.fitDeposits).toBe(2);
    expect(result.searchReceipt.thresholdPosture.maxSelectedCandidates).toBe(12);
  });

  it('blocks readiness when candidate search finds source evidence without proof', async () => {
    const result = await searchDepositoryAssetSpace({
      read,
      assets: [
        asset({
          signingSurface: null,
          githubBoundary: null,
          attestations: [],
          verificationEvidence: {
            measurementRoot: 'sha256:test-measurement-root',
            reconciliationReadbackRoot: 'sha256:test-reconciliation-readback-root',
          },
          hasWalletOrAttestationProof: false,
        }),
      ],
    });

    expect(result.resultState).toBe('blocked_readiness');
    expect(result.selectedCandidates[0].verification.warnings).toContain(
      'wallet_or_attestation_proof_missing'
    );
  });

  it('blocks readiness when a proof-bearing candidate lacks explicit measurement evidence', async () => {
    const result = await searchDepositoryAssetSpace({
      read,
      assets: [
        asset({
          assetMeasurement: null,
          measurementProvenance: [],
          verificationEvidence: {
            proofRoot: 'sha256:test-proof-root',
            reconciliationReadbackRoot: 'sha256:test-reconciliation-readback-root',
          },
          hasAssetMeasurementEvidence: false,
        }),
      ],
    });

    expect(result.resultState).toBe('blocked_readiness');
    expect(result.selectedCandidates[0].verification.warnings).toContain(
      'asset_measurement_evidence_missing'
    );
  });

  it('blocks readiness when a read requires proof and reconciliation readback roots that are not present', async () => {
    const result = await searchDepositoryAssetSpace({
      read,
      assets: [
        asset({
          verificationEvidence: null,
          hasWalletOrAttestationProof: true,
          hasAssetMeasurementEvidence: true,
        }),
      ],
    });

    expect(result.resultState).toBe('blocked_readiness');
    expect(result.selectedCandidates[0].verification.warnings).toEqual(
      expect.arrayContaining(['proof_root_readback_missing', 'reconciliation_readback_missing'])
    );
    expect(result.selectedCandidates[0].useTier).toBe('context-only');
  });

  it('returns no-worthy-fit for unrelated reads instead of relying on repository match alone', async () => {
    const result = await searchDepositoryAssetSpace({
      read: {
        ...read,
        prompt: 'Plan a bakery loyalty marketing landing page with seasonal menu photography.',
        targetArtifactKinds: ['marketing-copy'],
        closureCriteria: ['Landing page copy is ready for a cafe promotion.'],
        failureModes: [],
      },
      assets: [asset()],
    });

    expect(result.resultState).toBe('no_worthy_fit');
    expect(result.selectedCandidates).toHaveLength(0);
  });

  it('fails closed on frontier or mock repository leakage even when text matches', async () => {
    const result = await searchDepositoryAssetSpace({
      read,
      assets: [
        asset({
          assetId: 'asset_frontier_demo',
          repositoryFullName: 'frontier/ENGI',
          githubBoundary: { sourceProvider: 'demo', sourceRepo: 'frontier/ENGI' },
        }),
      ],
    });

    expect(result.resultState).toBe('blocked_readiness');
    expect(result.blockedCandidates[0].verification.blockers).toEqual(
      expect.arrayContaining(['frontier_repository_reference', 'mock_source_provider'])
    );
  });

  it('normalizes manifest-only deposits into searchable source-bound assets', () => {
    const normalized = normalizePipelineDepositoryAssets({
      sourceRevision: {
        repositoryFullName: 'engineeredsoftware/ENGI',
        branch: 'main',
        commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      },
      deposit: {
        id: 'deposit-1',
        assetId: 'asset-1',
        hasWalletOrAttestationProof: true,
        hasAssetMeasurementEvidence: true,
        proofRoot: 'sha256:manifest-proof',
        measurementRoot: 'sha256:manifest-measurement',
        reconciliationReadbackRoot: 'sha256:manifest-readback',
      },
    });

    expect(normalized).toHaveLength(1);
    expect(normalized[0].assetId).toBe('asset-1');
    expect(normalized[0].repositoryFullName).toBe('engineeredsoftware/ENGI');
    expect(normalized[0].hasWalletOrAttestationProof).toBe(true);
    expect(normalized[0].verificationEvidence).toMatchObject({
      proofRoot: 'sha256:manifest-proof',
      measurementRoot: 'sha256:manifest-measurement',
      reconciliationReadbackRoot: 'sha256:manifest-readback',
    });
  });

  it('stores depository search and fit result evidence during pipeline preprocess', async () => {
    const exec = new Execution('asset-pack:depository-search-test');

    const output = await assetPack(
      {
        read: read.prompt,
        definitionOfRead: read.prompt,
        repository: {
          fullName: read.repositoryFullName,
          branch: read.sourceBranch,
          commit: read.sourceCommit,
        },
        sourceRevision: {
          repositoryFullName: read.repositoryFullName,
          branch: read.sourceBranch,
          commit: read.sourceCommit,
        },
        depositoryAssets: [asset()],
        deliveryMechanismTemplate: 'pull-request',
      },
      exec as any
    );

    expect(findStored(exec, 'fit', 'resultState')).toBe('worthy_fit');
    expect(findStored(exec, 'depository/search', 'result')?.resultState).toBe('worthy_fit');
    expect(findStored(exec, 'depository/search', 'embeddingPolicy')?.dimensions).toBe(1536);
    expect(findStored(exec, 'depository/search', 'queryPlan')?.channelIds).toEqual([
      'lexical',
      'symbolic',
      'path',
      'metadata',
      'measurement',
      'embedding-vector',
      'provider-specific',
    ]);
    expect(findStored(exec, 'depository/search', 'searchReceipt')?.candidateCounts).toMatchObject({
      ranked: 1,
      selected: 1,
      fitDeposits: 1,
      blocked: 0,
      rejected: 0,
    });
    expect(findStored(exec, 'depository/search', 'toolTelemetry')).toEqual([
      expect.objectContaining({
        tool: 'ReadFitsFindingSynthesis.tool.lexical-depository-search',
        phase: 'ReadFitsFindingSynthesis.discovery',
        agent: 'ReadFitsFindingSynthesis.discovery.finding-fits',
        step: 'ReadFitsFindingSynthesis.discovery.finding-fits.try',
        output: expect.objectContaining({
          resultState: 'worthy_fit',
          fitDepositAssetIds: ['asset_repository-revision-deposit-engineeredsoftware-engi'],
          queryRoot: expect.stringMatching(/^sha256:/),
          rankingRoot: expect.stringMatching(/^sha256:/),
          queryPlanRoot: expect.stringMatching(/^sha256:/),
          selectedFitProvenanceRoot: expect.stringMatching(/^sha256:/),
        }),
      }),
      expect.objectContaining({
        tool: 'ReadFitsFindingSynthesis.tool.vector-depository-search',
        output: expect.objectContaining({
          resultState: 'embedding_policy_declared',
          vectorStore: expect.objectContaining({
            table: 'deliverable_vectors',
            rpc: 'match_deliverable_vectors',
          }),
        }),
      }),
    ]);
    expect(findStored(exec, 'tools', 'lexical-depository-search')?.tool).toBe(
      'ReadFitsFindingSynthesis.tool.lexical-depository-search'
    );
    expect(findStored(exec, 'tools', 'vector-depository-search')?.tool).toBe(
      'ReadFitsFindingSynthesis.tool.vector-depository-search'
    );
    expect(findStored(exec, 'read/finding-fits', 'runtime')).toMatchObject({
      schema: 'bitcode.read-fits-finding-runtime',
      pipelineName: 'ReadFitsFindingSynthesis',
      resultState: 'worthy_fit',
      replayReceipt: expect.objectContaining({
        replayMode: 'source-safe-query-ranking-selected-fit-replay',
        verified: expect.objectContaining({
          queryRootMatchesSearchReceipt: true,
          rankingRootMatchesSearchReceipt: true,
          candidateCountsMatchSearchReceipt: true,
        }),
      }),
    });
    expect(findStored(exec, 'read/finding-fits', 'replayRoot')).toMatch(/^sha256:/);
    expect(findStored(exec, 'depository/search', 'sourceSafeCandidateRanking')?.[0]).toMatchObject({
      assetId: 'asset_repository-revision-deposit-engineeredsoftware-engi',
    });
    expect(output.fitResult.resultState).toBe('worthy_fit');
    expect(output.fitResult.fitDepositAssetIds).toEqual([
      'asset_repository-revision-deposit-engineeredsoftware-engi',
    ]);
    expect(output.fitResult.selectionTrace.fitDeposits[0]).toMatchObject({
      assetId: 'asset_repository-revision-deposit-engineeredsoftware-engi',
    });
    expect(output.fitResult.embeddingPolicy.model).toBe('text-embedding-3-small');
    expect(['settlement-eligible', 'patch-eligible']).toContain(
      output.fitResult.selectionTrace.selectedCandidates[0].useTier
    );
    expect(output.fitResult.selectionTrace.selectedCandidates[0]).toMatchObject({
      assetId: 'asset_repository-revision-deposit-engineeredsoftware-engi',
      sourceBinding: {
        repositoryFullName: 'engineeredsoftware/ENGI',
        sourceBranch: 'main',
        sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      },
      scores: {
        proofScore: 1,
        measurementScore: 1,
      },
      proofEvidence: {
        hasWalletOrAttestationProof: true,
        signingSurfacePresent: true,
        proofRoot: 'sha256:test-proof-root',
      },
      measurementEvidence: {
        hasAssetMeasurementEvidence: true,
        assetMeasurementPresent: true,
        measurementRoot: 'sha256:test-measurement-root',
      },
      readbackEvidence: {
        reconciliationReadbackPresent: true,
        reconciliationReadbackRoot: 'sha256:test-reconciliation-readback-root',
      },
    });
    expect(findStored(exec, 'fit', 'selectionTrace')?.selectedCandidates[0].selectedUnits[0]).toMatchObject({
      unitId: 'asset_repository-revision-deposit-engineeredsoftware-engi:supply-index-source-safe-unit',
      unitKind: 'depository-supply-index',
    });
    expect(output.depositorySearch.selectedCandidateAssetIds).toEqual([
      'asset_repository-revision-deposit-engineeredsoftware-engi',
    ]);
    expect(output.depositorySearch.fitDepositAssetIds).toEqual([
      'asset_repository-revision-deposit-engineeredsoftware-engi',
    ]);
  });
});
