# V48 Absolute Measurement Parity Matrix

**Status:** Draft V48 measurement subsystem parity (spec ↔ implementation ↔ test).
**Canon:** `BITCODE_SPEC_V48.md` measurement law (DataPack identity + absolute hierarchy + honesty).
**Excluded:** `learning-gain` (BTD / need-fit family owns exchange value scalar).

## Hierarchy (rebuild law)

| Layer | Package pattern | Role |
| --- | --- | --- |
| Primitive | `@bitcode/measurement-generics` | Readings, carrier, `AbsoluteReadingStatus`, `DataPackMeasureReport` |
| Shared input | `@bitcode/generic-measurements-shared-absolute-measure-input` | DP-facing input + status enum |
| Bare absolute | `@bitcode/generic-measurements-absolutes-<kind>` | Pure `measureAbsolute*` of a **DataPack** |
| Catalogue | `@bitcode/generic-measurements-domain-data-pack-absolutes-catalog` | **Full commercial catalogue (65), Σ weights = 1** |
| Material identity | `@bitcode/generic-measurements-domain-data-pack-material-identity` | Compositions, inventories (deps-by-usage), tags, companion scalars |
| Tool | `@bitcode/generic-tools-tool-measure-<kind>` | ExecutionTool wrapper per kind |
| Agent | `@bitcode/generic-agents-agent-measure-absolutes` | Registry + full-catalogue runner + category PTRR factory |
| Product | `@bitcode/generic-asset-packs-synthesis` | Mode-parameterized product factory + re-exports |
| Domain host | `asset-packs-pipelines/syntheses/domain` | `measureDataPackAbsolutesAndIdentity`, static analysis, `resolveMeasureSourceSet` |
| Pipeline | `asset-packs-pipelines/syntheses/{deposit,read}` | After DP synthesis, attach absolutes + identity + measureReport |
| Tools postprocess | `@bitcode/agent-generics` `factoryToolsExecution` | Flat `useTools` or sequenced `toolPlan` waves |

**Unit under measure:** synthesized **DataPack** (patch + metadata), not the whole repository as commodity. Bodies may be read only via **measure source set** (covered + patch + manifests + optional sibling tests).

## Commercial catalogue law (live)

| Law | Value |
| --- | --- |
| Kind count | **65** (SSOT package; not a 11- or 46-kind subset) |
| Weight law | **Every kind has weight; Σ = 1** |
| Completeness | Product bags expand to full catalogue; fill rows must be `status: expanded-fill` |
| Honesty statuses | `measured` \| `estimated` \| `insufficient_evidence` \| `expanded-fill` \| `not_run` \| `not_implemented` |
| measureReport | Required product telemetry when measure ran (bodies, coverage, mode, fill/measured counts) |
| materialIdentity | Optional bag; required for excellent buyer legibility when manifests/bodies exist |

Policy roles (`weighted` \| `gate` \| `penalty` \| `flag` \| `target`) remain operational metadata; they do **not** remove kinds from the commercial catalogue.

## Structure performance (report-owned)

Static analysis **report-owned** kinds (host prefers report magnitudes only for these):

`function-count`, `type-count`, `file-span`, `symbolic-richness`, `modularity`,
`lang-span`, `test-surface`, `api-surface`, `dependency-span`, `doc-signal`,
`config-surface`.

Expanding a report over the full catalogue to volume 0 **must not** override bare
or material-identity readings for non-report-owned kinds.

## Deep measure source set

| Input | Rule |
| --- | --- |
| Covered + fileChanges | Always in path scope |
| Manifests | Always force when present in checkout bodies (package.json, locks, go.mod, Cargo.toml, pyproject, requirements, pom, gradle, Gemfile, composer, Dockerfile, …) |
| Sibling tests | Optional include for covered production paths |
| Cap | `BITCODE_DEPOSIT_MAX_MEASURE_BODIES` (default 80) + truncate telemetry |
| Lenses | Deposit **and** read Implementation |

## ToolsExecution waves

| Shape | Behavior |
| --- | --- |
| `useTools[]` | One sequential wave (backward compatible) |
| `toolPlan: ToolWave[]` | Ordered waves; each wave `sequential` and/or `parallel` |
| `usedTools` | Accumulated in wave order with `waveIndex` |
| PTRR steps | Still only Try + Retry tool-capable — no new steps |

## Product surfaces

| Surface | Honesty / identity |
| --- | --- |
| Deposit option card | Measure report strip; material identity + deps-by-usage; status badges; review artifact download |
| Exchange detail | Same measureReport + status + deps inventory (source-safe) |
| Pack activity | Project `status`, `materialIdentity`, `measureReport` |
| Review artifact | `bitcode.datapack.review-artifact` v1 (path-op + measurements + honesty) |
| Path-op patch | `bitcode.artifact.patch` protocol export |

## Test bindings

| Surface | Tests |
| --- | --- |
| Catalogue weights | `domain/data-pack-absolutes-catalog` core |
| Bare kinds | each `absolutes/<kind>/src/__tests__/core` |
| Material identity | `domain/data-pack-material-identity` core |
| Agent registry | `generic-agents/agent-measure-absolutes` core |
| Tool waves | `agent-generics` `tools-execution-waves.core` |
| Source set | `resolve-measure-source-set.core` |
| Host multi-file | `measure-datapack-multi-file.core` |
| Fixture matrix | `measure-fixture-matrix.core` (TS multi-lang-service, python-api, go-module) |
| Expand honesty | uapi `expandAbsoluteMeasurements` |
| Deposit/Exchange UX | deposit admission, pack activity, exchange page |

## Progress notes

- **2026-07-24:** Hierarchy packages scaffolded; weighted path uses bare measures; old monolithic category package removed.
- **2026-07-25:** Excellence pass — full 65-kind Σ=1 catalogue; honesty + measureReport + materialIdentity carrier; deep measure source set; report-owned merge fix; toolPlan waves; deposit/Exchange display; review artifact; multi-language fixtures.
- **2026-08-03:** Implementation-completeness audit classes A–E applied:
  - **P0:** Semantics class D (confidence invention) → host/quality signal or
    `insufficient_evidence` via `hostSignalMeasuredOrInsufficient`; residual
    “46-kind” language → 65; fixture pins for no confidence invention.
  - **P1:** Multi-language function/type bare heuristics aligned with host
    static-analysis patterns; measure source set still required for body path.
  - **P2:** `extractExecutionMeasureSignals` merges verification/provenance/
    quality bags from execution into bare `staticSignals` (no invention).
  - **P3:** Core tests for remaining 19 companion kinds; catalog length exact 65.
