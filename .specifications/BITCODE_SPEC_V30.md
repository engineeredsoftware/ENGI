# Bitcode Spec V30

## Status

- Version: `V30`
- V30 state: canonical promotion complete; V30 is the active Protocol/BTD hardening canon and the V30 hand-authored plus generated canon are aligned
- Current canonical/latest target: `V30`
- Canonical proof-source commit: `c5b238b9958430c4611ef396ac8cea248c1aecf4`
- Prior canonical anchor: `BITCODE_SPEC_V29.md`
- Prior generated proof appendix: `BITCODE_SPEC_V29_PROVEN.md`
- Generated structured artifact inventory: active canonical `.proofs/v30/spec-family-report.json`, `.proofs/v30/canonical-input-report.json`, `.proofs/v30/canon-posture-drift-report.json`, `.proofs/v30/protocol-telemetry-proof-hooks.json`, V30 gate-quality and promotion workflow evidence, and `BITCODE_SPEC_V30_PROVEN.md` as the generated proof appendix for V30 promotion
- Source parity state: V30 source-side Protocol/BTD package APIs, Bitcoin/PSBT, receipts, ledger projection, source-to-shares, bridge-readiness, telemetry/proof hooks, interface regression, workflow, and promotion surfaces are canonicalized in the promoted V30 file family
- State: draft target opened
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V29`
- Draft target source: `protocol-demonstration/src/canon-posture.js` declares `DRAFT_TARGET_VERSION = 'V30'`
- Primary scope: Protocol/BTD hardening over the promoted V29 commercial Reading, Finding Fits, AssetPack, settlement, delivery, and promotion baseline
- Prior active canon: `BITCODE_SPEC_V29.md`
- Notes companion: `BITCODE_SPEC_V30_NOTES.md`
- Delta companion: `BITCODE_SPEC_V30_DELTA.md`
- Parity companion: `BITCODE_SPEC_V30_PARITY_MATRIX.md`
- Generated proof appendix: none until V30 promotion
- Scope: V30 canonical system specification for Protocol/BTD package API boundaries, Bitcoin/Taproot/PSBT rigor, BTD AssetPack mint/read receipts, testnet ledger projection, source-to-shares proof cleanup, bridge-readiness research boundaries, Protocol telemetry/proof hooks, interface regression, and promotion-ready workflow proof over V29
- Last fully realized canonical target preserved in source: `V30`

V30 begins from promoted V29.
V29 made the Terminal transaction cockpit deep enough for operators to follow Reading, Finding Fits, AssetPack preview, settlement, rights transfer, delivery, repair, authority, and promotion readiness.
V30 hardens the Protocol and BTD rails beneath that cockpit so the commercial implementation can support enterprise shippability without ambiguous receipt, settlement, proof, bridge, package, or projection boundaries.

## Version executive summary

V30 is a Protocol/BTD-hardening version.
It does not create a new protocol supply law, a new `$BTD` denomination, or a versioned implementation route family.
It turns V29's promoted commercial Reading system into a stronger settlement, receipt, and proof substrate:

- package APIs are narrower, explicit, and reusable outside one route or interface;
- Bitcoin fee, Taproot/PSBT, signer, broadcast, replacement, reorg, and finality semantics are typed enough to test and audit;
- BTD-AssetPack mint/read receipts bind source-safe preview, paid unlock, right transfer, delivery, and ledger state without protected-source leakage;
- ledger, database, object storage, and proof projections have deterministic roots, repair posture, and drift classes;
- source-to-shares measurement, settlement conservation, and contribution accounting are clean enough to support later Exchange work;
- bridge-readiness research is documented without becoming chain-of-record truth;
- Protocol/BTD telemetry and proof hooks are complete enough for V32 provation depth and V34 deployment depth.

V30 closes only when the Protocol/BTD rails can safely support commercial Reading, Finding Fits, AssetPack preview, settlement, right-transfer, and delivery and when every V30 gate is specified, implemented, tested, documented, and promotion-ready.

## Canonical Bitcode executive summary

Bitcode is a protocol and commercial implementation for measuring technical knowledge, exchanging source-bearing AssetPacks, and settling rights through proof-backed Reading.
The active V29 canon remains:

- a Deposit supplies source material to the Bitcode depository;
- a Read Request is synthesized into a reviewed Need before any Finding Fits run;
- `ReadNeedComprehensionSynthesis` uses PTRR agents and ThricifiedGenerations to synthesize a precise Need;
- `ReadFitsFindingSynthesis` searches the depository for all threshold-passing fit deposits, uses those fits as synthesis context, and produces a source-safe AssetPack preview;
- protected AssetPack source remains hidden before settlement;
- BTC is the fee asset;
- BTD range/read-license/right transfer and delivery are ledgerized;
- paid settlement unlocks the full AssetPack as a pull request against the Reader's repository.

V30 does not redefine those laws.
V30 makes their protocol rails more precise, typed, auditable, and production-hardened.

## V30 source-of-truth hierarchy

The V30 source-of-truth hierarchy is:

1. `BITCODE_SPEC.txt`, which remains `V29` until V30 promotion.
2. `BITCODE_SPEC_V30.md` during V30 drafting.
3. `BITCODE_SPEC_V30_NOTES.md`.
4. `BITCODE_SPEC_V30_DELTA.md`.
5. `BITCODE_SPEC_V30_PARITY_MATRIX.md`.
6. generated V30 artifacts under `.proofs/` when produced.
7. `BITCODE_SPEC_V30_PROVEN.md` only after promotion.
8. source implementation, tests, internal docs, public docs, and QA evidence that realize this file family.

Older specifications are provenance only.
They must not be used as hidden current-system law.

## V30 full-system, re-implementation, and audit rule

V30 must be re-implementable and auditable from its specification family without reading conversation history.
Every Protocol/BTD state, pipeline admission boundary, proof root, ledger/database projection, disclosure rule, fee/right transfer state, and promotion gate must identify:

- canonical object;
- required inputs;
- outputs and stored artifacts;
- deterministic, inferred, external, or policy-derived fields;
- proof obligations;
- failure and repair posture;
- implementation and validation surfaces.

## V30 totality and precision enforcement rule

V30 fails closed when a Protocol/BTD feature only displays a happy-path summary while hiding missing proof, ledger, database, wallet, or delivery state.
Each gate must preserve exact abstraction names:

- executions are the base runtime records;
- pipelines compose phase-wise behavior;
- agents are PTRR agents;
- PTRR steps are the four formal agent steps;
- sub-steps are ThricifiedGenerations;
- pipeline inference points are ThricifiedGenerations;
- tools are registry-backed tool calls;
- prompts are prompt-part and prompt-template registry compositions.

No source identifier may introduce a versioned route, gate, or work-in-progress name unless explicitly accepted as a bounded compatibility artifact.

## V30 system goals, non-goals, and design principles

Goals:

- harden Protocol and BTD package APIs into stable commercial primitives;
- make Bitcoin fee, Taproot, PSBT, signer, broadcast, replacement, reorg, and finality semantics exact enough for testnet operation;
- bind BTD-AssetPack mint/read receipts to source-safe preview, paid unlock, delivery, and rights transfer;
- make ledger/database/object-storage projection repair deterministic, proof-rooted, and source-safe;
- clean source-to-shares measurement, contribution, and settlement conservation proof surfaces for later Exchange work;
- document bridge-readiness and wallet/provider research without treating any bridge as current `$BTD` chain-of-record truth;
- add Protocol/BTD telemetry and proof hooks that V32, V34, and V35 can prove, deploy, and operate.

Non-goals:

- no Exchange market-depth implementation;
- no website Conversations product-depth implementation;
- no new `$BTD` supply law;
- no value-bearing mainnet approval;
- no broad provider completion beyond Protocol/BTD-owned hooks;
- no direct runtime dependency on `protocol-demonstration/`.

Design principles:

- typed receipts before prose summaries;
- no protected source leakage before settlement;
- typed events over raw JSON as the operator and API contract;
- ledger truth and database projection remain synchronized but distinct;
- failures must name the blocking primitive and the repair path.

## V30 system architecture and layer boundaries

V30 preserves the V29 architecture:

- `packages/*` own protocol, BTD, pipeline, agent, prompt, tool, storage, and interface primitives;
- `packages/pipelines/asset-pack` owns Reading pipelines and AssetPack synthesis logic;
- `packages/pipeline-hosts` owns Vercel Sandbox and host-lane execution harnesses;
- `packages/btd` owns BTD range, measuremint, BTC fee, wallet, access, ledger, reconciliation, and terminal-journal primitives;
- `uapi` owns commercial API routes and operator UI surfaces;
- `protocol-demonstration` remains a standalone minimal reference and proof witness outside the workspace import graph.

Layer boundaries:

- Commercial interfaces may call commercial APIs and packages; they must not import demonstration runtime code.
- API routes may orchestrate pipelines; pipeline packages must remain reusable outside a single route.
- Ledger records and journals are source-of-truth for settlement/finality; Supabase/PostgreSQL projections must not contradict them.
- Source-safe previews may expose measurements, roots, score bands, policy ids, fee quote roots, and settlement posture; they may not expose protected source before payment.

## V30 package API and receipt hardening canon

V30 treats `packages/protocol`, `packages/btd`, `packages/api`, `packages/pipelines/asset-pack`, and `packages/pipeline-hosts` as the commercial Protocol/BTD hardening substrate.
The formal package boundaries are:

- `@bitcode/protocol` owns active/draft canon posture, spec-family checks, generated-proof helpers, and promotion-governance helper APIs;
- `@bitcode/btd` owns BTD range/read-license/right-transfer state, Bitcoin fee operation posture, receipt roots, settlement conservation, access policy, and reconciliation primitives;
- `@bitcode/api` owns JSON-safe route adapters over package primitives, never hidden policy logic;
- `@bitcode/pipeline-asset-pack` owns source-safe AssetPack preview, Finding Fits synthesis contracts, and postprocess evidence roots;
- `@bitcode/pipeline-hosts` owns runtime harness evidence, host capability manifests, and readback/projection evidence.

The commercial protocol package owns the active/draft posture while V30 is in flight:

- `ACTIVE_CANON_VERSION = 'V29'`;
- `DRAFT_TARGET_VERSION = 'V30'`;
- spec-family, canonical-input, canon-posture-drift, and proven-generation helpers are exported through the package index;
- package tests and V30 checks fail closed on direct demonstration-source imports.

V30 must reduce ambiguous cross-package behavior.
Any BTD, fee, receipt, or reconciliation object used by more than one interface must become a package-owned type, builder, parser, validator, and test fixture before the gate that depends on it closes.

## V30 canonical domain model

The V30 domain model extends V29 operationally:

- `Deposit`: source supply with repository, branch, commit, depositor boundary, depository asset id, measurement, embedding document, and proof roots.
- `ReadRequest`: Reader-authored request with repository target, constraints, non-goals, desired artifact kinds, and context.
- `ReadNeed`: reviewed synthesis of the request, including requirements, exclusions, proof expectations, pricing vector, feedback lineage, and acceptance root.
- `FindingFitsResult`: all threshold-passing fit deposits, search roots, ranking roots, blockers, no-worthy-fit posture, and selected synthesis context.
- `AssetPackPreview`: source-safe measurements, quality score, disclosure policy, access policy, fee quote, range projection, and protected-source lock.
- `SettlementUnlock`: BTC fee proof, BTD range/read-license/right transfer, paid disclosure decision, delivery admission, and reconciliation state.
- `BtcFeeQuote`: deterministic BTC fee quote with quote root, measurement root, purpose, network, sats, pricing version, expiration, and lifecycle state.
- `WalletSignerSessionRecovery`: signer-session posture proving whether the Reader wallet can sign a PSBT without server custody.
- `BtcFeeNetworkPolicy`: proof-rooted environment and network admission posture over local, staging-testnet, and production-mainnet value-bearing BTC settlement.
- `BtcFeeTaprootPsbtPosture`: proof-rooted Taproot commitment, script path, PSBT handoff, broadcast observation, replacement, reorg, and finality posture.
- `BtcFeeOperationPosture`: operational state over quote, signer, network policy, Taproot/script posture, PSBT, broadcast, finality, replacement, reorg, failure, and blocked readiness.
- `BtdAssetPackMintReceipt`: typed receipt binding AssetPack id, BTD range, depositor ownership, source-safe preview root, mint measurement root, settlement conservation root, and ledger projection root.
- `BtdReadReceipt`: typed receipt binding Reader, read request, accepted Need, Finding Fits result root, source-safe preview root, paid/unpaid disclosure state, read-right state, and delivery admission.
- `BtdRightsTransferReceipt`: typed receipt binding BTC fee finality, BTD owner or license transition, range projection, paid unlock, delivery proof, and reconciliation status.
- `SourceToSharesProof`: deterministic contribution and settlement accounting proof over fit deposits, measurements, range slices, fee quote, conservation checks, zero-cell/refit tail state, and no-overpayment/no-underpayment invariants.
- `BridgeReadinessResearchPosture`: non-chain-of-record research record for Taproot, BitVM, BSC/opBNB, Binance Web3 Wallet, and future bridge paths, carrying feasibility, risk, current non-admission, and rereview triggers.
- `TerminalTransaction`: URL-addressable activity combining execution, pipeline, agent, tool, prompt, ledger, database, delivery, and proof state.
- `TerminalTransactionReadModel`: typed operator projection of a selected `TerminalTransaction`, including route state, active detail section, low-detail summary, section availability, expandable audit posture, and source-safe raw-payload boundary.

## V30 gate plan

V30 closes through ten gates:

1. **Gate 1: V30 Roadmap And Gating** opens the V30 family, makes `SPECIFICATIONS_ROADMAP.md` truthful after V29 promotion, and wires V30 checks.
2. **Gate 2: Protocol Package API Boundaries** narrows shared package APIs and removes route-local policy duplication.
3. **Gate 3: Bitcoin Taproot PSBT Fee Rigor** hardens fee, signer, PSBT, Taproot/script, broadcast, replacement, reorg, finality, no-custody, and network-boundary semantics.
4. **Gate 4: BTD AssetPack Mint And Read Receipts** defines typed mint, read, and rights-transfer receipts.
5. **Gate 5: Testnet Ledger Projection Hardening** hardens ledger/database/object-storage projection, repair classes, and staging-testnet readback.
6. **Gate 6: Source-To-Shares Proof Cleanup** cleans contribution measurement, settlement conservation, zero-cell/refit tail, ancestry, and no-overpayment/no-underpayment proof.
7. **Gate 7: Bridge Readiness Research Boundaries** records bridge research without admitting any bridge as chain-of-record truth.
8. **Gate 8: Protocol Telemetry And Proof Hooks** adds source-safe telemetry and proof hooks for receipts, fee states, projection, source-to-shares facts, and bridge-readiness posture.
9. **Gate 9: Interface Integration And Regression Proof** proves current interfaces consume package-owned objects without V29 behavior regression.
10. **Gate 10: V30 Promotion Readiness** validates local/staging proof, generated artifacts, V30 promotion workflow support, and post-promotion V30 active / V31 draft posture.

Gate 4 receipt precision:

- Mint receipts are source-safe by construction. They may bind a paid unlock
  root later, but their own `protectedSourceVisible` posture is always false.
- Read receipts can represent preview, blocked, or paid-unlocked reading. Any
  paid delivery admission must include a paid unlock root, delivery admission
  root, read right, and ledger projection root.
- Rights-transfer receipts require confirmed BTC fee finality before the BTD
  right/license transfer can admit protected source visibility to the Reader.

Gate 6 source-to-shares precision:

- `SourceToSharesProof` is package-owned in `@bitcode/btd` and is the reusable
  accounting boundary for later Exchange work.
- Proof inputs bind accepted Need root, Finding Fits result root, admitted fit
  deposits, per-deposit measurement roots, normalized measurement units,
  fit/provenance quality basis points, BTD range projection, accepted BTC fee
  quote, payment observation, and optional ancestry review.
- Contribution weights are deterministic largest-remainder basis points over
  measured fit-deposit weights. The trace records total clipped weight,
  remainder order, tie-break policy, and provisional/final shares.
- BTD range slices and BTC fee allocations are both derived from the same
  contribution weights. Range slices may be zero-cell/refit-tail slices when the
  measuremint tail or small range leaves a contributor with no cell.
- Settlement conservation carries distinct no-overpayment and no-underpayment
  theorem verdicts, exact allocation conservation, blocker reasons, a
  conservation root, and a reconciliation-compatible check.
- A source-to-shares proof may represent balanced, overpayment, underpayment, or
  drifted state, but only balanced state is settlement-admissible for protected
  source unlock and delivery.
  Prepared, signed, broadcast, replaced, reorged, and failed fee receipts do
  not unlock protected source.

Gate 7 bridge-readiness research boundaries:

- `BridgeReadinessResearchPosture` is package-owned in `@bitcode/btd` and is
  the reusable policy boundary for bridge and distribution research.
- The required research paths are Taproot, BitVM, BSC/opBNB, Binance Web3
  Wallet, and future distribution paths. Each path must have a posture record
  naming feasibility, risks, current non-admission, rereview triggers, required
  proof before admission, and required policy before admission.
- V30 admits no bridge path as current `$BTD` chain-of-record truth.
  The posture root must retain `bitcoin_btd_registry` as the active BTD chain
  of record and `no_bridge_chain_of_record` as the bridge truth.
- Bridge-readiness records are source-safe research facts. They may not contain
  secrets or protected source, and they may not become wrappers, transfers,
  settlement rails, ownership claims, or fee rails without a future promoted
  version that supplies proof, policy, repair, telemetry, and disclosure
  admission.
- Terminal and API surfaces may show bridge-readiness posture as operational
  research evidence, but they must fail closed on any payload attempting to
  set `chainOfRecordAdmitted` or to mark a bridge as current BTD truth.

Gate 8 Protocol telemetry proof hooks:

- `BtdProtocolTelemetryEnvelope` is the package-owned source-safe carrier for
  Protocol/BTD observability that V32 provation and V35 documentation can
  replay without reading protected source or secrets.
- `BtdProtocolTelemetryRecord` rows cover exactly these V30 subjects:
  `btd_receipt`, `btc_fee_state`, `ledger_projection`,
  `source_to_shares_proof`, and `bridge_readiness_posture`.
- `BtdProtocolProofHook` binds each record to theorem ids, replay step ids,
  witness artifact paths, optional generated artifact paths, the evidence root,
  and the telemetry root.
- Telemetry events must match subject kinds; a BTC fee event cannot be emitted
  as a receipt, a ledger projection cannot be emitted as a bridge posture, and
  every mismatch fails closed.
- Telemetry metadata is scalar and source-safe. Payloads with protected source,
  private source text, API keys, service-role keys, JWT-looking secrets, or
  private keys fail closed before becoming Terminal, API, or generated proof
  evidence.
- The BTD API exposes `/btd/protocol-telemetry` as the source-safe boundary for
  these records. It returns a Terminal journal `proof_admission` entry and does
  not commit generated proof artifacts or source-bearing material.
- Gate 8 creates the generated-artifact inventory slot
  `.proofs/v30/protocol-telemetry-proof-hooks.json`; promotion may generate
  it only from source-safe telemetry/proof-hook facts.

## V30 whole Bitcode operator chain

The V30 Terminal operator chain is:

```text
Readiness
  -> Deposit or select deposited source
  -> Request Read
  -> Synthesize and review Need
  -> Request Finding Fits
  -> Review source-safe AssetPack preview
  -> Prepare BTC fee and settlement
  -> Wallet signs or blocks explicitly
  -> Ledger/database/right-transfer reconciliation
  -> Paid delivery as pull request
  -> Terminal journal, proof, and repair follow-through
```

Each transition must be observable as an execution, pipeline, PTRR agent, PTRR step, ThricifiedGeneration, tool call, ledger journal row, database projection, or repair receipt where applicable.

## V30 Terminal transaction read-model canon

Terminal transaction reading is route-owned.
When Terminal has a selected transaction, `/terminal?transactionId=<id>` is the recoverable address.
`transactionDetail` selects a typed detail section and defaults to source-safe Shippables when omitted.

The Terminal transaction read model must contain:

- selected transaction identity, activity type, lens, status, participant, repository, branch, timing, and proof posture;
- route state with canonical hrefs for each section and with the former `runId` carrier removed on write;
- low-detail default summary, metrics, and posture chips sufficient for ordinary operation without opening raw JSON;
- section read models for Shippables, identity, Wallet/BTC, closure, proofs, history, journal, activity stream, and console;
- explicit section availability: available, empty, or blocked with an operator-readable reason;
- expandable detail metadata preserving row counts, metric counts, payload availability, and target DOM section ids;
- a source-safe disclosure boundary: protected AssetPack source is never displayed before settlement, and raw payloads remain audit detail rather than the default operator contract.

The model is deterministic from execution history, detail readback, route query state, and data mode.
It must tolerate partial live readback by preserving a fallback selected-run projection while naming empty or blocked sections.

## V30 Terminal UX quality and browser-proof canon

The Terminal transaction cockpit is a protocol-facing operator interface.
It must be readable by default, keyboard reachable, responsive, and browser-proven.

The cockpit must expose:

- one named `main` landmark for the Terminal route;
- a keyboard-reachable skip link to the selected transaction workspace;
- a named transaction workspace region for activity selection, filtering, and selected-result digest;
- a named selected activity detail region for the low-detail detail hero, route-owned section controls, and source-safe detail surfaces;
- explicit loading, empty, failed, blocked, and source-safe preview states with `status` or `alert` semantics where appropriate;
- contained table overflow so phone and tablet viewports do not acquire document-level horizontal overflow;
- route-owned detail controls whose current, available, empty, and blocked states are understandable before raw payload expansion.

The browser-proof contract is package-local to Terminal and exported by `apps/uapi/app/terminal/terminal-ux-browser-proof.ts`.
It identifies the required landmarks, viewports, state semantics, route checks, and evidence files.
The focused Jest test proves the contract and state semantics.
The focused Playwright spec proves the cockpit in a real browser in deterministic mock mode across key route and responsive states.

Gate 9 acceptance does not change Reading law, source disclosure law, settlement law, or organization authority law.
It makes the current V30 Terminal cockpit commercially operable enough that later local/staging promotion readiness can debug failures from the UI rather than from browser network logs alone.

### Gate 9 interface integration regression proof

Gate 9 adds a package-owned proof that current interface surfaces consume the
Protocol/BTD rails instead of duplicating them:

- `BtdInterfaceIntegrationRegressionProof` covers Terminal, API, MCP,
  ChatGPT App, Auxillaries hook, and Exchange hook surfaces.
- `BtdInterfaceIntegrationRecordInput` and
  `@bitcode/btd/interface-integration-contract` give browser-facing
  interfaces a client-safe contract for surface and object-family coverage.
- `/btd/interface-integration-regression` wraps the package proof in a
  source-safe Terminal journal `proof_admission` boundary.
- The proof covers BTD registry, read access, BTD receipts, BTC fee operation,
  ledger projection, source-to-shares proof, Protocol telemetry,
  organization authority, and Terminal journal object families.
- Every record must set `packageOwned: true`,
  `routeLocalReimplementation: false`, `sourceSafeLowDetailIntact: true`, and
  `transactionCockpitRegression: false`.
- The proof fails closed on missing surfaces, missing object families,
  protected source, secrets, route-local policy copies, or low-detail cockpit
  regression.

## V30 local and staging promotion readiness canon

V30 promotion is admissible only when the version branch can prove both source
closure and promotion automation without relying on unstated operator memory.
Gate 10 owns that closure.

The promotion-readiness contract has five parts:

- all V30 gate scripts are invoked by gate-quality CI while `BITCODE_SPEC.txt`
  remains `V29`;
- gate-quality and canon-quality workflows also accept the promoted state after
  the V30 promotion workflow commits `BITCODE_SPEC.txt -> V30`;
- the canonical promotion command supports `--version V30`, validates the V30
  draft family, runs local proof suites, prepares V30 hand-authored status
  truth, prepares runtime canon posture for V30 active / V30 draft, generates
  `BITCODE_SPEC_V30_PROVEN.md`, writes `.proofs/v30/*` proof artifacts, and
  then validates the promoted V30 family;
- the version-promotion workflow runs only for a `version/v30` pull request into
  `main`, validates the same proof surface, and commits the generated promotion
  artifacts back to the version branch;
- local and staging-testnet QA evidence remains source-safe: environment
  readiness, pipeline readback, Terminal browser proof, ledger/database
  reconciliation posture, protocol package posture, and promotion dry-run are
  named without committing secrets.

`packages/protocol/src/canon-posture.js` and
`packages/protocol/data/state.json` are commercial runtime posture carriers.
They must align to V29 active / V30 draft during Gate 10 work and be rewritten
to V30 active / V30 draft by promotion automation.
The Gate 10 checker is promotion-mode aware: it must accept the V29/V30 package
posture before the generated canon commit and the V30/V30 package posture after
the generated canon commit.

Gate 10 does not itself promote `BITCODE_SPEC.txt`.
It closes when `version/v30` can be pull-requested to `main` and the V30
promotion workflow has enough scripted proof to produce the standalone
canonical promotion commit.

Gate 10's source implementation is the V30 promotion-readiness control surface:
`scripts/check-v30-gate10-promotion-readiness.mjs`,
`scripts/promote-bitcode-canon.mjs`, `scripts/generate-bitcode-proven.mjs`,
`scripts/prepare-bitcode-spec-family-promotion.mjs`,
`scripts/prepare-bitcode-runtime-canon-promotion.mjs`,
`.github/workflows/v30-canon-promotion.yml`, and the generated
`.proofs/v30/*` artifacts must agree on the same V29 draft / V30 promoted
transition. The generated telemetry artifact is source-safe and exists to bind
Gate 8 Protocol telemetry/proof hooks into promotion proof without exposing
protected source or secrets.

## V30 Wallet/BTC operation canon

Wallet and BTC fee state is an ordinary Terminal transaction surface, not an opaque settlement footnote.
The canonical wallet/BTC operation model is owned by `packages/btd` and projected by Terminal.

The operation model must contain:

- quote lifecycle: quoted, accepted, expired, superseded, and failed;
- deterministic quote root over quote id, purpose, network, sats, measurement root, issue time, and expiration;
- signer recovery: missing, prepared authorization required, stored authorization requiring live reconnect, expired, revoked, failed, network mismatch, capability missing, server-custody rejected, or live authorized;
- network policy: local and staging-testnet may exercise value-bearing BTC settlement for QA; production-mainnet value-bearing settlement remains blocked until explicit operational approval is attached and proof-rooted;
- Taproot/script posture: Bitcoin fee and anchor paths default to Taproot, name the admitted script path, and expose non-Taproot posture as audit evidence rather than silently treating it as equivalent;
- PSBT handoff: accepted quote prepares an unsigned PSBT; the wallet signs; the signed PSBT is ready for broadcast; broadcast and finality observations are separate states;
- finality states: prepared, signed, broadcast, confirmed, replaced, reorged, and failed;
- blocked-readiness receipts naming the blocker id, summary, required action, quote id, wallet session id, receipt id, and no-server-custody posture;
- Terminal read rows and metrics for state, network, sats, confirmations, quote root, wallet session, payer wallet, PSBT handoff, txid, server custody, and next action.

No server component may custody the Reader private key.
Server-side routes may prepare receipts, validate proofs, serialize quote/posture evidence, and persist registry rows only when explicitly requested.
They must not claim signature, broadcast, finality, settlement unlock, or rights transfer without matching receipt and readback evidence.

The Terminal Wallet/BTC section is source-safe before settlement.
It may reveal quote roots, state labels, txids, and readiness blockers.
It may not expose protected AssetPack source, wallet secrets, provider tokens, or private signing material.

## V30 settlement reconciliation repair canon

Settlement reconciliation is an ordinary Terminal workflow, not an after-action database debug task.
The canonical report is produced from:

- ledger observed facts: fee receipts, ledger anchors, journal entries, BTD ranges, ownership events, read licenses, and finality state;
- database projected facts: the Supabase readback rows that claim those ledger facts are durable in the application projection;
- object-storage artifact facts: source-safe preview, pipeline evidence, telemetry, delivery manifest, and ledger projection artifact roots that prove artifacts are durable without exposing protected source;
- private metaphysical canonical facts: protected source metadata, need/fit context, access policy documents, encrypted storage pointers, disputes, and telemetry context represented only by roots;
- staging-testnet readback facts: secret-free Supabase project reference, REST/DB hosts, out-of-band admin-credential state, table readback counts, and synchronized-or-blocked state;
- settlement conservation checks: BTC debit/credit and fee/payment roots that must conserve before unlock;
- delivery evidence: post-settlement pull-request visibility and recovery posture.

Drift is classified before repair:

- `missing_database_projection`: the ledger has a fact that the database projection has not read back;
- `ledger_root_mismatch`: the database projection points at a different root than the ledger observation;
- `ledger_finality_mismatch`: the projected finality differs from the observed finality;
- `database_orphan_projection`: the database projects a fact that has no matching ledger observation;
- `missing_object_storage_artifact`: the ledger or projection expects an artifact root that is not durable yet;
- `object_storage_root_mismatch`: the database projection and object-storage artifact root disagree;
- `staging_testnet_readback_blocked`: staging-testnet Supabase readback cannot prove the expected rows without retry;
- `settlement_conservation_drift`: BTC debit/credit or fee/payment accounting does not conserve.

Repair actions are canonical and auditable:

- `retry_database_readback`;
- `retry_object_storage_write`;
- `retry_staging_testnet_readback`;
- `project_ledger_fact`;
- `update_finality_state`;
- `quarantine_database_projection`;
- `quarantine_object_storage_artifact`;
- `pause_settlement_unlock`;
- `recover_delivery`.

The reconciliation state is one of aligned, retryable, repairable, approval required, or blocked.
Confirmed ledger facts that are missing from the database require operator-approved projection repair.
Reorged or failed finality, database-only orphan projection, or settlement conservation drift blocks unlock and delivery.
Missing durable object-storage artifacts are retryable unlock blockers.
Object-storage root mismatches require quarantine until the artifact and projection agree.
Delivery recovery is allowed only when settlement is otherwise aligned and the full AssetPack delivery target is not visible.

Terminal must show drift classes, blockers, repair actions, proof roots, observed facts, projected facts, object-storage facts, canonical facts, journal entries, and repair receipts before raw payloads.
The Vercel Sandbox harness must store the reconciliation report as settlement evidence when it claims ledger readback.
Supabase staging-testnet readback receipts must never store service-role JWTs, `sb_secret__` keys, OpenAI keys, database passwords, or any raw secret in tracked code or persisted proof payloads; only host/project identifiers, credential presence state, and proof roots are admissible.
The API may persist schema-compatible repair receipts while richer repair actions and proof roots remain report evidence until the registry schema is formally expanded.

## V30 canonical subsystem surfaces

### Depositing and asset supply

- Current canonical objects and emitted artifacts: Deposit, depository asset, repository snapshot, source measurement, embedding document, source proof root, ownership boundary, deposit journal row.
- Current algorithms and derivation rules: repository inventory binds source branch/commit; deposit admission creates searchable lexical/vector evidence; depositor ownership stays separate from later Reader rights.
- Current invariants and fail-closed conditions: invalid deposit, missing repository commit, unavailable source material, or absent depositor boundary blocks Finding Fits.
- Current proof obligations: source measurement root, embedding policy root, repository snapshot root, and depositor boundary proof.
- Current source-bearing implementation basis: `apps/uapi/app/terminal`, commercial API routes, `packages/pipelines/asset-pack`, `packages/btd`, Supabase migrations, and readback scripts.
- Current validating commands and parity basis: V30 gate checks, V29 readback verifier until replaced, package tests, UAPI tests, and staging-testnet SQL/readback evidence.
- Current accepted boundaries: broader provider families remain staged unless Terminal requires a narrow GitHub-adjacent hook.

### Reading and prompt/inference ownership

- Current canonical objects and emitted artifacts: ReadRequest, ReadNeed, prompt registry ids, PTRR agent ids, PTRR step ids, ThricifiedGeneration ids, raw output posture, parsed typed output, and acceptance root.
- Current algorithms and derivation rules: the Reader's request is not admitted to Finding Fits until `ReadNeedComprehensionSynthesis` synthesizes a Need and the user accepts it.
- Current invariants and fail-closed conditions: prompt contract incompleteness, parsed-envelope inadmissibility, missing Need review, or feedback lineage mismatch blocks Finding Fits.
- Current proof obligations: prompt template, interpolated prompt, input context, output schema, raw response posture, parsed output, usage, model identity, and acceptance root.
- Current source-bearing implementation basis: Reading pipeline contracts, bounded structured inference, read-review API route, Terminal Read UX, and tests.
- Current validating commands and parity basis: pipeline contract tests, route tests, prompt rendering/audit checks, local live OpenAI validation, and V30 gate checks.
- Current accepted boundaries: full-profile async push completion can deepen in V30 gates but cannot bypass source-safe preview or settlement boundaries.

#### V30 Reading pipeline observability canon

Reading pipeline observability is contract-projected, not ad hoc.
The asset-pack package owns the inventory for `ReadNeedComprehensionSynthesis` and `ReadFitsFindingSynthesis`, and live harness events must project back to that inventory whenever they are emitted.

The observable contract levels are:

- execution;
- phase;
- PTRR agent;
- PTRR step;
- ThricifiedGeneration;
- prompt;
- tool;
- raw output;
- parsed output.

For every live Reading stream event that can be associated with a contract, Terminal-visible telemetry carries:

- pipeline name;
- phase id;
- PTRR agent id;
- PTRR step id and step name;
- ThricifiedGeneration id and failsafe;
- prompt template id and generation prompt ids;
- tool id, input type, and output type when the event is tool-backed;
- declared return type and output schema;
- prompt template/interpolated prompt presence;
- reasoning, judgment, raw model response, and parsed typed output presence.

The Vercel Sandbox harness must export both the observability inventory and an observability coverage summary in its evidence artifact.
Coverage readback is not a settlement proof by itself; it is the operational proof that Terminal can debug a live Reading run without relying on browser network logs.
Failure to observe prompt, raw-output, parsed-output, or tool telemetry in a run that reaches those stages is a blocked-readiness signal for Gate 4+ QA.

### Fit, recall, ranking, and verification

- Current canonical objects and emitted artifacts: FindingFits query root, lexical search result, vector search result, fit deposit list, candidate score, ranking root, blocker list, and verification decision.
- Current algorithms and derivation rules: `ReadFitsFindingSynthesis` discovery searches the depository for all fits above threshold, ranks them, and uses fit deposits as contextual knowledge for AssetPack synthesis.
- Current invariants and fail-closed conditions: no-survivor asset pack, no-worthy-fit, mock/frontier source leakage, missing embedding policy, or missing candidate source root blocks implementation.
- Current proof obligations: search provider/tool ids, vector embedding policy, threshold, source roots, ranking roots, and selected-context root.
- Current source-bearing implementation basis: depository search tools, embedding configuration, AssetPack pipeline agents, and pipeline host harnesses.
- Current validating commands and parity basis: depository search tests, embedding tests, tool telemetry tests, staging readback, and Terminal stream tests.
- Current accepted boundaries: non-GitHub deposit providers are future unless required for a specific Terminal-owned repair.

### Selection and materialization

- Current canonical objects and emitted artifacts: AssetPack synthesis output, source-safe preview, delivery plan, branch artifact, pull-request delivery, branch artifacts and assetPackEvidence.
- Current algorithms and derivation rules: implementation uses discovered fit deposits as context; protected source is written only behind the paid unlock boundary; delivery materializes as a pull request after settlement.
- Current invariants and fail-closed conditions: unpaid preview cannot expose protected source; delivery cannot proceed without settlement unlock; branch identity must match ReadRequest repository context.
- Current proof obligations: synthesis prompt/output, preview policy, fee quote root, settlement unlock, delivery branch, PR id/url, and assetPackEvidence.
- Current source-bearing implementation basis: AssetPack pipeline postprocess, GitHub/VCS routes, pipeline host runner, Terminal delivery readback, and BTD package primitives.
- Current validating commands and parity basis: synthesis tests, source-leakage tests, route tests, PR delivery mocks/live checks, and V30 gate checks.
- Current accepted boundaries: full mainnet value delivery remains approval-gated.

#### V30 AssetPack disclosure rights canon

AssetPack disclosure is a first-class review object, not an incidental UI summary.
The preview before payment may show Need measurements, Finding Fits measurements, candidate ids, roots, score band, fee quote, range projection, access policy hash, and delivery target.
It must not show protected source content, the full patch, source-bearing manifest entries, or licensed read payload before the paid unlock is proven.

The disclosure review contract carries:

- `AssetPackSourceSafePreview`, which remains the source-safe preview envelope;
- `AssetPackDisclosureReview`, which binds preview id, AssetPack id, read-right state, source visibility, reader action, policy fields, range projection, roots, and protected-source leakage findings;
- owner-read, licensed-read, denied, and pending-settlement distinctions from BTD access primitives;
- paid unlock state from settlement readback;
- leakage review that fails closed when patch markers, source-code markers, or forbidden source-bearing fields appear in preview metadata.

Terminal must render disclosure review as an ordinary Reading stage surface.
Collapsed view shows visibility, reader action, policy root, review root, visible/withheld counts, leakage state, and source unlock state.
Expanded views may show the review metadata and roots, but they still may not reveal protected source before settlement.

Gate pull request titles are part of the same operator-quality posture.
Gate PRs into version branches must begin with the uppercase version and gate prefix, for example `V30 Gate 5: AssetPack Disclosure Rights And Preview Depth`, so gate history stays auditable from GitHub alone.

### Identity, authorization, and sensitive flow

- Current canonical objects and emitted artifacts: wallet identity, signer session, GitHub connection, organization role, read-license, access-policy decision, permission proof.
- Current algorithms and derivation rules: registry-derived permissions decide whether an operator can read, pay, unlock, deliver, repair, or administer a transaction.
- Current invariants and fail-closed conditions: authorization denial, stale signer session, missing org role, or sensitive data projection mismatch blocks action.
- Current proof obligations: wallet signature proof, provider installation proof, role/license readback, policy id/hash, and denial reason.
- Current source-bearing implementation basis: wallet API, VCS API, BTD access primitives, Terminal permission UI, MCP/ChatGPT action gates.
- Current validating commands and parity basis: wallet tests, access tests, API route tests, Terminal permission tests, and staging auth readback.
- Current accepted boundaries: broad enterprise RBAC depth can expand inside V30 only when tied to Terminal transaction operation.

#### V30 organization interface authority canon

Organization permission authority is a BTD primitive, not a per-interface convention.
The canonical decision is `BtdOrganizationInterfaceAuthorityDecision`.
It binds actor id, organization id, organization role, organization permission grants, interface surface, action, wallet binding, registry read-access decision, settlement state, explicit confirmation state, repair approval state, target anchor, source visibility, and proof roots.

Gate 7 defines the current action set:

- `read_transaction`
- `request_read`
- `review_need`
- `request_finding_fits`
- `review_asset_pack_preview`
- `pay_btc_fee`
- `unlock_asset_pack_source`
- `deliver_asset_pack`
- `repair_projection`
- `administer_organization`

Each action has a minimum organization role, optional explicit permission grants, wallet-binding requirement, registry read-access requirement, settled-payment requirement, explicit-confirmation requirement, repair-approval requirement, and source-visibility result.
Protected-source actions fail closed unless role/grant, wallet binding, owner-read or licensed-read registry access, settlement, and interface admission all agree.
Source-safe preview actions may remain visible without protected source.

The same authority primitive must be used by:

- Terminal, as the ordinary permission explainer for selected activity detail;
- API routes, as the JSON-safe route decision for interface owners;
- MCP, as organization-scoped action authority over read-license and delivery operations;
- ChatGPT App, as connected-interface write admission over confirmed delivery writes;
- the sandbox harness, as emitted evidence for live Reading/AssetPack completion readback.

Authority proof roots include role root, permission root, read-access root, interface root, and aggregate authority root.
Terminal renders those roots with blockers and decision rows so operators can understand why a transaction can or cannot pay, unlock, deliver, repair, or administer without opening network logs.

### Disclosure and projection

- Current canonical objects and emitted artifacts: disclosure policy, projection policy, redaction decision, preview metadata, owner-read/licensed-read/denied state.
- Current algorithms and derivation rules: source-safe preview reveals measurements and rights posture, not protected AssetPack source; paid unlock changes the disclosability boundary.
- Current invariants and fail-closed conditions: public projection overexposure, missing projection policy, or unpaid source access blocks display and delivery.
- Current proof obligations: disclosure boundary proof, projection policy hash, redaction decision, and access readback.
- Current source-bearing implementation basis: BTD access/projection primitives, Terminal preview components, API route serializers, and tests.
- Current validating commands and parity basis: disclosure tests, UI tests, readback queries, and source leakage scans.
- Current accepted boundaries: public docs may summarize posture but must not expose private source.

### Settlement and exact accounting

- Current canonical objects and emitted artifacts: BTC fee quote, PSBT, payment observation, settlement unlock, BTD range, source-to-shares, journal entry, ledger anchor, reconciliation report.
- Current algorithms and derivation rules: Share-to-Fee pricing is deterministic from measurement weights and measurement volume; BTC fee payment gates protected-source unlock and read-license/right transfer.
- Current invariants and fail-closed conditions: settlement conservation drift, missing payment proof, stale fee quote, unaccepted quote, missing signer capability, reorg, replacement, broadcast failure, or custody ambiguity blocks finality.
- Current proof obligations: quote root, signer recovery state, PSBT state, txid or blocked-readiness receipt, ledger anchor, source-to-shares report, and reconciliation result.
- Current source-bearing implementation basis: `packages/btd` fee/range/journal/reconciliation primitives, UAPI settlement routes, Terminal Wallet/BTC section, and Supabase projections.
- Current validating commands and parity basis: BTD tests, settlement route tests, Terminal wallet/BTC tests, staging ledger/database readback, and V30 gate checks.
- Current accepted boundaries: value-bearing mainnet stays outside V30 unless separately approved.

### Proof contract, witnesses, and replay

- Current canonical objects and emitted artifacts: proof family, member, theorem, witness artifact, replay step, generated proof appendix, validation report.
- Current algorithms and derivation rules: every promoted V30 claim needs a generated or executable witness, and every failure must preserve enough context for replay.
- Current invariants and fail-closed conditions: stale promoted status truth, missing witness, inconsistent proof root, or ungreen promotion validation blocks promotion.
- Current proof obligations: proof-family report, canonical input report, canon-posture drift report, promotion dry-run, generated appendix, and gate closure checks.
- Current source-bearing implementation basis: spec-family checker, canonical-input checker, promotion scripts, gate-quality workflows, and protocol-demonstration proof runtime.
- Current validating commands and parity basis: `check:spec-family`, V30 gate scripts, canon-posture drift checks, demonstration tests, package tests, and promotion workflow.
- Current accepted boundaries: V30 promotion automation may be hardened across gates but must be complete before `version/v30` merges to `main`.

## V30 proof-family canon

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.proofs/v30/inference-synthesis-proof.json` | prompt, model, parsed-output | prompt-complete, typed-output | render, infer, parse, persist | pipeline telemetry, route tests | Reading pipeline contracts |
| Prompt-completeness | `.proofs/v30/prompt-completeness-proof.json` | prompt parts, templates, interpolations | no-hidden-prompt, context-bound | compose, render, record | prompt render outputs | prompt registry and tests |
| Static-code-analysis | `.proofs/v30/static-code-analysis-proof.json` | source scans, route scans, import scans | no-versioned-routes, no-demo-import | scan, report | lint/typecheck outputs | scripts and CI |
| Verification-decisions | `.proofs/v30/verification-decisions-proof.json` | Fit verification, preview verification | threshold, blocker, no-worthy-fit | search, rank, decide | depository search reports | asset-pack pipeline |
| Selection-and-materialization | `.proofs/v30/selection-and-materialization-proof.json` | selected fits, delivery branch | paid-before-source, pr-delivery | synthesize, settle, deliver | AssetPack evidence, PR receipt | pipeline host and VCS routes |
| Authorization-and-sensitive-flow | `.proofs/v30/authorization-and-sensitive-flow-proof.json` | wallet, org, license, policy | authorized-action, redaction | sign, authorize, project | wallet/access readbacks | BTD and UAPI |
| Settlement-source-to-shares | `.proofs/v30/settlement-source-to-shares-proof.json` | fee, range, license, source shares | conservation, right-transfer | quote, pay, mint, reconcile | source-to-shares, fee receipt | BTD settlement primitives |
| Disclosure-boundary | `.proofs/v30/disclosure-boundary-proof.json` | preview, paid unlock, denied state | no-prepay-source, paid-source | preview, unlock, read | projection-policy, leakage scans | access/projection code |
| Proof-contract | `.proofs/v30/proof-contract.json` | families, theorems, witnesses | complete-family, replayable | generate, validate, promote | spec/proven artifacts | spec-family tools |

### Inference-synthesis

- proofArtifactPath: `.proofs/v30/inference-synthesis-proof.json`
- members: Reading Need synthesis, Finding Fits discovery, AssetPack synthesis, preview validation, settlement unlock inference.
- theoremIds: prompt-complete, typed-output, model-bound, telemetry-persisted.
- replayStepIds: render prompts, call model or mock, parse type, persist execution telemetry.
- witnessArtifactPaths: pipeline telemetry rows, prompt render artifacts, route test reports, staging readback.
- current member closure criteria: each inference point is a ThricifiedGeneration under a PTRR agent step with a schema-bound output.
- current member verdict shape: pass, fail, blocked, or accepted-boundary with evidence path.
- current theorem-by-theorem closure reading: no theorem is closed without prompt, input, raw output posture, parsed output, model id, and usage state.
- current theorem-to-replay grouping: prompt composition, model call, parse, persist, and UI projection.
- minimum artifact/replay binding set: execution id, pipeline id, phase id, PTRR agent id, PTRR step id, ThricifiedGeneration id, prompt id, model id, output schema id.
- current proof-object fields: proofFamily, memberId, theoremId, replayStepId, evidencePath, verdict, blocker.
- generated-artifact and test bindings: `.proofs/v30/spec-family-report.json`, pipeline tests, route tests, and Terminal stream tests.
- fail-closed conditions: missing prompt, missing typed parse, hidden model id, or missing telemetry blocks promotion.

### Prompt-completeness

- proofArtifactPath: `.proofs/v30/prompt-completeness-proof.json`
- members: prompt part registry, prompt template registry, agent prompt registry, step prompt registry, sub-step prompt composition.
- theoremIds: every inference has a prompt template; every interpolated prompt is recorded; every schema is named.
- replayStepIds: collect prompt parts, compose prompt, interpolate context, record prompt payload.
- witnessArtifactPaths: rendered prompt files, telemetry rows, prompt tests.
- current member closure criteria: no inference occurs without a registered prompt path.
- current member verdict shape: pass, fail, blocked, accepted-boundary.
- current theorem-by-theorem closure reading: prompt completeness is required before parsed-envelope admissibility.
- current theorem-to-replay grouping: registry lookup, composition, interpolation, telemetry projection.
- minimum artifact/replay binding set: prompt ids, prompt part ids, context root, template text, interpolated text.
- current proof-object fields: promptId, templateId, contextRoot, inferenceId, schemaId, verdict.
- generated-artifact and test bindings: prompt inventory, prompt rendering tests, pipeline contract tests.
- fail-closed conditions: prompt contract incompleteness blocks the step.

### Static-code-analysis

- proofArtifactPath: `.proofs/v30/static-code-analysis-proof.json`
- members: route version scan, import boundary scan, source casing scan, lint, typecheck.
- theoremIds: no versioned active source, no demonstration runtime import, no casing drift.
- replayStepIds: scan files, compare rules, emit report.
- witnessArtifactPaths: CI logs, local command output, `.proofs` reports.
- current member closure criteria: all required scans pass or name accepted compatibility exceptions.
- current member verdict shape: pass, fail, blocked.
- current theorem-by-theorem closure reading: source shape must match active canon posture.
- current theorem-to-replay grouping: route scan, import scan, lint/typecheck.
- minimum artifact/replay binding set: command, exit code, checked paths, violations.
- current proof-object fields: ruleId, path, result, evidence, blocker.
- generated-artifact and test bindings: gate-quality workflow and local gate scripts.
- fail-closed conditions: active versioned route, stale draft posture, or direct demo import blocks closure.

### Verification-decisions

- proofArtifactPath: `.proofs/v30/verification-decisions-proof.json`
- members: candidate fit verification, preview verification, settlement readiness verification.
- theoremIds: threshold-admitted, no-worthy-fit-is-honest, blocked-readiness-is-explained.
- replayStepIds: search, rank, verify, decide.
- witnessArtifactPaths: search result rows, ranking roots, verification reports.
- current member closure criteria: every Fit decision has candidates, thresholds, roots, and reasons.
- current member verdict shape: worthy_fit, no_worthy_fit, blocked_readiness.
- current theorem-by-theorem closure reading: the decision must be derivable from stored candidates and Need measurements.
- current theorem-to-replay grouping: recall, ranking, scoring, verifier judgment.
- minimum artifact/replay binding set: Need id, deposit ids, scores, threshold, ranking root, verifier output.
- current proof-object fields: decision, candidates, roots, reasons, output schema.
- generated-artifact and test bindings: depository-search tests, staging readback, Terminal preview tests.
- fail-closed conditions: fabricated candidate, missing source root, or absent blocker reason.

### Selection-and-materialization

- proofArtifactPath: `.proofs/v30/selection-and-materialization-proof.json`
- members: selected deposits, AssetPack synthesis, branch artifact, delivery PR.
- theoremIds: context-bound-synthesis, paid-before-source, delivery-target-matches-read.
- replayStepIds: select, synthesize, preview, unlock, deliver.
- witnessArtifactPaths: assetPackEvidence, delivery receipts, PR metadata.
- current member closure criteria: materialized source is never visible to Reader before paid unlock.
- current member verdict shape: preview_locked, unlock_ready, delivered, blocked.
- current theorem-by-theorem closure reading: selection and delivery must read back from settlement and source roots.
- current theorem-to-replay grouping: fit selection, synthesis, settlement unlock, VCS branch, PR creation.
- minimum artifact/replay binding set: fitDepositAssetIds, sourceRoot, settlementUnlockId, branch, pullRequest.
- current proof-object fields: selectedIds, previewPolicy, unlockDecision, deliveryReceipt, blocker.
- generated-artifact and test bindings: pipeline host tests, VCS tests, readback verifier.
- fail-closed conditions: unpaid source exposure, mismatched target repo, missing PR receipt.

### Authorization-and-sensitive-flow

- proofArtifactPath: `.proofs/v30/authorization-and-sensitive-flow-proof.json`
- members: wallet identity, signer session, provider connection, org role, read-license, policy decision.
- theoremIds: action-authorized, secret-not-projected, redaction-applied.
- replayStepIds: authenticate, authorize, project, redact.
- witnessArtifactPaths: wallet proof, connection rows, policy readback, redaction logs.
- current member closure criteria: sensitive data is only shown to authorized principals and only at the admitted boundary.
- current member verdict shape: authorized, denied, blocked, redacted.
- current theorem-by-theorem closure reading: an action cannot execute from UI intent alone.
- current theorem-to-replay grouping: identity proof, role/license lookup, policy decision, projection.
- minimum artifact/replay binding set: principal id, role/license ids, policy id/hash, decision.
- current proof-object fields: principal, policy, decision, reason, projectedFields.
- generated-artifact and test bindings: wallet/access tests, API tests, Terminal permission tests.
- fail-closed conditions: authorization denial or projection mismatch blocks action.

### Settlement-source-to-shares

- proofArtifactPath: `.proofs/v30/settlement-source-to-shares-proof.json`
- members: fee quote, payment observation, BTD range, source-to-shares, read-license, journal.
- theoremIds: fee-conservation, range-conservation, license-transfer.
- replayStepIds: quote, prepare PSBT, observe payment, mint/transfer, reconcile.
- witnessArtifactPaths: `.proofs/_shared/source-to-shares.json`, fee receipt, journal rows, ledger anchors.
- current member closure criteria: settlement must conserve BTC fee, BTD range, source shares, and right transfer.
- current member verdict shape: prepared, signed, broadcast, confirmed, blocked, reconciled.
- current theorem-by-theorem closure reading: no paid source unlock without fee and right-transfer readback.
- current theorem-to-replay grouping: quote root, payment path, ledger observation, BTD state, reconciliation.
- minimum artifact/replay binding set: fee quote root, payment receipt root, txid or blocked receipt, BTD range slice roots, contribution weights, conservation root, license id, journal id.
- current proof-object fields: quote, payment observation, fit deposits, contribution weights, range slices, settlement allocations, no-overpayment, no-underpayment, zero-cell/refit tail, ancestry evidence, reconciliation check, blocker.
- generated-artifact and test bindings: BTD source-to-shares tests, settlement route tests, staging readback.
- fail-closed conditions: settlement conservation drift, stale quote, or chain reorg.

### Disclosure-boundary

- proofArtifactPath: `.proofs/v30/disclosure-boundary-proof.json`
- members: preview, projection policy, redaction, paid unlock, denied state.
- theoremIds: no-prepay-source, paid-reader-source, denied-state-no-source.
- replayStepIds: project preview, redact source, evaluate unlock, read source.
- witnessArtifactPaths: `.proofs/_shared/projection-policy.json`, preview payloads, leakage scan reports.
- current member closure criteria: source-bearing content crosses visibility boundary only after paid unlock.
- current member verdict shape: preview, locked, unlocked, denied, blocked.
- current theorem-by-theorem closure reading: disclosure posture must be explainable from policy, payment, and license state.
- current theorem-to-replay grouping: preview, settlement, license, projection.
- minimum artifact/replay binding set: preview id, projection policy hash, settlement unlock id, license id.
- current proof-object fields: visibility, policy, redactions, unlock, blocker.
- generated-artifact and test bindings: disclosure tests, UI tests, source leakage scans.
- fail-closed conditions: public projection overexposure or unpaid protected-source access.

### Proof-contract

- proofArtifactPath: `.proofs/v30/proof-contract.json`
- members: spec-family report, canonical input report, canon-posture drift report, promotion proof appendix.
- theoremIds: complete-family, valid-draft, valid-promotion.
- replayStepIds: validate family, validate inputs, validate posture, generate proven, promote.
- witnessArtifactPaths: `.proofs/v30/spec-family-report.json`, `.proofs/v30/canonical-input-report.json`, `BITCODE_SPEC_V30_PROVEN.md`.
- current member closure criteria: promotion cannot run unless all gate checks and generated proof inputs are green.
- current member verdict shape: draft-valid, promotion-ready, promoted, blocked.
- current theorem-by-theorem closure reading: generated canon must match the hand-authored spec family and source posture.
- current theorem-to-replay grouping: check, generate, dry-run promote, commit promote.
- minimum artifact/replay binding set: spec family files, generated reports, proof-source commit, promotion command.
- current proof-object fields: version, report, currentTarget, pointer, promotionCommit, verdict.
- generated-artifact and test bindings: spec-family checker, canonical-input checker, promotion workflow.
- fail-closed conditions: stale promoted status truth, missing generated appendix, or failed gate check.

## V30 generated canon

### Inherited V19 reproducible-canon artifacts

V30 continues the reproducible-canon requirement: generated reports must be deterministic, path-addressable, and promotion-bound.

### Inherited V20 operator-quality artifacts

V30 continues operator-quality proof: Terminal workflow claims must be backed by UI, accessibility, responsive, error-state, and browser evidence where applicable.

### Exact generated-artifact inventory matrix

| artifact | required in draft | required at promotion | purpose |
| --- | --- | --- | --- |
| `.proofs/v30/spec-family-report.json` | yes | yes | validates the hand-authored V30 family shape |
| `.proofs/v30/canonical-input-report.json` | yes | yes | records canonical input closure for active V29 plus V30 draft |
| `.proofs/v30/canon-posture-drift-report.json` | gate-dependent | yes | proves runtime/docs active/draft posture |
| `.proofs/v30/protocol-telemetry-proof-hooks.json` | gate-dependent | yes | records source-safe Protocol telemetry and proof-hook inventory for provation/documentation |
| `BITCODE_SPEC_V30_PROVEN.md` | no | yes | generated proof appendix for promoted V30 |

### V30 specifying generated artifacts

The minimum V30 generated set is `.proofs/v30/spec-family-report.json`, `.proofs/v30/canonical-input-report.json`, future `.proofs/v30/canon-posture-drift-report.json`, and `BITCODE_SPEC_V30_PROVEN.md`.

### Shared generated-artifact fields

Every generated artifact must include artifact id, schema id, version, current target, source commit, command, generated timestamp, verdict, inputs, and blockers.

### Artifact-specific generated payload fields

Spec-family reports include required file lists and section counts.
Canonical-input reports include active pointer, family paths, generated artifact paths, and proof appendix posture.
Canon-posture reports include active canon, draft target, runtime carrier paths, and drift failures.
Promotion reports include proof-source commit and promotion command.

### Artifact confidentiality and disclosability taxonomy

Generated artifacts are internal by default, reviewer-visible when they contain no secrets, public only when explicitly projected, buyer-visible only after paid unlock, and never allowed to leak protected source or secrets.

### Minimum generated appendix rendered contents

`BITCODE_SPEC_V30_PROVEN.md` must render aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when any required proof input is absent.

### Canonical regeneration and fail-closed posture

Generated canon must be regenerable from repository state.
Promotion must fail closed when any required report, witness, test, proof family, or source posture is stale.

## V30 validation canon

V30 validation is layered:

- spec-family and canonical-input checks for the V30 draft;
- canon-posture drift checks for V29 active and V30 draft;
- V30 gate-specific scripts;
- package lint, typecheck, and Jest suites;
- UAPI route/component tests;
- Terminal browser, accessibility, responsive, and error-state checks;
- local non-mocked OpenAI/Supabase/Vercel Sandbox validation for gates that touch live pipeline behavior;
- staging-testnet readback where ledger/database synchronization or delivery is claimed.

## V30 promotion canon

V30 promotes only through `version/v30` into `main`.
Promotion must:

1. pass every V30 gate check;
2. pass active V29 and draft V30 posture checks before promotion;
3. generate `.proofs/v30/*` canonical reports;
4. generate `BITCODE_SPEC_V30_PROVEN.md`;
5. update runtime posture carriers from active V29/draft V30 to active V30/next draft;
6. commit `BITCODE_SPEC.txt` changing from `V29` to `V30`;
7. keep main protected by pull request and verified-signature rules.

## V30 appendices and canonical supporting material

The appendices below are binding draft structure for V30.
They name the proof, artifact, validation, source, workflow, and fail-closed surfaces that every later gate must keep synchronized.

## Appendix A. Canonical type and surface catalog

Canonical V30 type families:

- Reading: ReadRequest, ReadNeed, FindingFitsResult, AssetPackPreview, SettlementUnlock.
- Pipeline: execution, pipeline, phase, PTRR agent, PTRR step, ThricifiedGeneration, tool call, prompt record, parsed output.
- Terminal: TerminalTransaction, journal row, stream row, detail accordion, repair action.
- BTD: range, source-to-shares, access policy, read-license, BTC fee quote, payment observation, ledger anchor, reconciliation report.
- Delivery: branch artifact, AssetPack evidence, pull request, delivery repair receipt.

## Appendix B. Proof family closure catalog

Each proof family named in the proof-family canon must have members, theorems, replay steps, witness artifacts, generated artifacts, and fail-closed conditions before V30 promotion.

## Appendix C. Generated artifact contract catalog

The V30 generated-artifact contract is exactly the generated canon section above plus Appendix K source-bearing artifact constraints.

## Appendix D. Validation and checking gate catalog

Gate validation starts with `pnpm run check:v30-gate1`.
Later gates must add focused scripts before claiming implementation closure.
Promotion validation must run all V30 gate scripts, source scans, package tests, UAPI tests, demonstration proof checks, generated report checks, and diff hygiene.

## Appendix E. Current canonical source map

Source map:

- `BITCODE_SPEC.txt`: active canon pointer, still `V29` during V30 drafting.
- `BITCODE_SPEC_V30.md`, `_DELTA`, `_NOTES`, `_PARITY_MATRIX`: draft target family.
- `protocol-demonstration/src/canon-posture.js`: active/draft runtime posture carrier.
- `packages/pipelines/asset-pack`: Reading pipeline and AssetPack synthesis source.
- `packages/pipeline-hosts`: sandbox/harness execution source.
- `packages/btd`: BTD, BTC, rights, journal, and reconciliation primitives.
- `apps/uapi/app/terminal`: Terminal operator surface.
- `.github/workflows`: gate and promotion automation.

## Appendix F. Subsystem totality and derivability matrix

V30 must cover repo supply and depositing; reading and measured demand; prompt/inference/evaluator ownership; deposit-to-read fit; recall and ranking; verification decisions; selection and materialization; branch artifacts and assetPackEvidence; identity, authority, signing, and policy; sensitive data and confidentiality flows; projection, disclosure, and redaction; proof families, members, theorems, witnesses, and replay; settlement, source-to-shares, journals, and exact accounting; telemetry, persistence, state, and failure semantics; host/runtime capability truth; operator experience and pedagogy; validation and test stack; generated artifacts and canonical promotion.

The subsystem sections in the canonical subsystem surfaces chapter are the active derivability matrix rows for V30.

## Appendix G. Canonical file-family and promotion contract catalog

V30 file family:

- `BITCODE_SPEC_V30.md`
- `BITCODE_SPEC_V30_DELTA.md`
- `BITCODE_SPEC_V30_NOTES.md`
- `BITCODE_SPEC_V30_PARITY_MATRIX.md`
- future `BITCODE_SPEC_V30_PROVEN.md`
- `.proofs/v30/spec-family-report.json`
- `.proofs/v30/canonical-input-report.json`
- future `.proofs/v30/canon-posture-drift-report.json`

## Appendix H. Operator surface and quality contract catalog

Terminal quality must include:

- URL-addressable transaction state;
- guided low-detail default path;
- expandable complete detail;
- readable live stream rows for pipeline, agent, tool, prompt, ledger, and delivery activity;
- keyboard and screen-reader usable controls;
- responsive layout;
- explicit empty, loading, blocked, failed, repaired, paid, and delivered states.

## Appendix I. Scenario, workflow, and cross-product contract catalog

V30 cross-product scenarios include auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, and Valuable.

These names are scenario/workflow coverage labels, not new product brands.

## Appendix J. Fail-closed contract and error posture matrix

Fail-closed states:

- invalid deposit blocks Finding Fits;
- prompt contract incompleteness blocks inference;
- parsed-envelope inadmissibility blocks typed pipeline output;
- no-survivor asset pack blocks preview and settlement;
- authorization denial blocks protected action;
- public projection overexposure blocks display;
- settlement conservation drift blocks unlock and delivery;
- stale promoted status truth blocks promotion.

Every fail-closed state must carry a readable Terminal blocker and a repair or retry posture when repair is allowed.

## Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing AssetPack artifacts include:

- `.proofs/_shared/asset-pack.lock.json`
- `.proofs/_shared/selected-source-material.json`
- `.proofs/_shared/verification-report.json`
- `.proofs/_shared/source-to-shares.json`
- `.proofs/_shared/projection-policy.json`
- `.proofs/_shared/system-proof-bundle.json`
- `BITCODE_SPEC_V30_PROVEN.md`

Before settlement, the Reader may see only source-safe preview metadata.
After settlement, the Reader may receive the full AssetPack source according to the paid read-license/right transfer and delivery policy.

## V30 accepted boundaries and reopen conditions

Accepted boundaries:

- V30 remains Protocol/BTD-hardening, not Exchange depth.
- V30 may deepen MCP/ChatGPT only where Terminal transaction authority requires shared permission truth.
- V30 may harden demonstration-origin commercial internals but must keep the demonstration standalone.
- V30 may use staging-testnet and local live validation; value-bearing mainnet remains separately approved.
- V30 promotion automation may be implemented across gates, but it must be complete before promotion.

Reopen conditions:

- V29 promoted law is found inconsistent with source behavior.
- Terminal exposes protected source before settlement.
- ledger/database projection contradicts settlement truth.
- organization permission decisions cannot be derived from registry/access policy state.
- gate workflow cannot fail closed for stale active/draft posture.

## V30 completion condition

V30 is complete only when:

- all gates in the V30 parity matrix are closed;
- the Terminal supports the deep transaction workflows specified here;
- live or bounded-real validation proves the claimed Reading/settlement/delivery paths;
- promotion workflows can promote only `version/v30`;
- generated V30 proof artifacts and `BITCODE_SPEC_V30_PROVEN.md` are produced;
- `BITCODE_SPEC.txt` changes from `V29` to `V30` only in the formal promotion commit.
