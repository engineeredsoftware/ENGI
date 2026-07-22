'use client';

/**
 * Deposit/Read pipelines data table — shared shell for all product activity grids.
 * Column headers always render (including empty/loading/error) so chrome stays stable.
 */

import React from 'react';

import { formatAgenticExecutionLabel } from '@bitcode/api/src/executions/agentic-execution';

import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer';
import { BITCODE_TRANSACTION_COLUMN_EXPLAINERS } from '@/components/bitcode/pipeline/BitcodeTransactionExplainers/bitcode-transaction-explainers';
import type { TransactionRecord } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';
import {
  ProductDataTableLoadingRow,
  ProductDataTableMessageRow,
} from '@/components/bitcode/pipeline/ProductDataTableStatus/ProductDataTableStatus';
import { TransactionStatusHoverBadge } from '@/components/bitcode/pipeline/TransactionStatusHoverBadge/TransactionStatusHoverBadge';

function formatTimestamp(value: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatTypeLabel(value: string, label?: string) {
  return label || formatAgenticExecutionLabel(value);
}

interface BitcodeTransactionsDataTableProps {
  records: TransactionRecord[];
  selectedTransactionId: string | null;
  onSelectTransaction: (transactionId: string) => void;
  isLoading: boolean;
  error: string | null;
}

const COL_COUNT = 7;

/**
 * Shared shell/table tokens — Packs activity grid mirrors these exactly.
 * Shell is max-w-full + min-w-0 so wide tables scroll inside the card, not
 * the page (iPhone). Table keeps a modest min-width for readable columns.
 */
export const PRODUCT_DATA_TABLE_SHELL_CLASS =
  'mt-4 max-w-full min-w-0 overflow-x-auto overscroll-x-contain border border-white/8 bg-[rgba(4,8,18,0.84)] [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]';
export const PRODUCT_DATA_TABLE_CLASS =
  'w-full min-w-[32rem] border-collapse text-left tablet:min-w-[40rem]';
export const PRODUCT_DATA_TABLE_HEAD_CLASS =
  'border-b border-white/8 bg-white/5 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500';
export const PRODUCT_DATA_TABLE_TH_CLASS = 'whitespace-nowrap px-3 py-2.5 font-medium';
export const PRODUCT_DATA_TABLE_TD_CLASS = 'px-3 py-3 align-top';

export default function BitcodeTransactionsDataTable({
  records,
  selectedTransactionId,
  onSelectTransaction,
  isLoading,
  error,
}: BitcodeTransactionsDataTableProps) {
  const hasRows = records.length > 0;

  return (
    // Height is natural: header + status row, or header + data rows. No min-h.
    <div
      data-testid="bitcode-transactions-data-table-shell"
      className={PRODUCT_DATA_TABLE_SHELL_CLASS}
    >
      <table
        aria-label="Recent Bitcode transactions"
        className={PRODUCT_DATA_TABLE_CLASS}
      >
        <thead className={PRODUCT_DATA_TABLE_HEAD_CLASS}>
          <tr>
            <th className={PRODUCT_DATA_TABLE_TH_CLASS}>
              <span className="inline-flex items-center gap-2">
                <span>Transaction</span>
                <BitcodeInlineExplainer
                  explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.transaction}
                />
              </span>
            </th>
            <th className={PRODUCT_DATA_TABLE_TH_CLASS}>
              <span className="inline-flex items-center gap-2">
                <span>Lens</span>
                <BitcodeInlineExplainer
                  explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.lens}
                />
              </span>
            </th>
            <th className={PRODUCT_DATA_TABLE_TH_CLASS}>
              <span className="inline-flex items-center gap-2">
                <span>Status</span>
                <BitcodeInlineExplainer
                  explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.status}
                />
              </span>
            </th>
            <th className={PRODUCT_DATA_TABLE_TH_CLASS}>
              <span className="inline-flex items-center gap-2">
                <span>Participant</span>
                <BitcodeInlineExplainer
                  explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.participant}
                />
              </span>
            </th>
            <th className={PRODUCT_DATA_TABLE_TH_CLASS}>
              <span className="inline-flex items-center gap-2">
                <span>Repository</span>
                <BitcodeInlineExplainer
                  explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.repository}
                />
              </span>
            </th>
            <th className={PRODUCT_DATA_TABLE_TH_CLASS}>
              <span className="inline-flex items-center gap-2">
                <span>Proof</span>
                <BitcodeInlineExplainer
                  explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.proof}
                />
              </span>
            </th>
            <th className={PRODUCT_DATA_TABLE_TH_CLASS}>
              <span className="inline-flex items-center gap-2">
                <span>Started</span>
                <BitcodeInlineExplainer
                  explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.started}
                />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <ProductDataTableLoadingRow
              colCount={COL_COUNT}
              label="Loading Bitcode transactions"
              data-testid="bitcode-transactions-loading-state"
            />
          ) : error ? (
            <ProductDataTableMessageRow
              colCount={COL_COUNT}
              tone="error"
              role="alert"
              data-testid="bitcode-transactions-error-state"
            >
              {error}
            </ProductDataTableMessageRow>
          ) : !hasRows ? (
            <ProductDataTableMessageRow
              colCount={COL_COUNT}
              data-testid="bitcode-transactions-empty-state"
            >
              No matching read activity. Adjust search parameters.
            </ProductDataTableMessageRow>
          ) : (
            records.map((record) => {
              const isSelected = record.id === selectedTransactionId;
              return (
                <tr
                  key={record.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => onSelectTransaction(record.id)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    onSelectTransaction(record.id);
                  }}
                  className={`cursor-pointer border-t border-white/6 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/55 ${isSelected ? 'bg-emerald-400/10' : 'hover:bg-white/5'
                    }`}
                >
                  <td className={PRODUCT_DATA_TABLE_TD_CLASS}>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-neutral-500">
                      {record.id}
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-white">
                      {formatTypeLabel(record.type, record.typeLabel)}
                    </p>
                    <p className="mt-1 max-w-[24rem] text-sm leading-5 text-neutral-300">
                      {record.summary}
                    </p>
                  </td>
                  <td className={PRODUCT_DATA_TABLE_TD_CLASS}>
                    <span className="border border-white/10 bg-white/5 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-200">
                      {record.transactionLens}
                    </span>
                  </td>
                  <td className={PRODUCT_DATA_TABLE_TD_CLASS}>
                    <TransactionStatusHoverBadge
                      runId={record.id}
                      status={record.status}
                      errorMessage={record.errorMessage}
                      summary={record.summary}
                    />
                  </td>
                  <td className={`${PRODUCT_DATA_TABLE_TD_CLASS} text-sm text-neutral-200`}>
                    <p>{record.participant}</p>
                    <p className="mt-1 text-[0.72rem] uppercase tracking-[0.16em] text-neutral-500">
                      {record.isOwnTransaction ? 'mine' : 'network'}
                    </p>
                  </td>
                  <td className={`${PRODUCT_DATA_TABLE_TD_CLASS} text-sm text-neutral-200`}>
                    <p>{record.repository}</p>
                    <p className="mt-1 text-[0.72rem] uppercase tracking-[0.16em] text-neutral-500">
                      {record.branch}
                    </p>
                  </td>
                  <td className={`${PRODUCT_DATA_TABLE_TD_CLASS} text-sm text-neutral-200`}>
                    <p>{record.proofStatus}</p>
                    <p className="mt-1 text-[0.72rem] uppercase tracking-[0.16em] text-neutral-500">
                      {record.closureFocus}
                    </p>
                  </td>
                  <td className={`${PRODUCT_DATA_TABLE_TD_CLASS} text-sm text-neutral-200`}>
                    {formatTimestamp(record.createdAt)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
