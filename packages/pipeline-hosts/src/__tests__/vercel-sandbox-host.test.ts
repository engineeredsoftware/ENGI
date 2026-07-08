import { buildAssetPackSandboxHarness } from '../asset-pack-harness';
import { VercelSandboxPipelineHost } from '../vercel-sandbox-host';
import type {
  PipelineHarnessFile,
  PipelineHarnessHostEvent,
  SandboxCommandResult,
  SandboxCreateOptions,
  SandboxFactory,
} from '../types';

class FakeSandbox {
  sandboxId = 'sbx_test';
  status = 'running';
  readonly writtenFiles: PipelineHarnessFile[] = [];
  readonly commands: { cmd: string; args: string[] }[] = [];
  stopped = false;

  async writeFiles(files: PipelineHarnessFile[]): Promise<void> {
    this.writtenFiles.push(...files);
  }

  async runCommand(params: { cmd: string; args?: string[] }): Promise<SandboxCommandResult> {
    this.commands.push({ cmd: params.cmd, args: params.args ?? [] });
    return {
      exitCode: 0,
      stdout: async () => `${params.cmd} ${params.args?.join(' ') || ''}`.trim(),
      stderr: async () => '',
    };
  }

  async readFileToBuffer(file: { path: string }): Promise<Buffer | null> {
    if (file.path.endsWith('evidence.json')) {
      return Buffer.from(JSON.stringify({ resultState: 'blocked_readiness' }));
    }
    if (file.path.endsWith('telemetry.jsonl')) {
      return Buffer.from('{"type":"harness-complete"}\n');
    }
    return null;
  }

  async stop(): Promise<void> {
    this.stopped = true;
    this.status = 'stopped';
  }
}

class DetachedFakeSandbox extends FakeSandbox {
  async runCommand(params: { cmd: string; args?: string[]; detached?: boolean }): Promise<SandboxCommandResult> {
    this.commands.push({ cmd: params.cmd, args: params.args ?? [] });
    return {
      exitCode: params.detached ? null : 0,
      stdout: async () => '',
      stderr: async () => '',
    };
  }

  async readFileToBuffer(file: { path: string }): Promise<Buffer | null> {
    if (file.path === '.bitcode/pipeline-harness/pipeline.exit-code') {
      return Buffer.from('0');
    }
    if (file.path === '.bitcode/pipeline-harness/pipeline.stdout.log') {
      return Buffer.from('detached stdout');
    }
    if (file.path === '.bitcode/pipeline-harness/pipeline.stderr.log') {
      return Buffer.from('');
    }
    return super.readFileToBuffer(file);
  }
}

describe('VercelSandboxPipelineHost', () => {
  it('aborts a detached poll when shouldAbort becomes true and returns cancelled', async () => {
    let polls = 0;
    class NeverExitSandbox extends DetachedFakeSandbox {
      async readFileToBuffer(file: { path: string }): Promise<Buffer | null> {
        // Never produce an exit code so the poll continues until shouldAbort.
        if (file.path.includes('exit')) return null;
        return super.readFileToBuffer(file);
      }
    }
    const fakeSandbox = new NeverExitSandbox();
    const host = new VercelSandboxPipelineHost({
      sandboxFactory: {
        create: async () => fakeSandbox,
      },
      shouldAbort: async () => {
        polls += 1;
        return polls >= 2;
      },
    });
    const plan = buildAssetPackSandboxHarness({
      read: { id: 'read-1', prompt: 'Read.' },
      deposit: { id: 'deposit-1' },
      sourceRevision: {
        repositoryFullName: 'engineeredsoftware/ENGI',
        branch: 'main',
        commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      },
    });
    plan.commands = [
      {
        label: 'detached-run',
        cmd: 'sh',
        args: ['-lc', 'long command'],
        detached: true,
        exitCodePath: '.bitcode/pipeline-harness/pipeline.exit-code',
        stdoutPath: '.bitcode/pipeline-harness/pipeline.stdout.log',
        stderrPath: '.bitcode/pipeline-harness/pipeline.stderr.log',
        pollIntervalMs: 5,
        maxWaitMs: 5_000,
      },
    ];

    const result = await host.runHarness(plan);
    expect(result.outcome).toBe('cancelled');
    expect(fakeSandbox.stopped).toBe(true);
  });

  it('creates the sandbox, writes harness files, runs commands, reads artifacts, and stops', async () => {
    const fakeSandbox = new FakeSandbox();
    const createOptions: SandboxCreateOptions[] = [];
    const factory: SandboxFactory = {
      create: async (options) => {
        createOptions.push(options);
        return fakeSandbox;
      },
    };
    const host = new VercelSandboxPipelineHost({ sandboxFactory: factory });
    const plan = buildAssetPackSandboxHarness({
      read: {
        id: 'read-1',
        prompt: 'Read the deposited repository revision.',
      },
      deposit: {
        id: 'deposit-1',
      },
      sourceRevision: {
        repositoryFullName: 'engineeredsoftware/ENGI',
        branch: 'main',
        commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      },
    });

    const result = await host.runHarness(plan);

    expect(createOptions[0].runtime).toBe('node24');
    expect(fakeSandbox.writtenFiles).toHaveLength(3);
    expect(fakeSandbox.commands.map((command) => command.cmd)).toEqual(['node', 'node']);
    expect(result.outcome).toBe('completed');
    expect(result.artifacts.evidence).toEqual({ resultState: 'blocked_readiness' });
    expect(result.artifacts.telemetry).toContain('harness-complete');
    expect(result.stopped).toBe(true);
    expect(fakeSandbox.stopped).toBe(true);
  });

  it('emits host lifecycle events for streaming harness observers', async () => {
    const fakeSandbox = new FakeSandbox();
    const events: PipelineHarnessHostEvent[] = [];
    const factory: SandboxFactory = {
      create: async () => fakeSandbox,
    };
    const host = new VercelSandboxPipelineHost({
      sandboxFactory: factory,
      onEvent: (event) => {
        events.push(event);
      },
    });
    const plan = buildAssetPackSandboxHarness({
      read: {
        id: 'read-1',
        prompt: 'Read the deposited repository revision.',
      },
      deposit: {
        id: 'deposit-1',
      },
      sourceRevision: {
        repositoryFullName: 'engineeredsoftware/ENGI',
        branch: 'main',
        commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      },
    });

    await host.runHarness(plan);

    expect(events.map((event) => event.type)).toEqual([
      'sandbox-create-started',
      'sandbox-created',
      'harness-files-written',
      'command-started',
      'command-completed',
      'command-started',
      'command-completed',
      'artifacts-read',
      'sandbox-stopped',
    ]);
    expect(events.find((event) => event.type === 'command-completed')).toMatchObject({
      stdoutLength: expect.any(Number),
      stderrLength: expect.any(Number),
    });
  });

  it('polls detached command artifacts instead of relying on the command stream', async () => {
    const fakeSandbox = new DetachedFakeSandbox();
    const events: PipelineHarnessHostEvent[] = [];
    const factory: SandboxFactory = {
      create: async () => fakeSandbox,
    };
    const host = new VercelSandboxPipelineHost({
      sandboxFactory: factory,
      onEvent: (event) => {
        events.push(event);
      },
    });
    const plan = buildAssetPackSandboxHarness({
      read: {
        id: 'read-1',
        prompt: 'Read the deposited repository revision.',
      },
      deposit: {
        id: 'deposit-1',
      },
      sourceRevision: {
        repositoryFullName: 'engineeredsoftware/ENGI',
        branch: 'main',
        commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      },
    });
    plan.commands = [
      {
        label: 'detached-run',
        cmd: 'sh',
        args: ['-lc', 'long command'],
        detached: true,
        exitCodePath: '.bitcode/pipeline-harness/pipeline.exit-code',
        stdoutPath: '.bitcode/pipeline-harness/pipeline.stdout.log',
        stderrPath: '.bitcode/pipeline-harness/pipeline.stderr.log',
        pollIntervalMs: 1,
        maxWaitMs: 50,
      },
    ];

    const result = await host.runHarness(plan);

    expect(result.outcome).toBe('completed');
    expect(result.commands[0]).toMatchObject({
      exitCode: 0,
      stdout: 'detached stdout',
      stderr: '',
    });
    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'telemetry-artifact-event',
        label: 'detached-run',
        lineNumber: 1,
        telemetryEvent: { type: 'harness-complete' },
      }),
    );
  });

  it('passes access-token auth fields to Sandbox.create when OIDC is unavailable', async () => {
    const previous = {
      VERCEL_TOKEN: process.env.VERCEL_TOKEN,
      VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID,
      VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
      VERCEL_OIDC_TOKEN: process.env.VERCEL_OIDC_TOKEN,
    };
    process.env.VERCEL_TOKEN = 'test-token';
    process.env.VERCEL_TEAM_ID = 'team_test';
    process.env.VERCEL_PROJECT_ID = 'prj_test';
    delete process.env.VERCEL_OIDC_TOKEN;

    try {
      const fakeSandbox = new FakeSandbox();
      const createOptions: SandboxCreateOptions[] = [];
      const factory: SandboxFactory = {
        create: async (options) => {
          createOptions.push(options);
          return fakeSandbox;
        },
      };
      const host = new VercelSandboxPipelineHost({ sandboxFactory: factory });
      const plan = buildAssetPackSandboxHarness({
        read: {
          id: 'read-1',
          prompt: 'Read the deposited repository revision.',
        },
        deposit: {
          id: 'deposit-1',
        },
        sourceRevision: {
          repositoryFullName: 'engineeredsoftware/ENGI',
          branch: 'main',
          commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
        },
      });

      await host.runHarness(plan);

      expect(createOptions[0]).toMatchObject({
        token: 'test-token',
        teamId: 'team_test',
        projectId: 'prj_test',
      });
    } finally {
      restoreEnv('VERCEL_TOKEN', previous.VERCEL_TOKEN);
      restoreEnv('VERCEL_TEAM_ID', previous.VERCEL_TEAM_ID);
      restoreEnv('VERCEL_PROJECT_ID', previous.VERCEL_PROJECT_ID);
      restoreEnv('VERCEL_OIDC_TOKEN', previous.VERCEL_OIDC_TOKEN);
    }
  });

  it('bounds sandbox creation so auth/API hangs are observable', async () => {
    const factory: SandboxFactory = {
      create: async () => new Promise(() => undefined),
    };
    const host = new VercelSandboxPipelineHost({
      sandboxFactory: factory,
      sandboxCreateTimeoutMs: 5,
    });
    const plan = buildAssetPackSandboxHarness({
      read: {
        id: 'read-1',
        prompt: 'Read the deposited repository revision.',
      },
      deposit: {
        id: 'deposit-1',
      },
      sourceRevision: {
        repositoryFullName: 'engineeredsoftware/ENGI',
        branch: 'main',
        commit: '31bbc0c5227b6b3aed5d107fd8507d35ec22970a',
      },
    });

    await expect(host.runHarness(plan)).rejects.toThrow(
      'Vercel Sandbox create did not complete within 5ms.'
    );
  });
});

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
