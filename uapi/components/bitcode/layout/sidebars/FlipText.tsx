"use client";

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

/**
 * Simple reusable flip-over text animation.
 * Matches the rotate-X pattern used in the BTD tracker and orbital components.
 */
export default function FlipText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={text}
        initial={{ opacity: 0, rotateX: -90, scale: 0.8 }}
        animate={{ opacity: 1, rotateX: 0, scale: 1 }}
        exit={{ opacity: 0, rotateX: 90, scale: 0.8 }}
        transition={{ 
          duration: 0.22,
          ease: [0.25, 0.46, 0.45, 0.94],
          opacity: { duration: 0.18 }
        }}
        className={className}
        style={{ 
          display: 'inline-block', 
          perspective: 400,
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden'
        }}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  );
}
