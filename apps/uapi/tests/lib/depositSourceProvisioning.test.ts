/**
 * @jest-environment node
 */
import {
  buildDepositSandboxGitSource,
  createDepositLocalHostCloneForRun,
  formatDepositHostFailure,
  provisionDepositCheckout,
  provisionDepositSourceInventory,
  readDepositHostRecoveryFromEvidence,
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
    // Unknown host names fall through to local; only `sandbox` is special-cased.
    expect(selectDepositHostKind({ BITCODE_PIPELINE_HOST: 'unknown' } as any)).toBe('local');
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

describe('buildDepositSandboxGitSource (diagnostic only)', () => {
  it('plans branch-shallow-pin when branch + commit present', () => {
    const built = buildDepositSandboxGitSource({
      repositoryFullName: 'advancedengineeredsoftware/Bitcode',
      revision: 'f956577ce478e90d629db48c452102e582fa081c',
      branch: 'version/v48',
      commit: 'f956577ce478e90d629db48c452102e582fa081c',
      token: 'ghs_tok',
    });
    expect(built.strategy).toBe('branch-shallow-pin-commit');
    expect(built.source.revision).toBe('version/v48');
  });
});

describe('runDepositInBoxHost (#25)', () => {
  const HOST_ENV_KEYS = [
    'XAI_API_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'BITCODE_LLM_PROVIDER',
    'BITCODE_LLM_MODEL',
    'BITCODE_ASSET_PACK_REAL_INFERENCE',
    'BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE',
    'BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE',
    'SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SECRET_KEY',
    'SUPABASE_ADMIN_KEY',
    'NODE_ENV',
    'VERCEL',
    'VERCEL_ENV',
  ] as const;

  const originalHostEnv = Object.fromEntries(
    HOST_ENV_KEYS.map((key) => [key, process.env[key]]),
  ) as Record<(typeof HOST_ENV_KEYS)[number], string | undefined>;

  function restoreHostEnv() {
    for (const key of HOST_ENV_KEYS) {
      const value = originalHostEnv[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }

  /** Minimal JWT-shaped service role so selectSupabaseAdminCredential admits it. */
  function fakeServiceRoleJwt() {
    return [
      Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url'),
      Buffer.from(JSON.stringify({ role: 'service_role', ref: 'deposit-test' })).toString('base64url'),
      'deposit-test-signature',
    ].join('.');
  }

  beforeEach(() => {
    restoreHostEnv();
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    process.env.NODE_ENV = 'development';
    process.env.SUPABASE_URL = 'https://staging.example.test';
    process.env.SUPABASE_SERVICE_ROLE_KEY = fakeServiceRoleJwt();
    process.env.XAI_API_KEY = 'xai-deposit-test-credential-value';
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.BITCODE_LLM_PROVIDER;
    delete process.env.BITCODE_LLM_MODEL;
    // Product default is real inference on when unset; clear host opt-outs from local env.
    delete process.env.BITCODE_ASSET_PACK_REAL_INFERENCE;
    delete process.env.BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE;
    delete process.env.BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE;
  });

  afterEach(() => {
    restoreHostEnv();
  });

  it('dispatches deposit host with image-only create + in-box clone env (Host law)', async () => {
    let receivedPlan: any;
    const finishOption = { title: 'Auth slice', coveredSourcePaths: ['src/auth.ts'] };
    const fakeHost = {
      runHostPlan: async (plan: any) => {
        receivedPlan = plan;
        return {
          sandboxId: 'sbx_test_1',
          artifacts: {
            evidence: {
              finishPresent: true,
              selectionEnvelope: { options: [finishOption] },
              depositOptions: [finishOption],
            },
            telemetry: null,
          },
          outcome: 'completed',
          stopped: true,
          manifest: plan.manifest,
          commands: [],
        };
      },
    };
    const result = await runDepositInBoxHost({
      repositoryFullName: 'engineeredsoftware/demo',
      revision: 'abc123def456',
      branch: 'main',
      commit: 'abc123def456',
      token: 'ghs_tok',
      userId: 'user-deposit-test',
      runId: 'run-deposit-test',
      obfuscations: 'hide internal names',
      permissibleSources: [],
      impermissibleSources: ['secret/'],
      demandContext: ['auth'],
      hostFactory: async () => fakeHost,
    });

    expect(result.options).toEqual([finishOption]);
    expect(result.finishPresent).toBe(true);
    expect(result.sandboxId).toBe('sbx_test_1');
    expect(result.outcome).toBe('completed');
    expect(receivedPlan.manifest.synthesizeMode).toBe('deposit');
    expect(receivedPlan.manifest.depositSteering).toMatchObject({ impermissibleSources: ['secret/'] });
    // Host law: no create-time customer git source (that was the 400 git clone path).
    expect(receivedPlan.createOptions.source).toBeUndefined();
    // Clone specs for Setup in-box multi-step git (not serverless process clone).
    expect(receivedPlan.createOptions.env).toMatchObject({
      BITCODE_HOST_CLONE_URL: 'https://github.com/engineeredsoftware/demo.git',
      BITCODE_HOST_CLONE_BRANCH: 'main',
      BITCODE_HOST_CLONE_COMMIT: 'abc123def456',
      BITCODE_HOST_CLONE_USERNAME: 'x-access-token',
      BITCODE_HOST_CLONE_PASSWORD: 'ghs_tok',
    });
    // Trusted host env (same as asset-pack runner) must reach the box — not clone-only.
    expect(receivedPlan.createOptions.env).toMatchObject({
      XAI_API_KEY: 'xai-deposit-test-credential-value',
      BITCODE_LLM_PROVIDER: 'xai',
      BITCODE_ASSET_PACK_REAL_INFERENCE: '1',
      BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE: 'bounded',
      BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS: '840000',
      BITCODE_PIPELINE_STREAM_TO_DATABASE: '1',
      BITCODE_PIPELINE_STRUCTURED_DB: '1',
      BITCODE_PIPELINE_LEGACY_EVENTS_DB: '1',
      BITCODE_DEBUG_DISCOVERY_SERIAL: '1',
      BITCODE_PIPELINE_USER_ID: 'user-deposit-test',
      BITCODE_PIPELINE_RUN_ID: 'run-deposit-test',
    });
    expect(receivedPlan.createOptions.env.NODE_OPTIONS || '').toMatch(
      /max-old-space-size=/,
    );
    expect(receivedPlan.manifest.sourceRevision).toMatchObject({
      branch: 'main',
      commit: 'abc123def456',
    });
    expect(receivedPlan.createOptions.persistent).toBe(false);
    expect(typeof receivedPlan.createOptions.name).toBe('string');
    expect(receivedPlan.createOptions.name).toMatch(/^bitcode-deposit-/);
  });

  it('pins REAL_INFERENCE_PROFILE=bounded even when process.env says full', async () => {
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = '1';
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE = 'full';
    process.env.VERCEL = '1';
    process.env.BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE = '1';

    let receivedPlan: any;
    const fakeHost = {
      runHostPlan: async (plan: any) => {
        receivedPlan = plan;
        return {
          sandboxId: 'sbx_profile',
          artifacts: {
            evidence: {
              finishPresent: true,
              selectionEnvelope: {
                options: [{ title: 'Slice', coveredSourcePaths: ['a.ts'] }],
              },
              depositOptions: [{ title: 'Slice', coveredSourcePaths: ['a.ts'] }],
            },
            telemetry: null,
          },
          outcome: 'completed',
          stopped: true,
          manifest: plan.manifest,
          commands: [],
        };
      },
    };

    await runDepositInBoxHost({
      repositoryFullName: 'o/r',
      revision: 'main',
      branch: 'main',
      commit: null,
      userId: 'user-profile-pin',
      obfuscations: null,
      permissibleSources: [],
      impermissibleSources: [],
      demandContext: [],
      hostFactory: async () => fakeHost,
    });

    expect(receivedPlan.createOptions.env).toMatchObject({
      BITCODE_ASSET_PACK_REAL_INFERENCE: '1',
      BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE: 'bounded',
      BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS: '840000',
      BITCODE_PIPELINE_HOST_REQUIRE_REAL_INFERENCE: '1',
    });
  });

  it('raises a stale 240s host budget to the product 840s ceiling', async () => {
    process.env.BITCODE_ASSET_PACK_REAL_INFERENCE = '1';
    process.env.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS = '240000';

    let receivedPlan: any;
    const fakeHost = {
      runHostPlan: async (plan: any) => {
        receivedPlan = plan;
        return {
          sandboxId: 'sbx_budget',
          artifacts: {
            evidence: {
              finishPresent: true,
              selectionEnvelope: {
                options: [{ title: 'Slice', coveredSourcePaths: ['a.ts'] }],
              },
              depositOptions: [{ title: 'Slice', coveredSourcePaths: ['a.ts'] }],
            },
            telemetry: null,
          },
          outcome: 'completed',
          stopped: true,
          manifest: plan.manifest,
          commands: [],
        };
      },
    };

    await runDepositInBoxHost({
      repositoryFullName: 'o/r',
      revision: 'main',
      branch: 'main',
      commit: null,
      userId: 'user-budget-pin',
      obfuscations: null,
      permissibleSources: [],
      impermissibleSources: [],
      demandContext: [],
      hostFactory: async () => fakeHost,
    });

    expect(receivedPlan.createOptions.env.BITCODE_PIPELINE_HOST_MAX_RUNTIME_MS).toBe('840000');
  });

  it('throws a host/pipeline error (not Validation zero-options) when outcome is failed', async () => {
    const fakeHost = {
      runHostPlan: async () => ({
        sandboxId: 'sbx_fail',
        artifacts: {
          evidence: {
            error: { name: 'Error', message: 'Setup clone failed: Host git clone failed' },
            resultReasons: ['AssetPack pipeline execution did not produce admissible result evidence.'],
          },
          telemetry: null,
        },
        outcome: 'failed',
        stopped: true,
        manifest: {},
        commands: [
          {
            label: 'asset-pack-pipeline-run',
            exitCode: 1,
            stderr: 'Error: Setup clone failed: Host git clone failed\n',
            stdout: '',
          },
        ],
      }),
    };
    await expect(
      runDepositInBoxHost({
        repositoryFullName: 'o/r',
        revision: 'main',
        branch: 'main',
        commit: null,
        obfuscations: null,
        permissibleSources: [],
        impermissibleSources: [],
        demandContext: [],
        hostFactory: async () => fakeHost,
      }),
    ).rejects.toThrow(/Sandbox deposit host failed|Setup clone failed|asset-pack-pipeline-run/);
  });

  it('throws when host completed without Finish-presentable options', async () => {
    const fakeHost = {
      runHostPlan: async () => ({
        sandboxId: 'sbx_empty',
        artifacts: { evidence: { depositOptions: [], resultState: 'blocked_readiness' }, telemetry: null },
        outcome: 'completed',
        stopped: true,
        manifest: {},
        commands: [],
      }),
    };
    await expect(
      runDepositInBoxHost({
        repositoryFullName: 'o/r',
        revision: 'main',
        branch: 'main',
        commit: null,
        obfuscations: null,
        permissibleSources: [],
        impermissibleSources: [],
        demandContext: [],
        hostFactory: async () => fakeHost,
      }),
    ).rejects.toThrow(/Finish-presentable depositOptions/);
  });

  it('does not present Implementation-only depositOptions without Finish', async () => {
    const fakeHost = {
      runHostPlan: async () => ({
        sandboxId: 'sbx_impl_only',
        artifacts: {
          evidence: {
            // Implementation measured packs — not Finish-gated.
            depositOptions: [
              {
                coveredSourcePaths: ['a.ts'],
                measurements: { absolutes: new Array(8).fill({ key: 'k', value: 1 }) },
              },
            ],
            resultState: 'worthy_deposit_candidates',
          },
          telemetry: null,
        },
        outcome: 'completed',
        stopped: true,
        manifest: {},
        commands: [],
      }),
    };
    await expect(
      runDepositInBoxHost({
        repositoryFullName: 'o/r',
        revision: 'main',
        branch: 'main',
        commit: null,
        obfuscations: null,
        permissibleSources: [],
        impermissibleSources: [],
        demandContext: [],
        hostFactory: async () => fakeHost,
      }),
    ).rejects.toThrow(/Finish-presentable depositOptions/);
  });

  it('returns empty options + recovery on budget timeout without Finish', async () => {
    const fakeHost = {
      runHostPlan: async () => ({
        sandboxId: 'sbx_budget',
        artifacts: {
          evidence: {
            // Implementation-only recovery under budget — not presentable.
            depositOptions: [
              {
                coveredSourcePaths: ['a.ts'],
                measurements: { absolutes: new Array(8).fill({ key: 'k', value: 1 }) },
              },
            ],
            resultState: 'worthy_deposit_candidates',
            error: {
              name: 'PipelineHostTimeoutError',
              message: 'AssetPack pipeline exceeded host runtime budget of 600000ms.',
            },
          },
          telemetry: null,
        },
        outcome: 'completed',
        stopped: true,
        manifest: {},
        commands: [{ label: 'asset-pack-pipeline-run', exitCode: 0, stderr: '', stdout: '' }],
      }),
    };
    const result = await runDepositInBoxHost({
      repositoryFullName: 'o/r',
      revision: 'main',
      branch: 'main',
      commit: null,
      obfuscations: null,
      permissibleSources: [],
      impermissibleSources: [],
      demandContext: [],
      hostFactory: async () => fakeHost,
    });
    expect(result.options).toHaveLength(0);
    expect(result.finishPresent).toBe(false);
    expect(result.recovery?.hostBudgetExceeded).toBe(true);
    expect(result.recovery?.partial).toBe(true);
  });

  it('presents Finish selectionEnvelope options under budget recovery', async () => {
    const finishOption = {
      coveredSourcePaths: ['a.ts'],
      measurements: { absolutes: new Array(8).fill({ key: 'k', value: 1 }) },
    };
    const fakeHost = {
      runHostPlan: async () => ({
        sandboxId: 'sbx_budget_finish',
        artifacts: {
          evidence: {
            finishPresent: true,
            selectionEnvelope: { options: [finishOption] },
            depositOptions: [finishOption],
            resultState: 'worthy_deposit_candidates',
            error: {
              name: 'PipelineHostTimeoutError',
              message: 'AssetPack pipeline exceeded host runtime budget of 600000ms.',
            },
          },
          telemetry: null,
        },
        outcome: 'completed',
        stopped: true,
        manifest: {},
        commands: [{ label: 'asset-pack-pipeline-run', exitCode: 0, stderr: '', stdout: '' }],
      }),
    };
    const result = await runDepositInBoxHost({
      repositoryFullName: 'o/r',
      revision: 'main',
      branch: 'main',
      commit: null,
      obfuscations: null,
      permissibleSources: [],
      impermissibleSources: [],
      demandContext: [],
      hostFactory: async () => fakeHost,
    });
    expect(result.options).toHaveLength(1);
    expect(result.finishPresent).toBe(true);
    expect(result.recovery?.hostBudgetExceeded).toBe(true);
    expect(result.recovery?.partial).toBe(true);
  });
});

describe('formatDepositHostFailure', () => {
  it('prefers failed command stderr and evidence.error', () => {
    const msg = formatDepositHostFailure({
      outcome: 'failed',
      sandboxId: 'sbx1',
      commands: [
        { label: 'runtime-readiness', exitCode: 0, stderr: '', stdout: '' },
        { label: 'asset-pack-pipeline-run', exitCode: 1, stderr: 'boom stack', stdout: '' },
      ],
      artifacts: {
        evidence: { error: { name: 'Error', message: 'clone failed' }, resultReasons: ['no tree'] },
      },
    });
    expect(msg).toMatch(/asset-pack-pipeline-run/);
    expect(msg).toMatch(/boom stack/);
    expect(msg).toMatch(/clone failed/);
    expect(msg).not.toMatch(/Validation absolutes/);
  });
});

describe('readDepositHostRecoveryFromEvidence', () => {
  it('detects PipelineHostTimeoutError recovery with measured options (8ecbd11a)', () => {
    const recovery = readDepositHostRecoveryFromEvidence(
      {
        resultState: 'worthy_deposit_candidates',
        error: {
          name: 'PipelineHostTimeoutError',
          message: 'AssetPack pipeline exceeded host runtime budget of 600000ms.',
        },
        resultReasons: [
          'Deposit AssetPack options with full absolute measurements were recovered after host budget pressure.',
          'AssetPack pipeline exceeded host runtime budget of 600000ms.',
        ],
        depositOptions: [{ measurements: { absolutes: new Array(8).fill({}) } }],
        output: { partial: false, depositOptions: [] },
      },
      1,
    );
    expect(recovery.hostBudgetExceeded).toBe(true);
    expect(recovery.hostRecoveredFromTimeout).toBe(true);
    expect(recovery.partial).toBe(true);
    expect(recovery.hostResultState).toBe('worthy_deposit_candidates');
  });

  it('is clean when evidence has no budget error', () => {
    const recovery = readDepositHostRecoveryFromEvidence(
      { resultState: 'worthy_deposit_candidates', depositOptions: [{ id: 'a' }] },
      1,
    );
    expect(recovery.hostBudgetExceeded).toBe(false);
    expect(recovery.partial).toBe(false);
  });
});

