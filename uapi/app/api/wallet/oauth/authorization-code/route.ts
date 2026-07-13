import {
  BITCODE_BITCOIN_OAUTH_SCOPES,
  createBitcoinWalletAuthorizationCode,
} from '@bitcode/auth/bitcoin-wallet-oauth-provider';
import {
  bitcodeServerTelemetry,
  compactBitcodeServerId,
} from '@/lib/bitcode-server-telemetry';

export const runtime = 'nodejs';

type AuthorizationCodeRequest = {
  oauth?: {
    client_id?: unknown;
    redirect_uri?: unknown;
    scope?: unknown;
    code_challenge?: unknown;
    code_challenge_method?: unknown;
  };
  wallet?: unknown;
};

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

function readWalletTelemetry(wallet: unknown) {
  if (!wallet || typeof wallet !== 'object') return null;
  const record = wallet as Record<string, unknown>;
  return {
    provider: readString(record.provider),
    address: compactBitcodeServerId(readString(record.address)),
    network: readString(record.network),
    proofKind: readString(record.proofKind),
  };
}

export async function POST(request: Request) {
  let body: AuthorizationCodeRequest;
  try {
    body = (await request.json()) as AuthorizationCodeRequest;
  } catch {
    bitcodeServerTelemetry('warn', 'wallet-oauth', 'authorization-code-invalid-json');
    return jsonResponse({ error: 'Invalid Bitcoin wallet OAuth request body.' }, { status: 400 });
  }

  try {
    bitcodeServerTelemetry('info', 'wallet-oauth', 'authorization-code-request', {
      clientId: readString(body.oauth?.client_id),
      redirectUri: readString(body.oauth?.redirect_uri),
      scope: readString(body.oauth?.scope) ?? BITCODE_BITCOIN_OAUTH_SCOPES,
      wallet: readWalletTelemetry(body.wallet),
    });
    const code = createBitcoinWalletAuthorizationCode({
      clientId: readString(body.oauth?.client_id) ?? '',
      redirectUri: readString(body.oauth?.redirect_uri) ?? '',
      scope: readString(body.oauth?.scope) ?? BITCODE_BITCOIN_OAUTH_SCOPES,
      codeChallenge: readString(body.oauth?.code_challenge),
      codeChallengeMethod: readString(body.oauth?.code_challenge_method),
      wallet: (body.wallet ?? {}) as any,
    });

    bitcodeServerTelemetry('info', 'wallet-oauth', 'authorization-code-issued', {
      wallet: readWalletTelemetry(body.wallet),
      expiresIn: 300,
    });
    return jsonResponse({
      code,
      expires_in: 300,
    });
  } catch (error) {
    bitcodeServerTelemetry('warn', 'wallet-oauth', 'authorization-code-failed', {
      message: error instanceof Error ? error.message : String(error),
      wallet: readWalletTelemetry(body.wallet),
    });
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Bitcoin wallet OAuth authorization failed.' },
      { status: 400 },
    );
  }
}
