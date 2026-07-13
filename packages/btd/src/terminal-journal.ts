/**
 * Terminal-era export names for BTD journal.
 *
 * Prefer `./journal` (or `@bitcode/btd` journal exports).
 * Ledger rows use journal vocabulary, not a product cockpit name.
 */

export type {
  JournalTransactionKind as TerminalTransactionKind,
  JournalEntry as TerminalJournalEntry,
  JournalProjection as TerminalJournalProjection,
  JournalDiff as TerminalJournalDiff,
  JournalCoverageReceipt as TerminalJournalCoverageReceipt,
} from './journal';

export {
  REQUIRED_JOURNAL_TRANSACTION_KINDS as REQUIRED_TERMINAL_TRANSACTION_KINDS,
  buildJournalEntry as buildTerminalJournalEntry,
  buildJournalCoverageReceipt as buildTerminalJournalCoverageReceipt,
  diffJournalProjection as diffTerminalJournalProjection,
  assertJournalTransactionKind as assertTerminalTransactionKind,
} from './journal';
