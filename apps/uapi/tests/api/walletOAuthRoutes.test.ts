/**
 * @jest-environment node
 */

import { createHash } from 'crypto';

import { POST as createAuthorizationCode } from '@/app/api/wallet/oauth/authorization-code/route';
import { POST as exchangeToken } from '@/app/api/wallet/oauth/token/route';
import { GET as readUserInfo } from '@/app/api/wallet/oauth/userinfo/route';

const address = 'tb1qcmrcalqaqqqqqqqqqqqqqqqqqqqqqqqqq';
const redirectUri = 'https://tkpyosihuouusyaxtbau.supabase.co/auth/v1/callback';
const clientId = 'bitcode-bitcoin-wallet';
const clientSecret = 'test-bitcoin-oauth-secret';

function challengeMessage() {
  return [
    'Bitcode Bitcoin wallet authentication',
    `Address: ${address}`,
    'Network: testnet',
    'Origin: http://localhost:3001',
    'Issued: 2026-05-12T00:00:00.000Z',
    'Nonce: test',
    'Purpose: Authenticate Bitcode commercial profile, BTC fee readiness, and BTD source-share access.',
  ].join('\n');
}

function pkceChallenge(verifier: string) {
  return createHash('sha256').update(verifier).digest('base64url');
}

function authorizationRequest(overrides: Record<string, unknown> = {}) {
  return new Request('http://localhost:3001/api/wallet/oauth/authorization-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      oauth: {
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'profile wallet:bitcoin',
        code_challenge: pkceChallenge('test-verifier'),
        code_challenge_method: 'S256',
      },
      wallet: {
        address,
        provider: 'leather',
        providerLabel: 'Leather',
        network: 'testnet',
        paymentAddress: address,
        authAddress: address,
        addressType: 'p2tr',
        message: challengeMessage(),
        signature: 'bip322-signature',
        connectedAt: '2026-05-12T00:00:00.000Z',
        proofKind: 'bitcoin_message_signature',
      },
      ...overrides,
    }),
  });
}

async function createCode() {
  const response = await createAuthorizationCode(authorizationRequest());
  expect(response.status).toBe(200);
  const payload = await response.json();
  expect(typeof payload.code).toBe('string');
  return payload.code as string;
}

describe('Bitcode Bitcoin wallet OAuth provider routes', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://tkpyosihuouusyaxtbau.supabase.co';
    process.env.BITCODE_BITCOIN_OAUTH_CLIENT_ID = clientId;
    process.env.BITCODE_BITCOIN_OAUTH_CLIENT_SECRET = clientSecret;
  });

  it('issues a Supabase-consumable OAuth token and wallet userinfo from a signed Bitcoin proof', async () => {
    const code = await createCode();
    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
      code_verifier: 'test-verifier',
    });

    const tokenResponse = await exchangeToken(new Request('http://localhost:3001/api/wallet/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody.toString(),
    }));
    expect(tokenResponse.status).toBe(200);
    const tokenPayload = await tokenResponse.json();
    expect(tokenPayload).toEqual(expect.objectContaining({
      token_type: 'Bearer',
      expires_in: expect.any(Number),
      access_token: expect.any(String),
    }));

    const userInfoResponse = await readUserInfo(new Request('http://localhost:3001/api/wallet/oauth/userinfo', {
      headers: { Authorization: `Bearer ${tokenPayload.access_token}` },
    }));
    expect(userInfoResponse.status).toBe(200);
    await expect(userInfoResponse.json()).resolves.toEqual(expect.objectContaining({
      sub: `bitcoin:testnet:${address}`,
      bitcoin_address: address,
      bitcoin_auth_address: address,
      bitcoin_payment_address: address,
      wallet_provider: 'leather',
      wallet_signature_captured: true,
      wallet_signature_verification: 'server_signature_verifier_pending',
    }));
  });

  it('rejects token exchange when the Supabase custom provider secret does not match', async () => {
    const code = await createCode();
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: 'wrong-secret',
      code_verifier: 'test-verifier',
    });

    const response = await exchangeToken(new Request('http://localhost:3001/api/wallet/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({ error: 'invalid_client' }));
  });

  it('rejects PKCE mismatches before issuing an access token', async () => {
    const code = await createCode();
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
      code_verifier: 'wrong-verifier',
    });

    const response = await exchangeToken(new Request('http://localhost:3001/api/wallet/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({ error: 'invalid_grant' }));
  });

  it('rejects non-Supabase callback origins', async () => {
    const response = await createAuthorizationCode(authorizationRequest({
      oauth: {
        client_id: clientId,
        redirect_uri: 'https://attacker.example/callback',
      },
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: expect.stringContaining('redirect URI') }),
    );
  });
});

