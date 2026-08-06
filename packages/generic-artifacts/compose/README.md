# @bitcode/generic-artifacts-compose

Compose `ArtifactStorage` providers over `@bitcode/artifact-generics`.

## Hierarchy

```
@bitcode/artifact-generics
 ↑
@bitcode/generic-artifacts-aws-provider
@bitcode/generic-artifacts-supabase-provider
@bitcode/generic-artifacts-vercel-provider
 ↑
@bitcode/generic-artifacts-compose   # this package (aws → supabase → vercel)
```

```ts
import {
  saveArtifact,
  putArtifactAtKey,
  resolveArtifactStorage,
} from '@bitcode/generic-artifacts-compose';
```

Default resolution order: **AWS S3 → Supabase → Vercel Blob** (first configured wins).
