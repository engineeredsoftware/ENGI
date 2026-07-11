'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MagnitudeCounterProps {
  label: string;
  endValue: number;
  duration?: number;
  delay?: number;
}

const MarketingMagnitudeCounter = ({ label, endValue, duration = 2.5, delay = 0 }: MagnitudeCounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function for more dramatic effect
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easedProgress * endValue));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    const timeoutId = setTimeout(() => {
      animationFrame = requestAnimationFrame(updateCount);
    }, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrame);
    };
  }, [endValue, duration, delay]);

  return (
    <motion.div
      className="flex flex-col items-center p-6 bg-emerald-950/30 backdrop-blur-sm rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(103, 254, 183, 0.2)' }}
      style={{ contain: 'layout' }}
    >
      <div className="relative">
        <div className="absolute inset-0 animate-quantum-glow rounded-full blur-xl opacity-30"></div>
        <div className="flex items-center justify-center">
          <span className="text-6xl font-bold text-emerald-400">{count}</span>
          <span className="text-3xl font-bold text-emerald-400 ml-1">×</span>
        </div>
      </div>
      <div className="text-sm text-gray-300 mt-3 font-medium">{label}</div>
    </motion.div>
  );
};

export default MarketingMagnitudeCounter;

