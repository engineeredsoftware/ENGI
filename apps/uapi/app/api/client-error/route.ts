import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let payload = null;

  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  if (process.env.NODE_ENV !== 'production' && payload) {
    console.error('Client error telemetry', payload);
  }

  return NextResponse.json({ ok: true });
}
