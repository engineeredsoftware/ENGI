// @ts-nocheck
/**
 * factorySDIVFPipelineFromExecutors semantics (V48 Gate 3).
 *
 * This is the SDIVF variant the SynthesizeAssetPacks pipeline actually runs
 * (packages/pipelines/asset-pack/src/index.ts) — NOT factorySDIVFPipeline,
 * which sdivf.events.integration.test.ts covers. Pins, with stub phase
 * executors on a plain Execution root:
 *
 *  - phase call order: preprocess → setup → (Discovery → Implementation →
 *    Validation) bounded by maxIterations → finish → postprocess;
 *  - the DIV loop honors maxIterations (never exceeds it);
 *  - the iterate-vs-complete gate: the loop exits EARLY once Validation
 *    signals ready-to-finish — via the threaded result (passed/ready/
 *    finalApproval), via the shared validation:passed store, via the
 *    cross-phase validation:readyToFinish artifact (finalApproval verdict on
 *    the ROOT, resolved through findUp), or via a cfg.readyToFinish override;
 *  - input threading: each phase receives the previous phase's return value;
 *  - sequential() topology: preprocess/setup/DIV/finish/postprocess each run on
 *    an ISOLATED seq-N sibling child (the F20 law the shared mode store depends
 *    on), and sibling stores are invisible to each other;
 *  - runObservedExecutorPhase observability: phase start/complete stores with
 *    iteration numbers, and failed-status summaries on error;
 *  - fail-closed propagation: a throwing mid-phase executor rejects the whole
 *    pipeline (no swallow, no hang, downstream phases never run).
 *
 * NOTE: the validation stubs here deliberately return a NON-passing result
 * (finalApproval/passed false), so the exact-iteration-count pins exercise the
 * bounded (max-iterations) side of the gate.
 */
import { factorySDIVFPipelineFromExecutors } from '@bitcode/generic-pipelines-sdivf';
import { Execution } from '../../../../execution-generics/src/Execution';

type Recorded = { calls: string[]; inputs: Record<string, any[]>; nodes: Record<string, string[]> };

function record(recorded: Recorded, phase: string, input: any, exec: any) {
  recorded.calls.push(phase);
  (recorded.inputs[phase] ??= []).push(input);
  (recorded.nodes[phase] ??= []).push(exec?.id ?? '(none)');
}

function buildConfig(recorded: Recorded, overrides: Record<string, any> = {}) {
  const phase = (name: string) => async (input: any, exec: any) => {
    record(recorded, name, input, exec);
    return { ...input, [name]: (input?.[name] ?? 0) + 1 };
  };
  return {
    preprocess: async (input: any, exec: any) => {
      record(recorded, 'preprocess', input, exec);
      return { ...input, preprocessed: true };
    },
    setup: phase('setup'),
    discovery: phase('discovery'),
    implementation: phase('implementation'),
    validation: async (input: any, exec: any) => {
      record(recorded, 'validation', input, exec);
      // Non-passing on purpose — see file header.
      return { ...input, validation: (input?.validation ?? 0) + 1, finalApproval: false, passed: false };
    },
    finish: phase('finish'),
    postprocess: async (output: any, exec: any) => {
      record(recorded, 'postprocess', output, exec);
      return { ...output, postprocessed: true };
    },
    ...overrides,
  };
}

describe('factorySDIVFPipelineFromExecutors (executor-variant SDIVF loop)', () => {
  it('runs preprocess → setup → (D→I→V) × maxIterations → finish → postprocess in order', async () => {
    const recorded: Recorded = { calls: [], inputs: {}, nodes: {} };
    const pipeline = factorySDIVFPipelineFromExecutors('sdivf-loop-order', {
      ...buildConfig(recorded),
      maxIterations: 2,
    });

    const output = await pipeline({ read: 'pin-order' }, new Execution('root-order'));

    expect(recorded.calls).toEqual([
      'preprocess',
      'setup',
      'discovery', 'implementation', 'validation',
      'discovery', 'implementation', 'validation',
      'finish',
      'postprocess',
    ]);
    // The loop honors maxIterations: each DIV phase ran exactly twice.
    expect(output.discovery).toBe(2);
    expect(output.implementation).toBe(2);
    expect(output.validation).toBe(2);
    expect(output.finish).toBe(1);
    expect(output.postprocessed).toBe(true);
  });

  it('never exceeds maxIterations (single-iteration loop)', async () => {
    const recorded: Recorded = { calls: [], inputs: {}, nodes: {} };
    const pipeline = factorySDIVFPipelineFromExecutors('sdivf-loop-single', {
      ...buildConfig(recorded),
      maxIterations: 1,
    });

    await pipeline({}, new Execution('root-single'));

    expect(recorded.calls.filter((c) => c === 'discovery')).toHaveLength(1);
    expect(recorded.calls.filter((c) => c === 'implementation')).toHaveLength(1);
    expect(recorded.calls.filter((c) => c === 'validation')).toHaveLength(1);
    expect(recorded.calls.filter((c) => c === 'finish')).toHaveLength(1);
  });

  it('exits the DIV loop early when the validation RESULT signals ready-to-finish', async () => {
    const recorded: Recorded = { calls: [], inputs: {}, nodes: {} };
    const pipeline = factorySDIVFPipelineFromExecutors('sdivf-gate-result', {
      ...buildConfig(recorded, {
        validation: async (input: any, exec: any) => {
          record(recorded, 'validation', input, exec);
          const iteration = (input?.validation ?? 0) + 1;
          // Passes on the SECOND iteration.
          return { ...input, validation: iteration, finalApproval: iteration >= 2 };
        },
      }),
      maxIterations: 5,
    });

    const output = await pipeline({}, new Execution('root-gate-result'));

    // Two iterations, not five: the gate stopped the loop as soon as
    // validation approved.
    expect(recorded.calls.filter((c) => c === 'discovery')).toHaveLength(2);
    expect(recorded.calls.filter((c) => c === 'validation')).toHaveLength(2);
    expect(recorded.calls.filter((c) => c === 'finish')).toHaveLength(1);
    expect(output.validation).toBe(2);
    expect(output.finalApproval).toBe(true);
  });

  it('exits the DIV loop early via the cross-phase validation:readyToFinish artifact on the ROOT', async () => {
    const recorded: Recorded = { calls: [], inputs: {}, nodes: {} };
    const root = new Execution('root-gate-artifact');
    const pipeline = factorySDIVFPipelineFromExecutors('sdivf-gate-artifact', {
      ...buildConfig(recorded, {
        validation: async (input: any, exec: any) => {
          record(recorded, 'validation', input, exec);
          // Model the AssetPack ReadyToFinish agent: it stores its verdict on
          // the SHARED root (cross-phase store-visibility law) and its return
          // does not carry passed/ready flags.
          exec.getRoot().store('validation', 'readyToFinish', {
            finalApproval: true,
            recommendation: 'finish',
          });
          return { ...input, validation: (input?.validation ?? 0) + 1 };
        },
      }),
      maxIterations: 4,
    });

    await pipeline({}, root);

    // One iteration: the gate resolved the root-stored verdict from the DIV
    // sibling via findUp.
    expect(recorded.calls.filter((c) => c === 'validation')).toHaveLength(1);
    expect(recorded.calls.filter((c) => c === 'finish')).toHaveLength(1);
  });

  it('honors a cfg.readyToFinish override as the gate', async () => {
    const recorded: Recorded = { calls: [], inputs: {}, nodes: {} };
    const gateCalls: any[] = [];
    const pipeline = factorySDIVFPipelineFromExecutors('sdivf-gate-override', {
      ...buildConfig(recorded),
      readyToFinish: async (result: any) => {
        gateCalls.push(result);
        // Finish after the second validation despite non-passing results.
        return (result?.validation ?? 0) >= 2;
      },
      maxIterations: 5,
    });

    await pipeline({}, new Execution('root-gate-override'));

    expect(recorded.calls.filter((c) => c === 'validation')).toHaveLength(2);
    expect(gateCalls).toHaveLength(2);
    // The override REPLACES the default signal check: the default's
    // result-flag path was not consulted (validation results carry
    // finalApproval:false and the loop still exited on the override).
    expect(gateCalls[1]).toMatchObject({ validation: 2, finalApproval: false });
  });

  it('records loop observability: per-iteration pass flags and the max-iterations marker', async () => {
    const recorded: Recorded = { calls: [], inputs: {}, nodes: {} };
    const root = new Execution('root-gate-observe');
    const pipeline = factorySDIVFPipelineFromExecutors('sdivf-gate-observe', {
      ...buildConfig(recorded),
      maxIterations: 2,
    });

    await pipeline({}, root);

    const divNode = root.children.get('root-gate-observe/seq-2');
    expect(divNode.get('iteration', '1')).toMatchObject({ passed: false });
    expect(divNode.get('iteration', '2')).toMatchObject({ passed: false });
    expect(divNode.get('pipeline', 'totalIterations')).toBe(2);
    expect(divNode.get('pipeline', 'validationPassed')).toBe(false);
    expect(divNode.get('pipeline', 'maxIterationsReached')).toBe(true);
  });

  it('threads each phase output into the next phase input', async () => {
    const recorded: Recorded = { calls: [], inputs: {}, nodes: {} };
    const pipeline = factorySDIVFPipelineFromExecutors('sdivf-threading', {
      ...buildConfig(recorded),
      maxIterations: 2,
    });

    await pipeline({ seed: true }, new Execution('root-threading'));

    // Setup received the preprocessed input.
    expect(recorded.inputs.setup[0]).toMatchObject({ seed: true, preprocessed: true });
    // Iteration 1 discovery received setup's output.
    expect(recorded.inputs.discovery[0]).toMatchObject({ setup: 1 });
    // Iteration 2 discovery received iteration 1's validation output (`current`
    // threads through the loop).
    expect(recorded.inputs.discovery[1]).toMatchObject({
      discovery: 1,
      implementation: 1,
      validation: 1,
      finalApproval: false,
    });
    // Finish received the final validation output.
    expect(recorded.inputs.finish[0]).toMatchObject({ validation: 2 });
    // Postprocess received finish's output.
    expect(recorded.inputs.postprocess[0]).toMatchObject({ finish: 1 });
  });

  it('runs iterationPreprocess before each Discovery and threads its return into the loop', async () => {
    const recorded: Recorded = { calls: [], inputs: {}, nodes: {} };
    const pipeline = factorySDIVFPipelineFromExecutors('sdivf-iterpre', {
      ...buildConfig(recorded),
      iterationPreprocess: async (input: any, exec: any) => {
        record(recorded, 'iterationPreprocess', input, exec);
        return { ...input, iterationPreprocessed: (input?.iterationPreprocessed ?? 0) + 1 };
      },
      maxIterations: 2,
    });

    await pipeline({}, new Execution('root-iterpre'));

    expect(recorded.calls).toEqual([
      'preprocess',
      'setup',
      'iterationPreprocess', 'discovery', 'implementation', 'validation',
      'iterationPreprocess', 'discovery', 'implementation', 'validation',
      'finish',
      'postprocess',
    ]);
    expect(recorded.inputs.discovery[0]).toMatchObject({ iterationPreprocessed: 1 });
    expect(recorded.inputs.discovery[1]).toMatchObject({ iterationPreprocessed: 2 });
  });

  it('gives each top-level element an isolated seq-N sibling child (F20 topology law)', async () => {
    const recorded: Recorded = { calls: [], inputs: {}, nodes: {} };
    const seen: Record<string, any> = {};
    const root = new Execution('root-topology');
    const pipeline = factorySDIVFPipelineFromExecutors('sdivf-topology', {
      ...buildConfig(recorded, {
        setup: async (input: any, exec: any) => {
          record(recorded, 'setup', input, exec);
          // Stored on the setup sibling — must NOT leak to the DIV sibling.
          exec.store('setup-only', 'marker', 'stored-on-seq-1');
          return { ...input, setup: 1 };
        },
        validation: async (input: any, exec: any) => {
          record(recorded, 'validation', input, exec);
          seen.markerFromDivGet = exec.get('setup-only', 'marker');
          seen.markerFromDivFindUp = exec.findUp('setup-only', 'marker');
          return { ...input, finalApproval: false, passed: false };
        },
      }),
      maxIterations: 1,
    });

    await pipeline({}, root);

    // preprocess=seq-0, setup=seq-1, DIV loop=seq-2, finish=seq-3, postprocess=seq-4.
    expect(recorded.nodes.preprocess[0]).toBe('root-topology/seq-0');
    expect(recorded.nodes.setup[0]).toBe('root-topology/seq-1');
    expect(recorded.nodes.discovery[0]).toBe('root-topology/seq-2');
    // Discovery/Implementation/Validation all run on the SAME seq-2 node.
    expect(recorded.nodes.implementation[0]).toBe('root-topology/seq-2');
    expect(recorded.nodes.validation[0]).toBe('root-topology/seq-2');
    expect(recorded.nodes.finish[0]).toBe('root-topology/seq-3');
    expect(recorded.nodes.postprocess[0]).toBe('root-topology/seq-4');

    // Siblings are isolated: neither node-local get nor the ancestors-only
    // findUp can see a value stored on another sibling. This is the law that
    // forces shared state (e.g. the synthesis mode) onto the PARENT execution.
    expect(seen.markerFromDivGet).toBeUndefined();
    expect(seen.markerFromDivFindUp).toBeUndefined();
  });

  it('stores phase start/complete observability with iteration numbers', async () => {
    const recorded: Recorded = { calls: [], inputs: {}, nodes: {} };
    const root = new Execution('root-observe');
    const pipeline = factorySDIVFPipelineFromExecutors('sdivf-observe', {
      ...buildConfig(recorded),
      maxIterations: 2,
    });

    await pipeline({}, root);

    const setupNode = root.children.get('root-observe/seq-1');
    expect(setupNode.get('phase', 'current')).toBe('setup');
    expect(setupNode.get('phase', 'start')).toMatchObject({ phase: 'setup', iteration: null });
    expect(setupNode.get('phase', 'complete')).toMatchObject({ phase: 'setup', status: 'completed' });

    // The DIV node's last writes are validation @ iteration maxIterations.
    const divNode = root.children.get('root-observe/seq-2');
    expect(divNode.get('phase', 'iteration')).toBe(2);
    expect(divNode.get('phase', 'complete')).toMatchObject({
      phase: 'validation',
      iteration: 2,
      status: 'completed',
    });

    const finishNode = root.children.get('root-observe/seq-3');
    expect(finishNode.get('phase', 'complete')).toMatchObject({ phase: 'finish', status: 'completed' });
  });

  it('fails closed: a throwing implementation rejects the pipeline and stops downstream phases', async () => {
    const recorded: Recorded = { calls: [], inputs: {}, nodes: {} };
    const root = new Execution('root-fail');
    const pipeline = factorySDIVFPipelineFromExecutors('sdivf-fail', {
      ...buildConfig(recorded, {
        implementation: async (input: any, exec: any) => {
          record(recorded, 'implementation', input, exec);
          throw new Error('implementation exploded');
        },
      }),
      maxIterations: 3,
    });

    await expect(pipeline({}, root)).rejects.toThrow('implementation exploded');

    // The failure terminates the run: no further validation, no more loop
    // iterations, no finish, no postprocess.
    expect(recorded.calls).toEqual(['preprocess', 'setup', 'discovery', 'implementation']);

    // And the failure is observable as a failed phase summary on the DIV node.
    const divNode = root.children.get('root-fail/seq-2');
    expect(divNode.get('phase', 'complete')).toMatchObject({
      phase: 'implementation',
      iteration: 1,
      status: 'failed',
      output: null,
      error: expect.objectContaining({ message: 'implementation exploded' }),
    });
  });

  it('fails closed on a throwing setup: the DIV loop and finish never start', async () => {
    const recorded: Recorded = { calls: [], inputs: {}, nodes: {} };
    const pipeline = factorySDIVFPipelineFromExecutors('sdivf-fail-setup', {
      ...buildConfig(recorded, {
        setup: async (input: any, exec: any) => {
          record(recorded, 'setup', input, exec);
          throw new Error('setup exploded');
        },
      }),
      maxIterations: 3,
    });

    await expect(pipeline({}, new Execution('root-fail-setup'))).rejects.toThrow('setup exploded');
    expect(recorded.calls).toEqual(['preprocess', 'setup']);
  });
});
