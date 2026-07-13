# Deposits experience (`Deposits*`)

Commercial IP-seller surface for `/deposits`: connect source, synthesize measured
AssetPack options (SynthesizeAssetPacks SDIVF), review source-safely, admit to
the Depository, and track authority/earnings.

## Layout

```
deposits/
  README.md
  models/                              # pure projections (no React)
    deposit-activity-ledger.ts         # anchors, pipeline-table filters
    deposit-route-input-builder.ts     # DepositRouteSession input assembly
    deposit-route-model.ts             # session/stage law
    deposit-route-rows.ts              # session/authority row builders
    deposit-source-criticality.ts
    deposit-source-helpers.ts          # path split / JSON helpers
    deposit-settled-demand.ts
    deposit-run-status.ts              # row → synthesis status mapping
    deposit-preferred-signer.ts
    deposit-format.ts / explainers / timing
    __tests__/
  DepositPageClient/
    DepositPageClient.tsx              # thin orchestration
    deposit-page-client.constants.ts
    hooks/
      use-deposit-route-params.ts
      use-deposit-live-runs.ts
      use-deposit-url-navigation.ts
      use-deposit-settled-demand.ts
      use-deposit-network-depository-count.ts
      use-deposit-synthesis-activity.ts
      use-deposit-option-actions.ts
      use-deposit-activity-recording.ts
  DepositSourceSelection/
    DepositSourceSelection.tsx
    DepositSourceListRefreshButton.tsx
    hooks/use-deposit-source-vcs.ts
  DepositObfuscationsPanel/
  DepositAssetPackOptions/
  DepositPipelinesMaster/
  DepositSynthesisTelemetry/
  DepositActivityLedgerDetail/
  DepositRouteStateAside/
  DepositObfuscationsPathIcons/
```

Page shell: `uapi/app/deposits/` (metadata + client mount only).

## Import rules

- Import **Bitcode** bases only (not other experiences).
- Pure logic → `models/`. Stateful IO → `hooks/`. UI units → named directories.
- Co-locate unit tests under `models/__tests__/` or component `__tests__/`.

## Product language

- **Pipeline** for run surfaces (master table, telemetry log).
- **Journal** for BTD ledger vocabulary.
- No Terminal product surface.
