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
      // Source-safe: image ref only (no tokens). Helps diagnose create 400s.
      image: createOptions.image ?? null,
      mode: plan.manifest.hostMode,
      hasSource: Boolean(createOptions.source),
      persistent: createOptions.persistent === true,
    } as PipelineHostEvent);
    let sandbox: SandboxSession;
    try {
      sandbox = await withTimeout(
        this.sandboxFactory.create(withVercelAccessTokenAuth(createOptions)),
        this.sandboxCreateTimeoutMs,
        `Vercel Sandbox create did not complete within ${this.sandboxCreateTimeoutMs}ms.`,
      );
    } catch (error) {
      throw new Error(formatSandboxApiError(error, 'Sandbox.create'), { cause: error });
    }
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
  const image =
    typeof createOptions.image === 'string' && createOptions.image.trim()
      ? createOptions.image.trim()
      : undefined;
  // Vercel SDK: runtime and image are mutually exclusive.
  const { runtime: _runtime, image: _image, ...rest } = createOptions;
  // Cap session timeout — excessive values can yield API 400 from Sandbox create.
  const rawTimeout =
    typeof createOptions.timeout === 'number' && Number.isFinite(createOptions.timeout)
      ? createOptions.timeout
      : undefined;
  const timeout =
    typeof rawTimeout === 'number'
      ? Math.min(Math.max(rawTimeout, 60_000), 45 * 60 * 1000)
      : undefined;
  return {
    ...rest,
    persistent,
    name,
    ...(typeof timeout === 'number' ? { timeout } : {}),
    ...(image ? { image } : { runtime: createOptions.runtime }),
  };
}

/**
 * Expand Vercel Sandbox SDK APIError ("Status code 400 is not ok") with response
 * body fields so Production logs / UI can show the real reject reason.
 */
export function formatSandboxApiError(error: unknown, phase: string): string {
  if (!(error instanceof Error)) {
    return `${phase} failed: ${String(error)}`;
  }
  const anyErr = error as Error & {
    json?: unknown;
    text?: string;
    response?: { status?: number; statusText?: string };
    sandboxName?: string;
  };
  const status = anyErr.response?.status;
  const statusText = anyErr.response?.statusText;
  let detail = '';
  if (anyErr.json && typeof anyErr.json === 'object') {
    const body = anyErr.json as Record<string, unknown>;
    const msg =
      (typeof body.message === 'string' && body.message) ||
      (typeof body.error === 'string' && body.error) ||
      (body.error &&
        typeof body.error === 'object' &&
        typeof (body.error as { message?: string }).message === 'string' &&
        (body.error as { message: string }).message) ||
      null;
    const code =
      (typeof body.code === 'string' && body.code) ||
      (body.error &&
        typeof body.error === 'object' &&
        typeof (body.error as { code?: string }).code === 'string' &&
        (body.error as { code: string }).code) ||
      null;
    detail = [code, msg].filter(Boolean).join(': ');
    if (!detail) {
      try {
        detail = JSON.stringify(body).slice(0, 400);
      } catch {
        detail = '';
      }
    }
  } else if (typeof anyErr.text === 'string' && anyErr.text.trim()) {
    detail = anyErr.text.trim().slice(0, 400);
  }
  const base = error.message?.trim() || 'unknown error';
  const statusPart =
    typeof status === 'number' ? `HTTP ${status}${statusText ? ` ${statusText}` : ''}` : null;
  const parts = [`${phase} failed`, statusPart, base !== `Status code ${status} is not ok` ? base : null, detail]
    .filter(Boolean)
    .filter((part, index, arr) => arr.indexOf(part) === index);
  return parts.join(' — ');
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
 * Locate the installed `@vercel/sandbox` package root.
 *
 * Avoids `createRequire(...).resolve` as the only strategy: Next/webpack can
 * leave `createRequire` unusable on Vercel (`undefined.resolve` → immediate
 * "Cannot read properties of undefined (reading 'resolve')"). Prefer
 * filesystem discovery under cwd `node_modules` (and pnpm layout), then a
 * guarded createRequire fallback for local/Jest.
 */
export function resolveVercelSandboxPackageRoot(
  resolveId?: (id: string) => string,
): string {
  if (resolveId) {
    try {
      return path.dirname(resolveId('@vercel/sandbox/package.json'));
    } catch {
      let dir = path.dirname(resolveId('@vercel/sandbox'));
      for (let i = 0; i < 8; i++) {
        const candidate = path.join(dir, 'package.json');
        if (readPackageName(candidate) === '@vercel/sandbox') return dir;
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
      }
    }
  }

  const cwd = process.cwd();
  const directCandidates = [
    path.join(cwd, 'node_modules', '@vercel', 'sandbox'),
    path.join(cwd, '..', 'node_modules', '@vercel', 'sandbox'),
    // Next standalone / monorepo traces sometimes nest under .next
    path.join(cwd, '.next', 'standalone', 'node_modules', '@vercel', 'sandbox'),
    path.join(cwd, '.next', 'server', 'node_modules', '@vercel', 'sandbox'),
  ];
  for (const dir of directCandidates) {
    if (readPackageName(path.join(dir, 'package.json')) === '@vercel/sandbox') {
      return dir;
    }
  }

  // pnpm virtual store: node_modules/.pnpm/@vercel+sandbox@*/node_modules/@vercel/sandbox
  for (const base of [cwd, path.join(cwd, '..')]) {
    const pnpmRoot = path.join(base, 'node_modules', '.pnpm');
    if (!fs.existsSync(pnpmRoot)) continue;
    let entries: string[] = [];
    try {
      entries = fs.readdirSync(pnpmRoot);
    } catch {
      continue;
    }
    const matches = entries
      .filter((name) => name.startsWith('@vercel+sandbox@'))
      .sort()
      .reverse();
    for (const name of matches) {
      const dir = path.join(pnpmRoot, name, 'node_modules', '@vercel', 'sandbox');
      if (readPackageName(path.join(dir, 'package.json')) === '@vercel/sandbox') {
        return dir;
      }
    }
  }

  const fromRequire = tryCreateRequireResolve('@vercel/sandbox/package.json');
  if (fromRequire) return path.dirname(fromRequire);

  const fromRuntime = tryCreateRequireResolve('@vercel/sandbox');
  if (fromRuntime) {
    let dir = path.dirname(fromRuntime);
    for (let i = 0; i < 8; i++) {
      if (readPackageName(path.join(dir, 'package.json')) === '@vercel/sandbox') {
        return dir;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  throw new Error(
    'Could not resolve @vercel/sandbox package root for ESM load ' +
      `(cwd=${cwd}). Ensure @vercel/sandbox is installed for the server runtime.`,
  );
}

export function resolveVercelSandboxEsmEntryHref(
  resolveId?: (id: string) => string,
): string {
  const root = resolveVercelSandboxPackageRoot(resolveId);
  const esmIndex = path.join(root, 'dist', 'index.js');
  // Only enforce on-disk presence for live discovery (not unit-test injectors).
  if (!resolveId && !fs.existsSync(esmIndex)) {
    throw new Error(
      `@vercel/sandbox ESM entry missing at ${esmIndex} (package root ${root}).`,
    );
  }
  return pathToFileURL(esmIndex).href;
}

function readPackageName(packageJsonPath: string): string | null {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as { name?: string };
    return typeof pkg.name === 'string' ? pkg.name : null;
  } catch {
    return null;
  }
}

function tryCreateRequireResolve(id: string): string | null {
  try {
    const createReq = createRequire as unknown as
      | ((filename: string) => NodeRequire)
      | undefined;
    if (typeof createReq !== 'function') return null;

    const anchors = [
      path.join(process.cwd(), 'package.json'),
      path.join(process.cwd(), 'node_modules', '@vercel', 'sandbox', 'package.json'),
      // Prefer a real file when present so createRequire is valid under Next.
      path.join(process.cwd(), 'node_modules', '@vercel', 'sandbox', 'dist', 'index.js'),
    ];
    for (const anchor of anchors) {
      try {
        const req = createReq(anchor);
        if (!req || typeof req.resolve !== 'function') continue;
        return req.resolve(id);
      } catch {
        // try next anchor
      }
    }
  } catch {
    // createRequire unavailable in this runtime
  }
  return null;
}

function extractSandboxFactory(loaded: {
  Sandbox?: SandboxFactory;
  default?: unknown;
}): SandboxFactory | null {
  if (loaded.Sandbox?.create) return loaded.Sandbox;
  if (loaded.default && typeof loaded.default === 'object') {
    const defaultExport = loaded.default as {
      Sandbox?: SandboxFactory;
      create?: SandboxFactory['create'];
    };
    if (defaultExport.Sandbox?.create) return defaultExport.Sandbox;
    if (typeof defaultExport.create === 'function') {
      return defaultExport as SandboxFactory;
    }
  }
  return null;
}

/**
 * Load Sandbox.create without hitting the dual-package CJS hazard.
 *
 * 1) webpackIgnore import of package name (Node uses the ESM "import" export)
 * 2) file:// import of dist/index.js after filesystem root discovery
 *
 * Plain `import('@vercel/sandbox')` without webpackIgnore can be rewritten to
 * CJS require → command.cjs → require(@workflow/serde) → ERR_REQUIRE_ESM.
 */
export async function loadVercelSandboxFactory(): Promise<SandboxFactory> {
  const errors: string[] = [];

  try {
    const loaded = (await import(
      /* webpackIgnore: true */
      '@vercel/sandbox'
    )) as { Sandbox?: SandboxFactory; default?: unknown };
    const factory = extractSandboxFactory(loaded);
    if (factory) return factory;
    errors.push('package import missing Sandbox.create');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`package import: ${message.slice(0, 240)}`);
  }

  try {
    const esmHref = resolveVercelSandboxEsmEntryHref();
    const loaded = (await import(
      /* webpackIgnore: true */
      esmHref
    )) as { Sandbox?: SandboxFactory; default?: unknown };
    const factory = extractSandboxFactory(loaded);
    if (factory) return factory;
    errors.push(`file import missing Sandbox.create (${esmHref})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`file import: ${message.slice(0, 240)}`);
  }

  throw new Error(
    `@vercel/sandbox could not be loaded for host dispatch. ${errors.join(' | ')}`,
  );
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
