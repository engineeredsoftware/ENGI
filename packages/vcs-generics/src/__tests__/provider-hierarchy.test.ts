import { VCSProviderFactory } from '../factory';

describe('VCS provider hierarchy registration', () => {
  it('registers github, gitlab, and bitbucket against generic-vcs packages', () => {
    expect(VCSProviderFactory.hasProvider('github')).toBe(true);
    expect(VCSProviderFactory.hasProvider('gitlab')).toBe(true);
    expect(VCSProviderFactory.hasProvider('bitbucket')).toBe(true);

    const available = VCSProviderFactory.getAvailableProviders();
    expect(available).toEqual(expect.arrayContaining(['github', 'gitlab', 'bitbucket']));
  });
});
