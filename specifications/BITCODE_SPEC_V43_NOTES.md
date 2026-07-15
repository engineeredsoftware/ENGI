# Bitcode Spec V43 Notes

## Status

- Version: `V43`
- V43 state: canonical promotion complete; V43 notes record accepted route vocabulary, PackActivity, Reading, Depositing, policy, admission, UX, rehearsal, and promotion-readiness evidence
- Current canonical/latest target: `V43`
- Canonical proof-source commit: `3c7a9f998656635cc28c8b4584ae964ac04154fa`
- Prior canonical anchor: `BITCODE_SPEC_V42.md`
- Prior generated proof appendix: `BITCODE_SPEC_V42_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v43-spec-family-report.json`, `.bitcode/v43-canonical-input-report.json`, `.bitcode/v43-canon-posture-drift-report.json`, `.bitcode/v43-route-vocabulary-inventory.json`, `.bitcode/v43-packs-activity-master-detail.json`, `.bitcode/v43-read-route-five-step-ux.json`, `.bitcode/v43-deposit-route-options.json`, `.bitcode/v43-deposit-policy-compensation.json`, `.bitcode/v43-deposit-option-admission.json`, `.bitcode/v43-route-ux-product-excellence.json`, `.bitcode/v43-cross-route-rehearsal-telemetry-repair.json`, `.bitcode/v43-promotion-readiness-report.json`, V43 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V43_PROVEN.md` as the generated proof appendix for V43 promotion
- Source parity state: V43 source-side route vocabulary, Packs master-detail, Read five-step UX, deposit option synthesis, deposit policy/compensation, deposit option admission, route UX, cross-route rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V43 file family
- Scope: V43 canonical notes for product routes and agentic depositing over promoted V42 reliable MVP canon
- Last fully realized canonical target preserved in source: `V43`

## Notes companion rule

These notes clarify V43 only. The active canon remains V42 until V43 promotion.

## Concise current-system reading

V42 made the reliable MVP path real enough to refine product shape. V43 should now remove transitional vocabulary and make the primary enterprise experience:

- `/deposit`: connect source, synthesize deposit AssetPack options, review source-safe measurements and demand/ROI posture, approve or reject Depository admission.
- `/read`: request technical knowledge, review synthesized Need, request Finding Fits, preview source-safe AssetPack measurements, settle in BTC/BTD, receive repository delivery.
- `/packs`: inspect and search all pack activity, including deposit options, Depository admission, previews, settlement, rights transfer, compensation, delivery, proof roots, and repair states.

The strongest simplification is AssetPacks in and AssetPacks out. Depositing creates AssetPacks for the Depository; Reading buys synthesized Need-Fit AssetPacks.

## Simplified-spec reading rule

When V43 work feels broad, reduce it to the route law:

1. Packs is activity and inspection.
2. Read is buying source-bearing technical knowledge after Need review and settlement.
3. Deposit is selling source-derived AssetPack options only after depositor review and approval.
4. Source is never disclosed before settlement and rights transfer.
5. The UI should explain itself through the workflow, not through in-app essays.

## V43 UX/product note

The current UX is not good enough. V43 should keep strong themed components where they work, especially execution-log rows and proof expansion, but replace confusing cockpit flow with direct route paths and dense, legible master-detail surfaces.

The `/packs` master table must support search over measurements, synthesized titles and descriptions, values, activity/transaction type, settlement state, compensation posture, proof roots, and repair state.

## V43 agentic deposit note

The deposit-side pipeline should help an enterprise decide what IP to sell. It should compare connected source, Depository supply, and Reading demand. It should propose multiple deposit AssetPack options, reject or warn on critical IP, estimate positive ROI where possible, expose BTD potential as an estimate only, and preserve final BTD mint/right law for paid Need-Fit settlement.

Gate 5 implements the source-safe route and option-synthesis foundation only:
`/deposit`, `DepositRouteSession`, and `DepositAssetPackOptionSynthesis`.
Criticality, demand/ROI policy, compensation policy, admission, and indexing are
deliberately carried as deferred boundaries for Gates 6 and 7. Product route
state may show option measurements, source path roots, demand signal roots,
review posture, and proof roots; it may not serialize raw source, unpaid
AssetPack source, prompts, provider responses, credentials, or wallet private
material.

Gate 6 closes the criticality, demand, ROI, BTD-potential, and compensation
policy layer without admitting source into the Depository. `DepositAssetPackOptionPolicyReport`
is source-safe metadata: it records signal roots, policy decisions, expected net
sats, estimate-only BTD posture, and future BTC source-to-shares compensation
route. It must not serialize raw source, unpaid AssetPack source, prompts,
provider responses, wallet private material, or private settlement payloads.
Gate 7 remains responsible for depositor approval, reject/resynthesize
decisions, Depository admission receipts, indexing, storage projection,
telemetry, and `/packs` activity synchronization.

Gate 7 closes depositor approval and admission as source-safe metadata.
`DepositAssetPackOptionAdmissionReport` records review decisions, admission
receipts, Depository index projections, object-storage metadata projections,
BTC source-to-shares compensation preview continuity, execution-stream
telemetry roots, and `/packs` synchronization as `depository-assetpack`
activity. Rejected, pending, resynthesis-requested, or policy-blocked options
must not enter the Depository. Admitted options still do not mint BTD, transfer
rights, reveal unpaid AssetPack source, or serialize prompts, provider
responses, wallet material, or private settlement payloads.

Gate 8 closes the shared product route shell polish layer. `ProductRouteShell` now frames
`/packs`, `/read`, and `/deposit`; `ProductRouteStepGrid` owns the Reading and
Depositing step controls with active `aria-current` semantics; `ProductRouteStatePanel`
normalizes loading, empty, and error states; and `ProductRouteDisclosure`
keeps proof/source-safety detail expandable. Product route copy should stay
concise: route labels, status summaries, metrics, and visible/withheld
boundaries. Longer explanation belongs in public documentation and generated
proofs, not the core product flow.

Gate 9 closes the first cross-route rehearsal layer. `V43CrossRouteRehearsalTelemetryRepair`
binds local and staging-testnet operator receipts across `/deposit`, `/read`,
and `/packs`: deposit option synthesis/admission, Reading Need review, Finding
Fits request, source-safe preview, BTC/BTD settlement, repository delivery,
contributor compensation readback, pack activity inspection, and repair
posture. The staging-testnet lane is explicitly bound to Supabase project
`tkpyosihuouusyaxtbau` and requires real-inference, pipeline database
streaming, Vercel Sandbox harness, and Supabase credential families without
serializing credential values. Gate 9 telemetry/database/ledger/storage proof
is source-safe metadata only: no protected source, unpaid AssetPack source,
raw prompts, interpolated prompts, raw provider responses, wallet private
material, private settlement payloads, or live rehearsal logs may enter the
generated artifact or operator receipts.

## Gate 10: V43 Promotion Readiness

Gate 10 closes the V43 draft branch as promotion-ready without itself advancing
`BITCODE_SPEC.txt`. `V43PromotionReadinessReport` binds every V43 artifact,
workflow, documentation update, package export, package test, promotion script,
generated PROVEN hook, and source-safety boundary needed for the eventual
`version/v43` to `main` promotion pull request.

The expected post-promotion runtime posture is active V43 / draft V44. The
promotion workflow must generate `BITCODE_SPEC_V43_PROVEN.md`, prepare the
runtime canon files, advance `BITCODE_SPEC.txt` to `V43`, and then verify the
posture drift and canonical inputs. The promotion validation shell groups every
promotion command and bounds package validations so greenable promotion failures
identify the failing proof surface instead of hanging opaquely. The readiness
report remains source-safe
metadata only; if a secret, protected source body, raw prompt/provider payload,
unpaid AssetPack source, wallet private material, or value-bearing mainnet
admission appears in the proof, promotion remains blocked.

## V43 copy boundary

Outside public docs, avoid self-referential copy such as text explaining that a component is powerful or that Bitcode is doing a thing. Use clear route names, labels, status rows, measurement summaries, empty states, and expandable proof metadata. Public docs may explain the protocol; product UI should operate it.

## Gate 2 route vocabulary inventory note

Gate 2 closes by proving the current vocabulary surface before renaming it. The
source-safe `.bitcode/v43-route-vocabulary-inventory.json` artifact records
file/token counts for `/exchange`, Exchange, `/terminal`, Terminal, `/packs`,
`/read`, `/deposit`, Reading, Depositing, PackActivity,
DepositAssetPackOption, and self-referential copy references. Its migration
matrix prepares `/packs`, `/read`, `/deposit`, retained debug cockpit,
redirect compatibility, and later copy-removal work. The artifact is metadata
only; it intentionally excludes source snippets, raw prompts, provider
responses, protected source, unpaid AssetPack source, credentials, and wallet
or settlement private material.

## Gate 3 packs activity master-detail note

Gate 3 closes the first product-route implementation slice. `/packs` now owns
the pack activity master-detail surface and `/api/packs/activity` exposes a
source-safe PackActivity projection over current activity. `/exchange` is
retained only as a compatibility redirect into `/packs`.

The route defaults to low-friction search and table scanning: search,
activity-type filtering, state filtering, sort-key selection, ascending/
descending sort, and selected detail readback. The detail projection surfaces
overview, measurements, value signals, proof roots, settlement state,
compensation state, delivery state, repair state, and redacted metadata. It is
explicitly source-safe: no protected source, unpaid AssetPack source, source
snippets, raw prompts, interpolated prompts, raw provider responses,
credentials, wallet private material, or private settlement payloads may cross
this boundary.

## Gate 4 read route extraction note

Gate 4 makes `/read` the direct product path for enterprise Reading. The route
owns `ReadRouteSession` and the five-stage user flow: request Read, review the
synthesized Need, request Finding Fits, review the source-safe AssetPack
preview, and settle for delivery. It reuses the current live Reading workbench
and rich execution stream so runtime behavior stays connected to V42 pipeline
reality while the route vocabulary becomes clearer.

The source-safety law is unchanged: `/read` may show request summaries, Need
measurements, fit ids, proof roots, quality posture, BTC fee quotes,
settlement state, and delivery posture before settlement. It must not show
protected source, unpaid AssetPack source, raw prompts, interpolated prompts,
raw provider responses, wallet private material, private settlement payloads,
or ledger write authority before paid read rights are proven.
