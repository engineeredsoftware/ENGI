jest.mock('@/config/featureFlags', () => ({
  ENABLE_MOCKS: true,
}));

import {
  resolveTerminalTransactionSource,
  shouldUseReviewFallbackTransactions,
} from '@/app/terminal/terminal-transaction-source';
import type { WorkspaceRun } from '@/components/bitcode/pipeline/models/pipeline-run-data';

describe('terminal-transaction-source', () => {
  it('enables review fallback only when live history is empty outside full mock review', () => {
    expect(
      shouldUseReviewFallbackTransactions({
        liveHistoryCount: 0,
        mockMode: false,
      }),
    ).toBe(true);

    expect(
      shouldUseReviewFallbackTransactions({
        liveHistoryCount: 2,
        mockMode: false,
      }),
    ).toBe(false);

    expect(
      shouldUseReviewFallbackTransactions({
        liveHistoryCount: 0,
        mockMode: true,
      }),
    ).toBe(false);
  });

  it('allows explicit mock transaction selection to trigger review fallback even when global mocks are disabled', () => {
    expect(
      shouldUseReviewFallbackTransactions({
        liveHistoryCount: 0,
        mockMode: false,
        selectedTransactionId: 'mock-run-branch-remediation',
        mocksEnabled: false,
      }),
    ).toBe(true);

    expect(
      shouldUseReviewFallbackTransactions({
        liveHistoryCount: 0,
        mockMode: false,
        selectedTransactionId: 'live-run-123',
        mocksEnabled: false,
      }),
    ).toBe(false);
  });

  it('keeps live staging empty instead of inventing review fallback rows when mock fallback is disabled', () => {
    expect(
      shouldUseReviewFallbackTransactions({
        liveHistoryCount: 0,
        mockMode: false,
        selectedTransactionId: null,
        mocksEnabled: false,
      }),
    ).toBe(false);

    expect(
      resolveTerminalTransactionSource({
        liveRuns: [],
        mockMode: false,
        selectedTransactionId: null,
        mocksEnabled: false,
      }),
    ).toEqual({
      dataMode: 'live',
      runs: [],
    });
  });

  it('can suppress explicit mock run ids for live staging routes', () => {
    expect(
      shouldUseReviewFallbackTransactions({
        liveHistoryCount: 0,
        mockMode: false,
        selectedTransactionId: 'mock-run-branch-remediation',
        mocksEnabled: false,
        allowExplicitMockSelection: false,
      }),
    ).toBe(false);

    expect(
      resolveTerminalTransactionSource({
        liveRuns: [],
        mockMode: false,
        selectedTransactionId: 'mock-run-branch-remediation',
        mocksEnabled: false,
        allowExplicitMockSelection: false,
      }),
    ).toEqual({
      dataMode: 'live',
      runs: [],
    });
  });

  it('resolves live, review-fallback, and mock-review transaction sources distinctly', () => {
    const liveRuns: WorkspaceRun[] = [
      {
        id: 'live-run-123',
        created_at: '2026-04-16T12:00:00.000Z',
        type: 'agentic-execution:asset-pack',
        status: 'completed',
      },
    ];

    expect(
      resolveTerminalTransactionSource({
        liveRuns,
        mockMode: false,
        selectedTransactionId: null,
        mocksEnabled: false,
      }),
    ).toEqual({
      dataMode: 'live',
      runs: liveRuns,
    });

    expect(
      resolveTerminalTransactionSource({
        liveRuns: [],
        mockMode: false,
        selectedTransactionId: 'mock-run-branch-remediation',
        mocksEnabled: false,
      }),
    ).toMatchObject({
      dataMode: 'review-fallback',
    });

    expect(
      resolveTerminalTransactionSource({
        liveRuns,
        mockMode: true,
        selectedTransactionId: null,
        mocksEnabled: false,
      }),
    ).toMatchObject({
      dataMode: 'mock-review',
    });
  });

  it('treats a projected protocol row as live ledger state and suppresses review fallback', () => {
    const projectedRun: WorkspaceRun = {
      id: 'protocol-live-posture::bitcode-terminal',
      created_at: '2026-04-21T18:00:00.000Z',
      type: 'agentic-execution:read-measurement',
      status: 'running',
      sourceModel: 'protocol-projection',
      summary: 'Live Bitcode read measurement for auth-remediation.',
    };

    expect(
      resolveTerminalTransactionSource({
        liveRuns: [],
        mockMode: false,
        selectedTransactionId: null,
        mocksEnabled: false,
        projectedRun,
      }),
    ).toEqual({
      dataMode: 'live',
      runs: [projectedRun],
    });
  });

  it('prioritizes the projected protocol row ahead of persisted execution history', () => {
    const liveRun: WorkspaceRun = {
      id: 'live-run-123',
      created_at: '2026-04-16T12:00:00.000Z',
      type: 'agentic-execution:asset-pack',
      status: 'completed',
      sourceModel: 'execution-history',
    };
    const projectedRun: WorkspaceRun = {
      id: 'protocol-live-posture::bitcode-terminal',
      created_at: '2026-04-21T18:00:00.000Z',
      type: 'agentic-execution:proof-refresh',
      status: 'running',
      sourceModel: 'protocol-projection',
    };

    expect(
      resolveTerminalTransactionSource({
        liveRuns: [liveRun],
        mockMode: false,
        selectedTransactionId: liveRun.id,
        mocksEnabled: false,
        projectedRun,
      }),
    ).toEqual({
      dataMode: 'live',
      runs: [projectedRun, liveRun],
    });
  });
});
