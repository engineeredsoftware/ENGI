/**
 * @jest-environment node
 */
import { bridgeHostTelemetryArtifactToExecutionStream } from '@/lib/deposit-host-telemetry-bridge';

const emitEvent = jest.fn();

jest.mock('@bitcode/execution-generics', () => ({
  ExecutionStreamAdapter: {
    emitEvent: (...args: unknown[]) => emitEvent(...args),
  },
}));

describe('bridgeHostTelemetryArtifactToExecutionStream', () => {
  beforeEach(() => {
    emitEvent.mockClear();
  });

  it('re-emits formal generation rows from host telemetry summaries', () => {
    const ok = bridgeHostTelemetryArtifactToExecutionStream('exec-1', {
      type: 'pipeline-stream-event',
      streamEventType: 'generation',
      namespace: 'llm',
      key: 'output',
      message: '[content withheld — source-safe]',
      executionState: {
        phase: 'setup',
        agent: 'DepositInputComprehensionAgent',
        step: 'try',
        failsafe: 'prepare_concise_context',
        generation: 'reason',
      },
    });
    expect(ok).toBe(true);
    expect(emitEvent).toHaveBeenCalledWith(
      'exec-1',
      'generation',
      expect.objectContaining({
        namespace: 'llm',
        key: 'output',
        executionState: expect.objectContaining({
          phase: 'setup',
          agent: 'DepositInputComprehensionAgent',
        }),
      }),
    );
  });

  it('re-emits formal tool-use rows', () => {
    const ok = bridgeHostTelemetryArtifactToExecutionStream('exec-1', {
      type: 'pipeline-stream-event',
      streamEventType: 'status',
      namespace: 'tool',
      key: 'result',
      tool: 'asset-pack-clone-vcs-repository-tool',
      toolOk: true,
      executionState: { phase: 'setup', agent: 'clone', step: 'try' },
    });
    expect(ok).toBe(true);
    expect(emitEvent).toHaveBeenCalledWith(
      'exec-1',
      'tool-use',
      expect.objectContaining({
        namespace: 'tool',
        key: 'result',
        data: expect.objectContaining({ tool: 'asset-pack-clone-vcs-repository-tool' }),
      }),
    );
  });

  it('drops low-value telemetry-readback fragments without hierarchy', () => {
    const ok = bridgeHostTelemetryArtifactToExecutionStream('exec-1', {
      type: 'pipeline-stream-event',
      streamEventType: 'status',
      stage: 'telemetry-readback',
      message: 'xai',
    });
    expect(ok).toBe(false);
    expect(emitEvent).not.toHaveBeenCalled();
  });

  it('emits hierarchy context from executionState when present', () => {
    const ok = bridgeHostTelemetryArtifactToExecutionStream('exec-1', {
      type: 'pipeline-stream-event',
      streamEventType: 'status',
      stage: 'setup',
      executionState: {
        phase: 'discovery',
        agent: 'DepositCodebaseComprehensionAgent',
        step: 'refine',
      },
    });
    expect(ok).toBe(true);
    expect(emitEvent).toHaveBeenCalledWith(
      'exec-1',
      'status',
      expect.objectContaining({
        executionState: expect.objectContaining({
          phase: 'discovery',
          agent: 'DepositCodebaseComprehensionAgent',
        }),
      }),
    );
  });
});
