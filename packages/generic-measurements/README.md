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
  → depository index (absolute_kinds / absolute_volumes) + exchange UX
```

## Layout

| Path | Package | Role |
| --- | --- | --- |
| `absolutes/<kind>/` | `@bitcode/generic-measurements-absolutes-<kind>` | Bare pure measure for one absolute |
| `shared/absolute-measure-input/` | `@bitcode/generic-measurements-shared-absolute-measure-input` | DP-facing input contracts |
| `domain/data-pack-absolutes-catalog/` | `@bitcode/generic-measurements-domain-data-pack-absolutes-catalog` | Full target + weighted Σ=1 catalogue |
| `needinesses/` | neediness packages (read) | Later |
| `tech-types/` | tech signal vocabulary | Existing |

## Law

- Measure a **DataPack** (synthesized), not the repository as the commercial object.
- Deposit: `needinesses` always `[]`.
- Full absolute catalogue: 46 kinds (B1–B6; **no learning-gain** — BTD owns exchange value).
- Weighted commercial subset: `DATA_PACK_ABSOLUTES_CATALOG` (11 kinds, weights sum to 1).
- Hygiene kinds are first-class packages; product policy may gate/penalize without weighting.

## Spec

- `.specifications/BITCODE_SPEC_V48.md` (measurement law + hierarchy)
- `.specifications/BITCODE_SPEC_V48_ABSOLUTE_MEASUREMENT_PARITY_MATRIX.md`
