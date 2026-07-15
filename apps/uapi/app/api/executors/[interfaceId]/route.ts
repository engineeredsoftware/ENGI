import { NextResponse } from 'next/server';

import {
  getBitcodeAppContext,
  readBitcodeRequestBody,
  toBitcodeErrorResponse,
} from '@/lib/bitcode-app-context';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: { interfaceId: string } },
) {
  try {
    const body = await readBitcodeRequestBody(request);
    return NextResponse.json(
      await getBitcodeAppContext().executeLocalExecutorById(params.interfaceId, body),
    );
  } catch (error) {
    return toBitcodeErrorResponse(error);
  }
}
