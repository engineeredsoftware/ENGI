export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export type Database = {
    __InternalSupabase: {
        PostgrestVersion: "14.5";
    };
    public: {
        Tables: {
            executions: {
                Row: {
                    completed_at: string | null;
                    config: Json | null;
                    context: Json | null;
                    created_at: string | null;
                    deliverable_id: string | null;
                    duration_ms: number | null;
                    error: Json | null;
                    id: string;
                    input: Json | null;
                    items: Json | null;
                    output: Json | null;
                    pipeline_run_id: string | null;
                    started_at: string | null;
                    status: string | null;
                    total_cost: number | null;
                    total_tokens: number | null;
                    type: string | null;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    completed_at?: string | null;
                    config?: Json | null;
                    context?: Json | null;
                    created_at?: string | null;
                    deliverable_id?: string | null;
                    duration_ms?: number | null;
                    error?: Json | null;
                    id?: string;
                    input?: Json | null;
                    items?: Json | null;
                    output?: Json | null;
                    pipeline_run_id?: string | null;
                    started_at?: string | null;
                    status?: string | null;
                    total_cost?: number | null;
                    total_tokens?: number | null;
                    type?: string | null;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    completed_at?: string | null;
                    config?: Json | null;
                    context?: Json | null;
                    created_at?: string | null;
                    deliverable_id?: string | null;
                    duration_ms?: number | null;
                    error?: Json | null;
                    id?: string;
                    input?: Json | null;
                    items?: Json | null;
                    output?: Json | null;
                    pipeline_run_id?: string | null;
                    started_at?: string | null;
                    status?: string | null;
                    total_cost?: number | null;
                    total_tokens?: number | null;
                    type?: string | null;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            execution_events: {
                Row: {
                    agent_name: string | null;
                    created_at: string | null;
                    event_data: Json | null;
                    event_type: string;
                    id: string;
                    phase: string | null;
                    run_id: string;
                };
                Insert: {
                    agent_name?: string | null;
                    created_at?: string | null;
                    event_data?: Json | null;
                    event_type: string;
                    id?: string;
                    phase?: string | null;
                    run_id: string;
                };
                Update: {
                    agent_name?: string | null;
                    created_at?: string | null;
                    event_data?: Json | null;
                    event_type?: string;
                    id?: string;
                    phase?: string | null;
                    run_id?: string;
                };
                Relationships: [];
            };
            phase_executions: {
                Row: {
                    completed_at: string | null;
                    created_at: string | null;
                    error: Json | null;
                    id: string;
                    input: Json | null;
                    output: Json | null;
                    phase_name: string;
                    run_id: string;
                    started_at: string | null;
                    status: string | null;
                };
                Insert: {
                    completed_at?: string | null;
                    created_at?: string | null;
                    error?: Json | null;
                    id?: string;
                    input?: Json | null;
                    output?: Json | null;
                    phase_name: string;
                    run_id: string;
                    started_at?: string | null;
                    status?: string | null;
                };
                Update: {
                    completed_at?: string | null;
                    created_at?: string | null;
                    error?: Json | null;
                    id?: string;
                    input?: Json | null;
                    output?: Json | null;
                    phase_name?: string;
                    run_id?: string;
                    started_at?: string | null;
                    status?: string | null;
                };
                Relationships: [];
            };
            generated_assets: {
                Row: {
                    asset_data: Json | null;
                    asset_name: string;
                    asset_type: string;
                    asset_url: string | null;
                    created_at: string | null;
                    id: string;
                    run_id: string | null;
                    user_id: string;
                };
                Insert: {
                    asset_data?: Json | null;
                    asset_name: string;
                    asset_type: string;
                    asset_url?: string | null;
                    created_at?: string | null;
                    id?: string;
                    run_id?: string | null;
                    user_id: string;
                };
                Update: {
                    asset_data?: Json | null;
                    asset_name?: string;
                    asset_type?: string;
                    asset_url?: string | null;
                    created_at?: string | null;
                    id?: string;
                    run_id?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            run_otf_instructions: {
                Row: {
                    created_at: string | null;
                    id: string;
                    instruction_data: Json;
                    instruction_type: string;
                    is_processed: boolean | null;
                    processed_at: string | null;
                    run_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    instruction_data: Json;
                    instruction_type: string;
                    is_processed?: boolean | null;
                    processed_at?: string | null;
                    run_id: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    instruction_data?: Json;
                    instruction_type?: string;
                    is_processed?: boolean | null;
                    processed_at?: string | null;
                    run_id?: string;
                };
                Relationships: [];
            };
            ai_document_runs: {
                Row: {
                    context: Json | null;
                    created_at: string | null;
                    id: string;
                    items: Json | null;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    context?: Json | null;
                    created_at?: string | null;
                    id?: string;
                    items?: Json | null;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    context?: Json | null;
                    created_at?: string | null;
                    id?: string;
                    items?: Json | null;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            ai_documents: {
                Row: {
                    ai_document_type: string | null;
                    created_at: string | null;
                    id: string;
                    metrics: Json | null;
                    output: string | null;
                    repository: string | null;
                    run_id: string | null;
                    title: string | null;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    ai_document_type?: string | null;
                    created_at?: string | null;
                    id?: string;
                    metrics?: Json | null;
                    output?: string | null;
                    repository?: string | null;
                    run_id?: string | null;
                    title?: string | null;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    ai_document_type?: string | null;
                    created_at?: string | null;
                    id?: string;
                    metrics?: Json | null;
                    output?: string | null;
                    repository?: string | null;
                    run_id?: string | null;
                    title?: string | null;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "ai_documents_run_id_fkey";
                        columns: ["run_id"];
                        isOneToOne: false;
                        referencedRelation: "ai_document_runs";
                        referencedColumns: ["id"];
                    }
                ];
            };
            attachments: {
                Row: {
                    category: string;
                    connection_id: string | null;
                    created_at: string | null;
                    description: string | null;
                    domain: string | null;
                    file_name: string | null;
                    file_size: number | null;
                    file_type: string | null;
                    file_url: string | null;
                    id: string;
                    integration_data: Json | null;
                    integration_provider: string | null;
                    integration_type: string | null;
                    metadata: Json | null;
                    mime_type: string | null;
                    page_metadata: Json | null;
                    path: string | null;
                    pipeline_run_id: string | null;
                    pipeline_type: string | null;
                    title: string;
                    updated_at: string | null;
                    url: string | null;
                    user_id: string;
                    vcs_issue: Json | null;
                    vcs_provider: string | null;
                    vcs_pull_request: Json | null;
                    vcs_repository: Json | null;
                    vcs_type: string | null;
                };
                Insert: {
                    category: string;
                    connection_id?: string | null;
                    created_at?: string | null;
                    description?: string | null;
                    domain?: string | null;
                    file_name?: string | null;
                    file_size?: number | null;
                    file_type?: string | null;
                    file_url?: string | null;
                    id?: string;
                    integration_data?: Json | null;
                    integration_provider?: string | null;
                    integration_type?: string | null;
                    metadata?: Json | null;
                    mime_type?: string | null;
                    page_metadata?: Json | null;
                    path?: string | null;
                    pipeline_run_id?: string | null;
                    pipeline_type?: string | null;
                    title: string;
                    updated_at?: string | null;
                    url?: string | null;
                    user_id: string;
                    vcs_issue?: Json | null;
                    vcs_provider?: string | null;
                    vcs_pull_request?: Json | null;
                    vcs_repository?: Json | null;
                    vcs_type?: string | null;
                };
                Update: {
                    category?: string;
                    connection_id?: string | null;
                    created_at?: string | null;
                    description?: string | null;
                    domain?: string | null;
                    file_name?: string | null;
                    file_size?: number | null;
                    file_type?: string | null;
                    file_url?: string | null;
                    id?: string;
                    integration_data?: Json | null;
                    integration_provider?: string | null;
                    integration_type?: string | null;
                    metadata?: Json | null;
                    mime_type?: string | null;
                    page_metadata?: Json | null;
                    path?: string | null;
                    pipeline_run_id?: string | null;
                    pipeline_type?: string | null;
                    title?: string;
                    updated_at?: string | null;
                    url?: string | null;
                    user_id?: string;
                    vcs_issue?: Json | null;
                    vcs_provider?: string | null;
                    vcs_pull_request?: Json | null;
                    vcs_repository?: Json | null;
                    vcs_type?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "attachments_connection_id_fkey";
                        columns: ["connection_id"];
                        isOneToOne: false;
                        referencedRelation: "user_connections";
                        referencedColumns: ["id"];
                    }
                ];
            };
            btc_fee_transactions: {
                Row: {
                    confirmations: number;
                    created_at: string;
                    exchange_sequence: number;
                    fee_asset: string;
                    fee_purpose: string;
                    finality_state: string;
                    id: string;
                    issued_at: string;
                    network: string;
                    payer_wallet_id: string;
                    psbt: string | null;
                    receipt: Json;
                    receipt_id: string;
                    related_asset_pack_id: string | null;
                    related_order_id: string | null;
                    sats_paid: number;
                    sats_per_vbyte: number | null;
                    server_custody: boolean;
                    terminal_journal_root: string;
                    txid: string | null;
                    vout: number | null;
                    wallet_authorization_proof: Json;
                    wallet_session_id: string;
                };
                Insert: {
                    confirmations?: number;
                    created_at?: string;
                    exchange_sequence: number;
                    fee_asset?: string;
                    fee_purpose: string;
                    finality_state: string;
                    id?: string;
                    issued_at: string;
                    network: string;
                    payer_wallet_id: string;
                    psbt?: string | null;
                    receipt: Json;
                    receipt_id: string;
                    related_asset_pack_id?: string | null;
                    related_order_id?: string | null;
                    sats_paid: number;
                    sats_per_vbyte?: number | null;
                    server_custody?: boolean;
                    terminal_journal_root: string;
                    txid?: string | null;
                    vout?: number | null;
                    wallet_authorization_proof: Json;
                    wallet_session_id: string;
                };
                Update: {
                    confirmations?: number;
                    created_at?: string;
                    exchange_sequence?: number;
                    fee_asset?: string;
                    fee_purpose?: string;
                    finality_state?: string;
                    id?: string;
                    issued_at?: string;
                    network?: string;
                    payer_wallet_id?: string;
                    psbt?: string | null;
                    receipt?: Json;
                    receipt_id?: string;
                    related_asset_pack_id?: string | null;
                    related_order_id?: string | null;
                    sats_paid?: number;
                    sats_per_vbyte?: number | null;
                    server_custody?: boolean;
                    terminal_journal_root?: string;
                    txid?: string | null;
                    vout?: number | null;
                    wallet_authorization_proof?: Json;
                    wallet_session_id?: string;
                };
                Relationships: [];
            };
            btd_ancestor_edges: {
                Row: {
                    child_asset_pack_id: string;
                    claimant_id: string | null;
                    confidence_bps: number;
                    conflict_disclosure: Json;
                    created_after_child_fit: boolean;
                    created_at: string;
                    depth: number;
                    edge_id: string;
                    edge_kind: string;
                    evidence_root: string;
                    id: string;
                    issued_at: string;
                    mint_count_delta: number;
                    parent_asset_pack_id: string;
                    receipt: Json;
                    rejection_reason: string | null;
                    review_id: string;
                    reviewer_id: string | null;
                    reviewer_receipt_root: string | null;
                    risk_flags: Json;
                    route_weight: number;
                    source_fingerprint_root: string | null;
                    status: string;
                    supply_effect: string;
                    timelessness_bps: number;
                };
                Insert: {
                    child_asset_pack_id: string;
                    claimant_id?: string | null;
                    confidence_bps: number;
                    conflict_disclosure?: Json;
                    created_after_child_fit?: boolean;
                    created_at?: string;
                    depth: number;
                    edge_id: string;
                    edge_kind: string;
                    evidence_root: string;
                    id?: string;
                    issued_at: string;
                    mint_count_delta?: number;
                    parent_asset_pack_id: string;
                    receipt: Json;
                    rejection_reason?: string | null;
                    review_id: string;
                    reviewer_id?: string | null;
                    reviewer_receipt_root?: string | null;
                    risk_flags?: Json;
                    route_weight?: number;
                    source_fingerprint_root?: string | null;
                    status: string;
                    supply_effect?: string;
                    timelessness_bps: number;
                };
                Update: {
                    child_asset_pack_id?: string;
                    claimant_id?: string | null;
                    confidence_bps?: number;
                    conflict_disclosure?: Json;
                    created_after_child_fit?: boolean;
                    created_at?: string;
                    depth?: number;
                    edge_id?: string;
                    edge_kind?: string;
                    evidence_root?: string;
                    id?: string;
                    issued_at?: string;
                    mint_count_delta?: number;
                    parent_asset_pack_id?: string;
                    receipt?: Json;
                    rejection_reason?: string | null;
                    review_id?: string;
                    reviewer_id?: string | null;
                    reviewer_receipt_root?: string | null;
                    risk_flags?: Json;
                    route_weight?: number;
                    source_fingerprint_root?: string | null;
                    status?: string;
                    supply_effect?: string;
                    timelessness_bps?: number;
                };
                Relationships: [];
            };
            btd_asset_pack_ledger_anchors: {
                Row: {
                    access_policy_hash: string;
                    anchor_id: string;
                    asset_pack_id: string;
                    btd_range_end_exclusive: number;
                    btd_range_start: number;
                    chain: string;
                    commitment_method: string | null;
                    commitment_root: string;
                    confirmations: number;
                    contract_address: string | null;
                    created_at: string;
                    finality_state: string;
                    id: string;
                    issued_at: string;
                    network: string;
                    output_index: number | null;
                    proof_root: string;
                    receipt: Json;
                    source_manifest_root: string;
                    token_id: string | null;
                    txid_or_hash: string | null;
                };
                Insert: {
                    access_policy_hash: string;
                    anchor_id: string;
                    asset_pack_id: string;
                    btd_range_end_exclusive: number;
                    btd_range_start: number;
                    chain: string;
                    commitment_method?: string | null;
                    commitment_root: string;
                    confirmations?: number;
                    contract_address?: string | null;
                    created_at?: string;
                    finality_state: string;
                    id?: string;
                    issued_at: string;
                    network: string;
                    output_index?: number | null;
                    proof_root: string;
                    receipt: Json;
                    source_manifest_root: string;
                    token_id?: string | null;
                    txid_or_hash?: string | null;
                };
                Update: {
                    access_policy_hash?: string;
                    anchor_id?: string;
                    asset_pack_id?: string;
                    btd_range_end_exclusive?: number;
                    btd_range_start?: number;
                    chain?: string;
                    commitment_method?: string | null;
                    commitment_root?: string;
                    confirmations?: number;
                    contract_address?: string | null;
                    created_at?: string;
                    finality_state?: string;
                    id?: string;
                    issued_at?: string;
                    network?: string;
                    output_index?: number | null;
                    proof_root?: string;
                    receipt?: Json;
                    source_manifest_root?: string;
                    token_id?: string | null;
                    txid_or_hash?: string | null;
                };
                Relationships: [];
            };
            btd_asset_pack_ranges: {
                Row: {
                    access_policy_hash: string;
                    access_policy_id: string;
                    asset_pack_id: string;
                    created_at: string;
                    dedupe_receipt_root: string;
                    exchange_receipt_root: string;
                    fit_receipt_root: string;
                    id: string;
                    issued_at: string;
                    measurement_receipt_root: string;
                    minted_at_exchange_sequence: number;
                    read_id: string;
                    normalized_bitcode_volume: number;
                    proof_root: string;
                    range_end_exclusive: number;
                    range_start: number;
                    settlement_journal_root: string;
                    source_manifest_root: string;
                    token_count: number;
                };
                Insert: {
                    access_policy_hash: string;
                    access_policy_id: string;
                    asset_pack_id: string;
                    created_at?: string;
                    dedupe_receipt_root: string;
                    exchange_receipt_root: string;
                    fit_receipt_root: string;
                    id?: string;
                    issued_at: string;
                    measurement_receipt_root: string;
                    minted_at_exchange_sequence: number;
                    read_id: string;
                    normalized_bitcode_volume: number;
                    proof_root: string;
                    range_end_exclusive: number;
                    range_start: number;
                    settlement_journal_root: string;
                    source_manifest_root: string;
                    token_count: number;
                };
                Update: {
                    access_policy_hash?: string;
                    access_policy_id?: string;
                    asset_pack_id?: string;
                    created_at?: string;
                    dedupe_receipt_root?: string;
                    exchange_receipt_root?: string;
                    fit_receipt_root?: string;
                    id?: string;
                    issued_at?: string;
                    measurement_receipt_root?: string;
                    minted_at_exchange_sequence?: number;
                    read_id?: string;
                    normalized_bitcode_volume?: number;
                    proof_root?: string;
                    range_end_exclusive?: number;
                    range_start?: number;
                    settlement_journal_root?: string;
                    source_manifest_root?: string;
                    token_count?: number;
                };
                Relationships: [];
            };
            btd_cells: {
                Row: {
                    access_policy_hash: string;
                    access_policy_id: string;
                    asset_pack_id: string;
                    created_at: string;
                    exchange_receipt_root: string;
                    measurement_receipt_root: string;
                    proof_root: string;
                    source_manifest_root: string;
                    source_measurement_id: string;
                    token_id: number;
                };
                Insert: {
                    access_policy_hash: string;
                    access_policy_id: string;
                    asset_pack_id: string;
                    created_at?: string;
                    exchange_receipt_root: string;
                    measurement_receipt_root: string;
                    proof_root: string;
                    source_manifest_root: string;
                    source_measurement_id: string;
                    token_id: number;
                };
                Update: {
                    access_policy_hash?: string;
                    access_policy_id?: string;
                    asset_pack_id?: string;
                    created_at?: string;
                    exchange_receipt_root?: string;
                    measurement_receipt_root?: string;
                    proof_root?: string;
                    source_manifest_root?: string;
                    source_measurement_id?: string;
                    token_id?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "btd_cells_asset_pack_id_fkey";
                        columns: ["asset_pack_id"];
                        isOneToOne: false;
                        referencedRelation: "btd_asset_pack_ranges";
                        referencedColumns: ["asset_pack_id"];
                    }
                ];
            };
            btd_contributor_allocations: {
                Row: {
                    allocation_id: string;
                    allocation_method: string;
                    allocations: Json;
                    asset_pack_id: string;
                    created_at: string;
                    id: string;
                    issued_at: string;
                    range_end_exclusive: number;
                    range_start: number;
                    receipt: Json;
                    token_count: number;
                };
                Insert: {
                    allocation_id: string;
                    allocation_method?: string;
                    allocations: Json;
                    asset_pack_id: string;
                    created_at?: string;
                    id?: string;
                    issued_at: string;
                    range_end_exclusive: number;
                    range_start: number;
                    receipt: Json;
                    token_count: number;
                };
                Update: {
                    allocation_id?: string;
                    allocation_method?: string;
                    allocations?: Json;
                    asset_pack_id?: string;
                    created_at?: string;
                    id?: string;
                    issued_at?: string;
                    range_end_exclusive?: number;
                    range_start?: number;
                    receipt?: Json;
                    token_count?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "btd_contributor_allocations_asset_pack_id_fkey";
                        columns: ["asset_pack_id"];
                        isOneToOne: false;
                        referencedRelation: "btd_asset_pack_ranges";
                        referencedColumns: ["asset_pack_id"];
                    }
                ];
            };
            btd_crypto_telemetry_events: {
                Row: {
                    created_at: string;
                    event: string;
                    id: string;
                    issued_at: string;
                    ledger_anchor_id: string | null;
                    receipt_root: string | null;
                    severity: string;
                    subject_id: string;
                };
                Insert: {
                    created_at?: string;
                    event: string;
                    id?: string;
                    issued_at: string;
                    ledger_anchor_id?: string | null;
                    receipt_root?: string | null;
                    severity: string;
                    subject_id: string;
                };
                Update: {
                    created_at?: string;
                    event?: string;
                    id?: string;
                    issued_at?: string;
                    ledger_anchor_id?: string | null;
                    receipt_root?: string | null;
                    severity?: string;
                    subject_id?: string;
                };
                Relationships: [];
            };
            btd_exchange_orders: {
                Row: {
                    access_policy_hash: string;
                    asset_pack_id: string;
                    created_at: string;
                    created_at_exchange_sequence: number;
                    id: string;
                    ledger_anchor_id: string | null;
                    maker_wallet_id: string;
                    order_id: string;
                    order_kind: string;
                    order_state: string;
                    price_asset: string;
                    price_sats: number;
                    range_end_exclusive: number;
                    range_start: number;
                    receipt: Json | null;
                    settled_at_exchange_sequence: number | null;
                    taker_wallet_id: string | null;
                    updated_at: string;
                };
                Insert: {
                    access_policy_hash: string;
                    asset_pack_id: string;
                    created_at?: string;
                    created_at_exchange_sequence: number;
                    id?: string;
                    ledger_anchor_id?: string | null;
                    maker_wallet_id: string;
                    order_id: string;
                    order_kind: string;
                    order_state: string;
                    price_asset?: string;
                    price_sats: number;
                    range_end_exclusive: number;
                    range_start: number;
                    receipt?: Json | null;
                    settled_at_exchange_sequence?: number | null;
                    taker_wallet_id?: string | null;
                    updated_at?: string;
                };
                Update: {
                    access_policy_hash?: string;
                    asset_pack_id?: string;
                    created_at?: string;
                    created_at_exchange_sequence?: number;
                    id?: string;
                    ledger_anchor_id?: string | null;
                    maker_wallet_id?: string;
                    order_id?: string;
                    order_kind?: string;
                    order_state?: string;
                    price_asset?: string;
                    price_sats?: number;
                    range_end_exclusive?: number;
                    range_start?: number;
                    receipt?: Json | null;
                    settled_at_exchange_sequence?: number | null;
                    taker_wallet_id?: string | null;
                    updated_at?: string;
                };
                Relationships: [];
            };
            btd_ledger_database_reconciliation_repairs: {
                Row: {
                    after_value: string;
                    before_value: string;
                    blocking: boolean;
                    created_at: string;
                    fact_id: string;
                    id: string;
                    issued_at: string;
                    reconciliation_id: string;
                    repair_id: string;
                    repair_kind: string;
                };
                Insert: {
                    after_value: string;
                    before_value: string;
                    blocking: boolean;
                    created_at?: string;
                    fact_id: string;
                    id?: string;
                    issued_at: string;
                    reconciliation_id: string;
                    repair_id: string;
                    repair_kind: string;
                };
                Update: {
                    after_value?: string;
                    before_value?: string;
                    blocking?: boolean;
                    created_at?: string;
                    fact_id?: string;
                    id?: string;
                    issued_at?: string;
                    reconciliation_id?: string;
                    repair_id?: string;
                    repair_kind?: string;
                };
                Relationships: [];
            };
            btd_licensed_read_revenue_routes: {
                Row: {
                    ancestor_routes: Json;
                    ancestor_sats: number;
                    asset_pack_id: string;
                    created_at: string;
                    direct_routes: Json;
                    direct_sats: number;
                    dispute_holdback_sats: number;
                    dispute_holdback_wallet_id: string | null;
                    exchange_sequence: number;
                    failed_routes: Json;
                    gross_sats: number;
                    id: string;
                    issued_at: string;
                    payment_id: string;
                    pending_routes: Json;
                    price_asset: string;
                    receipt: Json;
                    route_state: string;
                    treasury_routes: Json;
                    treasury_sats: number;
                    treasury_wallet_id: string;
                };
                Insert: {
                    ancestor_routes?: Json;
                    ancestor_sats: number;
                    asset_pack_id: string;
                    created_at?: string;
                    direct_routes?: Json;
                    direct_sats: number;
                    dispute_holdback_sats?: number;
                    dispute_holdback_wallet_id?: string | null;
                    exchange_sequence: number;
                    failed_routes?: Json;
                    gross_sats: number;
                    id?: string;
                    issued_at: string;
                    payment_id: string;
                    pending_routes?: Json;
                    price_asset?: string;
                    receipt: Json;
                    route_state?: string;
                    treasury_routes?: Json;
                    treasury_sats: number;
                    treasury_wallet_id: string;
                };
                Update: {
                    ancestor_routes?: Json;
                    ancestor_sats?: number;
                    asset_pack_id?: string;
                    created_at?: string;
                    direct_routes?: Json;
                    direct_sats?: number;
                    dispute_holdback_sats?: number;
                    dispute_holdback_wallet_id?: string | null;
                    exchange_sequence?: number;
                    failed_routes?: Json;
                    gross_sats?: number;
                    id?: string;
                    issued_at?: string;
                    payment_id?: string;
                    pending_routes?: Json;
                    price_asset?: string;
                    receipt?: Json;
                    route_state?: string;
                    treasury_routes?: Json;
                    treasury_sats?: number;
                    treasury_wallet_id?: string;
                };
                Relationships: [];
            };
            btd_measure_mint_receipts: {
                Row: {
                    access_policy_hash: string;
                    asset_pack_id: string;
                    created_at: string;
                    cumulative_measurement_after: number;
                    cumulative_measurement_before: number;
                    exchange_sequence: number;
                    id: string;
                    issued_at: string;
                    max_supply: number;
                    normalized_bitcode_volume: number;
                    proof_root: string;
                    range_end_exclusive: number | null;
                    range_start: number | null;
                    receipt: Json;
                    receipt_id: string;
                    residual_mint_credit_after: number;
                    residual_mint_credit_before: number;
                    settlement_journal_root: string;
                    target_minted_after: number;
                    target_minted_before: number;
                    token_count: number;
                    total_minted_after: number;
                    total_minted_before: number;
                    zero_cell_reason: string | null;
                };
                Insert: {
                    access_policy_hash: string;
                    asset_pack_id: string;
                    created_at?: string;
                    cumulative_measurement_after: number;
                    cumulative_measurement_before: number;
                    exchange_sequence: number;
                    id?: string;
                    issued_at: string;
                    max_supply?: number;
                    normalized_bitcode_volume: number;
                    proof_root: string;
                    range_end_exclusive?: number | null;
                    range_start?: number | null;
                    receipt: Json;
                    receipt_id: string;
                    residual_mint_credit_after: number;
                    residual_mint_credit_before: number;
                    settlement_journal_root: string;
                    target_minted_after: number;
                    target_minted_before: number;
                    token_count: number;
                    total_minted_after: number;
                    total_minted_before: number;
                    zero_cell_reason?: string | null;
                };
                Update: {
                    access_policy_hash?: string;
                    asset_pack_id?: string;
                    created_at?: string;
                    cumulative_measurement_after?: number;
                    cumulative_measurement_before?: number;
                    exchange_sequence?: number;
                    id?: string;
                    issued_at?: string;
                    max_supply?: number;
                    normalized_bitcode_volume?: number;
                    proof_root?: string;
                    range_end_exclusive?: number | null;
                    range_start?: number | null;
                    receipt?: Json;
                    receipt_id?: string;
                    residual_mint_credit_after?: number;
                    residual_mint_credit_before?: number;
                    settlement_journal_root?: string;
                    target_minted_after?: number;
                    target_minted_before?: number;
                    token_count?: number;
                    total_minted_after?: number;
                    total_minted_before?: number;
                    zero_cell_reason?: string | null;
                };
                Relationships: [];
            };
            btd_mint_receipts: {
                Row: {
                    asset_pack_id: string;
                    created_at: string;
                    id: string;
                    issued_at: string;
                    receipt: Json;
                    receipt_id: string;
                };
                Insert: {
                    asset_pack_id: string;
                    created_at?: string;
                    id?: string;
                    issued_at: string;
                    receipt: Json;
                    receipt_id: string;
                };
                Update: {
                    asset_pack_id?: string;
                    created_at?: string;
                    id?: string;
                    issued_at?: string;
                    receipt?: Json;
                    receipt_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "btd_mint_receipts_asset_pack_id_fkey";
                        columns: ["asset_pack_id"];
                        isOneToOne: false;
                        referencedRelation: "btd_asset_pack_ranges";
                        referencedColumns: ["asset_pack_id"];
                    }
                ];
            };
            btd_ownership_events: {
                Row: {
                    access_policy_hash: string;
                    asset_pack_id: string;
                    created_at: string;
                    event_kind: string;
                    exchange_sequence: number;
                    from_wallet_id: string | null;
                    id: string;
                    issued_at: string;
                    ledger_anchor_id: string | null;
                    ownership_event_id: string;
                    range_end_exclusive: number;
                    range_start: number;
                    receipt: Json;
                    source_receipt_id: string;
                    to_wallet_id: string;
                };
                Insert: {
                    access_policy_hash: string;
                    asset_pack_id: string;
                    created_at?: string;
                    event_kind: string;
                    exchange_sequence: number;
                    from_wallet_id?: string | null;
                    id?: string;
                    issued_at: string;
                    ledger_anchor_id?: string | null;
                    ownership_event_id: string;
                    range_end_exclusive: number;
                    range_start: number;
                    receipt: Json;
                    source_receipt_id: string;
                    to_wallet_id: string;
                };
                Update: {
                    access_policy_hash?: string;
                    asset_pack_id?: string;
                    created_at?: string;
                    event_kind?: string;
                    exchange_sequence?: number;
                    from_wallet_id?: string | null;
                    id?: string;
                    issued_at?: string;
                    ledger_anchor_id?: string | null;
                    ownership_event_id?: string;
                    range_end_exclusive?: number;
                    range_start?: number;
                    receipt?: Json;
                    source_receipt_id?: string;
                    to_wallet_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "btd_ownership_events_asset_pack_id_fkey";
                        columns: ["asset_pack_id"];
                        isOneToOne: false;
                        referencedRelation: "btd_asset_pack_ranges";
                        referencedColumns: ["asset_pack_id"];
                    }
                ];
            };
            btd_protocol_upgrade_receipts: {
                Row: {
                    approval_receipt_root: string;
                    created_at: string;
                    from_version: string;
                    id: string;
                    issued_at: string;
                    ledger_anchor_id: string | null;
                    migration_root: string;
                    network: string;
                    post_state_root: string | null;
                    pre_state_root: string;
                    receipt: Json;
                    rollback_plan_root: string;
                    to_version: string;
                    upgrade_id: string;
                    upgrade_state: string;
                };
                Insert: {
                    approval_receipt_root: string;
                    created_at?: string;
                    from_version: string;
                    id?: string;
                    issued_at: string;
                    ledger_anchor_id?: string | null;
                    migration_root: string;
                    network: string;
                    post_state_root?: string | null;
                    pre_state_root: string;
                    receipt: Json;
                    rollback_plan_root: string;
                    to_version: string;
                    upgrade_id: string;
                    upgrade_state: string;
                };
                Update: {
                    approval_receipt_root?: string;
                    created_at?: string;
                    from_version?: string;
                    id?: string;
                    issued_at?: string;
                    ledger_anchor_id?: string | null;
                    migration_root?: string;
                    network?: string;
                    post_state_root?: string | null;
                    pre_state_root?: string;
                    receipt?: Json;
                    rollback_plan_root?: string;
                    to_version?: string;
                    upgrade_id?: string;
                    upgrade_state?: string;
                };
                Relationships: [];
            };
            btd_read_licenses: {
                Row: {
                    access_policy_hash: string;
                    asset_pack_id: string;
                    created_at: string;
                    expires_at: string | null;
                    id: string;
                    issued_at: string;
                    license_id: string;
                    payment_id: string | null;
                    receipt: Json;
                    source_receipt_id: string;
                    valid_from: string;
                    wallet_id: string;
                };
                Insert: {
                    access_policy_hash: string;
                    asset_pack_id: string;
                    created_at?: string;
                    expires_at?: string | null;
                    id?: string;
                    issued_at: string;
                    license_id: string;
                    payment_id?: string | null;
                    receipt: Json;
                    source_receipt_id: string;
                    valid_from: string;
                    wallet_id: string;
                };
                Update: {
                    access_policy_hash?: string;
                    asset_pack_id?: string;
                    created_at?: string;
                    expires_at?: string | null;
                    id?: string;
                    issued_at?: string;
                    license_id?: string;
                    payment_id?: string | null;
                    receipt?: Json;
                    source_receipt_id?: string;
                    valid_from?: string;
                    wallet_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "btd_read_licenses_asset_pack_id_fkey";
                        columns: ["asset_pack_id"];
                        isOneToOne: false;
                        referencedRelation: "btd_asset_pack_ranges";
                        referencedColumns: ["asset_pack_id"];
                    }
                ];
            };
            btd_rights_transfer_receipts: {
                Row: {
                    access_policy_hash: string;
                    asset_pack_id: string;
                    btc_fee_receipt_id: string;
                    created_at: string;
                    exchange_sequence: number;
                    from_wallet_id: string;
                    id: string;
                    issued_at: string;
                    ledger_anchor_id: string;
                    order_id: string;
                    price_asset: string;
                    price_sats: number;
                    range_end_exclusive: number;
                    range_start: number;
                    receipt: Json;
                    receipt_id: string;
                    to_wallet_id: string;
                };
                Insert: {
                    access_policy_hash: string;
                    asset_pack_id: string;
                    btc_fee_receipt_id: string;
                    created_at?: string;
                    exchange_sequence: number;
                    from_wallet_id: string;
                    id?: string;
                    issued_at: string;
                    ledger_anchor_id: string;
                    order_id: string;
                    price_asset?: string;
                    price_sats: number;
                    range_end_exclusive: number;
                    range_start: number;
                    receipt: Json;
                    receipt_id: string;
                    to_wallet_id: string;
                };
                Update: {
                    access_policy_hash?: string;
                    asset_pack_id?: string;
                    btc_fee_receipt_id?: string;
                    created_at?: string;
                    exchange_sequence?: number;
                    from_wallet_id?: string;
                    id?: string;
                    issued_at?: string;
                    ledger_anchor_id?: string;
                    order_id?: string;
                    price_asset?: string;
                    price_sats?: number;
                    range_end_exclusive?: number;
                    range_start?: number;
                    receipt?: Json;
                    receipt_id?: string;
                    to_wallet_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "btd_rights_transfer_receipts_order_id_fkey";
                        columns: ["order_id"];
                        isOneToOne: false;
                        referencedRelation: "btd_exchange_orders";
                        referencedColumns: ["order_id"];
                    }
                ];
            };
            btd_semantic_volume_measurements: {
                Row: {
                    asset_pack_id: string;
                    created_at: string;
                    excluded_units: Json;
                    id: string;
                    included_units: Json;
                    issued_at: string;
                    measurement_id: string;
                    normalized_bitcode_volume: number;
                    quantization: number;
                    token_count: number;
                };
                Insert: {
                    asset_pack_id: string;
                    created_at?: string;
                    excluded_units?: Json;
                    id?: string;
                    included_units?: Json;
                    issued_at: string;
                    measurement_id: string;
                    normalized_bitcode_volume: number;
                    quantization?: number;
                    token_count: number;
                };
                Update: {
                    asset_pack_id?: string;
                    created_at?: string;
                    excluded_units?: Json;
                    id?: string;
                    included_units?: Json;
                    issued_at?: string;
                    measurement_id?: string;
                    normalized_bitcode_volume?: number;
                    quantization?: number;
                    token_count?: number;
                };
                Relationships: [];
            };
            btd_supply_state: {
                Row: {
                    cumulative_admitted_measurement: number;
                    curve: string;
                    curve_parameter: number;
                    exhausted_at_exchange_sequence: number | null;
                    id: string;
                    max_supply: number;
                    next_token_id: number;
                    residual_mint_credit: number;
                    tail_policy: string;
                    total_minted: number;
                    updated_at: string;
                };
                Insert: {
                    cumulative_admitted_measurement?: number;
                    curve?: string;
                    curve_parameter?: number;
                    exhausted_at_exchange_sequence?: number | null;
                    id?: string;
                    max_supply?: number;
                    next_token_id?: number;
                    residual_mint_credit?: number;
                    tail_policy?: string;
                    total_minted?: number;
                    updated_at?: string;
                };
                Update: {
                    cumulative_admitted_measurement?: number;
                    curve?: string;
                    curve_parameter?: number;
                    exhausted_at_exchange_sequence?: number | null;
                    id?: string;
                    max_supply?: number;
                    next_token_id?: number;
                    residual_mint_credit?: number;
                    tail_policy?: string;
                    total_minted?: number;
                    updated_at?: string;
                };
                Relationships: [];
            };
            btd_terminal_journal_entries: {
                Row: {
                    actor_id: string;
                    created_at: string;
                    exchange_sequence: number;
                    id: string;
                    issued_at: string;
                    journal_entry_id: string;
                    ledger_anchor_ids: Json;
                    post_state_root: string;
                    pre_state_root: string;
                    receipt_roots: Json;
                    transaction_kind: string;
                };
                Insert: {
                    actor_id: string;
                    created_at?: string;
                    exchange_sequence: number;
                    id?: string;
                    issued_at: string;
                    journal_entry_id: string;
                    ledger_anchor_ids?: Json;
                    post_state_root: string;
                    pre_state_root: string;
                    receipt_roots?: Json;
                    transaction_kind: string;
                };
                Update: {
                    actor_id?: string;
                    created_at?: string;
                    exchange_sequence?: number;
                    id?: string;
                    issued_at?: string;
                    journal_entry_id?: string;
                    ledger_anchor_ids?: Json;
                    post_state_root?: string;
                    pre_state_root?: string;
                    receipt_roots?: Json;
                    transaction_kind?: string;
                };
                Relationships: [];
            };
            conversations: {
                Row: {
                    created_at: string | null;
                    id: string;
                    title: string;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    title?: string;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    title?: string;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            deliverable_items: {
                Row: {
                    config: Json | null;
                    created_at: string | null;
                    deliverable_id: string;
                    description: string | null;
                    id: string;
                    item_type: string | null;
                    order_index: number | null;
                    title: string;
                    updated_at: string | null;
                };
                Insert: {
                    config?: Json | null;
                    created_at?: string | null;
                    deliverable_id: string;
                    description?: string | null;
                    id?: string;
                    item_type?: string | null;
                    order_index?: number | null;
                    title: string;
                    updated_at?: string | null;
                };
                Update: {
                    config?: Json | null;
                    created_at?: string | null;
                    deliverable_id?: string;
                    description?: string | null;
                    id?: string;
                    item_type?: string | null;
                    order_index?: number | null;
                    title?: string;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "deliverable_items_deliverable_id_fkey";
                        columns: ["deliverable_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverables";
                        referencedColumns: ["id"];
                    }
                ];
            };
            deliverable_pipeline_agent_steps: {
                Row: {
                    agent_name: string;
                    completed_at: string | null;
                    created_at: string | null;
                    error_data: Json | null;
                    id: string;
                    input_data: Json | null;
                    output_data: Json | null;
                    phase_delegation_id: string;
                    started_at: string | null;
                    status: string | null;
                    step_type: string;
                };
                Insert: {
                    agent_name: string;
                    completed_at?: string | null;
                    created_at?: string | null;
                    error_data?: Json | null;
                    id?: string;
                    input_data?: Json | null;
                    output_data?: Json | null;
                    phase_delegation_id: string;
                    started_at?: string | null;
                    status?: string | null;
                    step_type: string;
                };
                Update: {
                    agent_name?: string;
                    completed_at?: string | null;
                    created_at?: string | null;
                    error_data?: Json | null;
                    id?: string;
                    input_data?: Json | null;
                    output_data?: Json | null;
                    phase_delegation_id?: string;
                    started_at?: string | null;
                    status?: string | null;
                    step_type?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "deliverable_pipeline_agent_steps_phase_delegation_id_fkey";
                        columns: ["phase_delegation_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_pipeline_phase_delegations";
                        referencedColumns: ["id"];
                    }
                ];
            };
            deliverable_pipeline_events: {
                Row: {
                    agent_name: string | null;
                    created_at: string | null;
                    event_data: Json | null;
                    event_type: string;
                    id: string;
                    phase: string | null;
                    run_id: string;
                };
                Insert: {
                    agent_name?: string | null;
                    created_at?: string | null;
                    event_data?: Json | null;
                    event_type: string;
                    id?: string;
                    phase?: string | null;
                    run_id: string;
                };
                Update: {
                    agent_name?: string | null;
                    created_at?: string | null;
                    event_data?: Json | null;
                    event_type?: string;
                    id?: string;
                    phase?: string | null;
                    run_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "deliverable_pipeline_events_run_id_fkey";
                        columns: ["run_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_pipeline_runs";
                        referencedColumns: ["id"];
                    }
                ];
            };
            deliverable_pipeline_generated_assets: {
                Row: {
                    asset_data: Json | null;
                    asset_name: string;
                    asset_type: string;
                    asset_url: string | null;
                    created_at: string | null;
                    id: string;
                    run_id: string | null;
                    user_id: string;
                };
                Insert: {
                    asset_data?: Json | null;
                    asset_name: string;
                    asset_type: string;
                    asset_url?: string | null;
                    created_at?: string | null;
                    id?: string;
                    run_id?: string | null;
                    user_id: string;
                };
                Update: {
                    asset_data?: Json | null;
                    asset_name?: string;
                    asset_type?: string;
                    asset_url?: string | null;
                    created_at?: string | null;
                    id?: string;
                    run_id?: string | null;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "deliverable_pipeline_generated_assets_run_id_fkey";
                        columns: ["run_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_pipeline_runs";
                        referencedColumns: ["id"];
                    }
                ];
            };
            deliverable_pipeline_generations: {
                Row: {
                    agent_step_id: string | null;
                    cost: number | null;
                    created_at: string | null;
                    id: string;
                    input_tokens: number | null;
                    latency_ms: number | null;
                    messages: Json;
                    model_name: string;
                    model_provider: string;
                    output_tokens: number | null;
                    phase_delegation_id: string | null;
                    response: Json | null;
                    run_id: string | null;
                    substep_id: string | null;
                    total_tokens: number | null;
                };
                Insert: {
                    agent_step_id?: string | null;
                    cost?: number | null;
                    created_at?: string | null;
                    id?: string;
                    input_tokens?: number | null;
                    latency_ms?: number | null;
                    messages: Json;
                    model_name: string;
                    model_provider: string;
                    output_tokens?: number | null;
                    phase_delegation_id?: string | null;
                    response?: Json | null;
                    run_id?: string | null;
                    substep_id?: string | null;
                    total_tokens?: number | null;
                };
                Update: {
                    agent_step_id?: string | null;
                    cost?: number | null;
                    created_at?: string | null;
                    id?: string;
                    input_tokens?: number | null;
                    latency_ms?: number | null;
                    messages?: Json;
                    model_name?: string;
                    model_provider?: string;
                    output_tokens?: number | null;
                    phase_delegation_id?: string | null;
                    response?: Json | null;
                    run_id?: string | null;
                    substep_id?: string | null;
                    total_tokens?: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "deliverable_pipeline_generations_agent_step_id_fkey";
                        columns: ["agent_step_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_pipeline_agent_steps";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "deliverable_pipeline_generations_phase_delegation_id_fkey";
                        columns: ["phase_delegation_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_pipeline_phase_delegations";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "deliverable_pipeline_generations_run_id_fkey";
                        columns: ["run_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_pipeline_runs";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "deliverable_pipeline_generations_substep_id_fkey";
                        columns: ["substep_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_pipeline_substeps";
                        referencedColumns: ["id"];
                    }
                ];
            };
            deliverable_pipeline_otf_instructions: {
                Row: {
                    created_at: string | null;
                    id: string;
                    instruction_data: Json;
                    instruction_type: string;
                    is_processed: boolean | null;
                    processed_at: string | null;
                    run_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    instruction_data: Json;
                    instruction_type: string;
                    is_processed?: boolean | null;
                    processed_at?: string | null;
                    run_id: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    instruction_data?: Json;
                    instruction_type?: string;
                    is_processed?: boolean | null;
                    processed_at?: string | null;
                    run_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "deliverable_pipeline_otf_instructions_run_id_fkey";
                        columns: ["run_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_pipeline_runs";
                        referencedColumns: ["id"];
                    }
                ];
            };
            deliverable_pipeline_phase_delegations: {
                Row: {
                    completed_at: string | null;
                    created_at: string | null;
                    error_data: Json | null;
                    id: string;
                    input_data: Json | null;
                    output_data: Json | null;
                    phase_name: string;
                    run_id: string;
                    started_at: string | null;
                    status: string | null;
                };
                Insert: {
                    completed_at?: string | null;
                    created_at?: string | null;
                    error_data?: Json | null;
                    id?: string;
                    input_data?: Json | null;
                    output_data?: Json | null;
                    phase_name: string;
                    run_id: string;
                    started_at?: string | null;
                    status?: string | null;
                };
                Update: {
                    completed_at?: string | null;
                    created_at?: string | null;
                    error_data?: Json | null;
                    id?: string;
                    input_data?: Json | null;
                    output_data?: Json | null;
                    phase_name?: string;
                    run_id?: string;
                    started_at?: string | null;
                    status?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "deliverable_pipeline_phase_delegations_run_id_fkey";
                        columns: ["run_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_pipeline_runs";
                        referencedColumns: ["id"];
                    }
                ];
            };
            deliverable_pipeline_runs: {
                Row: {
                    completed_at: string | null;
                    config: Json | null;
                    context: Json | null;
                    created_at: string | null;
                    deliverable_id: string | null;
                    duration_ms: number | null;
                    error_data: Json | null;
                    id: string;
                    input_data: Json | null;
                    items: Json | null;
                    output_data: Json | null;
                    pipeline_run_id: string | null;
                    pipeline_type: string | null;
                    started_at: string | null;
                    status: string | null;
                    total_cost: number | null;
                    total_tokens: number | null;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    completed_at?: string | null;
                    config?: Json | null;
                    context?: Json | null;
                    created_at?: string | null;
                    deliverable_id?: string | null;
                    duration_ms?: number | null;
                    error_data?: Json | null;
                    id?: string;
                    input_data?: Json | null;
                    items?: Json | null;
                    output_data?: Json | null;
                    pipeline_run_id?: string | null;
                    pipeline_type?: string | null;
                    started_at?: string | null;
                    status?: string | null;
                    total_cost?: number | null;
                    total_tokens?: number | null;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    completed_at?: string | null;
                    config?: Json | null;
                    context?: Json | null;
                    created_at?: string | null;
                    deliverable_id?: string | null;
                    duration_ms?: number | null;
                    error_data?: Json | null;
                    id?: string;
                    input_data?: Json | null;
                    items?: Json | null;
                    output_data?: Json | null;
                    pipeline_run_id?: string | null;
                    pipeline_type?: string | null;
                    started_at?: string | null;
                    status?: string | null;
                    total_cost?: number | null;
                    total_tokens?: number | null;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "deliverable_pipeline_runs_pipeline_run_id_fkey";
                        columns: ["pipeline_run_id"];
                        isOneToOne: false;
                        referencedRelation: "pipeline_runs";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "deliverable_runs_deliverable_id_fkey";
                        columns: ["deliverable_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverables";
                        referencedColumns: ["id"];
                    }
                ];
            };
            deliverable_pipeline_substeps: {
                Row: {
                    agent_step_id: string;
                    completed_at: string | null;
                    created_at: string | null;
                    error_data: Json | null;
                    id: string;
                    input_data: Json | null;
                    output_data: Json | null;
                    started_at: string | null;
                    status: string | null;
                    substep_index: number;
                    substep_type: string;
                };
                Insert: {
                    agent_step_id: string;
                    completed_at?: string | null;
                    created_at?: string | null;
                    error_data?: Json | null;
                    id?: string;
                    input_data?: Json | null;
                    output_data?: Json | null;
                    started_at?: string | null;
                    status?: string | null;
                    substep_index: number;
                    substep_type: string;
                };
                Update: {
                    agent_step_id?: string;
                    completed_at?: string | null;
                    created_at?: string | null;
                    error_data?: Json | null;
                    id?: string;
                    input_data?: Json | null;
                    output_data?: Json | null;
                    started_at?: string | null;
                    status?: string | null;
                    substep_index?: number;
                    substep_type?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "deliverable_pipeline_substeps_agent_step_id_fkey";
                        columns: ["agent_step_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_pipeline_agent_steps";
                        referencedColumns: ["id"];
                    }
                ];
            };
            deliverable_pipeline_tool_executions: {
                Row: {
                    agent_step_id: string | null;
                    created_at: string | null;
                    execution_time_ms: number | null;
                    id: string;
                    substep_id: string | null;
                    tool_error: Json | null;
                    tool_input: Json | null;
                    tool_name: string;
                    tool_output: Json | null;
                };
                Insert: {
                    agent_step_id?: string | null;
                    created_at?: string | null;
                    execution_time_ms?: number | null;
                    id?: string;
                    substep_id?: string | null;
                    tool_error?: Json | null;
                    tool_input?: Json | null;
                    tool_name: string;
                    tool_output?: Json | null;
                };
                Update: {
                    agent_step_id?: string | null;
                    created_at?: string | null;
                    execution_time_ms?: number | null;
                    id?: string;
                    substep_id?: string | null;
                    tool_error?: Json | null;
                    tool_input?: Json | null;
                    tool_name?: string;
                    tool_output?: Json | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "deliverable_pipeline_tool_executions_agent_step_id_fkey";
                        columns: ["agent_step_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_pipeline_agent_steps";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "deliverable_pipeline_tool_executions_substep_id_fkey";
                        columns: ["substep_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_pipeline_substeps";
                        referencedColumns: ["id"];
                    }
                ];
            };
            deliverable_templates: {
                Row: {
                    created_at: string | null;
                    deliverable_type: string;
                    id: string;
                    is_active: boolean | null;
                    name: string;
                    template_text: string;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    deliverable_type: string;
                    id?: string;
                    is_active?: boolean | null;
                    name: string;
                    template_text: string;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    deliverable_type?: string;
                    id?: string;
                    is_active?: boolean | null;
                    name?: string;
                    template_text?: string;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            deliverable_vectors: {
                Row: {
                    content: string;
                    created_at: string | null;
                    deliverable_id: string;
                    embedding: string | null;
                    id: string;
                    metadata: Json | null;
                };
                Insert: {
                    content: string;
                    created_at?: string | null;
                    deliverable_id: string;
                    embedding?: string | null;
                    id?: string;
                    metadata?: Json | null;
                };
                Update: {
                    content?: string;
                    created_at?: string | null;
                    deliverable_id?: string;
                    embedding?: string | null;
                    id?: string;
                    metadata?: Json | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "deliverable_vectors_deliverable_id_fkey";
                        columns: ["deliverable_id"];
                        isOneToOne: true;
                        referencedRelation: "deliverables";
                        referencedColumns: ["id"];
                    }
                ];
            };
            deliverables: {
                Row: {
                    config: Json | null;
                    created_at: string | null;
                    description: string | null;
                    effectiveness_score: number | null;
                    execution_count: number | null;
                    id: string;
                    status: string | null;
                    template_id: string | null;
                    title: string;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    config?: Json | null;
                    created_at?: string | null;
                    description?: string | null;
                    effectiveness_score?: number | null;
                    execution_count?: number | null;
                    id?: string;
                    status?: string | null;
                    template_id?: string | null;
                    title: string;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    config?: Json | null;
                    created_at?: string | null;
                    description?: string | null;
                    effectiveness_score?: number | null;
                    execution_count?: number | null;
                    id?: string;
                    status?: string | null;
                    template_id?: string | null;
                    title?: string;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            error_logs: {
                Row: {
                    context: Json | null;
                    created_at: string | null;
                    error_message: string;
                    error_stack: string | null;
                    error_type: string;
                    id: string;
                    user_id: string | null;
                };
                Insert: {
                    context?: Json | null;
                    created_at?: string | null;
                    error_message: string;
                    error_stack?: string | null;
                    error_type: string;
                    id?: string;
                    user_id?: string | null;
                };
                Update: {
                    context?: Json | null;
                    created_at?: string | null;
                    error_message?: string;
                    error_stack?: string | null;
                    error_type?: string;
                    id?: string;
                    user_id?: string | null;
                };
                Relationships: [];
            };
            events: {
                Row: {
                    created_at: string | null;
                    event_category: string | null;
                    event_data: Json | null;
                    event_type: string;
                    id: string;
                    ip_address: unknown;
                    user_agent: string | null;
                    user_id: string | null;
                };
                Insert: {
                    created_at?: string | null;
                    event_category?: string | null;
                    event_data?: Json | null;
                    event_type: string;
                    id?: string;
                    ip_address?: unknown;
                    user_agent?: string | null;
                    user_id?: string | null;
                };
                Update: {
                    created_at?: string | null;
                    event_category?: string | null;
                    event_data?: Json | null;
                    event_type?: string;
                    id?: string;
                    ip_address?: unknown;
                    user_agent?: string | null;
                    user_id?: string | null;
                };
                Relationships: [];
            };
            message_attachments: {
                Row: {
                    attachment_category: string;
                    attachment_id: string;
                    attachment_type: string | null;
                    context: string | null;
                    created_at: string | null;
                    id: string;
                    message_id: string;
                    metadata: Json | null;
                };
                Insert: {
                    attachment_category: string;
                    attachment_id: string;
                    attachment_type?: string | null;
                    context?: string | null;
                    created_at?: string | null;
                    id?: string;
                    message_id: string;
                    metadata?: Json | null;
                };
                Update: {
                    attachment_category?: string;
                    attachment_id?: string;
                    attachment_type?: string | null;
                    context?: string | null;
                    created_at?: string | null;
                    id?: string;
                    message_id?: string;
                    metadata?: Json | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "message_attachments_message_id_fkey";
                        columns: ["message_id"];
                        isOneToOne: false;
                        referencedRelation: "messages";
                        referencedColumns: ["id"];
                    }
                ];
            };
            messages: {
                Row: {
                    content: string;
                    conversation_id: string;
                    created_at: string | null;
                    id: string;
                    role: string;
                };
                Insert: {
                    content: string;
                    conversation_id: string;
                    created_at?: string | null;
                    id?: string;
                    role: string;
                };
                Update: {
                    content?: string;
                    conversation_id?: string;
                    created_at?: string | null;
                    id?: string;
                    role?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "messages_conversation_id_fkey";
                        columns: ["conversation_id"];
                        isOneToOne: false;
                        referencedRelation: "conversations";
                        referencedColumns: ["id"];
                    }
                ];
            };
            notifications: {
                Row: {
                    created_at: string | null;
                    data: Json | null;
                    id: string;
                    is_read: boolean | null;
                    message: string | null;
                    title: string;
                    type: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    data?: Json | null;
                    id?: string;
                    is_read?: boolean | null;
                    message?: string | null;
                    title: string;
                    type: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    data?: Json | null;
                    id?: string;
                    is_read?: boolean | null;
                    message?: string | null;
                    title?: string;
                    type?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            pipeline_runs: {
                Row: {
                    artifacts: Json | null;
                    completed_at: string | null;
                    correlation_id: string | null;
                    created_at: string | null;
                    duration_ms: number | null;
                    error_data: Json | null;
                    execution_id: string | null;
                    execution_state: Json | null;
                    id: string;
                    input: Json | null;
                    metadata: Json | null;
                    metrics: Json | null;
                    output: Json | null;
                    pipeline_config: Json | null;
                    pipeline_name: string | null;
                    pipeline_type: string;
                    pipeline_version: string | null;
                    started_at: string | null;
                    status: string | null;
                    updated_at: string | null;
                    user_id: string;
                    validation: Json | null;
                };
                Insert: {
                    artifacts?: Json | null;
                    completed_at?: string | null;
                    correlation_id?: string | null;
                    created_at?: string | null;
                    duration_ms?: number | null;
                    error_data?: Json | null;
                    execution_id?: string | null;
                    execution_state?: Json | null;
                    id?: string;
                    input?: Json | null;
                    metadata?: Json | null;
                    metrics?: Json | null;
                    output?: Json | null;
                    pipeline_config?: Json | null;
                    pipeline_name?: string | null;
                    pipeline_type: string;
                    pipeline_version?: string | null;
                    started_at?: string | null;
                    status?: string | null;
                    updated_at?: string | null;
                    user_id: string;
                    validation?: Json | null;
                };
                Update: {
                    artifacts?: Json | null;
                    completed_at?: string | null;
                    correlation_id?: string | null;
                    created_at?: string | null;
                    duration_ms?: number | null;
                    error_data?: Json | null;
                    execution_id?: string | null;
                    execution_state?: Json | null;
                    id?: string;
                    input?: Json | null;
                    metadata?: Json | null;
                    metrics?: Json | null;
                    output?: Json | null;
                    pipeline_config?: Json | null;
                    pipeline_name?: string | null;
                    pipeline_type?: string;
                    pipeline_version?: string | null;
                    started_at?: string | null;
                    status?: string | null;
                    updated_at?: string | null;
                    user_id?: string;
                    validation?: Json | null;
                };
                Relationships: [];
            };
            run_jobs: {
                Row: {
                    claimed_at: string | null;
                    claimed_by: string | null;
                    created_at: string | null;
                    error_message: string | null;
                    id: string;
                    job_type: string;
                    max_retries: number | null;
                    payload: Json | null;
                    result: Json | null;
                    retry_count: number | null;
                    status: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    claimed_at?: string | null;
                    claimed_by?: string | null;
                    created_at?: string | null;
                    error_message?: string | null;
                    id?: string;
                    job_type: string;
                    max_retries?: number | null;
                    payload?: Json | null;
                    result?: Json | null;
                    retry_count?: number | null;
                    status?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    claimed_at?: string | null;
                    claimed_by?: string | null;
                    created_at?: string | null;
                    error_message?: string | null;
                    id?: string;
                    job_type?: string;
                    max_retries?: number | null;
                    payload?: Json | null;
                    result?: Json | null;
                    retry_count?: number | null;
                    status?: string | null;
                    updated_at?: string | null;
                };
                Relationships: [];
            };
            stream_logs: {
                Row: {
                    created_at: string | null;
                    id: string;
                    log_data: Json | null;
                    log_type: string;
                    stream_id: string;
                    user_id: string | null;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    log_data?: Json | null;
                    log_type: string;
                    stream_id: string;
                    user_id?: string | null;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    log_data?: Json | null;
                    log_type?: string;
                    stream_id?: string;
                    user_id?: string | null;
                };
                Relationships: [];
            };
            token_costs: {
                Row: {
                    cost: number | null;
                    created_at: string | null;
                    id: string;
                    input_tokens: number | null;
                    model_name: string;
                    model_provider: string;
                    output_tokens: number | null;
                    run_id: string | null;
                    total_tokens: number | null;
                    user_id: string;
                };
                Insert: {
                    cost?: number | null;
                    created_at?: string | null;
                    id?: string;
                    input_tokens?: number | null;
                    model_name: string;
                    model_provider: string;
                    output_tokens?: number | null;
                    run_id?: string | null;
                    total_tokens?: number | null;
                    user_id: string;
                };
                Update: {
                    cost?: number | null;
                    created_at?: string | null;
                    id?: string;
                    input_tokens?: number | null;
                    model_name?: string;
                    model_provider?: string;
                    output_tokens?: number | null;
                    run_id?: string | null;
                    total_tokens?: number | null;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "token_costs_run_id_fkey";
                        columns: ["run_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_pipeline_runs";
                        referencedColumns: ["id"];
                    }
                ];
            };
            user_connections: {
                Row: {
                    connection_data: Json;
                    created_at: string | null;
                    id: string;
                    is_active: boolean | null;
                    provider: string;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    connection_data?: Json;
                    created_at?: string | null;
                    id?: string;
                    is_active?: boolean | null;
                    provider: string;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    connection_data?: Json;
                    created_at?: string | null;
                    id?: string;
                    is_active?: boolean | null;
                    provider?: string;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            user_credit_usages: {
                Row: {
                    amount: number;
                    created_at: string | null;
                    id: string;
                    metadata: Json | null;
                    operation_id: string | null;
                    operation_type: string;
                    user_id: string;
                };
                Insert: {
                    amount: number;
                    created_at?: string | null;
                    id?: string;
                    metadata?: Json | null;
                    operation_id?: string | null;
                    operation_type: string;
                    user_id: string;
                };
                Update: {
                    amount?: number;
                    created_at?: string | null;
                    id?: string;
                    metadata?: Json | null;
                    operation_id?: string | null;
                    operation_type?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            user_credits: {
                Row: {
                    balance: number | null;
                    created_at: string | null;
                    id: string;
                    stripe_customer_id: string | null;
                    total_purchased: number | null;
                    total_used: number | null;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    balance?: number | null;
                    created_at?: string | null;
                    id?: string;
                    stripe_customer_id?: string | null;
                    total_purchased?: number | null;
                    total_used?: number | null;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    balance?: number | null;
                    created_at?: string | null;
                    id?: string;
                    stripe_customer_id?: string | null;
                    total_purchased?: number | null;
                    total_used?: number | null;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            user_github_connections: {
                Row: {
                    access_token: string | null;
                    created_at: string | null;
                    github_user_id: number | null;
                    github_username: string | null;
                    id: string;
                    installation_data: Json | null;
                    installation_id: number | null;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    access_token?: string | null;
                    created_at?: string | null;
                    github_user_id?: number | null;
                    github_username?: string | null;
                    id?: string;
                    installation_data?: Json | null;
                    installation_id?: number | null;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    access_token?: string | null;
                    created_at?: string | null;
                    github_user_id?: number | null;
                    github_username?: string | null;
                    id?: string;
                    installation_data?: Json | null;
                    installation_id?: number | null;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            user_model_preferences: {
                Row: {
                    created_at: string | null;
                    id: string;
                    is_default: boolean | null;
                    model_name: string;
                    model_provider: string;
                    settings: Json | null;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    is_default?: boolean | null;
                    model_name: string;
                    model_provider: string;
                    settings?: Json | null;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    is_default?: boolean | null;
                    model_name?: string;
                    model_provider?: string;
                    settings?: Json | null;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            user_profiles: {
                Row: {
                    avatar_url: string | null;
                    bio: string | null;
                    created_at: string | null;
                    display_name: string | null;
                    id: string;
                    onboarded_steps: string | null;
                    onboarding_completed: boolean | null;
                    onboarding_data: Json | null;
                    onboarding_step: string | null;
                    role: string | null;
                    settings: Json | null;
                    updated_at: string | null;
                    username: string | null;
                };
                Insert: {
                    avatar_url?: string | null;
                    bio?: string | null;
                    created_at?: string | null;
                    display_name?: string | null;
                    id: string;
                    onboarded_steps?: string | null;
                    onboarding_completed?: boolean | null;
                    onboarding_data?: Json | null;
                    onboarding_step?: string | null;
                    role?: string | null;
                    settings?: Json | null;
                    updated_at?: string | null;
                    username?: string | null;
                };
                Update: {
                    avatar_url?: string | null;
                    bio?: string | null;
                    created_at?: string | null;
                    display_name?: string | null;
                    id?: string;
                    onboarded_steps?: string | null;
                    onboarding_completed?: boolean | null;
                    onboarding_data?: Json | null;
                    onboarding_step?: string | null;
                    role?: string | null;
                    settings?: Json | null;
                    updated_at?: string | null;
                    username?: string | null;
                };
                Relationships: [];
            };
            user_template_preferences: {
                Row: {
                    ai_document_templates: Json | null;
                    auto_save_templates: boolean | null;
                    created_at: string | null;
                    default_deliverable_template_id: string | null;
                    deliverable_templates: Json | null;
                    id: string;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    ai_document_templates?: Json | null;
                    auto_save_templates?: boolean | null;
                    created_at?: string | null;
                    default_deliverable_template_id?: string | null;
                    deliverable_templates?: Json | null;
                    id?: string;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    ai_document_templates?: Json | null;
                    auto_save_templates?: boolean | null;
                    created_at?: string | null;
                    default_deliverable_template_id?: string | null;
                    deliverable_templates?: Json | null;
                    id?: string;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "user_template_preferences_default_deliverable_template_id_fkey";
                        columns: ["default_deliverable_template_id"];
                        isOneToOne: false;
                        referencedRelation: "deliverable_templates";
                        referencedColumns: ["id"];
                    }
                ];
            };
            user_vcs_connections: {
                Row: {
                    accesstoken: string;
                    createdat: string | null;
                    expiresat: string | null;
                    id: string;
                    instanceurl: string | null;
                    metadata: Json | null;
                    provider: string;
                    refreshtoken: string | null;
                    updatedat: string | null;
                    userid: string;
                };
                Insert: {
                    accesstoken: string;
                    createdat?: string | null;
                    expiresat?: string | null;
                    id?: string;
                    instanceurl?: string | null;
                    metadata?: Json | null;
                    provider: string;
                    refreshtoken?: string | null;
                    updatedat?: string | null;
                    userid: string;
                };
                Update: {
                    accesstoken?: string;
                    createdat?: string | null;
                    expiresat?: string | null;
                    id?: string;
                    instanceurl?: string | null;
                    metadata?: Json | null;
                    provider?: string;
                    refreshtoken?: string | null;
                    updatedat?: string | null;
                    userid?: string;
                };
                Relationships: [];
            };
            vcs_repositories: {
                Row: {
                    created_at: string | null;
                    id: string;
                    provider: string;
                    provider_repo_id: string;
                    repo_created_at: string | null;
                    repo_data: Json | null;
                    repo_default_branch: string | null;
                    repo_description: string | null;
                    repo_full_name: string;
                    repo_language: string | null;
                    repo_name: string;
                    repo_owner: string;
                    repo_private: boolean | null;
                    repo_updated_at: string | null;
                    repo_url: string | null;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    provider?: string;
                    provider_repo_id: string;
                    repo_created_at?: string | null;
                    repo_data?: Json | null;
                    repo_default_branch?: string | null;
                    repo_description?: string | null;
                    repo_full_name: string;
                    repo_language?: string | null;
                    repo_name: string;
                    repo_owner: string;
                    repo_private?: boolean | null;
                    repo_updated_at?: string | null;
                    repo_url?: string | null;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    provider?: string;
                    provider_repo_id?: string;
                    repo_created_at?: string | null;
                    repo_data?: Json | null;
                    repo_default_branch?: string | null;
                    repo_description?: string | null;
                    repo_full_name?: string;
                    repo_language?: string | null;
                    repo_name?: string;
                    repo_owner?: string;
                    repo_private?: boolean | null;
                    repo_updated_at?: string | null;
                    repo_url?: string | null;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            claim_run_job: {
                Args: {
                    p_job_type: string;
                    p_worker_id: string;
                };
                Returns: string;
            };
            match_deliverable_vectors: {
                Args: {
                    match_count?: number;
                    match_threshold?: number;
                    query_embedding: string;
                };
                Returns: {
                    content: string;
                    deliverable_id: string;
                    similarity: number;
                }[];
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];
export type Tables<DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]) : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
    Row: infer R;
} ? R : never : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
    Row: infer R;
} ? R : never : never;
export type TablesInsert<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
} ? I : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
} ? I : never : never;
export type TablesUpdate<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
} ? U : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
} ? U : never : never;
export type TableName = keyof DefaultSchema["Tables"];
export type Insertable<T extends TableName> = TablesInsert<T>;
export type Updatable<T extends TableName> = TablesUpdate<T>;
export interface QueryOptions<T extends TableName = TableName> {
    limit?: number;
    offset?: number;
    orderBy?: keyof Tables<T>;
    ascending?: boolean;
}
export type UserProfileWithBtd = Tables<'user_profiles'> & {
    btdBalance?: Tables<'user_credits'> | null;
};
export type AssetPackRunComplete = Tables<'pipeline_runs'> & {
    execution?: Tables<'executions'> | null;
    events?: Tables<'execution_events'>[];
};
export type VCSRepositoryWithConnection = Tables<'vcs_repositories'> & {
    connection?: Tables<'user_connections'> | null;
};
export type Enums<DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | {
    schema: keyof DatabaseWithoutInternals;
}, EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] : never = never> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName] : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions] : never;
export type CompositeTypes<PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | {
    schema: keyof DatabaseWithoutInternals;
}, CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"] : never = never> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName] : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions] : never;
export declare const Constants: {
    readonly public: {
        readonly Enums: {};
    };
};
export {};
