// @ts-nocheck
/**
 * Refine law: SO schema has no useTools; sanitize strips useTools only.
 */
import { z } from 'zod';
import {
  omitUseToolsFromSchema,
  sanitizeRefineStepOutput,
} from '../steps/step-schemas';

const AgentWithTools = z
  .object({
    success: z.boolean(),
    workspacePath: z.string().nullish(),
    status: z.string().optional(),
    useTools: z
      .array(z.object({ name: z.string(), input: z.any(), reason: z.string().optional() }))
      .optional(),
  })
  .describe(
    '{ "success": boolean, "workspacePath"?: string | null, "status"?: string, "useTools"?: [{ "name": string, "input": any }] }',
  );

describe('omitUseToolsFromSchema', () => {
  it('identity when schema has no useTools', () => {
    const base = z.object({ a: z.string() });
    expect(omitUseToolsFromSchema(base)).toBe(base);
  });

  it('removes useTools from shape and describe hint', () => {
    const refined = omitUseToolsFromSchema(AgentWithTools);
    expect(refined).not.toBe(AgentWithTools);
    const shape =
      typeof (refined as any)._def?.shape === 'function'
        ? (refined as any)._def.shape()
        : (refined as any).shape;
    expect(shape.useTools).toBeUndefined();
    expect(shape.success).toBeDefined();
    expect(String((refined as any).description || '')).not.toMatch(/useTools/);
  });
});

describe('sanitizeRefineStepOutput', () => {
  it('strips useTools and leaves domain fields unchanged', () => {
    const out = sanitizeRefineStepOutput({
      success: true,
      workspacePath: '/tmp/real-clone',
      status: 'cloned',
      useTools: [{ name: 'asset-pack-clone-vcs-repository-tool', input: {} }],
    });
    expect(out.useTools).toBeUndefined();
    expect(out.success).toBe(true);
    expect(out.workspacePath).toBe('/tmp/real-clone');
    expect(out.status).toBe('cloned');
  });

  it('identity when useTools absent', () => {
    const input = { success: false, workspacePath: null, status: 'failed' };
    expect(sanitizeRefineStepOutput(input)).toBe(input);
  });
});
