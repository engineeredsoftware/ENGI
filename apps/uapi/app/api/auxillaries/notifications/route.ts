import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';

import {
  getMockOrbitalNotifications,
  isOrbitalNotificationsMockMode,
  normalizeOrbitalNotificationRow,
} from './_shared';

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

export async function GET(request: Request) {
  if (isOrbitalNotificationsMockMode()) {
    const limit = Math.max(1, Math.min(Number(new URL(request.url).searchParams.get('limit') || 25), 100));
    return NextResponse.json(
      getMockOrbitalNotifications().slice(0, limit).map(normalizeOrbitalNotificationRow),
    );
  }

  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json([]);
  }

  const limit = Math.max(1, Math.min(Number(new URL(request.url).searchParams.get('limit') || 25), 100));

  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('id, user_id, type, title, message, data, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }

  return NextResponse.json((data || []).map(normalizeOrbitalNotificationRow));
}
