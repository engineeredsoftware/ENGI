# generic-asset-packs

Nested AssetPack bases over `@bitcode/asset-packs-generics` (primitives include
measurements from `@bitcode/measurement-generics`).

## Layout

| Nested package | npm name | Role |
| --- | --- | --- |
| `synthesis/` | `@bitcode/generic-asset-packs-synthesis` | **Shared** synthesize base: `SynthesisAssetPack` + catalogs + Absolutes agent + patch artifact |
| `deposit-synthesized/` | `@bitcode/generic-asset-packs-deposit-synthesized` | Deposit specialization: needinesses `[]`, **never** obfuscations on the pack |
| `read-synthesized/` | `@bitcode/generic-asset-packs-read-synthesized` | Read specialization: needinesses + BTD/BTC commercial fields |
| `settle/` | `@bitcode/generic-asset-packs-settle` | Settle product surface markers |
| `measured-patch/` | `@bitcode/generic-asset-packs-measured-patch` | **Deprecated** re-export of synthesis (import stability) |

## Hierarchy

```
@bitcode/measurement-generics
@bitcode/asset-packs-generics          # AssetPack { …, measurements }
  → generic-asset-packs/synthesis      # SynthesisAssetPack (shared deposit+read)
      → deposit-synthesized            # DepositSynthesizedAssetPack
      → read-synthesized               # ReadSynthesizedAssetPack
  → settle
  → asset-packs-pipelines-*
```

### Shared vs specialized

| Field | Synthesis (shared) | Deposit | Read |
| --- | --- | --- | --- |
| identity, sourceBinding, patch | ✓ | ✓ | ✓ |
| measurements.absolutes | ✓ | ✓ | ✓ |
| measurements.needinesses | empty or open | always `[]` | *-fit rows |
| title, summary, provenant paths | ✓ | ✓ | ✓ |
| kind / confidence / covered paths | — | deposit options | optional |
| needFit, btd, btc, settleable | — | — | ✓ |
| **obfuscations** | never | **never on pack** | never |

Obfuscations remain deposit **pipeline input** only; they must not appear on any
AssetPack commercial object.
