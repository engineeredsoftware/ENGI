export type DataHealthSeverity = 'info' | 'warning' | 'critical';

export type DataHealthSuite =
  | 'schema'
  | 'identity'
  | 'terminal'
  | 'ledger'
  | 'operational'
  | 'daily'
  | 'ci'
  | 'qa'
  | 'all';

export interface DataHealthCheckDefinition {
  id: string;
  title: string;
  category: Exclude<DataHealthSuite, 'daily' | 'ci' | 'qa' | 'all'>;
  severity: DataHealthSeverity;
  description: string;
  remediation: string;
  requires?: string[];
  sql: string;
}

export interface DataHealthSqlRow {
  ok: boolean;
  observed_count?: number | string | null;
  details?: unknown;
}

export const CANONICAL_APPLICATION_TABLES = [
  'user_profiles',
  'user_connections',
  'vcs_repositories',
  'notifications',
  'pipeline_runs',
  'run_jobs',
  'stream_logs',
  'deliverables',
  'deliverable_vectors',
  'deliverable_pipeline_runs',
  'deliverable_pipeline_events',
  'deliverable_pipeline_generated_assets',
  'deliverable_pipeline_phase_delegations',
  'deliverable_pipeline_agent_steps',
  'deliverable_pipeline_generations',
  'deliverable_pipeline_substeps',
  'deliverable_pipeline_tool_executions',
  'error_logs',
  'events',
] as const;

export const CANONICAL_BTD_TABLES = [
  'btd_supply_state',
  'btd_semantic_volume_measurements',
  'btd_measure_mint_receipts',
  'btd_asset_pack_ranges',
  'btd_cells',
  'btd_ownership_events',
  'btd_read_licenses',
  'btd_mint_receipts',
  'btd_contributor_allocations',
  'btd_ancestor_edges',
  'btd_licensed_read_revenue_routes',
  'btc_fee_transactions',
  'btd_asset_pack_ledger_anchors',
  'btd_exchange_orders',
  'btd_rights_transfer_receipts',
  'btd_terminal_journal_entries',
  'btd_ledger_database_reconciliation_repairs',
  'btd_protocol_upgrade_receipts',
  'btd_crypto_telemetry_events',
] as const;

export const CANONICAL_PUBLIC_TABLES = [
  ...CANONICAL_APPLICATION_TABLES,
  ...CANONICAL_BTD_TABLES,
] as const;

const REQUIRED_COLUMNS: Record<string, readonly string[]> = {
  user_profiles: ['id', 'settings', 'role', 'onboarded_steps', 'created_at', 'updated_at'],
  user_connections: ['id', 'user_id', 'provider', 'connection_data', 'is_active', 'created_at', 'updated_at'],
  vcs_repositories: ['id', 'user_id', 'provider', 'provider_repo_id', 'repo_full_name', 'repo_owner'],
  btd_supply_state: [
    'id',
    'max_supply',
    'total_minted',
    'next_token_id',
    'cumulative_admitted_measurement',
    'residual_mint_credit',
    'curve',
    'curve_parameter',
    'tail_policy',
  ],
  btd_measure_mint_receipts: [
    'receipt_id',
    'asset_pack_id',
    'normalized_bitcode_volume',
    'cumulative_measurement_before',
    'cumulative_measurement_after',
    'target_minted_before',
    'target_minted_after',
    'residual_mint_credit_before',
    'residual_mint_credit_after',
    'token_count',
    'range_start',
    'range_end_exclusive',
    'zero_cell_reason',
    'total_minted_before',
    'total_minted_after',
    'proof_root',
    'settlement_journal_root',
    'access_policy_hash',
    'exchange_sequence',
  ],
  btd_asset_pack_ranges: [
    'asset_pack_id',
    'range_start',
    'range_end_exclusive',
    'token_count',
    'normalized_bitcode_volume',
    'read_id',
    'source_manifest_root',
    'measurement_receipt_root',
    'fit_receipt_root',
    'proof_root',
    'settlement_journal_root',
    'access_policy_hash',
    'minted_at_exchange_sequence',
  ],
  btd_asset_pack_ledger_anchors: [
    'anchor_id',
    'asset_pack_id',
    'chain',
    'network',
    'commitment_method',
    'commitment_root',
    'source_manifest_root',
    'proof_root',
    'access_policy_hash',
    'btd_range_start',
    'btd_range_end_exclusive',
    'finality_state',
  ],
  btd_terminal_journal_entries: [
    'journal_entry_id',
    'transaction_kind',
    'actor_id',
    'pre_state_root',
    'post_state_root',
    'receipt_roots',
    'ledger_anchor_ids',
    'exchange_sequence',
  ],
  btc_fee_transactions: [
    'receipt_id',
    'fee_purpose',
    'payer_wallet_id',
    'wallet_session_id',
    'network',
    'wallet_authorization_proof',
    'sats_paid',
    'terminal_journal_root',
    'finality_state',
    'fee_asset',
    'server_custody',
  ],
};

const REQUIRED_MIGRATION_VERSIONS = ['001', '002', '003', '20260510223914'] as const;

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function valuesSql(rows: readonly (readonly string[])[]): string {
  return rows.map((row) => `(${row.map(sqlString).join(', ')})`).join(',\n    ');
}

const canonicalPublicTableValues = valuesSql(CANONICAL_PUBLIC_TABLES.map((table) => [table]));
const requiredColumnValues = valuesSql(
  Object.entries(REQUIRED_COLUMNS).flatMap(([table, columns]) =>
    columns.map((column) => [table, column]),
  ),
);
const requiredMigrationValues = valuesSql(REQUIRED_MIGRATION_VERSIONS.map((version) => [version]));

export const DATA_HEALTH_CHECKS: DataHealthCheckDefinition[] = [
  {
    id: 'schema.required-public-tables',
    title: 'Canonical public tables exist',
    category: 'schema',
    severity: 'critical',
    description: 'Confirms the Supabase projection has the user, VCS, Terminal, and BTD registry tables required by the active Bitcode canon.',
    remediation: 'Run Supabase migrations against the target project and confirm the linked project is the intended staging or production database.',
    sql: `
      WITH required(table_name) AS (
        VALUES
    ${canonicalPublicTableValues}
      ),
      present AS (
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
      ),
      missing AS (
        SELECT required.table_name
        FROM required
        LEFT JOIN present USING (table_name)
        WHERE present.table_name IS NULL
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'missing_tables',
          coalesce(jsonb_agg(table_name ORDER BY table_name), '[]'::jsonb)
        ) AS details
      FROM missing;
    `,
  },
  {
    id: 'schema.required-columns',
    title: 'Canonical table columns exist',
    category: 'schema',
    severity: 'critical',
    description: 'Checks the columns that the ORM, Terminal, wallet auth, GitHub linkage, ledger anchors, and BTD registry health checks depend on.',
    remediation: 'Refresh migrations and generated schema types, then rerun the data-health suite before deploying.',
    sql: `
      WITH required(table_name, column_name) AS (
        VALUES
    ${requiredColumnValues}
      ),
      present AS (
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
      ),
      missing AS (
        SELECT required.table_name, required.column_name
        FROM required
        LEFT JOIN present USING (table_name, column_name)
        WHERE present.column_name IS NULL
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'missing_columns',
          coalesce(
            jsonb_agg(
              jsonb_build_object('table', table_name, 'column', column_name)
              ORDER BY table_name, column_name
            ),
            '[]'::jsonb
          )
        ) AS details
      FROM missing;
    `,
  },
  {
    id: 'schema.required-extensions',
    title: 'Required PostgreSQL extensions exist',
    category: 'schema',
    severity: 'critical',
    description: 'Confirms crypto, UUID, and vector primitives exist for profile creation, evidence storage, and AssetPack similarity storage.',
    remediation: 'Apply the initial Supabase migration or enable pgcrypto, uuid-ossp, and vector in the target project.',
    sql: `
      WITH required(extension_name) AS (
        VALUES ('pgcrypto'), ('uuid-ossp'), ('vector')
      ),
      missing AS (
        SELECT required.extension_name
        FROM required
        LEFT JOIN pg_extension ext ON ext.extname = required.extension_name
        WHERE ext.extname IS NULL
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'missing_extensions',
          coalesce(jsonb_agg(extension_name ORDER BY extension_name), '[]'::jsonb)
        ) AS details
      FROM missing;
    `,
  },
  {
    id: 'schema.supabase-migrations-applied',
    title: 'Required Supabase migrations are recorded',
    category: 'schema',
    severity: 'critical',
    description: 'Verifies the baseline production migration, BTD registry migration, provider-scope migration, and RLS event-trigger migration are recorded remotely.',
    remediation: 'Run scripts/supabase.sh db:push --include-all against the intended Supabase project and inspect migration history.',
    requires: ['supabase_migrations.schema_migrations'],
    sql: `
      WITH required(version) AS (
        VALUES
    ${requiredMigrationValues}
      ),
      applied AS (
        SELECT version::text
        FROM supabase_migrations.schema_migrations
      ),
      missing AS (
        SELECT required.version
        FROM required
        LEFT JOIN applied USING (version)
        WHERE applied.version IS NULL
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'missing_migration_versions',
          coalesce(jsonb_agg(version ORDER BY version), '[]'::jsonb)
        ) AS details
      FROM missing;
    `,
  },
  {
    id: 'schema.critical-table-rls-enabled',
    title: 'Critical tables have RLS enabled',
    category: 'schema',
    severity: 'critical',
    description: 'Confirms row-level security is enabled on the canonical public tables used by wallet, GitHub, Terminal, and ledger projections.',
    remediation: 'Enable RLS on missing tables and confirm the RLS auto-enable event trigger is installed for future tables.',
    sql: `
      WITH required(table_name) AS (
        VALUES
    ${canonicalPublicTableValues}
      ),
      rls AS (
        SELECT c.relname AS table_name, c.relrowsecurity
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
      ),
      missing AS (
        SELECT required.table_name, coalesce(rls.relrowsecurity, false) AS rls_enabled
        FROM required
        LEFT JOIN rls USING (table_name)
        WHERE coalesce(rls.relrowsecurity, false) = false
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'tables_without_rls',
          coalesce(jsonb_agg(table_name ORDER BY table_name), '[]'::jsonb)
        ) AS details
      FROM missing;
    `,
  },
  {
    id: 'schema.user-connections-provider-open',
    title: 'User connections accepts wallet and VCS providers',
    category: 'schema',
    severity: 'critical',
    description: 'Ensures the old GitHub-only provider check is gone so Bitcoin wallet authentication and later external providers can persist.',
    remediation: 'Apply the user_connections provider-scope migration before testing wallet or GitHub onboarding.',
    sql: `
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'blocking_constraints',
          coalesce(jsonb_agg(conname ORDER BY conname), '[]'::jsonb)
        ) AS details
      FROM pg_constraint
      WHERE conname = 'user_connections_provider_check';
    `,
  },
  {
    id: 'identity.bitcoin-auth-users-projected',
    title: 'Bitcoin Auth users are projected into Bitcode wallet state',
    category: 'identity',
    severity: 'critical',
    description: 'Ensures every Supabase custom Bitcoin Auth identity has a matching Bitcode profile wallet binding and wallet connection projection.',
    remediation: 'Reload the app after wallet authentication so the wallet session persistence bridge can write the profile and connection projection; if drift remains, inspect /api/wallet/authenticate logs.',
    requires: ['public.user_profiles', 'public.user_connections'],
    sql: `
      WITH bitcoin_identities AS (
        SELECT
          user_id,
          identity_data ->> 'sub' AS subject,
          split_part(identity_data ->> 'sub', ':', 3) AS address,
          updated_at
        FROM auth.identities
        WHERE provider = 'custom:bitcode-bitcoin'
      ),
      projected AS (
        SELECT
          i.user_id,
          i.subject,
          i.address,
          coalesce(
            p.settings #>> '{bitcodeProfile,walletBinding,address}',
            p.settings #>> '{walletBinding,address}'
          ) AS profile_address,
          coalesce(
            p.settings #>> '{bitcodeProfile,walletBinding,provider}',
            p.settings #>> '{walletBinding,provider}'
          ) AS profile_provider,
          c.id AS connection_id,
          coalesce(
            c.connection_data ->> 'address',
            c.connection_data ->> 'wallet_address',
            c.connection_data ->> 'provider_user_id'
          ) AS connection_address
        FROM bitcoin_identities i
        LEFT JOIN public.user_profiles p
          ON p.id = i.user_id
        LEFT JOIN public.user_connections c
          ON c.user_id = i.user_id
          AND c.provider IN ('bitcoin-wallet', 'unisat', 'leather', 'okx-bitcoin', 'xverse', 'manual-bitcoin')
          AND coalesce(c.is_active, true) = true
      ),
      drift AS (
        SELECT *
        FROM projected
        WHERE
          nullif(trim(coalesce(address, '')), '') IS NULL
          OR profile_address IS DISTINCT FROM address
          OR nullif(trim(coalesce(profile_provider, '')), '') IS NULL
          OR connection_id IS NULL
          OR connection_address IS DISTINCT FROM address
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'unprojected_bitcoin_auth_identities',
          coalesce(
            jsonb_agg(
              jsonb_build_object(
                'user_id', user_id,
                'subject', subject,
                'address', address,
                'profile_provider', profile_provider,
                'profile_address', profile_address,
                'connection_id', connection_id,
                'connection_address', connection_address
              )
              ORDER BY user_id::text
            ),
            '[]'::jsonb
          )
        ) AS details
      FROM drift;
    `,
  },
  {
    id: 'identity.wallet-profile-connection-parity',
    title: 'Wallet profile bindings match connection rows',
    category: 'identity',
    severity: 'critical',
    description: 'Checks that profile walletBinding JSON and user_connections rows agree on provider and Bitcoin address.',
    remediation: 'Reconnect the wallet through the Wallet auxillary pane; if drift remains, repair the profile settings and matching user_connections row from the signed wallet proof.',
    requires: ['public.user_profiles', 'public.user_connections'],
    sql: `
      WITH profile_wallets AS (
        SELECT
          id AS user_id,
          coalesce(
            settings #>> '{bitcodeProfile,walletBinding,provider}',
            settings #>> '{walletBinding,provider}'
          ) AS provider,
          coalesce(
            settings #>> '{bitcodeProfile,walletBinding,address}',
            settings #>> '{walletBinding,address}'
          ) AS address
        FROM public.user_profiles
        WHERE
          settings #> '{bitcodeProfile,walletBinding}' IS NOT NULL
          OR settings ? 'walletBinding'
      ),
      drift AS (
        SELECT
          p.user_id,
          p.provider,
          p.address,
          c.id AS connection_id,
          coalesce(
            c.connection_data ->> 'address',
            c.connection_data ->> 'wallet_address',
            c.connection_data ->> 'provider_user_id'
          ) AS connection_address
        FROM profile_wallets p
        LEFT JOIN public.user_connections c
          ON c.user_id = p.user_id
          AND c.provider = p.provider
          AND coalesce(c.is_active, true) = true
        WHERE
          nullif(trim(coalesce(p.provider, '')), '') IS NULL
          OR nullif(trim(coalesce(p.address, '')), '') IS NULL
          OR c.id IS NULL
          OR coalesce(
            c.connection_data ->> 'address',
            c.connection_data ->> 'wallet_address',
            c.connection_data ->> 'provider_user_id'
          ) IS DISTINCT FROM p.address
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'wallet_binding_drift',
          coalesce(
            jsonb_agg(
              jsonb_build_object(
                'user_id', user_id,
                'provider', provider,
                'address', address,
                'connection_id', connection_id,
                'connection_address', connection_address
              )
              ORDER BY user_id::text
            ),
            '[]'::jsonb
          )
        ) AS details
      FROM drift;
    `,
  },
  {
    id: 'identity.wallet-connections-shaped',
    title: 'Bitcoin wallet connections are shaped for signed auth',
    category: 'identity',
    severity: 'critical',
    description: 'Requires Bitcoin wallet connection rows to carry address, network, proof kind, and verification posture.',
    remediation: 'Reconnect through Leather, Xverse, or another supported Bitcoin wallet and ensure the wallet OAuth/Supabase callback completes.',
    requires: ['public.user_connections'],
    sql: `
      WITH wallet_connections AS (
        SELECT *
        FROM public.user_connections
        WHERE provider IN ('bitcoin-wallet', 'unisat', 'leather', 'okx-bitcoin', 'xverse', 'manual-bitcoin')
          AND coalesce(is_active, true) = true
      ),
      malformed AS (
        SELECT
          id,
          user_id,
          provider,
          connection_data
        FROM wallet_connections
        WHERE
          nullif(trim(coalesce(
            connection_data ->> 'address',
            connection_data ->> 'wallet_address',
            connection_data ->> 'provider_user_id'
          )), '') IS NULL
          OR nullif(trim(coalesce(connection_data ->> 'network', '')), '') IS NULL
          OR coalesce(connection_data ->> 'proof_kind', connection_data ->> 'proofKind') NOT IN ('bitcoin_message_signature', 'provider_session')
          OR coalesce(connection_data ->> 'verification_state', connection_data ->> 'status') NOT IN ('pending', 'verified', 'manual')
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'malformed_wallet_connections',
          coalesce(
            jsonb_agg(
              jsonb_build_object('id', id, 'user_id', user_id, 'provider', provider)
              ORDER BY id::text
            ),
            '[]'::jsonb
          )
        ) AS details
      FROM malformed;
    `,
  },
  {
    id: 'identity.github-connections-shaped',
    title: 'GitHub installation connections are shaped',
    category: 'identity',
    severity: 'critical',
    description: 'Confirms active GitHub connections carry an installation identifier usable for source scope and repository refreshes.',
    remediation: 'Reinstall or reconnect the Bitcode GitHub App, then rerun repository synchronization.',
    requires: ['public.user_connections'],
    sql: `
      WITH malformed AS (
        SELECT id, user_id, connection_data
        FROM public.user_connections
        WHERE provider = 'github'
          AND coalesce(is_active, true) = true
          AND nullif(trim(coalesce(
            connection_data ->> 'installation_id',
            connection_data ->> 'installationId',
            connection_data ->> 'connectionId',
            connection_data ->> 'provider_user_id'
          )), '') IS NULL
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'malformed_github_connections',
          coalesce(
            jsonb_agg(jsonb_build_object('id', id, 'user_id', user_id) ORDER BY id::text),
            '[]'::jsonb
          )
        ) AS details
      FROM malformed;
    `,
  },
  {
    id: 'identity.vcs-repositories-shaped',
    title: 'Repository cache rows are source-addressable',
    category: 'identity',
    severity: 'warning',
    description: 'Checks that cached VCS repositories keep provider id, owner/name, full name, and user ownership.',
    remediation: 'Refresh the GitHub installation repository cache for affected users.',
    requires: ['public.vcs_repositories'],
    sql: `
      WITH malformed AS (
        SELECT id, user_id, provider, provider_repo_id, repo_full_name
        FROM public.vcs_repositories
        WHERE
          nullif(trim(coalesce(provider, '')), '') IS NULL
          OR nullif(trim(coalesce(provider_repo_id, '')), '') IS NULL
          OR nullif(trim(coalesce(repo_full_name, '')), '') IS NULL
          OR nullif(trim(coalesce(repo_owner, '')), '') IS NULL
          OR nullif(trim(coalesce(repo_name, '')), '') IS NULL
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'malformed_repositories',
          coalesce(
            jsonb_agg(
              jsonb_build_object(
                'id', id,
                'user_id', user_id,
                'provider', provider,
                'provider_repo_id', provider_repo_id,
                'repo_full_name', repo_full_name
              )
              ORDER BY id::text
            ),
            '[]'::jsonb
          )
        ) AS details
      FROM malformed;
    `,
  },
  {
    id: 'ledger.supply-state-consistency',
    title: 'BTD supply singleton is internally consistent',
    category: 'ledger',
    severity: 'critical',
    description: 'Checks the fixed 21M supply, nonnegative counters, contiguous next token id, and measureminting curve posture.',
    remediation: 'Stop minting writes, replay measuremint receipts from the ledgerized journal, and repair the supply projection from canonical receipts.',
    requires: ['public.btd_supply_state'],
    sql: `
      WITH state AS (
        SELECT *
        FROM public.btd_supply_state
      ),
      invalid AS (
        SELECT *
        FROM state
        WHERE
          id <> 'global'
          OR max_supply <> 21000000
          OR total_minted < 0
          OR total_minted > max_supply
          OR next_token_id <> total_minted
          OR cumulative_admitted_measurement < 0
          OR residual_mint_credit < 0
          OR curve <> 'hyperbolic_saturation'
          OR curve_parameter <= 0
          OR tail_policy <> 'zero_cell_receipt_then_refit_only'
      )
      SELECT
        (SELECT count(*) FROM state) = 1 AND (SELECT count(*) FROM invalid) = 0 AS ok,
        (SELECT count(*) FROM invalid)::bigint AS observed_count,
        jsonb_build_object(
          'supply_rows', (SELECT count(*) FROM state),
          'invalid_rows', coalesce((SELECT jsonb_agg(to_jsonb(invalid) ORDER BY id) FROM invalid), '[]'::jsonb)
        ) AS details;
    `,
  },
  {
    id: 'ledger.range-supply-consistency',
    title: 'AssetPack ranges sum to supply state',
    category: 'ledger',
    severity: 'critical',
    description: 'Confirms minted AssetPack ranges remain non-overlapping, count-correct, cap-bound, and summed to supply_state.total_minted.',
    remediation: 'Stop promotion, replay range receipts and supply state from measuremint receipts, then write a reconciliation repair receipt.',
    requires: ['public.btd_supply_state', 'public.btd_asset_pack_ranges'],
    sql: `
      WITH state AS (
        SELECT total_minted, next_token_id
        FROM public.btd_supply_state
        WHERE id = 'global'
      ),
      range_stats AS (
        SELECT
          coalesce(sum(token_count), 0)::bigint AS summed_token_count,
          coalesce(max(range_end_exclusive), 0)::bigint AS max_range_end,
          count(*)::bigint AS range_count
        FROM public.btd_asset_pack_ranges
      ),
      range_overlaps AS (
        SELECT a.asset_pack_id AS left_asset_pack_id, b.asset_pack_id AS right_asset_pack_id
        FROM public.btd_asset_pack_ranges a
        JOIN public.btd_asset_pack_ranges b ON a.id < b.id
        WHERE int4range(a.range_start, a.range_end_exclusive, '[)') &&
              int4range(b.range_start, b.range_end_exclusive, '[)')
      ),
      invalid_ranges AS (
        SELECT asset_pack_id
        FROM public.btd_asset_pack_ranges
        WHERE
          range_start < 0
          OR range_end_exclusive <= range_start
          OR token_count <> range_end_exclusive - range_start
          OR range_end_exclusive > 21000000
      )
      SELECT
        coalesce((SELECT total_minted FROM state), -1) = coalesce((SELECT summed_token_count FROM range_stats), 0)
        AND coalesce((SELECT next_token_id FROM state), -1) = coalesce((SELECT max_range_end FROM range_stats), 0)
        AND (SELECT count(*) FROM range_overlaps) = 0
        AND (SELECT count(*) FROM invalid_ranges) = 0 AS ok,
        (
          (SELECT count(*) FROM range_overlaps)
          + (SELECT count(*) FROM invalid_ranges)
          + CASE
              WHEN coalesce((SELECT total_minted FROM state), -1) <> coalesce((SELECT summed_token_count FROM range_stats), 0)
                OR coalesce((SELECT next_token_id FROM state), -1) <> coalesce((SELECT max_range_end FROM range_stats), 0)
              THEN 1 ELSE 0
            END
        )::bigint AS observed_count,
        jsonb_build_object(
          'state_total_minted', (SELECT total_minted FROM state),
          'state_next_token_id', (SELECT next_token_id FROM state),
          'range_stats', (SELECT to_jsonb(range_stats) FROM range_stats),
          'overlaps', coalesce((SELECT jsonb_agg(to_jsonb(range_overlaps)) FROM range_overlaps), '[]'::jsonb),
          'invalid_ranges', coalesce((SELECT jsonb_agg(asset_pack_id ORDER BY asset_pack_id) FROM invalid_ranges), '[]'::jsonb)
        ) AS details;
    `,
  },
  {
    id: 'ledger.measuremint-sequence-consistency',
    title: 'Measuremint receipts replay in sequence',
    category: 'ledger',
    severity: 'critical',
    description: 'Checks cumulative measurement, total minted, target minted, and exchange sequence continuity between measuremint receipts.',
    remediation: 'Replay the measuremint journal in exchange-sequence order and repair any projection row that no longer matches the canonical receipt.',
    requires: ['public.btd_measure_mint_receipts'],
    sql: `
      WITH ordered AS (
        SELECT
          *,
          lag(cumulative_measurement_after) OVER (ORDER BY exchange_sequence, receipt_id) AS previous_cumulative_after,
          lag(total_minted_after) OVER (ORDER BY exchange_sequence, receipt_id) AS previous_total_after
        FROM public.btd_measure_mint_receipts
      ),
      invalid AS (
        SELECT receipt_id, asset_pack_id, exchange_sequence
        FROM ordered
        WHERE
          normalized_bitcode_volume <= 0
          OR cumulative_measurement_after <= cumulative_measurement_before
          OR target_minted_after < target_minted_before
          OR token_count <> target_minted_after - target_minted_before
          OR total_minted_after <> total_minted_before + token_count
          OR total_minted_after > max_supply
          OR (previous_cumulative_after IS NOT NULL AND cumulative_measurement_before <> previous_cumulative_after)
          OR (previous_total_after IS NOT NULL AND total_minted_before <> previous_total_after)
          OR (token_count > 0 AND (range_start IS NULL OR range_end_exclusive IS NULL OR zero_cell_reason IS NOT NULL))
          OR (token_count = 0 AND zero_cell_reason NOT IN ('below_integer_threshold', 'tail_exhausted', 'refit_only_policy'))
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'invalid_measuremint_receipts',
          coalesce(
            jsonb_agg(
              jsonb_build_object('receipt_id', receipt_id, 'asset_pack_id', asset_pack_id, 'exchange_sequence', exchange_sequence)
              ORDER BY exchange_sequence, receipt_id
            ),
            '[]'::jsonb
          )
        ) AS details
      FROM invalid;
    `,
  },
  {
    id: 'ledger.measuremint-range-parity',
    title: 'Measuremint receipts match AssetPack ranges',
    category: 'ledger',
    severity: 'critical',
    description: 'Confirms every nonzero measuremint receipt has the AssetPack range it emitted, and zero-cell receipts do not claim a range.',
    remediation: 'Rebuild btd_asset_pack_ranges from btd_measure_mint_receipts and ledgerized Terminal journal entries.',
    requires: ['public.btd_measure_mint_receipts', 'public.btd_asset_pack_ranges'],
    sql: `
      WITH drift AS (
        SELECT
          r.receipt_id,
          r.asset_pack_id,
          r.token_count,
          r.range_start,
          r.range_end_exclusive,
          p.range_start AS projected_range_start,
          p.range_end_exclusive AS projected_range_end_exclusive,
          p.token_count AS projected_token_count
        FROM public.btd_measure_mint_receipts r
        LEFT JOIN public.btd_asset_pack_ranges p ON p.asset_pack_id = r.asset_pack_id
        WHERE
          (
            r.token_count > 0
            AND (
              p.asset_pack_id IS NULL
              OR p.range_start <> r.range_start
              OR p.range_end_exclusive <> r.range_end_exclusive
              OR p.token_count <> r.token_count
            )
          )
          OR (
            r.token_count = 0
            AND (r.range_start IS NOT NULL OR r.range_end_exclusive IS NOT NULL)
          )
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'measuremint_range_drift',
          coalesce(jsonb_agg(to_jsonb(drift) ORDER BY receipt_id), '[]'::jsonb)
        ) AS details
      FROM drift;
    `,
  },
  {
    id: 'ledger.cells-cover-ranges',
    title: 'BTD cells cover emitted ranges',
    category: 'ledger',
    severity: 'warning',
    description: 'Checks that individual BTD cell projections cover every nonzero AssetPack range without missing or excess cell rows.',
    remediation: 'Backfill btd_cells deterministically from AssetPack ranges and source measurement roots, then rerun the health suite.',
    requires: ['public.btd_asset_pack_ranges', 'public.btd_cells'],
    sql: `
      WITH coverage AS (
        SELECT
          r.asset_pack_id,
          r.token_count,
          count(c.token_id)::integer AS cell_count
        FROM public.btd_asset_pack_ranges r
        LEFT JOIN public.btd_cells c
          ON c.asset_pack_id = r.asset_pack_id
          AND c.token_id >= r.range_start
          AND c.token_id < r.range_end_exclusive
        GROUP BY r.asset_pack_id, r.token_count
      ),
      drift AS (
        SELECT *
        FROM coverage
        WHERE token_count <> cell_count
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'cell_coverage_drift',
          coalesce(jsonb_agg(to_jsonb(drift) ORDER BY asset_pack_id), '[]'::jsonb)
        ) AS details
      FROM drift;
    `,
  },
  {
    id: 'ledger.asset-pack-ranges-have-anchors',
    title: 'Minted AssetPack ranges have ledger anchors',
    category: 'ledger',
    severity: 'critical',
    description: 'Ensures each nonzero AssetPack range has at least one non-failed ledger anchor projection.',
    remediation: 'Anchor the AssetPack commitment or replay the anchor journal; do not promote if minted ranges are unanchored.',
    requires: ['public.btd_asset_pack_ranges', 'public.btd_asset_pack_ledger_anchors'],
    sql: `
      WITH missing AS (
        SELECT r.asset_pack_id
        FROM public.btd_asset_pack_ranges r
        LEFT JOIN public.btd_asset_pack_ledger_anchors a
          ON a.asset_pack_id = r.asset_pack_id
          AND a.finality_state <> 'failed'
        WHERE a.anchor_id IS NULL
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'unanchored_asset_packs',
          coalesce(jsonb_agg(asset_pack_id ORDER BY asset_pack_id), '[]'::jsonb)
        ) AS details
      FROM missing;
    `,
  },
  {
    id: 'ledger.anchor-range-parity',
    title: 'Ledger anchors match AssetPack range roots',
    category: 'ledger',
    severity: 'critical',
    description: 'Checks anchor ranges and roots agree with the AssetPack range projection they claim to anchor.',
    remediation: 'Mark invalid anchors failed, replay valid anchors, and write a reconciliation repair if the projection drifted.',
    requires: ['public.btd_asset_pack_ranges', 'public.btd_asset_pack_ledger_anchors'],
    sql: `
      WITH drift AS (
        SELECT
          a.anchor_id,
          a.asset_pack_id,
          a.btd_range_start,
          a.btd_range_end_exclusive,
          r.range_start,
          r.range_end_exclusive
        FROM public.btd_asset_pack_ledger_anchors a
        LEFT JOIN public.btd_asset_pack_ranges r ON r.asset_pack_id = a.asset_pack_id
        WHERE
          r.asset_pack_id IS NULL
          OR a.btd_range_start <> r.range_start
          OR a.btd_range_end_exclusive <> r.range_end_exclusive
          OR a.source_manifest_root <> r.source_manifest_root
          OR a.proof_root <> r.proof_root
          OR a.access_policy_hash <> r.access_policy_hash
          OR a.commitment_method NOT IN ('taproot', 'op_return', 'standard_output_commitment', 'ethereum_registry_event', 'internal_journal')
          OR a.finality_state NOT IN ('prepared', 'broadcast', 'confirmed', 'reorged', 'failed')
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'anchor_range_drift',
          coalesce(jsonb_agg(to_jsonb(drift) ORDER BY anchor_id), '[]'::jsonb)
        ) AS details
      FROM drift;
    `,
  },
  {
    id: 'terminal.journal-sequences-unique',
    title: 'Terminal journal exchange sequences are unique',
    category: 'terminal',
    severity: 'critical',
    description: 'Confirms Terminal journal entries preserve a deterministic replay order without duplicate exchange_sequence values.',
    remediation: 'Replay or renumber duplicate journal entries from the canonical settlement journal before new writes are admitted.',
    requires: ['public.btd_terminal_journal_entries'],
    sql: `
      WITH duplicates AS (
        SELECT exchange_sequence, count(*) AS row_count
        FROM public.btd_terminal_journal_entries
        GROUP BY exchange_sequence
        HAVING count(*) > 1
      ),
      invalid AS (
        SELECT journal_entry_id, exchange_sequence
        FROM public.btd_terminal_journal_entries
        WHERE exchange_sequence <= 0
          OR nullif(trim(pre_state_root), '') IS NULL
          OR nullif(trim(post_state_root), '') IS NULL
      )
      SELECT
        (SELECT count(*) FROM duplicates) = 0 AND (SELECT count(*) FROM invalid) = 0 AS ok,
        ((SELECT count(*) FROM duplicates) + (SELECT count(*) FROM invalid))::bigint AS observed_count,
        jsonb_build_object(
          'duplicate_sequences', coalesce((SELECT jsonb_agg(to_jsonb(duplicates) ORDER BY exchange_sequence) FROM duplicates), '[]'::jsonb),
          'invalid_journal_entries', coalesce((SELECT jsonb_agg(to_jsonb(invalid) ORDER BY exchange_sequence) FROM invalid), '[]'::jsonb)
        ) AS details;
    `,
  },
  {
    id: 'terminal.asset-pack-mints-have-journal',
    title: 'Minted AssetPacks have Terminal journal entries',
    category: 'terminal',
    severity: 'critical',
    description: 'Ensures every minted AssetPack range can be replayed through a Terminal journal entry at the mint exchange sequence.',
    remediation: 'Replay missing journal entries from settlement receipts before relying on Supabase projections for operator QA.',
    requires: ['public.btd_asset_pack_ranges', 'public.btd_terminal_journal_entries'],
    sql: `
      WITH missing AS (
        SELECT r.asset_pack_id, r.minted_at_exchange_sequence
        FROM public.btd_asset_pack_ranges r
        LEFT JOIN public.btd_terminal_journal_entries j
          ON j.exchange_sequence = r.minted_at_exchange_sequence
          AND j.transaction_kind IN ('asset_pack_mint', 'measure_mint_tail')
        WHERE j.journal_entry_id IS NULL
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'asset_packs_missing_journal',
          coalesce(
            jsonb_agg(
              jsonb_build_object('asset_pack_id', asset_pack_id, 'exchange_sequence', minted_at_exchange_sequence)
              ORDER BY minted_at_exchange_sequence, asset_pack_id
            ),
            '[]'::jsonb
          )
        ) AS details
      FROM missing;
    `,
  },
  {
    id: 'ledger.btc-fees-shaped',
    title: 'BTC fee rows remain noncustodial and finality-shaped',
    category: 'ledger',
    severity: 'critical',
    description: 'Checks fee rows use BTC only, are noncustodial, have positive sats, valid network/finality, and wallet authorization proof.',
    remediation: 'Reject malformed fee rows, replay fee receipts, and require wallet-signed PSBT or transfer proof for future settlement.',
    requires: ['public.btc_fee_transactions'],
    sql: `
      WITH malformed AS (
        SELECT receipt_id, fee_purpose, network, finality_state
        FROM public.btc_fee_transactions
        WHERE
          fee_asset <> 'BTC'
          OR server_custody IS DISTINCT FROM false
          OR sats_paid <= 0
          OR network NOT IN ('regtest', 'signet', 'testnet', 'mainnet')
          OR finality_state NOT IN ('prepared', 'signed', 'broadcast', 'confirmed', 'replaced', 'reorged', 'failed')
          OR wallet_authorization_proof IS NULL
          OR nullif(trim(terminal_journal_root), '') IS NULL
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'malformed_btc_fee_transactions',
          coalesce(jsonb_agg(to_jsonb(malformed) ORDER BY receipt_id), '[]'::jsonb)
        ) AS details
      FROM malformed;
    `,
  },
  {
    id: 'ledger.revenue-conservation',
    title: 'Licensed-read revenue routes conserve BTC sats',
    category: 'ledger',
    severity: 'critical',
    description: 'Checks BTC licensed-read revenue rows conserve gross sats across direct, ancestor, treasury, and dispute holdback routes.',
    remediation: 'Hold settlement and replay revenue route receipts from canonical payment receipts.',
    requires: ['public.btd_licensed_read_revenue_routes'],
    sql: `
      WITH malformed AS (
        SELECT payment_id, asset_pack_id, gross_sats, direct_sats, ancestor_sats, treasury_sats, dispute_holdback_sats
        FROM public.btd_licensed_read_revenue_routes
        WHERE
          price_asset <> 'BTC'
          OR gross_sats <= 0
          OR gross_sats <> direct_sats + ancestor_sats + treasury_sats + dispute_holdback_sats
          OR direct_sats < 0
          OR ancestor_sats < 0
          OR treasury_sats < 0
          OR dispute_holdback_sats < 0
          OR route_state NOT IN ('settled', 'pending', 'failed')
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'malformed_revenue_routes',
          coalesce(jsonb_agg(to_jsonb(malformed) ORDER BY payment_id), '[]'::jsonb)
        ) AS details
      FROM malformed;
    `,
  },
  {
    id: 'ledger.blocking-reconciliation-repairs',
    title: 'No blocking reconciliation repairs remain',
    category: 'ledger',
    severity: 'critical',
    description: 'Any blocking ledger/database reconciliation repair means the Supabase projection is not promotion-safe.',
    remediation: 'Resolve the blocking repair, replay affected facts from the ledgerized journal, and record the post-repair state root.',
    requires: ['public.btd_ledger_database_reconciliation_repairs'],
    sql: `
      WITH blocking AS (
        SELECT repair_id, reconciliation_id, fact_id, repair_kind, issued_at
        FROM public.btd_ledger_database_reconciliation_repairs
        WHERE blocking = true
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'blocking_repairs',
          coalesce(jsonb_agg(to_jsonb(blocking) ORDER BY issued_at DESC), '[]'::jsonb)
        ) AS details
      FROM blocking;
    `,
  },
  {
    id: 'operational.recent-critical-crypto-telemetry',
    title: 'No recent critical crypto telemetry',
    category: 'operational',
    severity: 'warning',
    description: 'Surfaces critical crypto telemetry emitted during the last day for QA and daily operator review.',
    remediation: 'Inspect the critical telemetry subject, associated receipt root, and ledger anchor before continuing QA or promotion.',
    requires: ['public.btd_crypto_telemetry_events'],
    sql: `
      WITH recent AS (
        SELECT event, subject_id, receipt_root, ledger_anchor_id, issued_at
        FROM public.btd_crypto_telemetry_events
        WHERE severity = 'critical'
          AND issued_at >= now() - interval '1 day'
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'recent_critical_crypto_telemetry',
          coalesce(jsonb_agg(to_jsonb(recent) ORDER BY issued_at DESC), '[]'::jsonb)
        ) AS details
      FROM recent;
    `,
  },
  {
    id: 'operational.recent-server-errors',
    title: 'Recent server error logs are visible',
    category: 'operational',
    severity: 'warning',
    description: 'Reports recent application error rows from the Supabase projection so QA can correlate browser, server, and DB behavior.',
    remediation: 'Inspect recent error rows, correlate with Vercel/Sentry logs, and either fix the issue or intentionally defer it with a spec note.',
    requires: ['public.error_logs'],
    sql: `
      WITH recent AS (
        SELECT id, user_id, error_type, error_message, created_at
        FROM public.error_logs
        WHERE created_at >= now() - interval '1 day'
      )
      SELECT
        count(*) = 0 AS ok,
        count(*)::bigint AS observed_count,
        jsonb_build_object(
          'recent_error_logs',
          coalesce(
            jsonb_agg(
              jsonb_build_object(
                'id', id,
                'user_id', user_id,
                'error_type', error_type,
                'error_message', left(error_message, 240),
                'created_at', created_at
              )
              ORDER BY created_at DESC
            ),
            '[]'::jsonb
          )
        ) AS details
      FROM recent;
    `,
  },
];

const SUITE_CATEGORIES: Record<DataHealthSuite, readonly DataHealthCheckDefinition['category'][]> = {
  schema: ['schema'],
  identity: ['identity'],
  terminal: ['terminal'],
  ledger: ['ledger'],
  operational: ['operational'],
  ci: ['schema', 'identity', 'terminal', 'ledger'],
  daily: ['schema', 'identity', 'terminal', 'ledger', 'operational'],
  qa: ['schema', 'identity', 'terminal', 'ledger', 'operational'],
  all: ['schema', 'identity', 'terminal', 'ledger', 'operational'],
};

export function getDataHealthChecksForSuite(suite: DataHealthSuite): DataHealthCheckDefinition[] {
  const categories = new Set(SUITE_CATEGORIES[suite] ?? SUITE_CATEGORIES.all);
  return DATA_HEALTH_CHECKS.filter((check) => categories.has(check.category));
}

export function getRequiredGeneratedTypeTableNames(): string[] {
  return [...CANONICAL_PUBLIC_TABLES];
}
