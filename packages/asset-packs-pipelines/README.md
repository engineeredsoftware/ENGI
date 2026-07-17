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
| `syntheses/domain/` | `@bitcode/asset-packs-pipelines-syntheses-domain` | **Both synths**: SDIVF agents/phases/tools, preprocess/postprocess, depository search, synthesis helpers |
| `syntheses/deposit/` | `@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs` | Deposit product + co-located deposit options/admission/policy/agents |
| `syntheses/read/` | `@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-reads-asset-packs` | Read product + co-located Need/fits-finding/reading contracts/agents |
| `settle/` | `@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack` | Settle Simple product factory only |

**Rules**

1. Code used by deposit synth **and** read synth **and** settle → `domain/`.
2. Code used by both synths but **not** settle → `syntheses/domain/`.
3. Code specific to one product pipeline → co-locate under that pipeline package (`syntheses/deposit`, `syntheses/read`, or `settle`).
4. Do not grow a kitchen-sink `domain/` with synthesis agents/phases — those belong under `syntheses/`.

**Import law (no shims):** all-3 libraries from `@bitcode/asset-packs-pipelines-domain`;
shared synth helpers from `@bitcode/asset-packs-pipelines-syntheses-domain`; deposit-only
and read-only modules from the deposit/read product packages. Package **names** stay stable
for workspace BC; only filesystem co-location changed.

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
