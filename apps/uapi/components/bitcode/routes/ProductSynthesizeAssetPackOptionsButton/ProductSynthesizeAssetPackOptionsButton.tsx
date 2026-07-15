/**
 * ProductSynthesizeAssetPackOptionsButton — primary “Synthesize AssetPack Options”
 * CTA for Deposit and Read compose panels.
 *
 * Highest-attention product chrome: Bitcode quantum field (same language as
 * Connect Wallet / BTD tracker). Shared so both synthesize paths feel like the
 * same exciting action, not a flat secondary control.
 */

'use client';

import React from 'react';

import BitcodeQuantumChromeButton from '@/components/bitcode/layout/BitcodeQuantumChromeButton/BitcodeQuantumChromeButton';

export const SYNTHESIZE_ASSET_PACK_OPTIONS_LABEL = 'Synthesize AssetPack Options';
export const SYNTHESIZING_ASSET_PACK_OPTIONS_LABEL =
  'Synthesizing with AssetPacksSynthesis…';

export type ProductSynthesizeAssetPackOptionsButtonProps = {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  /** True while the synthesize pipeline is running (or config is locked mid-run). */
  running?: boolean;
  /** Optional test id (reads: reads-synthesize-options; deposit uses role name). */
  'data-testid'?: string;
  className?: string;
};

export function ProductSynthesizeAssetPackOptionsButton({
  onClick,
  disabled = false,
  running = false,
  'data-testid': dataTestId,
  className = '',
}: ProductSynthesizeAssetPackOptionsButtonProps) {
  const isDisabled = disabled || running;
  const label = running
    ? SYNTHESIZING_ASSET_PACK_OPTIONS_LABEL
    : SYNTHESIZE_ASSET_PACK_OPTIONS_LABEL;

  return (
    <BitcodeQuantumChromeButton
      type="button"
      disabled={isDisabled}
      aria-label={label}
      aria-busy={running || undefined}
      data-testid={dataTestId}
      onClick={() => {
        if (isDisabled) return;
        void onClick();
      }}
      className={[
        // Full-width product primary — larger than nav Connect Wallet chip.
        'mt-4 w-full min-h-[3rem] px-5 py-3.5 text-[0.78rem] font-semibold tracking-[0.16em]',
        'shadow-[0_0_20px_rgba(103,254,183,0.22)]',
        'hover:shadow-[0_0_32px_rgba(103,254,183,0.42)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </BitcodeQuantumChromeButton>
  );
}

export default ProductSynthesizeAssetPackOptionsButton;
