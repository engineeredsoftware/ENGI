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

  const { email, name, purchaseUrl } = body;
  if (!email) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  await sendEmail({
    to: email,
    subject: 'Out of $BTD',
    template: 'out_of_btd',
    vars: {
      name: name || '',
      purchaseUrl: purchaseUrl || `${origin}/#pricing`,
      origin,
      year: new Date().getFullYear(),
    },
  });

  emitBtdBalanceEvent({ type: 'ZERO_BALANCE', userId: email, balance: 0 });
  return NextResponse.json({ ok: true });
};

export const POST = traceRoute('/notifications/out-of-btd', POSTHandler);
