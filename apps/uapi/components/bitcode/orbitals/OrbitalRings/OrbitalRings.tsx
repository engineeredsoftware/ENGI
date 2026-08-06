import React from 'react';

interface OrbitalRingsProps {
  count?: number;
  baseSize?: number;
  sizeIncrement?: number;
  className?: string;
  /** Highlight a specific ring index as active */
  activeIndex?: number;
}

// Pre-calculate common values outside component to avoid recalculation
const createRingData = (count: number, baseSize: number, sizeIncrement: number) => {
  return Array.from({ length: count }, (_, i) => ({
    key: i,
    index: -i,
    size: `${baseSize + i * sizeIncrement}%`,
    rotation: i % 2 === 0 ? '' : '-',
    delay: `${i * 0.5}s`,
  }));
};

export default function OrbitalRings({
  count = 4,
  baseSize = 30,
  sizeIncrement = 15,
  className = '',
  activeIndex,
}: OrbitalRingsProps) {
  // Memoize ring calculations
  const ringData = React.useMemo(
    () => createRingData(count, baseSize, sizeIncrement),
    [count, baseSize, sizeIncrement]
  );

  // Check if parent has enabled animations
  const animationsEnabled = className.includes('animations-enabled') || 
                           className.includes('account-background-highlight') ||
                           className.includes('login-background-glow');

  return (
    <div className={`orbital-system-background ${className} ${animationsEnabled ? 'animations-enabled' : ''}`}> 
      {ringData.map((ring) => (
        <div
          key={ring.key}
          className={
            `orbital-ring${activeIndex === ring.key ? ' orbital-ring-active' : ''}`
          }
          style={{
            '--index': ring.index,
            '--size': ring.size,
            '--rotation': ring.rotation,
            '--delay': ring.delay,
            willChange: 'transform, opacity', // Hint browser for optimization
            backfaceVisibility: 'hidden', // Prevent 3D transform glitches
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
