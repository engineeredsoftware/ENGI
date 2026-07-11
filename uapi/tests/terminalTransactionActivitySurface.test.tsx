import React from 'react';
import { render, screen } from '@testing-library/react';

import TerminalTransactionActivitySurface from '@/app/terminal/TerminalTransactionActivitySurface';
import type { WorkspaceRun } from '@/app/terminal/terminal-run-data';
import type { TerminalRunDetailSnapshot } from '@/app/terminal/terminal-transaction-detail-snapshot';

jest.mock('@/components/bitcode/execution/BitcodeExecutionStreamPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="execution-stream-panel">execution stream</div>,
}));

jest.mock('@/hooks/usePipelineExecution', () => ({
  usePipelineExecution: () => ({
    execution: null,
    events: [],
    latestWorkUpdate: null,
    iterationUpdates: [],
    isLoading: false,
    error: null,
  }),
}));

const selectedRun: WorkspaceRun = {
  id: 'tx-activity-001',
  created_at: '2026-04-16T12:00:00.000Z',
  type: 'agentic-execution:read-measurement',
  status: 'completed',
};

const detail: TerminalRunDetailSnapshot = {
  summary: 'Normalized detail summary.',
  shippables: null,
  repoSnapshot: null,
  processingStats: {
    time: null,
    tokenTotal: null,
    measuredBtd: null,
    btcFeeUsdEquivalent: null,
    averageLatencyMs: null,
  },
  proofStatus: 'proof witness ready',
  closureFocus: 'bounded disclosure',
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
        metrics: [],
        rows: [],
        selectedEntries: [{ id: 'entry-1', label: 'rollback runbook' }],
        artifactKinds: ['runbook (1)'],
      },
      read: {
        summary: 'Read summary.',
        metrics: [],
        rows: [],
        closureCriteria: ['bound issuer auth'],
        targetKinds: ['runbook'],
      },
      fit: {
        summary: 'Fit summary.',
        metrics: [],
        rows: [],
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
  historyItemCount: 0,
  eventCount: 0,
};

describe('TerminalTransactionActivitySurface', () => {
  it('falls back to persisted Bitcode posture when no live stream activity is available', () => {
    render(
      <TerminalTransactionActivitySurface
        selectedRun={selectedRun}
        detail={detail}
        transactionDataMode="live"
      />,
    );

    expect(screen.getByText('Persisted Bitcode posture')).toBeTruthy();
    expect(screen.getByText('Repository anchor')).toBeTruthy();
    expect(screen.getByText('bitcode/bitcode')).toBeTruthy();
    expect(screen.getByText('Deposit posture')).toBeTruthy();
    expect(screen.getByText('Deposit summary.')).toBeTruthy();
    expect(screen.getByText('runbook (1)')).toBeTruthy();
    expect(screen.queryByText('Execution activity and work updates')).toBeNull();
  });
});
