-- Saved query name: v28_qa_terminal_03_btd_ledger_after_terminal
-- Purpose: run after product Read/Deposit/Fit/branch actions to check whether
-- BTD measuremint, range, BTC fee, journal, anchor, and reconciliation
-- projections stayed internally consistent.

WITH consistency_summary AS (
  WITH range_stats AS (
    SELECT
      count(*)::bigint AS asset_pack_count,
      coalesce(sum(token_count), 0)::bigint AS range_token_count,
      coalesce(max(range_end_exclusive), 0)::bigint AS max_range_end
    FROM public.btd_asset_pack_ranges
  ),
  missing_journal AS (
    SELECT r.asset_pack_id, r.minted_at_exchange_sequence
    FROM public.btd_asset_pack_ranges r
    LEFT JOIN public.btd_terminal_journal_entries j
      ON j.exchange_sequence = r.minted_at_exchange_sequence
      AND j.transaction_kind IN ('asset_pack_mint', 'measure_mint_tail')
    WHERE j.journal_entry_id IS NULL
  ),
  missing_anchor AS (
    SELECT r.asset_pack_id
    FROM public.btd_asset_pack_ranges r
    LEFT JOIN public.btd_asset_pack_ledger_anchors a
      ON a.asset_pack_id = r.asset_pack_id
      AND a.finality_state <> 'failed'
    WHERE a.anchor_id IS NULL
  ),
  blocking_repairs AS (
    SELECT repair_id, reconciliation_id, fact_id, repair_kind, issued_at
    FROM public.btd_ledger_database_reconciliation_repairs
    WHERE blocking = true
  )
  SELECT
    jsonb_build_object(
      'range_stats', to_jsonb(range_stats),
      'missing_journal_count', (SELECT count(*) FROM missing_journal),
      'missing_anchor_count', (SELECT count(*) FROM missing_anchor),
      'blocking_repair_count', (SELECT count(*) FROM blocking_repairs),
      'missing_journal', coalesce((SELECT jsonb_agg(to_jsonb(missing_journal)) FROM missing_journal), '[]'::jsonb),
      'missing_anchor', coalesce((SELECT jsonb_agg(asset_pack_id ORDER BY asset_pack_id) FROM missing_anchor), '[]'::jsonb),
      'blocking_repairs', coalesce((SELECT jsonb_agg(to_jsonb(blocking_repairs) ORDER BY issued_at DESC) FROM blocking_repairs), '[]'::jsonb)
    ) AS payload
  FROM range_stats
)
SELECT
  'consistency_summary' AS section,
  1::bigint AS observed_count,
  jsonb_build_array(payload) AS rows
FROM consistency_summary

UNION ALL

SELECT
  'supply_state' AS section,
  count(*)::bigint AS observed_count,
  coalesce(jsonb_agg(to_jsonb(s) ORDER BY s.updated_at DESC), '[]'::jsonb) AS rows
FROM (
  SELECT
    id,
    max_supply,
    total_minted,
    next_token_id,
    cumulative_admitted_measurement,
    residual_mint_credit,
    curve,
    tail_policy,
    updated_at
  FROM public.btd_supply_state
  WHERE id = 'global'
) s

UNION ALL

SELECT
  'recent_semantic_measurements' AS section,
  count(*)::bigint AS observed_count,
  coalesce(jsonb_agg(to_jsonb(m) ORDER BY m.issued_at DESC), '[]'::jsonb) AS rows
FROM (
  SELECT
    measurement_id,
    asset_pack_id,
    normalized_bitcode_volume,
    token_count,
    quantization,
    issued_at,
    created_at
  FROM public.btd_semantic_volume_measurements
  ORDER BY issued_at DESC
  LIMIT 20
) m

UNION ALL

SELECT
  'recent_measuremint_receipts' AS section,
  count(*)::bigint AS observed_count,
  coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.issued_at DESC), '[]'::jsonb) AS rows
FROM (
  SELECT
    receipt_id,
    asset_pack_id,
    normalized_bitcode_volume,
    token_count,
    range_start,
    range_end_exclusive,
    zero_cell_reason,
    total_minted_before,
    total_minted_after,
    proof_root,
    settlement_journal_root,
    access_policy_hash,
    exchange_sequence,
    issued_at,
    created_at
  FROM public.btd_measure_mint_receipts
  ORDER BY issued_at DESC
  LIMIT 20
) r

UNION ALL

SELECT
  'recent_asset_pack_ranges' AS section,
  count(*)::bigint AS observed_count,
  coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.issued_at DESC), '[]'::jsonb) AS rows
FROM (
  SELECT
    asset_pack_id,
    range_start,
    range_end_exclusive,
    token_count,
    normalized_bitcode_volume,
    read_id AS read_id,
    source_manifest_root,
    measurement_receipt_root,
    fit_receipt_root,
    proof_root,
    dedupe_receipt_root,
    settlement_journal_root,
    exchange_receipt_root,
    access_policy_id,
    access_policy_hash,
    minted_at_exchange_sequence,
    issued_at,
    created_at
  FROM public.btd_asset_pack_ranges
  ORDER BY issued_at DESC
  LIMIT 20
) r

UNION ALL

SELECT
  'recent_terminal_journal' AS section,
  count(*)::bigint AS observed_count,
  coalesce(jsonb_agg(to_jsonb(j) ORDER BY j.issued_at DESC), '[]'::jsonb) AS rows
FROM (
  SELECT
    journal_entry_id,
    transaction_kind,
    actor_id,
    pre_state_root,
    post_state_root,
    receipt_roots,
    ledger_anchor_ids,
    exchange_sequence,
    issued_at,
    created_at
  FROM public.btd_terminal_journal_entries
  ORDER BY issued_at DESC
  LIMIT 30
) j

UNION ALL

SELECT
  'recent_btc_fee_transactions' AS section,
  count(*)::bigint AS observed_count,
  coalesce(jsonb_agg(to_jsonb(f) ORDER BY f.issued_at DESC), '[]'::jsonb) AS rows
FROM (
  SELECT
    receipt_id,
    fee_purpose,
    payer_wallet_id,
    wallet_session_id,
    network,
    txid,
    vout,
    sats_paid,
    sats_per_vbyte,
    exchange_sequence,
    terminal_journal_root,
    related_asset_pack_id,
    related_order_id,
    finality_state,
    confirmations,
    fee_asset,
    server_custody,
    issued_at,
    created_at
  FROM public.btc_fee_transactions
  ORDER BY issued_at DESC
  LIMIT 20
) f

UNION ALL

SELECT
  'recent_ledger_anchors' AS section,
  count(*)::bigint AS observed_count,
  coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.issued_at DESC), '[]'::jsonb) AS rows
FROM (
  SELECT
    anchor_id,
    asset_pack_id,
    chain,
    network,
    txid_or_hash,
    output_index,
    commitment_method,
    commitment_root,
    source_manifest_root,
    proof_root,
    access_policy_hash,
    btd_range_start,
    btd_range_end_exclusive,
    finality_state,
    confirmations,
    issued_at,
    created_at
  FROM public.btd_asset_pack_ledger_anchors
  ORDER BY issued_at DESC
  LIMIT 20
) a

UNION ALL

SELECT
  'recent_reconciliation_repairs' AS section,
  count(*)::bigint AS observed_count,
  coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.issued_at DESC), '[]'::jsonb) AS rows
FROM (
  SELECT
    repair_id,
    reconciliation_id,
    fact_id,
    repair_kind,
    before_value,
    after_value,
    blocking,
    issued_at,
    created_at
  FROM public.btd_ledger_database_reconciliation_repairs
  ORDER BY issued_at DESC
  LIMIT 20
) r

UNION ALL

SELECT
  'recent_crypto_telemetry' AS section,
  count(*)::bigint AS observed_count,
  coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.issued_at DESC), '[]'::jsonb) AS rows
FROM (
  SELECT
    event,
    severity,
    subject_id,
    receipt_root,
    ledger_anchor_id,
    issued_at,
    created_at
  FROM public.btd_crypto_telemetry_events
  ORDER BY issued_at DESC
  LIMIT 30
) t;
