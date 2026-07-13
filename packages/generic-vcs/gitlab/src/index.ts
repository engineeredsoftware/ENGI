/**
 * @bitcode/generic-vcs-gitlab — GitLab VCS provider.
 *
 * Hierarchy: vcs-generics (AbstractVCSProvider) → this provider implementation.
  */

import GitLabProvider from './providers/gitlab-provider';
export { GitLabAuth } from './auth';
export { GitLabConnections } from './connections';

// Export the provider class for direct usage
export { GitLabProvider };

// Default export for VCS factory pattern
export default GitLabProvider;
