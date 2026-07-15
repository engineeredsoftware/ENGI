# Reads experience (`Reads*`)

Commercial IP-buyer surface for `/reads`: master-detail pipelines, shared
repository·branch·commit source package (`DepositSourceSelection`), Need +
Relevant/Irrelevant path steering, SynthesizeReadAssetPacks (SDIVF), option
select, SettleAssetPack → `/packs`.

## Master-detail (shared across product routes)

| Route | Master | Detail | Back |
| --- | --- | --- | --- |
| `/packs` | Activity table | Selected AssetPack / proof detail | Via selection |
| `/deposits` | Pipelines table | Source + Obfuscations + options | Back to Deposit |
| `/reads` | Pipelines table | Source + Need + options | Back to Read |

## Layout

```
reads/
  README.md
  models/
    deposit-read-workbench.ts            # stable type re-exports (activity drafts)
    deposit-read-workbench-types.ts
    enterprise-reading-ux-types.ts       # step catalog + types
    enterprise-reading-ux-state.ts       # builders + re-exports
    read-route-session-types.ts
    read-route-helpers.ts
    read-procurement-governance.ts
    read-fit-measurement-review.ts
    read-settlement-rights-delivery.ts
    read-route-model.ts                  # session facade + stage helpers
    read-route-rows.ts                   # session / procurement / authority rows
    read-scenarios.ts                    # measurement draft types (activity history)
    read-format.ts
  ReadPageClient/
    ReadPageClient.tsx                   # thin orchestration
    hooks/
      use-read-route-params.ts
      use-read-live-runs.ts
      use-read-url-navigation.ts
      use-read-pipeline-telemetry.ts
      use-read-session-projections.ts
      use-read-activity-recording.ts
      use-read-option-synthesis.ts
  ReadsPipelinesMaster/                  # table + New (+) + Back
  ReadsPipelineTelemetry/
  ReadsNeedComposePanel/                 # Need + path pickers + synthesize CTA
  ReadsNeedPathPickers/
  ReadsAssetPackOptions/
  ReadsOptionCard/
  ReadsRouteStateAside/
```

Source selection reuses `deposits/DepositSourceSelection` (same SHA element as
deposit) with route-facing copy overrides.

Page shell: `apps/uapi/app/reads/`.

Import Bitcode bases + shared deposit source selection only where the product
law is one source package control. Full filesystem contract:
`docs/BITCODE_SOURCE_LAYOUT.md`.

Stable external import for workbench **types** remains:
`@/components/reads/models/deposit-read-workbench`.

Stable external import for route model remains:
`@/components/reads/models/read-route-model`.
