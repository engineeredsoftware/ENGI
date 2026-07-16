'use client';

/**
 * Opens Auxillaries panes (Wallet, Externals, Profile, …) from product surfaces.
 * Relocated from productOpenAuxillariesButton.
 * @see BITCODE_SPEC_V48.md § Frontend component and naming architecture
 */

import React from 'react';
import { openAuxillaries } from '@/components/auxillaries/AuxillariesProvider/AuxillariesProvider';
import {
  getAuxillaryOpenActionLabel,
  type ConcreteAuxillaryPane,
} from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';
import { FEATURE_FLAGS } from '@/config/features';
import { DisabledTooltipWrapper } from '@/components/bitcode/overlays/DisabledTooltipWrapper/DisabledTooltipWrapper';

export interface AuxillariesOpenButtonProps {
  className?: string;
  label?: string;
  step?: ConcreteAuxillaryPane;
}

export default function AuxillariesOpenButton({
  className = 'rounded-none border border-white/12 bg-white/5 px-4 py-3 text-left text-sm font-medium text-neutral-100 transition hover:border-white/20 hover:bg-white/10',
  label,
  step,
}: AuxillariesOpenButtonProps) {
  const resolvedLabel = label || getAuxillaryOpenActionLabel(step);
  const disabledClassName =
    `${className} cursor-not-allowed border-white/10 bg-white/[0.025] text-neutral-400 opacity-65 grayscale hover:border-white/10 hover:bg-white/[0.025] hover:text-neutral-400`;

  if (FEATURE_FLAGS.DISABLE_AUXILLARIES) {
    return (
      <DisabledTooltipWrapper
        tooltip="Disabled for launch mode. When enabled, Auxillaries opens Wallet, Externals, Profile, and interface defaults."
        className="block"
      >
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={disabledClassName}
        >
          {resolvedLabel}
        </button>
      </DisabledTooltipWrapper>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openAuxillaries('connect', step ?? 'externals')}
      className={className}
    >
      {resolvedLabel}
    </button>
  );
}

