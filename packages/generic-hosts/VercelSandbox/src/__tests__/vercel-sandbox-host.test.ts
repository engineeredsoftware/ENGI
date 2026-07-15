import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { buildAssetPackSandboxHostPlan } from '@bitcode/pipeline-hosts';
import {
  assertVercelSandboxAuthAvailable,
  formatSandboxApiError,
  normalizeCreateOptions,
  resolveVercelSandboxEsmEntryHref,
  resolveVercelSandboxPackageRoot,
  VercelSandboxPipelineHost,
} from '../vercel-sandbox-host';
import type {
  PipelineHostFile,
  PipelineHostEvent,
  SandboxCommandResult,
  SandboxCreateOptions,
  SandboxFactory,
} from '@bitcode/host-generics';

class FakeSandbox {
  sandboxId = 'sbx_test';
  name?: string;
  status = 'running';
  readonly writtenFiles: PipelineHostFile[] = [];
  readonly commands: { cmd: string; args: string[] }[] = [];
  stopped = false;
  deleted = false;

  async writeFiles(files: PipelineHostFile[]): Promise<void> {
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
      return Buffer.from('{"type":"host-complete"}\n');
    }
    return null;
  }

  async stop(): Promise<void> {
    this.stopped = true;
    this.status = 'stopped';
  }

  async delete(): Promise<void> {
    this.deleted = true;
    this.status = 'deleted';
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
    if (file.path === '.bitcode/pipeline-host/pipeline.exit-code') {
      return Buffer.from('0');
    }
    if (file.path === '.bitcode/pipeline-host/pipeline.stdout.log') {
      return Buffer.from('detached stdout');
    }
    if (file.path === '.bitcode/pipeline-host/pipeline.stderr.log') {
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
    const plan = buildAssetPackSandboxHostPlan({
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
        exitCodePath: '.bitcode/pipeline-host/pipeline.exit-code',
        stdoutPath: '.bitcode/pipeline-host/pipeline.stdout.log',
        stderrPath: '.bitcode/pipeline-host/pipeline.stderr.log',
        pollIntervalMs: 5,
        maxWaitMs: 5_000,
      },
    ];

    const result = await host.runHostPlan(plan);
    expect(result.outcome).toBe('cancelled');
    expect(fakeSandbox.stopped).toBe(true);
  });

  it('creates the sandbox, writes host files, runs commands, reads artifacts, and stops', async () => {
    const fakeSandbox = new FakeSandbox();
    const createOptions: SandboxCreateOptions[] = [];
    const factory: SandboxFactory = {
      create: async (options) => {
        createOptions.push(options);
        return fakeSandbox;
      },
    };
    const host = new VercelSandboxPipelineHost({ sandboxFactory: factory });
    const plan = buildAssetPackSandboxHostPlan({
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

    const result = await host.runHostPlan(plan);

    expect(createOptions[0].runtime).toBe('node24');
    expect(fakeSandbox.writtenFiles).toHaveLength(3);
    expect(fakeSandbox.commands.map((command) => command.cmd)).toEqual(['node', 'node']);
    expect(result.outcome).toBe('completed');
    expect(result.artifacts.evidence).toEqual({ resultState: 'blocked_readiness' });
    expect(result.artifacts.telemetry).toContain('host-complete');
    expect(result.stopped).toBe(true);
    expect(fakeSandbox.stopped).toBe(true);
  });

  it('emits host lifecycle events for streaming host observers', async () => {
    const fakeSandbox = new FakeSandbox();
    const events: PipelineHostEvent[] = [];
    const factory: SandboxFactory = {
      create: async () => fakeSandbox,
    };
    const host = new VercelSandboxPipelineHost({
      sandboxFactory: factory,
      onEvent: (event) => {
        events.push(event);
      },
    });
    const plan = buildAssetPackSandboxHostPlan({
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

    await host.runHostPlan(plan);

    expect(events.map((event) => event.type)).toEqual([
      'sandbox-create-started',
      'sandbox-created',
      'host-files-written',
      'command-started',
      'command-completed',
      'command-started',
      'command-completed',
      'artifacts-read',
      // Ephemeral hosts stop then delete (v2: avoid Snapshot Storage linger).
      'sandbox-deleted',
      'sandbox-stopped',
    ]);
    expect(events.find((e) => e.type === 'sandbox-created')).toMatchObject({
      persistent: false,
      name: expect.any(String),
    });
    expect(events.find((event) => event.type === 'command-completed')).toMatchObject({
      stdoutLength: expect.any(Number),
      stderrLength: expect.any(Number),
    });
  });

  it('polls detached command artifacts instead of relying on the command stream', async () => {
    const fakeSandbox = new DetachedFakeSandbox();
    const events: PipelineHostEvent[] = [];
    const factory: SandboxFactory = {
      create: async () => fakeSandbox,
    };
    const host = new VercelSandboxPipelineHost({
      sandboxFactory: factory,
      onEvent: (event) => {
        events.push(event);
      },
    });
    const plan = buildAssetPackSandboxHostPlan({
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
        exitCodePath: '.bitcode/pipeline-host/pipeline.exit-code',
        stdoutPath: '.bitcode/pipeline-host/pipeline.stdout.log',
        stderrPath: '.bitcode/pipeline-host/pipeline.stderr.log',
        pollIntervalMs: 1,
        maxWaitMs: 50,
      },
    ];

    const result = await host.runHostPlan(plan);

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
        telemetryEvent: { type: 'host-complete' },
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
      const plan = buildAssetPackSandboxHostPlan({
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

      await host.runHostPlan(plan);

      expect(createOptions[0]).toMatchObject({
        token: 'test-token',
        teamId: 'team_test',
        projectId: 'prj_test',
        // v2 default is persistent=true; Bitcode hosts force false.
        persistent: false,
      });
      expect(typeof createOptions[0].name).toBe('string');
      expect(createOptions[0].name!.length).toBeGreaterThan(8);
      expect(fakeSandbox.stopped).toBe(true);
      expect(fakeSandbox.deleted).toBe(true);
    } finally {
      restoreEnv('VERCEL_TOKEN', previous.VERCEL_TOKEN);
      restoreEnv('VERCEL_TEAM_ID', previous.VERCEL_TEAM_ID);
      restoreEnv('VERCEL_PROJECT_ID', previous.VERCEL_PROJECT_ID);
      restoreEnv('VERCEL_OIDC_TOKEN', previous.VERCEL_OIDC_TOKEN);
    }
  });

  it('normalizeCreateOptions forces ephemeral unless persistent is explicitly true', () => {
    expect(normalizeCreateOptions({}).persistent).toBe(false);
    expect(normalizeCreateOptions({ persistent: false }).persistent).toBe(false);
    expect(normalizeCreateOptions({ persistent: true, name: 'keep-me' })).toMatchObject({
      persistent: true,
      name: 'keep-me',
    });
    const named = normalizeCreateOptions({ name: '  ' });
    expect(named.persistent).toBe(false);
    expect(named.name).toMatch(/^bitcode-host-/);
  });

  it('deposit host createOptions are non-persistent with a unique name', () => {
    const plan = buildAssetPackSandboxHostPlan({
      mode: 'asset_pack_pipeline',
      synthesizeMode: 'deposit',
      persistent: false,
      read: { id: 'read-1', prompt: 'n/a' },
      deposit: { id: 'deposit-demo' },
      sourceRevision: {
        repositoryFullName: 'engineeredsoftware/demo',
        branch: 'main',
        commit: 'abc',
      },
      source: { type: 'git', url: 'https://github.com/engineeredsoftware/demo.git', revision: 'abc' },
    });
    expect(plan.createOptions.persistent).toBe(false);
    expect(plan.createOptions.name).toMatch(/^bitcode-deposit-/);
  });

  it('bounds sandbox creation so auth/API hangs are observable', async () => {
    const factory: SandboxFactory = {
      create: async () => new Promise(() => undefined),
    };
    const host = new VercelSandboxPipelineHost({
      sandboxFactory: factory,
      sandboxCreateTimeoutMs: 5,
    });
    const plan = buildAssetPackSandboxHostPlan({
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

    await expect(host.runHostPlan(plan)).rejects.toThrow(
      'Vercel Sandbox create did not complete within 5ms.'
    );
  });

  it('resolves the pure-ESM @vercel/sandbox entry (not dist/index.cjs)', () => {
    const href = resolveVercelSandboxEsmEntryHref((id) => {
      if (id === '@vercel/sandbox/package.json') {
        return path.join('/virtual/node_modules/@vercel/sandbox', 'package.json');
      }
      throw new Error(`unexpected resolve: ${id}`);
    });
    expect(href).toBe(
      pathToFileURL(path.join('/virtual/node_modules/@vercel/sandbox/dist/index.js')).href,
    );
    expect(href.endsWith('/dist/index.js')).toBe(true);
    expect(href.includes('index.cjs')).toBe(false);
  });

  it('discovers @vercel/sandbox from node_modules without createRequire.resolve', () => {
    // Live install path used on Vercel /var/task and local monorepo.
    const root = resolveVercelSandboxPackageRoot();
    expect(root.includes(`${path.sep}@vercel${path.sep}sandbox`)).toBe(true);
    expect(fs.existsSync(path.join(root, 'dist', 'index.js'))).toBe(true);
    const href = resolveVercelSandboxEsmEntryHref();
    expect(href.startsWith('file:')).toBe(true);
    expect(href.endsWith('/dist/index.js') || href.endsWith('\\dist\\index.js')).toBe(true);
  });

  it('expands sandbox API 400 with response JSON for operators', () => {
    const apiError = Object.assign(new Error('Status code 400 is not ok'), {
      response: { status: 400, statusText: 'Bad Request' },
      json: { error: { code: 'invalid_image', message: 'image not found in project' } },
    });
    const wrapped = new Error('wrapper', { cause: apiError });
    const message = formatSandboxApiError(wrapped, 'Sandbox.create');
    expect(message).toContain('Sandbox.create failed');
    expect(message).toContain('HTTP 400');
    expect(message).toContain('invalid_image');
    expect(message).toContain('image not found in project');
  });

  it('accepts access-token auth when OIDC is absent', () => {
    const previous = {
      VERCEL_TOKEN: process.env.VERCEL_TOKEN,
      VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID,
      VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
      VERCEL_OIDC_TOKEN: process.env.VERCEL_OIDC_TOKEN,
    };
    try {
      delete process.env.VERCEL_OIDC_TOKEN;
      process.env.VERCEL_TOKEN = 'tok';
      process.env.VERCEL_TEAM_ID = 'team';
      process.env.VERCEL_PROJECT_ID = 'prj';
      expect(() => assertVercelSandboxAuthAvailable()).not.toThrow();

      delete process.env.VERCEL_TOKEN;
      expect(() => assertVercelSandboxAuthAvailable()).toThrow(/Sandbox auth is not configured/);
    } finally {
      restoreEnv('VERCEL_TOKEN', previous.VERCEL_TOKEN);
      restoreEnv('VERCEL_TEAM_ID', previous.VERCEL_TEAM_ID);
      restoreEnv('VERCEL_PROJECT_ID', previous.VERCEL_PROJECT_ID);
      restoreEnv('VERCEL_OIDC_TOKEN', previous.VERCEL_OIDC_TOKEN);
    }
  });
});

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
