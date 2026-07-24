import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@bitcode/supabase';

import { GET as getActivity } from '@/app/api/activity/route';
import { buildBitcodeActivityRecordFromExecutionHistory } from '@/components/bitcode/activity/BitcodeActivityModel/bitcode-activity-model';
import {
  assertPackActivitySourceSafe,
  buildPackActivityDetailProjection,
  buildPackPortfolioMarketIntelligence,
  normalizePackActivityRecord,
  queryPackActivityRecords,
  summarizePackActivityRecords,
  type PackActivityFilters,
  type PackActivitySortDirection,
  type PackActivitySortKey,
  type PackActivityType,
  type PackActivityTypeFilter,
} from '@/components/bitcode/activity/PackActivityModel/pack-activity-model';
import type { BitcodeActivityRecord } from '@/components/bitcode/activity/BitcodeActivityModel/bitcode-activity-model';
import { isPacksMyTypeFilter } from '@/components/exchange/models/exchange-format';

export const runtime = 'nodejs';

const PACK_ACTIVITY_TYPES = new Set<PackActivityType>([
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
]);

/** Synthetic My-ownership filters + real activity types. */
const PACK_TYPE_FILTERS = new Set<PackActivityTypeFilter>([
  ...PACK_ACTIVITY_TYPES,
  'my-assetpacks',
  'my-read-bought',
  'my-deposited-unsettled',
  'my-deposited-settled',
  'needs-payout-review',
]);

const PACK_ACTIVITY_SORT_KEYS = new Set<PackActivitySortKey>([
  'timestamp',
  'title',
  'value',
  'settlementState',
  'compensationState',
  'deliveryState',
  'repairState',
]);

function readEnum<T extends string>(value: string | null, allowed: Set<T>, fallback: T) {
  return value && allowed.has(value as T) ? (value as T) : fallback;
}

function readFilterParam(params: URLSearchParams, key: string) {
  const value = String(params.get(key) || '').trim();
  return value || 'all';
}

function buildFilters(params: URLSearchParams): PackActivityFilters {
  const absoluteKind = readFilterParam(params, 'absoluteKind');
  const minVolRaw = params.get('minAbsoluteVolume');
  const minAbsoluteVolume =
    minVolRaw != null && minVolRaw !== '' && Number.isFinite(Number(minVolRaw))
      ? Math.max(0, Math.min(1, Number(minVolRaw)))
      : null;
  const requestedType = readFilterParam(params, 'type');
  return {
    type:
      requestedType === 'all'
        ? 'all'
        : readEnum(requestedType, PACK_TYPE_FILTERS, 'execution'),
    scope: readFilterParam(params, 'scope') as PackActivityFilters['scope'],
    state: readFilterParam(params, 'state'),
    settlementState: readFilterParam(params, 'settlementState'),
    compensationState: readFilterParam(params, 'compensationState'),
    deliveryState: readFilterParam(params, 'deliveryState'),
    repairState: readFilterParam(params, 'repairState'),
    repository: readFilterParam(params, 'repository'),
    absoluteKind: absoluteKind || 'all',
    minAbsoluteVolume,
  };
}

async function readBaseActivity(request: Request, limit: number) {
  const url = new URL(request.url);
  const activityUrl = new URL('/api/activity', url.origin);
  activityUrl.searchParams.set('limit', String(Math.min(limit * 2, 100)));
  const response = await getActivity(new Request(activityUrl));
  const payload = await response.json();
  return { response, payload };
}

/**
 * Globally visible Depository commerce (V48 Gate 2 specification): AssetPacks
 * admitted to the Depository are network-scope rows every account can see on
 * /exchange, regardless of which depositor admitted them. Source-safe execution
 * projections only; the per-record source-safety assertion still gates the
 * response.
 */
async function readGlobalDepositoryRecords(limit: number): Promise<BitcodeActivityRecord[]> {
  try {
    const { data } = await supabaseAdmin
      .from('executions')
      .select('id, created_at, status, type, output, context')
      .eq('context->>source', 'deposit-option-review-admission')
      .eq('context->>admissionState', 'admitted-to-depository')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 50));
    return (data || []).map((row: Record<string, unknown>) => {
      const output = (row.output as Record<string, unknown> | null) || {};
      const context = (row.context as Record<string, unknown> | null) || {};
      const assetPackTitle =
        (typeof output.assetPackTitle === 'string' && output.assetPackTitle) ||
        (typeof context.assetPackTitle === 'string' && context.assetPackTitle) ||
        null;
      const assetPackKind =
        (typeof output.assetPackKind === 'string' && output.assetPackKind) ||
        (typeof output.optionKind === 'string' && output.optionKind) ||
        (typeof output.kind === 'string' && output.kind) ||
        (typeof context.assetPackKind === 'string' && context.assetPackKind) ||
        (typeof context.optionKind === 'string' && context.optionKind) ||
        null;
      const estimatedBtd =
        typeof output.estimatedBtd === 'number'
          ? output.estimatedBtd
          : typeof context.estimatedBtd === 'number'
            ? context.estimatedBtd
            : null;
      const estimatedBtdCells =
        typeof output.estimatedBtdCells === 'number'
          ? output.estimatedBtdCells
          : typeof context.estimatedBtdCells === 'number'
            ? context.estimatedBtdCells
            : null;
      // Flatten per-pack absolute measurements onto context+output so pack
      // activity projection prefers catalog chips over any residual session
      // aggregates still present on older admission rows.
      const measurements =
        (Array.isArray(output.measurements) && output.measurements) ||
        (Array.isArray(output.absolutes) && output.absolutes) ||
        (Array.isArray(context.measurements) && context.measurements) ||
        [];
      const summary =
        typeof output.summary === 'string'
          ? String(output.summary)
          : assetPackTitle
            ? `Admitted ${assetPackTitle} to the Depository.`
            : null;
      return buildBitcodeActivityRecordFromExecutionHistory({
        ...row,
        summary,
        context: {
          ...context,
          source: 'deposit-option-review-admission',
          admissionState: 'admitted-to-depository',
          packActivityType: 'depository-assetpack',
          activityType: 'depository-assetpack',
          assetPackTitle,
          assetPackKind,
          optionKind: assetPackKind,
          kind: assetPackKind,
          optionId: context.optionId || output.optionId || null,
          depositoryAssetPackId:
            context.depositoryAssetPackId || output.depositoryAssetPackId || null,
          compensationState:
            context.compensationState || output.compensationState || null,
          measurementRoot: context.measurementRoot || output.measurementRoot || null,
          estimatedBtd,
          estimatedBtdCells,
          btdHonesty: 'estimate',
          // Source-safe absolute catalog only — never patch / fileChanges.
          measurements,
        },
        output: {
          ...output,
          packActivityType: 'depository-assetpack',
          assetPackTitle,
          assetPackKind,
          optionKind: assetPackKind,
          kind: assetPackKind,
          estimatedBtd,
          estimatedBtdCells,
          btdHonesty: 'estimate',
          measurements,
          // Strip session-aggregate noise if present on legacy rows.
          candidateCount: undefined,
          admittedCount: undefined,
          optionCount: undefined,
          depositAdmission: undefined,
        },
      } as never);
    });
  } catch {
    return [];
  }
}

/** Settled read deliveries (settle-asset-pack-pipeline) surface on /exchange as settled-assetpack rows. */
async function readSettledAssetPackRecords(limit: number): Promise<BitcodeActivityRecord[]> {
  try {
    const { data } = await supabaseAdmin
      .from('executions')
      .select('id, created_at, status, type, output, context')
      .eq('context->>source', 'read-settle-asset-pack')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 50));
    return (data || []).map((row: Record<string, unknown>) => {
      const output = (row.output as Record<string, unknown> | null) || {};
      const context = (row.context as Record<string, unknown> | null) || {};
      const packActivity =
        output.packActivity && typeof output.packActivity === 'object'
          ? (output.packActivity as Record<string, unknown>)
          : {};
      const optionCount = context.optionCount ?? output.optionCount ?? packActivity.optionCount;
      const assetPackTitle =
        (typeof context.assetPackTitle === 'string' && context.assetPackTitle) ||
        (typeof output.assetPackTitle === 'string' && output.assetPackTitle) ||
        (typeof packActivity.assetPackTitle === 'string' && packActivity.assetPackTitle) ||
        null;
      const summary =
        typeof output.summary === 'string'
          ? String(output.summary)
          : assetPackTitle
            ? `Settled AssetPack: ${assetPackTitle}`
            : `Settled ${optionCount ?? ''} AssetPack option(s)`.trim();
      // Flatten settle fields onto the history row so pack-activity-model can
      // project measurements, PR delivery, and states without deep-only scans.
      return buildBitcodeActivityRecordFromExecutionHistory({
        ...row,
        summary,
        context: {
          ...context,
          source: 'read-settle-asset-pack',
          activityType: 'settled-assetpack',
          packActivityType: 'settled-assetpack',
          assetPackTitle,
          settlementState: context.settlementState || output.settlementState || 'settled',
          rightsState: context.rightsState || output.rightsState || null,
          deliveryState: context.deliveryState || output.deliveryState || null,
          deliveryReference:
            context.deliveryReference ||
            output.deliveryReference ||
            context.prUrl ||
            output.prUrl ||
            packActivity.prUrl ||
            null,
          prUrl: context.prUrl || output.prUrl || packActivity.prUrl || null,
          repositoryFullName:
            context.repositoryFullName ||
            output.repositoryFullName ||
            packActivity.repositoryFullName ||
            null,
          optionCount,
          measurements: output.measurements || packActivity.measurements || [],
          amountSats:
            output.amountSats ??
            (packActivity.paymentObservation &&
            typeof packActivity.paymentObservation === 'object' &&
            typeof (packActivity.paymentObservation as Record<string, unknown>).amountSats ===
              'number'
              ? (packActivity.paymentObservation as Record<string, unknown>).amountSats
              : null),
        },
        output: {
          ...output,
          packActivityType: 'settled-assetpack',
          assetPackTitle,
          measurements: output.measurements || packActivity.measurements || [],
          pendingPayout: output.pendingPayout || packActivity.pendingPayout || null,
          entitledPatchSummary:
            (typeof packActivity.entitledPatchSummary === 'string' &&
              packActivity.entitledPatchSummary) ||
            (output.entitledPatch &&
            typeof output.entitledPatch === 'object' &&
            typeof (output.entitledPatch as { patchSummary?: string }).patchSummary ===
              'string'
              ? (output.entitledPatch as { patchSummary: string }).patchSummary
              : null),
          // V48-Gate5-F01: fully rich entitled material for post-settle buyer/owner.
          entitledPatch: output.entitledPatch || packActivity.entitledPatch || null,
          settleRunId: row.id,
          payoutState:
            context.payoutState ||
            output.payoutState ||
            (output.pendingPayout &&
            typeof output.pendingPayout === 'object' &&
            typeof (output.pendingPayout as { status?: string }).status === 'string'
              ? (output.pendingPayout as { status: string }).status
              : null),
        },
      } as never);
    });
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const limit = Math.max(1, Math.min(Number(params.get('limit') || 50), 100));
  const detailId = String(params.get('detailId') || '').trim();
  const sortKey = readEnum(params.get('sort') || 'timestamp', PACK_ACTIVITY_SORT_KEYS, 'timestamp');
  const sortDirection: PackActivitySortDirection = params.get('direction') === 'asc' ? 'asc' : 'desc';
  const filters = buildFilters(params);

  const { response, payload } = await readBaseActivity(request, limit);
  if (!response.ok || payload?.error) {
    return NextResponse.json(
      { ok: false, error: payload?.error || 'Failed to fetch pack activity' },
      { status: response.status || 500 },
    );
  }

  const baseRecords = Array.isArray(payload?.records)
    ? (payload.records as BitcodeActivityRecord[])
    : [];
  // "My AssetPacks" (+ subtypes) is ownership-scoped: only the signed-in
  // account's base activity. Network depository/settled merges would include
  // other accounts' commodity rows and break the ownership lens.
  const mineOnly = isPacksMyTypeFilter(String(filters.type || ''));
  let mergedRecords: BitcodeActivityRecord[];
  if (mineOnly) {
    mergedRecords = baseRecords;
  } else {
    const globalRecords = await readGlobalDepositoryRecords(limit);
    const settledRecords = await readSettledAssetPackRecords(limit);
    const seenIds = new Set(baseRecords.map((record) => String(record.id)));
    mergedRecords = [
      ...baseRecords,
      ...globalRecords.filter((record) => !seenIds.has(String(record.id))),
      ...settledRecords.filter((record) => !seenIds.has(String(record.id))),
    ];
  }
  const packRecords = mergedRecords.map(normalizePackActivityRecord);
  const query = queryPackActivityRecords(packRecords, {
    search: params.get('q') || params.get('search') || '',
    filters,
    sort: { key: sortKey, direction: sortDirection },
  });
  const records = query.records.slice(0, limit);
  const selected = detailId
    ? packRecords.find((record) => record.id === detailId) || records[0] || null
    : records[0] || null;
  const detail = selected ? buildPackActivityDetailProjection(selected) : null;
  const safeRecords = records.filter(assertPackActivitySourceSafe);
  const marketIntelligence = buildPackPortfolioMarketIntelligence(safeRecords);

  return NextResponse.json({
    ok: true,
    records: safeRecords,
    detail: detail && assertPackActivitySourceSafe(detail) ? detail : null,
    summary: summarizePackActivityRecords(safeRecords),
    marketIntelligence,
    query: query.query,
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawPromptVisible: false,
      interpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      sourceSnippetVisible: false,
    },
  });
}
