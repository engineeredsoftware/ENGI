/**
 * @bitcode/generic-vcs-bitbucket — Bitbucket VCS provider.
 *
 * Hierarchy:
 *   @bitcode/vcs-generics                 AbstractVCSProvider, VCSProvider, factory
 *     → @bitcode/generic-vcs-bitbucket    this package
 *
 * Compatibility: @bitcode/bitbucket re-exports this package.
 * Prefer this package name in new code.
 */

import BitbucketProvider from './providers/bitbucket-provider';
export { BitbucketAuth } from './auth';
export { BitbucketConnections } from './connections';
export { BitbucketProvider };

// Default export for VCSProviderFactory lazy load
export default BitbucketProvider;
