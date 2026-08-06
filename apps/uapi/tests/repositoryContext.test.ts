/**
 * Bitcode pipeline repository-context model (relocated from product).
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */
import {
  DEPOSIT_COMMIT_LATEST_REF,
  deriveSelectedBranch,
  deriveSelectedCommit,
  deriveSelectedRepository,
  isLatestCommitRef,
  REPOSITORY_PROVIDERS,
  REPOSITORY_PROVIDERS,
} from '@/components/bitcode/pipeline/models/repository-context';
import type { VCSBranch, VCSCommit, VCSRepository } from '@bitcode/vcs-generics-core';

const repos = [
  { id: '1', name: 'alpha', fullName: 'org/alpha' },
  { id: '2', name: 'beta', fullName: 'org/beta' },
] as VCSRepository[];

const branches = [{ name: 'main' }, { name: 'feat' }] as VCSBranch[];
const commits = [{ sha: 'aaa' }, { sha: 'bbb' }] as VCSCommit[];

describe('repository-context', () => {
  it('prefers github as the sole repository provider list', () => {
    expect(REPOSITORY_PROVIDERS).toEqual(['github']);
    expect(REPOSITORY_PROVIDERS).toEqual(REPOSITORY_PROVIDERS);
  });

  it('derives repository by fullName, id, or preferred fallback', () => {
    expect(deriveSelectedRepository(repos, 'org/beta')?.name).toBe('beta');
    expect(deriveSelectedRepository(repos, '1')?.name).toBe('alpha');
    expect(deriveSelectedRepository(repos, null, 'org/beta')?.name).toBe('beta');
    expect(deriveSelectedRepository(repos)?.name).toBe('alpha');
  });

  it('derives branch and treats latest as branch-head commit', () => {
    expect(deriveSelectedBranch(branches, 'feat')).toBe('feat');
    expect(deriveSelectedBranch(branches)).toBe('main');
    expect(isLatestCommitRef(DEPOSIT_COMMIT_LATEST_REF)).toBe(true);
    expect(isLatestCommitRef(null)).toBe(true);
    expect(deriveSelectedCommit(commits, 'latest')).toBe('aaa');
    expect(deriveSelectedCommit(commits, 'bbb')).toBe('bbb');
  });

  it('honors explicit branch before the list loads (Load-anchor package)', () => {
    expect(deriveSelectedBranch([], 'version/v48', 'main')).toBe('version/v48');
    // Still honor an explicit request that is not in the loaded list rather
    // than falling back to default (which used to wipe sourceCommit via URL sync).
    expect(deriveSelectedBranch(branches, 'version/v48', 'main')).toBe(
      'version/v48',
    );
  });

  it('expands short commit SHAs from anchors to full object ids', () => {
    const fullCommits = [
      { sha: '41ff225abcdef0123456789abcdef0123456789a', message: 'v48' },
      { sha: 'e6d93a6abcdef0123456789abcdef0123456789b', message: 'main' },
    ] as VCSCommit[];
    expect(deriveSelectedCommit(fullCommits, '41ff225')).toBe(
      '41ff225abcdef0123456789abcdef0123456789a',
    );
    expect(deriveSelectedCommit([], '41ff225')).toBe('41ff225');
  });
});
