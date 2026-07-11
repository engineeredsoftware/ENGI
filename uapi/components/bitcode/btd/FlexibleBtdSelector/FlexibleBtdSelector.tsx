"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';

export interface FlexibleBtdSelectorProps {
  /** Current numeric BTC-fee reference value */
  value: number;
  /** Callback when value changes (after clamp) */
  onChange: (newValue: number) => void;
  /** Slider minimum reference amount */
  min: number;
  /** Slider maximum reference amount */
  max: number;
  /** USD reference per measured BTD amount. BTC remains the fee asset. */
  referenceUsdPerBtd: number;
  /** Factor for approximating AssetPack count */
  assetPacksFactor?: number;
  /** Disable typing into inputs */
  inputDisabled?: boolean;
  /** accent color 'emerald' or 'purple' */
  accent?: 'emerald' | 'purple';
  /** Treat the slider value as USD reference instead of BTD */
  valueIsUsdReference?: boolean;
  /** When valueIsUsdReference and Exchange preview selected */
  isExchangePreview?: boolean;
  /** Measured BTD reference when Exchange preview is selected */
  exchangeReferenceBtd?: number;
  /** Advisory content displayed just above the slider track */
  advisoryContent?: React.ReactNode;
  /** Controls visibility & animation of the advisory */
  showAdvisory?: boolean;
}

export const FlexibleBtdSelector: React.FC<FlexibleBtdSelectorProps> = ({
  value,
  onChange,
  min,
  max,
  referenceUsdPerBtd,
  assetPacksFactor = 100,
  accent = 'emerald',
  inputDisabled = false,
  valueIsUsdReference = false,
  isExchangePreview = false,
  exchangeReferenceBtd,
  advisoryContent,
  showAdvisory = false,
}) => {
  // Format helpers
  const formatBtd = (val: number) => val?.toLocaleString() ?? '0';
  const formatPrice = (val: number) => {
    if (val == null || isNaN(val)) return '0';
    // Show no decimals when value represents whole dollars
    const withDecimals = val % 1 !== 0 ? val.toFixed(2) : val.toFixed(0);
    return withDecimals.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Derive measured BTD and BTC-fee reference based on interpretation of `value`.
  const derivedBtd = valueIsUsdReference
    ? isExchangePreview
      ? exchangeReferenceBtd || 0
      : Math.round(value / referenceUsdPerBtd)
    : value;
  const derivedReferenceUsd = valueIsUsdReference ? value : value * referenceUsdPerBtd;
  const clamp = (val: number) => Math.max(min, Math.min(max, val));

  // Local input states for freeform typing
  const [btdInput, setBtdInput] = useState<string>(() => formatBtd(derivedBtd));
  const [referenceUsdInput, setReferenceUsdInput] = useState<string>(() => formatPrice(derivedReferenceUsd));
  // Track whether user entered an invalid (out-of-range / NaN) amount
  const [isInvalidInput, setIsInvalidInput] = useState<boolean>(false);
  // Flags for whether the user is actively editing each input
  const [isEditingBtd, setIsEditingBtd] = useState<boolean>(false);
  const [isEditingReferenceUsd, setIsEditingReferenceUsd] = useState<boolean>(false);

  // Sync inputs when external value changes, but avoid overwriting during user edit
  useEffect(() => {
    if (!isEditingBtd) {
      setBtdInput(formatBtd(derivedBtd));
    }
    if (!isEditingReferenceUsd) {
      setReferenceUsdInput(formatPrice(derivedReferenceUsd));
    }
  }, [derivedBtd, derivedReferenceUsd, isEditingBtd, isEditingReferenceUsd]);

  // Handle slider moves
  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    const clamped = clamp(parsed);
    onChange(clamped);
    // Update display values
    if (valueIsUsdReference) {
      if (isExchangePreview) {
        setBtdInput(formatBtd(exchangeReferenceBtd || 0));
      } else {
        setBtdInput(formatBtd(Math.round(clamped / referenceUsdPerBtd)));
      }
      setReferenceUsdInput(formatPrice(clamped));
      setIsInvalidInput(false);
      // stop any input editing state when slider moves
      setIsEditingBtd(false);
      setIsEditingReferenceUsd(false);
    } else {
      setBtdInput(formatBtd(clamped));
      setReferenceUsdInput(formatPrice(clamped * referenceUsdPerBtd));
    }
  };

  // Freeform measured-BTD input when slider represents USD reference.
  const handleBtdInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isExchangePreview) return;
    const txt = e.target.value;
    setBtdInput(txt);
    const parsed = parseInt(txt.replace(/,/g, ''), 10);
    if (!isNaN(parsed)) {
      const usd = Math.round(parsed * referenceUsdPerBtd);
      if (usd >= min && usd <= max) {
        onChange(usd);
        setReferenceUsdInput(formatPrice(usd));
        setIsInvalidInput(false);
      } else {
        setIsInvalidInput(true);
      }
    } else {
      setIsInvalidInput(true);
    }
  };

  const handleBtdInputBlur = () => {
    if (isExchangePreview) return;
    const parsed = parseInt(btdInput.replace(/,/g, ''), 10);
    if (isNaN(parsed)) {
      setBtdInput(formatBtd(derivedBtd));
      setIsInvalidInput(false);
    } else {
      const usd = Math.round(parsed * referenceUsdPerBtd);
      const clamped = clamp(usd);
      onChange(clamped);
      setBtdInput(formatBtd(Math.round(clamped / referenceUsdPerBtd)));
      setReferenceUsdInput(formatPrice(clamped));
      setIsInvalidInput(false);
    }
  };

  // Freeform BTC-fee reference input typing.
  const handleReferenceUsdInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isExchangePreview) return;
    const txt = e.target.value;
    setReferenceUsdInput(txt);
    const parsed = parseFloat(txt.replace(/,/g, ''));
    if (!isNaN(parsed)) {
      const usd = Math.round(parsed);
      if (usd >= min && usd <= max) {
        onChange(usd);
        setBtdInput(formatBtd(Math.round(usd / referenceUsdPerBtd)));
        setIsInvalidInput(false);
      } else {
        setIsInvalidInput(true);
      }
    } else {
      setIsInvalidInput(true);
    }
  };

  const handleReferenceUsdInputBlur = () => {
    if (isExchangePreview) return;
    const parsed = parseFloat(referenceUsdInput.replace(/,/g, ''));
    if (isNaN(parsed)) {
      setReferenceUsdInput(formatPrice(value));
      setIsInvalidInput(false);
    } else {
      const usd = Math.round(parsed);
      const clamped = clamp(usd);
      onChange(clamped);
      setBtdInput(formatBtd(Math.round(clamped / referenceUsdPerBtd)));
      setReferenceUsdInput(formatPrice(clamped));
    }
  };

  return (
    <>
      {/* Slider + optional advisory wrapper */}
      <div className="relative w-full min-h-[40px] laptop:min-h-0">
        {/* Advisory */}
        {advisoryContent && (
          <div
            className={`laptop:absolute laptop:left-1/2 laptop:-translate-x-1/2 laptop:-translate-y-2 flex items-center gap-1 text-amber-200 text-[12px] laptop:text-sm whitespace-normal laptop:whitespace-nowrap break-words text-center px-1 drop-shadow-[0_0_6px_rgba(251,191,36,0.45)] pointer-events-none transition-all duration-300 ${showAdvisory ? 'opacity-100' : 'opacity-0 laptop:translate-y-1'
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 flex-shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M11.25 2.25c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm-.75 4.875a.75.75 0 011.5 0v.75a.75.75 0 01-1.5 0v-.75zm.75 3a.75.75 0 00-.75.75v5.25a.75.75 0 001.5 0v-5.25a.75.75 0 00-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
            {advisoryContent}
          </div>
        )}

        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={handleSliderChange}
          className={`custom-slider ${isInvalidInput ? 'slider-grey' : accent === 'emerald' ? 'slider-emerald' : 'slider-purple'}`}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      {/* Wrapper for forms + info so card has 3 flex children */}
      <div className="flex flex-col items-center gap-4">
        {/* First row: $BTD | BTC-fee reference with vertical bar */}
        <div className="flex flex-col laptop:flex-row items-baseline justify-center w-full px-4 laptop:px-6">
          {/* BTC-fee reference FIRST */}
          <div className="flex items-baseline justify-center font-extrabold gap-x-2">
            <span
              className={`text-xl laptop:text-2xl font-medium leading-tight whitespace-nowrap ${accent === 'purple' ? 'text-purple-300' : 'text-emerald-300'
                }`}
            >
              BTC fee ref $
            </span>
            <input
              type="text"
              value={referenceUsdInput}
              onFocus={() => setIsEditingReferenceUsd(true)}
              onChange={!isExchangePreview ? handleReferenceUsdInputChange : undefined}
              onBlur={e => {
                if (!isExchangePreview) {
                  handleReferenceUsdInputBlur();
                  setIsEditingReferenceUsd(false);
                }
              }}
              className="bg-transparent focus:outline-none text-left text-white underline decoration-gray-400 w-[5.1ch] pl-0 leading-tight text-5xl laptop:text-6xl"
              readOnly={isExchangePreview}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Flexible spacer + vertical separator */}
          <div className="flex-1 hidden laptop:flex justify-center">
            <div
              className={
                `w-px laptop:h-8 rounded-full ` +
                (accent === 'purple'
                  ? 'bg-purple-300 shadow-[0_0_8px_rgba(167,139,250,0.8)]'
                  : 'bg-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]')
              }
            />
          </div>

          {/* BTD SECOND */}
          <div className="flex items-baseline justify-center font-extrabold gap-x-2">
            <span
              className={`text-xl laptop:text-2xl font-medium drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] ${accent === 'purple' ? 'text-purple-300' : 'text-emerald-300'
                }`}
            >
              $BTD
            </span>
            <input
              type="text"
              value={btdInput}
              onFocus={() => setIsEditingBtd(true)}
              onChange={!isExchangePreview ? handleBtdInputChange : undefined}
              onBlur={e => {
                if (!isExchangePreview) {
                  handleBtdInputBlur();
                  setIsEditingBtd(false);
                }
              }}
              className="bg-transparent focus:outline-none text-left text-white underline decoration-gray-400 w-[5.3ch] leading-tight text-4xl laptop:text-5xl"
              readOnly={isExchangePreview}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Second row: BTC-fee reference plus AssetPack estimate */}
        <div className="flex flex-col laptop:flex-row items-center justify-center gap-6 laptop:items-center">
          <div
            className="plan-value text-lg laptop:text-xl font-medium leading-tight flex items-center"
            style={{ marginBottom: 0 }}
          >
            BTC fee reference: ${referenceUsdPerBtd.toFixed(2)} / measured $BTD
          </div>
          <div
            className={`plan-asset-packs inline-flex items-center w-fit px-3 py-1 rounded-md gap-1 text-lg laptop:text-xl ${accent === 'purple'
              ? 'bg-purple-500/10 text-purple-300'
              : 'bg-emerald-500/10 text-emerald-300'
              }`}
          >
            <span>≈ {Math.round(derivedBtd / assetPacksFactor).toLocaleString()} AssetPacks</span>
            <div className="tooltip-icon text-white/70" title="100 measured $BTD per AssetPack planning baseline">ⓘ</div>
          </div>
        </div> {/* end info row */}
      </div> {/* end wrapper */}
    </>
  );
};
// Default export for convenience
export default FlexibleBtdSelector;
