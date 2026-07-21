'use client';

/**
 * Seller payout finalize panel on pack detail.
 * Slider: BTD % vs ETH % (pay-asset for this settle; ETH for now).
 * Treasury receives the inverse remainder of each asset.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { PacksDetailSection } from '@/components/packs/PacksDetailSection/PacksDetailSection';

export type PacksPendingPayout = {
  status?: string;
  settleRunId?: string;
  btdVolume?: string;
  payAmount?: string;
  payAsset?: 'ETH' | 'BTC' | 'SOL';
  needFitVolume?: number;
  sellerAccount?: string;
  buyerAccount?: string;
  patchSummary?: string | null;
  sellerBtdBpsFinalized?: number | null;
  sellerBtd?: string | null;
  treasuryBtd?: string | null;
  sellerPay?: string | null;
  treasuryPay?: string | null;
  finalizedAt?: string | null;
};

export type PacksActivityDetailPayoutProps = {
  settleRunId: string;
  pendingPayout: PacksPendingPayout;
  /** True when the current user may finalize (seller role). */
  canFinalize?: boolean;
  /** Buyer-entitled patch summary when current user is buyer. */
  entitledPatchSummary?: string | null;
  /** Fully rich entitled patch artifact (post-settle only). */
  entitledPatch?: unknown;
  isBuyer?: boolean;
  onFinalized?: () => void;
};

function downloadEntitledArtifact(input: {
  settleRunId: string;
  entitledPatch: unknown;
  entitledPatchSummary?: string | null;
}) {
  const body = JSON.stringify(
    {
      schema: 'bitcode.packs.entitled-asset-pack-delivery',
      settleRunId: input.settleRunId,
      entitledPatch: input.entitledPatch ?? null,
      patchSummary: input.entitledPatchSummary ?? null,
    },
    null,
    2,
  );
  const blob = new Blob([body], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `bitcode-entitled-${input.settleRunId.slice(0, 8)}.json`;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function formatBaseUnits(value: string | undefined, decimals: number): string {
  if (!value) return '0';
  try {
    const n = BigInt(value);
    if (n === 0n) return '0';
    const scale = 10n ** BigInt(decimals);
    const whole = n / scale;
    const frac = n % scale;
    if (frac === 0n) return whole.toString();
    const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '').slice(0, 6);
    return `${whole.toString()}.${fracStr}`;
  } catch {
    return value;
  }
}

export function PacksActivityDetailPayout({
  settleRunId,
  pendingPayout,
  canFinalize = false,
  entitledPatchSummary = null,
  entitledPatch = null,
  isBuyer = false,
  onFinalized,
}: PacksActivityDetailPayoutProps) {
  const payAsset = pendingPayout.payAsset || 'ETH';
  const payDecimals = payAsset === 'ETH' ? 18 : payAsset === 'BTC' ? 8 : 9;
  const finalized = pendingPayout.status === 'finalized';
  const [sellerBtdBps, setSellerBtdBps] = useState(
    typeof pendingPayout.sellerBtdBpsFinalized === 'number'
      ? pendingPayout.sellerBtdBpsFinalized
      : 1000,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const sellerBtdPct = sellerBtdBps / 100;
  const sellerEthPct = (10_000 - sellerBtdBps) / 100;

  const livePreview = useMemo(() => {
    try {
      const btd = BigInt(pendingPayout.btdVolume || '0');
      const pay = BigInt(pendingPayout.payAmount || '0');
      const sellerBtd = (btd * BigInt(sellerBtdBps)) / 10_000n;
      const treasuryBtd = btd - sellerBtd;
      const sellerPay = (pay * BigInt(10_000 - sellerBtdBps)) / 10_000n;
      const treasuryPay = pay - sellerPay;
      return { sellerBtd, treasuryBtd, sellerPay, treasuryPay };
    } catch {
      return null;
    }
  }, [pendingPayout.btdVolume, pendingPayout.payAmount, sellerBtdBps]);

  const onSubmit = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/packs/payout/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ settleRunId, sellerBtdBps }),
      });
      const payload = (await res.json()) as { ok?: boolean; error?: string; split?: unknown };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error || 'Finalize failed');
      }
      setResult(payload as Record<string, unknown>);
      onFinalized?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, [onFinalized, sellerBtdBps, settleRunId]);

  return (
    <PacksDetailSection title="Payout (seller review)">
      <div className="grid gap-4 text-sm">
        <p className="text-neutral-300 leading-6">
          Need-fit BTD volume is escrowed. Choose how much of your compensation is{' '}
          <strong className="text-neutral-100">BTD</strong> vs{' '}
          <strong className="text-neutral-100">{payAsset}</strong>. Treasury receives the
          inverse remainder of each asset.
        </p>

        <dl className="grid gap-2 tablet:grid-cols-2">
          <div>
            <dt className="text-neutral-500">BTD volume (escrow)</dt>
            <dd className="mt-1 font-mono text-neutral-100">
              {formatBaseUnits(pendingPayout.btdVolume, 18)} BTD
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Paid ({payAsset})</dt>
            <dd className="mt-1 font-mono text-neutral-100">
              {formatBaseUnits(pendingPayout.payAmount, payDecimals)} {payAsset}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Need-fit</dt>
            <dd className="mt-1 font-mono text-neutral-100">
              {typeof pendingPayout.needFitVolume === 'number'
                ? pendingPayout.needFitVolume.toFixed(4)
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Status</dt>
            <dd className="mt-1 text-neutral-100">
              {finalized || result ? 'finalized' : pendingPayout.status || 'pending-seller-review'}
            </dd>
          </div>
        </dl>

        {(isBuyer || canFinalize) &&
        (entitledPatch || entitledPatchSummary || pendingPayout.patchSummary) ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-emerald-200/80">
              Entitled delivery (post-settle)
            </p>
            <p className="mt-2 font-mono text-xs text-emerald-50 whitespace-pre-wrap">
              {entitledPatchSummary || pendingPayout.patchSummary || 'Patch artifact ready.'}
            </p>
            <p className="mt-2 text-[0.7rem] leading-5 text-neutral-400">
              Delivered as a PR on a clean{' '}
              <span className="font-mono text-neutral-300">bitcode/</span> branch from the
              request SHA. Download the fully rich entitled artifact below.
            </p>
            <button
              type="button"
              data-testid="packs-entitled-download"
              onClick={() =>
                downloadEntitledArtifact({
                  settleRunId,
                  entitledPatch,
                  entitledPatchSummary:
                    entitledPatchSummary || pendingPayout.patchSummary || null,
                })
              }
              className="mt-3 border border-emerald-300/40 bg-emerald-400/15 px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-emerald-50 transition hover:border-emerald-200/50 hover:bg-emerald-400/25"
            >
              Download entitled AssetPack
            </button>
          </div>
        ) : null}

        {!finalized && !result && canFinalize ? (
          <>
            <label className="grid gap-2">
              <span className="text-neutral-400">
                Seller split — BTD {sellerBtdPct.toFixed(0)}% / {payAsset}{' '}
                {sellerEthPct.toFixed(0)}%
              </span>
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={sellerBtdBps}
                onChange={(e) => setSellerBtdBps(Number(e.target.value))}
                className="w-full accent-emerald-400"
                aria-label="Seller BTD versus pay-asset split"
              />
            </label>

            {livePreview ? (
              <div className="grid gap-2 rounded-lg border border-white/10 bg-black/20 p-3 tablet:grid-cols-2">
                <div>
                  <p className="text-neutral-500">You (seller)</p>
                  <p className="font-mono text-neutral-100">
                    {formatBaseUnits(livePreview.sellerBtd.toString(), 18)} BTD
                  </p>
                  <p className="font-mono text-neutral-100">
                    {formatBaseUnits(livePreview.sellerPay.toString(), payDecimals)} {payAsset}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Bitcode treasury</p>
                  <p className="font-mono text-neutral-100">
                    {formatBaseUnits(livePreview.treasuryBtd.toString(), 18)} BTD
                  </p>
                  <p className="font-mono text-neutral-100">
                    {formatBaseUnits(livePreview.treasuryPay.toString(), payDecimals)} {payAsset}
                  </p>
                </div>
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-300">{error}</p> : null}

            <button
              type="button"
              disabled={busy}
              onClick={() => void onSubmit()}
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {busy ? 'Finalizing…' : 'Finalize payout'}
            </button>
          </>
        ) : null}

        {(finalized || result) && (
          <div className="grid gap-2 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3 tablet:grid-cols-2">
            <div>
              <p className="text-neutral-500">Seller received</p>
              <p className="font-mono text-neutral-100">
                {formatBaseUnits(
                  String(
                    (result?.split as { sellerBtd?: string } | undefined)?.sellerBtd ||
                      pendingPayout.sellerBtd ||
                      '0',
                  ),
                  18,
                )}{' '}
                BTD
              </p>
              <p className="font-mono text-neutral-100">
                {formatBaseUnits(
                  String(
                    (result?.split as { sellerPay?: string } | undefined)?.sellerPay ||
                      pendingPayout.sellerPay ||
                      '0',
                  ),
                  payDecimals,
                )}{' '}
                {payAsset}
              </p>
            </div>
            <div>
              <p className="text-neutral-500">Treasury retained</p>
              <p className="font-mono text-neutral-100">
                {formatBaseUnits(
                  String(
                    (result?.split as { treasuryBtd?: string } | undefined)?.treasuryBtd ||
                      pendingPayout.treasuryBtd ||
                      '0',
                  ),
                  18,
                )}{' '}
                BTD
              </p>
              <p className="font-mono text-neutral-100">
                {formatBaseUnits(
                  String(
                    (result?.split as { treasuryPay?: string } | undefined)?.treasuryPay ||
                      pendingPayout.treasuryPay ||
                      '0',
                  ),
                  payDecimals,
                )}{' '}
                {payAsset}
              </p>
            </div>
          </div>
        )}

        {!canFinalize && !isBuyer && !finalized ? (
          <p className="text-neutral-500">
            Connect as the seller wallet to review and finalize this payout.
          </p>
        ) : null}
      </div>
    </PacksDetailSection>
  );
}
