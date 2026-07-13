import { createHash } from 'node:crypto';

export const INTERFACE_DISCLOSURE_BOUNDARY_SURFACES = [
  'deposit_route',
  'read_route',
  'packs_route',
  'public_api',
  'mcp_api',
  'chatgpt_app',
  'bitcode_chat',
  'public_docs',
  'landing_page',
  'exchange_redirect',
] as const;

export type InterfaceDisclosureBoundarySurface =
  (typeof INTERFACE_DISCLOSURE_BOUNDARY_SURFACES)[number];

export const INTERFACE_DISCLOSURE_BOUNDARY_STAGES = [
  'before-settlement',
  'after-preview',
  'after-quote',
  'after-payment-observation',
  'after-finality',
  'after-btd-rights-transfer',
  'after-repository-delivery',
] as const;

export type InterfaceDisclosureBoundaryStage =
  (typeof INTERFACE_DISCLOSURE_BOUNDARY_STAGES)[number];

export type InterfaceDisclosureSurfaceKind =
  | 'current_product_route'
  | 'machine_interface'
  | 'conversation_interface'
  | 'public_teaching_surface'
  | 'compatibility_redirect';

export interface InterfaceDisclosureSourceSafety {
  sourceSafetyClass: 'source_safe_interface_disclosure_metadata';
  sourceSafeMetadataOnly: true;
  protectedSourceVisible: false;
  protectedSourcePayloadSerialized: false;
  rawProtectedPromptVisible: false;
  rawInterpolatedPromptVisible: false;
  rawProviderResponseVisible: false;
  unpaidAssetPackSourceVisible: false;
  walletPrivateMaterialVisible: false;
  settlementPrivatePayloadVisible: false;
  credentialsSerialized: false;
}

export interface InterfaceDisclosureRouteVocabulary {
  currentProductRoutes: ['/deposits', '/reads', '/packs'];
  compatibilityRedirects: {
    '/exchange': '/packs';
  };
  canonicalTerms: {
    assetPackCommodity: 'AssetPack commodity';
    btdScalarVolumeAndRights: 'BTD scalar volume and rights';
    btcSettlementMoney: 'BTC settlement money';
    proofReadbackAuthority: 'proof readback authority';
  };
  forbiddenCurrentProductLanguage: [
    'Exchange as current product',
    'Terminal as current product authority',
  ];
}

export interface InterfaceDisclosureStagePolicy {
  stage: InterfaceDisclosureBoundaryStage;
  sourceBearingAssetPackVisibleToReader: boolean;
  btdRightsTransferred: boolean;
  btcFinalityRequired: boolean;
  repositoryDeliveryRequiredForSource: boolean;
  visibleFields: string[];
  withheldFields: string[];
}

export interface InterfaceDisclosureBoundaryRow {
  schema: 'bitcode.interface-disclosure-boundary.row';
  rowId: string;
  surface: InterfaceDisclosureBoundarySurface;
  surfaceKind: InterfaceDisclosureSurfaceKind;
  stage: InterfaceDisclosureBoundaryStage;
  routePath: string | null;
  compatibilityRedirectTarget: string | null;
  collapsedStateSummary: string;
  expandedStateSummary: string;
  visibleFields: string[];
  withheldFields: string[];
  sourceBearingAssetPackVisibleToReader: boolean;
  btdRightsTransferred: boolean;
  btcFinalityRequired: boolean;
  repositoryDeliveryRequiredForSource: boolean;
  sourceSafety: InterfaceDisclosureSourceSafety;
  rowRoot: string;
}

export interface InterfaceDisclosureBoundaryStorageRecord {
  schema: 'bitcode.interface-disclosure-boundary.storage-record';
  namespace: 'interfaces/disclosure';
  key:
    | 'routeVocabulary'
    | 'surfaceRows'
    | 'stagePolicies'
    | 'sourceSafety'
    | 'boundarySummary';
  recordKind:
    | 'route_vocabulary'
    | 'surface_stage_rows'
    | 'stage_policies'
    | 'source_safety'
    | 'boundary_summary';
  root: string;
  payload: Record<string, unknown>;
  sourceSafety: InterfaceDisclosureSourceSafety;
}

export interface InterfaceDisclosureBoundary {
  schema: 'bitcode.interface-disclosure-boundary';
  boundaryId: string;
  routeVocabulary: InterfaceDisclosureRouteVocabulary;
  requiredSurfaces: InterfaceDisclosureBoundarySurface[];
  requiredStages: InterfaceDisclosureBoundaryStage[];
  rowCount: number;
  rows: InterfaceDisclosureBoundaryRow[];
  stagePolicies: InterfaceDisclosureStagePolicy[];
  sourceSafety: InterfaceDisclosureSourceSafety;
  storageProjection: InterfaceDisclosureBoundaryStorageRecord[];
  proofRoots: {
    routeVocabularyRoot: string;
    stagePolicyRoot: string;
    rowSetRoot: string;
    storageRoot: string;
    boundaryRoot: string;
  };
}

const SOURCE_SAFETY: InterfaceDisclosureSourceSafety = {
  sourceSafetyClass: 'source_safe_interface_disclosure_metadata',
  sourceSafeMetadataOnly: true,
  protectedSourceVisible: false,
  protectedSourcePayloadSerialized: false,
  rawProtectedPromptVisible: false,
  rawInterpolatedPromptVisible: false,
  rawProviderResponseVisible: false,
  unpaidAssetPackSourceVisible: false,
  walletPrivateMaterialVisible: false,
  settlementPrivatePayloadVisible: false,
  credentialsSerialized: false,
};

const ROUTE_VOCABULARY: InterfaceDisclosureRouteVocabulary = {
  currentProductRoutes: ['/deposits', '/reads', '/packs'],
  compatibilityRedirects: {
    '/exchange': '/packs',
  },
  canonicalTerms: {
    assetPackCommodity: 'AssetPack commodity',
    btdScalarVolumeAndRights: 'BTD scalar volume and rights',
    btcSettlementMoney: 'BTC settlement money',
    proofReadbackAuthority: 'proof readback authority',
  },
  forbiddenCurrentProductLanguage: [
    'Exchange as current product',
    'Terminal as current product authority',
  ],
};

const VISIBLE_BY_STAGE: Record<InterfaceDisclosureBoundaryStage, string[]> = {
  'before-settlement': [
    'source-safe AssetPack measurements',
    'Need measurement summaries',
    'candidate fit ids',
    'proof roots',
    'quote readiness',
  ],
  'after-preview': [
    'source-safe AssetPack measurements',
    'fit quality reasons',
    'proof roots',
    'preview root',
    'withheld source notice',
  ],
  'after-quote': [
    'accepted BTC quote',
    'BTD scalar-volume calculation root',
    'measurement weights',
    'fee split summary',
    'proof roots',
  ],
  'after-payment-observation': [
    'payment observation receipt',
    'observed BTC amount',
    'quote match posture',
    'pending finality state',
    'proof roots',
  ],
  'after-finality': [
    'BTC finality receipt',
    'ledger journal root',
    'database projection root',
    'rights-transfer readiness',
    'proof roots',
  ],
  'after-btd-rights-transfer': [
    'BTD rights-transfer receipt',
    'reader entitlement id',
    'delivery unlock posture',
    'compensation route summary',
    'proof roots',
  ],
  'after-repository-delivery': [
    'repository delivery proof',
    'pull request URL',
    'delivered source-bearing AssetPack contents for entitled reader',
    'repair readback state',
  ],
};

const WITHHELD_BY_STAGE: Record<InterfaceDisclosureBoundaryStage, string[]> = {
  'before-settlement': [
    'protected deposit source',
    'unpaid AssetPack source',
    'raw protected prompts',
    'raw interpolated prompts',
    'raw provider responses',
    'wallet private material',
    'private settlement payloads',
    'credentials',
  ],
  'after-preview': [
    'protected deposit source',
    'unpaid AssetPack source',
    'raw protected prompts',
    'raw interpolated prompts',
    'raw provider responses',
    'wallet private material',
    'private settlement payloads',
    'credentials',
  ],
  'after-quote': [
    'protected deposit source',
    'unpaid AssetPack source',
    'raw protected prompts',
    'raw provider responses',
    'wallet private material',
    'private settlement payloads',
    'credentials',
  ],
  'after-payment-observation': [
    'protected deposit source',
    'unpaid AssetPack source',
    'raw protected prompts',
    'raw provider responses',
    'wallet private material',
    'private settlement payloads',
    'credentials',
  ],
  'after-finality': [
    'protected deposit source',
    'unpaid AssetPack source until BTD rights transfer',
    'raw protected prompts',
    'wallet private material',
    'private settlement payloads',
    'credentials',
  ],
  'after-btd-rights-transfer': [
    'protected deposit source outside purchased AssetPack scope',
    'source-bearing AssetPack contents until repository delivery',
    'raw protected prompts',
    'wallet private material',
    'private settlement payloads',
    'credentials',
  ],
  'after-repository-delivery': [
    'protected deposit source outside purchased AssetPack scope',
    'raw protected prompts',
    'raw provider responses',
    'wallet private material',
    'private settlement payloads',
    'credentials',
  ],
};

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableStringify(value: unknown): string {
  if (typeof value === 'undefined') return 'null';
  if (typeof value === 'bigint') return JSON.stringify(value.toString());
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function rootOf(value: unknown): string {
  return `sha256:${sha256(stableStringify(value))}`;
}

function surfaceKind(surface: InterfaceDisclosureBoundarySurface): InterfaceDisclosureSurfaceKind {
  if (surface === 'deposit_route' || surface === 'read_route' || surface === 'packs_route') {
    return 'current_product_route';
  }
  if (surface === 'public_api' || surface === 'mcp_api') return 'machine_interface';
  if (surface === 'chatgpt_app' || surface === 'bitcode_chat') return 'conversation_interface';
  if (surface === 'public_docs' || surface === 'landing_page') return 'public_teaching_surface';
  return 'compatibility_redirect';
}

function routePath(surface: InterfaceDisclosureBoundarySurface): string | null {
  if (surface === 'deposit_route') return '/deposits';
  if (surface === 'read_route') return '/reads';
  if (surface === 'packs_route') return '/packs';
  if (surface === 'exchange_redirect') return '/exchange';
  return null;
}

function compatibilityRedirectTarget(surface: InterfaceDisclosureBoundarySurface): string | null {
  return surface === 'exchange_redirect' ? '/packs' : null;
}

function stagePolicy(stage: InterfaceDisclosureBoundaryStage): InterfaceDisclosureStagePolicy {
  const sourceBearingAssetPackVisibleToReader = stage === 'after-repository-delivery';
  const btdRightsTransferred =
    stage === 'after-btd-rights-transfer' || stage === 'after-repository-delivery';
  const btcFinalityRequired =
    stage === 'after-finality' ||
    stage === 'after-btd-rights-transfer' ||
    stage === 'after-repository-delivery';

  return {
    stage,
    sourceBearingAssetPackVisibleToReader,
    btdRightsTransferred,
    btcFinalityRequired,
    repositoryDeliveryRequiredForSource: sourceBearingAssetPackVisibleToReader,
    visibleFields: [...VISIBLE_BY_STAGE[stage]],
    withheldFields: [...WITHHELD_BY_STAGE[stage]],
  };
}

function collapsedStateSummary(
  surface: InterfaceDisclosureBoundarySurface,
  stage: InterfaceDisclosureBoundaryStage,
): string {
  const path = routePath(surface);
  const surfaceLabel = path || surface.replace(/_/gu, ' ');
  return `${surfaceLabel} ${stage} shows source-safe status, measurements, proof roots, and settlement posture only.`;
}

function expandedStateSummary(
  surface: InterfaceDisclosureBoundarySurface,
  policy: InterfaceDisclosureStagePolicy,
): string {
  const deliveryClause = policy.sourceBearingAssetPackVisibleToReader
    ? 'Entitled repository delivery may expose the purchased AssetPack source to the reader.'
    : 'Expanded detail remains metadata-only and withholds source-bearing AssetPack contents.';
  return `${collapsedStateSummary(surface, policy.stage)} ${deliveryClause}`;
}

function storageRecord(input: {
  key: InterfaceDisclosureBoundaryStorageRecord['key'];
  recordKind: InterfaceDisclosureBoundaryStorageRecord['recordKind'];
  payload: Record<string, unknown>;
}): InterfaceDisclosureBoundaryStorageRecord {
  return {
    schema: 'bitcode.interface-disclosure-boundary.storage-record',
    namespace: 'interfaces/disclosure',
    key: input.key,
    recordKind: input.recordKind,
    root: rootOf(input.payload),
    payload: input.payload,
    sourceSafety: { ...SOURCE_SAFETY },
  };
}

export function buildInterfaceDisclosureBoundary(): InterfaceDisclosureBoundary {
  const stagePolicies = INTERFACE_DISCLOSURE_BOUNDARY_STAGES.map(stagePolicy);
  const rows = INTERFACE_DISCLOSURE_BOUNDARY_SURFACES.flatMap((surface) =>
    stagePolicies.map((policy) => {
      const rowBase = {
        schema: 'bitcode.interface-disclosure-boundary.row' as const,
        rowId: `interface-disclosure:${surface}:${policy.stage}`,
        surface,
        surfaceKind: surfaceKind(surface),
        stage: policy.stage,
        routePath: routePath(surface),
        compatibilityRedirectTarget: compatibilityRedirectTarget(surface),
        collapsedStateSummary: collapsedStateSummary(surface, policy.stage),
        expandedStateSummary: expandedStateSummary(surface, policy),
        visibleFields: [...policy.visibleFields],
        withheldFields: [...policy.withheldFields],
        sourceBearingAssetPackVisibleToReader: policy.sourceBearingAssetPackVisibleToReader,
        btdRightsTransferred: policy.btdRightsTransferred,
        btcFinalityRequired: policy.btcFinalityRequired,
        repositoryDeliveryRequiredForSource: policy.repositoryDeliveryRequiredForSource,
        sourceSafety: { ...SOURCE_SAFETY },
      };
      return {
        ...rowBase,
        rowRoot: rootOf(rowBase),
      };
    }),
  );
  const routeVocabularyRoot = rootOf(ROUTE_VOCABULARY);
  const stagePolicyRoot = rootOf(stagePolicies);
  const rowSetRoot = rootOf(rows.map((row) => row.rowRoot));
  const initialStorage = [
    storageRecord({
      key: 'routeVocabulary',
      recordKind: 'route_vocabulary',
      payload: ROUTE_VOCABULARY as unknown as Record<string, unknown>,
    }),
    storageRecord({
      key: 'stagePolicies',
      recordKind: 'stage_policies',
      payload: { stages: stagePolicies },
    }),
    storageRecord({
      key: 'surfaceRows',
      recordKind: 'surface_stage_rows',
      payload: {
        rowCount: rows.length,
        rows: rows.map((row) => ({
          rowId: row.rowId,
          surface: row.surface,
          stage: row.stage,
          rowRoot: row.rowRoot,
        })),
      },
    }),
    storageRecord({
      key: 'sourceSafety',
      recordKind: 'source_safety',
      payload: { ...SOURCE_SAFETY },
    }),
  ];
  const storageRoot = rootOf(initialStorage.map((record) => record.root));
  const withoutBoundaryRoot = {
    schema: 'bitcode.interface-disclosure-boundary' as const,
    boundaryId: `interface-disclosure-boundary-${sha256(rowSetRoot).slice(0, 16)}`,
    routeVocabulary: ROUTE_VOCABULARY,
    requiredSurfaces: [...INTERFACE_DISCLOSURE_BOUNDARY_SURFACES],
    requiredStages: [...INTERFACE_DISCLOSURE_BOUNDARY_STAGES],
    rowCount: rows.length,
    rows,
    stagePolicies,
    sourceSafety: { ...SOURCE_SAFETY },
    storageProjection: initialStorage,
    proofRoots: {
      routeVocabularyRoot,
      stagePolicyRoot,
      rowSetRoot,
      storageRoot,
      boundaryRoot: '',
    },
  };
  const boundaryRoot = rootOf(withoutBoundaryRoot);
  const summaryRecord = storageRecord({
    key: 'boundarySummary',
    recordKind: 'boundary_summary',
    payload: {
      boundaryId: withoutBoundaryRoot.boundaryId,
      rowCount: rows.length,
      routeVocabularyRoot,
      stagePolicyRoot,
      rowSetRoot,
      boundaryRoot,
    },
  });
  const storageProjection = [...initialStorage, summaryRecord];
  const finalStorageRoot = rootOf(storageProjection.map((record) => record.root));

  return {
    ...withoutBoundaryRoot,
    storageProjection,
    proofRoots: {
      ...withoutBoundaryRoot.proofRoots,
      storageRoot: finalStorageRoot,
      boundaryRoot: rootOf({
        ...withoutBoundaryRoot,
        storageProjection,
        proofRoots: {
          ...withoutBoundaryRoot.proofRoots,
          storageRoot: finalStorageRoot,
          boundaryRoot,
        },
      }),
    },
  };
}

export function summarizeInterfaceDisclosureBoundary(
  boundary: InterfaceDisclosureBoundary,
): string {
  return [
    `${boundary.rowCount} interface disclosure rows`,
    boundary.routeVocabulary.currentProductRoutes.join(', '),
    'AssetPack commodity',
    'BTD scalar volume and rights',
    'BTC settlement money',
    'proof readback authority',
  ].join(' | ');
}

export function assertInterfaceDisclosureBoundarySourceSafe(
  boundary: InterfaceDisclosureBoundary,
): void {
  const expectedRowCount =
    INTERFACE_DISCLOSURE_BOUNDARY_SURFACES.length *
    INTERFACE_DISCLOSURE_BOUNDARY_STAGES.length;
  if (boundary.rowCount !== expectedRowCount) {
    throw new Error(`Expected ${expectedRowCount} disclosure rows, received ${boundary.rowCount}.`);
  }
  for (const row of boundary.rows) {
    if (row.sourceSafety.protectedSourceVisible) {
      throw new Error(`Protected source is visible for ${row.rowId}.`);
    }
    if (row.sourceSafety.unpaidAssetPackSourceVisible) {
      throw new Error(`Unpaid AssetPack source is visible for ${row.rowId}.`);
    }
    if (
      row.stage !== 'after-repository-delivery' &&
      row.sourceBearingAssetPackVisibleToReader
    ) {
      throw new Error(`Source-bearing AssetPack visibility is early for ${row.rowId}.`);
    }
    if (
      row.stage === 'after-repository-delivery' &&
      (!row.btdRightsTransferred || !row.btcFinalityRequired || !row.repositoryDeliveryRequiredForSource)
    ) {
      throw new Error(`Repository delivery row lacks rights, finality, or delivery proof for ${row.rowId}.`);
    }
  }
}

export function persistInterfaceDisclosureBoundary(
  execution: { store?: (namespace: string, key: string, value: unknown) => void } | null | undefined,
  boundary: InterfaceDisclosureBoundary,
): void {
  if (!execution || typeof execution.store !== 'function') return;
  execution.store('interfaces/disclosure', 'boundary', boundary as unknown);
  execution.store('interfaces/disclosure', 'rows', boundary.rows as unknown);
  execution.store('interfaces/disclosure', 'routeVocabulary', boundary.routeVocabulary as unknown);
  execution.store('interfaces/disclosure', 'proofRoots', boundary.proofRoots as unknown);
  execution.store('interfaces/disclosure', 'sourceSafety', boundary.sourceSafety as unknown);
}
