import {
  encryptCredential,
  decryptCredential,
  secureCompareCredentials,
  validateEncryptedCredential,
  validateEncryptionConfig,
  migrateCredentialToEncrypted,
  rotateCredentialEncryption
} from '../encryption';

const TEST_KEY = 'a'.repeat(64);

describe('encryption utilities', () => {
  beforeEach(() => {
    process.env.CREDENTIAL_ENCRYPTION_KEY = TEST_KEY;
  });

  afterEach(() => {
    delete process.env.CREDENTIAL_ENCRYPTION_KEY;
  });

  it('encrypts and decrypts credentials using the configured key', () => {
    const encrypted = encryptCredential('super-secret-token');
    expect(validateEncryptedCredential(encrypted)).toBe(true);

    const decrypted = decryptCredential(encrypted);
    expect(decrypted).toBe('super-secret-token');
  });

  it('rotates credentials while preserving the plaintext value', () => {
    const encrypted = encryptCredential('rotate-me');
    const rotated = rotateCredentialEncryption(encrypted);

    expect(rotated.timestamp).not.toEqual(encrypted.timestamp);
    expect(decryptCredential(rotated)).toBe('rotate-me');
  });

  it('migrates plaintext credentials to encrypted payloads', () => {
    const migrated = migrateCredentialToEncrypted('migrate-me');
    expect(validateEncryptedCredential(migrated)).toBe(true);
    expect(migrated.algorithm).toBe('aes-256-gcm');
  });

  it('performs constant-time secure comparisons for equal values', () => {
    expect(secureCompareCredentials('abc123', 'abc123')).toBe(true);
    expect(secureCompareCredentials('abc123', 'abc124')).toBe(false);
    expect(secureCompareCredentials('abc123', 'short')).toBe(false);
  });

  it('validates encryption configuration and surfaces missing keys', () => {
    const configured = validateEncryptionConfig();
    expect(configured).toEqual({ valid: true });

    delete process.env.CREDENTIAL_ENCRYPTION_KEY;
    const missing = validateEncryptionConfig();
    expect(missing.valid).toBe(false);
    expect(missing.error).toContain('CREDENTIAL_ENCRYPTION_KEY');
  });
});
