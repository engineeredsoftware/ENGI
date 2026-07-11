import React from 'react';
// File: uapi/components/bitcode/layout/sidebars/right-sidebar.tsx

"use client";

import ConversationsOverlay from '@/components/conversations/ConversationsOverlay/ConversationsOverlay';

interface DocIconProps {
  variant: 'single' | 'multi';
  className?: string;
}

// Toggle icon for Shippable/AssetPack document surfaces.
export const DocToggleIcon = ({ variant, className = 'w-4 h-4' }: DocIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {variant === 'multi' && (
      <g opacity="0.55" transform="translate(2 2)">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </g>
    )}
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

interface RightSidebarProps {
  /** Render chat UI inline inside sidebar */
  inSidebar: boolean;
  /** Controlled open state */
  isOpen: boolean;
  /** Toggle open/close callback */
  onToggle: () => void;
}

export default function RightSidebar({ inSidebar, isOpen, onToggle }: RightSidebarProps) {
  return (
    <div data-testid="sidebar-right-container">
      <ConversationsOverlay inSidebar={inSidebar} isOpen={isOpen} onToggle={onToggle} />
    </div>
  );
}
