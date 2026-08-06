import { generateKeyPairSync } from 'crypto';
import { generateGitHubAppJWT, normalizeGitHubAppPrivateKey } from '../auth/jwt-helper';

function createPrivateKeyPem(): string {
  return generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    },
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    }
  }).privateKey;
}

describe('GitHub App JWT helpers', () => {
  it('normalizes escaped PEM newlines before signing', () => {
    const privateKey = createPrivateKeyPem();
    const escapedPrivateKey = privateKey.replace(/\n/g, '\\n');

    expect(normalizeGitHubAppPrivateKey(escapedPrivateKey)).toBe(privateKey.trim());
    expect(generateGitHubAppJWT('244206', escapedPrivateKey).split('.')).toHaveLength(3);
  });

  it('normalizes base64-encoded PEM values for deployment envs', () => {
    const privateKey = createPrivateKeyPem();
    const base64PrivateKey = Buffer.from(privateKey, 'utf8').toString('base64');

    expect(normalizeGitHubAppPrivateKey(base64PrivateKey)).toBe(privateKey.trim());
    expect(generateGitHubAppJWT('244206', base64PrivateKey).split('.')).toHaveLength(3);
  });

  it('reconstructs single-line PEM values that preserve markers but lose line breaks', () => {
    const privateKey = createPrivateKeyPem();
    const singleLinePrivateKey = privateKey.replace(/\n/g, ' ');

    expect(normalizeGitHubAppPrivateKey(singleLinePrivateKey)).toBe(privateKey.trim());
    expect(generateGitHubAppJWT('244206', singleLinePrivateKey).split('.')).toHaveLength(3);
  });

  it('rejects local private-key paths with an actionable configuration error', () => {
    expect(() =>
      normalizeGitHubAppPrivateKey('/Users/example/Downloads/bitcode.private-key.pem')
    ).toThrow(/file path/i);
  });
});
