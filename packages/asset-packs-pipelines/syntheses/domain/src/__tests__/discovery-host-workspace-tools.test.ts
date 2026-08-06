/**
 * Host workspace tools for Discovery codebase Try multi-tool exploration.
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  HOST_WORKSPACE_TOOL_NAMES,
  runHostWorkspaceListDir,
  runHostWorkspaceReadFile,
  runHostWorkspaceRunCommand,
} from '../tools/discovery-host-workspace-tools';

describe('discovery host workspace tools', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bitcode-host-ws-'));

  beforeAll(() => {
    fs.writeFileSync(path.join(root, 'hello.js'), 'export const x = 1;\n', 'utf8');
    fs.mkdirSync(path.join(root, 'src'));
    fs.writeFileSync(path.join(root, 'src', 'a.ts'), 'export type A = number;\n', 'utf8');
  });

  afterAll(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('exports stable registry names', () => {
    expect(HOST_WORKSPACE_TOOL_NAMES.readFile).toBe('host-workspace-read-file');
    expect(HOST_WORKSPACE_TOOL_NAMES.listDir).toBe('host-workspace-list-dir');
    expect(HOST_WORKSPACE_TOOL_NAMES.runCommand).toBe('host-workspace-run-command');
  });

  it('reads files under workspaceRoot and refuses escape', async () => {
    const ok = await runHostWorkspaceReadFile({
      workspaceRoot: root,
      path: 'hello.js',
    });
    expect(ok.ok).toBe(true);
    expect(ok.content).toContain('export const x');

    // Models often pass workspacePath (same as Host checkout path).
    const alias = await runHostWorkspaceReadFile({
      workspacePath: root,
      path: 'hello.js',
    } as any);
    expect(alias.ok).toBe(true);

    const escape = await runHostWorkspaceReadFile({
      workspaceRoot: root,
      path: '../outside',
    });
    expect(escape.ok).toBe(false);
  });

  it('lists directories', async () => {
    const listed = await runHostWorkspaceListDir({
      workspaceRoot: root,
      path: '.',
    });
    expect(listed.ok).toBe(true);
    expect(listed.entries?.some((e) => e.name === 'src')).toBe(true);
  });

  it('runs allowlisted commands and rejects shell meta / forbidden git', async () => {
    const ls = await runHostWorkspaceRunCommand({
      workspaceRoot: root,
      command: 'ls',
      args: ['-1'],
    });
    expect(ls.ok).toBe(true);
    expect(ls.stdout).toMatch(/hello\.js|src/);

    const bad = await runHostWorkspaceRunCommand({
      workspaceRoot: root,
      command: 'rm',
      args: ['-rf', '/'],
    });
    expect(bad.ok).toBe(false);

    const meta = await runHostWorkspaceRunCommand({
      workspaceRoot: root,
      command: 'ls',
      args: ['; echo pwned'],
    });
    expect(meta.ok).toBe(false);

    const gitPush = await runHostWorkspaceRunCommand({
      workspaceRoot: root,
      command: 'git',
      args: ['push', 'origin', 'main'],
    });
    expect(gitPush.ok).toBe(false);
  });
});
