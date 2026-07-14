"use client";

/**
 * Bitcoin wallet connection panel — connect/disconnect/stage UI for the wallet
 * auxillary. Lifecycle and persistence live in hooks/use-wallet-connection.
 * Chrome Connect dispatches a brief attention cue on this section + CTAs.
 */

import React, { useEffect, useRef, useState } from 'react';

import {
  BITCODE_FOCUS_WALLET_CONNECT_EVENT,
  clearPendingWalletConnectAttention,
  hasPendingWalletConnectAttention,
  WALLET_CONNECT_ATTENTION_MS,
} from './models/wallet-connect-attention';
import { formatWalletReadout } from './models/wallet-connection-format';
import { useWalletConnection } from './hooks/use-wallet-connection';

export interface AuxillariesWalletConnectionPanelProps {
  initialWalletAddress?: string | null;
  initialWalletProvider?: string | null;
  initialWalletBindingStatus?: 'pending' | 'manual' | 'verified' | null;
  initialWalletBoundAt?: string | null;
  onWalletIdentityChange?: (hasWalletIdentity: boolean) => void;
}

export default function AuxillariesWalletConnectionPanel({
  initialWalletAddress = '',
  initialWalletProvider = '',
  initialWalletBindingStatus = null,
  initialWalletBoundAt = null,
  onWalletIdentityChange,
}: AuxillariesWalletConnectionPanelProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [attentionActive, setAttentionActive] = useState(false);
  const attentionTimerRef = useRef<number | null>(null);
  /** Restart CSS animation when the same class is re-applied. */
  const [attentionKey, setAttentionKey] = useState(0);

  const {
    walletAddress,
    walletBindingStatus,
    walletBoundAt,
    walletAuthError,
    walletAuthNotice,
    walletAuthStatus,
    pendingAuthorizeUrl,
    walletProviderOptions,
    walletProviderScanStatus,
    walletReadout,
    hasWalletIdentity,
    hasProviderWalletIdentity,
    refreshBitcoinWalletProviders,
    handleStageBitcoinAddress,
    handleConnectBitcoinWallet,
    handleDisconnectWallet,
    handleWalletAddressChange,
  } = useWalletConnection({
    initialWalletAddress,
    initialWalletProvider,
    initialWalletBindingStatus,
    initialWalletBoundAt,
    onWalletIdentityChange,
  });

  useEffect(() => {
    const runAttention = () => {
      clearPendingWalletConnectAttention();
      // Drop then re-apply so CSS animations restart on repeated Connect clicks.
      setAttentionActive(false);
      setAttentionKey((key) => key + 1);
      if (attentionTimerRef.current != null) {
        window.clearTimeout(attentionTimerRef.current);
      }
      window.requestAnimationFrame(() => {
        setAttentionActive(true);
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        attentionTimerRef.current = window.setTimeout(() => {
          setAttentionActive(false);
          attentionTimerRef.current = null;
        }, WALLET_CONNECT_ATTENTION_MS);
      });
    };

    window.addEventListener(BITCODE_FOCUS_WALLET_CONNECT_EVENT, runAttention);

    // Connect from another pane: panel was unmounted when the event fired.
    // Honor the pending flag once this instance mounts.
    if (hasPendingWalletConnectAttention()) {
      runAttention();
    }

    return () => {
      window.removeEventListener(BITCODE_FOCUS_WALLET_CONNECT_EVENT, runAttention);
      if (attentionTimerRef.current != null) {
        window.clearTimeout(attentionTimerRef.current);
      }
    };
  }, []);

  const connectButtonClassName = [
    'wallet-connect-provider-button inline-flex items-center justify-center rounded-none border border-orange-300/34 bg-orange-400/14 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-50 transition hover:border-orange-300/54 hover:bg-orange-400/22 disabled:cursor-wait disabled:opacity-60',
    attentionActive ? 'wallet-connect-attention-button' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      ref={sectionRef}
      data-testid="wallet-required-section"
      data-wallet-attention-key={attentionKey || undefined}
      className={[
        'orbital-section mb-5 wallet-required-section',
        hasWalletIdentity ? 'wallet-required-section--connected' : 'wallet-required-section--pending',
        attentionActive ? 'wallet-connect-attention-section' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        /* Border / bg / glow live in CSS so attention animation can own them. */
        borderRadius: 0,
        padding: '20px',
      }}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-100/76">
            1. Required wallet
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">Connect Bitcoin wallet</h3>
          <p className="mt-2 max-w-[48rem] text-sm leading-7 text-white/70">
            Wallet connection is the first Bitcode identity action. It binds the operator address
            for BTC fee readiness, BTD read-right posture, and signed proof continuity. Ethereum
            account prompts are not used for this step.
          </p>
        </div>
        <span
          className={`rounded-none border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            hasWalletIdentity
              ? 'border-emerald-300/26 bg-emerald-400/12 text-emerald-100'
              : 'border-orange-300/26 bg-orange-400/12 text-orange-100'
          }`}
        >
          {hasWalletIdentity ? 'Connected' : 'Required first'}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {walletProviderOptions.length > 0 ? (
          walletProviderOptions.map((provider) => (
            <button
              key={provider.id}
              type="button"
              data-testid={`wallet-connect-${provider.id}`}
              onClick={() => handleConnectBitcoinWallet(provider.id)}
              disabled={walletAuthStatus === 'requesting'}
              className={connectButtonClassName}
            >
              {walletAuthStatus === 'requesting'
                ? `Opening ${provider.label}`
                : hasProviderWalletIdentity
                  ? `Reconnect ${provider.label}`
                  : `Connect ${provider.label}`}
            </button>
          ))
        ) : (
          <button
            type="button"
            data-testid="wallet-connect-bitcoin-wallet"
            onClick={() => handleConnectBitcoinWallet()}
            disabled={walletAuthStatus === 'requesting'}
            className={connectButtonClassName}
          >
            {walletAuthStatus === 'requesting'
              ? 'Opening Bitcoin wallet'
              : hasProviderWalletIdentity
                ? 'Reconnect Bitcoin wallet'
                : 'Connect Bitcoin wallet'}
          </button>
        )}
        <button
          type="button"
          onClick={refreshBitcoinWalletProviders}
          disabled={walletAuthStatus === 'requesting'}
          className="inline-flex items-center justify-center rounded-none border border-white/12 bg-white/6 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/66 transition hover:border-white/24 hover:bg-white/10 disabled:cursor-wait disabled:opacity-45"
        >
          Rescan wallets
        </button>
        {hasWalletIdentity ? (
          <button
            type="button"
            data-testid="wallet-disconnect-bitcode"
            onClick={handleDisconnectWallet}
            disabled={walletAuthStatus === 'requesting'}
            className="inline-flex items-center justify-center rounded-none border border-rose-300/24 bg-rose-400/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-100 transition hover:border-rose-300/42 hover:bg-rose-400/18 disabled:cursor-wait disabled:opacity-45"
          >
            Disconnect wallet
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleStageBitcoinAddress}
          disabled={walletAuthStatus === 'requesting' || !walletAddress.trim()}
          className="inline-flex items-center justify-center rounded-none border border-white/14 bg-white/7 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/76 transition hover:border-white/24 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Stage Bitcoin address
        </button>
      </div>
      {walletAuthError ? (
        <div
          role="alert"
          className="mt-3 border border-amber-300/24 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100"
        >
          <p>{walletAuthError}</p>
          {pendingAuthorizeUrl ? (
            <a
              href={pendingAuthorizeUrl}
              className="mt-2 inline-flex items-center border border-amber-300/34 bg-amber-400/14 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-50 transition hover:border-amber-300/54 hover:bg-amber-400/22"
            >
              Open Bitcoin authentication manually
            </a>
          ) : null}
        </div>
      ) : null}
      <div className="mt-3 rounded-none border border-white/10 bg-black/18 px-4 py-3 text-sm leading-6 text-white/68">
        <span className="font-semibold text-white/82">
          {walletProviderScanStatus === 'checking'
            ? 'Checking installed Bitcoin wallets'
            : walletProviderOptions.length > 0
              ? `Detected ${walletProviderOptions.map((provider) => provider.label).join(', ')}`
              : 'No compatible Bitcoin wallet detected'}
        </span>
        {walletAuthNotice ? (
          <span className="ml-2 text-orange-100/82">{walletAuthNotice}</span>
        ) : walletProviderScanStatus === 'none' ? (
          <span className="ml-2">
            Xverse or Leather must be unlocked, enabled on this site, and set to Testnet4 for this QA pass.
          </span>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3 tablet:grid-cols-[1fr_0.95fr]">
        <div className="orbitals-users-input-container enterprise">
          <input
            data-testid="wallet-address-input"
            id="walletAddress"
            type="text"
            value={walletAddress}
            onChange={(e) => handleWalletAddressChange(e.target.value)}
            className="form-input"
            placeholder="Bitcoin address appears here after wallet connection"
            aria-label="Bitcode Bitcoin wallet address"
          />
          <div className="input-focus-indicator"></div>
        </div>
        <div className="rounded-none border border-white/10 bg-black/22 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/58">
            Current wallet state
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {walletAddress
              ? walletBindingStatus === 'verified'
                ? 'Verified Bitcoin signer'
                : walletBindingStatus === 'pending'
                  ? 'Bitcoin provider connected'
                  : 'Manual Bitcoin address staged'
              : 'No Bitcoin wallet connected'}
          </p>
          {walletBoundAt ? (
            <p className="mt-1 text-xs text-white/54">
              Bound {new Date(walletBoundAt).toLocaleString()}
            </p>
          ) : null}
          <dl className="mt-3 grid gap-2 text-xs leading-5 text-white/66">
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Provider</dt>
              <dd className="min-w-0 break-words text-white/86">{walletReadout.providerLabel}</dd>
            </div>
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Network</dt>
              <dd className="min-w-0 break-words text-white/80">{walletReadout.network ?? 'Not provided'}</dd>
            </div>
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Auth address</dt>
              <dd className="min-w-0 break-all text-white/80">{formatWalletReadout(walletReadout.authAddress)}</dd>
            </div>
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Payment</dt>
              <dd className="min-w-0 break-all text-white/80">{formatWalletReadout(walletReadout.paymentAddress)}</dd>
            </div>
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Address type</dt>
              <dd className="min-w-0 break-words text-white/80">{walletReadout.addressType ?? 'Not provided'}</dd>
            </div>
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Proof</dt>
              <dd className="min-w-0 break-words text-white/80">{walletReadout.proofKind ?? 'Not provided'}</dd>
            </div>
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Persistence</dt>
              <dd className="min-w-0 break-words text-white/80">{walletReadout.persistence ?? 'wallet'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
