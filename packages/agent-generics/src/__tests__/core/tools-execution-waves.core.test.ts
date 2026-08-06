// @ts-nocheck
/**
 * Core: factoryToolsExecution flat list ≡ sequential wave; toolPlan runs waves.
 */
import { Execution } from '@bitcode/execution-generics';
import {
  factoryToolsExecution,
  resolveToolWaves,
} from '../../generations/llm-bound-factories';

describe('factoryToolsExecution tool waves (core)', () => {
  function execWithTools(map: Record<string, { execute: jest.Mock }>) {
    const execution = new Execution('agent:test') as any;
    execution.tools = {
      getTool: jest.fn((key: string) => map[key]),
    };
    return execution;
  }

  it('resolveToolWaves: flat useTools becomes one sequential wave', () => {
    const waves = resolveToolWaves({
      useTools: [
        { name: 'a', input: { x: 1 } },
        { name: 'b', input: { y: 2 } },
      ],
    });
    expect(waves).toHaveLength(1);
    expect(waves[0].sequential?.map((t) => t.name)).toEqual(['a', 'b']);
  });

  it('resolveToolWaves: toolPlan wins over flat useTools', () => {
    const waves = resolveToolWaves({
      useTools: [{ name: 'ignored', input: {} }],
      toolPlan: [
        { sequential: [{ name: 'w1', input: {} }] },
        { parallel: [{ name: 'w2a', input: {} }, { name: 'w2b', input: {} }] },
      ],
    });
    expect(waves).toHaveLength(2);
    expect(waves[0].sequential?.[0].name).toBe('w1');
    expect(waves[1].parallel?.map((t) => t.name)).toEqual(['w2a', 'w2b']);
  });

  it('flat useTools runs tools in order (backward compatible)', async () => {
    const order: string[] = [];
    const a = {
      execute: jest.fn(async () => {
        order.push('a');
        return { from: 'a' };
      }),
    };
    const b = {
      execute: jest.fn(async () => {
        order.push('b');
        return { from: 'b' };
      }),
    };
    const execution = execWithTools({ a, b });
    const out = await factoryToolsExecution()(
      {
        output: {
          useTools: [
            { name: 'a', input: { n: 1 } },
            { name: 'b', input: { n: 2 } },
          ],
        },
      },
      execution,
    );
    expect(order).toEqual(['a', 'b']);
    expect(out.usedTools.map((u) => u.tool)).toEqual(['a', 'b']);
    expect(out.usedTools.every((u) => u.waveIndex === 0)).toBe(true);
  });

  it('toolPlan: wave2 runs after wave1 and sees prior results via accumulation', async () => {
    const order: string[] = [];
    const staticTool = {
      execute: jest.fn(async () => {
        order.push('static');
        return { functionCount: 12, signals: { 'function-count': 12 } };
      }),
    };
    const absoluteTool = {
      execute: jest.fn(async (input: any) => {
        order.push('absolute');
        // Wave2 may receive prior usedTools via host input merge; here we assert order.
        return {
          volume: 0.5,
          priorWaveSeen: Array.isArray(input?.priorUsedTools),
        };
      }),
    };
    const execution = execWithTools({
      'static-analysis': staticTool,
      'absolute-function-count': absoluteTool,
    });

    const out = await factoryToolsExecution()(
      {
        output: {
          toolPlan: [
            {
              label: 'static',
              sequential: [{ name: 'static-analysis', input: { paths: ['a.ts'] } }],
            },
            {
              label: 'absolutes',
              sequential: [
                {
                  name: 'absolute-function-count',
                  input: { priorUsedTools: true },
                },
              ],
            },
          ],
        },
      },
      execution,
    );

    expect(order).toEqual(['static', 'absolute']);
    expect(out.usedTools).toHaveLength(2);
    expect(out.usedTools[0]).toMatchObject({
      tool: 'static-analysis',
      waveIndex: 0,
      output: { functionCount: 12 },
    });
    expect(out.usedTools[1]).toMatchObject({
      tool: 'absolute-function-count',
      waveIndex: 1,
    });
    expect(staticTool.execute).toHaveBeenCalledTimes(1);
    expect(absoluteTool.execute).toHaveBeenCalledTimes(1);
  });

  it('toolPlan parallel wave runs concurrent tools', async () => {
    let concurrent = 0;
    let maxConcurrent = 0;
    const mk = (name: string) => ({
      execute: jest.fn(async () => {
        concurrent += 1;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise((r) => setTimeout(r, 20));
        concurrent -= 1;
        return { name };
      }),
    });
    const t1 = mk('t1');
    const t2 = mk('t2');
    const execution = execWithTools({ t1, t2 });
    const out = await factoryToolsExecution()(
      {
        output: {
          toolPlan: [{ parallel: [{ name: 't1', input: {} }, { name: 't2', input: {} }] }],
        },
      },
      execution,
    );
    expect(out.usedTools.map((u) => u.tool).sort()).toEqual(['t1', 't2']);
    expect(maxConcurrent).toBeGreaterThanOrEqual(2);
  });
});
