// FileDiffViewer pulls react-syntax-highlighter + lucide-react ESM that jest can't
// parse; mock it so the pipeline-execution-log module loads. (The full component is
// not rendered here — its auto-follow scroll effect loops in jsdom — so we unit-test
// the pure copy-text builder the "Copy raw logs" button uses.)
jest.mock('@/components/base/bitcode/execution/FileDiffViewer', () => ({
  __esModule: true,
  default: () => null,
}));

import {
  buildRawLogCopyText,
  buildTerseLogCopyText,
  compactTerseEvent,
  distillTerseValue,
  buildProcessingStallLabel,
  copyTextToClipboard,
} from '@/components/base/bitcode/execution/pipeline-execution-log';

describe('PipelineExecutionLog — Copy raw logs (buildRawLogCopyText)', () => {
  it('copies the full copyData payload (all streamed logs + inputs) verbatim as JSON', () => {
    const copyData = {
      runId: 'run-1',
      inputs: {
        repositoryFullName: 'engineeredsoftware/demo',
        obfuscations: 'hide internal names',
        forcedExclusions: 'secret/',
      },
      events: [
        { type: 'status', message: 'started' },
        { type: 'generation', llm: { model: 'claude-sonnet-4-6' } },
      ],
    };
    expect(buildRawLogCopyText({ copyData })).toBe(JSON.stringify(copyData, null, 2));
  });

  it('copies a string copyData verbatim', () => {
    expect(buildRawLogCopyText({ copyData: 'already-serialized raw logs' })).toBe(
      'already-serialized raw logs',
    );
  });

  it('falls back to rendered output + details + error when no copyData', () => {
    const text = buildRawLogCopyText({
      output: 'line one\nline two',
      outputDetails: { phase: 'Validation' },
      error: 'boom',
    });
    expect(text).toContain('line one');
    expect(text).toContain('=== details ===');
    expect(text).toContain('Validation');
    expect(text).toContain('=== error ===');
    expect(text).toContain('boom');
  });
});

describe('PipelineExecutionLog — Copy terse logs (buildTerseLogCopyText)', () => {
  const bigBody = 'x'.repeat(5_000);
  const copyData = {
    runId: 'run-1',
    status: 'failed',
    error: 'synthesis broke: ' + 'e'.repeat(500),
    inputs: {
      repositoryFullName: 'engineeredsoftware/demo',
      obfuscations: 'hide internal names — ' + 'o'.repeat(1_000),
    },
    outputDetails: { 'row one': { status: { executionState: { phase: 'implementation' } }, body: bigBody } },
    events: [
      {
        id: 'evt-1',
        created_at: '2026-07-03T17:31:00.000Z',
        event: {
          type: 'generation',
          namespace: 'llm',
          key: 'response',
          value: bigBody,
          status: {
            executionState: {
              pipeline: 'AssetPacksSynthesis',
              phase: 'implementation',
              agent: 'DepositAssetPackSynthesisAgent',
              step: 'retry',
              failsafe: 'prepare_concise_context',
              generation: 'reason',
              stitchIteration: 2,
            },
            usage: { inputTokens: 1200, outputTokens: 340 },
            model: 'claude-sonnet-5',
            provider: 'anthropic',
          },
        },
      },
      {
        id: 'evt-2',
        created_at: '2026-07-03T17:31:30.000Z',
        event: {
          type: 'status',
          namespace: 'llm',
          key: 'usage',
          message: '[content withheld — source-safe]',
          data: { inputTokens: 900, outputTokens: 120, provider: 'anthropic', model: 'claude-sonnet-5' },
        },
      },
      {
        id: 'evt-3',
        created_at: '2026-07-03T17:32:06.000Z',
        event: { type: 'error', error: { message: 'credit balance is too low', stack: 's'.repeat(3_000) } },
      },
    ],
  };

  it('keeps the run header, hierarchy, ordering, usage, and error bodies', () => {
    const text = buildTerseLogCopyText({ copyData });
    const parsed = JSON.parse(text);
    expect(parsed.runId).toBe('run-1');
    expect(parsed.status).toBe('failed');
    expect(parsed.error).toContain('synthesis broke');
    expect(parsed.eventCount).toBe(3);
    expect(parsed.firstEventAt).toBe('2026-07-03T17:31:00.000Z');
    expect(parsed.lastEventAt).toBe('2026-07-03T17:32:06.000Z');
    const [first, usageRow, second] = parsed.events;
    expect(usageRow).toMatchObject({
      type: 'status',
      namespace: 'llm',
      key: 'usage',
      provider: 'anthropic',
      model: 'claude-sonnet-5',
      usage: { inputTokens: 900, outputTokens: 120 },
    });
    expect(first).toMatchObject({
      created_at: '2026-07-03T17:31:00.000Z',
      type: 'generation',
      namespace: 'llm',
      key: 'response',
      pipeline: 'AssetPacksSynthesis',
      phase: 'implementation',
      agent: 'DepositAssetPackSynthesisAgent',
      step: 'retry',
      failsafe: 'prepare_concise_context',
      generation: 'reason',
      stitchIteration: 2,
      provider: 'anthropic',
      model: 'claude-sonnet-5',
      usage: { inputTokens: 1200, outputTokens: 340 },
    });
    expect(second.type).toBe('error');
    expect(second.error.message).toContain('credit balance is too low');
  });

  it('drops the bulk: stored values, outputDetails duplication, oversized strings', () => {
    const text = buildTerseLogCopyText({ copyData });
    const parsed = JSON.parse(text);
    expect(parsed.events[0].value).toBeUndefined();
    expect(parsed.outputDetails).toContain('omitted');
    expect(text).not.toContain(bigBody);
    expect(text.length).toBeLessThan(buildRawLogCopyText({ copyData }).length / 2);
  });

  it('truncates long strings with a size marker, keeping larger error budgets', () => {
    const longPlain = distillTerseValue('p'.repeat(300)) as string;
    expect(longPlain).toContain('… [+100 chars]');
    const longError = distillTerseValue('e'.repeat(300), 'error') as string;
    expect(longError).toBe('e'.repeat(300));
    const hugeStack = distillTerseValue('s'.repeat(3_000), 'stack') as string;
    expect(hugeStack).toContain('… [+1000 chars]');
  });

  it('compacts a bare payload without an events wrapper gracefully', () => {
    const row = compactTerseEvent({ type: 'completion', message: 'done' });
    expect(row).toEqual({ type: 'completion', message: 'done' });
  });

  it('distills the fallback output/details/error when no copyData is passed', () => {
    const text = buildTerseLogCopyText({
      output: 'line one\n' + 'z'.repeat(1_000),
      outputDetails: { phase: 'Validation' },
      error: 'boom',
    });
    const parsed = JSON.parse(text);
    expect(parsed.output).toContain('line one');
    expect(parsed.output).toContain('… [+');
    expect(parsed.outputDetails.phase).toBe('Validation');
    expect(parsed.error).toBe('boom');
  });
});

describe('buildProcessingStallLabel — live stall visibility (QA debug aid)', () => {
  it('falls back to a bare label when there is no prior line yet', () => {
    expect(buildProcessingStallLabel(undefined, Date.now())).toEqual({
      label: 'Processing',
      likelyStalled: false,
    });
  });

  it('renders a natural-language sentence + elapsed seconds since the last line, not stalled under the threshold', () => {
    const lastLine = {
      phase: 'Discovery',
      agent: 'DepositDepositorySearchAgent',
      step: 'try',
      failsafe: 'chunk_then_sum',
      generation: 'structured_output',
      timestamp: new Date(1_000_000).toISOString(),
    };
    const { label, likelyStalled } = buildProcessingStallLabel(lastLine, 1_000_000 + 30_000);
    expect(label).toBe(
      'During Discovery, agent Depository Search is Trying, by Structuring the Prompts · 30s since last update',
    );
    expect(likelyStalled).toBe(false);
  });

  it('matches the "During {Phase}, {Agent} Agent is {Step}, by {Thinkings} the {Failsafe}" template exactly (prepare_concise_context reads "Context")', () => {
    const lastLine = {
      phase: 'Setup',
      agent: 'DepositInputComprehensionAgent',
      step: 'plan',
      failsafe: 'prepare_concise_context',
      generation: 'judge',
      timestamp: new Date(0).toISOString(),
    };
    const { label } = buildProcessingStallLabel(lastLine, 21_000);
    expect(label).toBe(
      'During Setup, agent Input Comprehension is Planning, by Judging the Context · 21s since last update',
    );
  });

  it('degrades to just the Phase/Agent/Step clause when there is no Failsafe/Thinkings yet (e.g. a Tool-use context)', () => {
    const lastLine = {
      phase: 'Discovery',
      agent: 'DepositCodebaseComprehensionAgent',
      step: 'try',
      timestamp: new Date(0).toISOString(),
    };
    const { label } = buildProcessingStallLabel(lastLine, 5_000);
    expect(label).toBe('During Discovery, agent Codebase Comprehension is Trying · 5s since last update');
  });

  it('falls back to the bare "Processing" sentence when Phase/Agent/Step are not yet known', () => {
    const lastLine = { phase: 'Discovery', agent: 'DepositDepositorySearchAgent', timestamp: new Date(0).toISOString() };
    const { label } = buildProcessingStallLabel(lastLine, 5_000);
    expect(label).toBe('Processing · 5s since last update');
  });

  it('flags likelyStalled once elapsed time reaches the LLM call timeout default (90s)', () => {
    const lastLine = { phase: 'Discovery', agent: 'DepositDepositorySearchAgent', timestamp: new Date(0).toISOString() };
    const { likelyStalled, label } = buildProcessingStallLabel(lastLine, 90_000);
    expect(likelyStalled).toBe(true);
    expect(label).toContain('90s since last update');
  });

  it('is NOT stalled one second under the threshold (89s boundary)', () => {
    const lastLine = { phase: 'Discovery', agent: 'DepositDepositorySearchAgent', timestamp: new Date(0).toISOString() };
    const { likelyStalled, label } = buildProcessingStallLabel(lastLine, 89_000);
    expect(likelyStalled).toBe(false);
    expect(label).toContain('89s since last update');
  });

  it('clamps negative clock skew to 0s and never flags a stall', () => {
    // Last event timestamped AFTER the current tick (server/client clock skew).
    const lastLine = { phase: 'Discovery', agent: 'DepositDepositorySearchAgent', timestamp: new Date(60_000).toISOString() };
    const { likelyStalled, label } = buildProcessingStallLabel(lastLine, 0);
    expect(likelyStalled).toBe(false);
    expect(label).toContain('0s since last update');
  });

  it('handles a missing/invalid timestamp without throwing', () => {
    expect(buildProcessingStallLabel({ phase: 'Discovery', timestamp: undefined } as any, Date.now())).toEqual({
      label: 'Processing',
      likelyStalled: false,
    });
    expect(buildProcessingStallLabel({ phase: 'Discovery', timestamp: 'not-a-date' } as any, Date.now())).toEqual({
      label: 'Processing',
      likelyStalled: false,
    });
  });
});

describe('copyTextToClipboard — modern + insecure-context fallback', () => {
  const originalClipboard = (navigator as any).clipboard;
  const originalExec = (document as any).execCommand;
  afterEach(() => {
    Object.assign(navigator, { clipboard: originalClipboard });
    (document as any).execCommand = originalExec;
  });

  it('uses navigator.clipboard when available (secure context)', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const exec = jest.fn().mockReturnValue(true);
    (document as any).execCommand = exec;

    expect(await copyTextToClipboard('hello')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(exec).not.toHaveBeenCalled(); // no fallback needed
  });

  it('falls back to a textarea + execCommand when clipboard is unavailable', async () => {
    Object.assign(navigator, { clipboard: undefined });
    const exec = jest.fn().mockReturnValue(true);
    (document as any).execCommand = exec;

    expect(await copyTextToClipboard('hello')).toBe(true);
    expect(exec).toHaveBeenCalledWith('copy');
  });

  it('falls back when navigator.clipboard.writeText rejects (insecure http context)', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockRejectedValue(new Error('insecure')) },
    });
    const exec = jest.fn().mockReturnValue(true);
    (document as any).execCommand = exec;

    expect(await copyTextToClipboard('x')).toBe(true);
    expect(exec).toHaveBeenCalledWith('copy');
  });

  it('returns false when both paths fail', async () => {
    Object.assign(navigator, { clipboard: undefined });
    (document as any).execCommand = jest.fn().mockReturnValue(false);
    expect(await copyTextToClipboard('x')).toBe(false);
  });
});
