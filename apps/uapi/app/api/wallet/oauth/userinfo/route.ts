import {
  buildBitcoinWalletUserInfo,
  verifyBitcoinWalletAccessToken,
} from '@bitcode/auth/bitcoin-wallet-oauth-provider';
import {
  bitcodeServerTelemetry,
  compactBitcodeServerId,
} from '@/lib/bitcode-server-telemetry';

export const runtime = 'nodejs';

function readBearerToken(request: Request) {
  const authorization = request.headers.get('authorization') ?? '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
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

async function handleUserInfo(request: Request) {
  const token = readBearerToken(request);
  if (!token) {
    bitcodeServerTelemetry('warn', 'wallet-oauth', 'userinfo-missing-token');
    return jsonResponse({ error: 'missing_token' }, { status: 401 });
  }

  try {
    const payload = verifyBitcoinWalletAccessToken(token);
    bitcodeServerTelemetry('info', 'wallet-oauth', 'userinfo-read', {
      walletProvider: payload.wallet.provider,
      walletAddress: compactBitcodeServerId(payload.wallet.address),
      network: payload.wallet.network,
    });
    return jsonResponse(buildBitcoinWalletUserInfo(payload));
  } catch (error) {
    bitcodeServerTelemetry('warn', 'wallet-oauth', 'userinfo-invalid-token', {
      message: error instanceof Error ? error.message : String(error),
    });
    return jsonResponse(
      {
        error: 'invalid_token',
        error_description: error instanceof Error ? error.message : 'Bitcoin wallet token is invalid.',
      },
      { status: 401 },
    );
  }
}

export const GET = handleUserInfo;
export const POST = handleUserInfo;
