import {
  buildBitcodeTransactionActiveFilterChips,
  clearBitcodeTransactionFilter,
} from '@/components/bitcode/pipeline/bitcode-transaction-active-filters';
import { DEFAULT_TRANSACTION_FILTERS } from '@/components/bitcode/pipeline/bitcode-transaction-types';

describe('bitcode transaction active filters', () => {
  it('builds readable active filter chips from non-default transaction filters', () => {
    expect(
      buildBitcodeTransactionActiveFilterChips({
        ...DEFAULT_TRANSACTION_FILTERS,
        searchTerm: 'proof bundle',
        ownership: 'mine',
        transactionLens: 'closure',
        repository: 'bitcode/bitcode',
        sort: 'highest-btc-fee-basis',
      }),
    ).toEqual([
      { key: 'searchTerm', label: 'Search', value: 'proof bundle' },
      { key: 'ownership', label: 'Ownership', value: 'My transactions' },
      { key: 'transactionLens', label: 'Lens', value: 'Closure' },
      { key: 'repository', label: 'Repository', value: 'bitcode/bitcode' },
      { key: 'sort', label: 'Sort', value: 'Highest BTC Fee Basis' },
    ]);
  });

  it('clears an individual transaction filter back to its shared default', () => {
    expect(
      clearBitcodeTransactionFilter(
        {
          ...DEFAULT_TRANSACTION_FILTERS,
          participant: 'garrett',
          proofStatus: 'bounded proof bundle ready',
        },
        'participant',
      ),
    ).toEqual({
      ...DEFAULT_TRANSACTION_FILTERS,
      proofStatus: 'bounded proof bundle ready',
    });
  });
});
