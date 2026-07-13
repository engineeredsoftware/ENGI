/**
 * Read scenario panel — orchestration for demonstration measurement + review actions.
 */

'use client';

import React from 'react';

import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer';
import BitcodeMetricGrid from '@/components/bitcode/pipeline/BitcodeMetricGrid/BitcodeMetricGrid';
import BitcodeWorkspaceCard from '@/components/bitcode/pipeline/BitcodeWorkspaceCard/BitcodeWorkspaceCard';
import type { TerminalActivityRecordDraft } from '@/components/bitcode/pipeline/models/pipeline-activity-history';
import {
  TERMINAL_INLINE_EXPLAINERS,
  TERMINAL_WORKSPACE_EXPLAINERS,
} from '@/components/bitcode/pipeline/models/workspace-explainers';
import { jumpToShellSection } from '@/components/bitcode/pipeline/ShellReading/shell-reading';
import { useReadScenarioActions } from './hooks/use-read-scenario-actions';
import { ReadsReadScenarioFittingReview } from '@/components/reads/ReadsReadScenarioFittingReview/ReadsReadScenarioFittingReview';
import { ReadsReadScenarioList } from '@/components/reads/ReadsReadScenarioList/ReadsReadScenarioList';

interface TerminalReadScenarioPanelProps {
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  showDemonstrationScenarios?: boolean;
}

export default function ReadsReadScenarioPanel({
  onRecordActivity,
  showDemonstrationScenarios = true,
}: TerminalReadScenarioPanelProps) {
  const {
    needState,
    actionMessage,
    isRecording,
    isReviewing,
    isLoadingReadFittingReview,
    readFittingReview,
    reviewFeedback,
    setReviewFeedback,
    selectScenario,
    handleRecordActiveNeed,
    handleReviewNeed,
  } = useReadScenarioActions({ onRecordActivity, showDemonstrationScenarios });

  if (!needState) {
    return (
      <BitcodeWorkspaceCard
        id="terminalReadScenarios"
        kicker="Read measurement"
        title="Choose the active read measurement"
        summary="Reading the current reader demand frame, parser posture, and target structure."
        explainer={TERMINAL_WORKSPACE_EXPLAINERS.readScenarios}
      >
        <p className="mt-4 text-sm leading-6 text-neutral-300">
          {showDemonstrationScenarios
            ? 'Loading read scenarios…'
            : 'Live Read measurement, admission, and fit-result controls are in the Deposit + read chain.'}
        </p>
      </BitcodeWorkspaceCard>
    );
  }

  return (
    <BitcodeWorkspaceCard
      id="terminalReadScenarios"
      kicker="Read measurement"
      title="Choose the active read measurement"
      summary="Keep the current reader demand frame explicit before reading asset-pack fit, proof, or settlement posture."
      explainer={TERMINAL_WORKSPACE_EXPLAINERS.readScenarios}
      headerAside={
        <BitcodeMetricGrid
          metrics={[
            { label: 'Active parser', value: needState.parserKind },
            { label: 'Closure criteria', value: String(needState.closureCriteriaCount) },
            { label: 'Target kinds', value: String(needState.targetKindCount) },
          ]}
          columnsClassName="tablet:grid-cols-3"
          itemClassName="rounded-2xl border border-white/8 bg-black/20 px-4 py-4"
          labelClassName="text-[0.62rem] uppercase tracking-[0.16em] text-emerald-300/85"
          valueClassName="text-sm font-semibold text-neutral-200"
        />
      }
    >
      {actionMessage ? (
        <div className="mt-4 rounded-[1.3rem] border border-white/8 bg-white/5 px-4 py-4 text-sm leading-6 text-neutral-200">
          {actionMessage}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-[0.66rem] uppercase tracking-[0.2em] text-neutral-300">
          <span>Ledger write</span>
          <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.activeNeed} />
        </div>
        <button
          type="button"
          disabled={isRecording}
          onClick={() => {
            void handleRecordActiveNeed();
          }}
          className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRecording ? 'Recording read…' : 'Record active read'}
        </button>
        <button
          type="button"
          disabled={isReviewing}
          onClick={() => {
            void handleReviewNeed('accept');
          }}
          className="rounded-[1.4rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isReviewing ? 'Reviewing Read…' : 'Accept Read for Finding Fits'}
        </button>
        <button
          type="button"
          disabled={isReviewing}
          onClick={() => {
            void handleReviewNeed('reject');
          }}
          className="rounded-[1.4rem] border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-100 transition hover:border-red-300/45 hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reject Read
        </button>
        <button
          type="button"
          disabled={isReviewing}
          onClick={() => {
            void handleReviewNeed('remeasure-with-feedback');
          }}
          className="rounded-[1.4rem] border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:border-amber-300/45 hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Remeasure with feedback
        </button>
        <button
          type="button"
          onClick={() => jumpToShellSection('terminalReadScenarios')}
          className="rounded-[1.4rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15"
        >
          Focus read measurement
        </button>
        <button
          type="button"
          onClick={() => jumpToShellSection('terminalDepositReadWorkbench')}
          className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/18 hover:bg-white/10"
        >
          Focus asset-pack fit
        </button>
      </div>

      <label className="mt-4 block rounded-[1.3rem] border border-white/8 bg-black/20 px-4 py-4">
        <span className="text-[0.66rem] uppercase tracking-[0.2em] text-neutral-400">
          Read-review feedback
        </span>
        <textarea
          value={reviewFeedback}
          onChange={(event) => setReviewFeedback(event.target.value)}
          rows={3}
          placeholder="Optional feedback for reject or remeasure decisions."
          className="mt-3 w-full resize-none rounded-[1rem] border border-white/8 bg-black/30 px-3 py-3 text-sm leading-6 text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-emerald-300/35"
        />
      </label>

      <ReadsReadScenarioFittingReview
        isLoading={isLoadingReadFittingReview}
        review={readFittingReview}
      />

      <ReadsReadScenarioList
        scenarios={needState.scenarios}
        onSelect={selectScenario}
      />
    </BitcodeWorkspaceCard>
  );
}

/** @deprecated Prefer ReadsReadScenarioPanel */
export { ReadsReadScenarioPanel as TerminalReadScenarioPanel };
