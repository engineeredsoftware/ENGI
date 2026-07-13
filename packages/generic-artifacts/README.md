# generic-artifacts

Nested **base implementations** of `@bitcode/artifact-generics`.

## Hierarchy

```
@bitcode/artifact-generics
 ↑
@bitcode/generic-artifacts-patch-kind         # patch-kind/ PatchArtifact type
@bitcode/generic-artifacts-aws-provider       # aws-provider/ S3 storage
@bitcode/generic-artifacts-supabase-provider  # supabase-provider/ Supabase Storage
@bitcode/generic-artifacts-vercel-provider    # vercel-provider/ Vercel Blob
@bitcode/generic-artifacts-compose            # compose/ aws → supabase → vercel
```

| Path | Package | Role |
| --- | --- | --- |
| `patch-kind/` | `@bitcode/generic-artifacts-patch-kind` | Patchfile Artifact **kind** |
| `aws-provider/` | `@bitcode/generic-artifacts-aws-provider` | AWS S3 **storage provider** |
| `supabase-provider/` | `@bitcode/generic-artifacts-supabase-provider` | Supabase **storage provider** |
| `vercel-provider/` | `@bitcode/generic-artifacts-vercel-provider` | Vercel Blob **storage provider** |
| `compose/` | `@bitcode/generic-artifacts-compose` | Provider composition (`saveArtifact`, …) |

There is no standalone `@bitcode/artifacts` package — composition lives under `generic-artifacts/compose`.
