'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cancelScheduledHide = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => cancelScheduledHide, [cancelScheduledHide]);

  const hideTooltipNow = useCallback(() => {
    cancelScheduledHide();
    setPlacement(null);
  }, [cancelScheduledHide]);

  useEffect(() => {
    if (!placement) return undefined;
    // Scrolls INSIDE the tooltip must not dismiss it — that is how
    // overflowing content is read (the tooltip is viewport-height capped
    // and scrolls). Page scrolls and resizes still dismiss.
    const hideOnViewportChange = (event: Event) => {
      if (
        tooltipRef.current &&
        event.target instanceof Node &&
        tooltipRef.current.contains(event.target)
      ) {
        return;
      }
      hideTooltipNow();
    };
    window.addEventListener('scroll', hideOnViewportChange, true);
    window.addEventListener('resize', hideTooltipNow);
    return () => {
      window.removeEventListener('scroll', hideOnViewportChange, true);
      window.removeEventListener('resize', hideTooltipNow);
    };
  }, [hideTooltipNow, placement]);

  const showTooltip = useCallback(
    (event: React.SyntheticEvent<HTMLElement>) => {
      cancelScheduledHide();
      setPlacement(resolveExplainerPlacement(event.currentTarget, side));
    },
    [cancelScheduledHide, side],
  );

  // Grace period so the pointer can travel from the trigger into the
  // tooltip to scroll overflowing content without the tooltip vanishing.
  const hideTooltip = useCallback(() => {
    cancelScheduledHide();
    hideTimeoutRef.current = window.setTimeout(() => setPlacement(null), 160);
  }, [cancelScheduledHide]);

  const tooltipMarkup =
    isMounted && placement
      ? createPortal(
        <span
          role="tooltip"
          ref={tooltipRef}
          onMouseEnter={cancelScheduledHide}
          onMouseLeave={hideTooltipNow}
          className="pointer-events-auto fixed z-[90] overflow-y-auto overscroll-contain border border-white/10 bg-[rgba(4,8,18,0.98)] px-4 py-4 text-left text-sm font-normal normal-case tracking-normal opacity-100 shadow-[0_24px_56px_rgba(0,0,0,0.42)] transition duration-150 ease-out"
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
          {explainer.points?.length ? (
            <span className="relative mt-3 block border-t border-white/8 pt-3">
              <span className="block text-[0.62rem] uppercase tracking-[0.18em] text-emerald-300/75">
                Use this to
              </span>
              <span className="mt-2 block space-y-1.5">
                {explainer.points.map((point) => (
                  <span
                    key={point}
                    className="flex gap-2 text-sm font-normal normal-case tracking-normal leading-6 text-neutral-200"
                  >
                    <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 bg-emerald-300/70" />
                    <span>{point}</span>
                  </span>
                ))}
              </span>
            </span>
          ) : null}
          {explainer.references &&
          (explainer.references.source.length || explainer.references.canon.length) ? (
            <span className="relative mt-3 block border-t border-white/8 pt-3">
              {explainer.references.source.length ? (
                <span className="block">
                  <span className="block text-[0.62rem] uppercase tracking-[0.18em] text-emerald-300/75">
                    Current source
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {explainer.references.source.map((reference) => (
                      <span
                        key={reference}
                        className="border border-white/10 bg-white/5 px-2 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-neutral-200"
                      >
                        {reference}
                      </span>
                    ))}
                  </span>
                </span>
              ) : null}
              {explainer.references.canon.length ? (
                <span className="mt-2 block">
                  <span className="block text-[0.62rem] uppercase tracking-[0.18em] text-emerald-300/75">
                    Current canon
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {explainer.references.canon.map((reference) => (
                      <span
                        key={reference}
                        className="border border-white/10 bg-white/5 px-2 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-neutral-200"
                      >
                        {reference}
                      </span>
                    ))}
                  </span>
                </span>
              ) : null}
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
