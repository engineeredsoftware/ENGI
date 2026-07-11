import { NextResponse } from 'next/server';
import { normalizeExecutionHistoryRow } from '@bitcode/api/src/routes/executions';

import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';

import {
  buildBitcodeActivityRecordFromExecutionHistory,
  buildBitcodeActivityRecordFromNotification,
  summarizeBitcodeActivityKinds,
} from '@/components/bitcode/activity/bitcode-activity-model';
import { MOCK_RUNS } from '@/components/bitcode/pipeline/models/pipeline-run-data';
import {
  getMockOrbitalNotifications,
  isOrbitalNotificationsMockMode,
} from '@/app/api/auxillaries/notifications/_shared';

export const runtime = 'nodejs';

async function requireUserId() {
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

function buildSummary(records: ReturnType<typeof buildBitcodeActivityRecordFromExecutionHistory>[]) {
  const kinds = summarizeBitcodeActivityKinds(records);
  return {
    total: records.length,
    kinds,
    transactions: records.filter((record) => record.kind === 'transaction').length,
    executions: records.filter((record) => record.kind === 'execution').length,
    notifications: records.filter((record) => record.kind === 'notification').length,
    network: records.filter((record) => record.scope === 'network').length,
    personal: records.filter((record) => record.scope === 'personal').length,
  };
}

export async function GET(request: Request) {
  const limit = Math.max(1, Math.min(Number(new URL(request.url).searchParams.get('limit') || 50), 100));

  if (isOrbitalNotificationsMockMode()) {
    const records = [
      ...MOCK_RUNS.map((run) =>
        buildBitcodeActivityRecordFromExecutionHistory({
          id: run.id,
          created_at: run.created_at,
          status: run.status,
          type: run.type,
          summary: run.summary,
          repo_snapshot: run.repository
            ? {
                org: run.repository.split('/')[0] || null,
                repo: run.repository.split('/')[1] || null,
                branch: run.branch || null,
              }
            : null,
        }),
      ),
      ...getMockOrbitalNotifications().map((row) =>
        buildBitcodeActivityRecordFromNotification({
          id: row.id,
          type: row.type,
          title: row.title,
          message: row.message,
          data: row.data,
          read: Boolean(row.is_read),
          created_at: row.created_at,
        }),
      ),
    ]
      .sort((left, right) => String(right.timestamp || '').localeCompare(String(left.timestamp || '')))
      .slice(0, limit);

    return NextResponse.json({ ok: true, records, summary: buildSummary(records) });
  }

  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({
      ok: true,
      records: [],
      summary: {
        total: 0,
        kinds: [],
        transactions: 0,
        executions: 0,
        notifications: 0,
        network: 0,
        personal: 0,
      },
    });
  }

  const [executionsResult, notificationsResult] = await Promise.all([
    supabaseAdmin
      .from('executions')
      .select(
        'id, user_id, created_at, started_at, completed_at, status, type, input, output, context, items, error, total_tokens, total_cost, duration_ms',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from('notifications')
      .select('id, user_id, type, title, message, data, is_read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  if (executionsResult.error) {
    return NextResponse.json({ error: executionsResult.error.message || 'Failed to fetch activity' }, { status: 500 });
  }

  if (notificationsResult.error) {
    return NextResponse.json({ error: notificationsResult.error.message || 'Failed to fetch activity' }, { status: 500 });
  }

  const records = [
    ...(executionsResult.data || []).map((row: any) =>
      buildBitcodeActivityRecordFromExecutionHistory(normalizeExecutionHistoryRow(row)),
    ),
    ...(notificationsResult.data || []).map((row: any) =>
      buildBitcodeActivityRecordFromNotification({
        id: row.id,
        type: row.type,
        title: row.title,
        message: row.message,
        data: row.data,
        read: Boolean(row.is_read),
        created_at: row.created_at,
      }),
    ),
  ]
    .sort((left, right) => String(right.timestamp || '').localeCompare(String(left.timestamp || '')))
    .slice(0, limit);

  return NextResponse.json({ ok: true, records, summary: buildSummary(records) });
}
