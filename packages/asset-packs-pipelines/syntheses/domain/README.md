# `@bitcode/asset-packs-pipelines-syntheses-domain`

Shared domain for **both** AssetPack synthesis pipelines (deposit + read SDIVF).

- Product factories: `../deposit`, `../read`
- All-three shared libs: `@bitcode/asset-packs-pipelines-domain`
- Settle: `../../settle` (not a consumer of this package's agents)

Contains: SDIVF agents/phases/tools, preprocess/postprocess, deposit options,
depository search/supply, reading pipeline contracts, synthesis helpers.

## Depository search (shared low-level)

| Export / path | Role |
| --- | --- |
| `./depository-search` | Rank/select fit evidence over in-memory assets |
| `./tools/deposit-depository-asset-pack-search` | Multi-query hybrid tool (lexical + static filters + optional vector) |
| `./tools/depository-search-query-plan` | Need/demand → query terms |
| `./embedding-config` | OpenAI embed policy; product RPC `match_depository_asset_pack_vectors` |
| `./depository-supply-index*` | Source-safe supply records + search document builders |

**Runtime:** deposit and read dispatch preload admitted/settled packs into
execution stores before Discovery. **Index:** uapi `POST /api/depository/index`
on admit (documents + vectors tables).

Product lenses only: `deposit-relevants` | `read-need-fits`.
