'use client';

import React from 'react';

import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer';
import { BITCODE_TRANSACTION_FILTER_EXPLAINERS } from '@/components/bitcode/pipeline/BitcodeTransactionExplainers/bitcode-transaction-explainers';
import type { TransactionPagination, TransactionPaginationSummary } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';
import { BITCODE_TRANSACTION_PAGE_SIZES } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

interface BitcodeTransactionsPaginationProps {
  pagination: TransactionPaginationSummary;
  onPaginationChange: (nextPagination: TransactionPagination) => void;
}

export default function BitcodeTransactionsPagination({
  pagination,
  onPaginationChange,
}: BitcodeTransactionsPaginationProps) {
  const canMoveBackward = pagination.page > 1;
  const canMoveForward = pagination.page < pagination.totalPages;
  const rangeLabel = pagination.totalRecords
    ? `Rows ${pagination.startRecord}-${pagination.endRecord} of ${pagination.totalRecords}`
    : 'No matching transactions';

  return (
    // One row: range · page · size · previous/next.
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 px-3 py-3 text-[0.64rem] uppercase tracking-[0.16em] text-neutral-400">
      <div className="flex flex-wrap items-center gap-2">
        <span className="border border-white/10 bg-white/5 px-2.5 py-1.5">{rangeLabel}</span>
        <span className="border border-white/10 bg-white/5 px-2.5 py-1.5">
          Page {pagination.page} of {pagination.totalPages}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 border border-white/10 bg-white/5 px-2.5 py-1.5">
          <span>Page size</span>
          <BitcodeInlineExplainer explainer={BITCODE_TRANSACTION_FILTER_EXPLAINERS.pageSize} side="top" />
          <select
            aria-label="Transaction page size"
            value={pagination.pageSize}
            onChange={(event) =>
              onPaginationChange({
                page: 1,
                pageSize: Number(event.target.value) as TransactionPagination['pageSize'],
              })}
            className=" border border-white/10 bg-[rgba(7,12,22,0.92)] px-2 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-100 outline-none"
          >
            {BITCODE_TRANSACTION_PAGE_SIZES.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => onPaginationChange({ page: pagination.page - 1, pageSize: pagination.pageSize })}
          disabled={!canMoveBackward}
          className=" border border-white/10 bg-white/5 px-2.5 py-1.5 text-neutral-200 transition hover:border-emerald-300/35 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPaginationChange({ page: pagination.page + 1, pageSize: pagination.pageSize })}
          disabled={!canMoveForward}
          className=" border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1.5 text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
