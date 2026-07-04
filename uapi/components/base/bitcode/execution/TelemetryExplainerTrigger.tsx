'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@bitcode/styling';
import {
  resolveExplainerPlacement,
  tooltipArrowClassName,
  tooltipPositionStyle,
  type TooltipPlacement,
  type TooltipSide,
} from './BitcodeInlineExplainer';
import type { TelemetryPillExplainer } from './telemetry-pill-explainers';

interface TelemetryExplainerTriggerProps {
  explainer: TelemetryPillExplainer;
  /** The visible trigger — a PathPill, a stat row, or the row's corner icon. */
  children: React.ReactNode;
  className?: string;
  side?: TooltipSide;
  /**
   * Wrapper element. 'span' (default) for inline pills; 'div' when the
   * trigger IS a block row/chip (e.g. a <dl> child wrapping dt/dd, where a
   * span wrapper would be invalid markup and break the row layout).
   */
  as?: 'span' | 'div';
}

/**
 * Wraps a telemetry pill (or row icon) as a rich-tooltip trigger: hover /
 * focus / touch shows a two-section explainer — the SPECIFIC copy for this
 * exact value on TOP (what it is prompted to do + what it returns), the
 * generic type copy BELOW — in a portal, using the exact placement machinery
 * of BitcodeInlineExplainer — but with the wrapped element itself as the
 * trigger instead of a separate "i" button, so the title-line stays clean.
 * Non-intrusive: no extra tab stops, clicks pass through to the row.
 */
export function TelemetryExplainerTrigger({
  explainer,
  children,
  className,
  side = 'bottom',
  as: Wrapper = 'span',
}: TelemetryExplainerTriggerProps) {
  const [placement, setPlacement] = useState<TooltipPlacement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!placement) return undefined;
    const hideTooltip = () => setPlacement(null);
    window.addEventListener('scroll', hideTooltip, true);
    window.addEventListener('resize', hideTooltip);
    return () => {
      window.removeEventListener('scroll', hideTooltip, true);
      window.removeEventListener('resize', hideTooltip);
    };
  }, [placement]);

  const showTooltip = useCallback(
    (event: React.SyntheticEvent<HTMLElement>) => {
      setPlacement(resolveExplainerPlacement(event.currentTarget, side));
    },
    [side],
  );

  const hideTooltip = useCallback(() => setPlacement(null), []);

  const tooltipMarkup =
    isMounted && placement
      ? createPortal(
        <span
          role="tooltip"
          className="pointer-events-none fixed z-[90] overflow-y-auto rounded-[1.15rem] border border-white/10 bg-[rgba(4,8,18,0.98)] px-4 py-4 text-left text-sm font-normal normal-case tracking-normal opacity-100 shadow-[0_24px_56px_rgba(0,0,0,0.42)] transition duration-150 ease-out"
          style={tooltipPositionStyle(placement)}
        >
          <span
            className={cn('absolute h-0 w-0', tooltipArrowClassName(placement))}
            style={{ left: placement.arrowLeft }}
          />
          <span className="relative block text-[0.62rem] font-medium uppercase tracking-[0.18em] text-emerald-300/80">
            {explainer.kicker}
          </span>
          <strong className="relative mt-2 block text-sm font-semibold tracking-[0.01em] text-white">
            {explainer.title}
          </strong>
          <span className="relative mt-2 block text-sm font-normal normal-case tracking-normal leading-6 text-neutral-200">
            {explainer.specific}
          </span>
          {explainer.generic ? (
            <span className="relative mt-3 block border-t border-white/8 pt-3 text-sm font-normal normal-case tracking-normal leading-6 text-neutral-400">
              {explainer.generic}
            </span>
          ) : null}
        </span>,
        document.body,
      )
      : null;

  return (
    <Wrapper
      className={cn(
        Wrapper === 'span' ? 'inline-flex min-w-0 items-center' : 'block min-w-0',
        className,
      )}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onTouchStart={showTooltip}
      onTouchEnd={hideTooltip}
    >
      {children}
      {tooltipMarkup}
    </Wrapper>
  );
}
