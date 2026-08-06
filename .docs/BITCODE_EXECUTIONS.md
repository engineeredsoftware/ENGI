# Bitcode Executions Notes

Status: non-canonical internal note.

## Meaning

An execution is a proof-bearing Bitcode inference run. It may measure a Read, synthesize a DataPack, deliver a connected-interface written asset, or perform another specified Bitcode action.

Executions are not generic work items. They are source-to-shares procedures with explicit input, phase, state, output, and proof boundaries.

## product Experience

The product execution surface should show:
- source and repository context,
- measured Read and review state,
- fit-review quality rows,
- phase and agent progress,
- validation and readiness decisions,
- saved DataPack output,
- delivery-mechanism evidence,
- proof and settlement receipts.

## Current Implementation

Current source routes and components include:
- `apps/uapi/app/executions/*`
- `apps/uapi/app/api/executions/*`
- `packages/api/src/routes/shippables.ts`
- `packages/asset-packs-pipelines/domain/*` (all-3)
- `packages/asset-packs-pipelines/syntheses/domain/*` (both synths)
- `packages/asset-packs-pipelines/syntheses/{deposit,read}/*` (product)
- `packages/asset-packs-pipelines/settle/*`
- execution history and event readers in `apps/uapi/app/api/executions/history/*`

Storage-edge compatibility names may remain behind explicit translation, but internal docs and SPEC promotion should use Bitcode execution, DataPack execution, Read measurement, fit review, and Finish.

## Operator Decisions

Operators should be able to:
- accept a measured Read,
- reject a measured Read,
- request remeasurement with feedback,
- review present fit qualities,
- inspect settlement receipts,
- choose or confirm delivery destinations where allowed,
- reread the final DataPack and delivery evidence.

## Open Reform Requirements

- Replace work-item-first labels with Read-first labels.
- Replace output-object-first labels with DataPack or written-asset labels.
- Replace pre-Finish labels with Finish and delivery-mechanism labels.
- Keep computer-use hidden unless the server admits it internally for Read measurement.
- Ensure all execution UI reads from the same Exchange activity model as `/exchange`.

## Stream telemetry vs product terminal (synthesis runs)

Pipeline SSE is **progress telemetry**, not the product close signal by itself.

| Concern | Shared vs product-specific |
| --- | --- |
| SDIVF Finish stores (`finish/completion`) | Shared substrate (deposit + read) |
| `ExecutionStreamAdapter` not mapping `key=completion` → terminal | Shared stream law |
| Persist envelope + emit product `completion` | **Per product route** (deposit: `depositOptionSynthesis`; read: mirror when wired) |
| Option-card hydrate | **Per experience** (`/deposits` today; `/reads` when parity lands) |

1. **In-band Finish** — SDIVF may store `finish/completion` while the host run is
   still owned by the route dispatcher. Those stores must stream as ordinary
   status/progress events, **not** as terminal `completion`.
2. **Product terminal (deposit today)** — After
   `dispatch-deposit-synthesis` persists `depositOptionSynthesis`, it emits
   `completion` with `depositOptionsReady: true` + envelope. That is when
   `/deposits` may treat the run as closed for option cards.
3. **Hydrate order (deposit)** — Prefer `executions.output` or the product
   completion payload; history GET retry is fallback only. See deposits README
   and `ASSET_PACKS.md` §8.3.

**Deposit regress symptom:** Finish / READY TO FINISH in the log, then false
“Synthesized options were not found” while the row already has options.
