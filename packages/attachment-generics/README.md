# @bitcode/attachment-generics

**Attachment** primitive contracts — base identity, admitted categories, and references.

## Hierarchy (core pattern)

```
@bitcode/attachment-generics              # this package (Attachment primitive)
 ↑
@bitcode/generic-attachments-file         # packages/generic-attachments/file
@bitcode/generic-attachments-external     # packages/generic-attachments/external
 ↑
product (api, conversations, uapi)        # import primitive and/or leaf bases
```

Leaf packages under `generic-attachments/` are the correct organizational pattern
for file | external **base implementations**. Prefer leaf imports when you need
`FileAttachment` / `ExternalAttachment`; use this package for
`BaseAttachment`, `AttachmentReference`, and category guards.

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
- Do **not** reintroduce a plural composition barrel (`attachments-generics`); that twin name was retired in favor of primitive + leaves.
