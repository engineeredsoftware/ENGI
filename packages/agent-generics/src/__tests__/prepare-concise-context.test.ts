// @ts-nocheck
import { Execution } from '@bitcode/execution-generics';
import { factoryPrepareConciseContext } from '../substeps/factories';

describe('PrepareConciseContext synthesizes full context from root', () => {
  it('includes repository/read/config/attachments/evidence_documents and pipeline/input', async () => {
    const root = new Execution('root');
    // Seed root namespaces
    root.store('repository', 'owner', 'acme');
    root.store('repository', 'name', 'repo');
    root.store('read', 'description', 'Do something great');
    root.store('config', 'iterationCount', 3);
    root.store('attachments', 'list', [{ title: 'Spec', content: 'Design spec' }]);
    root.store('evidence_documents', 'list', [{ title: 'KE', content: '# Knowledge Extension' }]);
    root.store('pipeline', 'input', { definitionOfRead: 'Do something great' });

    // Create a nested execution to simulate deep substep call
    const nested = root.child('phase:discovery').child('agent:analyze').child('step:plan');

    // Minimal pass-through generation child (no LLM)
    const passthrough = async (input: any) => input;
    const pcc = factoryPrepareConciseContext([passthrough]);
    const out = await pcc({ foo: 'bar' }, nested);

    expect(out.preparedContexts).toBeDefined();
    expect(out.preparedContexts.length).toBeGreaterThan(0);
    const ctx = out.preparedContexts[0]?.context;
    expect(ctx.repository?.owner).toBe('acme');
    expect(ctx.repository?.name).toBe('repo');
    expect(ctx.read?.description).toBe('Do something great');
    expect(ctx.config?.iterationCount).toBe(3);
    expect(Array.isArray(ctx.attachments)).toBe(true);
    expect(Array.isArray(ctx.evidence_documents)).toBe(true);
  });
});

describe('PrepareConciseContext threading and stores', () => {
  const collectNodes = (node: any, out: any[] = []): any[] => {
    out.push(node);
    for (const child of node?.children?.values?.() || []) collectNodes(child, out);
    return out;
  };

  it('passes the raw agent input to generations unchanged and appends preparedContexts to their result', async () => {
    const root = new Execution('root');
    root.store('read', 'description', 'Do something great');
    const nested = root.child('phase:discovery').child('agent:analyze').child('step:plan');

    const seen: any[] = [];
    const gen = async (input: any) => {
      seen.push(input);
      return { ...input, reasoned: true };
    };

    const agentInput = { foo: 'bar', nested: { deep: 1 } };
    const out = await factoryPrepareConciseContext([gen])(agentInput, nested);

    // The generation receives the agent's own structured input as-is.
    expect(seen).toHaveLength(1);
    expect(seen[0]).toEqual({ foo: 'bar', nested: { deep: 1 } });

    // Input keys and the generation's contribution both survive; the
    // prepared contexts are appended on top of the gen result.
    expect(out.foo).toBe('bar');
    expect(out.nested).toEqual({ deep: 1 });
    expect(out.reasoned).toBe(true);
    expect(out.preparedContexts).toHaveLength(1);
    expect(out.preparedContexts[0].metadata.chunkId).toBe('1');
    expect(out.preparedContexts[0].context.read?.description).toBe('Do something great');
  });

  it("stores context:'full' and context:'selectors' on the failsafe execution", async () => {
    const root = new Execution('root');
    root.store('repository', 'owner', 'acme');
    root.store('read', 'description', 'Do something great');
    const nested = root.child('phase:discovery').child('agent:analyze').child('step:plan');

    const passthrough = async (input: any) => input;
    await factoryPrepareConciseContext([passthrough])({}, nested);

    const nodes = collectNodes(root);
    const failsafeNode = nodes.find(n => String(n.id).includes('failsafe:prepare_concise_context'));
    expect(failsafeNode).toBeDefined();

    const full = failsafeNode.get('context', 'full');
    expect(full.repository?.owner).toBe('acme');
    expect(full.read?.description).toBe('Do something great');

    const selectors = failsafeNode.get('context', 'selectors');
    expect(Array.isArray(selectors)).toBe(true);
    const selectorKeys = selectors.map((s: any) => `${s.namespace}:${s.key}`);
    expect(selectorKeys).toContain('repository:owner');
    expect(selectorKeys).toContain('read:description');
  });
});
