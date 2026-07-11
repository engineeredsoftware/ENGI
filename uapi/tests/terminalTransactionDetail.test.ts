import {
  buildTerminalTransactionClosurePayload,
  buildTerminalTransactionClosureFollowThrough,
  buildTerminalTransactionClosureRows,
  buildTerminalTransactionIdentityRows,
  buildTerminalTransactionOverviewMetrics,
  buildTerminalTransactionPersistedActivitySnapshot,
  countTerminalTransactionShippableSurfaces,
  getTerminalTransactionDeliveryMechanism,
  getTerminalTransactionWrittenAssets,
} from '@/app/terminal/terminal-transaction-detail';
import type { TerminalClosureState } from '@/app/terminal/terminal-closure-state';
import type { TerminalRunDetailSnapshot } from '@/app/terminal/terminal-transaction-detail-snapshot';
import type { WorkspaceRun } from '@/components/bitcode/pipeline/models/pipeline-run-data';

const selectedTransaction: WorkspaceRun = {
  id: 'tx-001',
  created_at: '2026-04-16T12:00:00.000Z',
  type: 'agentic-execution:asset-pack',
  status: 'completed',
  summary: 'Selected transaction summary.',
  repository: 'bitcode/bitcode',
  branch: 'terminal/refit',
  itemCount: 4,
  tokenTotal: 1200,
  measuredBtd: 18.5,
  btcFeeUsdEquivalent: 0.84,
  averageLatencyMs: 850,
  proofStatus: 'bounded proof ready',
  closureFocus: 'shippable bundle',
};

const detail: TerminalRunDetailSnapshot = {
  summary: 'Normalized detail summary.',
  shippables: {
    summary: 'Shippable summary.',
    pullRequest: { title: 'PR', url: 'https://example.com/pr/1', number: 1 },
  },
  writtenAssets: {
    summary: 'Written asset summary.',
    fileChanges: {
      edited: 2,
      created: 1,
      deleted: 0,
      paths: ['src/index.ts'],
    },
  },
  deliveryMechanism: {
    pullRequest: { title: 'PR', url: 'https://example.com/pr/1', number: 1 },
  },
  repoSnapshot: {
    org: 'bitcode',
    repo: 'bitcode',
    branch: 'main',
    commit: 'abc123',
  },
  processingStats: {
    time: '4m 12s',
    tokenTotal: 2200,
    measuredBtd: 24.5,
    btcFeeUsdEquivalent: 1.62,
    averageLatencyMs: 930,
  },
  proofStatus: 'proof witness ready',
  closureFocus: 'bounded disclosure',
  closureFollowThrough: {
    canonLabel: 'persisted closure posture',
    settlementMetrics: [{ label: 'Credited assets', value: '2' }],
    branchArtifacts: ['BITCODE_READ.md', '.bitcode/settlement-preview.json'],
    proofFamilies: [
      {
        label: 'selection-materialization',
        artifactPath: '.bitcode/selection-and-materialization-proof.json',
        theoremStatus: 'passed',
        replayArtifacts: '3',
      },
    ],
    recentHistory: [
      {
        label: 'run-001',
        summary: 'bitcode/bitcode · bitcode/auth-rollback · completed · credited 2',
      },
    ],
  },
  ledgerSettlement: null,
  terminalJournal: null,
  organizationAuthority: null,
  closureState: {
    canonLabel: 'persisted closure posture',
    verification: {
      id: 'verification',
      label: 'Persisted verification',
      summary: 'Persisted verification summary.',
      metrics: [{ label: 'Candidates', value: '5' }],
      rows: [{ label: 'Verification state', value: 'allowed-with-policy' }],
      chips: ['rollback runbook'],
    },
    branch: {
      id: 'branch',
      label: 'Persisted branch',
      summary: 'Persisted branch summary.',
      metrics: [{ label: 'Visible artifacts', value: '2' }],
      rows: [{ label: 'Branch', value: 'bitcode/persisted-branch' }],
      chips: ['BITCODE_READ.md'],
    },
    settlement: {
      id: 'settlement',
      label: 'Persisted settlement',
      summary: 'Persisted settlement summary.',
      metrics: [{ label: 'Credited assets', value: '2' }],
      rows: [{ label: 'Bundle', value: 'bundle-001' }],
      chips: ['selection-materialization'],
      proofFamilies: [
        {
          label: 'selection-materialization',
          artifactPath: '.bitcode/selection-and-materialization-proof.json',
          theoremStatus: 'passed',
          replayArtifacts: '3',
        },
      ],
    },
    ledger: {
      id: 'ledger',
      label: 'Persisted ledger',
      summary: 'Persisted ledger summary.',
      metrics: [{ label: 'History count', value: '1' }],
      rows: [{ label: 'Buyer pool', value: '120 BTD' }],
      chips: [],
      recentRuns: [
        {
          label: 'run-001',
          summary: 'bitcode/bitcode · bitcode/auth-rollback · completed · credited 2',
        },
      ],
    },
  },
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
        topics: ['bitcode'],
      },
      connection: {
        connected: true,
        valid: true,
        mode: 'live connection',
        inventorySource: 'stored_repository_inventory',
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
        metrics: [{ label: 'Target kinds', value: '3' }],
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
      selectedEntries: [{ id: 'entry-1', title: 'rollback runbook', kind: 'runbook', tags: ['auth'] }],
    },
  },
  historyItemCount: 5,
  eventCount: 3,
};

const closureState: TerminalClosureState = {
  canonLabel: 'production workspace posture',
  readReview: {
    id: 'read-review',
    label: 'Read review before Finding Fits',
    summary: 'Measured Read accepted for source-to-shares Finding Fits.',
    metrics: [
      { label: 'Review action', value: 'accept' },
      { label: 'Finding Fits admitted', value: 'yes' },
    ],
    rows: [{ label: 'Read', value: 'read-auth-rollback' }],
    chips: ['post-measurement-pre-fit', 'source-to-shares'],
  },
  verification: {
    id: 'verification',
    label: 'Verification + ranked candidates',
    summary: 'Verification summary.',
    metrics: [
      { label: 'Candidates', value: '5' },
      { label: 'Selected assets', value: '2' },
    ],
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
    metrics: [
      { label: 'Credited assets', value: '2' },
      { label: 'Participating assets', value: '3' },
    ],
    rows: [{ label: 'Bundle', value: 'bundle-001' }],
    chips: ['selection-materialization'],
    fitQualities: [
      {
        label: 'Weighted source-to-shares bundle fit',
        value: '0.328991',
        detail: '10000 bp · source-to-shares-weighted-objective',
      },
    ],
    proofFamilies: [
      {
        label: 'selection-materialization',
        artifactPath: '.bitcode/selection-and-materialization-proof.json',
        theoremStatus: 'passed',
        replayArtifacts: '3',
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
    recentRuns: [
      {
        label: 'run-001',
        summary: 'bitcode/bitcode · bitcode/auth-rollback · completed · credited 2',
      },
    ],
  },
};

describe('terminal-transaction-detail helpers', () => {
  it('counts transaction Shippable surfaces', () => {
    expect(countTerminalTransactionShippableSurfaces(detail)).toBe(1);
  });

  it('prefers written assets and delivery mechanisms through explicit helpers', () => {
    expect(getTerminalTransactionWrittenAssets(detail)?.summary).toBe('Written asset summary.');
    expect(getTerminalTransactionDeliveryMechanism(detail)?.pullRequest?.title).toBe('PR');
    expect(getTerminalTransactionDeliveryMechanism(detail)?.summary).toBe('Shippable summary.');
  });

  it('does not treat written AssetPack evidence as a Finish delivery mechanism', () => {
    const writtenOnlyDetail = {
      ...detail,
      shippables: null,
      deliveryMechanism: null,
      writtenAssets: {
        summary: 'Written-only AssetPack evidence.',
        fileChanges: { edited: 1, created: 0, deleted: 0, paths: ['src/index.ts'] },
      },
    };

    expect(getTerminalTransactionDeliveryMechanism(writtenOnlyDetail)).toBeNull();
    expect(countTerminalTransactionShippableSurfaces(writtenOnlyDetail)).toBe(0);
  });

  it('keeps removed deliverables fields out of the active detail contract', () => {
    expect(detail).not.toHaveProperty('deliverables');
  });

  it('builds overview metrics from selected activity and detail', () => {
    expect(buildTerminalTransactionOverviewMetrics(selectedTransaction, detail)).toEqual([
      { label: 'Shippables', value: '1' },
      { label: 'History items', value: '5' },
      { label: 'Event count', value: '3' },
      { label: 'Proof posture', value: 'proof witness ready' },
    ]);
  });

  it('builds identity rows for the selected activity', () => {
    expect(buildTerminalTransactionIdentityRows(selectedTransaction, detail)).toEqual([
      { label: 'Activity id', value: 'tx-001' },
      { label: 'Activity type', value: 'agentic-execution:asset-pack' },
      { label: 'Status', value: 'completed' },
      { label: 'Action lens', value: 'closure' },
      { label: 'Participant', value: 'n/a' },
      { label: 'Ownership', value: 'network' },
      { label: 'Activity summary', value: 'Normalized detail summary.' },
      { label: 'Proof posture', value: 'proof witness ready' },
      { label: 'Closure focus', value: 'bounded disclosure' },
      { label: 'Token total', value: '2,200' },
      { label: 'Measured BTD', value: '24.5' },
      { label: 'BTC fee basis', value: '$1.62' },
      { label: 'Latency', value: '930 ms' },
      { label: 'History items', value: '5' },
      { label: 'Event count', value: '3' },
      { label: 'Repository', value: 'bitcode/bitcode' },
      { label: 'Branch', value: 'main' },
      { label: 'Commit', value: 'abc123' },
      { label: 'Provider account', value: 'bitcode' },
      { label: 'Inventory source', value: 'stored_repository_inventory' },
      { label: 'Projection', value: 'depositor' },
      { label: 'Scenario', value: 'auth-remediation' },
      { label: 'Profile', value: 'Targeted deposit' },
      { label: 'Read parser', value: 'benchmark-parser' },
      { label: 'Read scenario', value: 'auth-remediation' },
      { label: 'Auth session', value: 'bitcode/bitcode · 42' },
      { label: 'Selected refs', value: '2' },
    ]);
  });

  it('builds a persisted activity snapshot from saved Bitcode posture', () => {
    expect(buildTerminalTransactionPersistedActivitySnapshot(detail)).toEqual({
      metrics: [
        { label: 'Projection', value: 'depositor' },
        { label: 'Selected refs', value: '2' },
        { label: 'Target kinds', value: '3' },
        { label: 'Closure criteria', value: '2' },
        { label: 'Filtered refs', value: '4' },
      ],
      rows: [
        { label: 'Repository anchor', value: 'bitcode/bitcode' },
        { label: 'Connection mode', value: 'live connection' },
        { label: 'Deposit posture', value: 'Deposit summary.' },
        { label: 'Read posture', value: 'Read summary.' },
        { label: 'Fit posture', value: 'Fit summary.' },
        { label: 'Read scenario', value: 'auth-remediation' },
        { label: 'Read parser', value: 'benchmark-parser' },
        { label: 'Auth session', value: 'bitcode/bitcode · 42' },
        { label: 'Search filter', value: 'auth' },
      ],
      chips: ['runbook (1)', 'runbook', 'bound issuer auth', 'rollback runbook'],
      payload: {
        summary: 'Normalized detail summary.',
        processingStats: {
          time: '4m 12s',
          tokenTotal: 2200,
          measuredBtd: 24.5,
          btcFeeUsdEquivalent: 1.62,
          averageLatencyMs: 930,
        },
        bitcodeActivityState: detail.bitcodeActivityState,
      },
    });
  });

  it('builds closure rows for the selected activity', () => {
    expect(buildTerminalTransactionClosureRows(detail)).toEqual([
      { label: 'Proof posture', value: 'proof witness ready' },
      { label: 'Closure focus', value: 'bounded disclosure' },
      { label: 'Processing time', value: '4m 12s' },
      { label: 'Token total', value: '2,200' },
      { label: 'Measured $BTD', value: '24.5' },
      { label: 'BTC fee basis', value: '$1.62' },
      { label: 'Latency', value: '930 ms' },
    ]);
  });

  it('builds closure follow-through from Terminal closure state', () => {
    expect(buildTerminalTransactionClosureFollowThrough(closureState)).toEqual({
      settlementMetrics: [
        { label: 'Credited assets', value: '2' },
        { label: 'Participating assets', value: '3' },
      ],
      branchArtifacts: ['BITCODE_READ.md', '.bitcode/settlement-preview.json'],
      proofFamilies: [
        {
          label: 'selection-materialization',
          artifactPath: '.bitcode/selection-and-materialization-proof.json',
          theoremStatus: 'passed',
          replayArtifacts: '3',
        },
      ],
      recentHistory: [
        {
          label: 'run-001',
          summary: 'bitcode/bitcode · bitcode/auth-rollback · completed · credited 2',
        },
      ],
    });
  });

  it('builds a reusable closure payload for inline inspection', () => {
    const closureFollowThrough = buildTerminalTransactionClosureFollowThrough(closureState);

    expect(buildTerminalTransactionClosurePayload(selectedTransaction, detail, closureState, closureFollowThrough)).toEqual({
      transaction: {
        id: 'tx-001',
        createdAt: '2026-04-16T12:00:00.000Z',
        proofStatus: 'proof witness ready',
        closureFocus: 'bounded disclosure',
      },
      closure: {
        canonLabel: 'production workspace posture',
        processingStats: {
          time: '4m 12s',
          tokenTotal: 2200,
          measuredBtd: 24.5,
          btcFeeUsdEquivalent: 1.62,
          averageLatencyMs: 930,
        },
        rows: [
          { label: 'Proof posture', value: 'proof witness ready' },
          { label: 'Closure focus', value: 'bounded disclosure' },
          { label: 'Processing time', value: '4m 12s' },
          { label: 'Token total', value: '2,200' },
          { label: 'Measured $BTD', value: '24.5' },
          { label: 'BTC fee basis', value: '$1.62' },
          { label: 'Latency', value: '930 ms' },
        ],
        settlementMetrics: [
          { label: 'Credited assets', value: '2' },
          { label: 'Participating assets', value: '3' },
        ],
        branchArtifacts: ['BITCODE_READ.md', '.bitcode/settlement-preview.json'],
        proofFamilies: [
          {
            label: 'selection-materialization',
            artifactPath: '.bitcode/selection-and-materialization-proof.json',
            theoremStatus: 'passed',
            replayArtifacts: '3',
          },
        ],
        recentHistory: [
          {
            label: 'run-001',
            summary: 'bitcode/bitcode · bitcode/auth-rollback · completed · credited 2',
          },
        ],
        readReview: closureState.readReview,
        verification: closureState.verification,
        branch: closureState.branch,
        settlement: closureState.settlement,
        ledger: closureState.ledger,
      },
    });
  });

  it('falls back to persisted closure canon when live closure state is absent', () => {
    const closureFollowThrough = buildTerminalTransactionClosureFollowThrough(null);

    expect(buildTerminalTransactionClosurePayload(selectedTransaction, detail, detail.closureState, closureFollowThrough)).toMatchObject({
      closure: {
        canonLabel: 'persisted closure posture',
        verification: {
          id: 'verification',
          label: 'Persisted verification',
        },
        settlement: {
          id: 'settlement',
          label: 'Persisted settlement',
        },
      },
    });
  });
});
