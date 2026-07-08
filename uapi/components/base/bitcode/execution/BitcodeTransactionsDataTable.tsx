'use client';

import React from 'react';

import { formatAgenticExecutionLabel } from '@bitcode/api/src/executions/agentic-execution';

import BitcodeInlineExplainer from './BitcodeInlineExplainer';
import { BITCODE_TRANSACTION_COLUMN_EXPLAINERS } from './bitcode-transaction-explainers';
import type { TransactionRecord } from './bitcode-transaction-types';

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

function statusTone(status: string) {
  if (status === 'completed') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  if (status === 'error' || status === 'failed') return 'border-red-500/30 bg-red-500/10 text-red-200';
  return 'border-amber-500/30 bg-amber-500/10 text-amber-100';
}

interface BitcodeTransactionsDataTableProps {
  records: TransactionRecord[];
  selectedTransactionId: string | null;
  onSelectTransaction: (transactionId: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function BitcodeTransactionsDataTable({
  records,
  selectedTransactionId,
  onSelectTransaction,
  isLoading,
  error,
}: BitcodeTransactionsDataTableProps) {
  return (
    <div
      data-testid="bitcode-transactions-data-table-shell"
      className="mt-4 min-h-[20rem] overflow-hidden border border-white/8 bg-[rgba(4,8,18,0.84)]"
    >
      {isLoading ? (
        <div
          data-testid="bitcode-transactions-loading-state"
          role="status"
          aria-live="polite"
          className="px-5 py-10 text-sm text-neutral-400"
        >
          Loading Bitcode transactions…
        </div>
      ) : error ? (
        <div data-testid="bitcode-transactions-error-state" role="alert" className="px-5 py-5 text-sm text-red-200">{error}</div>
      ) : records.length === 0 ? (
        <div data-testid="bitcode-transactions-empty-state" role="status" className="px-5 py-10 text-sm text-neutral-400">No Bitcode transactions match the current filters.</div>
      ) : (
        <div className="overflow-x-auto">
          <table aria-label="Recent Bitcode transactions" className="min-w-full border-collapse text-left">
            <thead className="border-b border-white/8 bg-white/5 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
              <tr>
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <span>Transaction</span>
                    <BitcodeInlineExplainer explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.transaction} />
                  </span>
                </th>
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <span>Lens</span>
                    <BitcodeInlineExplainer explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.lens} />
                  </span>
                </th>
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <span>Status</span>
                    <BitcodeInlineExplainer explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.status} />
                  </span>
                </th>
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <span>Participant</span>
                    <BitcodeInlineExplainer explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.participant} />
                  </span>
                </th>
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <span>Repository</span>
                    <BitcodeInlineExplainer explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.repository} />
                  </span>
                </th>
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <span>Proof</span>
                    <BitcodeInlineExplainer explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.proof} />
                  </span>
                </th>
                <th className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <span>Started</span>
                    <BitcodeInlineExplainer explainer={BITCODE_TRANSACTION_COLUMN_EXPLAINERS.started} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
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
                    className={`cursor-pointer border-t border-white/6 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/55 ${isSelected ? 'bg-emerald-400/10' : 'hover:bg-white/5'}`}
                  >
                    <td className="px-3 py-3 align-top">
                      <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-neutral-500">{record.id}</p>
                      <p className="mt-1.5 text-sm font-medium text-white">{formatTypeLabel(record.type, record.typeLabel)}</p>
                      <p className="mt-1 max-w-[24rem] text-sm leading-5 text-neutral-300">{record.summary}</p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span className=" border border-white/10 bg-white/5 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-200">
                        {record.transactionLens}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span
                        className={` border px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.18em] ${statusTone(record.status)}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top text-sm text-neutral-200">
                      <p>{record.participant}</p>
                      <p className="mt-1 text-[0.72rem] uppercase tracking-[0.16em] text-neutral-500">
                        {record.isOwnTransaction ? 'mine' : 'network'}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top text-sm text-neutral-200">
                      <p>{record.repository}</p>
                      <p className="mt-1 text-[0.72rem] uppercase tracking-[0.16em] text-neutral-500">{record.branch}</p>
                    </td>
                    <td className="px-3 py-3 align-top text-sm text-neutral-200">
                      <p>{record.proofStatus}</p>
                      <p className="mt-1 text-[0.72rem] uppercase tracking-[0.16em] text-neutral-500">{record.closureFocus}</p>
                    </td>
                    <td className="px-3 py-3 align-top text-sm text-neutral-200">{formatTimestamp(record.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
