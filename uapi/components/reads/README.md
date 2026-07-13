# Reads experience (`Reads*`)

## Layout

```
reads/
  README.md
  models/
    deposit-read-workbench.ts                    # stable public re-exports
    deposit-read-workbench-types.ts
    deposit-read-workbench-snapshot.ts
    deposit-read-workbench-normalize.ts          # normalize snapshot → view model
    deposit-read-workbench-normalize-helpers.ts
    deposit-read-evidence-rows.ts                # evidence facade
    deposit-read-evidence-row-builders.ts        # row-builder facade
    deposit-read-evidence-disclosure-rows.ts
    deposit-read-evidence-asset-pack-rows.ts
    deposit-read-evidence-need-rows.ts
    enterprise-reading-ux-types.ts               # step catalog + types
    enterprise-reading-ux-state.ts               # builders + re-exports
    read-route-session-types.ts
    read-route-helpers.ts
    read-procurement-governance.ts
    read-fit-measurement-review.ts
    read-settlement-rights-delivery.ts
    read-route-model.ts                          # session facade + stage helpers
    read-route-rows.ts                           # session / procurement / authority rows
    read-scenarios.ts
    read-format.ts
    read-workbench-values.ts
  ReadPageClient/
    ReadPageClient.tsx                           # thin orchestration
    hooks/
      use-read-route-params.ts
      use-read-live-runs.ts
      use-read-url-navigation.ts
      use-read-pipeline-telemetry.ts
      use-read-session-projections.ts
      use-read-activity-recording.ts
  ReadsPipelinesSection/
  ReadsPipelineTelemetry/
  ReadsRouteStateAside/
  ReadsPipelinesMaster/
  ReadsRepositoryContextPanel/
    hooks/use-reads-repository-vcs.ts
  ReadsRepositoryFieldGrid/
  ReadsRepositoryConnectionUnit/
  ReadsRepositorySupplyUnit/
  ReadsRepositoryGuidanceUnit/
  ReadsReadScenarioPanel/
    hooks/use-read-scenario-actions.ts
  ReadsReadScenarioFittingReview/
  ReadsReadScenarioList/
  ReadsDepositReadWorkbench/
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
```

Page shell: `uapi/app/reads/`.

Import Bitcode only (no cross-experience imports for new work). Full filesystem
contract: `internal-docs/BITCODE_SOURCE_LAYOUT.md`.

Stable external import for workbench models remains:
`@/components/reads/models/deposit-read-workbench`.

Stable external import for route model remains:
`@/components/reads/models/read-route-model` (also via deprecated
`@/app/reads/read-route-model` re-export).
