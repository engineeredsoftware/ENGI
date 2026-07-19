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

  const { email, name, purchaseUrl, userId } = body;

  let to = typeof email === 'string' ? email.trim() : '';
  if (typeof userId === 'string' && userId.trim()) {
    // Zero balance is critical — preference cannot disable, but email must exist.
    const decision = await shouldSendUserEmail(userId.trim(), 'critical_updates');
    if (!decision.allowed) {
      emitBtdBalanceEvent({ type: 'ZERO_BALANCE', userId: userId.trim(), balance: 0 });
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: decision.reason ?? 'missing_email',
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
    subject: 'Out of $BTD',
    template: 'out_of_btd',
    vars: {
      name: name || '',
      purchaseUrl: purchaseUrl || `${origin}/#pricing`,
      origin,
      year: new Date().getFullYear(),
    },
  });

  emitBtdBalanceEvent({
    type: 'ZERO_BALANCE',
    userId: typeof userId === 'string' && userId.trim() ? userId.trim() : to,
    balance: 0,
  });
  return NextResponse.json({ ok: true });
};

export const POST = traceRoute('/notifications/out-of-btd', POSTHandler);
