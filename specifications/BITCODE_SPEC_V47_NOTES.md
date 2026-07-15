# Bitcode Spec V47 Notes

## Status

- Version: `V47`
- Canonical pointer: `BITCODE_SPEC.txt` -> `V47`
- Active canonical anchor: `BITCODE_SPEC_V47.md`
- Active generated proof appendix: `BITCODE_SPEC_V47_PROVEN.md`
- Current canonical/latest target: `V47`
- Canonical proof-source commit: `0d594d117e7d9f2065c3622dd51c0e5e5456757e`
- Prior canonical anchor: `BITCODE_SPEC_V46.md`
- Prior generated proof appendix: `BITCODE_SPEC_V46_PROVEN.md`
- V47 state: canonical promotion complete; V47 notes record accepted measurement law, launch state machines, route completions, browser proof, dashboard, messaging, staging-testnet rehearsal, and promotion-readiness evidence
- Generated structured artifact inventory: active canonical `.bitcode/v47-spec-family-report.json`, `.bitcode/v47-canonical-input-report.json`, `.bitcode/v47-canon-posture-drift-report.json`, V47 launch artifacts (`.bitcode/v47-feature-excess-alignment-audit.json`, `.bitcode/v47-seller-buyer-state-machine-law.json`, `.bitcode/v47-depositor-website-completion.json`, `.bitcode/v47-reader-website-completion.json`, `.bitcode/v47-packs-auxillaries-commercial-dashboard.json`, `.bitcode/v47-e2e-ip-selling-buying-tests.json`, `.bitcode/v47-landing-public-launch-messaging.json`, `.bitcode/v47-staging-testnet-deployment-rehearsal.json`), `.bitcode/v47-promotion-readiness-report.json`, V47 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V47_PROVEN.md` as the generated proof appendix for V47 promotion
- Source parity state: V47 source-side measurement law, seller/buyer state machines, depositor and reader route completions, packs/Auxillaries dashboard, E2E IP exchange browser proof, landing/public launch messaging, staging-testnet rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V47 file family
- Scope: V47 canonical notes for commercial website testnet launch readiness over promoted V46 protocol comprehension canon
- Last fully realized canonical target preserved in source: `V47`

## Notes companion rule

These notes accompany the V47 draft specification family. They are not stronger
than `BITCODE_SPEC_V47.md`, the active `BITCODE_SPEC.txt` pointer, or generated
proof artifacts. They record concise launch intent, user-flow emphasis,
measurement clarity, and deferrals under promoted V47 canon.

## Concise current-system reading

V45 and V46 made Bitcode's law and explanation precise enough for a final
website commercial-readiness pass. V47 should make the rich website application
deployable and demonstrable on staging-testnet across `/deposit`, `/read`,
`/packs`, and Auxillaries.

IP sellers should be able to connect source, receive deposit AssetPack options,
review source-safe measurements, approve a deposit, and track future
compensation posture. IP buyers should be able to request a Read, review a
synthesized Need, request Finding Fits, review source-safe AssetPack
measurements and quote, settle on BTC testnet, receive BTD rights, and get
repository delivery.

Measurement is the commercial center. Individual measurements, the prompts that
command them, typed output schemas, weights, normalized contributions, and
weighted BTD scalar visualization must be understandable to sellers and buyers.

## Simplified-spec reading rule

V47 should simplify launch experience, not protocol law. If a feature, route,
copy block, state, or panel does not help a seller deposit IP, a buyer buy IP,
an operator prove state, or a user understand source-safe measurement, it should
be removed, hidden, feature-flagged, or deferred.

## Deferred from V46

V46 promoted protocol comprehension and launch-facing claim readiness. It made
Bitcode explainable as a source-safe knowledge commoditization protocol across
`/packs`, `/read`, `/deposit`, public docs, operator readback, API/MCP,
ChatGPT App, Bitcode Chat, proof roots, repair states, Bitcoin/BTC settlement
language, BTD scalar-volume and rights language, GitHub delivery boundaries, compute
constraints, storage boundaries, and build/process validation.

V47 begins from the remaining question: what is still required for complete
commercial website testnet readiness. Its posture is intentionally focused:
website application first, commercial testnet semantics, exact measurement law,
feature excess audit, E2E seller/buyer proof, and promotion readiness.

## Candidate V47 workstreams

- Scope, testnet semantics, measurement law, and launch freeze.
- Feature excess and gate alignment audit: launch CTAs and public navigation
  point to `/deposit`, `/read`, and `/packs`; `/exchange` is compatibility
  redirect only; `/terminal` and `/conversations` are retained or flaggable
  direct workspaces; deferred commercial surfaces stay out of launch.
- Seller and buyer state machine law: sellers move source connection, option
  synthesis, source-safe measurement review, Depository admission approval,
  and compensation/repair tracking; buyers move Read request, Need review,
  Finding Fits, source-safe preview, BTC-testnet settlement, BTD rights, and
  delivery under measurement-before-price and proof-before-state guards.
- Depositor Website Completion: the `/deposit` route owns a five-step session
  (connect source, synthesize options, review options, submit deposit, read
  Depository state) and journals `pipeline:deposit-option-synthesis`,
  `pipeline:deposit-option-review`, and `pipeline:deposit-option-admission`
  as source-safe execution rows; sellers see measurements, criticality,
  demand, ROI, BTD potential, BTC source-to-shares preview, option roots,
  compensation estimates, and organization/wallet authority before and after
  approval, with admitted options synchronized to `/packs`.
- Reader Website Completion: the `/read` route owns a five-step session
  (request Read, review synthesized Need, request Finding Fits, review
  synthesized AssetPack, buy and settle) and renders a source-safe
  fit measurement review (Need coverage, Fit confidence, specificity, novelty,
  reuse, risk, evidence, delivery readiness, selected Fit provenance, final
  BTD scalar, BTC-testnet quote basis) before payment; payment observation,
  finality, BTD rights receipt, and repository PR delivery read back in
  fail-closed order, with Reading activity and settled AssetPacks reachable
  through `/packs`.
- Packs And Auxillaries Commercial Dashboard: `/packs` is a searchable
  master-detail surface over deposit, Read, settlement, BTD rights,
  compensation, delivery, and repair histories with proof-root readback and a
  fail-closed repair surface; Auxillaries panes cover identity profile,
  external source connections, interfaces, wallet authority with BTD history
  readback, and organization team and treasury settings.
- E2E IP Selling And Buying Tests: a deterministic browser proof sells IP on
  `/deposit` (source connection, option synthesis, measurement review,
  admission, journaled rows), buys IP on `/read` (fit measurement review,
  final BTD scalar, BTC-testnet quote basis, then observation, finality, BTD
  rights, and PR delivery readback in order), and audits `/packs` state
  readback and the fail-closed repair surface.
- Landing Page And Public Launch Messaging: the landing renders a
  Commercial testnet section explaining that BTC amounts are testnet and free while
  protocol behavior stays production-intended, documents the deposit → read →
  packs core flow with route links, and states proof-backed trust and
  source-safe IP exchange positioning; public docs carry the testnet-meaning
  card; promoted V46 claim tokens stay intact.
- Staging-Testnet Deployment Rehearsal: four dry-run lanes bind the
  deployment truth sources (Vercel host, Supabase database/ledger,
  object storage, long-runner, BTC-testnet provider), satisfy the
  realistic-data contract minimums, rehearse the settlement ordering law
  (observation, finality, rights, delivery), and keep value-bearing mainnet
  blocked; live deployment execution stays operator opt-in.
- Gate 10: V47 Promotion Readiness: the readiness report
  (`.bitcode/v47-promotion-readiness-report.json`) binds all Gate 2-9
  artifacts, the V47 promotion scripts, `v47-canon-promotion.yml`, gate/canon
  workflow posture, the draft-preview `BITCODE_SPEC_V47_PROVEN.md`, and the
  prepared post-promotion active V47 / draft V48 posture; promotion stays
  blocked until every evidence row passes.

## Non-goals during V47 opening

- Do not implement product behavior until a scoped V47 gate authorizes it.
- Do not rewrite V46 promoted canon except through explicit V47 draft law and
  accepted parity.
- Do not expose raw source, unpaid AssetPack source, secrets, wallet private
  material, private settlement payloads, raw prompts, or raw provider responses.
- Do not collapse estimate, quote, observed payment, final settlement,
  contributor allocation, delivery, compensation, and repair states.
- Do not commercialize API/MCP, ChatGPT App, or Bitcode Chat in V47.
- Do not launch value-bearing mainnet settlement in V47.
