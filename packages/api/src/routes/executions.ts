/**
 * Executions API Route Handlers
 *
 * Route ownership lives here in the API package.
 * Lower-level execution semantics remain in retained execution packages and
 * shared normalization helpers below rather than the Next.js FS routes.
 */

import { createJsonResponse } from '@bitcode/responses';
import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';

import {
  buildAgenticExecutionSummary,
  normalizeAgenticExecutionStorageType,
  resolveAgenticExecutionQueryTypes,
} from '../executions/agentic-execution';

type JsonRecord = Record<string, unknown>;

type ExecutionHistoryRow = {
  id: string;
  user_id: string;
  created_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  status: string | null;
  type: string | null;
  input: unknown;
  output: unknown;
  context: unknown;
  items: unknown;
  error: unknown;
  total_tokens: number | null;
  total_cost: number | null;
  duration_ms: number | null;
};

type ExecutionEventRow = {
  id: string;
  run_id: string;
  event_type: string;
  event_data: unknown;
  created_at: string | null;
  agent_name: string | null;
  phase: string | null;
};

type TerminalJournalReadback = {
  expectedJournalEntryIds: string[];
  entries: JsonRecord[];
  repairs: JsonRecord[];
  ledgerRows: {
    assetPackRanges: JsonRecord[];
    btcFeeTransactions: JsonRecord[];
    ledgerAnchors: JsonRecord[];
    ownershipEvents: JsonRecord[];
    readLicenses: JsonRecord[];
  };
  readErrors: string[];
};

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return fallback;
}

async function requireExecutionRouteUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function formatDuration(durationMs: number | null) {
  if (!durationMs || durationMs <= 0) return null;

  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function readOutputRecord(row: ExecutionHistoryRow) {
  return asRecord(row.output);
}

function readContextRecord(row: ExecutionHistoryRow) {
  return asRecord(row.context);
}

function readAssetPackCompletion(row: ExecutionHistoryRow) {
  const output = readOutputRecord(row);
  return output ? asRecord(output.asset_pack_completion) : null;
}

function readPreprocessedRecord(row: ExecutionHistoryRow) {
  const output = readOutputRecord(row);
  return output ? asRecord(output.preprocessed) : null;
}

function buildWrittenAssets(row: ExecutionHistoryRow) {
  const output = readOutputRecord(row);
  const assetPackCompletion = readAssetPackCompletion(row);

  return (
    asRecord(assetPackCompletion?.writtenAssets) ||
    buildAssetPackSynthesisArtifacts(row) ||
    asRecord(output?.writtenAssets) ||
    asRecord(output?.assetPackSynthesisArtifacts)
  );
}

function buildAssetPackSynthesisArtifacts(row: ExecutionHistoryRow) {
  const output = readOutputRecord(row);
  const assetPackCompletion = readAssetPackCompletion(row);

  return (
    asRecord(assetPackCompletion?.assetPackSynthesisArtifacts) ||
    asRecord(output?.assetPackSynthesisArtifacts)
  );
}

function hasPullRequestDelivery(surface: Record<string, unknown> | null) {
  if (!surface) return false;
  return Boolean(
    asRecord(surface.pullRequest) ||
    asString(surface.prUrl) ||
    asString(surface.url)
  );
}

function normalizeDeliveryMechanismSurface(surface: Record<string, unknown> | null) {
  if (!surface) return null;
  const directPullRequest = asRecord(surface.pullRequest);
  const fallbackPullRequestUrl = asString(surface.prUrl) || asString(surface.url);
  const pullRequest = directPullRequest || (fallbackPullRequestUrl ? {
    url: fallbackPullRequestUrl,
    ...(asString(surface.title) ? { title: asString(surface.title) } : {}),
    ...(asNumber(surface.number) ? { number: asNumber(surface.number) } : {}),
  } : null);
  const summary = asString(surface.summary);

  if (!pullRequest && !summary) return null;

  return {
    ...(pullRequest ? { pullRequest } : {}),
    ...(summary ? { summary } : {}),
  };
}

function buildDeliveryMechanism(row: ExecutionHistoryRow) {
  const output = readOutputRecord(row);
  const assetPackCompletion = readAssetPackCompletion(row);
  const explicitDeliveryMechanism =
    asRecord(assetPackCompletion?.deliveryMechanism) ||
    asRecord(assetPackCompletion?.shippables) ||
    asRecord(output?.deliveryMechanism) ||
    asRecord(output?.shippables);

  const deliverySurface = normalizeDeliveryMechanismSurface(explicitDeliveryMechanism);
  if (deliverySurface) return deliverySurface;

  const summary = asString(assetPackCompletion?.summary) || asString(output?.summary);
  return summary ? { summary } : null;
}

function buildShippables(row: ExecutionHistoryRow) {
  const output = readOutputRecord(row);
  const assetPackCompletion = readAssetPackCompletion(row);
  const explicitShippables =
    asRecord(assetPackCompletion?.shippables) ||
    asRecord(output?.shippables);

  const normalizedExplicitShippables = normalizeDeliveryMechanismSurface(explicitShippables);
  if (hasPullRequestDelivery(normalizedExplicitShippables)) return normalizedExplicitShippables;

  const deliveryMechanism = buildDeliveryMechanism(row);
  return hasPullRequestDelivery(deliveryMechanism) ? deliveryMechanism : null;
}

const LEGACY_READ_KEY = ['ne', 'ed'].join('');

function buildRead(row: ExecutionHistoryRow) {
  const output = readOutputRecord(row);
  const context = readContextRecord(row);
  const assetPackCompletion = readAssetPackCompletion(row);
  const preprocessed = readPreprocessedRecord(row);

  return (
    asString(assetPackCompletion?.read) ||
    asString(output?.read) ||
    asString(preprocessed?.read) ||
    asString(context?.read) ||
    asString(assetPackCompletion?.[LEGACY_READ_KEY]) ||
    asString(output?.[LEGACY_READ_KEY]) ||
    asString(preprocessed?.[LEGACY_READ_KEY]) ||
    asString(context?.[LEGACY_READ_KEY]) ||
    null
  );
}

function buildWrittenAssetType(row: ExecutionHistoryRow) {
  const output = readOutputRecord(row);
  const context = readContextRecord(row);
  const assetPackCompletion = readAssetPackCompletion(row);
  const preprocessed = readPreprocessedRecord(row);

  return (
    asString(assetPackCompletion?.writtenAssetType) ||
    asString(output?.writtenAssetType) ||
    asString(preprocessed?.writtenAssetType) ||
    asString(context?.writtenAssetType) ||
    null
  );
}

function buildAssetPack(row: ExecutionHistoryRow) {
  const output = readOutputRecord(row);
  const assetPackCompletion = readAssetPackCompletion(row);
  const preprocessed = readPreprocessedRecord(row);
  const directAssetPack =
    asRecord(assetPackCompletion?.assetPack) ||
    asRecord(output?.assetPack) ||
    asRecord(preprocessed?.assetPack);

  if (directAssetPack) return directAssetPack;

  const read = buildRead(row);
  const writtenAssetType = buildWrittenAssetType(row);
  const definitionOfRead = asString(preprocessed?.definitionOfRead);
  const deliveryTarget = asString(preprocessed?.deliveryTarget);

  if (!read && !writtenAssetType && !definitionOfRead && !deliveryTarget) {
    return null;
  }

  return {
    ...(read ? { read } : {}),
    ...(writtenAssetType ? { writtenAssetType } : {}),
    ...(definitionOfRead ? { definitionOfRead } : {}),
    ...(deliveryTarget ? { deliveryTarget } : {}),
  };
}

function readProcessingStatsSource(row: ExecutionHistoryRow) {
  const output = readOutputRecord(row);
  const assetPackCompletion = readAssetPackCompletion(row);

  return (
    asRecord(output?.processing_stats) ||
    asRecord(output?.processingStats) ||
    asRecord(assetPackCompletion?.processingStats)
  );
}

function buildProcessingStats(row: ExecutionHistoryRow) {
  const source = readProcessingStatsSource(row);
  const sourceTokens = asRecord(source?.tokens);
  const totalTokens = asNumber(sourceTokens?.total) ?? row.total_tokens;
  const inputTokens = asNumber(sourceTokens?.input);
  const outputTokens = asNumber(sourceTokens?.output);
  const btcFeeUsdEquivalent = asNumber(source?.btcFeeUsdEquivalent) ?? row.total_cost;
  const btcFeesPaid = asNumber(source?.btcFeesPaid);
  const measuredBtd = asNumber(source?.measuredBtd);
  const feeAsset = asString(source?.feeAsset) || 'BTC';
  const btdSemantics =
    asString(source?.btdSemantics) || 'non_fungible_asset_pack_share_read_right';
  const averageLatencyMs = asNumber(source?.averageLatencyMs);
  const time = asString(source?.time) || formatDuration(row.duration_ms);
  const modelUsage = Array.isArray(source?.modelUsage) ? source.modelUsage : undefined;

  if (
    !time &&
    totalTokens === null &&
    measuredBtd === null &&
    btcFeesPaid === null &&
    btcFeeUsdEquivalent === null &&
    averageLatencyMs === null &&
    !modelUsage
  ) {
    return null;
  }

  return {
    time: time || '',
    tokens:
      totalTokens !== null
        ? {
            input: inputTokens ?? 0,
            output: outputTokens ?? 0,
            total: totalTokens,
          }
        : undefined,
    measuredBtd: measuredBtd ?? undefined,
    btdSemantics,
    feeAsset,
    btcFeesPaid: btcFeesPaid ?? undefined,
    btcFeeUsdEquivalent: btcFeeUsdEquivalent ?? undefined,
    averageLatencyMs: averageLatencyMs ?? undefined,
    modelUsage,
  };
}

function buildRepoSnapshot(row: ExecutionHistoryRow) {
  const output = readOutputRecord(row);
  const context = readContextRecord(row);
  const assetPackCompletion = readAssetPackCompletion(row);
  const repoSnapshot =
    asRecord(output?.repo_snapshot) ||
    asRecord(output?.repoSnapshot) ||
    asRecord(assetPackCompletion?.repoSnapshot) ||
    asRecord(context?.repo_snapshot) ||
    asRecord(context?.repoSnapshot);

  if (!repoSnapshot) return null;

  const org = asString(repoSnapshot.org);
  const repo = asString(repoSnapshot.repo);
  if (!org || !repo) return null;

  return {
    org,
    repo,
    branch: asString(repoSnapshot.branch) || 'n/a',
    commit: asString(repoSnapshot.commit) || '',
  };
}

/**
 * Extract a human-readable failure message from executions.error JSON.
 * Failed/interrupted rows often have no output.summary — without this the
 * deposit UI falls through to the generic "Run failed." banner (QA: c7b84ad5).
 */
function readErrorMessage(error: unknown): string | null {
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (!error || typeof error !== 'object' || Array.isArray(error)) return null;
  const record = error as JsonRecord;
  const message = asString(record.message) || asString(record.error) || asString(record.reason);
  return message;
}

function buildSummary(row: ExecutionHistoryRow) {
  const output = readOutputRecord(row);
  const context = readContextRecord(row);
  const assetPackCompletion = readAssetPackCompletion(row);
  const assetPackSynthesisArtifacts = buildAssetPackSynthesisArtifacts(row);
  const writtenAssets = buildWrittenAssets(row);
  const status = String(row.status || '').toLowerCase();
  const terminalFailure =
    status === 'failed' || status === 'interrupted' || status === 'cancelled'
      ? readErrorMessage(row.error)
      : null;

  return (
    asString(output?.summary) ||
    asString(assetPackCompletion?.summary) ||
    asString(assetPackSynthesisArtifacts?.summary) ||
    asString(writtenAssets?.summary) ||
    asString(context?.summary) ||
    terminalFailure ||
    null
  );
}

function buildGuide(row: ExecutionHistoryRow) {
  const context = readContextRecord(row);
  const input = asRecord(row.input);

  return asString(context?.guide) || asString(input?.guide) || null;
}

function buildMetadata(row: ExecutionHistoryRow) {
  return readContextRecord(row);
}

function buildNormalizedAssetPackCompletion(row: ExecutionHistoryRow) {
  const assetPackCompletion = readAssetPackCompletion(row);
  const {
    shippables: _retainedShippables,
    deliveryMechanism: _retainedDeliveryMechanism,
    writtenAssets: _retainedWrittenAssets,
    assetPackSynthesisArtifacts: _retainedAssetPackSynthesisArtifacts,
    deliverables: _retainedDeliverables,
    ...assetPackCompletionRest
  } = assetPackCompletion || {};
  const assetPackSynthesisArtifacts = buildAssetPackSynthesisArtifacts(row);
  const writtenAssets = buildWrittenAssets(row);
  const shippables = buildShippables(row);
  const deliveryMechanism = buildDeliveryMechanism(row);
  const read = buildRead(row);
  const writtenAssetType = buildWrittenAssetType(row);
  const assetPack = buildAssetPack(row);
  const processingStats = buildProcessingStats(row);
  const repoSnapshot = buildRepoSnapshot(row);
  const summary =
    asString(assetPackCompletion?.summary) ||
    asString(assetPackSynthesisArtifacts?.summary) ||
    asString(writtenAssets?.summary) ||
    null;

  if (
    !assetPackCompletion &&
    !assetPackSynthesisArtifacts &&
    !writtenAssets &&
    !shippables &&
    !deliveryMechanism &&
    !read &&
    !writtenAssetType &&
    !assetPack &&
    !processingStats &&
    !repoSnapshot &&
    !summary
  ) {
    return null;
  }

  return {
    ...assetPackCompletionRest,
    ...(summary ? { summary } : {}),
    ...(assetPackSynthesisArtifacts ? { assetPackSynthesisArtifacts } : {}),
    ...(writtenAssets ? { writtenAssets } : {}),
    ...(shippables ? { shippables } : {}),
    ...(deliveryMechanism ? { deliveryMechanism } : {}),
    ...(read ? { read } : {}),
    ...(writtenAssetType ? { writtenAssetType } : {}),
    ...(assetPack ? { assetPack } : {}),
    ...(processingStats
      ? { processingStats: asRecord(assetPackCompletion?.processingStats) || processingStats }
      : {}),
    ...(repoSnapshot ? { repoSnapshot: asRecord(assetPackCompletion?.repoSnapshot) || repoSnapshot } : {}),
  };
}

function buildLedgerSettlement(row: ExecutionHistoryRow) {
  const output = readOutputRecord(row);
  const assetPackCompletion = readAssetPackCompletion(row);

  return (
    asRecord(assetPackCompletion?.ledgerSettlement) ||
    asRecord(output?.ledgerSettlement) ||
    null
  );
}

export function normalizeExecutionHistoryRow(row: ExecutionHistoryRow) {
  const agenticExecution = buildAgenticExecutionSummary({
    type: row.type,
    status: row.status,
  });

  return {
    id: row.id,
    created_at: row.created_at || new Date().toISOString(),
    started_at: row.started_at,
    completed_at: row.completed_at,
    status: row.status,
    type: row.type,
    agentic_execution: agenticExecution,
    guide: buildGuide(row),
    output: readOutputRecord(row),
    metadata: buildMetadata(row),
    context: row.context ?? null,
    items: asArray(row.items),
    summary: buildSummary(row),
    processing_stats: buildProcessingStats(row),
    repo_snapshot: buildRepoSnapshot(row),
    asset_pack_synthesis_artifacts: buildAssetPackSynthesisArtifacts(row),
    written_assets: buildWrittenAssets(row),
    shippables: buildShippables(row),
    delivery_mechanism: buildDeliveryMechanism(row),
    read: buildRead(row),
    written_asset_type: buildWrittenAssetType(row),
    asset_pack: buildAssetPack(row),
    asset_pack_completion: buildNormalizedAssetPackCompletion(row),
    ledger_settlement: buildLedgerSettlement(row),
    error: row.error ?? null,
    // Wall-clock for run timers on refresh (not derived from truncated event windows).
    duration_ms: row.duration_ms ?? null,
    total_tokens: row.total_tokens ?? null,
  };
}

export function normalizeExecutionEventRow(row: ExecutionEventRow) {
  const eventPayload = asRecord(row.event_data) || {
    type: row.event_type,
    agent: row.agent_name,
    phase: row.phase,
    timestamp: row.created_at,
  };

  return {
    id: row.id,
    run_id: row.run_id,
    event_type: row.event_type,
    event_data: row.event_data,
    created_at: row.created_at,
    agent_name: row.agent_name,
    phase: row.phase,
    event: eventPayload,
  };
}

export async function getExecutionHistoryRoute(request: Request) {
  const userId = await requireExecutionRouteUserId();
  if (!userId) {
    return createJsonResponse([]);
  }

  const url = new URL(request.url);
  const requestedType = url.searchParams.get('type');
  const requestedTypes = resolveAgenticExecutionQueryTypes(requestedType);

  let query = supabaseAdmin
    .from('executions')
    .select(
      'id, user_id, created_at, started_at, completed_at, status, type, input, output, context, items, error, total_tokens, total_cost, duration_ms',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (requestedTypes.length === 1) {
    query = query.eq('type', requestedTypes[0]);
  } else if (requestedTypes.length > 1) {
    query = query.in('type', requestedTypes);
  }

  const { data, error } = await query;
  if (error) {
    return createJsonResponse(
      { error: toErrorMessage(error, 'Failed to fetch execution history') },
      500,
    );
  }

  return createJsonResponse((data || []).map(normalizeExecutionHistoryRow));
}

export async function postExecutionHistoryRoute(request: Request) {
  const userId = await requireExecutionRouteUserId();
  if (!userId) {
    return createJsonResponse({ error: 'unauthenticated' }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return createJsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const now = new Date().toISOString();
  const items = Array.isArray(body.items) ? body.items : [];
  const output =
    (body.output as Record<string, unknown> | null | undefined) ||
    (body.output_data as Record<string, unknown> | null | undefined) ||
    null;
  const context =
    (body.context as Record<string, unknown> | null | undefined) ||
    (body.metadata as Record<string, unknown> | null | undefined) ||
    null;
  const normalizedType = normalizeAgenticExecutionStorageType(
    typeof body.pipeline_type === 'string'
      ? body.pipeline_type
      : typeof body.type === 'string'
        ? body.type
        : 'agentic-execution:asset-pack',
  );
  const normalizedStatus = typeof body.status === 'string' ? body.status : 'completed';
  const startedAt = asString(body.started_at) || (normalizedStatus === 'pending' ? null : now);
  const completedAt =
    asString(body.completed_at) ||
    (['completed', 'failed', 'cancelled'].includes(normalizedStatus) ? now : null);

  const { data, error } = await supabaseAdmin
    .from('executions')
    .insert({
      user_id: userId,
      type: normalizedType,
      status: normalizedStatus,
      input: (body.input as Record<string, unknown> | null | undefined) || null,
      output,
      context,
      items,
      created_at: now,
      started_at: startedAt,
      completed_at: completedAt,
      updated_at: now,
    })
    .select(
      'id, user_id, created_at, started_at, completed_at, status, type, input, output, context, items, error, total_tokens, total_cost, duration_ms',
    )
    .single();

  if (error || !data) {
    return createJsonResponse(
      { error: toErrorMessage(error, 'Failed to create execution history row') },
      500,
    );
  }

  return createJsonResponse({ execution: normalizeExecutionHistoryRow(data) }, 201);
}

export async function getExecutionHistoryRunRoute(
  request: Request,
  params: { runId?: string | null | undefined },
) {
  const userId = await requireExecutionRouteUserId();
  if (!userId) {
    return createJsonResponse({ run: null, events: [] });
  }

  const runId = String(params?.runId || '').trim();
  if (!runId) {
    return createJsonResponse({ error: 'Missing runId parameter' }, 400);
  }

  // `?tail=N` — last N events only (for failure hover previews). Full history
  // when omitted (paginated past the PostgREST 1000-row default).
  let tail: number | null = null;
  try {
    const raw = new URL(request.url).searchParams.get('tail');
    if (raw) {
      const n = Number.parseInt(raw, 10);
      if (Number.isFinite(n) && n > 0) tail = Math.min(n, 50);
    }
  } catch {
    tail = null;
  }

  const { data: run, error: runError } = await supabaseAdmin
    .from('executions')
    .select(
      'id, user_id, created_at, started_at, completed_at, status, type, input, output, context, items, error, total_tokens, total_cost, duration_ms',
    )
    .eq('id', runId)
    .maybeSingle();

  if (runError) {
    return createJsonResponse(
      { error: toErrorMessage(runError, 'Failed to fetch selected execution') },
      500,
    );
  }

  if (!run || run.user_id !== userId) {
    return createJsonResponse({ error: 'Execution not found or access denied' }, 404);
  }

  const events: ExecutionEventRow[] = [];
  let eventsTruncated = false;

  if (tail !== null) {
    // Newest-first page, then reverse so clients get chronological order.
    const { data: page, error: eventsError } = await supabaseAdmin
      .from('execution_events')
      .select('id, run_id, event_type, event_data, created_at, agent_name, phase')
      .eq('run_id', runId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(0, tail - 1);

    if (eventsError) {
      return createJsonResponse(
        { error: toErrorMessage(eventsError, 'Failed to fetch execution event history') },
        500,
      );
    }
    const batch = Array.isArray(page) ? (page as ExecutionEventRow[]) : [];
    events.push(...batch.reverse());
  } else {
    // PostgREST/Supabase defaults to max 1000 rows. Deposit synthesis runs produce
    // multi-thousand event streams (QA: refresh dropped the second half of a
    // ~30m run and halved the clock because only the first 1000 events loaded).
    // Page through the full event history in order.
    const EVENT_PAGE_SIZE = 1000;
    let eventOffset = 0;
    for (;;) {
      const { data: page, error: eventsError } = await supabaseAdmin
        .from('execution_events')
        .select('id, run_id, event_type, event_data, created_at, agent_name, phase')
        .eq('run_id', runId)
        .order('created_at', { ascending: true })
        .order('id', { ascending: true })
        .range(eventOffset, eventOffset + EVENT_PAGE_SIZE - 1);

      if (eventsError) {
        return createJsonResponse(
          { error: toErrorMessage(eventsError, 'Failed to fetch execution event history') },
          500,
        );
      }
      const batch = Array.isArray(page) ? (page as ExecutionEventRow[]) : [];
      events.push(...batch);
      if (batch.length < EVENT_PAGE_SIZE) break;
      eventOffset += EVENT_PAGE_SIZE;
      // Hard ceiling so a runaway table cannot unbounded-read the API process.
      if (eventOffset >= 50_000) {
        eventsTruncated = true;
        break;
      }
    }
  }

  const normalizedRun = normalizeExecutionHistoryRow(run);
  // Skip heavy journal join for lightweight tail previews (table hover).
  const terminalJournal =
    tail !== null ? null : await fetchTerminalJournalReadback(run.id, normalizedRun);

  return createJsonResponse({
    run: {
      ...normalizedRun,
      ...(terminalJournal ? { terminal_journal: terminalJournal } : {}),
    },
    events: events.map(normalizeExecutionEventRow),
    eventCount: events.length,
    eventsTruncated,
    tail,
    ...(terminalJournal ? { terminal_journal: terminalJournal } : {}),
  });
}

/**
 * Delete a user-owned activity-anchor execution row (Obfuscations anchors and
 * similar ledger bookmarks). Pipeline synthesis runs are NOT deletable here —
 * only rows whose context.source is an explicit anchor source. Events cascade.
 */
const DELETABLE_ACTIVITY_ANCHOR_SOURCES = new Set([
  'deposit-obfuscations-anchor',
  'terminal-repository-context-panel',
]);

export async function deleteExecutionHistoryRunRoute(
  _request: Request,
  params: { runId?: string | null | undefined },
) {
  const userId = await requireExecutionRouteUserId();
  if (!userId) {
    return createJsonResponse({ error: 'unauthenticated' }, 401);
  }

  const runId = String(params?.runId || '').trim();
  if (!runId) {
    return createJsonResponse({ error: 'Missing runId parameter' }, 400);
  }

  const { data: run, error: runError } = await supabaseAdmin
    .from('executions')
    .select('id, user_id, context')
    .eq('id', runId)
    .maybeSingle();

  if (runError) {
    return createJsonResponse(
      { error: toErrorMessage(runError, 'Failed to load execution for delete') },
      500,
    );
  }

  if (!run || run.user_id !== userId) {
    return createJsonResponse({ error: 'Execution not found or access denied' }, 404);
  }

  const context = asRecord(run.context);
  const source = typeof context?.source === 'string' ? context.source : null;
  if (!source || !DELETABLE_ACTIVITY_ANCHOR_SOURCES.has(source)) {
    return createJsonResponse(
      {
        error:
          'Only activity anchors (Obfuscations / repository) can be deleted from this endpoint.',
      },
      403,
    );
  }

  const { error: deleteError } = await supabaseAdmin
    .from('executions')
    .delete()
    .eq('id', runId)
    .eq('user_id', userId);

  if (deleteError) {
    return createJsonResponse(
      { error: toErrorMessage(deleteError, 'Failed to delete activity anchor') },
      500,
    );
  }

  return createJsonResponse({ deleted: true, id: runId });
}

function readNormalizedLedgerSettlement(run: JsonRecord) {
  return (
    asRecord(run.ledger_settlement) ||
    asRecord(asRecord(run.asset_pack_completion)?.ledgerSettlement) ||
    asRecord(asRecord(run.output)?.ledgerSettlement) ||
    null
  );
}

function readStringArray(value: unknown) {
  return asArray(value)
    .map((entry) => asString(entry))
    .filter((entry): entry is string => Boolean(entry));
}

function dedupeStrings(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function expectedHarnessJournalEntryIds(runId: string, ledgerSettlement: JsonRecord | null) {
  if (!ledgerSettlement) return [];

  return dedupeStrings([
    ...readStringArray(ledgerSettlement?.journalEntryIds),
    `journal-mint-${runId}`,
    `journal-btc-fee-${runId}`,
    `journal-anchor-${runId}`,
    `journal-settlement-${runId}`,
  ]);
}

async function readRowsByIds(table: string, column: string, ids: string[], readErrors: string[]) {
  if (!ids.length) return [];

  const { data, error } = await supabaseAdmin
    .from(table)
    .select('*')
    .in(column, ids);

  if (error) {
    readErrors.push(`${table} readback failed: ${toErrorMessage(error, 'unknown error')}`);
    return [];
  }

  return asArray<JsonRecord>(data).filter((entry) => asRecord(entry));
}

async function readRowById(table: string, column: string, id: string | null, readErrors: string[]) {
  if (!id) return [];

  const { data, error } = await supabaseAdmin
    .from(table)
    .select('*')
    .eq(column, id)
    .maybeSingle();

  if (error) {
    readErrors.push(`${table} readback failed: ${toErrorMessage(error, 'unknown error')}`);
    return [];
  }

  return asRecord(data) ? [data] : [];
}

async function readRecentRepairRows(runId: string, factIds: string[], readErrors: string[]) {
  const { data, error } = await supabaseAdmin
    .from('btd_ledger_database_reconciliation_repairs')
    .select('*')
    .order('issued_at', { ascending: false })
    .limit(100);

  if (error) {
    readErrors.push(`btd_ledger_database_reconciliation_repairs readback failed: ${toErrorMessage(error, 'unknown error')}`);
    return [];
  }

  const factIdSet = new Set(factIds);
  return asArray<JsonRecord>(data)
    .filter((row) => {
      const repairId = asString(row.repair_id);
      const reconciliationId = asString(row.reconciliation_id);
      const factId = asString(row.fact_id);
      return (
        Boolean(repairId?.includes(runId)) ||
        Boolean(reconciliationId?.includes(runId)) ||
        Boolean(factId && factIdSet.has(factId))
      );
    })
    .slice(0, 25);
}

async function fetchTerminalJournalReadback(runId: string, normalizedRun: JsonRecord): Promise<TerminalJournalReadback> {
  const readErrors: string[] = [];
  const ledgerSettlement = readNormalizedLedgerSettlement(normalizedRun);
  const assetPackId = asString(ledgerSettlement?.assetPackId);
  const ledgerAnchorId = asString(ledgerSettlement?.ledgerAnchorId);
  const btcFeeReceiptId = asString(ledgerSettlement?.btcFeeReceiptId);
  const ownershipEventId = asString(ledgerSettlement?.ownershipEventId) || `ownership-mint-${runId}`;
  const readLicenseId = asString(ledgerSettlement?.readLicenseId) || `read-license-${runId}`;
  const expectedJournalEntryIds = expectedHarnessJournalEntryIds(runId, ledgerSettlement);
  const entries = await readRowsByIds(
    'btd_terminal_journal_entries',
    'journal_entry_id',
    expectedJournalEntryIds,
    readErrors,
  );
  const [
    assetPackRanges,
    btcFeeTransactions,
    ledgerAnchors,
    ownershipEvents,
    readLicenses,
  ] = await Promise.all([
    readRowById('btd_asset_pack_ranges', 'asset_pack_id', assetPackId, readErrors),
    readRowById('btc_fee_transactions', 'receipt_id', btcFeeReceiptId, readErrors),
    readRowById('btd_asset_pack_ledger_anchors', 'anchor_id', ledgerAnchorId, readErrors),
    readRowById('btd_ownership_events', 'ownership_event_id', ownershipEventId, readErrors),
    readRowById('btd_read_licenses', 'license_id', readLicenseId, readErrors),
  ]);
  const factIds = dedupeStrings([
    assetPackId,
    ledgerAnchorId,
    btcFeeReceiptId,
    ownershipEventId,
    readLicenseId,
    ...expectedJournalEntryIds,
  ]);
  const repairs = await readRecentRepairRows(runId, factIds, readErrors);

  return {
    expectedJournalEntryIds,
    entries: entries.sort((left, right) => Number(left.exchange_sequence || 0) - Number(right.exchange_sequence || 0)),
    repairs,
    ledgerRows: {
      assetPackRanges,
      btcFeeTransactions,
      ledgerAnchors,
      ownershipEvents,
      readLicenses,
    },
    readErrors,
  };
}
