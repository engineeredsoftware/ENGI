// @ts-nocheck
/**
 * ExecutionStreamAdapter contract (V48 Gate 3 — tools/executions domain).
 *
 * Pins the store→stream bridge every pipeline event consumer depends on:
 * - onStore is a strict no-op without a registered streamer (and emitEvent too)
 * - inferEventType classification table (phase/agent/tools/llm/work-update/
 *   error/completion/default)
 * - node identity passthrough (executionNodeId/RootId/Path)
 * - extractExecutionState pulls phase/agent/step/failsafe/generation off the
 *   stored value
 * - sanitizeData drops known-large fields and truncates top-level long strings
 */
import { ExecutionStreamAdapter, ExecutionStreamEventType } from '../storage/ExecutionStreamAdapter';
import { ExecutionStorageDestination } from '../storage/StorageDestination';

const DEST = [ExecutionStorageDestination.EPHEMERAL];

function makeFakeStreamer() {
  const emitted: any[] = [];
  return {
    emitted,
    emit: async (event: any) => {
      emitted.push(event);
    },
  };
}

describe('ExecutionStreamAdapter — streamer registration boundary', () => {
  it('onStore is a no-op when no streamer is registered for the execution id', async () => {
    await expect(
      ExecutionStreamAdapter.onStore('exec:unregistered', 'phase', 'start', { phase: 'setup' }, DEST),
    ).resolves.toBeUndefined();
  });

  it('emitEvent is a no-op without a registered streamer', async () => {
    await expect(
      ExecutionStreamAdapter.emitEvent('exec:unregistered', ExecutionStreamEventType.STATUS, { message: 'hi' }),
    ).resolves.toBeUndefined();
  });

  it('unregisterStreamer stops further emission', async () => {
    const streamer = makeFakeStreamer();
    ExecutionStreamAdapter.registerStreamer('exec:unreg-test', streamer);
    await ExecutionStreamAdapter.onStore('exec:unreg-test', 'phase', 'start', {}, DEST);
    expect(streamer.emitted).toHaveLength(1);

    ExecutionStreamAdapter.unregisterStreamer('exec:unreg-test');
    await ExecutionStreamAdapter.onStore('exec:unreg-test', 'phase', 'complete', {}, DEST);
    expect(streamer.emitted).toHaveLength(1);
  });
});

describe('ExecutionStreamAdapter — event type inference', () => {
  const execId = 'exec:infer';
  let streamer: ReturnType<typeof makeFakeStreamer>;

  beforeEach(() => {
    streamer = makeFakeStreamer();
    ExecutionStreamAdapter.registerStreamer(execId, streamer);
  });

  afterEach(() => {
    ExecutionStreamAdapter.unregisterStreamer(execId);
  });

  async function inferredType(namespace: string, key: string, value: any = {}): Promise<string> {
    streamer.emitted.length = 0;
    await ExecutionStreamAdapter.onStore(execId, namespace, key, value, DEST);
    expect(streamer.emitted).toHaveLength(1);
    return streamer.emitted[0].type;
  }

  it('classifies phase transitions', async () => {
    expect(await inferredType('phase', 'start')).toBe('phase-start');
    expect(await inferredType('phase', 'complete')).toBe('phase-complete');
  });

  it('classifies agent activity for agent:* namespaces', async () => {
    expect(await inferredType('agent:depository-search', 'start')).toBe('agent-start');
    expect(await inferredType('agent:depository-search', 'complete')).toBe('agent-complete');
  });

  it('classifies tools stores: result is the primary tool-use event, invocation is status', async () => {
    expect(await inferredType('tools', 'result', { tool: 'search', ok: true })).toBe('tool-use');
    expect(await inferredType('tools', 'invocation', { tool: 'search' })).toBe('status');
  });

  it('classifies llm stores: output is the generation event, other keys are status', async () => {
    expect(await inferredType('llm', 'output')).toBe('generation');
    expect(await inferredType('llm', 'response')).toBe('status');
    expect(await inferredType('llm', 'usage')).toBe('status');
  });

  it('classifies work-update stores and mirrors data onto update/scope', async () => {
    streamer.emitted.length = 0;
    await ExecutionStreamAdapter.onStore(execId, 'work-update', 'deposit', { note: 'progress' }, DEST);
    const event = streamer.emitted[0];
    expect(event.type).toBe('work-update');
    expect(event.update).toEqual(event.data);
    expect(event.scope).toBe('deposit');
  });

  it('classifies errors, completion, and defaults to status', async () => {
    expect(await inferredType('error', 'anything')).toBe('error');
    expect(await inferredType('misc', 'error')).toBe('error');
    expect(await inferredType('final', 'result')).toBe('completion');
    expect(await inferredType('misc', 'completion')).toBe('completion');
    expect(await inferredType('misc', 'anything')).toBe('status');
  });

  it("classifies the stitch failsafe's validation error as in-band 'repair', not terminal 'error'", async () => {
    // The stitch loop stores the schema error it is ABOUT TO REPAIR
    // (store('validation','error', …)); typing it 'error' made stream
    // consumers mark an actively-repairing run as failed.
    expect(await inferredType('validation', 'error', 'options: Required')).toBe('repair');
    // Other validation stores stay status.
    expect(await inferredType('validation', 'result', { passed: true })).toBe('status');
  });
});

describe('ExecutionStreamAdapter — event payload shape', () => {
  const execId = 'exec:payload';
  let streamer: ReturnType<typeof makeFakeStreamer>;

  beforeEach(() => {
    streamer = makeFakeStreamer();
    ExecutionStreamAdapter.registerStreamer(execId, streamer);
  });

  afterEach(() => {
    ExecutionStreamAdapter.unregisterStreamer(execId);
  });

  it('passes node identity through (executionNodeId/RootId/Path) and defaults to executionId', async () => {
    await ExecutionStreamAdapter.onStore(execId, 'misc', 'note', { message: 'with node info' }, DEST, {
      nodeId: 'run/phase:setup/agent:clone',
      rootId: 'run',
      path: ['run', 'phase:setup', 'agent:clone'],
    });
    expect(streamer.emitted[0]).toMatchObject({
      executionId: execId,
      executionNodeId: 'run/phase:setup/agent:clone',
      executionRootId: 'run',
      executionPath: ['run', 'phase:setup', 'agent:clone'],
      namespace: 'misc',
      key: 'note',
    });

    await ExecutionStreamAdapter.onStore(execId, 'misc', 'note', { message: 'no node info' }, DEST);
    expect(streamer.emitted[1]).toMatchObject({
      executionNodeId: execId,
      executionRootId: execId,
      executionPath: [],
    });
  });

  it('extracts PTRR executionState fields from the stored value (empty when absent)', async () => {
    await ExecutionStreamAdapter.onStore(
      execId,
      'llm',
      'status',
      {
        phase: 'discovery',
        agent: 'depository-search',
        step: 'try',
        failsafe: 'prepare_concise_context',
        generation: 'reason',
      },
      DEST,
    );
    expect(streamer.emitted[0].executionState).toEqual({
      phase: 'discovery',
      agent: 'depository-search',
      step: 'try',
      failsafe: 'prepare_concise_context',
      generation: 'reason',
    });

    await ExecutionStreamAdapter.onStore(execId, 'misc', 'note', { unrelated: true }, DEST);
    expect(streamer.emitted[1].executionState).toEqual({
      phase: undefined,
      agent: undefined,
      step: undefined,
      failsafe: undefined,
      generation: undefined,
    });
  });

  it('sanitizes data: drops known-large fields and truncates top-level long strings', async () => {
    const longNote = 'y'.repeat(1500);
    await ExecutionStreamAdapter.onStore(
      execId,
      'misc',
      'note',
      {
        fullContent: 'x'.repeat(50),
        rawData: { huge: true },
        tokens: [1, 2, 3],
        embeddings: [0.1, 0.2],
        note: longNote,
        keep: 'small',
      },
      DEST,
    );
    const data = streamer.emitted[0].data;
    expect(data.fullContent).toBeUndefined();
    expect(data.rawData).toBeUndefined();
    expect(data.tokens).toBeUndefined();
    expect(data.embeddings).toBeUndefined();
    expect(data.keep).toBe('small');
    expect(data.note).toHaveLength(1003);
    expect(data.note.endsWith('...')).toBe(true);
    expect(data.note.startsWith('yyy')).toBe(true);
  });

  it('extracts a human-readable message from common fields', async () => {
    await ExecutionStreamAdapter.onStore(execId, 'misc', 'note', { message: 'hello there' }, DEST);
    expect(streamer.emitted[0].message).toBe('hello there');

    await ExecutionStreamAdapter.onStore(execId, 'misc', 'note', 'plain string value', DEST);
    expect(streamer.emitted[1].message).toBe('plain string value');
  });

  it('emitEvent enriches the payload with type/executionId/timestamp', async () => {
    await ExecutionStreamAdapter.emitEvent(execId, ExecutionStreamEventType.STATUS, {
      message: 'Pipeline execution started',
      runId: 'run-1',
    });
    expect(streamer.emitted[0]).toMatchObject({
      type: 'status',
      executionId: execId,
      message: 'Pipeline execution started',
      runId: 'run-1',
    });
    expect(typeof streamer.emitted[0].timestamp).toBe('string');
  });
});
