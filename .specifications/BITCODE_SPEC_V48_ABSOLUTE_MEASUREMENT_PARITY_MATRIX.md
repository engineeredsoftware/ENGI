# V48 Absolute Measurement Parity Matrix

**Status:** Draft V48 measurement subsystem parity (spec ↔ implementation ↔ test).  
**Canon:** `BITCODE_SPEC_V48.md` measurement law (DataPack identity + absolute hierarchy).  
**Excluded:** `learning-gain` (BTD / need-fit family owns exchange value scalar).

## Hierarchy (rebuild law)

| Layer | Package pattern | Role |
| --- | --- | --- |
| Primitive | `@bitcode/measurement-generics` | Specs, readings, carrier |
| Bare absolute | `@bitcode/generic-measurements-absolutes-<kind>` | Pure `measureAbsolute*` of a **DataPack** |
| Shared input | `@bitcode/generic-measurements-shared-absolute-measure-input` | DP-facing input contracts |
| Catalogue | `@bitcode/generic-measurements-domain-data-pack-absolutes-catalog` | Full target + weighted Σ=1 subset |
| Tool | `@bitcode/generic-tools-tool-measure-<kind>` | ExecutionTool wrapper per kind |
| Agent | `@bitcode/generic-agents-agent-measure-absolutes` | Registry + weighted runner + category PTRR factory |
| Product | `@bitcode/generic-asset-packs-synthesis` | Mode-parameterized product factory + re-exports |
| Pipeline | `asset-packs-pipelines/syntheses/{deposit,read}` | After DP synthesis, attach absolutes |

**Unit under measure:** synthesized **DataPack** (patch + metadata), not the repository.

## Weighted commercial catalogue (live, Σ=1)

| Kind | Weight | Bare package | Tool package | Agent registry | Pipeline host |
| --- | --- | --- | --- | --- | --- |
| function-count | 0.09 | yes | yes | yes | measureDataPackAbsolutes |
| type-count | 0.07 | yes | yes | yes | measureDataPackAbsolutes |
| file-span | 0.05 | yes | yes | yes | measureDataPackAbsolutes |
| symbolic-richness | 0.09 | yes | yes | yes | measureDataPackAbsolutes |
| modularity | 0.05 | yes | yes | yes | measureDataPackAbsolutes |
| lang-span | 0.06 | yes | yes | yes | measureDataPackAbsolutes |
| test-surface | 0.07 | yes | yes | yes | measureDataPackAbsolutes |
| api-surface | 0.07 | yes | yes | yes | measureDataPackAbsolutes |
| correctness-estimate | 0.16 | yes | yes | yes | measureDataPackAbsolutes |
| objectives-fidelity | 0.15 | yes | yes | yes | measureDataPackAbsolutes |
| computational-usage | 0.14 | yes | yes | yes | measureDataPackAbsolutes |

## Full target catalogue (46 kinds — bare + tool packages)

All kinds under B1–B6 (structure, verification, hygiene, provenance, semantics, value) have bare packages and tool wrappers. Non-weighted kinds return `not_implemented` or `insufficient_evidence` until mechanisms land. Policy roles: weighted | gate | penalty | flag | target.

| Family | Kinds (count) | Status |
| --- | --- | --- |
| structure | 14 | 8 weighted + 6 target bare |
| verification | 6 | target bare (sandbox later) |
| hygiene | 7 | bare; gates/penalties |
| provenance | 6 | bare; corpus later (ai-generated = flag) |
| semantics | 7 | 3 weighted + 4 target bare |
| value | 6 | target bare (no learning-gain) |
| **Total** | **46** | packages scaffolded |

## Test bindings

| Surface | Tests |
| --- | --- |
| Catalogue weights | `generic-measurements/domain/data-pack-absolutes-catalog` core |
| Bare kinds | each `absolutes/<kind>/src/__tests__/core` |
| Agent registry | `generic-agents/agent-measure-absolutes` core |
| Pipeline host | `agent-measure-absolutes.test.ts` (domain) |

## Progress notes

- **2026-07-24:** Hierarchy packages scaffolded; weighted path uses bare measures; old monolithic `generic-measurements/absolutes` category package **removed**; agent home is `agent-measure-absolutes`. Bulk static analysis remains a signal feeder, not the sole measure owner.
