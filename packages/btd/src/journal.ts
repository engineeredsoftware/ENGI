import { assertNonEmptyString } from './constants';

export type JournalTransactionKind =
  | 'read_submission'
  | 'fit_closure'
  | 'proof_admission'
  | 'asset_pack_mint'
  | 'measure_mint_tail'
  | 'btc_fee_payment'
  | 'asset_pack_anchor'
  | 'licensed_read_purchase'
  | 'exchange_order'
  | 'exchange_order_cancel'
  | 'rights_transfer'
  | 'dispute_holdback'
  | 'settlement_finalization'
  | 'ledger_database_reconciliation';

export const REQUIRED_JOURNAL_TRANSACTION_KINDS = [
  'read_submission',
  'fit_closure',
  'proof_admission',
  'asset_pack_mint',
  'btc_fee_payment',
  'asset_pack_anchor',
  'licensed_read_purchase',
  'exchange_order',
  'exchange_order_cancel',
  'rights_transfer',
  'dispute_holdback',
  'settlement_finalization',
  'ledger_database_reconciliation',
] as const satisfies readonly JournalTransactionKind[];

export interface JournalEntry {
  journalEntryId: string;
  transactionKind: JournalTransactionKind;
  actorId: string;
  preStateRoot: string;
  postStateRoot: string;
  receiptRoots: string[];
  ledgerAnchorIds: string[];
  exchangeSequence: bigint;
  issuedAt: string;
}

export interface JournalProjection {
  journalEntryId: string;
  postStateRoot: string;
  receiptRoots: string[];
  ledgerAnchorIds: string[];
}

export interface JournalDiff {
  blocking: boolean;
  mismatches: string[];
}

export interface JournalCoverageReceipt {
  kind: 'btd.journal_coverage';
  coverageId: string;
  requiredTransactionKinds: JournalTransactionKind[];
  observedTransactionKinds: JournalTransactionKind[];
  missingTransactionKinds: JournalTransactionKind[];
  blocking: boolean;
  issuedAt: string;
}

export function buildJournalEntry(input: {
  journalEntryId: string;
  transactionKind: JournalTransactionKind;
  actorId: string;
  preStateRoot: string;
  postStateRoot: string;
  receiptRoots: string[];
  ledgerAnchorIds?: string[];
  exchangeSequence: bigint;
  issuedAt?: string;
}): JournalEntry {
  if (!input.receiptRoots.length) {
    throw new Error('Journal entry requires at least one receipt root.');
  }
  assertJournalTransactionKind(input.transactionKind);
  if (input.exchangeSequence <= 0n) {
    throw new Error('Journal entry requires a positive Exchange sequence.');
  }

  return {
    journalEntryId: assertNonEmptyString(input.journalEntryId, 'journalEntryId'),
    transactionKind: input.transactionKind,
    actorId: assertNonEmptyString(input.actorId, 'actorId'),
    preStateRoot: assertNonEmptyString(input.preStateRoot, 'preStateRoot'),
    postStateRoot: assertNonEmptyString(input.postStateRoot, 'postStateRoot'),
    receiptRoots: input.receiptRoots.map((root) => assertNonEmptyString(root, 'receiptRoot')),
    ledgerAnchorIds: (input.ledgerAnchorIds ?? []).map((id) =>
      assertNonEmptyString(id, 'ledgerAnchorId'),
    ),
    exchangeSequence: input.exchangeSequence,
    issuedAt: input.issuedAt ?? new Date().toISOString(),
  };
}

export function buildJournalCoverageReceipt(input: {
  coverageId: string;
  entries: JournalEntry[];
  requiredTransactionKinds?: readonly JournalTransactionKind[];
  issuedAt?: string;
}): JournalCoverageReceipt {
  const requiredTransactionKinds = [
    ...(input.requiredTransactionKinds ?? REQUIRED_JOURNAL_TRANSACTION_KINDS),
  ];
  const observedTransactionKinds = Array.from(
    new Set(input.entries.map((entry) => entry.transactionKind)),
  ).sort();
  const observed = new Set(observedTransactionKinds);
  const missingTransactionKinds = requiredTransactionKinds.filter((kind) => !observed.has(kind));

  return {
    kind: 'btd.journal_coverage',
    coverageId: assertNonEmptyString(input.coverageId, 'coverageId'),
    requiredTransactionKinds,
    observedTransactionKinds,
    missingTransactionKinds,
    blocking: missingTransactionKinds.length > 0,
    issuedAt: input.issuedAt ?? new Date().toISOString(),
  };
}

export function diffJournalProjection(
  entry: JournalEntry,
  projection: JournalProjection,
): JournalDiff {
  const mismatches: string[] = [];

  if (entry.journalEntryId !== projection.journalEntryId) {
    mismatches.push('journal_entry_id');
  }

  if (entry.postStateRoot !== projection.postStateRoot) {
    mismatches.push('post_state_root');
  }

  if (!sameSet(entry.receiptRoots, projection.receiptRoots)) {
    mismatches.push('receipt_roots');
  }

  if (!sameSet(entry.ledgerAnchorIds, projection.ledgerAnchorIds)) {
    mismatches.push('ledger_anchor_ids');
  }

  return {
    blocking: mismatches.length > 0,
    mismatches,
  };
}

export function assertJournalTransactionKind(kind: JournalTransactionKind): JournalTransactionKind {
  if (
    ![
      ...REQUIRED_JOURNAL_TRANSACTION_KINDS,
      'measure_mint_tail',
    ].includes(kind)
  ) {
    throw new Error(`Unsupported journal transaction kind: ${kind}.`);
  }

  return kind;
}

function sameSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const leftSet = new Set(left);
  return right.every((value) => leftSet.has(value));
}
