/**
 * JWT Helper for GitHub App Authentication
 * 
 * Simple JWT generation using Node.js crypto module
 * to avoid ESM import issues with jose library.
 */

import * as crypto from 'crypto';

function base64url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const PRIVATE_KEY_BEGIN = /-----BEGIN [A-Z ]*PRIVATE KEY-----/;
const PRIVATE_KEY_END = /-----END [A-Z ]*PRIVATE KEY-----/;

function stripWrappingQuotes(value: string): string {
  if (value.length < 2) return value;

  const first = value[0];
  const last = value[value.length - 1];

  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return value.slice(1, -1);
  }

  return value;
}

function decodeBase64Pem(value: string): string | null {
  const compact = value.replace(/\s/g, '');
  if (!compact || compact.length % 4 !== 0) return null;

  try {
    const decoded = Buffer.from(compact, 'base64').toString('utf8').trim();
    return PRIVATE_KEY_BEGIN.test(decoded) && PRIVATE_KEY_END.test(decoded)
      ? decoded
      : null;
  } catch {
    return null;
  }
}

function canonicalizePem(value: string): string {
  const match = value.match(
    /(-----BEGIN [A-Z ]*PRIVATE KEY-----)([\s\S]*?)(-----END [A-Z ]*PRIVATE KEY-----)/,
  );
  if (!match) return value;

  const [, begin = '', body = '', end = ''] = match;
  const compactBody = body.replace(/\s/g, '');
  if (!compactBody) return value;

  const wrappedBody = compactBody.match(/.{1,64}/g)?.join('\n') ?? compactBody;
  return `${begin}\n${wrappedBody}\n${end}`;
}

export function normalizeGitHubAppPrivateKey(privateKey: string): string {
  let key = stripWrappingQuotes(privateKey.trim())
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  if (!PRIVATE_KEY_BEGIN.test(key)) {
    key = decodeBase64Pem(key) ?? key;
  }

  key = canonicalizePem(key);

  if (/^\/.*\.pem$/i.test(key) || /^[A-Z]:\\.*\.pem$/i.test(key)) {
    throw new Error(
      'GITHUB_PRIVATE_KEY contains a file path. Configure the deployed environment with the PEM contents or a base64-encoded PEM, not a local .pem path.'
    );
  }

  if (!PRIVATE_KEY_BEGIN.test(key) || !PRIVATE_KEY_END.test(key)) {
    throw new Error(
      'GITHUB_PRIVATE_KEY must be an RSA private key PEM. Expected BEGIN/END PRIVATE KEY markers after env normalization.'
    );
  }

  return key;
}

export function generateGitHubAppJWT(appId: string, privateKey: string): string {
  // Current time in seconds
  const now = Math.floor(Date.now() / 1000);
  
  // JWT header
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  
  // JWT payload
  const payload = {
    iat: now - 60,  // 60 seconds in the past to account for clock drift
    exp: now + 600,  // 10 minutes in the future
    iss: appId
  };
  
  // Encode header and payload
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  
  // Create signature
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  const privateKeyContent = normalizeGitHubAppPrivateKey(privateKey);
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  sign.end();
  
  const signature = sign.sign(privateKeyContent);
  const encodedSignature = signature
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  // Combine all parts
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}
