# Bitcode Spec V27 Notes

## Status

- Scope: promoted V27 notes for Bitcode `$BTD` tokenomics and practical cryptotechnological commercialization.
- Active canonical pointer after promotion: `BITCODE_SPEC.txt` -> `V27`.
- Target version: `V27`.
- Primary V27 focus: formal `$BTD` tokenomics plus the minimum real crypto-application path for wallet authorization, BTC fee transactions, ledgerized AssetPacks, minimal Exchange rights transfer, Terminal transactions, ledger/database synchronization, testnet/mainnet readiness, telemetry, and upgrades.
- Adjacent future implementation focus: larger Terminal product breadth, larger Exchange market depth, and broad external-interface expansion remain V28+ work only after V27 proves the minimal crypto-commercial path.

These notes accompany the promoted V27 canon and do not reopen V26.
They record the tokenomics handoff that V26 intentionally deferred after proving the commercial Bitcode baseline.

The source research memo that seeded this file contained external citation handles and prior-work references.
Those references are rebound in `internal-.docs/BITCODE_V27_CRYPTO_RESEARCH_REBINDING.md` before promotion.
This file remains an internal specification note, not a cited public paper.

## WDRR Digest Incorporated

The May 6, 2026 web deep-research report sharpens V27 from open tokenomics research into implementation preparation.
The following conclusions are now draft-target guidance:

- keep `$BTD` compact at the base layer: finite cap, non-fungible cell, AssetPack range, Read-Fit-Prove-Settle minting;
- make the AssetPack range the commercial unit and keep individual cells as proof/accounting units;
- define normalized Bitcode volume as proof-addressable semantic volume, not raw bytes or tokenizer counts;
- use BTC as fee asset through actual wallet-authorized transactions, with PSBT-style signing and no server custody of user private keys;
- use regtest or equivalent local chain for deterministic Bitcoin tests and signet as the canonical public Bitcoin proof lane;
- treat public Bitcoin testnet as supplementary only;
- treat Ethereum anchoring as secondary or optional in V27;
- use Ethereum standards as analogies, not inherited ontology;
- enforce recurring economics through Bitcode Exchange licensed reads and rights transfers rather than relying on third-party royalty signaling;
- keep ancestry optional but canonical, late-bound, evidence-based, and non-supply.

These conclusions supersede earlier draft uncertainty where the V27 files left normalized volume, public testnet lane selection, and Bitcoin/Ethereum priority open.

## Executive Summary

V27 should formalize `$BTD` as a capped, non-fungible, proof-backed source-share registry rather than as a generic token launch, and should make that registry operational through actual wallet, BTC fee, ledger anchor, Exchange transfer, Terminal transaction, reconciliation, and deployment surfaces.

Bitcode already frames Source Shares as measured technical intelligence moving through:

1. Deposit source.
2. Express or measure a Read.
3. Fit source to that Read.
4. Prove provenance, dedupe, admissibility, and value.
5. Settle contribution and rights.
6. Issue `$BTD` only after closure.
7. Route owner reads, licensed reads, revenue, proof, and audit through Exchange state.

The strongest V27 formalization is:

> `$BTD` is a finite non-fungible registry of source-measurement-backed cells, minted only when source becomes fit to a Read, proves out, and settles into an AssetPack.

Each AssetPack should occupy exactly one contiguous range of `$BTD` cells.
The individual cell preserves provenance and non-fungibility.
The contiguous range becomes the main commercial unit.

This preserves four critical distinctions:

- BTC pays fees.
- `$BTD` is not a fungible spend token.
- `$BTD` records non-fungible AssetPack share/read-right holdings plus measured Bitcode content amount.
- Exchange settlement and licensed-read flows are the primary commercial economics, not optional third-party marketplace royalties.

V27 should make this a protocol law across spec, package, proof, database, receipt, wallet, ledger, Exchange, Terminal, telemetry, deployment, and UI surfaces.

## Normative Core For V27

V27 should open from the following core law:

```text
One $BTD = one unique cell in a finite global Bitcode source-share registry.
One AssetPack = one contiguous range of $BTD cells.
Minting occurs only at Read -> Fit -> Prove -> Settle closure.
Licensed reads, not optional marketplace royalties, are the main recurring revenue source.
Ancestor participation is evidence-based, not age-based.
```

The hard supply cap is already present in `packages/btd/src/index.ts` as:

```ts
export const BTD_MAX_MINTABLE_SUPPLY = 21_000_000 as const;
```

V27 must turn that currently staged invariant into complete tokenomics law:

- package constant,
- protocol receipt invariant,
- proof artifact invariant,
- Exchange database invariant,
- UI disclosure invariant,
- replay invariant,
- and failure invariant when a mint would exceed the cap.

## Version Split

V27 owns tokenomics law and the minimum crypto-commercial implementation path.

V27 owns:

- Terminal Read/Fit minting as the canonical mint path.
- minimal Exchange existing-`$BTD` acquisition, bid/ask, and rights transfer.
- wallet/provider signing posture sufficient for user-authorized transactions.
- actual BTC fee transaction receipts.
- ledgerized AssetPack anchors for range, source root, proof root, and policy hash.
- ledgerized journal diffing and ledger/database reconciliation.
- testnet implementation and mainnet-ready controls.

V28+ owns larger product implementations that rely on that law:

- broader Terminal product expansion.
- deeper Exchange market structure, richer order books, and external market integrations.
- optional liquidity wrappers, slices, or secondary market exposure.
- third-party interface propagation after Protocol and Exchange semantics are stable.

V27 should not block on a full Exchange marketplace.
The V27 closure standard should be: supply, mint, range, receipt, access, replay, proof, wallet, fee, anchor, minimal transfer, journal, reconciliation, and deployment invariants are exact enough that later Terminal and Exchange versions can grow without changing the base law.

## Repo Grounding And Enforcement Surfaces

The V26 repository already contains reliable anchors for formal `$BTD` tokenomics:

| Path | Current or future role | V27 tokenomics invariant |
| --- | --- | --- |
| `BITCODE_SPEC_V26.md` | Active V26 canon | Records that full `$BTD` tokenomics are later-version work |
| `BITCODE_SPEC_V26_DELTA.md` | Active V26 reform ledger | Records deferred tokenomics and compatibility-carrier constraints |
| `BITCODE_SPEC_V26_NOTES.md` | Active V26 notes | Records V27 `$BTD` tokenomics as future focus |
| `BITCODE_SPEC_V26_PARITY_MATRIX.md` | Active V26 parity | Provides the model for V27 parity checks |
| `BITCODE_SPEC_V27_NOTES.md` | This draft note | Tokenomics handoff and design constraints |
| `packages/btd/README.md` | Human package contract | Non-fungible AssetPack share/read-right semantics |
| `packages/btd/src/index.ts` | Current package surface | `BTD_MAX_MINTABLE_SUPPLY`, BTC fee basis, measured `$BTD`, fungible-mutation rejection |
| `packages/btd/src/plans.ts` | Future bundle posture | V28 reference bundles must not imply V26 checkout or fungible token sale |
| `.bitcode/source-to-shares-fifth-gate-proof.json` | Existing proof artifact | Future minted range roots, source roots, measurement roots, and allocation roots |
| `internal-.docs/BITCODE_EXCHANGE_DATABASE.md` | Exchange schema target | Supply state, ranges, cells, receipts, licenses, ancestry, revenue routes |
| `apps/uapi/components/base/bitcode/btd/*` | Current UI posture | BTC fee asset vs non-fungible `$BTD` holding/read-right disclosure |
| `apps/uapi/app/[token]/page.tsx` or successor route | Future token/range route | Owner-read, licensed-read, range boundaries, supply remaining, legal-right disclosure |

If exact current files are missing for receipt schemas, proof modules, treasury models, or Exchange tables, V27 should add narrow files rather than scattering tokenomics logic through existing broad modules.

Recommended exact additions:

| Path | Purpose |
| --- | --- |
| `packages/btd/src/constants.ts` | Supply cap, quantization constants, default split constants |
| `packages/btd/src/supply.ts` | Canonical supply-state machine and cap checks |
| `packages/btd/src/range.ts` | Contiguous AssetPack range allocation and overlap prevention |
| `packages/btd/src/allocation.ts` | Contributor weight calculation and largest-remainder allocation |
| `packages/btd/src/ancestry.ts` | Ancestor-edge schema, confidence thresholds, and decay logic |
| `packages/btd/src/revenue.ts` | Licensed-read BTC revenue routing and conservation |
| `packages/btd/src/access.ts` | Owner-read vs licensed-read policy evaluation |
| `packages/btd/src/receipts.ts` | Mint receipts, ancestor receipts, and revenue-route receipts |
| `protocol-demonstration/test/btd-range-mint.spec.ts` | Mint path, cap, and range-overlap tests |
| `protocol-demonstration/test/btd-allocation.spec.ts` | Deterministic allocation and conservation tests |
| `protocol-demonstration/test/btd-access-rights.spec.ts` | Owner/licensed/unauthorized read tests |
| `protocol-demonstration/test/btd-ancestor-routing.spec.ts` | Dependency-edge and revenue-routing tests |
| `protocol-demonstration/test/btd-dedupe.spec.ts` | Duplicate-source remint prevention tests |
| `protocol-demonstration/test/btd-exhaustion.spec.ts` | Post-cap refit-only behavior |
| `protocol-demonstration/test/btd-replay.spec.ts` | Receipt replay reconstructs identical supply state |
| `supabase/migrations/<timestamp>_btd_registry.sql` | Canonical SQL schema and DB-level uniqueness/check constraints |

## Comparative Design Lessons To Rebind Before V27 Promotion

The research seed memo pointed at several external design families.
V27 should rebind these to primary sources before using them normatively:

- Bitcoin: terminal scarcity, deterministic issuance, and invalidity of over-cap issuance.
- Bitcoin PSBT: user-controlled signing is the V27 fee-transaction posture; Bitcode may construct transaction intent and observe finality but must not custody user private keys.
- Bitcoin signet: canonical public Bitcoin proof lane for V27 fee and anchor paths; public testnet is supplementary.
- ERC-20: useful contrast for why pure fungible balances are the wrong base ontology.
- ERC-721: unique asset identity.
- ERC-1155: mixed fungible, non-fungible, and semi-fungible token-type management.
- ERC-2309: consecutive transfer event semantics as a close analogue for contiguous AssetPack ranges.
- ERC-4907: split owner/user roles as an analogue for owner-read vs licensed-read.
- ERC-3525: slot/value semi-fungibility as a possible wrapper layer, not the base `$BTD` cell model.
- EIP-2981: royalty signaling is not enough because payment depends on marketplace behavior.
- EIP-712: useful for signed intents only when Bitcode adds nonces, deadlines, and domain separation.
- ERC-5218: reminder that token property logs are not legal-rights tracing.
- Filecoin: issuance should follow provable utility rather than mere arrival, with proof, collateral, and slashing as anti-game design inspiration.
- NFTX-like vault patterns: liquidity wrappers can improve tradability but collapse individual provenance and should stay above the canonical cell/range layer.
- Story-like ancestry graphs: derivative relationships and license-bound revenue routing are closer to Bitcode's knowledge-economy claim than age-based royalties.
- NFT licensing literature: token ownership does not automatically transfer copyright or broad IP rights; access and derivative rights must be explicit.

V27 should not copy any external token standard wholesale.
It should internalize the relevant lessons into Bitcode's own Protocol, Exchange, and proof architecture.

## Proposed Data Model

V27 should start from typed source-share cells and AssetPack ranges.

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
  proofRoot: string;
  exchangeReceiptRoot: string;
  accessPolicyId: string;
  accessPolicyHash: string;
}
```

The mint receipt must be unusually explicit because Bitcode's trust proposition is auditable reconstruction rather than trust in a black-box token balance.

Minimum receipt fields:

- `assetPackId`
- `rangeStart`
- `rangeEndExclusive`
- `tokenCount`
- `totalMintedBefore`
- `totalMintedAfter`
- `maxSupply`
- `sourceManifestRoot`
- `proofRoot`
- `exchangeReceiptRoot`
- `accessPolicyId`
- `accessPolicyHash`

## Lifecycle

V27 should make issuance downstream of proof and settlement.
Source deposit or Read discovery alone must not mint `$BTD`.

```text
Deposit source plus context
  -> Read is measured
  -> Fit evaluates utility, quality, valence, provenance, and dedupe
  -> Proof validates provenance, dedupe, admissibility, and replay
  -> Settlement allocates contributors, rights, policy, and revenue posture
  -> Mint one contiguous AssetPack range
  -> Owner reads and licensed reads route through Exchange state
```

Normative issuance rule:

```text
Source deposit does not mint $BTD.
Read discovery does not mint $BTD.
Candidate fit does not mint $BTD.
Uncommitted proof does not mint $BTD.
Only proof-backed Read-Fit settlement mints $BTD.
```

## Quantity, Allocation, And Revenue

V27 should separate supply quantity from quality-weighted allocation.

Primary measureminting quantity rule:

```ts
S_MAX = 21_000_000;
M_before = cumulativeAdmittedMeasurement;
M_after = M_before + normalizedBitcodeVolume;
targetMinted(M) = floor(S_MAX * M / (M + K));
tokenCount = targetMinted(M_after) - targetMinted(M_before);
tokenCount = min(tokenCount, S_MAX - totalMinted);
```

`K` is the measurement half-saturation constant.
This replaces the cliff-like post-cap posture with fixed-supply measureminting decay and a zero-cell/refit tail.

Simple semantic-volume quantization remains a measurement witness:

```ts
export const BTD_QUANTIZATION_Q = 1_000n;
```

The normalized Bitcode volume scalar is no longer open at the class level.
WDRR resolves it as proof-addressable semantic volume.
It is not byte-like and not tokenizer-count-like.
V27 implementation must still define the exact algorithm for identifying, deduping, proving, and replaying those semantic units.

Required semantic-volume properties:

- every counted unit is accepted by Fit;
- every counted unit has a proof receipt;
- every counted unit passes dedupe;
- repeated wording, compression artifacts, tokenizer drift, and pack fragmentation cannot inflate count;
- excluded candidate units have exact exclusion reasons;
- replay reconstructs the same `tokenCount` from receipt roots.

Measureminting-specific invariants:

- settlement order is Exchange-sequence order;
- cumulative measurement advances only after Read-Fit-Prove-Settle;
- duplicate normalized source cannot increase cumulative measurement;
- splitting or merging equivalent source cannot improve total minted count;
- residual mint credit is deterministic and replayable;
- zero-cell receipts are valid receipts, not failed mints;
- when entitlement falls below one whole cell, the event emits refit, license, ancestry, proof, and revenue-routing receipts.

Quality should determine allocation and revenue weighting, not mint inflation.

Default contributor weighting:

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

Required properties:

- allocation sums exactly to `tokenCount`;
- allocation is deterministic under receipt replay;
- allocation cannot over-mint;
- negative, NaN, infinite, or unbounded weights fail closed;
- quality does not create new supply.

Default licensed-read revenue split:

```ts
R_direct = 0.80 * R;
R_ancestor = 0.12 * R;
R_treasury = 0.08 * R;
R_dispute_holdback = 0.00 * R; // nonzero only when settlement policy or dispute posture requires custody
```

This split is tunable.
The structure is not optional: direct holders, proven ancestors, protocol/proof treasury, dispute holdback, and pending/failed route states must be explicit settlement categories.

## Access Rights

V27 must define `$BTD` as a source-share/read-right instrument without implying broader legal rights than the policy grants.

Recommended default model:

- `$BTD` holders receive durable owner-read and audit rights for the owned cell or range, subject to the AssetPack access policy.
- Licensed readers can buy scoped, metered, time-bound, or policy-bound read access without acquiring `$BTD`.
- Licensed-read revenue routes to current holders, proven ancestors when admitted, and protocol/proof/treasury accounts.
- Holding `$BTD` does not automatically transfer copyright, broad derivative rights, redistribution rights, or commercial rights unless the immutable access policy explicitly says so.

Each AssetPack range must carry:

- `accessPolicyId`
- `accessPolicyHash`
- policy URI or storage pointer
- owner-read terms
- licensed-read terms
- derivative-use terms
- redistribution/confidentiality terms
- dispute/takedown posture

V27 UI copy must not promise "copyright ownership", "dividends", "guaranteed royalties", or price appreciation unless those claims are legally and protocol-enforced.

## Market Units

V27 should define three layers:

| Unit | Meaning | Primary use | V27 posture |
| --- | --- | --- | --- |
| Cell | One unique `$BTD` registry entry | Provenance, audit, exact accounting | canonical non-fungible base |
| Range | One contiguous AssetPack block | Primary ownership, settlement, transfer, and read-right unit | primary commercial unit |
| Slice | Optional wrapper over part of a range or pooled ranges | Liquidity, financing, delegated revenue rights | V28+ wrapper only |

The base layer must remain non-fungible.
Any later fungible or semi-fungible exposure must be a wrapper over cells/ranges, not a replacement for them.

## Measureminting Decay And Tail Policy

V27 should use fixed-supply measureminting decay as the primary issuance law and refit-only as the tail fallback.

```text
Before tail:
  Read-Fit-Prove-Settle events mint cells according to decayed cumulative measurement.

During tail:
  valid events may mint zero or one cells depending on deterministic residual entitlement.

After practical exhaustion:
  valid events emit zero-cell, refit, license, ancestry, proof, and revenue-routing receipts,
  but no new primary cells.
```

Rejected policies:

- silently lifting the cap;
- burn-to-mint as the default;
- governance-based post-cap inflation;
- age-based rent to old token IDs after exhaustion.

Whole-cell indivisibility means infinite nonzero minting from 21,000,000 cells is impossible.
V27 therefore treats infinite future Read-Fit activity as infinite possible receipts, not infinite possible cell mints.

## Ancestry Finding

Ancestry is not necessary to define `$BTD`.
It is necessary only if Bitcode wants the stronger claim that later technology pays earlier knowledge because later knowledge proves it stands on that earlier knowledge.

Final V27 framing:

> Ancestry is unnecessary as a core token primitive, but necessary as an attribution/proof primitive if Bitcode wants protocol-level intergenerational knowledge rewards.

Therefore:

- ancestry must not affect mint count;
- ancestry must not affect AssetPack range length;
- ancestry must not reward lower token IDs;
- ancestry must not be claimable as speculative pre-mint entitlement;
- ancestry may affect licensed-read revenue routing, proof graph, dedupe, derivative classification, teaching-value attribution, reputation, search, and ranking.

The contradiction that makes ancestry conditionally necessary:

1. If later packs pay old packs only because they are earlier, the protocol rewards an early-mint lottery.
2. If later packs pay no old packs, the "standing on the shoulders of giants" economic claim disappears.
3. If later packs pay old packs because of citations, tags, or claimed dependency, the protocol has recreated ancestry under another name.

Therefore any protocol-level intergenerational knowledge reward needs a proof-bearing dependency relation.
It does not have to be named "ancestry", but it has the function of ancestry.

## Safe Ancestry Module

V27 should specify ancestry as a late-bound Exchange relation, not a supply primitive.

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
  sourceFingerprintRoot?: string;
  reviewerReceiptRoot?: string;
  claimantId?: string;
  reviewerId?: string;
  confidence: number;
  timelessness: number;
  depth: number;
  createdAfterChildFit: true;
  conflictDisclosure: string[];
  riskFlags: string[];
  status: 'payable' | 'recorded_unpaid' | 'rejected';
  supplyEffect: 'none';
  mintCountDelta: 0;
}
```

The critical invariant is:

```ts
createdAfterChildFit === true;
```

Safe ordering:

```text
source becomes fit
  -> AssetPack is admitted
  -> child pack proves dependency evidence
  -> reviewer/proof receipts evaluate dependency
  -> ancestor edge is created
  -> future revenue routing may include the edge
```

Unsafe ordering:

```text
claim ancestry first
  -> mint speculative foundational packs
  -> pressure future packs to route value through them
```

Default ancestry routing:

```ts
ancestorWeight_j =
  confidence_j *
  timelessness_j *
  decay(depth_j);

decay(d) = 1 / (1 + d) ** 2;
```

Suggested default:

```ts
export const MIN_ANCESTOR_CONFIDENCE = 0.25;
```

Weak edges may be recorded but must not receive revenue.

Gate 9 closes the draft-target implementation of this module:

- `packages/btd/src/ancestry.ts` owns the review function and graph checks.
- `/api/btd/ancestry-review` owns the unversioned commercial review route.
- `btd_ancestor_edges` persists review rows with review id, source fingerprint root, claimant/reviewer ids, risk flags, status, route weight, and non-supply constraints.
- reciprocal loops, dependency cycles, duplicate source roots, claimant/reviewer conflicts, low confidence, citation-only edges, and disclosed conflicts are tested in package/API/demonstration coverage.

## Ancestry Attack Surface

V27 must not implement ancestry naively.

Attack classes:

- foundational squatting;
- premature specifying;
- citation cartel or reciprocal-loop routing;
- dependency laundering through controlled intermediates;
- over-fragmentation into many micro-packs;
- popularity feedback loops;
- ancestor spam;
- claimant/reviewer conflict of interest.

Minimum mitigations:

- no reward for abstract breadth alone;
- no ancestry reward at mint time;
- require concrete evidence of implementation, proof, source reuse, or review-confirmed teaching dependency;
- detect reciprocal loops;
- discount closed citation clusters;
- require external corroboration for paid edges;
- separate claimant from verifier;
- apply diminishing returns across repeated edges among the same parties;
- trace the full dependency DAG;
- discount recently created controlled intermediates;
- apply dedupe and compression penalties;
- enforce minimum contribution thresholds;
- separate "cited" from "necessary";
- weight by proof receipts rather than social popularity.

## WDRR Threat Model

The WDRR threat finding is that V27's highest-risk attack surface is knowledge-market distortion.
The system must assume contributors will optimize whatever gets paid.

| Threat | Failure mode | V27 mitigation | Proof or telemetry artifact |
| --- | --- | --- | --- |
| foundational squatting | broad early packs try to tax later work | no ancestry payout at mint; minimum evidence threshold; no reward for breadth alone | `ancestor.review_receipt`, low-confidence unpaid edge log |
| premature specifying | vague foundational claims arrive before utility is proven | enforce `createdAfterChildFit === true`; ancestry only after child settlement | mint-admission negative tests; settlement gate receipts |
| citation cartels and reciprocity | mutual edge inflation among related parties | anti-reciprocity checks; claimant/reviewer separation; conflict disclosure; confidence floor | graph anomaly telemetry; reviewer conflict receipts |
| dependency laundering | controlled intermediates siphon revenue | full DAG traversal; common-control disclosure; depth decay; intermediate-age discount | route audit receipts; lineage repair receipts |
| fragmentation | one coherent pack is split into many micro-packs | minimum semantic unit threshold; dedupe/compression penalty; no extra mint for splits | dedupe receipts; fragmentation alerts |
| royalty evasion | external markets skip creator or ancestor payouts | keep recurring economics inside licensed-read and Exchange settlement paths | settlement-route receipts; payout-failure alerts |
| rights overclaim | users infer copyright, dividends, or derivative rights from `$BTD` ownership | immutable access-policy hash; explicit owner-read/licensed-read/derivative terms in UI | policy-hash mismatch alerts; access-check failure receipts |
| false ledger finality | UI or API treats pending/reorged facts as settled | ledger/database reconciliation and blocking journal diffs | projection repair receipts; finality mismatch alerts |
| fee misuse | `$BTD` is used like a spend token | BTC-only fee receipts and generic `$BTD` mutation rejection | fee-asset tests; mutation rejection telemetry |

## Code-Level Invariants

V27 must repeat a small rigid rule set across spec, packages, receipts, database, proofs, and UI:

| Invariant | Required expression |
| --- | --- |
| hard cap | `totalMinted + tokenCount <= 21_000_000` |
| Read-Fit-only issuance | mint fails before proof-backed settlement |
| range contiguity | `rangeStart === previous.nextTokenId` |
| range validity | `rangeEndExclusive > rangeStart` |
| no overlap | no two AssetPack ranges overlap |
| one pack, one block | a minted AssetPack cannot mint another primary range |
| allocation conservation | `sum(allocations) === tokenCount` |
| explicit access policy | every minted range has immutable `accessPolicyId` and `accessPolicyHash` |
| owner/licensed separation | owner-read and licensed-read are distinct policy branches |
| replay determinism | receipts reconstruct identical supply, allocation, and routing state |
| no fungible spend semantics | `$BTD` cannot be debited as a currency balance |
| treasury separation | treasury can hold, route, distribute, escrow, and report, but cannot mint |
| ancestry non-supply | ancestor edges cannot increase mint count |
| measureminting tail | zero-cell receipts route value through refit, license, ancestry, proof, and revenue receipts without new cells |

Recommended package-level expressions:

```ts
assert(state.totalMinted + mintCount <= BTD_MAX_MINTABLE_SUPPLY);
assert(range.start === state.nextTokenId);
assert(range.endExclusive > range.start);
assert(!assetPack.alreadyMinted);
assert(sum(allocations) === tokenCount);
assert(ownerRead || validLicense);
assert(edge.confidence >= MIN_ANCESTOR_CONFIDENCE);
```

## Exchange Database Targets

V27 should specify or create Exchange tables equivalent to:

- `btd_supply_state`
- `btd_asset_pack_ranges`
- `btd_cells`
- `btd_mint_receipts`
- `btd_ownership_events`
- `btd_read_licenses`
- `btd_ancestor_edges`
- `btd_contributor_allocations`
- `btd_licensed_read_revenue_routes`
- `btd_protocol_upgrade_receipts`

Database constraints must include:

- unique `token_id`;
- unique `asset_pack_id` for primary ranges;
- no overlapping primary ranges;
- `range_start < range_end_exclusive`;
- `total_minted <= 21000000`;
- receipt roots are not nullable after committed mint;
- access policy hash is not nullable after committed mint;
- ownership events cannot create negative holdings;
- licensed reads cannot imply ownership transfer.
- licensed-read revenue rows must conserve gross sats across direct, ancestor, treasury, and dispute-holdback categories.
- pending or failed revenue routes must be explicit metadata, not invisible settlement drift.

## Demonstration Test Matrix

V27 should add a compact but high-leverage proof/test matrix:

| Test file | Minimal cases |
| --- | --- |
| `protocol-demonstration/test/btd-range-mint.spec.ts` | successful mint after settlement; failure before proof; cap exceed failure; non-overlap enforcement |
| `protocol-demonstration/test/btd-allocation.spec.ts` | deterministic weights; largest-remainder conservation; no negative or overflow allocations |
| `protocol-demonstration/test/btd-access-rights.spec.ts` | owner-read succeeds; licensed read succeeds within term; expired or unauthorized read fails |
| `protocol-demonstration/test/btd-ancestor-routing.spec.ts` | direct dependency pays; weak edge records but does not pay; depth decay is deterministic |
| `protocol-demonstration/test/btd-dedupe.spec.ts` | duplicate normalized source cannot remint without new derivative justification |
| `protocol-demonstration/test/btd-exhaustion.spec.ts` | zero-cell tail receipts route value but do not mint new cells |
| `protocol-demonstration/test/btd-replay.spec.ts` | receipt replay reconstructs identical supply state, allocations, and ancestor payouts |

## Tunable Defaults

V27 may begin with these defaults while clearly marking which values are immutable:

| Parameter | Default | Tunability |
| --- | --- | --- |
| `BTD_MAX_MINTABLE_SUPPLY` | `21_000_000` | immutable after launch |
| `BTD_QUANTIZATION_Q` | `1_000` normalized-volume units | tunable before launch |
| `DIRECT_READ_SPLIT` | `80%` | tunable by settlement policy |
| `ANCESTOR_POOL_SPLIT` | `12%` | tunable by settlement policy |
| `TREASURY_SPLIT` | `8%` | tunable by settlement policy |
| `MIN_ANCESTOR_CONFIDENCE` | `0.25` | tunable by proof policy |
| `ANCESTOR_DECAY` | `1/(1+d)^2` | tunable by proof policy |
| `DISPUTE_WINDOW` | `30 days` | legal/ops decision |
| `DISPUTE_HOLDBACK` | `10%` of newly allocated cells or revenue | legal/ops decision |

Only the hard cap should be treated as terminal tokenomics law at launch.

## Anti-Game Layer

V27 should adopt a proof-and-review discipline closer to utility-proof systems than to permissive NFT minting culture:

- dedupe receipts prevent the same normalized source from minting twice;
- derivative contribution must prove a genuinely new abstraction, implementation, teaching value, or fit;
- source-right assertions are challengeable;
- reviewers and provers are reputation-weighted;
- high-impact provers or ancestry claims may be bonded;
- newly allocated value may carry a dispute holdback;
- weak ancestor edges are recorded but unpaid;
- age-based premiums are prohibited;
- broad foundational claims read concrete downstream dependency evidence.

## Legal And Product Disclosures

V27 must settle legal vocabulary before public tokenomics launch.

The access-right matrix should distinguish at least:

- owner-read;
- audit-read;
- licensed-read;
- derivative-use;
- commercial-use;
- no-redistribution;
- confidentiality;
- copyright assignment, if any;
- source takedown;
- dispute process;
- policy versioning;
- immutable policy hash.

UI must show:

- AssetPack range;
- minted from Read-Fit settlement;
- normalized volume;
- owner-read/licensed-read/no-read posture;
- ancestry routes when present;
- supply remaining;
- access policy hash;
- legal-rights summary.

Public copy must avoid claiming:

- `$BTD` is a fee token;
- `$BTD` is a fungible currency;
- holding `$BTD` automatically grants copyright;
- secondary royalties are guaranteed;
- price appreciation is promised;
- treasury routing is the same as dividends.

## Open Questions

V27 must answer these before promotion:

1. What exact algorithm identifies proof-addressable semantic units from fit-accepted contribution segments?
2. What minimum semantic unit or pack-size threshold avoids dust and over-fragmentation?
3. Which Bitcoin commitment path is selected for the first AssetPack anchor: Taproot, OP_RETURN, or another standard pattern?
4. Which wallet/library stack best supports PSBT-style V27 fee flow and signet proof?
5. What legal rights does `$BTD` convey, and which rights require a separate license?
6. How are source-right disputes filed, bonded, reviewed, and resolved?
7. How strong should the anti-game layer be at launch?
8. Which reviewer/prover roles read reputation or bond requirements?
9. What is the exact minimal V27 Exchange boundary for buy, sell, bid, ask, cancellation, settlement, and rights transfer before broader V28+ market depth begins?
10. Should wrapper slices exist in V27 tests only, or be postponed until the base range registry has live evidence?
11. How does zero-cell/refit tail value routing work when a new Read depends on a practically exhausted registry?

## Implementation Priority

The correct implementation order is:

1. Hard cap and supply state.
2. Contiguous range allocator.
3. Mint receipt schema.
4. Replay proof for supply, allocation, and ranges.
5. Exchange database constraints.
6. Access policy and licensed-read evaluation.
7. Owner-read and licensed-read UI disclosure.
8. Wallet signer/session/network model.
9. PSBT-style BTC fee transaction receipts and regtest/signet transaction proof.
10. Ledgerized AssetPack anchor schema and first concrete Bitcoin commitment path.
11. Minimal Exchange buy/sell/bid/ask and rights-transfer receipts.
12. Terminal transaction journal and ledgerized journal diffing.
13. Ledger/database reconciler and projection repair receipts.
14. Crypto telemetry taxonomy, deployment lanes, and upgrade receipts.
15. Direct-holder revenue routing.
16. Ancestry edge schema and unpaid proof graph.
17. Paid ancestry routing only after attack mitigations are proven.
18. Optional wrapper/slice/liquidity structures only after the canonical registry works.

Starting with marketplace liquidity before registry law and real transaction finality exist would invert the Bitcode model.
V27 must first prove what is being traded, read, licensed, paid, anchored, reconciled, and settled.

## Practical Cryptotechnological Commercialization Addendum

The V27 tokenomics law must be paired with a practical crypto-application layer.
Otherwise `$BTD` remains a correct internal model but not a commercial cryptotechnological system.

Minimum V27 crypto surfaces:

- wallet integration for signer sessions, network selection, address/session authorization, and failure-aware transaction flow;
- actual BTC fee transactions for mint, anchor, license, transfer, Exchange, and Terminal operations;
- ledgerized AssetPack anchors that bind range, source root, proof root, and access policy hash without exposing private source;
- minimal Exchange order flow for buy, sell, bid, ask, cancellation, acceptance, settlement, and rights transfer;
- Terminal transaction journals for Read, Fit, proof, mint, fee, anchor, license, order, transfer, dispute, and settlement finalization;
- ledgerized journal diffing across Terminal intent, Exchange settlement, external ledger observation, database projection, proof roots, and telemetry;
- database synchronization where external ledgers are source of truth for cryptographic finality and the database is ledger-derived plus metaphysical canonical state;
- testnet and mainnet-ready deployment lanes;
- crypto telemetry and operational upgrade receipts.

WDRR implementation posture:

- BTC fee flow should be `prepared -> signed -> broadcast -> confirmed | replaced | reorged | failed`.
- signing should use PSBT-style wallet handoff or an accepted wallet-native equivalent.
- Bitcode servers may prepare transaction intent and observe finality, but must not custody user private keys for user-owned actions.
- local Bitcoin tests should use regtest or an equivalent deterministic local chain.
- public Bitcoin proof should use signet.
- public Bitcoin testnet may be used as supplementary coverage but is not the canonical V27 proof lane.
- Ethereum anchoring, if included, should be a minimal immutable registry/event emitter for commitments and should remain secondary to Bitcoin in V27.

Gate 10 closes the draft-target wallet/BTC fee implementation:

- signer sessions require message-signature or wallet-provider authorization proof before `psbt_sign` can execute;
- proofless sessions remain prepared and fail closed;
- BTC fee receipts bind wallet authorization proof, PSBT or signed handoff state, txid when broadcast, sats paid, Exchange sequence, Terminal journal root, network, and no-server-custody posture;
- `/api/btd/btc-fee-transaction` exposes the unversioned commercial receipt transition route;
- `btc_fee_transactions` persists the receipt projection with BTC-only/no-custody constraints.

Gate 11 closes the draft-target ledgerized AssetPack anchor implementation:

- Bitcoin AssetPack anchors use Taproot as the selected primary commitment method;
- signet remains the public Bitcoin proof lane while local/regtest-compatible receipt transitions use the same package state machine;
- Ethereum anchoring is secondary and explicit through `ethereum_registry_event`, never implicit;
- `/api/btd/asset-pack-ledger-anchor` exposes the unversioned commercial anchor transition route;
- `btd_asset_pack_ledger_anchors` persists commitment method, txid/hash, roots, policy hash, `$BTD` range, finality, and receipt projection.

Gate 12 closes the draft-target minimal AssetPack Exchange implementation:

- `packages/btd/src/exchange.ts` implements BTC-priced buy, sell, bid, ask, cancel, accept, settle, and rights-transfer primitives without fungible `$BTD` balances;
- rights-transfer receipts require a settled order, access policy hash, BTC fee receipt, and ledger anchor;
- `/api/btd/asset-pack-exchange` exposes the unversioned commercial route for order transitions, rights transfer, Terminal journal binding, and explicit registry commits;
- `btd_exchange_orders` and `btd_rights_transfer_receipts` persist range, parties, BTC price, order state, access policy hash, receipt projection, Exchange sequence, and ledger-anchor evidence;
- package, API, ORM, and demonstration tests prove the minimal lifecycle while leaving broader market depth to V28+.

Gate 13 closes the draft-target Terminal journal and diff implementation:

- `packages/btd/src/terminal-journal.ts` defines the required V27 Terminal transaction-family set and emits blocking coverage receipts when a family is missing;
- journal entries carry stable ids, transaction kind, actor, pre/post state roots, receipt roots, ledger anchor ids, positive Exchange sequence, and issued time;
- `/api/btd/terminal-journal` exposes the unversioned commercial route for commit, projection diff, and coverage checks;
- `btd_terminal_journal_entries` constrains supported transaction kinds and positive Exchange sequence;
- package, API, ORM, and demonstration tests prove full family coverage, missing-family blocking, commit-gated persistence, and stale projection blocking.

Gate 14 closes the draft-target ledger/database reconciliation implementation:

- `packages/btd/src/reconciliation.ts` makes ledger-observed finality the source of truth for cryptographic facts;
- confirmed, reorged, and failed ledger facts produce blocking repair receipts when database projection disagrees;
- private/metaphysical canonical database facts must carry hash-bound canonical roots or receipt roots and must be marked private;
- `/api/btd/ledger-database-reconciliation` exposes the unversioned commercial route for reports, Terminal journal binding, and explicit repair-row commits;
- package, API, ORM, and demonstration tests prove confirmed-ledger precedence, idempotent repair ids, private canonical fact binding, and rejection of unmarked/unbound metaphysical facts.

Gate 15 closes the draft-target testnet/mainnet-ready, telemetry, and upgrade implementation:

- `packages/btd/src/deployment-lanes.ts` defines local, regtest, signet, supplementary testnet, mainnet-ready, and mainnet-value-bearing lanes plus required environment keys;
- signet remains the canonical public Bitcoin proof lane and public testnet remains supplementary;
- value-bearing mainnet is blocked unless an operational approval root is supplied;
- `packages/btd/src/telemetry.ts` classifies wallet, fee, ledger, provider, journal, database, access, settlement, and upgrade events for alerting;
- `packages/btd/src/upgrade.ts` records versioned upgrade/migration receipts with approval, state roots, rollback posture, and ledger anchor ids;
- `/api/btd/deployment-readiness` exposes unversioned readiness, telemetry, and upgrade receipt actions with explicit registry commits.

Gate 16 closes product-surface, research, and promotion proof readiness:

- Terminal Read minting and minimal Exchange range-right acquisition are both V27 product surfaces;
- broader Exchange market depth and broader Terminal product workflows remain later-version work;
- `/btd/[assetPackId]` is the unversioned AssetPack range disclosure route for range, access policy, read branch, proof root, and source manifest root;
- `internal-.docs/BITCODE_V27_CRYPTO_RESEARCH_REBINDING.md` binds official-source crypto research to V27 choices without freezing candidate adapter libraries as protocol law;
- `BITCODE_SPEC_V27_PROVEN.md` and `.bitcode/v27-total-closure-proof.json` map required proof families to gate artifacts or accepted equivalents.

The key truth split:

```text
External ledgers:
  source of truth for cryptographic finality, payments, anchors, and ledgerized ownership transfer.

Exchange journal:
  source of truth for protocol settlement, proof admission, access policy, and commercial state.

Database:
  ledger-derived and journal-derived projection plus canonical private/metaphysical facts.

UI/API:
  projections only; never allowed to claim finality unsupported by ledger, journal, proof, or policy roots.
```

The first V27 commercial API boundary should remain intentionally narrow:
authenticated registry snapshots can expose supply and AssetPack range projections, and authenticated mint drafts can compute semantic volume, measureminting, range, mint receipt, allocation, and Terminal journal projections.
Those draft routes are not committing mint APIs until Exchange persistence, wallet/BTC fee, ledger anchor, and replay proofs are closed.

Metaphysical canonical database facts include private source metadata, encrypted storage pointers, Read/Fit records before ledgerization, access policy documents, proof bundles, disputes, telemetry, pending settlement state, and user-experience state that cannot be a public ledger fact.

V27 must treat value-bearing mainnet launch as an operational approval event after V27 proves mainnet-ready controls.
Spec promotion is not itself permission to move real value on mainnet.

## Crypto Data Shapes To Refine

V27 should refine these draft shapes into package, receipt, database, and proof forms.

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

## Web Research Deep-Study Agenda

Before V27 promotes any normative crypto/library choices, the following agenda reads current web research rebound to primary sources, official docs, BIPs/EIPs, implementation docs, or audited library documentation.

Research outputs should answer: what is the current standard, what libraries are production-grade, what failure modes matter, what licensing/security constraints exist, and how the choice maps to V27 proof requirements.

Primary seed sources already identified for the research pass:

- Bitcoin Core RPC documentation: <https://bitcoincore.org/en/doc/>
- Bitcoin Core test-network onboarding: <https://bitcoincore.academy/testnets.html>
- BIP 174 PSBT: <https://bips.dev/174/>
- BIP 340 Schnorr signatures: <https://bips.dev/340/>
- BIP 341 Taproot: <https://bips.dev/341/>
- BIP 342 Tapscript: <https://bips.dev/342/>
- ERC-721: <https://eips.ethereum.org/EIPS/eip-721>
- ERC-1155: <https://eips.ethereum.org/EIPS/eip-1155>
- ERC-2309: <https://eips.ethereum.org/EIPS/eip-2309>
- ERC-4907: <https://eips.ethereum.org/EIPS/eip-4907>
- ERC-3525: <https://eips.ethereum.org/EIPS/eip-3525>
- ERC-2981: <https://eips.ethereum.org/EIPS/eip-2981>
- OpenZeppelin Contracts: <https://docs.openzeppelin.com/contracts>
- viem: <https://viem.sh/docs/getting-started>
- wagmi: <https://wagmi.sh/>
- Hardhat: <https://hardhat.org/>
- Foundry: <https://book.getfoundry.sh/>

Bitcoin research:

- Taproot commitments and script-path design for AssetPack anchors.
- OP_RETURN, Taproot, inscriptions/ordinals, descriptors, and miniscript tradeoffs for small commitments.
- PSBT flows, wallet compatibility, hardware-wallet behavior, and browser-wallet support.
- BIP32, BIP39, BIP84, BIP86, BIP174, BIP341, and BIP342 applicability.
- fee estimation, RBF, CPFP, mempool policy, dust, standardness, and transaction pinning risks.
- regtest, signet, testnet, and mainnet operational differences.
- Bitcoin Core RPC, Esplora/electrs, mempool APIs, provider failover, and reorg handling.
- candidate libraries such as bitcoinjs-lib, scure-btc-signer, bitcoinerlab, and miniscript tooling, with current maintenance and security posture.

Ethereum research:

- ERC-721, ERC-1155, ERC-2309, ERC-4907, ERC-3525, and ERC-2981 as reference points, not automatic adoption.
- EIP-712 signed orders and typed data for off-chain intent.
- account abstraction and smart account implications for ownership and access.
- OpenZeppelin, Foundry, Hardhat, viem, wagmi, ethers, and indexer options.
- Sepolia, Holesky, local chain, finality, reorg, gas, event indexing, and upgrade patterns.
- contract upgrade posture, immutable registry posture, and migration receipts.

Wallet research:

- Bitcoin browser wallet APIs and PSBT signing compatibility.
- WalletConnect coverage for Bitcoin and Ethereum flows.
- hardware wallet constraints for Taproot, PSBT, and EIP-712.
- message signing standards, SIWE where relevant, nonce/session expiration, and replay protection.
- privacy constraints around xpubs, address reuse, wallet fingerprinting, and user consent.

Storage and proof research:

- content-addressed manifests, Merkle DAGs, CAR files, IPFS, Arweave, object storage hash contracts, and encrypted source storage.
- selective disclosure and private AssetPack proof patterns.
- KMS/HSM/key custody options for server-held operational keys, never user private keys.
- proof bundle permanence, takedown, dispute, and revocation models.

Exchange and settlement research:

- signed order models, escrow, PSBT-based offer/accept flows, HTLC/atomic-swap applicability, DLC applicability, and payment-channel relevance.
- minimal order book vs bulletin-board order designs.
- rights transfer, licensed-read sale, revenue routing, refund, dispute, and cancellation mechanics.
- market manipulation, wash trading, replay, front-running, and stale order risks.
- compliance research for marketplace, money transmission, securities/commodities, tax reporting, sanctions, KYC/AML, and consumer disclosure issues.

Ledger/database reconciliation research:

- event-sourcing and projection repair patterns.
- indexer architectures for Bitcoin and Ethereum.
- idempotency keys, finality thresholds, reorg rollback, replay windows, and cross-provider disagreement handling.
- operational approaches for ledger as source of truth plus private canonical database state.

Deployment and observability research:

- RPC provider reliability, rate limits, failover, alerting, and cost.
- testnet/mainnet deployment checklists.
- key management, HSM/KMS, backup, rotation, break-glass access, and incident response.
- telemetry event naming for wallet failures, tx construction, broadcast, confirmation, reorg, reconciler drift, access failures, settlement failures, and migration failures.
- upgrade/migration best practices for on-chain contracts and off-chain projections.

Legal and policy research:

- source-share rights, read-rights, licensed reads, copyright transfer, derivative rights, resale, royalties, and access policy enforceability.
- token classification risk for non-fungible source-share/read-right assets.
- disclosures that avoid implying dividends, guaranteed royalties, broad copyright transfer, or price appreciation.
- privacy and confidential-source obligations for private AssetPacks.

The research result should come back as source-bound findings with explicit implications for:

- `packages/btd` module choices;
- ledger anchor implementation;
- wallet integration;
- Exchange order and rights-transfer design;
- database reconciliation;
- telemetry and deployment;
- legal/access-policy copy;
- V27 parity rows and generated proof families.

## Working Definition

> `$BTD` is Bitcode's finite 21,000,000-cell non-fungible source-share registry. Each cell is minted only at proof-backed Read-Fit settlement. Each AssetPack occupies a contiguous `$BTD` range whose length is derived from normalized Bitcode volume. Holding `$BTD` grants source-share owner-read/audit rights for the associated cell or range under an immutable access policy, while licensed reads route revenue to current holders and, when proven after child fit, knowledge ancestors through Exchange receipts. V27 makes this commercially real through wallet-authorized BTC fee transactions, ledgerized AssetPack anchors, minimal Exchange rights transfers, Terminal journals, and ledger/database reconciliation.

## V27 Closure Target

V27 should be closable only when all of the following are true:

- SPEC, DELTA, NOTES, PARITY, and PROVEN files exist for V27.
- `BTD_MAX_MINTABLE_SUPPLY` is a package, proof, receipt, DB, and UI invariant.
- AssetPack range minting is the only canonical issuance path.
- Read-Fit settlement is the only mint admission point.
- `$BTD` is rejected as a fungible spend token everywhere.
- owner-read and licensed-read are distinct and tested.
- the canonical receipt replay reconstructs supply state and allocation state.
- Exchange database constraints fail closed on overflow, overlap, missing policy, and duplicate mint.
- wallet signer/session and BTC fee transaction receipts are implemented and tested in regtest and signet lanes.
- ledgerized AssetPack anchors bind range, roots, policy, and finality state.
- minimal Exchange buy/sell/bid/ask and rights transfer replay from receipts.
- Terminal transaction journals and ledgerized diffs detect drift.
- ledger/database reconciliation repairs projections without contradicting ledgers.
- testnet/mainnet-ready controls, telemetry, and upgrade receipts exist.
- crypto concepts and library choices are rebound to current primary web sources before normative selection.
- ancestry is specified as a non-supply late-bound module.
- fixed-supply measureminting decay and zero-cell/refit tail policy are specified.
- UI surfaces disclose BTC fee asset, non-fungible `$BTD`, access rights, range, supply remaining, and policy hash.
- V28+ Terminal and Exchange breadth is scoped without weakening V27's minimal crypto-commercial proof path.
