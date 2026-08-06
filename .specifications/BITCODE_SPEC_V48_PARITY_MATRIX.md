# Bitcode Spec V48 Parity Matrix

## Status

- Version: `V48`
- V48 state: canonical promotion complete; V48 parity truth and living product surfaces are aligned under as-is promotion
- Current canonical/latest target: `V48`
- Canonical proof-source commit: `61ae9ddcfcd6d90da637ecad8edd2c7bc22ff840`
- Prior canonical anchor: `BITCODE_SPEC_V47.md` (historical process only)
- Prior generated proof appendix: `BITCODE_SPEC_V47_PROVEN.md` (historical process only)
- Generated structured artifact inventory: active canonical `.proofs/v48/spec-family-report.json`, `.proofs/v48/canonical-input-report.json`, `.proofs/v48/canon-posture-drift-report.json` when regenerated, `.proofs/v48/depositor-website-completion.json`, living `check:v48-gate*` evidence, V48 promotion workflow evidence, and `BITCODE_SPEC_V48_PROVEN.md` as the generated proof appendix for V48 as-is promotion
- Source parity state: V48 source-side sole-complete commercial website law (deposit/read/exchange, measurement, disclosure, BTD/BTC-testnet, living product tree) is canonicalized in the promoted V48 file family under as-is promotion
- Spec companion: `BITCODE_SPEC_V48.md` (sole rebuild law)
- Notes companion: `BITCODE_SPEC_V48_NOTES.md`
- Delta companion: `BITCODE_SPEC_V48_DELTA.md`
- Absolute measurement parity: `BITCODE_SPEC_V48_ABSOLUTE_MEASUREMENT_PARITY_MATRIX.md`
- Scope: V48 canonical parity ledger for sole-complete commercial website testnet readiness over promoted V47 canon
- Last fully realized canonical target preserved in source: `V48`


## Purpose

This matrix records V48 launch-readiness parity work against the **V48 SPEC
family alone**. MVP website surfaces: `/deposits`, `/reads`, `/exchange`, and
Auxillaries. The matrix names what must be specified, implemented, tested,
documented, and proven under promoted V48 canon.

## Audit basis

Audit inputs are the V48 SPEC family, living source under `apps/uapi` and
`packages/`, gate/canon workflows, product routes `/deposits`, `/reads`,
`/exchange`, Auxillaries, pipeline packages, prompt registries, proof roots,
ledger/database storage readback, wallet/provider receipts, and repository
delivery receipts.

## V48 implementation matrix

| Area | Required V48 result | Current judgment | Source-grounded finding | Closure gate |
| --- | --- | --- | --- | --- |
| Scope and launch freeze | V48 is website-first commercial staging-testnet readiness, not broad feature expansion | closed | Gate 1 opens scope and keeps V46 active canon. | Gate 1 |
| Testnet semantics | Testnet means BTC amounts are testnet/free while the rest of the system behaves production-intended | closed | Gate 1 records this as launch law. | Gate 1 |
| Measurement law | Catalog measurements, prompts, typed outputs, weights, BTD scalar formula, seller/buyer visualization, and proof roots | closed | Gate 1 makes measurement the basis for price and settlement. | Gate 1 |
| Absolute measurement excellence | Full catalogue (65, Σ=1) with honesty status, measureReport, materialIdentity, deep source set, report-owned merge, toolPlan waves, review artifact, deposit/Exchange display | closed | Spec restated 2026-07-25; impl + multi-lang fixtures + expand/pack-activity/exchange tests green; live remeasure optional | version/v48 workstream |
| Feature excess audit | Remove, hide, flag off, or defer non-launch behavior | closed | `buildV48FeatureExcessAlignmentAudit` and `.proofs/v48/feature-excess-alignment-audit.json` classify launch/supporting/deferred surfaces and check launch CTAs, compatibility redirects, and feature flags. | Gate 2 |
| Seller state machine | IP seller can connect source, synthesize options, review measurements, approve deposit, and track compensation | closed | `buildV48SellerBuyerStateMachineLaw` and `.proofs/v48/seller-buyer-state-machine-law.json` define seller states and guards; `buildV48DepositorWebsiteCompletion` and `.proofs/v48/depositor-website-completion.json` bind the `/deposits` route session, journaled synthesis/review/admission rows, and `/exchange` sync. | Gate 3 and Gate 4 |
| Buyer state machine | IP buyer can request Read, approve Need, Finding Fits, preview, settle, receive rights, and get PR delivery | closed | `buildV48SellerBuyerStateMachineLaw` and `.proofs/v48/seller-buyer-state-machine-law.json` define buyer states and guards; `buildV48ReaderWebsiteCompletion` and `.proofs/v48/reader-website-completion.json` bind the `/reads` route session, fit measurement review, settlement/rights/delivery ordering, and `/packs` sync. | Gate 3 and Gate 5 |
| `/exchange` dashboard | Master-detail activity tracks deposits, reads, proofs, settlements, rights, delivery, compensation, repair | closed | Exchange page client + activity model; artifact may still be named `packs-auxillaries-commercial-dashboard.json`; product route is `/exchange`. | Gate 6 |
| Auxillaries launch readiness | Identity, source connections, target repository connections, wallets, teams, histories are usable | closed | Auxillaries panes cover identity profile, external source connections, interfaces, wallet authority with BTD history readback, and organization team/treasury settings, recorded by the Gate 6 artifact. | Gate 6 |
| E2E IP exchange tests | Browser tests prove selling and buying IP the Bitcode way | closed | `commercial-mvp.ip-exchange.spec.ts` proves the seller deposit flow, buyer measurement/quote/settlement/rights/delivery flow, and `/packs` repair-surface readback in deterministic mock mode, recorded by `buildV48E2eIpSellingBuyingTests` and `.proofs/v48/e2e-ip-selling-buying-tests.json` validated by `check:v48-gate7`. | Gate 7 |
| Landing and public messaging | Landing page explains commercial testnet readiness and user flows | closed | The landing testnet section and docs testnet-meaning card state free BTC-testnet amounts with production-intended behavior, the deposit → read → packs flow, proof-backed trust, and source-safe positioning over preserved V46 claim boundaries, recorded by `buildV48LandingPublicLaunchMessaging` and `.proofs/v48/landing-public-launch-messaging.json` validated by `check:v48-gate8`. | Gate 8 |
| Staging-testnet rehearsal | Canonical deployment validates real routes, real data stores, and BTC-testnet settlement | closed | `buildV48StagingTestnetDeploymentRehearsal` and `.proofs/v48/staging-testnet-deployment-rehearsal.json` bind dry-run lane receipts for the full stack, the realistic-data contract, settlement observation ordering, and blocked mainnet to the deployment truth sources, validated by `check:v48-gate9`; live deployment execution remains operator opt-in. | Gate 9 |
| Promotion readiness | V48 generated artifacts, parity, CI, and promotion workflow are green | closed | `buildV48PromotionReadinessReport` and `.proofs/v48/promotion-readiness-report.json` bind all Gate 2-9 artifacts, V48 promotion scripts, `v48-canon-promotion.yml`, workflow posture, the active `BITCODE_SPEC_V48_PROVEN.md`, and the prepared post-promotion posture, validated by `check:v48-gate10`. | Gate 10 |

## V48 implementation checklist

| Area | Required V48 result | Current judgment | Source-grounded finding | Closure gate |
| --- | --- | --- | --- | --- |
| Active pointer truth | `BITCODE_SPEC.txt` may name a non-V48 string until promotion | accepted boundary | V48 SPEC family is sole rebuild law regardless of pointer process fact. | Gate 1 / promotion |
| Spec family files | V48 SPEC, DELTA, NOTES, and PARITY files exist | closed | Promoted family present. | Gate 1 |
| CI posture | Living CI validates promoted V48 family + product tree | closed | Local/full CI + `check:v48-gate*` as wired. | Gate 1 |
| Measurement prompt traceability | Every measurement points to prompt identity, typed output, weight, and proof | closed | Later gates must audit concrete prompt registry bindings. | Gate 3+ |
| Seller visualization | Depositors see commercial brief, full absolute catalogue, owner `.patch`, and compensation basis | closed | `/deposits` renders commercialTitle/Description, measurements (honesty + measureReport + material identity), criticality, demand, ROI, BTD potential, BTC source-to-shares preview, option roots, owner patch download, compensation estimates, and authority readback; batch admit + per-pack `/exchange` projection validated by `check:v48-gate4` and `.proofs/v48/depositor-website-completion.json`. | Gate 4 |
| Buyer visualization | Readers see source-safe fit measurements and quote basis before paying | closed | `/reads` renders Need coverage, Fit confidence, specificity, novelty, reuse, risk, evidence, delivery readiness, selected Fit provenance, final BTD scalar, quote basis, and settlement/rights/delivery readback validated by `check:v48-gate5`. | Gate 5 |
| Website-only launch focus | API/MCP, ChatGPT App, and Bitcode Chat are deferred commercial surfaces | accepted boundary | V48 avoids scope sprawl. | Gate 1 and Gate 2 |
| Mainnet block | Value-bearing mainnet remains blocked | accepted boundary | BTC amounts are testnet only in V48. | Gate 1+ |
| Launch route discipline | Public navigation, landing CTAs, pricing acquisition, and BTD detail paths use `/deposits`, `/reads`, or `/exchange` | closed | Product SSOT `EXCHANGE_ROUTE=/exchange`; residual packs paths are not launch CTAs. | Gate 2 |
| State-machine guards | Measurement-before-price, proof-before-state, accepted Need before Finding Fits, finality before BTD rights, BTD rights before delivery, and repair fail closed | closed | Gate 3 source object binds the guards to Deposit, Read, Packs, BTD settlement, receipts, source-to-shares, and semantic volume sources. | Gate 3 |
| Frontend component architecture | Three layers under `apps/uapi/components/{shadcn,bitcode,marketing,exchange,reads,deposits,docs,conversations,auxillaries,datapacks}` with thin page shells | closed | Experience dirs live; Exchange is market surface SSOT | version/v48 workstream |
| Pipeline naming (product UI) | Product run surfaces use Pipeline names (`BitcodePipeline*`, experience extensions); Execution UI names retired; agent `execution-generics` retained as non-product primitive | closed | `BitcodePipelinesTable` + pipeline models landed; shared `bitcode/execution` → `pipeline/` directory rename and executions corridor remain Phases 2/6 | version/v48 workstream |
| cockpit eradication | Launch CTAs use `/deposits`, `/reads`, `/exchange` only | closed | product-routes SSOT; residual retired paths not launch CTAs | version/v48 workstream |
| BTD journal / operational health naming | Package modules use `journal` and `operational-health` (non-product); temporary product aliases until callers migrate | closed | `packages/btd/src/journal.ts` + `operational-health.ts` canonical; `terminal-journal` / `terminal-operational-health` shims | version/v48 workstream |
| Package-first utilities | Generalizable pure logic from uapi `lib/` and pure terminal models live in `packages/` or Bitcode models | closed | Law specified; wallet/cancel/analytics extractions planned Phase 7 | version/v48 workstream |
| God-client modularization | Deposit/Read/Exchange page clients thin; logic in experience subcomponents/hooks/models (SRP) | closed | Exchange/Deposit modular; Read still thinning | version/v48 workstream |
| Deposit modular units | Pure deposit projections + hooks unit-tested; G3-14 source map lists modular paths | closed | UAPI deposits+reads workbench modular; packages asset-pack depository-search/options/supply/synthesis + agents + harness split with stable exports; jest deposit/depository/synthesis green | version/v48 workstream |
| Experience modularization (reads exchange aux marketing docs conversations) | All seven experiences use named component units; page clients thin | closed | Exchange/Reads/Auxillaries/Marketing/Docs/Conversations modularized; FAMILIARIZATION maps packages+uapi | version/v48 workstream |
| Client product surface performance | Long pipeline telemetry and multi-option deposit/read review stay interactive: log list does not O(n) re-scan run-start per row or full-list re-render on 1s stall ticks; absolute catalogue expand (65) is memoized for option cards; continuous canvas particles pause when the tab is hidden and honor reduced motion | closed | 2026-07-30: `PipelineProcessingStallChrome` isolates nowTick; `resolvedRunStartMs` once per snapshot; `DepositOptionCard` memos `expandAbsoluteMeasurementsToFullCatalog`; ParticleLayer skips hidden tab + reduced-motion; NOTES + PERFORMANCE.md | version/v48 product-UX workstream |

## Deposit↔Read stability workstream (version/v48)

Living day-to-day workstream (not a new gate number). Audit frozen in
`BITCODE_SPEC_V48_NOTES.md` § Deposit↔Read stability audit (critical gaps A–D).
Close rows with source-grounded STAB-impl slices; keep product packages from
importing each other.

| Row ID | Required V48 result | Current judgment | Source-grounded finding | Closure |
| --- | --- | --- | --- | --- |
| STAB-A1 | Product-specific Implementation prompts for deposit vs read (patch-plan + commercial-nl at minimum) | closed | Domain `asset-packs-synthesis-prompts-read` + `asset-packs-commercial-nl-prompts-read`; hosts select agent by `productLens` | STAB-impl-1 |
| STAB-A2 | Implementation consumes ranked depository search hits as grounding when Discovery search ran | closed | `projectDepositoryHitsForImplementation` + discovery.depositoryHits in plan/commercial input | STAB-impl-1 |
| STAB-D1 | Per-agent prompt context checklist (Need, hits, catalog, measurements) audited for both products | closed | Read plan/commercial requirements list Need, hits, catalog; deposit prompts list hits | STAB-impl-1 |
| STAB-B1 | Absolute honesty: deterministic/path-only fallback never silently presents as full measured quality | closed | Host empty/catch uses `computeHonestPathOnlyAbsolutes` + `measureReport.mode=path-only`; no false `measured` on path-only | STAB-impl-2 |
| STAB-B2 | When Need is present, neediness plan is non-empty; fit measure is pack-grounded | closed | Read shell re-plans when Setup empty; deterministic volumes blend pack↔Need material overlap | STAB-impl-2 |
| STAB-C1 | Field-weighted lexical search (commercial NL ≫ fixtures ≫ paths) + search→impl handoff | closed | `fieldWeightedLexicalScore` + `collectLexicalFieldCorpora` (NL≫fixtures≫paths); handoff STAB-A2; ops reembed script remains | STAB-impl-3 |
| STAB-C2 | Deposit Discovery search budget law explicit (bounded default vs full opt-in) | closed | `resolveDepositDiscoveryProfile` + host seed `bounded`; full via profile or FAST_DISCOVERY=0; deposit + host unit pins | STAB-impl + host |
| STAB-D2 | Validation ready-to-finish product framing (deposit vs Need-first read) | closed | `asset-packs-validation-prompts-read`; read shell injects Need + hits + path law | STAB-impl-4 |
| STAB-D3 | Residual `ReadFitsFinding*` setup registry keys documented (compat aliases, not dual-pipeline) | closed | setup.ts comments; keys retained for registration stability | STAB-impl-4 |

**Iteration order:** NOTES audit (this row set) → STAB-impl-1 (prompts + hits) →
STAB-impl-2 (measurements) → STAB-impl-3 (lexical/search) → STAB-4 validation
framing. Each impl slice: green `pnpm run ci:local` before land.

## MVP core E2E ladder (version/v48, post-STAB)

Living workstream (not a new gate number). Core systems only: APIs, pipelines,
DB/depository, host orchestration, settle contracts — not browser chrome or
crypto UX. Layers L0–L4 per NOTES § MVP core E2E ladder.

| Row ID | Required V48 result | Current judgment | Source-grounded finding | Closure |
| --- | --- | --- | --- | --- |
| E2E-L0 | Living `ci:local` remains green for core packages touched by E2E work | closed | L1–L5 suites + deposit/read SDIVF + depository contracts landable as package Jest; full monorepo `ci:local` remains operator pre-commit bar | MVP-E2E living |
| E2E-L1 | Critical commercial API contracts: deposit/read synthesize, depository index, packs activity, settle quote/settle rehydrate, demand-estimate, payout finalize, auth fail-closed, source-safe envelopes | closed | Inventory + route suites: L1-D1–D3, R1–R3, X1, P1, S1, HOST/V1/A1; L1-S2 hybrid ranking stays package/lib | MVP-E2E-1 |
| E2E-L2 | CI-fast SDIVF deposit+read with STAB product laws (honesty, hits, needinesses, Need validation) | closed | Deposit SDIVF integration + honesty pins; read SDIVF integration (Need, *-fit, productLens, validation store); L2 inventory lock | MVP-E2E-2 |
| E2E-L3 | Local/CI Supabase: index + hybrid search (NL ≫ paths) + reembed dry-run + RLS unpaid | closed | Mocked document upsert (commercial NL+fixtures); hybrid NL≫path ranking; reembed dry-run suite; unpaid scrub unit; live Supabase job still opt-in | MVP-E2E-3 |
| E2E-L4 | Scripted deposit→admit→index→read→quote→mock settle→activity spine | closed | `runMvpCoreE2eSpine` CI-fast orchestrator + test: admit, index embed, NL search, needinesses, mock quote, source-safe | MVP-E2E-4 |
| E2E-L5 | Fail-closed matrix + crypto/UX payload handoff + operator live runbook | closed | Spine `failMode` reject-admission / empty-needinesses-quote / empty-search-corpus; path-only honesty; `.docs/MVP_CORE_E2E_HANDOFF.md`; `.docs/MVP_CORE_E2E_OPERATOR_RUNBOOK.md` (opt-in L2/L3) | MVP-E2E-5 |

**Iteration order:** E2E-0 spec → E2E-1 API → E2E-2 pipeline CI-fast → E2E-3 DB
→ E2E-4 spine → E2E-5 fail-closed hardening. Browser Gate 7 remains mock UI (joint).

## Grouped closure gates

1. Scope, Testnet Semantics, Measurement Law, And Launch Freeze.
2. Feature Excess And Gate Alignment Audit.
3. Seller And Buyer State Machine Law.
4. Depositor Website Completion.
5. Reader Website Completion.
6. Exchange And Auxillaries Commercial Dashboard.
7. E2E IP Selling And Buying Tests.
8. Landing Page And Public Launch Messaging.
9. Staging-Testnet Deployment Rehearsal.
10. Promotion Readiness.

## V48 accepted boundaries

- V48 SPEC family is sole rebuild law for the system described herein.
- Formal promotion advances `BITCODE_SPEC.txt` only after Gate 10 readiness.
- Testnet pay rails do not weaken rights, proof, disclosure, authority, or
  delivery boundaries.
- Measurement and commercial brief are visible under disclosure law; file
  bodies remain protected until entitlement.
- Commercial launch scope is website-only (`/deposits`, `/reads`, `/exchange`,
  Auxillaries).

## V48 completion condition

V48 Gate 1 is complete when the V48 draft SPEC family, roadmap, package script,
Gate 1 checker, and CI workflow hooks validate draft V48, and the gate branch
is merged into `version/v48`.

V48 Gate 2 is complete when the V48 feature-excess audit artifact is generated,
its package object and tests pass, public launch entrypoints resolve to
`/deposits`, `/reads`, and `/exchange`, deferred surfaces are classified,
retired cockpit paths and `/conversations` full commercialization remain
flaggable/deferred, and gate/canon workflows run `check:v48-gate2`.

V48 Gate 3 is complete when the V48 seller/buyer state-machine law artifact is
generated, its package object and tests pass, seller and buyer states are
bound to `/deposits`, `/reads`, `/exchange`, BTD receipts, settlement,
source-to-shares, and semantic volume sources, transition guards preserve
measurement-before-price and proof-before-state, source-safe fields and
forbidden payload classes are explicit, and gate/canon workflows run
`check:v48-gate3`.

V48 Gate 4 is complete when the V48 depositor website completion artifact is
generated, its package object and tests pass, the `/deposits` route binds
source connection before synthesis, journals option synthesis, review, and
admission as source-safe execution rows, renders commercial brief, absolute
measurements, owner `.patch`, BTD potential, BTC source-to-shares preview,
compensation, and authority views, batch-admits confirmed options to
`/exchange` with per-pack measurements only, and gate/canon workflows run
`check:v48-gate4`.

V48 Gate 5 is complete when the V48 reader website completion artifact is
generated, its package object and tests pass, the `/reads` route binds Read
request initiation, Need review acceptance before Finding Fits, source-safe
fit measurement review with final BTD scalar and deterministic BTC-testnet
quote basis before payment, ordered payment observation, finality, BTD rights,
and repository PR delivery readback, and `/exchange` history synchronization, and
gate/canon workflows run `check:v48-gate5`.

V48 Gate 6 is complete when the V48 packs/Auxillaries dashboard artifact is
generated, its package object and tests pass, `/exchange` renders searchable
master-detail PackActivity with settlement, BTD rights, compensation,
delivery, and repair state readback, proof roots, and a fail-closed repair
surface, Auxillaries panes cover identity, source connections, interfaces,
wallet authority with histories, and organization team/treasury settings, and
gate/canon workflows run `check:v48-gate6`.

V48 Gate 7 is complete when the V48 E2E IP exchange artifact is generated,
its package object and tests pass, the browser proof sells IP on `/deposits`,
buys IP on `/reads` with measurement-before-price and ordered
settlement/rights/delivery readback, audits `/exchange` including the
fail-closed repair surface, runs in deterministic source-safe mock mode with
a clean browser error trap, `uapi` exposes `test:e2e:ip-exchange`, and
gate/canon workflows run `check:v48-gate7`.

V48 Gate 8 is complete when the V48 landing/public launch messaging artifact
is generated, its package object and tests pass, the landing renders the
commercial-testnet section with testnet meaning, core-flow links, and
proof-backed source-safe positioning, public docs carry the testnet-meaning
card, claim-boundary tokens and launch navigation remain intact, and
gate/canon workflows run `check:v48-gate8`.

Gate 10 implementation readback: the promotion readiness report
(`.proofs/v48/promotion-readiness-report.json`) scans every required source,
documentation, and gate-artifact evidence row; each readiness evidence row is
closed when its tokens are present, its artifacts parse, and its
source-safety scan passes.

V48 Gate 9 is complete when the V48 staging-testnet rehearsal artifact is
generated, its package object and tests pass, the rehearsal lanes bind the
deployment truth sources, satisfy the realistic-data contract, rehearse the
settlement observation ordering law, keep value-bearing mainnet blocked with
dry-run lane receipts and operator opt-in live execution, and gate/canon
workflows run `check:v48-gate9`.

V48 Gate 10 is complete when the V48 promotion readiness artifact is
generated, its package object and tests pass, the V48 promotion scripts,
spec-family and runtime promotion preparation, proven generation, and
`v48-canon-promotion.yml` are wired, gate/canon workflows validate both
pointer postures, the active `BITCODE_SPEC_V48_PROVEN.md` exists, the
V48 promotion dry-run passes, and gate/canon workflows run
`check:v48-gate10`.

## Deposit SynthesizeAssetPacks SDIVF — target algorithm parity (2026-07-13)

Target E/E for `SynthesizeDepositAssetPacksSDIVFPipeline` after Host-clone,
sourceCheckoutCatalog naming, and deposit-native Setup/Discovery/Validation/Finish.
No Fits Finding / Read-Need language in deposit Setup. No “lens” vocabulary.
AssetPack = **patch + measurements + metadata**.

### Target phase sequence

| Phase | Sequence | Notes |
| --- | --- | --- |
| preprocess | deposit-only | Coords + steering; catalog may be empty until Setup clone |
| Setup | (1) clone alone → (2) **parallel** {initialize-lsp, initialize-mcps-tools, comprehend-obfuscations} → (3) danger-wall alone | Clone first; danger wall last admits obfuscations |
| Discovery | **parallel** {comprehend-codebase, search-depository, inherent-regurgitation} | Measure is **inside** comprehend-codebase (tools/objectives), not a separate agent |
| Implementation | sequential `…-patch-plan` → `…-patchfile` → `…-measurements` | Plan (6 fields) → write one path-op-json AssetPackPatchArtifact per pack → measure absolutes; kinds: capability-slice \| implementation-pattern \| proof-operations-slice |
| Validation | **one** agent: ready-to-finish-asset-packs-synthesis-deposit-pipeline | A prior phases/tools · B pack quality · C obfuscations vs patch |
| Finish | (1) store-artifacts → (2) ledgerize → (3) finish-synthesize-asset-packs-for-deposit-run | Store (Supabase + patch artifacts) · on-chain ledger · envelope/cleanup last |
| postprocess | normalize | Presentation-safe result |

### Naming (sourceCheckoutCatalog)

| Concept | Store / type key |
| --- | --- |
| This-run Host checkout catalog | `deposit:sourceCheckoutCatalog` (`paths`, `samples`, optional `sources` bodies) |
| Host workspace | `repository:workspacePath` |
| Legacy alias during migration | `deposit:inventory` dual-written for stream filters only — not product vocabulary |

### Setup agents (target registry keys)

| # | Key | Objective | Tools |
| --- | --- | --- | --- |
| 1 | `setup:clone-vcs-repository` | Host adopt this-run tree or clone complete tree at SHA | Host provision / clone tool |
| 2a | `setup:initialize-lsp` | LSP on `repository:workspacePath` for Discovery | LSP init |
| 2b | `setup:initialize-mcps-tools` | MCP config + documented tools | MCP helpers |
| 2c | `setup:comprehend-obfuscations` | Obfuscations → structured guidance | none (PTRR) |
| 3 | `setup:danger-wall` | Fail closed unless obfuscations admission is valid | none (deterministic + optional LLM) |

### Discovery agents (target; parallel)

| Key | Objective | Tools |
| --- | --- | --- |
| `discovery:comprehend-codebase` | Rich codebase analysis: **absolute measurements**, LSP queries, full file-tree structure, key file reads → stored analysis | LSP tools, measure/static-analysis, Host file reads |
| `discovery:search-depository` | Plan multi-query list; hybrid search settled/admitted APs (static+lexical+optional vector); product lens relevants vs Need-fits | `depository-asset-pack-search` / `runDepositDepositoryAssetPackSearch` |
| `discovery:inherent-regurgitation` | Model-inherent patterns for synthesis (source-safe) | none |

### Implementation / Validation / Finish (target)

| Key | Objective |
| --- | --- |
| `implementation:synthesize-deposit-asset-packs` | Options as patch + measurements + metadata |
| `validation:ready-to-finish-asset-packs-synthesis-deposit-pipeline` | Single gate A/B/C |
| `finish:store-artifacts` | Persist run artifacts (APs, patches, measurements) to Supabase |
| `finish:ledgerize` | Update on-chain ledger with now-stored data |
| `finish:finish-synthesize-asset-packs-for-deposit-run` | Metrics, UI selection envelope, cleanup |

### Parity rows (open → closed as implementation lands)

| # | Capability | Current judgment | Closure evidence |
| --- | --- | --- | --- |
| D-01 | Setup: clone alone first | closed | `depositSetupPhase` sequential clone first |
| D-02 | Setup: parallel LSP + MCP + obfuscations | closed | `parallel(initialize-lsp, initialize-mcps-tools, comprehend-obfuscations)` |
| D-03 | Setup: danger wall last, admits obfuscations (not passthrough) | closed | `deposit-danger-wall-agent` + ShortCircuitError |
| D-04 | No Fits Finding / ReadFitsFinding names in deposit Setup | closed | deposit-native keys only in deposit-phases |
| D-05 | sourceCheckoutCatalog naming (not inventory) | closed | Canonical key + resolve helper; legacy `inventory` dual-write only for stream filters |
| D-06 | Discovery agents parallel (3) | closed | `parallel(comprehend-codebase, search-depository, inherent-regurgitation)` |
| D-07 | comprehend-codebase measures + LSP + tree + key files | closed | `codebase-analysis-helpers` + measure + LSP queries + keyFileReads + PTRR prompts require all evidence; stores `discovery:codebaseAnalysis` |
| D-08 | Depository search tool (embeddings/vectors) + Plan queries | closed | Multi-query hybrid: keyword + pgvector; gte-small 384 Edge embed (not OpenAI); `match_depository_asset_pack_vectors`; search-quality telemetry; preload supply |
| D-19 | Index on admit (static doc + embed) | closed | Migrations 384d; Edge `embed` (gte-small); `POST /api/depository/index` → documents + pgvector upsert; no OpenAI Embeddings API |
| D-09 | AssetPack = patch + measurements + metadata (required) | closed | Implementation attaches absolutes; Validation fail-closes without them |
| D-10 | Single validation ready-to-finish deposit agent | closed | A prior phases · B pack quality · C obfuscations vs patch |
| D-11 | Finish store-artifacts | closed | Bundle + optional `deposit:persistArtifacts` hook; dispatch wires hook |
| D-12 | Finish ledgerize | closed | Payload + optional `deposit:ledgerWrite` hook; projection when no hook |
| D-13 | Finish finish-synthesize-deposit-run (last) | closed | selection envelope (patch+measurements+metadata) + cleanup posture |
| D-14 | Host-only clone (no pre-Setup clone; LocalHost this-run only) | closed | Host clone commits |
| D-15 | Kinds capability-slice / implementation-pattern / proof-operations-slice | closed | deposit schemas |
| D-16 | One roster key per agent (no synonym aliases) | closed | discovery/deposit-phases/validation register only canonical keys |
| D-17 | Full absolute catalog on every pack before Finish | closed | Implementation attach + Validation fail-closed; DATA_PACK_ABSOLUTES_CATALOG |
| D-18 | Execution store index + selection envelope schemas | closed | SPEC G3-6/G3-7 + finish agents; storeCrossPhaseArtifact law |

## Read / settle / packs parity (2026-07-14)

| # | Capability | Current judgment | Closure evidence |
| --- | --- | --- | --- |
| R-01 | Read SDIVF mirrors deposit sequence | closed | `read-phases.ts` clone → parallel → danger-wall; Discovery ∥ 3; single validation; Finish triple |
| R-02 | comprehend-needs + danger-wall (Need) | closed | `read-need-comprehension-agent`, `read-danger-wall-agent` |
| R-03 | Needinesses all *-fit + static + dynamic | closed | Catalog + `dynamicNeedinesses` plan (label/guidance/weight); weight re-norm 0.6/0.4; `planDynamicNeedinessesFromContext` |
| R-04 | Read synthesis attaches absolutes + needinesses | closed | `read-asset-pack-synthesis-agent.ts` per-option absolutes + measured needinesses + needFit |
| R-05 | Read API synthesize-options | closed | Deposit-parity dispatch: early stream, supply preload, host provision optional; `maxDuration` 900 |
| R-19 | Read Need-fits multi-query search | closed | `read-depository-search-for-need-fits-agent` passes `queries[]`; product `read-need-fits` |
| R-20 | Deposit/read stream parity | closed | Shared early emitStatus + depository preload before SDIVF |
| R-06 | Settle Simple: pay → mint → rights → PR ship | closed | `settle-asset-pack-pipeline` stages |
| R-07 | `/exchange` master-detail | closed | PacksPageClient master-detail; settle executions projected as settled-assetpack with nested measurements + PR delivery reference |
| R-08 | SPEC G4 rebuild law | closed | `BITCODE_SPEC_V48.md` Gate 4 |
| R-09 | `/reads` Need compose + synthesize dispatch + option select | closed | ReadsNeedComposePanel + use-read-option-synthesis + `/api/read/synthesize-options` |
| R-10 | Settle API handoff from selected options | closed | `POST /api/read/settle` → SettleAssetPackSimplePipeline |
| R-11 | NeedinessesMeasureAgent + *-fit measure path | closed | `factoryNeedinessesMeasureAgent`; read measure async with deterministic fallback |
| R-12 | Richer read option cards | closed | `ReadsOptionCard` patch + absolutes + needinesses expand |
| R-13 | Settle payment observation + live PR when token | closed | structured BTC-testnet observation; createPullRequest when GitHub token present |
| R-14 | Settle → packs rich projection | closed | packActivity envelope (measurements, prUrl, states); pack-activity-model nested kinds; detail delivery reference |
| R-15 | 1:1 AssetPack : settle pipeline | closed | API spawns one run per bought option; pipeline rejects multi-option input |
| R-16 | settle-btc / mint-btd / settle-btd / settle-asset-pack stages | closed | SettleAssetPack stages; agents named in artifacts |
| R-17 | BTD mint = needinesses weighted scalar only | closed | `computeSettlementBtdFromNeedinesses`; absolutes excluded; 21M cap |
| R-18 | BitcodeERC1155 fungible BTD + AP co-ownership | closed | Solidity + TS mirror; add-only co-own; burn forbidden |

