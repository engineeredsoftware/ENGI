"use client";
import React, { useState, useEffect, useId, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@bitcode/styling';
import LogoIcon from '@/components/bitcode/icons/LogoIcon';

export interface IterationSliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  onEducationHover?: (type: 'iterations' | 'minimize' | 'maximize' | null) => void;
}

// Enhanced toggle button component with full animation states
const MiniToggle: React.FC<{
  enabled: boolean;
  onToggle: () => void;
  type: 'minimize' | 'maximize';
  disabled?: boolean;
  onHover?: (hovering: boolean) => void;
}> = ({ enabled, onToggle, type, disabled = false, onHover }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMinimize = type === 'minimize';

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
  };

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-label={`Auto-${type}`}
      title={`Auto-${type}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative group
        w-8 h-8
        flex items-center justify-center
        transition-all duration-500 ease-out
        disabled:opacity-30 disabled:cursor-not-allowed
      `}
    >
      {/* Activation splash effect */}
      <div className={`
        absolute inset-0 rounded-full
        ${enabled ? 'animate-ping opacity-30' : 'opacity-0'}
        ${isMinimize ? 'bg-blue-400' : 'bg-purple-400'}
        pointer-events-none
      `} />

      {/* Orbital ring - single ring for cleaner look */}
      {
        <div
          className={`
            absolute rounded-full
            border transition-all duration-700 ease-out
            ${enabled
              ? isMinimize
                ? 'border-blue-400/40 animate-spin-slow'
                : 'border-purple-400/40 animate-spin-slow-reverse'
              : isHovered
                ? isMinimize
                  ? 'border-blue-400/20 scale-110'
                  : 'border-purple-400/20 scale-110'
                : 'border-emerald-500/10'
            }
          `}
          style={{
            width: '100%',
            height: '100%',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      }

      {/* Background glow */}
      <div className={`
        absolute inset-0 rounded-full blur-md
        transition-all duration-500
        ${enabled
          ? isMinimize
            ? 'bg-blue-500/30 opacity-100 scale-120'
            : 'bg-purple-500/30 opacity-100 scale-120'
          : isHovered
            ? isMinimize
              ? 'bg-blue-500/10 opacity-70'
              : 'bg-purple-500/10 opacity-70'
            : 'bg-emerald-500/5 opacity-0'
        }
      `} />

      {/* Removed inner circle - no dot needed */}

      {/* Icon */}
      <svg
        className={`relative w-4 h-4 transition-all duration-300 ${enabled
            ? isMinimize
              ? 'text-blue-300 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]'
              : 'text-purple-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]'
            : isHovered
              ? isMinimize
                ? 'text-blue-400/70'
                : 'text-purple-400/70'
              : 'text-gray-500'
          }`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={enabled ? 2 : 1.5}
      >
        {isMinimize ? (
          <>
            {/* Minimize icon: single inward arrow for efficiency */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
              className={enabled ? 'animate-pulse' : ''}
            />
          </>
        ) : (
          <>
            {/* Maximize icon: multiple stacked layers for comprehensiveness */}
            <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="7" y="7" width="10" height="10" rx="1" strokeLinecap="round" strokeLinejoin="round" opacity={enabled ? 1 : 0.6} />
            <rect x="10" y="10" width="4" height="4" rx="0.5" strokeLinecap="round" strokeLinejoin="round" opacity={enabled ? 1 : 0.4} />
          </>
        )}
      </svg>

      {/* Label to the side */}
      <div className={`
        absolute top-1/2 -translate-y-1/2
        ${isMinimize ? '-left-8' : '-right-8'}
        text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap
        transition-all duration-300
        ${enabled
          ? isMinimize
            ? 'text-blue-300 drop-shadow-[0_0_4px_rgba(96,165,250,0.6)]'
            : 'text-purple-300 drop-shadow-[0_0_4px_rgba(167,139,250,0.6)]'
          : isHovered
            ? isMinimize
              ? 'text-blue-400/60'
              : 'text-purple-400/60'
            : 'text-gray-600'
        }
      `}>
        {type === 'minimize' ? 'MIN' : 'MAX'}
      </div>

      {/* Energy wave effect when activated */}
      {enabled && (
        <div className={`
          absolute inset-0 rounded-full
          ${isMinimize ? 'bg-blue-400' : 'bg-purple-400'}
          opacity-0 animate-ping-slow
          pointer-events-none
        `} />
      )}
    </button>
  );
};

/**
 * IterationSlider: Industrial elegance meets engineering precision.
 * Controls pipeline iteration cycles with automatic optimization modes.
 */
export const IterationSlider: React.FC<IterationSliderProps> = ({
  value,
  onChange,
  min = 3,
  max = 100,
  disabled = false,
  onEducationHover,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [autoMinimize, setAutoMinimize] = useState(false);
  const [autoMaximize, setAutoMaximize] = useState(false);
  const sliderId = useId();
  // Disable hover effects when auto modes are active, but do NOT apply disabled aesthetics
  // to the entire component in auto modes. Only the slider thumb should be disabled.
  const disableHover = autoMinimize || autoMaximize;

  // Calculate percentage for gradient fill
  const percent = Math.round(((value - min) / (max - min)) * 100);

  // Handle education hover for main slider
  useEffect(() => {
    if (onEducationHover && isHovered && !autoMinimize && !autoMaximize) {
      onEducationHover('iterations');
    } else if (onEducationHover && !isHovered && !autoMinimize && !autoMaximize) {
      onEducationHover(null);
    }
  }, [isHovered, autoMinimize, autoMaximize, onEducationHover]);

  // Throttled change handler for smooth performance
  const latestVal = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    latestVal.current = value;
  }, [value]);

  const throttledOnChange = useCallback(
    (val: number) => {
      latestVal.current = val;
      // Cancel auto modes when manually changing
      setAutoMinimize(false);
      setAutoMaximize(false);

      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(() => {
          onChange(latestVal.current);
          rafRef.current = null;
        });
      }
    },
    [onChange],
  );

  const handleMinimizeToggle = () => {
    const newState = !autoMinimize;
    setAutoMinimize(newState);
    if (newState) {
      setAutoMaximize(false);
      // Don't change the value, just show it's in auto mode
    }
  };

  const handleMaximizeToggle = () => {
    const newState = !autoMaximize;
    setAutoMaximize(newState);
    if (newState) {
      setAutoMinimize(false);
      // Don't change the value, just show it's in auto mode
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Left Toggle - Auto-Minimize (with MIN label to its left) */}
      <div className="relative mr-6 w-8 h-8 flex items-center justify-center">
        <MiniToggle
          enabled={autoMinimize}
          onToggle={handleMinimizeToggle}
          type="minimize"
          disabled={disabled}
          onHover={(hovering) => {
            if (onEducationHover) {
              onEducationHover(hovering ? 'minimize' : null);
            }
          }}
        />
      </div>

      {/* Main Slider Container */}
      <div
        className={cn(
          "relative flex items-center gap-2.5 px-3 py-2 rounded-lg backdrop-blur-sm border transition-all duration-500",
          disabled
            ? "bg-brand-cosmic/10 border-gray-700/40 opacity-50"
            : disableHover
              ? "bg-brand-cosmic/25 border-brand-emerald-glow-subtle/15"
              : "bg-brand-cosmic/25 border-brand-emerald-glow-subtle/15 hover:border-brand-emerald-glow-subtle/25"
        )}
        onMouseEnter={() => { if (!disableHover && !disabled) setIsHovered(true); }}
        onMouseLeave={() => { if (!disableHover && !disabled) setIsHovered(false); }}
        style={{
          boxShadow: isHovered && !disableHover
            ? '0 0 20px rgba(103, 254, 183, 0.08), inset 0 1px 0 rgba(103, 254, 183, 0.06)'
            : 'inset 0 1px 0 rgba(103, 254, 183, 0.02)',
        }}
      >
        {/* Subtle background glow */}
        <div
          className={cn(
            "absolute inset-0 rounded-md opacity-0 transition-opacity duration-700",
            isHovered && !disableHover && !disabled && "opacity-100"
          )}
          style={{
            background: `radial-gradient(ellipse at center, rgba(103, 254, 183, 0.02) 0%, transparent 70%)`,
          }}
        />

        {/* Logo */}
        <div className="relative">
          <LogoIcon
            fill="#65FEB7"
            width={14}
            height={14}
            className={cn(
              'transition-all duration-700',
              isHovered && !disableHover && !disabled && 'brightness-110',
              disabled && 'opacity-30'
            )}
            style={{
              filter: disabled ? 'grayscale(1)' : 'drop-shadow(0 0 4px rgba(103, 254, 183, 0.3))'
            }}
            aria-hidden="true"
          />
        </div>

        {/* Label */}
        <span className={cn(
          "text-xs font-medium tracking-wider transition-colors duration-500 uppercase",
          disabled ? "text-gray-600" : "text-gray-500",
          isHovered && !disableHover && !disabled && "text-gray-400"
        )}>
          Iterations
        </span>

        {/* Slider Track & Input */}
        <div className="relative flex-1 mx-2 flex" style={{ minWidth: '120px' }}>
          <input
            id={sliderId}
            type="range"
            min={min}
            max={max}
            value={value}
            disabled={disabled || autoMinimize || autoMaximize}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-label="Pipeline Iterations"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={e => throttledOnChange(Number(e.target.value))}
            className="iteration-slider-input"
            style={{
              background: (disabled || autoMinimize || autoMaximize)
                ? `linear-gradient(90deg, #374151 ${percent}%, #1f2937 ${percent}%)`
                : `linear-gradient(90deg, rgba(103, 254, 183, 0.4) ${percent}%, rgba(103, 254, 183, 0.05) ${percent}%)`,
              '--thumb-glow': (disabled || autoMinimize || autoMaximize) ? 'none' : isFocused
                ? '0 0 12px rgba(103, 254, 183, 0.6), 0 0 20px rgba(103, 254, 183, 0.3)'
                : '0 0 8px rgba(103, 254, 183, 0.4)',
              cursor: (autoMinimize || autoMaximize) ? 'not-allowed' : 'pointer',
              opacity: (autoMinimize || autoMaximize) ? 0.5 : 1,
            } as React.CSSProperties}
          />

          {/* Track shimmer effect - very subtle */}
          {!disableHover && isHovered && (
            <div
              className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden rounded-[1.5px]"
            >
              <div
                className="absolute w-1/4 bg-gradient-to-r from-transparent via-brand-emerald-glow-subtle/10 to-transparent"
                style={{
                  animation: 'shimmer 4s infinite linear',
                  top: '0',
                  height: '3px',
                }}
              />
            </div>
          )}
        </div>

        {/* Value Display */}
        <div className="relative min-w-[45px] h-[36px] flex items-center justify-center text-center">
          {autoMinimize || autoMaximize ? (
            <div className="flex flex-col items-center">
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider",
                autoMinimize ? "text-blue-400" : "text-purple-400"
              )}>
                AUTO
              </span>
              <span className={cn(
                "text-[10px] uppercase tracking-wider",
                autoMinimize ? "text-blue-400/60" : "text-purple-400/60"
              )}>
                {autoMinimize ? 'MIN' : 'MAX'}
              </span>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={value}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                  className="relative"
                >
                  <span className={cn(
                    "text-lg font-mono font-semibold transition-all duration-300",
                    disabled ? "text-gray-600" : "text-gray-300",
                    isHovered && !disabled && "text-white"
                  )}>
                    {value}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Removed MIN label - implicit from value 3 */}
            </>
          )}
        </div>
      </div>

      {/* Right Toggle - Auto-Maximize (with MAX label to its right) */}
      <div className="relative ml-6 w-8 h-8 flex items-center justify-center">
        <MiniToggle
          enabled={autoMaximize}
          onToggle={handleMaximizeToggle}
          type="maximize"
          disabled={disabled}
          onHover={(hovering) => {
            if (onEducationHover) {
              onEducationHover(hovering ? 'maximize' : null);
            }
          }}
        />
      </div>
    </div>
  );
};

// Add the slider styles and animations
const sliderStyles = `
<style>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

@keyframes spin-slow {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes spin-slow-reverse {
  from { transform: translate(-50%, -50%) rotate(360deg); }
  to { transform: translate(-50%, -50%) rotate(0deg); }
}

@keyframes ping-slow {
  0%, 100% { transform: scale(1); opacity: 0; }
  50% { transform: scale(1.5); opacity: 0.3; }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

.animate-spin-slow-reverse {
  animation: spin-slow-reverse 8s linear infinite;
}

.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.iteration-slider-input {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 3px;
  border-radius: 1.5px;
  outline: none;
  transition: all 0.3s ease;
  cursor: pointer;
  margin: 0;
  padding: 0;
}

.iteration-slider-input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Track */
.iteration-slider-input::-webkit-slider-runnable-track {
  height: 3px;
  border-radius: 1.5px;
}

.iteration-slider-input::-moz-range-track {
  height: 3px;
  border-radius: 1.5px;
}

/* Thumb - properly centered */
.iteration-slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #67feb7 0%, #34d399 100%);
  border: 2px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--thumb-glow, 0 0 8px rgba(103, 254, 183, 0.4));
  margin-top: -5.5px; /* Center the thumb on the track */
}

.iteration-slider-input::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #67feb7 0%, #34d399 100%);
  border: 2px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--thumb-glow, 0 0 8px rgba(103, 254, 183, 0.4));
  border: none; /* Firefox fix */
  margin-top: 0; /* Firefox doesn't read adjustment */
}

/* Hover state */
.iteration-slider-input:not(:disabled):hover::-webkit-slider-thumb {
  transform: scale(1.15);
}

.iteration-slider-input:not(:disabled):hover::-moz-range-thumb {
  transform: scale(1.15);
}

/* Active/dragging state */
.iteration-slider-input:not(:disabled):active::-webkit-slider-thumb {
  transform: scale(1.05);
  box-shadow: var(--thumb-glow, 0 0 8px rgba(103, 254, 183, 0.4)), 
              inset 0 0 0 2px rgba(255, 255, 255, 0.15);
}

.iteration-slider-input:not(:disabled):active::-moz-range-thumb {
  transform: scale(1.05);
  box-shadow: var(--thumb-glow, 0 0 8px rgba(103, 254, 183, 0.4)), 
              inset 0 0 0 2px rgba(255, 255, 255, 0.15);
}

/* Disabled state */
.iteration-slider-input:disabled::-webkit-slider-thumb {
  background: #6b7280;
  border-color: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
}

.iteration-slider-input:disabled::-moz-range-thumb {
  background: #6b7280;
  border-color: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
}
</style>
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('iteration-slider-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'iteration-slider-styles';
  styleEl.innerHTML = sliderStyles.replace('<style>', '').replace('</style>', '');
  document.head.appendChild(styleEl);
}
