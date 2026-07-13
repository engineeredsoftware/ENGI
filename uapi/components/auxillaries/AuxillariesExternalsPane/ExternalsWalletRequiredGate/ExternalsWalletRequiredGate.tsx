/**
 * Pre-identity gate when wallet/session is missing — directs operator to Wallet.
 */

import React from 'react';
import Link from 'next/link';

import { buildAuxillariesRoutePath } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

export default function ExternalsWalletRequiredGate() {
  return (
    <div className="space-y-4 rounded-[24px] border border-white/10 bg-black/20 p-5 text-white/80">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Connect Bitcoin wallet first</h3>
        <p className="text-sm leading-7 text-white/68">
          Connect a Bitcoin-capable wallet in Wallet, then attach GitHub here so read
          measurement, asset-pack synthesis, and settlement follow-through can operate
          against a live repository source.
        </p>
      </div>

      <div className="grid gap-3 tablet:grid-cols-2">
        <div className="rounded-2xl border border-emerald-300/16 bg-emerald-400/8 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/78">
            Execution prerequisite
          </p>
          <p className="mt-2 text-sm leading-7 text-white/74">
            GitHub plus a connected wallet are the minimum live prerequisites before Bitcode
            should measure read, synthesize asset packs, settle, and deliver.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/72">
            Current posture
          </p>
          <p className="mt-2 text-sm leading-7 text-white/74">
            Wallet authentication opens Bitcode access first. Externals then owns repository
            attachment, scope review, and non-wallet third-party posture.
          </p>
        </div>
      </div>

      <div>
        <Link
          href={buildAuxillariesRoutePath('wallet')}
          className="inline-flex items-center justify-center rounded-full border border-emerald-300/24 bg-emerald-400/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50 transition-colors hover:border-emerald-300/42 hover:bg-emerald-400/18"
        >
          Open Wallet auxillary
        </Link>
      </div>
    </div>
  );
}
