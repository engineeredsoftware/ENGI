/**
 * @jest-environment node
 */
import {
  provisionDepositSourceInventory,
  resolveDepositPipelineHost,
  runDepositInBoxHarness,
  selectDepositHostKind,
} from '@/lib/deposit-source-provisioning';
import type { BitcodeHostWorkspace, BitcodePipelineHost } from '@bitcode/pipeline-hosts';

const FILES: Record<string, string> = {
  'README.md': '# Demo project',
  'src/app.ts': 'export function main() {}\nexport interface Config { port: number }',
  'src/util.ts': 'export const helper = () => 42',
  'deep/nested/thing/buried.ts': 'export const buried = true',
};

function fakeHost(): { host: BitcodePipelineHost; isDisposed: () => boolean; source: any } {
  let disposed = false;
  let source: any = null;
  const workspace: BitcodeHostWorkspace = {
    workspacePath: '/tmp/ws',
    listFiles: async () => Object.keys(FILES),
    readFile: async (p) => (p in FILES ? FILES[p] : null),
    runCommand: async () => ({ exitCode: 0, stdout: '', stderr: '' }),
    dispose: async () => {
      disposed = true;
    },
  };
  const host: BitcodePipelineHost = {
    capabilities: {
      hostKind: 'inline',
      clone: true,
      filesystem: true,
      exec: true,
      ephemeralFilesystem: true,
      defaultWorkingDirectory: '/tmp',
    },
    provisionRepository: async (s) => {
      source = s;
      return workspace;
    },
  };
  return { host, isDisposed: () => disposed, source: () => source };
}

describe('provisionDepositSourceInventory', () => {
  it('provisions, reads the FULL source, derives bounded samples, and disposes', async () => {
    const { host, isDisposed, source } = fakeHost();
    const inventory = await provisionDepositSourceInventory({
      host,
      repositoryFullName: 'o/r',
      url: 'https://github.com/o/r.git',
      revision: 'abc123',
      token: 'ghs_tok',
    });

    // The host was asked to provision the revision with credentials.
    expect((source as any)()).toMatchObject({
      repositoryFullName: 'o/r',
      url: 'https://github.com/o/r.git',
      revision: 'abc123',
      password: 'ghs_tok',
    });

    // sources = every tracked file, verbatim.
    expect(inventory.sources).toHaveLength(4);
    expect(inventory.sources.find((f) => f.path === 'src/app.ts')?.content).toBe(FILES['src/app.ts']);
    expect(inventory.paths.sort()).toEqual(Object.keys(FILES).sort());

    // samples = bounded prompt excerpts: README + shallow source; the deeply-nested
    // file is excluded from samples (but present in full sources).
    const samplePaths = inventory.samples.map((s) => s.path);
    expect(samplePaths).toContain('README.md');
    expect(samplePaths).toContain('src/app.ts');
    expect(samplePaths).not.toContain('deep/nested/thing/buried.ts');

    // The workspace is disposed after reading.
    expect(isDisposed()).toBe(true);
  });
});

describe('selectDepositHostKind', () => {
  it('selects by configured BITCODE_PIPELINE_HOST (default inline; env does not auto-select)', () => {
    expect(selectDepositHostKind({ BITCODE_PIPELINE_HOST: 'sandbox' } as any)).toBe('sandbox');
    expect(selectDepositHostKind({ BITCODE_PIPELINE_HOST: ' Sandbox ' } as any)).toBe('sandbox');
    expect(selectDepositHostKind({ BITCODE_PIPELINE_HOST: 'inline' } as any)).toBe('inline');
    expect(selectDepositHostKind({} as any)).toBe('inline');
    expect(selectDepositHostKind({ VERCEL: '1' } as any)).toBe('inline');
  });
});

describe('resolveDepositPipelineHost', () => {
  const original = process.env.BITCODE_PIPELINE_HOST;
  afterEach(() => {
    if (original === undefined) delete process.env.BITCODE_PIPELINE_HOST;
    else process.env.BITCODE_PIPELINE_HOST = original;
  });

  it('returns an InlineHost when configured inline (default)', async () => {
    delete process.env.BITCODE_PIPELINE_HOST;
    const host = await resolveDepositPipelineHost();
    expect(host.capabilities.hostKind).toBe('inline');
  });

  it('rejects resolveDepositPipelineHost for sandbox (harness path is separate)', async () => {
    process.env.BITCODE_PIPELINE_HOST = 'sandbox';
    await expect(resolveDepositPipelineHost()).rejects.toThrow(
      /runDepositInBoxHarness/i,
    );
  });
});

describe('runDepositInBoxHarness (#25)', () => {
  it('dispatches a deposit-mode harness and returns evidence.depositOptions', async () => {
    let receivedPlan: any;
    const fakeHost = {
      runHarness: async (plan: any) => {
        receivedPlan = plan;
        return {
          sandboxId: 'sbx_test_1',
          artifacts: { evidence: { depositOptions: [{ title: 'Auth slice', coveredSourcePaths: ['src/auth.ts'] }] }, telemetry: null },
          outcome: 'completed',
          stopped: true,
          manifest: plan.manifest,
          commands: [],
        };
      },
    };
    const result = await runDepositInBoxHarness({
      repositoryFullName: 'engineeredsoftware/demo',
      revision: 'abc123',
      branch: 'main',
      commit: 'abc123',
      token: 'ghs_tok',
      obfuscations: 'hide internal names',
      protectedIpExclusions: ['secret/'],
      demandContext: ['auth'],
      hostFactory: async () => fakeHost,
    });

    expect(result.options).toEqual([{ title: 'Auth slice', coveredSourcePaths: ['src/auth.ts'] }]);
    expect(result.sandboxId).toBe('sbx_test_1');
    expect(result.outcome).toBe('completed');
    // The dispatched plan ran the deposit lens in-box, with a git source + steering.
    expect(receivedPlan.manifest.synthesizeMode).toBe('deposit');
    expect(receivedPlan.manifest.depositSteering).toMatchObject({ protectedIpExclusions: ['secret/'] });
    expect(receivedPlan.createOptions.source).toMatchObject({ type: 'git', revision: 'abc123' });
    expect(receivedPlan.createOptions.persistent).toBe(false);
  });

  it('returns empty options when the evidence has no depositOptions', async () => {
    const fakeHost = {
      runHarness: async () => ({
        sandboxId: null,
        artifacts: { evidence: {}, telemetry: null },
        outcome: 'completed',
        stopped: true,
        manifest: {},
        commands: [],
      }),
    };
    const result = await runDepositInBoxHarness({
      repositoryFullName: 'o/r', revision: 'main', branch: 'main', commit: null,
      obfuscations: null, protectedIpExclusions: [], demandContext: [], hostFactory: async () => fakeHost,
    });
    expect(result.options).toEqual([]);
    expect(result.outcome).toBe('completed');
  });
});
