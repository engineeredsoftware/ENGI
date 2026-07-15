"use client";

import React, { useMemo } from 'react';

export interface AuxillariesUseButtonProps {
  isDisabled?: boolean;
  onHoverPrefetch?: () => void;
  onClick?: () => void;
  auxillaries?: React.ReactNode;
  particles?: React.ReactNode;
}

export function AuxillariesUseButton({
  isDisabled,
  onHoverPrefetch,
  onClick,
  auxillaries,
  particles,
}: AuxillariesUseButtonProps) {
  const disabledClasses = useMemo(
    () => (isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none filter grayscale' : ''),
    [isDisabled],
  );

  return isDisabled ? (
    <div className={`neo-signin-btn relative ${disabledClasses}`}>
      <div className="neo-signin-core">
        <span className="neo-signin-text">use</span>
      </div>
    </div>
  ) : (
    <button
      data-auxillaries-testid="auxillaries-open-button"
      className="neo-signin-btn relative group"
      onMouseEnter={onHoverPrefetch}
      onClick={onClick}
    >
      <div className="neo-signin-orbitals">{auxillaries}</div>
      <div className="neo-signin-core">
        <span className="neo-signin-text">use</span>
        <div className="neo-signin-particles">{particles}</div>
      </div>
    </button>
  );
}
