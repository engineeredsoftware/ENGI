import {
  buildTerminalTransactionFilterOptions,
  buildTerminalTransactionFilters,
  filterTerminalTransactions,
  normalizeTerminalTransactions,
} from '@/app/terminal/terminal-transactions';
import type { WorkspaceRun } from '@/components/bitcode/pipeline/models/pipeline-run-data';

describe('terminal-transactions', () => {
  const runs: WorkspaceRun[] = [
    {
      id: 'tx-1',
      created_at: '2026-04-16T12:00:00.000Z',
      type: 'agentic-execution:asset-pack',
      status: 'completed',
      summary: 'Materialized a deposit-side transaction.',
      repository: 'bitcode/bitcode',
      branch: 'main',
      participant: 'garrett',
      isOwnTransaction: true,
      proofStatus: 'bounded proof ready',
      closureFocus: 'branch artifacts',
      tokenTotal: 400,
      btcFeeUsdEquivalent: 1.5,
      measuredBtd: 12,
    },
    {
      id: 'tx-2',
      created_at: '2026-04-16T11:00:00.000Z',
      type: 'agentic-execution:read-measurement',
      status: 'running',
      summary: 'Completed a read-measurement pass.',
      repository: 'bitcode/research',
      branch: 'fit-review',
      participant: 'research-partner',
      isOwnTransaction: false,
      proofStatus: 'verification in flight',
      closureFocus: 'read measurement',
      tokenTotal: 200,
      btcFeeUsdEquivalent: 0.75,
      measuredBtd: 6,
    },
  ];

  it('normalizes transactions from workspace runs', () => {
    const records = normalizeTerminalTransactions(runs);

    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      id: 'tx-1',
      type: 'agentic-execution:asset-pack',
      typeLabel: 'AssetPack execution',
      transactionLens: 'deposit',
      participant: 'garrett',
      repository: 'bitcode/bitcode',
      isOwnTransaction: true,
    });
    expect(records[1]).toMatchObject({
      id: 'tx-2',
      type: 'agentic-execution:read-measurement',
      typeLabel: 'read measurement execution',
      transactionLens: 'read',
      participant: 'research-partner',
      repository: 'bitcode/research',
      isOwnTransaction: false,
    });
  });

  it('filters transactions by search, ownership, and repository', () => {
    const records = normalizeTerminalTransactions(runs);
    const filters = {
      ...buildTerminalTransactionFilters(),
      searchTerm: 'read measurement',
      ownership: 'network' as const,
      repository: 'bitcode/research',
    };

    const filtered = filterTerminalTransactions(records, filters);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('tx-2');
  });

  it('filters transactions by participant and proof posture', () => {
    const records = normalizeTerminalTransactions(runs);
    const filters = {
      ...buildTerminalTransactionFilters(),
      participant: 'garrett',
      proofStatus: 'bounded proof ready',
    };

    const filtered = filterTerminalTransactions(records, filters);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('tx-1');
  });

  it('sorts transactions by highest BTC fee basis when requested', () => {
    const records = normalizeTerminalTransactions(runs);
    const filters = {
      ...buildTerminalTransactionFilters(),
      sort: 'highest-btc-fee-basis' as const,
    };

    const filtered = filterTerminalTransactions(records, filters);

    expect(filtered.map((record) => record.id)).toEqual(['tx-1', 'tx-2']);
  });

  it('builds filter options from normalized transactions', () => {
    const options = buildTerminalTransactionFilterOptions(normalizeTerminalTransactions(runs));

    expect(options.statuses).toEqual(['completed', 'running']);
    expect(options.repositories).toEqual(['bitcode/bitcode', 'bitcode/research']);
    expect(options.participants).toEqual(['garrett', 'research-partner']);
    expect(options.proofStatuses).toEqual(['bounded proof ready', 'verification in flight']);
  });
});
