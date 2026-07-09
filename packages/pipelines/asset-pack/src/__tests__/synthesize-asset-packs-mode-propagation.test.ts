import { Execution } from '@bitcode/execution-generics';
import {
  storeSynthesizeAssetPacksMode,
  synthesizeAssetPacksModeFromExecution,
} from '../synthesize-asset-packs';

/**
 * QA F20 — deposit-mode propagation. `factorySDIVFExecutorPipeline` composes the
 * phases with `sequential`, which runs preprocess and every phase on ISOLATED
 * sibling child executions (`execution.child('seq-N')`). The mode must therefore
 * be stored on the SHARED parent so the phase children resolve it via the upward
 * walk; storing it on a sibling (the old behavior) leaves it unreachable and the
 * phases default to read, running the read-lens agents during a deposit run.
 */
describe('synthesize-asset-packs mode propagation (F20)', () => {
  it('resolves the mode on sibling phase children when stored on the shared parent', () => {
    const shared = new Execution('pipeline-root');
    storeSynthesizeAssetPacksMode(shared, 'deposit');

    // sequential() gives preprocess and each phase their own sibling child.
    const preprocessExec = shared.child('seq-0');
    const setupExec = shared.child('seq-1');
    const divExec = shared.child('seq-2');

    // Every phase child reaches the shared parent's mode via the upward walk.
    expect(synthesizeAssetPacksModeFromExecution(preprocessExec)).toBe('deposit');
    expect(synthesizeAssetPacksModeFromExecution(setupExec)).toBe('deposit');
    expect(synthesizeAssetPacksModeFromExecution(divExec)).toBe('deposit');
    // And deeper (the phase's own sequential children) still resolve it.
    expect(synthesizeAssetPacksModeFromExecution(divExec.child('seq-0'))).toBe('deposit');
  });

  it('does NOT leak the mode across siblings (reproduces the F20 bug)', () => {
    const shared = new Execution('pipeline-root');
    // The pre-fix behavior: preprocess stored the mode on its own sibling child.
    const preprocessExec = shared.child('seq-0');
    storeSynthesizeAssetPacksMode(preprocessExec, 'deposit');

    // A phase sibling cannot see a value stored on another sibling.
    const setupExec = shared.child('seq-1');
    expect(synthesizeAssetPacksModeFromExecution(setupExec)).toBeNull();
  });
});
