import {
  buildTerminalRunActivityFromEvents,
  buildTerminalRunActivityFromMock,
  TELEMETRY_ROW_KEY_SEP,
} from '@/app/terminal/terminal-run-activity';

describe('terminal-run-activity helpers', () => {
  it('builds Terminal activity from live execution events', () => {
    const snapshot = buildTerminalRunActivityFromEvents(
      [
        {
          id: '1',
          event: {
            type: 'status',
            status: {
              message: 'Preparing run',
              executionState: { phase: 'Discovery', agent: 'Analyzer', step: 'chunk_then_sum' },
            },
          },
          created_at: '2026-04-16T12:00:00.000Z',
        },
        {
          id: '2',
          event: { type: 'generation', message: 'Model call completed' },
          created_at: '2026-04-16T12:00:10.000Z',
        },
        {
          id: '3',
          event: { type: 'work-update', update: { iteration: 1, confidence: 0.7 } },
          created_at: '2026-04-16T12:00:20.000Z',
        },
        {
          id: '4',
          event: { type: 'completion' },
          created_at: '2026-04-16T12:00:30.000Z',
        },
      ],
      { iteration: 1, confidence: 0.7 },
      [{ iteration: 1, confidence: 0.7 }],
      null,
    );

    // Only the LLM-call layer becomes a row; informational status and the
    // completion notice are dropped from the log (surfaced via the processing
    // indicator / executionState / isStreamingComplete instead).
    expect(snapshot.output).toContain('Model call completed');
    expect(snapshot.output).not.toContain('Preparing run');
    expect(snapshot.output).not.toContain('[completion]');
    expect(snapshot.executionState.phase).toBe('Discovery');
    expect(snapshot.isStreamingComplete).toBe(true);
    expect(snapshot.generationCount).toBe(1);
    expect(snapshot.activityKinds).toEqual(['execution']);
    expect(snapshot.activityRecords).toHaveLength(4);
    expect(snapshot.activityRecords[0]?.kind).toBe('execution');
    expect(snapshot.activityRecords[2]?.title).toBe('Work update');
    expect(snapshot.iterationUpdates).toHaveLength(1);
    expect(snapshot.latestWorkUpdate?.confidence).toBe(0.7);
  });

  it('renders only LLM-call and Tool-use rows, each stamped with its full hierarchy (F19)', () => {
    const snapshot = buildTerminalRunActivityFromEvents(
      [
        // Fragment: a step-name store leaks the value "try" — must NOT become a row.
        { id: '1', event: { type: 'status', namespace: 'step', key: 'name', message: 'try', data: 'try' }, created_at: '2026-06-26T12:00:00.000Z' },
        // Fragment: a cwd path store — must NOT become a row.
        { id: '2', event: { type: 'status', namespace: 'workspace', key: 'cwd', message: '/Users/x/ENGI/uapi', data: '/Users/x/ENGI/uapi' }, created_at: '2026-06-26T12:00:01.000Z' },
        // Context: agent start establishes phase/agent/step for the following rows.
        { id: '3', event: { type: 'agent-start', namespace: 'agent:SetupPlanAgent', key: 'start', executionState: { phase: 'setup', agent: 'SetupPlanAgent', step: 'plan' } }, created_at: '2026-06-26T12:00:02.000Z' },
        // Fragment: the prompt-side llm store — must NOT become a row.
        { id: '4', event: { type: 'status', namespace: 'llm', key: 'input', message: '[content withheld — source-safe]' }, created_at: '2026-06-26T12:00:03.000Z' },
        // Formal LLM call: the substep output carries the full hierarchy.
        { id: '5', event: { type: 'generation', namespace: 'llm', key: 'output', message: '[content withheld — source-safe]', executionState: { phase: 'setup', agent: 'SetupPlanAgent', step: 'plan', failsafe: 'prepare_concise_context', generation: 'reason' } }, created_at: '2026-06-26T12:00:04.000Z' },
        // Formal Tool use: name then result on the same node.
        { id: '6', event: { type: 'status', namespace: 'tool', key: 'name', data: 'AssetPackPatchWriteTool', executionNodeId: 'tool-node-1' }, created_at: '2026-06-26T12:00:05.000Z' },
        { id: '7', event: { type: 'status', namespace: 'tool', key: 'result', data: { ok: true }, executionNodeId: 'tool-node-1' }, created_at: '2026-06-26T12:00:06.000Z' },
      ],
      null,
      [],
      null,
    );

    // Fragments are suppressed; only the LLM call + Tool use are rows.
    expect(snapshot.output).toContain('[content withheld — source-safe]');
    expect(snapshot.output).toContain('AssetPackPatchWriteTool');
    expect(snapshot.output).not.toContain('try');
    expect(snapshot.output).not.toContain('/Users/');
    expect(snapshot.output.split('\n')).toHaveLength(2);

    const rows = Object.values(snapshot.outputDetails) as any[];
    const llm = rows.find((r) => r.type === 'generation');
    const tool = rows.find((r) => r.type === 'tool-use');

    // LLM call: all five hierarchy levels present.
    expect(llm?.executionState).toMatchObject({
      phase: 'setup',
      agent: 'SetupPlanAgent',
      step: 'plan',
      failsafe: 'prepare_concise_context',
      generation: 'reason',
    });
    // Tool use: Phase/Agent/Step (from rolling context) + tool name, no failsafe/generation.
    expect(tool?.executionState).toMatchObject({ phase: 'setup', agent: 'SetupPlanAgent', step: 'plan', tool: 'AssetPackPatchWriteTool' });
    expect(tool?.executionState.failsafe).toBeUndefined();
    expect(tool?.metadata?.toolName).toBe('AssetPackPatchWriteTool');
  });

  it('rows a tool/error as "tool (failed)" with Phase/Agent/Step only — never Failsafe/Generation (F19/F21)', () => {
    const snapshot = buildTerminalRunActivityFromEvents(
      [
        // Context establishes the rolling hierarchy the tool row must inherit.
        {
          id: '1',
          event: {
            type: 'agent-start',
            executionState: { phase: 'implementation', agent: 'DepositAssetPackSynthesisAgent', step: 'try' },
          },
          created_at: '2026-06-30T10:00:00.000Z',
        },
        // A failed tool call with no prior tool/name store on its node.
        {
          id: '2',
          event: {
            type: 'status',
            namespace: 'tool',
            key: 'error',
            data: { message: 'clone failed' },
            executionNodeId: 'tool-node-err-1',
          },
          created_at: '2026-06-30T10:00:01.000Z',
        },
      ],
      null,
      [],
      null,
    );

    expect(snapshot.output.split('\n')).toHaveLength(1);
    expect(snapshot.output).toContain('tool (failed)');

    const row = Object.values(snapshot.outputDetails)[0] as any;
    expect(row.type).toBe('tool-use');
    expect(row.executionState).toMatchObject({
      phase: 'implementation',
      agent: 'DepositAssetPackSynthesisAgent',
      step: 'try',
      tool: 'tool (failed)',
    });
    // Tool uses never carry the LLM-only hierarchy levels.
    expect(row.executionState.failsafe).toBeUndefined();
    expect(row.executionState.generation).toBeUndefined();
  });

  it('accumulates tool name/input per executionNodeId and clears the accumulator after the row', () => {
    const snapshot = buildTerminalRunActivityFromEvents(
      [
        { id: '1', event: { type: 'status', namespace: 'tool', key: 'name', data: 'VcsCloneTool', executionNodeId: 'node-a' }, created_at: '2026-06-30T10:00:00.000Z' },
        { id: '2', event: { type: 'status', namespace: 'tool', key: 'input', data: { repository: 'engineeredsoftware/ENGI' }, executionNodeId: 'node-a' }, created_at: '2026-06-30T10:00:01.000Z' },
        { id: '3', event: { type: 'status', namespace: 'tool', key: 'result', data: { ok: true }, executionNodeId: 'node-a' }, created_at: '2026-06-30T10:00:02.000Z' },
        // Same node id again, WITHOUT a fresh name/input: the accumulator was
        // cleared after the first row, so this falls back to the generic label.
        { id: '4', event: { type: 'status', namespace: 'tool', key: 'result', data: { ok: true }, executionNodeId: 'node-a' }, created_at: '2026-06-30T10:00:03.000Z' },
      ],
      null,
      [],
      null,
    );

    const lines = snapshot.output.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('VcsCloneTool');
    expect(lines[1]).toContain('tool');
    expect(lines[1]).not.toContain('VcsCloneTool');

    const rows = Object.values(snapshot.outputDetails) as any[];
    expect(rows[0].metadata.toolName).toBe('VcsCloneTool');
    expect(rows[0].metadata.toolInput).toEqual({ repository: 'engineeredsoftware/ENGI' });
    expect(rows[1].metadata.toolName).toBe('tool');
    expect(rows[1].metadata.toolInput).toBeNull();
    // The name/input stores themselves never became rows.
    expect(snapshot.output).not.toContain('engineeredsoftware/ENGI');
  });

  it('advances the rolling context from intermediate stores without rowing them', () => {
    const snapshot = buildTerminalRunActivityFromEvents(
      [
        // Name stores carry the hierarchy as bare values — context only, no rows.
        { id: '1', event: { type: 'status', namespace: 'phase', key: 'current', data: 'discovery', message: 'discovery' }, created_at: '2026-06-30T11:00:00.000Z' },
        { id: '2', event: { type: 'status', namespace: 'agent', key: 'name', data: 'DepositDepositorySearchAgent', message: 'DepositDepositorySearchAgent' }, created_at: '2026-06-30T11:00:01.000Z' },
        { id: '3', event: { type: 'status', namespace: 'step', key: 'name', data: 'plan', message: 'plan' }, created_at: '2026-06-30T11:00:02.000Z' },
        // Registry copy of the model response — context/no-row (withheld anyway).
        { id: '4', event: { type: 'status', namespace: 'llm', key: 'response', message: '[content withheld — source-safe]' }, created_at: '2026-06-30T11:00:03.000Z' },
        // An LLM call that omits its own executionState inherits the rolling context.
        { id: '5', event: { type: 'generation', namespace: 'llm', key: 'output', message: '[content withheld — source-safe]' }, created_at: '2026-06-30T11:00:04.000Z' },
      ],
      null,
      [],
      null,
    );

    // Only the LLM call rows; every store above it was context.
    expect(snapshot.output.split('\n')).toHaveLength(1);
    const row = Object.values(snapshot.outputDetails)[0] as any;
    expect(row.type).toBe('generation');
    expect(row.executionState).toMatchObject({
      phase: 'discovery',
      agent: 'DepositDepositorySearchAgent',
      step: 'plan',
    });
  });

  it('keeps identical withheld texts as distinct rows via TELEMETRY_ROW_KEY_SEP and keeps content withheld', () => {
    const withheld = '[content withheld — source-safe]';
    const snapshot = buildTerminalRunActivityFromEvents(
      [
        { id: '1', event: { type: 'generation', namespace: 'llm', key: 'output', message: withheld, executionState: { phase: 'setup', agent: 'A', step: 'plan', failsafe: 'prepare_concise_context', generation: 'reason' } }, created_at: '2026-06-30T12:00:00.000Z' },
        { id: '2', event: { type: 'generation', namespace: 'llm', key: 'output', message: withheld, executionState: { phase: 'setup', agent: 'A', step: 'plan', failsafe: 'prepare_concise_context', generation: 'judge' } }, created_at: '2026-06-30T12:00:01.000Z' },
      ],
      null,
      [],
      null,
    );

    const lines = snapshot.output.split('\n');
    expect(lines).toHaveLength(2);
    // Same display text, distinct row keys — the renderer's text-keyed de-dup
    // cannot collapse them.
    expect(lines[0]).not.toBe(lines[1]);
    for (const line of lines) {
      const [text, key] = line.split(TELEMETRY_ROW_KEY_SEP);
      expect(text).toBe(withheld);
      expect(key).toBeTruthy();
    }
    // Both enriched rows are addressable under their unique keys.
    expect(Object.keys(snapshot.outputDetails)).toHaveLength(2);
    expect(snapshot.generationCount).toBe(2);
  });

  it('collapses multi-line and overlong messages into one bounded display line', () => {
    const longTail = 'x'.repeat(400);
    const snapshot = buildTerminalRunActivityFromEvents(
      [
        {
          id: '1',
          event: { type: 'generation', message: `first line\nsecond line\r\nthird   line ${longTail}` },
          created_at: '2026-06-30T13:00:00.000Z',
        },
      ],
      null,
      [],
      null,
    );

    // One event -> exactly one output line, newlines collapsed to spaces.
    const lines = snapshot.output.split('\n');
    expect(lines).toHaveLength(1);
    const displayText = lines[0].split(TELEMETRY_ROW_KEY_SEP)[0];
    expect(displayText.startsWith('first line second line third line')).toBe(true);
    expect(displayText.length).toBeLessThanOrEqual(280);
    expect(displayText.endsWith('…')).toBe(true);
  });

  it('counts only type === "generation" events in generationCount', () => {
    const snapshot = buildTerminalRunActivityFromEvents(
      [
        { id: '1', event: { type: 'generation', message: 'call one' }, created_at: '2026-06-30T14:00:00.000Z' },
        { id: '2', event: { type: 'generation', message: 'call two' }, created_at: '2026-06-30T14:00:01.000Z' },
        // Rows as an LLM line (llm/output) but is not a generation-typed event.
        { id: '3', event: { type: 'status', namespace: 'llm', key: 'output', message: '[content withheld — source-safe]' }, created_at: '2026-06-30T14:00:02.000Z' },
        { id: '4', event: { type: 'status', namespace: 'tool', key: 'result', data: { ok: true }, executionNodeId: 'n1' }, created_at: '2026-06-30T14:00:03.000Z' },
        { id: '5', event: { type: 'completion' }, created_at: '2026-06-30T14:00:04.000Z' },
      ],
      null,
      [],
      null,
    );

    expect(snapshot.generationCount).toBe(2);
    // All three formal rows still render (2 generations + llm/output + tool = 4 rows).
    expect(snapshot.output.split('\n')).toHaveLength(4);
  });

  it('folds work-update events into iterationUpdates without rowing them', () => {
    const snapshot = buildTerminalRunActivityFromEvents(
      [
        { id: '1', event: { type: 'work-update', update: { iteration: 1, confidence: 0.4, prose: 'first pass' } }, created_at: '2026-06-30T15:00:00.000Z' },
        { id: '2', event: { type: 'work-update', update: { iteration: 1, confidence: 0.55, prose: 'first pass refined' } }, created_at: '2026-06-30T15:00:01.000Z' },
        { id: '3', event: { type: 'work-update', update: { iteration: 2, confidence: 0.8, prose: 'second pass' } }, created_at: '2026-06-30T15:00:02.000Z' },
      ],
      null,
      [],
      null,
    );

    expect(snapshot.output).toBe('');
    expect(Object.keys(snapshot.outputDetails)).toHaveLength(0);
    // Later update for the same iteration wins; iterations stay distinct.
    expect(snapshot.iterationUpdates).toHaveLength(2);
    expect(snapshot.iterationUpdates.find((u: any) => u.iteration === 1)?.confidence).toBe(0.55);
    expect(snapshot.iterationUpdates.find((u: any) => u.iteration === 2)?.confidence).toBe(0.8);
  });

  it("ignores a legacy 'error'-typed validation repair event as the run error, but keeps genuine errors", () => {
    // Rows persisted before the ExecutionStreamAdapter repair fix: the stitch
    // failsafe's validation error arrived typed 'error' with namespace
    // 'validation' — the run was still actively repairing, not failed.
    const repairOnly = buildTerminalRunActivityFromEvents(
      [
        {
          id: 'e1',
          created_at: '2026-07-03T19:12:29.447Z',
          event: {
            type: 'error',
            namespace: 'validation',
            key: 'error',
            message: '[{"path":["options"],"message":"Required"}]',
          },
        },
      ] as any,
      null,
      [],
      null,
    );
    expect(repairOnly.error).toBeNull();

    const genuine = buildTerminalRunActivityFromEvents(
      [
        {
          id: 'e2',
          created_at: '2026-07-03T19:13:00.000Z',
          event: { type: 'error', message: 'synthesis failed' },
        },
      ] as any,
      null,
      [],
      null,
    );
    expect(genuine.error).toBe('synthesis failed');
  });

  it('uses explicit stream error and mock snapshots', () => {
    const liveErrorSnapshot = buildTerminalRunActivityFromEvents([], null, [], 'Stream failed');
    expect(liveErrorSnapshot.error).toBe('Stream failed');

    const mockSnapshot = buildTerminalRunActivityFromMock({
      output: '[pipeline:running]\n[completion]',
      outputDetails: { '[completion]': { type: 'completion' } },
      executionState: { phase: 'Mock' },
      isStreamingComplete: true,
      generationCount: 2,
    });

    expect(mockSnapshot?.output).toContain('[completion]');
    expect(mockSnapshot?.activityKinds).toEqual(['execution']);
    expect(mockSnapshot?.activityRecords).toHaveLength(1);
    expect(mockSnapshot?.executionState.phase).toBe('Mock');
    expect(mockSnapshot?.generationCount).toBe(2);
  });
});
