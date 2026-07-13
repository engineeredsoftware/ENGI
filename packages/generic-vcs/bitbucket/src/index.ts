/**
 * @bitcode/generic-vcs-bitbucket — Bitbucket VCS provider.
 *
 * Hierarchy: vcs-generics (AbstractVCSProvider) → this provider implementation.
 * Compatibility: @bitcode/bitbucket re-exports this package.
 */

import BitbucketProvider from './providers/bitbucket-provider';
export { BitbucketAuth } from './auth';
export { BitbucketConnections } from './connections';

// Export the provider class for direct usage
export { BitbucketProvider };

// Default export for VCS factory pattern
export default BitbucketProvider;
