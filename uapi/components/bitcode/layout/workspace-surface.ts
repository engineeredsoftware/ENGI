export type WorkspaceSurface = 'terminal' | 'packs' | 'conversations' | null;
export type PublicShellSurface = 'home' | 'network' | 'deposit' | 'read' | 'docs' | null;

export function getWorkspaceSurface(pathname: string | null | undefined): WorkspaceSurface {
  if (!pathname) return null;
  // Terminal eradicated → packs is the workspace shell carrier (legacy /terminal redirects).
  if (pathname.startsWith('/packs') || pathname.startsWith('/terminal')) return 'packs';
  if (pathname.startsWith('/conversations')) return 'conversations';
  return null;
}

export function usesWorkspaceChrome(pathname: string | null | undefined): boolean {
  return getWorkspaceSurface(pathname) !== null;
}

export function usesPublicShellChrome(pathname: string | null | undefined): boolean {
  return getPublicShellSurface(pathname) !== null;
}

export function getPublicShellSurface(pathname: string | null | undefined): PublicShellSurface {
  if (!pathname) return null;
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/packs') || pathname.startsWith('/exchange')) return 'network';
  if (pathname.startsWith('/deposits')) return 'deposit';
  if (pathname.startsWith('/reads')) return 'read';
  if (pathname.startsWith('/docs') || pathname.startsWith('/demo-video') || pathname.startsWith('/edgetimes')) return 'docs';
  return null;
}

export function shouldHideWorkspaceFooter(pathname: string | null | undefined): boolean {
  return usesWorkspaceChrome(pathname);
}
