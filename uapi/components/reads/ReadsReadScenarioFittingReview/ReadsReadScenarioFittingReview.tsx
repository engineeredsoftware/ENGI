/**
 * Exchange read-fitting review card for the scenario panel (source-safe metrics).
 */
'use client';

import React from 'react';
import BitcodeMetricGrid from '@/components/bitcode/pipeline/BitcodeMetricGrid/BitcodeMetricGrid';
import type { TerminalReadFittingReviewState } from '@/components/reads/models/read-scenarios';

export type ReadsReadScenarioFittingReviewProps = {
  isLoading: boolean;
  review: TerminalReadFittingReviewState | null;
};

export function ReadsReadScenarioFittingReview({
  isLoading,
  review,
}: ReadsReadScenarioFittingReviewProps) {
  return (
    <div className="mt-6 rounded-[1.45rem] border border-emerald-400/16 bg-emerald-400/[0.06] px-4 py-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.2em] text-emerald-200/80">
            Read-fitting Exchange review
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
            {isLoading
              ? 'Reading reviewable Read admission…'
              : review?.task || 'Reviewable Read admission is pending.'}
          </h3>
          <p className="mt-2 text-sm leading-6 text-neutral-300">
            Reading surfaces the same `/api/read-review` boundary that Exchange uses
            before Finding Fits discovery, fitting, AssetPack assembly, and present-fit
            settlement review.
          </p>
        </div>
        {review ? (
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-200">
            {review.fitSearchAdmitted ? 'fit admitted' : 'fit blocked'}
          </span>
        ) : null}
      </div>

      {review ? (
        <>
          <BitcodeMetricGrid
            metrics={[
              { label: 'Review action', value: review.action },
              { label: 'Review status', value: review.status },
              { label: 'Required before', value: review.requiredBefore },
              { label: 'OC', value: review.objectiveContractId },
            ]}
            columnsClassName="mt-4 tablet:grid-cols-2 xl:grid-cols-4"
            itemClassName="rounded-2xl border border-white/8 bg-black/20 px-4 py-4"
            labelClassName="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500"
            valueClassName="break-words text-xs font-semibold text-neutral-100"
          />
          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-4">
              <p className="text-[0.64rem] uppercase tracking-[0.18em] text-neutral-500">
                Blocked until
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-200">{review.blockedUntil}</p>
            </div>
            <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-4">
              <p className="text-[0.64rem] uppercase tracking-[0.18em] text-neutral-500">
                Fit stages
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-200">
                {(review.blockedStages.length
                  ? review.blockedStages
                  : review.admittedStages
                ).join(' · ') || 'none'}
              </p>
            </div>
            <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-4">
              <p className="text-[0.64rem] uppercase tracking-[0.18em] text-neutral-500">
                Settlement review
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-200">
                {review.settlementReviewStage}
              </p>
            </div>
          </div>
          {review.reviewQuestions.length ? (
            <div className="mt-4 rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-4">
              <p className="text-[0.64rem] uppercase tracking-[0.18em] text-neutral-500">
                Review questions
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-300">
                {review.reviewQuestions.slice(0, 3).map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-sm leading-6 text-neutral-400">
          {isLoading
            ? 'Loading the current Read-fitting review from Exchange…'
            : 'No Read-fitting review payload is available for this scenario yet.'}
        </p>
      )}
    </div>
  );
}
