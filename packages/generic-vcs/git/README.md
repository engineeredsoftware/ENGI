# @bitcode/git

`@bitcode/git` is the Bitcode Git operation bridge. It keeps Git-shaped
repository operation names available for active AssetPack, Terminal, API, and
tool callers while routing provider work through the Bitcode VCS abstraction.

## Role

- Git is concrete repository transport infrastructure.
- VCS is the provider abstraction for GitHub, GitLab, Bitbucket, and future
  admitted repository providers.
- This package is active V26 infrastructure when callers read Git-shaped
  operation names such as `createPullRequest`, `listGitFiles`, or
  `getRepository`.

Unsupported provider operations fail closed with a current Bitcode boundary
error instead of pretending to have completed repository work.

## Usage

```ts
import { createPullRequest, listGitFiles } from '@bitcode/git';

await createPullRequest({
  provider: 'github',
  userId: 'user_123',
  owner: 'bitcode-labs',
  repo: 'terminal',
  title: 'Finish AssetPack',
  sourceBranch: 'asset-pack/run-123',
  targetBranch: 'main',
});

const files = await listGitFiles({
  provider: 'github',
  connectionId: 'connection-id',
  owner: 'bitcode-labs',
  repo: 'terminal',
  path: 'src',
});
```

Prefer `@bitcode/vcs` for new provider abstractions and `@bitcode/vcs-tools`
for tool registry integration. Use `@bitcode/git` when the active Bitcode
surface is specifically a Git-shaped repository operation.
