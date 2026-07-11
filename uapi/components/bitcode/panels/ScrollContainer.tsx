"use client";

import React from 'react';
import { cn } from '@bitcode/styling';

export interface ScrollContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use transparent scrollbar track variant */
  transparentTrack?: boolean;
  /** Use wider (6px) scrollbar */
  wideTrack?: boolean;
  /** Use dark track variant */
  darkTrack?: boolean;
}

/**
 * ScrollContainer – Standardized scroll container with SSOT scrollbar classes.
 *
 * Defaults to `overflow-auto custom-scrollbar`. Variants toggle SSOT modifiers.
 */
export function ScrollContainer({
  className,
  transparentTrack,
  wideTrack,
  darkTrack,
  children,
  ...rest
}: ScrollContainerProps) {
  return (
    <div
      className={cn(
        'overflow-auto custom-scrollbar',
        transparentTrack && 'custom-scrollbar--transparent-track',
        wideTrack && 'custom-scrollbar--w-6',
        darkTrack && 'custom-scrollbar--track-dark',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

