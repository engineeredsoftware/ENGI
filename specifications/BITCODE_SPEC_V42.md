# Bitcode Spec V42

## Status

- Version: `V42`
- V42 state: canonical promotion complete; V42 is the active reliable MVP experience canon and the V42 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V42`
- Canonical proof-source commit: `5c9c0270b9d864fe13b7e0a429700e1c9a7689d9`
- Prior canonical anchor: `BITCODE_SPEC_V41.md`
- Prior generated proof appendix: `BITCODE_SPEC_V41_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v42-spec-family-report.json`, `.bitcode/v42-canonical-input-report.json`, `.bitcode/v42-canon-posture-drift-report.json`, `.bitcode/v42-depositing-shortest-path.json`, `.bitcode/v42-reading-shortest-path-state-machine.json`, `.bitcode/v42-readneed-review-resynthesis-product-closure.json`, `.bitcode/v42-readfitsfinding-preview-quote.json`, `.bitcode/v42-settlement-rights-delivery.json`, `.bitcode/v42-ai-reading-demonstration.json`, `.bitcode/v42-local-staging-mvp-rehearsal.json`, `.bitcode/v42-promotion-readiness-report.json`, V42 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V42_PROVEN.md` as the generated proof appendix for V42 promotion
- Source parity state: V42 source-side Depositing shortest path, Reading shortest path state machine, ReadNeed review/resynthesis closure, ReadFitsFinding preview and quote closure, settlement rights delivery, AI-reading demonstration, local/staging-testnet rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V42 file family
- Notes companion: `BITCODE_SPEC_V42_NOTES.md`
- Delta companion: `BITCODE_SPEC_V42_DELTA.md`
- Parity companion: `BITCODE_SPEC_V42_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V42_PROVEN.md` only after V42 promotion
- Scope: V42 canonical system specification for reliable MVP experience across shortest-path Depositing, shortest-path Reading, reviewed Need synthesis, Finding Fits preview and quote, settlement-gated rights delivery, depositor compensation visibility, AI-reading demonstration, local/staging-testnet rehearsal, and promotion readiness surfaces
- Last fully realized canonical target preserved in source: `V42`

## Version executive summary

V42 exists because V39 made commercial Reading real, V40 made the application testable, and V41 made prompts and PromptParts reliable enough to drive a product experience.
The version now turns that depth into the shortest believable enterprise MVP paths:

- deposit any admissible source material into the Depository with clear proof that it can later earn BTC compensation when used in a synthesized AssetPack;
- request a Read, review or resynthesize Bitcode's synthesized Need, request Finding Fits, inspect source-safe AssetPack measurements and preview metadata, settle the quoted BTD/BTC purchase, and receive the full source-bearing AssetPack as repository delivery after settlement;
- demonstrate Bitcode as an AI-reading dominant system where proprietary or otherwise non-public deposited material measurably improves an AI system beyond a public-data-only baseline.

## Canonical Bitcode executive summary

Bitcode remains the protocol and commercial system for depositing technical knowledge, reading needs against the Depository, finding many fitting deposits, synthesizing source-safe AssetPack previews, settling BTC fees, transferring BTD rights, and delivering full source-bearing AssetPacks only after settlement.
V42 changes the product experience and demonstration proof around that law.
It must not weaken BTC settlement, BTD ownership, source-to-shares compensation, disclosure boundaries, prompt-program source-safety, or ledger/database/storage synchronization.

## V42 source-of-truth hierarchy

`BITCODE_SPEC.txt` points to `V41` while V42 is draft.
`BITCODE_SPEC_V41.md` and `BITCODE_SPEC_V41_PROVEN.md` are active canon.
`BITCODE_SPEC_V42.md`, `BITCODE_SPEC_V42_DELTA.md`, `BITCODE_SPEC_V42_NOTES.md`, and `BITCODE_SPEC_V42_PARITY_MATRIX.md` define the draft target only on `version/v42` and `v42/gate-*` branches.
Implementation remains unversioned in source paths; routes, packages, tests, prompts, components, and scripts move in place as the single current Bitcode system.

## V42 full-system, re-implementation, and audit rule

Reliable MVP experience work must be reconstructable from code, specification, generated artifacts, tests, telemetry, and operator documentation.
Each accepted gate must state the user path, protocol objects, route/API ownership, pipeline ownership, source-safe disclosure tier, storage projection, ledger boundary, telemetry rows, proof artifacts, and validating commands needed to rebuild the experience without conversation history.
No gate may close with only UI copy, speculative product language, or unverified route behavior.

## V42 totality and precision enforcement rule

V42 must make the product shortest paths complete without hiding complexity.
Default interfaces should be low-detail and guided, while expandable detail must preserve the rich proof, telemetry, ledger, pipeline, and storage readback required by Bitcode.
No Read can advance to Finding Fits without a reviewed synthesized Need.
No source-bearing AssetPack content can cross into reader visibility before BTC settlement, BTD rights transfer, and storage/delivery reconciliation.
No generated report may serialize secrets, wallet private material, private settlement payloads, protected source, raw provider responses, protected prompt payloads, or unpaid AssetPack source.

## V42 system goals, non-goals, and design principles

Goals:

- Make Depositing the shortest path from source material to Depository admission proof and later compensation visibility.
- Make Reading the shortest path from Read Request to reviewed Need, Finding Fits, source-safe AssetPack preview, BTD/BTC settlement, rights transfer, and repository delivery.
- Keep advanced proof and telemetry available through expandable detail instead of forcing enterprise users through raw protocol machinery.
- Preserve `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` as the product-owned Reading pipeline names and runtime boundaries.
- Produce a demonstration where an AssetPack improves an AI system beyond a public-data-only baseline using deposited technical intelligence.
- Keep local and staging-testnet rehearsal realistic while value-bearing mainnet operations remain explicitly gated.

Non-goals:

- V42 does not introduce agentic enterprise deposit AssetPack option synthesis; that is V43+.
- V42 does not split `/terminal` into `/read` and `/deposit`, and does not rename `/exchange` to `/packs`; those route changes are V43+ unless explicitly reopened.
- V42 does not change BTD supply law, BTC fee conservation, source-to-shares accounting, or post-settlement delivery rights.
- V42 does not expose protected source, protected prompts, raw provider responses, or unpaid AssetPack source for demonstration convenience.

Design principles: shortest credible path, source-safe preview, proof-on-expand, purchase-before-source, depositor compensation visibility, AI-reading demonstration value, and production-hardening through tests.

## V43+ route vocabulary and pack activity cleanup

V42 proves the current MVP path before route vocabulary is renamed.
The next product cleanup must remove the transitional Terminal/Exchange posture from the core experience.
`/terminal` should split into `/deposit` and `/read`, and `/exchange` should become `/packs` across route names, component prefixes, tests, docs, and operator vocabulary.
`/packs` is the searchable master-detail activity surface for all pack activity: deposited AssetPack options, admitted Depository AssetPacks, Finding Fits previews, settled Need-Fit AssetPacks, quotes, rights transfers, compensation posture, repository delivery, proofs, and repair states.
Its master view must support column sorting, filtering, and search over measurements, synthesized AssetPack titles and descriptions, values, activity or transaction type, settlement state, compensation state, and proof roots.
Its detail view exposes the selected activity's source-safe proof, telemetry, ledger/database/storage synchronization, and expandable metadata.
`/deposit` should let enterprises connect source, instruct or accept Bitcode's proposed deposit AssetPack options, review source-safe measurements and likely demand/ROI posture, and approve or reject Depository admission.
`/read` should own the shortest Reading path from Read Request through reviewed Need, Finding Fits, preview, settlement, and delivery.
AssetPacks become the in/out simplification: Depositing creates AssetPacks for the Depository, and Reading buys synthesized Need-Fit AssetPacks.
Outside public documentation, product UX must not rely on self-referential explanatory copy; route structure, progressive detail, labels, and reusable rich components must make core behavior self-explanatory while preserving power-user inspection depth.

## V42 system architecture and layer boundaries

V42 acts through existing layers:

- website application routes and product state for Depositing, Reading, settlement, and delivery;
- packages for protocol, BTD, pipeline hosts, pipeline asset packs, prompts, tools, telemetry, and storage;
- `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis` pipelines with PTRR agents, FailsafeGenerationSequence, ThricifiedGeneration, tool registries, and typed parser outputs;
- Depository indexing, search documents, embeddings, candidate fit ranking, selected-fit provenance, AssetPack synthesis, quote calculation, settlement observation, BTD rights transfer, and repository delivery;
- demonstration code inside `protocol-demonstration/` only, with no commercial imports from demonstration and no demonstration imports from commercial product code.

## V42 canonical domain model

V42 product-experience domain objects are Depositing session, source admission proof, Depository record, compensation route preview, Read Request, synthesized Need, Need review decision, Need resynthesis request, accepted Need admission, Finding Fits request, candidate fit deposit, selected fit set, AssetPack measurement preview, withheld source bundle, BTD/BTC quote, settlement instruction, settlement observation, BTD rights transfer receipt, repository delivery receipt, AI-reading baseline, AI-reading improved result, telemetry stream row, proof-root summary, and repair posture.
These objects bind to existing Bitcode objects: deposits, BTD ranges, AssetPacks, BTC fee receipts, source-to-shares rows, ledger journals, database projections, object-storage locks, VCS pull requests, prompt-program receipts, pipeline executions, and source-safe generated artifacts.

## V42 whole Bitcode operator chain

The V42 operator chain is: admit source, prove Depository availability, expose compensation posture, accept a Read Request, synthesize a Need, review or resynthesize the Need, request Finding Fits, search many Depository candidates, rank and select fitting deposits, synthesize a source-safe AssetPack preview, quote BTD/BTC purchase terms, settle BTC, transfer BTD rights, unlock source-bearing delivery, create repository pull request, journal ledger/database/storage synchronization, and expose source-safe telemetry and proof readback.

V42 Gate 8 must rehearse that whole chain locally and in staging-testnet before promotion.
The local/staging full MVP rehearsal binds Gates 2 through 7 together as one operator-readable path: deposit source, request read, review synthesized Need, request Finding Fits, review source-safe AssetPack preview and quote, buy/settle, transfer BTD rights, receive repository delivery, and verify the AI-reading value demonstration remains valid.
The rehearsal is source-safe metadata only: it may carry lane ids, stage ids, proof roots, staging-testnet project references, command ids, readiness families, database stream posture, telemetry roots, reconciliation roots, delivery roots, and blocker/repair summaries, but it may not serialize secrets, protected source, raw protected prompts, raw interpolated prompts, raw provider responses, unpaid AssetPack source, wallet private material, private settlement payloads, or live rehearsal logs.

## V42 Gate 1 MVP Experience Roadmap And Spec Opening

Gate 1 opens the V42 spec family, branch posture, workflow posture, checker, roadmap, docs, and reliable MVP experience vocabulary.
It does not implement route, pipeline, settlement, or demonstration behavior beyond documentation and validation posture.
It closes when active V41 / draft V42 truth is visible in the root docs, protocol docs, workflow checks, package scripts, and roadmap, and when V42 has a precise gate plan.

## V42 Gate 2 Depositing Shortest Path And Compensation Visibility

Gate 2 makes the shortest deposit path explicit and testable.
The accepted user path is: provide source material, select repository/source anchor, admit deposit to the Depository, receive source-safe admission proof, and see how later BTC compensation will be attributed if the deposit participates in a synthesized AssetPack.
The implemented path covers route/API contracts, source validation, storage projection, Depository search-document creation, BTD/source-to-shares compensation readback, telemetry, and local/staging rehearsal posture.

Gate 2 introduces source-safe compensation visibility as a first-class Depository admission readback.
`DepositorySupplyRecord.compensationPreview` and deposit route `depositoryEvidence.compensationPreview` expose only source-safe metadata: compensation state, depositor wallet id, BTC price asset, source-to-shares largest-remainder allocation method, compensation route root, source-to-shares preview root, ledger readback keys, database projection tables, and repair blockers.
The compensation route preview is not a BTD mint and not a rights transfer.
It states that source-to-shares proof, BTC allocation, BTD rights transfer, and source-bearing AssetPack delivery occur only after an accepted Need-Fit creates a paid AssetPack and settlement finality is observed.

Gate 2 proof artifact: `.bitcode/v42-depositing-shortest-path.json`.
The artifact must prove eight source-safe rows: source-to-admission path, deposit route readiness contract, Depository record compensation preview, source-safe search/vector projection, storage readback projection, source-to-shares compensation ledger readback, Terminal compensation visibility readback, and local/staging deposit readback posture.
Validating command: `pnpm run check:v42-gate2`.

## V42 Gate 3 Reading Shortest Path State Machine

Gate 3 must make the five Reading steps a coherent product state machine: request read, review synthesized Need, request Finding Fits, review source-safe AssetPack preview, and buy/settle/deliver AssetPack.
It must simplify default Terminal experience while preserving expandable proof, execution, telemetry, ledger, and storage detail.
It must prove route persistence, transaction ids, stage transitions, restart/retry behavior, source-safe UI rendering, and failure states.

Gate 3 implements that state machine through `TerminalEnterpriseReadingUxState` and `TerminalEnterpriseReadingRouteState`.
The route-owned state carries a recoverable transaction id, `readingStage` stage intent, retry and restart posture, source-safe failure kind, and repair action metadata.
Route state may hydrate the active stage on refresh or Conversation handoff, but it does not waive blockers: Finding Fits still requires accepted Need, source-safe AssetPack preview still gates settlement, and delivery still requires settlement readback.

Gate 3 proof artifact: `.bitcode/v42-reading-shortest-path-state-machine.json`.
This is the canonical V42 reading shortest path state machine artifact for the MVP Reading route contract.
The artifact must prove nine source-safe rows: five-step Reading path, transaction/stage route persistence, accepted-Need transition, restart/retry/failure repair, low-detail proof-on-expand UI, rich Reading pipeline telemetry, activity/workbench readback, route/component/stream tests, and SPEC/DELTA/NOTES/PARITY/README/workflow closure.
Validating command: `pnpm run check:v42-gate3`.

## V42 Gate 4 ReadNeed Review And Resynthesis Product Closure

Gate 4 must make `ReadNeedComprehensionSynthesis` product-ready in the MVP flow.
The pipeline must synthesize exactly the user's Need from the Read Request, store source-safe Need data, allow user feedback and resynthesis, preserve lineage, and admit Finding Fits only after the Need is accepted.
It must cover PTRR agents, FailsafeGenerationSequence, ThricifiedGeneration, prompts, parser return types, telemetry rows, database projection, tests, and UI readback.
Gate 4 is implemented by `.bitcode/v42-readneed-review-resynthesis-product-closure.json`.
The artifact binds `ReadNeedReviewResynthesisRuntime`, all four review actions, source-safe storage projection, rejection posture, accepted-Need admission into `ReadFitsFindingSynthesis`, Terminal runtime/storage/telemetry readback, and the package/API/protocol tests that prove the path.

## V42 Gate 5 ReadFitsFinding AssetPack Preview And Quote Closure

Gate 5 must make `ReadFitsFindingSynthesis` product-ready in the MVP flow.
The pipeline must search the Depository for many candidates above threshold, rank candidates, select fits, synthesize source-safe AssetPack measurements and preview metadata, keep source-bearing content withheld, calculate deterministic BTD/BTC quote posture, and expose a reviewable preview.
It must cover vector search and provider search tooling, selected-fit provenance, prompt/tool return types, telemetry, quote formula readback, source-safe UI, and failure/repair states.
Gate 5 is implemented by `.bitcode/v42-readfitsfinding-preview-quote.json`.
The artifact binds the accepted-Need gate, many-channel Depository search, candidate ranking, selected-fit provenance, `AssetPackPreviewBoundary`, deterministic share-to-fee quote receipt, disclosure review, settlement instructions, delivery lock, harness route summary, Terminal preview/quote/provenance readback, and the package/API/protocol tests that prove no protected source or unpaid AssetPack source crosses the pre-settlement boundary.

## V42 Gate 6 Settlement Rights Transfer And Repository Delivery Closure

Gate 6 must make purchase and delivery reliable.
The accepted user path is: review the AssetPack preview, choose to buy, receive settlement instructions, observe BTC/testnet settlement in the admitted lane, transfer BTD rights to the Reader, unlock source-bearing AssetPack delivery, and create the repository pull request.
It must prove ledger/database/object-storage synchronization, delivery locks, no pre-settlement source leakage, compensation accounting, repair actions, and operator readback.
Gate 6 is implemented by `.bitcode/v42-settlement-rights-delivery.json`.
The artifact binds `AssetPackSettlementRightsDeliveryBoundary`, `AssetPackSettlementPaymentObservation`, confirmed BTC/testnet finality, `BtdRightsTransferReceipt`, `BtdReadReceipt`, `SourceToSharesProof`, `AssetPackDeliveryUnlockReceipt`, ledger/database/object-storage reconciliation, live harness materialization, source-safe route summaries, and Terminal settlement rights readback.
Source-bearing AssetPack delivery remains withheld until payment, finality, BTD rights transfer, source-to-shares compensation conservation, reconciliation readback, and pull-request delivery all agree.

## V42 Gate 7 AI-Reading Dominant Demonstration MVP

Gate 7 must update the standalone demonstration so it proves Bitcode's AI-reading value.
The demonstration should show deposited non-public technical intelligence becoming an AssetPack that measurably improves an AI system's training, prompt/context, or evaluation performance beyond a public-data-only baseline.
It must remain minimal, self-contained inside `protocol-demonstration/`, and independent from commercial product code.
Gate 7 is implemented by `.bitcode/v42-ai-reading-demonstration.json`.
The artifact binds the local public-data-only baseline, reviewed ReadNeed synthesis, local Depository Finding Fits, selected AssetPack preview, AssetPack-enhanced AI-reading answer, basis-point benchmark uplift, settlement-gated source-safety boundary, self-contained demonstration import boundary, demonstration tests, protocol tests, docs, package scripts, and workflow wiring.
The accepted proof is an AI-reading AssetPack improvement: public-only assistance scores below the AssetPack-enhanced result, selected deposit provenance is explicit, protected source remains withheld before settlement, and the demonstration can run locally without product runtime imports.

## V42 Gate 8 Local And Staging-Testnet Full MVP Rehearsal

Gate 8 must rehearse the full MVP path locally and in staging-testnet without value-bearing mainnet behavior.
It must exercise deposit, Read Request, Need synthesis/review/resynthesis, Finding Fits, AssetPack preview, quote, settlement simulation or testnet observation, BTD rights projection, repository delivery, telemetry, proof artifacts, and repair readback.
Gate 8 implements the local/staging full MVP rehearsal proof.
The generated artifact `.bitcode/v42-local-staging-mvp-rehearsal.json` binds the closed V42 product artifacts from Gates 2 through 7 to the package `ReadingLocalStagingRehearsal`, the Vercel Sandbox harness, staging-testnet Supabase project `tkpyosihuouusyaxtbau`, rich execution-log readback, ledger/database/object-storage reconciliation, post-settlement pull-request delivery, source-safe operator receipts, and blocked value-bearing mainnet posture.
Gate 8 does not promote mainnet, does not split `/terminal`, and does not rename `/exchange`.
It proves the current MVP path is rehearseable under local and staging-testnet lanes while preserving V43+ as the route-vocabulary cleanup and agentic deposit AssetPack option work.
The validating command is `pnpm run check:v42-gate8`.

## V42 Gate 9 V42 Promotion Readiness

Gate 9 closes V42 promotion readiness.
It must bind every V42 artifact, test, workflow, generated proof support, promotion command, active V42 / draft V43 runtime preparation, source-safe generated appendix output, and value-bearing mainnet blocking where relevant.
It closes only when V42 can be promoted as the reliable MVP experience canon.
The V42 promotion readiness canon is the generated artifact `.bitcode/v42-promotion-readiness-report.json`, the `BITCODE_SPEC_V42_PROVEN.md` generation path, `.github/workflows/v42-canon-promotion.yml`, package scripts, and promotion dry-run support.
The accepted post-promotion posture is V42 active / draft V43, with value-bearing mainnet still blocked unless a later promoted canon admits it.

## V42 canonical subsystem surfaces

### Depositing and asset supply

Current canonical objects and emitted artifacts: deposits, source admission proof, Depository records, search documents, embedding projections, source-to-shares contributor roots, compensation route previews, and admission telemetry.
Current algorithms and derivation rules: deposit admission validates source authority, builds source-safe measurement/search documents, preserves ownership, and records future compensation posture without implying a BTD mint before a Need-Fit.
Current invariants and fail-closed conditions: invalid deposit, missing source authority, storage mismatch, and protected-source projection fail closed.
Current proof obligations: admission proof, Depository readback, compensation route readback, source-safe projection, and local/staging rehearsal.
Current source-bearing implementation basis: `packages/protocol`, `packages/btd`, `packages/pipelines/asset-pack`, `packages/tools-generics`, `packages/prompts`, and `uapi`.
Current validating commands and parity basis: V42 gate checks, V41 prompt-program checks, V40 integration coverage, V39 Reading readiness, and generated V42 artifacts.
Current accepted boundaries: pre-fit deposits are Depository supply; BTD rights are minted/transferred only through accepted Need-Fit and settlement law.

### Reading and prompt/inference ownership

Current canonical objects and emitted artifacts: Read Request, synthesized Need, Need review decision, resynthesis lineage, accepted Need admission, prompt receipts, Failsafe receipts, ThricifiedGeneration receipts, parser envelopes, and telemetry stream rows.
Current algorithms and derivation rules: `ReadNeedComprehensionSynthesis` maps Read Request to exactly scoped Need, then user acceptance admits `ReadFitsFindingSynthesis`.
Current invariants and fail-closed conditions: prompt contract incompleteness, parsed-envelope inadmissibility, missing Need review, authorization denial, and source-context overreach fail closed.
Current proof obligations: prompt registry coverage, typed output parsing, review/resynthesis lineage, source-safe telemetry, and UI state persistence.
Current source-bearing implementation basis: `packages/agent-generics`, `packages/prompts`, `packages/pipelines/asset-pack`, `packages/tools-generics`, `packages/protocol`, and `uapi`.
Current validating commands and parity basis: V41 prompt-program reports, V42 Reading product gates, and V40 application tests.
Current accepted boundaries: Need data may be visible to the Reader; fit source and AssetPack source remain withheld until settlement unlock.

### Fit, recall, ranking, and verification

Current canonical objects and emitted artifacts: query plans, vector search receipts, provider search receipts, candidate fit deposits, ranking receipts, selected-fit provenance, verification verdicts, source-safe preview measurements, and replay roots.
Current algorithms and derivation rules: `ReadFitsFindingSynthesis` searches many Depository candidates above threshold, ranks them with source-safe evidence, and feeds selected fits into AssetPack synthesis.
Current invariants and fail-closed conditions: no-survivor asset pack, missing provenance, ranking drift, embedding mismatch, and verification failure block preview and settlement.
Current proof obligations: query synthesis, vector/provider search breadth, threshold ranking, selected-fit provenance, and source-safe replay determinism.
Current source-bearing implementation basis: depository search tools, embedding utilities, prompt registries, pipeline asset-pack packages, and benchmark fixtures.
Current validating commands and parity basis: V38 search/embedding artifacts, V39 Finding Fits runtime, V41 prompt hardening, and V42 Gate 5.
Current accepted boundaries: pre-settlement candidate and fit visibility is source-safe metadata only.

### Selection and materialization

Current canonical objects and emitted artifacts: selected fit set, AssetPack measurements, source-safe preview, withheld source bundle, quote, delivery lock, repository delivery plan, proof roots, and repair receipts.
Current algorithms and derivation rules: AssetPack source can be synthesized and locked before settlement, but reader visibility is limited to source-safe preview and measurements until payment and rights transfer.
Current invariants and fail-closed conditions: public projection overexposure, unpaid AssetPack source exposure, missing quote, and delivery-lock mismatch fail closed.
Current proof obligations: preview source-safety, deterministic quote, locked source bundle, post-settlement delivery unlock, and repository pull-request proof.
Current source-bearing implementation basis: `packages/pipelines/asset-pack`, `packages/btd`, `packages/vcs`, `packages/protocol`, and `uapi`.
Current validating commands and parity basis: V39 preview/quote and settlement/delivery artifacts, V40 integration tests, and V42 Gates 5 and 6.
Current accepted boundaries: full source-bearing delivery unlock remains payment, finality, rights-transfer, and reconciliation gated.

### Identity, authorization, and sensitive flow

Current canonical objects and emitted artifacts: account, organization, wallet, repository authority, source selector, policy decision, quote recipient, buyer, depositor, and disclosure receipt.
Current algorithms and derivation rules: product paths must check authority before source admission, Need synthesis, fit search, preview, settlement, and repository delivery.
Current invariants and fail-closed conditions: authorization denial, wallet authority mismatch, organization policy denial, and repository permission failure fail closed.
Current proof obligations: policy readback, role checks, wallet boundary, repository delivery authority, and source-safe denial states.
Current source-bearing implementation basis: `packages/auth`, `packages/btd`, `packages/github`, `packages/protocol`, and `uapi`.
Current validating commands and parity basis: V31 Auxillaries authority, V39 Reading interface parity, V40 API/browser tests, and V42 route tests.
Current accepted boundaries: private wallet material, private settlement payloads, secrets, and protected source never enter public or unpaid Reader projections.

### Disclosure and projection

Current canonical objects and emitted artifacts: visibility tier, source-safe preview, protected source lock, prompt/result disclosure posture, telemetry redaction receipt, and public/operator projection rows.
Current algorithms and derivation rules: source-safe summaries may show measurements, ids, hashes, roots, scores, and verdicts; protected source, raw prompts, raw provider responses, and unpaid AssetPack source remain withheld.
Current invariants and fail-closed conditions: public projection overexposure, prompt/result leakage, and storage projection mismatch fail closed.
Current proof obligations: disclosure tier mapping, UI redaction, telemetry redaction, generated artifact redaction, and repair posture.
Current source-bearing implementation basis: `packages/observability`, `packages/prompts`, `packages/protocol`, `packages/btd`, and `uapi`.
Current validating commands and parity basis: V38/V41 source-safe telemetry and prompt-program checks, V39 preview boundaries, and V42 UI tests.
Current accepted boundaries: proof-on-expand may be rich but must remain source-safe before settlement.

### Settlement and exact accounting

Current canonical objects and emitted artifacts: BTD/BTC quote, settlement instruction, BTC observation, finality state, BTD rights transfer receipt, source-to-shares allocation, ledger journal, database projection, and reconciliation receipt.
Current algorithms and derivation rules: deterministic quote posture uses measurement weight, measurement volume, and protocol fee allocation; settlement observation gates rights transfer and delivery unlock; compensation routes deposit contributors according to source-to-shares law.
Current invariants and fail-closed conditions: settlement conservation drift, missing finality, duplicate rights transfer, compensation mismatch, and stale projection fail closed.
Current proof obligations: quote determinism, BTC/testnet observation, BTD rights transfer, source-to-shares conservation, ledger/database/object-storage synchronization, and repair replay.
Current source-bearing implementation basis: `packages/btd`, `packages/protocol`, `packages/objects-arrays`, storage adapters, and `uapi`.
Current validating commands and parity basis: V27/V30 BTD law, V39 settlement readiness, V40 ledger/storage sync, and V42 Gate 6.
Current accepted boundaries: production-mainnet value-bearing operations remain blocked until explicitly admitted by later canon and operator approval.

### Proof contract, witnesses, and replay

Current canonical objects and emitted artifacts: proof family, member, theorem, replay step, witness artifact, generated report, run receipt, telemetry row, repair receipt, and promotion appendix.
Current algorithms and derivation rules: every V42 gate emits or checks source-safe proof roots sufficient to replay the product path and detect stale promoted status truth.
Current invariants and fail-closed conditions: stale promoted status truth, missing witness, failed replay, and source-safety violation fail closed.
Current proof obligations: deterministic generated artifacts, workflow binding, local/staging rehearsal receipts, promotion dry-run, and generated `BITCODE_SPEC_V42_PROVEN.md`.
Current source-bearing implementation basis: `packages/protocol`, `.bitcode/`, `.github/workflows`, `scripts/`, and `protocol-demonstration/`.
Current validating commands and parity basis: V42 check scripts, V41 promotion readiness, V40 proof/test coverage, and canon-quality workflows.
Current accepted boundaries: demonstration evidence stays within demonstration boundaries and does not become commercial runtime dependency.

## V42 proof-family canon

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v42-inference-synthesis.json` | read-need, finding-fits, asset-pack-preview | need-exactness, many-fit-search, typed-output | synthesize-need, search-depository, preview-pack | pipeline receipts, prompt receipts | V41 prompt-program canon and V42 Reading gates |
| Prompt-completeness | `.bitcode/v42-prompt-completeness.json` | prompt-registry, tool-prompts, parser-prompts | registry-totality, interpolation-totality | resolve-prompt, parse-output | prompt catalogue reports | V41 PromptPart and Prompt artifacts |
| Static-code-analysis | `.bitcode/v42-static-code-analysis.json` | routes, packages, workflows | no-versioned-routes, no-demo-import, no-secret-values | lint, typecheck, import-scan | CI logs | scripts and workflows |
| Verification-decisions | `.bitcode/v42-verification-decisions.json` | deposit-admission, need-review, fit-selection | authority-checked, source-safe, replayable | admit-deposit, accept-need, rank-fits | route/API receipts | V42 Gates 2 through 5 |
| Selection-and-materialization | `.bitcode/v42-selection-materialization.json` | selected-fits, preview, withheld-source | no-source-before-settlement, delivery-lock | synthesize-preview, lock-source | storage and preview receipts | V39/V42 preview and delivery law |
| Authorization-and-sensitive-flow | `.bitcode/v42-authorization-sensitive-flow.json` | account, org, wallet, repo | authority-preserved, policy-fail-closed | check-policy, check-wallet, check-repo | policy receipts | Auxillaries, auth, BTD packages |
| Settlement-source-to-shares | `.bitcode/v42-settlement-source-to-shares.json` | quote, settlement, rights, compensation | conservation, finality, rights-transfer | quote, observe, transfer, allocate | ledger receipts | BTD and ledger packages |
| Disclosure-boundary | `.bitcode/v42-disclosure-boundary.json` | source-safe-preview, telemetry-redaction, generated-artifacts | no-protected-payload, source-safe-public | render-preview, stream-telemetry, generate-report | redaction receipts | V38/V41/V42 source-safe rules |
| Proof-contract | `.bitcode/v42-proof-contract.json` | generated-reports, workflows, promotion | deterministic, workflow-bound, promotion-ready | generate, check, promote-dry-run | `.bitcode/*`, CI logs | protocol package and workflows |

### Inference-synthesis

- proofArtifactPath: `.bitcode/v42-inference-synthesis.json`
- members: read-need, finding-fits, asset-pack-preview
- theoremIds: need-exactness, many-fit-search, typed-output
- replayStepIds: synthesize-need, search-depository, preview-pack
- witnessArtifactPaths: pipeline receipts, prompt receipts, parser receipts
- current member closure criteria: each inference step is registry-bound, typed, source-safe, and attached to the product state machine.
- current member verdict shape: pass, fail, blocked, or repair-required.
- current theorem-by-theorem closure reading: Need exactness, many-fit search, and typed output must independently pass.
- current theorem-to-replay grouping: replay follows Need synthesis, Finding Fits, and preview generation.
- minimum artifact/replay binding set: prompt lineage, execution id, parsed output id, and telemetry row id.
- current proof-object fields: id, stage, agent, step, parser, verdict, proofRoot.
- generated-artifact and test bindings: V42 pipeline product checks and V41 prompt-program reports.
- fail-closed conditions: prompt contract incompleteness, parsed-envelope inadmissibility, and no-survivor asset pack.

### Prompt-completeness

- proofArtifactPath: `.bitcode/v42-prompt-completeness.json`
- members: prompt-registry, tool-prompts, parser-prompts
- theoremIds: registry-totality, interpolation-totality
- replayStepIds: resolve-prompt, parse-output
- witnessArtifactPaths: V41 prompt inventory, registry interpolation reports
- current member closure criteria: every prompt involved in the MVP path is catalogued and validated.
- current member verdict shape: pass, fail, blocked, or repair-required.
- current theorem-by-theorem closure reading: registry and interpolation totality are checked before inference.
- current theorem-to-replay grouping: prompt resolution precedes parser validation.
- minimum artifact/replay binding set: prompt id, part ids, interpolation keys, parser id.
- current proof-object fields: promptId, registryId, interpolationKeys, parserId, verdict.
- generated-artifact and test bindings: V41 prompt reports and V42 gate checks.
- fail-closed conditions: prompt contract incompleteness and protected prompt disclosure.

### Static-code-analysis

- proofArtifactPath: `.bitcode/v42-static-code-analysis.json`
- members: routes, packages, workflows
- theoremIds: no-versioned-routes, no-demo-import, no-secret-values
- replayStepIds: lint, typecheck, import-scan
- witnessArtifactPaths: CI logs and local command output
- current member closure criteria: changed code is typechecked, lintable, import-safe, and source-safe.
- current member verdict shape: pass, fail, blocked, or repair-required.
- current theorem-by-theorem closure reading: route naming, dependency direction, and secret safety must pass.
- current theorem-to-replay grouping: static checks run before integration checks.
- minimum artifact/replay binding set: command, branch, commit, output summary.
- current proof-object fields: checkId, command, files, verdict, proofRoot.
- generated-artifact and test bindings: gate-quality and canon-quality workflows.
- fail-closed conditions: stale promoted status truth, source import violation, and secret exposure.

### Verification-decisions

- proofArtifactPath: `.bitcode/v42-verification-decisions.json`
- members: deposit-admission, need-review, fit-selection
- theoremIds: authority-checked, source-safe, replayable
- replayStepIds: admit-deposit, accept-need, rank-fits
- witnessArtifactPaths: route receipts, API receipts, pipeline receipts
- current member closure criteria: each user-visible decision has source-safe reason, authority proof, and replay id.
- current member verdict shape: accepted, rejected, blocked, or repair-required.
- current theorem-by-theorem closure reading: authority, source safety, and replayability are independent gates.
- current theorem-to-replay grouping: decision receipts replay in product order.
- minimum artifact/replay binding set: transaction id, decision id, principal id, proofRoot.
- current proof-object fields: decisionKind, actor, inputRoot, outputRoot, verdict.
- generated-artifact and test bindings: V42 product state machine and API tests.
- fail-closed conditions: invalid deposit, authorization denial, and missing Need acceptance.

### Selection-and-materialization

- proofArtifactPath: `.bitcode/v42-selection-materialization.json`
- members: selected-fits, preview, withheld-source
- theoremIds: no-source-before-settlement, delivery-lock
- replayStepIds: synthesize-preview, lock-source
- witnessArtifactPaths: preview receipts, storage lock receipts
- current member closure criteria: selected fits produce preview metadata while source-bearing content is locked.
- current member verdict shape: pass, fail, blocked, or repair-required.
- current theorem-by-theorem closure reading: preview and source lock must both pass before quote settlement.
- current theorem-to-replay grouping: selected fit replay precedes source lock replay.
- minimum artifact/replay binding set: selectedFitIds, previewRoot, lockRoot, quoteRoot.
- current proof-object fields: assetPackId, previewRoot, lockRoot, disclosureTier, verdict.
- generated-artifact and test bindings: V39 preview law and V42 Gate 5/6 checks.
- fail-closed conditions: public projection overexposure and unpaid AssetPack source exposure.

### Authorization-and-sensitive-flow

- proofArtifactPath: `.bitcode/v42-authorization-sensitive-flow.json`
- members: account, org, wallet, repo
- theoremIds: authority-preserved, policy-fail-closed
- replayStepIds: check-policy, check-wallet, check-repo
- witnessArtifactPaths: policy receipts and authorization logs
- current member closure criteria: each sensitive action verifies the principal, organization, wallet, and repository boundary.
- current member verdict shape: allowed, denied, blocked, or repair-required.
- current theorem-by-theorem closure reading: policy and wallet/repository authority cannot be inferred from UI state alone.
- current theorem-to-replay grouping: policy replay gates settlement and delivery replay.
- minimum artifact/replay binding set: principal id, policy id, wallet id, repo id.
- current proof-object fields: actor, policy, resource, decision, proofRoot.
- generated-artifact and test bindings: Auxillaries, auth, BTD, route tests.
- fail-closed conditions: authorization denial, wallet authority mismatch, and private payload leakage.

### Settlement-source-to-shares

- proofArtifactPath: `.bitcode/v42-settlement-source-to-shares.json`
- members: quote, settlement, rights, compensation
- theoremIds: conservation, finality, rights-transfer
- replayStepIds: quote, observe, transfer, allocate
- witnessArtifactPaths: ledger receipts, database projections, storage locks
- current member closure criteria: quote, settlement, rights, and compensation rows reconcile exactly.
- current member verdict shape: pass, fail, blocked, or repair-required.
- current theorem-by-theorem closure reading: BTC finality, BTD rights transfer, and source-to-shares conservation must all pass.
- current theorem-to-replay grouping: settlement observation gates transfer and allocation.
- minimum artifact/replay binding set: quoteRoot, txid, rightsReceiptId, allocationRoot.
- current proof-object fields: quote, settlement, finality, rights, allocation, verdict.
- generated-artifact and test bindings: BTD tests, ledger/storage sync checks, V42 Gate 6.
- fail-closed conditions: settlement conservation drift and stale promoted status truth.

### Disclosure-boundary

- proofArtifactPath: `.bitcode/v42-disclosure-boundary.json`
- members: source-safe-preview, telemetry-redaction, generated-artifacts
- theoremIds: no-protected-payload, source-safe-public
- replayStepIds: render-preview, stream-telemetry, generate-report
- witnessArtifactPaths: UI snapshots, telemetry rows, generated artifacts
- current member closure criteria: collapsed and expanded UI states remain source-safe before settlement.
- current member verdict shape: pass, fail, blocked, or repair-required.
- current theorem-by-theorem closure reading: preview, telemetry, and generated proof disclosure are separately checked.
- current theorem-to-replay grouping: UI replay and generated artifact replay share disclosure tiers.
- minimum artifact/replay binding set: disclosureTier, redactionReceipt, component, artifactPath.
- current proof-object fields: visibilityTier, payloadKind, redaction, verdict, proofRoot.
- generated-artifact and test bindings: V38/V41 telemetry and V42 UI tests.
- fail-closed conditions: public projection overexposure and protected prompt/source leakage.

### Proof-contract

- proofArtifactPath: `.bitcode/v42-proof-contract.json`
- members: generated-reports, workflows, promotion
- theoremIds: deterministic, workflow-bound, promotion-ready
- replayStepIds: generate, check, promote-dry-run
- witnessArtifactPaths: `.bitcode/*`, workflow logs, `BITCODE_SPEC_V42_PROVEN.md`
- current member closure criteria: every V42 gate artifact is deterministic, checked, documented, and workflow-bound.
- current member verdict shape: pass, fail, blocked, or repair-required.
- current theorem-by-theorem closure reading: generated proof, workflow proof, and promotion proof must all pass.
- current theorem-to-replay grouping: generation and checking precede promotion dry-run.
- minimum artifact/replay binding set: artifact path, generator command, checker command, workflow job.
- current proof-object fields: artifactPath, command, workflow, verdict, proofRoot.
- generated-artifact and test bindings: V42 promotion readiness and canon promotion workflow.
- fail-closed conditions: missing artifact, stale promoted status truth, and failed promotion dry-run.

## V42 generated canon

### Inherited V19 reproducible-canon artifacts

V42 inherits byte-stable generated proof expectations, deterministic replay posture, and promotion artifact discipline from V19.

### Inherited V20 operator-quality artifacts

V42 inherits operator-quality expectations for browser proof, accessibility, visual checks, performance posture, and operator acceptance from V20.

### Exact generated-artifact inventory matrix

| Artifact path | Producer | Disclosure posture | V42 role |
| --- | --- | --- | --- |
| `.bitcode/v42-spec-family-report.json` | `check-bitcode-spec-family` | source-safe metadata | draft/promotion spec family proof |
| `.bitcode/v42-canonical-input-report.json` | `check-bitcode-canonical-inputs` | source-safe metadata | canonical input proof |
| `.bitcode/v42-canon-posture-drift-report.json` | `check-bitcode-canon-posture-drift` | source-safe metadata | active V41 / draft V42 posture proof |
| `.bitcode/v42-depositing-shortest-path.json` | V42 Gate 2 | source-safe metadata | deposit MVP proof |
| `.bitcode/v42-reading-shortest-path-state-machine.json` | V42 Gate 3 | source-safe metadata | Reading product state proof |
| `.bitcode/v42-readneed-review-resynthesis-product-closure.json` | V42 Gate 4 | source-safe metadata | Need review proof |
| `.bitcode/v42-readfitsfinding-preview-quote.json` | V42 Gate 5 | source-safe metadata | Finding Fits, preview, and quote proof |
| `.bitcode/v42-settlement-rights-delivery.json` | V42 Gate 6 | source-safe metadata | settlement/delivery proof |
| `.bitcode/v42-ai-reading-demonstration.json` | V42 Gate 7 | source-safe metadata | demonstration value proof |
| `.bitcode/v42-local-staging-mvp-rehearsal.json` | V42 Gate 8 | source-safe metadata | local/staging rehearsal proof |
| `.bitcode/v42-promotion-readiness-report.json` | V42 Gate 9 | source-safe metadata | promotion readiness proof |

### V42 specifying generated artifacts

V42 specifying artifacts must be generated from code or deterministic scripts, committed only when source-safe, and checked by gate-quality and canon-quality workflows.

### Shared generated-artifact fields

Shared fields are artifact id, schema id, version, current target, source roots, validation commands, proof roots, generated at policy, disclosure posture, and verdict.

### Artifact-specific generated payload fields

Artifact-specific fields include deposit ids, Reading stage ids, prompt/parser ids, selected fit roots, quote roots, settlement roots, delivery roots, AI baseline ids, benchmark ids, and rehearsal ids.

### Artifact confidentiality and disclosability taxonomy

Allowed public payloads are ids, hashes, counts, statuses, source-safe summaries, measurement scores, proof roots, and redaction verdicts.
Forbidden payloads are secrets, wallet private material, private settlement payloads, protected source, raw provider responses, protected prompt payloads, and unpaid AssetPack source.

### Minimum generated appendix rendered contents

The generated `BITCODE_SPEC_V42_PROVEN.md` must include aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when any required proof is missing.

### Canonical regeneration and fail-closed posture

Promotion must fail closed when generated artifacts are missing, stale, non-deterministic, source-unsafe, disconnected from workflow checks, or inconsistent with `BITCODE_SPEC.txt`.

## V42 validation canon

Validation must include:

- `node scripts/check-bitcode-spec-family.mjs --version V42 --mode draft --current-target V41`;
- `node scripts/check-v42-gate1-mvp-experience-roadmap-opening.mjs`;
- later V42 gate checks as each gate opens;
- route/API/unit/integration/browser checks appropriate to each product behavior gate;
- local and staging-testnet rehearsal checks before promotion.

## V42 promotion canon

V42 promotion requires all V42 gates closed, all generated artifacts deterministic and source-safe, gate-quality and canon-quality workflows green, `BITCODE_SPEC_V42_PROVEN.md` generated, active V42 / draft V43 runtime posture prepared, and value-bearing mainnet operations explicitly blocked unless later canon admits them.

## V42 appendices and canonical supporting material

Supporting material includes `BITCODE_SPEC_V42_DELTA.md`, `BITCODE_SPEC_V42_NOTES.md`, `BITCODE_SPEC_V42_PARITY_MATRIX.md`, package READMEs, root README, `SPECIFICATIONS_ROADMAP.md`, workflow files, generated `.bitcode/` artifacts, and protocol-demonstration documents.

## V42 accepted boundaries and reopen conditions

Accepted boundaries:

- V42 Gate 1 is specification and validation posture only.
- V42 may refine `/terminal` but does not split `/read` and `/deposit`.
- V42 may improve exchange-to-pack language where user-facing clarity requires it, but full `/exchange` to `/packs` route rename is deferred to V43+.
- V42 may update demonstration only inside `protocol-demonstration/`.

Reopen conditions:

- a route, pipeline, or generated artifact exposes protected source or unpaid AssetPack source;
- Need review is bypassed before Finding Fits;
- settlement or BTD rights transfer is claimed without ledger/database/storage reconciliation;
- AI-reading demonstration cannot prove improvement beyond public-data-only baseline;
- workflow posture allows stale V42 artifacts to pass.

## V42 completion condition

V42 closes when the reliable MVP product experience is fully specified, implemented, tested, source-safe, rehearsed locally and in staging-testnet, documented, generated, workflow-checked, and promotion-ready across Depositing, Reading, Finding Fits, AssetPack preview, BTD/BTC settlement, repository delivery, depositor compensation visibility, and the AI-reading dominant demonstration.

## Appendix A. Canonical type and surface catalog

Canonical types include Depositing session, source admission proof, Depository record, compensation route preview, Read Request, synthesized Need, Need review decision, accepted Need, Finding Fits request, candidate fit deposit, selected fit set, AssetPack preview, BTD/BTC quote, settlement receipt, BTD rights transfer, repository delivery receipt, AI-reading baseline, AI-reading improved result, telemetry row, proof root, and repair posture.

## Appendix B. Proof family closure catalog

V42 proof families close through the exact proof-family inventory matrix and per-family sections above.

## Appendix C. Generated artifact contract catalog

V42 generated artifacts are source-safe, deterministic, workflow-bound, and promotion-blocking when stale.

## Appendix D. Validation and checking gate catalog

V42 gate validation starts with `check:v42-gate1` and expands gate by gate into package tests, route tests, browser tests, rehearsal scripts, and promotion readiness checks.

## Appendix E. Current canonical source map

Current source roots are `packages/protocol`, `packages/btd`, `packages/pipelines/asset-pack`, `packages/pipeline-hosts`, `packages/prompts`, `packages/tools-generics`, `packages/observability`, `packages/github`, `uapi`, `.github/workflows`, `scripts`, and `protocol-demonstration`.

## Appendix F. Subsystem totality and derivability matrix

V42 must cover repo supply and depositing, reading and measured demand, prompt/inference/evaluator ownership, deposit-to-read fit, recall and ranking, verification decisions, selection and materialization, branch artifacts and assetPackEvidence, identity, authority, signing, and policy, sensitive data and confidentiality flows, projection, disclosure, and redaction, proof families, members, theorems, witnesses, and replay, settlement, source-to-shares, journals, and exact accounting, telemetry, persistence, state, and failure semantics, host/runtime capability truth, operator experience and pedagogy, validation and test stack, and generated artifacts and canonical promotion.

## Appendix G. Canonical file-family and promotion contract catalog

V42 file-family contracts are `BITCODE_SPEC_V42.md`, `BITCODE_SPEC_V42_DELTA.md`, `BITCODE_SPEC_V42_NOTES.md`, `BITCODE_SPEC_V42_PARITY_MATRIX.md`, and eventual `BITCODE_SPEC_V42_PROVEN.md`.

## Appendix H. Operator surface and quality contract catalog

Operator surfaces include `/terminal`, depositing controls, Reading controls, execution stream rows, settlement panels, delivery receipts, Auxillaries wallet/organization surfaces, demonstration pages, and generated proof reports.

## Appendix I. Scenario, workflow, and cross-product contract catalog

V42 scenario coverage must include auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, and Valuable workflows.

## Appendix J. Fail-closed contract and error posture matrix

V42 fails closed on invalid deposit, prompt contract incompleteness, parsed-envelope inadmissibility, no-survivor asset pack, authorization denial, public projection overexposure, settlement conservation drift, stale promoted status truth, source leakage, missing Need review, missing settlement finality, and repository delivery authorization failure.

## Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing contracts include `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`, `.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and `BITCODE_SPEC_V42_PROVEN.md`.
These contracts keep full AssetPack source withheld until settlement, BTD rights transfer, and delivery unlock.
