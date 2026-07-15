/**
 * @jest-environment node
 */
import {
  createDepositLocalHostCloneForRun,
  provisionDepositCheckout,
  provisionDepositSourceInventory,
  resolveDepositPipelineHost,
  runDepositInBoxHost,
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
      hostKind: 'local',
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

describe('createDepositLocalHostCloneForRun (Setup factory only)', () => {
  it('clones once for this run and reuses the same workspace', async () => {
    const { host, isDisposed, source } = fakeHost();
    const onWorkspace = jest.fn();
    const cloneForRun = createDepositLocalHostCloneForRun({
      host,
      repositoryFullName: 'o/r',
      url: 'https://github.com/o/r.git',
      revision: 'abc123',
      token: 'ghs_tok',
      onWorkspace,
    });
    const ws1 = await cloneForRun();
    const ws2 = await cloneForRun();
    expect(ws1).toBe(ws2);
    expect(onWorkspace).toHaveBeenCalledTimes(1);
    expect((source as any)()).toMatchObject({
      revision: 'abc123',
      password: 'ghs_tok',
    });
    expect(isDisposed()).toBe(false);
    await ws1.dispose();
    expect(isDisposed()).toBe(true);
  });
});

describe('provisionDepositCheckout (Host clone + path catalog primitive)', () => {
  it('clones, lists paths, reads samples only, keeps workspace for Discovery', async () => {
    const { host, isDisposed, source } = fakeHost();
    const checkout = await provisionDepositCheckout({
      host,
      repositoryFullName: 'o/r',
      url: 'https://github.com/o/r.git',
      revision: 'abc123',
      token: 'ghs_tok',
    });

    expect((source as any)()).toMatchObject({
      repositoryFullName: 'o/r',
      url: 'https://github.com/o/r.git',
      revision: 'abc123',
      password: 'ghs_tok',
    });

    // Light checkout source catalog: paths + samples; file bodies deferred (empty).
    expect(checkout.sourceCatalog.sources).toEqual([]);
    expect(checkout.sourceCatalog.paths.sort()).toEqual(Object.keys(FILES).sort());
    const samplePaths = checkout.sourceCatalog.samples.map((s) => s.path);
    expect(samplePaths).toContain('README.md');
    expect(samplePaths).toContain('src/app.ts');
    expect(samplePaths).not.toContain('deep/nested/thing/buried.ts');

    // Workspace stays open until caller disposes (Discovery loads source files).
    expect(isDisposed()).toBe(false);
    await checkout.dispose();
    expect(isDisposed()).toBe(true);
  });
});

describe('provisionDepositSourceInventory (compat full catalog load)', () => {
  it('provisions, reads the FULL source, derives bounded samples, and disposes', async () => {
    const { host, isDisposed, source } = fakeHost();
    const inventory = await provisionDepositSourceInventory({
      host,
      repositoryFullName: 'o/r',
      url: 'https://github.com/o/r.git',
      revision: 'abc123',
      token: 'ghs_tok',
    });

    expect((source as any)()).toMatchObject({
      repositoryFullName: 'o/r',
      url: 'https://github.com/o/r.git',
      revision: 'abc123',
      password: 'ghs_tok',
    });

    expect(inventory.sources).toHaveLength(4);
    expect(inventory.sources.find((f) => f.path === 'src/app.ts')?.content).toBe(FILES['src/app.ts']);
    expect(inventory.paths.sort()).toEqual(Object.keys(FILES).sort());

    const samplePaths = inventory.samples.map((s) => s.path);
    expect(samplePaths).toContain('README.md');
    expect(samplePaths).toContain('src/app.ts');
    expect(samplePaths).not.toContain('deep/nested/thing/buried.ts');

    expect(isDisposed()).toBe(true);
  });
});

describe('selectDepositHostKind', () => {
  it('uses LocalHost only on local machines; serverless always sandbox', () => {
    // Local machine (no Vercel/Lambda markers)
    expect(selectDepositHostKind({ BITCODE_PIPELINE_HOST: 'sandbox' } as any)).toBe('sandbox');
    expect(selectDepositHostKind({ BITCODE_PIPELINE_HOST: ' Sandbox ' } as any)).toBe('sandbox');
    expect(selectDepositHostKind({ BITCODE_PIPELINE_HOST: 'local' } as any)).toBe('local');
    expect(selectDepositHostKind({ BITCODE_PIPELINE_HOST: 'inline' } as any)).toBe('local');
    expect(selectDepositHostKind({} as any)).toBe('local');

    // Serverless: always sandbox — LocalHost is never valid here
    expect(selectDepositHostKind({ VERCEL: '1' } as any)).toBe('sandbox');
    expect(selectDepositHostKind({ VERCEL: '1', BITCODE_PIPELINE_HOST: 'local' } as any)).toBe(
      'sandbox',
    );
    expect(selectDepositHostKind({ VERCEL_ENV: 'production' } as any)).toBe('sandbox');
    expect(selectDepositHostKind({ VERCEL_ENV: 'preview' } as any)).toBe('sandbox');
    expect(selectDepositHostKind({ AWS_LAMBDA_FUNCTION_NAME: 'fn' } as any)).toBe('sandbox');
    expect(
      selectDepositHostKind({ BITCODE_PIPELINE_RUNTIME: 'serverless' } as any),
    ).toBe('sandbox');
  });
});

describe('resolveDepositPipelineHost', () => {
  const original = process.env.BITCODE_PIPELINE_HOST;
  afterEach(() => {
    if (original === undefined) delete process.env.BITCODE_PIPELINE_HOST;
    else process.env.BITCODE_PIPELINE_HOST = original;
  });

  it('returns an LocalHost when configured local (default)', async () => {
    delete process.env.BITCODE_PIPELINE_HOST;
    const host = await resolveDepositPipelineHost();
    expect(host.capabilities.hostKind).toBe('local');
  });

  it('rejects resolveDepositPipelineHost for sandbox (host path is separate)', async () => {
    process.env.BITCODE_PIPELINE_HOST = 'sandbox';
    await expect(resolveDepositPipelineHost()).rejects.toThrow(
      /runDepositInBoxHost/i,
    );
  });
});

describe('runDepositInBoxHost (#25)', () => {
  it('dispatches a deposit-mode host and returns evidence.depositOptions', async () => {
    let receivedPlan: any;
    const fakeHost = {
      runHostPlan: async (plan: any) => {
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
    const result = await runDepositInBoxHost({
      repositoryFullName: 'engineeredsoftware/demo',
      revision: 'abc123',
      branch: 'main',
      commit: 'abc123',
      token: 'ghs_tok',
      obfuscations: 'hide internal names',
      forcedExclusions: ['secret/'],
      demandContext: ['auth'],
      hostFactory: async () => fakeHost,
    });

    expect(result.options).toEqual([{ title: 'Auth slice', coveredSourcePaths: ['src/auth.ts'] }]);
    expect(result.sandboxId).toBe('sbx_test_1');
    expect(result.outcome).toBe('completed');
    // The dispatched plan ran the deposit lens in-box, with a git source + steering.
    expect(receivedPlan.manifest.synthesizeMode).toBe('deposit');
    expect(receivedPlan.manifest.depositSteering).toMatchObject({ forcedExclusions: ['secret/'] });
    expect(receivedPlan.createOptions.source).toMatchObject({ type: 'git', revision: 'abc123' });
    // Vercel Sandbox v2: persistence is default — deposit must opt out.
    expect(receivedPlan.createOptions.persistent).toBe(false);
    expect(typeof receivedPlan.createOptions.name).toBe('string');
    expect(receivedPlan.createOptions.name).toMatch(/^bitcode-deposit-/);
  });

  it('returns empty options when the evidence has no depositOptions', async () => {
    const fakeHost = {
      runHostPlan: async () => ({
        sandboxId: null,
        artifacts: { evidence: {}, telemetry: null },
        outcome: 'completed',
        stopped: true,
        manifest: {},
        commands: [],
      }),
    };
    const result = await runDepositInBoxHost({
      repositoryFullName: 'o/r', revision: 'main', branch: 'main', commit: null,
      obfuscations: null, forcedExclusions: [], demandContext: [], hostFactory: async () => fakeHost,
    });
    expect(result.options).toEqual([]);
    expect(result.outcome).toBe('completed');
  });
});
