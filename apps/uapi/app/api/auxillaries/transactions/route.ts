import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';

export const runtime = 'nodejs';

type TransactionRow = {
  id?: string | null;
  created_at?: string | null;
  amount?: number | string | null;
  change?: number | string | null;
  balance?: number | string | null;
  operation_type?: string | null;
  metadata?: Record<string, unknown> | null;
};

function parseNumeric(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeDelta(row: TransactionRow) {
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
    return NextResponse.json({ transactions: [], count: 0 }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get('pageSize') || 10)));
  const fromIndex = (page - 1) * pageSize;
  const toIndex = fromIndex + pageSize - 1;

  const { data, error, count } = await supabaseAdmin
    .from('user_credit_usages')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(fromIndex, toIndex);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let runningBalance = 0;
  const transactions = ((data || []) as TransactionRow[]).map((row, index) => {
    const change = normalizeDelta(row);
    runningBalance = row.balance != null ? parseNumeric(row.balance) : runningBalance + change;
    return {
      id: row.id || `usage-${fromIndex + index}`,
      created_at: row.created_at || new Date().toISOString(),
      description:
        typeof row.metadata?.description === 'string'
          ? row.metadata.description
          : String(row.operation_type || 'Bitcode activity'),
      change,
      balance: row.balance != null ? parseNumeric(row.balance) : runningBalance,
    };
  });

  return NextResponse.json({
    transactions,
    count: count ?? transactions.length,
  });
}
