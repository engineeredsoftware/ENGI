# generic-doc-comments

Family folder for doc-comment implementors over `@bitcode/doc-comment-generics`.

```
packages/
  doc-comment-generics/              # @bitcode/doc-comment-generics (primitives)
  generic-doc-comments/              # this family (no package.json)
    doc-code/                        # @bitcode/generic-doc-comments-doc-code
    doc-developing/                  # @bitcode/generic-doc-comments-doc-developing
```

| Nested package | Package name | Role |
| --- | --- | --- |
| `doc-code/` | `@bitcode/generic-doc-comments-doc-code` | Build-time prompt injection into tools |
| `doc-developing/` | `@bitcode/generic-doc-comments-doc-developing` | Development-time doc plugins |

BC aliases:
- `@bitcode/doc-code` → re-exports doc-code
- `@bitcode/doc-comment` → re-exports doc-comment-generics
- `@bitcode/doc-comment-developing` → re-exports doc-developing
