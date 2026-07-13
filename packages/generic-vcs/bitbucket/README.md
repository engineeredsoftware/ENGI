# @bitcode/generic-vcs-bitbucket

Bitbucket **provider base** over `@bitcode/vcs-generics`.

## Hierarchy

```
@bitcode/vcs-generics                         AbstractVCSProvider, VCSProvider, factory
        ↑
@bitcode/generic-vcs-bitbucket                # this package
@bitcode/generic-vcs-github
@bitcode/generic-vcs-gitlab
```

Compatibility shim: `@bitcode/bitbucket` re-exports this package. Prefer hierarchy names.

## Usage

```ts
import BitbucketProvider from '@bitcode/generic-vcs-bitbucket';
import { createBitbucketProvider, VCSProviderFactory } from '@bitcode/vcs-generics';

// Factory (registered on vcs-generics load)
const provider = await createBitbucketProvider();

// Direct
const direct = new BitbucketProvider({
  provider: 'bitbucket',
  clientId: process.env.BITBUCKET_CLIENT_ID!,
  clientSecret: process.env.BITBUCKET_CLIENT_SECRET!,
  redirectUri: process.env.BITBUCKET_REDIRECT_URI!,
});
```

## Law

All VCS providers (GitHub, GitLab, Bitbucket) extend `VCSProvider` and implement
`AbstractVCSProvider`. Register only through `VCSProviderFactory` for service use.
