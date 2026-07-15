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
    deposit-real-synthesis.ts          # real synthesis result shape for UI
    deposit-repository-anchor.ts       # repository anchor type
    deposit-route-input-builder.ts     # DepositRouteSession input assembly
    deposit-route-model.ts             # session builders + source-safety assert
    deposit-route-session-types.ts     # session/step types + step catalog
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
      use-deposit-synthesis-lifecycle.ts
  DepositSourceSelection/
    DepositSourceSelection.tsx         # shared SHA source package (also used by /reads)
    DepositSourceListRefreshButton.tsx
    hooks/use-deposit-source-vcs.ts
  DepositSourceFieldGrid/              # provider/repo/branch/commit columns
  DepositObfuscationsPanel/            # shell: textarea + synthesize CTA
  DepositObfuscationsAnchorControls/   # load/clear/name-anchor toolbar
  DepositObfuscationsPathPickers/      # Permissible sources / Exclusion trees
  DepositObfuscationsPathIcons/
  DepositAssetPackOptions/             # list shell + batch deposit footer
    DepositAssetPackOptions.tsx
    DepositAssetPackOptions.types.ts
  DepositOptionCard/                   # per-option card body
  DepositPipelinesMaster/
  DepositSynthesisTelemetry/
  DepositActivityLedgerDetail/
  DepositRouteStateAside/              # composes earnings + row sections
  DepositAsideEarningsPanel/
  DepositAsideRowsSection/             # governance / session label-value rows
```

Related API / lib (not under components, but deposit-owned):

```
apps/uapi/app/api/deposit/synthesize-options/
  route.ts
  parse-synthesize-options-body.ts     # pure body parsers
apps/uapi/lib/
  deposit-source-provisioning.ts       # host resolve + inventory + sandbox host
  deposit-source-samples.ts            # bounded prompt sample picker
```

Page shell: `apps/uapi/app/deposits/` (metadata + client mount only). App shims such as
`apps/uapi/app/deposits/deposit-route-model.ts` re-export from
`@/components/deposits/models/deposit-route-model`.

## Import rules

- Import **Bitcode** bases only (not other experiences).
- Pure logic → `models/`. Stateful IO → `hooks/`. UI units → named directories.
- Co-locate unit tests under `models/__tests__/` or component `__tests__/`.
- Prefer models for types shared across components (real synthesis, anchors,
  settled demand, label/value rows) rather than exporting types from UI files.

## Product language

- **Pipeline** for run surfaces (master table, telemetry log).
- **Journal** for BTD ledger vocabulary.
- No product surface.
