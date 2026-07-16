// @ts-nocheck
/**
 * Pins for the PrepareConciseContext SELECTION contract (the context failsafe):
 * - PCC's inference is a SELECTION Thinkings against the key-selection schema
 *   with the keys-only input shape { preparation, system, pipeline_execution_keys }
 * - VALUES from the execution state NEVER enter the selection prompt
 * - READ-IN: the values of exactly the selected keys are read from the
 *   execution state and returned as selectedContext (+ the original input)
 * - selected-key misses resolve to omitted (fail-soft) and are recorded
 * - telemetry: ptrr:failsafe = prepare_concise_context on the failsafe node,
 *   and the selection generations run beneath it (findUp labels them PCC)
 */
import { z } from 'zod';
import { Execution } from '@bitcode/execution-generics';
import { StepExecution } from '../execution';
import { factoryPrepareConciseContext, PCC_KEY_SELECTION_SCHEMA } from '../generations/llm-bound-factories';

const collectNodes = (node: any, out: any[] = []): any[] => {
  out.push(node);
  for (const child of node?.children?.values?.() || []) collectNodes(child, out);
  return out;
};

function seedRoot(): any {
  const root = new Execution('pipeline-root') as any;
  root.store('repository', 'owner', 'acme');
  root.store('repository', 'name', 'repo');
  root.store('read', 'description', 'Do something great');
  root.store('config', 'iterationCount', 3);
  return root;
}

describe('PrepareConciseContext selection input (keys only)', () => {
  it('runs the selection generation with { preparation, system, pipeline_execution_keys }', async () => {
    const root = seedRoot();
    const nested = root.child('phase:discovery').child('agent:analyze').child('step:plan');

    const seen: any[] = [];
    const selection = async (input: any) => {
      seen.push(input);
      return { ...input, output: { selectedKeys: [] } };
    };

    await factoryPrepareConciseContext(selection)({ foo: 'bar' }, nested);

    expect(seen).toHaveLength(1);
    expect(Object.keys(seen[0]).sort()).toEqual(['pipeline_execution_keys', 'preparation', 'system']);
    expect(typeof seen[0].preparation).toBe('string');
    expect(typeof seen[0].system).toBe('string');
    // PCC's own instructions ask for key SELECTION, not the task.
    expect(seen[0].system).toContain('selectedKeys');

    // The keys tree names namespaces and key names of the FULL root state.
    const keys = seen[0].pipeline_execution_keys;
    expect(keys.repository).toEqual(['owner', 'name']);
    expect(keys.read).toEqual(['description']);
    expect(keys.config).toEqual(['iterationCount']);
  });

  it('NEVER includes execution-state values in the selection input', async () => {
    const root = seedRoot();
    root.store('source', 'blob', 'SECRET-SOURCE-VALUE');
    const nested = root.child('phase:discovery').child('agent:analyze').child('step:plan');

    const seen: any[] = [];
    const selection = async (input: any) => {
      seen.push(input);
      return { output: { selectedKeys: [] } };
    };

    await factoryPrepareConciseContext(selection)({ foo: 'bar' }, nested);

    const serialized = JSON.stringify(seen[0]);
    expect(serialized).not.toContain('SECRET-SOURCE-VALUE');
    expect(serialized).not.toContain('acme');
    expect(serialized).not.toContain('Do something great');
    // Keys (not values) are visible.
    expect(serialized).toContain('blob');
    expect(serialized).toContain('description');
  });

  it('the selection generation runs against the key-selection schema, not the step schema', () => {
    expect(() => PCC_KEY_SELECTION_SCHEMA.parse({ selectedKeys: ['a#b:c'] })).not.toThrow();
    expect(() => PCC_KEY_SELECTION_SCHEMA.parse({ title: 'task attempt' })).toThrow();
  });
});

describe('PrepareConciseContext read-in and fail-soft misses', () => {
  it('reads the VALUES of exactly the selected keys and appends them to the input', async () => {
    const root = seedRoot();
    const nested = root.child('phase:discovery').child('agent:analyze').child('step:plan');

    const selection = async () => ({
      output: {
        selectedKeys: [
          'pipeline-root#repository:owner',
          'pipeline-root#read:description',
        ],
      },
    });

    const out = await factoryPrepareConciseContext(selection)({ foo: 'bar' }, nested);

    // Original task input survives untouched.
    expect(out.foo).toBe('bar');
    expect(out.selectedKeys).toEqual([
      'pipeline-root#repository:owner',
      'pipeline-root#read:description',
    ]);
    expect(out.selectedContext).toEqual({
      'pipeline-root#repository:owner': 'acme',
      'pipeline-root#read:description': 'Do something great',
    });
  });

  it('omits selected-key misses (fail-soft) and records them on the failsafe node', async () => {
    const root = seedRoot();
    const nested = root.child('phase:discovery').child('agent:analyze').child('step:plan');

    const selection = async () => ({
      output: {
        selectedKeys: [
          'pipeline-root#repository:owner',
          'pipeline-root#absent-namespace:nope',
          'not-even-a-path',
        ],
      },
    });

    const out = await factoryPrepareConciseContext(selection)({}, nested);

    expect(out.selectedKeys).toEqual(['pipeline-root#repository:owner']);
    expect(Object.keys(out.selectedContext)).toEqual(['pipeline-root#repository:owner']);

    const nodes = collectNodes(root);
    const failsafeNode = nodes.find(n => String(n.id).includes('failsafe:prepare_concise_context'));
    expect(failsafeNode.get('context', 'missingKeys')).toEqual([
      'pipeline-root#absent-namespace:nope',
      'not-even-a-path',
    ]);
  });

  it('a selection that yields no usable keys returns an empty selectedContext', async () => {
    const root = seedRoot();
    const nested = root.child('phase:discovery').child('agent:analyze').child('step:plan');

    const selection = async () => ({ output: { selectedKeys: 'not-an-array' } });
    const out = await factoryPrepareConciseContext(selection)({ foo: 'bar' }, nested);

    expect(out.foo).toBe('bar');
    expect(out.selectedKeys).toEqual([]);
    expect(out.selectedContext).toEqual({});
  });
});

describe('PrepareConciseContext stores and telemetry labels', () => {
  it("stores context:'keys' (keys only) and context:'selectedKeys' on the failsafe execution", async () => {
    const root = seedRoot();
    const nested = root.child('phase:discovery').child('agent:analyze').child('step:plan');

    const selection = async () => ({ output: { selectedKeys: ['pipeline-root#repository:owner'] } });
    await factoryPrepareConciseContext(selection)({}, nested);

    const nodes = collectNodes(root);
    const failsafeNode = nodes.find(n => String(n.id).includes('failsafe:prepare_concise_context'));
    expect(failsafeNode).toBeDefined();
    expect(failsafeNode.get('ptrr', 'failsafe')).toBe('prepare_concise_context');

    const keys = failsafeNode.get('context', 'keys');
    expect(keys.repository).toEqual(['owner', 'name']);
    expect(JSON.stringify(keys)).not.toContain('acme');

    expect(failsafeNode.get('context', 'selectedKeys')).toEqual(['pipeline-root#repository:owner']);
    expect(failsafeNode.get('context', 'selectedContext')).toEqual({
      'pipeline-root#repository:owner': 'acme',
    });
  });

  it('the DEFAULT selection Thinkings runs under the PCC failsafe (labels + keys-only prompts)', async () => {
    const userPrompts: string[] = [];
    const llm = async (llmInput: any) => {
      const user = (llmInput.messages || []).find((m: any) => m.role === 'user')?.content ?? '';
      userPrompts.push(user);
      let payload: any = { analysis: 'a', reasoningItems: ['s'], conclusion: 'c', confidence: 0.9 };
      if (user.includes('Generate structured output for:')) {
        payload = { selectedKeys: ['agent-root#read:description'] };
      } else if (user.includes('Evaluate the quality and correctness of:') || user.includes('Judge the quality')) {
        payload = { quality: 0.9, issues: [], suggestions: [], approved: true };
      }
      return {
        content: JSON.stringify(payload),
        usage: { totalTokens: 5 },
        metadata: { provider: 'test', model: 'test-model' },
      };
    };

    const root = new Execution('agent-root') as any;
    root.llms = { getDefaultLLM: () => llm, getDefaultConfig: () => ({ maxTokens: 4000 }) };
    root.tools = { getTool: () => undefined };
    root.agents = {};
    root.store('read', 'description', 'SECRET-TASK-VALUE');
    const step = new StepExecution('plan', root);

    const out = await factoryPrepareConciseContext()({ read: 'task' }, step);

    // Three selection generations (Reason -> Judge -> StructuredOutput).
    expect(userPrompts).toHaveLength(3);
    // Keys-only law on the wire: no stored value in any selection prompt.
    for (const prompt of userPrompts) {
      expect(prompt).toContain('pipeline_execution_keys');
      expect(prompt).not.toContain('SECRET-TASK-VALUE');
    }

    // The selected key's VALUE is read in AFTER selection.
    expect(out.selectedContext).toEqual({ 'agent-root#read:description': 'SECRET-TASK-VALUE' });

    // Every selection generation node labels as PCC via findUp.
    const nodes = collectNodes(root);
    const generationNodes = nodes.filter(n => n?.get?.('ptrr', 'generation'));
    expect(generationNodes.length).toBe(3);
    for (const node of generationNodes) {
      expect(node.findUp('ptrr', 'failsafe')).toBe('prepare_concise_context');
    }
  }, 20000);
});
