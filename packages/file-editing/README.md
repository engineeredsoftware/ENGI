# @bitcode/file-editing

Production-grade **atomic file editing** built on `@bitcode/files` primitives.


## Hierarchy

```
@bitcode/files # FilePath, FileOp, FileChange, normalizeRepoPath
 ↑
@bitcode/file-editing # this package (transactions, text edits, commands)
 ↑
@bitcode/generic-tools-editing # tool wrappers (files-maintaining)
@bitcode/generic-agents-code-editor
```

## Features

- Transaction support with commit/rollback
- File locking during multi-file ops
- Offset-based text edits (`positionToOffset`, `applyTextEdit`)
- Commands: `view`, `create`, `str_replace`, `insert`, `delete`, `replace`, `patch`
- Edit records as `FileEditOperation` (maps to `FileChange` via `fileEditOperationToFileChange`)

## Usage

```typescript
import {
 TransactionalFileEditor,
 type EditCommandParams,
 fileEditOperationToFileChange,
} from '@bitcode/file-editing';
// or from '@bitcode/file-editing'

const editor = new TransactionalFileEditor();
await editor.beginTransaction();
await editor.executeCommand({
 command: 'str_replace',
 path: 'src/auth.ts',
 old_str: 'legacy',
 new_str: 'current',
});
await editor.commitTransaction();
```
