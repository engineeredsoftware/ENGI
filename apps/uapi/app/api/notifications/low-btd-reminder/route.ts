import { NextResponse } from 'next/server';
import { traceRoute } from '@bitcode/observability';
import { sendEmail, emitBtdBalanceEvent, shouldSendUserEmail } from '@bitcode/notifications';

const POSTHandler = async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, name, balance, threshold, purchaseUrl, userId } = body;
  if (balance == null || threshold == null) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  let to = typeof email === 'string' ? email.trim() : '';
  if (typeof userId === 'string' && userId.trim()) {
    // Low balance is personal account activity.
    const decision = await shouldSendUserEmail(userId.trim(), 'your_notifications');
    if (!decision.allowed) {
      emitBtdBalanceEvent({
        type: 'LOW_BALANCE',
        userId: userId.trim(),
        balance,
        threshold,
      });
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: decision.reason ?? 'preference_or_missing_email',
      });
    }
    to = decision.email || to;
  }

  if (!to) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  await sendEmail({
    to,
    subject: `Low $BTD reminder: ${balance} $BTD remaining`,
    template: 'low_btd_reminder',
    vars: {
      name: name || '',
      balance,
      threshold,
      purchaseUrl: purchaseUrl || `${origin}/#pricing`,
      origin,
      year: new Date().getFullYear(),
    } as Record<string, string | number>,
  });

  emitBtdBalanceEvent({
    type: 'LOW_BALANCE',
    userId: typeof userId === 'string' && userId.trim() ? userId.trim() : to,
    balance,
    threshold,
  });
  return NextResponse.json({ ok: true });
};

export const POST = traceRoute('/notifications/low-btd-reminder', POSTHandler);
