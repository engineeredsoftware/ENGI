import { initializeProcessRoot } from '@bitcode/generic-executions';
import { executeAgentSteps } from '@bitcode/steps/runner';
import * as sub from '@bitcode/steps/sub';
import { resolveTool } from '@bitcode/generic-tools-registry';
import { jest } from '@jest/globals';
import { z } from 'zod';

// Generic helper ------------------------------------------------------

export function registerGenericMocks() {
  // Mock LLM structured call to always return minimal schema object
  jest.spyOn(sub, 'structuredLLMCall').mockImplementation(
    async (_msgs: any, { schema }: { schema: z.ZodType }) => schema.parse({ success: true })
  );

  // Spy on tool resolution – return dummy fn that resolves instantly
  const dummy = jest.fn().mockResolvedValue({ ok: true });
  jest.spyOn(require('@bitcode/generic-tools-registry'), 'resolveTool').mockImplementation((_name: string) => dummy);

  return { dummy };
}

export async function initContextOnce() {
  initializeProcessRoot({
    connectionId: 1,
    repoOwner: 'owner',
    repoName: 'repo',
    repoBranch: 'main',
    repoCommit: 'HEAD',
    task: 'dummy task',
  });
}

/**
 * Generates a Jest test case for a single agent.
 */
export function testAgent(agent: any, phase: string, tools: string[]) {
  describe(agent.name || 'agent', () => {
    const { dummy } = registerGenericMocks();

    beforeAll(initContextOnce);

    it('runner resolves expected tools', async () => {
      await executeAgentSteps(agent, { phase });

      const resolveMock = resolveTool as jest.Mock;
      tools.forEach((t) => expect(resolveMock).toHaveBeenCalledWith(t));
      if (tools.length) {
        expect(dummy).toHaveBeenCalled();
      }
    });
  });
}
