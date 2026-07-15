import { NextResponse } from 'next/server';

import { getBitcodeAppContext, toBitcodeErrorResponse } from '@/lib/bitcode-app-context';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const principal = url.searchParams.get('principal') || undefined;
    return NextResponse.json(getBitcodeAppContext().getState(principal));
  } catch (error) {
    return toBitcodeErrorResponse(error);
  }
}
