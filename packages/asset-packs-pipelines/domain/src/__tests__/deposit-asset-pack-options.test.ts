import {
  assertDepositAssetPackOptionSynthesisSourceSafe,
  buildDepositAssetPackOptionSynthesis,
} from '../deposit-asset-pack-options';

describe('Deposit AssetPack option synthesis', () => {
  it('builds multiple source-safe AssetPack options from connected source and demand signals', () => {
    const synthesis = buildDepositAssetPackOptionSynthesis({
      repositoryFullName: 'engineeredsoftware/ENGI',
      sourceBranch: 'main',
      sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      obfuscations:
        'Prefer reusable source-bound AssetPacks that can satisfy Reading demand without exposing critical private implementation source before settlement.',
      forcedInclusions: [
        'uapi/components/deposits/DepositSourceSelection/DepositSourceSelection.tsx',
        'packages/asset-packs-pipelines/domain/src/depository-supply-index.ts',
      ],
      depositoryDemandSignals: [
        {
          id: 'demand-depository-gap',
          label: 'Depository needs source-safe deposit option proposals',
          weight: 0.75,
        },
      ],
      readingDemandSignals: [
        {
          id: 'demand-reading-fit',
          label: 'Reading routes need fit-ready source supply',
          weight: 0.82,
        },
      ],
      existingDepositorySignals: [
        {
          id: 'existing-terminal-supply',
          label: 'Terminal supply already has proof-root and compensation posture',
          weight: 0.64,
        },
      ],
      createdAt: '2026-05-29T00:00:00.000Z',
    });

    expect(synthesis.schema).toBe('bitcode.deposit.asset-pack-option-synthesis');
    expect(synthesis.pipeline).toBe('DepositAssetPackOptionSynthesis');
    expect(synthesis.reviewBoundary).toMatchObject({
      route: '/deposits',
      defaultDecisionState: 'pending-depositor-review',
      approvedOptionsAdmittedBy: 'future-gate7-deposit-option-review',
      sourceCriticalityDemandRoiPolicyOwnedBy: 'future-gate6-policy',
    });
    expect(synthesis.optionCount).toBeGreaterThanOrEqual(3);
    expect(synthesis.options.map((option) => option.kind)).toEqual([
      'capability-slice',
      'implementation-pattern',
      'proof-operations-slice',
    ]);
    for (const option of synthesis.options) {
      expect(option.schema).toBe('bitcode.deposit.asset-pack-option');
      expect(option.sourceBinding).toMatchObject({
        repositoryFullName: 'engineeredsoftware/ENGI',
        sourceBranch: 'main',
        sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
        sourcePathCount: 2,
        rawSourceStoredExternally: true,
        protectedSourceVisibleInOption: false,
      });
      expect(option.demandAlignment.posture).toBe('source-safe-demand-signals-only');
      expect(option.demandAlignment.confidence).toBeGreaterThan(0.6);
      expect(option.measurements).toHaveLength(3);
      expect(option.reviewBoundary).toMatchObject({
        state: 'reviewable-source-safe-option',
        decision: 'pending-depositor-review',
        depositAdmissionBoundary: 'not-admitted-until-depositor-approval',
        btdMintBoundary: 'not-minted-by-deposit-option',
      });
      expect(option.policyBoundary).toMatchObject({
        sourceCriticalityPolicy: 'deferred-to-gate6',
        demandRoiPolicy: 'deferred-to-gate6',
        compensationPolicy: 'deferred-to-gate6',
      });
      expect(option.visibility).toMatchObject({
        sourceSafeMetadataOnly: true,
        protectedSourceVisible: false,
        rawSourceTextVisible: false,
        unpaidAssetPackSourceVisible: false,
        rawPromptVisible: false,
        interpolatedPromptVisible: false,
        rawProviderResponseVisible: false,
        walletPrivateMaterialVisible: false,
      });
      expect(option.roots.optionRoot).toMatch(/^deposit-asset-pack-option:/);
      expect(option.roots.measurementRoot).toMatch(/^deposit-option-measurements:/);
    }
    expect(assertDepositAssetPackOptionSynthesisSourceSafe(synthesis)).toEqual({
      admitted: true,
      reason: 'source_safe_deposit_asset_pack_option_synthesis',
    });
    expect(JSON.stringify(synthesis)).not.toContain('PRIVATE_SOURCE_DO_NOT_SERIALIZE');
  });

  it('blocks review posture when source binding is missing without leaking source', () => {
    const synthesis = buildDepositAssetPackOptionSynthesis({
      obfuscations: 'PRIVATE_SOURCE_DO_NOT_SERIALIZE do not include this marker in synthesized output',
    });

    expect(synthesis.options.every((option) => option.reviewBoundary.state === 'blocked-source-binding')).toBe(true);
    expect(synthesis.sourceSafety.protectedSourceVisible).toBe(false);
    expect(assertDepositAssetPackOptionSynthesisSourceSafe(synthesis).admitted).toBe(true);
    expect(JSON.stringify(synthesis)).not.toContain('PRIVATE_SOURCE_DO_NOT_SERIALIZE');
  });
});
