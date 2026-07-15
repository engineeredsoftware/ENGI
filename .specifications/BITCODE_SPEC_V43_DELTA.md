# Bitcode Spec V43 Delta

## Status

- Version: `V43`
- V43 state: canonical promotion complete; this delta records the promoted V42-to-V43 product-route and agentic-depositing closure set
- Current canonical/latest target: `V43`
- Canonical proof-source commit: `3c7a9f998656635cc28c8b4584ae964ac04154fa`
- Prior canonical anchor: `BITCODE_SPEC_V42.md`
- Prior generated proof appendix: `BITCODE_SPEC_V42_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v43-spec-family-report.json`, `.bitcode/v43-canonical-input-report.json`, `.bitcode/v43-canon-posture-drift-report.json`, `.bitcode/v43-route-vocabulary-inventory.json`, `.bitcode/v43-packs-activity-master-detail.json`, `.bitcode/v43-read-route-five-step-ux.json`, `.bitcode/v43-deposit-route-options.json`, `.bitcode/v43-deposit-policy-compensation.json`, `.bitcode/v43-deposit-option-admission.json`, `.bitcode/v43-route-ux-product-excellence.json`, `.bitcode/v43-cross-route-rehearsal-telemetry-repair.json`, `.bitcode/v43-promotion-readiness-report.json`, V43 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V43_PROVEN.md` as the generated proof appendix for V43 promotion
- Source parity state: V43 source-side route vocabulary, Packs master-detail, Read five-step UX, deposit option synthesis, deposit policy/compensation, deposit option admission, route UX, cross-route rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V43 file family
- Scope: V43 canonical delta for product routes and agentic depositing over promoted V42 reliable MVP canon

## Why V43 exists

V42 proved the reliable MVP path, but the product route vocabulary is still transitional. V43 exists to make the commercial website experience match Bitcode's actual protocol objects: AssetPacks in and AssetPacks out, Reading through a clear `/read` path, Depositing through a clear `/deposit` path, and all activity through a searchable `/packs` surface.

## Accepted V43 decisions

1. `/exchange` becomes `/packs` across route names, component prefixes, tests, docs, telemetry labels, and operator vocabulary.
2. `/terminal` splits into `/read` and `/deposit` as the default product paths; retained cockpit/debug surfaces must not be the main experience.
3. `/packs` becomes the master-detail table for all pack activity, with search, filtering, sorting, and source-safe detail expansion.
4. `/deposit` gains agentic deposit AssetPack option synthesis from connected source, depositor instructions, Depository state, and Reading demand.
5. Deposit options must expose source-safe measurements, sub-criticality, demand, likely ROI, BTD potential, compensation posture, and admission blockers before approval.
6. `/read` remains the five-step Reading path: request read, review synthesized Need, request Finding Fits, review source-safe AssetPack preview, settle/buy/deliver.
7. Product UX outside public documentation must be self-explanatory through structure, labels, progressive detail, rich components, and visual quality, not self-referential copy.
8. Gate 2 records the route vocabulary inventory in `.bitcode/v43-route-vocabulary-inventory.json` as source-safe file/token counts and a migration matrix only; the actual route rename and split remain owned by later gates.
9. Gate 3 implements the first route migration slice: `/packs` becomes the pack-activity master-detail surface, `/api/packs/activity` projects source-safe PackActivity records, and `/exchange` redirects to `/packs`.
10. Gate 9 binds the local and staging-testnet route path across `/deposit`,
    `/read`, and `/packs` with source-safe rehearsal receipts, telemetry
    readback, ledger/database/storage synchronization checks, repair posture,
    and no value-bearing mainnet admission.
11. Gate 10 binds V43 promotion readiness through
    `.bitcode/v43-promotion-readiness-report.json`, `v43-canon-promotion.yml`,
    V43 PROVEN generation support, promotion scripts support V43, and the
    V43 active / draft V44 post-promotion posture.

## Explicitly deferred

- Value-bearing mainnet admission remains gated by a later canon.
- Advanced conversational overlays are not the default V43 route experience unless a gate explicitly scopes them.
- BTD supply law, BTC settlement conservation, source-to-shares accounting, and unpaid source disclosure boundaries remain inherited from V42/V27.

## Pre-Implementation Sequence

1. Open V43 spec family, roadmap, checker, package script, and workflow posture.
2. Inventory current Exchange/Terminal naming and define route migration.
3. Implement `/packs` data contracts and searchable master-detail.
4. Extract `/read` from Terminal into the default Reading path.
5. Implement `/deposit` and agentic deposit AssetPack option synthesis.
6. Add criticality, demand, ROI, BTD potential, and compensation policy.
7. Close deposit option review/admission and pack activity synchronization.
8. Run UX/UI excellence pass and remove self-referential product copy.
9. Rehearse cross-route local/staging-testnet path.
10. Close promotion readiness.

## Gate 2 delta closure

Gate 2 adds `V43RouteVocabularyInventory`, the generated
`.bitcode/v43-route-vocabulary-inventory.json` artifact, package exports,
protocol tests, workflow checks, and `check:v43-gate2`. The artifact inventories
`/exchange`, Exchange, `/terminal`, Terminal, `/packs`, `/read`, `/deposit`,
Reading, Depositing, PackActivity, DepositAssetPackOption, and self-referential
copy references with source-safe file/token counts. It also formalizes migration
rows for `/packs`, `/read`, `/deposit`, retained debug cockpit boundaries,
redirect compatibility, and product-copy cleanup without serializing source
snippets or source-bearing payloads.

## Gate 3 delta closure

Gate 3 adds `V43PacksActivityMasterDetail`, the generated
`.bitcode/v43-packs-activity-master-detail.json` artifact, package exports,
protocol tests, workflow checks, the `PackActivityRecord` source-safe model,
`/api/packs/activity`, the `/packs` route, compatibility redirect from
`/exchange`, and no-source leak tests. The route supports search, filtering,
column sorting, detail projection, proof roots, settlement/compensation/
delivery/repair readback, and explicit source-safety flags without serializing
protected source, unpaid AssetPack source, raw prompts, provider responses,
credentials, wallet private material, or private settlement payloads.

## Gate 4 delta closure

Gate 4 adds `V43ReadRouteFiveStepUx`, the generated
`.bitcode/v43-read-route-five-step-ux.json` artifact, package exports,
protocol tests, workflow checks, `ReadRouteSession`, `/read`, and focused route
tests. `/read` is now the default Reading path: request Read, review
synthesized Need, request Finding Fits, review source-safe AssetPack preview,
and settle/buy/deliver. Finding Fits remains blocked until a Need is accepted,
preview remains metadata-only before settlement, and delivery remains locked
until paid read rights are proven. The retained Terminal workbench stays
debug-compatible and continues to provide execution stream readback.

## Gate 5 delta closure

Gate 5 adds `V43DepositRouteOptions`, the generated
`.bitcode/v43-deposit-route-options.json` artifact, package exports, protocol
tests, workflow checks, `DepositRouteSession`, `/deposit`, and focused route
and asset-pack package tests. `/deposit` is now the default Depositing path:
connect source, synthesize source-safe AssetPack options, review measurements,
submit supply through the retained deposit composer, and reread Depository
state. Source criticality, demand/ROI, compensation policy, deposit admission,
and indexing remain explicit Gate 6/Gate 7 boundaries. The route and artifact
remain source-safe metadata only.

## Gate 6 delta closure

Gate 6 adds `DepositAssetPackOptionPolicy`,
`DepositAssetPackOptionPolicyReport`, the generated
`.bitcode/v43-deposit-policy-compensation.json` artifact, package exports,
protocol tests, workflow checks, `/deposit` policy readback, and focused
route/package tests. The policy scores each source-safe deposit option for
criticality, likely demand, estimated gross BTC value, development-cost ROI,
estimate-only BTD potential, and future-reader BTC source-to-shares
compensation route. Critical IP is blocked before admission, negative expected
value is not reviewable as positive-ROI supply, and missing wallet posture
requires compensation repair. Admission, Depository indexing, storage
projection, `/packs` synchronization, and final approve/reject/resynthesize
decisions remain Gate 7 boundaries.

## Gate 7 delta closure

Gate 7 adds `DepositAssetPackOptionAdmissionReport`,
`DepositOptionAdmissionReceipt`, `DepositOptionReviewDecision`, the generated
`.bitcode/v43-deposit-option-admission.json` artifact, package exports,
protocol tests, workflow checks, `/deposit` approve/reject/resynthesize controls,
admission readback, and `/packs` activity synchronization. Admission consumes
source-safe option synthesis and policy reports; only depositor-approved,
policy-eligible options enter the Depository. Admitted options project
measurement/metadata indexes, object-storage metadata records, external
raw-source pointer roots, BTC source-to-shares compensation preview continuity,
and execution-stream telemetry. Gate 7 still does not mint BTD, transfer rights,
or disclose unpaid AssetPack source; those boundaries stay with future
Need-Fit settlement.

## Gate 8 delta closure

Gate 8 adds `ProductRouteShell`, `ProductRouteStepGrid`,
`ProductRouteStatePanel`, `ProductRouteDisclosure`, the generated
`.bitcode/v43-route-ux-product-excellence.json` artifact, package exports,
protocol tests, workflow checks, route shell assertions, and focused
`/packs`/`/read`/`/deposit` tests. The route clients now share a themed product
frame, source-safe metrics, concise route summaries, keyboard-accessible step
buttons, compact loading/empty/error states, and expandable disclosure
boundaries. In-app route copy is reduced to workflow/status vocabulary; deeper
protocol explanation stays in docs and generated proofs. Gate 8 keeps every
existing V43 state machine and source-safety boundary intact.

## Gate 9 delta closure

Gate 9 adds `V43CrossRouteRehearsalTelemetryRepair`, the generated
`.bitcode/v43-cross-route-rehearsal-telemetry-repair.json` artifact, package
exports, protocol tests, workflow checks,
`scripts/rehearse-v43-cross-route-product-flow.mjs`, and `check:v43-gate9`.
The cross-route rehearsal covers local and staging-testnet lanes for
`/deposit`, `/read`, and `/packs`: synthesize deposit options, approve an
eligible option, request Reading, review a synthesized Need, request Finding
Fits, preview source-safe AssetPack measurements, settle BTC/BTD rights,
deliver a repository pull request, compensate contributing deposited sources,
and inspect pack activity/repair readback. Operator receipts are source-safe
metadata only and bind staging-testnet to Supabase project
`tkpyosihuouusyaxtbau`; they never serialize secrets, protected source, raw
prompts, provider responses, unpaid AssetPack source, wallet private material,
private settlement payloads, or live rehearsal logs.

## Gate 10: V43 Promotion Readiness

Gate 10 adds `V43PromotionReadinessReport`, the generated
`.bitcode/v43-promotion-readiness-report.json` artifact, package exports,
protocol tests, `generate:v43-promotion-readiness`,
`check:v43-promotion-readiness`, `check:v43-gate10`, V43 support in
`promote-bitcode-canon.mjs`, V43 support in
`prepare-bitcode-spec-family-promotion.mjs`, V43 support in generated PROVEN
packages, V43 Gate 10 gate/canon workflow posture, and
`.github/workflows/v43-canon-promotion.yml`.

The closure acceptance is source-safe metadata only: every V43 gate artifact
must be present, parseable, source-safe, deterministic under check mode, and
bound to active V42 / draft V43 before promotion. The promotion workflow must
produce V43 active / draft V44 posture, create `BITCODE_SPEC_V43_PROVEN.md`,
and refuse promotion when any artifact, workflow, promotion script, generated
proof output, documentation evidence, source-safety boundary, or value-bearing
mainnet block is missing. Its validation commands are grouped and package
validation commands are bounded so the promotion pull request remains
inspectable and greenable under GitHub Actions.

## Commit-Body Direction

V43 gate commits should state the route/product surface changed, the protocol objects preserved, the proof/test commands run, and the source-safety boundaries maintained. Gate PR titles must begin with `V43 Gate N:`.
