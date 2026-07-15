import { NextResponse } from 'next/server';
import { traceRoute } from '@bitcode/observability';
import { sendEmail, emitBtdBalanceEvent } from '@bitcode/notifications';

const POSTHandler = async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, name, balance, threshold, purchaseUrl } = body;
  if (!email || balance == null || threshold == null) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  await sendEmail({
    to: email,
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

  emitBtdBalanceEvent({ type: 'LOW_BALANCE', userId: email, balance, threshold });
  return NextResponse.json({ ok: true });
};

export const POST = traceRoute('/notifications/low-btd-reminder', POSTHandler);
