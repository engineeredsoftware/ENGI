/**
 * product-era export names for BTD journal.
 *
 * Prefer `./journal` (or `@bitcode/btd` journal exports).
 * Ledger rows use journal vocabulary, not a product cockpit name.
 */

export type {
  JournalTransactionKind as JournalTransactionKind,
  JournalEntry as JournalEntry,
  JournalProjection as JournalProjection,
  JournalDiff as JournalDiff,
  JournalCoverageReceipt as JournalCoverageReceipt,
} from './journal';

export {
  REQUIRED_JOURNAL_TRANSACTION_KINDS as REQUIRED_JOURNAL_TRANSACTION_KINDS,
  buildJournalEntry as buildJournalEntry,
  buildJournalCoverageReceipt as buildJournalCoverageReceipt,
  diffJournalProjection as diffJournalProjection,
  assertJournalTransactionKind as assertJournalTransactionKind,
} from './journal';
