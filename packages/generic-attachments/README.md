# generic-attachments

Nested **base implementations** of `@bitcode/attachment-generics`.

## Hierarchy

```
@bitcode/attachment-generics
        ↑
@bitcode/generic-attachments-file       # file/
@bitcode/generic-attachments-external   # external/  (Externals auxillary connections)
```

| Path | Package | Role |
| --- | --- | --- |
| `file/` | `@bitcode/generic-attachments-file` | File uploads (image, text, pdf, …) |
| `external/` | `@bitcode/generic-attachments-external` | External connections (GitHub, Notion, Jira, …) |

Removed categories: `vcs`, `url` (VCS is external; bare URL is not a category).
