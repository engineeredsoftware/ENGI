import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type {
  PipelineHostCommand,
  PipelineHostEvent,
  PipelineHostCommandResult,
  PipelineHostPlan,
  PipelineHostRunResult,
  SandboxCommandResult,
  SandboxFactory,
  SandboxSession,
} from '@bitcode/host-generics';

export interface VercelSandboxPipelineHostOptions {
  sandboxFactory: SandboxFactory;
  stopAfterRun?: boolean;
  sandboxCreateTimeoutMs?: number;
  onEvent?: (event: PipelineHostEvent) => void | Promise<void>;
  /**
   * Cooperative cancel: polled during detached command waits. When true, the
   * host stops the sandbox and returns outcome `'cancelled'`.
   */
  shouldAbort?: () => boolean | Promise<boolean>;
}

export class VercelSandboxPipelineHost {
  private readonly sandboxFactory: SandboxFactory;
  private readonly stopAfterRun: boolean;
  private readonly sandboxCreateTimeoutMs: number;
  private readonly onEvent?: (event: PipelineHostEvent) => void | Promise<void>;
  private readonly shouldAbort?: () => boolean | Promise<boolean>;

  constructor(options: VercelSandboxPipelineHostOptions) {
    this.sandboxFactory = options.sandboxFactory;
    this.stopAfterRun = options.stopAfterRun ?? true;
    this.sandboxCreateTimeoutMs = options.sandboxCreateTimeoutMs ?? 180_000;
    this.onEvent = options.onEvent;
    this.shouldAbort = options.shouldAbort;
  }

  async runHostPlan(plan: PipelineHostPlan): Promise<PipelineHostRunResult> {
    // Auth is enforced by product callers (runDepositInBoxHost) before
    // constructing a real factory; unit tests inject mock factories without env.
    //
    // Vercel Sandbox v2: persistence is DEFAULT. createOptions.persistent must
    // be explicit false for one-shot deposit/read hosts (Snapshot Storage
    // is billed separately). normalizeCreateOptions enforces that + a unique name.
    const createOptions = normalizeCreateOptions(plan.createOptions);
    await this.emit({
      type: 'sandbox-create-started',
      timestamp: new Date().toISOString(),
      runtime: createOptions.runtime,
      mode: plan.manifest.hostMode,
    });
    const sandbox = await withTimeout(
      this.sandboxFactory.create(withVercelAccessTokenAuth(createOptions)),
      this.sandboxCreateTimeoutMs,
      `Vercel Sandbox create did not complete within ${this.sandboxCreateTimeoutMs}ms.`
    );
    const sandboxIdentity = resolveSandboxIdentity(sandbox, createOptions.name);
    await this.emit({
      type: 'sandbox-created',
      timestamp: new Date().toISOString(),
      sandboxId: sandboxIdentity.id,
      name: sandboxIdentity.name,
      persistent: createOptions.persistent === true,
      status: sandbox.status,
    });
    const commands: PipelineHostCommandResult[] = [];
    let stopped = false;
    let deleted = false;
    let outcome: PipelineHostRunResult['outcome'] = 'completed';
    let evidence: unknown | null = null;
    let telemetry: string | null = null;

    try {
      if (await this.checkAbort()) {
        outcome = 'cancelled';
        await this.emit({
          type: 'sandbox-cancelled',
          timestamp: new Date().toISOString(),
          sandboxId: sandboxIdentity.id,
          name: sandboxIdentity.name,
          reason: 'cancelled before host commands',
        });
      } else {
        await sandbox.writeFiles(plan.files);
        await this.emit({
          type: 'host-files-written',
          timestamp: new Date().toISOString(),
          fileCount: plan.files.length,
        });

        for (const command of plan.commands) {
          if (await this.checkAbort()) {
            outcome = 'cancelled';
            await this.emit({
              type: 'sandbox-cancelled',
              timestamp: new Date().toISOString(),
              sandboxId: sandboxIdentity.id,
              name: sandboxIdentity.name,
              reason: `cancelled before command ${command.label}`,
            });
            break;
          }
          const commandResult = await this.runCommand(
            sandbox,
            command,
            plan.artifactPaths.telemetry,
          );
          commands.push(commandResult);

          if (commandResult.exitCode === 130) {
            // Cooperative abort during detached poll.
            outcome = 'cancelled';
            break;
          }

          if (command.required !== false && commandResult.exitCode !== 0) {
            outcome = 'failed';
            break;
          }
        }

        if (outcome === 'completed') {
          evidence = await this.readJsonArtifact(sandbox, plan.artifactPaths.evidence);
          telemetry = await this.readTextArtifact(sandbox, plan.artifactPaths.telemetry);
          await this.emit({
            type: 'artifacts-read',
            timestamp: new Date().toISOString(),
            evidencePresent: evidence !== null,
            telemetryPresent: telemetry !== null,
          });
        }
      }
    } finally {
      // stop() ends the session (persistent → auto-snapshot; non-persistent →
      // discard FS). For ephemeral hosts, also delete() so the named entity
      // and any residual snapshots do not linger / bill Snapshot Storage.
      if (this.stopAfterRun && sandbox.stop) {
        try {
          await sandbox.stop({ blocking: true });
          stopped = true;
        } catch {
          // Best-effort stop; still attempt delete for non-persistent.
        }
      }
      if (
        this.stopAfterRun &&
        createOptions.persistent !== true &&
        typeof sandbox.delete === 'function'
      ) {
        try {
          await sandbox.delete();
          deleted = true;
          await this.emit({
            type: 'sandbox-deleted',
            timestamp: new Date().toISOString(),
            sandboxId: sandboxIdentity.id,
            name: sandboxIdentity.name,
          });
        } catch {
          // delete may be unsupported on older SDK builds — stop is enough.
        }
      }
      await this.emit({
        type: 'sandbox-stopped',
        timestamp: new Date().toISOString(),
        stopped,
      });
    }

    return {
      sandboxId: sandboxIdentity.id,
      finalStatus: sandbox.status,
      manifest: plan.manifest,
      commands,
      artifacts: {
        evidence,
        telemetry,
      },
      outcome,
      stopped: stopped || deleted,
    };
  }

  private async checkAbort(): Promise<boolean> {
    if (!this.shouldAbort) return false;
    try {
      return Boolean(await this.shouldAbort());
    } catch {
      return false;
    }
  }

  private async runCommand(
    sandbox: SandboxSession,
    command: PipelineHostCommand,
    telemetryPath?: string
  ): Promise<PipelineHostCommandResult> {
    await this.emit({
      type: 'command-started',
      timestamp: new Date().toISOString(),
      label: command.label,
      cmd: command.cmd,
      args: command.args ?? [],
      cwd: command.cwd,
    });
    const startedAt = new Date().toISOString();
    let result: SandboxCommandResult | null = null;
    let stdout = '';
    let stderr = '';
    let exitCode: number | null = null;
    try {
      result = await sandbox.runCommand({
        cmd: command.cmd,
        args: command.args ?? [],
        cwd: command.cwd,
        env: command.env,
        sudo: command.sudo,
        detached: command.detached,
      });
      if (command.detached) {
        const detachedResult = await this.waitForDetachedCommand(sandbox, command, telemetryPath);
        exitCode = detachedResult.exitCode;
        stdout = detachedResult.stdout;
        stderr = detachedResult.stderr;
      } else {
        exitCode = result.exitCode;
        stdout = await readCommandOutput(result, 'stdout');
        stderr = await readCommandOutput(result, 'stderr');
      }
    } catch (error) {
      exitCode = 1;
      stderr = error instanceof Error ? error.message : String(error);
    }
    const completedAt = new Date().toISOString();
    const commandResult = {
      label: command.label,
      cmd: command.cmd,
      args: command.args ?? [],
      cwd: command.cwd,
      exitCode,
      stdout,
      stderr,
      startedAt,
      completedAt,
    };

    await this.emit({
      type: 'command-completed',
      timestamp: new Date().toISOString(),
      label: command.label,
      exitCode,
      stdoutLength: stdout.length,
      stderrLength: stderr.length,
      startedAt,
      completedAt,
    });

    return commandResult;
  }

  private async waitForDetachedCommand(
    sandbox: SandboxSession,
    command: PipelineHostCommand,
    telemetryPath?: string
  ): Promise<{ exitCode: number | null; stdout: string; stderr: string }> {
    const startedAt = Date.now();
    const maxWaitMs = command.maxWaitMs ?? 45 * 60 * 1000;
    const pollIntervalMs = command.pollIntervalMs ?? 5000;
    let emittedTelemetryLineCount = 0;

    if (!command.exitCodePath) {
      return {
        exitCode: null,
        stdout: '',
        stderr: 'Detached command is missing exitCodePath.',
      };
    }

    while (Date.now() - startedAt <= maxWaitMs) {
      if (await this.checkAbort()) {
        await this.emit({
          type: 'sandbox-cancelled',
          timestamp: new Date().toISOString(),
          sandboxId: sandbox.sandboxId ?? sandbox.name,
          name: sandbox.name,
          reason: `cancelled while waiting for ${command.label}`,
        });
        return {
          exitCode: 130,
          stdout: '',
          stderr: 'Host aborted: execution cancelled.',
        };
      }
      emittedTelemetryLineCount = await this.emitNewTelemetryArtifactEvents(
        sandbox,
        command,
        telemetryPath,
        emittedTelemetryLineCount
      );
      const exitCodeText = await this.readTextArtifact(sandbox, command.exitCodePath);
      if (exitCodeText !== null) {
        emittedTelemetryLineCount = await this.emitNewTelemetryArtifactEvents(
          sandbox,
          command,
          telemetryPath,
          emittedTelemetryLineCount
        );
        const parsedExitCode = Number.parseInt(exitCodeText.trim(), 10);
        const [stdout, stderr] = await Promise.all([
          command.stdoutPath ? this.readTextArtifact(sandbox, command.stdoutPath) : Promise.resolve(null),
          command.stderrPath ? this.readTextArtifact(sandbox, command.stderrPath) : Promise.resolve(null),
        ]);
        return {
          exitCode: Number.isFinite(parsedExitCode) ? parsedExitCode : 1,
          stdout: stdout ?? '',
          stderr: stderr ?? '',
        };
      }
      await sleep(pollIntervalMs);
    }

    emittedTelemetryLineCount = await this.emitNewTelemetryArtifactEvents(
      sandbox,
      command,
      telemetryPath,
      emittedTelemetryLineCount
    );
    const [stdout, stderr] = await Promise.all([
      command.stdoutPath ? this.readTextArtifact(sandbox, command.stdoutPath) : Promise.resolve(null),
      command.stderrPath ? this.readTextArtifact(sandbox, command.stderrPath) : Promise.resolve(null),
    ]);
    return {
      exitCode: 1,
      stdout: stdout ?? '',
      stderr: [
        stderr ?? '',
        `Detached command did not write ${command.exitCodePath} within ${maxWaitMs}ms.`,
      ].filter(Boolean).join('\n'),
    };
  }

  private async emitNewTelemetryArtifactEvents(
    sandbox: SandboxSession,
    command: PipelineHostCommand,
    telemetryPath: string | undefined,
    emittedLineCount: number
  ): Promise<number> {
    if (!telemetryPath) return emittedLineCount;
    const telemetry = await this.readTextArtifact(sandbox, telemetryPath);
    if (!telemetry) return emittedLineCount;

    const lines = telemetry.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const nextStartIndex = emittedLineCount > lines.length ? 0 : emittedLineCount;
    for (let index = nextStartIndex; index < lines.length; index += 1) {
      await this.emit({
        type: 'telemetry-artifact-event',
        timestamp: new Date().toISOString(),
        label: command.label,
        telemetryPath,
        lineNumber: index + 1,
        telemetryEvent: parseTelemetryLine(lines[index]),
      });
    }
    return lines.length;
  }

  private async readJsonArtifact(sandbox: SandboxSession, path: string): Promise<unknown | null> {
    const text = await this.readTextArtifact(sandbox, path);
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return {
        parseError: true,
        raw: text,
      };
    }
  }

  private async readTextArtifact(sandbox: SandboxSession, path: string): Promise<string | null> {
    const buffer = await sandbox.readFileToBuffer({ path });
    return buffer ? buffer.toString('utf8') : null;
  }

  private async emit(event: PipelineHostEvent): Promise<void> {
    if (!this.onEvent) return;
    await this.onEvent(event);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseTelemetryLine(line: string): unknown {
  try {
    return JSON.parse(line);
  } catch {
    return {
      parseError: true,
      raw: line,
    };
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  const timer = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timer]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}

function withVercelAccessTokenAuth(createOptions: PipelineHostPlan['createOptions']): PipelineHostPlan['createOptions'] {
  if (!process.env.VERCEL_TOKEN || process.env.VERCEL_OIDC_TOKEN) {
    return createOptions;
  }
  return {
    ...createOptions,
    token: createOptions.token ?? process.env.VERCEL_TOKEN,
    teamId: createOptions.teamId ?? process.env.VERCEL_TEAM_ID,
    projectId: createOptions.projectId ?? process.env.VERCEL_PROJECT_ID,
  };
}

/**
 * Enforce explicit create options for Vercel Sandbox v2:
 * - `persistent` defaults FALSE for Bitcode hosts (v2 SDK default is true)
 * - unique `name` always present for identity/logs
 */
export function normalizeCreateOptions(
  createOptions: PipelineHostPlan['createOptions'],
): PipelineHostPlan['createOptions'] {
  const persistent = createOptions.persistent === true;
  const name =
    (typeof createOptions.name === 'string' && createOptions.name.trim()) ||
    `bitcode-host-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    ...createOptions,
    persistent,
    name,
  };
}

function resolveSandboxIdentity(
  sandbox: SandboxSession,
  fallbackName?: string,
): { id?: string; name?: string } {
  const name =
    (typeof sandbox.name === 'string' && sandbox.name.trim()) ||
    (typeof fallbackName === 'string' && fallbackName.trim()) ||
    undefined;
  const id =
    (typeof sandbox.sandboxId === 'string' && sandbox.sandboxId.trim()) ||
    name ||
    undefined;
  return { id, name };
}

/**
 * Fail fast when neither OIDC nor access-token auth is configured for sandbox create.
 * Local: `vercel link && vercel env pull`. Prod: OIDC is automatic on Vercel.
 */
export function assertVercelSandboxAuthAvailable(
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (env.VERCEL_OIDC_TOKEN?.trim()) return;
  if (
    env.VERCEL_TOKEN?.trim() &&
    env.VERCEL_TEAM_ID?.trim() &&
    env.VERCEL_PROJECT_ID?.trim()
  ) {
    return;
  }
  throw new Error(
    'Vercel Sandbox auth is not configured. Prefer VERCEL_OIDC_TOKEN ' +
      '(`vercel link && vercel env pull`, auto on Vercel deploys) or set ' +
      'VERCEL_TOKEN + VERCEL_TEAM_ID + VERCEL_PROJECT_ID for access-token auth.',
  );
}

/**
 * Resolve the pure-ESM entry of `@vercel/sandbox` as a file:// URL.
 *
 * Package root resolution under Next/CJS serverless can load `dist/index.cjs`
 * → `command.cjs`, which does `require('@workflow/serde')`. That package is
 * pure ESM, so Node throws ERR_REQUIRE_ESM on Vercel `/var/task`. The ESM
 * graph (`dist/index.js`) imports serde correctly.
 */
export function resolveVercelSandboxEsmEntryHref(
  resolveId: (id: string) => string = defaultResolvePackageId,
): string {
  const root = resolveVercelSandboxPackageRoot(resolveId);
  const esmIndex = path.join(root, 'dist', 'index.js');
  return pathToFileURL(esmIndex).href;
}

export function resolveVercelSandboxPackageRoot(
  resolveId: (id: string) => string = defaultResolvePackageId,
): string {
  try {
    return path.dirname(resolveId('@vercel/sandbox/package.json'));
  } catch {
    // Incomplete exports / hoisting: resolve a runtime file and walk up until
    // package.json name is @vercel/sandbox.
    let dir = path.dirname(resolveId('@vercel/sandbox'));
    for (let i = 0; i < 8; i++) {
      const candidate = path.join(dir, 'package.json');
      try {
        const pkg = JSON.parse(fs.readFileSync(candidate, 'utf8')) as { name?: string };
        if (pkg.name === '@vercel/sandbox') return dir;
      } catch {
        // keep walking
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    throw new Error('Could not resolve @vercel/sandbox package root for ESM load.');
  }
}

function defaultResolvePackageId(id: string): string {
  // createRequire needs a filepath anchor; cwd package.json works under Next,
  // Jest, and monorepo package tests without import.meta.
  const req = createRequire(path.join(process.cwd(), 'package.json'));
  return req.resolve(id);
}

export async function loadVercelSandboxFactory(): Promise<SandboxFactory> {
  const esmHref = resolveVercelSandboxEsmEntryHref();
  // webpackIgnore: do not rewrite to a CJS interop chunk; load Node-native ESM.
  const module = (await import(
    /* webpackIgnore: true */
    esmHref
  )) as {
    Sandbox?: SandboxFactory;
    default?: SandboxFactory | { Sandbox?: SandboxFactory };
  };

  const fromDefault =
    module.default && typeof module.default === 'object'
      ? module.default.Sandbox
      : undefined;
  const Sandbox = module.Sandbox ?? fromDefault;
  if (!Sandbox?.create) {
    throw new Error(
      `@vercel/sandbox did not expose Sandbox.create() (ESM entry ${esmHref}).`,
    );
  }
  return Sandbox;
}

async function readCommandOutput(
  result: SandboxCommandResult,
  stream: 'stdout' | 'stderr'
): Promise<string> {
  const reader = result[stream];
  if (typeof reader === 'function') {
    return reader.call(result);
  }
  if (typeof result.output === 'function') {
    return result.output(stream);
  }
  return '';
}
