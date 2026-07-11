# Bitcode pipeline base

Shared pipeline master-detail UI and pure models.

```
pipeline/
  models/                    # pure history, selection, readiness, …
  BitcodePipelinesTable/
    BitcodePipelinesTable.tsx
  BitcodeWorkspaceCard/
  BitcodeActionWorkbenchCard/
  ...
```

Component units use named files + co-located hooks/styles/__tests__.
