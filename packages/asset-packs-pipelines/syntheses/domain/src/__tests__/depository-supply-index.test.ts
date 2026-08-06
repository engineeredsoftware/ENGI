import {
  assertDepositorySupplyIndexSourceSafe,
  buildDepositorySupplyIndex,
  depositorySupplyAssetsFromIndex,
  searchDepositoryAssetSpace,
  type DepositorySearchRead,
} from '../index';

const read: DepositorySearchRead = {
  id: 'read-supply-index',
  prompt:
    'Find source-bound evidence for Deposit Read Fit AssetPack proof-root reconciliation readback and Supabase ledger synchronization.',
  repositoryFullName: 'octocat/Spoon-Knife',
  sourceBranch: 'main',
  sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
  targetArtifactKinds: ['repository-revision', 'asset-pack-evidence', 'proof-root'],
  closureCriteria: [
    'Deposit evidence is bound to repository, branch, commit, and signer.',
    'Finding Fits can rank the supply without leaking protected source before settlement.',
  ],
  failureModes: ['protected source leakage', 'missing measurement proof'],
};

function embeddingVector() {
  return Array.from({ length: 1536 }, (_, index) => (index % 7) / 7);
}

function deposit(overrides: Record<string, unknown> = {}) {
  return {
    id: 'deposit-terminal-engi',
    assetId: 'asset-terminal-engi',
    title: 'Deposit Read Fit supply',
    summary:
      'Source-safe evidence for Deposit, Read, Finding Fits, AssetPack proof-root, reconciliation readback, and Supabase ledger synchronization.',
    artifactKind: 'repository-revision',
    artifactType: 'repository/revision',
    repositoryFullName: 'octocat/Spoon-Knife',
    sourceBranch: 'main',
    sourceCommit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
    contentRoot: 'sha256:source-material-root',
    depositorWalletId: 'wallet-depositor-1',
    btdRange: 'btd:100:140',
    proofRoot: 'sha256:proof-root',
    measurementRoot: 'sha256:measurement-root',
    reconciliationReadbackRoot: 'sha256:readback-root',
    hasWalletOrAttestationProof: true,
    hasAssetMeasurementEvidence: true,
    contentUnits: [
      {
        unitId: 'terminal-unit-1',
        unitKind: 'source-file',
        text: 'PRIVATE_SOURCE_DO_NOT_SERIALIZE function terminalSecret() {}',
        path: 'apps/uapi/components/reads/ReadsDepositReadWorkbench/ReadsDepositReadWorkbench.tsx',
        codeAnalysisFacts: {
          symbols: ['ProductDepositReadWorkbench', 'streamProductReadFitsFindingSynthesisHost'],
          paths: ['apps/uapi/components/bitcode/pipeline/pipeline-host-client.ts'],
          stackTags: ['terminal', 'supabase', 'assetpack'],
          constraints: ['protected source remains hidden until settlement'],
        },
      },
    ],
    embeddings: {
      lexical: embeddingVector(),
      metadata: embeddingVector(),
      measurement: embeddingVector(),
      vector: embeddingVector(),
    },
    ...overrides,
  };
}

describe('Depository supply index', () => {
  it('builds a source-safe, rights-aware, vector-searchable supply index', () => {
    const index = buildDepositorySupplyIndex({
      deposits: [deposit()],
      createdAt: '2026-05-25T00:00:00.000Z',
    });

    expect(index.schema).toBe('bitcode.depository.supply-index');
    expect(index.recordCount).toBe(1);
    expect(index.searchableRecordCount).toBe(1);
    expect(index.repairRequiredRecordCount).toBe(0);
    expect(index.embeddingPolicy).toMatchObject({
      provider: 'openai',
      model: 'text-embedding-3-small',
      dimensions: 1536,
      vectorStore: {
        table: 'deliverable_vectors',
        rpc: 'match_deliverable_vectors',
        distanceMetric: 'cosine',
      },
    });

    const record = index.records[0];
    expect(record.lifecycle).toMatchObject({
      state: 'indexed-searchable',
      sourceReceived: true,
      measurementReady: true,
      proofReady: true,
      lexicalIndexed: true,
      metadataIndexed: true,
      vectorProjectionReady: true,
      searchable: true,
      repairRequired: false,
    });
    expect(record.rightsBoundary).toMatchObject({
      depositorWalletId: 'wallet-depositor-1',
      btdRange: 'btd:100:140',
      readerVisibilityBeforeSettlement: 'source-safe-metadata-only',
      protectedSourceBeforeSettlementVisible: false,
      settlementRequiredForSourceBearingAssetPack: true,
      btdOwnershipBoundary: 'depositor-retains-btd-until-settlement-transfer',
    });
    expect(record.compensationPreview).toMatchObject({
      schema: 'bitcode.depository.supply-compensation-preview',
      state: 'eligible-if-selected-for-assetpack',
      depositorWalletId: 'wallet-depositor-1',
      candidateBtdRange: 'btd:100:140',
      compensationRoute: {
        payer: 'future-reader-after-settlement',
        payee: 'depositing-wallet',
        priceAsset: 'BTC',
        allocationMethod: 'source-to-shares-largest-remainder',
        sourceToSharesProofState: 'not-created-until-accepted-need-fit-and-settlement',
        btdMintBoundary: 'not-minted-by-deposit-admission',
        btdRightsTransferBoundary: 'reader-receives-rights-only-after-btc-settlement',
      },
      readiness: {
        proofReady: true,
        measurementReady: true,
        searchable: true,
        depositorWalletReady: true,
        eligibleForFindingFits: true,
        eligibleForCompensationIfSelected: true,
        blockers: [],
      },
      visibility: {
        beforeSettlement: 'source-safe-compensation-route-metadata',
        protectedSourceVisible: false,
        unpaidAssetPackSourceVisible: false,
        walletPrivateMaterialVisible: false,
        settlementPrivatePayloadVisible: false,
      },
    });
    expect(record.compensationPreview.roots.compensationPreviewRoot).toMatch(/^sha256:/);
    expect(record.compensationPreview.roots.sourceToSharesPreviewRoot).toMatch(/^sha256:/);
    expect(record.compensationPreview.readback.ledgerAccountKeys).toEqual(
      expect.arrayContaining([
        'supplier:asset-terminal-engi:pending_claims',
        'depositor:wallet-depositor-1:deposited_assets',
        'depositor:wallet-depositor-1:eligible_compensation_routes',
      ]),
    );
    expect(record.vectorProjection.rows).toHaveLength(4);
    expect(record.vectorProjection.rows.every((row) => row.embeddingState === 'ready')).toBe(true);
    expect(record.storageProjection).toMatchObject({
      assetPackEvidenceTable: 'deliverables',
      vectorTable: 'deliverable_vectors',
      vectorMatchRpc: 'match_deliverable_vectors',
    });
    expect(record.roots.supplyRoot).toMatch(/^sha256:/);
    expect(index.roots.indexRoot).toMatch(/^sha256:/);
    expect(() => assertDepositorySupplyIndexSourceSafe(index)).not.toThrow();
    expect(JSON.stringify(index)).not.toContain('PRIVATE_SOURCE_DO_NOT_SERIALIZE');
  });

  it('marks supply repair-required when embedding rows are pending or invalid', () => {
    const index = buildDepositorySupplyIndex({
      deposits: [
        deposit({
          embeddings: {
            lexical: [1, 2, 3],
          },
        }),
      ],
      createdAt: '2026-05-25T00:00:00.000Z',
    });

    const record = index.records[0];
    expect(record.lifecycle.state).toBe('indexed-repair-required');
    expect(record.lifecycle.vectorProjectionReady).toBe(false);
    expect(record.vectorProjection.rows.some((row) => row.embeddingState === 'invalid-dimensions')).toBe(true);
    expect(record.lifecycle.warnings).toEqual(
      expect.arrayContaining(['embedding_rows_pending', 'embedding_row_invalid_dimensions']),
    );
    expect(record.repairActions).toContain('sync-active-embedding-vector-rows');
  });

  it('blocks source supply without repository or source revision binding', () => {
    const index = buildDepositorySupplyIndex({
      deposits: [
        deposit({
          repositoryFullName: null,
          sourceBranch: null,
          sourceCommit: null,
        }),
      ],
      createdAt: '2026-05-25T00:00:00.000Z',
    });

    expect(index.blockedRecordCount).toBe(1);
    expect(index.records[0].lifecycle.state).toBe('blocked-readiness');
    expect(index.records[0].lifecycle.blockers).toEqual(
      expect.arrayContaining(['repository_binding_missing', 'source_revision_binding_missing']),
    );
    expect(index.records[0].compensationPreview.state).toBe('blocked-before-compensation');
    expect(index.records[0].compensationPreview.readiness.blockers).toEqual(
      expect.arrayContaining([
        'repository_binding_missing',
        'source_revision_binding_missing',
        'depository_searchability_missing',
      ]),
    );
    expect(depositorySupplyAssetsFromIndex(index)).toHaveLength(0);
  });

  it('surfaces repair posture when deposit compensation cannot route to a wallet', () => {
    const index = buildDepositorySupplyIndex({
      deposits: [deposit({ depositorWalletId: null })],
      createdAt: '2026-05-25T00:00:00.000Z',
    });

    const record = index.records[0];
    expect(record.lifecycle.state).toBe('indexed-repair-required');
    expect(record.lifecycle.warnings).toEqual(expect.arrayContaining(['depositor_wallet_missing']));
    expect(record.repairActions).toContain('bind-depositor-wallet-for-compensation');
    expect(record.compensationPreview.state).toBe('repair-required-before-compensation');
    expect(record.compensationPreview.readiness).toMatchObject({
      searchable: true,
      proofReady: true,
      measurementReady: true,
      depositorWalletReady: false,
      eligibleForFindingFits: true,
      eligibleForCompensationIfSelected: false,
    });
    expect(record.compensationPreview.readiness.blockers).toEqual(
      expect.arrayContaining(['depositor_wallet_missing']),
    );
  });

  it('hands source-safe supply records to Finding Fits search as candidate deposits', async () => {
    const index = buildDepositorySupplyIndex({
      deposits: [deposit()],
      createdAt: '2026-05-25T00:00:00.000Z',
    });
    const assets = depositorySupplyAssetsFromIndex(index);
    const result = await searchDepositoryAssetSpace({
      read,
      assets,
      depositorySupplyIndex: index,
    });

    expect(assets).toHaveLength(1);
    expect(assets[0].contentUnits[0].text).not.toContain('PRIVATE_SOURCE_DO_NOT_SERIALIZE');
    expect(result.resultState).toBe('worthy_fit');
    expect(result.fitDepositAssetIds).toEqual(['asset-terminal-engi']);
    expect(result.depositorySupplyIndex?.roots.indexRoot).toBe(index.roots.indexRoot);
    expect(result.searchReceipt.sourceSafety).toMatchObject({
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
    });
  });
});
