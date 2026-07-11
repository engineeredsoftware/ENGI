import type { ShippablesDoc } from '@/components/bitcode/execution/ShippablesDocPanel';
import {
  buildTerminalRunDetailFromSelectedRun,
  normalizeTerminalRunDetailPayload,
} from '@/app/terminal/terminal-transaction-detail-snapshot';
import type { WorkspaceRun } from '@/app/terminal/terminal-run-data';

const baseRun: WorkspaceRun = {
  id: 'run-1',
  created_at: '2026-04-16T12:00:00.000Z',
  type: 'agentic-execution:asset-pack',
  status: 'completed',
  summary: 'Fallback selected-run summary.',
  repository: 'bitcode/bitcode',
  branch: 'terminal/refit',
  itemCount: 4,
  tokenTotal: 1200,
  measuredBtd: 12.5,
  btcFeeUsdEquivalent: 0.84,
  averageLatencyMs: 850,
  proofStatus: 'bounded proof ready',
  closureFocus: 'Shippable bundle',
};

describe('terminal-transaction-detail-snapshot helpers', () => {
  it('builds a selected-run fallback snapshot', () => {
    const fallbackShippables: ShippablesDoc = {
      summary: 'Fallback Shippable summary.',
      pullRequest: { title: 'Fallback PR', url: 'https://example.com/pr/1', number: 1 },
    };

    const snapshot = buildTerminalRunDetailFromSelectedRun(baseRun, fallbackShippables);

    expect(snapshot.summary).toBe('Fallback selected-run summary.');
    expect(snapshot.shippables?.pullRequest?.title).toBe('Fallback PR');
    expect(snapshot.writtenAssets?.pullRequest).toBeNull();
    expect(snapshot.writtenAssets?.summary).toBe('Fallback Shippable summary.');
    expect(snapshot.deliveryMechanism?.pullRequest?.title).toBe('Fallback PR');
    expect(snapshot.repoSnapshot).toMatchObject({
      org: 'bitcode',
      repo: 'bitcode',
      branch: 'terminal/refit',
    });
    expect(snapshot.processingStats.tokenTotal).toBe(1200);
    expect(snapshot.historyItemCount).toBe(4);
  });

  it('uses demonstration witness projection detail for projected live rows', () => {
    const snapshot = buildTerminalRunDetailFromSelectedRun({
      ...baseRun,
      sourceModel: 'protocol-projection',
      protocolProjectionDetail: {
        summary: 'Live projected Bitcode posture.',
        shippables: null,
        repoSnapshot: {
          org: 'bitcode',
          repo: 'terminal',
          branch: 'main',
          commit: '',
        },
        processingStats: {
          time: null,
          tokenTotal: null,
          measuredBtd: null,
          btcFeeUsdEquivalent: null,
          averageLatencyMs: null,
        },
        proofStatus: 'verification witness refreshed',
        closureFocus: 'read measurement + ledger refresh',
        closureFollowThrough: null,
        closureState: null,
        ledgerSettlement: null,
        terminalJournal: null,
        organizationAuthority: null,
        bitcodeActivityState: {
          repositoryAnchor: {
            provider: 'github',
            providerAccount: 'bitcode',
            repository: {
              id: 'repo-1',
              fullName: 'bitcode/terminal',
              defaultBranch: 'main',
              private: true,
              language: 'TypeScript',
              topics: ['bitcode'],
            },
            connection: {
              connected: true,
              valid: true,
              mode: 'live connection',
              inventorySource: 'stored_repository_inventory',
            },
          },
        },
        historyItemCount: 3,
        eventCount: 0,
      },
    });

    expect(snapshot).toMatchObject({
      summary: 'Live projected Bitcode posture.',
      repoSnapshot: {
        org: 'bitcode',
        repo: 'terminal',
        branch: 'main',
      },
      proofStatus: 'verification witness refreshed',
      bitcodeActivityState: {
        repositoryAnchor: {
          providerAccount: 'bitcode',
          connection: {
            inventorySource: 'stored_repository_inventory',
          },
        },
      },
      historyItemCount: 3,
    });
  });

  it('normalizes live history payload with asset-pack completion shippables', () => {
    const snapshot = normalizeTerminalRunDetailPayload(
      {
        run: {
          id: 'run-1',
          summary: 'Live execution summary.',
          repo_snapshot: { org: 'bitcode', repo: 'bitcode', branch: 'main', commit: 'abc1234' },
          processing_stats: {
            time: '4m 12s',
            tokens: { total: 2200 },
            measuredBtd: 24.5,
            btcFeeUsdEquivalent: 1.62,
            averageLatencyMs: 930,
          },
          items: [{ id: '1' }, { id: '2' }],
          output: {
            asset_pack_completion: {
              summary: 'AssetPack completion summary.',
              bitcodeActivityState: {
                repositoryAnchor: {
                  provider: 'github',
                  providerAccount: 'bitcode',
                  repository: {
                    id: 'repo-1',
                    fullName: 'bitcode/bitcode',
                    defaultBranch: 'main',
                    private: true,
                    language: 'TypeScript',
                    topics: ['bitcode', 'terminal'],
                  },
                  connection: {
                    connected: true,
                    valid: true,
                    mode: 'live connection',
                  },
                },
                depositWorkbench: {
                  canonLabel: 'Bitcode active posture',
                  projectionPrincipal: 'depositor',
                  branchMode: 'patch',
                  scenarioLabel: 'auth-remediation',
                  profileLabel: 'Targeted deposit',
                  deposit: {
                    summary: 'Deposit summary.',
                    metrics: [{ label: 'Selected refs', value: '2' }],
                    rows: [{ label: 'Repository', value: 'bitcode/bitcode' }],
                    selectedEntries: [{ id: 'entry-1', label: 'rollback runbook' }],
                    artifactKinds: ['runbook (1)'],
                  },
                  read: {
                    summary: 'Read summary.',
                    metrics: [{ label: 'Target kinds', value: '2' }],
                    rows: [{ label: 'Scenario', value: 'auth-remediation' }],
                    closureCriteria: ['bound issuer auth'],
                    targetKinds: ['runbook'],
                  },
                  fit: {
                    summary: 'Fit summary.',
                    metrics: [{ label: 'Pressure', value: 'low' }],
                    rows: [{ label: 'Projection', value: 'depositor' }],
                  },
                },
                readMeasurement: {
                  scenario: {
                    id: 'scenario-1',
                    label: 'auth-remediation',
                    repo: 'bitcode/bitcode',
                    profile: 'Targeted deposit',
                    selected: true,
                  },
                  parserKind: 'benchmark-parser',
                  closureCriteriaCount: 2,
                  targetKindCount: 3,
                },
                supplySelection: {
                  authSessionLabel: 'bitcode/bitcode · 42',
                  selectedAuthSessionId: 'session-1',
                  selectedKind: 'all',
                  searchTerm: 'auth',
                  selectedCount: 2,
                  filteredCount: 4,
                  totalFilteredEntries: 12,
                  selectedEntries: [
                    { id: 'entry-1', title: 'rollback runbook', kind: 'runbook', tags: ['auth'] },
                  ],
                },
              },
              closurePanels: {
                canonLabel: 'Bitcode active posture',
                readReview: {
                  id: 'read-review',
                  label: 'Read review before Finding Fits',
                  summary: 'Measured Read accepted for source-to-shares Finding Fits.',
                  metrics: [{ label: 'Finding Fits admitted', value: 'yes' }],
                  rows: [
                    { label: 'Review stage', value: 'post-measurement-pre-fit' },
                    { label: 'Protocol focus', value: 'source-to-shares' },
                  ],
                  chips: ['post-measurement-pre-fit', 'source-to-shares'],
                },
                verification: {
                  id: 'verification',
                  label: 'Verification + ranked candidates',
                  summary: 'Verification summary.',
                  metrics: [{ label: 'Candidates', value: '5' }],
                  rows: [{ label: 'Verification state', value: 'allowed-with-policy' }],
                  chips: ['rollback runbook'],
                },
                branch: {
                  id: 'branch',
                  label: 'Branch artifacts',
                  summary: 'Branch summary.',
                  metrics: [{ label: 'Visible artifacts', value: '7' }],
                  rows: [{ label: 'Branch', value: 'bitcode/auth-rollback' }],
                  chips: ['BITCODE_READ.md', '.bitcode/settlement-preview.json'],
                },
                settlement: {
                  id: 'settlement',
                  label: 'Settlement + proof',
                  summary: 'Settlement summary.',
                  metrics: [{ label: 'Credited assets', value: '2' }],
                  rows: [
                    { label: 'Bundle', value: 'bundle-001' },
                    { label: 'Present-fit review', value: 'present-fit-for-settlement-review' },
                    {
                      label: 'Objective contract',
                      value: 'bitcode.source-to-shares.quantized-fit-quality-oc.v26',
                    },
                    { label: 'Source-to-shares ref', value: 'sha256:source-to-shares' },
                    { label: 'Fit-quality hash', value: 'sha256:fit-quality' },
                  ],
                  chips: ['selection-materialization'],
                  proofFamilies: [
                    {
                      label: 'selection-materialization',
                      artifactPath: '.bitcode/selection-and-materialization-proof.json',
                      theoremStatus: 'passed',
                      replayArtifacts: '3',
                    },
                  ],
                  fitQualities: [
                    {
                      label: 'Weighted source-to-shares bundle fit',
                      value: '0.328991',
                      detail: '10000 bp · source-to-shares-weighted-objective',
                    },
                  ],
                },
                ledger: {
                  id: 'ledger',
                  label: 'Ledger + run history',
                  summary: 'Ledger summary.',
                  metrics: [{ label: 'History count', value: '1' }],
                  rows: [{ label: 'buyer pools', value: '120 BTD' }],
                  chips: [],
                  recentRuns: [{ label: 'run-001', summary: 'bitcode/bitcode · completed · credited 2' }],
                },
              },
              closureFollowThrough: {
                canonLabel: 'Bitcode active posture',
                settlementMetrics: [{ label: 'Credited assets', value: '2' }],
                branchArtifacts: ['BITCODE_READ.md'],
                proofFamilies: [
                  {
                    label: 'selection-materialization',
                    artifactPath: '.bitcode/selection-and-materialization-proof.json',
                    theoremStatus: 'passed',
                    replayArtifacts: '3',
                  },
                ],
                recentHistory: [{ label: 'run-001', summary: 'bitcode/bitcode · completed · credited 2' }],
              },
              shippables: {
                summary: 'Shippable bundle summary.',
                pullRequest: { title: 'Live PR', url: 'https://example.com/pr/2', number: 2 },
              },
              assetPackSynthesisArtifacts: {
                summary: 'Live AssetPack synthesis artifacts.',
                fileChanges: {
                  edited: 5,
                  created: 1,
                  deleted: 0,
                  paths: ['src/app.ts'],
                },
              },
              ledgerSettlement: {
                status: 'settled',
                settlementAdmissible: true,
                reason: 'Rows read back.',
                assetPackId: 'asset-pack-run-1',
                btdRange: { start: 0, endExclusive: 1, tokenCount: 1 },
                ledgerAnchorId: 'ledger-anchor-run-1',
                btcFeeReceiptId: 'btc-fee-run-1',
                asset_pack_mint_receipt: {
                  kind: 'btd.asset_pack_mint_receipt',
                  receiptRoot: 'asset-pack-mint-receipt-root-run-1',
                  protectedSourceVisible: false,
                },
                read_receipt: {
                  kind: 'btd.read_receipt',
                  receiptRoot: 'read-receipt-root-run-1',
                  disclosureState: 'source_safe_preview',
                  protectedSourceVisible: false,
                },
                btd_rights_transfer_receipt: {
                  kind: 'btd.rights_transfer_receipt',
                  receiptRoot: 'rights-transfer-receipt-root-run-1',
                  protectedSourceVisible: true,
                },
                ledger_database_reconciliation: {
                  kind: 'btd.ledger_database_reconciliation',
                  objectStorageArtifacts: [
                    {
                      artifactId: 'preview-artifact-run-1',
                      storageRoot: 'sha256:preview-storage-root',
                    },
                  ],
                },
                readback: {
                  assetPackRange: true,
                  btcFeeTransaction: true,
                  ledgerAnchor: true,
                  terminalJournal: true,
                },
                journalEntryIds: ['journal-mint-run-1'],
              },
              organizationAuthority: [
                {
                  kind: 'btd_organization_interface_authority_decision',
                  decision: 'allowed',
                  interfaceSurface: 'terminal',
                  action: 'deliver_asset_pack',
                  reason: 'role_authorized',
                  sourceVisibility: 'protected_source_allowed',
                  targetAnchor: 'github:bitcode/bitcode/pull/2',
                  proofRoots: {
                    authorityRoot: 'btd-proof-root:organization-interface-authority:abc123',
                    roleRoot: 'btd-proof-root:organization-role:def456',
                  },
                },
              ],
            },
            terminal_journal: {
              expectedJournalEntryIds: ['journal-mint-run-1'],
              entries: [
                {
                  journal_entry_id: 'journal-mint-run-1',
                  transaction_kind: 'asset_pack_mint',
                  actor_id: 'depositor-wallet',
                  pre_state_root: 'sha256:before',
                  post_state_root: 'sha256:after',
                  receipt_roots: ['sha256:receipt'],
                  ledger_anchor_ids: ['ledger-anchor-run-1'],
                  exchange_sequence: 5,
                  issued_at: '2026-05-18T12:00:00.000Z',
                },
              ],
              repairs: [],
              ledgerRows: {
                assetPackRanges: [{ asset_pack_id: 'asset-pack-run-1', access_policy_hash: 'sha256:policy' }],
                btcFeeTransactions: [{ receipt_id: 'btc-fee-run-1', finality_state: 'prepared' }],
                ledgerAnchors: [{ anchor_id: 'ledger-anchor-run-1', finality_state: 'confirmed' }],
                ownershipEvents: [],
                readLicenses: [],
              },
              readErrors: [],
            },
          },
        },
        events: [{ id: 'evt-1' }, { id: 'evt-2' }, { id: 'evt-3' }],
      },
      baseRun,
    );

    expect(snapshot.summary).toBe('Live execution summary.');
    expect(snapshot.shippables?.summary).toBe('Shippable bundle summary.');
    expect(snapshot.shippables?.pullRequest?.title).toBe('Live PR');
    expect(snapshot).not.toHaveProperty('deliverables');
    expect(snapshot.assetPackSynthesisArtifacts?.summary).toBe('Live AssetPack synthesis artifacts.');
    expect(snapshot.assetPackSynthesisArtifacts?.fileChanges?.edited).toBe(5);
    expect(snapshot.writtenAssets?.summary).toBe('Live AssetPack synthesis artifacts.');
    expect(snapshot.deliveryMechanism?.pullRequest?.title).toBe('Live PR');
    expect(snapshot.repoSnapshot?.branch).toBe('main');
    expect(snapshot.processingStats.time).toBe('4m 12s');
    expect(snapshot.processingStats.tokenTotal).toBe(2200);
    expect(snapshot.bitcodeActivityState).toMatchObject({
      repositoryAnchor: {
        provider: 'github',
        providerAccount: 'bitcode',
        repository: {
          fullName: 'bitcode/bitcode',
          defaultBranch: 'main',
        },
      },
      depositWorkbench: {
        projectionPrincipal: 'depositor',
        scenarioLabel: 'auth-remediation',
      },
      readMeasurement: {
        parserKind: 'benchmark-parser',
        targetKindCount: 3,
      },
      supplySelection: {
        authSessionLabel: 'bitcode/bitcode · 42',
        selectedCount: 2,
      },
    });
    expect(snapshot.closureState).toMatchObject({
      canonLabel: 'Bitcode active posture',
      readReview: {
        id: 'read-review',
        label: 'Read review before Finding Fits',
        summary: 'Measured Read accepted for source-to-shares Finding Fits.',
        metrics: [{ label: 'Finding Fits admitted', value: 'yes' }],
        rows: [
          { label: 'Review stage', value: 'post-measurement-pre-fit' },
          { label: 'Protocol focus', value: 'source-to-shares' },
        ],
      },
      verification: {
        id: 'verification',
        label: 'Verification + ranked candidates',
      },
      settlement: {
        id: 'settlement',
        rows: [
          { label: 'Bundle', value: 'bundle-001' },
          { label: 'Present-fit review', value: 'present-fit-for-settlement-review' },
          { label: 'Objective contract', value: 'bitcode.source-to-shares.quantized-fit-quality-oc.v26' },
          { label: 'Source-to-shares ref', value: 'sha256:source-to-shares' },
          { label: 'Fit-quality hash', value: 'sha256:fit-quality' },
        ],
        proofFamilies: [
          {
            label: 'selection-materialization',
            theoremStatus: 'passed',
          },
        ],
        fitQualities: [
          {
            label: 'Weighted source-to-shares bundle fit',
            value: '0.328991',
            detail: '10000 bp · source-to-shares-weighted-objective',
          },
        ],
      },
      ledger: {
        id: 'ledger',
        recentRuns: [{ label: 'run-001', summary: 'bitcode/bitcode · completed · credited 2' }],
      },
    });
    expect(snapshot.closureFollowThrough).toEqual({
      canonLabel: 'Bitcode active posture',
      settlementMetrics: [{ label: 'Credited assets', value: '2' }],
      branchArtifacts: ['BITCODE_READ.md'],
      proofFamilies: [
        {
          label: 'selection-materialization',
          artifactPath: '.bitcode/selection-and-materialization-proof.json',
          theoremStatus: 'passed',
          replayArtifacts: '3',
        },
      ],
      recentHistory: [{ label: 'run-001', summary: 'bitcode/bitcode · completed · credited 2' }],
    });
    expect(snapshot.ledgerSettlement).toMatchObject({
      status: 'settled',
      assetPackId: 'asset-pack-run-1',
      readback: {
        terminalJournal: true,
      },
      journalEntryIds: ['journal-mint-run-1'],
      assetPackMintReceipt: {
        receiptRoot: 'asset-pack-mint-receipt-root-run-1',
      },
      readReceipt: {
        receiptRoot: 'read-receipt-root-run-1',
      },
      rightsTransferReceipt: {
        receiptRoot: 'rights-transfer-receipt-root-run-1',
      },
      ledgerDatabaseReconciliation: {
        objectStorageArtifacts: [
          {
            artifactId: 'preview-artifact-run-1',
            storageRoot: 'sha256:preview-storage-root',
          },
        ],
      },
    });
    expect(snapshot.terminalJournal).toMatchObject({
      expectedJournalEntryIds: ['journal-mint-run-1'],
      entries: [
        {
          journalEntryId: 'journal-mint-run-1',
          transactionKind: 'asset_pack_mint',
          exchangeSequence: 5,
        },
      ],
      ledgerRows: {
        btcFeeTransactions: [{ receipt_id: 'btc-fee-run-1', finality_state: 'prepared' }],
      },
    });
    expect(snapshot.organizationAuthority).toEqual([
      expect.objectContaining({
        action: 'deliver_asset_pack',
        decision: 'allowed',
        sourceVisibility: 'protected_source_allowed',
      }),
    ]);
    expect(snapshot.historyItemCount).toBe(2);
    expect(snapshot.eventCount).toBe(3);
  });

  it('falls back cleanly when live payload omits Shippable detail', () => {
    const fallbackShippables: ShippablesDoc = {
      summary: 'Fallback Shippable summary.',
      pullRequest: { title: 'Fallback PR', url: 'https://example.com/pr/4', number: 4 },
    };

    const snapshot = normalizeTerminalRunDetailPayload(
      {
        run: {
          id: 'run-1',
          items: [],
          asset_pack_completion: {
            processingStats: {
              time: '2m 08s',
            },
          },
        },
        events: [],
      },
      baseRun,
      fallbackShippables,
    );

    expect(snapshot.summary).toBe('Fallback selected-run summary.');
    expect(snapshot.shippables?.summary).toBe('Fallback Shippable summary.');
    expect(snapshot.shippables?.pullRequest?.title).toBe('Fallback PR');
    expect(snapshot.writtenAssets?.summary).toBe('Fallback Shippable summary.');
    expect(snapshot.deliveryMechanism?.pullRequest?.title).toBe('Fallback PR');
    expect(snapshot.processingStats.time).toBe('2m 08s');
    expect(snapshot.proofStatus).toBe('bounded proof ready');
  });

  it('separates written assets from delivery mechanisms when both are present', () => {
    const snapshot = normalizeTerminalRunDetailPayload(
      {
        run: {
          id: 'run-1',
          items: [],
          asset_pack_completion: {
            summary: 'Semantic Finish summary.',
            assetPackSynthesisArtifacts: {
              summary: 'Primary AssetPack synthesis artifact summary.',
              fileChanges: {
                edited: 4,
                created: 0,
                deleted: 0,
                paths: ['src/asset-pack.ts'],
              },
            },
            writtenAssets: {
              summary: 'Stable written asset summary.',
              fileChanges: {
                edited: 2,
                created: 1,
                deleted: 0,
                paths: ['src/index.ts'],
              },
            },
            deliveryMechanism: {
              pullRequest: { title: 'Delivery PR', url: 'https://example.com/pr/3', number: 3 },
            },
          },
        },
        events: [],
      },
      baseRun,
    );

    expect(snapshot.summary).toBe('Semantic Finish summary.');
    expect(snapshot.assetPackSynthesisArtifacts?.summary).toBe('Primary AssetPack synthesis artifact summary.');
    expect(snapshot.assetPackSynthesisArtifacts?.fileChanges?.edited).toBe(4);
    expect(snapshot.writtenAssets?.summary).toBe('Stable written asset summary.');
    expect(snapshot.writtenAssets?.fileChanges?.edited).toBe(2);
    expect(snapshot.shippables?.pullRequest?.title).toBe('Delivery PR');
    expect(snapshot.deliveryMechanism?.pullRequest?.title).toBe('Delivery PR');
    expect(snapshot).not.toHaveProperty('deliverables');
  });

  it('rejects invalid payloads', () => {
    expect(() => normalizeTerminalRunDetailPayload(null, baseRun)).toThrow('Invalid run history payload');
  });
});
