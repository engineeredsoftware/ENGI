# @bitcode/host-generics

Host **primitive** contracts for Bitcode pipeline execution boxes.

## Spec-aligned Host requirements

From active V48 law (`BITCODE_SPEC_V48` G3-4):

| Concern | Law |
| --- | --- |
| Full checkout | Host provisions full working tree at a revision |
| Local read | Pipeline reads the host's local checkout (no cross-boundary source stream) |
| Capabilities | `clone` + `filesystem` + `exec` on every HostKind |
| Source-safety | Raw source stays on host; only measurements / source-safe descriptors leave |
| HostKind `local` | Default (`BITCODE_PIPELINE_HOST` unset or `local`). In-process git + Node fs |
| HostKind `sandbox` | Isolated box; provider `vercel` (implemented) or `aws` (future) |

## Hierarchy

```
BitcodePipelineHost / Host                  # this package
  → LocalHost                               # generic-hosts/Local
  → SandboxHost                             # abstract (this package)
      → VercelSandboxHost                   # generic-hosts/VercelSandbox
```

## Usage

```ts
import type { BitcodePipelineHost } from '@bitcode/host-generics';
import { LocalHost } from '@bitcode/generic-hosts-local';
import { VercelSandboxHost } from '@bitcode/generic-hosts-vercel-sandbox';

const host: BitcodePipelineHost = new LocalHost();
const workspace = await host.provisionRepository({
  repositoryFullName: 'org/repo',
  url: 'https://github.com/org/repo.git',
  revision: 'main',
});
```

Compatibility: `@bitcode/pipeline-hosts` re-exports host-generics + generic-hosts + host.
