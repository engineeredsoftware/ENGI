# Bitcode: Lightpaper

Bitcodes, or source shares, are finite units of measurable technical intelligence.
The Bitcode Protocol measures source against explicit Reads, admits only proven fit (industrial-determinism),
settles contribution and rights, and records the resulting commercial object as `$BTD`.

`$BTD` is not a fee token and not a fungible checkout balance. BTC pays fees.
`$BTD` records non-fungible AssetPack share and read-right posture over a capped
global registry of 21,000,000 cells.

This draft is grounded in the active canon and in the current commercial and
demonstration implementations:

- `packages/btd/src/*`: core `$BTD`, wallet, BTC fee, ledger, Exchange, journal,
  replay, reconciliation, telemetry, and upgrade primitives.
- `packages/api/src/routes/btd-crypto.ts`: authenticated commercial route boundary
  for mint drafts, access checks, settlements, anchors, fees, journals, and
  registry projections.
- `packages/orm/src/models/btd-registry.ts` and
  `supabase/migrations/002_v27_btd_crypto_registry.sql`: registry projection and
  database constraints.
- `apps/uapi/app/api/btd/*`, `apps/uapi/app/btd/[assetPackId]/page.tsx`,
  `apps/uapi/lib/bitcoin-wallet-client.ts`, and the BTD auxillary UI: product surfaces.
- `protocol-demonstration/src/v27-crypto-primitives.js` and receipt schemas:
  compact witness functions for replayable demonstration.

## Divisibility, Measuring, Minting, Assets

### Semantic Indivisibility

Bitcode does not mint merely because source arrived. A source unit becomes
mint-admissible only when it is proof-addressable, deduped, and fit-accepted for
a measured Read.

```pseudocode
function measure_semantic_volume(asset_pack, candidate_units):
  included = []
  excluded = []
  seen_unit_ids = set()
  seen_proof_roots = set()
  normalized_volume = 0

  for unit in candidate_units:
    if unit.excluded_reason:
      excluded.append(unit, reason = unit.excluded_reason)
      continue

    require unit.proof_receipt_root
    require unit.dedupe_receipt_root

    if unit.fit_accepted is false:
      excluded.append(unit, reason = "fit_not_accepted")
      continue

    if unit.normalized_units <= 0:
      excluded.append(unit, reason = "non_positive_semantic_units")
      continue

    if unit.id in seen_unit_ids or unit.proof_receipt_root in seen_proof_roots:
      fail("semantic replay would be ambiguous")

    included.append(unit)
    seen_unit_ids.add(unit.id)
    seen_proof_roots.add(unit.proof_receipt_root)
    normalized_volume += unit.normalized_units

  return semantic_volume_receipt(
    asset_pack_id = asset_pack.id,
    normalized_bitcode_volume = normalized_volume,
    token_count = floor(normalized_volume / QUANTIZATION_Q),
    included_units = included,
    excluded_units = excluded
  )
```

The commercial source implements this as proof-addressable semantic volume. The
demonstration source mirrors it with a smaller receipt-producing witness.

### Synthetic Measurements

Issuance follows fixed-supply measureminting decay. More admitted semantic
volume can advance the curve, but the curve approaches the cap rather than
inflating beyond it. In the practical tail, a valid measurement may emit a
zero-cell receipt instead of failing.

```pseudocode
MAX_SUPPLY = 21_000_000

function target_minted(cumulative_measurement, curve_parameter):
  if cumulative_measurement == 0:
    return 0

  return floor(MAX_SUPPLY * cumulative_measurement /
               (cumulative_measurement + curve_parameter))

function apply_measuremint(state, semantic_volume, proof_root, settlement_root, policy_hash):
  require semantic_volume > 0
  require proof_root
  require settlement_root
  require policy_hash

  before_target = target_minted(state.cumulative_measurement, state.curve_parameter)
  after_measurement = state.cumulative_measurement + semantic_volume
  after_target = target_minted(after_measurement, state.curve_parameter)

  curve_delta = after_target - before_target
  remaining_cells = MAX_SUPPLY - state.total_minted
  token_count = clamp(curve_delta, min = 0, max = remaining_cells)

  if token_count == 0:
    reason = "tail_exhausted" if remaining_cells == 0 else "below_integer_threshold"
    return zero_cell_receipt(reason, after_measurement)

  return measuremint_receipt(
    range_start = state.next_token_id,
    range_end_exclusive = state.next_token_id + token_count,
    total_minted_after = state.total_minted + token_count,
    cumulative_measurement_after = after_measurement
  )
```

This gives Bitcode terminal scarcity without pretending semantic work arrives in
uniform raw-byte or model-token chunks.

### Minting BTD-AssetPacks

An AssetPack is the commercial unit. A minted AssetPack occupies one contiguous
range of `$BTD` cells. The individual cells preserve registry identity; the range
is what transfers commercially.

```pseudocode
function admit_asset_pack_range(supply_state, mint_request, existing_ranges):
  require mint_request.accepted_read == true
  require mint_request.accepted_fit == true
  require mint_request.source_manifest_root
  require mint_request.measurement_receipt_root
  require mint_request.fit_receipt_root
  require mint_request.proof_root
  require mint_request.dedupe_receipt_root
  require mint_request.settlement_journal_root
  require mint_request.exchange_receipt_root
  require mint_request.exchange_sequence > 0
  require mint_request.token_count > 0

  range_start = supply_state.next_token_id
  range_end = range_start + mint_request.token_count

  require range_end <= MAX_SUPPLY
  require no_existing_range_for(mint_request.asset_pack_id, existing_ranges)
  require no_overlap([range_start, range_end), existing_ranges)

  next_supply = supply_state.advance(mint_request.token_count)

  return mint_receipt(
    asset_pack_id = mint_request.asset_pack_id,
    range = [range_start, range_end),
    total_minted_before = supply_state.total_minted,
    total_minted_after = next_supply.total_minted,
    roots = source + measurement + fit + proof + dedupe + settlement + exchange,
    access_policy_hash = mint_request.access_policy_hash
  )
```

### Contributor Allocation

Minted cells are whole cells. Contributor allocation uses weighted fit and a
largest-remainder method so the allocation is deterministic and conserves the
AssetPack range exactly.

```pseudocode
function allocate_contributor_cells(asset_pack_range, contributors):
  token_count = asset_pack_range.end - asset_pack_range.start
  require token_count > 0
  require contributors.length > 0

  for contributor in contributors:
    contributor.weight =
      contributor.normalized_volume *
      contributor.fit_bps *
      contributor.quality_bps *
      contributor.provenance_bps *
      contributor.novelty_bps *
      contributor.anti_noise_bps

  total_weight = sum(contributor.weight)
  require total_weight > 0

  for contributor in contributors:
    exact_share = token_count * contributor.weight / total_weight
    contributor.base_cells = floor(exact_share)
    contributor.remainder = exact_share - contributor.base_cells

  distribute_unassigned_cells_by(
    remainder_descending,
    contributor_id_ascending
  )

  assign_contiguous_subranges_in_stable_contributor_order()
  require sum(allocated_cells) == token_count

  return contributor_allocation_receipt()
```

## Determinism, Proofs, Audits, Security

### Models, Training, Inference

The current protocol path treats inference as evidence-bearing work, not as an
opaque oracle. Reads are measured before fit search, prompt and static evidence
are materialized, fit is reviewed, and only then can settlement or mint drafting
proceed.

```pseudocode
function source_to_shares_run(scenario):
  read_measurement = measure_read_from_scenario(scenario)
  read_review = review_read_for_fit_search(read_measurement.reviewable_read)

  if read_review.action != "accept":
    fail("fit search cannot proceed before measured Read acceptance")

  candidates = rank_source_against_read(read_measurement.read_descriptor)
  selected = assemble_asset_pack(read_measurement.read_descriptor, candidates)
  settlement = settle_read_event(selected, eligible_candidates_only)

  proof_bundle = build_system_proof_bundle(
    measurement = read_measurement,
    selection = selected,
    settlement = settlement
  )

  return asset_pack_with_receipts(selected, settlement, proof_bundle)
```

The demonstration runtime includes this flow so the protocol can be inspected
without requiring the full commercial application stack.

### Proofs

Bitcode receipt families bind the commercial state machine. Every critical
claim is expressed as a receipt or proof root: measurement, measureminting,
mint, contributor allocation, ancestry review, licensed-read revenue, BTC fee,
ledger anchor, rights transfer, Terminal journal coverage, reconciliation,
upgrade, deployment readiness, and telemetry.

```pseudocode
function build_receipt_family_claims(event):
  receipt = normalize_event_to_receipt(event)
  require receipt.kind in admitted_receipt_families
  require all_required_fields_present(receipt)
  receipt_root = hash(canonical_json(receipt))

  return {
    receipt,
    receipt_root,
    public_claim: receipt_schema[receipt.kind].public_claim
  }
```

### Auditability

Replay is the audit primitive. A replay starts at zero, applies receipts in
sequence, and blocks on any drift in supply, roots, range continuity, policy,
or allocation conservation.

```pseudocode
function replay_mint_receipts(mint_receipts, allocation_receipts):
  total_minted = 0
  ranges = []
  errors = []

  for receipt in mint_receipts:
    assert receipt.max_supply == MAX_SUPPLY
    assert receipt.total_minted_before == total_minted
    assert receipt.range_start == total_minted
    assert receipt.token_count == receipt.range_end - receipt.range_start
    assert receipt.total_minted_after == receipt.total_minted_before + receipt.token_count
    assert required_roots_are_present(receipt)
    assert no_range_overlap(receipt.range, ranges)

    allocation = allocation_receipts.by_asset_pack(receipt.asset_pack_id)
    if allocation exists:
      assert allocation.range == receipt.range
      assert allocation.token_count == receipt.token_count
      assert sum(allocation.cells) == receipt.token_count

    ranges.append(receipt.range)
    total_minted = receipt.total_minted_after

  return replay_report(
    blocking = errors.length > 0,
    total_minted = total_minted,
    next_token_id = total_minted,
    errors = errors
  )
```

### Reliability, Security

Ledger state is the cryptographic finality source of truth. Database state is a
ledger-derived plus Bitcode-canonical private projection. The system blocks when
ledger facts and projected database facts disagree on roots or finality.

```pseudocode
function reconcile_ledger_and_database(ledger_facts, database_facts, private_facts):
  repairs = []

  for ledger_fact in ledger_facts:
    projected = database_facts.find(ledger_fact.id)

    if projected is missing:
      repairs.append(blocking_repair("missing_projection", ledger_fact.root))
      continue

    if projected.root != ledger_fact.root:
      repairs.append(blocking_repair("ledger_root", ledger_fact.root))

    if projected.finality != ledger_fact.finality:
      repairs.append(repair(
        kind = "ledger_finality_state",
        blocking = ledger_fact.finality in ["confirmed", "reorged", "failed"]
      ))

  for fact in private_facts:
    require fact.private == true
    require fact.canonical_root or fact.receipt_root

  return reconciliation_report(
    repairs = repairs,
    blocking = any(repair.blocking for repair in repairs)
  )
```

## Interfaces, Integrations

### Bitcoin, Taproot

Bitcoin is the primary fee and ledger-finality path. Current commercial
primitives default Bitcoin AssetPack anchors to Taproot while allowing explicit
secondary anchors where specified.

```pseudocode
function prepare_asset_pack_anchor(asset_pack_range, roots, network):
  require network in ["regtest", "signet", "testnet", "mainnet"]
  require asset_pack_range.non_empty
  require roots.commitment
  require roots.source_manifest
  require roots.proof
  require roots.access_policy_hash

  return ledger_anchor(
    chain = "bitcoin",
    network = network,
    commitment_method = "taproot",
    commitment_root = roots.commitment,
    source_manifest_root = roots.source_manifest,
    proof_root = roots.proof,
    access_policy_hash = roots.access_policy_hash,
    range = asset_pack_range,
    finality_state = "prepared"
  )
```

### Cryptographic Wallets

Wallet integration is a signing boundary. Bitcode can prepare intent and observe
finality, but user private keys remain outside Bitcode servers.

```pseudocode
function create_wallet_signer_session(wallet, user, capabilities, authorization_proof):
  require wallet.address
  require wallet.network
  require capabilities not empty

  if authorization_proof is missing:
    return session(
      state = "prepared",
      server_custody = false,
      failure_reason = "address_authorization_required"
    )

  require proof is message_signature or provider_session

  return session(
    state = "authorized",
    capabilities = capabilities,
    server_custody = false,
    authorization_proof = authorization_proof
  )

function prepare_btc_fee(session, unsigned_transaction):
  require session.authorized
  require session.can("psbt_sign")
  require unsigned_transaction.psbt
  require sats_paid > 0

  return btc_fee_receipt(
    fee_asset = "BTC",
    server_custody = false,
    finality_state = "prepared",
    psbt = unsigned_transaction.psbt
  )

allowed_fee_transitions:
  prepared -> signed -> broadcast -> confirmed
  prepared -> failed
  signed -> failed
  broadcast -> replaced | reorged | failed
```

The browser wallet client implements this posture for Bitcoin-capable wallets by
building an authentication message, requesting a signature or provider session,
and storing only the resulting address/proof posture.

### Version Control Systems

The demonstration system preserves the source-to-shares path through repository
evidence, branch artifacts, and proof manifests. The source tree is not treated
as a black box; it is measured, materialized, and replayed through explicit
artifacts.

```pseudocode
function materialize_asset_pack_branch(read, selected_assets, settlement):
  branch_artifacts = {
    proof_contract,
    system_proof_bundle,
    proof_witness_manifest,
    settlement_preview,
    source_to_shares,
    settlement_participation,
    settlement_proof
  }

  require all_selected_assets_have_materialized_source_bindings
  require proof_witness_manifest.digests_all_proof_relevant_artifacts
  require settlement_source_to_shares_proof.passed

  publish_branch_artifacts(branch_artifacts)
```

### Website Application

The website exposes Bitcode state without redefining it. The AssetPack range
page reads one range as the public commercial object; the BTD auxillary reads
wallet, BTC fee posture, BTD holdings, policy hash, range, read branch, and
Terminal/Exchange activity together.

```pseudocode
function render_asset_pack_range_page(asset_pack_id, query):
  range = [query.range_start, query.range_end_exclusive)
  policy = query.policy_id + query.policy_hash

  display:
    asset_pack_id
    contiguous_btd_range = range
    access_policy = policy
    read_branch = "owner-read / licensed-read"
    proof_root
    source_manifest_root

  link:
    Exchange for existing range transfer
    Terminal for Read-submitted mint path
```

```pseudocode
function render_btd_auxillary(profile, wallet, registry):
  show btd_holding_posture
  show btc_fee_liquidity_posture
  show wallet_address_and_signer_status
  show access_policy_id_and_hash
  show asset_pack_range
  show owner_read_vs_licensed_read_branch
  show shared_terminal_exchange_activity_table
```

### MCP API

The commercial API route boundary produces JSON-safe projections of the same
receipt logic. Draft routes can calculate deterministic mint posture, but final
minting still depends on persisted Exchange settlement, ledger observation where
applicable, and replay proof.

```pseudocode
function post_btd_mint_draft(request):
  user = authenticate(request)
  require user

  body = parse_json(request)
  require body.accepted_read == true
  require body.accepted_fit == true
  require body.exchange_sequence > 0

  measurement = measure_semantic_volume(body.semantic_units)
  measuremint = apply_measuremint(body.measure_mint_state, measurement.volume)

  if measuremint.token_count > 0:
    range = admit_asset_pack_range(state_from(measuremint), body)
    mint_receipt = build_mint_receipt(range)
    allocation = maybe_allocate_contributors(range, body.contributors)
    journal_kind = "asset_pack_mint"
  else:
    journal_kind = "measure_mint_tail"

  journal = terminal_journal_entry(
    transaction_kind = journal_kind,
    receipt_roots = [measurement.root, measuremint.root, mint_receipt.root?],
    exchange_sequence = body.exchange_sequence
  )

  return json_safe({ measurement, measuremint, range, mint_receipt, allocation, journal })
```

```pseudocode
function post_btd_read_access(request):
  user = authenticate(request)
  require user

  policy = request.policy or registry.resolve_policy(request.asset_pack_id)
  ownership_claims = request.claims or registry.list_ownership(wallet, asset_pack)
  licenses = request.licenses or registry.list_read_licenses(wallet, asset_pack)

  decision =
    if wallet owns range with matching policy hash and policy.owner_read:
      "owner_read"
    else if wallet has valid license with matching policy hash and policy.licensed_read:
      "licensed_read"
    else:
      "denied"

  return decision_with_policy_disclosure(decision, policy)
```

### Chat Applications

Conversation and chat surfaces are intake corridors. They may gather Read,
source, attachments, and destination context, but they must write into the same
Bitcode execution, proof, settlement, Terminal, and Exchange state rather than
inventing a separate chat-native tokenomics path.

```pseudocode
function chat_to_bitcode_state(message, attachments, context):
  read_or_deposit = parse_operator_intent(message)
  source_context = collect_repository_and_attachment_context(attachments, context)

  execution = start_bitcode_execution(
    read_or_deposit = read_or_deposit,
    source_context = source_context
  )

  require execution.requires_read_review_before_fit_search
  return stream_terminal_readable_state(execution)
```

## Exchange And Revenue

### Rights Transfer

The minimal Exchange path supports sell, buy, bid, ask, cancellation,
acceptance, settlement, and rights transfer. Transfer is receipt-bound and
requires BTC fee evidence, ledger-anchor evidence, and access-policy evidence.

```pseudocode
function transfer_asset_pack_rights(settled_order, fee_receipt, ledger_anchor):
  require settled_order.state == "settled"
  require settled_order.price_asset == "BTC"
  require fee_receipt.fee_asset == "BTC"
  require fee_receipt.server_custody == false
  require ledger_anchor.id
  require settled_order.access_policy_hash

  return rights_transfer_receipt(
    range = settled_order.range,
    from_wallet = settled_order.maker_or_seller,
    to_wallet = settled_order.taker_or_buyer,
    price_sats = settled_order.price_sats,
    btc_fee_receipt_id = fee_receipt.id,
    ledger_anchor_id = ledger_anchor.id,
    exchange_sequence = settled_order.settlement_sequence
  )
```

### Licensed Reads

Licensed reads route BTC sats locally. Direct holders, admitted ancestors,
treasury, and dispute holdback are explicit pools. Passive third-party royalty
signaling is not settlement enforcement.

```pseudocode
function route_licensed_read_revenue(payment):
  require payment.price_asset == "BTC"
  require payment.gross_sats > 0
  require split_bps.direct + split_bps.ancestor + split_bps.treasury + split_bps.holdback == 10_000

  direct_sats = gross_sats * split_bps.direct / 10_000
  ancestor_sats = gross_sats * split_bps.ancestor / 10_000
  holdback_sats = gross_sats * split_bps.holdback / 10_000
  treasury_sats = gross_sats - direct_sats - ancestor_sats - holdback_sats

  if holdback_sats > 0:
    require dispute_holdback_wallet

  direct_routes = split_by_weight(direct_sats, direct_recipients)
  ancestor_routes = split_by_weight(ancestor_sats, payable_ancestors)
  treasury_routes = [{ treasury_wallet, treasury_sats }]

  require sum(direct_routes + ancestor_routes + treasury_routes + holdback_sats) == gross_sats
  return revenue_route_receipt()
```

### Ancestry

Ancestry is attribution and routing evidence, not supply. It is late-bound and
fails closed against duplicate edges, duplicate source, self-edges, reciprocal
loops, dependency cycles, claimant/reviewer conflicts, low confidence, and
citation-only claims.

```pseudocode
function review_ancestry_edges(child_asset_pack, claimed_edges, existing_graph):
  for edge in claimed_edges:
    if edge.parent == child_asset_pack:
      reject(edge, "self_edge")
    else if edge.created_after_child_fit is false:
      reject(edge, "not_late_bound")
    else if duplicate_source(edge):
      reject(edge, "duplicate_source")
    else if claimant_is_reviewer(edge):
      reject(edge, "claimant_reviewer_conflict")
    else if would_create_cycle(existing_graph, edge):
      reject(edge, "dependency_cycle")
    else if edge.confidence_bps < threshold:
      record_unpaid(edge, "confidence_below_threshold")
    else if edge.kind == "citation_only":
      record_unpaid(edge, "citation_only")
    else:
      payable(edge, route_weight = confidence * timelessness / (1 + depth)^2)

    edge.supply_effect = "none"
    edge.mint_count_delta = 0

  return ancestry_review_receipt()
```

## Terminal Finality

Terminal journal coverage is the user-facing finality guard. The system must not
claim commercial closure when required transaction families are absent or when a
journal projection has drifted.

```pseudocode
required_terminal_families = [
  "read_submission",
  "fit_closure",
  "proof_admission",
  "asset_pack_mint",
  "btc_fee_payment",
  "asset_pack_anchor",
  "licensed_read_purchase",
  "exchange_order",
  "exchange_order_cancel",
  "rights_transfer",
  "dispute_holdback",
  "settlement_finalization",
  "ledger_database_reconciliation"
]

function terminal_coverage(entries):
  observed = unique(entry.transaction_kind for entry in entries)
  missing = required_terminal_families - observed

  return coverage_receipt(
    observed = observed,
    missing = missing,
    blocking = missing not empty
  )

function diff_terminal_projection(entry, projection):
  mismatches = []
  if entry.post_state_root != projection.post_state_root:
    mismatches.append("post_state_root")
  if set(entry.receipt_roots) != set(projection.receipt_roots):
    mismatches.append("receipt_roots")
  if set(entry.ledger_anchor_ids) != set(projection.ledger_anchor_ids):
    mismatches.append("ledger_anchor_ids")

  return { blocking = mismatches not empty, mismatches }
```

## Deployment Posture

Local and test lanes prove behavior. Signet is the public Bitcoin proof lane.
Mainnet-ready is not value-bearing launch. Value-bearing mainnet launch requires
explicit operational approval and rollback posture.

```pseudocode
function build_deployment_lane(lane, bitcoin_network, ledger_network, rollback_root, approval_root):
  if lane == "signet":
    require bitcoin_network == "signet"

  if lane in ["mainnet-ready", "mainnet-value-bearing"]:
    require bitcoin_network == "mainnet"

  if lane == "mainnet-value-bearing":
    require approval_root

  return deployment_lane(
    value_bearing = lane == "mainnet-value-bearing",
    signet_proof_required = lane in ["signet", "mainnet-ready", "mainnet-value-bearing"],
    telemetry_required = lane != "local",
    rollback_plan_root = rollback_root
  )

function check_deployment_readiness(lane, environment):
  missing = REQUIRED_CRYPTO_ENV_KEYS - environment.present_keys
  return readiness_receipt(
    lane = lane,
    missing_environment_keys = missing,
    blocking = missing not empty or missing_mainnet_approval(lane)
  )
```

## Minimal Law

The lightpaper law can be reduced to this:

```pseudocode
BTC pays fees.
BTD records non-fungible source-share/read-right cells.
An AssetPack is one contiguous BTD cell range.
Minting requires Read -> Fit -> Prove -> Settle.
Semantic volume advances a fixed-supply decay curve.
Valid tail measurements may emit zero-cell receipts.
Contributor allocation must conserve the minted range.
Owner reads and licensed reads are separate policy branches.
Exchange transfers require BTC price, BTC fee evidence, policy evidence, and ledger evidence.
Licensed-read revenue routes BTC sats by receipts, not marketplace royalty assumptions.
Ancestry affects attribution and routing only; it never changes supply.
Ledgers prove cryptographic finality; database state is a reconciled projection.
Terminal journals must cover required transaction families before finality is claimed.
```
