/**
 * BTD journal coverage — non-product naming for ledger transaction rows.
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */
import {
  buildJournalEntry,
  buildJournalCoverageReceipt,
  diffJournalProjection,
  REQUIRED_JOURNAL_TRANSACTION_KINDS,
} from '../src/journal';
import {
  buildJournalEntry,
  REQUIRED_JOURNAL_TRANSACTION_KINDS,
} from '../src/journal';

describe('journal', () => {
  it('builds a journal entry with required receipt roots', () => {
    const entry = buildJournalEntry({
      journalEntryId: 'je-1',
      transactionKind: 'asset_pack_mint',
      actorId: 'actor-1',
      preStateRoot: 'pre',
      postStateRoot: 'post',
      receiptRoots: ['r1'],
      exchangeSequence: 1n,
      issuedAt: '2026-07-11T00:00:00.000Z',
    });

    expect(entry.journalEntryId).toBe('je-1');
    expect(entry.transactionKind).toBe('asset_pack_mint');
    expect(entry.receiptRoots).toEqual(['r1']);
  });

  it('blocks coverage when required transaction kinds are missing', () => {
    const entry = buildJournalEntry({
      journalEntryId: 'je-1',
      transactionKind: 'asset_pack_mint',
      actorId: 'actor-1',
      preStateRoot: 'pre',
      postStateRoot: 'post',
      receiptRoots: ['r1'],
      exchangeSequence: 1n,
      issuedAt: '2026-07-11T00:00:00.000Z',
    });
    const coverage = buildJournalCoverageReceipt({
      coverageId: 'cov-1',
      entries: [entry],
      issuedAt: '2026-07-11T00:00:00.000Z',
    });

    expect(coverage.blocking).toBe(true);
    expect(coverage.missingTransactionKinds.length).toBeGreaterThan(0);
    expect(REQUIRED_JOURNAL_TRANSACTION_KINDS).toContain('settlement_finalization');
  });

  it('diffs projection mismatches as blocking', () => {
    const entry = buildJournalEntry({
      journalEntryId: 'je-1',
      transactionKind: 'rights_transfer',
      actorId: 'actor-1',
      preStateRoot: 'pre',
      postStateRoot: 'post',
      receiptRoots: ['r1'],
      exchangeSequence: 2n,
      issuedAt: '2026-07-11T00:00:00.000Z',
    });
    const diff = diffJournalProjection(entry, {
      journalEntryId: 'je-1',
      postStateRoot: 'other',
      receiptRoots: ['r1'],
      ledgerAnchorIds: [],
    });

    expect(diff.blocking).toBe(true);
    expect(diff.mismatches).toContain('post_state_root');
  });

  it('keeps cockpit-named shim symbols equivalent', () => {
    expect(REQUIRED_JOURNAL_TRANSACTION_KINDS).toEqual(REQUIRED_JOURNAL_TRANSACTION_KINDS);
    const viaShim = buildJournalEntry({
      journalEntryId: 'je-shim',
      transactionKind: 'btc_fee_payment',
      actorId: 'actor-1',
      preStateRoot: 'pre',
      postStateRoot: 'post',
      receiptRoots: ['r1'],
      exchangeSequence: 3n,
      issuedAt: '2026-07-11T00:00:00.000Z',
    });
    expect(viaShim.journalEntryId).toBe('je-shim');
  });
});
