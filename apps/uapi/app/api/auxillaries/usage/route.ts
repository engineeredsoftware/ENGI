import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';

export const runtime = 'nodejs';

type UsageRow = {
  created_at?: string | null;
  amount?: number | string | null;
  change?: number | string | null;
  balance?: number | string | null;
  operation_type?: string | null;
};

function parseNumeric(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeDelta(row: UsageRow) {
  if (row.change != null) {
    return parseNumeric(row.change);
  }

  const amount = parseNumeric(row.amount);
  const operationType = String(row.operation_type || '').toLowerCase();
  return operationType.includes('purchase') ||
    operationType.includes('grant') ||
    operationType.includes('mint') ||
    operationType.includes('btd') ||
    operationType.includes('share') ||
    operationType.includes('settlement')
    ? Math.abs(amount)
    : -Math.abs(amount);
}

function bucketKey(date: Date, aggregate: 'daily' | 'weekly' | 'monthly') {
  if (aggregate === 'monthly') {
    return date.toISOString().slice(0, 7);
  }

  if (aggregate === 'weekly') {
    const weekStart = new Date(date);
    weekStart.setUTCDate(date.getUTCDate() - date.getUTCDay());
    return weekStart.toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return null;
  }

  return user;
}

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const url = new URL(request.url);
  const aggregate = (url.searchParams.get('aggregate') || 'daily') as 'daily' | 'weekly' | 'monthly';
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  const builder = supabaseAdmin
    .from('user_credit_usages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (from && typeof (builder as any).gte === 'function') {
    (builder as any).gte('created_at', `${from}T00:00:00.000Z`);
  }
  if (to && typeof (builder as any).lte === 'function') {
    (builder as any).lte('created_at', `${to}T23:59:59.999Z`);
  }

  const { data, error } = await builder;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []) as UsageRow[];
  let runningBalance = 0;
  const grouped = new Map<
    string,
    { purchased: number; spent: number; net: number; balance: number; date: string }
  >();

  for (const row of rows) {
    const createdAt = row.created_at ? new Date(row.created_at) : new Date();
    const delta = normalizeDelta(row);
    runningBalance = row.balance != null ? parseNumeric(row.balance) : runningBalance + delta;
    const key = bucketKey(createdAt, aggregate);
    const current = grouped.get(key) || { purchased: 0, spent: 0, net: 0, balance: runningBalance, date: key };
    if (delta >= 0) {
      current.purchased += delta;
    } else {
      current.spent += Math.abs(delta);
    }
    current.net += delta;
    current.balance = runningBalance;
    grouped.set(key, current);
  }

  const values = Array.from(grouped.values()).sort((left, right) => left.date.localeCompare(right.date));
  if (!url.searchParams.has('aggregate')) {
    return NextResponse.json(values.map(({ date, purchased, spent, net, balance }) => ({ date, purchased, spent, net, balance })));
  }

  return NextResponse.json(values.map(({ date, purchased, spent, net, balance }) => ({ period: date, purchased, spent, net, balance })));
}
