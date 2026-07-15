# Bitcode Spec V48 Delta

## Status

- Version: `V48`
- V48 state: draft delta for Gate 3 synthesis pipeline correctness and full-stack single-canon rebuild authority
- Current canonical/latest target: `V47`
- Prior canonical anchor: `BITCODE_SPEC_V47.md`
- Prior generated proof appendix: `BITCODE_SPEC_V47_PROVEN.md`
- Generated structured artifact inventory: draft V48 family reports and Gate 3 depositing evidence
- Source parity state: V48 Gate 3 deltas over V47 commercial website law are specified for rebuild
- Notes companion: `BITCODE_SPEC_V48_NOTES.md`
- Spec companion: `BITCODE_SPEC_V48.md`
- Parity companion: `BITCODE_SPEC_V48_PARITY_MATRIX.md`


## Why V48 exists

V45 made Bitcode's knowledge commoditization law precise. V46 made that law
commercially legible. V48 exists to make the website application commercially
ready on staging-testnet: IP sellers can deposit AssetPacks, IP buyers can buy
Need-fitting AssetPacks, and `/packs` plus Auxillaries make the whole exchange
auditable, source-safe, and repairable.

V48 is not a broad feature expansion. It is the first generally available MVP
launch-readiness version and therefore must freeze scope, remove or defer
feature excess, specify measurement law, prove seller and buyer state machines,
and validate the website E2E.

## Accepted V48 decisions

- V48 focuses on the rich website application: `/deposits`, `/reads`, `/packs`,
  and Auxillaries.
- In V48, testnet means BTC amounts and payment observations are testnet only;
  all other protocol behavior should be production-intended.
- Measurement is the basis of IP commoditization: individual measurements,
  inference prompts, typed outputs, weights, normalized contributions, BTD
  scalar formula, and source-safe visualization are launch-critical.
- V48 must support two profiles: IP sellers and IP buyers.
- Conversation experiences, ChatGPT App commercialization, MCP/API
  commercialization, deeper BTD mining cryptography, mainnet launch authority,
  and advanced market mechanics are deferred.
- A dedicated feature-excess gate must remove, hide, or flag anything that
  distracts from the launch MVP.
- A dedicated E2E gate must prove selling and buying IP the Bitcode way.
- A dedicated public launch messaging gate must refurbish the landing page for
  V48 commercial testnet readiness.
- **Frontend component architecture (V48 implementation quality workstream on
  `version/v48`):** three layers (`Shadcn*` → `Bitcode*` → seven experiences),
  components under `apps/uapi/components/{shadcn,bitcode,marketing,packs,reads,
  deposits,docs,conversations,auxillaries}`, Pipeline product naming over
  Execution/product UI names, generalizable utilities package-first, legacy
  `/packs` eradicated (deleted). Spec updates and implementation land
  together as `(spec-impl)` commits.
- **Deposit + Packs modularization (Phase 4 continue):** pure deposit models
  (activity ledger, demand, criticality, route-input builder, run status) and
  hooks (live runs, demand, URL nav, network count); Packs portfolio/master/
  detail units; thin page shells. Rebuild law restated in SPEC G3-14 / G3-14a.
  Continues until every deposit-touched module is SRP modular.
- **Deposit SDIVF full rebuild law in SPEC (2026-07):** Gate 3 measurement law
  and G3-1…G3-15 fully restate SynthesizeDepositAssetPacks (no lens): Setup
  clone → parallel {LSP, MCP, obfuscations} → danger-wall; Discovery parallel
  three agents with measure-inside-codebase; AssetPack = patch + measurements +
  metadata; full `ASSET_PACK_ABSOLUTES_CATALOG`; single Validation ready-to-finish
  A/B/C; Finish store → ledgerize (journal) → selection envelope; complete
  Execution store index and schemas; one roster key per agent; sourceCheckoutCatalog
  naming. Non-canonical companions (`ASSET_PACKS.md`, README, FAMILIARIZATION)
  may summarize only — SPEC must stand alone for Complete Implementation
  Derivability (`BITCODE_SPECIFYING.md`).

## Explicitly deferred

- Value-bearing mainnet settlement.
- Commercial launch of API/MCP, ChatGPT App, and Bitcode Chat.
- Full Conversations web-app commercialization (structure may be cleaned; full
  experience ships post-V48).
- Deeper BTD mining cryptographic implementation beyond existing website
  launch contracts.
- Advanced exchange/market mechanics beyond the MVP seller/buyer AssetPack
  flows.
- Source-bearing preview before BTC-testnet settlement and BTD rights transfer.
- Blind rename of low-level `execution-generics` / PTRR executor packages
  (agent Execution ≠ product Pipeline).
- HTTP path renames for `/api/executions/*` until external consumers are
  audited (internal Pipeline naming proceeds first).

## Pre-Implementation Sequence

1. Open the V48 draft spec family over active V46.
2. Specify testnet semantics, measurement law, launch freeze, user profiles,
   and gate plan.
3. Audit feature excess and gate misalignment.
4. Specify seller/buyer state machines and measurement visualizations.
5. Implement and test depositor website completion.
6. Implement and test reader website completion.
7. Complete `/packs` and Auxillaries commercial dashboard state.
8. Prove E2E IP selling and buying tests.
9. Rehearse canonical staging-testnet deployment.
10. Promote V48 only after commercial website launch-readiness evidence is
    complete.

## Commit-Body Direction

V48 commits should describe the commercial launch behavior, the measurement or
state-machine proof they close, the commands run, and any feature flags or
deferrals introduced. Commit bodies should name source-safety, measurement,
testnet semantics, proof/readback, and user-flow consequences when relevant.

## Gate 1: V48 Scope, Testnet Semantics, Measurement Law, And Launch Freeze

Gate 1 closes when the V48 spec family exists over active V46, V48 is framed as
commercial website testnet launch readiness, testnet means only BTC amounts are
testnet/free, measurement law is explicit, seller and buyer flows are named,
the ten-gate launch plan is recorded, package and workflow checks exist, and no
V48 file claims promoted authority.

## Gate 2: Feature Excess And Gate Alignment Audit

Gate 2 audits all website features and protocol surfaces for launch relevance.
It removes wrong features, feature-flags post-V48 behavior, and records
deferrals so the first generally available MVP is focused.

Gate 2 owns `.bitcode/v48-feature-excess-alignment-audit.json`,
`buildV48FeatureExcessAlignmentAudit`, and `check:v48-gate2`. The audit
classifies `/deposits`, `/reads`, and `/packs` as launch routes; `/docs`,
Auxillaries, `/btd/[assetPackId]`, execution readback, and required APIs as
supporting surfaces; and `/packs` direct product entry, `/conversations`
direct commercial launch, `/exchange` direct product entry, `/orbitals`,
`/edgetimes`, `/demo-video`, API/MCP commercialization, ChatGPT App
commercialization, Bitcode Chat commercialization, value-bearing mainnet, and
advanced market mechanics as deferred or compatibility-only.

## Gate 3: Seller And Buyer State Machine Law

Gate 3 specifies exact IP seller and IP buyer state machines, including
measurement, proof, repair, settlement, delivery, and `/packs` history.

Gate 3 owns `.bitcode/v48-seller-buyer-state-machine-law.json`,
`buildV48SellerBuyerStateMachineLaw`, and `check:v48-gate3`. The state-machine
law names seller states from source connection through compensation/repair
tracking; buyer states from Read request through delivery; guards for
measurement-before-price, proof-before-state, accepted Need before Finding
Fits, quote-before-settlement, BTC finality before BTD rights, BTD rights
before source delivery, `/packs` projection, and fail-closed repair; and the
source-safe fields that may be projected without source leakage.

## Gate 4: Depositor Website Completion

Gate 4 completes source connection, deposit AssetPack option synthesis,
source-safe review, Depository admission, and compensation visibility.

Gate 4 owns `.bitcode/v48-depositor-website-completion.json`,
`buildV48DepositorWebsiteCompletion`, and `check:v48-gate4`. The completion
binds the five-step `/deposits` route session (`connect-source`,
`synthesize-options`, `review-options`, `submit-deposit`,
`read-depository-state`) to journaled source-safe execution rows for
`pipeline:deposit-option-synthesis`, `pipeline:deposit-option-review`, and
`pipeline:deposit-option-admission`; renders seller visualization of the
measurement catalog, criticality, demand, ROI, BTD potential, BTC
source-to-shares preview, and option roots before approval; records approve,
reject, and resynthesis decisions with admission readback synchronized to
`/packs`; and exposes compensation estimates, supply recommendations, and
organization/wallet authority state as source-safe metadata only, with no
protected source, unpaid AssetPack source, raw prompts, raw provider
responses, wallet private material, or value-bearing mainnet authority.

## Gate 5: Reader Website Completion

Gate 5 completes Read Request, Need synthesis/review, Finding Fits, preview,
quote, BTC-testnet settlement, BTD rights transfer, and PR delivery.

Gate 5 owns `.bitcode/v48-reader-website-completion.json`,
`buildV48ReaderWebsiteCompletion`, and `check:v48-gate5`. The completion
binds the five-step `/reads` route session (`request-read`,
`review-synthesized-need`, `request-fit`, `review-synthesized-asset-pack`,
`buy-asset-pack-settle`) to a source-safe fit measurement review rendering
Need coverage, Fit confidence, specificity, novelty, reuse, risk, evidence,
delivery readiness, selected Fit provenance, final BTD scalar, and the
deterministic BTC-testnet quote basis before any payment; orders payment
observation, BTC-testnet finality, BTD rights transfer receipt, and
repository PR delivery as fail-closed readback with source-bearing delivery
locked until rights transfer; keeps Reading activity and settled AssetPacks
reachable through `/packs`; and exposes everything as source-safe metadata
only, with no protected source, unpaid AssetPack source, raw prompts, raw
provider responses, wallet private material, or value-bearing mainnet
authority.

## Gate 6: Packs And Auxillaries Commercial Dashboard

Gate 6 completes identity, teams, wallets, histories, PackActivity
master-detail, filters/search, proof readback, and repair surfaces.

Gate 6 owns `.bitcode/v48-packs-auxillaries-commercial-dashboard.json`,
`buildV48PacksAuxillariesCommercialDashboard`, and `check:v48-gate6`. The
dashboard law binds `/packs` to a searchable master-detail PackActivity
surface with type/state facets and saved market-intelligence filters; the
detail surface reads back overview, measurements, settlement, BTD rights,
compensation, delivery, and repair states, accounting, governance, and proof
roots, with rights states derived only from finality-consistent
commodity-state evidence and a fail-closed repair surface listing
commodity-state blockers; and binds Auxillaries to identity profile, external
source connections, interfaces, wallet authority with BTD history readback,
and organization team and treasury settings — all as source-safe metadata
only, with no protected source, unpaid AssetPack source, raw prompts, raw
provider responses, wallet private material, or value-bearing mainnet
authority.

## Gate 7: E2E IP Selling And Buying Tests

Gate 7 adds browser-level tests proving both sides of Bitcode: deposit IP into
Bitcode, buy synthesized IP from Bitcode, and verify ledger/database/storage,
proof, settlement, rights, compensation, and delivery.

Gate 7 owns `.bitcode/v48-e2e-ip-selling-buying-tests.json`,
`buildV48E2eIpSellingBuyingTests`, and `check:v48-gate7`. The browser proof
(`apps/uapi/tests/e2e/commercial-mvp.ip-exchange.spec.ts`, run by
`test:e2e:ip-exchange`) drives `/deposits` from source connection through
option synthesis, source-safe measurement review, and Depository admission
with journaled execution rows; drives `/reads` through the five-step buyer
session asserting the fit measurement review, final BTD scalar, deterministic
BTC-testnet quote basis, and the ordered payment observation, finality, BTD
rights receipt, and repository PR delivery readback; and audits `/packs`
master-detail state readback and the fail-closed repair surface. The proof
runs in deterministic mock mode with a stateful execution-history journal and
a browser error trap, asserts source-safe metadata only, and never exercises
value-bearing mainnet behavior.

## Gate 8: Landing Page And Public Launch Messaging

Gate 8 refurbishes landing and public docs for V48 commercial testnet
readiness, core flows, proof-backed trust, source-safe IP exchange, and the
meaning of testnet.

Gate 8 owns `.bitcode/v48-landing-public-launch-messaging.json`,
`buildV48LandingPublicLaunchMessaging`, and `check:v48-gate8`. The landing
gains a commercial-testnet section (`MarketingLandingTestnetSection` over
`BITCODE_PUBLIC_COPY.testnetLaunch`) stating that BTC amounts are testnet and
free while measurements, quotes, settlement ordering, BTD rights, and
repository delivery stay production-intended; documenting the deposit → read
→ packs core flow with launch-route links; and carrying proof-backed trust
and source-safe IP exchange positioning. Public docs gain the
`testnet-meaning` card with the blocked value-bearing mainnet posture. The
messaging is additive over promoted V46 claim boundaries: required V46 copy
tokens and `/deposits`, `/reads`, `/packs` launch navigation remain intact, and
no surface claims mainnet authority or source visibility.

## Gate 9: Staging-Testnet Deployment Rehearsal

Gate 9 validates the canonical staging-testnet deployment with realistic data,
real routes, real storage/database/ledger projections, and BTC-testnet
settlement.

Gate 9 owns `.bitcode/v48-staging-testnet-deployment-rehearsal.json`,
`buildV48StagingTestnetDeploymentRehearsal`, and `check:v48-gate9`. The
rehearsal law binds four dry-run lanes — staging-testnet full stack,
realistic-data population, BTC-testnet settlement observation, and blocked
value-bearing mainnet — to the deployment truth sources (vercel.json,
supabase config and migrations, long-runner Dockerfiles and Kubernetes
manifest, the uapi build and browser-proof commands). The realistic-data
contract sets explicit minimums across deposits, admissions, Reads, accepted
Needs, previews, quotes, settlement observations, finality confirmations,
BTD rights transfers, repository PR deliveries, compensation statements, and
repair cases. Settlement observation rehearses the production ordering law
(observation → finality → rights → delivery). Lane receipts are dry-run with
live deployment execution as operator opt-in; no live service credentials,
protected source, or value-bearing mainnet authority are serialized.

## Gate 10: V48 Promotion Readiness

Gate 10 closes parity matrix, generated proof artifacts, CI/promotion workflow,
commercial website readiness, and canonical promotion.

Gate 10 owns `.bitcode/v48-promotion-readiness-report.json`,
`buildV48PromotionReadinessReport`, and `check:v48-gate10`. The
promotion scripts support V48: `promote-bitcode-canon.mjs` gains the V48 command plan
and derived commit-message body, `prepare-bitcode-spec-family-promotion.mjs`
gains the V48 promoted-family rewrite, the runtime promotion preparation
prepares the next draft, `proven-generator.js` gains the V48 proven package,
and `v48-canon-promotion.yml` validates and promotes `version/v48` into
`main`. Gate/canon workflows validate both the V46 pre-promotion and V48
post-promotion pointer postures, and the readiness report fails closed when
any Gate 2-9 artifact, workflow, script, documentation token, or source-safety
boundary is missing.
