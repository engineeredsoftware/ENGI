# Bitcode Spec V28 Delta

## Status

- Version: `V28`
- V28 state: canonical promotion complete; this delta records the promoted V27-to-V28 commercial Protocol, Terminal MVP, Reading pipeline, and promotion-proof closure set
- Current canonical/latest target: `V28`
- Canonical proof-source commit: `1153286d0785b0d760ea392918575f0083cd570f`
- Prior canonical anchor: `BITCODE_SPEC_V27.md`
- Prior generated proof appendix: `BITCODE_SPEC_V27_PROVEN.md`
- Generated structured artifact inventory: active canonical `.bitcode/v28-spec-family-report.json`, `.bitcode/v28-canonical-input-report.json`, `.bitcode/v28-canon-posture-drift-report.json`, V28 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V28_PROVEN.md` as the generated proof appendix for V28 promotion
- Source parity state: V28 source-side Protocol, Terminal, Reading pipeline, MCP/ChatGPT App, proof, workflow, and promotion surfaces are canonicalized in the promoted V28 file family
- State: draft target delta opened
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V27`
- Scope: V28 canonical delta for commercial Protocol implementation, Terminal MVP QA, MCP API and ChatGPT App MVP readiness, Reading pipeline product gates, and promotion-proof metadevelopment after V27 tokenomics and crypto-commercial rails
- Spec companion: `BITCODE_SPEC_V28.md`
- Notes companion: `BITCODE_SPEC_V28_NOTES.md`
- Parity companion: `BITCODE_SPEC_V28_PARITY_MATRIX.md`
- Generated proof appendix: none until V28 promotion

This DELTA records what V28 intends to change relative to V27.
V28 starts as a draft family only.

## Why V28 Exists

V27 closed the core `$BTD` law and minimum practical crypto rails:

- 21,000,000-cell non-fungible `$BTD` registry;
- AssetPack ranges as commercial units;
- measureminting decay;
- zero-cell/refit tail receipts;
- owner-read and licensed-read separation;
- BTC as the fee asset;
- wallet signer-session and BTC fee receipt primitives;
- ledger anchor, minimal Exchange, Terminal journal, reconciliation, telemetry, and upgrade primitives.

Those primitives are technically coherent but not yet commercially Protocol-operable through Terminal and the first interface surfaces.
V28 exists to make the active Protocol/Terminal surfaces commercially MVP-readable, with Auxillaries readiness cleanup, MCP API, ChatGPT App, BTD-AssetPack minting, realistic testnetting, wallet/BTC flow, and demonstration-to-commercial package separation treated as first-class QA work before deeper Terminal expansion.
Exchange and website Conversations are no longer V28 closure work.

## Delta Contract

V28 changes Bitcode by turning V27's package/API/receipt primitives into commercial Protocol/Terminal MVP workflows.

V28 must make all of these implementation-derivable:

- commercial route QA across Terminal, Auxillaries, BTD range disclosure, MCP API, ChatGPT App, auth/readiness, wallet/BTC/testnet paths, and navigation;
- Auxillaries contained tabs-left experience with old orbital style conflicts removed from active paths;
- Exchange and website Conversations disabled or hidden for V28 QA and deferred beyond V35;
- route-level flags disable direct Exchange and website Conversations entry during V28 QA;
- Terminal wallet readiness and signer-session review;
- BTC fee transaction preparation, signing, broadcast, finality, and failure display;
- Read review and Fit review as explicit pre-settlement boundaries;
- realistic synthetic measurement receipts, BTD-AssetPack minting, ledgerized journal rows, and projection/reconciliation readback in testnet-ready lanes;
- measureminting entitlement and zero-cell/refit posture in the operator flow;
- AssetPack range details from registry state;
- owner-read/licensed-read/denied access decision surfaces;
- Terminal journal diff and ledger/database reconciliation detail;
- organization/team/read-license readiness from registry-derived facts;
- MCP API and ChatGPT App action gates based on range/read-license/policy truth;
- operational health over deployment lanes, telemetry, upgrades, migrations, and rollback state;
- commercial package/UAPI implementations that no longer depend on runtime imports from `protocol-demonstration/`;
- honest connected-provider readiness while broader provider/interface work remains staged beyond V28.

V28 must not:

- introduce versioned implementation routes;
- redefine `$BTD` supply;
- make `$BTD` a fee or spend token;
- rely on compatibility aggregate balances as canonical range ownership;
- approve value-bearing mainnet launch without operational approval;
- include Exchange or website Conversations in V28 closure.

## Research-Informed Chain Boundary

The BitVM/Taproot/BNB/Binance research is incorporated as V28 planning guidance:

- Bitcoin Taproot, PSBT, BIP340/BIP341/BIP342, and wallet-controlled signing remain V28's practical cryptographic center.
- BitVM is compatible with Taproot and useful for future Bitcoin-side bridge research, but it is not a V28 production dependency.
- BSC/opBNB/BEP-20/Binance Web3 Wallet pilots are future bridge/distribution work; they do not define the V28 `$BTD` chain of record.
- BNB Chain is EVM-compatible and therefore bridge-mediated for Taproot/BitVM truth rather than a native Taproot execution lane.
- V28 may expose disabled or documentation-only readiness for BSC/opBNB/Binance pilots, but must not imply live public BTD deployment on those chains unless a proof-bound testnet artifact exists.

## Accepted V28 decisions

- V28 is commercial Protocol/Terminal MVP first.
- V27 remains active canon during V28 drafting.
- V28 productizes V27 primitives rather than redefining tokenomics.
- Terminal, Auxillaries, BTD disclosure, MCP API, and ChatGPT App read models must be registry-derived where they speak about `$BTD`, fees, rights, or readiness.
- UAPI route implementations remain unversioned.
- Source implementation names remain unversioned and ungated unless explicitly required for a bounded compatibility artifact; V28 must not introduce route, file, stylesheet, constant, class, or test names such as `api/v1`, `v27-*`, `first-gate-*`, or `wip-*`.
- value-bearing mainnet remains separately approval-gated.
- User-facing Terminal vocabulary is now Deposit/Depositing and Read/Reading. Retired Deposit/Depositing and Read/Reading language may survive only in compatibility carriers such as persisted enum values, route names, schema fields, proof IDs, and filenames until a separately specified migration replaces those carriers.
- V28 Terminal QA order is Deposit first, then Read/Fit. Read/Fit acceptance is not meaningful until a repository/branch/commit source deposit or equivalent source posture exists as candidate supply.

## Explicitly deferred

- V29 owns deeper Terminal workflows beyond MVP QA.
- V30 is reserved for post-V29 Protocol/BTD hardening discovered during V28/V29; Exchange moves beyond V35.
- V31 owns deeper Auxillaries beyond V28 active-shell cleanup.
- V32 owns deeper provation and testing.
- V33 owns deeper Interfaces beyond the V28 MCP API and ChatGPT App MVP.
- V34 owns deeper Deployment, including host capabilities, real executions, distributed compute, runtime/storage expectations, and canonical-promotion CI/CD.
- V35 owns deeper telemetry and documenting across internal codebase docs plus public `/docs` usage material.
- V36+ owns deeper Exchange and website Conversations work after V35 telemetry/documenting.
- broad Exchange market depth, wrappers, liquidity, advanced market flows, and website Conversations remain out of V28.
- final legal templates may be drafted in V28 but broader legal-product expansion is not a promotion blocker unless Terminal copy claims rights that are not policy-bound.

## Pre-Implementation Sequence

1. Confirm V27 active pointer and V28 draft target.
2. Close V28 Gate 1 by synchronizing SPEC, DELTA, NOTES, PARITY, posture carriers, and route scans.
3. Close commercial Protocol/Terminal MVP QA baseline across primary routes.
4. Clean Auxillaries active shell to the contained tabs-left model.
5. Build Terminal wallet, BTC fee, Read/Fit, synthetic measurement, BTD-AssetPack minting, range, read-right, journal, ledgerization, and reconciliation surfaces to MVP.
6. Build MCP API and ChatGPT App MVP gates over registry-derived read/write authority.
7. Build organization/access-policy and operational-health surfaces at MVP depth.
8. Commercialize remaining demonstration-derived runtime dependencies into packages/UAPI and prove commercial code does not import `protocol-demonstration/`.
9. Generate proof artifacts and promote only after tests/builds/QA pass.

## Commit-Body Direction

The eventual V28 promotion commit body must describe commercial Protocol/Terminal MVP QA over V27 tokenomics, list gate closures, name tests/builds/proofs/visual QA, state route-versioning discipline, name MCP API and ChatGPT App MVP closure, and explicitly defer deeper Terminal work to V29, Protocol/BTD hardening to V30, deeper Auxillaries to V31, deeper provation/testing to V32, deeper Interfaces beyond the V28 MVP to V33, deeper Deployment to V34, deeper telemetry/documenting to V35, and Exchange/website Conversations to V36+.

## From V27 To V28

| V27 source truth | V28 delta |
| --- | --- |
| commercial application routes render but still contain mixed visual generations | V28 makes active routes MVP-coherent through QA, visual cleanup, route checks, and browser proof |
| Auxillaries retained orbital-era shell styles while adopting contained tabs-left panes | V28 removes conflicting orbital layout from active Auxillaries auth/profile/readiness experience |
| signed-in balance widget used currency-like `$BTD`, a raw pipe separator, explanatory hover title, and acquisition wording | V28 renders BTC and BTD as peer wallet balances, uses a styled separator, shows recent BTD AssetPacks in hover context, shows connected wallet identity in the action posture, and opens the `$BTD` wallet auxillary pane |
| Exchange route exists as a prior minimum commercial surface | V28 disables or hides Exchange from closure and defers Exchange product work beyond V35 |
| `$BTD` supply and measureminting law are implemented in `packages/btd` | Terminal reads measuremint entitlement and zero-cell/refit posture as operator state |
| wallet and BTC fee primitives exist | Terminal exposes wallet connection, signer-session state, PSBT handoff, txid, confirmation, replacement, reorg, and failure state |
| AssetPack ranges exist as package/API/database primitives | Terminal makes range, cells, owner, policy hash, source root, proof root, and ledger anchor state readable |
| access evaluation exists | Terminal separates owner-read, licensed-read, and denied branches with policy context |
| minimal Exchange transfer exists | Terminal uses protocol/settlement readback for V28 and does not depend on Exchange product surfaces |
| Terminal journal primitive exists | Terminal turns journal rows and diffs into ordinary transaction detail |
| reconciliation primitive exists | Terminal displays ledger facts, database projections, metaphysical facts, blocking drift, and repair receipts |
| telemetry and deployment lanes exist | Terminal exposes crypto health, approval roots, upgrade posture, and rollback readiness |
| GitHub is the implemented VCS provider | active surfaces disclose provider readiness and stage broader provider depth outside V28 unless MVP QA requires a narrow hook |
| V27 registry migration exists | V28 executes controlled migration/type-refresh work as Terminal readiness input |

## Gate Delta

### Gate 1: Draft Opening And Promotion Review

Opened by:

- updating active posture carriers from V26/V27 to V27/V28;
- creating V28 SPEC, DELTA, PARITY, and draft-opening proof;
- preserving `BITCODE_SPEC.txt` as V27.

### Gate 2: Commercial Application MVP QA Baseline

Adds primary-route QA, Auxillaries shell cleanup, Protocol/Terminal MVP hardening, MCP/ChatGPT App readiness, and browser/visual proof requirements.
The automated browser layer is the commercial-MVP Playwright suite: product-route readability, micro-interface assertions, stitched user flows, URL-addressable filter state, data-share consent persistence, public docs article coverage, responsive route health, and browser-error cleanliness are required before Gate 2 can close.
The package runner is intentionally serial against one deterministic mock-mode dev server. Its mock harness must own Auxillaries data, model-preferences, data-share, notifications, Terminal activity, BTD mint/read state, and MCP/ChatGPT App readiness so V28 QA validates commercial Protocol/Terminal behavior rather than external account/session availability.

### Gate 3: Terminal Wallet, BTC Fee, And Read-Fit-Measuremint Workflow

Adds wallet, BTC fee, operator-visible measurement, Fit, proof, measuremint, and access-policy review.

### Gate 4: Terminal AssetPack Range Detail

Adds registry-derived range detail and read-right detail.

### Gate 5: Terminal Journal Diff And Reconciliation

Adds transaction detail for journal/database/ledger agreement and repair.

### Gate 6: Terminal Organization And Access Policy

Adds registry-derived organization, MCP API, ChatGPT App access decisions, and policy templates.

### Gate 7: Terminal Operations And Testnet Readiness

Adds Terminal-operated deployment lane, telemetry, upgrade, migration, and provider readiness state.

### Gate 8: V28 Metadevelopment And Promotion Proof

Adds branch policy, quality commit discipline, gate workflow hardening,
canonical promotion automation, V28 promotion-script support, unversioned-route
checking, deterministic ledgerized model posture checks, and a carryforward
audit for the product gates that follow.

### Gate 9+: Commercial Product Closure Gates

Gate 9 and later gates close the remaining commercial product flow: Depositing,
Read Request, Read-Need synthesis/review/resynthesis, Finding Fits, AssetPack
preview, BTC settlement, read-license/right transfer, protected-source unlock,
PR delivery, Terminal UX, documentation, proof coverage, and live validation.

Gate 9 introduces the deposited-source evidence spine that later gates consume.
Depositing now produces proof, measurement, reconciliation readback, lexical
document, vector document, and aggregate depository search roots; projects those
roots through Terminal execution history; and carries them into the Read/Fit
harness deposit reference. The vector document policy is explicit:
`text-embedding-3-small`, 1536 dimensions, `deliverable_vectors`, and
`match_deliverable_vectors`.

Gate 10 introduces the first two enterprise Reading steps as typed protocol
state. `/api/read-review` can synthesize, resynthesize, and accept
Read-Needs; every Need embeds its `bitcode.read.request`, feedback lineage, and
prior Need id when resynthesized. Route telemetry exposes the
ReadNeedComprehensionSynthesis contract trace across phases, PTRR agents,
PTRR steps, and ThricifiedGeneration identifiers. Terminal cannot request
Finding Fits from this path until an accepted `bitcode.read.need` is present.

## Later Version Handoff

- V29: deeper Terminal workflows and transaction operation beyond V28 MVP QA.
- V30: Protocol/BTD hardening discovered during V28/V29, explicitly not Exchange unless a future spec reopens that scope.
- V31: deeper Auxillaries, including expanded profile/connects/interfaces/BTD readiness, provider readiness, and commercial operator settings.
- V32: deeper provation and testing, including stronger proof-family closure, E2E breadth, promotion proofs, and regression matrices.
- V33: deeper Interfaces beyond the V28 MCP API and ChatGPT App MVP, including broader API packaging, interface auth, non-Auxillaries non-website application interfaces, and integratable chatbot surfaces.
- V34: deeper Deployment, including host capabilities, real executions, distributed compute aligned with provations, runtime expectations, storage expectations, and CI/CD for canonical promotions.
- V35: deeper telemetry and documenting, including internal codebase documentation and public `/docs` usage material as the prelude to full commercial application testnet rollout.
- V36+: deeper Exchange and website Conversations, including market depth, order books, range trading depth, wrappers, liquidity, buy/sell/bid/ask flows, and website conversational interface work.
