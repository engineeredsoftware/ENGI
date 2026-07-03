// @ts-nocheck
import { Execution } from '@bitcode/execution-generics';
import { createStreamingExecution, enablePipelineStreaming, sourceSafeStreamEvent } from '../../streaming/pipeline-stream-integration';

// Mock ORM model so we can assert persistence without a real DB
const createdEvents: any[] = [];
let failNextCreateWithFkViolation = false;
jest.mock('@bitcode/orm', () => ({
  ExecutionEventsModel: class {
    constructor() {}
    async create(row: any) {
      if (failNextCreateWithFkViolation) {
        failNextCreateWithFkViolation = false;
        const err: any = new Error(
          'insert or update on table "execution_events" violates foreign key constraint "execution_events_run_id_fkey"',
        );
        err.code = '23503';
        throw err;
      }
      createdEvents.push(row);
      return { id: String(createdEvents.length), ...row };
    }
  }
}));

describe('pipeline-stream-integration', () => {
  it('registers a streamer on Execution and persists events when enabled', async () => {
    const exec = new Execution('pipeline:test');
    const fakeSupabase: any = {}; // not used by mock model

    const streamer = enablePipelineStreaming(exec, {
      runId: 'run-123',
      userId: 'user-1',
      supabase: fakeSupabase,
      streamToDatabase: true,
      streamToSSE: false,
    });

    // Emit a couple of events through the streamer
    await streamer.writeData(JSON.stringify({ type: 'pipeline', status: 'start', timestamp: Date.now() }));
    await streamer.writeData(JSON.stringify({ type: 'phase', phase: 'setup', status: 'start', timestamp: Date.now() }));

    expect(typeof streamer.subscribe).toBe('function');
    expect(typeof streamer.writeData).toBe('function');
    // Allow async subscribers to flush
    await new Promise(r => setTimeout(r, 10));
    expect(createdEvents.length).toBeGreaterThanOrEqual(2);
    expect(createdEvents[0].run_id).toBe('run-123');
    expect(createdEvents[0].event_type).toBeDefined();
  });

  it('createStreamingExecution stores the run id as the canonical correlationId, resolvable from deep children', () => {
    const exec = createStreamingExecution({
      runId: 'run-correlation-1',
      userId: 'user-1',
      supabase: {} as any,
      streamToDatabase: false,
      streamToSSE: false,
    });

    expect(exec.get('execution', 'correlationId')).toBe('run-correlation-1');
    // Substep diagnostics (raw LLM I/O sidecar directory naming) resolve the
    // run id via findUp from arbitrarily deep child nodes.
    const deepChild = exec.child('phase:discovery').child('agent:search').child('step:plan');
    expect(deepChild.findUp('execution', 'correlationId')).toBe('run-correlation-1');
  });
});

describe('pipeline-stream-integration — executions-row FK race (QA: "Failed to persist stream event" 23503)', () => {
  it('gates the first persisted event on the executions-row insert completing, instead of racing it', async () => {
    let resolveInsert: () => void;
    const insertPromise = new Promise<void>((resolve) => {
      resolveInsert = resolve;
    });
    const fakeSupabase: any = {
      from: (table: string) => {
        expect(table).toBe('executions');
        return {
          insert: async () => {
            await insertPromise; // simulates a slow executions-row insert round trip
            return { error: null };
          },
        };
      },
    };

    const exec = new Execution('pipeline:race-test');
    const runId = '11111111-1111-4111-8111-111111111111';
    const streamer = enablePipelineStreaming(exec, {
      runId,
      userId: 'user-race',
      supabase: fakeSupabase,
      streamToDatabase: true,
      streamToSSE: false,
    });

    const before = createdEvents.length;
    const writeDone = streamer.writeData(
      JSON.stringify({ type: 'status', message: 'started', timestamp: Date.now() }),
    );

    // While the executions-row insert is still in flight, the event must NOT
    // have persisted yet (this is the FK-violation race: previously the event
    // insert fired immediately, unordered relative to the executions insert).
    await new Promise((r) => setTimeout(r, 10));
    expect(createdEvents.length).toBe(before);

    resolveInsert!();
    await writeDone;
    await new Promise((r) => setTimeout(r, 10));

    expect(createdEvents.length).toBe(before + 1);
    expect(createdEvents[createdEvents.length - 1].run_id).toBe(runId);
  });

  it('self-heals a 23503 FK violation by ensuring the executions row and retrying once', async () => {
    let insertCallCount = 0;
    const fakeSupabase: any = {
      from: (table: string) => {
        expect(table).toBe('executions');
        return {
          insert: async () => {
            insertCallCount += 1;
            return { error: null };
          },
        };
      },
    };
    failNextCreateWithFkViolation = true;

    const exec = new Execution('pipeline:retry-test');
    const runId = '22222222-2222-4222-8222-222222222222';
    const streamer = enablePipelineStreaming(exec, {
      runId,
      userId: 'user-retry',
      supabase: fakeSupabase,
      streamToDatabase: true,
      streamToSSE: false,
    });

    const before = createdEvents.length;
    await streamer.writeData(JSON.stringify({ type: 'status', message: 'hello', timestamp: Date.now() }));
    await new Promise((r) => setTimeout(r, 10));

    expect(createdEvents.length).toBe(before + 1);
    expect(createdEvents[createdEvents.length - 1].run_id).toBe(runId);
    // The upfront best-effort insert, plus the retry-triggered ensure-row insert.
    expect(insertCallCount).toBeGreaterThanOrEqual(2);
  });
});

describe('sourceSafeStreamEvent (telemetry source-safety law, V48)', () => {
  const RAW_RESPONSE = '```json\n{\n  "analysis": "secret plan prose",\n  "steps": ["step one"]\n}\n```';

  it('withholds the raw model response stored under llm/response', () => {
    const safe = sourceSafeStreamEvent({
      type: 'status',
      namespace: 'llm',
      key: 'response',
      message: RAW_RESPONSE,
      data: RAW_RESPONSE,
      executionState: { phase: 'setup', agent: 'SetupPlanAgent', step: 'plan' },
    });
    expect(safe.message).toBe('[content withheld — source-safe]');
    expect(safe.data.contentWithheld).toBe(true);
    expect(safe.data.sourceSafetyClass).toBe('source_safe');
    expect(safe.data.contentChars).toBe(RAW_RESPONSE.length);
    // The raw prose must not survive anywhere on the event.
    expect(JSON.stringify(safe)).not.toContain('secret plan prose');
  });

  it('withholds the raw prompt stored under llm/messages', () => {
    const safe = sourceSafeStreamEvent({
      type: 'status',
      namespace: 'llm',
      key: 'messages',
      data: [{ role: 'user', content: 'secret prompt body' }],
    });
    expect(safe.message).toBe('[content withheld — source-safe]');
    expect(JSON.stringify(safe)).not.toContain('secret prompt body');
  });

  it('passes through source-safe llm metadata (usage) unchanged', () => {
    const event = {
      type: 'status',
      namespace: 'llm',
      key: 'usage',
      data: { promptTokens: 10, completionTokens: 20 },
    };
    expect(sourceSafeStreamEvent(event)).toBe(event);
  });

  it('passes through non-llm events unchanged', () => {
    const event = { type: 'phase-start', namespace: 'phase', key: 'start', message: 'Setup phase started' };
    expect(sourceSafeStreamEvent(event)).toBe(event);
  });

  // Every content-bearing key either LLM-call path writes under the `llm`
  // namespace: the formal Thinkings substeps store input/prompt/output/
  // parsedOutput, while AgentLLMsRegistry/PipelineLLMRegistry (direct getLLM
  // calls) store messages/config/response. The allowlist design means each of
  // these MUST be withheld — a new content key can never silently leak.
  const LLM_CONTENT_KEYS = [
    'input',
    'prompt',
    'output',
    'parsedOutput',
    'messages',
    'config',
    'response',
  ];

  it.each(LLM_CONTENT_KEYS)('withholds llm/%s (content-bearing store)', (key) => {
    const safe = sourceSafeStreamEvent({
      type: 'status',
      namespace: 'llm',
      key,
      message: 'RAW-SOURCE-MARKER prose',
      data: { content: 'RAW-SOURCE-MARKER prose', nested: { deep: 'RAW-SOURCE-MARKER prose' } },
      executionState: { phase: 'discovery', agent: 'measure', step: 'try' },
    });
    expect(safe.message).toBe('[content withheld — source-safe]');
    expect(safe.data.contentWithheld).toBe(true);
    expect(safe.data.stage).toBe(key);
    // PTRR context survives as safe metadata.
    expect(safe.data.phase).toBe('discovery');
    expect(safe.data.agent).toBe('measure');
    expect(JSON.stringify(safe)).not.toContain('RAW-SOURCE-MARKER');
  });

  // The fixed source-safe metadata allowlist: these keys pass through
  // UNCHANGED (same object reference — no rewriting of safe telemetry).
  const SOURCE_SAFE_METADATA_KEYS = [
    'startTime',
    'endTime',
    'duration',
    'usage',
    'status',
    'provider',
    'model',
    'configKey',
    'stopReason',
    'error',
  ];

  it.each(SOURCE_SAFE_METADATA_KEYS)('passes through llm/%s (metadata allowlist)', (key) => {
    const event = {
      type: 'status',
      namespace: 'llm',
      key,
      data: { value: 'safe-metadata' },
    };
    expect(sourceSafeStreamEvent(event)).toBe(event);
  });
});

describe('sourceSafeStreamEvent — non-llm content-bearing stores (deposit inventory + tool args/results)', () => {
  const SOURCE_LINE = 'INVENTORY-SOURCE-MARKER const secret = readDepositorFile();';

  it('withholds deposit:inventory (the verbatim depositor source inventory)', () => {
    const safe = sourceSafeStreamEvent({
      type: 'status',
      namespace: 'deposit',
      key: 'inventory',
      data: { sources: [{ path: 'src/secret.ts', content: SOURCE_LINE }] },
    });
    expect(safe.message).toBe('[content withheld — source-safe]');
    expect(safe.data.contentWithheld).toBe(true);
    expect(safe.data.namespace).toBe('deposit');
    expect(safe.data.stage).toBe('inventory');
    expect(typeof safe.data.contentChars).toBe('number');
    expect(JSON.stringify(safe)).not.toContain('INVENTORY-SOURCE-MARKER');
  });

  it('withholds pipeline:input (carries inventory.sources verbatim on a deposit)', () => {
    const safe = sourceSafeStreamEvent({
      type: 'status',
      namespace: 'pipeline',
      key: 'input',
      data: {
        repository: { fullName: 'octo/repo' },
        inventory: { sources: [{ path: 'src/secret.ts', content: SOURCE_LINE }] },
      },
    });
    expect(safe.data.contentWithheld).toBe(true);
    expect(JSON.stringify(safe)).not.toContain('INVENTORY-SOURCE-MARKER');
  });

  it('withholds context:selectedContext (PCC read-in re-carries resolved values incl. the inventory — live leak, run 59504a3e)', () => {
    const safe = sourceSafeStreamEvent({
      type: 'status',
      namespace: 'context',
      key: 'selectedContext',
      data: {
        'deposit#inventory': {
          sources: [{ path: 'src/secret.ts', content: SOURCE_LINE }],
        },
        'deposit#obfuscations': 'guidance text',
      },
    });
    expect(safe.data.contentWithheld).toBe(true);
    expect(JSON.stringify(safe)).not.toContain('INVENTORY-SOURCE-MARKER');
  });

  it('passes through the key-NAME context stores (keys/selectedKeys/missingKeys are source-safe)', () => {
    const selectedKeys = {
      type: 'status',
      namespace: 'context',
      key: 'selectedKeys',
      data: ['deposit#obfuscations', 'deposit#inventory'],
    };
    expect(sourceSafeStreamEvent(selectedKeys)).toBe(selectedKeys);
  });

  it('passes through OTHER pipeline/deposit metadata keys unchanged (allowlist is key-scoped)', () => {
    const pattern = { type: 'status', namespace: 'pipeline', key: 'pattern', data: 'SDIVF' };
    expect(sourceSafeStreamEvent(pattern)).toBe(pattern);
    const repo = {
      type: 'status',
      namespace: 'deposit',
      key: 'repository',
      data: { fullName: 'octo/repo', branch: 'main' },
    };
    expect(sourceSafeStreamEvent(repo)).toBe(repo);
  });

  it.each([
    ['tool', 'input'],
    ['tool', 'result'],
    ['tools', 'invocation'],
    ['tools', 'result'],
  ])('withholds %s/%s content while keeping tool-name metadata', (namespace, key) => {
    const safe = sourceSafeStreamEvent({
      type: namespace === 'tools' && key === 'result' ? 'tool-use' : 'status',
      namespace,
      key,
      data: { tool: 'repository-read', ok: true, input: { path: 'src/secret.ts' }, output: SOURCE_LINE },
      metadata: { stores: { toolEvents: { [key]: [{ output: SOURCE_LINE }] } } },
    });
    expect(safe.message).toBe('[content withheld — source-safe]');
    expect(safe.data.contentWithheld).toBe(true);
    // Tool metadata survives (name + outcome), content does not.
    expect(safe.data.tool).toBe('repository-read');
    expect(safe.data.ok).toBe(true);
    // The metadata.stores mirror (adapter enrichment side channel) is stripped.
    expect(safe.metadata?.stores).toBeUndefined();
    expect(JSON.stringify(safe)).not.toContain('INVENTORY-SOURCE-MARKER');
    expect(JSON.stringify(safe)).not.toContain('src/secret.ts');
  });

  it('tool duration/status metadata stores pass through unchanged (separate store events)', () => {
    for (const key of ['name', 'startTime', 'endTime', 'status']) {
      const event = { type: 'status', namespace: 'tool', key, data: key === 'name' ? 'EchoTool' : 123 };
      expect(sourceSafeStreamEvent(event)).toBe(event);
    }
  });

  it('strips the metadata.stores generations mirror on withheld llm events too', () => {
    const safe = sourceSafeStreamEvent({
      type: 'generation',
      namespace: 'llm',
      key: 'output',
      data: { content: SOURCE_LINE, failsafe: 'chunk', generation: 'g1' },
      metadata: { stores: { generations: { chunk: { g1: { llm: { output: { content: SOURCE_LINE } } } } } } },
    });
    expect(safe.metadata?.stores).toBeUndefined();
    expect(JSON.stringify(safe)).not.toContain('INVENTORY-SOURCE-MARKER');
  });

  it('REGRESSION: a stored inventory source line never reaches persisted execution_events', async () => {
    const exec = new Execution('pipeline:inventory-safety');
    const streamer = enablePipelineStreaming(exec, {
      runId: 'run-inventory-safety',
      userId: 'user-1',
      supabase: {} as any,
      streamToDatabase: true,
      streamToSSE: false,
    });
    expect(streamer).toBeDefined();

    const before = createdEvents.length;
    // Model the deposit preprocess cross-phase stores on the SHARED root
    // (storeCrossPhaseArtifact → root.store): full verbatim inventory.
    exec.store('deposit', 'inventory', {
      sources: [{ path: 'src/secret.ts', content: SOURCE_LINE }],
    });
    exec.store('pipeline', 'input', {
      repository: { fullName: 'octo/repo' },
      inventory: { sources: [{ path: 'src/secret.ts', content: SOURCE_LINE }] },
    });
    // store() → adapter emit → persistence is fire-and-forget: let it flush.
    await new Promise((r) => setTimeout(r, 50));

    const rows = createdEvents.slice(before);
    expect(rows.length).toBe(2);
    for (const row of rows) {
      expect(row.event_data.data.contentWithheld).toBe(true);
      expect(JSON.stringify(row)).not.toContain('INVENTORY-SOURCE-MARKER');
    }
  });

  it('REGRESSION: ExecutionTool.execute raw args/results never reach persisted execution_events', async () => {
    const exec = new Execution('pipeline:tool-safety');
    enablePipelineStreaming(exec, {
      runId: 'run-tool-safety',
      userId: 'user-1',
      supabase: {} as any,
      streamToDatabase: true,
      streamToSSE: false,
    });

    const before = createdEvents.length;
    // Model ExecutionTool.execute's tracking child stores (AgentToolsRegistry).
    const toolExec = exec.child('tool:RepositoryReadTool');
    toolExec.store('tool', 'name', 'RepositoryReadTool');
    toolExec.store('tool', 'startTime', Date.now());
    toolExec.store('tool', 'input', [{ path: 'src/secret.ts' }]);
    toolExec.store('tool', 'result', { content: SOURCE_LINE });
    toolExec.store('tool', 'status', 'success');
    toolExec.store('tool', 'endTime', Date.now());
    await new Promise((r) => setTimeout(r, 50));

    const rows = createdEvents.slice(before);
    expect(rows.length).toBe(6);
    const persisted = JSON.stringify(rows);
    expect(persisted).not.toContain('INVENTORY-SOURCE-MARKER');
    expect(persisted).not.toContain('src/secret.ts');
    // Name/duration/status metadata still lands.
    expect(persisted).toContain('RepositoryReadTool');
    expect(persisted).toContain('success');
    const withheld = rows.filter((row) => row.event_data?.data?.contentWithheld === true);
    expect(withheld).toHaveLength(2);
  });
});

describe('legacy execution_events persistence applies the source-safe filter to every row', () => {
  it('persists llm content events with content withheld (raw text never reaches execution_events)', async () => {
    const exec = new Execution('pipeline:source-safety');
    const RAW = 'RAW-DEPOSITOR-SOURCE function secretImplementation() { return 42; }';

    const streamer = enablePipelineStreaming(exec, {
      runId: 'run-source-safety',
      userId: 'user-1',
      supabase: {} as any, // unused by the mocked ExecutionEventsModel
      streamToDatabase: true,
      streamToSSE: false,
    });

    const before = createdEvents.length;
    await streamer.writeData(
      JSON.stringify({
        type: 'status',
        namespace: 'llm',
        key: 'output',
        message: RAW,
        data: { content: RAW },
      }),
    );
    await new Promise((r) => setTimeout(r, 10));

    expect(createdEvents.length).toBe(before + 1);
    const row = createdEvents[createdEvents.length - 1];
    expect(row.run_id).toBe('run-source-safety');
    expect(row.event_data.data.contentWithheld).toBe(true);
    expect(row.event_data.message).toBe('[content withheld — source-safe]');
    expect(JSON.stringify(row)).not.toContain('RAW-DEPOSITOR-SOURCE');
  });

  it('persists safe llm metadata rows unfiltered on the same path', async () => {
    const exec = new Execution('pipeline:source-safety-metadata');
    const streamer = enablePipelineStreaming(exec, {
      runId: 'run-source-safety-metadata',
      userId: 'user-1',
      supabase: {} as any,
      streamToDatabase: true,
      streamToSSE: false,
    });

    const before = createdEvents.length;
    await streamer.writeData(
      JSON.stringify({
        type: 'status',
        namespace: 'llm',
        key: 'usage',
        data: { promptTokens: 11, completionTokens: 5 },
      }),
    );
    await new Promise((r) => setTimeout(r, 10));

    expect(createdEvents.length).toBe(before + 1);
    const row = createdEvents[createdEvents.length - 1];
    expect(row.event_data.data).toEqual({ promptTokens: 11, completionTokens: 5 });
  });
});
