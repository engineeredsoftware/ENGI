import {
  initializeProcessRoot,
  getProcessRootFields,
  getProcessRootExecution,
  endProcessRoot,
  prepareProcessRootForPrompt,
  serializeProcessRootFields,
  PROCESS_ROOT_EXECUTION_ID,
  PROCESS_NAMESPACE,
} from '../index';

describe('process-root Execution', () => {
  afterEach(() => {
    endProcessRoot();
  });

  it('stores process fields on an Execution, not a parallel Context bag', () => {
    const execution = initializeProcessRoot({
      repoOwner: 'org',
      repoName: 'repo',
      repoBranch: 'main',
      task: 'ship',
    });

    expect(execution.id).toBe(PROCESS_ROOT_EXECUTION_ID);
    expect(execution.get(PROCESS_NAMESPACE, 'repoOwner')).toBe('org');
    expect(getProcessRootFields().repoName).toBe('repo');
    expect(getProcessRootExecution().id).toBe(PROCESS_ROOT_EXECUTION_ID);

    const prompt = prepareProcessRootForPrompt();
    expect(prompt.branch).toBe('main');
    expect(prompt.task).toBe('ship');

    const serialized = serializeProcessRootFields();
    expect(serialized.repoOwner).toBe('org');
    expect(serialized.dataStream).toBeUndefined();
  });

  it('endProcessRoot clears registry entry', () => {
    initializeProcessRoot({ repoPath: '/tmp/x' });
    endProcessRoot();
    // ensure recreates empty
    expect(getProcessRootFields().repoPath).toBeUndefined();
  });
});
