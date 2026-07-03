// @ts-nocheck
/**
 * ExecutionTool + AgentToolsRegistry contract (V48 Gate 3 — tools/executions).
 *
 * Pins:
 * - ExecutionTool.execute(): unbound tools delegate straight to use();
 *   bound tools create a `tool:<ClassName>` tracking child recording
 *   name/startTime/input then result/status/endTime, and error capture
 *   RETHROWS after recording status='failed'.
 * - AgentToolsRegistry: same-priority re-registration replaces, highest
 *   priority wins regardless of registration order, getTool binds the
 *   resolved tool to the registry's execution, hierarchical parent lookup,
 *   restrictTo denial, ensureTools reporting, fallback + getUsableTools
 *   child-override merging.
 */
import { Execution } from '@bitcode/execution-generics';
import { ExecutionTool, AgentToolsRegistry } from '../execution/AgentToolsRegistry';

class EchoTool extends ExecutionTool {
  use = jest.fn(async (args: any) => ({ echoed: args }));
}

class OtherEchoTool extends ExecutionTool {
  use = jest.fn(async (args: any) => ({ other: args }));
}

class FailingTool extends ExecutionTool {
  use = jest.fn(async () => {
    throw new Error('tool exploded');
  });
}

/** Locate the tracking child without pinning the children-map keying scheme. */
function findToolChild(execution: Execution, className: string): Execution | undefined {
  return Array.from(execution.children.values()).find((child) =>
    child.id.endsWith(`tool:${className}`),
  );
}

describe('ExecutionTool.execute — tracking child contract', () => {
  it('delegates straight to use() when the tool is not bound to an execution', async () => {
    const tool = new EchoTool();

    await expect(tool.execute({ q: 'unbound' })).resolves.toEqual({ echoed: { q: 'unbound' } });
    expect(tool.use).toHaveBeenCalledWith({ q: 'unbound' });
  });

  it('bindExecution returns the same instance (fluent binding)', () => {
    const tool = new EchoTool();
    const execution = new Execution('agent:bind');

    expect(tool.bindExecution(execution)).toBe(tool);
  });

  it('creates a tool:<ClassName> child recording input, result, success status and timings', async () => {
    const execution = new Execution('agent:success');
    const tool = new EchoTool().bindExecution(execution);

    const result = await tool.execute({ q: 'bound' });

    expect(result).toEqual({ echoed: { q: 'bound' } });
    const toolExec = findToolChild(execution, 'EchoTool');
    expect(toolExec).toBeDefined();
    expect(toolExec.get('tool', 'name')).toBe('EchoTool');
    expect(toolExec.get('tool', 'input')).toEqual([{ q: 'bound' }]);
    expect(toolExec.get('tool', 'result')).toEqual({ echoed: { q: 'bound' } });
    expect(toolExec.get('tool', 'status')).toBe('success');
    const startTime = toolExec.get('tool', 'startTime');
    const endTime = toolExec.get('tool', 'endTime');
    expect(typeof startTime).toBe('number');
    expect(typeof endTime).toBe('number');
    expect(endTime).toBeGreaterThanOrEqual(startTime);
    expect(toolExec.get('tool', 'error')).toBeUndefined();
  });

  it('records error + failed status on a throwing use() and RETHROWS', async () => {
    const execution = new Execution('agent:failure');
    const tool = new FailingTool().bindExecution(execution);

    await expect(tool.execute({ q: 'boom' })).rejects.toThrow('tool exploded');

    const toolExec = findToolChild(execution, 'FailingTool');
    expect(toolExec).toBeDefined();
    expect(toolExec.get('tool', 'error')).toBe('tool exploded');
    expect(toolExec.get('tool', 'status')).toBe('failed');
    expect(toolExec.get('tool', 'result')).toBeUndefined();
    expect(typeof toolExec.get('tool', 'endTime')).toBe('number');
  });
});

describe('AgentToolsRegistry — registration and priority', () => {
  it('re-registering the same key at the same priority replaces the tool', () => {
    const execution = new Execution('agent:replace');
    const registry = new AgentToolsRegistry(execution);
    const first = new EchoTool();
    const second = new OtherEchoTool();

    registry.registerTool('echo', first);
    registry.registerTool('echo', second);

    expect(registry.getTool('echo')).toBe(second);
  });

  it('the highest priority wins regardless of registration order', () => {
    const execution = new Execution('agent:priority');
    const registry = new AgentToolsRegistry(execution);
    const low = new EchoTool();
    const high = new OtherEchoTool();
    const anotherLow = new EchoTool();

    registry.registerTool('echo', low, 0);
    registry.registerTool('echo', high, 10);
    expect(registry.getTool('echo')).toBe(high);

    // A later lower-priority registration must not displace the winner.
    registry.registerTool('echo', anotherLow, 0);
    expect(registry.getTool('echo')).toBe(high);
  });

  it('registerToolClass instantiates the class and hasToolHere sees only this level', () => {
    const execution = new Execution('agent:class');
    const registry = new AgentToolsRegistry(execution);

    registry.registerToolClass('echo', EchoTool);

    expect(registry.getTool('echo')).toBeInstanceOf(EchoTool);
    expect(registry.hasToolHere('echo')).toBe(true);
    expect(registry.hasToolHere('missing')).toBe(false);
  });

  it('getTool binds the resolved tool to the registry execution (tracking child lands there)', async () => {
    const execution = new Execution('agent:binding');
    const registry = new AgentToolsRegistry(execution);
    registry.registerTool('echo', new EchoTool());

    const tool = registry.getTool('echo');
    await tool.execute({ via: 'registry' });

    const toolExec = findToolChild(execution, 'EchoTool');
    expect(toolExec).toBeDefined();
    expect(toolExec.get('tool', 'status')).toBe('success');
  });
});

describe('AgentToolsRegistry — hierarchical lookup', () => {
  function buildHierarchy() {
    const parent = new Execution('pipeline:parent') as any;
    parent.tools = new AgentToolsRegistry(parent);
    const parentTool = new EchoTool();
    parent.tools.registerTool('parent-tool', parentTool);

    const childExec = parent.child('agent:leaf') as any;
    const childRegistry = new AgentToolsRegistry(childExec);
    childExec.tools = childRegistry;
    return { parent, parentTool, childExec, childRegistry };
  }

  it('resolves a tool registered on a parent AgentToolsRegistry', () => {
    const { parentTool, childRegistry } = buildHierarchy();

    expect(childRegistry.getTool('parent-tool')).toBe(parentTool);
    expect(childRegistry.hasToolHere('parent-tool')).toBe(false);
  });

  it('restrictTo denies non-allowed keys (including parent fallback) while allowed keys resolve', () => {
    const { childRegistry, parentTool } = buildHierarchy();
    const allowed = new OtherEchoTool();
    childRegistry.registerTool('allowed-tool', allowed);

    childRegistry.restrictTo(['allowed-tool']);

    expect(childRegistry.getTool('parent-tool')).toBeUndefined();
    expect(childRegistry.getTool('allowed-tool')).toBe(allowed);

    // Restriction is scoped to this registry level: the parent's own registry
    // still resolves its tool.
    const { parent } = buildHierarchy();
    expect(parent.tools.getTool('parent-tool')).toBeInstanceOf(EchoTool);
    expect(parentTool).toBeInstanceOf(EchoTool);
  });

  it('ensureTools reports missing keys and optionally throws with the roster', () => {
    const { childRegistry } = buildHierarchy();

    expect(childRegistry.ensureTools(['parent-tool', 'ghost-a', 'ghost-b'])).toEqual([
      'ghost-a',
      'ghost-b',
    ]);
    expect(() =>
      childRegistry.ensureTools(['ghost-a'], { throw: true }),
    ).toThrow('Missing required tools: ghost-a');
    // All present: no report, no throw.
    expect(childRegistry.ensureTools(['parent-tool'], { throw: true })).toEqual([]);
  });

  it('getToolWithFallback returns the first resolvable key', () => {
    const { childRegistry, parentTool } = buildHierarchy();
    const local = new OtherEchoTool();
    childRegistry.registerTool('local-tool', local);

    expect(childRegistry.getToolWithFallback(['ghost', 'local-tool', 'parent-tool'])).toBe(local);
    expect(childRegistry.getToolWithFallback(['ghost', 'parent-tool'])).toBe(parentTool);
    expect(childRegistry.getToolWithFallback(['ghost-a', 'ghost-b'])).toBeUndefined();
  });

  it('getUsableTools merges the hierarchy with child registrations overriding parents', () => {
    const { childRegistry, parentTool } = buildHierarchy();
    const override = new OtherEchoTool();
    const childOnly = new OtherEchoTool();
    childRegistry.registerTool('parent-tool', override);
    childRegistry.registerTool('child-tool', childOnly);

    const usable = childRegistry.getUsableTools();

    expect(usable['parent-tool']).toBe(override);
    expect(usable['child-tool']).toBe(childOnly);
    expect(usable['parent-tool']).not.toBe(parentTool);
  });
});
