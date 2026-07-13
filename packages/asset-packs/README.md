# asset-packs

Product-specific AssetPack packages (nested-family pattern).

## Hierarchy

```
@bitcode/measurement-generics
  → @bitcode/generic-measurements-{measure-agent,absolutes,needinesses}
    → @bitcode/asset-packs-synthesis   # SynthesizeAssetPacks* measurement + catalogs
    → @bitcode/asset-packs-settle      # SettleAssetPacks* (future measurement/settlement)
      → @bitcode/pipeline-asset-pack   # SDIVF pipeline orchestration (consumes these)
```

| Path | Package | Role |
| --- | --- | --- |
| `synthesis/` | `@bitcode/asset-packs-synthesis` | Synthesis-lens catalogs + SynthesizeAssetPacksAbsolutesMeasureAgent |
| `settle/` | `@bitcode/asset-packs-settle` | Settle product surface (stub for Gate 6 measurement/settlement) |
