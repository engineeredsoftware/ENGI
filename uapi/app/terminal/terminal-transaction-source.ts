import { ENABLE_MOCKS } from '@/config/featureFlags';
import type { TransactionDataMode } from '@/components/bitcode/execution/bitcode-transaction-types';

import { isMockWorkspaceRunId, MOCK_RUNS, type WorkspaceRun } from './terminal-run-data';
import { mergeProtocolProjectedRun } from './terminal-protocol-projection';

export type TerminalTransactionDataMode = TransactionDataMode;

type ReviewFallbackOptions = {
  liveHistoryCount: number;
  mockMode: boolean;
  selectedTransactionId?: string | null;
  mocksEnabled?: boolean;
  projectedRunPresent?: boolean;
  allowExplicitMockSelection?: boolean;
};

export function shouldUseReviewFallbackTransactions({
  liveHistoryCount,
  mockMode,
  selectedTransactionId,
  mocksEnabled = ENABLE_MOCKS,
  projectedRunPresent = false,
  allowExplicitMockSelection = true,
}: ReviewFallbackOptions) {
  return (
    !mockMode &&
    !projectedRunPresent &&
    liveHistoryCount === 0 &&
    (mocksEnabled || (allowExplicitMockSelection && isMockWorkspaceRunId(selectedTransactionId)))
  );
}

type ResolveTransactionSourceOptions = {
  liveRuns: WorkspaceRun[];
  mockMode: boolean;
  selectedTransactionId?: string | null;
  mocksEnabled?: boolean;
  projectedRun?: WorkspaceRun | null;
  allowExplicitMockSelection?: boolean;
};

export function resolveTerminalTransactionSource({
  liveRuns,
  mockMode,
  selectedTransactionId,
  mocksEnabled = ENABLE_MOCKS,
  projectedRun = null,
  allowExplicitMockSelection = true,
}: ResolveTransactionSourceOptions): {
  dataMode: TerminalTransactionDataMode;
  runs: WorkspaceRun[];
} {
  if (mockMode) {
    return {
      dataMode: 'mock-review',
      runs: MOCK_RUNS,
    };
  }

  const mergedRuns = mergeProtocolProjectedRun(liveRuns, projectedRun);

  if (
    shouldUseReviewFallbackTransactions({
      liveHistoryCount: liveRuns.length,
      mockMode,
      selectedTransactionId,
      mocksEnabled,
      projectedRunPresent: Boolean(projectedRun),
      allowExplicitMockSelection,
    })
  ) {
    return {
      dataMode: 'review-fallback',
      runs: MOCK_RUNS,
    };
  }

  return {
    dataMode: 'live',
    runs: mergedRuns,
  };
}
