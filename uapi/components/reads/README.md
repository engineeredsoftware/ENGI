# Reads experience (`Reads*`)

## Layout

```
reads/
  README.md
  models/
    deposit-read-workbench.ts              # stable public re-exports
    deposit-read-workbench-types.ts        # source revision + workbench types
    deposit-read-workbench-snapshot.ts     # live shell snapshot builder
    deposit-read-workbench-normalize.ts    # snapshot → deposit/read/fit view model
    deposit-read-evidence-rows.ts          # pure evidence/key-value row builders
    enterprise-reading-ux-state.ts
    read-route-model.ts
    read-scenarios.ts
    read-format.ts
    read-workbench-values.ts
  ReadPageClient/
    ReadPageClient.tsx
    hooks/use-read-route-params.ts
  ReadsDepositReadWorkbench/
    ReadsDepositReadWorkbench.tsx          # orchestration only
    hooks/
      use-deposit-read-activity-recording.ts
      use-deposit-read-harness.ts
      use-deposit-read-need-actions.ts
  ReadsDepositReadWorkbenchEmpty/
  ReadsDepositWorkbenchSupplyCards/
  ReadsDepositStagedReadingSection/
  ReadsDepositReadNeedReviewPanel/
  ReadsDepositSourceSafePreviewPanel/
  ReadsMeasuredReadAdmissionPanel/
  ReadsFitWorkbenchPanel/
  ReadsEnterpriseReadingSteps/
  ReadsRepositoryContextPanel/
  ReadsReadScenarioPanel/
  ReadsPipelinesMaster/
```

Page shell: `uapi/app/reads/`.

Import Bitcode only. Full filesystem contract: `internal-docs/BITCODE_SOURCE_LAYOUT.md`.

Stable external import for workbench models remains:
`@/components/reads/models/deposit-read-workbench`.
