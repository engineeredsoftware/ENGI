/**
 * InlineHost — the in-process HostKind of the primitive Host (V48 Gate 3).
 *
 * Runs the pipeline in the CURRENT box and provisions a repository by performing a
 * REAL `git clone` of the full working tree to a local working directory, exposing
 * that checkout via the Node filesystem. SandboxHost (provider Vercel | AWS) is the
 * other HostKind of the same `BitcodePipelineHost` primitive — it runs the pipeline
 * inside a provisioned box. Both require git + a filesystem (every host has them).
 *
 * The git/filesystem mechanics go through an injected `HostExec` (default: a real
 * child-process exec) so the host is fully testable without git or a network.
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
} from './host';

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

export interface InlineHostOptions {
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

/** Inject clone credentials into an https URL (token in password). */
function withAuth(url: string, username?: string, password?: string): string {
  if (!password) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return url;
    parsed.username = username || 'x-access-token';
    parsed.password = password;
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Redact a credentialed URL from any surfaced error text. */
function redact(text: string): string {
  return text.replace(/https:\/\/[^@\s]+@/g, 'https://***@');
}

class InlineHostWorkspace implements BitcodeHostWorkspace {
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

export class InlineHost implements BitcodePipelineHost {
  private readonly exec: HostExec;
  private readonly rootDir: string;

  constructor(options: InlineHostOptions = {}) {
    this.exec = options.exec ?? defaultHostExec();
    this.rootDir = options.rootDir ?? os.tmpdir();
  }

  get capabilities(): BitcodeHostCapabilities {
    return {
      hostKind: 'inline',
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
      `bitcode-inline-host-${slug(source.repositoryFullName)}-${workspaceId()}`,
    );
    const url = withAuth(source.url, source.username, source.password);
    // Full clone (every blob of the working tree); then check out the revision.
    const clone = await this.exec('git', ['clone', url, workspacePath]);
    if (clone.exitCode !== 0) {
      throw new Error(`InlineHost git clone failed (exit ${clone.exitCode}): ${redact(clone.stderr).trim()}`);
    }
    if (source.revision) {
      const checkout = await this.exec('git', ['-C', workspacePath, 'checkout', source.revision]);
      if (checkout.exitCode !== 0) {
        throw new Error(
          `InlineHost checkout ${source.revision} failed (exit ${checkout.exitCode}): ${redact(checkout.stderr).trim()}`,
        );
      }
    }
    return new InlineHostWorkspace(workspacePath, this.exec);
  }
}
