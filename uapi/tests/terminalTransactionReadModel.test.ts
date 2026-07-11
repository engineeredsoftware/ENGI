import {
  buildTerminalTransactionReadModel,
} from '@/app/terminal/terminal-transaction-read-model';
import type { WorkspaceRun } from '@/components/bitcode/pipeline/models/pipeline-run-data';
import type { TerminalRunDetailSnapshot } from '@/app/terminal/terminal-transaction-detail-snapshot';

const selectedRun: WorkspaceRun = {
  id: 'tx-read-1',
  created_at: '2026-05-20T12:00:00.000Z',
  type: 'agentic-execution:read-measurement',
  status: 'completed',
  summary: 'Read Need accepted and ready for Finding Fits.',
  repository: 'engineeredsoftware/ENGI',
  branch: 'main',
  sourceModel: 'execution-history',
  participant: 'engineeredsoftware',
  isOwnTransaction: true,
  transactionLens: 'read',
  itemCount: 2,
  tokenTotal: 1200,
  measuredBtd: 42.25,
  btcFeeUsdEquivalent: 2.75,
  proofStatus: 'read measurement accepted',
  closureFocus: 'Read Need review',
};

const detail: TerminalRunDetailSnapshot = {
  summary: 'Accepted Read Need for Finding Fits.',
  shippables: null,
  writtenAssets: {
    pullRequest: null,
    fileChanges: {
      edited: 2,
      created: 1,
      deleted: 0,
      paths: ['BITCODE_READ_NEED.md'],
    },
    summary: 'Source-safe AssetPack preview metadata is attached.',
  },
  deliveryMechanism: null,
  repoSnapshot: {
    org: 'engineeredsoftware',
    repo: 'ENGI',
    branch: 'main',
    commit: 'abc123',
  },
  processingStats: {
    time: '1m',
    tokenTotal: 2400,
    measuredBtd: 50.5,
    btcFeeUsdEquivalent: 3.1,
    averageLatencyMs: 900,
  },
  proofStatus: 'source-safe preview ready',
  closureFocus: 'AssetPack preview',
  closureFollowThrough: {
    canonLabel: 'Bitcode active posture',
    settlementMetrics: [{ label: 'Settlement', value: 'blocked before payment' }],
    branchArtifacts: ['BITCODE_READ_NEED.md'],
    proofFamilies: [
      {
        label: 'preview-boundary',
        artifactPath: '.bitcode/preview-boundary.json',
        theoremStatus: 'passed',
        replayArtifacts: '1',
      },
    ],
    recentHistory: [{ label: 'Read accepted', summary: 'Need reviewed.' }],
  },
  closureState: null,
  ledgerSettlement: {
    status: 'preview_only',
    settlementAdmissible: false,
    reason: 'Awaiting BTC fee payment.',
    assetPackId: 'asset-pack-1',
    btdRange: null,
    ledgerAnchorId: 'anchor-1',
    btcFeeReceiptId: null,
    depositorWalletId: 'wallet-depositor',
    readerWalletId: 'wallet-reader',
    btcFee: {
      receiptId: 'btc-fee-1',
      finalityState: 'broadcast',
      network: 'testnet',
      satsPaid: '1200',
      walletSessionId: 'wallet-session-1',
      serverCustody: false,
    },
    ownershipBoundary: null,
    assetPackMintReceipt: {
      kind: 'btd.asset_pack_mint_receipt',
      receiptRoot: 'asset-pack-mint-receipt-root-1',
      protectedSourceVisible: false,
    },
    readReceipt: {
      kind: 'btd.read_receipt',
      receiptRoot: 'read-receipt-root-1',
      disclosureState: 'source_safe_preview',
      protectedSourceVisible: false,
    },
    rightsTransferReceipt: null,
    readback: { assetPackRange: true },
    journalEntryIds: ['journal-1'],
    ownershipEventId: null,
    readLicenseId: null,
  },
  terminalJournal: {
    expectedJournalEntryIds: ['journal-1'],
    entries: [],
    repairs: [],
    ledgerRows: {
      assetPackRanges: [],
      btcFeeTransactions: [],
      ledgerAnchors: [],
      ownershipEvents: [],
      readLicenses: [],
    },
    readErrors: [],
  },
  bitcodeActivityState: null,
  historyItemCount: 3,
  eventCount: 7,
};

describe('terminal transaction read model', () => {
  it('builds a route-owned low-detail projection for the selected transaction', () => {
    const model = buildTerminalTransactionReadModel({
      selectedRun,
      detail,
      detailSection: 'proofs',
      dataMode: 'live',
      searchParams: new URLSearchParams(
        'runId=legacy-run&provider=github&transactionSearch=need',
      ),
    });

    expect(model.transaction).toMatchObject({
      id: 'tx-read-1',
      repository: 'engineeredsoftware/ENGI',
      transactionLens: 'read',
    });
    expect(model.route.href).toContain('/terminal?');
    expect(model.route.href).toContain('transactionId=tx-read-1');
    expect(model.route.href).toContain('transactionDetail=proofs');
    expect(model.route.href).toContain('provider=github');
    expect(model.route.href).not.toContain('runId=legacy-run');
    expect(model.route.exchangeHref).toContain('/packs?');
    expect(model.route.exchangeHref).toContain('transactionId=tx-read-1');
    expect(model.route.exchangeHref).toContain('transactionDetail=proofs');
    expect(model.route.exchangeHref).toContain('provider=github');
    expect(model.route.exchangeHref).not.toContain('runId=legacy-run');
    expect(model.route.selectionRecoverable).toBe(false);
    expect(model.lowDetail.metrics).toEqual(
      expect.arrayContaining([
        { label: 'Shippables', value: '1' },
        { label: 'Measured $BTD', value: '50.5' },
      ]),
    );
    expect(model.activeSection).toMatchObject({
      id: 'proofs',
      availability: 'available',
      factFamily: 'proof',
    });
    expect(model.sections.find((section) => section.id === 'wallet-btc')).toMatchObject({
      label: 'Wallet/BTC',
      availability: 'available',
      factFamily: 'wallet',
    });
    expect(model.sections.find((section) => section.id === 'journal')).toMatchObject({
      availability: 'available',
      rowCount: 2,
    });
  });

  it('marks empty and blocked sections explicitly without raw payload dependency', () => {
    const model = buildTerminalTransactionReadModel({
      selectedRun: {
        ...selectedRun,
        sourceModel: 'mock-review',
      },
      detail: {
        ...detail,
        writtenAssets: null,
        closureFollowThrough: null,
        terminalJournal: null,
        organizationAuthority: null,
        eventCount: 0,
      },
      detailSection: 'console',
      dataMode: 'mock-review',
      searchParams: new URLSearchParams('transactionId=tx-read-1'),
    });

    expect(model.route.selectionRecoverable).toBe(true);
    expect(model.sections.find((section) => section.id === 'shippables')).toMatchObject({
      availability: 'empty',
      payloadAvailable: false,
    });
    expect(model.sections.find((section) => section.id === 'console')).toMatchObject({
      availability: 'blocked',
      blocker: 'Console detail is available only for live execution-history rows.',
      payloadAvailable: false,
    });
    expect(model.expandableDetail.rawPayloadAvailable).toBe(true);
    expect(model.expandableDetail.auditSectionsAvailable).toBeGreaterThan(0);
  });
});
