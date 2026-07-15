# Bitcode Spec V47 Parity Matrix

## Status

- Version: `V47`
- V47 state: canonical promotion complete; V47 parity truth, generated launch artifacts, browser proof, staging-testnet rehearsal, gate closure, and promotion automation are aligned
- Current canonical/latest target: `V47`
- Canonical proof-source commit: `0d594d117e7d9f2065c3622dd51c0e5e5456757e`
- Prior canonical anchor: `BITCODE_SPEC_V46.md`
- Prior generated proof appendix: `BITCODE_SPEC_V46_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v47-spec-family-report.json`, `.bitcode/v47-canonical-input-report.json`, `.bitcode/v47-canon-posture-drift-report.json`, V47 launch artifacts (`.bitcode/v47-feature-excess-alignment-audit.json`, `.bitcode/v47-seller-buyer-state-machine-law.json`, `.bitcode/v47-depositor-website-completion.json`, `.bitcode/v47-reader-website-completion.json`, `.bitcode/v47-packs-auxillaries-commercial-dashboard.json`, `.bitcode/v47-e2e-ip-selling-buying-tests.json`, `.bitcode/v47-landing-public-launch-messaging.json`, `.bitcode/v47-staging-testnet-deployment-rehearsal.json`), `.bitcode/v47-promotion-readiness-report.json`, V47 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V47_PROVEN.md` as the generated proof appendix for V47 promotion
- Source parity state: V47 source-side measurement law, seller/buyer state machines, depositor and reader route completions, packs/Auxillaries dashboard, E2E IP exchange browser proof, landing/public launch messaging, staging-testnet rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V47 file family
- Notes companion: `BITCODE_SPEC_V47_NOTES.md`
- Spec companion: `BITCODE_SPEC_V47.md`
- Delta companion: `BITCODE_SPEC_V47_DELTA.md`
- Scope: V47 canonical parity ledger for commercial website testnet launch readiness over promoted V46 protocol comprehension canon
- Last fully realized canonical target preserved in source: `V47`

## Purpose

This matrix records V47 launch-readiness parity work. V47 starts from promoted
V46 and narrows the first generally available MVP to the website application:
`/deposit`, `/read`, `/packs`, and Auxillaries. The matrix names what must be
specified, implemented, tested, documented, and proven before V47 promotion closure.

## Audit basis

Gate 1 audit inputs are `BITCODE_SPEC.txt`, `BITCODE_SPEC_V46.md`,
`BITCODE_SPEC_V46_DELTA.md`, `BITCODE_SPEC_V46_NOTES.md`,
`BITCODE_SPEC_V46_PARITY_MATRIX.md`, `BITCODE_SPEC_V46_PROVEN.md`,
`BITCODE_SPEC_V47.md`, `BITCODE_SPEC_V47_DELTA.md`,
`BITCODE_SPEC_V47_NOTES.md`, this parity matrix, `SPECIFICATIONS_ROADMAP.md`,
`package.json`, gate/canon workflows, `/deposit`, `/read`, `/packs`,
Auxillaries, pipeline packages, prompt registries, proof roots, ledger/database
storage readback, wallet/provider receipts, and repository delivery receipts.

## V47 implementation matrix

| Area | Required V47 result | Current judgment | Source-grounded finding | Closure gate |
| --- | --- | --- | --- | --- |
| Scope and launch freeze | V47 is website-first commercial staging-testnet readiness, not broad feature expansion | closed | Gate 1 opens scope and keeps V46 active canon. | Gate 1 |
| Testnet semantics | Testnet means BTC amounts are testnet/free while the rest of the system behaves production-intended | closed | Gate 1 records this as launch law. | Gate 1 |
| Measurement law | Catalog measurements, prompts, typed outputs, weights, BTD scalar formula, seller/buyer visualization, and proof roots | closed | Gate 1 makes measurement the basis for price and settlement. | Gate 1 |
| Feature excess audit | Remove, hide, flag off, or defer non-launch behavior | closed | `buildV47FeatureExcessAlignmentAudit` and `.bitcode/v47-feature-excess-alignment-audit.json` classify launch/supporting/deferred surfaces and check launch CTAs, compatibility redirects, and feature flags. | Gate 2 |
| Seller state machine | IP seller can connect source, synthesize options, review measurements, approve deposit, and track compensation | closed | `buildV47SellerBuyerStateMachineLaw` and `.bitcode/v47-seller-buyer-state-machine-law.json` define seller states and guards; `buildV47DepositorWebsiteCompletion` and `.bitcode/v47-depositor-website-completion.json` bind the `/deposit` route session, journaled synthesis/review/admission rows, and `/packs` sync. | Gate 3 and Gate 4 |
| Buyer state machine | IP buyer can request Read, approve Need, Finding Fits, preview, settle, receive rights, and get PR delivery | closed | `buildV47SellerBuyerStateMachineLaw` and `.bitcode/v47-seller-buyer-state-machine-law.json` define buyer states and guards; `buildV47ReaderWebsiteCompletion` and `.bitcode/v47-reader-website-completion.json` bind the `/read` route session, fit measurement review, settlement/rights/delivery ordering, and `/packs` sync. | Gate 3 and Gate 5 |
| `/packs` dashboard | Master-detail PackActivity tracks deposits, reads, proofs, settlements, rights, delivery, compensation, repair | closed | `buildV47PacksAuxillariesCommercialDashboard` and `.bitcode/v47-packs-auxillaries-commercial-dashboard.json` bind searchable master-detail rows, settlement/rights/compensation/delivery/repair state readback, proof roots, and the fail-closed repair surface validated by `check:v47-gate6`. | Gate 6 |
| Auxillaries launch readiness | Identity, source connections, target repository connections, wallets, teams, histories are usable | closed | Auxillaries panes cover identity profile, external source connections, interfaces, wallet authority with BTD history readback, and organization team/treasury settings, recorded by the Gate 6 artifact. | Gate 6 |
| E2E IP exchange tests | Browser tests prove selling and buying IP the Bitcode way | closed | `commercial-mvp.ip-exchange.spec.ts` proves the seller deposit flow, buyer measurement/quote/settlement/rights/delivery flow, and `/packs` repair-surface readback in deterministic mock mode, recorded by `buildV47E2eIpSellingBuyingTests` and `.bitcode/v47-e2e-ip-selling-buying-tests.json` validated by `check:v47-gate7`. | Gate 7 |
| Landing and public messaging | Landing page explains commercial testnet readiness and user flows | closed | The landing testnet section and docs testnet-meaning card state free BTC-testnet amounts with production-intended behavior, the deposit → read → packs flow, proof-backed trust, and source-safe positioning over preserved V46 claim boundaries, recorded by `buildV47LandingPublicLaunchMessaging` and `.bitcode/v47-landing-public-launch-messaging.json` validated by `check:v47-gate8`. | Gate 8 |
| Staging-testnet rehearsal | Canonical deployment validates real routes, real data stores, and BTC-testnet settlement | closed | `buildV47StagingTestnetDeploymentRehearsal` and `.bitcode/v47-staging-testnet-deployment-rehearsal.json` bind dry-run lane receipts for the full stack, the realistic-data contract, settlement observation ordering, and blocked mainnet to the deployment truth sources, validated by `check:v47-gate9`; live deployment execution remains operator opt-in. | Gate 9 |
| Promotion readiness | V47 generated artifacts, parity, CI, and promotion workflow are green | closed | `buildV47PromotionReadinessReport` and `.bitcode/v47-promotion-readiness-report.json` bind all Gate 2-9 artifacts, V47 promotion scripts, `v47-canon-promotion.yml`, workflow posture, the draft-preview `BITCODE_SPEC_V47_PROVEN.md`, and the prepared post-promotion posture, validated by `check:v47-gate10`. | Gate 10 |

## V47 implementation checklist

| Area | Required V47 result | Current judgment | Source-grounded finding | Closure gate |
| --- | --- | --- | --- | --- |
| Active pointer truth | `BITCODE_SPEC.txt` remains V46 during Gate 1 | accepted boundary | V47 is draft only. | Gate 1 |
| Draft files | V47 SPEC, DELTA, NOTES, and PARITY files exist | closed | Gate 1 creates full draft family. | Gate 1 |
| CI posture | Gate and canon workflows validate active V46 plus draft V47 | closed | Gate 1 wires `check:v47-gate1`. | Gate 1 |
| Measurement prompt traceability | Every measurement points to prompt identity, typed output, weight, and proof | closed | Later gates must audit concrete prompt registry bindings. | Gate 3+ |
| Seller visualization | Depositors see source-safe measurement and compensation basis | closed | `/deposit` renders measurements, criticality, demand, ROI, BTD potential, BTC source-to-shares preview, option roots, compensation estimates, and authority readback validated by `check:v47-gate4`. | Gate 4 |
| Buyer visualization | Readers see source-safe fit measurements and quote basis before paying | closed | `/read` renders Need coverage, Fit confidence, specificity, novelty, reuse, risk, evidence, delivery readiness, selected Fit provenance, final BTD scalar, quote basis, and settlement/rights/delivery readback validated by `check:v47-gate5`. | Gate 5 |
| Website-only launch focus | API/MCP, ChatGPT App, and Bitcode Chat are deferred commercial surfaces | accepted boundary | V47 avoids scope sprawl. | Gate 1 and Gate 2 |
| Mainnet block | Value-bearing mainnet remains blocked | accepted boundary | BTC amounts are testnet only in V47. | Gate 1+ |
| Launch route discipline | Public navigation, landing CTAs, pricing acquisition, and BTD detail paths use `/deposit`, `/read`, or `/packs` rather than `/terminal` or `/exchange` | closed | Gate 2 rewrites launch-facing entrypoints and keeps `/exchange` redirect-only. | Gate 2 |
| State-machine guards | Measurement-before-price, proof-before-state, accepted Need before Finding Fits, finality before BTD rights, BTD rights before delivery, and repair fail closed | closed | Gate 3 source object binds the guards to Deposit, Read, Packs, BTD settlement, receipts, source-to-shares, and semantic volume sources. | Gate 3 |

## Grouped closure gates

1. Scope, Testnet Semantics, Measurement Law, And Launch Freeze.
2. Feature Excess And Gate Alignment Audit.
3. Seller And Buyer State Machine Law.
4. Depositor Website Completion.
5. Reader Website Completion.
6. Packs And Auxillaries Commercial Dashboard.
7. E2E IP Selling And Buying Tests.
8. Landing Page And Public Launch Messaging.
9. Staging-Testnet Deployment Rehearsal.
10. Promotion Readiness.

## V47 accepted boundaries

- V47 is active canon; V46 is the prior promoted anchor.
- Gate 1 is specification, roadmap, and checking only.
- Testnet BTC does not weaken rights, proof, source-safety, authority, or
  delivery boundaries.
- Measurement is source-safe and visible; source remains protected until
  entitlement.
- Commercial launch scope is website-only.

## V47 completion condition

V47 Gate 1 is complete when the V47 draft spec family, roadmap, package script,
Gate 1 checker, and CI workflow hooks validate active V46 plus draft V47, and
the gate branch is committed, pushed, and pull-requested into `version/v47`.

V47 Gate 2 is complete when the V47 feature-excess audit artifact is generated,
its package object and tests pass, public launch entrypoints resolve to
current routes, deferred surfaces are classified, `/exchange` remains
compatibility-only, `/terminal` and `/conversations` direct entry are flaggable
or retained, and gate/canon workflows run `check:v47-gate2`.

V47 Gate 3 is complete when the V47 seller/buyer state-machine law artifact is
generated, its package object and tests pass, seller and buyer states are
bound to `/deposit`, `/read`, `/packs`, BTD receipts, settlement,
source-to-shares, and semantic volume sources, transition guards preserve
measurement-before-price and proof-before-state, source-safe fields and
forbidden payload classes are explicit, and gate/canon workflows run
`check:v47-gate3`.

V47 Gate 4 is complete when the V47 depositor website completion artifact is
generated, its package object and tests pass, the `/deposit` route binds
source connection before synthesis, journals option synthesis, review, and
admission as source-safe execution rows, renders decision-quality measurement,
BTD potential, BTC source-to-shares preview, compensation, and authority
views, synchronizes admitted options to `/packs`, and gate/canon workflows run
`check:v47-gate4`.

V47 Gate 5 is complete when the V47 reader website completion artifact is
generated, its package object and tests pass, the `/read` route binds Read
request initiation, Need review acceptance before Finding Fits, source-safe
fit measurement review with final BTD scalar and deterministic BTC-testnet
quote basis before payment, ordered payment observation, finality, BTD rights,
and repository PR delivery readback, and `/packs` history synchronization, and
gate/canon workflows run `check:v47-gate5`.

V47 Gate 6 is complete when the V47 packs/Auxillaries dashboard artifact is
generated, its package object and tests pass, `/packs` renders searchable
master-detail PackActivity with settlement, BTD rights, compensation,
delivery, and repair state readback, proof roots, and a fail-closed repair
surface, Auxillaries panes cover identity, source connections, interfaces,
wallet authority with histories, and organization team/treasury settings, and
gate/canon workflows run `check:v47-gate6`.

V47 Gate 7 is complete when the V47 E2E IP exchange artifact is generated,
its package object and tests pass, the browser proof sells IP on `/deposit`,
buys IP on `/read` with measurement-before-price and ordered
settlement/rights/delivery readback, audits `/packs` including the
fail-closed repair surface, runs in deterministic source-safe mock mode with
a clean browser error trap, `uapi` exposes `test:e2e:ip-exchange`, and
gate/canon workflows run `check:v47-gate7`.

V47 Gate 8 is complete when the V47 landing/public launch messaging artifact
is generated, its package object and tests pass, the landing renders the
commercial-testnet section with testnet meaning, core-flow links, and
proof-backed source-safe positioning, public docs carry the testnet-meaning
card, promoted V46 claim tokens and launch navigation remain intact, and
gate/canon workflows run `check:v47-gate8`.

Gate 10 implementation readback: the promotion readiness report
(`.bitcode/v47-promotion-readiness-report.json`) scans every required source,
documentation, and gate-artifact evidence row; each readiness evidence row is
closed when its tokens are present, its artifacts parse, and its
source-safety scan passes.

V47 Gate 9 is complete when the V47 staging-testnet rehearsal artifact is
generated, its package object and tests pass, the rehearsal lanes bind the
deployment truth sources, satisfy the realistic-data contract, rehearse the
settlement observation ordering law, keep value-bearing mainnet blocked with
dry-run lane receipts and operator opt-in live execution, and gate/canon
workflows run `check:v47-gate9`.

V47 Gate 10 is complete when the V47 promotion readiness artifact is
generated, its package object and tests pass, the V47 promotion scripts,
spec-family and runtime promotion preparation, proven generation, and
`v47-canon-promotion.yml` are wired, gate/canon workflows validate both
pointer postures, the draft-preview `BITCODE_SPEC_V47_PROVEN.md` exists, the
V47 promotion dry-run passes, and gate/canon workflows run
`check:v47-gate10`.
