import {
  createBitcoinWalletAccessToken,
  getBitcoinWalletOAuthClientId,
  readOAuthClientCredentials,
  validateOAuthClientCredentials,
  verifyBitcoinWalletAuthorizationCode,
  verifyPkce,
} from '@bitcode/auth/bitcoin-wallet-oauth-provider';
import {
  bitcodeServerLifecycleTelemetry,
  bitcodeServerTelemetry,
  compactBitcodeServerId,
} from '@/lib/bitcode-server-telemetry';

export const runtime = 'nodejs';

function readString(value: FormDataEntryValue | null) {
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

async function readBody(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const json = await request.json();
    return new URLSearchParams(
      Object.entries(json && typeof json === 'object' ? json : {}).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : value == null ? '' : String(value),
      ]),
    );
  }

  return new URLSearchParams(await request.text());
}

function classifyTokenFailure(message: string): string {
  if (/signature mismatch|Malformed OAuth token|token kind/i.test(message)) {
    return 'code_signature_or_secret_mismatch';
  }
  if (/expired/i.test(message)) return 'code_expired';
  if (/Redirect URI/i.test(message)) return 'redirect_uri_mismatch';
  if (/PKCE/i.test(message)) return 'pkce_failed';
  if (/CLIENT_SECRET|secret is required/i.test(message)) return 'server_secret_missing';
  if (/Invalid Bitcoin wallet OAuth client/i.test(message)) return 'client_id_mismatch';
  return 'invalid_grant';
}

export async function POST(request: Request) {
  let body: URLSearchParams;
  try {
    body = await readBody(request);
  } catch {
    bitcodeServerLifecycleTelemetry('warn', 'wallet-oauth', 'token-invalid-body');
    bitcodeServerTelemetry('warn', 'wallet-oauth', 'token-invalid-body');
    return jsonResponse({ error: 'invalid_request', error_description: 'Invalid OAuth token body.' }, { status: 400 });
  }

  const credentials = readOAuthClientCredentials(request, body);
  let clientValid = false;
  try {
    clientValid = validateOAuthClientCredentials(credentials);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    bitcodeServerLifecycleTelemetry('error', 'wallet-oauth', 'token-server-misconfigured', {
      message: message.slice(0, 180),
      hasClientId: Boolean(credentials.clientId),
      expectedClientId: getBitcoinWalletOAuthClientId(),
      failureClass: 'server_secret_missing',
    });
    return jsonResponse(
      {
        error: 'server_error',
        error_description:
          'Bitcoin wallet OAuth is misconfigured on this deploy (missing BITCODE_BITCOIN_OAUTH_CLIENT_SECRET).',
      },
      { status: 500 },
    );
  }

  if (!clientValid) {
    bitcodeServerLifecycleTelemetry('warn', 'wallet-oauth', 'token-invalid-client', {
      clientId: credentials.clientId || null,
      expectedClientId: getBitcoinWalletOAuthClientId(),
      hasClientSecret: Boolean(credentials.clientSecret),
      failureClass: 'client_credentials_mismatch',
    });
    bitcodeServerTelemetry('warn', 'wallet-oauth', 'token-invalid-client', {
      clientId: credentials.clientId,
    });
    return jsonResponse(
      {
        error: 'invalid_client',
        error_description:
          'OAuth client_id/client_secret do not match this deploy. Supabase custom provider secret must equal BITCODE_BITCOIN_OAUTH_CLIENT_SECRET on the Token URL host.',
      },
      { status: 401 },
    );
  }

  if (body.get('grant_type') !== 'authorization_code') {
    bitcodeServerLifecycleTelemetry('warn', 'wallet-oauth', 'token-unsupported-grant', {
      grantType: body.get('grant_type'),
    });
    bitcodeServerTelemetry('warn', 'wallet-oauth', 'token-unsupported-grant', {
      grantType: body.get('grant_type'),
    });
    return jsonResponse({ error: 'unsupported_grant_type' }, { status: 400 });
  }

  const code = body.get('code');
  if (!code) {
    bitcodeServerLifecycleTelemetry('warn', 'wallet-oauth', 'token-missing-code', {
      clientId: credentials.clientId,
    });
    bitcodeServerTelemetry('warn', 'wallet-oauth', 'token-missing-code', {
      clientId: credentials.clientId,
    });
    return jsonResponse({ error: 'invalid_request', error_description: 'Missing authorization code.' }, { status: 400 });
  }

  try {
    const codePayload = verifyBitcoinWalletAuthorizationCode(code);
    const redirectUri = readString(body.get('redirect_uri'));
    if (redirectUri && redirectUri !== codePayload.redirect_uri) {
      bitcodeServerLifecycleTelemetry('warn', 'wallet-oauth', 'token-redirect-mismatch', {
        clientId: credentials.clientId,
        redirectUri,
        expectedRedirectUri: codePayload.redirect_uri,
        failureClass: 'redirect_uri_mismatch',
      });
      bitcodeServerTelemetry('warn', 'wallet-oauth', 'token-redirect-mismatch', {
        clientId: credentials.clientId,
        redirectUri,
        expectedRedirectUri: codePayload.redirect_uri,
      });
      return jsonResponse({ error: 'invalid_grant', error_description: 'Redirect URI mismatch.' }, { status: 400 });
    }

    if (!verifyPkce({
      codeChallenge: codePayload.code_challenge,
      codeChallengeMethod: codePayload.code_challenge_method,
      codeVerifier: body.get('code_verifier'),
    })) {
      bitcodeServerLifecycleTelemetry('warn', 'wallet-oauth', 'token-pkce-failed', {
        clientId: credentials.clientId,
        walletProvider: codePayload.wallet.provider,
        walletAddress: compactBitcodeServerId(codePayload.wallet.address),
        failureClass: 'pkce_failed',
      });
      bitcodeServerTelemetry('warn', 'wallet-oauth', 'token-pkce-failed', {
        clientId: credentials.clientId,
        walletProvider: codePayload.wallet.provider,
        walletAddress: compactBitcodeServerId(codePayload.wallet.address),
      });
      return jsonResponse({ error: 'invalid_grant', error_description: 'PKCE verification failed.' }, { status: 400 });
    }

    const token = createBitcoinWalletAccessToken({
      codePayload,
      scope: body.get('scope'),
    });

    bitcodeServerLifecycleTelemetry('info', 'wallet-oauth', 'token-issued', {
      clientId: credentials.clientId,
      walletProvider: codePayload.wallet.provider,
      walletAddress: compactBitcodeServerId(codePayload.wallet.address),
      scope: codePayload.scope,
      expiresIn: token.expiresIn,
    });
    bitcodeServerTelemetry('info', 'wallet-oauth', 'token-issued', {
      clientId: credentials.clientId,
      walletProvider: codePayload.wallet.provider,
      walletAddress: compactBitcodeServerId(codePayload.wallet.address),
      scope: codePayload.scope,
      expiresIn: token.expiresIn,
    });
    return jsonResponse({
      access_token: token.accessToken,
      token_type: 'Bearer',
      expires_in: token.expiresIn,
      scope: codePayload.scope,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const failureClass = classifyTokenFailure(message);
    bitcodeServerLifecycleTelemetry('warn', 'wallet-oauth', 'token-invalid-grant', {
      clientId: credentials.clientId,
      message: message.slice(0, 200),
      failureClass,
      codePrefix: code.slice(0, 8),
      codeLength: code.length,
    });
    bitcodeServerTelemetry('warn', 'wallet-oauth', 'token-invalid-grant', {
      clientId: credentials.clientId,
      message,
    });
    return jsonResponse(
      {
        error: 'invalid_grant',
        error_description:
          failureClass === 'code_signature_or_secret_mismatch'
            ? 'Authorization code signature mismatch — Token URL host secret must match the host that minted the code (and the Supabase provider Client Secret).'
            : failureClass === 'code_expired'
              ? 'Authorization code expired (5 minute TTL). Retry Connect Wallet.'
              : message,
        failure_class: failureClass,
      },
      { status: 400 },
    );
  }
}
