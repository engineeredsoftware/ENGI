import { NextResponse } from 'next/server';

import {
  getBitcodeAppContext,
  readBitcodeRequestBody,
  toBitcodeErrorResponse
} from '@/lib/bitcode-app-context';
import { requireBitcodeSignedTransactionReadiness } from '@/components/bitcode/pipeline/models/transaction-route-readiness';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await readBitcodeRequestBody(request);
    const readiness = await requireBitcodeSignedTransactionReadiness(body, {
      requiresRepositoryAnchor: true,
    });
    return NextResponse.json(
      getBitcodeAppContext().createDeposit({
        ...body,
        repositoryProvider: readiness.repositoryProvider,
      }),
    );
  } catch (error) {
    return toBitcodeErrorResponse(error);
  }
}
