/**
 * Bitbucket MCP ↔ VCS hierarchy bridge.
 *
 * Uses @bitcode/vcs-generics factory (registered to generic-vcs-bitbucket).
 * Prefer hierarchy packages over compatibility shims.
 */

import {
  VCSProviderFactory,
  createBitbucketProvider,
  type AbstractVCSProvider,
  type VCSAuth,
} from '@bitcode/vcs-generics';

/** Ensure bitbucket is registered (factory self-registers on import of vcs-generics). */
export function isBitbucketProviderRegistered(): boolean {
  return VCSProviderFactory.hasProvider('bitbucket');
}

/** Create Bitbucket provider via hierarchy factory. */
export async function getBitbucketProvider(): Promise<AbstractVCSProvider> {
  return createBitbucketProvider();
}

/** List repositories for a user auth using the Bitbucket provider base. */
export async function bitbucketListRepositories(auth: VCSAuth) {
  const provider = await getBitbucketProvider();
  return provider.listRepositories(auth);
}

export { createBitbucketProvider, VCSProviderFactory };
