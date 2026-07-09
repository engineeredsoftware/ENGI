import type { VCSRepository } from '@bitcode/vcs-core';

import {
  deriveSelectedBranch,
  deriveSelectedCommit,
  deriveSelectedRepository,
  normalizeRepositoryProvider,
} from '@/app/terminal/terminal-repository-context';

const repositories = [
  {
    id: 'repo-1',
    name: 'bitcode',
    fullName: 'bitcode/bitcode',
  },
  {
    id: 'repo-2',
    name: 'bitcode-core',
    fullName: 'bitcode/bitcode-core',
  },
] as VCSRepository[];

describe('Terminal repository context helpers', () => {
  it('normalizes all Terminal repository providers to GitHub', () => {
    expect(normalizeRepositoryProvider(null)).toBe('github');
    expect(normalizeRepositoryProvider(undefined)).toBe('github');
    expect(normalizeRepositoryProvider('not-real')).toBe('github');
    expect(normalizeRepositoryProvider('gitlab')).toBe('github');
    expect(normalizeRepositoryProvider('bitbucket')).toBe('github');
  });

  it('prefers a requested repository from the current route', () => {
    expect(deriveSelectedRepository(repositories, 'bitcode/bitcode-core', null)?.id).toBe('repo-2');
    expect(deriveSelectedRepository(repositories, 'repo-1', null)?.fullName).toBe('bitcode/bitcode');
  });

  it('falls back to the preferred repository from current Terminal context', () => {
    expect(deriveSelectedRepository(repositories, null, 'bitcode/bitcode-core')?.id).toBe('repo-2');
  });

  it('falls back to the first surfaced repository when no explicit choice exists', () => {
    expect(deriveSelectedRepository(repositories, null, null)?.id).toBe('repo-1');
    expect(deriveSelectedRepository([], null, null)).toBeNull();
  });

  it('derives branch and commit selections from requested values then defaults', () => {
    expect(
      deriveSelectedBranch(
        [
          {
            name: 'main',
            commit: {
              sha: 'abc123',
              message: 'head',
              author: { name: 'Dev', email: 'dev@example.com', date: new Date('2026-05-14T00:00:00.000Z') },
            },
            protected: false,
          },
          {
            name: 'release',
            commit: {
              sha: 'def456',
              message: 'release',
              author: { name: 'Dev', email: 'dev@example.com', date: new Date('2026-05-14T00:00:00.000Z') },
            },
            protected: false,
          },
        ],
        'release',
        'main',
      ),
    ).toBe('release');

    expect(
      deriveSelectedCommit(
        [
          {
            sha: 'abc123',
            message: 'head',
            author: { name: 'Dev', email: 'dev@example.com', date: new Date('2026-05-14T00:00:00.000Z') },
            parents: [],
          },
        ],
        null,
      ),
    ).toBe('abc123');
    // Explicit "latest" sentinel also resolves to the branch head.
    expect(
      deriveSelectedCommit(
        [
          {
            sha: 'abc123',
            message: 'head',
            author: { name: 'Dev', email: 'dev@example.com', date: new Date('2026-05-14T00:00:00.000Z') },
            parents: [],
          },
          {
            sha: 'def456',
            message: 'older',
            author: { name: 'Dev', email: 'dev@example.com', date: new Date('2026-05-13T00:00:00.000Z') },
            parents: [],
          },
        ],
        'latest',
      ),
    ).toBe('abc123');
    expect(
      deriveSelectedCommit(
        [
          {
            sha: 'abc123',
            message: 'head',
            author: { name: 'Dev', email: 'dev@example.com', date: new Date('2026-05-14T00:00:00.000Z') },
            parents: [],
          },
        ],
        '07de275b3d97679321f1f596c16e48105d81d51b',
      ),
    ).toBe('07de275b3d97679321f1f596c16e48105d81d51b');
    expect(deriveSelectedCommit([], '07de275b3d97679321f1f596c16e48105d81d51b')).toBe(
      '07de275b3d97679321f1f596c16e48105d81d51b',
    );
    expect(deriveSelectedCommit([], 'latest')).toBeNull();
  });
});
