// @ts-nocheck
// @ts-nocheck
import { PipelineExecution } from '../PipelineExecution';
import { PipelineExecutor } from '../PipelineExecutor';
import { createAgentExecutor } from '../agent-executor';
import { ExecutionStreamAdapter } from '@bitcode/execution-generics';
import { Streamer } from '@bitcode/api/streams';

describe('PipelineExecutor event emission (unit)', () => {
  it('emits phase and agent events in expected order', async () => {
    const exec = new PipelineExecution('pipeline:unit');
    const events: any[] = [];
    const streamer = new Streamer({ streamId: 'pipeline:unit', userId: 'unit-user' });
    streamer.subscribe((event) => {
      events.push(event);
    });
    ExecutionStreamAdapter.registerStreamer(exec.id, streamer);

    // Register two trivial agents
    const agentA = async (input: any) => ({ ok: 'A' });
    const agentB = async (input: any) => ({ ok: 'B' });
    // Access registry through any since types import aliases are not available in test env
    (exec as any).agents.registerAgent('unit:agentA', agentA as any);
    (exec as any).agents.registerAgent('unit:agentB', agentB as any);

    const executor = new PipelineExecutor(exec);
    const res = await executor.executePhase({
      phaseName: 'setup',
      sequence: [
        { agent: 'unit:agentA' },
        { agent: 'unit:agentB' }
      ],
      allowShortCircuit: true,
    });

    expect(res.success).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 20));
    ExecutionStreamAdapter.unregisterStreamer(exec.id);
    const types = events
      .filter((event) => ['phase-start', 'phase-complete', 'agent-start', 'agent-complete'].includes(event.type))
      .map((event) => [
        event.type,
        event.executionState?.phase || event.data?.phase || event.phase || '',
        event.executionState?.agent || event.data?.agent || event.agent || '',
        event.data?.status || event.status || '',
      ].join(':'));
    // Order: phase:start -> agentA:start -> agentA:end -> agentB:start -> agentB:end -> phase:end
    expect(types).toEqual([
      'phase-start:setup::',
      'agent-start:setup:unit:agentA:running',
      'agent-complete:setup:unit:agentA:completed',
      'agent-start:setup:unit:agentB:running',
      'agent-complete:setup:unit:agentB:completed',
      'phase-complete:setup::',
    ]);
  });

  it('passes phase input to agents unless a step overrides it', async () => {
    const exec = new PipelineExecution('pipeline:input-forwarding');
    const received: any[] = [];

    (exec as any).agents.registerAgent('unit:default-input', (async (input: any) => {
      received.push(input);
      return { ok: true };
    }) as any);
    (exec as any).agents.registerAgent('unit:override-input', (async (input: any) => {
      received.push(input);
      return { ok: true };
    }) as any);

    const phaseInput = {
      repository: { fullName: 'octocat/Spoon-Knife', branch: 'main' },
      read: 'fit current deposited source revision',
    };

    const executor = new PipelineExecutor(exec);
    await executor.executePhase({
      phaseName: 'setup',
      sequence: [
        { agent: 'unit:default-input' },
        { agent: 'unit:override-input', input: { explicit: true } },
      ],
    }, phaseInput);

    expect(received).toEqual([
      phaseInput,
      { explicit: true },
    ]);
  });

  it('resolves lazy registered agents before executing through generic executors', async () => {
    const exec = new PipelineExecution('pipeline:lazy-agent');
    const phaseInput = { read: 'fit deposited source revision' };

    (exec as any).agents.registerAgent('unit:lazy-executor', (() =>
      Promise.resolve(async (input: any, execution: any) => {
        execution.store('lazy-agent', 'executor-input', input);
        return { ok: true, read: input.read };
      })) as any);
    (exec as any).agents.registerAgent('unit:lazy-phase', (() =>
      Promise.resolve(async (input: any, execution: any) => {
        execution.store('lazy-agent', 'phase-input', input);
        return { ok: true, read: input.read };
      })) as any);

    const executorOutput = await createAgentExecutor('unit:lazy-executor')(phaseInput, exec);
    const phaseOutput = await new PipelineExecutor(exec).executeAgent('unit:lazy-phase', phaseInput);

    expect(executorOutput).toEqual({ ok: true, read: phaseInput.read });
    expect(phaseOutput).toEqual({ ok: true, read: phaseInput.read });
    expect(exec.get('lazy-agent', 'executor-input')).toBe(phaseInput);
    expect(exec.get('lazy-agent', 'phase-input')).toBe(phaseInput);
  });
});
