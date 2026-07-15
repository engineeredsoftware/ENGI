/**
 * Signature helper for the retained webhook ingress boundary.
 * Verification here protects external automation ingress only and does not own
 * Bitcode Exchange state semantics.
 */
import crypto from 'crypto';

interface VerifyGitHubSignatureArgs {
  secret: string;
  payload: string;
  signatureHeader: string | null | undefined;
}

export function verifyGitHubSignature({
  secret,
  payload,
  signatureHeader
}: VerifyGitHubSignatureArgs): boolean {
  if (!secret || !signatureHeader?.startsWith('sha256=')) {
    return false;
  }

  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const provided = signatureHeader.slice('sha256='.length);

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  } catch {
    return false;
  }
}
