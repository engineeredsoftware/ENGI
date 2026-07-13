# @bitcode/artifact-generics

**Artifact** primitive contracts — the minimum required to identity a stored
artifact and express storage requirements without binding a backend.

## Hierarchy

```
@bitcode/artifact-generics                         # this package (Artifact primitive)
        ↑
@bitcode/generic-artifacts-patch                   # type: path+op patch
@bitcode/generic-artifacts-aws                     # storage: S3
@bitcode/generic-artifacts-supabase                # storage: Supabase
@bitcode/generic-artifacts-vercel                  # storage: Vercel Blob
        ↑
@bitcode/artifacts                                 # compose providers (BC)
@bitcode/asset-packs-synthesis                     # AssetPackPatchArtifact product
```

## Primitive surface

| Concept | Types |
| --- | --- |
| Identity | `ArtifactId`, `ArtifactKind`, `ARTIFACT_SCHEMA_PREFIX` |
| Result | `ArtifactInfo` (url, size, name, etag?) |
| Storage | `ArtifactStorage` (`save`, `putAtKey`), `ArtifactBytes` |
| Requirements | `ArtifactStorageRequirements` (backend, content types, key law) |

## Law

- Primitive artifacts never embed raw product domain (AssetPack, Execution).
- Backends implement `ArtifactStorage`; bases/products project into it.
