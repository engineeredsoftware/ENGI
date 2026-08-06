import {
  buildAgenticExecutionSummary,
  deriveAgenticExecutionProofStatus,
  deriveDisplayExecutionStatus,
  readAgenticExecutionProofHints,
} from '../agentic-execution';

describe('deriveAgenticExecutionProofStatus', () => {
  it('returns AssetPack bundle ready only for clean completed asset-pack runs', () => {
    expect(deriveAgenticExecutionProofStatus('agentic-execution:asset-pack', 'completed')).toBe(
      'AssetPack bundle ready',
    );
  });

  it('does not claim bundle ready for host budget recovery (run 8ecbd11a)', () => {
    expect(
      deriveAgenticExecutionProofStatus('agentic-execution:asset-pack', 'completed', {
        hostBudgetExceeded: true,
        partial: true,
        hostRecoveredFromTimeout: true,
      }),
    ).toBe('AssetPack options recovered (host budget)');

    expect(
      deriveAgenticExecutionProofStatus('agentic-execution:asset-pack', 'partial', {
        hostBudgetExceeded: true,
      }),
    ).toBe('AssetPack options recovered (host budget)');
  });

  it('keeps failed closed for hard failures', () => {
    expect(deriveAgenticExecutionProofStatus('agentic-execution:asset-pack', 'failed')).toBe(
      'agentic execution failed closed',
    );
  });
});

describe('readAgenticExecutionProofHints + buildAgenticExecutionSummary', () => {
  it('reads hostBudgetExceeded from context and output', () => {
    expect(
      readAgenticExecutionProofHints(
        { hostBudgetExceeded: true, partial: true },
        { summary: 'Recovered 3…' },
      ),
    ).toMatchObject({
      hostBudgetExceeded: true,
      partial: true,
      hostRecoveredFromTimeout: true,
    });
  });

  it('builds honest proof for partial budget recovery summary', () => {
    const summary = buildAgenticExecutionSummary({
      type: 'agentic-execution:asset-pack',
      status: 'partial',
      context: {
        hostBudgetExceeded: true,
        partial: true,
        hostRecoveredFromTimeout: true,
      },
      output: {
        partial: true,
        hostBudgetExceeded: true,
        summary: 'Recovered 3 measured AssetPack options after host budget',
      },
    });
    expect(summary.proofStatus).toBe('AssetPack options recovered (host budget)');
    expect(summary.lens).toBe('deposit');
  });

  it('demotes stored completed to partial when validationNotReady', () => {
    expect(
      deriveDisplayExecutionStatus(
        'completed',
        { partial: true, validationNotReady: true },
        {
          summary:
            'Recovered 3 measured AssetPack options with Validation ReadyToFinish not ready.',
        },
      ),
    ).toBe('partial');
    expect(
      buildAgenticExecutionSummary({
        type: 'agentic-execution:asset-pack',
        status: 'completed',
        context: { partial: true, validationNotReady: true },
        output: {
          partial: true,
          validationNotReady: true,
          summary: 'Recovered 3 measured AssetPack options with Validation ReadyToFinish not ready.',
        },
      }).proofStatus,
    ).toBe('AssetPack options (Validation not ready)');
  });
});
