'use client';

import React from 'react';
import { openAuxillaries } from '@/app/auxillaries/components/AuxillariesProvider';
import {
  getAuxillaryOpenActionLabel,
  type ConcreteAuxillaryPane,
} from '@/app/auxillaries/components/auxillary-pane-meta';
import { FEATURE_FLAGS } from '@/config/features';
import { DisabledTooltipWrapper } from '@/components/base/bitcode/overlays/disabled-tooltip-wrapper';

interface TerminalOpenAuxillariesButtonProps {
  className?: string;
  label?: string;
  step?: ConcreteAuxillaryPane;
}

export default function TerminalOpenAuxillariesButton({
  className = 'rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-left text-sm font-medium text-neutral-100 transition hover:border-white/20 hover:bg-white/10',
  label,
  step,
}: TerminalOpenAuxillariesButtonProps) {
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
      onClick={() => openAuxillaries('login', step ?? 'externals')}
      className={className}
    >
      {resolvedLabel}
    </button>
  );
}
