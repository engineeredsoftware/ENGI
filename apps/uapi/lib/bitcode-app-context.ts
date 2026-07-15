import { createAppContext } from '@bitcode/specifying';
import { NextResponse } from 'next/server';

import { resolveBitcodeAppContextOptions } from '@/lib/bitcode-app-context-options';

type StatusError = Error & { statusCode?: number | undefined };

const bitcodeAppContext = createAppContext(resolveBitcodeAppContextOptions());

export function getBitcodeAppContext() {
  return bitcodeAppContext;
}

export async function readBitcodeRequestBody(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const error = new Error('Invalid JSON body.') as StatusError;
    error.statusCode = 400;
    throw error;
  }
}

export function toBitcodeErrorResponse(error: unknown) {
  const resolvedError = error instanceof Error ? (error as StatusError) : (new Error('Unknown error.') as StatusError);
  if (!resolvedError.statusCode && /No candidates survived into the asset pack/i.test(resolvedError.message || '')) {
    resolvedError.statusCode = 409;
  }
  if (!resolvedError.statusCode && /(Finding Fits|fit search) cannot proceed/i.test(resolvedError.message || '')) {
    resolvedError.statusCode = 409;
  }
  return NextResponse.json(
    { error: resolvedError.message || 'Unknown error.' },
    { status: resolvedError.statusCode || 500 }
  );
}
