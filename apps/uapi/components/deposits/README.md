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

## Product terminal vs stream telemetry (do not regress)

**Scope split (keep these distinct in commits and reviews):**

| Layer | Scope | Code |
| --- | --- | --- |
| Stream type inference | **Shared** — deposit *and* read synthesis hosts use the same adapter | `ExecutionStreamAdapter.inferEventType` |
| Selection envelope write + product `completion` payload | **Deposit** (`depositOptionSynthesis`) | `dispatch-deposit-synthesis.ts` |
| Option-card hydrate | **Deposit** `/deposits` | `use-deposit-synthesis-lifecycle` + `deposit-synthesis-options-hydrate` |

Read synthesis should follow the same *pattern* later (`read` envelope + product
close), but must not be assumed implemented until its dispatch mirrors deposit.

Deposit option cards hydrate from **`output.depositOptionSynthesis`** on the
`executions` row (and/or the **product** completion SSE payload that carries
the same envelope). They must **not** treat arbitrary stream `type: completion`
as “options ready.”

| Signal | Meaning | Deposit options ready? |
| --- | --- | --- |
| SDIVF Finish agent store `finish` / `completion` | In-pipeline Finish artifact (cleanup / selection envelope in execution tree) | **No** — still mid-product-run |
| Stream event inferred from `key === 'completion'` | **Illegal as terminal** (was a bug: closed UI too early) | **No** |
| Row `status: completed` + `output.depositOptionSynthesis` | Deposit dispatch finished host → built options → **finalized row** | **Yes** |
| SSE `type: completion` with `depositOptionsReady: true` + `depositOptionSynthesis` | Deposit product close after finalize (same data as row write) | **Yes** |

### Correct order (deposit dispatch)

```
SDIVF Finish (host) → raw options
  → buildRealDepositAssetPackOptionSynthesis
  → finalizeExecutionRow({ status, output: { depositOptionSynthesis, … } })
  → emitEvent(completion, { depositOptionsReady, depositOptionSynthesis, … })
  → /deposits UI renders cards from event payload and/or row.output
```

### Client hydrate order (`use-deposit-synthesis-lifecycle`)

1. `synthesisExecution.output.depositOptionSynthesis` (history already loaded)
2. Product completion event payload (`depositOptionsReady` / envelope)
3. History GET with short retry — **fallback only**, not the contract

### Shared stream adapter law (deposit + read)

`ExecutionStreamAdapter.inferEventType`: do **not** map bare `key === 'completion'`
to terminal `completion`. Only `namespace === 'final'` (store path) or an
explicit `emitEvent(..., 'completion')` from the product route. See
`packages/execution-generics/src/storage/ExecutionStreamAdapter.ts` and
`.docs/ASSET_PACKS.md` § Finish vs product close.

### Symptom of regressing this (deposit)

Telemetry shows Finish / READY TO FINISH, then banner
**“Synthesized options were not found for this run”** while DB already has
options — false fail from early stream terminal + premature hydrate.
