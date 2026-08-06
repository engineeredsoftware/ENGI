import React from 'react';
import { trackEvent } from '@bitcode/external-telemetry-google';

interface ExecutionOptionToggleProps {
  enabled: boolean;
  onToggle: () => void;
  type: 'computer-use-measurement' | 'fit-review';
  disabled?: boolean;
  /** Additional tracking metadata for analytics */
  trackingMetadata?: Record<string, any>;
}

export const ToggleButton = ({ enabled, onToggle, type, disabled = false, trackingMetadata = {} }: ExecutionOptionToggleProps) => {
  const isComputerUseMeasurement = type === 'computer-use-measurement';

  // Map type to human-readable label (used for accessibility & tooltip)
  const labelMap: Record<ExecutionOptionToggleProps['type'], string> = {
    'computer-use-measurement': 'Computer-use Read measurement',
    'fit-review': 'Fit review',
  };

  return (
    <button
      onClick={() => {
        // Track toggle action
        trackEvent('asset_pack_pipeline_toggle_clicked', {
          event_category: 'asset_pack_pipeline_interaction',
          toggle_type: type,
          toggle_label: labelMap[type],
          previous_state: enabled,
          new_state: !enabled,
          disabled: disabled,
          ...trackingMetadata
        });
        onToggle();
      }}
      disabled={disabled}
      data-enabled={enabled}
      data-disabled={disabled}
      data-ga-event="asset_pack_pipeline_toggle_clicked"
      aria-label={labelMap[type]}
      title={labelMap[type]}
      className={`
        button-container
        relative group/${type}
        w-20 h-20 laptop:w-24 laptop:h-24
        flex items-center justify-center
        transition-all duration-500 ease-out
        ${enabled ? 'scale-105' : ''}
        perspective-1000
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {/* Activation splash effect */}
      <div className={`
        activation-splash
        ${enabled ? 'activation-splash-active' : ''}
      `} />
      {/* Orbital Rings System */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`orbital-ring-${i}`}
          className={`
            orbital-ring absolute
            border border-emerald-500/20
           
            transition-all duration-500 ease-out
            group-hover/${type}:border-emerald-500/30
            ${enabled ? 'orbital-ring-activated' : 'group-hover/${type}:scale-105'}
          `}
          style={{
            width: `${100 + i * 20}%`,
            height: `${100 + i * 20}%`,
            '--ring-delay': `${i * 0.2}s`,
            transform: `rotate3d(${Math.random()}, ${Math.random()}, 1, ${i * 120}deg)`,
            opacity: enabled ? 1 : 0.6,
          } as React.CSSProperties}
        >
          {/* Quantum Points on each ring */}
          {[...Array(4)].map((_, j) => (
            <div
              key={`quantum-point-${i}-${j}`}
              className={`
                quantum-point absolute
                w-1 h-1 laptop:w-1.5 laptop:h-1.5
                bg-emerald-500/40
                ${enabled ? 'quantum-point-activated' : ''}
              `}
              style={{
                '--point-delay': `${i * 0.2 + j * 0.1}s`,
                top: '50%',
                left: '50%',
                transform: `rotate(${j * 90}deg) translateX(${50 + i * 10}%)`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      ))}

      {/* Background glow effect */}
      <div className={`
        absolute inset-0 blur-md
        transition-all duration-500
        bg-emerald-500/5
        group-hover/${type}:bg-emerald-500/10
        ${enabled ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}
      `} />

      {/* Data particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={`${type}-particle-${i}`}
            className="data-particle"
            style={{
              '--radius': '36px',
              '--angle': `${i * 30}deg`,
              left: '50%',
              top: '50%',
              animationDelay: `${i * 0.15}s`
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Icon */}
      <div className={`
        absolute inset-0 
        transition-all duration-500
        flex items-center justify-center
        ${enabled ? 'opacity-100 scale-100' : 'opacity-70 scale-90'}
      `}>
        <svg
          className="w-9 h-9 laptop:w-10 laptop:h-10"
          viewBox="0 0 24 24"
          fill="none"
          stroke={enabled ? '#67feb7' : 'currentColor'}
          strokeWidth={1.5}
        >
        {isComputerUseMeasurement ? (
            <>
              {/* Internal computer-use measurement grid */}
              <rect
                x="5" y="5"
                width="14" height="14"
                rx="2"
                className="transition-all duration-500"
                fill="transparent"
                strokeDasharray={enabled ? "60" : "0"}
                strokeDashoffset={enabled ? "60" : "0"}
                style={{
                  animation: enabled ? "computeDash 1.5s ease-out forwards" : "none"
                }}
              />
              {/* Internal Circuit Lines */}
              <path
                className="transition-all duration-500"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                d="M9 9h6M9 12h6M9 15h6"
                strokeDasharray={enabled ? "30" : "0"}
                strokeDashoffset={enabled ? "30" : "0"}
                style={{
                  animation: enabled ? "computeDash 1.5s ease-out 0.2s forwards" : "none"
                }}
              />
              {/* Corner Connectors */}
              <path
                className="transition-all duration-500"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                d="M3 9h2M3 15h2M19 9h2M19 15h2"
                strokeDasharray={enabled ? "40" : "0"}
                strokeDashoffset={enabled ? "40" : "0"}
                style={{
                  animation: enabled ? "computeDash 1.5s ease-out 0.4s forwards" : "none"
                }}
              />
            </>
          ) : (
            <>
              {/* Central fit-review evidence node */}
              <circle
                cx="12"
                cy="12"
                r="2"
                className="transition-all duration-500"
                fill="transparent"
                strokeDasharray={enabled ? "20" : "0"}
                strokeDashoffset={enabled ? "20" : "0"}
                style={{
                  animation: enabled ? "bitcodeOptionDash 1.5s ease-out forwards" : "none"
                }}
              />
              {/* Evidence nodes */}
              {[
                { cx: 7, cy: 7 },
                { cx: 17, cy: 7 },
                { cx: 17, cy: 17 },
                { cx: 7, cy: 17 }
              ].map((pos, i) => (
                <circle
                  key={i}
                  cx={pos.cx}
                  cy={pos.cy}
                  r="1.5"
                  className="transition-all duration-500"
                  fill="transparent"
                  strokeDasharray={enabled ? "15" : "0"}
                  strokeDashoffset={enabled ? "15" : "0"}
                  style={{
                    animation: enabled ? `bitcodeOptionDash 1.5s ease-out ${0.2 * (i + 1)}s forwards` : "none"
                  }}
                />
              ))}
              {/* Evidence relationship lines */}
              <path
                className="transition-all duration-500"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                d="M8.5 8.5L11 11M15.5 8.5L13 11M15.5 15.5L13 13M8.5 15.5L11 13"
                strokeDasharray={enabled ? "50" : "0"}
                strokeDashoffset={enabled ? "50" : "0"}
                style={{
                  animation: enabled ? "bitcodeOptionDash 1.5s ease-out 1s forwards" : "none"
                }}
              />
            </>
          )}
        </svg>
      </div>

      {/* Glow Effect */}
      <div className={`
        absolute inset-[-50%]
        transition-all duration-500
        bg-emerald-500/20 blur-xl
       
        ${enabled ? 'opacity-70 scale-100' : 'opacity-0 scale-50'}
      `} />
    </button>
  );
};

export const ExecutionOptionToggle = ToggleButton;
export default ToggleButton;
