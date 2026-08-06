import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';

import { getMockOrbitalNotifications, isOrbitalNotificationsMockMode } from '../_shared';

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

export async function PATCH(
  request: Request,
  { params }: { params: { notificationId: string } },
) {
  if (isOrbitalNotificationsMockMode()) {
    const body = await request.json().catch(() => ({}));
    const row = getMockOrbitalNotifications().find((item) => item.id === params.notificationId);
    if (!row) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...row,
      is_read: Boolean(body?.read),
      read: Boolean(body?.read),
    });
  }

  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const read = Boolean(body?.read);

  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: read })
    .eq('id', params.notificationId)
    .eq('user_id', userId)
    .select('id, user_id, type, title, message, data, is_read, created_at')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message || 'Failed to update notification' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...data,
    read: Boolean(data.is_read),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { notificationId: string } },
) {
  if (isOrbitalNotificationsMockMode()) {
    return NextResponse.json({ ok: true, deletedId: params.notificationId });
  }

  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from('notifications')
    .delete()
    .eq('id', params.notificationId)
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message || 'Failed to delete notification' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deletedId: params.notificationId });
}
