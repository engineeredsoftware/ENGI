/**
 * Pipeline run data model (relocated from product).
 */
import {
  isMockWorkspaceRunId,
  MOCK_RUNS,
} from '@/components/bitcode/pipeline/models/pipeline-run-data';

describe('pipeline-run-data', () => {
  it('exposes mock runs with deposit/read/closure lenses', () => {
    expect(MOCK_RUNS.length).toBeGreaterThanOrEqual(3);
    expect(MOCK_RUNS.map((r) => r.transactionLens).sort()).toEqual([
      'closure',
      'deposit',
      'read',
    ].sort());
  });

  it('identifies mock workspace run ids', () => {
    expect(isMockWorkspaceRunId(MOCK_RUNS[0].id)).toBe(true);
    expect(isMockWorkspaceRunId('live-run-xyz')).toBe(false);
  });
});
