"use client";

import React from 'react';
import { cn } from '@bitcode/styling';

export interface ContentVisibilityProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional intrinsic size hint for browsers that use content-visibility */
  containSize?: string; // e.g., "500px 800px"
}

/**
 * ContentVisibility – Wrap heavy scroll regions to enable content-visibility based skipping.
 * Adds the `content-vis` utility class and optional contain-intrinsic-size hint.
 */
export function ContentVisibility({ className, containSize, style, ...rest }: ContentVisibilityProps) {
  return (
    <div
      className={cn('content-vis', className)}
      style={containSize ? { containIntrinsicSize: containSize, ...style } as React.CSSProperties : style}
      {...rest}
    />
  );
}

