/**
 * Bitcode pipeline repository-context model (relocated from Terminal).
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */
import {
  DEPOSIT_COMMIT_LATEST_REF,
  deriveSelectedBranch,
  deriveSelectedCommit,
  deriveSelectedRepository,
  isLatestCommitRef,
  REPOSITORY_PROVIDERS,
  TERMINAL_REPOSITORY_PROVIDERS,
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
    expect(TERMINAL_REPOSITORY_PROVIDERS).toEqual(REPOSITORY_PROVIDERS);
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
});
