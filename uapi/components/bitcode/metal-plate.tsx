"use client";

import React, { FC } from 'react';
import BitcodeHeaderShinyText from './bitcode-header-shiny-text';
import styles from './metal-plate.module.css';

function hexToRgba(hex: string, alpha = 1): string {
  let r = 0,
    g = 0,
    b = 0;
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
  const parsedHex = fullHex.replace('#', '');
  if (parsedHex.length === 6) {
    r = parseInt(parsedHex.substring(0, 2), 16);
    g = parseInt(parsedHex.substring(2, 4), 16);
    b = parseInt(parsedHex.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface MetalPlateProps {
  headline: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  linkUrl?: string;
  linkTitle?: string;
  mainColor?: string;
  glowColor?: string;
  intense?: boolean;
  headerAction?: React.ReactNode;
}

const MetalPlate: FC<MetalPlateProps> = ({
  headline,
  icon,
  children,
  className = '',
  linkUrl,
  linkTitle = 'View details',
  mainColor = '#ba54ec',
  glowColor = '#67feb7',
  intense = false,
  headerAction,
}) => {
  return (
    <div
      className={`relative flex flex-col rounded-md border overflow-hidden transition-all duration-300 ${styles.metalPlate} p-4 space-y-1 ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,28,0.92), rgba(10,15,28,0.85))',
        borderColor: hexToRgba(mainColor, 0.2),
        '--plate-main': mainColor,
        '--plate-main-alpha-60': hexToRgba(mainColor, 0.6),
        '--plate-main-alpha-40': hexToRgba(mainColor, 0.4),
        '--plate-main-alpha-08': hexToRgba(mainColor, 0.08),
        '--plate-glow-alpha-30': hexToRgba(glowColor, 0.3),
        '--plate-glow-alpha-04': hexToRgba(glowColor, 0.04),
        '--plate-glow-alpha-02': hexToRgba(glowColor, 0.02),
        boxShadow: intense
          ? `0 0 18px ${hexToRgba(mainColor, 0.55)}, 0 0 36px ${hexToRgba(glowColor, 0.35)}`
          : `0 0 10px ${hexToRgba(mainColor, 0.25)}, 0 0 20px ${hexToRgba(glowColor, 0.15)}`,
      } as React.CSSProperties}
    >
      {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
        <div
          key={pos}
          className={`absolute w-1 h-1 rounded-full ${pos}`}
          style={{ background: hexToRgba(mainColor, 0.6), boxShadow: `0 0 4px ${hexToRgba(mainColor, 0.4)}`, zIndex: 20 }}
        />
      ))}

      <div className="flex items-center justify-between mb-3 text-emerald-300 relative">
        <div className="flex items-center space-x-2">
          <div className={styles.headlineIconContainer}>
            {icon}
            <div className={styles.headlineIconGlow}></div>
          </div>
          <BitcodeHeaderShinyText as="span" enable3dEffect className={`text-lg font-medium tracking-wide ${styles.headlineText}`}>
            {headline}
          </BitcodeHeaderShinyText>
        </div>
        <div className="flex items-center gap-1">
          {headerAction}
          {linkUrl && (
            <a href={linkUrl} target="_blank" rel="noopener noreferrer" className={styles.titleLinkIcon} title={linkTitle}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      <div className={styles.quantumParticles} />
    </div>
  );
};

export default MetalPlate;
 
