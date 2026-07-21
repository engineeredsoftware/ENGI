import {
  getWorkspaceSurface,
  shouldHideWorkspaceFooter,
  usesWorkspaceChrome,
} from '@/components/bitcode/layout/WorkspaceSurface/workspace-surface';

describe('workspaceSurface helpers', () => {
  it('classifies operator workspace routes consistently', () => {
    expect(getWorkspaceSurface('/exchange')).toBe('exchange');
    expect(getWorkspaceSurface('/exchange')).toBe('exchange');
    expect(getWorkspaceSurface('/auxillaries/externals')).toBeNull();
    expect(getWorkspaceSurface('/conversations/thread')).toBe('conversations');
    expect(getWorkspaceSurface('/')).toBeNull();
    expect(getWorkspaceSurface('/not-a-product-route')).toBeNull();
  });

  it('marks workspace chrome and footer suppression together', () => {
    expect(usesWorkspaceChrome('/exchange')).toBe(true);
    expect(usesWorkspaceChrome('/exchange')).toBe(true);
    expect(usesWorkspaceChrome('/auxillaries')).toBe(false);
    expect(usesWorkspaceChrome('/conversations')).toBe(true);
    expect(shouldHideWorkspaceFooter('/exchange')).toBe(true);
    expect(shouldHideWorkspaceFooter('/auxillaries')).toBe(false);
  });
});
