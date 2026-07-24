# generic-measurements

Bare measurement **implementations** (not tools, not agents). Commodity: **DataPack**.

## Hierarchy (canon)

```
measurement-generics
  → generic-measurements/absolutes/<kind>     # one package per absolute (bare primitive)
  → generic-measurements/needinesses/<kind>   # later
  → generic-measurements/shared|domain
  → generic-tools/tool-measure-<kind>         # one Execution tool per bare kind
  → generic-agents/agent-measure-absolutes    # base agent owns tool registry
      → factoryDepositAbsolutesMeasureAgent   # product (deposit)
      → factoryReadAbsolutesMeasureAgent      # product (read)
  → deposit/read pipelines host measureDataPackAbsolutes
  → depository index (absolute_kinds / absolute_volumes)
  → hybrid depository search (lexical + vector + absolute facets)
  → exchange UX buyer chips
```

## Layout

| Path | Package | Role |
| --- | --- | --- |
| `absolutes/<kind>/` | `@bitcode/generic-measurements-absolutes-<kind>` | Bare pure measure for one absolute |
| `shared/absolute-measure-input/` | `@bitcode/generic-measurements-shared-absolute-measure-input` | DP-facing input contracts |
| `domain/data-pack-absolutes-catalog/` | `@bitcode/generic-measurements-domain-data-pack-absolutes-catalog` | Commercial law: **46** kinds, each weighted, **Σ = 1** |
| `needinesses/` | neediness packages (read) | Later |
| `tech-types/` | tech signal vocabulary | Existing |

## Law

- Measure a **DataPack** (synthesized), not the repository as the commercial object.
- Deposit: `needinesses` always `[]`.
- Absolute catalogue law: **46 kinds** in `DATA_PACK_ABSOLUTES_CATALOG`, each weighted,
  **Σ weights = 1** (no separate 11-kind subset — that is legacy).
- **No learning-gain** — BTD / need-fit owns exchange value.
- `policyRole` (gate / penalty / flag / weighted) is operational metadata; all kinds remain in Σ.

## Spec

- `.specifications/BITCODE_SPEC_V48.md` (measurement law + hierarchy)
- `.specifications/BITCODE_SPEC_V48_ABSOLUTE_MEASUREMENT_PARITY_MATRIX.md`
