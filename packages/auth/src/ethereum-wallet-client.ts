/**
 * Ethereum wallet client (EIP-1193) for Bitcode product identity + ETH settle.
 * Replaces Bitcoin wallet client as the primary Auxillaries identity path.
 *
 * Popular providers: MetaMask, Coinbase, Brave, Rainbow (via injected
 * window.ethereum) and WalletConnect (wired separately when project id set).
 */

export type EthereumWalletProviderId =
  | 'metamask'
  | 'coinbase'
  | 'brave'
  | 'rainbow'
  | 'injected'
  | 'walletconnect'
  | 'unknown';

export interface EthereumWalletProviderSummary {
  id: EthereumWalletProviderId;
  label: string;
  available: boolean;
  chainIdHex: string | null;
}

export interface EthereumWalletConnection {
  providerId: EthereumWalletProviderId;
  address: string;
  chainId: number;
  chainIdHex: string;
  connected: true;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isBraveWallet?: boolean;
      isRainbow?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

function detectProviderId(): EthereumWalletProviderId {
  if (typeof window === 'undefined' || !window.ethereum) return 'unknown';
  const eth = window.ethereum;
  if (eth.isMetaMask) return 'metamask';
  if (eth.isCoinbaseWallet) return 'coinbase';
  if (eth.isBraveWallet) return 'brave';
  if (eth.isRainbow) return 'rainbow';
  return 'injected';
}

export function isPlausibleEthereumAddress(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

export function inspectEthereumWalletProviders(): EthereumWalletProviderSummary[] {
  if (typeof window === 'undefined') {
    return [
      {
        id: 'injected',
        label: 'Browser wallet',
        available: false,
        chainIdHex: null,
      },
    ];
  }
  const available = Boolean(window.ethereum);
  const id = detectProviderId();
  return [
    {
      id: available ? id : 'injected',
      label:
        id === 'metamask'
          ? 'MetaMask'
          : id === 'coinbase'
            ? 'Coinbase Wallet'
            : id === 'brave'
              ? 'Brave Wallet'
              : id === 'rainbow'
                ? 'Rainbow'
                : 'Browser Ethereum wallet',
      available,
      chainIdHex: null,
    },
  ];
}

export async function connectEthereumWallet(): Promise<EthereumWalletConnection> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error(
      'No Ethereum wallet detected. Install MetaMask, Coinbase Wallet, Brave, or Rainbow.',
    );
  }
  const accounts = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];
  const address = accounts?.[0];
  if (!isPlausibleEthereumAddress(address)) {
    throw new Error('Wallet did not return a valid Ethereum address.');
  }
  const chainIdHex = (await window.ethereum.request({
    method: 'eth_chainId',
  })) as string;
  const chainId = Number.parseInt(chainIdHex, 16);
  return {
    providerId: detectProviderId(),
    address: address.toLowerCase(),
    chainId,
    chainIdHex,
    connected: true,
  };
}

export async function switchEthereumChain(chainId: number): Promise<void> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum wallet detected.');
  }
  const hex = `0x${chainId.toString(16)}`;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hex }],
    });
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code === 4902 && chainId === 11155111) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: hex,
            chainName: 'Sepolia',
            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        ],
      });
      return;
    }
    throw err;
  }
}

/**
 * Sign a Bitcode-domain message for session binding (SIWE-shaped, minimal).
 */
export async function signEthereumAuthMessage(
  address: string,
  message: string,
): Promise<string> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum wallet detected.');
  }
  const sig = (await window.ethereum.request({
    method: 'personal_sign',
    params: [message, address],
  })) as string;
  if (!sig || typeof sig !== 'string') {
    throw new Error('Wallet did not return a signature.');
  }
  return sig;
}

export function buildBitcodeEthereumAuthMessage(input: {
  address: string;
  nonce: string;
  chainId: number;
  issuedAt?: string;
}): string {
  const issuedAt = input.issuedAt || new Date().toISOString();
  return [
    'Bitcode wants you to sign in with your Ethereum account:',
    input.address,
    '',
    'This proves wallet control for Auxillaries identity and settlement readiness.',
    'No BTD or ETH is transferred by this signature.',
    '',
    `URI: https://bitcode.exchange`,
    `Version: 1`,
    `Chain ID: ${input.chainId}`,
    `Nonce: ${input.nonce}`,
    `Issued At: ${issuedAt}`,
  ].join('\n');
}

/** Target chain for testnet product (Sepolia). */
export const BITCODE_ETHEREUM_TESTNET_CHAIN_ID = 11155111;
