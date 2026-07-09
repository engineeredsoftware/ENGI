export type EdgetimesOwnershipBand = {
  title: string;
  detail: string;
  owners: readonly string[];
};

export type EdgetimesModelGroup = {
  title: string;
  detail: string;
  models: readonly string[];
};

export const EDGETIMES_TOPOLOGY = {
  eyebrow: 'Bitcode edgetimes',
  heading: 'Converge storage, schema, and retained package ownership.',
  body:
    'Edgetimes is the storage and API read for PostgreSQL/Supabase, typed ORM/query ownership, generated database types, and the retained packages that still carry Bitcode state upward into Terminal, Exchange, and Auxillaries.',
  baselineMigration: {
    label: 'Schema baseline',
    path: 'supabase/migrations/001_v26_production.sql',
    detail:
      'The first explicit V26 persistence baseline is still the retained V26 production migration. Fourth-gate must prove drift, follow-on ownership, and generated types from this source instead of hand-waving schema truth across packages.',
  },
  ownershipBands: [
    {
      title: 'Typed clients and SSR ownership',
      detail:
        'These owners create the browser, admin, and SSR Supabase clients that every retained storage/API carrier still depends on.',
      owners: [
        'packages/supabase/src/index.ts',
        'packages/supabase/src/client.ts',
        'packages/supabase/src/ssr/client.ts',
        'packages/supabase/src/ssr/server.ts',
        'packages/supabase/src/ssr/middleware.ts',
      ],
    },
    {
      title: 'Schema, generated types, and typed query layer',
      detail:
        'Fourth-gate must keep schema truth, generated database types, and ORM/query ownership synchronized instead of letting routes bypass the typed layer.',
      owners: [
        'supabase/migrations/001_v26_production.sql',
        'packages/orm/src/types/database.generated.ts',
        'packages/orm/src/types/database.ts',
        'packages/orm/src/client.ts',
        'packages/orm/src/models/*',
        'packages/orm/src/queries/*',
        'packages/orm/scripts/generate-db-types.ts',
      ],
    },
    {
      title: 'Terminal and API carriers',
      detail:
        'These route owners expose the retained storage system upward into Bitcode and should converge on one explicit storage/API posture instead of ad-hoc access patterns.',
      owners: [
        'uapi/app/edgetimes/page.tsx',
        'uapi/app/api/edgetimes/route.ts',
        'uapi/app/api/conversations/*',
        'uapi/app/api/executions/history*',
        'uapi/app/terminal/*',
        'uapi/app/conversations/*',
      ],
    },
    {
      title: 'Retained package admissions',
      detail:
        'These packages stay in V26 only because fourth-gate now names their role directly and fifth-gate will assign proof obligations to them.',
      owners: [
        '@bitcode/supabase',
        '@bitcode/orm',
        '@bitcode/prompts',
        '@bitcode/conversations-generics',
        '@bitcode/execution-generics',
      ],
    },
  ] as const satisfies readonly EdgetimesOwnershipBand[],
  modelGroups: [
    {
      title: 'Identity and BTD balances',
      detail: 'User identity, profile, BTD balance, and preference posture already exposed through typed models.',
      models: [
        'UserProfilesModel',
        'UserConnectionsModel',
        'UserModelPreferencesModel',
        'UserBtdBalancesModel',
        'UserBtdTransactionsModel',
      ],
    },
    {
      title: 'Conversations and messages',
      detail: 'Retained conversation state already has typed models and is ready to be converged inward as a fullscreen Bitcode mode.',
      models: [
        'ConversationsModel',
        'MessagesModel',
        'MessageAttachmentsModel',
        'NotificationsModel',
      ],
    },
    {
      title: 'Executions, runs, and AssetPacks',
      detail: 'Execution and AssetPack state is partially typed already, but fifth-gate still has to finish the run/pipeline meaning system.',
      models: [
        'AssetPackEvidenceModel',
        'PipelineExecutionsModel',
        'ExecutionEventsModel',
        'PhaseExecutionsModel',
        'PipelineRun',
      ],
    },
    {
      title: 'Artifacts and repository context',
      detail: 'Repository, generated AssetPack assets, token-cost, and vector ownership anchor source-bearing Bitcode state without generic storage tables.',
      models: [
        'VCSRepositoryModel',
        'AssetPackGeneratedAssetsModel',
        'BitcodeTokenCostsModel',
        'AssetPackVectorsModel',
      ],
    },
  ] as const satisfies readonly EdgetimesModelGroup[],
  unresolvedTables: [
    'asset_pack_vectors',
    'asset_pack_phase_executions',
    'run_jobs',
    'stream_logs',
    'generated_assets',
    'events',
    'error_logs',
    'token_costs',
  ] as const,
  nextObligations: [
    'Prove generated database types directly against the retained V26 migration baseline.',
    'Make `/edgetimes` the explicit route/API witness for storage ownership instead of leaving persistence topology implicit in package READMEs.',
    'Converge conversations and execution inspection onto one retained Bitcode storage posture before fifth-gate proof closure.',
    'Assign explicit proof-family obligations to retained packages instead of relying on package survival by inertia.',
  ] as const,
} as const;

export function getEdgetimesTopologySummary() {
  return {
    ownershipBands: EDGETIMES_TOPOLOGY.ownershipBands.length,
    admittedPackages: EDGETIMES_TOPOLOGY.ownershipBands[3]?.owners.length ?? 0,
    modelGroups: EDGETIMES_TOPOLOGY.modelGroups.length,
    unresolvedTables: EDGETIMES_TOPOLOGY.unresolvedTables.length,
  };
}
