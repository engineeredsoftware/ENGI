import {
  getWorkspaceSurface,
  shouldHideWorkspaceFooter,
  usesWorkspaceChrome,
} from '@/components/bitcode/layout/WorkspaceSurface/workspace-surface';

describe('workspaceSurface helpers', () => {
  it('classifies operator workspace routes consistently', () => {
    expect(getWorkspaceSurface('/packs')).toBe('packs');
    expect(getWorkspaceSurface('/auxillaries/externals')).toBeNull();
    expect(getWorkspaceSurface('/conversations/thread')).toBe('conversations');
    expect(getWorkspaceSurface('/')).toBeNull();
    expect(getWorkspaceSurface('/not-a-product-route')).toBeNull();
  });

  it('marks workspace chrome and footer suppression together', () => {
    expect(usesWorkspaceChrome('/packs')).toBe(true);
    expect(usesWorkspaceChrome('/auxillaries')).toBe(false);
    expect(usesWorkspaceChrome('/conversations')).toBe(true);
    expect(shouldHideWorkspaceFooter('/packs')).toBe(true);
    expect(shouldHideWorkspaceFooter('/auxillaries')).toBe(false);
  });
});
