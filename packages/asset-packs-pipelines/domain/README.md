# `@bitcode/asset-packs-pipelines-domain`

**All-three** AssetPack pipeline shared library (deposit synth + read synth + settle).

Synthesis agents/phases/tools live in
`@bitcode/asset-packs-pipelines-syntheses-domain` (`../syntheses/domain`).

Settlement execution is exclusive to `../settle` — this package only holds
library contracts (e.g. settlement-rights types) that hosts/settle may import.
