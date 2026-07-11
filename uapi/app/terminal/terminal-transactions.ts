import { buildAgenticExecutionSummary } from '@bitcode/api/src/executions/agentic-execution';
import { DEFAULT_TRANSACTION_FILTERS } from '@/components/bitcode/execution/bitcode-transaction-types';

import type { WorkspaceRun } from './terminal-run-data';

export type TerminalTransactionOwnership = 'all' | 'mine' | 'network';
export type TerminalTransactionLens = 'all' | 'deposit' | 'read' | 'closure';
export type TerminalTransactionSort = 'newest' | 'oldest' | 'most-tokens' | 'highest-btc-fee-basis';

export interface TerminalTransactionRecord {
  id: string;
  summary: string;
  type: string;
  typeLabel: string;
  status: string;
  repository: string;
  branch: string;
  participant: string;
  proofStatus: string;
  closureFocus: string;
  createdAt: string;
  tokenTotal: number | null;
  btcFeeUsdEquivalent: number | null;
  measuredBtd: number | null;
  itemCount: number;
  isOwnTransaction: boolean;
  transactionLens: Exclude<TerminalTransactionLens, 'all'>;
  searchableText: string;
  /** Source-safe failure text for failed/cancelled hover previews. */
  errorMessage?: string | null;
}

export interface TerminalTransactionFilters {
  searchTerm: string;
  status: string;
  ownership: TerminalTransactionOwnership;
  transactionLens: TerminalTransactionLens;
  repository: string;
  participant: string;
  proofStatus: string;
  sort: TerminalTransactionSort;
}

function normalizeWhitespace(value?: string | null) {
  return value?.trim() || '';
}

function normalizeRunType(value?: string | null) {
  return normalizeWhitespace(value) || 'agentic-execution:asset-pack';
}

function normalizeStatus(value?: string | null) {
  return normalizeWhitespace(value) || 'running';
}

export function normalizeTerminalTransactions(runs: WorkspaceRun[]): TerminalTransactionRecord[] {
  return runs.map((run) => {
    const agenticExecution =
      run.agentic_execution ||
      buildAgenticExecutionSummary({
        type: run.type,
        status: run.status,
      });
    const repository = normalizeWhitespace(run.repository) || 'bitcode/bitcode';
    const branch = normalizeWhitespace(run.branch) || 'n/a';
    const participant = normalizeWhitespace(run.participant) || repository.split('/')[0] || 'connected account';
    const summary =
      normalizeWhitespace(run.summary) || 'Inspect this Bitcode execution from the central Bitcode Terminal detail surface.';
    const status = normalizeStatus(run.status);
    const errorMessage =
      normalizeWhitespace(run.errorMessage) ||
      (status === 'failed' || status === 'cancelled' || status === 'interrupted'
        ? normalizeWhitespace(run.summary)
        : null);
    const proofStatus = normalizeWhitespace(run.proofStatus) || agenticExecution.proofStatus;
    const closureFocus = normalizeWhitespace(run.closureFocus) || agenticExecution.closureFocus;
    const transactionLens = run.transactionLens || agenticExecution.lens;
    const type = normalizeRunType(agenticExecution.canonicalType);
    const typeLabel = agenticExecution.label;
    const searchableText = [
      run.id,
      summary,
      type,
      typeLabel,
      status,
      errorMessage,
      repository,
      branch,
      participant,
      proofStatus,
      closureFocus,
      transactionLens,
    ]
      .join(' ')
      .toLowerCase();

    return {
      id: run.id,
      summary,
      type,
      typeLabel,
      status,
      repository,
      branch,
      participant,
      proofStatus,
      closureFocus,
      createdAt: run.created_at,
      tokenTotal: run.tokenTotal ?? null,
      btcFeeUsdEquivalent: run.btcFeeUsdEquivalent ?? null,
      measuredBtd: run.measuredBtd ?? null,
      itemCount: run.itemCount || 0,
      isOwnTransaction: Boolean(run.isOwnTransaction),
      transactionLens,
      searchableText,
      errorMessage,
    };
  });
}

export function buildTerminalTransactionFilters(): TerminalTransactionFilters {
  return { ...DEFAULT_TRANSACTION_FILTERS };
}

export function filterTerminalTransactions(
  records: TerminalTransactionRecord[],
  filters: TerminalTransactionFilters,
) {
  const searchTerm = filters.searchTerm.trim().toLowerCase();

  const filteredRecords = records.filter((record) => {
    if (searchTerm && !record.searchableText.includes(searchTerm)) return false;
    if (filters.status !== 'all' && record.status !== filters.status) return false;
    if (filters.transactionLens !== 'all' && record.transactionLens !== filters.transactionLens) return false;
    if (filters.repository !== 'all' && record.repository !== filters.repository) return false;
    if (filters.participant !== 'all' && record.participant !== filters.participant) return false;
    if (filters.proofStatus !== 'all' && record.proofStatus !== filters.proofStatus) return false;
    if (filters.ownership === 'mine' && !record.isOwnTransaction) return false;
    if (filters.ownership === 'network' && record.isOwnTransaction) return false;
    return true;
  });

  return [...filteredRecords].sort((left, right) => {
    if (filters.sort === 'oldest') {
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    }

    if (filters.sort === 'most-tokens') {
      return (right.tokenTotal ?? 0) - (left.tokenTotal ?? 0);
    }

    if (filters.sort === 'highest-btc-fee-basis') {
      return (right.btcFeeUsdEquivalent ?? 0) - (left.btcFeeUsdEquivalent ?? 0);
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export function buildTerminalTransactionFilterOptions(records: TerminalTransactionRecord[]) {
  return {
    statuses: Array.from(new Set(records.map((record) => record.status))).sort(),
    repositories: Array.from(new Set(records.map((record) => record.repository))).sort(),
    participants: Array.from(new Set(records.map((record) => record.participant))).sort(),
    proofStatuses: Array.from(new Set(records.map((record) => record.proofStatus))).sort(),
  };
}
