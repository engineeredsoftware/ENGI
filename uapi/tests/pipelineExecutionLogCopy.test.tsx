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
