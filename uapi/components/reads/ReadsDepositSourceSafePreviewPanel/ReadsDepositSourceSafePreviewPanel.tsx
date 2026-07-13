'use client';

/**
 * Source-safe preview, AssetPack boundary details, settlement, and disclosure review.
 */


import React from 'react';

import type { WorkbenchKeyValueRow } from '@/components/reads/models/deposit-read-evidence-rows';

export type ReadsDepositSourceSafePreviewPanelProps = {
  summaryRows: WorkbenchKeyValueRow[];
  assetPackPreviewBoundaryRows: WorkbenchKeyValueRow[];
  assetPackSettlementBoundaryRows: WorkbenchKeyValueRow[];
  readingLocalStagingRehearsalRows: WorkbenchKeyValueRow[];
  disclosureRows: WorkbenchKeyValueRow[];
  disclosureSourceSafe: boolean;
};

function DetailGrid({ rows }: { rows: WorkbenchKeyValueRow[] }) {
  return (
    <dl className="mt-3 grid gap-2 md:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="rounded-none border border-white/8 bg-black/20 px-3 py-2">
          <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">{row.label}</dt>
          <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-100">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ReadsDepositSourceSafePreviewPanel({
  summaryRows,
  assetPackPreviewBoundaryRows,
  assetPackSettlementBoundaryRows,
  readingLocalStagingRehearsalRows,
  disclosureRows,
  disclosureSourceSafe,
}: ReadsDepositSourceSafePreviewPanelProps) {
  return (
    <div className="rounded-none border border-white/8 bg-black/20 px-4 py-4">
      <p className="text-[0.64rem] uppercase tracking-[0.18em] text-neutral-500">
        Source-safe preview and settlement readback
      </p>
      <dl className="mt-3 grid gap-2">
        {summaryRows.map((row) => (
          <div key={row.label} className="rounded-none border border-white/8 bg-white/[0.03] px-3 py-2">
            <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">{row.label}</dt>
            <dd className="mt-1 break-words font-mono text-[0.7rem] text-neutral-200">{row.value}</dd>
          </div>
        ))}
      </dl>
      <details className="mt-3 rounded-none border border-cyan-300/15 bg-cyan-300/[0.04] px-3 py-3">
        <summary className="cursor-pointer text-[0.58rem] uppercase tracking-[0.14em] text-cyan-100/85">
          Finding Fits preview, quote, and provenance
        </summary>
        <DetailGrid rows={assetPackPreviewBoundaryRows} />
      </details>
      <details className="mt-3 rounded-none border border-amber-300/15 bg-amber-300/[0.04] px-3 py-3">
        <summary className="cursor-pointer text-[0.58rem] uppercase tracking-[0.14em] text-amber-100/85">
          Settlement rights, compensation, and delivery
        </summary>
        <DetailGrid rows={assetPackSettlementBoundaryRows} />
      </details>
      <details className="mt-3 rounded-none border border-violet-300/15 bg-violet-300/[0.04] px-3 py-3">
        <summary className="cursor-pointer text-[0.58rem] uppercase tracking-[0.14em] text-violet-100/85">
          Local/staging MVP rehearsal
        </summary>
        <DetailGrid rows={readingLocalStagingRehearsalRows} />
      </details>
      <div className="mt-3 rounded-none border border-emerald-400/15 bg-emerald-400/[0.04] px-3 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.14em] text-emerald-200/80">Disclosure review</p>
            <p className="mt-1 text-xs leading-5 text-neutral-300">
              Measurements, roots, fit ids, fee quote, and policy posture are visible. Protected source stays
              withheld until the paid read-right unlock is proven.
            </p>
          </div>
          <span
            className={`rounded-none border px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.12em] ${
              disclosureSourceSafe
                ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                : 'border-red-300/20 bg-red-300/10 text-red-100'
            }`}
          >
            {disclosureSourceSafe ? 'source-safe' : 'blocked'}
          </span>
        </div>
        <DetailGrid rows={disclosureRows} />
      </div>
    </div>
  );
}
