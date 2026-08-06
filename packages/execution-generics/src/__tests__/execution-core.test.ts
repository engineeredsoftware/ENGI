// @ts-nocheck
/**
 * Execution core semantics (V48 Gate 3 — tools/executions domain).
 *
 * Pins the load-bearing contracts every layer above (agents, phases,
 * pipelines, streaming) relies on:
 * - namespaced ephemeral store/get round-trips (+ fire-and-forget streaming
 *   emission that never throws when no streamer is registered)
 * - tree identity: parent refs, getRoot from arbitrarily deep children
 *   (streaming identity — onStore resolves the run-root streamer), getPath
 * - findUp shared-parent visibility
 * - sequential executor: result piping through isolated seq-N sibling
 *   children that still see shared parent data via findUp
 */
import { Execution, createExecution, sequential } from '../index';

describe('Execution — namespaced ephemeral storage', () => {
  it('round-trips store/get within a namespace and isolates namespaces', () => {
    const exec = createExecution('run:store');

    exec.store('agent', 'plan', { steps: ['a', 'b'] });
    exec.store('tools', 'invocation', { tool: 'search' });

    expect(exec.get('agent', 'plan')).toEqual({ steps: ['a', 'b'] });
    expect(exec.get('tools', 'invocation')).toEqual({ tool: 'search' });
    // Same key under a different namespace is a different slot.
    expect(exec.get('tools', 'plan')).toBeUndefined();
    expect(exec.get('agent', 'missing')).toBeUndefined();
  });

  it('getAll/hasNamespace/getNamespaces reflect exactly what was stored', () => {
    const exec = createExecution('run:namespaces');

    exec.store('llm', 'status', 'success');
    exec.store('llm', 'duration', 42);

    const all = exec.getAll('llm');
    expect(all).toBeInstanceOf(Map);
    expect(Array.from(all.keys()).sort()).toEqual(['duration', 'status']);
    expect(exec.hasNamespace('llm')).toBe(true);
    expect(exec.hasNamespace('phase')).toBe(false);
    expect(exec.getNamespaces()).toEqual(['llm']);
    expect(exec.getAll('phase')).toBeUndefined();
  });

  it('ephemeral store is fire-and-forget: it never throws when no streamer is registered', async () => {
    const exec = createExecution('run:no-streamer');

    expect(() => exec.store('phase', 'start', { phase: 'setup' })).not.toThrow();
    // Let the deferred stream-adapter import/emission settle; nothing may leak
    // out as an unhandled rejection and the value must still be readable.
    await new Promise((r) => setTimeout(r, 10));
    expect(exec.get('phase', 'start')).toEqual({ phase: 'setup' });
  });
});

describe('Execution — tree identity', () => {
  it('child() creates a node registered on the parent with a back-reference', () => {
    const root = createExecution('run:tree');
    const child = root.child('phase:setup');

    expect(child.parent).toBe(root);
    expect(Array.from(root.children.values())).toContain(child);
  });

  it('getRoot() from an arbitrarily deep child returns the run root (streaming identity)', () => {
    const root = createExecution('run:root-identity');
    const deep = root.child('phase:discovery').child('agent:search').child('step:try');

    expect(deep.getRoot()).toBe(root);
    expect(deep.getRoot().id).toBe('run:root-identity');
  });

  it('getPath() yields one short segment per tree level', () => {
    const root = createExecution('run:path');
    const deep = root.child('phase:setup').child('agent:clone');

    expect(root.getPath()).toEqual(['run:path']);
    expect(deep.getPath()).toEqual(['run:path', 'phase:setup', 'agent:clone']);
  });

  it('findUp() resolves data stored on an ancestor and misses cleanly otherwise', () => {
    const root = createExecution('run:findup');
    root.store('execution', 'correlationId', 'run:findup');
    const deep = root.child('phase:finish').child('agent:upload');

    expect(deep.findUp('execution', 'correlationId')).toBe('run:findup');
    expect(deep.findUp('execution', 'missing')).toBeUndefined();
    // Data on a child is NOT visible from the parent (findUp only walks up).
    deep.store('agent', 'result', { ok: true });
    expect(root.findUp('agent', 'result')).toBeUndefined();
  });
});

describe('sequential executor — seq-N sibling isolation', () => {
  it('pipes each result into the next executor and returns the final output', async () => {
    const root = createExecution('run:seq-pipe');

    const result = await sequential(
      async (input) => input + 1,
      async (input) => input * 2,
      async (input) => `value:${input}`,
    )(3, root);

    expect(result).toBe('value:8');
  });

  it('runs every step on an isolated seq-i child of the given execution', async () => {
    const root = createExecution('run:seq-isolation');
    root.store('execution', 'correlationId', 'run:seq-isolation');
    const seen: Execution[] = [];

    await sequential(
      async (input, exec) => {
        seen.push(exec);
        exec.store('step', 'note', 'from-seq-0');
        return input;
      },
      async (input, exec) => {
        seen.push(exec);
        return input;
      },
    )('go', root);

    expect(seen).toHaveLength(2);
    const [seq0, seq1] = seen;
    expect(seq0).not.toBe(seq1);
    expect(seq0.getPath()).toEqual(['run:seq-isolation', 'seq-0']);
    expect(seq1.getPath()).toEqual(['run:seq-isolation', 'seq-1']);
    // Both are direct children of the execution the combinator ran on.
    expect(seq0.parent).toBe(root);
    expect(seq1.parent).toBe(root);

    // Sibling isolation: seq-1 cannot read seq-0's stores...
    expect(seq1.get('step', 'note')).toBeUndefined();
    expect(seq1.findUp('step', 'note')).toBeUndefined();
    // ...but both siblings see shared data on the parent via findUp.
    expect(seq0.findUp('execution', 'correlationId')).toBe('run:seq-isolation');
    expect(seq1.findUp('execution', 'correlationId')).toBe('run:seq-isolation');
    // And both resolve the same run root (streaming identity).
    expect(seq1.getRoot()).toBe(root);
  });
});
