# @bitcode/generic-artifacts-patch-kind

**PatchArtifact** — base Artifact implementation for storing **path+op patchfile(s)**
(AssetPack patch payloads without embedding raw source blobs).

## Hierarchy

```
Artifact # @bitcode/artifact-generics
 → PatchArtifact # this package
 → AssetPackPatchArtifact # @bitcode/generic-asset-packs-synthesis
```

## What it adds over the primitive

| Field | Role |
| --- | --- |
| `files` | Ordered patch file entries (path, op, optional body/ref) |
| `patchSummary` | Source-safe summary of the patch |
| `format` | `unified-diff` \| `path-op-json` \| product extension |
| `fileCount` | Derived count |

Schema: `bitcode.artifact.patch`.

## Usage

```ts
import { buildPatchArtifact, serializePatchArtifactJson } from '@bitcode/generic-artifacts-patch-kind';

const patch = buildPatchArtifact({
 artifactId: 'artifact-…',
 patchSummary: 'Auth capability slice',
 files: [{ path: 'src/auth.ts', op: 'modify' }],
});

const bytes = serializePatchArtifactJson(patch);
// await storage.save(bytes, `${patch.identity.artifactId}.json`, 'application/json');
```
