# Bitcode Spec V43

## Status

- Version: `V43`
- V43 state: canonical promotion complete; V43 is the active product-route and agentic-depositing canon and the V43 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V43`
- Canonical proof-source commit: `3c7a9f998656635cc28c8b4584ae964ac04154fa`
- Prior canonical anchor: `BITCODE_SPEC_V42.md`
- Prior generated proof appendix: `BITCODE_SPEC_V42_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v43-spec-family-report.json`, `.bitcode/v43-canonical-input-report.json`, `.bitcode/v43-canon-posture-drift-report.json`, `.bitcode/v43-route-vocabulary-inventory.json`, `.bitcode/v43-packs-activity-master-detail.json`, `.bitcode/v43-read-route-five-step-ux.json`, `.bitcode/v43-deposit-route-options.json`, `.bitcode/v43-deposit-policy-compensation.json`, `.bitcode/v43-deposit-option-admission.json`, `.bitcode/v43-route-ux-product-excellence.json`, `.bitcode/v43-cross-route-rehearsal-telemetry-repair.json`, `.bitcode/v43-promotion-readiness-report.json`, V43 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V43_PROVEN.md` as the generated proof appendix for V43 promotion
- Source parity state: V43 source-side route vocabulary, Packs master-detail, Read five-step UX, deposit option synthesis, deposit policy/compensation, deposit option admission, route UX, cross-route rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V43 file family
- Notes companion: `BITCODE_SPEC_V43_NOTES.md`
- Delta companion: `BITCODE_SPEC_V43_DELTA.md`
- Parity companion: `BITCODE_SPEC_V43_PARITY_MATRIX.md`
- Scope: V43 canonical system specification for product routes and agentic depositing across `/packs`, `/read`, `/deposit`, PackActivity search/detail, Read five-step UX, deposit AssetPack option synthesis, deposit policy/compensation, option admission, route UX product excellence, cross-route rehearsal, and promotion readiness surfaces
- Last fully realized canonical target preserved in source: `V43`

## Version executive summary

V43 turns the reliable V42 MVP path into the product shape Bitcode should expose to enterprise users. The transitional `/terminal` cockpit is split into `/read` and `/deposit`, and `/exchange` becomes `/packs`.

The V43 product object is AssetPacks in and AssetPacks out:

- `/deposit` helps an enterprise turn connected source into reviewable deposit AssetPack options before Depository admission.
- `/read` lets an enterprise request a Read, review the synthesized Need, request Finding Fits, preview source-safe AssetPack measurements, settle in BTC/BTD, and receive repository delivery.
- `/packs` is the searchable master-detail activity surface for all pack activity: deposit options, admitted Depository AssetPacks, Finding Fits previews, settled Need-Fit AssetPacks, quotes, rights transfers, compensation, delivery, proofs, and repair states.

V43 is also a UX correction version. Outside public documentation, the product should not lean on self-referential explanatory copy to compensate for unclear flows. The core routes, names, layout, progressive detail, rich execution log rows, and reusable themed components must make Depositing, Reading, and pack activity legible by default and deeply inspectable on demand.

## Canonical Bitcode executive summary

Bitcode remains the knowledge commoditization protocol: deposits become source-safe Depository supply, Reading synthesizes a Need, Finding Fits searches many deposits, AssetPack synthesis creates a source-safe preview and withheld source bundle, BTC settlement transfers BTD read rights, and repository delivery unlocks only after paid settlement.

V43 changes the product routes and deposit-side synthesis experience around that law. It does not weaken V42 source-safety, BTD ownership, BTC settlement, source-to-shares compensation, ledger/database/object-storage synchronization, prompt/inference redaction, or post-settlement delivery boundaries.

## V43 source-of-truth hierarchy

`BITCODE_SPEC.txt` points to `V42` while V43 is draft.
`BITCODE_SPEC_V42.md` and `BITCODE_SPEC_V42_PROVEN.md` are active canon.
`BITCODE_SPEC_V43.md`, `BITCODE_SPEC_V43_DELTA.md`, `BITCODE_SPEC_V43_NOTES.md`, and `BITCODE_SPEC_V43_PARITY_MATRIX.md` define the draft target only on `version/v43` and `v43/gate-*` branches.
Implementation remains unversioned in source paths; route, package, component, test, prompt, and script names move in place as the single current Bitcode system.

## V43 full-system, re-implementation, and audit rule

Every V43 change must be reconstructable from specification, code, generated artifacts, tests, telemetry, and operator documentation. Route migration cannot be a cosmetic rename. Each gate must state product path, protocol object ownership, route/API/storage contracts, telemetry rows, proof roots, source-safe disclosure tier, and validation commands.

The route split must preserve V42 behavior while making it easier to use:

- `/read` owns Reading state and can still expose full proof detail.
- `/deposit` owns depositor source connection, option synthesis, review, approval, and Depository admission.
- `/packs` owns historical/current activity search and detailed inspection.

## V43 totality and precision enforcement rule

V43 must remove overlapping vocabulary. Exchange is not a current route name after V43 migration; the route and component prefix is Packs. Terminal is no longer the default product route for Reading or Depositing after V43 migration; it may remain only as an internal/debug cockpit if explicitly retained and renamed as such.

No product UI may reveal protected source, unpaid AssetPack source, raw provider responses, protected prompt payloads, wallet private material, private settlement payloads, or credentials. No route rename may create a second authority path that bypasses Need review, Finding Fits, BTC settlement, BTD rights transfer, or repository delivery reconciliation.

## V43 system goals, non-goals, and design principles

Goals:

- Rename `/exchange` to `/packs` across routes, component prefixes, docs, tests, telemetry labels, and operator vocabulary.
- Split `/terminal` into `/read` and `/deposit` as the default enterprise paths.
- Make `/packs` a dense, searchable, sortable, filterable master-detail activity surface for AssetPacks in and out.
- Add an agentic deposit-side flow that synthesizes deposit AssetPack options from connected source, depositor instructions, Depository state, and Reading demand.
- Let depositors review source-safe measurements, likely demand, sub-criticality, ROI posture, BTD potential, and compensation route before approving Depository admission.
- Improve UX so default flows are simple, self-explanatory, and visually polished while expandable detail preserves all Bitcode proof power.

Non-goals:

- V43 does not make unpaid source visible to readers.
- V43 does not mint BTD for speculative deposit options without a later paid Need-Fit.
- V43 does not weaken V42 settlement, rights, delivery, or source-to-shares law.
- V43 does not move advanced conversational overlays into the core default path unless a gate explicitly owns that work.

Design principles: AssetPacks in and out, route names as protocol truth, source-safe preview, proof-on-expand, purchase-before-source, depositor ROI clarity, and excellent enterprise usability.

## V43 system architecture and layer boundaries

V43 acts through existing layers:

- website routes and route-owned state for `/packs`, `/read`, and `/deposit`;
- package-owned protocol, BTD, pipeline, prompt, tool, storage, telemetry, and proof primitives;
- ReadNeedComprehensionSynthesis and ReadFitsFindingSynthesis for Reading;
- a new deposit-side AssetPack option synthesis pipeline for connected-source supply creation;
- Depository search, demand/read activity indexing, source criticality policy, ROI posture, compensation preview, and admission proof;
- ledger/database/object-storage synchronization, source-safe telemetry rows, and generated artifacts.

Demonstration code remains self-contained inside `protocol-demonstration/`.

## V43 canonical domain model

V43 adds or promotes these product objects: PackActivity, PacksMasterFilter, PacksActivityDetail, DepositAssetPackOption, DepositOptionSynthesisRequest, DepositorInstruction, SourceCriticalityDecision, DemandSignalSummary, PositiveRoiPosture, DepositOptionReviewDecision, DepositOptionAdmissionReceipt, ReadRouteSession, ReadNeedReviewState, PackSettlementSummary, PackCompensationSummary, and PackRepairState.

These bind to existing Bitcode objects: Depository records, Read Requests, synthesized Needs, candidate fit deposits, selected fit sets, AssetPack previews, BTD/BTC quotes, settlement observations, rights receipts, source-to-shares rows, repository delivery receipts, execution telemetry, and proof artifacts.

## V43 whole Bitcode operator chain

The V43 operator chain is: connect source, synthesize deposit AssetPack options, review source-safe option measurements and demand posture, approve or reject Depository admission, request a Read, review or resynthesize Need, request Finding Fits, search many Depository AssetPacks, synthesize source-safe Need-Fit AssetPack preview, quote BTC/BTD purchase terms, settle BTC, transfer BTD rights, unlock full AssetPack delivery, create repository pull request, compensate contributors, synchronize ledger/database/storage, and inspect all activity through `/packs`.

## V43 Gate 1 Packs, Read, Deposit Roadmap And Spec Opening

Gate 1 opens the V43 specification family, branch posture, workflow posture, checker, roadmap, docs, and route vocabulary. It does not rename routes or implement pipelines. It closes when active V42 / draft V43 truth is visible in docs and workflows, V43 has a precise gate plan, and acceptance criteria explicitly include the latest UX/product instructions.

## V43 Gate 2 Route Vocabulary Inventory And Migration Plan

Gate 2 must inventory every `/exchange`, Exchange, `/terminal`, Terminal, Reading, Depositing, and pack-activity route/component/test/doc/API/telemetry reference. It must produce a migration matrix for Packs, Read, Deposit, retained debug cockpit surfaces, redirects, compatibility boundaries, and removal of self-referential product copy.

Gate 2 closes with the package-backed route vocabulary inventory
`V43RouteVocabularyInventory` and deterministic generated artifact
`.bitcode/v43-route-vocabulary-inventory.json`. The artifact records only
source-safe file/token counts, token totals, category totals, migration rows,
and proof roots. It does not serialize source snippets, raw prompts, protected
source, unpaid AssetPack source, provider responses, wallet private material,
private settlement payloads, credentials, or secrets.

The migration matrix is binding for later gates:

- `/exchange`, Exchange, and exchange activity names migrate to `/packs`,
  Packs, and PackActivity under Gate 3, with redirect compatibility until old
  links are retired.
- `/terminal` Reading state migrates to `/read` under Gate 4, preserving the
  five-step Reading path and all Need review, Finding Fits, settlement, BTD
  rights, delivery, and telemetry boundaries.
- `/terminal` Depositing state migrates to `/deposit` under Gate 5, where
  deposit AssetPack options remain unminted, source-safe proposals until
  depositor approval and Depository admission.
- Any retained debug cockpit is internal/operator-only and cannot be the
  default product path or a parallel authority route.
- Redirect compatibility preserves transaction ids, reading stages, deposit
  anchors, and proof roots without changing protocol authority.
- Self-referential product copy outside public docs must be removed during the
  Gate 8 UX pass and replaced by route structure, labels, status, and
  progressive proof detail.

## V43 Gate 3 Packs Activity Master-Detail Data Model

Gate 3 must implement PackActivity data contracts, route APIs, table search, column sort, filtering, detail projection, source-safe metadata expansion, proof-root display, settlement/compensation/delivery/repair state readback, and no-source leak tests.

Gate 3 closes with the package-backed `V43PacksActivityMasterDetail`
artifact and deterministic generated proof
`.bitcode/v43-packs-activity-master-detail.json`. The implementation adds the
`PackActivityRecord` and `PacksActivityDetail` data contracts,
`/api/packs/activity`, the `/packs` master-detail route, and `/exchange` to
`/packs` compatibility redirection. Pack activity search covers synthesized
titles, descriptions, measurements, values, activity type, transaction type,
settlement state, compensation state, delivery state, repair state, proof
roots, repository, and timestamp. Detail projections show proof roots and
state readback while marking protected source, unpaid AssetPack source, raw
prompts, interpolated prompts, raw provider responses, source snippets,
credentials, wallet private material, and private settlement payloads
withheld.

## V43 Gate 4 Read Route Extraction And Five-Step UX

Gate 4 must move the Reading default experience into `/read`: request read, review synthesized Need, request Finding Fits, review source-safe AssetPack preview, and settle/buy/deliver. It must preserve V42 telemetry, execution log streaming, proof expansion, retry/restart, and failure repair.

Gate 4 closes with `ReadRouteSession`, `/read`, and
`V43ReadRouteFiveStepUx`. `/read` owns the route query state, five visible
Reading stages, source-safe session readback, Need review posture,
accepted-Need gating for the Finding Fits request, AssetPack preview disclosure, BTC quote
and settlement posture, and delivery unlock posture. The retained debug
cockpit remains compatible but cannot bypass `/read` invariants: no Finding
Fits without an accepted Need, no source-bearing AssetPack preview before
settlement, and no repository delivery before paid read rights are proven.

## V43 Gate 5 Deposit Route And Agentic AssetPack Option Synthesis

Gate 5 must move the Depositing default experience into `/deposit` and introduce the deposit AssetPack option synthesis pipeline. The pipeline must use connected source, depositor instructions, Depository state, and Reading demand to propose multiple source-safe AssetPack options for review.

Gate 5 closes with `DepositRouteSession`, `/deposit`, `DepositAssetPackOption`,
`DepositOptionSynthesisRequest`, `DepositAssetPackOptionSynthesis`, and
`V43DepositRouteOptions`. `/deposit` owns the route query state, five visible
Depositing stages, connected repository/source selection, depositor instruction
capture, source-safe option cards, option measurement roots, demand signal
roots, and reuse of the existing deposit composer. Gate 5 does not decide source
criticality, positive ROI, compensation policy, deposit admission, or Depository
indexing. Those boundaries are explicitly carried as deferred policy/admission
state for Gates 6 and 7. No protected source, raw source text, unpaid AssetPack
source, prompts, provider responses, credentials, or wallet private material may
be serialized into route state or generated proof artifacts.

## V43 Gate 6 Source Criticality, Demand, ROI, And Compensation Policy

Gate 6 formalizes how Bitcode estimates sub-critical source posture, likely demand, positive ROI, BTD potential, compensation route, and admission blockers. The system helps depositors sell non-critical positive-ROI IP while refusing or warning on critical IP and negative expected value.

Gate 6 closes with `DepositAssetPackOptionPolicy`,
`DepositAssetPackOptionPolicyReport`, and the generated
`.bitcode/v43-deposit-policy-compensation.json` proof. The policy consumes the
source-safe `DepositAssetPackOptionSynthesis` output plus source-safe
criticality signals, estimated development cost, expected future settlement,
and depositor wallet posture. It emits per-option policy evaluations for source
criticality, demand, ROI, BTD potential, and BTC source-to-shares compensation
route. BTD potential remains estimate-only: no BTD mint, paid rights transfer,
or source-bearing disclosure occurs until a future accepted Need-Fit settlement.
Deposit option approval, Depository admission, indexing, storage projection,
and `/packs` synchronization remain Gate 7 responsibilities.

## V43 Gate 7 Deposit Option Review, Approval, And Admission

Gate 7 must implement option accept/reject/resynthesize decisions, admission receipts, Depository indexing, storage projection, compensation preview, telemetry, and `/packs` activity synchronization for approved deposit AssetPacks.

Gate 7 closes with `DepositAssetPackOptionAdmissionReport`,
`DepositOptionAdmissionReceipt`, `DepositOptionReviewDecision`, and the
generated `.bitcode/v43-deposit-option-admission.json` proof. The admission
report consumes source-safe Gate 5 option synthesis plus Gate 6 policy scoring
and emits per-option receipts for pending review, depositor approval, depositor
rejection, depositor-requested resynthesis, and policy-blocked outcomes. Only
approved, policy-eligible, source-safe options are admitted to the Depository.
Admitted options receive source-safe semantic, lexical, and metadata index
projection roots, object-storage metadata roots, external raw-source pointer
roots, preserved BTC source-to-shares compensation preview, execution-stream
telemetry roots, and `/packs` synchronization as `depository-assetpack`
activity. Gate 7 does not mint BTD, transfer rights, broadcast settlement, or
show unpaid AssetPack source; those remain gated by future accepted Need-Fit
settlement.

## V43 Gate 8 UX/UI Product Excellence Pass

Gate 8 must improve route layout, visual hierarchy, copy, progressive disclosure, execution stream usage, empty/error/loading states, keyboard/responsive behavior, and reusable themed components across `/packs`, `/read`, and `/deposit`. It must remove in-app self-referential explanatory copy outside public docs.

Gate 8 closes with `ProductRouteShell`, `ProductRouteStepGrid`,
`ProductRouteStatePanel`, `ProductRouteDisclosure`, and the generated
`.bitcode/v43-route-ux-product-excellence.json` proof. `/packs`, `/read`, and
`/deposit` must share a consistent themed route frame, concise route summaries,
source-safe metrics, keyboard-accessible step buttons, loading/empty/error
states, and expandable proof/source-safety detail. Product copy must be route
and status vocabulary, not explanations of the interface itself. Gate 8 must
not change route state-machine authority, disclose protected source, disclose
unpaid AssetPack source, serialize prompts/provider responses, or weaken the
settlement-gated source boundary.

## V43 Gate 9 Cross-Route Rehearsal, Telemetry, And Repair

Gate 9 must rehearse the full path across `/deposit`, `/read`, and `/packs`: synthesize deposit options, admit a deposit AssetPack, request Reading, find fits, preview, settle, deliver, compensate, and inspect activity. It must cover local/staging-testnet lanes, telemetry, database/ledger/storage synchronization, and repair states.

Gate 9 closes with `V43CrossRouteRehearsalTelemetryRepair`, the dry-run
operator receipt script `rehearse:v43-cross-route`, and generated
`.bitcode/v43-cross-route-rehearsal-telemetry-repair.json`. The artifact binds
local and staging-testnet lanes, `/deposit`, `/read`, and `/packs`, and the
cross-route stages: deposit option synthesis, deposit option review/admission,
Read request, Need review, Finding Fits request, source-safe AssetPack preview,
BTC settlement/right transfer, repository pull-request delivery, and PackActivity
repair inspection. Gate 9 also proves rich execution telemetry readback,
staging-testnet database stream posture, ledger/database/object-storage
reconciliation, source-to-shares compensation readback, and fail-closed repair
states without serializing secrets, protected source, prompt payloads, provider
responses, wallet private material, live rehearsal logs, or unpaid AssetPack
source. Value-bearing mainnet remains blocked.

## V43 Gate 10 Promotion Readiness

Gate 10 must bind every V43 artifact, workflow, generated proof, docs update, route migration, source-safety proof, test suite, and active V43 / draft V44 runtime posture before canonical promotion.

Gate 10 closes with `V43PromotionReadinessReport`, the deterministic
`.bitcode/v43-promotion-readiness-report.json` artifact, `check:v43-gate10`,
`generate:v43-promotion-readiness`, `v43-canon-promotion.yml`, V43 promotion
support in `promote-bitcode-canon.mjs`, V43 hand-authored spec-family promotion
rewriting, V43 generated PROVEN support, and post-promotion workflow posture for
V43 active / draft V44. The artifact covers every V43 gate artifact from route
vocabulary through cross-route rehearsal, the promotion workflow, gate/canon
quality workflows, package exports/tests, documentation evidence, and generated
proof outputs. Promotion remains blocked if any required artifact is missing,
unparseable, source-unsafe, stale, missing workflow coverage, missing promotion
script coverage, or admits value-bearing mainnet before a later canon. Gate 10
does not promote `BITCODE_SPEC.txt` itself; it makes the `version/v43` to `main`
promotion pull request mechanically ready to produce `BITCODE_SPEC_V43_PROVEN.md`
and advance runtime posture to V43 active / draft V44.

## V43 canonical subsystem surfaces

### Depositing and asset supply

- Current canonical objects and emitted artifacts: DepositRouteSession, DepositAssetPackOption, DepositOptionSynthesisRequest, DepositAssetPackOptionSynthesis, DepositAssetPackOptionPolicy, DepositAssetPackOptionPolicyReport, DepositAssetPackOptionAdmissionReport, DepositOptionAdmissionReceipt, DepositOptionReviewDecision, Depository record projection, source admission proof, compensation preview, `.bitcode/v43-deposit-route-options.json`, `.bitcode/v43-deposit-policy-compensation.json`, and `.bitcode/v43-deposit-option-admission.json`.
- Current algorithms and derivation rules: connected-source selection, depositor instruction rooting, source path rooting, Depository demand signal roots, Reading demand signal roots, existing supply signal roots, option grouping, measurement projection, source-safe review posture, source criticality scoring, weighted demand scoring, deterministic gross-minus-cost ROI scoring, estimate-only BTD potential, future-reader BTC source-to-shares compensation route preview, depositor approve/reject/resynthesis decisions, approved-policy-eligible admission, Depository index projection, storage metadata projection, and `/packs` activity synchronization.
- Current invariants and fail-closed conditions: invalid repository binding, missing source hints, critical-source block, negative expected value warning/block, missing wallet compensation repair posture, missing depositor review, rejected option, resynthesis request, policy-blocked option, and protected-source leak.
- Current proof obligations: source-safe option synthesis, option policy report, option review boundary, admission receipts, compensation route preview, Depository index/storage projections, BTD mint boundary, telemetry, and activity synchronization.
- Current source-bearing implementation basis: `/deposit` route, `DepositRouteSession`, asset-pack pipeline package option synthesis, asset-pack package policy report, asset-pack package admission report, existing deposit composer, `/packs` activity projection, source-safe route tests, package tests, and generated protocol artifacts.
- Current validating commands and parity basis: `pnpm run check:v43-gate5`, `pnpm run check:v43-gate6`, `pnpm run check:v43-gate7`, package tests, API tests, and generated artifacts.
- Current accepted boundaries: options are not BTD mints and do not expose source to readers before settlement; admitted deposit AssetPacks publish only source-safe metadata and external source pointer roots until a future paid Need-Fit settlement.

### Reading and prompt/inference ownership

- Current canonical objects and emitted artifacts: ReadRouteSession, Read Request, synthesized Need, Need review decision, Finding Fits request, AssetPack preview, quote, settlement, delivery.
- Current algorithms and derivation rules: ReadNeedComprehensionSynthesis and ReadFitsFindingSynthesis remain the Reading pipelines, with Need review gating Finding Fits.
- Current invariants and fail-closed conditions: no Finding Fits without accepted Need, no preview source leakage, no settlement without quote, no delivery without paid rights.
- Current proof obligations: source-safe telemetry, prompt/program receipts, parser outputs, stage persistence, and repair states.
- Current source-bearing implementation basis: `/read`, Reading APIs, pipeline host, prompt registries, execution stream, ledger/database/storage adapters.
- Current validating commands and parity basis: `pnpm run check:v43-gate4`, uapi tests, pipeline tests, browser proof.
- Current accepted boundaries: `/read` is the default user path; retained debug cockpit cannot bypass it.

### Fit, recall, ranking, and verification

- Current canonical objects and emitted artifacts: query plan, candidate fit deposits, ranking receipts, selected fit set, proof roots, search receipts.
- Current algorithms and derivation rules: depository-wide many-fit search uses embeddings, metadata, measurements, provider search, and verifier ranking.
- Current invariants and fail-closed conditions: no-survivor asset pack, stale embedding, insufficient fit confidence, and protected prompt/source disclosure.
- Current proof obligations: candidate recall, ranking explainability, selected-fit provenance, and source-safe preview inputs.
- Current source-bearing implementation basis: ReadFitsFindingSynthesis, Depository search tools, embedding utilities, provider adapters, and ranking tests.
- Current validating commands and parity basis: `pnpm run check:v43-gate4`, `pnpm run check:v43-gate9`, pipeline integration.
- Current accepted boundaries: fit deposits remain source-safe until settlement unlock.

### Selection and materialization

- Current canonical objects and emitted artifacts: AssetPack preview, withheld source bundle, delivery receipt, repository pull request, PackActivity.
- Current algorithms and derivation rules: synthesis uses selected fit context and accepted Need, preview hides source, finishing writes repository changes after settlement.
- Current invariants and fail-closed conditions: unpaid source hidden, delivery lock mismatch, PR creation failure, and storage reconciliation drift.
- Current proof obligations: preview/delivery boundary, repository delivery receipt, storage lock, and PackActivity update.
- Current source-bearing implementation basis: asset-pack pipeline, pipeline hosts, repository provider integration, object storage.
- Current validating commands and parity basis: package tests, route tests, rehearsal artifacts.
- Current accepted boundaries: full source-bearing AssetPack appears only after paid rights transfer.

### Identity, authorization, and sensitive flow

- Current canonical objects and emitted artifacts: account, organization, wallet, repository authority, policy decision, settlement signer, role decision.
- Current algorithms and derivation rules: account/org/wallet/repository authorization governs deposit, read, settlement, delivery, and activity access.
- Current invariants and fail-closed conditions: authorization denial, missing wallet authority, invalid repository authority, and private key leakage.
- Current proof obligations: policy proof, wallet boundary, repository permission proof, and redaction proof.
- Current source-bearing implementation basis: auth adapters, policy packages, wallet/BTD packages, API middleware.
- Current validating commands and parity basis: unit/API tests, V40 integration tests, V43 route tests.
- Current accepted boundaries: no route owns private key material or cross-org source visibility.

### Disclosure and projection

- Current canonical objects and emitted artifacts: source-safe projection, preview metadata, expanded proof metadata, redaction receipt, PackActivity detail.
- Current algorithms and derivation rules: disclosure tiers separate public, user-visible, buyer-visible, reviewer-visible, and operator-only data.
- Current invariants and fail-closed conditions: public projection overexposure, raw prompt leak, provider response leak, unpaid source leak, and credentials leak.
- Current proof obligations: redaction tests, source-safe artifacts, UI collapsed/expanded disclosure contract.
- Current source-bearing implementation basis: route serializers, UI components, telemetry redactors, proof generators.
- Current validating commands and parity basis: leak scans, uapi tests, browser screenshots, generated reports.
- Current accepted boundaries: public docs may explain; product UI must disclose only operationally necessary source-safe data.

### Settlement and exact accounting

- Current canonical objects and emitted artifacts: quote, BTC payment observation, finality, BTD rights transfer, source-to-shares allocation, compensation receipt.
- Current algorithms and derivation rules: deterministic quote uses measurement weight, measurement volume, and protocol fee allocation; source-to-shares uses exact accounting.
- Current invariants and fail-closed conditions: settlement conservation drift, underpayment, overpayment, double delivery, and stale finality.
- Current proof obligations: BTC fee conservation, BTD rights receipt, compensation route, ledger/database/storage reconciliation.
- Current source-bearing implementation basis: BTD package, ledger writers, settlement observers, repair jobs.
- Current validating commands and parity basis: BTD tests, route tests, rehearsal artifacts.
- Current accepted boundaries: speculative deposit options may estimate BTD potential but do not receive final BTD rights until Need-Fit settlement law applies.

### Proof contract, witnesses, and replay

- Current canonical objects and emitted artifacts: proof family, theorem, witness, replay step, generated artifact, workflow result.
- Current algorithms and derivation rules: every gate creates deterministic proof roots and replayable source-safe evidence.
- Current invariants and fail-closed conditions: stale promoted status truth, artifact drift, missing witness, and unverifiable workflow.
- Current proof obligations: proof families, members, theorems, witnesses, and replay.
- Current source-bearing implementation basis: scripts, protocol package generators, workflow checks, test suites.
- Current validating commands and parity basis: `pnpm run check:v43-gate1`, later gate checks, promotion readiness.
- Current accepted boundaries: proof artifacts never serialize secrets or protected source.

## V43 proof-family canon

### Inference-synthesis

- proofArtifactPath: `.bitcode/v43-inference-synthesis.json`
- members: deposit-option-synthesis, read-need, read-fits, pack-preview
- theoremIds: source-safe-option-synthesis, accepted-need-gated-fits, no-unpaid-source
- replayStepIds: synthesize-deposit-options, synthesize-need, search-depository, preview-pack
- witnessArtifactPaths: V43 gate artifacts
- current member closure criteria: typed outputs, source-safe projections, and route readback
- current member verdict shape: pass/fail with proof roots
- current theorem-by-theorem closure reading: every synthesis step preserves disclosure boundary
- current theorem-to-replay grouping: each theorem maps to a replay step
- minimum artifact/replay binding set: route state, execution id, parser id, proof root
- current proof-object fields: artifact id, version, route, phase, verdict, evidence root
- generated-artifact and test bindings: V43 check scripts and package tests
- fail-closed conditions: invalid deposit, prompt contract incompleteness, parsed-envelope inadmissibility, no-survivor asset pack

### Prompt-completeness

- proofArtifactPath: `.bitcode/v43-prompt-completeness.json`
- members: depositor instructions, source criticality, demand posture, Reading pipelines
- theoremIds: no-missing-route-prompt, no-raw-prompt-ui-leak
- replayStepIds: prepare-context, run-failsafe, run-thricified, parse-output
- witnessArtifactPaths: V41 prompt artifacts and V43 route prompt artifacts
- current member closure criteria: registry binding and interpolation coverage
- current member verdict shape: prompt id, prompt part ids, parser, redaction verdict
- current theorem-by-theorem closure reading: every inference point resolves through registry primitives
- current theorem-to-replay grouping: prompt route to inference chain
- minimum artifact/replay binding set: prompt ids and parser ids
- current proof-object fields: prompt family, route, disclosure tier
- generated-artifact and test bindings: prompt benchmark checks
- fail-closed conditions: prompt contract incompleteness and protected prompt overexposure

### Static-code-analysis

- proofArtifactPath: `.bitcode/v43-static-code-analysis.json`
- members: route rename, component prefix, import casing, dead Exchange references
- theoremIds: packs-name-totality, read-deposit-route-totality
- replayStepIds: scan-routes, scan-components, scan-docs, scan-tests
- witnessArtifactPaths: route vocabulary inventory
- current member closure criteria: no forbidden product route references
- current member verdict shape: file, token, status
- current theorem-by-theorem closure reading: old names are migrated or explicitly retained as historical docs
- current theorem-to-replay grouping: scan family by source kind
- minimum artifact/replay binding set: file path and token
- current proof-object fields: path, matched token, migration status
- generated-artifact and test bindings: Gate 2 checker
- fail-closed conditions: stale promoted status truth and route alias ambiguity

### Verification-decisions

- proofArtifactPath: `.bitcode/v43-verification-decisions.json`
- members: deposit option review, Need review, fit selection, settlement review
- theoremIds: human-approval-boundary, no-source-leak-before-pay
- replayStepIds: review-option, accept-need, select-fits, settle-pack
- witnessArtifactPaths: review receipts
- current member closure criteria: every decision stores reason, actor, timestamp, and proof root
- current member verdict shape: accepted, rejected, resynthesize, blocked
- current theorem-by-theorem closure reading: user approval gates value-bearing transitions
- current theorem-to-replay grouping: decision event to state transition
- minimum artifact/replay binding set: actor, decision, state before/after
- current proof-object fields: decision id, actor, route, root
- generated-artifact and test bindings: route/API tests
- fail-closed conditions: authorization denial and invalid deposit

### Selection-and-materialization

- proofArtifactPath: `.bitcode/v43-selection-materialization.json`
- members: deposit option groups, selected fit set, AssetPack preview, delivery PR
- theoremIds: source-pack-boundary, paid-delivery-only
- replayStepIds: group-source, rank-fits, generate-preview, deliver-pr
- witnessArtifactPaths: pack activity artifacts
- current member closure criteria: materialized outputs are source-safe before settlement and source-bearing after rights
- current member verdict shape: preview, locked, delivered, repaired
- current theorem-by-theorem closure reading: delivery follows settlement and rights receipt
- current theorem-to-replay grouping: pack id to lifecycle events
- minimum artifact/replay binding set: pack id, storage root, ledger root
- current proof-object fields: pack id, state, proof root
- generated-artifact and test bindings: pack route tests
- fail-closed conditions: no-survivor asset pack and delivery lock mismatch

### Authorization-and-sensitive-flow

- proofArtifactPath: `.bitcode/v43-authorization-sensitive-flow.json`
- members: account, organization, repository, wallet, source visibility
- theoremIds: principal-boundary, no-private-key-route
- replayStepIds: authorize-deposit, authorize-read, authorize-settlement, authorize-detail
- witnessArtifactPaths: policy receipts
- current member closure criteria: every sensitive action has policy and redaction proof
- current member verdict shape: allowed, denied, retry-required
- current theorem-by-theorem closure reading: route access is policy-bound
- current theorem-to-replay grouping: action to policy event
- minimum artifact/replay binding set: subject, resource, action
- current proof-object fields: subject, resource, action, decision
- generated-artifact and test bindings: auth tests
- fail-closed conditions: authorization denial and wallet private material visible

### Settlement-source-to-shares

- proofArtifactPath: `.bitcode/v43-settlement-source-to-shares.json`
- members: quote, finality, rights transfer, depositor compensation
- theoremIds: btc-conservation, source-share-allocation
- replayStepIds: quote, observe-payment, transfer-rights, allocate-compensation
- witnessArtifactPaths: settlement receipts
- current member closure criteria: paid readback agrees across ledger/database/storage
- current member verdict shape: pending, paid, final, repaired
- current theorem-by-theorem closure reading: exact accounting preserves source-to-shares
- current theorem-to-replay grouping: settlement id to accounting rows
- minimum artifact/replay binding set: quote root, tx root, allocation root
- current proof-object fields: settlement id, btc amount, roots
- generated-artifact and test bindings: BTD tests
- fail-closed conditions: settlement conservation drift

### Disclosure-boundary

- proofArtifactPath: `.bitcode/v43-disclosure-boundary.json`
- members: product copy, preview metadata, expanded proof, pack detail
- theoremIds: self-explanatory-without-overdisclosure, unpaid-source-hidden
- replayStepIds: render-collapsed, expand-detail, leak-scan, export-proof
- witnessArtifactPaths: browser and route artifacts
- current member closure criteria: no protected values in source-safe tiers
- current member verdict shape: source-safe, blocked
- current theorem-by-theorem closure reading: clarity cannot be purchased by leaking source
- current theorem-to-replay grouping: route state to visible fields
- minimum artifact/replay binding set: route, tier, field inventory
- current proof-object fields: route, field, disclosure tier
- generated-artifact and test bindings: visual/leak tests
- fail-closed conditions: public projection overexposure

### Proof-contract

- proofArtifactPath: `.bitcode/v43-proof-contract.json`
- members: generated artifacts, workflows, promotion readiness
- theoremIds: deterministic-artifact, promotion-readiness
- replayStepIds: generate, check, promote
- witnessArtifactPaths: `.bitcode/v43-spec-family-report.json`, `.bitcode/v43-canonical-input-report.json`
- current member closure criteria: deterministic source-safe artifact generation
- current member verdict shape: passed, failed
- current theorem-by-theorem closure reading: promotion is blocked until every gate is closed
- current theorem-to-replay grouping: gate artifact to workflow proof
- minimum artifact/replay binding set: artifact path and command
- current proof-object fields: path, digest, verdict
- generated-artifact and test bindings: V43 check scripts
- fail-closed conditions: stale promoted status truth

## V43 generated canon

### Inherited V19 reproducible-canon artifacts

Inherited reproducibility remains binding.

### Inherited V20 operator-quality artifacts

Inherited operator-quality truth remains binding.

### Exact generated-artifact inventory matrix

| artifact | owner | status |
| --- | --- | --- |
| `.bitcode/v43-spec-family-report.json` | spec family | draft-required |
| `.bitcode/v43-canonical-input-report.json` | canonical inputs | draft-required |

### V43 specifying generated artifacts

V43 starts with `.bitcode/v43-spec-family-report.json` and `.bitcode/v43-canonical-input-report.json`; later gates add route, pack, deposit, read, UX, rehearsal, and promotion artifacts.

### Shared generated-artifact fields

All artifacts include version, schema id, generatedAt, sourceSafetyVerdict, evidence roots, validationCommands, and aggregate proof verdict.

### Artifact-specific generated payload fields

V43 artifacts add route ids, pack activity ids, deposit option ids, review decisions, measurement roots, quote roots, settlement roots, delivery roots, and repair roots.

### Artifact confidentiality and disclosability taxonomy

Artifacts classify fields as public, user-visible, buyer-visible, reviewer-visible, operator-only, and withheld. They fail closed when protected source, raw prompt, raw provider response, credentials, wallet private material, or unpaid AssetPack source appears in source-safe tiers.

### Minimum generated appendix rendered contents

The V43 generated appendix must render aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when required evidence is stale or unsafe.

### Canonical regeneration and fail-closed posture

Generation and check commands must be deterministic. Any stale artifact, missing witness, stale promoted status truth, or leak-shaped value fails closed.

## V43 validation canon

Gate 1 validates with `pnpm run check:v43-gate1`, `node scripts/check-bitcode-spec-family.mjs --version V43 --mode draft --current-target V42`, `node scripts/check-bitcode-canonical-inputs.mjs --current-target V42`, `node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V42 --draft-target V43`, and `git diff --check`.

## V43 promotion canon

V43 promotion readiness canon is represented by
`.bitcode/v43-promotion-readiness-report.json`. It binds Gate 1 through Gate 10
artifact coverage, source-safety coverage, workflow coverage, promotion-script
coverage, generated proof support, documentation evidence, and post-promotion
runtime posture. Its accepted post-promotion posture is V43 active / draft V44,
and its report is source-safe metadata only.

V43 promotion must occur only after every gate is implemented, specified, tested, documented, source-safe, rehearsed, and green through maintained workflows. Promotion must create `BITCODE_SPEC_V43_PROVEN.md` and advance `BITCODE_SPEC.txt` to `V43`.

## V43 appendices and canonical supporting material

The appendices below make V43 auditable before implementation.

## Appendix A. Canonical type and surface catalog

Canonical types include PackActivity, PacksActivityDetail, DepositAssetPackOption, DepositOptionSynthesisRequest, SourceCriticalityDecision, DemandSignalSummary, PositiveRoiPosture, DepositOptionReviewDecision, ReadRouteSession, PackSettlementSummary, PackCompensationSummary, and PackRepairState.

## Appendix B. Proof family closure catalog

The proof family closure catalog binds the families above to route, pipeline, storage, ledger, telemetry, and generated proof obligations.

## Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v43-inference-synthesis.json` | deposit-option-synthesis/read-need/read-fits | source-safe-option-synthesis | synthesize-deposit-options/search-depository | V43 gate artifacts | pipeline packages |
| Prompt-completeness | `.bitcode/v43-prompt-completeness.json` | prompts | no-missing-route-prompt | prepare-context | V41 prompt artifacts | prompt registries |
| Static-code-analysis | `.bitcode/v43-static-code-analysis.json` | route tokens | packs-name-totality | scan-routes | route inventory | source tree |
| Verification-decisions | `.bitcode/v43-verification-decisions.json` | reviews | human-approval-boundary | review-option | decision receipts | route APIs |
| Selection-and-materialization | `.bitcode/v43-selection-materialization.json` | pack lifecycle | paid-delivery-only | deliver-pr | pack activity | asset-pack pipeline |
| Authorization-and-sensitive-flow | `.bitcode/v43-authorization-sensitive-flow.json` | principals | principal-boundary | authorize-read | policy receipts | auth packages |
| Settlement-source-to-shares | `.bitcode/v43-settlement-source-to-shares.json` | settlement | btc-conservation | allocate-compensation | settlement receipts | BTD package |
| Disclosure-boundary | `.bitcode/v43-disclosure-boundary.json` | disclosure | unpaid-source-hidden | leak-scan | browser artifacts | route serializers |
| Proof-contract | `.bitcode/v43-proof-contract.json` | artifacts | deterministic-artifact | promote | spec reports | scripts |

## Appendix C. Generated artifact contract catalog

### Inherited V19 reproducible-canon artifacts

Inherited.

### Inherited V20 operator-quality artifacts

Inherited.

### Exact generated-artifact inventory matrix

| artifact | field | verdict |
| --- | --- | --- |
| `.bitcode/v43-spec-family-report.json` | aggregate proof verdict | draft-required |
| `.bitcode/v43-canonical-input-report.json` | generated artifact inventories | draft-required |
| `.bitcode/v43-canon-posture-drift-report.json` | active/draft posture | draft-required |
| `.bitcode/v43-route-vocabulary-inventory.json` | route vocabulary inventory | closed |
| `.bitcode/v43-packs-activity-master-detail.json` | pack activity master-detail | closed |
| `.bitcode/v43-read-route-five-step-ux.json` | Reading route UX | closed |
| `.bitcode/v43-deposit-route-options.json` | deposit option synthesis route | closed |
| `.bitcode/v43-deposit-policy-compensation.json` | deposit policy and compensation | closed |
| `.bitcode/v43-deposit-option-admission.json` | deposit option admission | closed |
| `.bitcode/v43-route-ux-product-excellence.json` | shared product route UX | closed |
| `.bitcode/v43-cross-route-rehearsal-telemetry-repair.json` | cross-route rehearsal and repair | closed |
| `.bitcode/v43-promotion-readiness-report.json` | promotion readiness | closed |

### V43 specifying generated artifacts

`.bitcode/v43-spec-family-report.json` and `.bitcode/v43-canonical-input-report.json` are the opening artifacts.

### Shared generated-artifact fields

Version, digest, sourceSafetyVerdict, validationCommands, proof-source commit, and fail closed when stale.

### Artifact-specific generated payload fields

Route, pack, deposit option, read, settlement, compensation, delivery, repair, and proof roots.

### Artifact confidentiality and disclosability taxonomy

Source-safe metadata only until settlement unlock.

### Minimum generated appendix rendered contents

aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, fail closed when stale.

### Canonical regeneration and fail-closed posture

Regeneration commands must be deterministic.

## Appendix D. Validation and checking gate catalog

Gate checks are `check:v43-gate1` through later V43 gate checks.

## Appendix E. Current canonical source map

V43 source work starts from V42 active canon, package protocol state, website route implementations, pipeline packages, BTD packages, and generated proof scripts.

## Appendix F. Subsystem totality and derivability matrix

V43 must cover repo supply and depositing; reading and measured demand; prompt/inference/evaluator ownership; deposit-to-read fit; recall and ranking; verification decisions; selection and materialization; branch artifacts and assetPackEvidence; identity, authority, signing, and policy; sensitive data and confidentiality flows; projection, disclosure, and redaction; proof families, members, theorems, witnesses, and replay; settlement, source-to-shares, journals, and exact accounting; telemetry, persistence, state, and failure semantics; host/runtime capability truth; operator experience and pedagogy; validation and test stack; generated artifacts and canonical promotion.

## Appendix G. Canonical file-family and promotion contract catalog

V43 files are `BITCODE_SPEC_V43.md`, `BITCODE_SPEC_V43_DELTA.md`, `BITCODE_SPEC_V43_NOTES.md`, `BITCODE_SPEC_V43_PARITY_MATRIX.md`, and later `BITCODE_SPEC_V43_PROVEN.md`.

## Appendix H. Operator surface and quality contract catalog

Operator surfaces are `/packs`, `/read`, `/deposit`, retained internal/debug cockpit if any, rich execution stream rows, settlement panels, compensation panels, proof expansion, and repair views.

## Appendix I. Scenario, workflow, and cross-product contract catalog

Scenarios include auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, and Valuable.

## Appendix J. Fail-closed contract and error posture matrix

V43 fails closed on invalid deposit, prompt contract incompleteness, parsed-envelope inadmissibility, no-survivor asset pack, authorization denial, public projection overexposure, settlement conservation drift, and stale promoted status truth.

## Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing artifacts include `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`, `.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and `BITCODE_SPEC_V43_PROVEN.md`.

## V43 accepted boundaries and reopen conditions

V43 may reopen route names, product state, pack activity, deposit option synthesis, UX layout, and proof surfaces. It may not reopen BTD supply law, BTC settlement conservation, source-to-shares accounting, source-safe disclosure, or demonstration/commercial boundary rules without an explicit later canon.

## V43 completion condition

V43 completes when `/packs`, `/read`, and `/deposit` are the default product paths; agentic deposit AssetPack option synthesis is specified and implemented; pack activity is searchable and inspectable; Reading remains settlement-gated and source-safe; UX is self-explanatory and polished; local/staging rehearsal proves the full cross-route path; and promotion readiness advances Bitcode to active V43 / draft V44.
