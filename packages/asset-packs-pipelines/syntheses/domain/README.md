# `@bitcode/asset-packs-pipelines-syntheses-domain`

Shared domain for **both** AssetPack synthesis pipelines (deposit + read SDIVF).

- Product factories: `../deposit`, `../read`
- All-three shared libs: `@bitcode/asset-packs-pipelines-domain`
- Settle: `../../settle` (not a consumer of this package's agents)

Contains: SDIVF agents/phases/tools, preprocess/postprocess, deposit options,
depository search/supply, reading pipeline contracts, synthesis helpers.
