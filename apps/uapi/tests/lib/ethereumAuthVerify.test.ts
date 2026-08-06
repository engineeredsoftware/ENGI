/**
 * @jest-environment node
 */

import * as secp from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex, concatBytes, utf8ToBytes } from '@noble/hashes/utils';

import { buildBitcodeEthereumAuthMessage } from '@bitcode/auth/ethereum-wallet-client';
import {
  buildEthereumWalletAuthEmail,
  recoverEthereumPersonalSignAddress,
  verifyBitcodeEthereumAuthSignature,
} from '@bitcode/auth/ethereum-auth-verify';

// noble secp v1 needs hmac for signSync in tests.
secp.utils.hmacSha256Sync = (key: Uint8Array, ...msgs: Uint8Array[]) =>
  hmac(sha256, key, concatBytes(...msgs));
secp.utils.sha256Sync = (...msgs: Uint8Array[]) => sha256(concatBytes(...msgs));

function signPersonalMessage(privateKey: Uint8Array, message: string): string {
  const prefix = `\x19Ethereum Signed Message:\n${message.length}${message}`;
  const msgHash = keccak_256(utf8ToBytes(prefix));
  const [sig, recovery] = secp.signSync(msgHash, privateKey, { recovered: true, der: false });
  const sig65 = new Uint8Array(65);
  sig65.set(sig, 0);
  sig65[64] = recovery + 27;
  return `0x${bytesToHex(sig65)}`;
}

function addressFromPrivateKey(privateKey: Uint8Array): string {
  const pub = secp.getPublicKey(privateKey, false);
  return `0x${bytesToHex(keccak_256(pub.slice(1)).slice(-20))}`;
}

describe('ethereum-auth-verify', () => {
  it('builds a deterministic wallet auth email', () => {
    expect(buildEthereumWalletAuthEmail('0xAbCDEF0000000000000000000000000000000001')).toBe(
      '0xabcdef0000000000000000000000000000000001@ethereum.wallet.bitcode.local',
    );
  });

  it('recovers the signer address from a personal_sign proof', () => {
    const privateKey = secp.utils.randomPrivateKey();
    const address = addressFromPrivateKey(privateKey);
    const message = buildBitcodeEthereumAuthMessage({
      address,
      nonce: 'test-nonce',
      chainId: 11155111,
      issuedAt: new Date().toISOString(),
    });
    const signature = signPersonalMessage(privateKey, message);
    expect(recoverEthereumPersonalSignAddress(message, signature)).toBe(address);
  });

  it('accepts a fresh Bitcode Ethereum auth signature', () => {
    const privateKey = secp.utils.randomPrivateKey();
    const address = addressFromPrivateKey(privateKey);
    const message = buildBitcodeEthereumAuthMessage({
      address,
      nonce: 'fresh-nonce',
      chainId: 11155111,
      issuedAt: new Date().toISOString(),
    });
    const signature = signPersonalMessage(privateKey, message);
    const result = verifyBitcodeEthereumAuthSignature({
      address,
      message,
      signature,
      chainId: 11155111,
    });
    expect(result).toEqual({ ok: true, address });
  });

  it('rejects an expired Bitcode Ethereum auth message', () => {
    const privateKey = secp.utils.randomPrivateKey();
    const address = addressFromPrivateKey(privateKey);
    const message = buildBitcodeEthereumAuthMessage({
      address,
      nonce: 'old-nonce',
      chainId: 11155111,
      issuedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    });
    const signature = signPersonalMessage(privateKey, message);
    const result = verifyBitcodeEthereumAuthSignature({
      address,
      message,
      signature,
      chainId: 11155111,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('message_expired');
    }
  });

  it('rejects a signature for a different address', () => {
    const privateKey = secp.utils.randomPrivateKey();
    const address = addressFromPrivateKey(privateKey);
    const other = '0x0000000000000000000000000000000000000001';
    const message = buildBitcodeEthereumAuthMessage({
      address: other,
      nonce: 'mismatch',
      chainId: 11155111,
      issuedAt: new Date().toISOString(),
    });
    // Sign with real key but claim other address in verify (message has other).
    const signature = signPersonalMessage(privateKey, message);
    const result = verifyBitcodeEthereumAuthSignature({
      address: other,
      message,
      signature,
      chainId: 11155111,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('signature_mismatch');
    }
  });
});
