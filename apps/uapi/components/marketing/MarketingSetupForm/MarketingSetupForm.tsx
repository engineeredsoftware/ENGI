import React from 'react';

const MarketingSetupForm = () => {
  return (
    <div className="space-y-4 rounded-2xl border border-emerald-400/20 bg-black/20 p-5">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">
          Treasury Readiness
        </h3>
        <p className="mt-2 text-sm text-slate-200">
          Bitcode acquisition is wallet-native. Connect a wallet, connect GitHub, and finalize access policy in
          auxillaries before you transact.
        </p>
      </div>
      <div className="space-y-2 text-sm text-slate-300">
        <p>1. Connect wallet posture in the Wallet auxillary and keep BTC fee liquidity readable.</p>
        <p>2. Connect GitHub and SSO policy in the Externals auxillary.</p>
        <p>3. Acquire $BTD through Terminal Read minting or Exchange purchase planning.</p>
      </div>
      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/8 px-4 py-3 text-sm text-emerald-100">
        BTC pays fees. $BTD is a non-fungible AssetPack share/read-right, not a checkout spend unit.
      </div>
    </div>
  );
};

export default MarketingSetupForm;
