'use client';

import { useState, useRef, FC } from 'react';
import { cn } from '@bitcode/styling';

interface QuantumButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  disabledTooltip?: string;
  disabledTooltipPlacement?: 'bottom' | 'top';
}
import { DisabledTooltipWrapper } from '@/components/bitcode/overlays/disabled-tooltip-wrapper';

const QuantumButton: FC<QuantumButtonProps> = ({
  children = 'use',
  onClick,
  className,
  disabled = false,
  disabledTooltip,
  disabledTooltipPlacement = 'bottom',
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const coreButton = (
    <button
      ref={buttonRef}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={disabled ? undefined : () => setIsHovering(true)}
      onMouseLeave={disabled ? undefined : () => setIsHovering(false)}
      className={cn(
        'quantum-button relative overflow-visible',
        !disabled && 'group',
        disabled && 'filter grayscale brightness-75 cursor-default pointer-events-none',
        'text-lg tablet:text-xl font-light tracking-wider',
        'py-3 px-8 tablet:py-4 tablet:px-12',
        'transition-all duration-700 ease-out',
        'focus:outline-none focus:ring-0',
        className,
      )}
      style={{ transform: 'translateZ(0)' } as React.CSSProperties}
    >
      {!disabled && <div className="absolute inset-0 quantum-field-bg"></div>}
      {!disabled &&
        [0, 1, 2].map((i) => (
          <div
            key={`ring-${i}`}
            className="absolute rounded-lg orbital-ring-button orbital-ring-active"
            style={{ '--ring-index': i, '--ring-delay': `${i * 0.2}s` } as React.CSSProperties}
          />
        ))}
      {!disabled &&
        [...Array(6)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="quantum-particle-button"
            style={{
              '--float-x': `${(i % 2 === 0 ? -1 : 1) * (3 + i)}px`,
              '--float-y': `${(i % 3 === 0 ? -1 : 1) * (5 + i * 2)}px`,
            } as React.CSSProperties}
          />
        ))}
      {!disabled && (
        <div className={`absolute inset-0 glow-effect ${isHovering ? 'glow-effect-active' : ''}`}></div>
      )}
      <div className="relative z-10 flex items-center justify-center gap-3" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
        <span className="relative flex items-center" style={{ marginTop: '-4px' }}>
          <span className="button-text">{children}</span>
          <span className="button-text-shadow">{children}</span>
        </span>
        <svg
          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-500"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 6L20 12L13 18M4 12H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="arrow-path"
          />
        </svg>
      </div>
      {!disabled && <div className="absolute inset-0 pulse-effect"></div>}
    </button>
  );

  if (disabled && disabledTooltip) {
    return (
      <DisabledTooltipWrapper placement={disabledTooltipPlacement} tooltip={disabledTooltip}>
        {coreButton}
      </DisabledTooltipWrapper>
    );
  }
  return coreButton;
};

export default QuantumButton;
 
