# @bitcode/artifacts

BC **composition** of ArtifactStorage providers. Prefer leaf packages for new code.

## Hierarchy

```
@bitcode/artifact-generics
        ↑
@bitcode/generic-artifacts-patch       # artifact *type* (path+op patch)
@bitcode/generic-artifacts-aws         # S3 storage provider
@bitcode/generic-artifacts-supabase    # Supabase Storage provider
@bitcode/generic-artifacts-vercel      # Vercel Blob provider
        ↑
@bitcode/artifacts                     # this package (compose: aws → supabase → vercel)
```

```ts
import { saveArtifact, resolveArtifactStorage } from '@bitcode/artifacts';
import { createAwsS3ArtifactStorage } from '@bitcode/generic-artifacts-aws';
```
