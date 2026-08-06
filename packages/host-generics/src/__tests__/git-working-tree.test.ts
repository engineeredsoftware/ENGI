/**
 * @jest-environment node
 */
import {
  buildHostCloneEnvEntries,
  isGitCommitSha,
  readHostCloneEnv,
  resolveGitClonePlan,
  provisionGitWorkingTree,
  withGitAuthUrl,
  type HostExec,
} from '../index';

describe('resolveGitClonePlan', () => {
  it('prefers branch shallow when branch is present', () => {
    const plan = resolveGitClonePlan({
      branch: 'version/v48',
      commit: 'f956577ce478e90d629db48c452102e582fa081c',
      revision: 'f956577ce478e90d629db48c452102e582fa081c',
    });
    expect(plan.strategy).toBe('branch-shallow-pin-commit');
    expect(plan.cloneBranch).toBe('version/v48');
    expect(plan.pinCommit).toBe('f956577ce478e90d629db48c452102e582fa081c');
  });

  it('uses commit-fetch for bare SHAs', () => {
    const plan = resolveGitClonePlan({
      branch: null,
      commit: 'abc1234',
      revision: 'abc1234',
    });
    expect(plan.strategy).toBe('commit-fetch');
    expect(plan.cloneBranch).toBeNull();
    expect(plan.pinCommit).toBe('abc1234');
  });

  it('shallow-clones non-SHA refs', () => {
    const plan = resolveGitClonePlan({ revision: 'v1.2.3' });
    expect(plan.strategy).toBe('ref-shallow');
    expect(plan.cloneBranch).toBe('v1.2.3');
  });
});

describe('buildHostCloneEnvEntries / readHostCloneEnv', () => {
  it('round-trips clone specs without logging secrets', () => {
    const entries = buildHostCloneEnvEntries({
      repositoryFullName: 'o/r',
      branch: 'main',
      commit: 'deadbeef',
      token: 'ghs_secret',
      root: '/vercel/sandbox',
    });
    expect(entries.BITCODE_HOST_CLONE_URL).toContain('github.com/o/r.git');
    expect(entries.BITCODE_HOST_CLONE_PASSWORD).toBe('ghs_secret');
    const read = readHostCloneEnv(entries as NodeJS.ProcessEnv);
    expect(read?.branch).toBe('main');
    expect(read?.password).toBe('ghs_secret');
  });
});

describe('provisionGitWorkingTree', () => {
  it('clones branch shallow then skips pin when HEAD already matches', async () => {
    const calls: string[][] = [];
    const exec: HostExec = async (cmd, args) => {
      calls.push([cmd, ...args]);
      if (args.includes('rev-parse')) {
        return {
          exitCode: 0,
          stdout: 'f956577ce478e90d629db48c452102e582fa081c\n',
          stderr: '',
        };
      }
      return { exitCode: 0, stdout: '', stderr: '' };
    };
    const result = await provisionGitWorkingTree({
      url: 'https://github.com/o/r.git',
      branch: 'version/v48',
      commit: 'f956577ce478e90d629db48c452102e582fa081c',
      workspacePath: '/tmp/ws',
      exec,
    });
    expect(result.strategy).toBe('branch-shallow-pin-commit');
    const clone = calls.find((c) => c[1] === 'clone');
    expect(clone).toEqual(
      expect.arrayContaining(['--depth', '1', '--branch', 'version/v48']),
    );
    expect(calls.some((c) => c.includes('fetch'))).toBe(false);
  });

  it('fetches pin commit when HEAD differs', async () => {
    const calls: string[][] = [];
    const exec: HostExec = async (_cmd, args) => {
      calls.push(args);
      if (args.includes('rev-parse')) {
        return { exitCode: 0, stdout: 'aaaaaaaa\n', stderr: '' };
      }
      return { exitCode: 0, stdout: '', stderr: '' };
    };
    await provisionGitWorkingTree({
      url: 'https://github.com/o/r.git',
      branch: 'main',
      commit: 'bbbbbbbb',
      workspacePath: '/tmp/ws',
      exec,
    });
    expect(calls.some((a) => a.includes('fetch') && a.includes('bbbbbbbb'))).toBe(true);
    expect(calls.some((a) => a.includes('checkout') && a.includes('bbbbbbbb'))).toBe(true);
  });
});

describe('withGitAuthUrl / isGitCommitSha', () => {
  it('embeds token and detects SHAs', () => {
    expect(isGitCommitSha('f956577')).toBe(true);
    expect(isGitCommitSha('version/v48')).toBe(false);
    const authed = withGitAuthUrl('https://github.com/o/r.git', 'x-access-token', 'tok');
    expect(authed).toContain('x-access-token');
    expect(authed).toContain('tok');
  });
});
