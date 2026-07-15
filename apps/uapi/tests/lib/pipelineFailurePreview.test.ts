import {
  buildPipelineFailurePreviewFromEvents,
  isTerminalFailureStatus,
} from '@/components/bitcode/pipeline/PipelineFailurePreview/pipeline-failure-preview';

describe('buildPipelineFailurePreviewFromEvents', () => {
  it('keeps the last distinct phase/agent/step/failsafe/generation chains', () => {
    const events = [
      {
        created_at: '2026-07-09T01:00:00.000Z',
        event: {
          type: 'generation',
          executionState: {
            phase: 'setup',
            agent: 'DepositInputComprehensionAgent',
            step: 'plan',
            failsafe: 'prepare_concise_context',
            generation: 'reason',
          },
        },
      },
      {
        created_at: '2026-07-09T01:01:00.000Z',
        event: {
          type: 'status',
          executionState: {
            phase: 'discovery',
            agent: 'DepositCodebaseComprehensionAgent',
            step: 'try',
            failsafe: 'chunk_then_sum',
            generation: 'judge',
          },
        },
      },
      {
        created_at: '2026-07-09T01:02:00.000Z',
        event: {
          type: 'status',
          // Duplicate consecutive chain — collapsed.
          executionState: {
            phase: 'discovery',
            agent: 'DepositCodebaseComprehensionAgent',
            step: 'try',
            failsafe: 'chunk_then_sum',
            generation: 'judge',
          },
        },
      },
      {
        created_at: '2026-07-09T01:03:00.000Z',
        event: {
          type: 'error',
          message: 'Run orphaned: host killed',
        },
      },
    ];

    const preview = buildPipelineFailurePreviewFromEvents(events, {
      errorMessage: 'Run orphaned: host killed',
      limit: 5,
    });

    expect(preview.errorMessage).toBe('Run orphaned: host killed');
    expect(preview.lines).toHaveLength(2);
    expect(preview.lines[0]).toMatchObject({
      phase: 'setup',
      agent: 'DepositInputComprehensionAgent',
      generation: 'reason',
    });
    expect(preview.lines[1]).toMatchObject({
      phase: 'discovery',
      agent: 'DepositCodebaseComprehensionAgent',
      failsafe: 'chunk_then_sum',
      generation: 'judge',
    });
  });

  it('recognizes terminal failure statuses for hover', () => {
    expect(isTerminalFailureStatus('failed')).toBe(true);
    expect(isTerminalFailureStatus('CANCELLED')).toBe(true);
    expect(isTerminalFailureStatus('interrupted')).toBe(true);
    expect(isTerminalFailureStatus('completed')).toBe(false);
    expect(isTerminalFailureStatus('running')).toBe(false);
  });
});
