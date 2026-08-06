/**
 * @jest-environment node
 */

jest.mock('@vercel/analytics/server', () => ({ track: jest.fn() }));

import { verifyGitHubSignature } from '@/app/api/webhook/verify';
import { POST as webhookPOST } from '@/app/api/webhook/route';
import crypto from 'crypto';

describe('GitHub webhook signature verification', () => {
  const secret = 'test_secret_123';
  const payload = JSON.stringify({ action: 'ping' });

  function sign(body: string) {
    const h = crypto.createHmac('sha256', secret);
    h.update(body);
    return `sha256=${h.digest('hex')}`;
  }

  it('verifyGitHubSignature returns true for valid signature', () => {
    const sig = sign(payload);
    expect(
      verifyGitHubSignature({ secret, payload, signatureHeader: sig })
    ).toBe(true);
  });

  it('verifyGitHubSignature returns false for invalid signature', () => {
    expect(
      verifyGitHubSignature({ secret, payload, signatureHeader: 'sha256=badsignature' })
    ).toBe(false);
  });

  it('POST /api/webhook enforces signature when secret present', async () => {
    const old = process.env.GITHUB_WEBHOOK_SECRET;
    process.env.GITHUB_WEBHOOK_SECRET = secret;

    // invalid signature → 401
    const reqBad = new Request('http://localhost/api/webhook', {
      method: 'POST',
      headers: { 'x-hub-signature-256': 'sha256=deadbeef' },
      body: payload,
    });
    const resBad = await webhookPOST(reqBad as any);
    expect(resBad.status).toBe(401);

    // valid signature → 200
    const reqGood = new Request('http://localhost/api/webhook', {
      method: 'POST',
      headers: { 'x-hub-signature-256': sign(payload) },
      body: payload,
    });
    const resGood = await webhookPOST(reqGood as any);
    expect(resGood.status).toBe(200);

    // restore
    if (old === undefined) delete process.env.GITHUB_WEBHOOK_SECRET;
    else process.env.GITHUB_WEBHOOK_SECRET = old;
  });
});
