# Bitcode Spec V27

## Status

- Version: `V27`
- State: promoted canonical
- Active canonical pointer after promotion: `BITCODE_SPEC.txt` -> `V27`
- Draft target source: `protocol-demonstration/src/canon-posture.js` declares `DRAFT_TARGET_VERSION = 'V27'`
- Primary scope: formal `$BTD` tokenomics and practical cryptotechnological commercialization
- Prior active canon: `BITCODE_SPEC_V26.md`
- Notes companion: `BITCODE_SPEC_V27_NOTES.md`
- Delta companion: `BITCODE_SPEC_V27_DELTA.md`
- Parity companion: `BITCODE_SPEC_V27_PARITY_MATRIX.md`
- Generated proof appendix: `BITCODE_SPEC_V27_PROVEN.md`

V27 begins the first post-commercialization Bitcode version.
V27 is active canon after completing its gates, generated artifacts, proof appendix, parity matrix, implementation, and promotion commit.

V27 does not reopen V26 commercial promotion.
V27 takes V26's proved commercial baseline and specifies the `$BTD` tokenomics and cryptotechnological application layer that V26 intentionally deferred.

## V27 Purpose

V27 formalizes `$BTD` as Bitcode's capped, non-fungible, source-measurement-backed share/read-right registry and closes the minimum real crypto path required for that registry to operate commercially.

The central V27 product and protocol question is:

> What exactly is `$BTD`, when can it be minted, what does it grant, what must prove it, and which source, receipt, database, package, API, and UI surfaces enforce it?

V27 answers that question by specifying:

- a hard maximum mintable supply of 21,000,000 `$BTD`;
- `$BTD` as non-fungible source-share cells, not a fungible currency or checkout token;
- AssetPacks as contiguous ranges of `$BTD` cells;
- Read-Fit-Prove-Settle as the only mint admission lifecycle;
- normalized Bitcode volume as the input to range length;
- deterministic contributor allocation inside the minted range;
- owner-read and licensed-read separation;
- Exchange settlement as the economics owner;
- BTC as the fee asset;
- wallet-authorized BTC fee transactions;
- ledgerized AssetPack anchors and rights-transfer receipts;
- minimal AssetPack buy, sell, bid, ask, and rights-transfer flow;
- Terminal transaction finality for Read, Fit, mint, fee, read, transfer, and journal diff events;
- ledger-derived database synchronization and reconciliation;
- testnet, mainnet, telemetry, and upgrade readiness for the crypto surfaces;
- protocol-local licensed-read revenue routing;
- optional late-bound knowledge ancestry as an attribution and routing module, never as a supply primitive;
- fixed-supply measureminting decay with zero-cell/refit tail behavior;
- database, proof, receipt, package, and UI invariants that fail closed on drift.

## Version Boundaries

V27 owns tokenomics law and the minimum practical crypto implementation needed to make that law commercially real.

V27 requires:

- wallet integration sufficient for user-authorized signing and network selection;
- actual BTC fee transaction preparation, signing, broadcast, confirmation tracking, and receipt binding in regtest and signet lanes, with mainnet readiness controls;
- ledgerized AssetPack anchor and rights-transfer abstractions with at least one concrete ledger path and one explicitly specified secondary path;
- minimal Exchange operations for rights transfers, buy, sell, bid, ask, order cancellation, and settlement receipt replay;
- Terminal transaction coverage for Read submission, Fit closure, mint, BTC fee payment, AssetPack anchor, licensed read purchase, rights transfer, and ledgerized journal diffing;
- ledger/database reconciliation where ledgers are the source of truth for cryptographic finality and the database is a ledger-derived plus metaphysical canonical projection;
- testnet/mainnet deployment, telemetry, alerting, and upgrade plans for the crypto surfaces;
- and a promoted `BITCODE_SPEC_V27_PROVEN.md` only after implementation proves the draft.

V27 does not require:

- full Exchange market depth beyond the minimal buy/sell/bid/ask and rights-transfer path;
- generalized high-volume order-book infrastructure;
- broad wrapper liquidity or pooled exposure;
- every future third-party wallet and trading integration;
- every future Terminal workflow;
- value-bearing mainnet launch without separate operational approval;
- or legal finality for every future license form.

V28+ work may implement larger Terminal, Exchange, and external-connection breadth, but those versions must build on V27 tokenomics and crypto-finality invariants unless V27 is explicitly superseded.

## Research Digest Decisions

The V27 web deep-research digest resolves several draft uncertainties into implementation preparation decisions:

- `$BTD` remains a finite 21,000,000-cell non-fungible registry; AssetPack ranges are the canonical commercial unit.
- normalized Bitcode volume is a proof-addressable semantic unit derived from fit-accepted, deduped contribution segments; it is not raw bytes and not model-token counts.
- Bitcoin is the primary V27 fee and ledger-finality path; BTC fee payments use user-controlled PSBT-style signing and never require Bitcode server custody of user private keys.
- local Bitcoin proof uses regtest or an equivalent deterministic local chain; public network proof prefers signet; public testnet is supplementary because volatility and difficulty behavior can make it unreliable as the canonical proof lane.
- Ethereum anchoring is secondary or optional in V27; if included, it must be a minimal registry/event anchor and may not redefine `$BTD` issuance law.
- Ethereum token standards are design analogies only: ERC-721 for unique identity, ERC-2309 for consecutive range events, ERC-4907 for owner/user separation, ERC-3525 for future wrappers, ERC-2981 as a warning that royalty signaling is not settlement enforcement, and EIP-712 for signed intents only with Bitcode-owned replay protection.
- ancestry is optional but canonical: it can route attribution and revenue only after evidence, never mint supply or extend range length.
- recurring economics must be enforced through Bitcode Exchange licensed reads and rights transfers, not passive dependence on third-party marketplace royalty behavior.

## Canonical `$BTD` Definition

`$BTD` is Bitcode's finite non-fungible source-share registry.

One `$BTD` cell is a unique registry entry tied to:

- a source measurement;
- an AssetPack;
- proof roots;
- Exchange receipt roots;
- a range assignment;
- owner-read or audit-read policy;
- licensed-read policy when applicable;
- and settlement allocation.

`$BTD` is not:

- a fungible fee token;
- a prepaid usage credit;
- a checkout spend balance;
- a generic ERC-20-style balance ontology;
- a promise of price appreciation;
- an automatic copyright assignment;
- or an optional marketplace royalty claim.

BTC is the fee asset.
`$BTD` is the source-share/read-right asset.

## Core Laws

V27 tokenomics begins from these laws:

```text
BTD_MAX_MINTABLE_SUPPLY = 21_000_000

One $BTD = one unique non-fungible source-share cell.
One AssetPack = one contiguous range of $BTD cells.
Only proof-backed Read-Fit settlement can mint $BTD.
Source deposit alone cannot mint $BTD.
Read discovery alone cannot mint $BTD.
Candidate fit alone cannot mint $BTD.
Uncommitted proof cannot mint $BTD.
Quality can affect allocation and revenue routing, but not supply inflation.
Ancestry can affect routing and attribution, but not mint count.
Issuance follows fixed-supply measureminting decay; when the decayed entitlement is below one whole cell or the tail is exhausted, the event emits a zero-cell receipt and routes through refit, license, ancestry, proof, and revenue receipts.
```

Every implementation, proof, receipt, database row, API, and UI surface that speaks about `$BTD` must preserve these laws.

## Practical Crypto Application Scope

V27 must make `$BTD` operational through real cryptographic transaction paths, not only through local database records.

The minimum practical scope is:

- wallet identity and signer sessions for user-controlled actions;
- BTC fee payment as an actual wallet-authorized transaction;
- ledgerized AssetPack anchors for mint, policy, ownership, and transfer commitments;
- a minimal AssetPack Exchange path for buy, sell, bid, ask, cancellation, and rights transfer;
- Terminal transaction journals that reconcile local intent, Exchange settlement, and ledger finality;
- database projections that derive from ledger and journal facts without contradicting them;
- regtest/local and signet public proof lanes before mainnet readiness;
- telemetry and alerting for chain, wallet, database projection, and settlement failures;
- versioned upgrade and migration receipts for every ledgerized surface.

The V27 implementation may start with narrow chains and libraries.
The requirement is not maximum chain coverage.
The requirement is that the selected path is real, signed, replayable, reconciled, and failure-aware.

BTD API routes may expose authenticated registry snapshots and deterministic mint drafts before they are allowed to commit mint state.
Draft routes must preserve the same admission law as package primitives, return JSON-safe receipt projections, and disclose that final minting still requires persisted Exchange settlement, ledger observation when applicable, and replay proof.

## Wallet And Fee Transactions

Wallet integration is a protocol surface, not UI decoration.

V27 wallet flows must support:

- network selection and disclosure;
- address ownership proof or session authorization;
- transaction construction without private-key custody by Bitcode application servers;
- wallet-side signing for BTC fee transactions and any ledgerized AssetPack operations that require user signatures;
- transaction broadcast or handoff;
- txid capture;
- confirmation tracking;
- failed, replaced, dropped, reorged, and cancelled states;
- and receipt linkage back to Exchange sequence and Terminal journal entries.

The BTC fee transaction lifecycle is:

```text
prepared
  -> signed
  -> broadcast
  -> confirmed | replaced | reorged | failed
```

Prepared transactions must be exportable for wallet signing as a PSBT or equivalent wallet-native unsigned transaction.
Bitcode application servers may construct transaction intent and observe broadcast/finality, but they must not custody user private keys for user-owned fee or rights-transfer actions.

Canonical BTC fee receipt shape:

```ts
export interface BtcFeeTransactionReceipt {
  kind: 'btc.fee_transaction';
  feePurpose:
    | 'asset_pack_mint'
    | 'asset_pack_anchor'
    | 'licensed_read'
    | 'rights_transfer'
    | 'exchange_order'
    | 'terminal_operation';
  payerWalletId: string;
  network: 'regtest' | 'signet' | 'testnet' | 'mainnet';
  txid: string | null;
  vout?: number;
  satsPaid: bigint;
  satsPerVbyte?: number;
  exchangeSequence: bigint;
  terminalJournalRoot: string;
  relatedAssetPackId?: string;
  relatedOrderId?: string;
  finalityState: 'prepared' | 'signed' | 'broadcast' | 'confirmed' | 'replaced' | 'reorged' | 'failed';
  confirmations: number;
}
```

V27 must prove that `$BTD` is never spent as the fee asset.
BTC fee receipts may authorize or accompany `$BTD` mint, read, or transfer operations, but they do not mint `$BTD` by themselves.

## Ledgerized AssetPacks

An AssetPack may have private source, public proof, public policy posture, and ledgerized commitments.
V27 must define how those commitments are anchored and replayed.

Canonical anchor shape:

```ts
export interface AssetPackLedgerAnchor {
  anchorId: string;
  assetPackId: string;
  chain: 'bitcoin' | 'ethereum' | 'bitcode-internal-ledger';
  network:
    | 'regtest'
    | 'signet'
    | 'testnet'
    | 'mainnet'
    | 'sepolia'
    | 'holesky'
    | 'local';
  txidOrHash: string | null;
  outputIndex?: number;
  contractAddress?: string;
  tokenId?: string;
  commitmentRoot: string;
  sourceManifestRoot: string;
  proofRoot: string;
  accessPolicyHash: string;
  btdRangeStart: BtdTokenId;
  btdRangeEndExclusive: BtdTokenId;
  finalityState: 'prepared' | 'broadcast' | 'confirmed' | 'reorged' | 'failed';
  confirmations: number;
  anchoredAt?: string;
}
```

V27 must decide the first concrete ledger path through implementation proof.
The WDRR recommendation is Bitcoin-first for V27 ledger finality.
The exact Bitcoin commitment method remains an implementation selection among Taproot, OP_RETURN, or another standard Bitcoin commitment pattern after the anchor library pass.
Ethereum registry/event anchoring is secondary or optional in V27.
If Ethereum is included, it must record AssetPack commitments without redefining `$BTD` issuance, supply, or read-right law.

## Minimal AssetPack Exchange

V27 must implement or specify to implementation-ready precision a minimal AssetPack Exchange path.

Minimum operations:

- list owned range or range claim for sale;
- create buy intent;
- create bid;
- create ask;
- cancel open order;
- accept compatible order;
- transfer rights after settlement;
- emit ownership, license, fee, and ledger anchor receipts;
- replay order and transfer state from receipts plus ledger observations.

Canonical order shape:

```ts
export interface AssetPackExchangeOrder {
  orderId: string;
  orderKind: 'sell' | 'buy' | 'bid' | 'ask';
  assetPackId: string;
  rangeStart: BtdTokenId;
  rangeEndExclusive: BtdTokenId;
  makerWalletId: string;
  takerWalletId?: string;
  priceAsset: 'BTC';
  priceSats: bigint;
  accessPolicyHash: string;
  orderState: 'open' | 'accepted' | 'cancelled' | 'expired' | 'settled' | 'failed';
  createdAtExchangeSequence: bigint;
  settledAtExchangeSequence?: bigint;
  ledgerAnchorId?: string;
}
```

The minimal Exchange is not a speculative marketplace.
It is the rights-transfer and settlement path required to prove that `$BTD` ranges can be acquired, transferred, licensed, and reconciled without reverting to fungible balance semantics.

## Terminal Transactions And Journal Diffing

Terminal V27 must cover the transaction families that prove `$BTD` is usable in practice:

- Read submission;
- Fit closure;
- proof admission;
- AssetPack mint request;
- BTC fee payment;
- AssetPack ledger anchor;
- licensed-read purchase;
- buy/sell/bid/ask creation;
- order cancellation;
- rights transfer;
- access policy update when allowed by policy versioning;
- dispute holdback;
- settlement finalization;
- ledger/database reconciliation diff.

Every Terminal transaction family must produce a journal entry with stable identifiers, pre-state root, post-state root, receipt roots, and ledger anchor references when ledgerized.

Ledgerized journal diffing compares:

- local Terminal intent journal;
- Exchange settlement journal;
- ledger anchor observations;
- database projection rows;
- proof artifact roots;
- and telemetry events.

A diff is blocking when database projection or UI state claims finality that the ledger, Exchange receipt, or proof journal does not support.

## Ledger And Database Truth Model

V27 truth is layered:

- external ledgers are the source of truth for cryptographic finality, payment, anchor, and ledgerized ownership-transfer events;
- the Bitcode Exchange journal is the source of truth for protocol settlement, proof admission, access policy, and non-ledgerized commercial state;
- the database is a ledger-derived and journal-derived projection plus a metaphysical canonical store for private or non-ledgerized facts that cannot live on a public chain;
- UI and API state are projections only and must never contradict ledger, journal, proof, or policy roots.

Metaphysical canonical database facts include:

- private source metadata;
- encrypted AssetPack storage pointers;
- Read and Fit records before ledgerization;
- access policy documents and hashes;
- proof bundles;
- dispute records;
- telemetry and operational records;
- pending settlement state;
- user experience state that is not a ledger fact.

Reconciliation must be idempotent, replayable, and alerting-aware.
If a ledger event contradicts a projection, projection repair wins over stale database state unless a documented dispute or reorg policy applies.

## Testnet, Mainnet, Telemetry, And Upgrades

V27 deployment readiness requires explicit lanes:

- local deterministic tests;
- Bitcoin regtest or equivalent local chain tests;
- public Bitcoin signet tests for canonical public proof of fee and anchor paths;
- public Bitcoin testnet tests only as supplementary coverage when useful;
- Ethereum local and public testnet tests if Ethereum anchoring is in scope;
- mainnet configuration, key-management, fee, confirmation, rollback, and emergency controls;
- production telemetry and alerting before any value-bearing launch.

Required telemetry:

- wallet connection and signing failures;
- transaction construction and broadcast failures;
- fee estimation drift;
- mempool rejection, replacement, and timeout;
- confirmation lag;
- reorg detection;
- RPC provider disagreement;
- Exchange journal drift;
- database projection lag;
- ledger/database reconciliation repairs;
- failed access checks;
- failed settlement routes;
- migration and upgrade receipt failures.

Every ledgerized upgrade or migration must have a versioned plan, rollback posture, generated receipt, and proof appendix entry.

## Supply State

The canonical supply state is:

```ts
export type BtdTokenId = number;

export interface BtdSupplyState {
  maxSupply: 21_000_000;
  totalMinted: number;
  nextTokenId: BtdTokenId;
  cumulativeAdmittedMeasurement: bigint;
  residualMintCredit: bigint;
  curve: 'hyperbolic_saturation';
  curveParameter: bigint;
  tailPolicy: 'zero_cell_receipt_then_refit_only';
  exhaustedAtExchangeSequence?: bigint;
}
```

Required invariants:

- `maxSupply` is exactly `21_000_000`.
- `totalMinted >= 0`.
- `totalMinted <= maxSupply`.
- `nextTokenId === totalMinted` for the base contiguous allocator unless a future spec explicitly introduces sparse registry repair.
- any proposed measuremint must satisfy `totalMinted + tokenCount <= maxSupply`;
- cumulative admitted measurement advances only after Read-Fit-Prove-Settle;
- residual mint credit is deterministic and replayable;
- zero-cell receipts are valid receipts, not failed mints;
- overflow fails closed before state mutation;
- non-finite, negative, NaN, or unsafe integer mint inputs fail closed.

The current V26 package seed is `packages/btd/src/index.ts`:

```ts
export const BTD_MAX_MINTABLE_SUPPLY = 21_000_000 as const;
```

V27 must promote that seed into full package, receipt, database, proof, and UI enforcement.

## Cell And Range Model

A `$BTD` cell is the proof/accounting unit.
An AssetPack range is the primary commercial unit.

```ts
export interface BtdCell {
  tokenId: BtdTokenId;
  assetPackId: string;
  rangeStart: BtdTokenId;
  rangeEndExclusive: BtdTokenId;
  sourceMeasurementId: string;
  sourceManifestRoot: string;
  measurementReceiptRoot: string;
  proofRoot: string;
  exchangeReceiptRoot: string;
  accessPolicyId: string;
  accessPolicyHash: string;
}

export interface AssetPackRange {
  assetPackId: string;
  rangeStart: BtdTokenId;
  rangeEndExclusive: BtdTokenId;
  tokenCount: number;
  normalizedBitcodeVolume: bigint;
  readId: string;
  fitReceiptRoot: string;
  proofRoot: string;
  sourceManifestRoot: string;
  settlementJournalRoot: string;
  dedupeReceiptRoot: string;
  mintedAtExchangeSequence: bigint;
}
```

Required invariants:

- each AssetPack has exactly one primary minted range;
- `rangeStart === previous nextTokenId`;
- `rangeEndExclusive > rangeStart`;
- `tokenCount === rangeEndExclusive - rangeStart`;
- ranges never overlap;
- every cell inside a range points back to the same AssetPack range;
- a range is immutable after committed mint except through explicit correction receipts that preserve replay;
- wrappers, slices, or pooled exposure may exist only above the canonical cell/range base layer.

## Mint Lifecycle

The V27 lifecycle is:

```text
Deposit source plus context
  -> measure or express Read
  -> evaluate Fit
  -> prove provenance, dedupe, admissibility, and replay
  -> settle contributor allocation, access policy, and revenue posture
  -> mint contiguous AssetPack range
  -> route owner reads and licensed reads through Exchange state
```

Mint admission requires:

- accepted Read;
- accepted Fit;
- proof root;
- source manifest root;
- dedupe receipt root;
- settlement journal root;
- access policy id and hash;
- Exchange sequence;
- deterministic measureminted token count, including valid zero-cell tail receipts;
- deterministic allocation;
- and successful supply cap check.

No UI button, API route, MCP tool, ChatGPT App action, admin route, script, seed, migration, or treasury process may mint `$BTD` outside this lifecycle.

## Measureminting Quantity Rule

Range length is determined by normalized Bitcode volume after dedupe and admissibility checks.
V27 defines normalized Bitcode volume as a proof-addressable semantic unit derived from fit-accepted contribution segments.
It is not raw bytes and not tokenizer counts.

Required normalized-volume properties:

- every counted unit is addressable by proof receipt;
- every counted unit is accepted by Fit;
- every counted unit passes dedupe;
- repeated wording, compression artifacts, tokenizer drift, and pack fragmentation cannot inflate count;
- semantic units carry enough stable identity to replay the same token count from receipts;
- excluded units record an exclusion reason.

V27 replaces simple per-pack quantization as the primary issuance law with fixed-supply measureminting decay.
The simple `floor(volume / Q)` rule remains useful as a local measurement witness, but it is not the final supply issuance rule.

Primary V27 law:

```ts
S_MAX = 21_000_000;

M_before = cumulativeAdmittedMeasurement;
M_after = M_before + normalizedBitcodeVolume;

targetMinted(M) = floor(S_MAX * M / (M + K));

tokenCount = targetMinted(M_after) - targetMinted(M_before);
tokenCount = min(tokenCount, S_MAX - totalMinted);
```

`K` is the measurement half-saturation constant.
When cumulative admitted measurement equals `K`, roughly half of the supply has been minted.
As cumulative measurement grows, issuance approaches but never exceeds the fixed cap.

Whole-cell indivisibility means nonzero issuance cannot be infinite.
V27 therefore admits zero-cell measuremint receipts:

```ts
zeroCellReason =
  | 'below_integer_threshold'
  | 'tail_exhausted'
  | 'refit_only_policy';
```

Zero-cell receipts advance measurement and settlement truth without minting a new cell.
They are not failed mints.

V27 implementation must still define the exact measurement algorithm, but the scalar class is now closed: proof-addressable semantic units.
Promotion may not proceed with a byte-count or tokenizer-count quantity rule.

Required measureminting anti-game invariants:

- settlement order is Exchange-sequence order, not user-selected order;
- splitting or merging equivalent source cannot improve total minted count;
- residual mint credit is deterministic and replayable;
- cumulative measurement advances only after admitted Read-Fit-Prove-Settle;
- duplicate normalized source cannot increase cumulative measurement;
- upload time, claim time, and broad abstract scope do not determine issuance.

Canonical measuremint receipt:

```ts
export interface BtdMeasureMintReceipt {
  kind: 'btd.measure_mint';
  assetPackId: string;
  normalizedBitcodeVolume: bigint;
  cumulativeMeasurementBefore: bigint;
  cumulativeMeasurementAfter: bigint;
  targetMintedBefore: number;
  targetMintedAfter: number;
  residualMintCreditBefore: bigint;
  residualMintCreditAfter: bigint;
  tokenCount: number;
  rangeStart?: BtdTokenId;
  rangeEndExclusive?: BtdTokenId;
  zeroCellReason?: 'below_integer_threshold' | 'tail_exhausted' | 'refit_only_policy';
  totalMintedBefore: number;
  totalMintedAfter: number;
  maxSupply: 21_000_000;
  proofRoot: string;
  settlementJournalRoot: string;
  accessPolicyHash: string;
}
```

## Allocation Rule

Quality does not inflate supply.
Quality participates in allocation and revenue routing.

Default allocation form:

```ts
weight_i =
  volume_i ** 1.0 *
  fit_i ** 1.0 *
  quality_i ** 1.0 *
  provenance_i ** 0.75 *
  novelty_i ** 0.5 *
  antiNoise_i ** 1.0;

allocation_i = HareNiemeyer(tokenCount, weight_i);
```

Required allocation properties:

- deterministic under receipt replay;
- sums exactly to `tokenCount`;
- never produces negative allocations;
- never produces fractional cells after final allocation;
- never mints above `tokenCount`;
- fails closed on invalid weights;
- records all excluded or clipped contributions with reasons.

## Mint Receipt

The canonical mint receipt is:

```ts
export interface BtdMintReceipt {
  kind: 'btd.asset_pack_mint';
  assetPackId: string;
  rangeStart: BtdTokenId;
  rangeEndExclusive: BtdTokenId;
  tokenCount: number;
  totalMintedBefore: number;
  totalMintedAfter: number;
  maxSupply: 21_000_000;
  sourceManifestRoot: string;
  measurementReceiptRoot: string;
  fitReceiptRoot: string;
  proofRoot: string;
  settlementJournalRoot: string;
  dedupeReceiptRoot: string;
  exchangeReceiptRoot: string;
  accessPolicyId: string;
  accessPolicyHash: string;
  mintedAtExchangeSequence: bigint;
  issuedAt: string;
}
```

Replay must reconstruct:

- prior supply state;
- token count;
- range boundaries;
- next supply state;
- allocation rows;
- access policy binding;
- and Exchange receipt linkage.

## Access Rights

V27 distinguishes owner-read from licensed-read.

Owner-read:

- belongs to the holder of a cell, range, or canonical range claim;
- grants durable read/audit access subject to access policy;
- does not automatically grant copyright, redistribution, derivative use, or commercial reuse unless the access policy explicitly grants those rights.

Licensed-read:

- grants scoped read access without transferring `$BTD`;
- may be metered, time-bound, use-bound, or policy-bound;
- routes revenue through Exchange settlement;
- must not imply ownership transfer.

Every minted AssetPack range must have:

- `accessPolicyId`;
- `accessPolicyHash`;
- owner-read terms;
- licensed-read terms;
- derivative-use terms when admitted;
- redistribution/confidentiality terms;
- dispute and takedown posture;
- and public UI disclosure of the policy posture.

## Revenue Routing

Licensed-read revenue routes through Exchange settlement, not optional marketplace royalty behavior.

Initial default:

```ts
directHolderShare = 0.80;
ancestorPoolShare = 0.12;
treasuryShare = 0.08;
```

These percentages are settlement-policy defaults, not immutable supply law.

Required categories:

- direct current holders;
- proven ancestors when admitted;
- protocol/proof/treasury account;
- dispute holdback when applicable;
- failed or pending distribution state when settlement cannot complete.

## Ancestry

Ancestry is not a core supply primitive.
Ancestry is an optional but canonical V27 module if Bitcode wants protocol-level intergenerational knowledge rewards.

Ancestry must never:

- increase mint count;
- increase range length;
- reward lower token IDs by age alone;
- be pre-claimed as speculative entitlement;
- or override Read-Fit settlement.

Ancestry may affect:

- licensed-read revenue routing;
- proof graph;
- dedupe decisions;
- derivative classification;
- teaching-value attribution;
- reputation;
- search;
- ranking.

Canonical edge:

```ts
export interface BtdAncestorEdge {
  parentAssetPackId: string;
  childAssetPackId: string;
  edgeKind:
    | 'implementation_dependency'
    | 'proof_dependency'
    | 'source_reuse'
    | 'conceptual_dependency'
    | 'teaching_dependency'
    | 'citation_only';
  evidenceRoot: string;
  reviewerReceiptRoot?: string;
  confidence: number;
  timelessness: number;
  depth: number;
  createdAfterChildFit: true;
  conflictDisclosure: string[];
}
```

Paid ancestry requires:

- child AssetPack has already fit and settled;
- evidence root exists;
- confidence meets threshold;
- conflict disclosure exists;
- reciprocal loop checks pass;
- dedupe checks pass;
- and routing proof records the edge.

Default weight:

```ts
ancestorWeight =
  confidence *
  timelessness *
  (1 / (1 + depth) ** 2);
```

Weak edges may be recorded and displayed, but must not receive revenue.

## Anti-Game Requirements

V27 must fail closed against:

- foundational squatting;
- premature broad specifying;
- citation cartels;
- reciprocal loops;
- dependency laundering;
- over-fragmentation;
- duplicate source reminting;
- popularity feedback loops;
- claimant/reviewer conflicts;
- unlicensed source claims;
- post-cap inflation;
- fungible balance mutation.

Minimum mechanisms:

- dedupe receipts;
- source-right assertions;
- challenge windows;
- reviewer/prover reputation;
- optional bonds for high-impact claims;
- dispute holdback;
- exact exclusion reasons;
- separate claimant and verifier;
- ancestry edge confidence thresholds;
- full DAG tracing;
- compression penalties for fragmenting one pack into many packs.

## Threat Model

V27's highest-risk threat is knowledge-market distortion: contributors will optimize whatever gets paid.
Anti-game controls are therefore protocol requirements, not moderation polish.

| Threat | Failure mode | Required mitigation | Required proof or telemetry |
| --- | --- | --- | --- |
| foundational squatting | broad early packs try to tax later work | no ancestry payout at mint; paid edges require concrete evidence | ancestor review receipt; low-confidence unpaid edge log |
| premature specifying | vague claims arrive before utility is proven | enforce `createdAfterChildFit === true` | mint-admission negative tests; settlement gate receipts |
| citation cartel | related parties inflate reciprocal ancestry | anti-reciprocity checks; claimant/reviewer separation; conflict disclosure | graph anomaly telemetry; conflict receipts |
| dependency laundering | controlled intermediates siphon revenue | full DAG traversal; common-control disclosure; depth decay | route audit receipts; lineage repair receipts |
| fragmentation | one coherent pack is split into many packs | minimum semantic unit threshold; dedupe and compression penalties | dedupe receipts; fragmentation alerts |
| royalty evasion | external markets skip expected payouts | local Exchange licensed-read and rights-transfer settlement | settlement-route receipts; payout-failure alerts |
| rights overclaim | holders infer copyright or dividends | immutable access policy hash and explicit UI terms | policy-hash mismatch alerts; access-check failure receipts |
| fee misuse | `$BTD` is treated as a spend token | BTC-only fee receipt validation and fungible mutation rejection | fee-asset tests; mutation rejection telemetry |
| false finality | UI shows confirmed state before ledger proof | ledger/database reconciliation and blocking journal diffs | projection repair receipts; finality mismatch alerts |

## Exchange Persistence

V27 requires Exchange schema support equivalent to:

- `btd_supply_state`
- `btd_semantic_volume_measurements`
- `btd_measure_mint_receipts`
- `btd_asset_pack_ranges`
- `btd_cells`
- `btd_ownership_events`
- `btd_read_licenses`
- `btd_mint_receipts`
- `btd_contributor_allocations`
- `btd_ancestor_edges`
- `btd_licensed_read_revenue_routes`
- `btc_fee_transactions`
- `btd_asset_pack_ledger_anchors`
- `btd_exchange_orders`
- `btd_rights_transfer_receipts`
- `btd_terminal_journal_entries`
- `btd_ledger_database_reconciliation_repairs`
- `btd_protocol_upgrade_receipts`
- `btd_crypto_telemetry_events`

Database constraints must enforce:

- unique token id;
- unique primary AssetPack range;
- no overlapping primary ranges;
- cap check;
- non-null receipt roots after commit;
- non-null access policy hash after commit;
- no negative ownership;
- no licensed-read-as-ownership transfer;
- RLS for user-owned read visibility;
- service-role-only mint mutation.

V27 should no longer rely on `user_credits` as the canonical `$BTD` storage table.
If retained temporarily, it must stay a compatibility read carrier only.

## Package Surface

`packages/btd` becomes the canonical package owner for:

- constants;
- supply state;
- range allocation;
- mint receipt types;
- allocation math;
- access policy evaluation;
- ancestry edge types and proof guards;
- replay helpers;
- and rejection of fungible mutation.

Current draft module split:

```text
packages/btd/src/constants.ts
packages/btd/src/supply.ts
packages/btd/src/measuremint.ts
packages/btd/src/range.ts
packages/btd/src/semantic-volume.ts
packages/btd/src/receipts.ts
packages/btd/src/replay.ts
packages/btd/src/allocation.ts
packages/btd/src/access.ts
packages/btd/src/ancestry.ts
packages/btd/src/revenue.ts
packages/btd/src/wallet.ts
packages/btd/src/bitcoin-fees.ts
packages/btd/src/bitcoin-provider.ts
packages/btd/src/deployment-lanes.ts
packages/btd/src/ledger-anchor.ts
packages/btd/src/exchange.ts
packages/btd/src/terminal-journal.ts
packages/btd/src/reconciliation.ts
packages/btd/src/telemetry.ts
packages/btd/src/upgrade.ts
```

## API Route Boundary

Commercial API routes that expose V27 crypto state must be thin adapters over package and ORM boundaries.

Current draft route split:

```text
packages/api/src/routes/btd-crypto.ts
apps/uapi/app/api/btd/registry/route.ts
apps/uapi/app/api/btd/mint-draft/route.ts
```

The registry route may read `btd_supply_state` and AssetPack ranges through `BtdRegistryModel`.
The mint-draft route may compute proof-addressable semantic volume, fixed-supply measureminting, range allocation, mint receipt projections, contributor allocation, and a Terminal journal entry.
It may not persist state, broadcast transactions, or claim final mint finality until the Exchange write path, BTC fee/anchor proof, and replay proof are closed.

## Interface Requirements

Every admitted UI/API/interface surface must disclose:

- BTC pays fees;
- `$BTD` is non-fungible;
- current holding or range ownership;
- supply remaining when relevant;
- owner-read vs licensed-read posture;
- access policy hash;
- minted range boundaries when present;
- acquisition path:
  - Terminal Read/Fit minting is V27;
  - minimal Exchange existing-`$BTD` acquisition and rights transfer is V27;
  - broader Exchange market depth is V28+;
- and no generic fungible balance mutation.

## V27 Gates

### Gate 1: Draft Opening And Source Audit

Status: closed as a draft-target audit gate.
Closure proof: `.proofs/v27/gate-1-source-audit-proof.json`.
This closure kept `BITCODE_SPEC.txt` on `V26` and did not create `BITCODE_SPEC_V27_PROVEN.md` at Gate 1.

Acceptance:

- `BITCODE_SPEC_V27.md`, `BITCODE_SPEC_V27_DELTA.md`, `BITCODE_SPEC_V27_NOTES.md`, and `BITCODE_SPEC_V27_PARITY_MATRIX.md` exist.
- V26 remained active pointer at Gate 1.
- current `$BTD` source surfaces are audited.
- parity rows distinguish implemented baseline, partial baseline, and V27 gaps.

### Gate 2: Ontology And Hard Cap

Status: closed as a draft-target ontology and hard-cap gate.
Closure proof: `.proofs/v27/gate-2-ontology-cap-proof.json`.
This closure proves the ontology/cap baseline; later gates still own registry persistence, range proof, access policy UI, and generated proof-family promotion.

Acceptance:

- `$BTD` cell/range ontology is complete in SPEC.
- `BTD_MAX_MINTABLE_SUPPLY = 21_000_000` is package-owned.
- tests prove cap existence and overflow rejection.
- fungible mutation remains rejected in API and package surfaces.

### Gate 3: Supply And Range Primitives

Status: closed as a draft-target package primitive gate.
Closure proof: `.proofs/v27/gate-3-supply-range-proof.json`.
This closure proves package-level supply/range behavior; DB persistence, generated no-overlap proofs, and persisted Exchange write paths remain later-gate work.

Acceptance:

- package primitives define supply state, contiguous range allocation, no-overlap checks, and one-pack-one-range behavior.
- tests prove successful allocation, cap exceed failure, invalid input failure, and replayable next-token state.

### Gate 4: Read-Fit Mint Admission

Status: closed as a draft-target package/API admission gate.
Closure proof: `.proofs/v27/gate-4-mint-admission-proof.json`.
Source-to-shares range binding proof: `.proofs/v27/source-to-shares-mint-admission-proof.json`.
This closure proves the mint-admission boundary for package allocation and authenticated mint drafts; persisted Exchange write finality and generated V27 proof-family closure remain later-gate work.

Acceptance:

- mint requires accepted Read, Fit, proof, dedupe, settlement, access policy, and Exchange sequence.
- source-to-shares proof artifacts can carry minted range roots.
- authenticated API mint-draft adapters can evaluate admission without persisting final mint state.
- tests prove source deposit, Read discovery, candidate fit, and uncommitted proof cannot mint.

### Gate 5: Receipt And Replay

Status: closed as a draft-target package and demonstration replay gate.
Closure proof: `.proofs/v27/gate-5-receipt-replay-proof.json`.
Receipt replay proof slice: `.proofs/v27/receipt-replay-proof.json`.
This closure proves receipt and replay exactness for package primitives and the demonstration witness; persisted Exchange receipt writes, database projection replay, ledger finality, and generated total proof-family closure remain later-gate work.

Acceptance:

- mint receipt schema includes all V27 fields.
- replay reconstructs prior supply, range, allocation, and next supply exactly.
- mutation tests reject missing roots, altered range, altered cap, and altered allocation.

### Gate 6: Exchange Persistence

Status: closed as a draft-target migration and ORM boundary gate.
Closure proof: `.proofs/v27/gate-6-exchange-persistence-proof.json`.
This closure proves the V27 registry/projection migration plan, SQL constraints, ORM boundary, and noncanonical compatibility-table posture; live Supabase migration execution, generated DB type refresh, and value-bearing operational rollout remain later work.

Acceptance:

- Exchange database tables or equivalent migration plan exist.
- DB constraints enforce cap, unique token id, no overlapping ranges, access-policy presence, and service-role mint mutation.
- ORM models expose Bitcode-native names rather than storage compatibility names.
- authenticated registry snapshot routes read V27 registry projection through the ORM boundary without becoming tokenomics truth.

### Gate 7: Access And Legal Policy

Status: closed as a draft-target access and policy gate.
Closure proof: `.proofs/v27/gate-7-access-policy-proof.json`.
This closure proves owner-read/licensed-read policy evaluation, read-access route behavior, registry-derived license/policy projection, UAPI policy disclosure, and public-copy overclaim scanning; live value-bearing access operations and legal template finalization remain later work.

Acceptance:

- owner-read and licensed-read policy evaluator exists.
- UI and API distinguish ownership from licensed access.
- access policy id/hash is immutable after committed mint.
- public copy avoids copyright, dividend, royalty, and price-promise overclaims.

### Gate 8: Settlement Allocation And Revenue Routing

Status: closed as a draft-target allocation and revenue gate.
Closure proof: `.proofs/v27/gate-8-allocation-revenue-proof.json`.
This closure proves deterministic contributor allocation, licensed-read BTC revenue receipts, explicit direct/ancestor/treasury/dispute-holdback conservation, pending/failed route metadata, and an unversioned API settlement boundary; live wallet settlement, broadcaster finality, and generated proof-family promotion remain later work.

Acceptance:

- deterministic allocation conserves token count.
- licensed-read revenue routes direct holder, ancestor pool, treasury, and dispute holdback categories.
- settlement receipts prove conservation.

### Gate 9: Ancestry And Anti-Game

Status: closed as a draft-target ancestry and anti-game gate.
Closure proof: `.proofs/v27/gate-9-ancestry-antigame-proof.json`.
This closure proves late-bound non-supply ancestry reviews, weak/citation/conflicted edge unpaid handling, loop/cycle/duplicate-source/reviewer-conflict rejection, persisted ancestry review rows, and an unversioned API settlement boundary; generated proof-family promotion and full live revenue settlement remain later work.

Acceptance:

- ancestry is late-bound and non-supply.
- weak edges can be recorded but not paid.
- attack mitigations are specified and tested for loops, low confidence, duplicate source, and claimant/reviewer conflict.

### Gate 10: Wallet And BTC Fee Settlement

Status: closed as a draft-target wallet and BTC fee settlement gate.
Closure proof: `.proofs/v27/gate-10-wallet-btc-fee-proof.json`.
This closure proves signer-session authorization proof, fail-closed unauthorised sessions, BTC-only PSBT-style fee receipt lifecycle, signed/broadcast/confirmed handoff, signet provider observation harness, Terminal journal binding, and unversioned API persistence; live wallet adapters and value-bearing broadcast credentials remain later operational work.

Acceptance:

- wallet integration supports network selection, signer session, address ownership or authorization proof, and fail-closed state.
- BTC fee transaction preparation, PSBT-style signing handoff, broadcast or handoff, txid capture, and confirmation tracking are implemented or proved by equivalent regtest and signet harnesses.
- receipts bind BTC fee transactions to Exchange sequence and Terminal journal roots.
- tests prove `$BTD` is not spendable as the fee asset.

### Gate 11: Ledgerized AssetPack Anchoring

Status: closed as a draft-target ledgerized AssetPack anchor gate.
Closure proof: `.proofs/v27/gate-11-ledger-anchor-proof.json`.
This closure proves AssetPack range/root/policy anchor receipts, Taproot as the selected Bitcoin primary commitment method, signet/local-compatible anchor lifecycle, explicit secondary Ethereum registry/event anchoring, unversioned API persistence, and modeled prepared/broadcast/confirmed/reorged/failed states; live value-bearing Bitcoin/Ethereum broadcaster credentials remain later operational work.

Acceptance:

- AssetPack ledger anchor schema exists.
- at least one concrete Bitcoin ledger path is implemented in local and signet form.
- Taproot, OP_RETURN, or another standard Bitcoin commitment method is selected by implementation proof.
- Ethereum registry/event anchoring is either implemented as secondary or explicitly bounded with no false readiness claim.
- ledger anchors bind AssetPack id, source root, proof root, access policy hash, and `$BTD` range.
- reorg, failed broadcast, and pending confirmation states are modeled.

### Gate 12: Minimal AssetPack Exchange

Status: closed as a draft-target minimal Exchange gate.
Closure proof: `.proofs/v27/gate-12-minimal-exchange-proof.json`.
This closure proves BTC-priced buy/sell/bid/ask order primitives, cancel/accept/settle transitions, rights-transfer receipts, ledger-anchor/policy/fee guards, unversioned API persistence, and the demonstration rights-transfer witness; V28+ market depth, full order-book UX, and live value-bearing settlement remain later work.

Acceptance:

- buy, sell, bid, ask, cancel, accept, settle, and rights-transfer models exist.
- minimal Exchange receipts replay order and ownership state.
- rights transfer cannot bypass access policy or ledger/proof requirements.
- broader market depth remains V28+ only after the minimal V27 path is proved.

### Gate 13: Terminal Transactions And Journal Diffing

Status: closed as a draft-target Terminal journal and diff gate.
Closure proof: `.proofs/v27/gate-13-terminal-journal-proof.json`.
This closure proves required V27 Terminal transaction-family coverage, journal entry validation, persisted journal constraints, unversioned route commit/diff/coverage actions, and blocking projection drift; broader V28 Terminal product workflows and live value-bearing UX remain later work.

Acceptance:

- Terminal transaction families cover Read, Fit, proof, mint, BTC fee, AssetPack anchor, read license, order, transfer, dispute, and settlement finalization.
- journal entries carry pre-state root, post-state root, receipt roots, and ledger anchor references when applicable.
- ledgerized journal diffing detects drift among Terminal intent, Exchange settlement, ledger observations, database projection, and proof artifacts.

### Gate 14: Ledger/Database Reconciliation

Status: closed as a draft-target ledger/database reconciliation gate.
Closure proof: `.proofs/v27/gate-14-ledger-database-reconciliation-proof.json`.
This closure proves ledger-observed finality precedence, blocking confirmed/reorged/failed repair receipts, private/metaphysical canonical database fact binding, idempotent repair ids, and unversioned reconciliation route persistence; production ledger observer rollout remains later work.

Acceptance:

- truth model is implemented or specified with implementation-ready precision.
- ledgers are source of truth for cryptographic finality.
- database projections cannot override confirmed ledger facts.
- non-ledgerized private/metaphysical facts are explicitly canonical in database and bound by hashes or receipts where possible.
- reconciliation is idempotent and produces repair/alert receipts.

### Gate 15: Testnet, Mainnet, Telemetry, And Upgrades

Status: closed as a draft-target readiness, telemetry, and upgrade gate.
Closure proof: `.proofs/v27/gate-15-testnet-mainnet-telemetry-upgrade-proof.json`.
This closure proves deployment-lane guards, environment readiness receipts, signet/mainnet-ready posture, crypto telemetry classification, upgrade receipt persistence, and value-bearing mainnet approval gating; it does not approve value-bearing mainnet launch.

Acceptance:

- local, regtest, signet, supplementary testnet, and mainnet-ready environment lanes are specified.
- signet is the canonical public Bitcoin proof lane; public testnet is supplementary only.
- deployment variables and network toggles are documented.
- telemetry covers wallet, fee, broadcast, confirmation, reorg, RPC disagreement, projection lag, access, settlement, and upgrade failures.
- value-bearing mainnet launch remains gated by operational approval, but V27 implementation is mainnet-ready in configuration and failure semantics.
- ledgerized upgrades and migrations emit versioned receipts.

### Gate 16: Product Surfaces, Research Rebinding, And Promotion Proof

Status: closed as V27 promotion gate.
Closure proof: `.proofs/v27/gate-16-promotion-proof.json`.
Total closure proof: `.proofs/v27/total-closure-proof.json`.
Proven appendix: `BITCODE_SPEC_V27_PROVEN.md`.

Acceptance:

- Terminal/Exchange/acquire surfaces reflect V27 tokenomics and minimal crypto functionality without claiming V28 market depth.
- web research agenda for cryptographic concepts and library optionality is complete and rebound before normative dependency choices are finalized.
- `BITCODE_SPEC_V27_PROVEN.md` is generated.
- `.proofs/v27/*` proof artifacts exist.
- parity matrix has no blocking rows.
- `BITCODE_SPEC.txt` is promoted only after proof closure.

Closure evidence:

- `BTDPrices.tsx`, `MarketingPricingSection.tsx`, and `btd-tracker.tsx` treat Terminal Read minting and minimal Exchange range acquisition as V27 functionality while reserving broader market depth for later-version work.
- `apps/uapi/app/btd/[assetPackId]/page.tsx` provides an unversioned range disclosure route for AssetPack range, access policy id/hash, owner-read/licensed-read branch, proof root, and source manifest root.
- the former version-prefixed UAPI protocol corridors are ported to unversioned `/api/external-realization` and `/api/executors/[interfaceId]`, and no `apps/uapi/app/api/v*` route remains.
- `internal-.docs/BITCODE_V27_CRYPTO_RESEARCH_REBINDING.md` and `.proofs/v27/crypto-library-research-proof.json` bind official-source crypto and library research into V27 without turning candidate libraries into protocol law.
- `BITCODE_SPEC_V27_PROVEN.md` and `.proofs/v27/total-closure-proof.json` map all required V27 proof families to gate artifacts or accepted equivalents.

## V27 Proof Expectations

Generated proof families must include:

- `v27-spec-family-report`
- `v27-canonical-input-report`
- `v27-btd-supply-proof`
- `v27-btd-range-proof`
- `v27-btd-measuremint-proof`
- `v27-btd-mint-admission-proof`
- `v27-btd-receipt-replay-proof`
- `v27-btd-access-rights-proof`
- `v27-btd-settlement-allocation-proof`
- `v27-btd-ancestry-proof`
- `v27-btd-exchange-schema-proof`
- `v27-wallet-integration-proof`
- `v27-btc-fee-transaction-proof`
- `v27-assetpack-ledger-anchor-proof`
- `v27-assetpack-exchange-proof`
- `v27-terminal-transaction-proof`
- `v27-ledger-journal-diff-proof`
- `v27-ledger-database-reconciliation-proof`
- `v27-testnet-mainnet-readiness-proof`
- `v27-telemetry-upgrade-proof`
- `v27-crypto-library-research-proof`
- `v27-total-closure-proof`

V27 is promotable because those generated families or their accepted equivalents exist and pass.

## Accepted Boundaries At Draft Opening

- V27 is active canon after `BITCODE_SPEC.txt` is updated to `V27`.
- V27 notes are draft-target only.
- `packages/btd` now contains draft V27 primitives for constants, supply, measureminting, range allocation, semantic volume, mint receipts, replay, access, contributor allocation, ancestry review, licensed-read revenue routing, wallet sessions, BTC fee receipts, ledger anchors, minimal Exchange orders, Terminal journals, reconciliation, telemetry, and upgrade receipts.
- `user_credits` and `user_credit_usages` remain compatibility storage carriers; V27 must replace or strictly bound them.
- Marketing and auxillary UI currently disclose BTC vs `$BTD` distinction; V27 must make route and range-level disclosure exact.
- Ancestry is specified as conditional and non-supply.
- External token standard comparisons are design inputs only until rebound to primary sources and translated into Bitcode-native law.
- Practical crypto library choices, chain standards, wallet compatibility, RPC/provider choices, generated proof appendix, and UI range/policy disclosure are closed at V27's protocol boundary. Live broadcaster/observer credentials, migration execution/type refresh, and value-bearing operations remain post-promotion rollout work.
- Value-bearing mainnet launch is not automatic promotion; it requires separate operational approval after V27 proves mainnet-ready controls.
