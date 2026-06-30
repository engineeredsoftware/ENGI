// FileDiffViewer pulls react-syntax-highlighter + lucide-react ESM that jest can't
// parse; mock it so the pipeline-execution-log module loads. (The full component is
// not rendered here — its auto-follow scroll effect loops in jsdom — so we unit-test
// the pure copy-text builder the "Copy raw logs" button uses.)
jest.mock('@/components/base/bitcode/execution/FileDiffViewer', () => ({
  __esModule: true,
  default: () => null,
}));

import { buildRawLogCopyText } from '@/components/base/bitcode/execution/pipeline-execution-log';

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
