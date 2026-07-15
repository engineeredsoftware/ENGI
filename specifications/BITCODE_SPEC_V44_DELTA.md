# Bitcode Spec V44 Delta

## Status

- Version: `V44`
- V44 state: canonical promotion complete; this delta records the promoted V43-to-V44 scaled engineering economy closure set
- Current canonical/latest target: `V44`
- Canonical proof-source commit: `2b08d07590269150d7a8ad658fe97dd99c05616d`
- Prior canonical anchor: `BITCODE_SPEC_V43.md`
- Prior generated proof appendix: `BITCODE_SPEC_V43_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v44-spec-family-report.json`, `.bitcode/v44-canonical-input-report.json`, `.bitcode/v44-canon-posture-drift-report.json`, `.bitcode/v44-economic-domain-model.json`, `.bitcode/v44-packs-portfolio-market-intelligence.json`, `.bitcode/v44-reading-budget-quote-policy.json`, `.bitcode/v44-depositor-earnings-supply-opportunities.json`, `.bitcode/v44-btd-btc-compensation-statements.json`, `.bitcode/v44-organization-policy-wallet-authority.json`, `.bitcode/v44-enterprise-product-ux.json`, `.bitcode/v44-scaled-network-rehearsal.json`, `.bitcode/v44-promotion-readiness-report.json`, V44 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V44_PROVEN.md` as the generated proof appendix for V44 promotion
- Source parity state: V44 source-side economic domain, Packs portfolio market intelligence, Reading budget/quote policy, depositor earnings opportunity, BTD/BTC compensation statements, organization policy and wallet authority, enterprise UX, scaled rehearsal, workflow, and promotion surfaces are canonicalized in the promoted V44 file family
- Notes companion: `BITCODE_SPEC_V44_NOTES.md`
- Delta companion: `BITCODE_SPEC_V44_DELTA.md`
- Parity companion: `BITCODE_SPEC_V44_PARITY_MATRIX.md`
- Scope: V44 canonical delta for scaled engineering economy over promoted V43 product-route canon
- Last fully realized canonical target preserved in source: `V43`

## Why V44 exists

V43 made the product routes intelligible: AssetPacks in through `/deposit`,
AssetPacks out through `/read`, and PackActivity inspection through `/packs`.
V44 exists because an enterprise-grade Bitcode network must operate at scale:
many departments, budgets, repositories, deposit options, Reads, Fits, quotes,
settlements, contributors, compensation statements, and repair states.

## Accepted V44 decisions

- Treat scaled economic operation as the next draft target over V43.
- Keep V43 route law: `/packs`, `/read`, and `/deposit` remain the default
  product surfaces.
- Name every economic field as estimate, quote, observed payment, final
  settlement, contributor allocation, delivery, or repair state.
- Keep source-safety stronger than UX convenience.
- Keep value-bearing mainnet blocked until a later explicit launch version.
- Bind Gate 2 economic contracts in package code before route/API/UI surfaces
  consume portfolio, quote, settlement, compensation, governance, or repair
  objects.
- Treat promoted source-of-truth hierarchy prose as protocol law: stale
  active/draft wording after promotion is a canon-posture defect and must fail
  promoted spec-family validation.

## V44 gate plan

1. Gate 1 Scaled Engineering Economy Roadmap Opening.
2. Gate 2 Economic Domain Model And Receipt Taxonomy.
3. Gate 3 Packs Portfolio Search And Market Intelligence.
4. Gate 4 Reading Budget, Quote Policy, And Procurement Governance.
5. Gate 5 Depositor Earnings, ROI, And Supply Opportunity Intelligence.
6. Gate 6 BTD/BTC Accounting And Contributor Compensation Statements.
7. Gate 7 Organization Policy, Approval, And Wallet Authority.
8. Gate 8 Enterprise Product UX For Economic Operation.
9. Gate 9 Scaled Local/Staging Network Rehearsal.
10. Gate 10 Promotion Readiness.

## Explicitly deferred

V44 Gate 1 defers implementation of portfolio dashboards, economic statement
APIs, budget policy engines, compensation statement materialization, governance
runtime enforcement, scaled rehearsal scripts, and V44 promotion workflow until
their owning gates.

V44 Gate 2 closes the source-safe economic domain model and receipt taxonomy
only. It does not implement route dashboards, quote engines, settlement
observation, compensation payout execution, organization wallet authority, or
scaled rehearsals.

V44 Gate 3 closes `/packs` portfolio and market intelligence over the existing
PackActivity source-safe API. It does not implement quote approval, payment
observation, contributor payouts, wallet authority, or scaled rehearsals.

V44 Gate 4 closes `/read` budget and quote governance around source-safe
AssetPack previews. It does not observe payment, transfer BTD rights, execute
contributor payouts, or admit value-bearing mainnet operation.

V44 Gate 5 closes `/deposit` depositor earning and supply opportunity
intelligence over source-safe deposit options. It does not execute payout,
mint BTD, disclose protected source, or convert estimated compensation ranges
into final settlement truth.

V44 Gate 6 closes BTD/BTC/source-to-shares compensation statements over the
settlement rights delivery boundary. It projects BTD range state, BTC
settlement observations, contributor allocations, depositor earning summaries,
treasury routes, reconciliation, and repair posture into source-safe `/packs`
accounting readback. It does not disclose unpaid source, serialize wallet
private material, execute payout, or admit value-bearing mainnet operation.

V44 Gate 7 closes source-safe organization policy and wallet authority over
Reading, Depositing, and Packs inspection. It adds BTD deposit option
synthesis, approval, and submission authority actions; package-backed
`OrganizationPolicyWalletAuthority`; `/read` spend and wallet approval
readback; `/deposit` source criticality, deposit approval, and wallet authority
readback; `/packs` searchable governance readback; deterministic
`.bitcode/v44-organization-policy-wallet-authority.json`; and `check:v44-gate7`.
It does not disclose protected source, serialize wallet private material,
execute value-bearing mainnet movement, or let policy bypass Need review,
Finding Fits, settlement, BTD rights transfer, delivery, or source-to-shares
law.

V44 Gate 8 closes enterprise product UX for economic operation. It adds
package-backed `V44EnterpriseProductUx`; deterministic
`.bitcode/v44-enterprise-product-ux.json`; shared
`ProductRouteEnterpriseSummary`, `ProductRouteKeyboardHint`, and
`ProductRouteProofDetail` primitives; `/packs` enterprise economy overview,
keyboard navigation, sticky dense activity table, and expandable proof detail;
`/read` Reading economy overview and route/procurement/authority proof detail;
`/deposit` Depositing economy overview and synthesis/policy/admission/earning/
authority proof detail; focused route tests; and `check:v44-gate8`. It does
not disclose protected source, raw source text, unpaid AssetPack source, raw
prompts, provider payloads, credentials, wallet private material, private
settlement payloads, or value-bearing mainnet operation.

V44 Gate 9 closes scaled local/staging network rehearsal. It adds
package-backed `V44ScaledNetworkRehearsal`; deterministic
`.bitcode/v44-scaled-network-rehearsal.json`; `rehearse:v44-scaled-network`;
source-safe local and staging-testnet operator receipts; exact rehearsal scale
of 24 deposits, 18 Reads, 72 Fit candidates, 18 quotes, 12 BTC settlement
observations, 36 contributors, 8 repair cases, and 54 PackActivity rows; the
staging-testnet Supabase project ref `tkpyosihuouusyaxtbau`; and
`check:v44-gate9`. It does not serialize secret values, protected source, raw
source text, unpaid AssetPack source, raw prompts, provider payloads, wallet
private material, private settlement payloads, live rehearsal log payloads, or
value-bearing mainnet operation.

## Gate 10: V44 Promotion Readiness

V44 Gate 10 closes promotion readiness. It adds package-backed
`V44PromotionReadinessReport`; deterministic
`.bitcode/v44-promotion-readiness-report.json`;
`generate:v44-promotion-readiness`, `check:v44-promotion-readiness`, and
`check:v44-gate10`; `v44-canon-promotion.yml`; generated PROVEN support for
`BITCODE_SPEC_V44_PROVEN.md`; and promotion scripts support V44. It binds all
V44 source-safe artifacts, gate/canon workflow posture, promotion workflow
posture, package exports, protocol tests, and active V44 / draft V45 runtime
preparation. It does not serialize credentials, protected source, unpaid
AssetPack source, raw prompts, provider payloads, wallet private material,
private settlement payloads, live logs, or value-bearing mainnet operation.

## Pre-Implementation Sequence

1. Open V44 spec family, roadmap, checker, package script, workflow posture,
   and documentation.
2. Implement economic domain model and receipt taxonomy for source-safe
   portfolio, quote, statement, governance, and repair objects.
3. Extend `/packs` into portfolio analytics, search, and market intelligence.
4. Add Reading budget policy, quote policy, and procurement governance.
5. Add deposit revenue, demand, ROI, and supply opportunity readback.
6. Add BTD/BTC/source-to-shares compensation statements and reconciliation.
7. Add organization policy, approval, spend authority, and wallet authority.
8. Polish enterprise economy UX and operator dashboards.
9. Rehearse scaled many-pack local/staging-testnet economic operation.
10. Close V44 promotion readiness and prepare active V44 / draft V45 posture.

## Validation direction

Gate 1 validates with `pnpm run check:v44-gate1`. Gate 2 validates with
`pnpm run generate:v44-economic-domain-model`,
`pnpm run check:v44-economic-domain-model`, and `pnpm run check:v44-gate2`.
Gate 3 validates with
`pnpm run generate:v44-packs-portfolio-market-intelligence`,
`pnpm run check:v44-packs-portfolio-market-intelligence`, and
`pnpm run check:v44-gate3`.
Gate 4 validates with `pnpm run generate:v44-reading-budget-quote-policy`,
`pnpm run check:v44-reading-budget-quote-policy`, and
`pnpm run check:v44-gate4`.
Gate 5 validates with
`pnpm run generate:v44-depositor-earnings-supply-opportunities`,
`pnpm run check:v44-depositor-earnings-supply-opportunities`, and
`pnpm run check:v44-gate5`.
Gate 6 validates with
`pnpm run generate:v44-btd-btc-compensation-statements`,
`pnpm run check:v44-btd-btc-compensation-statements`, and
`pnpm run check:v44-gate6`.
Gate 7 validates with
`pnpm run generate:v44-organization-policy-wallet-authority`,
`pnpm run check:v44-organization-policy-wallet-authority`, and
`pnpm run check:v44-gate7`.
Gate 8 validates with `pnpm run generate:v44-enterprise-product-ux`,
`pnpm run check:v44-enterprise-product-ux`, and `pnpm run check:v44-gate8`.
Gate 9 validates with `pnpm run generate:v44-scaled-network-rehearsal`,
`pnpm run check:v44-scaled-network-rehearsal`,
`pnpm run rehearse:v44-scaled-network -- --lane local --json`,
`pnpm run rehearse:v44-scaled-network -- --lane staging-testnet --json`, and
`pnpm run check:v44-gate9`.
Gate 10 validates with `pnpm run generate:v44-promotion-readiness`,
`pnpm run check:v44-promotion-readiness`, `pnpm run check:v44-gate10`, and
`node scripts/promote-bitcode-canon.mjs --version V44 --commit HEAD --dry-run`.
Shared draft posture validates with
`node scripts/check-bitcode-spec-family.mjs --version V44 --mode draft --current-target V43`,
`node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V43 --draft-target V44`,
and `git diff --check`.

## Commit-Body Direction

V44 commit bodies should name the closed gate, generated artifacts or proof
surfaces touched, source-safety posture, validation commands, accepted
boundaries, and any deferred economic implementation work. They should not use
temporary `wip` wording for closed gate work.
