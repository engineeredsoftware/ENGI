# @bitcode/attachments-generics

Universal attachment types and utilities for the Bitcode platform.

Attachments in Bitcode fall into exactly 2 categories (across the entire Bitcode codebase):

1. **file** — direct file uploads  
2. **external** — Externals-auxillary connections (GitHub VCS, Jira, Notion, …)

**Removed:** `vcs`, `url`. **Renamed:** `integration` → `external`.

## Hierarchy

```
@bitcode/attachment-generics                      # primitive (BaseAttachment, categories)
        ↑
@bitcode/generic-attachments-file                 # FileAttachment
@bitcode/generic-attachments-external             # ExternalAttachment (Externals)
        ↑
this package (BC re-exports)
```

```ts
import {
  Attachment,
  FileAttachment,
  ExternalAttachment,
  isFileAttachment,
  isExternalAttachment,
  validateAttachmentCategory,
} from '@bitcode/attachments-generics';
```
