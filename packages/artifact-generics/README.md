# @bitcode/artifact-generics

**Artifact** primitive contracts — the minimum required to identity a stored
artifact and express storage requirements without binding a backend.

## Hierarchy

```
@bitcode/artifact-generics                         # this package (Artifact primitive)
        ↑
@bitcode/generic-artifacts-patch                   # PatchArtifact base (patchfile storage)
        ↑
@bitcode/asset-packs-synthesis                     # AssetPackPatchArtifact (product)
@bitcode/artifacts                                 # concrete S3/Supabase storage (BC)
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
