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
} from '@/components/bitcode/activity/PackActivityModel/pack-activity-model';
import type { BitcodeActivityRecord } from '@/components/bitcode/activity/BitcodeActivityModel/bitcode-activity-model';

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
  const requestedType = readFilterParam(params, 'type');
  return {
    type: requestedType === 'all' ? 'all' : readEnum(requestedType, PACK_ACTIVITY_TYPES, 'execution'),
    scope: readFilterParam(params, 'scope') as PackActivityFilters['scope'],
    state: readFilterParam(params, 'state'),
    settlementState: readFilterParam(params, 'settlementState'),
    compensationState: readFilterParam(params, 'compensationState'),
    deliveryState: readFilterParam(params, 'deliveryState'),
    repairState: readFilterParam(params, 'repairState'),
    repository: readFilterParam(params, 'repository'),
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
 * /packs, regardless of which depositor admitted them. Source-safe execution
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
    return (data || []).map((row: Record<string, unknown>) =>
      buildBitcodeActivityRecordFromExecutionHistory({
        ...row,
        summary:
          typeof (row.output as Record<string, unknown> | null)?.summary === 'string'
            ? String((row.output as Record<string, unknown>).summary)
            : null,
      } as never),
    );
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
  const globalRecords = await readGlobalDepositoryRecords(limit);
  const seenIds = new Set(baseRecords.map((record) => String(record.id)));
  const mergedRecords = [
    ...baseRecords,
    ...globalRecords.filter((record) => !seenIds.has(String(record.id))),
  ];
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
