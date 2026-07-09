"use client";
import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading states for VCS operations
 */
interface VCSLoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
} as const;

/**
 * Reusable loading component
 */
export const VCSLoadingState = React.memo(({ 
  message = 'Loading...', 
  size = 'md',
  className = ''
}: VCSLoadingStateProps) => (
  <div className={`flex items-center justify-center gap-2 text-muted-foreground ${className}`}>
    <Loader2 className={`animate-spin ${SIZES[size]}`} />
    <span className="text-sm">{message}</span>
  </div>
));

VCSLoadingState.displayName = 'VCSLoadingState';

/**
 * Inline loading spinner
 */
export const VCSLoadingSpinner = React.memo(({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <Loader2 className={`animate-spin ${SIZES[size]}`} />
));

VCSLoadingSpinner.displayName = 'VCSLoadingSpinner';

/**
 * Skeleton loader for selects
 */
export const VCSSelectSkeleton = React.memo(() => (
  <div className="w-48 h-9 bg-muted animate-pulse" />
));

VCSSelectSkeleton.displayName = 'VCSSelectSkeleton';

/**
 * Loading overlay
 */
export const VCSLoadingOverlay = React.memo(({ 
  visible, 
  message = 'Loading...' 
}: { 
  visible: boolean; 
  message?: string;
}) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
});

VCSLoadingOverlay.displayName = 'VCSLoadingOverlay';
