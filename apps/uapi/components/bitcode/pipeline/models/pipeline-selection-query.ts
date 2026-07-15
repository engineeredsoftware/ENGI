/**
 * URL selection/query helpers for pipeline master-detail pages.
 * Relocated from product experience components/transaction-query.
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */

import type {
  TransactionFilters,
  TransactionLens,
  TransactionOwnership,
  TransactionPagination,
  TransactionSort,
} from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';
import {
  BITCODE_TRANSACTION_PAGE_SIZES,
  DEFAULT_TRANSACTION_PAGINATION,
} from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';
import type { EnterpriseReadingStepId } from '@/components/reads/models/enterprise-reading-ux-state';

import { buildProductTransactionFilters } from '@/components/bitcode/pipeline/models/pipeline-transactions';

const SEARCH_PARAM_KEYS = {
  transactionId: 'transactionId',
  runIdAlias: 'runId',
  detailSection: 'transactionDetail',
  environmentMode: 'environmentMode',
  debug: 'bitcodeDebug',
  search: 'transactionSearch',
  status: 'transactionStatus',
  ownership: 'transactionOwnership',
  lens: 'transactionLens',
  repository: 'transactionRepository',
  participant: 'transactionParticipant',
  proofStatus: 'transactionProof',
  sort: 'transactionSort',
  page: 'transactionPage',
  pageSize: 'transactionPageSize',
  conversationHandoff: 'conversationHandoff',
  conversationId: 'conversationId',
  handoffWorkflow: 'handoffWorkflow',
  handoffPolicy: 'handoffPolicy',
  handoffProofRoot: 'handoffProofRoot',
  handoffRepositoryAnchor: 'handoffRepositoryAnchor',
  handoffSourceSelectors: 'handoffSourceSelectors',
  handoffSummary: 'handoffSummary',
  readingStage: 'readingStage',
} as const;

const TRANSACTION_OWNERSHIP_VALUES: TransactionOwnership[] = ['all', 'mine', 'network'];
const TRANSACTION_LENS_VALUES: TransactionLens[] = ['all', 'deposit', 'read', 'closure'];
const TRANSACTION_SORT_VALUES: TransactionSort[] = ['newest', 'oldest', 'most-tokens', 'highest-btc-fee-basis'];
export type ProductEnvironmentMode = 'mock' | 'development' | 'staging' | 'production';
const PRODUCT_ENVIRONMENT_MODE_VALUES: ProductEnvironmentMode[] = [
  'mock',
  'development',
  'staging',
  'production',
];
export type ProductConversationHandoffWorkflow =
  | 'depositing'
  | 'reading'
  | 'finding_fits'
  | 'exchange'
  | 'settlement'
  | 'delivery';
const PRODUCT_CONVERSATION_HANDOFF_WORKFLOW_VALUES: ProductConversationHandoffWorkflow[] = [
  'depositing',
  'reading',
  'finding_fits',
  'exchange',
  'settlement',
  'delivery',
];
export type ProductConversationHandoffPolicy = 'allowed' | 'retry_required' | 'denied';
const PRODUCT_CONVERSATION_HANDOFF_POLICY_VALUES: ProductConversationHandoffPolicy[] = [
  'allowed',
  'retry_required',
  'denied',
];
const PRODUCT_ENTERPRISE_READING_STAGE_VALUES: EnterpriseReadingStepId[] = [
  'request-read',
  'review-synthesized-need',
  'request-fit',
  'review-synthesized-asset-pack',
  'buy-asset-pack-settle',
];
export type PipelineTransactionDetailSection =
  | 'shippables'
  | 'transaction'
  | 'wallet-btc'
  | 'authority'
  | 'closure'
  | 'proofs'
  | 'history'
  | 'journal'
  | 'activity'
  | 'console';
const TRANSACTION_DETAIL_SECTION_VALUES: PipelineTransactionDetailSection[] = [
  'shippables',
  'transaction',
  'wallet-btc',
  'authority',
  'closure',
  'proofs',
  'history',
  'journal',
  'activity',
  'console',
];

export type ProductConversationHandoffContext = {
  present: boolean;
  conversationId: string | null;
  workflow: ProductConversationHandoffWorkflow | null;
  policy: ProductConversationHandoffPolicy | null;
  proofRoot: string | null;
  repositoryAnchor: string | null;
  sourceSelectors: string[];
  summary: string | null;
  readingStage: EnterpriseReadingStepId | null;
};

function parseEnumValue<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  if (value && allowed.includes(value as T)) return value as T;
  return fallback;
}

function parseTextValue(value: string | null, fallback: string) {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

export function readProductTransactionId(searchParams: URLSearchParams) {
  return (
    searchParams.get(SEARCH_PARAM_KEYS.transactionId)
    || searchParams.get(SEARCH_PARAM_KEYS.runIdAlias)
    || null
  );
}

export function readProductEnvironmentMode(searchParams: URLSearchParams): ProductEnvironmentMode | null {
  const rawValue = searchParams.get(SEARCH_PARAM_KEYS.environmentMode);
  return PRODUCT_ENVIRONMENT_MODE_VALUES.includes(rawValue as productEnvironmentMode)
    ? (rawValue as productEnvironmentMode)
    : null;
}

export function readProductDebugEnabled(searchParams: URLSearchParams) {
  return searchParams.get(SEARCH_PARAM_KEYS.debug) === '1';
}

export function readPipelineTransactionDetailSection(searchParams: URLSearchParams) {
  const rawValue = searchParams.get(SEARCH_PARAM_KEYS.detailSection);
  if (rawValue === 'identity') return 'transaction';
  return parseEnumValue(rawValue, TRANSACTION_DETAIL_SECTION_VALUES, 'shippables');
}

export function readProductTransactionFilters(searchParams: URLSearchParams): TransactionFilters {
  const fallback = buildProductTransactionFilters();

  return {
    searchTerm: parseTextValue(searchParams.get(SEARCH_PARAM_KEYS.search), fallback.searchTerm),
    status: parseTextValue(searchParams.get(SEARCH_PARAM_KEYS.status), fallback.status),
    ownership: parseEnumValue(
      searchParams.get(SEARCH_PARAM_KEYS.ownership),
      TRANSACTION_OWNERSHIP_VALUES,
      fallback.ownership,
    ),
    transactionLens: parseEnumValue(
      searchParams.get(SEARCH_PARAM_KEYS.lens),
      TRANSACTION_LENS_VALUES,
      fallback.transactionLens,
    ),
    repository: parseTextValue(searchParams.get(SEARCH_PARAM_KEYS.repository), fallback.repository),
    participant: parseTextValue(searchParams.get(SEARCH_PARAM_KEYS.participant), fallback.participant),
    proofStatus: parseTextValue(searchParams.get(SEARCH_PARAM_KEYS.proofStatus), fallback.proofStatus),
    sort: parseEnumValue(searchParams.get(SEARCH_PARAM_KEYS.sort), TRANSACTION_SORT_VALUES, fallback.sort),
  };
}

export function readProductTransactionPagination(searchParams: URLSearchParams): TransactionPagination {
  const parsedPageSize = parsePositiveInteger(
    searchParams.get(SEARCH_PARAM_KEYS.pageSize),
    DEFAULT_TRANSACTION_PAGINATION.pageSize,
  );
  const pageSize = BITCODE_TRANSACTION_PAGE_SIZES.includes(parsedPageSize as (typeof BITCODE_TRANSACTION_PAGE_SIZES)[number])
    ? (parsedPageSize as TransactionPagination['pageSize'])
    : DEFAULT_TRANSACTION_PAGINATION.pageSize;

  return {
    page: parsePositiveInteger(searchParams.get(SEARCH_PARAM_KEYS.page), DEFAULT_TRANSACTION_PAGINATION.page),
    pageSize,
  };
}

export function readProductConversationHandoffContext(searchParams: URLSearchParams): ProductConversationHandoffContext {
  const present = searchParams.get(SEARCH_PARAM_KEYS.conversationHandoff) === '1';
  const workflow = searchParams.get(SEARCH_PARAM_KEYS.handoffWorkflow);
  const policy = searchParams.get(SEARCH_PARAM_KEYS.handoffPolicy);
  const sourceSelectors = searchParams
    .get(SEARCH_PARAM_KEYS.handoffSourceSelectors)
    ?.split('|')
    .map((value) => value.trim())
    .filter(Boolean) ?? [];

  return {
    present,
    conversationId: parseTextValue(searchParams.get(SEARCH_PARAM_KEYS.conversationId), '') || null,
    workflow: workflow && PRODUCT_CONVERSATION_HANDOFF_WORKFLOW_VALUES.includes(workflow as productConversationHandoffWorkflow)
      ? (workflow as productConversationHandoffWorkflow)
      : null,
    policy: policy && PRODUCT_CONVERSATION_HANDOFF_POLICY_VALUES.includes(policy as productConversationHandoffPolicy)
      ? (policy as productConversationHandoffPolicy)
      : null,
    proofRoot: parseTextValue(searchParams.get(SEARCH_PARAM_KEYS.handoffProofRoot), '') || null,
    repositoryAnchor: parseTextValue(searchParams.get(SEARCH_PARAM_KEYS.handoffRepositoryAnchor), '') || null,
    sourceSelectors,
    summary: parseTextValue(searchParams.get(SEARCH_PARAM_KEYS.handoffSummary), '') || null,
    readingStage: searchParams.get(SEARCH_PARAM_KEYS.readingStage)
      ? parseEnumValue(
          searchParams.get(SEARCH_PARAM_KEYS.readingStage),
          PRODUCT_ENTERPRISE_READING_STAGE_VALUES,
          'request-read',
        )
      : null,
  };
}

export function writeTerminalTransactionId(searchParams: URLSearchParams, transactionId: string) {
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.set(SEARCH_PARAM_KEYS.transactionId, transactionId);
  nextParams.delete(SEARCH_PARAM_KEYS.runIdAlias);
  return nextParams;
}

export function clearTerminalTransactionId(searchParams: URLSearchParams) {
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.delete(SEARCH_PARAM_KEYS.transactionId);
  nextParams.delete(SEARCH_PARAM_KEYS.runIdAlias);
  return nextParams;
}

export function writeProductEnvironmentMode(
  searchParams: URLSearchParams,
  environmentMode: ProductEnvironmentMode | null,
) {
  const nextParams = new URLSearchParams(searchParams.toString());
  if (!environmentMode) {
    nextParams.delete(SEARCH_PARAM_KEYS.environmentMode);
    return nextParams;
  }
  nextParams.set(SEARCH_PARAM_KEYS.environmentMode, environmentMode);
  return nextParams;
}

export function writeTerminalDebugEnabled(searchParams: URLSearchParams, enabled: boolean) {
  const nextParams = new URLSearchParams(searchParams.toString());
  if (!enabled) {
    nextParams.delete(SEARCH_PARAM_KEYS.debug);
    return nextParams;
  }
  nextParams.set(SEARCH_PARAM_KEYS.debug, '1');
  return nextParams;
}

export function writePipelineTransactionDetailSection(
  searchParams: URLSearchParams,
  detailSection: PipelineTransactionDetailSection,
) {
  const nextParams = new URLSearchParams(searchParams.toString());
  if (detailSection === 'shippables') {
    nextParams.delete(SEARCH_PARAM_KEYS.detailSection);
  } else {
    nextParams.set(SEARCH_PARAM_KEYS.detailSection, detailSection);
  }
  return nextParams;
}

export function writeProductTransactionFilters(
  searchParams: URLSearchParams,
  filters: TransactionFilters,
) {
  const nextParams = new URLSearchParams(searchParams.toString());
  const defaults = buildProductTransactionFilters();

  const writeValue = (key: string, value: string, defaultValue: string) => {
    if (value === defaultValue) {
      nextParams.delete(key);
      return;
    }
    nextParams.set(key, value);
  };

  writeValue(SEARCH_PARAM_KEYS.search, filters.searchTerm.trim(), defaults.searchTerm);
  writeValue(SEARCH_PARAM_KEYS.status, filters.status, defaults.status);
  writeValue(SEARCH_PARAM_KEYS.ownership, filters.ownership, defaults.ownership);
  writeValue(SEARCH_PARAM_KEYS.lens, filters.transactionLens, defaults.transactionLens);
  writeValue(SEARCH_PARAM_KEYS.repository, filters.repository, defaults.repository);
  writeValue(SEARCH_PARAM_KEYS.participant, filters.participant, defaults.participant);
  writeValue(SEARCH_PARAM_KEYS.proofStatus, filters.proofStatus, defaults.proofStatus);
  writeValue(SEARCH_PARAM_KEYS.sort, filters.sort, defaults.sort);

  return nextParams;
}

export function writeTerminalTransactionPagination(
  searchParams: URLSearchParams,
  pagination: TransactionPagination,
) {
  const nextParams = new URLSearchParams(searchParams.toString());

  if (pagination.page <= DEFAULT_TRANSACTION_PAGINATION.page) {
    nextParams.delete(SEARCH_PARAM_KEYS.page);
  } else {
    nextParams.set(SEARCH_PARAM_KEYS.page, String(pagination.page));
  }

  if (pagination.pageSize === DEFAULT_TRANSACTION_PAGINATION.pageSize) {
    nextParams.delete(SEARCH_PARAM_KEYS.pageSize);
  } else {
    nextParams.set(SEARCH_PARAM_KEYS.pageSize, String(pagination.pageSize));
  }

  return nextParams;
}

export function shouldRecoverTerminalTransactionRoute({
  transactionIds,
  selectedTransactionId,
}: {
  transactionIds: string[];
  selectedTransactionId: string | null;
}) {
  return transactionIds.length > 0 && (!selectedTransactionId || !transactionIds.includes(selectedTransactionId));
}

export function resetWorkspaceTransactionFilters(searchParams: URLSearchParams) {
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.delete(SEARCH_PARAM_KEYS.search);
  nextParams.delete(SEARCH_PARAM_KEYS.status);
  nextParams.delete(SEARCH_PARAM_KEYS.ownership);
  nextParams.delete(SEARCH_PARAM_KEYS.lens);
  nextParams.delete(SEARCH_PARAM_KEYS.repository);
  nextParams.delete(SEARCH_PARAM_KEYS.participant);
  nextParams.delete(SEARCH_PARAM_KEYS.proofStatus);
  nextParams.delete(SEARCH_PARAM_KEYS.sort);
  nextParams.delete(SEARCH_PARAM_KEYS.page);
  return nextParams;
}
