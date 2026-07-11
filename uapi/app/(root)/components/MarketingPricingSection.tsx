"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@bitcode/supabase/ssr/client';
import MarketingSectionWrapper from './MarketingSectionWrapper';
// Bundle presets are intentionally absent: V47 routes acquisition through Read
// and Packs paths, not fungible checkout bundles.
import { ProcessingIndicator } from '@/components/bitcode/indicators/ProcessingIndicator';
import BTDPrices from '@/components/bitcode/btd/BTDPrices';

const MarketingPricingSection: React.FC = () => {
  // Supabase client for auth check
  const supabase = useMemo(() => createClient(), []);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  /*
   * -------------------------------------------------------------------------
   * Dynamic slider limits for BTD acquisition planning
   * -------------------------------------------------------------------------
   * The public surface cannot treat $BTD as a fungible checkout token. BTC pays
   * fees; $BTD records knowledge scalar-volume and settled rights. This widget keeps
   * a USD-denominated BTC-fee reference only so it can route the operator to
   * Read or Packs acquisition paths.
   */
  // Reference values only. Read acquisition and Packs acquisition are V47;
  // broader market depth remains later-version work.
  /* ------------------------------------------------------------------
   * Dynamic acquisition reference
   * ------------------------------------------------------------------
   * Read reference: a future Fit can mint new $BTD.
   * Packs reference: existing non-fungible $BTD range rights can transfer.
   */

  const TERMINAL_READ_REFERENCE_USD_PER_BTD = 0.25;
  const EXCHANGE_REFERENCE_USD_PER_BTD = 0.22;

  /* ------------------------------------------------------------------
   * Pricing / slider math helpers
   * ------------------------------------------------------------------ */
  const MAX_TOTAL_USD = 10_000;
  const [btcFeeReferenceUsd, setBtcFeeReferenceUsd] = useState<number>(5_000);

  const isExchangePreview = btcFeeReferenceUsd === MAX_TOTAL_USD;

  const referenceUsdPerBtd = isExchangePreview
    ? EXCHANGE_REFERENCE_USD_PER_BTD
    : TERMINAL_READ_REFERENCE_USD_PER_BTD;
  // Acquisition flow state
  const [activatingPlan, setActivatingPlan] = useState<string | null>(null);
  const [acquisitionError, setAcquisitionError] = useState<string | null>(null);
  // Track authentication state
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);


  // Sync authentication state on mount and on changes
  useEffect(() => {
    // get initial user state
    supabase.auth.getUser()
      .then(({ data: { user } }: { data: { user: User | null } }) => setIsSignedIn(!!user))
      .catch((err: unknown) => console.error('Failed to get auth user:', err));
    // listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setIsSignedIn(!!session?.user);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleAcquireBtd = async (intentId: string, measuredBtdTarget: number, usdReferenceAmount: number) => {
    // Initialize acquisition, clear errors, set loading
    setAcquisitionError(null);
    setActivatingPlan(intentId);
    // Check if user is authenticated; if not, trigger onboarding/login
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setActivatingPlan(null);
        // start onboarding or login flow
        window.dispatchEvent(new Event('start-onboarding'));
        return;
      }
    } catch (authErr) {
      console.error('Auth check failed:', authErr);
      setActivatingPlan(null);
      window.dispatchEvent(new Event('start-onboarding'));
      return;
    }
    setSelectedPlan(intentId);
    try {
      window.sessionStorage.setItem(
        'bitcode:btd-acquisition-intent',
        JSON.stringify({
          source: 'marketing-btd-acquisition-reference',
          intentId,
          measuredBtdTarget,
          btcFeeReferenceUsd: usdReferenceAmount,
          feeAsset: 'BTC',
          shareAsset: 'BTD',
          btdSemantics: 'non-fungible asset-pack scalar-volume and settled-rights carrier',
          paths: [
            { mode: 'read-assetpack', target: '/reads?intent=submit-read-for-btd', gate: 'V47' },
            { mode: 'packs-existing-btd', target: '/packs?intent=buy-existing-btd', gate: 'V47' },
          ],
          createdAt: new Date().toISOString(),
        })
      );
      window.location.assign('/reads?intent=acquire-btd');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error opening BTD acquisition intent';
      setAcquisitionError(msg);
      setActivatingPlan(null);
      console.error('Error opening BTD acquisition intent:', err);
    }
  };


  // File-local class constants (SRP/DRY; no visual changes)
  const sectionPad = 'pt-2 tablet:pt-4 laptop:pt-6 desktop:pt-6 pb-16 tablet:pb-20 laptop:pb-24 desktop:pb-28';
  const titleClass = 'text-4xl laptop:text-7xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-lime-300 via-emerald-400 to-green-500 bg-clip-text text-transparent drop-shadow-[0_3px_15px_rgba(0,0,0,0.25)] pb-2 laptop:pb-3';
  const subtitleClass = 'text-base laptop:text-lg text-gray-300 max-w-3xl mx-auto mb-8';
  const overlayClass = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30';

  return (
    <MarketingSectionWrapper id="pricing" className={sectionPad}>
      {/* Display acquisition errors */}
      {acquisitionError && (
        <div className="text-red-500 text-center mb-4">{acquisitionError}</div>
      )}
      {/* Loading overlay while entering the canonical BTD acquisition intent */}
      {activatingPlan && (
        <div className={overlayClass}>
          <ProcessingIndicator label="Opening BTD acquisition" />
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={titleClass}>
            <span className="block">Make Evolution Your</span>
            <span className="block">Edge</span>
          </h2>
          <p className={subtitleClass}>
            BTC pays fees. $BTD records non-fungible AssetPack scalar volume, settled rights, and measured Bitcode content amount as Read and Packs surfaces mature.
          </p>
          {/* Pricing card */}
          <div className="mb-12">
            <BTDPrices
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              referenceUsdAmount={btcFeeReferenceUsd}
              onChangeReferenceUsdAmount={setBtcFeeReferenceUsd}
              onAcquireBtd={handleAcquireBtd}
              referenceUsdPerBtd={referenceUsdPerBtd}
              isSignedIn={isSignedIn}
            />
          </div>

        </div>
      </div>
    </MarketingSectionWrapper>
  );
};

export default MarketingPricingSection;
