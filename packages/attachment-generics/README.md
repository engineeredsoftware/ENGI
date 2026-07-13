# @bitcode/attachment-generics

**Attachment** primitive contracts — base identity, admitted categories, and references.

## Hierarchy

```
@bitcode/attachment-generics # this package (Attachment primitive)
 ↑
@bitcode/generic-attachments-file # FileAttachment base
@bitcode/generic-attachments-external # ExternalAttachment base (Externals auxillary)
 ↑
product conversations / API / UI
```

## Admitted categories (only)

| Category | Role |
| --- | --- |
| `file` | Direct file uploads |
| `external` | Connections from Externals (GitHub VCS, Jira, Notion, …) |

**Not admitted (removed):** `vcs`, `url` — VCS/repo linking is an **external** connection; bare URLs are not a separate attachment category.

## Law

- Primitive does not own file MIME tables or provider payloads.
- Bases live under `packages/generic-attachments/{file,external}/`.
- **External** vocabulary aligns with the Externals auxillary (not “integration”).
