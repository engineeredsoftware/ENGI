/**
 * Measured-Read admission steps, fit host stream, and result-recording actions.
 */

'use client';

import React from 'react';

import BitcodeExecutionStreamPanel from '@/components/bitcode/pipeline/BitcodeExecutionStreamPanel/BitcodeExecutionStreamPanel';
import type { TerminalReadFitsFindingSynthesisHostStreamSnapshot } from '@/components/bitcode/pipeline/PipelineHostClient/pipeline-host-client';
import { jumpToShellSection } from '@/components/bitcode/pipeline/ShellReading/shell-reading';
import type { WorkbenchKeyValueRow } from '@/components/reads/models/deposit-read-evidence-rows';
import type { ReadFitsFindingProgressState } from '@/components/reads/models/read-workbench-values';

export type ReadsMeasuredReadAdmissionPanelProps = {
  readFitsFindingProgress: ReadFitsFindingProgressState;
  recordingKey: 'deposit' | 'read' | 'read-admission' | 'fit' | null;
  readAdmissionActionLabel: string;
  fitResultActionLabel: string;
  liveFitActionLabel: string;
  canRunLiveFit: boolean;
  showDemonstrationWorkbench: boolean;
  hostMessage: string | null;
  hostRequestReady: boolean;
  hostRequestMissing: string[];
  hostIdentifierRows: WorkbenchKeyValueRow[];
  hostEventsLength: number;
  hostState: 'idle' | 'running' | 'completed' | 'failed';
  hostStreamSnapshot: TerminalReadFitsFindingSynthesisHostStreamSnapshot;
  hostUserHasScrolled: boolean;
  setHostUserHasScrolled: (value: boolean) => void;
  setHostMessage: (value: string | null) => void;
  onRecordReadAdmission: () => void;
  onRunLiveFit: () => void;
  onRecordFit: () => void;
};

const ADMISSION_STEPS = [
  { id: 'draft', label: '1. Read framed', detail: 'Repository, branch, commit, and demand frame are visible.' },
  { id: 'measured', label: '2. Read measured', detail: 'Read posture is persisted as ledger evidence.' },
  { id: 'admitted', label: '3. Fit admitted', detail: 'Measured Read may enter source-bound Finding Fits.' },
  {
    id: 'fit-recorded',
    label: '4. Result recorded',
    detail: 'Fit result posture is reviewable before proof or settlement.',
  },
] as const;

export default function ReadsMeasuredReadAdmissionPanel({
  readFitsFindingProgress,
  recordingKey,
  readAdmissionActionLabel,
  fitResultActionLabel,
  liveFitActionLabel,
  canRunLiveFit,
  showDemonstrationWorkbench,
  hostMessage,
  hostRequestReady,
  hostRequestMissing,
  hostIdentifierRows,
  hostEventsLength,
  hostState,
  hostStreamSnapshot,
  hostUserHasScrolled,
  setHostUserHasScrolled,
  setHostMessage,
  onRecordReadAdmission,
  onRunLiveFit,
  onRecordFit,
}: ReadsMeasuredReadAdmissionPanelProps) {
  return (
    <section className="mt-5 rounded-[1.45rem] border border-emerald-400/16 bg-emerald-400/[0.06] px-5 py-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.2em] text-emerald-200/80">read state</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Measured Read before fit result</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
            Recording a Read stores the measured demand frame. It does not mean Bitcode found a fit. Finding Fits
            must then return worthy_fit, no_worthy_fit, or blocked_readiness before settlement or finality can
            proceed.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-200">
          {readFitsFindingProgress.replace('-', ' ')}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {ADMISSION_STEPS.map((step) => {
          const active = step.id === readFitsFindingProgress;
          return (
            <div
              key={step.id}
              className={`rounded-[1.1rem] border px-4 py-4 text-sm ${
                active ? 'border-emerald-300/35 bg-emerald-300/10' : 'border-white/8 bg-black/20'
              }`}
            >
              <p className="font-semibold text-neutral-100">{step.label}</p>
              <p className="mt-2 leading-6 text-neutral-400">{step.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={recordingKey !== null || readFitsFindingProgress !== 'measured'}
          onClick={onRecordReadAdmission}
          className="rounded-[1.25rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {readAdmissionActionLabel}
        </button>
        <button
          type="button"
          disabled={recordingKey !== null}
          onClick={() => jumpToShellSection('terminalFitWorkbench')}
          className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-55"
        >
          Review fit result posture
        </button>
        <button
          type="button"
          disabled={!canRunLiveFit}
          onClick={onRunLiveFit}
          className="rounded-[1.25rem] border border-sky-300/30 bg-sky-300/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:border-sky-200/50 hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {liveFitActionLabel}
        </button>
        <button
          type="button"
          disabled={recordingKey !== null || readFitsFindingProgress !== 'admitted'}
          onClick={onRecordFit}
          className="rounded-[1.25rem] border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {fitResultActionLabel}
        </button>
      </div>
      {!showDemonstrationWorkbench &&
      (hostMessage || !hostRequestReady || hostEventsLength > 0) ? (
        <div className="mt-4 rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-neutral-300">
          <p className="font-medium text-neutral-100">
            {hostMessage ||
              `Live fit waiting for ${
                hostRequestReady ? 'stream events' : hostRequestMissing.join(', ')
              }.`}
          </p>
          {hostIdentifierRows.length ? (
            <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {hostIdentifierRows.map((row) => (
                <div key={row.label} className="rounded-[0.9rem] border border-white/8 bg-white/[0.03] px-3 py-2">
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">{row.label}</dt>
                  <dd className="mt-1 break-words font-mono text-[0.7rem] text-neutral-200">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {hostEventsLength || hostState === 'running' || hostState === 'failed' ? (
            <div className="mt-4 overflow-hidden rounded-[1rem] border border-white/8 bg-[rgba(5,9,18,0.88)]">
              <BitcodeExecutionStreamPanel
                className="relative"
                isProcessing={hostState === 'running'}
                executionState={hostStreamSnapshot.executionState}
                isStreamingComplete={hostStreamSnapshot.isStreamingComplete}
                generationCount={hostStreamSnapshot.generationCount}
                error={hostStreamSnapshot.error}
                runId={hostStreamSnapshot.runId || undefined}
                metadataRows={hostIdentifierRows}
                output={hostStreamSnapshot.output}
                outputDetails={hostStreamSnapshot.outputDetails}
                onRetry={onRunLiveFit}
                onDismissError={() => {
                  setHostMessage(null);
                }}
                userHasScrolled={hostUserHasScrolled}
                setUserHasScrolled={setHostUserHasScrolled}
                compact={true}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
