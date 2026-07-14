'use client';

/**
 * Read-Need review actions: synthesize, accept/reject, and request Fit.
 */


import React from 'react';

import type { TerminalReadNeedState } from '@/components/reads/models/read-workbench-values';

export type ReadsDepositReadNeedReviewPanelProps = {
  currentReadNeed: TerminalReadNeedState | null;
  readNeed: TerminalReadNeedState | null;
  readNeedFeedback: string;
  readNeedMessage: string | null;
  readNeedAction: 'synthesize' | 'accept' | 'reject' | 'resynthesize' | null;
  readNeedSynthesisCount: number;
  hasSourceRevision: boolean;
  canRunLiveFit: boolean;
  hostState: 'idle' | 'running' | 'completed' | 'failed';
  onFeedbackChange: (value: string) => void;
  onSynthesize: (action: 'synthesize_read_need' | 'resynthesize_read_need') => void;
  onAccept: () => void;
  onReject: () => void;
  onRequestFit: () => void;
};

export default function ReadsDepositReadNeedReviewPanel({
  currentReadNeed,
  readNeed,
  readNeedFeedback,
  readNeedMessage,
  readNeedAction,
  readNeedSynthesisCount,
  hasSourceRevision,
  canRunLiveFit,
  hostState,
  onFeedbackChange,
  onSynthesize,
  onAccept,
  onReject,
  onRequestFit,
}: ReadsDepositReadNeedReviewPanelProps) {
  return (
    <div className="rounded-none border border-white/8 bg-black/20 px-4 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[0.64rem] uppercase tracking-[0.18em] text-neutral-500">Read-Need review</p>
          <p className="mt-2 text-sm leading-6 text-neutral-300">
            {currentReadNeed
              ? `${currentReadNeed.needId || 'Read-Need'} is ${currentReadNeed.reviewState || 'pending'}.`
              : 'Synthesize the reader request into a reviewable Need before searching deposits.'}
          </p>
        </div>
        <span className="rounded-none border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-300">
          attempts {readNeedSynthesisCount}
        </span>
      </div>

      {readNeedMessage ? (
        <p className="mt-3 rounded-none border border-white/8 bg-white/[0.04] px-3 py-3 text-sm leading-6 text-neutral-200">
          {readNeedMessage}
        </p>
      ) : null}

      <label className="mt-4 block">
        <span className="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">Need feedback</span>
        <textarea
          value={readNeedFeedback}
          onChange={(event) => onFeedbackChange(event.target.value)}
          rows={3}
          placeholder="Optional feedback before requesting another Read-Need synthesis."
          className="mt-2 w-full resize-none rounded-none border border-white/8 bg-black/30 px-3 py-3 text-sm leading-6 text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-orange-300/35"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={readNeedAction !== null || !hasSourceRevision}
          onClick={() => {
            onSynthesize('synthesize_read_need');
          }}
          className="rounded-none border border-orange-300/30 bg-orange-300/10 px-4 py-3 text-sm font-medium text-orange-100 transition hover:border-orange-200/50 hover:bg-orange-300/15 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {readNeedAction === 'synthesize' ? 'Synthesizing…' : 'Synthesize Read-Need'}
        </button>
        <button
          type="button"
          disabled={readNeedAction !== null || !readNeed || readNeed.reviewState === 'accepted'}
          onClick={() => {
            onSynthesize('resynthesize_read_need');
          }}
          className="rounded-none border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {readNeedAction === 'resynthesize' ? 'Resynthesizing…' : 'Resynthesize with feedback'}
        </button>
        <button
          type="button"
          disabled={readNeedAction !== null || !readNeed || readNeed.reviewState === 'accepted'}
          onClick={onAccept}
          className="rounded-none border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {readNeedAction === 'accept' ? 'Accepting…' : 'Accept Read-Need'}
        </button>
        <button
          type="button"
          disabled={readNeedAction !== null || !readNeed || readNeed.reviewState === 'accepted'}
          onClick={onReject}
          className="rounded-none border border-red-300/30 bg-red-300/10 px-4 py-3 text-sm font-medium text-red-100 transition hover:border-red-200/50 hover:bg-red-300/15 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {readNeedAction === 'reject' ? 'Rejecting…' : 'Reject Read-Need'}
        </button>
        <button
          type="button"
          disabled={!canRunLiveFit}
          onClick={onRequestFit}
          className="rounded-none border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {hostState === 'running' ? 'Running Finding Fits…' : 'Request Fit'}
        </button>
      </div>
    </div>
  );
}
