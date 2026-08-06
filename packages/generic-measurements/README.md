# generic-measurements

Bare measurement **implementations** (not tools, not agents). Commodity: **DataPack**.

## Hierarchy (canon)

```
measurement-generics                          # carrier: absolutes | needinesses | materialIdentity
  → generic-measurements/absolutes/<kind>     # one package per absolute (bare)
  → generic-measurements/needinesses          # read *-fit
  → generic-measurements/domain/
        data-pack-absolutes-catalog           # commercial Σ=1 catalogue law
        data-pack-material-identity           # compositions / inventories / tags
  → generic-tools/tool-measure-<kind>
  → generic-agents/agent-measure-absolutes    # full catalogue registry
      → factoryDeposit|ReadAbsolutesMeasureAgent
  → deposit/read host measureDataPackAbsolutesAndIdentity
  → depository index (absolute_* + material_identity)
  → hybrid search (lexical + vector + absolute + identity corpus)
  → deposit review / read options / exchange detail
```

## Layout

| Path | Package | Role |
| --- | --- | --- |
| `absolutes/<kind>/` | `@bitcode/generic-measurements-absolutes-<kind>` | Bare pure measure for one absolute |
| `shared/absolute-measure-input/` | `@bitcode/generic-measurements-shared-absolute-measure-input` | DP-facing input contracts |
| `domain/data-pack-absolutes-catalog/` | `@bitcode/generic-measurements-domain-data-pack-absolutes-catalog` | Commercial law: full catalogue, each weighted, **Σ = 1** |
| `domain/data-pack-material-identity/` | `@bitcode/generic-measurements-domain-data-pack-material-identity` | Buyer multi-valued identity + companion scalars |
| `needinesses/` | neediness packages (read) | Read *-fit |
| `tech-types/` | tech signal vocabulary | Existing |

## Law

- Measure a **DataPack** (synthesized), not the repository as the commercial object.
- Deposit: `needinesses` always empty; **materialIdentity** attached when measured.
- Absolute catalogue law: full `DATA_PACK_ABSOLUTES_CATALOG` (structure/quality +
  material-identity companions), each weighted, **Σ weights = 1**.
- **No learning-gain** — BTD / need-fit owns exchange value.
- `policyRole` (gate / penalty / flag / weighted) is operational metadata; all kinds remain in Σ.
- Models do not invent volumes or identity tags — host/tools measure; agents classify into closed vocabs only over measured signals.

## Spec

- `.specifications/BITCODE_SPEC_V48.md` (measurement law + hierarchy)
- `.specifications/BITCODE_SPEC_V48_ABSOLUTE_MEASUREMENT_PARITY_MATRIX.md`
