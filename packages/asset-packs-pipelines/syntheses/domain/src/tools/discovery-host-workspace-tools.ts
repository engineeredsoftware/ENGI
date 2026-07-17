/**
 * Host workspace inspection tools for Discovery codebase comprehension.
 *
 * Read-only (and allowlisted shell) tools so Try/Retry can:
 * - read many files with different paths
 * - list directories under the Host checkout
 * - run bounded inspection commands (rg, ls, find, head, …)
 *
 * Paths are always resolved under workspaceRoot — never escape the checkout.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { Tool } from '@bitcode/tools-generics';

export const HOST_WORKSPACE_TOOL_NAMES = {
  readFile: 'host-workspace-read-file',
  listDir: 'host-workspace-list-dir',
  runCommand: 'host-workspace-run-command',
} as const;

const DEFAULT_MAX_BYTES = 48_000;
const DEFAULT_MAX_ENTRIES = 200;

function resolveUnderRoot(workspaceRoot: string, relPath: string): string | null {
  const root = path.resolve(String(workspaceRoot || '').trim() || process.cwd());
  const target = path.resolve(root, String(relPath || '').replace(/^\//, ''));
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}

async function readFileBounded(input: {
  workspaceRoot?: string;
  path?: string;
  maxBytes?: number;
}): Promise<{
  ok: boolean;
  path: string;
  content?: string;
  truncated?: boolean;
  sizeBytes?: number;
  error?: string;
}> {
  const rel = String(input?.path || '').trim();
  const root = String(input?.workspaceRoot || '').trim();
  if (!rel) return { ok: false, path: rel, error: 'path required' };
  if (!root) return { ok: false, path: rel, error: 'workspaceRoot required' };
  const abs = resolveUnderRoot(root, rel);
  if (!abs) return { ok: false, path: rel, error: 'path escapes workspaceRoot' };
  const maxBytes = Math.max(1024, Math.min(200_000, Number(input?.maxBytes) || DEFAULT_MAX_BYTES));
  try {
    const buf = await fs.readFile(abs);
    const truncated = buf.length > maxBytes;
    const content = buf.subarray(0, maxBytes).toString('utf8');
    return {
      ok: true,
      path: rel,
      content,
      truncated,
      sizeBytes: buf.length,
    };
  } catch (err) {
    return {
      ok: false,
      path: rel,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function listDirBounded(input: {
  workspaceRoot?: string;
  path?: string;
  maxEntries?: number;
}): Promise<{
  ok: boolean;
  path: string;
  entries?: Array<{ name: string; type: 'file' | 'dir' | 'other' }>;
  truncated?: boolean;
  error?: string;
}> {
  const rel = String(input?.path || '.').trim() || '.';
  const root = String(input?.workspaceRoot || '').trim();
  if (!root) return { ok: false, path: rel, error: 'workspaceRoot required' };
  const abs = resolveUnderRoot(root, rel === '.' ? '' : rel);
  if (!abs) return { ok: false, path: rel, error: 'path escapes workspaceRoot' };
  const maxEntries = Math.max(10, Math.min(1000, Number(input?.maxEntries) || DEFAULT_MAX_ENTRIES));
  try {
    const names = await fs.readdir(abs);
    const slice = names.slice(0, maxEntries);
    const entries: Array<{ name: string; type: 'file' | 'dir' | 'other' }> = [];
    for (const name of slice) {
      try {
        const st = await fs.stat(path.join(abs, name));
        entries.push({
          name,
          type: st.isDirectory() ? 'dir' : st.isFile() ? 'file' : 'other',
        });
      } catch {
        entries.push({ name, type: 'other' });
      }
    }
    return {
      ok: true,
      path: rel,
      entries,
      truncated: names.length > maxEntries,
    };
  } catch (err) {
    return {
      ok: false,
      path: rel,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Allowlisted inspection binaries only (no shell metacharacters). */
const ALLOWED_COMMANDS = new Set([
  'ls',
  'find',
  'rg',
  'grep',
  'head',
  'tail',
  'wc',
  'file',
  'cat',
  'stat',
  'pwd',
  'git',
]);

const FORBIDDEN_GIT_SUB = new Set([
  'push',
  'pull',
  'fetch',
  'commit',
  'reset',
  'checkout',
  'merge',
  'rebase',
  'clean',
  'add',
  'rm',
  'mv',
  'config',
]);

async function runCommandBounded(input: {
  workspaceRoot?: string;
  command?: string;
  args?: string[];
  timeoutMs?: number;
  maxOutputBytes?: number;
}): Promise<{
  ok: boolean;
  command: string;
  args: string[];
  exitCode: number | null;
  stdout: string;
  stderr: string;
  error?: string;
}> {
  const root = String(input?.workspaceRoot || '').trim();
  const command = String(input?.command || '').trim();
  const args = Array.isArray(input?.args)
    ? input!.args.map((a) => String(a))
    : [];
  if (!root) {
    return {
      ok: false,
      command,
      args,
      exitCode: null,
      stdout: '',
      stderr: '',
      error: 'workspaceRoot required',
    };
  }
  if (!command || !ALLOWED_COMMANDS.has(command)) {
    return {
      ok: false,
      command,
      args,
      exitCode: null,
      stdout: '',
      stderr: '',
      error: `command not allowlisted (allowed: ${[...ALLOWED_COMMANDS].join(', ')})`,
    };
  }
  if (command === 'git') {
    const sub = (args[0] || '').toLowerCase();
    if (FORBIDDEN_GIT_SUB.has(sub)) {
      return {
        ok: false,
        command,
        args,
        exitCode: null,
        stdout: '',
        stderr: '',
        error: `git subcommand forbidden: ${sub}`,
      };
    }
  }
  // Reject args that try to escape via shell meta or absolute paths outside root.
  for (const a of args) {
    if (/[;&|`$<>]/.test(a)) {
      return {
        ok: false,
        command,
        args,
        exitCode: null,
        stdout: '',
        stderr: '',
        error: 'args must not contain shell metacharacters',
      };
    }
  }

  const timeoutMs = Math.max(500, Math.min(30_000, Number(input?.timeoutMs) || 8_000));
  const maxOutputBytes = Math.max(1024, Math.min(200_000, Number(input?.maxOutputBytes) || 32_000));

  return await new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: root,
      env: { ...process.env, PATH: process.env.PATH },
      shell: false,
    });
    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    let settled = false;
    const finish = (payload: {
      ok: boolean;
      exitCode: number | null;
      error?: string;
    }) => {
      if (settled) return;
      settled = true;
      resolve({
        ok: payload.ok,
        command,
        args,
        exitCode: payload.exitCode,
        stdout: stdout.subarray(0, maxOutputBytes).toString('utf8'),
        stderr: stderr.subarray(0, maxOutputBytes).toString('utf8'),
        error: payload.error,
      });
    };
    const timer = setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch {
        /* ignore */
      }
      finish({ ok: false, exitCode: null, error: `timeout after ${timeoutMs}ms` });
    }, timeoutMs);
    child.stdout?.on('data', (chunk: Buffer) => {
      stdout = Buffer.concat([stdout, chunk]);
      if (stdout.length > maxOutputBytes * 2) {
        try {
          child.kill('SIGKILL');
        } catch {
          /* ignore */
        }
      }
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr = Buffer.concat([stderr, chunk]);
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      finish({
        ok: false,
        exitCode: null,
        error: err instanceof Error ? err.message : String(err),
      });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      finish({ ok: code === 0, exitCode: code });
    });
  });
}

export class HostWorkspaceReadFileTool extends Tool<typeof readFileBounded> {
  name = HOST_WORKSPACE_TOOL_NAMES.readFile;
  use = readFileBounded;
}

export class HostWorkspaceListDirTool extends Tool<typeof listDirBounded> {
  name = HOST_WORKSPACE_TOOL_NAMES.listDir;
  use = listDirBounded;
}

export class HostWorkspaceRunCommandTool extends Tool<typeof runCommandBounded> {
  name = HOST_WORKSPACE_TOOL_NAMES.runCommand;
  use = runCommandBounded;
}

export const hostWorkspaceReadFileTool = new HostWorkspaceReadFileTool();
export const hostWorkspaceListDirTool = new HostWorkspaceListDirTool();
export const hostWorkspaceRunCommandTool = new HostWorkspaceRunCommandTool();

export const DISCOVERY_HOST_WORKSPACE_TOOLS: Tool[] = [
  hostWorkspaceReadFileTool,
  hostWorkspaceListDirTool,
  hostWorkspaceRunCommandTool,
];

export {
  readFileBounded as runHostWorkspaceReadFile,
  listDirBounded as runHostWorkspaceListDir,
  runCommandBounded as runHostWorkspaceRunCommand,
};
