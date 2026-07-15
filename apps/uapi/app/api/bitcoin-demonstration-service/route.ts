import { NextResponse } from 'next/server';

import { getBitcodeAppContext, toBitcodeErrorResponse } from '@/lib/bitcode-app-context';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json(getBitcodeAppContext().getBitcoinDemonstrationService());
  } catch (error) {
    return toBitcodeErrorResponse(error);
  }
}
