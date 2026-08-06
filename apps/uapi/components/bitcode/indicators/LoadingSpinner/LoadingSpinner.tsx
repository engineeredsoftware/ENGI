"use client";

import React from 'react';

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number; // pixels
  thickness?: number; // border width in px
  color?: string; // CSS color for the top border
  trackColor?: string; // CSS color for the track border
}

export function LoadingSpinner({
  size = 16,
  thickness = 2,
  color = 'white',
  trackColor = 'rgba(255,255,255,0.3)',
  className,
  style,
  ...rest
}: LoadingSpinnerProps) {
  const spinnerStyle: React.CSSProperties = {
    display: 'inline-block',
    width: size,
    height: size,
    border: `${thickness}px solid ${trackColor}`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'loading-spinner-rotate 0.8s linear infinite',
    ...style,
  };
  return <span role="progressbar" aria-label="loading" className={className} style={spinnerStyle} {...rest} />;
}

// Inject minimal keyframes once (scoped)
if (typeof document !== 'undefined' && !document.getElementById('loading-spinner-keyframes')) {
  const style = document.createElement('style');
  style.id = 'loading-spinner-keyframes';
  style.textContent = `@keyframes loading-spinner-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

export default LoadingSpinner;

