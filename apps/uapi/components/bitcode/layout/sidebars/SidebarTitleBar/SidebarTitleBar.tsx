"use client";

import React, { ReactNode } from 'react';

/**
 * Shared fixed header bar for left & right sidebars.
 *
 * Styling matches the existing left-sidebar implementation so that both
 * panels stay visually consistent.  Consumers provide arbitrary children – the
 * component only handles the positioning / chrome.
 */
export default function SidebarTitleBar({
  side = 'left',
  widthClass = 'w-[19rem]',
  children,
  className = '',
}: {
  /** Which viewport edge the sidebar is attached to. */
  side?: 'left' | 'right';
  /** Tailwind width utility matching the sidebar panel. */
  widthClass?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} ${widthClass} z-[51] flex items-center gap-2 px-4 py-2 border-b border-emerald-500/20 bg-[#0a1428]/90 backdrop-blur-xl overflow-visible ${className}`}
    >
      {children}
    </div>
  );
}
