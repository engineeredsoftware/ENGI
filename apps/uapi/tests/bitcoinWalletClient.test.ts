/**
 * @jest-environment jsdom
 */

// Shared mock via jest moduleNameMapper (`^sats-connect$` → tests/mocks/sats-connect.js).
// Import the package name so the mapper always wins (relative path can miss on CI).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const satsConnect = require('sats-connect') as {
  __mockGetProviders: jest.Mock;
  __mockRequest: jest.Mock;
};
const mockGetProviders = satsConnect.__mockGetProviders;
const mockRequest = satsConnect.__mockRequest;

import {
  connectBitcoinWallet,
  inspectBitcoinWalletProviders,
  inspectLeatherWalletAccount,
  openLeatherWallet,
  sendLeatherTransfer,
  signLeatherBitcoinMessage,
  signLeatherPsbt,
} from '@bitcode/auth/bitcoin-wallet-client';

const paymentAddress = 'tb1qcmrcalqaqqqqqqqqqqqqqqqqqqqqqqqqq';
const taprootAddress = 'tb1pqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';

describe('connectBitcoinWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as any).LeatherProvider;
    delete (window as any).unisat;
    delete (window as any).okxwallet;
  });

  it('prefers Xverse through Sats Connect discovery and signs BIP322 with the auth address', async () => {
    mockGetProviders.mockReturnValue([
      {
        id: 'xverseProviders.BitcoinProvider',
        name: 'Xverse Wallet',
      },
    ]);
    mockRequest
      .mockResolvedValueOnce({
        status: 'success',
        result: {
          id: 'xverse-account-1',
          walletType: 'software',
          network: { bitcoin: { name: 'Testnet4' } },
          addresses: [
            {
              purpose: 'payment',
              address: paymentAddress,
              addressType: 'p2wpkh',
              publicKey: 'payment-public-key',
            },
            {
              purpose: 'ordinals',
              address: taprootAddress,
              addressType: 'p2tr',
              publicKey: 'taproot-public-key',
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        status: 'success',
        result: {
          signature: 'bip322-signature',
          address: taprootAddress,
          protocol: 'BIP322',
        },
      });

    const connection = await connectBitcoinWallet();

    expect(connection).toEqual(expect.objectContaining({
      provider: 'xverse',
      address: taprootAddress,
      authAddress: taprootAddress,
      paymentAddress,
      addressType: 'p2tr',
      network: 'Testnet4',
      signature: 'bip322-signature',
      proofKind: 'bitcoin_message_signature',
    }));
    expect(mockRequest).toHaveBeenNthCalledWith(
      1,
      'wallet_connect',
      expect.objectContaining({
        addresses: ['payment', 'ordinals'],
        network: 'Testnet4',
      }),
      'xverseProviders.BitcoinProvider',
    );
    expect(mockRequest).toHaveBeenNthCalledWith(
      2,
      'signMessage',
      expect.objectContaining({
        address: taprootAddress,
        protocol: 'BIP322',
      }),
      'xverseProviders.BitcoinProvider',
    );
  });

  it('uses Leather getAddresses without relying on address indexes', async () => {
    mockGetProviders.mockReturnValue([]);
    const leatherRequest = jest.fn()
      .mockResolvedValueOnce({
        result: {
          addresses: [
            { symbol: 'STX', address: 'SP000000000000000000002Q6VF78' },
            {
              symbol: 'BTC',
              type: 'p2wpkh',
              address: paymentAddress,
              publicKey: 'payment-public-key',
              derivationPath: "m/84'/0'/1'/0/0",
            },
            {
              symbol: 'BTC',
              type: 'p2tr',
              address: taprootAddress,
              publicKey: 'taproot-public-key',
              tweakedPublicKey: 'tweaked-public-key',
              derivationPath: "m/86'/0'/1'/0/0",
            },
          ],
        },
      })
      .mockResolvedValueOnce({ result: { signature: 'leather-bip322-signature' } });
    (window as any).LeatherProvider = { request: leatherRequest };

    const connection = await connectBitcoinWallet();

    expect(connection).toEqual(expect.objectContaining({
      provider: 'leather',
      address: taprootAddress,
      authAddress: taprootAddress,
      paymentAddress,
      addressType: 'p2tr',
      network: 'testnet',
      signature: 'leather-bip322-signature',
      proofKind: 'bitcoin_message_signature',
    }));
    expect(leatherRequest).toHaveBeenNthCalledWith(1, 'getAddresses');
    expect(leatherRequest).toHaveBeenNthCalledWith(
      2,
      'signMessage',
      expect.objectContaining({
        paymentType: 'p2tr',
        network: 'testnet',
        account: 1,
      }),
    );
  });

  it('normalizes Leather account data and exposes documented Leather methods', async () => {
    mockGetProviders.mockReturnValue([]);
    const leatherRequest = jest.fn()
      .mockResolvedValueOnce({
        result: {
          addresses: [
            { symbol: 'STX', address: 'SP000000000000000000002Q6VF78' },
            {
              symbol: 'BTC',
              type: 'p2wpkh',
              address: paymentAddress,
              publicKey: 'payment-public-key',
              derivationPath: "m/84'/0'/4'/0/0",
            },
            {
              symbol: 'BTC',
              type: 'p2tr',
              address: taprootAddress,
              publicKey: 'taproot-public-key',
              tweakedPublicKey: 'tweaked-public-key',
              derivationPath: "m/86'/0'/4'/0/0",
            },
          ],
        },
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        result: {
          signature: 'leather-message-signature',
          address: taprootAddress,
          message: 'Bitcode challenge',
        },
      })
      .mockResolvedValueOnce({ result: { hex: '70736274ff01', txid: 'psbt-broadcast-txid' } })
      .mockResolvedValueOnce({ result: { txid: 'transfer-txid' } });
    (window as any).LeatherProvider = { request: leatherRequest };

    await expect(inspectLeatherWalletAccount()).resolves.toEqual(expect.objectContaining({
      account: 4,
      network: 'testnet',
      paymentAddress: expect.objectContaining({ address: paymentAddress, type: 'p2wpkh' }),
      authAddress: expect.objectContaining({
        address: taprootAddress,
        type: 'p2tr',
        tweakedPublicKey: 'tweaked-public-key',
      }),
    }));

    await expect(openLeatherWallet()).resolves.toBeUndefined();
    await expect(signLeatherBitcoinMessage({
      message: 'Bitcode challenge',
      paymentType: 'p2tr',
      network: 'testnet',
      account: 4,
    })).resolves.toEqual({
      signature: 'leather-message-signature',
      address: taprootAddress,
      message: 'Bitcode challenge',
    });
    await expect(signLeatherPsbt({
      hex: '70736274ff01',
      signAtIndex: [0, 1],
      network: 'testnet',
      account: 4,
      broadcast: true,
    })).resolves.toEqual({ hex: '70736274ff01', txid: 'psbt-broadcast-txid' });
    await expect(sendLeatherTransfer({
      recipients: [{ address: paymentAddress, amount: '10000' }],
      network: 'testnet',
      account: 4,
    })).resolves.toEqual({ txid: 'transfer-txid' });

    expect(leatherRequest).toHaveBeenNthCalledWith(1, 'getAddresses');
    expect(leatherRequest).toHaveBeenNthCalledWith(2, 'open');
    expect(leatherRequest).toHaveBeenNthCalledWith(3, 'signMessage', {
      message: 'Bitcode challenge',
      paymentType: 'p2tr',
      network: 'testnet',
      account: 4,
    });
    expect(leatherRequest).toHaveBeenNthCalledWith(4, 'signPsbt', {
      hex: '70736274ff01',
      signAtIndex: [0, 1],
      network: 'testnet',
      account: 4,
      broadcast: true,
    });
    expect(leatherRequest).toHaveBeenNthCalledWith(5, 'sendTransfer', {
      recipients: [{ address: paymentAddress, amount: '10000' }],
      network: 'testnet',
      account: 4,
    });
  });

  it('exposes detected wallet choices and can connect Leather even when Xverse is installed', async () => {
    mockGetProviders.mockReturnValue([
      {
        id: 'xverseProviders.BitcoinProvider',
        name: 'Xverse Wallet',
      },
    ]);
    const leatherRequest = jest.fn()
      .mockResolvedValueOnce({
        result: {
          addresses: [
            {
              symbol: 'BTC',
              type: 'p2wpkh',
              address: paymentAddress,
              publicKey: 'payment-public-key',
              derivationPath: "m/84'/0'/1'/0/0",
            },
            {
              symbol: 'BTC',
              type: 'p2tr',
              address: taprootAddress,
              publicKey: 'taproot-public-key',
              tweakedPublicKey: 'tweaked-public-key',
              derivationPath: "m/86'/0'/1'/0/0",
            },
          ],
        },
      })
      .mockResolvedValueOnce({ result: { signature: 'leather-bip322-signature' } });
    (window as any).LeatherProvider = { request: leatherRequest };

    await expect(inspectBitcoinWalletProviders()).resolves.toEqual([
      { id: 'leather', label: 'Leather' },
      { id: 'xverse', label: 'Xverse' },
    ]);

    const connection = await connectBitcoinWallet('leather');

    expect(connection).toEqual(expect.objectContaining({
      provider: 'leather',
      address: taprootAddress,
      signature: 'leather-bip322-signature',
    }));
    expect(mockRequest).not.toHaveBeenCalled();
    expect(leatherRequest).toHaveBeenCalledTimes(2);
  });
});
