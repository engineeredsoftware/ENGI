"use client";

import React from 'react';
import { cn } from '@bitcode/styling';

export interface GPUAccelerationProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * GPUAcceleration – Adds GPU-friendly hints to reduce jank on animated regions.
 * Applies `gpu-accelerate` utility and preserves caller classes.
 */
export function GPUAcceleration({ className, style, ...rest }: GPUAccelerationProps) {
  return (
    <div
      className={cn('gpu-accelerate', className)}
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', ...style }}
      {...rest}
    />
  );
}

