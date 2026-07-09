import { AwsSandboxHost, VercelSandboxHost } from '../sandbox-host';
import { readWorkspaceSources } from '../host';
import type { SandboxCreateOptions, SandboxFactory, SandboxSession } from '../types';

const FILES: Record<string, string> = {
  'README.md': '# Demo',
  'src/app.ts': 'export function main() {}',
};

function mockFactory() {
  const createCalls: SandboxCreateOptions[] = [];
  let stopped = false;
  const session: SandboxSession = {
    sandboxId: 'sbx-1',
    status: 'running',
    writeFiles: async () => {},
    runCommand: (async (params: any) => {
      if (params?.cmd === 'git' && params?.args?.includes('ls-files')) {
        return { exitCode: 0, stdout: async () => Object.keys(FILES).join('\n'), stderr: async () => '' };
      }
      return { exitCode: 0, stdout: async () => 'ok', stderr: async () => '' };
    }) as SandboxSession['runCommand'],
    readFileToBuffer: async ({ path }: { path: string }) => {
      const rel = path.replace('/vercel/sandbox/', '');
      return FILES[rel] != null ? Buffer.from(FILES[rel]) : null;
    },
    stop: async () => {
      stopped = true;
      return undefined;
    },
  };
  const sandboxFactory: SandboxFactory = {
    create: async (options) => {
      createCalls.push(options);
      return session;
    },
  };
  return { sandboxFactory, createCalls, isStopped: () => stopped };
}

describe('VercelSandboxHost (primitive Host implementation)', () => {
  it('reports sandbox capabilities with the vercel provider', () => {
    const { sandboxFactory } = mockFactory();
    const host = new VercelSandboxHost({ sandboxFactory });
    expect(host.capabilities).toMatchObject({
      hostKind: 'sandbox',
      sandboxProvider: 'vercel',
      clone: true,
      filesystem: true,
      exec: true,
      defaultWorkingDirectory: '/vercel/sandbox',
    });
  });

  it('AwsSandboxHost is the stubbed provider seam', async () => {
    const host = new AwsSandboxHost();
    expect(host.capabilities).toMatchObject({ hostKind: 'sandbox', sandboxProvider: 'aws', clone: true });
    await expect(
      host.provisionRepository({ repositoryFullName: 'o/r', url: 'https://github.com/o/r.git', revision: 'main' }),
    ).rejects.toThrow(/not yet implemented/i);
  });

  it('provisions via a git source and exposes the checkout filesystem', async () => {
    const { sandboxFactory, createCalls, isStopped } = mockFactory();
    const host = new VercelSandboxHost({ sandboxFactory });

    const ws = await host.provisionRepository({
      repositoryFullName: 'o/r',
      url: 'https://github.com/o/r.git',
      revision: 'abc123',
      password: 'tok',
    });

    // The sandbox was created with a git source at the revision.
    expect(createCalls).toHaveLength(1);
    expect(createCalls[0].source).toMatchObject({
      type: 'git',
      url: 'https://github.com/o/r.git',
      revision: 'abc123',
      password: 'tok',
    });
    expect(ws.workspacePath).toBe('/vercel/sandbox');

    // listFiles via git ls-files; readFile via readFileToBuffer.
    expect((await ws.listFiles()).sort()).toEqual(['README.md', 'src/app.ts']);
    expect(await ws.readFile('src/app.ts')).toBe('export function main() {}');
    expect(await ws.readFile('../escape')).toBeNull(); // traversal guarded

    // readWorkspaceSources bridges it identically to the inline host.
    const sources = await readWorkspaceSources(ws, { paths: ['README.md'] });
    expect(sources).toEqual([{ path: 'README.md', content: '# Demo' }]);

    await ws.dispose();
    expect(isStopped()).toBe(true);
  });

  it('runCommand surfaces exit code + output', async () => {
    const { sandboxFactory } = mockFactory();
    const host = new VercelSandboxHost({ sandboxFactory });
    const ws = await host.provisionRepository({ repositoryFullName: 'o/r', url: 'https://github.com/o/r.git', revision: 'main' });
    const result = await ws.runCommand('echo', ['hi']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('ok');
  });
});
