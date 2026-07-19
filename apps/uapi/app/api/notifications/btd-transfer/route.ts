import { NextResponse } from 'next/server';
import { traceRoute } from '@bitcode/observability';
import { sendEmail, shouldSendUserEmail } from '@bitcode/notifications';

const POSTHandler = async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    recipientEmail,
    recipientName,
    senderName,
    btdAmount,
    newBtdBalance,
    newBalance,
    userId,
  } = body;
  const resolvedBtdAmount = btdAmount;
  const resolvedNewBtdBalance = newBtdBalance ?? newBalance;

  if (!senderName || resolvedBtdAmount == null || resolvedNewBtdBalance == null) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  let to = typeof recipientEmail === 'string' ? recipientEmail.trim() : '';
  if (typeof userId === 'string' && userId.trim()) {
    // Personal activity → "Your Notifications" preference.
    const decision = await shouldSendUserEmail(userId.trim(), 'your_notifications');
    if (!decision.allowed) {
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
    subject: `${senderName} sent you ${resolvedBtdAmount} $BTD`,
    template: 'btd_transfer',
    vars: {
      recipientName: recipientName || '',
      senderName,
      btdAmount: resolvedBtdAmount,
      newBtdBalance: resolvedNewBtdBalance,
      origin,
      year: new Date().getFullYear(),
    },
  });

  return NextResponse.json({ ok: true });
};

export const POST = traceRoute('/notifications/btd-transfer', POSTHandler);
