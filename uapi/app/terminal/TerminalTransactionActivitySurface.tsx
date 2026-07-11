'use client';

import React from 'react';
import { useMemo, useState } from 'react';

import { getBitcodeActivityKindLabel } from '@/components/bitcode/activity/bitcode-activity-model';
import BitcodeChipCloud from '@/components/bitcode/execution/BitcodeChipCloud';
import BitcodeDetailRowList from '@/components/bitcode/execution/BitcodeDetailRowList';
import { isMockTransactionDataMode } from '@/components/bitcode/execution/bitcode-transaction-data-mode';
import BitcodeExecutionStreamPanel from '@/components/bitcode/execution/BitcodeExecutionStreamPanel';
import BitcodeMetricGrid from '@/components/bitcode/execution/BitcodeMetricGrid';
import BitcodePayloadDetailCard from '@/components/bitcode/execution/BitcodePayloadDetailCard';
import type { TransactionDataMode } from '@/components/bitcode/execution/bitcode-transaction-types';
import { usePipelineExecution } from '@/hooks/usePipelineExecution';

import { buildTerminalRunActivityFromEvents, buildTerminalRunActivityFromMock } from './terminal-run-activity';
import { MOCK_RUN_ACTIVITY, type WorkspaceRun } from './terminal-run-data';
import type { TerminalRunDetailSnapshot } from './terminal-transaction-detail-snapshot';
import { buildTerminalTransactionPersistedActivitySnapshot } from './terminal-transaction-detail';

interface TerminalTransactionActivitySurfaceProps {
  selectedRun: WorkspaceRun;
  detail: TerminalRunDetailSnapshot | null;
  transactionDataMode: TransactionDataMode;
}

export default function TerminalTransactionActivitySurface({
  selectedRun,
  detail,
  transactionDataMode,
}: TerminalTransactionActivitySurfaceProps) {
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const usesMockTransactions = isMockTransactionDataMode(transactionDataMode);
  const liveRun = usePipelineExecution(usesMockTransactions ? null : selectedRun.id);

  const activity = useMemo(() => {
    if (usesMockTransactions) {
      return buildTerminalRunActivityFromMock(MOCK_RUN_ACTIVITY[selectedRun.id]);
    }

    return buildTerminalRunActivityFromEvents(
      liveRun.events,
      liveRun.latestWorkUpdate,
      liveRun.iterationUpdates,
      liveRun.error,
    );
  }, [liveRun.error, liveRun.events, liveRun.iterationUpdates, liveRun.latestWorkUpdate, selectedRun.id, usesMockTransactions]);
  const persistedActivity = useMemo(
    () => buildTerminalTransactionPersistedActivitySnapshot(detail),
    [detail],
  );
  const hasLiveActivity = Boolean(
    activity &&
      (activity.output ||
        activity.activityRecords.length ||
        activity.activityKinds.length ||
        activity.iterationUpdates.length ||
        activity.latestWorkUpdate ||
        activity.error ||
        activity.generationCount ||
        activity.isStreamingComplete),
  );

  if (!usesMockTransactions && !hasLiveActivity && persistedActivity) {
    return (
      <BitcodePayloadDetailCard
        kicker="Bitcode activity"
        title="Persisted Bitcode posture"
        summary="Live execution updates are unavailable for this selected activity, so the Bitcode Terminal is rereading the saved deposit, read, fit, and selection posture directly from the ledger."
        payload={persistedActivity.payload}
        rawLabel="Persisted activity payload"
      >
        <>
          <BitcodeMetricGrid metrics={persistedActivity.metrics} columnsClassName="sm:grid-cols-2 xl:grid-cols-3" />
          <BitcodeDetailRowList rows={persistedActivity.rows} className="mt-4" />
          <BitcodeChipCloud chips={persistedActivity.chips} className="mt-4" />
        </>
      </BitcodePayloadDetailCard>
    );
  }

  if (!activity) {
    return (
      <div
        data-testid="terminal-activity-empty-state"
        role="status"
        className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-8 text-sm text-neutral-400"
      >
        No activity stream is available for this selected Bitcode activity yet.
      </div>
    );
  }

  return (
    <section
      data-testid="terminal-activity-stream-surface"
      aria-labelledby="terminalActivityStreamTitle"
      className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-[rgba(5,9,18,0.9)]"
    >
      <div className="border-b border-white/8 px-5 py-4">
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-emerald-300/75">Bitcode activity</p>
        <h3 id="terminalActivityStreamTitle" className="mt-2 text-lg font-semibold text-white">Execution activity and work updates</h3>
        <p className="mt-2 text-sm leading-6 text-neutral-300">
          Read the selected Bitcode activity&apos;s execution stream, state, and iteration updates directly from the Bitcode Terminal.
          Current convergence keeps execution primitives explicit here while the broader Bitcode activity family also admits
          transactions, notifications, and later public or personal system usage.
        </p>
        {activity.activityKinds.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {activity.activityKinds.map((kind) => (
              <span
                key={kind}
                className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[0.64rem] uppercase tracking-[0.18em] text-emerald-200/80"
              >
                {getBitcodeActivityKindLabel(kind)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <BitcodeExecutionStreamPanel
        className="relative"
        isProcessing={!activity.isStreamingComplete && !activity.error}
        executionState={activity.executionState}
        isStreamingComplete={activity.isStreamingComplete}
        generationCount={activity.generationCount}
        error={activity.error}
        runId={selectedRun.id}
        output={activity.output}
        outputDetails={activity.outputDetails}
        onRetry={() => {}}
        onDismissError={() => {}}
        userHasScrolled={userHasScrolled}
        setUserHasScrolled={setUserHasScrolled}
        compact={true}
        latestWorkUpdate={activity.latestWorkUpdate}
        iterationUpdates={activity.iterationUpdates || []}
        workUpdatesClassName="space-y-4 border-t border-gray-700/60 bg-gray-900/40 px-4 pb-4"
      />
    </section>
  );
}
