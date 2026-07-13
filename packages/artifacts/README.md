# @bitcode/artifacts

Concrete **ArtifactStorage** (S3 primary, Supabase fallback) and BC entry for
artifact persistence used by execution and logger.

## Hierarchy

```
@bitcode/artifact-generics                 Artifact primitive + storage contract
        ↑
@bitcode/generic-artifacts-patch           PatchArtifact (path+op patchfiles)
        ↑
@bitcode/asset-packs-synthesis             AssetPackPatchArtifact (product)
@bitcode/artifacts                         this package (S3/Supabase backend)
```

## API

```ts
import { saveArtifact, putArtifactAtKey, defaultArtifactStorage } from '@bitcode/artifacts';
import type { ArtifactStorage } from '@bitcode/artifact-generics';
```

Prefer `@bitcode/artifact-generics` for types/contracts and
`@bitcode/generic-artifacts-patch` for patch payloads.
