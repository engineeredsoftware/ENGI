// @ts-nocheck
import { Execution } from '@bitcode/execution-generics';
import { enablePipelineStreaming, sourceSafeStreamEvent } from '../../streaming/pipeline-stream-integration';

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
});
