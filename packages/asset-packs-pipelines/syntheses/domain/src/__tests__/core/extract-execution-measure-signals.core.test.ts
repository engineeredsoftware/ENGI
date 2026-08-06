/**
 * Host verification/provenance/quality signals from execution bags (P2).
 */
import { extractExecutionMeasureSignals } from '../../agents/validation/agent-measure-absolutes';

describe('extractExecutionMeasureSignals', () => {
  it('returns empty for missing execution', () => {
    expect(extractExecutionMeasureSignals(null)).toEqual({});
    expect(extractExecutionMeasureSignals(undefined)).toEqual({});
  });

  it('collects finite numbers from measureSignals / verificationSignals', () => {
    const out = extractExecutionMeasureSignals({
      context: {
        measureSignals: { 'test-coverage': 0.82, buildability: 1 },
        verificationSignals: { 'test-pass-rate': 0.9 },
        provenanceSignals: { originality: 'bad' },
      },
    });
    expect(out['test-coverage']).toBe(0.82);
    expect(out.buildability).toBe(1);
    expect(out['test-pass-rate']).toBe(0.9);
    expect(out.originality).toBeUndefined();
  });
});
