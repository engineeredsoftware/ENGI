import { NextResponse } from 'next/server';

import { EDGETIMES_TOPOLOGY, getEdgetimesTopologySummary } from '@/app/edgetimes/edgetimes-topology';

export async function GET() {
  return NextResponse.json({
    ok: true,
    topology: EDGETIMES_TOPOLOGY,
    summary: getEdgetimesTopologySummary(),
  });
}
