"use client";
/* eslint-disable react/no-multi-comp */

import React from 'react';
import FlexibleBtdSelector from './FlexibleBtdSelector';

export interface BTDPricesProps {
  selectedPlan: string | null;
  onSelectPlan: (planId: string) => void;
  referenceUsdAmount: number;
  onChangeReferenceUsdAmount: (usdAmount: number) => void;
  onAcquireBtd: (intentId: string, measuredBtdTarget: number, usdReferenceAmount: number) => void;
  referenceUsdPerBtd: number;
  /** Whether the user is signed in; disables acquisition click if false */
  isSignedIn: boolean;

  /** Force the main acquisition card to appear before the flank cards (useful in
   *  narrow, embedded panes where vertical stacking is desired).  Keeps
   *  marketing default (flank–center–flank) when omitted */
  centerFirst?: boolean;
}

/**
 * Simple reusable informational side-card (left & right of the acquisition card).
 */
import { ScaleIcon, ArrowPathIcon, SparklesIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

interface SideCardProps {
  title: string;
  accent: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: React.ReactNode;
}

const SideInfoCard: React.FC<SideCardProps> = ({ title, accent, icon: Icon, children }) => (
  <div
    className="card aspect-square laptop:aspect-auto flex flex-col items-center justify-center text-center p-5 laptop:p-4 rounded-lg bg-white/5 shadow-inner border border-white/10 space-y-4 laptop:space-y-2"
    style={{ contain: 'paint' }}
  >
    <div className="flex flex-col items-center justify-center gap-2">
      <span className={`rounded-full p-3 bg-current/10 ${accent}`}>
        <Icon className="w-6 h-6" />
      </span>
      <h4 className={`font-semibold text-base laptop:text-lg ${accent}`}>{title}</h4>
    </div>
    {children && (
      <p className="text-xs laptop:text-sm text-gray-300 leading-relaxed w-full">{children}</p>
    )}
  </div>
);

export const BTDPrices: React.FC<BTDPricesProps> = ({
  selectedPlan,
  onSelectPlan,
  referenceUsdAmount,
  onChangeReferenceUsdAmount,
  onAcquireBtd,
  referenceUsdPerBtd,
  isSignedIn,
  centerFirst = false,
}) => {
  /* ------------------------------------------------------------------
   * Slider bounds for a BTC-fee reference amount. V27 owns both Terminal
   * Read minting and the minimal Exchange path for existing AssetPack ranges.
   * Broader market depth remains later-version work.
   * ------------------------------------------------------------------ */
  const EXCHANGE_REFERENCE_USD_PER_BTD = 0.22;
  const MAX_BTC_FEE_REFERENCE_USD = 10_000;

  const EXCHANGE_REFERENCE_BTD = Math.floor(MAX_BTC_FEE_REFERENCE_USD / EXCHANGE_REFERENCE_USD_PER_BTD);

  // Slider bounds in USD-reference terms.
  const sliderMinUSD = 0;
  const sliderMaxUSD = MAX_BTC_FEE_REFERENCE_USD;

  const btcFeeReferenceUsd = referenceUsdAmount;

  const isExchangePreview = btcFeeReferenceUsd === sliderMaxUSD;

  // Derived values
  const measuredBtdReference = isExchangePreview
    ? EXCHANGE_REFERENCE_BTD
    : Math.round(btcFeeReferenceUsd / referenceUsdPerBtd);

  const planLabel = isExchangePreview ? 'Exchange Range' : 'Terminal Read';
  const planId = isExchangePreview ? 'exchange-existing-btd' : 'terminal-read';
  const accent = isExchangePreview ? 'purple' : 'emerald';
  const accentColor = accent;

  const segmentText = isExchangePreview
    ? 'Acquire existing $BTD AssetPack range rights through the minimal V27 Exchange path'
    : 'Submit a Read so a future Fit can mint $BTD in Terminal V27';

  /* ------------------------------------------------------------------
   * Exchange-preview advisory logic
   * ------------------------------------------------------------------ */
  const flexibleReferenceUsd = btcFeeReferenceUsd;
  const exchangeEquivalentUsd = measuredBtdReference * EXCHANGE_REFERENCE_USD_PER_BTD;
  const referenceDeltaUsd = flexibleReferenceUsd - exchangeEquivalentUsd;

  const showAdvisory = !isExchangePreview && flexibleReferenceUsd >= MAX_BTC_FEE_REFERENCE_USD * 0.95;

  const handleJumpToExchangePreview = () => {
    onChangeReferenceUsdAmount(MAX_BTC_FEE_REFERENCE_USD);
  };

  // Build advisory when visible
  const advisoryContent = showAdvisory ? (
    <>
      At{' '}
      <button
        type="button"
        className="underline font-semibold text-purple-300 drop-shadow-[0_0_6px_rgba(167,139,250,0.85)] hover:text-purple-200 focus:outline-none pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          handleJumpToExchangePreview();
        }}
      >
        Exchange
      </button>{' '}
      preview, {measuredBtdReference.toLocaleString()} measured $BTD maps to ≈$
      {exchangeEquivalentUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })} BTC-fee reference
      {referenceDeltaUsd > 0
        ? `, ≈$${referenceDeltaUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })} below this planning reference`
        : ''}
      . V27 opens the minimal Exchange acquisition path; deeper market depth is later-version work.
    </>
  ) : undefined;

  const leftOrderClass = centerFirst ? 'order-2' : 'order-1';
  const flankWidthClass = centerFirst ? 'laptop:flex-1' : 'laptop:w-40';
  const centerOrderClass = centerFirst ? 'order-1' : 'order-2';
  const rightOrderClass = 'order-3';

  return (
    <div className="w-full flex flex-col laptop:flex-row flex-wrap items-stretch gap-6">
      {/* Left contextual stacked cards */}
      <div
        className={`sidecards-left grid grid-cols-2 gap-4 ${centerFirst ? '' : 'laptop:flex laptop:flex-col'} w-full ${flankWidthClass} laptop:gap-4 ${centerFirst ? '' : 'desktop:w-40'} desktop:gap-6 desktop:shrink-0 ${leftOrderClass} ${centerFirst ? '' : 'desktop:order-1'}`}
      >
        <SideInfoCard title="BTC Fee Basis" accent="text-emerald-400" icon={ScaleIcon} />

        <SideInfoCard title="Non-Fungible Shares" accent="text-amber-300" icon={SparklesIcon} />
      </div>

      {/* Central acquisition card */}
      <div className={`pricing-core ${centerFirst ? 'laptop:basis-full desktop:basis-full' : 'laptop:basis-1/2 desktop:basis-1/2'} flex-grow ${centerOrderClass} ${centerFirst ? '' : 'desktop:order-2'}`}>
        <div
          className={`pricing-glow-card min-w-0 h-full flex flex-col justify-between mx-auto border ring-[3px] ${accent === 'purple'
            ? 'border-purple-400  ring-purple-400/70 shadow-[0_0_60px_rgba(167,139,250,0.55)]'
            : 'border-emerald-400 ring-emerald-400/70 shadow-[0_0_60px_rgba(52,211,153,0.55)]'
            }${isSignedIn ? ' cursor-pointer' : ''}`}
          style={{ maxWidth: '100%' }}
          aria-disabled={!isSignedIn}
          onClick={
            isSignedIn
              ? () => {
                onSelectPlan(planId);
                onAcquireBtd(planId, measuredBtdReference, btcFeeReferenceUsd);
              }
              : undefined
          }
        >
          {/* Title + tier pill inline */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="flex items-center gap-3">
              <h3
                className={`text-5xl laptop:text-6xl font-extrabold tracking-tight whitespace-nowrap ${accent === 'purple' ? 'super-shiny-text-purple' : 'super-shiny-text'}`} 
                style={centerFirst ? { transform: 'none', animation: 'none' } : undefined}
              >
                {planLabel}
              </h3>
              <span
                className={`text-[10px] laptop:text-[11px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md border ${accent === 'purple'
                  ? 'bg-purple-500/30 text-purple-200 border-purple-400/50'
                  : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50'
                  }`}
              >
                V27
              </span>
            </div>
            <div className="plan-segment text-center text-2xl laptop:text-3xl font-medium max-w-lg mx-auto leading-snug mb-1">
              {segmentText}
            </div>
          </div>

          {/* Forms & details */}
          <FlexibleBtdSelector
            min={sliderMinUSD}
            max={sliderMaxUSD}
            value={btcFeeReferenceUsd}
            onChange={onChangeReferenceUsdAmount}
            referenceUsdPerBtd={referenceUsdPerBtd}
            accent={accentColor}
            inputDisabled={false}
            valueIsUsdReference
            isExchangePreview={isExchangePreview}
            exchangeReferenceBtd={EXCHANGE_REFERENCE_BTD}
            advisoryContent={advisoryContent}
            showAdvisory={showAdvisory}
          />

          {selectedPlan === planId && <div className="selected-indicator">✓</div>}
        </div>
      </div>

      {/* Right contextual stacked cards */}
      <div
        className={`sidecards-right grid grid-cols-2 gap-4 ${centerFirst ? '' : 'laptop:flex laptop:flex-col'} w-full ${flankWidthClass} laptop:gap-4 ${centerFirst ? '' : 'desktop:w-40'} desktop:gap-6 desktop:shrink-0 ${rightOrderClass}`}
      >
        <SideInfoCard title="Terminal Mint Path" accent="text-sky-300" icon={ChatBubbleLeftEllipsisIcon} />

        <SideInfoCard title="Exchange Buy Path" accent="text-indigo-300" icon={ArrowPathIcon} />
      </div>
    </div>
  );
};

export default BTDPrices;
