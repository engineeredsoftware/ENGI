// A reusable wrapper for marketing homepage sections
"use client";
import React from 'react';

interface SectionWrapperProps {
  children: React.ReactNode;
  /** Additional classes for section element (e.g. to adjust padding) */
  className?: string;
  /** Optional id for section element */
  id?: string;
  /** Disable the default vertical padding (pt and pb) */
  disablePadding?: boolean;
  /** Disable the default horizontal padding (px) */
  disableHorizontalPadding?: boolean;
  /** Optional inline style (e.g. contain) */
  style?: React.CSSProperties;
}

export default function MarketingSectionWrapper({
  children,
  className = '',
  id,
  disablePadding = false,
  disableHorizontalPadding = false,
  style,
}: SectionWrapperProps) {
  const paddingClasses = disablePadding
    ? ''
    : 'pt-8 tablet:pt-10 laptop:pt-12 desktop:pt-16 pb-8 tablet:pb-10 laptop:pb-12 desktop:pb-16';
  const horizontalPadding = disableHorizontalPadding
    ? 'px-0 tablet:px-0 laptop:px-0 desktop:px-0 wide:px-0'
    : 'px-4 tablet:px-6 desktop:px-8 wide:px-12';
  return (
    <section
      id={id}
      className={`relative w-full overflow-hidden bg-transparent ${paddingClasses} ${className}`}
      style={style}
    >
      <div className={`relative mx-auto w-full max-w-6xl ${horizontalPadding}`}
      >
        {children}
      </div>
    </section>
  );
}