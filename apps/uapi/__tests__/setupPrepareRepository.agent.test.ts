import { jest } from '@jest/globals';

import { initializeProcessRoot } from '@bitcode/generic-executions';
import { executeAgentSteps } from '@bitcode/steps/runner';
import { resolveTool } from '@bitcode/generic-tools-registry';
import { AssetPackCloneVCSRepositoryAgent as AGENT } from '@bitcode/asset-packs-pipelines-domain';


// ---------------------------------------------------------------------------
// Helper: create minimal valid response from Zod schema
// ---------------------------------------------------------------------------
import { z } from 'zod';

function createDefault(schema: z.ZodType<any>): any {
  try {
    return schema.parse({ success: true });
  } catch {
    // Try empty object merge success
    const parsed: any = schema.parse({});
    parsed.success = true;
    return parsed;
  }
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@bitcode/steps/sub', () => {
  const actual = jest.requireActual('@bitcode/steps/sub');
  return {
    ...actual,
    structuredLLMCall: jest.fn(async (_msgs: any, cfg: { schema: z.ZodType<any> }) => {
      return createDefault(cfg.schema);
    }),
  };
});

jest.mock('@bitcode/generic-tools-registry', () => {
  const actual = jest.requireActual('@bitcode/generic-tools-registry');
  return {
    ...actual,
    resolveTool: jest.fn((name: string) => {
      if (name === 'asset-pack-clone-vcs-repository-tool') {
        return jest.fn().mockResolvedValue({ path: '/tmp/repo', files: ['index.ts'] });
      }
      return jest.fn().mockResolvedValue({ ok: true });
    }),
  };
});


describe('AssetPack Clone VCS Repository Agent', () => {
  beforeAll(async () => {
    initializeProcessRoot({
      installationId: 1,
      repoName: 'testrepo',
      repoOwner: 'owner',
      repoBranch: 'main',
      repoCommit: 'HEAD',
      read: 'Clone repo',
    });
  });

  it('executes cloneRepository via runner', async () => {
    await executeAgentSteps(AGENT, { phase: 'setup' });

    const mockResolve = resolveTool as jest.Mock;
    expect(mockResolve).toHaveBeenCalledWith('asset-pack-clone-vcs-repository-tool');
  });
});
