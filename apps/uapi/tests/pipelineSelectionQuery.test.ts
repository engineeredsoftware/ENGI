/**
 * Pipeline selection query helpers (relocated from product).
 */
import {
  clearPipelineTransactionId,
  readProductTransactionId,
  writePipelineTransactionId,
} from '@/components/bitcode/pipeline/models/pipeline-selection-query';

describe('pipeline-selection-query', () => {
  it('reads and writes transactionId selection in URL params', () => {
    const params = new URLSearchParams();
    const withId = writePipelineTransactionId(params, 'run-abc');
    expect(readProductTransactionId(withId)).toBe('run-abc');
    const cleared = clearPipelineTransactionId(withId);
    expect(readProductTransactionId(cleared)).toBeNull();
  });
});
