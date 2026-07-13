import { executionContext } from '@bitcode/generic-tools-editing/execution-context';
import { lexicalDepositorySearchTool } from '../tools/AssetPackLexicalDepositorySearchTool';
import { assetPackVerificationEvidenceTool } from '../tools/AssetPackVerificationEvidenceTool';

describe('lexical depository search tool', () => {
  it('reads back the authoritative depository search result from execution context', async () => {
    const storedResult = {
      schema: 'bitcode.asset-pack.depository-search',
      resultState: 'worthy_fit',
      resultReasons: ['Selected 1 proof-bearing AssetPack candidate for this Read.'],
      read: {
        prompt: 'Read deposited source evidence.',
        targetArtifactKinds: [],
        closureCriteria: [],
        failureModes: [],
      },
      thresholds: {
        reviewScore: 0.75,
        worthyScore: 0.85,
        semanticScore: 0.35,
        maxSelectedCandidates: 3,
      },
      searchedAssetCount: 1,
      selectedCandidateAssetIds: ['asset-1'],
      selectedCandidates: [
        {
          assetId: 'asset-1',
          title: 'Deposited source asset',
          useTier: 'settlement-eligible',
          selectedUnits: [],
          ranking: {
            finalScore: 0.91,
            semanticScore: 0.9,
          },
          verification: {
            blockers: [],
            warnings: [],
          },
          recall: {
            matchedTerms: ['deposit', 'read'],
          },
        },
      ],
      rejectedCandidates: [],
      blockedCandidates: [],
      candidateRanking: [],
      embeddingPolicy: {
        provider: 'openai',
        model: 'text-embedding-3-small',
      },
      queryRoot: 'sha256:query',
      rankingRoot: 'sha256:ranking',
      createdAt: '2026-05-17T00:00:00.000Z',
    };
    const execution = {
      findUp: jest.fn((namespace: string, key: string) => {
        if (namespace === 'depository/search' && key === 'result') return storedResult;
        return undefined;
      }),
    };

    const output = await executionContext.run(execution as any, () =>
      lexicalDepositorySearchTool.execute({ repositoryFullName: 'engineeredsoftware/ENGI' }),
    );

    expect(output).toMatchObject({
      schema: 'bitcode.asset-pack.lexical-depository-search-tool-result',
      readbackSource: 'execution-store',
      resultState: 'worthy_fit',
      selectedCandidateAssetIds: ['asset-1'],
      searchedAssetCount: 1,
      queryRoot: 'sha256:query',
      rankingRoot: 'sha256:ranking',
      fitResult: {
        schema: 'bitcode.asset-pack.fit-result',
        resultState: 'worthy_fit',
        selectedCandidateAssetIds: ['asset-1'],
      },
    });
  });
});

describe('AssetPack verification evidence tool', () => {
  it('reads back verification-only evidence for risk admission', async () => {
    const storedResult = {
      schema: 'bitcode.asset-pack.depository-search',
      resultState: 'worthy_fit',
      resultReasons: ['Selected 1 proof-bearing AssetPack candidate for this Read.'],
      read: {
        prompt: 'Read deposited source evidence.',
        targetArtifactKinds: [],
        closureCriteria: [],
        failureModes: [],
      },
      thresholds: {
        reviewScore: 0.75,
        worthyScore: 0.85,
        semanticScore: 0.35,
        maxSelectedCandidates: 3,
      },
      searchedAssetCount: 1,
      selectedCandidateAssetIds: ['asset-1'],
      selectedCandidates: [
        {
          assetId: 'asset-1',
          title: 'Deposited source asset',
          asset: {
            repositoryFullName: 'engineeredsoftware/ENGI',
            sourceBranch: 'main',
            sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
            contentRoot: 'sha256:content',
          },
          useTier: 'settlement-eligible',
          selectedUnits: [],
          ranking: {
            finalScore: 0.91,
            semanticScore: 0.9,
            proofScore: 1,
            measurementScore: 1,
            penaltyMass: 0,
          },
          verification: {
            repositoryBound: true,
            sourceRevisionBound: true,
            hasWalletOrAttestationProof: true,
            hasAssetMeasurementEvidence: true,
            proofRootPresent: true,
            reconciliationReadbackRequired: true,
            reconciliationReadbackPresent: true,
            blockers: [],
            warnings: [],
          },
          recall: {
            matchedTerms: ['deposit', 'read'],
            matchedUnitIds: ['unit-1'],
            providerMatches: [{ providerId: 'lexical', score: 1 }],
          },
        },
      ],
      rejectedCandidates: [],
      blockedCandidates: [],
      candidateRanking: [],
      embeddingPolicy: {
        provider: 'openai',
        model: 'text-embedding-3-small',
      },
      queryRoot: 'sha256:query',
      rankingRoot: 'sha256:ranking',
      createdAt: '2026-05-17T00:00:00.000Z',
    };
    const execution = {
      findUp: jest.fn((namespace: string, key: string) => {
        if (namespace === 'depository/search' && key === 'result') return storedResult;
        return undefined;
      }),
    };

    const output = await executionContext.run(execution as any, () =>
      assetPackVerificationEvidenceTool.execute({ check: 'risk-admission' }),
    );

    expect(output).toMatchObject({
      schema: 'bitcode.asset-pack.verification-evidence-tool-result',
      readbackSource: 'execution-store',
      resultState: 'worthy_fit',
      selectedCandidateAssetIds: ['asset-1'],
      readiness: {
        selectedCandidateCount: 1,
        settlementEligibleCandidateCount: 1,
        sourceBoundCandidateCount: 1,
        proofReadyCandidateCount: 1,
        measurementReadyCandidateCount: 1,
        readbackReadyCandidateCount: 1,
        selectedWarnings: [],
        selectedBlockers: [],
      },
      selectedCandidates: [
        expect.objectContaining({
          assetId: 'asset-1',
          sourceBinding: {
            repositoryFullName: 'engineeredsoftware/ENGI',
            sourceBranch: 'main',
            sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
            contentRoot: 'sha256:content',
          },
        }),
      ],
    });
  });
});
