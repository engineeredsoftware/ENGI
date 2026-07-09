import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { InlineHost, type InlineHostOptions } from '../inline-host';
import { readWorkspaceSources, type HostExec } from '../host';

const FIXTURE: Record<string, string> = {
  'README.md': '# Demo\nA demo project.',
  'src/app.ts': 'export function main() {}\nexport interface Config { port: number }',
  'src/util.ts': 'export const helper = () => 42',
};

// A fake exec that simulates `git clone` (writes the fixture into the dest dir),
// `git ls-files` (returns the fixture paths), and `git checkout` (no-op).
function fakeExec(): { exec: HostExec; calls: string[][] } {
  const calls: string[][] = [];
  const exec: HostExec = async (cmd, args) => {
    calls.push([cmd, ...args]);
    if (cmd === 'git' && args[0] === 'clone') {
      const dest = args[args.length - 1];
      await fs.mkdir(dest, { recursive: true });
      for (const [rel, content] of Object.entries(FIXTURE)) {
        const abs = path.join(dest, rel);
        await fs.mkdir(path.dirname(abs), { recursive: true });
        await fs.writeFile(abs, content);
      }
      return { exitCode: 0, stdout: '', stderr: '' };
    }
    if (cmd === 'git' && args.includes('ls-files')) {
      return { exitCode: 0, stdout: Object.keys(FIXTURE).join('\n'), stderr: '' };
    }
    return { exitCode: 0, stdout: '', stderr: '' };
  };
  return { exec, calls };
}

describe('InlineHost (primitive Host implementation)', () => {
  let rootDir: string;
  afterEach(async () => {
    if (rootDir) await fs.rm(rootDir, { recursive: true, force: true });
  });
  async function makeRoot() {
    rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'inline-host-test-'));
    return rootDir;
  }

  it('reports inline capabilities (clone + filesystem + exec)', async () => {
    const host = new InlineHost({ exec: fakeExec().exec, rootDir: await makeRoot() });
    expect(host.capabilities).toMatchObject({
      hostKind: 'inline',
      clone: true,
      filesystem: true,
      exec: true,
      ephemeralFilesystem: true,
    });
  });

  it('provisions a full checkout (clone + checkout) and exposes the filesystem', async () => {
    const { exec, calls } = fakeExec();
    const host = new InlineHost({ exec, rootDir: await makeRoot() });
    const ws = await host.provisionRepository({
      repositoryFullName: 'engineeredsoftware/demo',
      url: 'https://github.com/engineeredsoftware/demo.git',
      revision: 'abc123',
    });

    // Clone happened, then checkout of the revision.
    expect(calls.some((c) => c[0] === 'git' && c[1] === 'clone')).toBe(true);
    expect(calls.some((c) => c.includes('checkout') && c.includes('abc123'))).toBe(true);

    // listFiles -> the tracked set; readFile -> verbatim content.
    expect((await ws.listFiles()).sort()).toEqual(Object.keys(FIXTURE).sort());
    expect(await ws.readFile('src/app.ts')).toBe(FIXTURE['src/app.ts']);
    expect(await ws.readFile('does/not/exist.ts')).toBeNull();

    await ws.dispose();
    await expect(fs.stat(ws.workspacePath)).rejects.toBeDefined(); // removed
  });

  it('readFile refuses path traversal outside the checkout', async () => {
    const host = new InlineHost({ exec: fakeExec().exec, rootDir: await makeRoot() });
    const ws = await host.provisionRepository({
      repositoryFullName: 'o/r',
      url: 'https://github.com/o/r.git',
      revision: 'main',
    });
    expect(await ws.readFile('../../etc/passwd')).toBeNull();
  });

  it('readWorkspaceSources reads full content (all, subset, and bounded)', async () => {
    const host = new InlineHost({ exec: fakeExec().exec, rootDir: await makeRoot() });
    const ws = await host.provisionRepository({
      repositoryFullName: 'o/r',
      url: 'https://github.com/o/r.git',
      revision: 'main',
    });

    const all = await readWorkspaceSources(ws);
    expect(all).toHaveLength(3);
    expect(all.find((f) => f.path === 'src/app.ts')?.content).toBe(FIXTURE['src/app.ts']);

    const subset = await readWorkspaceSources(ws, { paths: ['src/util.ts'] });
    expect(subset).toEqual([{ path: 'src/util.ts', content: FIXTURE['src/util.ts'] }]);

    const bounded = await readWorkspaceSources(ws, { paths: ['README.md'], maxBytesPerFile: 6 });
    expect(bounded[0].content).toBe('# Demo');
  });

  it('injects credentials into the clone URL and redacts them on failure', async () => {
    const calls: string[][] = [];
    const failingExec: HostExec = async (cmd, args) => {
      calls.push([cmd, ...args]);
      // Fail the clone, echoing the (credentialed) URL in stderr.
      const url = args[args.length - 2] ?? '';
      return { exitCode: 128, stdout: '', stderr: `fatal: could not read from ${url}` };
    };
    const host = new InlineHost({ exec: failingExec, rootDir: await makeRoot() });
    await expect(
      host.provisionRepository({
        repositoryFullName: 'o/r',
        url: 'https://github.com/o/r.git',
        revision: 'main',
        password: 'ghs_secrettoken',
      }),
    ).rejects.toThrow(/InlineHost git clone failed/);

    const cloneCall = calls.find((c) => c[1] === 'clone')!;
    const urlArg = cloneCall[2];
    expect(urlArg).toContain('ghs_secrettoken'); // token injected into the clone URL
    // The thrown error must NOT leak the token (redacted).
    await host
      .provisionRepository({ repositoryFullName: 'o/r', url: 'https://github.com/o/r.git', revision: 'main', password: 'ghs_secrettoken' })
      .catch((err: Error) => {
        expect(err.message).not.toContain('ghs_secrettoken');
        expect(err.message).toContain('***');
      });
  });
});
