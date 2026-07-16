/**
 * LocalHost — local HostKind base implementation.
 *
 * Hierarchy: LocalHost extends BitcodePipelineHost primitive (host-generics).
 * Spec: BITCODE_SPEC_V48 G3-4 hostKind `local` (default when BITCODE_PIPELINE_HOST unset).
 *
 * Runs the pipeline in the CURRENT process and provisions via real `git clone` +
 * Node filesystem. SandboxHost (Vercel | AWS) is the other HostKind.
 *
 * Host law: LocalHost is laptop-only. Never clone in a serverless function.
 * Sandbox deposit clones inside the box during Setup using the same
 * `provisionGitWorkingTree` strategy (multi-step branch/commit), not at
 * Sandbox.create time.
 */

import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type {
  BitcodeHostCapabilities,
  BitcodeHostRepositorySource,
  BitcodeHostWorkspace,
  BitcodePipelineHost,
  HostCommandResult,
  HostExec,
} from '@bitcode/host-generics';
import { provisionGitWorkingTree } from '@bitcode/host-generics';

const CLONE_MAX_BUFFER = 64 * 1024 * 1024;

/** A real child-process exec, capturing exit code + output without throwing. */
export function defaultHostExec(): HostExec {
  return (cmd, args, opts) =>
    new Promise<HostCommandResult>((resolve) => {
      execFile(
        cmd,
        args,
        {
          cwd: opts?.cwd,
          env: opts?.env ? { ...process.env, ...opts.env } : process.env,
          maxBuffer: CLONE_MAX_BUFFER,
        },
        (error, stdout, stderr) => {
          const code =
            error && typeof (error as NodeJS.ErrnoException & { code?: unknown }).code === 'number'
              ? ((error as unknown as { code: number }).code)
              : error
                ? 1
                : 0;
          resolve({
            exitCode: code,
            stdout: stdout?.toString() ?? '',
            stderr: stderr?.toString() ?? '',
          });
        },
      );
    });
}

export interface LocalHostOptions {
  /** Injected command runner (default: real child-process exec). */
  exec?: HostExec;
  /** Where checkouts land (default: os.tmpdir()). */
  rootDir?: string;
}

function slug(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'repo';
}

function workspaceId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

class LocalHostWorkspace implements BitcodeHostWorkspace {
  constructor(
    readonly workspacePath: string,
    private readonly exec: HostExec,
  ) {}

  async listFiles(): Promise<string[]> {
    const result = await this.exec('git', ['-C', this.workspacePath, 'ls-files']);
    if (result.exitCode !== 0) return [];
    return result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  async readFile(relativePath: string): Promise<string | null> {
    const root = path.resolve(this.workspacePath);
    const absolute = path.resolve(this.workspacePath, relativePath);
    // Defense-in-depth: never read outside the checkout.
    if (absolute !== root && !absolute.startsWith(root + path.sep)) return null;
    try {
      return await fs.readFile(absolute, 'utf8');
    } catch {
      return null;
    }
  }

  async runCommand(cmd: string, args: string[] = []): Promise<HostCommandResult> {
    return this.exec(cmd, args, { cwd: this.workspacePath });
  }

  async dispose(): Promise<void> {
    try {
      await fs.rm(this.workspacePath, { recursive: true, force: true });
    } catch {
      // Best-effort cleanup; an ephemeral host is reclaimed anyway.
    }
  }
}

/** Build a workspace handle over an existing checkout path (Setup in-box path). */
export function createLocalHostWorkspace(
  workspacePath: string,
  exec: HostExec = defaultHostExec(),
): BitcodeHostWorkspace {
  return new LocalHostWorkspace(workspacePath, exec);
}

export class LocalHost implements BitcodePipelineHost {
  private readonly exec: HostExec;
  private readonly rootDir: string;

  constructor(options: LocalHostOptions = {}) {
    this.exec = options.exec ?? defaultHostExec();
    this.rootDir = options.rootDir ?? os.tmpdir();
  }

  get capabilities(): BitcodeHostCapabilities {
    return {
      hostKind: 'local',
      clone: true,
      filesystem: true,
      exec: true,
      ephemeralFilesystem: true,
      defaultWorkingDirectory: this.rootDir,
    };
  }

  async provisionRepository(source: BitcodeHostRepositorySource): Promise<BitcodeHostWorkspace> {
    const workspacePath = path.join(
      this.rootDir,
      `bitcode-local-host-${slug(source.repositoryFullName)}-${workspaceId()}`,
    );
    await provisionGitWorkingTree({
      url: source.url,
      username: source.username,
      password: source.password,
      branch: source.branch,
      commit: source.commit,
      revision: source.revision,
      workspacePath,
      exec: this.exec,
    });
    return new LocalHostWorkspace(workspacePath, this.exec);
  }
}
