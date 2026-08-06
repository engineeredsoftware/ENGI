'use client';

import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import QuantumOrb for better performance
const QuantumOrb = dynamic(() => import('@/components/bitcode/effects/quantum-orb').then(mod => ({ default: mod.QuantumOrb })), {
  ssr: false,
  loading: () => null
});

interface FloatingOrbProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: number;
  onClick: () => void;
  didPlayEntrance?: boolean;
  onEntranceComplete?: () => void;
  className?: string;
}

// Track entrance animation at module level
let didPlayEntrance = false;

function getEntranceInitial(
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
) {
  const OFFSET = 64;
  const initial: Record<string, number> = {
    opacity: 0,
    scale: 0.6,
    rotate: -45,
  };

  if (position.includes('right')) initial.x = OFFSET;
  if (position.includes('left')) initial.x = -OFFSET;
  if (position.includes('bottom')) initial.y = OFFSET;
  if (position.includes('top')) initial.y = -OFFSET;

  return initial;
}

export const FloatingOrb = memo(function FloatingOrb({
  position = 'bottom-right',
  size = 60,
  onClick,
  didPlayEntrance: externalDidPlay = false,
  onEntranceComplete,
  className = ''
}: FloatingOrbProps) {
  const [orbIntensity, setOrbIntensity] = useState<'awakening' | 'active' | 'thinking'>('awakening');
  const [hasPlayedEntrance, setHasPlayedEntrance] = useState(externalDidPlay);

  // Sync entrance animation flag
  useEffect(() => {
    if (!externalDidPlay && !hasPlayedEntrance) {
      // Mark as played after animation completes
      setTimeout(() => {
        setHasPlayedEntrance(true);
        onEntranceComplete?.();
      }, 800);
    }
  }, [externalDidPlay, hasPlayedEntrance, onEntranceComplete]);

  // Cycle through orb states for visual interest
  useEffect(() => {
    const timer = setTimeout(() => {
      setOrbIntensity(prev => {
        const states: Array<'awakening' | 'active' | 'thinking'> = ['awakening', 'active', 'thinking'];
        const currentIndex = states.indexOf(prev);
        return states[(currentIndex + 1) % states.length];
      });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [orbIntensity]);

  // Calculate position styles
  const positionStyles = React.useMemo(() => {
    const base: React.CSSProperties = {};
    
    // Base position
    switch (position) {
      case 'bottom-right':
        base.bottom = '2rem';
        base.right = '2rem';
        break;
      case 'bottom-left':
        base.bottom = '2rem';
        base.left = '2rem';
        break;
      case 'top-right':
        base.top = '2rem';
        base.right = '2rem';
        break;
      case 'top-left':
        base.top = '2rem';
        base.left = '2rem';
        break;
    }

    return base;
  }, [position]);

  return (
    <motion.div
      className={`fixed z-[100] cursor-pointer ${className}`}
      style={positionStyles}
      initial={!hasPlayedEntrance ? getEntranceInitial(position) : false}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
        x: 0,
        y: 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        duration: 0.6,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <QuantumOrb
        size={size}
        initialState={orbIntensity === 'awakening' ? 'hover' : 'active'}
        className="conversations-orb"
        data-testid="conversations-orb"
      />
    </motion.div>
  );
});
