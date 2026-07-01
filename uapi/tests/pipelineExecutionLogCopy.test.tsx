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
        protectedIpExclusions: 'secret/',
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
      'During Discovery, Deposit Depository Search Agent is Trying, by Structuring the Chunk Then Sum · 30s since last update',
    );
    expect(likelyStalled).toBe(false);
  });

  it('matches the "During {Phase}, {Agent} Agent is {Step}, by {Thricified} the {Failsafe}" template exactly', () => {
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
      'During Setup, Deposit Input Comprehension Agent is Planning, by Judging the Prepare Concise Context · 21s since last update',
    );
  });

  it('degrades to just the Phase/Agent/Step clause when there is no Failsafe/Thricified yet (e.g. a Tool-use context)', () => {
    const lastLine = {
      phase: 'Discovery',
      agent: 'DepositCodebaseComprehensionAgent',
      step: 'try',
      timestamp: new Date(0).toISOString(),
    };
    const { label } = buildProcessingStallLabel(lastLine, 5_000);
    expect(label).toBe('During Discovery, Deposit Codebase Comprehension Agent is Trying · 5s since last update');
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
