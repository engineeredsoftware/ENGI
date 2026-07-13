# generic-artifacts

Nested **base implementations** of `@bitcode/artifact-generics`.

## Hierarchy

```
@bitcode/artifact-generics
        ↑
@bitcode/generic-artifacts-patch       # patch/     artifact type
@bitcode/generic-artifacts-aws         # aws/       S3 storage provider
@bitcode/generic-artifacts-supabase    # supabase/  Supabase Storage provider
@bitcode/generic-artifacts-vercel      # vercel/    Vercel Blob provider
        ↑
product (asset-packs-synthesis) / @bitcode/artifacts compose
```

| Path | Package | Role |
| --- | --- | --- |
| `patch/` | `@bitcode/generic-artifacts-patch` | Patchfile Artifact **type** |
| `aws/` | `@bitcode/generic-artifacts-aws` | AWS S3 **storage provider** |
| `supabase/` | `@bitcode/generic-artifacts-supabase` | Supabase **storage provider** |
| `vercel/` | `@bitcode/generic-artifacts-vercel` | Vercel Blob **storage provider** |

There is no standalone `@bitcode/aws` package — S3 for artifacts lives here.
