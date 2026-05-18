# Bitcode Spec V28

## Status

- Version: `V28`
- V28 state: draft target opened
- Current canonical/latest target: `V27`
- Prior canonical anchor: `BITCODE_SPEC_V27.md`
- Prior generated proof appendix: `BITCODE_SPEC_V27_PROVEN.md`
- Generated structured artifact inventory: `.bitcode/v28-gate-1-draft-opening-proof.json`; V28 spec-family and canonical-input reports are planned generated artifacts
- Source parity state: first-gate draft parity opened in `BITCODE_SPEC_V28_PARITY_MATRIX.md`
- State: draft target opened
- Active canonical pointer during draft opening: `BITCODE_SPEC.txt` -> `V27`
- Draft target source: `protocol-demonstration/src/canon-posture.js` declares `DRAFT_TARGET_VERSION = 'V28'`
- Primary scope: commercial Protocol implementation and Terminal MVP QA over V27 `$BTD` tokenomics and cryptographic-commercial rails, with MCP API and ChatGPT App MVP retained and Exchange plus website Conversations deferred beyond V35
- Prior active canon: `BITCODE_SPEC_V27.md`
- Notes companion: `BITCODE_SPEC_V28_NOTES.md`
- Delta companion: `BITCODE_SPEC_V28_DELTA.md`
- Parity companion: `BITCODE_SPEC_V28_PARITY_MATRIX.md`
- Generated proof appendix: none until V28 promotion

V28 begins from the promoted V27 tokenomics and cryptographic-commercial implementation.
V28 does not reopen `$BTD` supply law, measureminting law, BTC fee separation, AssetPack range identity, access-right separation, or V27 crypto receipt invariants.

V28 exists to make those laws usable through the commercial Protocol implementation and Terminal.
The Terminal remains the primary operator chain, and V28 hardens Protocol packages, UAPI protocol routes, Auxillaries readiness, BTD range disclosure, wallet/BTC/testnet posture, MCP API, and ChatGPT App into a coherent MVP experience.
Exchange and the website Conversations interface are intentionally outside V28 closure.

## V28 Purpose

V27 made `$BTD` exact.
V28 makes the commercial Protocol implementation and Terminal experience exact enough for MVP QA.

The central V28 product and protocol question is:

> Can an operator use Bitcode's commercial Protocol implementation and Terminal to move through readiness, Auxillaries setup, Deposit, Read/Fit work, synthetic measurement, BTD-AssetPack minting, BTC fee/testnet authorization, ledgerized journaling, `$BTD` range disclosure, licensed-read state, journal diffing, and reconciliation without relying on demonstration code or reading package internals?

V28 answers that by specifying:

- commercial Protocol and Terminal QA across Terminal, Auxillaries, BTD range disclosure, MCP API, ChatGPT App, auth/readiness, wallet/BTC/testnet flows, and route navigation;
- removal of Exchange and website Conversations from V28 acceptance criteria, navigation expectations, and QA closure;
- Auxillaries contained tabs-left cleanup, removing old orbital layout conflicts from the active auth/profile/readiness experience;
- Terminal wallet connection and signer-session review over V27 wallet primitives;
- BTC fee preparation, PSBT handoff, signature status, broadcast status, confirmation/replacement/reorg readout, and failure recovery;
- Read submission and Fit closure with visible source roots, proof roots, semantic volume, measuremint entitlement, zero-cell/refit posture, and access-policy binding;
- Terminal AssetPack range details derived from the registry, not aggregate compatibility balances;
- owner-read and licensed-read state visible from policy and registry evidence;
- Terminal journal rows and ledger/database reconciliation repairs as ordinary operator-readable transaction details;
- organization holdings, read-license usage, role posture, MCP authorization, and ChatGPT App action authorization as registry-derived facts;
- testnet and signet operational readiness surfaces that expose V27 telemetry and deployment-lane receipts;
- realistic testnet BTD-AssetPack minting, synthetic measurement journaling, ledger anchors, and wallet/BTC receipt paths before any value-bearing mainnet posture;
- Taproot-first Bitcoin anchoring posture, with BSC/opBNB/Binance Web3 Wallet work recorded as research-informed future bridge/distribution planning rather than V28 issuance law;
- honest provider readiness where GitHub is the implemented VCS provider and broader provider rollout is later external-connection work;
- V28 promotion proof after implementation, tests, builds, and route scans close.

## V28 Terminal Terminology Contract

V28 user-facing Terminal language is Deposit/Depositing and Read/Reading.
Pre-V28 Terminal vocabulary is retired from operator-visible copy, QA instructions, public docs, Terminal labels, tooltip prose, test-visible assertions, staging walkthroughs, and active data-contract carriers.

Deposit means source supply is selected, bound to a repository/branch/commit, signed where required, and submitted as the candidate supply side before any meaningful Read/Fit result is evaluated.
Read means the demand/query/measurement side that reads against available deposited source posture, then proceeds into Fit, proofs, finalities, ledgerization, and reconciliation.

As of the V28 Deposit/Read data-contract closure, active database, ORM, API, QA-query, OpenAPI, demonstration, and protocol carriers use Deposit/Read naming where they are part of the current contract.
Remaining strings containing `deposit`, `read`, or `read-measurement` are current V28 names, not compatibility vocabulary.
The live staging migration may use bounded dynamic compatibility references only to upgrade already-deployed data without keeping retired identifiers in the active schema.

## Real-Deployed Staging-Testnet MVP Target

V28 closure is now judged primarily by one real staging-testnet operator path with mocks disabled.
Mock mode remains a deterministic regression harness, but manual acceptance must prove that the deployed staging-testnet application is honest and minimally usable from first onboarding through Terminal Deposit and Read results.

The V28 staging-testnet target path is:

1. Open `/terminal` with Exchange and website Conversations disabled and with public mock flags off.
2. Open the Wallet auxillary pane and connect a Bitcoin-capable browser wallet on the configured testnet lane.
3. Capture a signed Bitcoin identity proof, bind payment/auth address facts, and project the wallet session into Supabase through Bitcode's custom Bitcoin-auth boundary.
4. Return to top chrome and verify that wallet identity, BTC fee posture, and BTD posture replace anonymous `Connect Wallet` state only after wallet status is known.
5. Open Externals and install or connect the GitHub App so repository inventory and source scope are available for Deposit and Read.
6. Keep Profile limited to optional email/contact/admin posture; email may improve notifications, but it is not the primary identity primitive.
7. In Terminal, perform the simplest Deposit path against a GitHub repository/source scope, binding repository, branch, commit, signer, and selected source supply before any Read/Fit result is evaluated.
8. Select or express the simplest Read against the deposited source posture, produce Fit-finding evidence, show review/proof/dedupe roots, and read the Fit result without leaving Terminal.
9. Synthesize the resulting AssetPack through protocol-specified model and pipeline configuration, not user-selected ledgerized synthesis preferences.
10. Emit or simulate the BTC fee/testnet ledger path with user-controlled signing, explicit blocked-readiness receipts when broadcast is unavailable, and no server custody.
11. Record synthetic measurement, measuremint result, AssetPack range or zero-cell receipt, access-policy hash, ledger anchor or ledger-observed placeholder, Terminal journal entry, and database projection.
12. Reconcile ledger/journal/database state and expose any drift as a blocking or repairable Terminal read while reading earning, settlement, or blocked-readiness state from the same Terminal/protocol readback grammar.

V28 does not require value-bearing mainnet behavior.
Regtest, signet, public testnet, and staging-testnet readiness may be used, but value-bearing mainnet requires a separate approval root.
Ledgers and ledgerized journals remain source-of-truth for cryptographic finality; Supabase/PostgreSQL is the ledger-derived and Bitcode-canonical data realm for private/metaphysical facts, projections, readiness, and UI read models.

MCP API and ChatGPT App MVP entrypoints must read from the same wallet, GitHub, Terminal journal, AssetPack, access-policy, and proof state.
They may trigger admitted actions only through the same fail-closed Protocol boundary that Terminal uses.

## Deterministic Model Posture

User-driven model selection is not allowed for ledgerized Bitcode synthesis.
Fit-finding, AssetPack synthesis, semantic measurement, measureminting, proof admission, ledgerized journaling, and settlement must use protocol-specified model identities, model versions, prompts, thresholds, toolchains, and receipt-bound configuration.

This rule exists because user-selected model preferences would break replay, parity, and settlement determinism.
Changing a ledgerized model or pipeline configuration is a protocol/specification event with receipt/proof impact, not a per-user setting.

Allowed exception:

- non-ledgerized conversational interfaces may expose user model selection for draft conversation UX;
- any output that becomes Fit evidence, AssetPack material, measurement, proof, journal, or settlement input must pass through the protocol-specified ledgerized path and record the model/configuration roots used.

Active source or UI that presents broad "apply model to all" behavior for Terminal, Protocol, Fit, AssetPack, or BTD synthesis is V28 legacy residue.
It must be removed, hidden behind a conversation-only boundary, or made explicitly non-ledgerized before V28 promotion.

## Commercial Application MVP QA Scope

The screenshot QA finding from May 6, 2026 shows that Auxillaries still mixes the older orbital visual shell with the newer contained tabs-left approach.
That is V28 work.
It is not a future Auxillaries feature, because it breaks the current commercial MVP experience.

V28 therefore owns:

- removal or containment of old orbital background/layout styles where they conflict with the active Auxillaries tabs-left experience;
- auth modal sizing, empty-state, and content-position QA;
- route-level QA for `/`, `/terminal`, `/auxillaries/*`, `/btd/[assetPackId]`, MCP API routes, ChatGPT App entrypoints, and current protocol routes, with Exchange and website Conversations hidden or disabled for V28 QA and the prior generic workspace route absent from active source;
- visual, responsive, and interaction QA for commercially active surfaces;
- Terminal operator-readiness preparation on top of V27 primitives;
- package/UAPI commercialization of protocol and demonstration-derived primitives so commercial code does not import runtime implementation from `protocol-demonstration/`.

Later versions may deepen individual products:

- V29: deeper Terminal workflows and transaction operation.
- V30: reserved for post-V29 Protocol/BTD hardening discovered during V28/V29, not Exchange.
- V31: deeper Auxillaries.
- V32: deeper provation and testing.
- V33: deeper Interfaces beyond the V28 MVP, while V28 retains MCP API and ChatGPT App MVP acceptance.
- V34: deeper Deployment, including host capabilities, real executions, distributed compute, runtime/storage expectations, and canonical-promotion CI/CD.
- V35: deeper telemetry and documenting across internal codebase docs plus public `/docs` usage material.
- V36+: deeper Exchange and website Conversations work after V35.

## Version Boundaries

V28 owns commercial Protocol implementation MVP QA, Terminal MVP hardening, Auxillaries readiness cleanup, MCP API/ChatGPT App MVP, and Terminal-operated crypto-readiness preparation.

V28 requires:

- active canon remains V27 until V28 promotion;
- V28 SPEC, DELTA, NOTES, and PARITY exist before implementation gates close;
- Terminal, Auxillaries, BTD disclosure, MCP API, and ChatGPT App surfaces read from V27 package/API/database primitives rather than redefining tokenomics;
- active commercial surfaces meet MVP layout, copy, responsiveness, auth, and navigation QA;
- Auxillaries uses the contained tabs-left approach without old orbital shell collision in the active experience;
- wallet, BTC fee, AssetPack range, read-license, journal, reconciliation, telemetry, and upgrade state are surfaced in Terminal product language;
- compatibility storage carriers are hidden behind Bitcode vocabulary and registry-derived read models;
- no new versioned UAPI route family is introduced;
- implementation source remains implicitly versioned to the active canon and current gate: routes, file names, CSS, constants, tests, and identifiers must not introduce explicit version/gate/work-in-progress names without a bounded compatibility instruction;
- value-bearing mainnet remains gated by explicit operational approval;
- V29 Terminal depth, V30 Protocol/BTD hardening, V31 Auxillaries depth, V32 provation/testing depth, V33 interface depth beyond the V28 MVP, V34 deployment depth, V35 telemetry/documenting depth, and V36+ Exchange/Conversations depth remain staged unless V28 requires a narrow Protocol/Terminal/MCP/ChatGPT hook.

V28 does not require:

- Exchange route, Exchange master-detail, order-book, buy/sell/bid/ask, wrapper liquidity, or website Conversations MVP closure;
- third-party market routing;
- completion of Bitbucket, GitLab, Azure DevOps, generic Git, or webhook provider families;
- final legal review for every future license template;
- value-bearing mainnet launch;
- a new `$BTD` supply law.

## Inherited V27 Laws

The following V27 laws are inherited unchanged:

```text
BTD_MAX_MINTABLE_SUPPLY = 21_000_000

One $BTD = one unique non-fungible source-share cell.
One AssetPack = one contiguous range of $BTD cells.
Only proof-backed Read-Fit settlement can mint $BTD.
BTC is the fee asset.
$BTD is not a spend token.
Measureminting decays toward the fixed supply ceiling.
Zero-cell/refit receipts are valid tail receipts.
Ancestry is optional, late-bound, evidence-based, and non-supply.
Ledger facts govern cryptographic finality.
Database projections must not contradict ledger and journal truth.
```

V28 may improve how these laws are read and operated.
V28 may not quietly redefine them.

## External Chain Research Interpretation

V28 incorporates the BitVM, Taproot, BNB Chain, Binance, and BTD compatibility research as planning guidance, not as a new issuance law.

V28 therefore treats:

- Bitcoin Taproot, BIP340 Schnorr signatures, BIP341 Taproot outputs, BIP342 tapscript, PSBT, and wallet-controlled signing as the primary Bitcoin-side primitives to test and expose.
- BitVM and BitVM2/BitVM3 as Bitcoin/Taproot-compatible bridge research, not production dependencies for V28.
- BSC, opBNB, BEP-20, Binance Web3 Wallet, Binance dApp self-listing, and Binance listing paths as future bridge/distribution pilots, not current `$BTD` chain-of-record truth.
- BNB-side compatibility as bridge-mediated because BNB Chain is EVM-compatible rather than a native Taproot or BitVM execution environment.
- native BSC/opBNB BTD testnet pilots as possible V30+ or V36+ research outputs only after V28 proves Bitcoin-side wallet, BTC fee, synthetic measurement, BTD-AssetPack minting, ledgerized journal, and database projection behavior.

Any V28 UI or document that mentions BNB Chain, Binance, BSC, opBNB, BitVM, or BEP-20 must label that posture as future bridge/distribution research unless an explicit testnet artifact exists and is bound to the V28 proof record.

## Terminal Transaction Path

The V28 Terminal must present the Bitcode transaction path as a single operator flow:

```text
Readiness
  -> Read submission
  -> Read measurement
  -> Read review
  -> Fit review
  -> proof and dedupe
  -> measuremint entitlement
  -> access policy binding
  -> BTC fee preparation and wallet authorization
  -> AssetPack synthesis and range projection
  -> ledger anchor or ledger observation
  -> journal entry
  -> reconciliation read
  -> protocol readback
```

Each step must expose enough state for a competent operator to know:

- what is being requested;
- what evidence was used;
- which root or receipt proves it;
- which readiness condition is missing when blocked;
- whether wallet authorization is user-controlled;
- whether BTC or `$BTD` is involved;
- whether the operator has owner-read, licensed-read, or no read right;
- whether ledger/database state agrees;
- and what repair, retry, or review action is available.

## Terminal Read Models

V28 Terminal read models must be registry-derived.

Required read models:

- `TerminalWalletReadiness`: wallet provider, address, network, signer-session state, authorization proof kind, expiry, and fail-closed reason.
- `TerminalBtcFeeReadiness`: fee purpose, sats, PSBT or unsigned transaction handoff state, txid, finality state, confirmations, replacement/reorg/failure reason.
- `TerminalReadFitRead`: Read id, source scope, semantic-volume receipt, Read review decision, Fit review qualities, proof root, dedupe root, settlement journal root.
- `TerminalMeasuremintRead`: cumulative measurement before/after, target minted before/after, residual credit, token count, zero-cell reason, range projection if minted.
- `TerminalAssetPackRangeRead`: AssetPack id, range start/end, cells summary, owner, policy id/hash, source manifest root, proof root, ledger anchor state.
- `TerminalReadRightRead`: owner-read, licensed-read, denied reason, license scope, expiry, policy hash, derivative and redistribution flags when policy-bound.
- `TerminalJournalDiffRead`: local intent, settlement sequence, ledger observation, database projection, drift kind, blocking status, and repair receipt root.
- `TerminalOrganizationBtdRead`: organization holdings, team role, licensed-read usage, treasury route state, and registry-derived permission result.
- `TerminalOperationalHealthRead`: lane, network, broadcaster/observer state, telemetry severity, approval root, rollback root, and upgrade posture.

These read models may be implemented incrementally.
They must remain adapters over V27 primitives rather than new tokenomics sources of truth.

## Gate Milestones

### Gate 1: Draft Opening And Promotion Review

Purpose:
Open V28 from V27 canon and convert the V28 notes into SPEC, DELTA, and PARITY documents.

Acceptance criteria:

- `BITCODE_SPEC.txt` still points to `V27`.
- `protocol-demonstration/src/canon-posture.js` reports V27 active canon and V28 draft target.
- V28 SPEC, DELTA, NOTES, and PARITY files exist.
- V26/V27 promotion-tail findings are classified as V28 inputs or later-version deferrals.
- active UAPI API route scan shows no versioned route family.
- no V28 generated proof appendix is claimed before promotion.

### Gate 2: Commercial Application MVP QA Baseline

Purpose:
Make active Protocol/Terminal surfaces visually coherent, navigable, and MVP-readable before deeper Terminal work.

Acceptance criteria:

- Auxillaries active auth/profile/readiness experience uses the contained tabs-left model without old orbital layout collision.
- sign-in, sign-up, signed-in, and signed-out Auxillaries states are responsive and not pushed offscreen.
- Auxillaries portal entry, including unauthenticated `Connect Wallet`, opens the contained Auxillaries shell rather than the old onboarding/orbital shell.
- mock and testnet-readiness Auxillaries entry render the same pane order and shell regardless of caller; V28 primary onboarding order is Bitcoin wallet identity first, GitHub repository connection second, optional email notifications third.
- Bitcoin wallet authentication must use a Bitcoin-capable wallet provider, with Xverse/Sats Connect first, Leather direct-provider second, UniSat/OKX fallback, and manual Bitcoin-address staging only when no Bitcoin dapp provider is discoverable. When multiple providers are detected, Wallet must expose provider-specific actions such as `Connect Xverse` and `Connect Leather` so a stalled Xverse prompt does not block Leather verification. The flow must obtain a Bitcode Bitcoin authentication proof when available, bind the Bitcoin address to the wallet identity/profile projection, preserve payment/auth address distinction, and persist wallet-provider connection posture without server custody of private keys.
- non-mock/staging QA must fail clearly when the Bitcoin wallet provider is unavailable, the browser exposes only an Ethereum provider, Supabase session persistence is unavailable, signed proof capture fails, or the connection-storage migration has not been applied; local staging may preserve the wallet identity for QA continuity while backend persistence is repaired.
- Auxillaries selector cards use centered pane names plus visual state indicators, not duplicate lane-title prose, and hover movement must not clip the first selector card.
- Auxillaries profile panes must be scrollable on first render, including unauthenticated and non-mock contained portal entry.
- Auxillaries settings panes auto-save edits; visible pane-level Save buttons are not part of the commercial MVP shell.
- the Wallet auxillary shows BTD as the primary large balance, shows owned AssetPack count and BTC wallet liquidity as secondary stats, moves explanatory system copy into tooltips/accessibility labels, avoids long-identifier overflow, and includes a Protocol/Terminal activity table for BTD-relevant owned packs, Deposits, Reads, proof closures, ledger anchors, synthetic measurements, and range-bearing activity.
- notification dropdowns remain legible and do not include redundant Auxillaries footer launchers when top chrome and profile menu already provide that entry.
- route QA covers `/`, `/terminal`, `/auxillaries/*`, `/btd/[assetPackId]`, MCP API routes, ChatGPT App entrypoints, and protocol routes; Exchange and website Conversations are disabled or hidden for V28 QA, and the prior generic workspace route is verified absent from active source.
- Exchange navigation is disabled for V28 and must not be required by any V28 acceptance criterion; any retained Exchange route/API behavior is treated as deferred compatibility or future work.
- V28 QA lanes set `NEXT_PUBLIC_DISABLE_EXCHANGE_LINK=true`, `NEXT_PUBLIC_DISABLE_EXCHANGE_ROUTE=true`, `NEXT_PUBLIC_CONVERSATIONS_WIDGET=false`, and `NEXT_PUBLIC_DISABLE_CONVERSATIONS_ROUTE=true`.
- signed-in navigation shows BTC and BTD balances as peer wallet facts, without `$BTD` currency-token styling, with a distinct visual separator, and with hover context reserved for recent BTD AssetPacks rather than explanatory product copy.
- connected-wallet navigation is driven by wallet identity, not only by email/Supabase user state; a locally staged Bitcoin provider connection must replace anonymous `Connect Wallet` chrome with BTC/BTD posture while backend persistence is still pending.
- Externals visibility is driven by wallet identity or an existing user session; once Wallet has staged a Bitcoin wallet, Externals must render GitHub connection controls even when optional email/Supabase session persistence is still pending.
- top-right BTD hover action shows the connected wallet nickname when available and otherwise shows the middle-truncated Bitcoin address; clicking it opens the Wallet auxillary pane rather than treating the balance widget as an Exchange shortcut.
- Wallet owns Bitcoin wallet identity, robust wallet-provider readout, BTC fee posture, and BTD share/range posture; Externals owns GitHub connection and future VCS/provider attachments; Profile owns optional email/contact/admin posture.
- Leather support is a first-class V28 Bitcoin wallet path. The implementation must detect `window.LeatherProvider.request`, call `getAddresses` without index-based assumptions, prefer Taproot `p2tr` for Bitcode auth when present, retain Native SegWit `p2wpkh` as the payment address, derive the account number from the returned derivation path when available, sign the Bitcode challenge with `signMessage` using explicit `paymentType` and network, and expose tested utilities for `open`, `sendTransfer`, and hex `signPsbt` so Terminal BTC fee/PSBT work can depend on the same wallet contract.
- Leather's documented Bitcoin network parameter uses `testnet`, not `testnet4`; V28 may run a Testnet4-facing staging lane, but the Leather provider call must use the provider-supported value until Leather exposes a different documented enum.
- V28 verbose QA telemetry may log wallet detection, wallet signing, local/server persistence, user-data merge, nav identity state, and BTD wallet pane entry behind `NEXT_PUBLIC_BITCODE_QA_VERBOSE=true`, `NEXT_PUBLIC_BITCODE_VERBOSE=true`, `?bitcode_verbose=true`, or `localStorage.bitcode.qa.verbose=true`.
- automated Playwright E2E coverage exists at commercial-product granularity for public home, Terminal, Auxillaries, BTD range disclosure, MCP API/ChatGPT App readiness, docs, route navigation, responsive route health, and key micro-interactions including URL-addressable Terminal activity filters, filter reset behavior, BTD data-share consent, and public docs article readability.
- Playwright tests must check browser console/page-error cleanliness, framework-overlay absence, route readability, micro-interface interaction, and stitched user flows rather than only screenshot snapshots.
- the commercial-MVP Playwright runner executes serially against one deterministic mock-mode dev server, including mocked Auxillaries profile, non-ledgerized interface preferences, data-share, notifications, Terminal activity, BTD mint/read state, and MCP/ChatGPT App readiness paths, so failures represent product regressions rather than local wallet/session availability.
- visual QA proves no framework overlay, blank page, major content overlap, or unreadable primary controls.

### Gate 3: Terminal Wallet, BTC Fee, And Read-Fit-Measuremint Workflow

Purpose:
Make user-controlled signing, BTC fee state, V27 measurement, and mint-admission law visible before the operator commits.

Acceptance criteria:

- Terminal exposes wallet connection, network, signer-session state, proof kind, and expiry.
- Terminal blocks signed settlement when wallet authorization is missing, expired, revoked, or wrong-network.
- Terminal exposes BTC fee prepared, signed, broadcast, confirmed, replaced, reorged, and failed states.
- PSBT or wallet-native unsigned handoff is visible where applicable.
- `$BTD` is never displayed as fee liquidity.
- Read measurement evidence and review decision are visible before Fit review.
- Fit review displays qualities and roots needed for settlement review.
- semantic volume, cumulative measurement, measuremint target, residual credit, token count, zero-cell reason, and refit posture are visible.
- source deposit, Read discovery, preliminary Fit, and uncommitted proof never imply minting.
- access policy id/hash is shown before mint or licensed-read commitment.
- ledgerized synthesis uses protocol-specified models and configuration; Terminal must not expose user-driven model selection for Fit, AssetPack, measurement, measuremint, proof, journal, or settlement behavior.

#### Single-deposit Reading QA

The first value-producing V28 Read/Fit QA scenario runs against the
smallest real Bitcode data-space: one deposited repository revision.
The current staging fixture happens to use `engineeredsoftware/ENGI`, but
Terminal implementation must remain repository-, owner-, branch-, and
commit-generic.

The required Read is not "does anything exist?".
It is:

> Read the deposited repository revision and determine whether it contains
> a worthy, proof-bearing path for Bitcode Terminal's wallet/GitHub readiness,
> Deposit, Read/Fit, AssetPack evidence, settlement/finality readback, and
> Supabase/ledger reconciliation flow. If the evidence is worthy, synthesize
> the minimal AssetPack; if not, return explicit no-worthy-fit or blocked
> readiness evidence.

Acceptance criteria:

- the Read cannot run until a Deposit row exists for the selected repository
  with repository, branch, commit, signer, and wallet authorization posture;
- the Read and Fit rows must carry the same repository, branch, and commit as
  the deposited source revision;
- candidate recall must prefer source and proof surfaces that explain the
  product-critical path, including Terminal Deposit/Read components, execution
  history persistence, repository source selection, wallet/GitHub readiness,
  QA SQL, and BTD/ledger proof readback;
- depository search must be a reusable AssetPack primitive, not a UI-only
  posture: every pipeline run stores searched asset count, query root, ranking
  root, selected candidate ids, rejected/blocker reasons, proof/measurement
  posture, embedding policy, and result state under the execution evidence
  tree;
- risk-admission and readiness agents have an evidence-only verification tool,
  `bitcode.asset-pack.verification`, that reads back the current depository
  search result or reruns search from pipeline input, then returns bounded
  proof, measurement, readback, source-binding, selected-candidate, blocker,
  warning, query-root, ranking-root, and embedding-policy evidence. The tool
  must not mutate state, deliver assets, mint, settle, or expose private
  AssetPack source before settlement;
- Fit evidence must include a compact selection trace for operator review:
  selected, blocked, and ranked candidates; source binding; use tier; score
  channels; selected unit hashes; proof/measurement evidence; provider recall;
  blockers; warnings; and rejection reasons. The full depository search result
  can retain candidate payloads, but the Fit result must expose this bounded
  trace directly for Terminal, SQL, and harness summaries.
- vector recall for deposited AssetPack evidence uses OpenAI
  `text-embedding-3-small` by default with `encoding_format='float'` and
  `dimensions=1536`, matching Supabase `deliverable_vectors.embedding
  vector(1536)`, `ivfflat`, `vector_cosine_ops`, and
  `match_deliverable_vectors` cosine readback. Any model or dimension override
  creates a distinct vector space and must not mix with existing rows unless the
  rows are re-embedded and the matching function/schema still agree;
- the Fit result must expose ranking quality, rejection reasons, proof roots,
  dedupe/materialization roots where available, and finality/readiness status;
- AssetPack synthesis must be protocol-specified and reproducibly evidenced;
  deterministic bring-up branches are regression scaffolds, while
  staging-testnet QA must run model-backed PTRR inference. If source
  materialization, settlement, BTC fee broadcast, ledger anchor, or BTD range
  issuance is not live, the result must state that blocker rather than imply
  delivery or minting;
- negative controls must return no-worthy-fit or clarification, not a decorative
  AssetPack, when the Read is unrelated to ENGI's deposited source or too broad
  to measure;
- SQL readback must show Deposit before Read, Read before Fit, no
  `frontier/*` or mock repository leakage, and no ledger/database drift for any
  finality that Terminal claims.
- Readback for a gate-closing run must be coherent to the latest deliverable
  run, not only aggregate row counts inside a lookback window. A failed latest
  run, missing latest-run tool rows, or cross-run-only telemetry must keep the
  gate blocked until a fresh complete run writes its own phase, agent,
  generation, tool, and settlement evidence.
- Ledger settlement evidence must carry neutral protocol fields:
  `settlementAdmissible`, `ownershipBoundary`, `btcFee`, and `readback`.
  Depositor ownership, reader fee/license posture, and server-custody state
  must be explicit even when settlement is blocked.

#### Pipeline host runtime environment for Read/Fit QA

V28 now admits a lightweight deployment harness because the first value-bearing
Read/Fit result cannot be reviewed from local posture rows alone.
The harness is not the full V34 distributed deployment program; it is the
minimum real host contract needed to prove that AssetPack pipeline execution,
agent/prompt/tool context, artifact export, and telemetry readback are running
before Terminal may classify a Read as `worthy_fit` or `no_worthy_fit`.

The V28 QA host is Vercel Sandbox.
The active host capability contract is:

- isolated Firecracker microVM execution on Amazon Linux 2023;
- default working directory `/vercel/sandbox`;
- stable documented runtimes `node26`, `node24`, `node22`, and `python3.13`,
  with `node24` as the default Bitcode harness runtime;
- `vercel-sandbox` user with sudo available for setup;
- ephemeral filesystem, requiring evidence export before sandbox stop;
- command execution, command log collection, file upload/download, exposed
  ports when explicitly requested, snapshots, and egress network policies;
- authentication through Vercel OIDC tokens from a linked project or through
  explicit access-token variables for non-Vercel environments.

The V28 pipeline harness must write a manifest before execution containing:

- Read id and Read text;
- Deposit id and optional deposited AssetPack id;
- Deposit proof root, measurement root, and reconciliation readback root.
  When a recorded Deposit activity already asserts wallet/attestation proof
  and asset measurement posture but has not stored root fields, the harness
  must materialize deterministic manifest-bound roots from the Deposit id,
  AssetPack id, Read id, repository, branch, and commit. These roots are
  admissible as harness evidence roots for candidate recall and Fit review;
  they are not external finality claims and still require SQL/ledger readback
  before settlement.
- repository full name, branch, and commit;
- host capability summary;
- expected stages: deposit search, candidate ranking, Read comprehension,
  AssetPack synthesis, validation, Finish, and telemetry readback;
- expected SQL evidence surfaces: `executions`, `execution_events`,
  `pipeline_runs`, `run_jobs`, `stream_logs`, `phase_executions`,
  `deliverable_pipeline_runs`, `deliverable_pipeline_events`,
  `deliverable_pipeline_phase_delegations`, `deliverable_pipeline_agent_steps`,
  `deliverable_pipeline_generations`, and `deliverable_pipeline_tool_executions`;
- PTRR agent executions must resolve the evidence tools registered by their
  parent pipeline execution. A requested evidence tool must either execute and
  persist tool telemetry or fail as typed blocked-readiness evidence; missing
  registry linkage is not admissible live-pipeline behavior. Artifact stream
  events must carry the tool name, input/output/error presence, and ok/error
  state so Terminal and SQL readback show which evidence tool ran.
- admissible result states `worthy_fit`, `no_worthy_fit`, and
  `blocked_readiness`;
- redacted command-environment names only, never secret values.
- optional QA-only source overlay metadata when a local patch is applied before
  dependency installation. Overlay evidence is not source-revision proof and
  cannot support settlement or finality.

The harness has two admissible modes:

- `host_smoke`: proves Vercel Sandbox creation, command execution, artifact
  export, and stop/cleanup. This mode always produces `blocked_readiness`
  because it does not invoke the AssetPack pipeline.
- `asset_pack_pipeline`: clones or mounts the selected repository revision,
  installs workspace dependencies, builds the manifest Deposit into searchable
  depository supply, invokes the AssetPack pipeline entrypoint, exports
  evidence and telemetry artifacts, and relies on SQL readback before any
  result is accepted.

If a local source overlay is used to debug the harness before deployment, the
run must report `sourceOverlay.admissibility` as
`qa-only-not-source-revision-evidence` and fail closed for
settlement review even when the pipeline output itself contains a worthy
classification. The same implementation must exist at the deposited source
revision before that result can become source-bound evidence.

Read/Fit result review remains fail-closed:

- `worthy_fit` requires source-bound pipeline output plus event, phase, agent,
  generation/tool, proof/readiness, and ledger/database readback evidence.
- `no_worthy_fit` requires source-bound rejection reasons from the pipeline,
  not absence of UI posture alone.
- `blocked_readiness` is mandatory when source materialization, model/tool
  credentials, telemetry persistence, BTC fee, ledger anchor, settlement,
  AssetPack range projection, or finality readback is unavailable.
- staging-testnet Read/Fit QA must run model-backed inference.
  `BITCODE_ASSET_PACK_REAL_INFERENCE=1` is the deployment-level switch for the
  AssetPack pipeline. Deployed route-streaming runs should use
  `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded`: setup, synthesis,
  validation, and Finish stay model-backed while deterministic source-bound
  depository discovery preserves enough route budget to synthesize, ship, and
  read back the AssetPack. `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=full`
  is reserved for the later long-running async completion gate described below;
  the current deployed Terminal route must reject it until sandbox completion
  pushes finished state to a server-side stream/socket handler. A run with
  omitted per-agent `*_USE_PTRR` flags is not an acceptable staging posture
  unless the global real-inference flag and explicit profile are present.
- manifest-only Deposit supply can satisfy candidate recall but cannot produce
  `worthy_fit` unless proof and measurement posture are explicitly visible to
  the pipeline input and the downstream readback queries confirm them. Boolean
  wallet/measurement posture must be converted into deterministic
  manifest-bound proof, measurement, and reconciliation roots before Fit
  evaluation; if that conversion cannot be made, the run must return explicit
  `blocked_readiness`. Manifest-bound roots support Read/Fit selection but do
  not claim BTC fee broadcast, BTD minting, or external ledger finality.
- every SDIVF phase, PTRR agent step, ThriceifiedGeneration, and tool execution
  must be inspectable as prompt/context input, raw model/tool output,
  parsed/typed output, usage/timing metadata, and phase/agent/step/failsafe
  correlation. A harness failure must still export the execution tree so
  operators can debug the last successful sub-execution.
- tool telemetry includes both direct `tool-use` emissions and stored
  `tools/*` status results from pipeline delivery work. Depository search,
  evidence verification, branch creation, file write, and pull-request creation
  must appear in the generic event stream and, when database streaming is
  enabled, in `deliverable_pipeline_tool_executions` with sanitized input,
  output, error, and phase/agent/step correlation.
- artifact telemetry must subscribe to stream events even when database
  streaming is disabled; database persistence is an additional acceptance gate,
  not the only way to inspect a live failed run.
- the deployed Terminal harness stream must expose sandbox id, run id, and
  incremental telemetry artifact lines while the detached sandbox command is
  still running. Browser-only Network inspection is not sufficient; the
  operator-visible stream must show phase, agent, generation/tool, parsed
  output, and failsafe context as first-class Read/Fit run evidence. Terminal
  must render these events through the canonical Bitcode execution stream panel
  shape so Read/Fit live runs are visually consistent with persisted execution
  activity and retain expandable raw metadata per line.
- the harness must enforce an internal runtime budget before the caller's host
  timeout, producing a `blocked_readiness` artifact rather than allowing the
  host to terminate without evidence.
- secrets for wallets, GitHub, model providers, Supabase service roles, or
  other systems may be passed into a sandbox only by explicit allowlist or
  brokered network policy; routine QA artifacts must show only redacted names.
- pull-request delivery should normally use the reader's authenticated GitHub
  App connection. For trusted local/staging harness QA, an operator token may be
  supplied only by setting `BITCODE_VCS_ALLOW_ENV_TOKEN_FALLBACK=1` and
  explicitly forwarding `GITHUB_TOKEN` through the sandbox allowlist; VCS tools
  must read that token from process environment without placing it in tool
  inputs, artifact telemetry, or database stream rows.
- `BITCODE_LLM_PROVIDER` and `BITCODE_LLM_MODEL` may pin the model path for
  reproducible generation; otherwise the runtime selects the available provider
  from credential posture, with OpenAI accepted when `OPENAI_API_KEY` is the
  only model credential present. A provider pin without a matching forwarded
  credential is not an admissible reason to require that provider.
- the deployed staging trigger may use Vercel's automatic Sandbox OIDC, but it
  still needs a server-side model credential such as `OPENAI_API_KEY`, real
  Supabase admin/service-role credentials for telemetry persistence, and a
  runtime budget that is shorter than the enclosing Vercel Function window.
- Supabase and Vercel deployments are lane-specific. V28 Read/Fit gate evidence
  is staged against the staging-testnet Supabase project
  `tkpyosihuouusyaxtbau`, whose Data API origin is
  `https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/` and whose DB readback host
  is `db.tkpyosihuouusyaxtbau.supabase.co`. The production-mainnet Supabase
  project is a separate lane and must not satisfy staging-testnet readback,
  telemetry, settlement, or preview-deployment acceptance.
- Vercel preview deployments must be branch-scoped to the staging-testnet lane:
  staging previews use the staging-testnet Supabase Data API/admin keys, DB URL,
  model credentials, and Sandbox auth; production deployments use the
  production-mainnet Supabase project. A preview deployment that combines
  staging DB readback with production-mainnet REST keys is invalid even when
  one side can read rows.
- a local application deployment may stand in for route/UI implementation QA
  when live deployment is explicitly out of scope. In that mode the operator
  must run the Terminal application locally with
  `BITCODE_PIPELINE_HARNESS_REQUIRE_REAL_INFERENCE=1`,
  `BITCODE_ASSET_PACK_REAL_INFERENCE=1`,
  `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded`, aligned Supabase
  admin credentials, OpenAI credentials, and Vercel Sandbox local auth.
  `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_DB_URL` /
  `DATABASE_URL`, when both are present, must resolve to the same Supabase
  project, and anon JWTs must not satisfy admin-key preflight. Mixed REST/DB
  project refs are a fail-closed condition because they make telemetry and
  ledger settlement readback non-comparable. Local UAPI runs may load a
  branch-scoped root env file through `BITCODE_UAPI_ENV_FILE` so placeholder
  package-local env files do not override the accepted lane.
  Local application deployment evidence can prove route preflight, canonical
  stream rendering, artifact streaming, and SQL readback behavior, but it
  cannot close a live source-revision settlement/finality gate unless the same
  source and database/ledger rows are read back from the accepted environment.

### Gate 4: Terminal AssetPack Range Detail

Purpose:
Make AssetPack range ownership and read-right state readable from registry facts.

Acceptance criteria:

- Terminal exposes AssetPack id, range boundaries, cell count, proof root, source manifest root, access policy id/hash, and ledger anchor state.
- owner-read, licensed-read, and denied branches are distinct.
- aggregate compatibility balances are not treated as canonical ownership truth.
- route and UI labels describe AssetPack ranges and read rights, not fungible balances.

### Gate 5: Terminal Journal Diff And Reconciliation

Purpose:
Make ledger/database drift visible and repairable without raw JSON inspection.

Acceptance criteria:

- Terminal transaction detail reads Terminal journal entries.
- ledger observed facts, database projected facts, and metaphysical canonical facts are separated.
- confirmed, reorged, and failed ledger facts block contradictory projections.
- repair receipts and blocking drift reasons are visible.
- operator can distinguish retryable, repairable, and approval-required states.

### Gate 6: Terminal Organization And Access Policy

Purpose:
Make team, organization, MCP, ChatGPT App, and read-license decisions registry-derived.

Acceptance criteria:

- organization holdings and read-license usage read from registry/range/license state.
- MCP-triggered and ChatGPT App-triggered actions use owner-read or licensed-read checks rather than aggregate holding gates.
- policy templates cover owner-read, licensed-read, derivative use, redistribution, confidentiality, dispute, and takedown posture.
- Terminal copy avoids price-appreciation, dividend, copyright-transfer, or marketplace-royalty promises.

### Gate 7: Terminal Operations And Testnet Readiness

Purpose:
Make V27 deployment lanes and crypto telemetry operable from Terminal.

Acceptance criteria:

- local, regtest, signet, public testnet, mainnet-ready, and mainnet-value-bearing lanes are displayed with correct approval posture.
- value-bearing mainnet requires approval root.
- broadcaster/observer health and telemetry severity are visible.
- upgrade, rollback, migration, and generated-type refresh state is visible where applicable.
- GitHub-only VCS readiness is honest; broader provider work remains outside V28 MVP QA unless required by the active surface.
- realistic testnet BTD-AssetPack minting uses synthetic measurement receipts, Terminal journal rows, ledger anchors or ledger-observed placeholders, and database projections that can be diffed and repaired.
- Bitcoin Taproot/PSBT posture is first-class; BSC/opBNB/Binance Web3 Wallet pilots remain future bridge/distribution work unless they are represented as disabled readiness or documentation notes.

### Gate 8: V28 Promotion Proof

Purpose:
Promote V28 only after commercial Protocol/Terminal MVP QA, Terminal readiness productization, MCP/ChatGPT App MVP readiness, tests, proof, and documentation are closed.

Acceptance criteria:

- V28 SPEC, DELTA, NOTES, PARITY, and PROVEN are synchronized.
- package/API, ORM, protocol-demonstration, UAPI route, Terminal UI, and build checks pass.
- unversioned-route scan passes.
- V29 Terminal depth, V30 Protocol/BTD hardening, V31 Auxillaries depth, V32 provation/testing depth, V33 interface depth beyond the V28 MVP, V34 deployment depth, V35 telemetry/documenting depth, and V36+ Exchange/Conversations depth are explicitly staged.
- `BITCODE_SPEC.txt` remains V27 until the final promotion step.

## Draft Boundary

This V28 SPEC is draft-target material.
It is not promoted canon until V28 gates close and `BITCODE_SPEC.txt` is explicitly promoted from `V27` to `V28`.

## Version executive summary

V28 is the commercial Protocol implementation and Terminal MVP QA/hardening version for the promoted V27 `$BTD` and crypto rails.
The version makes Terminal, Auxillaries, BTD disclosure, MCP API, ChatGPT App, auth/readiness, wallet/BTC/testnet flows, and route navigation commercially coherent while turning registry, wallet, BTC fee, AssetPack range, access, journal, reconciliation, telemetry, and upgrade primitives into operator-readable workflows.
Exchange and website Conversations are not part of V28 closure.

## Canonical Bitcode executive summary

Bitcode remains a proof-bearing technical knowledge exchange.
V28 keeps V27 tokenomics canon intact while making the commercial Protocol implementation coherent enough for source-to-shares work, with Terminal as the primary operator surface.

## source-of-truth hierarchy

The hierarchy is:

1. `BITCODE_SPEC.txt` points to the active canon, currently `V27`.
2. `BITCODE_SPEC_V27.md` and `BITCODE_SPEC_V27_PROVEN.md` are the active promoted law and proof appendix.
3. `BITCODE_SPEC_V28.md`, DELTA, NOTES, and PARITY are draft-target material.
4. V27 package/API/database primitives are source-bearing implementation truth.
5. Terminal UI and route reads must adapt those primitives without redefining them.

## full-system, re-implementation, and audit rule

V28 implementation must audit the whole Terminal path before claiming closure.
Re-implementation is allowed only when it removes compatibility confusion or exposes V27 truth more directly.
No `_legacy/` source is active source truth.

## totality and precision enforcement rule

Every Terminal claim about wallet state, BTC fees, `$BTD`, AssetPack ranges, licensed reads, journal finality, or reconciliation must point to a package primitive, API route, database projection, receipt, ledger fact, or proof artifact.
If that pointer is missing, Terminal must block, label the missing readiness condition, or show the state as unproved.

## system goals, non-goals, and design principles

Goals:

- Terminal makes V27 crypto rails usable.
- operator reads are registry-derived.
- readiness failures are explicit and recoverable.
- proofs and receipts remain inspectable without raw JSON dependence.

Non-goals:

- no Exchange route/product closure;
- no website Conversations interface closure;
- no external-provider completion beyond honest readiness disclosure;
- no value-bearing mainnet launch;
- no new `$BTD` supply law.

Design principles:

- preserve V27 laws;
- prefer exact read models over marketing copy;
- fail closed on wallet, fee, ledger, policy, or projection drift;
- stage later-version work explicitly.

## system architecture and layer boundaries

V28 keeps these layer boundaries:

- `packages/btd`: protocol primitives and receipt constructors.
- `packages/api`: service-owned admission and route builders.
- `packages/orm` plus migrations: registry and projection persistence.
- `uapi/app/api`: unversioned Next route wrappers.
- `/terminal` plus `uapi/app/terminal`: Terminal route surface.
- `uapi/app/terminal`: Terminal implementation module retained as an internal component boundary while the prior generic workspace route remains absent.
- `uapi/app/btd/[assetPackId]`: AssetPack range disclosure surface.
- MCP API and ChatGPT App: V28 MVP interface surfaces over registry-derived policy and proof truth.
- `protocol-demonstration`: minimal deterministic protocol witness. It may
  contain a local source-bound fit-finding loop for E2E proof, but
  it must not import workspace packages or be imported by product runtime
  code.

## canonical domain model

The V28 domain model is:

- Read: measured demand reviewed before Fit.
- Fit: accepted source-to-Read match with reviewable quality.
- AssetPack: source-bearing output and commercial registry range object.
- `$BTD` cell: non-fungible source-share/read-right registry cell.
- AssetPack range: contiguous commercial transfer object.
- BTC fee transaction: fee receipt and ledger-observed payment state.
- Terminal journal entry: operator transaction event with settlement sequence.
- reconciliation repair: proof of ledger/database drift handling.
- access policy: owner-read, licensed-read, denial, derivative, redistribution, confidentiality, dispute, and takedown rule binding.

## whole Bitcode operator chain

The V28 operator chain is Readiness -> Read -> Fit -> Proof -> Measuremint -> Fee -> Anchor -> Range -> Read -> Journal -> Reconcile -> Protocol readback.
Every link must make proof or readiness state visible.

## staged Reading acceptance path

V28 separates Reading into distinct reviewable stages so readers can decide
whether Bitcode understood the need before Bitcode exposes or settles
source-bearing AssetPack material.

The staged Reading path is:

1. **Need synthesis.** The user Read request is input to a Need pipeline. The
   pipeline synthesizes a measured Need object with requirements, closure
   criteria, failure modes, target artifact kinds, source constraints,
   proof/settlement expectations, and pricing measurement inputs. Terminal
   shows this Need in full detail. The user can accept it or request another
   synthesis with feedback. No depository Fit search, BTC fee, BTD mint, or
   AssetPack source disclosure is allowed before Need acceptance.
2. **Need-Fit synthesis.** An accepted Read-Need is input to the AssetPack
   synthesis pipeline. This stage searches the deposited asset-space, ranks
   candidates, measures candidate fit against the Need measurement, synthesizes
   the candidate AssetPack, and returns `worthy_fit`, `no_worthy_fit`, or
   `blocked_readiness` with proof-bearing search/fit telemetry.
3. **Source-safe preview.** A worthy synthesized AssetPack is previewed without
   leaking the full source. Preview may show Need measurement, Fit measurement,
   selected candidate ids, roots, score bands, proof posture, ownership
   boundary, settlement boundary, and price; it must not show protected source
   material before payment/right settlement.
4. **Settle and unlock.** Settlement records the reader BTC fee, mints or
   assigns the BTD range according to the standing supply law, writes ownership
   and read-license rows, anchors/journals the event, and only then unlocks the
   full AssetPack source/right surface to the buyer/reader.

The reader question therefore splits into two explicit operator questions:

- Does Bitcode understand the Read's Need?
- Did Bitcode find and synthesize a match good enough to preview confidently
  and pay for in BTC without source-IP leakage?

These stages are separately addressable in Terminal and separately journaled in
the database/ledger readback. A Need stage run cannot be reused as a Fit result
unless the accepted Need id, Need measurement root, user review state, feedback
history, and synthesis telemetry are present. A Need-Fit run cannot be promoted
unless the input Need id and accepted Need measurement root match the latest
accepted Need revision. Preview cannot unlock source-bearing payloads.
Settlement cannot proceed unless the previewed AssetPack id, fee quote, BTD
range projection, wallet authorization, BTC fee transaction, ownership boundary,
journal entry, and ledger/database readback all agree.

The product pipeline now carries a typed `bitcode.read.need` object before
Need-Fit search. The Need object contains `needId`, `measurementRoot`,
requirements, closure criteria, failure modes, target artifact kinds, source
constraints, proof expectations, pricing measurement inputs, review state, and
feedback history. Strict Need-Fit execution is admitted only when
`acceptedReadNeed` is present and has `reviewState='accepted'`; otherwise the
pipeline returns `blocked_readiness` before depository candidate recall. The
Vercel Sandbox harness synthesizes and accepts a Need before invoking the
bounded source-bound AssetPack pipeline so the closed staging-testnet evidence
path remains runnable while Terminal moves to the separate user review step.
`BITCODE_PIPELINE_REQUIRE_ACCEPTED_READ_NEED=1` or request-level
`requireAcceptedReadNeed=true` activates the strict boundary for API and route
callers.

The protocol demonstration carries only the minimal deterministic witness of
this path: local Need synthesis, explicit Need acceptance, local Need-Fit
ranking over fixture deposits, source-safe preview, and deterministic fee-quote
shape. It must remain self-contained and must not import the product pipeline,
registry, prompt, agent, Vercel, Supabase, UAPI, or package implementations.
Product code may compare against the witness, but it must own its own runtime
implementation.

### Share-to-Fee measurement clarity

V28 keeps the standing supply law intact while sharpening the initial
deterministic pricing/readiness interface. The initial Share-to-Fee calculation
must be deterministic from recorded measurements:

- each Need measurement vector dimension has a volume and a measurement weight;
- each candidate Fit measurement vector is evaluated against the accepted Need
  measurement vector;
- the priced measurement volume is the weighted admitted volume after fit,
  quality, proof, and settlement eligibility gates;
- the initial deterministic shape is
  `sum(measurement_weight * measurement_volume * admitted_fit_quality)` before
  applying the configured BTC fee schedule;
- BTC price is derived from that priced measurement volume by the configured
  staging-testnet fee schedule and recorded as a reader fee quote;
- the quote is previewable before payment, but source contents and licensed
  read rights are not unlocked until settlement readback succeeds.

This pricing path is a V28 product acceptance target, but it must remain
fail-closed: if the Need measurement, Fit measurement, fee schedule, wallet
authorization, BTC fee, BTD range, or ledger readback is missing, the Terminal
shows blocked readiness rather than implying settlement.

### Long-running full-profile pipeline gate

The current V28 route-streaming gate uses
`BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded` because the Vercel Function
route can stream live progress and collect artifacts only inside its request
window. `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=full` is scoped to a
subsequent V28 gate.

That later gate may run for dozens of minutes in Vercel Sandbox. The sandbox
execution itself must push finished result state, artifacts, and readback
signals to a server-side stream/socket handler or durable queue; the route that
starts the run must not be responsible for waiting synchronously for the final
result. The push must be correlated by the pipeline run id, authenticated
without exposing Vercel/OAI/Supabase/GitHub secrets inside routine telemetry,
idempotent across retries, and durable before the sandbox stops. Terminal must
be able to reattach by run id and stream both in-flight events and final
artifact/readback state after the starter HTTP request has ended.

Full-profile acceptance requires the same evidence as bounded profile plus
durable async completion delivery, resumable status readback, explicit timeout
and retry accounting, and Terminal reattachment to the live execution stream.
Until that gate exists, `full` is a preflight blocker on the deployed route and
`bounded` remains the current staging-testnet profile for closing the
source-bound Read/Fit -> AssetPack -> Finish -> ledger readback gate.

## canonical subsystem surfaces

### Depositing and asset supply

Current canonical objects and emitted artifacts: source roots, source manifests, AssetPack evidence, `.bitcode/selected-source-material.json`.
Current algorithms and derivation rules: source is admitted only through Read/Fit/proof and does not mint by deposit alone.
Current invariants and fail-closed conditions: invalid deposit blocks downstream commitment.
Current proof obligations: show repository/source scope and manifest roots.
Current source-bearing implementation basis: Terminal source selectors, execution source evidence, protocol-demonstration source witnesses.
Current validating commands and parity basis: protocol-demonstration tests and Terminal route checks.
Current accepted boundaries: V28 does not complete every external provider.

### Reading and prompt/inference ownership

Current canonical objects and emitted artifacts: Read text, Read measurement receipt, prompt trace, inference receipt.
Current algorithms and derivation rules: reading and measured demand are reviewed before fit.
Current invariants and fail-closed conditions: prompt contract incompleteness blocks proof-bearing settlement.
Current proof obligations: bind prompt, model/provider, source scope, and measurement evidence.
Current source-bearing implementation basis: `uapi/app/terminal`, `uapi/app/executions`, prompt system notes.
Current validating commands and parity basis: package/API tests and Terminal UI tests.
Current accepted boundaries: V28 productizes Terminal reads without redefining inference law.

### Fit, recall, ranking, and verification

Current canonical objects and emitted artifacts: Fit review rows, depository search results, recall candidates, verification decisions, selected candidate ids, query roots, ranking roots, embedding policy.
Current algorithms and derivation rules: deposit-to-read fit, recall, vector/lexical source-bound ranking, proof/measurement gating, and verification decisions are explicit before settlement.
Current invariants and fail-closed conditions: no-survivor asset pack blocks range commitment; broad Reads block readiness; unrelated Reads return no-worthy-fit; mock/frontier repository leakage blocks readiness; embedding model/dimension drift blocks vector recall promotion.
Current proof obligations: prove candidate qualities, rejection reasons, source revision binding, proof posture, measurement posture, embedding model/dimensions/vector store, and ranking determinism.
Current source-bearing implementation basis: AssetPack depository-search primitive, pipeline harness host package, protocol-demonstration local Read/Fit witness, and UAPI execution components.
Current validating commands and parity basis: AssetPack depository-search tests, pipeline harness tests, demonstration fit-finding tests, and UAPI route tests.
Current accepted boundaries: V28 does not add broad market discovery.

### Selection and materialization

Current canonical objects and emitted artifacts: selected AssetPack material, branch artifacts and assetPackEvidence, `.bitcode/asset-pack.lock.json`.
Current algorithms and derivation rules: selected source material must be replayable and materialized through admitted paths.
Current invariants and fail-closed conditions: unverified materialization cannot imply settlement.
Current proof obligations: selection and materialization must bind source roots, proof roots, and output contents.
Current source-bearing implementation basis: AssetPack pipeline, execution detail routes, evidence storage.
Current validating commands and parity basis: AssetPack and UAPI build/test checks.
Current accepted boundaries: storage-edge names are compatibility corridors only.

### Identity, authorization, and sensitive flow

Current canonical objects and emitted artifacts: wallet session, authorization proof, access policy, BTC fee receipt.
Current algorithms and derivation rules: identity, authority, signing, and policy are verified before signed settlement.
Current invariants and fail-closed conditions: authorization denial blocks wallet-signed actions.
Current proof obligations: prove user-controlled signing and no server custody.
Current source-bearing implementation basis: `packages/btd/src/wallet.ts`, `bitcoin-fees.ts`, profile/wallet API helpers.
Current validating commands and parity basis: package/API tests and Terminal wallet UX tests.
Current accepted boundaries: value-bearing mainnet requires approval.

### Disclosure and projection

Current canonical objects and emitted artifacts: public projection, private/metaphysical canonical facts, redaction policy, `.bitcode/projection-policy.json`.
Current algorithms and derivation rules: projection, disclosure, and redaction separate public proof from private licensed reads.
Current invariants and fail-closed conditions: public projection overexposure blocks disclosure.
Current proof obligations: prove read-right branch and policy hash.
Current source-bearing implementation basis: BTD access route, BTD range page, Terminal projection, and registry/database projection.
Current validating commands and parity basis: route tests and browser checks.
Current accepted boundaries: legal template finality is staged.

### Settlement and exact accounting

Current canonical objects and emitted artifacts: measuremint receipt, allocation receipt, revenue route, Terminal journal, `.bitcode/source-to-shares.json`.
Current algorithms and derivation rules: settlement, source-to-shares, journals, and exact accounting conserve cells and sats.
Current invariants and fail-closed conditions: settlement conservation drift blocks commitment.
Current proof obligations: prove allocation totals, BTC fee asset, ledger finality, and reconciliation repair.
Current source-bearing implementation basis: `packages/btd/src/measuremint.ts`, `allocation.ts`, `revenue.ts`, `terminal-journal.ts`, `reconciliation.ts`.
Current validating commands and parity basis: package/API/ORM tests.
Current accepted boundaries: V29 owns broader market depth.

### Proof contract, witnesses, and replay

Current canonical objects and emitted artifacts: proof families, members, theorems, witnesses, and replay; `.bitcode/system-proof-bundle.json`.
Current algorithms and derivation rules: proof replay must reconstruct the same visible Terminal state.
Current invariants and fail-closed conditions: stale promoted status truth blocks promotion.
Current proof obligations: bind V28 proof artifacts to implementation, tests, and operator surfaces.
Current source-bearing implementation basis: protocol-demonstration proof generator and `.bitcode/v28-*` artifacts.
Current validating commands and parity basis: spec-family, canon-posture, test, build, route, and diff checks.
Current accepted boundaries: V28 PROVEN is generated only at promotion.

## proof-family canon

V28 inherits the Bitcode proof-family canon and adds commercial Protocol/Terminal MVP QA plus Terminal readiness productization members.

## generated canon

V28 generated canon begins with `.bitcode/v28-gate-1-draft-opening-proof.json`.
Promotion must add `.bitcode/v28-spec-family-report.json`, `.bitcode/v28-canonical-input-report.json`, and `BITCODE_SPEC_V28_PROVEN.md`.

## validation canon

Minimum V28 validation includes spec-family checks, canon-posture drift checks, JSON checks, unversioned-route scan, package/API/ORM tests, protocol-demonstration tests, Terminal UI checks, commercial-MVP Playwright E2E tests, UAPI build, and `git diff --check`.

## promotion canon

Promotion requires V28 PROVEN, synchronized SPEC/DELTA/NOTES/PARITY, closed gates, route scan, test/build proof, and explicit update of `BITCODE_SPEC.txt` from `V27` to `V28`.

## appendices and canonical supporting material

The appendices below are draft scaffolding for V28 proof closure.

## accepted boundaries and reopen conditions

Accepted boundaries:

- V29 owns deeper Terminal.
- V30 owns Protocol/BTD hardening discovered during V28/V29; Exchange moves beyond V35.
- V31 owns deeper Auxillaries.
- V32 owns deeper provation and testing.
- V33 owns deeper Interfaces beyond the V28 MCP API and ChatGPT App MVP.
- V34 owns deeper Deployment.
- V35 owns deeper telemetry and documenting.
- V36+ owns deeper Exchange and website Conversations.
- value-bearing mainnet is separately approved.

Reopen conditions:

- V28 contradicts V27 `$BTD` law;
- Terminal displays aggregate compatibility balances as ownership;
- UAPI route implementation is versioned;
- wallet or BTC fee state can bypass authorization;
- ledger/database drift is hidden.

## completion condition

V28 is complete only when commercial Protocol/Terminal MVP QA, Terminal readiness productization, MCP/ChatGPT App MVP readiness, tests, documentation, proof, and promotion are closed.

## Appendix A. Canonical type and surface catalog

Canonical types include TerminalWalletReadiness, TerminalBtcFeeReadiness, TerminalReadFitRead, TerminalMeasuremintRead, TerminalAssetPackRangeRead, TerminalReadRightRead, TerminalJournalDiffRead, TerminalOrganizationBtdRead, and TerminalOperationalHealthRead.

Canonical V28 surfaces include `/terminal`, `/auxillaries/*`, `/btd/[assetPackId]`, unversioned `/api/btd/*` routes, MCP API routes, ChatGPT App entrypoints, and the protocol-demonstration witness runtime. Exchange and website Conversations are deferred beyond V35. the prior generic workspace route is fully retired and must redirect to `/terminal`.

## Appendix B. Proof family closure catalog

### Exact proof-family inventory matrix

| proofFamily | proofArtifactPath | memberIds | theoremIds | replayStepIds | witnessArtifactPaths | Current source basis |
| --- | --- | --- | --- | --- | --- | --- |
| Inference-synthesis | `.bitcode/v28-inference-synthesis-proof.json` | terminal-read-measurement | v28-terminal-read-proof | replay-terminal-read | prompt traces, source roots | Terminal Read/Fit reads |
| Prompt-completeness | `.bitcode/v28-prompt-completeness-proof.json` | terminal-prompt-contract | v28-prompt-contract-proof | replay-prompt-contract | prompt inventory | prompt system and Read measurement |
| Static-code-analysis | `.bitcode/v28-static-code-analysis-proof.json` | terminal-source-scan | v28-source-scan-proof | replay-source-scan | source manifests | source and package audits |
| Verification-decisions | `.bitcode/v28-verification-decisions-proof.json` | fit-review-quality | v28-fit-quality-proof | replay-fit-quality | verification reports | Fit/verification routes |
| Selection-and-materialization | `.bitcode/v28-selection-materialization-proof.json` | assetpack-range-detail | v28-range-detail-proof | replay-range-detail | AssetPack evidence | range and evidence surfaces |
| Authorization-and-sensitive-flow | `.bitcode/v28-authorization-sensitive-flow-proof.json` | wallet-fee-access | v28-wallet-fee-proof | replay-wallet-fee | wallet and fee receipts | wallet, BTC fee, access routes |
| Settlement-source-to-shares | `.bitcode/v28-settlement-source-to-shares-proof.json` | measuremint-journal-reconcile | v28-settlement-proof | replay-settlement | source-to-shares receipts | measuremint, allocation, journal, reconciliation |
| Disclosure-boundary | `.bitcode/v28-disclosure-boundary-proof.json` | read-right-policy | v28-disclosure-proof | replay-disclosure | projection policies | access, policy, public/private reads |
| Proof-contract | `.bitcode/v28-proof-contract-proof.json` | v28-proven-closure | v28-proof-contract | replay-proof-contract | V28 proof bundle | spec/proven generation |

### Inference-synthesis

proofArtifactPath: `.bitcode/v28-inference-synthesis-proof.json`
members: terminal Read measurement, Fit read, operator synthesis context.
theoremIds: v28-terminal-read-proof.
replayStepIds: replay-terminal-read.
witnessArtifactPaths: prompt traces, source roots.
current member closure criteria: Terminal shows Read evidence and inference posture.
current member verdict shape: closed, blocked, or needs-review.
current theorem-by-theorem closure reading: every synthesized Read must bind source and prompt evidence.
current theorem-to-replay grouping: Read, Fit, and synthesis replay are grouped by Terminal transaction.
minimum artifact/replay binding set: Read text, source root, prompt root, inference receipt.
current proof-object fields: proofId, memberId, theoremIds, replayStepIds, sourceRoots.
generated-artifact and test bindings: protocol-demonstration and UAPI route tests.
fail-closed conditions: prompt contract incompleteness or missing source root.

### Prompt-completeness

proofArtifactPath: `.bitcode/v28-prompt-completeness-proof.json`
members: Read prompts, Fit prompts, operator review prompts.
theoremIds: v28-prompt-contract-proof.
replayStepIds: replay-prompt-contract.
witnessArtifactPaths: prompt inventory.
current member closure criteria: prompt renders all required Read/Fit fields.
current member verdict shape: complete or incomplete.
current theorem-by-theorem closure reading: every prompt owns its output contract.
current theorem-to-replay grouping: prompt and parsed output replay together.
minimum artifact/replay binding set: prompt id, rendered text, parser contract, validation receipt.
current proof-object fields: promptId, promptRoot, parserRoot, verdict.
generated-artifact and test bindings: prompt inventory checks.
fail-closed conditions: missing parser contract.

### Static-code-analysis

proofArtifactPath: `.bitcode/v28-static-code-analysis-proof.json`
members: source scan, route scan, residue scan.
theoremIds: v28-source-scan-proof.
replayStepIds: replay-source-scan.
witnessArtifactPaths: source manifests.
current member closure criteria: active source excludes `_legacy/` and route scan is unversioned.
current member verdict shape: clean, deferred, or blocking.
current theorem-by-theorem closure reading: every active source finding is classified.
current theorem-to-replay grouping: scan query and result artifact.
minimum artifact/replay binding set: query, source set, result count, classification.
current proof-object fields: proofId, query, findings, deferrals.
generated-artifact and test bindings: parity matrix and proof JSON.
fail-closed conditions: versioned route or active stale canon pointer.

### Verification-decisions

proofArtifactPath: `.bitcode/v28-verification-decisions-proof.json`
members: Fit review, validation decision, repair decision.
theoremIds: v28-fit-quality-proof.
replayStepIds: replay-fit-quality.
witnessArtifactPaths: `.bitcode/verification-report.json`.
current member closure criteria: verification decisions are visible before settlement.
current member verdict shape: accepted, rejected, remeasure, repair.
current theorem-by-theorem closure reading: every accepted Fit has reviewable quality.
current theorem-to-replay grouping: Fit quality and settlement admission.
minimum artifact/replay binding set: Fit id, quality rows, verification root.
current proof-object fields: fitId, qualityRows, verdict, proofRoot.
generated-artifact and test bindings: Fit and route tests.
fail-closed conditions: no-survivor asset pack.

### Selection-and-materialization

proofArtifactPath: `.bitcode/v28-selection-materialization-proof.json`
members: AssetPack selection, range detail, materialized output.
theoremIds: v28-range-detail-proof.
replayStepIds: replay-range-detail.
witnessArtifactPaths: `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`.
current member closure criteria: Terminal reads AssetPack range and materialized evidence.
current member verdict shape: materialized, pending, blocked.
current theorem-by-theorem closure reading: selected material binds to range proof.
current theorem-to-replay grouping: AssetPack id and range id.
minimum artifact/replay binding set: AssetPack id, range start/end, source root, proof root.
current proof-object fields: assetPackId, range, proofRoot, sourceManifestRoot.
generated-artifact and test bindings: range route and UAPI build.
fail-closed conditions: missing AssetPack evidence.

### Authorization-and-sensitive-flow

proofArtifactPath: `.bitcode/v28-authorization-sensitive-flow-proof.json`
members: wallet, fee, policy, read-right.
theoremIds: v28-wallet-fee-proof.
replayStepIds: replay-wallet-fee.
witnessArtifactPaths: wallet session, BTC fee receipts, access receipts.
current member closure criteria: signer-session and BTC fee state are visible and fail closed.
current member verdict shape: authorized, expired, revoked, wrong-network, denied.
current theorem-by-theorem closure reading: no signed action proceeds without authorization proof.
current theorem-to-replay grouping: wallet session, fee receipt, policy decision.
minimum artifact/replay binding set: wallet id, proof kind, network, fee receipt, policy hash.
current proof-object fields: walletId, sessionState, finalityState, accessDecision.
generated-artifact and test bindings: package/API wallet and fee tests.
fail-closed conditions: authorization denial.

### Settlement-source-to-shares

proofArtifactPath: `.bitcode/v28-settlement-source-to-shares-proof.json`
members: measuremint, allocation, revenue, journal, reconciliation.
theoremIds: v28-settlement-proof.
replayStepIds: replay-settlement.
witnessArtifactPaths: `.bitcode/source-to-shares.json`.
current member closure criteria: Terminal reads exact accounting and drift status.
current member verdict shape: conserved, drift, repaired, blocked.
current theorem-by-theorem closure reading: cells and sats are conserved.
current theorem-to-replay grouping: settlement sequence and Terminal journal root.
minimum artifact/replay binding set: measurement, receipt, allocation, fee, journal, reconciliation.
current proof-object fields: exchangeSequence, range, sats, routes, repairs.
generated-artifact and test bindings: package/API/ORM tests.
fail-closed conditions: settlement conservation drift.

### Disclosure-boundary

proofArtifactPath: `.bitcode/v28-disclosure-boundary-proof.json`
members: public proof, private read, licensed read, policy display.
theoremIds: v28-disclosure-proof.
replayStepIds: replay-disclosure.
witnessArtifactPaths: `.bitcode/projection-policy.json`.
current member closure criteria: Terminal separates public proof from private licensed reads.
current member verdict shape: public, owner-read, licensed-read, denied, redacted.
current theorem-by-theorem closure reading: access policy controls disclosure.
current theorem-to-replay grouping: policy hash and read decision.
minimum artifact/replay binding set: policy id/hash, read license, ownership claim.
current proof-object fields: policyHash, decision, reason, redactionRoot.
generated-artifact and test bindings: access route and browser checks.
fail-closed conditions: public projection overexposure.

### Proof-contract

proofArtifactPath: `.bitcode/v28-proof-contract-proof.json`
members: V28 SPEC family, proof appendix, promotion artifacts.
theoremIds: v28-proof-contract.
replayStepIds: replay-proof-contract.
witnessArtifactPaths: `.bitcode/system-proof-bundle.json`.
current member closure criteria: V28 PROVEN binds all required proof families.
current member verdict shape: draft, generated, promoted, failed.
current theorem-by-theorem closure reading: every V28 theorem has replay and witness binding.
current theorem-to-replay grouping: proof family, member, theorem, replay step.
minimum artifact/replay binding set: spec, delta, notes, parity, proof artifacts, commit body.
current proof-object fields: proofId, version, family, theoremIds, replayStepIds, verdict.
generated-artifact and test bindings: spec-family check, proven generation, build/test outputs.
fail-closed conditions: stale promoted status truth.

## Appendix C. Generated artifact contract catalog

### Inherited V19 reproducible-canon artifacts

V28 continues to recognize inherited reproducible-canon artifacts as historical proof inputs.

### Inherited V20 operator-quality artifacts

V28 continues to recognize inherited operator-quality artifacts as quality proof inputs.

### Exact generated-artifact inventory matrix

| artifact | status | role |
| --- | --- | --- |
| `.bitcode/v28-gate-1-draft-opening-proof.json` | present | draft-opening proof |
| `.bitcode/v28-spec-family-report.json` | planned | spec-family validation |
| `.bitcode/v28-canonical-input-report.json` | planned | canonical input validation |
| `BITCODE_SPEC_V28_PROVEN.md` | planned | promotion appendix |

### V28 specifying generated artifacts

V28 specifying generated artifacts include `.bitcode/v28-spec-family-report.json` and `.bitcode/v28-canonical-input-report.json`.

### Shared generated-artifact fields

Shared generated-artifact fields include proofId, version, generatedAt, activeCanonicalPointer, draftTargetVersion, sourceReads, assertions, and verdict.

### Artifact-specific generated payload fields

Artifact-specific generated payload fields include gate number, proof families, route scan results, test commands, build commands, browser checks, and promotion state.

### Artifact confidentiality and disclosability taxonomy

Artifacts are public proof, private source, private licensed read, operational telemetry, or internal repair evidence.

### Minimum generated appendix rendered contents

BITCODE_SPEC_V28_PROVEN.md must render aggregate proof verdict, exact proof-family inventory, exact per-family member inventory, exact per-family theorem inventory, exact replay-step inventories and theorem bindings, witness artifact inventories, generated artifact inventories, scenario and run coverage matrices, proof-source commit, and fail closed when a required family is missing.

### Canonical regeneration and fail-closed posture

Canonical regeneration must fail closed when files, proof roots, route scans, or validation commands disagree.

## Appendix D. Validation and checking gate catalog

Required validation includes:

- `node scripts/check-bitcode-spec-family.mjs --version V28 --mode draft --current-target V27`
- `node scripts/check-bitcode-canon-posture-drift.mjs --active-canon V27 --draft-target V28`
- `find uapi/app/api -path '*v[0-9]*' -print | sort`
- `jq empty .bitcode/v28-*.json`
- package/API/ORM/protocol-demonstration tests
- Terminal UI and browser checks
- `pnpm -C uapi build`
- `git diff --check`

## Appendix E. Current canonical source map

Current canonical source map:

- active canon: `BITCODE_SPEC_V27.md`
- active proof appendix: `BITCODE_SPEC_V27_PROVEN.md`
- draft target: `BITCODE_SPEC_V28.md`
- source-bearing package: `packages/btd/src`
- route owners: `packages/api/src/routes/btd-crypto.ts` and `uapi/app/api/btd/*`
- Terminal route surface: `/terminal` through `uapi/app/terminal`
- Terminal implementation module: `uapi/app/terminal`
- AssetPack range surface: `uapi/app/btd/[assetPackId]`
- MCP API and ChatGPT App surfaces: V28 MVP interface ingress over Protocol/Terminal truth
- witness runtime: `protocol-demonstration`

## Appendix F. Subsystem totality and derivability matrix

Subsystem totality covers repo supply and depositing; reading and measured demand; prompt/inference/evaluator ownership; deposit-to-read fit; recall and ranking; verification decisions; selection and materialization; branch artifacts and assetPackEvidence; identity, authority, signing, and policy; sensitive data and confidentiality flows; projection, disclosure, and redaction; proof families, members, theorems, witnesses, and replay; settlement, source-to-shares, journals, and exact accounting; telemetry, persistence, state, and failure semantics; host/runtime capability truth; operator experience and pedagogy; validation and test stack; generated artifacts and canonical promotion.

## Appendix G. Canonical file-family and promotion contract catalog

The V28 file family is `BITCODE_SPEC_V28.md`, `BITCODE_SPEC_V28_DELTA.md`, `BITCODE_SPEC_V28_NOTES.md`, `BITCODE_SPEC_V28_PARITY_MATRIX.md`, and eventual `BITCODE_SPEC_V28_PROVEN.md`.

Promotion updates `BITCODE_SPEC.txt` only after V28 proof closure.

## Appendix H. Operator surface and quality contract catalog

Operator surfaces must render Terminal wallet, BTC fee, Read, Fit, AssetPack range, read-right, journal, reconciliation, and operational-health state with scan-readable quality.

## Appendix I. Scenario, workflow, and cross-product contract catalog

Required scenario vocabulary includes auth-issuer-rollback, privacy-boundary-proof-export, polyglot-gateway-benchmark-remediation, auth-many-asset-normalization, Targeted deposit, Normalization deposit, patch, context, public, buyer, reviewer, internal, Openly writable, Measurably readable, Provable, and Valuable.

## Appendix J. Fail-closed contract and error posture matrix

Fail-closed cases include invalid deposit, prompt contract incompleteness, parsed-envelope inadmissibility, no-survivor asset pack, authorization denial, public projection overexposure, settlement conservation drift, and stale promoted status truth.

## Appendix K. Source-bearing AssetPack and artifact contract catalog

Source-bearing AssetPack artifacts include `.bitcode/asset-pack.lock.json`, `.bitcode/selected-source-material.json`, `.bitcode/verification-report.json`, `.bitcode/source-to-shares.json`, `.bitcode/projection-policy.json`, `.bitcode/system-proof-bundle.json`, and `BITCODE_SPEC_V28_PROVEN.md`.
