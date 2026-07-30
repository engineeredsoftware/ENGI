/**
 * Read AssetPack options list + multi-rail settle checkout (deposit twin).
 * Pay rails: ETH (P0 live path) | BTC | SOL. Never pay BTD.
 */

"use client";

import React from "react";
import type {
  ReadSelectionEnvelope,
  ReadSynthesizedOption,
} from "@/components/reads/ReadPageClient/hooks/use-read-option-synthesis";
import { ReadsOptionCard } from "@/components/reads/ReadsOptionCard/ReadsOptionCard";

export type ReadPayAsset = "ETH" | "BTC" | "SOL";

export type ReadSettleQuoteOption = {
  payAsset: ReadPayAsset;
  payAmount: string;
  payAmountDisplay: string;
  rateMicro: number;
  payAmountUsd: number;
  rateUpdatedAt: string;
  available: boolean;
  unavailableReason?: string | null;
  decimals: number;
};

export type ReadSettleQuote = {
  provider: string;
  needFitVolume: number;
  rawVolumeBaseUnits: string;
  btdVolume: string;
  btdVolumeDisplay: string;
  decay: number;
  decayMicro: number;
  expiresAt: string;
  options: ReadSettleQuoteOption[];
};

export function ReadsAssetPackOptions(props: {
  options: ReadSynthesizedOption[];
  envelope: ReadSelectionEnvelope | null;
  selectedIndexes: number[];
  onToggleSelect: (index: number) => void;
  onSettleSelected: () => void;
  settleBusy?: boolean;
  settleError?: string | null;
  settleMessage?: string | null;
  /** Selected pay rail (ETH is P0). */
  payAsset?: ReadPayAsset;
  onPayAssetChange?: (asset: ReadPayAsset) => void;
  /** Multi-rail quote for the current selection. */
  quote?: ReadSettleQuote | null;
  quoteBusy?: boolean;
  quoteError?: string | null;
  onRefreshQuote?: () => void;
  /** Connected buyer Ethereum address (0x…). */
  buyerEthereumAddress?: string | null;
  /**
   * Measurement-only buy gate (needinesses + absolute gates).
   * When false, quote/settle must not proceed.
   */
  measurementGateAllowed?: boolean;
  measurementGateCaution?: boolean;
  measurementGateBlockers?: string[];
  measurementGateCautions?: string[];
}) {
  const {
    options,
    envelope,
    selectedIndexes,
    onToggleSelect,
    onSettleSelected,
    settleBusy,
    settleError,
    settleMessage,
    payAsset = "ETH",
    onPayAssetChange,
    quote = null,
    quoteBusy = false,
    quoteError = null,
    onRefreshQuote,
    buyerEthereumAddress = null,
    measurementGateAllowed = true,
    measurementGateCaution = false,
    measurementGateBlockers = [],
    measurementGateCautions = [],
  } = props;

  const hasOptions = options.length > 0;
  const hasSelection = selectedIndexes.length > 0;
  const selectedRail = quote?.options.find((o) => o.payAsset === payAsset) ?? null;
  const railAvailable = selectedRail?.available !== false;
  // Projected multi-rail settle is allowed for all three rails (ETH P0 live path).
  // Measurement-only buy gate: need-fit + safety (do_not_buy / cannot_assess block).
  const canSettle =
    hasSelection &&
    !settleBusy &&
    !quoteBusy &&
    railAvailable &&
    measurementGateAllowed;

  const rails: Array<{
    asset: ReadPayAsset;
    label: string;
    hint: string;
    disabled?: boolean;
  }> = [
    {
      asset: "ETH",
      label: "Pay with Ethereum",
      hint: "Sepolia · P0 working rail",
    },
    {
      asset: "BTC",
      label: "Pay with Bitcoin",
      hint: "Mock / attestor later",
    },
    {
      asset: "SOL",
      label: "Pay with Solana",
      hint: "Mock / attestor later",
    },
  ];

  return (
    <section
      data-testid="reads-asset-pack-options"
      className="border border-white/10 bg-white/[0.035] px-4 py-4"
      aria-label="Read AssetPack options"
    >
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-orange-200/80">
        Source-safe proposals
      </p>
      <h2 className="mt-2 text-lg font-semibold text-white">AssetPack options</h2>

      {envelope?.validationSummary ? (
        <p className="mt-2 text-xs text-neutral-400">{envelope.validationSummary}</p>
      ) : null}

      {!hasOptions ? (
        <div
          data-testid="reads-options-await-synthesis"
          className="mt-3 border border-white/10 bg-black/20 px-4 py-6 text-sm text-neutral-400"
        >
          Measured AssetPack options appear here after synthesis — select a repository
          and SHA, describe the Need, set Relevant / Irrelevant paths, then Synthesize.
        </div>
      ) : (
        <div className="mt-3 grid min-w-0 gap-3 tablet:grid-cols-2">
          {options.map((opt) => (
            <ReadsOptionCard
              key={opt.index}
              option={opt}
              selected={selectedIndexes.includes(opt.index)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}

      {hasOptions ? (
        <div
          className="mt-5 space-y-4 border-t border-white/10 pt-4"
          data-testid="reads-settle-checkout"
        >
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-neutral-500">
              Checkout · multi-rail spot
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Never pay BTD. Buyers pay ETH (P0), later BTC/SOL. Sellers earn BTD on
              settle (escrow mint → finalize on Packs).
            </p>
          </div>

          <div
            className="grid gap-2 tablet:grid-cols-3"
            role="radiogroup"
            aria-label="Pay rail"
            data-testid="reads-pay-rail-group"
          >
            {rails.map((rail) => {
              const option = quote?.options.find((o) => o.payAsset === rail.asset);
              const selected = payAsset === rail.asset;
              const unavailable = option ? option.available === false : false;
              return (
                <button
                  key={rail.asset}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-testid={`reads-pay-rail-${rail.asset.toLowerCase()}`}
                  disabled={settleBusy}
                  onClick={() => onPayAssetChange?.(rail.asset)}
                  className={`border px-3 py-3 text-left transition ${
                    selected
                      ? "border-emerald-300/50 bg-emerald-400/12 text-emerald-50"
                      : "border-white/10 bg-black/20 text-neutral-200 hover:border-white/20"
                  } ${unavailable ? "opacity-60" : ""}`}
                >
                  <span className="block text-sm font-medium">{rail.label}</span>
                  <span className="mt-1 block text-[0.7rem] text-neutral-400">
                    {rail.hint}
                  </span>
                  {option ? (
                    <span className="mt-2 block font-mono text-xs text-white/90">
                      {option.payAmountDisplay} {rail.asset}
                      {typeof option.payAmountUsd === "number" ? (
                        <span className="text-neutral-500">
                          {" "}
                          · ~${option.payAmountUsd.toFixed(2)}
                        </span>
                      ) : null}
                    </span>
                  ) : quoteBusy ? (
                    <span className="mt-2 block text-[0.7rem] text-neutral-500">
                      Quoting…
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div
            className="grid gap-3 border border-white/10 bg-black/25 px-3 py-3 tablet:grid-cols-3"
            data-testid="reads-settle-quote-summary"
          >
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
                BTD volume (needinesses × decay)
              </p>
              <p className="mt-1 font-mono text-sm text-emerald-100">
                {quoteBusy
                  ? "…"
                  : quote
                    ? `${quote.btdVolumeDisplay} BTD`
                    : hasSelection
                      ? "Select options to quote"
                      : "—"}
              </p>
              {quote ? (
                <p className="mt-0.5 text-[0.7rem] text-neutral-500">
                  needFit {quote.needFitVolume.toFixed(4)} · decay{" "}
                  {(quote.decay * 100).toFixed(2)}% · {quote.provider}
                </p>
              ) : null}
            </div>
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
                You pay ({payAsset})
              </p>
              <p className="mt-1 font-mono text-sm text-orange-100">
                {selectedRail
                  ? `${selectedRail.payAmountDisplay} ${payAsset}`
                  : quoteBusy
                    ? "…"
                    : "—"}
              </p>
              {selectedRail?.unavailableReason ? (
                <p className="mt-0.5 text-[0.7rem] text-rose-300">
                  {selectedRail.unavailableReason}
                </p>
              ) : null}
            </div>
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
                Buyer wallet
              </p>
              <p
                className="mt-1 break-all font-mono text-xs text-white/90"
                data-testid="reads-buyer-address"
              >
                {buyerEthereumAddress || "Connect Ethereum in Auxillaries"}
              </p>
              {!buyerEthereumAddress ? (
                <p className="mt-0.5 text-[0.7rem] text-amber-200/80">
                  Projected settle still runs; live Sepolia needs a connected 0x address.
                </p>
              ) : null}
            </div>
          </div>

          {hasSelection && !measurementGateAllowed ? (
            <div
              className="border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-[0.75rem] leading-5 text-rose-50"
              data-testid="reads-measurement-gate-block"
              role="alert"
            >
              <p className="font-medium">
                Settle blocked (measurement-only buy gate)
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {(measurementGateBlockers.length
                  ? measurementGateBlockers
                  : ["Selected options fail need-fit or safety measurements."]
                )
                  .slice(0, 5)
                  .map((b) => (
                    <li key={b}>{b}</li>
                  ))}
              </ul>
              <p className="mt-1 text-[0.7rem] text-rose-100/80">
                Needinesses (*-fit) price BTD volume; safety gates can hard-block.
                Review option cards above.
              </p>
            </div>
          ) : null}

          {hasSelection && measurementGateAllowed && measurementGateCaution ? (
            <div
              className="border border-amber-400/35 bg-amber-500/10 px-3 py-2 text-[0.75rem] leading-5 text-amber-50"
              data-testid="reads-measurement-gate-caution"
            >
              <p className="font-medium">Buy with caution</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {measurementGateCautions.slice(0, 4).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="reads-settle-selected"
              onClick={() => void onSettleSelected()}
              disabled={!canSettle}
              className="border border-emerald-300/40 bg-emerald-400/15 px-4 py-2 text-sm font-medium text-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {settleBusy
                ? "Settling…"
                : payAsset === "ETH"
                  ? `Buy with ETH · settle (${selectedIndexes.length})`
                  : `Settle with ${payAsset} (${selectedIndexes.length})`}
            </button>
            {onRefreshQuote && hasSelection ? (
              <button
                type="button"
                data-testid="reads-refresh-quote"
                onClick={() => void onRefreshQuote()}
                disabled={quoteBusy || settleBusy}
                className="border border-white/15 bg-white/[0.04] px-3 py-2 text-xs text-neutral-200 disabled:opacity-40"
              >
                {quoteBusy ? "Quoting…" : "Refresh quote"}
              </button>
            ) : null}
            {quoteError ? (
              <p className="text-sm text-rose-200" data-testid="reads-quote-error">
                {quoteError}
              </p>
            ) : null}
            {settleError ? (
              <p className="text-sm text-rose-200" data-testid="reads-settle-error">
                {settleError}
              </p>
            ) : null}
            {settleMessage ? (
              <p className="text-sm text-emerald-100/90" data-testid="reads-settle-message">
                {settleMessage}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
