# @bitcode/generic-tools-git

Bitcode Git interactor tools wrap Git-shaped repository operations as Tool
instances. They are active support for repository-bound AssetPack, product,
Exchange, and connected-interface flows.

## Role

- `@bitcode/generic-vcs-git` owns concrete Git operation names and routes provider work
 through Bitcode VCS providers.
- `@bitcode/generic-tools-vcs` owns provider-generic tool registry operations.
- this package keeps Tool-shaped Git interactor exports for callers that read
 concrete repository actions such as PR creation, issue comments, branch
 lookup, file reads, and file writes.

## Exports

- `cloneRepositoryTool`
- `listGitFilesTool`
- `getRepositoryTool`
- `createPullRequestTool`
- `createReferenceTool`
- `leaveCommentOnIssueTool`
- `reviewPullRequestTool`
- `createIssueTool`
- `getAllBranchesTool`
- `getReferenceInfoTool`
- `getFileInfoTool`
- `createFileContentTool`
- `updateFileContentTool`
- `deleteFileContentTool`
- `isLatestCommentFromBotTool`
- `getIssueWithCommentsTool`

The raw `@bitcode/generic-vcs-git` operations are also re-exported for package-local
composition.

## Example

```ts
import { createPullRequestTool } from '@bitcode/generic-tools-git';

await createPullRequestTool.use({
 provider: 'github',
 userId: 'user_123',
 owner: 'bitcode-labs',
 repo: 'terminal',
 title: 'Finish AssetPack',
 sourceBranch: 'asset-pack/run-123',
 targetBranch: 'main',
});
```

Provider-wide operations should use `@bitcode/generic-tools-vcs` directly. Git-shaped
repository operations should use this package or `@bitcode/generic-vcs-git`.
