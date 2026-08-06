/**
 * Production-grade encryption utilities for credential storage
 * 
 * Uses AES-256-GCM for symmetric encryption with authenticated encryption.
 * Implements key derivation and secure credential handling patterns.
 */

import crypto from 'crypto';
import { log } from '@bitcode/logger';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits

/**
 * Encrypted credential result containing all necessary components
 */
export interface EncryptedCredential {
  readonly encrypted: string; // Base64 encoded
  readonly iv: string; // Base64 encoded initialization vector
  readonly tag: string; // Base64 encoded authentication tag
  readonly salt: string; // Base64 encoded salt for key derivation
  readonly algorithm: string; // Encryption algorithm used
  readonly timestamp: string; // ISO timestamp of encryption
}

/**
 * Credential encryption options
 */
export interface EncryptionOptions {
  readonly keyDerivationIterations?: number; // PBKDF2 iterations (default: 100000)
  readonly additionalData?: string; // Additional authenticated data
}

/**
 * Get the master encryption key from environment with validation
 */
function getMasterKey(): string {
  const key = process.env.CREDENTIAL_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY environment variable is required');
  }
  
  if (key.length < 32) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY must be at least 32 characters');
  }
  
  return key;
}

/**
 * Derive encryption key from master key and salt using PBKDF2
 */
function deriveKey(masterKey: string, salt: Buffer, iterations = 100000): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, iterations, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt a credential using AES-256-GCM with key derivation
 */
export function encryptCredential(
  credential: string,
  options: EncryptionOptions = {}
): EncryptedCredential {
  if (!credential || typeof credential !== 'string') {
    throw new Error('Credential must be a non-empty string');
  }

  try {
    const masterKey = getMasterKey();
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const iterations = options.keyDerivationIterations || 100000;
    
    // Derive encryption key from master key and salt
    const derivedKey = deriveKey(masterKey, salt, iterations);
    
    // Create cipher using AES-256-GCM with explicit IV
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv, {
      authTagLength: TAG_LENGTH
    });
    
    if (options.additionalData) {
      cipher.setAAD(Buffer.from(options.additionalData));
    }
    
    // Encrypt the credential
    const encrypted = Buffer.concat([
      cipher.update(credential, 'utf8'),
      cipher.final()
    ]).toString('base64');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    const result: EncryptedCredential = {
      encrypted,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      salt: salt.toString('base64'),
      algorithm: ALGORITHM,
      timestamp: new Date().toISOString()
    };
    
    log('Credential encrypted successfully', 'info', {
      algorithm: ALGORITHM,
      keyDerivationIterations: iterations,
      credentialLength: credential.length,
      timestamp: result.timestamp
    });
    
    return result;
    
  } catch (error) {
    log('Credential encryption failed', 'error', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error('Failed to encrypt credential');
  }
}

/**
 * Decrypt a credential using the stored encryption parameters
 */
export function decryptCredential(
  encryptedData: EncryptedCredential,
  options: EncryptionOptions = {}
): string {
  if (!encryptedData || typeof encryptedData !== 'object') {
    throw new Error('Encrypted data must be a valid EncryptedCredential object');
  }

  const { encrypted, iv, tag, salt, algorithm } = encryptedData;
  
  if (!encrypted || !iv || !tag || !salt) {
    throw new Error('Invalid encrypted credential: missing required fields');
  }
  
  if (algorithm !== ALGORITHM) {
    throw new Error(`Unsupported encryption algorithm: ${algorithm}`);
  }

  try {
    const masterKey = getMasterKey();
    const iterations = options.keyDerivationIterations || 100000;
    
    // Derive the same key used for encryption
    const saltBuffer = Buffer.from(salt, 'base64');
    const derivedKey = deriveKey(masterKey, saltBuffer, iterations);
    
    // Create decipher with IV and authentication tag
    const decipher = crypto.createDecipheriv(
      algorithm,
      derivedKey,
      Buffer.from(iv, 'base64'),
      { authTagLength: TAG_LENGTH }
    );
    
    if (options.additionalData) {
      decipher.setAAD(Buffer.from(options.additionalData));
    }
    
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    
    // Decrypt the credential
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64')),
      decipher.final()
    ]).toString('utf8');
    
    log('Credential decrypted successfully', 'info', {
      algorithm,
      decryptedLength: decrypted.length,
      encryptionTimestamp: encryptedData.timestamp
    });
    
    return decrypted;
    
  } catch (error) {
    log('Credential decryption failed', 'error', {
      error: error instanceof Error ? error.message : String(error),
      algorithm,
      encryptionTimestamp: encryptedData.timestamp
    });
    throw new Error('Failed to decrypt credential');
  }
}

/**
 * Securely compare two credentials using constant-time comparison
 */
export function secureCompareCredentials(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  if (a.length !== b.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Generate a cryptographically secure credential (e.g., API key)
 */
export function generateSecureCredential(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Validate that an encrypted credential object has all required fields
 */
export function validateEncryptedCredential(data: any): data is EncryptedCredential {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.encrypted === 'string' &&
    typeof data.iv === 'string' &&
    typeof data.tag === 'string' &&
    typeof data.salt === 'string' &&
    typeof data.algorithm === 'string' &&
    typeof data.timestamp === 'string' &&
    data.algorithm === ALGORITHM
  );
}

/**
 * Check if encryption is properly configured
 */
export function validateEncryptionConfig(): { valid: boolean; error?: string } {
  try {
    getMasterKey();
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown encryption configuration error'
    };
  }
}

/**
 * Migrate plaintext credential to encrypted format
 */
export function migrateCredentialToEncrypted(
  plaintextCredential: string,
  options: EncryptionOptions = {}
): EncryptedCredential {
  if (!plaintextCredential) {
    throw new Error('Cannot migrate empty credential');
  }
  
  log('Migrating plaintext credential to encrypted format', 'info', {
    credentialLength: plaintextCredential.length
  });
  
  return encryptCredential(plaintextCredential, options);
}

/**
 * Rotate encryption for a credential (re-encrypt with new salt/keys)
 */
export function rotateCredentialEncryption(
  encryptedData: EncryptedCredential,
  options: EncryptionOptions = {}
): EncryptedCredential {
  // Decrypt with old parameters
  const plaintext = decryptCredential(encryptedData, options);
  
  // Re-encrypt with new parameters
  const rotated = encryptCredential(plaintext, options);
  
  log('Credential encryption rotated', 'info', {
    oldTimestamp: encryptedData.timestamp,
    newTimestamp: rotated.timestamp
  });
  
  return rotated;
}
