/**
 * @bitcode/generic-vcs-github — GitHub VCS provider.
 *
 * Hierarchy: vcs-generics (AbstractVCSProvider) → this provider implementation.
 * Compatibility: @bitcode/github re-exports this package.
 */

import GitHubProvider from './providers/github-provider';

// Export the provider class for direct usage
export { GitHubProvider };

// Export auth utilities
export { GitHubAppAuth, createGitHubAppAuth } from './auth/github-app';
export type { GitHubAppConfig, InstallationAccessToken } from './auth/github-app';

// Default export for VCS factory pattern
export default GitHubProvider;
