import { NextResponse } from 'next/server';

import { getBitcodeAppContext, toBitcodeErrorResponse } from '@/lib/bitcode-app-context';

export const runtime = 'nodejs';

type ExternalRealizationEnvironmentMode = 'production' | 'staging' | 'development' | 'mock';

const EXTERNAL_REALIZATION_ENVIRONMENT_MODES = new Set<ExternalRealizationEnvironmentMode>([
  'production',
  'staging',
  'development',
  'mock',
]);

function normalizeExternalEnvironmentMode(value: string | null | undefined): ExternalRealizationEnvironmentMode | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  return EXTERNAL_REALIZATION_ENVIRONMENT_MODES.has(normalized as ExternalRealizationEnvironmentMode)
    ? (normalized as ExternalRealizationEnvironmentMode)
    : null;
}

function normalizeBitcodeEnvironment(value: string | null | undefined): ExternalRealizationEnvironmentMode | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === 'testnet' || normalized === 'staging-testnet') return 'staging';
  if (normalized === 'mainnet') return 'production';
  return normalizeExternalEnvironmentMode(normalized);
}

function resolveExternalRealizationEnvironmentMode(
  requestUrl: URL,
  env: NodeJS.ProcessEnv = process.env,
): ExternalRealizationEnvironmentMode | null {
  const explicitMode = normalizeExternalEnvironmentMode(requestUrl.searchParams.get('environmentMode'));
  if (explicitMode) return explicitMode;

  const protocolMode = normalizeExternalEnvironmentMode(env.BITCODE_V24_ENVIRONMENT_MODE);
  if (protocolMode) return protocolMode;

  const bitcodeMode = normalizeBitcodeEnvironment(env.NEXT_PUBLIC_BITCODE_ENV || env.BITCODE_ENV);
  if (bitcodeMode) return bitcodeMode;

  if (env.VERCEL_ENV === 'preview') return 'staging';
  if (env.VERCEL_ENV === 'production') return 'production';

  return null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    return NextResponse.json(
      getBitcodeAppContext().getExternalRealization({
        environmentMode: resolveExternalRealizationEnvironmentMode(url),
      }),
    );
  } catch (error) {
    return toBitcodeErrorResponse(error);
  }
}
