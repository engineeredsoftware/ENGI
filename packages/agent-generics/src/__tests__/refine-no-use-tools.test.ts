// @ts-nocheck
/**
 * Refine law: SO schema has no useTools; sanitize strips invented tools/pending.
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
  it('strips useTools and pending-tool status without path', () => {
    const out = sanitizeRefineStepOutput({
      success: true,
      workspacePath: null,
      status: 'pending-tool-execution',
      useTools: [{ name: 'cloneRepositoryTool', input: {} }],
    });
    expect(out.useTools).toBeUndefined();
    expect(out.success).toBe(false);
    expect(out.status).toBe('incomplete-no-tool-proof');
  });

  it('keeps success when path exists and drops useTools', () => {
    const out = sanitizeRefineStepOutput({
      success: true,
      workspacePath: '/tmp/real-clone',
      status: 'cloned',
      useTools: [{ name: 'x', input: {} }],
    });
    expect(out.useTools).toBeUndefined();
    expect(out.success).toBe(true);
    expect(out.workspacePath).toBe('/tmp/real-clone');
  });

  it('rewrites pending status when path already present', () => {
    const out = sanitizeRefineStepOutput({
      success: true,
      workspacePath: '/tmp/real',
      status: 'clone_scheduled',
    });
    expect(out.status).toBe('cloned');
    expect(out.success).toBe(true);
  });
});
