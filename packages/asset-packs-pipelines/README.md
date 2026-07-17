# asset-packs-pipelines

Commercial AssetPack product pipelines and their domain libraries.

## Layout law (absolute)

```
asset-packs-pipelines/
  domain/                 # shared by ALL THREE product pipelines (+ host library)
  syntheses/
    domain/               # shared by BOTH synthesis pipelines only (deposit + read)
    deposit/              # deposit synthesis product package (co-located)
    read/                 # read synthesis product package (co-located)
  settle/                 # settle product package (co-located)
```

| Path | Package name | Scope |
| --- | --- | --- |
| `domain/` | `@bitcode/asset-packs-pipelines-domain` | **All 3** pipelines: commodity, disclosure, settlement-rights library, BTD quote helpers, org-policy wallet authority |
| `syntheses/domain/` | `@bitcode/asset-packs-pipelines-syntheses-domain` | **Both synths**: SDIVF agents/phases/tools, preprocess/postprocess, deposit options, depository search, reading pipeline contracts |
| `syntheses/deposit/` | `@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs` | Deposit product factory only |
| `syntheses/read/` | `@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs` | Read product factory only |
| `settle/` | `@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack` | Settle Simple product factory only |

**Rules**

1. Code used by deposit synth **and** read synth **and** settle → `domain/`.
2. Code used by both synths but **not** settle → `syntheses/domain/`.
3. Code specific to one product pipeline → co-locate under that pipeline package (`syntheses/deposit`, `syntheses/read`, or `settle`).
4. Do not grow a kitchen-sink `domain/` with synthesis agents/phases — those belong under `syntheses/`.

Compatibility: deep exports that previously lived on `@bitcode/asset-packs-pipelines-domain`
and are now synthesis-shared re-export from relative shims under `domain/src/*` (prefer
importing `@bitcode/asset-packs-pipelines-syntheses-domain` for new code).

## Product pipelines

| Product run id (store) | Directory | Base | Factory |
| --- | --- | --- | --- |
| `synthesize-deposits-asset-packs-pipeline` | `syntheses/deposit/` | SDIVF | `factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks` |
| `synthesize-reads-asset-packs-pipeline` | `syntheses/read/` | SDIVF | `factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks` |
| `settle-asset-pack-pipeline` | `settle/` | Simple | `factoryExecutionPipelineSimpleSettleAssetPack` |

```ts
import { factoryExecutionPipelineSDIVFSynthesizeDepositAssetPacks } from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs';
import { factoryExecutionPipelineSDIVFSynthesizeReadAssetPacks } from '@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs';
import { factoryExecutionPipelineSimpleSettleAssetPack } from '@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack';
```

AssetPack product types: `@bitcode/generic-asset-packs-{synthesis,deposit-synthesized,read-synthesized,read-synthesized-settled}`.
