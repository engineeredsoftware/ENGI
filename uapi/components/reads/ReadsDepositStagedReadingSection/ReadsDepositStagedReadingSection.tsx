/**
 * Staged enterprise reading section: steps, Need review, preview, and Need rows.
 */

'use client';

import React from 'react';

import {
  ReadsEnterpriseReadingSteps,
  type ReadsEnterpriseReadingStep,
} from '@/components/reads/ReadsEnterpriseReadingSteps/ReadsEnterpriseReadingSteps';
import ReadsDepositReadNeedReviewPanel from '@/components/reads/ReadsDepositReadNeedReviewPanel/ReadsDepositReadNeedReviewPanel';
import ReadsDepositSourceSafePreviewPanel from '@/components/reads/ReadsDepositSourceSafePreviewPanel/ReadsDepositSourceSafePreviewPanel';
import type { WorkbenchKeyValueRow } from '@/components/reads/models/deposit-read-evidence-rows';
import { shortIdentifier, textValue } from '@/components/reads/models/read-workbench-values';

export type ReadsDepositStagedReadingSectionProps = {
  activeReadingStage: string;
  routeReadingStage: string | null | undefined;
  transactionIdPresent: boolean;
  failureKind: string;
  stages: ReadsEnterpriseReadingStep[];
  needReview: React.ComponentProps<typeof ReadsDepositReadNeedReviewPanel>;
  sourceSafePreview: React.ComponentProps<typeof ReadsDepositSourceSafePreviewPanel>;
  readNeedRows: WorkbenchKeyValueRow[];
  readNeedRuntimeRows: WorkbenchKeyValueRow[];
  readNeedStorageProjection: Array<Record<string, unknown>>;
};

export default function ReadsDepositStagedReadingSection({
  activeReadingStage,
  routeReadingStage,
  transactionIdPresent,
  failureKind,
  stages,
  needReview,
  sourceSafePreview,
  readNeedRows,
  readNeedRuntimeRows,
  readNeedStorageProjection,
}: ReadsDepositStagedReadingSectionProps) {
  return (
    <section
      className="mt-5 rounded-[1.45rem] border border-sky-300/18 bg-sky-300/[0.06] px-5 py-5"
      data-reading-route-stage={routeReadingStage || ''}
      data-reading-transaction-present={transactionIdPresent ? 'true' : 'false'}
      data-reading-failure-kind={failureKind}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.2em] text-sky-200/80">staged reading</p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            Request Read, review Need, request Fit, review AssetPack, buy and settle
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
            The live pipeline starts from an accepted Read-Need. Preview can expose measurements, roots, score,
            fee quote, and range posture. Protected source unlock requires settlement.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-200">
          {activeReadingStage.replace(/-/g, ' ')}
        </span>
      </div>

      <ReadsEnterpriseReadingSteps stages={stages} activeStageId={activeReadingStage} />

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <ReadsDepositReadNeedReviewPanel {...needReview} />
        <ReadsDepositSourceSafePreviewPanel {...sourceSafePreview} />
      </div>

      {readNeedRows.length ? (
        <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {readNeedRows.map((row) => (
            <div key={row.label} className="rounded-[1rem] border border-white/8 bg-black/20 px-4 py-3 text-sm">
              <dt className="text-[0.6rem] uppercase tracking-[0.14em] text-neutral-500">{row.label}</dt>
              <dd className="mt-1 break-words text-neutral-100">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {readNeedRuntimeRows.length ? (
        <details className="mt-4 rounded-[1.05rem] border border-white/8 bg-black/20 px-4 py-4">
          <summary className="cursor-pointer text-[0.62rem] uppercase tracking-[0.16em] text-sky-200/80">
            Need runtime, storage, and telemetry
          </summary>
          <dl className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {readNeedRuntimeRows.map((row) => (
              <div key={row.label} className="rounded-[0.9rem] border border-white/8 bg-white/[0.03] px-3 py-2">
                <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">{row.label}</dt>
                <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-100">{row.value}</dd>
              </div>
            ))}
          </dl>
          {readNeedStorageProjection.length ? (
            <div className="mt-3 grid gap-2">
              {readNeedStorageProjection.map((record, index) => (
                <div
                  key={`${String(record.recordId || index)}`}
                  className="rounded-[0.85rem] border border-white/8 bg-black/25 px-3 py-2"
                >
                  <p className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">
                    {textValue(record.recordKind) || 'storage record'}
                  </p>
                  <p className="mt-1 break-words font-mono text-[0.66rem] text-neutral-200">
                    {shortIdentifier(record.root) || textValue(record.root) || 'pending'}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </details>
      ) : null}
    </section>
  );
}
