/**
 * Pipeline selection query helpers (relocated from Terminal).
 */
import {
  clearTerminalTransactionId,
  readTerminalTransactionId,
  writeTerminalTransactionId,
} from '@/components/bitcode/pipeline/models/pipeline-selection-query';

describe('pipeline-selection-query', () => {
  it('reads and writes transactionId selection in URL params', () => {
    const params = new URLSearchParams();
    const withId = writeTerminalTransactionId(params, 'run-abc');
    expect(readTerminalTransactionId(withId)).toBe('run-abc');
    const cleared = clearTerminalTransactionId(withId);
    expect(readTerminalTransactionId(cleared)).toBeNull();
  });
});
