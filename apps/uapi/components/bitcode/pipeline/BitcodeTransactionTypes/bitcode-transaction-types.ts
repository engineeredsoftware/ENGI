'use client';

export type TransactionOwnership = 'all' | 'mine' | 'network';
export type TransactionLens = 'all' | 'deposit' | 'read' | 'closure';
export type TransactionSort = 'newest' | 'oldest' | 'most-tokens' | 'highest-btc-fee-basis';
export type TransactionDataMode = 'live' | 'mock-review' | 'review-fallback';
export const BITCODE_TRANSACTION_PAGE_SIZES = [10, 20, 25, 50] as const;
export type TransactionPageSize = typeof BITCODE_TRANSACTION_PAGE_SIZES[number];

export interface BitcodeExplainerReferences {
  source?: readonly string[];
  canon?: readonly string[];
}

export interface BitcodeExplainer {
  kicker?: string;
  title: string;
  summary: string;
  detail?: string;
  points?: string[];
  references?: BitcodeExplainerReferences;
}

export interface TransactionFilters {
  searchTerm: string;
  status: string;
  ownership: TransactionOwnership;
  transactionLens: TransactionLens;
  repository: string;
  participant: string;
  proofStatus: string;
  sort: TransactionSort;
}

export interface TransactionPagination {
  page: number;
  pageSize: TransactionPageSize;
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  searchTerm: '',
  status: 'all',
  ownership: 'all',
  transactionLens: 'all',
  repository: 'all',
  participant: 'all',
  proofStatus: 'all',
  sort: 'newest',
};

export const DEFAULT_TRANSACTION_PAGINATION: TransactionPagination = {
  page: 1,
  pageSize: 10,
};

export interface TransactionPaginationSummary extends TransactionPagination {
  totalRecords: number;
  totalPages: number;
  startRecord: number;
  endRecord: number;
}

export interface TransactionRecord {
  id: string;
  summary: string;
  type: string;
  typeLabel?: string;
  status: string;
  participant: string;
  repository: string;
  branch: string;
  proofStatus: string;
  closureFocus: string;
  createdAt: string;
  tokenTotal?: number | null;
  isOwnTransaction: boolean;
  transactionLens: Exclude<TransactionLens, 'all'>;
  /** Source-safe failure text for failed/cancelled hover previews. */
  errorMessage?: string | null;
}
