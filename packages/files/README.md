# @bitcode/files

**File primitives** — lowest-level path, op, and filesystem helpers for Bitcode.

## Hierarchy

```
@bitcode/files                              # this package (primitives)
        ↑
@bitcode/asset-packs-generics               AssetPack path+op (aliases FileOp)
@bitcode/generic-artifacts-patch            PatchFileEntry builds on FileChange
@bitcode/generic-attachments-file           FileAttachment paths
@bitcode/file-editing                       atomic edit transactions
@bitcode/file-refactoring                   symbol rename / multi-file refactors
@bitcode/generic-tools/* / Host             checkout + editing tools
```

## Primitive surface

| Export | Role |
| --- | --- |
| `FilePath`, `FileOp`, `FileChange` | Path + op vocabulary |
| `FileOperation`, `DirectoryOperation` | Tracker / mutation records |
| `normalizeRepoPath`, `absolutifyPath` | Path normalization |
| `validateFilePath`, … | Path-traversal / content safety |
| `FileTracker`, `getAllFiles` | Change tracking + discovery |

## Usage

```ts
import {
  type FileChange,
  type FileOp,
  createFileChange,
  normalizeRepoPath,
  validateFilePath,
} from '@bitcode/files';

const change: FileChange = createFileChange('src/auth.ts', 'modify');
```

Any package that works with files should import primitives from here rather than
re-declaring path/op unions.
