/**
 * Bitbucket OAuth helpers — thin surface over BitbucketProvider (vcs-generics).
 *
 * Prefer creating the provider via:
 *   createBitbucketProvider() / VCSProviderFactory from @bitcode/vcs-generics
 */

import {
  createBitbucketProvider,
  type VCSAuth,
  type VCSConfig,
} from '@bitcode/vcs-generics';
import BitbucketProvider from './providers/bitbucket-provider';

export class BitbucketAuth {
  private readonly provider: BitbucketProvider;

  constructor(config?: Partial<VCSConfig>) {
    this.provider = new BitbucketProvider({
      provider: 'bitbucket',
      clientId: config?.clientId || process.env.BITBUCKET_CLIENT_ID || '',
      clientSecret: config?.clientSecret || process.env.BITBUCKET_CLIENT_SECRET || '',
      redirectUri:
        config?.redirectUri ||
        process.env.BITBUCKET_REDIRECT_URI ||
        process.env.VCS_REDIRECT_URI ||
        '',
      instanceUrl: config?.instanceUrl,
    });
  }

  getAuthorizationUrl(state: string, scopes?: string[]): string {
    return this.provider.getAuthorizationUrl(state, scopes);
  }

  exchangeCodeForToken(code: string): Promise<VCSAuth> {
    return this.provider.exchangeCodeForToken(code);
  }

  validateToken(auth: VCSAuth): Promise<boolean> {
    return this.provider.validateToken(auth);
  }
}

/** Factory alias aligned with vcs-generics createBitbucketProvider. */
export { createBitbucketProvider };
