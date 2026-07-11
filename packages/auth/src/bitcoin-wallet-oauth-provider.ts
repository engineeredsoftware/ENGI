import 'server-only';

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

type UnknownRecord = Record<string, unknown>;

export const BITCODE_BITCOIN_OAUTH_PROVIDER_IDENTIFIER = 'custom:bitcode-bitcoin';
export const BITCODE_BITCOIN_OAUTH_PROVIDER_NAME = 'Bitcode Bitcoin Wallet';
export const BITCODE_BITCOIN_OAUTH_DEFAULT_CLIENT_ID = 'bitcode-bitcoin-wallet';
export const BITCODE_BITCOIN_OAUTH_SCOPES = 'profile wallet:bitcoin';

const CODE_TTL_SECONDS = 5 * 60;
const ACCESS_TOKEN_TTL_SECONDS = 10 * 60;
const AUTH_CODE_KIND = 'bitcode.bitcoin_wallet.oauth_code';
const ACCESS_TOKEN_KIND = 'bitcode.bitcoin_wallet.access_token';

const BITCOIN_WALLET_PROVIDERS = new Set([
  'bitcoin-wallet',
  'unisat',
  'leather',
  'okx-bitcoin',
  'xverse',
]);

export type BitcoinWalletOAuthConnection = {
  address?: unknown;
  provider?: unknown;
  providerLabel?: unknown;
  network?: unknown;
  paymentAddress?: unknown;
  authAddress?: unknown;
  addressType?: unknown;
  message?: unknown;
  signature?: unknown;
  connectedAt?: unknown;
  proofKind?: unknown;
};

export type BitcoinWalletAuthorizationCodeInput = {
  clientId: string;
  redirectUri: string;
  scope?: string | null;
  codeChallenge?: string | null;
  codeChallengeMethod?: string | null;
  wallet: BitcoinWalletOAuthConnection;
};

type WalletAuthorizationPayload = {
  kind: typeof AUTH_CODE_KIND;
  jti: string;
  client_id: string;
  redirect_uri: string;
  scope: string | null;
  code_challenge: string | null;
  code_challenge_method: 'S256' | 'plain' | null;
  iat: number;
  exp: number;
  wallet: NormalizedBitcoinWalletProof;
};

type WalletAccessTokenPayload = {
  kind: typeof ACCESS_TOKEN_KIND;
  jti: string;
  sub: string;
  iat: number;
  exp: number;
  scope: string | null;
  wallet: NormalizedBitcoinWalletProof;
};

export type NormalizedBitcoinWalletProof = {
  address: string;
  provider: string;
  providerLabel: string;
  network: string | null;
  paymentAddress: string | null;
  authAddress: string | null;
  addressType: string | null;
  message: string;
  signature: string;
  connectedAt: string;
  proofKind: 'bitcoin_message_signature';
};

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : null;
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readNowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function base64urlEncode(value: Buffer | string) {
  return Buffer.from(value).toString('base64url');
}

function base64urlJson(value: unknown) {
  return base64urlEncode(JSON.stringify(value));
}

function signPayloadSegment(payloadSegment: string, secret: string) {
  return createHmac('sha256', secret).update(payloadSegment).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getOAuthSecret() {
  return (
    readString(process.env.BITCODE_BITCOIN_OAUTH_CLIENT_SECRET) ??
    readString(process.env.SUPABASE_CUSTOM_BITCOIN_PROVIDER_CLIENT_SECRET) ??
    (process.env.NODE_ENV === 'production' ? null : 'bitcode-bitcoin-wallet-local-dev-secret')
  );
}

export function getBitcoinWalletOAuthClientId() {
  return (
    readString(process.env.BITCODE_BITCOIN_OAUTH_CLIENT_ID) ??
    readString(process.env.SUPABASE_CUSTOM_BITCOIN_PROVIDER_CLIENT_ID) ??
    BITCODE_BITCOIN_OAUTH_DEFAULT_CLIENT_ID
  );
}

export function assertBitcoinWalletOAuthSecret() {
  const secret = getOAuthSecret();
  if (!secret) {
    throw new Error('BITCODE_BITCOIN_OAUTH_CLIENT_SECRET is required for Bitcoin wallet OAuth.');
  }
  return secret;
}

export function isPlausibleBitcoinAddress(value: unknown): value is string {
  const address = readString(value);
  if (!address) return false;

  return (
    /^(bc1|tb1|bcrt1)[ac-hj-np-z02-9]{8,90}$/i.test(address) ||
    /^[13mn2][A-HJ-NP-Za-km-z1-9]{25,60}$/.test(address)
  );
}

export function isBitcodeBitcoinWalletMessage(message: string, address: string) {
  return (
    message.includes('Bitcode Bitcoin wallet authentication') &&
    message.includes(`Address: ${address}`) &&
    message.includes('Purpose: Authenticate Bitcode commercial profile')
  );
}

function normalizeProvider(value: unknown) {
  const provider = readString(value)?.toLowerCase() ?? null;
  return provider && BITCOIN_WALLET_PROVIDERS.has(provider) ? provider : null;
}

function normalizeCodeChallengeMethod(value: unknown) {
  const method = readString(value);
  if (!method) return null;
  const upper = method.toUpperCase();
  if (upper === 'S256') return 'S256' as const;
  if (upper === 'PLAIN') return 'plain' as const;
  return null;
}

function normalizeWalletProof(wallet: BitcoinWalletOAuthConnection): NormalizedBitcoinWalletProof {
  const address = readString(wallet.address);
  if (!isPlausibleBitcoinAddress(address)) {
    throw new Error('A Bitcoin wallet OAuth proof requires a valid Bitcoin auth address.');
  }

  const provider = normalizeProvider(wallet.provider);
  if (!provider) {
    throw new Error('A Bitcoin wallet OAuth proof requires a supported Bitcoin wallet provider.');
  }

  const proofKind = readString(wallet.proofKind);
  const message = readString(wallet.message);
  const signature = readString(wallet.signature);
  if (proofKind !== 'bitcoin_message_signature' || !message || !signature) {
    throw new Error('Bitcoin wallet OAuth requires a signed Bitcode wallet message.');
  }

  if (!isBitcodeBitcoinWalletMessage(message, address)) {
    throw new Error('Bitcoin wallet OAuth message does not match the Bitcode authentication challenge.');
  }

  return {
    address,
    provider,
    providerLabel: readString(wallet.providerLabel) ?? provider,
    network: readString(wallet.network),
    paymentAddress: isPlausibleBitcoinAddress(wallet.paymentAddress) ? wallet.paymentAddress : null,
    authAddress: isPlausibleBitcoinAddress(wallet.authAddress) ? wallet.authAddress : address,
    addressType: readString(wallet.addressType),
    message,
    signature,
    connectedAt: readString(wallet.connectedAt) ?? new Date().toISOString(),
    proofKind: 'bitcoin_message_signature',
  };
}

function createSignedToken(payload: UnknownRecord, secret: string) {
  const payloadSegment = base64urlJson(payload);
  const signatureSegment = signPayloadSegment(payloadSegment, secret);
  return `${payloadSegment}.${signatureSegment}`;
}

function verifySignedToken<T extends UnknownRecord>(token: string, secret: string, expectedKind: string): T {
  const [payloadSegment, signatureSegment] = token.split('.');
  if (!payloadSegment || !signatureSegment) {
    throw new Error('Malformed OAuth token.');
  }

  const expectedSignature = signPayloadSegment(payloadSegment, secret);
  if (!safeEqual(signatureSegment, expectedSignature)) {
    throw new Error('OAuth token signature mismatch.');
  }

  const parsed = asRecord(JSON.parse(Buffer.from(payloadSegment, 'base64url').toString('utf8')));
  if (!parsed || parsed.kind !== expectedKind) {
    throw new Error('OAuth token kind mismatch.');
  }

  const exp = typeof parsed.exp === 'number' ? parsed.exp : 0;
  if (exp <= readNowSeconds()) {
    throw new Error('OAuth token has expired.');
  }

  return parsed as T;
}

export function createBitcoinWalletAuthorizationCode(input: BitcoinWalletAuthorizationCodeInput) {
  const clientId = readString(input.clientId);
  if (!clientId || clientId !== getBitcoinWalletOAuthClientId()) {
    throw new Error('Invalid Bitcoin wallet OAuth client.');
  }

  if (!isAllowedBitcoinWalletOAuthRedirectUri(input.redirectUri)) {
    throw new Error('Bitcoin wallet OAuth redirect URI is not allowed.');
  }

  const method = normalizeCodeChallengeMethod(input.codeChallengeMethod);
  if (input.codeChallenge && !method) {
    throw new Error('Bitcoin wallet OAuth PKCE method must be S256 or plain.');
  }

  const now = readNowSeconds();
  const payload: WalletAuthorizationPayload = {
    kind: AUTH_CODE_KIND,
    jti: randomBytes(18).toString('base64url'),
    client_id: clientId,
    redirect_uri: input.redirectUri,
    scope: readString(input.scope) ?? null,
    code_challenge: readString(input.codeChallenge),
    code_challenge_method: input.codeChallenge ? method ?? 'S256' : null,
    iat: now,
    exp: now + CODE_TTL_SECONDS,
    wallet: normalizeWalletProof(input.wallet),
  };

  return createSignedToken(payload as unknown as UnknownRecord, assertBitcoinWalletOAuthSecret());
}

export function verifyBitcoinWalletAuthorizationCode(code: string) {
  return verifySignedToken<WalletAuthorizationPayload>(
    code,
    assertBitcoinWalletOAuthSecret(),
    AUTH_CODE_KIND,
  );
}

export function createBitcoinWalletAccessToken(input: {
  codePayload: WalletAuthorizationPayload;
  scope?: string | null;
}) {
  const now = readNowSeconds();
  const wallet = input.codePayload.wallet;
  const payload: WalletAccessTokenPayload = {
    kind: ACCESS_TOKEN_KIND,
    jti: randomBytes(18).toString('base64url'),
    sub: buildBitcoinWalletSubject(wallet),
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
    scope: readString(input.scope) ?? input.codePayload.scope ?? null,
    wallet,
  };

  return {
    accessToken: createSignedToken(payload as unknown as UnknownRecord, assertBitcoinWalletOAuthSecret()),
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  };
}

export function verifyBitcoinWalletAccessToken(accessToken: string) {
  return verifySignedToken<WalletAccessTokenPayload>(
    accessToken,
    assertBitcoinWalletOAuthSecret(),
    ACCESS_TOKEN_KIND,
  );
}

export function buildBitcoinWalletSubject(wallet: NormalizedBitcoinWalletProof) {
  const network = (wallet.network ?? 'bitcoin').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `bitcoin:${network}:${wallet.address}`;
}

export function buildBitcoinWalletUserInfo(payload: WalletAccessTokenPayload) {
  const wallet = payload.wallet;
  const addressStem = wallet.address.replace(/[^a-z0-9]/gi, '').slice(0, 18).toLowerCase();

  return {
    sub: payload.sub,
    name: `${wallet.providerLabel} Bitcoin wallet`,
    preferred_username: `btc_${addressStem || 'wallet'}`,
    bitcoin_address: wallet.address,
    bitcoin_auth_address: wallet.authAddress ?? wallet.address,
    bitcoin_payment_address: wallet.paymentAddress ?? wallet.address,
    bitcoin_network: wallet.network,
    bitcoin_address_type: wallet.addressType,
    wallet_provider: wallet.provider,
    wallet_provider_label: wallet.providerLabel,
    wallet_proof_kind: wallet.proofKind,
    wallet_proof_captured_at: wallet.connectedAt,
    wallet_signature_captured: true,
    wallet_signature_verification: 'server_signature_verifier_pending',
  };
}

export function readOAuthClientCredentials(request: Request, body: URLSearchParams) {
  const authorization = request.headers.get('authorization');
  if (authorization?.toLowerCase().startsWith('basic ')) {
    const decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex === -1) {
      return { clientId: decoded, clientSecret: '' };
    }
    return {
      clientId: decoded.slice(0, separatorIndex),
      clientSecret: decoded.slice(separatorIndex + 1),
    };
  }

  return {
    clientId: body.get('client_id') ?? '',
    clientSecret: body.get('client_secret') ?? '',
  };
}

export function validateOAuthClientCredentials(credentials: { clientId: string; clientSecret: string }) {
  const expectedClientId = getBitcoinWalletOAuthClientId();
  const expectedSecret = assertBitcoinWalletOAuthSecret();
  return credentials.clientId === expectedClientId && safeEqual(credentials.clientSecret, expectedSecret);
}

export function verifyPkce(input: {
  codeChallenge: string | null;
  codeChallengeMethod: 'S256' | 'plain' | null;
  codeVerifier: string | null;
}) {
  if (!input.codeChallenge) return true;
  if (!input.codeVerifier) return false;

  if (input.codeChallengeMethod === 'plain') {
    return safeEqual(input.codeVerifier, input.codeChallenge);
  }

  const computed = createHash('sha256').update(input.codeVerifier).digest('base64url');
  return safeEqual(computed, input.codeChallenge);
}

export function isAllowedBitcoinWalletOAuthRedirectUri(redirectUri: string) {
  let parsed: URL;
  try {
    parsed = new URL(redirectUri);
  } catch {
    return false;
  }

  const allowedOrigins = new Set<string>();
  const allowedUris = new Set<string>();
  for (const candidate of [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
    process.env.BITCODE_BITCOIN_OAUTH_ALLOWED_REDIRECT_ORIGINS,
  ]) {
    if (!candidate) continue;
    for (const part of candidate.split(',')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      try {
        allowedOrigins.add(new URL(trimmed).origin);
      } catch {
        allowedOrigins.add(trimmed.replace(/\/+$/, ''));
      }
    }
  }

  for (const candidate of [
    process.env.BITCODE_BITCOIN_OAUTH_ALLOWED_REDIRECT_URIS,
    process.env.BITCODE_BITCOIN_OAUTH_SUPABASE_CALLBACK_URL,
    process.env.SUPABASE_AUTH_CALLBACK_URL,
  ]) {
    if (!candidate) continue;
    for (const part of candidate.split(',')) {
      const trimmed = part.trim();
      if (trimmed) allowedUris.add(trimmed);
    }
  }

  return allowedOrigins.has(parsed.origin) || allowedUris.has(parsed.toString());
}
