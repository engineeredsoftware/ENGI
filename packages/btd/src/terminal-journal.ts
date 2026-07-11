/**
 * @deprecated Compatibility shim for Terminal-era journal names.
 * Import from `./journal` (or `@bitcode/btd` journal exports) instead.
 *
 * V48 naming law: BTD ledger rows are journal vocabulary, not Terminal product
 * surface names. Callers should migrate to Journal* symbols.
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
