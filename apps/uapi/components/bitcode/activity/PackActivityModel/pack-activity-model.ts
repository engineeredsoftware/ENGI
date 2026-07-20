import type {
  BitcodeActivityRecord,
  BitcodeActivityScope,
} from '@/components/bitcode/activity/BitcodeActivityModel/bitcode-activity-model';
import {
  assertAssetPackCommodityStateProjection,
  buildAssetPackCommodityStateProjection,
  projectAssetPackCommodityStateForPayload,
  toSourceSafeAssetPackCommodityStateDisplay,
  type AssetPackCommodityStateDisplay,
} from '@bitcode/asset-packs-pipelines-domain/asset-pack-commodity-state';
import { descriptorForAbsoluteKind } from '@/components/packs/models/packs-measurement-descriptors';

export type PackActivityType =
  | 'deposit-option'
  | 'depository-assetpack'
  | 'read-need-fit-preview'
  | 'settled-assetpack'
  | 'settlement'
  | 'compensation'
  | 'delivery'
  | 'repair'
  | 'execution'
  | 'notification';

export type PackActivitySortKey =
  | 'timestamp'
  | 'title'
  | 'value'
  | 'settlementState'
  | 'compensationState'
  | 'deliveryState'
  | 'repairState';

export type PackActivitySortDirection = 'asc' | 'desc';

export interface PackActivityMeasurement {
  id: string;
  label: string;
  value: number | string;
  unit: string | null;
  root: string | null;
  /** Buyer-facing source-safe descriptor paragraph (optional). */
  descriptor?: string | null;
  /** Absolute / neediness kind id when known. */
  kind?: string | null;
  weight?: number | null;
  volume?: number | null;
}

export interface PackActivityValue {
  id: string;
  label: string;
  amount: number | string;
  unit: string;
}

export interface PackActivityProofRoot {
  id: string;
  label: string;
  root: string;
}

export interface PackActivitySourceSafety {
  sourceSafeMetadataOnly: true;
  protectedSourceVisible: false;
  unpaidAssetPackSourceVisible: false;
  rawPromptVisible: false;
  interpolatedPromptVisible: false;
  rawProviderResponseVisible: false;
  sourceSnippetVisible: false;
}

export interface PackActivityAccountingReadback {
  state: string | null;
  btdRangeState: string | null;
  btcSettlementState: string | null;
  compensationState: string | null;
  reconciliationState: string | null;
  treasuryRouteState: string | null;
  contributorCount: number;
  depositorCount: number;
  finalSettlementSats: number;
  allocatedContributorSats: number;
  statementRoot: string | null;
}

export interface PackActivityGovernanceReadback {
  state: string | null;
  route: string | null;
  walletState: string | null;
  spendState: string | null;
  depositState: string | null;
  requiredDeniedActionCount: number;
  blockerCount: number;
  authorityRoot: string | null;
}

export interface PackActivityRecord {
  id: string;
  type: PackActivityType;
  scope: BitcodeActivityScope;
  title: string;
  description: string;
  timestamp: string | null;
  state: string | null;
  repository: string | null;
  assetPackTitle: string | null;
  /**
   * AssetPack product kind (capability-slice | implementation-pattern |
   * proof-operations-slice) — not activity taxonomy.
   */
  assetPackKind: string | null;
  /** Unsettled absolute-derived BTD estimate (honesty class: estimate). */
  estimatedBtd: number | null;
  estimatedBtdCells: number | null;
  settlementState: string | null;
  rightsState: string | null;
  compensationState: string | null;
  deliveryState: string | null;
  /** Live or projected PR URL / delivery reference for settled rows (source-safe). */
  deliveryReference: string | null;
  repairState: string | null;
  measurements: PackActivityMeasurement[];
  values: PackActivityValue[];
  proofRoots: PackActivityProofRoot[];
  commodityState: AssetPackCommodityStateDisplay;
  accounting: PackActivityAccountingReadback | null;
  governance: PackActivityGovernanceReadback | null;
  sourceSafety: PackActivitySourceSafety;
  metadata: Record<string, unknown>;
}

/**
 * Type filter includes real PackActivityType values plus synthetic ownership
 * lenses used by /packs "My AssetPacks" (and its read/deposit subtypes).
 */
export type PackActivityTypeFilter =
  | PackActivityType
  | 'all'
  | 'my-assetpacks'
  | 'my-read-bought'
  | 'my-deposited-unsettled'
  | 'my-deposited-settled'
  | 'needs-payout-review';

export interface PackActivityFilters {
  type?: PackActivityTypeFilter;
  scope?: BitcodeActivityScope | 'all';
  state?: string | 'all';
  settlementState?: string | 'all';
  compensationState?: string | 'all';
  deliveryState?: string | 'all';
  repairState?: string | 'all';
  repository?: string | 'all';
}

export interface PackActivityQuery {
  search?: string | null;
  filters?: PackActivityFilters;
  sort?: {
    key?: PackActivitySortKey;
    direction?: PackActivitySortDirection;
  };
}

export interface PackActivityDetailProjection {
  id: string;
  type: PackActivityType;
  title: string;
  description: string;
  timestamp: string | null;
  sourceSafety: PackActivitySourceSafety;
  overview: {
    state: string | null;
    scope: BitcodeActivityScope;
    repository: string | null;
    assetPackTitle: string | null;
    assetPackKind: string | null;
    estimatedBtd: number | null;
    estimatedBtdCells: number | null;
  };
  measurements: PackActivityMeasurement[];
  values: PackActivityValue[];
  proofRoots: PackActivityProofRoot[];
  commodityState: AssetPackCommodityStateDisplay;
  accounting: PackActivityAccountingReadback | null;
  governance: PackActivityGovernanceReadback | null;
  states: {
    settlement: string | null;
    rights: string | null;
    compensation: string | null;
    delivery: string | null;
    repair: string | null;
  };
  /** Live or projected PR URL for settled AssetPack delivery (source-safe). */
  deliveryReference: string | null;
  assetPackKind: string | null;
  estimatedBtd: number | null;
  estimatedBtdCells: number | null;
  telemetry: {
    sourceEventId: string;
    sourceKind: string | null;
    sourceChannel: string | null;
  };
  metadata: Record<string, unknown>;
}

export interface PackActivitySummary {
  total: number;
  types: Record<PackActivityType, number>;
  states: Record<string, number>;
  repositories: string[];
  settlementReady: number;
  compensationReady: number;
  deliveryReady: number;
  repairOpen: number;
}

export type PackMarketSignalKind =
  | 'demand'
  | 'supply'
  | 'unfit-need'
  | 'settlement'
  | 'compensation'
  | 'delivery'
  | 'repair';

export interface PackSavedFilterPreset {
  id: string;
  label: string;
  description: string;
  query: Record<string, string>;
  signalKind: PackMarketSignalKind | 'portfolio';
}

export interface PackPortfolioPositionProjection {
  id: string;
  organizationView: string;
  repository: string;
  assetPackTitle: string;
  state: string;
  activityCount: number;
  lastActivityAt: string | null;
  valueTotalSats: number;
  btdEstimate: number;
  proofRootCount: number;
  demandSignalCount: number;
  supplySignalCount: number;
  unfitNeedSignalCount: number;
  settlementState: string | null;
  compensationState: string | null;
  deliveryState: string | null;
  repairState: string | null;
  sourceSafety: PackActivitySourceSafety;
}

export interface PackMarketSignalProjection {
  id: string;
  kind: PackMarketSignalKind;
  label: string;
  description: string;
  strength: number;
  state: string;
  repository: string | null;
  relatedRecordIds: string[];
  proofRoots: PackActivityProofRoot[];
  sourceSafety: PackActivitySourceSafety;
}

export interface PackPortfolioFacetSummary {
  settlement: Record<string, number>;
  compensation: Record<string, number>;
  delivery: Record<string, number>;
  repair: Record<string, number>;
}

export interface PackPortfolioMarketIntelligence {
  positions: PackPortfolioPositionProjection[];
  signals: PackMarketSignalProjection[];
  savedFilters: PackSavedFilterPreset[];
  facets: PackPortfolioFacetSummary;
  sourceSafety: PackActivitySourceSafety;
}

const SOURCE_SAFETY: PackActivitySourceSafety = {
  sourceSafeMetadataOnly: true,
  protectedSourceVisible: false,
  unpaidAssetPackSourceVisible: false,
  rawPromptVisible: false,
  interpolatedPromptVisible: false,
  rawProviderResponseVisible: false,
  sourceSnippetVisible: false,
};

const PACK_ACTIVITY_TYPES: PackActivityType[] = [
  'deposit-option',
  'depository-assetpack',
  'read-need-fit-preview',
  'settled-assetpack',
  'settlement',
  'compensation',
  'delivery',
  'repair',
  'execution',
  'notification',
];

const SOURCE_BEARING_KEY_PATTERN =
  /(^|_|\b)(protectedsource|unpaidassetpacksource|sourcesnippet|sourcecode|sourcetext|sourcepayload|rawprompt|interpolatedprompt|rawresponse|providerresponse|rawproviderresponse|credential|secret|privatekey|walletprivate|filecontents|patch|diff|codebody)($|_|\b)/iu;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(source: unknown, ...keys: string[]) {
  const record = asRecord(source);
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return null;
}

function findFirstString(source: unknown, keys: string[], depth = 0): string | null {
  if (depth > 7 || source === null || source === undefined) return null;
  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findFirstString(item, keys, depth + 1);
      if (found) return found;
    }
    return null;
  }

  const record = asRecord(source);
  for (const key of keys) {
    const direct = readString(record, key);
    if (direct) return direct;
  }

  for (const value of Object.values(record)) {
    const found = findFirstString(value, keys, depth + 1);
    if (found) return found;
  }
  return null;
}

function findFirstNumber(source: unknown, keys: string[], depth = 0): number | null {
  if (depth > 7 || source === null || source === undefined) return null;
  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findFirstNumber(item, keys, depth + 1);
      if (found !== null) return found;
    }
    return null;
  }

  const record = asRecord(source);
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }

  for (const value of Object.values(record)) {
    const found = findFirstNumber(value, keys, depth + 1);
    if (found !== null) return found;
  }
  return null;
}

function findFirstRecord(
  source: unknown,
  predicate: (record: Record<string, unknown>) => boolean,
  depth = 0,
): Record<string, unknown> | null {
  if (depth > 7 || source === null || source === undefined) return null;
  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findFirstRecord(item, predicate, depth + 1);
      if (found) return found;
    }
    return null;
  }

  const record = asRecord(source);
  if (Object.keys(record).length > 0 && predicate(record)) return record;
  for (const value of Object.values(record)) {
    const found = findFirstRecord(value, predicate, depth + 1);
    if (found) return found;
  }
  return null;
}

function normalizeLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/gu, '$1 $2')
    .replace(/[-_]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .replace(/^./u, (char) => char.toUpperCase());
}

function compareText(left: string | null | undefined, right: string | null | undefined) {
  const a = String(left || '');
  const b = String(right || '');
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function includesAny(text: string, tokens: string[]) {
  return tokens.some((token) => text.includes(token));
}

function inferPackActivityType(record: BitcodeActivityRecord): PackActivityType {
  const payload = asRecord(record.payload);
  // Explicit packActivityType / activityType (settle + depository writers set these).
  const explicitType = findFirstString(payload, [
    'packActivityType',
    'activityType',
    'pack_activity_type',
  ]);
  if (explicitType) {
    const normalized = explicitType.toLowerCase().replace(/_/g, '-');
    if (PACK_ACTIVITY_TYPES.includes(normalized as PackActivityType)) {
      return normalized as PackActivityType;
    }
  }
  const source = findFirstString(payload, ['source']);
  if (source === 'read-settle-asset-pack') return 'settled-assetpack';
  if (source === 'deposit-option-review-admission') return 'depository-assetpack';

  const haystack = [
    record.kind,
    record.title,
    record.summary,
    record.state,
    readString(payload, 'type', 'status', 'kind', 'eventType'),
    findFirstString(payload, ['canonicalType', 'family', 'label', 'reviewStage', 'productPipeline']),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    includesAny(haystack, [
      'depository assetpack',
      'depository asset pack',
      'deposit admission',
      'deposit-option-admission',
      'admitted to the depository',
    ])
  ) {
    return 'depository-assetpack';
  }
  if (includesAny(haystack, ['deposit option', 'deposit-option', 'option synthesis'])) return 'deposit-option';
  if (includesAny(haystack, ['finding fits', 'fits finding', 'read-fits', 'fit preview', 'assetpack preview'])) return 'read-need-fit-preview';
  if (
    includesAny(haystack, [
      'settled assetpack',
      'settled asset pack',
      'settled assetpack option',
      'settle-asset-pack-pipeline',
      'settle asset packs',
      'rights transfer',
    ])
  ) {
    return 'settled-assetpack';
  }
  // "Settled N AssetPack option(s)" — word-gap form from settle summary.
  if (/\bsettled\b/u.test(haystack) && /\basset\s*pack/u.test(haystack)) {
    return 'settled-assetpack';
  }
  if (includesAny(haystack, ['settlement', 'btc', 'finality'])) return 'settlement';
  if (includesAny(haystack, ['compensation', 'source-to-shares', 'shares allocation'])) return 'compensation';
  if (includesAny(haystack, ['delivery', 'pull request', 'pr delivery', 'repository delivery'])) return 'delivery';
  if (includesAny(haystack, ['repair', 'reconcile', 'reconciliation'])) return 'repair';
  return record.kind === 'notification' ? 'notification' : 'execution';
}

function inferRepository(record: BitcodeActivityRecord) {
  const payload = asRecord(record.payload);
  const snapshot = asRecord(payload.repo_snapshot ?? payload.repoSnapshot ?? payload.repositorySnapshot);
  const org = readString(snapshot, 'org', 'owner', 'organization');
  const repo = readString(snapshot, 'repo', 'name');
  if (org && repo) return `${org}/${repo}`;

  return (
    findFirstString(payload, [
      'repositoryFullName',
      'repositoryAnchor',
      'repository',
      'repoFullName',
      'repo',
    ]) || null
  );
}

function inferAssetPackTitle(record: BitcodeActivityRecord) {
  return (
    findFirstString(record.payload, [
      'assetPackTitle',
      'asset_pack_title',
      'packTitle',
      'title',
      'summary',
    ]) || (record.kind === 'notification' ? record.title : null)
  );
}

/**
 * Project nested AssetPack measurement kinds (absolutes + needinesses *-fit)
 * into flat source-safe PackActivity measurement rows.
 */
function collectNestedKindMeasurements(
  source: unknown,
  measurements: PackActivityMeasurement[],
  seen = new Set<string>(),
  depth = 0,
) {
  if (depth > 8 || source === null || source === undefined) return;
  if (Array.isArray(source)) {
    for (const item of source) collectNestedKindMeasurements(item, measurements, seen, depth + 1);
    return;
  }
  const record = asRecord(source);
  // Settled packActivity.measurements[] rows: { kind, category, volume, magnitude }
  // Prefer magnitude+unit for absolute size properties (functions/files/types);
  // fall back to volume (0..1 weighted component) when magnitude absent.
  if (typeof record.kind === 'string' && (record.category === 'absolute' || record.category === 'neediness')) {
    const kind = record.kind;
    const id = `${record.category}:${kind}`;
    if (!seen.has(id)) {
      seen.add(id);
      const magnitude = typeof record.magnitude === 'number' ? record.magnitude : null;
      const volume = typeof record.volume === 'number' ? record.volume : null;
      const value =
        record.category === 'absolute' && magnitude !== null
          ? magnitude
          : volume !== null
            ? volume
            : magnitude;
      if (value !== null) {
        const catalog = descriptorForAbsoluteKind(kind);
        const explicitDescriptor =
          typeof record.descriptor === 'string' && record.descriptor.trim()
            ? record.descriptor.trim()
            : null;
        measurements.push({
          id,
          label: typeof record.label === 'string' && record.label.trim()
            ? record.label.trim()
            : catalog?.label || normalizeLabel(kind),
          value,
          unit:
            typeof record.unit === 'string'
              ? record.unit
              : record.category === 'neediness'
                ? 'fit'
                : catalog?.unit || null,
          root: null,
          kind,
          weight: typeof record.weight === 'number' ? record.weight : null,
          volume,
          descriptor: explicitDescriptor || catalog?.descriptor || null,
        });
      }
    }
  }
  // Nested shape measurements: { absolutes: [...], needinesses: [...] }
  const absolutes = Array.isArray(record.absolutes) ? record.absolutes : [];
  for (const raw of absolutes) {
    if (!raw || typeof raw !== 'object') continue;
    const a = raw as Record<string, unknown>;
    const kind = typeof a.kind === 'string' ? a.kind : typeof a.id === 'string' ? a.id : null;
    if (!kind) continue;
    const id = `absolute:${kind}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const magnitude = typeof a.magnitude === 'number' ? a.magnitude : null;
    const volume = typeof a.volume === 'number' ? a.volume : null;
    const value = magnitude !== null ? magnitude : volume;
    if (value === null) continue;
    const catalog = descriptorForAbsoluteKind(kind);
    const explicitDescriptor =
      typeof a.descriptor === 'string' && a.descriptor.trim() ? a.descriptor.trim() : null;
    measurements.push({
      id,
      label: typeof a.label === 'string' && a.label.trim() ? a.label.trim() : catalog?.label || normalizeLabel(kind),
      value,
      unit: typeof a.unit === 'string' ? a.unit : catalog?.unit || null,
      root: null,
      kind,
      weight: typeof a.weight === 'number' ? a.weight : null,
      volume,
      descriptor: explicitDescriptor || catalog?.descriptor || null,
    });
  }
  const needinesses = Array.isArray(record.needinesses) ? record.needinesses : [];
  for (const raw of needinesses) {
    if (!raw || typeof raw !== 'object') continue;
    const n = raw as Record<string, unknown>;
    const kind = typeof n.kind === 'string' ? n.kind : typeof n.id === 'string' ? n.id : null;
    if (!kind) continue;
    const id = `neediness:${kind}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const value = typeof n.volume === 'number' ? n.volume : null;
    if (value === null) continue;
    measurements.push({
      id,
      label: normalizeLabel(kind),
      value,
      unit: typeof n.unit === 'string' ? n.unit : 'fit',
      root: null,
    });
  }
  for (const value of Object.values(record)) {
    if (value && typeof value === 'object') {
      collectNestedKindMeasurements(value, measurements, seen, depth + 1);
    }
  }
}

function buildMeasurements(record: BitcodeActivityRecord): PackActivityMeasurement[] {
  const payload = asRecord(record.payload);
  const packType = inferPackActivityType(record);
  const isDepositedOrSettledPack =
    packType === 'depository-assetpack' || packType === 'settled-assetpack';
  const measurements: PackActivityMeasurement[] = [];

  // Absolute / neediness kind rows first (commercial material properties).
  collectNestedKindMeasurements(payload, measurements);

  // Session-aggregate counters are NOT pack measurements. A deposited AssetPack
  // is one pack; "candidate count" / "admitted count" describe a synthesis
  // session and must not appear on /packs detail for depository rows.
  if (!isDepositedOrSettledPack) {
    const sessionCandidates: Array<[string, string[], string | null]> = [
      ['measured-btd', ['measuredBtd', 'measured_btd', 'btdVolume', 'weightedRequestedVolume'], 'BTD'],
      ['token-total', ['total_tokens', 'tokenTotal', 'totalTokens'], 'tokens'],
      ['duration', ['duration_ms', 'durationMs', 'runtimeMs'], 'ms'],
      ['cost', ['total_cost', 'totalCost'], 'USD'],
      ['candidate-count', ['candidateCount', 'fitCandidateCount', 'targetKindCount', 'optionCount'], 'count'],
      ['admitted-count', ['admittedCount'], 'count'],
      ['closure-criteria', ['closureCriteriaCount', 'closureCount'], 'count'],
    ];
    for (const [id, keys, unit] of sessionCandidates) {
      const value = findFirstNumber(payload, keys);
      if (value !== null) {
        measurements.push({ id, label: normalizeLabel(id), value, unit, root: null });
      }
    }
  } else {
    // Commercial value scalar only when present (not session counts).
    const measuredBtd = findFirstNumber(payload, [
      'measuredBtd',
      'measured_btd',
      'btdVolume',
      'weightedRequestedVolume',
    ]);
    if (measuredBtd !== null) {
      measurements.push({
        id: 'measured-btd',
        label: normalizeLabel('measured-btd'),
        value: measuredBtd,
        unit: 'BTD',
        root: null,
      });
    }
  }

  // Prefer absolute:* rows at the front for table chips (deposit catalog order).
  const absolutes = measurements.filter((m) => m.id.startsWith('absolute:'));
  const rest = measurements.filter((m) => !m.id.startsWith('absolute:'));
  const ordered = [...absolutes, ...rest];

  // Measurement *root proofs* live in proofRoots — never as a measurement chip
  // labeled "Measurement root" on a deposited pack (confuses with catalog).
  if (!isDepositedOrSettledPack) {
    const measurementRoot = findFirstString(payload, [
      'measurementRoot',
      'depositMeasurementRoot',
      'assetPackMeasurementRoot',
      'readNeedMeasurementRoot',
    ]);
    if (measurementRoot) {
      ordered.push({
        id: 'measurement-root',
        label: 'Measurement root',
        value: measurementRoot,
        unit: null,
        root: measurementRoot,
      });
    }
  }

  return ordered;
}

function buildValues(record: BitcodeActivityRecord): PackActivityValue[] {
  const payload = asRecord(record.payload);
  const values: PackActivityValue[] = [];
  const packType = inferPackActivityType(record);

  // Unsettled depository packs: absolute-derived BTD estimate is the commercial value.
  if (packType === 'depository-assetpack') {
    const estimatedBtd = findFirstNumber(payload, [
      'estimatedBtd',
      'estimated_btd',
      'estimatedKnowledgeVolume',
    ]);
    const estimatedBtdCells = findFirstNumber(payload, [
      'estimatedBtdCells',
      'estimated_btd_cells',
    ]);
    if (estimatedBtd !== null) {
      values.push({
        id: 'estimated-btd',
        label: 'BTD (est.)',
        amount: estimatedBtd,
        unit: 'BTD (est.)',
      });
    } else if (estimatedBtdCells !== null) {
      values.push({
        id: 'estimated-btd-cells',
        label: 'BTD (est.)',
        amount: estimatedBtdCells,
        unit: 'BTD cells (est.)',
      });
    }
  }

  const candidates: Array<[string, string[], string]> = [
    ['btc-fee', ['btcFee', 'btc_fee', 'btcFeeSats', 'feeSats'], 'sats'],
    ['usd-equivalent', ['btcFeeUsdEquivalent', 'usdEquivalent', 'total_cost'], 'USD'],
    ['btd-potential', ['btdPotential', 'estimatedBtdPotential', 'measuredBtd'], 'BTD'],
    ['settlement-price', ['settlementPrice', 'quoteAmount', 'amountSats'], 'sats'],
  ];

  for (const [id, keys, unit] of candidates) {
    if (values.some((v) => v.id === id || v.id.startsWith('estimated-btd'))) {
      // Prefer estimated-btd for depository rows over measuredBtd fallbacks.
      if (packType === 'depository-assetpack' && (id === 'btd-potential' || id === 'btc-fee')) {
        continue;
      }
    }
    const value = findFirstNumber(payload, keys);
    if (value !== null) values.push({ id, label: normalizeLabel(id), amount: value, unit });
  }

  return values;
}

function inferAssetPackKind(record: BitcodeActivityRecord): string | null {
  return (
    findFirstString(record.payload, [
      'assetPackKind',
      'optionKind',
      'kind',
      'depositOptionKind',
    ]) || null
  );
}

function inferEstimatedBtd(record: BitcodeActivityRecord): {
  estimatedBtd: number | null;
  estimatedBtdCells: number | null;
} {
  const payload = asRecord(record.payload);
  return {
    estimatedBtd: findFirstNumber(payload, [
      'estimatedBtd',
      'estimated_btd',
      'estimatedKnowledgeVolume',
    ]),
    estimatedBtdCells: findFirstNumber(payload, [
      'estimatedBtdCells',
      'estimated_btd_cells',
    ]),
  };
}

function buildAccountingReadback(record: BitcodeActivityRecord): PackActivityAccountingReadback | null {
  const payload = asRecord(record.payload);
  const statements = findFirstRecord(
    payload,
    (candidate) =>
      candidate.schema === 'bitcode.asset-pack.btd-btc-compensation-statements' ||
      candidate.statements === 'BtdBtcCompensationStatements',
  );
  const aggregate = asRecord(statements?.aggregate);
  const btdRange = asRecord(statements?.btdRange);
  const btcSettlement = asRecord(statements?.btcSettlement);
  const reconciliation = asRecord(statements?.reconciliation);
  const firstTreasuryRoute = findFirstRecord(
    statements?.treasuryRoutes,
    (candidate) => candidate.schema === 'bitcode.asset-pack.treasury-route-statement',
  );
  const roots = asRecord(statements?.roots);
  const hasAccounting =
    Boolean(statements) ||
    Boolean(readString(payload, 'accountingState', 'btdBtcAccountingState')) ||
    Boolean(findFirstString(payload, ['accountingRoot', 'btdBtcAccountingRoot']));

  if (!hasAccounting) return null;

  return {
    state: readString(statements, 'state') || readString(payload, 'accountingState', 'btdBtcAccountingState'),
    btdRangeState: readString(btdRange, 'rangeState'),
    btcSettlementState: readString(btcSettlement, 'state'),
    compensationState: readString(payload, 'compensationState', 'compensation_state', 'sourceToSharesState'),
    reconciliationState: readString(reconciliation, 'state') || readString(payload, 'reconciliationState'),
    treasuryRouteState: readString(firstTreasuryRoute, 'routeState'),
    contributorCount: findFirstNumber(aggregate, ['contributorCount']) || 0,
    depositorCount: findFirstNumber(aggregate, ['depositorCount']) || 0,
    finalSettlementSats: findFirstNumber(aggregate, ['finalSettlementSats']) || 0,
    allocatedContributorSats: findFirstNumber(aggregate, ['allocatedContributorSats']) || 0,
    statementRoot:
      readString(roots, 'accountingRoot') ||
      findFirstString(payload, ['accountingRoot', 'btdBtcAccountingRoot', 'packEconomicStatementRoot']),
  };
}

function buildGovernanceReadback(record: BitcodeActivityRecord): PackActivityGovernanceReadback | null {
  const payload = asRecord(record.payload);
  const statement = findFirstRecord(
    payload,
    (candidate) =>
      candidate.schema === 'bitcode.organization.policy-wallet-authority' ||
      candidate.statement === 'OrganizationPolicyWalletAuthority',
  );
  const aggregate = asRecord(statement?.aggregate);
  const walletAuthority = asRecord(statement?.walletAuthority);
  const budgetApproval = asRecord(statement?.budgetApproval);
  const depositApproval = asRecord(statement?.depositApproval);
  const roots = asRecord(statement?.roots);
  const hasGovernance =
    Boolean(statement) ||
    Boolean(readString(payload, 'organizationAuthorityState', 'governanceState')) ||
    Boolean(findFirstString(payload, ['organizationAuthorityRoot', 'governanceAuthorityRoot']));

  if (!hasGovernance) return null;

  return {
    state: readString(aggregate, 'state') || readString(payload, 'organizationAuthorityState', 'governanceState'),
    route: readString(statement, 'route') || readString(payload, 'governanceRoute'),
    walletState: readString(walletAuthority, 'state') || readString(payload, 'walletAuthorityState'),
    spendState: readString(budgetApproval, 'state') || readString(payload, 'spendAuthorityState'),
    depositState: readString(depositApproval, 'state') || readString(payload, 'depositAuthorityState'),
    requiredDeniedActionCount: findFirstNumber(aggregate, ['requiredDeniedActionCount']) || 0,
    blockerCount: findFirstNumber(aggregate, ['blockerCount']) || 0,
    authorityRoot:
      readString(roots, 'authorityRoot') ||
      findFirstString(payload, ['organizationAuthorityRoot', 'governanceAuthorityRoot']),
  };
}

function collectProofRoots(source: unknown, roots = new Map<string, PackActivityProofRoot>(), depth = 0) {
  if (depth > 7 || source === null || source === undefined) return roots;

  if (Array.isArray(source)) {
    source.forEach((item) => collectProofRoots(item, roots, depth + 1));
    return roots;
  }

  const record = asRecord(source);
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string' && /(root|hash|receipt|witness|anchor)$/iu.test(key) && value.trim()) {
      const id = key.replace(/[^a-z0-9]+/giu, '-').toLowerCase();
      roots.set(`${id}:${value}`, {
        id,
        label: normalizeLabel(key),
        root: value.trim(),
      });
      continue;
    }

    if (value && typeof value === 'object') collectProofRoots(value, roots, depth + 1);
  }

  return roots;
}

function redactMetadata(source: unknown, depth = 0): unknown {
  if (depth > 5) return '[withheld:depth-limit]';
  if (source === null || source === undefined) return source;
  if (typeof source === 'string') return source.length > 500 ? `${source.slice(0, 500)}...` : source;
  if (typeof source === 'number' || typeof source === 'boolean') return source;
  if (Array.isArray(source)) return source.slice(0, 40).map((item) => redactMetadata(item, depth + 1));

  const record = asRecord(source);
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = key.replace(/[^a-z0-9]/giu, '').toLowerCase();
    if (SOURCE_BEARING_KEY_PATTERN.test(normalizedKey)) {
      redacted[key] = '[withheld:source-safe]';
      continue;
    }
    redacted[key] = redactMetadata(value, depth + 1);
  }
  return redacted;
}

function readState(record: BitcodeActivityRecord, keys: string[]) {
  return findFirstString(record.payload, keys);
}

function buildCommodityStateDisplay(payload: unknown): AssetPackCommodityStateDisplay {
  const projection = projectAssetPackCommodityStateForPayload(payload);
  try {
    return toSourceSafeAssetPackCommodityStateDisplay(assertAssetPackCommodityStateProjection(projection));
  } catch (error) {
    const repairProjection = buildAssetPackCommodityStateProjection({ payload, repairRequired: true });
    const repairDisplay = toSourceSafeAssetPackCommodityStateDisplay(repairProjection);
    const reason = error instanceof Error ? error.message : String(error);
    return {
      ...repairDisplay,
      blockers: [...new Set([...projection.blockers, ...repairDisplay.blockers, reason])],
    };
  }
}

/**
 * Lift settle escrow / payout fields from nested execution row payload onto
 * metadata root so Packs detail + filters can read them without deep scans.
 */
function promoteSettlePayoutMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const output = asRecord(metadata.output);
  const context = asRecord(metadata.context);
  const packActivity = asRecord(output.packActivity || context.packActivity || metadata.packActivity);
  const pendingPayout =
    output.pendingPayout ||
    context.pendingPayout ||
    packActivity.pendingPayout ||
    metadata.pendingPayout ||
    null;
  const payoutState =
    output.payoutState ||
    context.payoutState ||
    (pendingPayout && typeof pendingPayout === 'object'
      ? (pendingPayout as { status?: string }).status
      : null) ||
    metadata.payoutState ||
    null;
  const entitledPatchSummary =
    output.entitledPatchSummary ||
    packActivity.entitledPatchSummary ||
    (output.entitledPatch &&
    typeof output.entitledPatch === 'object' &&
    typeof (output.entitledPatch as { patchSummary?: string }).patchSummary === 'string'
      ? (output.entitledPatch as { patchSummary: string }).patchSummary
      : null) ||
    (pendingPayout &&
    typeof pendingPayout === 'object' &&
    typeof (pendingPayout as { patchSummary?: string }).patchSummary === 'string'
      ? (pendingPayout as { patchSummary: string }).patchSummary
      : null) ||
    metadata.entitledPatchSummary ||
    null;
  const settleRunId =
    output.settleRunId ||
    context.settleRunId ||
    metadata.id ||
    metadata.settleRunId ||
    null;
  const buyerAccount =
    output.buyerAccount ||
    context.buyerAccount ||
    (pendingPayout && typeof pendingPayout === 'object'
      ? (pendingPayout as { buyerAccount?: string }).buyerAccount
      : null) ||
    null;
  const sellerAccount =
    output.sellerAccount ||
    context.sellerAccount ||
    (pendingPayout && typeof pendingPayout === 'object'
      ? (pendingPayout as { sellerAccount?: string }).sellerAccount
      : null) ||
    null;

  return {
    ...metadata,
    ...(pendingPayout ? { pendingPayout } : {}),
    ...(payoutState ? { payoutState } : {}),
    ...(entitledPatchSummary ? { entitledPatchSummary } : {}),
    ...(settleRunId ? { settleRunId } : {}),
    ...(buyerAccount ? { buyerAccount } : {}),
    ...(sellerAccount ? { sellerAccount } : {}),
  };
}

export function normalizePackActivityRecord(record: BitcodeActivityRecord): PackActivityRecord {
  const type = inferPackActivityType(record);
  const metadata = promoteSettlePayoutMetadata(
    redactMetadata(record.payload) as Record<string, unknown>,
  );
  const commodityState = buildCommodityStateDisplay(record.payload);
  const settlementState = readState(record, ['settlementState', 'settlement_state', 'finalityState']) || commodityState.btcState;
  const rightsState =
    readState(record, ['rightsState', 'rights_state', 'btdRightsState']) ||
    (['btd-rights-transferred', 'btd-source-to-shares-allocated', 'btd-rights-projected'].includes(
      commodityState.btdState,
    )
      ? commodityState.btdState
      : null);
  const compensationState =
    readState(record, ['compensationState', 'compensation_state', 'sourceToSharesState']) ||
    (commodityState.assetPackState === 'compensated-and-reconciled' ? commodityState.assetPackState : null);
  const deliveryState =
    readState(record, ['deliveryState', 'delivery_state', 'pullRequestState']) ||
    (commodityState.assetPackState === 'source-unlocked-delivery' ? commodityState.assetPackState : null);
  const deliveryReference =
    readState(record, ['deliveryReference', 'delivery_reference', 'prUrl', 'pr_url', 'pullRequestUrl']) ||
    null;
  const repairState =
    readState(record, ['repairState', 'repair_state', 'reconciliationState']) ||
    (commodityState.repairRequired ? 'repair-required' : null);

  const assetPackTitle = inferAssetPackTitle(record);
  const assetPackKind = inferAssetPackKind(record);
  const { estimatedBtd, estimatedBtdCells } = inferEstimatedBtd(record);
  // Prefer settle/deposit authored titles over generic execution-history labels.
  // Prefer clean pack title (not "Depository AssetPack: Admitted …" noise).
  const title =
    (type === 'settled-assetpack' &&
      (assetPackTitle
        ? `Settled AssetPack: ${assetPackTitle}`
        : record.summary?.startsWith('Settled')
          ? record.summary.split('.')[0]
          : null)) ||
    (type === 'depository-assetpack' && assetPackTitle
      ? assetPackTitle.replace(/^Admitted\s+/i, '').replace(/\s+to the Depository\.?$/i, '')
      : null) ||
    record.title ||
    normalizeLabel(type);

  return {
    id: record.id,
    type,
    scope: record.scope,
    title,
    description: record.summary || 'Pack activity',
    timestamp: record.timestamp,
    state: record.state || commodityState.assetPackState,
    repository: inferRepository(record),
    assetPackTitle,
    assetPackKind:
      assetPackKind &&
      (assetPackKind === 'capability-slice' ||
        assetPackKind === 'implementation-pattern' ||
        assetPackKind === 'proof-operations-slice')
        ? assetPackKind
        : assetPackKind,
    estimatedBtd,
    estimatedBtdCells,
    settlementState,
    rightsState,
    compensationState,
    deliveryState,
    deliveryReference,
    repairState,
    measurements: buildMeasurements(record),
    values: buildValues(record),
    proofRoots: [...collectProofRoots(record.payload).values()].slice(0, 24),
    commodityState,
    accounting: buildAccountingReadback(record),
    governance: buildGovernanceReadback(record),
    sourceSafety: SOURCE_SAFETY,
    metadata,
  };
}

export function assertPackActivitySourceSafe(record: PackActivityRecord | PackActivityDetailProjection) {
  const serialized = JSON.stringify(record).toLowerCase();
  const unsafeNeedles = [
    'protected source body',
    'unpaid assetpack source',
    'raw prompt text',
    'interpolated prompt text',
    'raw provider response',
    'source snippet',
  ];

  return (
    record.sourceSafety.sourceSafeMetadataOnly === true &&
    record.sourceSafety.protectedSourceVisible === false &&
    record.sourceSafety.unpaidAssetPackSourceVisible === false &&
    record.sourceSafety.rawPromptVisible === false &&
    record.sourceSafety.interpolatedPromptVisible === false &&
    record.sourceSafety.rawProviderResponseVisible === false &&
    record.sourceSafety.sourceSnippetVisible === false &&
    unsafeNeedles.every((needle) => !serialized.includes(needle))
  );
}

function matchesFilter(value: string | null, filter: string | undefined) {
  return !filter || filter === 'all' || String(value || '') === filter;
}

function flattenMetadataSearchTokens(value: unknown, depth = 0): string[] {
  if (value == null || depth > 4) return [];
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenMetadataSearchTokens(entry, depth + 1));
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, entry]) => [
      key,
      ...flattenMetadataSearchTokens(entry, depth + 1),
    ]);
  }
  return [];
}

/**
 * Full-text corpus for /packs search: every source-safe field buyers use to
 * find AssetPacks — titles, absolute/neediness measurements, values, proofs,
 * states, accounting/governance roots, and shallow metadata.
 */
function buildSearchText(record: PackActivityRecord) {
  return [
    record.id,
    record.type,
    record.title,
    record.description,
    record.state,
    record.repository,
    record.assetPackTitle,
    record.settlementState,
    record.rightsState,
    record.compensationState,
    record.deliveryState,
    record.deliveryReference,
    record.repairState,
    record.timestamp,
    record.scope,
    record.commodityState.assetPackState,
    record.commodityState.btdState,
    record.commodityState.btcState,
    record.commodityState.disclosureBoundary,
    ...(Array.isArray(record.commodityState.blockers)
      ? record.commodityState.blockers
      : []),
    ...record.measurements.flatMap((measurement) => [
      measurement.id,
      measurement.label,
      String(measurement.value),
      measurement.unit,
      measurement.root,
      // Common absolute / neediness phrasing so partial queries hit.
      'absolute',
      'measurement',
      'neediness',
      `${measurement.label} ${measurement.value}`,
      measurement.unit ? `${measurement.value} ${measurement.unit}` : null,
    ]),
    ...record.values.flatMap((value) => [
      value.id,
      value.label,
      String(value.amount),
      value.unit,
      `${value.label} ${value.amount}`,
      `${value.amount} ${value.unit}`,
    ]),
    ...record.proofRoots.flatMap((proofRoot) => [
      proofRoot.id,
      proofRoot.label,
      proofRoot.root,
    ]),
    record.accounting?.state,
    record.accounting?.btdRangeState,
    record.accounting?.btcSettlementState,
    record.accounting?.compensationState,
    record.accounting?.reconciliationState,
    record.accounting?.treasuryRouteState,
    record.accounting?.statementRoot,
    record.accounting ? String(record.accounting.contributorCount) : null,
    record.accounting ? String(record.accounting.depositorCount) : null,
    record.accounting ? String(record.accounting.finalSettlementSats) : null,
    record.accounting ? String(record.accounting.allocatedContributorSats) : null,
    record.governance?.state,
    record.governance?.route,
    record.governance?.walletState,
    record.governance?.spendState,
    record.governance?.depositState,
    record.governance?.authorityRoot,
    ...flattenMetadataSearchTokens(record.metadata),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function firstValueTotalSats(record: PackActivityRecord) {
  return record.values.reduce((total, value) => {
    if (value.unit !== 'sats') return total;
    const amount = Number(value.amount);
    return Number.isFinite(amount) ? total + amount : total;
  }, 0);
}

function firstBtdEstimate(record: PackActivityRecord) {
  const measurement = record.measurements.find((entry) => entry.unit === 'BTD');
  const value = Number(measurement?.value ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function isOpenRepairState(value: string | null) {
  return Boolean(value && !/(not_required|closed|complete|completed|none)/iu.test(value));
}

function inferSignalKinds(record: PackActivityRecord): PackMarketSignalKind[] {
  const text = buildSearchText(record);
  const kinds = new Set<PackMarketSignalKind>();
  if (record.type === 'read-need-fit-preview' || includesAny(text, ['read demand', 'need demand', 'finding fits'])) {
    kinds.add('demand');
  }
  if (
    record.type === 'deposit-option' ||
    record.type === 'depository-assetpack' ||
    includesAny(text, ['supply opportunity', 'deposit supply', 'depository supply'])
  ) {
    kinds.add('supply');
  }
  if (includesAny(text, ['unfit', 'no worthy fit', 'no_worthy_fit', 'no fit', 'blocked readiness'])) {
    kinds.add('unfit-need');
  }
  if (record.type === 'settlement' || record.settlementState) kinds.add('settlement');
  if (record.type === 'compensation' || record.compensationState) kinds.add('compensation');
  if (record.type === 'delivery' || record.deliveryState) kinds.add('delivery');
  if (record.type === 'repair' || isOpenRepairState(record.repairState)) kinds.add('repair');
  return [...kinds];
}

function incrementFacet(target: Record<string, number>, value: string | null) {
  const key = value || 'not-recorded';
  target[key] = (target[key] || 0) + 1;
}

/**
 * Deposit-side pack looks commercially settled (sold / finality / delivery),
 * as opposed to still-unsettled depository inventory.
 */
export function depositPackLooksSettled(record: PackActivityRecord): boolean {
  const haystack = [
    record.settlementState,
    record.rightsState,
    record.compensationState,
    record.deliveryState,
    record.state,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return /settled|finalit|paid|compensat|source-unlocked|delivered|rights-transferred|btd-rights/.test(
    haystack,
  );
}

/**
 * Match type filter including synthetic ownership lenses.
 * "My" filters assume the record set is already scoped to the signed-in user
 * (caller must not mix in foreign network rows).
 */
export function matchesPackActivityTypeFilter(
  record: PackActivityRecord,
  type: PackActivityTypeFilter | undefined,
): boolean {
  if (!type || type === 'all') return true;

  if (type === 'my-assetpacks') {
    // Union: read (bought) + deposited (unsettled) + deposited (settled).
    return (
      record.type === 'settled-assetpack' || record.type === 'depository-assetpack'
    );
  }
  if (type === 'my-read-bought') {
    return record.type === 'settled-assetpack';
  }
  if (type === 'my-deposited-unsettled') {
    return record.type === 'depository-assetpack' && !depositPackLooksSettled(record);
  }
  if (type === 'my-deposited-settled') {
    return record.type === 'depository-assetpack' && depositPackLooksSettled(record);
  }
  if (type === 'needs-payout-review') {
    return packActivityNeedsPayoutReview(record);
  }

  return record.type === type;
}

/**
 * Settled rows with pending seller BTD/pay finalize (escrow still held).
 * Reads payoutState / pendingPayout from source-safe metadata.
 */
export function packActivityNeedsPayoutReview(record: PackActivityRecord): boolean {
  const meta = record.metadata || {};
  const pending = meta.pendingPayout;
  if (pending && typeof pending === 'object' && !Array.isArray(pending)) {
    const status = String((pending as { status?: string }).status || '').toLowerCase();
    if (status === 'finalized') return false;
    if (status === 'pending-seller-review' || status === 'pending') return true;
  }
  const payoutState = String(meta.payoutState || record.compensationState || '').toLowerCase();
  if (
    payoutState === 'pending-seller-review' ||
    payoutState === 'pending-payout' ||
    payoutState === 'awaiting-seller-finalize'
  ) {
    return true;
  }
  // Prefer settled commodity rows when only weak signals exist.
  return false;
}

export function filterPackActivityRecords(
  records: PackActivityRecord[],
  filters: PackActivityFilters = {},
  search?: string | null,
) {
  const normalizedSearch = String(search || '').trim().toLowerCase();
  return records.filter((record) => {
    if (!matchesPackActivityTypeFilter(record, filters.type)) return false;
    if (filters.scope && filters.scope !== 'all' && record.scope !== filters.scope) return false;
    if (!matchesFilter(record.state, filters.state)) return false;
    if (!matchesFilter(record.settlementState, filters.settlementState)) return false;
    if (!matchesFilter(record.compensationState, filters.compensationState)) return false;
    if (!matchesFilter(record.deliveryState, filters.deliveryState)) return false;
    if (!matchesFilter(record.repairState, filters.repairState)) return false;
    if (!matchesFilter(record.repository, filters.repository)) return false;
    if (normalizedSearch) {
      // Multi-token AND: every whitespace-separated term must appear somewhere
      // in the pack corpus (measurements, absolutes, proofs, states, …).
      const haystack = buildSearchText(record);
      const tokens = normalizedSearch.split(/\s+/).filter(Boolean);
      if (!tokens.every((token) => haystack.includes(token))) return false;
    }
    return true;
  });
}

export function sortPackActivityRecords(
  records: PackActivityRecord[],
  sort: PackActivityQuery['sort'] = {},
) {
  const key = sort?.key || 'timestamp';
  const direction = sort?.direction || 'desc';
  const multiplier = direction === 'asc' ? 1 : -1;

  return [...records].sort((left, right) => {
    if (key === 'value') {
      const leftValue = left.values[0]?.amount ?? left.measurements[0]?.value ?? 0;
      const rightValue = right.values[0]?.amount ?? right.measurements[0]?.value ?? 0;
      return (Number(leftValue) - Number(rightValue)) * multiplier;
    }

    const leftText =
      key === 'title'
        ? left.title
        : key === 'settlementState'
          ? left.settlementState
          : key === 'compensationState'
            ? left.compensationState
            : key === 'deliveryState'
              ? left.deliveryState
              : key === 'repairState'
                ? left.repairState
                : left.timestamp;
    const rightText =
      key === 'title'
        ? right.title
        : key === 'settlementState'
          ? right.settlementState
          : key === 'compensationState'
            ? right.compensationState
            : key === 'deliveryState'
              ? right.deliveryState
              : key === 'repairState'
                ? right.repairState
                : right.timestamp;
    return compareText(leftText, rightText) * multiplier || compareText(left.id, right.id);
  });
}

export function buildPackActivityDetailProjection(
  record: PackActivityRecord,
): PackActivityDetailProjection {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    description: record.description,
    timestamp: record.timestamp,
    sourceSafety: record.sourceSafety,
    overview: {
      state: record.state,
      scope: record.scope,
      repository: record.repository,
      assetPackTitle: record.assetPackTitle,
      assetPackKind: record.assetPackKind,
      estimatedBtd: record.estimatedBtd,
      estimatedBtdCells: record.estimatedBtdCells,
    },
    measurements: record.measurements,
    values: record.values,
    proofRoots: record.proofRoots,
    commodityState: record.commodityState,
    accounting: record.accounting,
    governance: record.governance,
    states: {
      settlement: record.settlementState,
      rights: record.rightsState,
      compensation: record.compensationState,
      delivery: record.deliveryState,
      repair: record.repairState,
    },
    deliveryReference: record.deliveryReference,
    assetPackKind: record.assetPackKind,
    estimatedBtd: record.estimatedBtd,
    estimatedBtdCells: record.estimatedBtdCells,
    telemetry: {
      sourceEventId: record.id,
      sourceKind: String(record.metadata.kind || record.metadata.type || '') || null,
      sourceChannel: String(record.metadata.channel || '') || null,
    },
    metadata: record.metadata,
  };
}

export function summarizePackActivityRecords(records: PackActivityRecord[]): PackActivitySummary {
  const types = Object.fromEntries(PACK_ACTIVITY_TYPES.map((type) => [type, 0])) as Record<
    PackActivityType,
    number
  >;
  const states: Record<string, number> = {};
  const repositories = new Set<string>();

  for (const record of records) {
    types[record.type] += 1;
    if (record.state) states[record.state] = (states[record.state] || 0) + 1;
    if (record.repository) repositories.add(record.repository);
  }

  return {
    total: records.length,
    types,
    states,
    repositories: [...repositories].sort(compareText),
    settlementReady: records.filter((record) => /ready|settled|final/i.test(record.settlementState || '')).length,
    compensationReady: records.filter((record) => /ready|allocated|paid/i.test(record.compensationState || '')).length,
    deliveryReady: records.filter((record) =>
      /ready|delivered|pull|opened|projected/i.test(record.deliveryState || ''),
    ).length,
    repairOpen: records.filter((record) => /open|repair|reconcile|failed/i.test(record.repairState || '')).length,
  };
}

export function buildPackPortfolioMarketIntelligence(
  records: PackActivityRecord[],
): PackPortfolioMarketIntelligence {
  const positionsByKey = new Map<string, PackPortfolioPositionProjection>();
  const signals: PackMarketSignalProjection[] = [];
  const facets: PackPortfolioFacetSummary = {
    settlement: {},
    compensation: {},
    delivery: {},
    repair: {},
  };

  for (const record of records.filter(assertPackActivitySourceSafe)) {
    incrementFacet(facets.settlement, record.settlementState);
    incrementFacet(facets.compensation, record.compensationState);
    incrementFacet(facets.delivery, record.deliveryState);
    incrementFacet(facets.repair, record.repairState);

    const positionKey = [
      record.repository || 'network',
      record.assetPackTitle || record.title,
    ].join(':');
    const current = positionsByKey.get(positionKey);
    const signalKinds = inferSignalKinds(record);
    const lastActivityAt =
      !current?.lastActivityAt || compareText(record.timestamp, current.lastActivityAt) > 0
        ? record.timestamp
        : current.lastActivityAt;

    positionsByKey.set(positionKey, {
      id: `pack-position:${positionKey.toLowerCase().replace(/[^a-z0-9]+/giu, '-')}`,
      organizationView: record.scope === 'personal' ? 'personal' : 'network',
      repository: record.repository || 'network',
      assetPackTitle: record.assetPackTitle || record.title,
      state: record.state || current?.state || 'observed',
      activityCount: (current?.activityCount || 0) + 1,
      lastActivityAt,
      valueTotalSats: (current?.valueTotalSats || 0) + firstValueTotalSats(record),
      btdEstimate: (current?.btdEstimate || 0) + firstBtdEstimate(record),
      proofRootCount: (current?.proofRootCount || 0) + record.proofRoots.length,
      demandSignalCount:
        (current?.demandSignalCount || 0) + (signalKinds.includes('demand') ? 1 : 0),
      supplySignalCount:
        (current?.supplySignalCount || 0) + (signalKinds.includes('supply') ? 1 : 0),
      unfitNeedSignalCount:
        (current?.unfitNeedSignalCount || 0) + (signalKinds.includes('unfit-need') ? 1 : 0),
      settlementState: record.settlementState || current?.settlementState || null,
      compensationState: record.compensationState || current?.compensationState || null,
      deliveryState: record.deliveryState || current?.deliveryState || null,
      repairState: record.repairState || current?.repairState || null,
      sourceSafety: SOURCE_SAFETY,
    });

    for (const kind of signalKinds) {
      signals.push({
        id: `pack-signal:${kind}:${record.id}`,
        kind,
        label: normalizeLabel(kind),
        description: record.description,
        strength: Math.min(
          100,
          20 + record.proofRoots.length * 8 + record.measurements.length * 6 + record.values.length * 6,
        ),
        state: record.state || record.settlementState || record.compensationState || record.repairState || 'observed',
        repository: record.repository,
        relatedRecordIds: [record.id],
        proofRoots: record.proofRoots.slice(0, 4),
        sourceSafety: SOURCE_SAFETY,
      });
    }
  }

  return {
    positions: [...positionsByKey.values()]
      .sort((left, right) => compareText(right.lastActivityAt, left.lastActivityAt))
      .slice(0, 24),
    signals: signals.sort((left, right) => right.strength - left.strength).slice(0, 32),
    savedFilters: [
      {
        id: 'my-assetpacks',
        label: 'My AssetPacks',
        description:
          'Your reads (bought), deposits still unsettled, and deposits that have settled.',
        query: { type: 'my-assetpacks' },
        signalKind: 'supply',
      },
      {
        id: 'portfolio-open-repair',
        label: 'Repair cases',
        description: 'Open reconciliation and repair states across portfolio positions.',
        query: { type: 'repair', repairState: 'open_reconciliation' },
        signalKind: 'repair',
      },
      {
        id: 'market-demand',
        label: 'Demand signals',
        description: 'Read Need and Finding Fits activity that indicates buyer demand.',
        query: { type: 'read-need-fit-preview' },
        signalKind: 'demand',
      },
      {
        id: 'market-supply',
        label: 'Supply signals',
        description: 'Deposit options and admitted Depository AssetPacks.',
        query: { type: 'depository-assetpack' },
        signalKind: 'supply',
      },
      {
        id: 'economic-settlement',
        label: 'Settlement facets',
        description: 'Quote, payment, finality, and settlement-state readback.',
        query: { sort: 'settlementState' },
        signalKind: 'settlement',
      },
      {
        id: 'economic-compensation',
        label: 'Compensation facets',
        description: 'Source-to-shares and contributor compensation readback.',
        query: { sort: 'compensationState' },
        signalKind: 'compensation',
      },
    ],
    facets,
    sourceSafety: SOURCE_SAFETY,
  };
}

export function queryPackActivityRecords(records: PackActivityRecord[], query: PackActivityQuery = {}) {
  const filtered = filterPackActivityRecords(records, query.filters || {}, query.search);
  const sorted = sortPackActivityRecords(filtered, query.sort || {});
  return {
    records: sorted,
    summary: summarizePackActivityRecords(sorted),
    query: {
      search: query.search || '',
      filters: query.filters || {},
      sort: {
        key: query.sort?.key || 'timestamp',
        direction: query.sort?.direction || 'desc',
      },
    },
  };
}
