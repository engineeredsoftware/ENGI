# asset-packs-pipelines

Product AssetPack **pipelines** (specific + base + primitive). Domain helpers
and agents remain in `@bitcode/pipeline-asset-pack`.

## Hierarchy

```
Pipeline
  → SDIVFPipeline / SimplePipeline
      → SynthesizeDepositsSDIVFPipeline   # synthesize-deposits/
      → SynthesizeReadsSDIVFPipeline      # synthesize-reads/
      → SettleReadsSimplePipeline         # settle-reads/
```

| Path | Package | Pattern | Role |
| --- | --- | --- | --- |
| `synthesize-deposits/` | `@bitcode/asset-packs-pipelines-synthesize-deposits` | SDIVF | Depositor repo → measured packs for Depository |
| `synthesize-reads/` | `@bitcode/asset-packs-pipelines-synthesize-reads` | SDIVF | Accepted Need → packs from Depository |
| `settle-reads/` | `@bitcode/asset-packs-pipelines-settle-reads` | Simple | Validate, BTC/BTD/rights finalize, PR ship to read repo |

**No lens:** three separate product pipelines — never one factory with deposit|read mode.
