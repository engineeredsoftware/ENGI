'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@bitcode/styling';
import type { BitcodeExplainer } from '@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types';

export type TooltipSide = 'top' | 'bottom';

export interface TooltipPlacement {
  side: TooltipSide;
  left: number;
  width: number;
  arrowLeft: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
}

interface BitcodeInlineExplainerProps {
  explainer: BitcodeExplainer;
  side?: TooltipSide;
  className?: string;
  triggerClassName?: string;
  /**
   * Override the trigger button's aria-label (defaults to `Explain ${title}`).
   * Use this when the explainer's title matches or contains an adjacent form
   * field's own label text — `getByLabelText`/screen-reader label lookups
   * match ANY element whose aria-label contains the query text, not just
   * elements associated via `<label>`, so a title-derived aria-label next to
   * a same-named field is ambiguous. A short generic label (e.g. "More info
   * about the Branch field") avoids the collision.
   */
  triggerAriaLabel?: string;
}

const tooltipViewportMargin = 16;
const tooltipMaxWidth = 320;
const tooltipMinVerticalRoom = 240;
const tooltipGap = 12;
const tooltipMinHeight = 140;

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

export function resolveExplainerPlacement(trigger: HTMLElement, preferredSide: TooltipSide): TooltipPlacement {
  if (typeof window === 'undefined') {
    return {
      side: preferredSide,
      left: tooltipViewportMargin,
      width: tooltipMaxWidth,
      arrowLeft: tooltipMaxWidth / 2,
      maxHeight: 360,
      top: tooltipViewportMargin,
    };
  }

  const rect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const tooltipWidth = Math.min(tooltipMaxWidth, viewportWidth - tooltipViewportMargin * 2);
  const centerX = rect.left + rect.width / 2;
  const spaceAbove = rect.top;
  const spaceBelow = viewportHeight - rect.bottom;
  const left = clamp(
    centerX - tooltipWidth / 2,
    tooltipViewportMargin,
    viewportWidth - tooltipViewportMargin - tooltipWidth,
  );
  const arrowLeft = clamp(centerX - left, 18, tooltipWidth - 18);

  let side = preferredSide;
  if (
    preferredSide === 'bottom' &&
    spaceBelow < tooltipMinVerticalRoom &&
    spaceAbove > spaceBelow
  ) {
    side = 'top';
  } else if (
    preferredSide === 'top' &&
    spaceAbove < tooltipMinVerticalRoom &&
    spaceBelow > spaceAbove
  ) {
    side = 'bottom';
  }

  if (side === 'top') {
    const bottom = viewportHeight - rect.top + tooltipGap;
    return {
      side,
      left,
      width: tooltipWidth,
      arrowLeft,
      maxHeight: Math.max(tooltipMinHeight, rect.top - tooltipGap - tooltipViewportMargin),
      bottom,
    };
  }

  const top = rect.bottom + tooltipGap;
  return {
    side,
    left,
    width: tooltipWidth,
    arrowLeft,
    maxHeight: Math.max(tooltipMinHeight, viewportHeight - top - tooltipViewportMargin),
    top,
  };
}

export function tooltipPositionStyle(placement: TooltipPlacement): React.CSSProperties {
  return {
    left: placement.left,
    width: placement.width,
    maxHeight: placement.maxHeight,
    ...(placement.top !== undefined ? { top: placement.top } : { bottom: placement.bottom }),
  };
}

export function tooltipArrowClassName({ side }: TooltipPlacement) {
  const sideClassName =
    side === 'bottom'
      ? '-top-[7px] border-x-[7px] border-b-[7px] border-x-transparent border-b-[rgba(4,8,18,0.98)]'
      : '-bottom-[7px] border-x-[7px] border-t-[7px] border-x-transparent border-t-[rgba(4,8,18,0.98)]';

  return `-translate-x-1/2 ${sideClassName}`;
}

export default function BitcodeInlineExplainer({
  explainer,
  side = 'bottom',
  className,
  triggerClassName,
  triggerAriaLabel,
}: BitcodeInlineExplainerProps) {
  const [placement, setPlacement] = useState<TooltipPlacement>({
    side,
    left: tooltipViewportMargin,
    width: tooltipMaxWidth,
    arrowLeft: tooltipMaxWidth / 2,
    maxHeight: 360,
    top: tooltipViewportMargin,
  });
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const title = explainer.title;
  const summary = explainer.summary;
  const detail = explainer.detail;
  const points = explainer.points || [];
  const sourceRefs = explainer.references?.source || [];
  const canonRefs = explainer.references?.canon || [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const cancelScheduledHide = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => cancelScheduledHide, [cancelScheduledHide]);

  const hideTooltipNow = useCallback(() => {
    cancelScheduledHide();
    setIsVisible(false);
  }, [cancelScheduledHide]);

  useEffect(() => {
    if (!isVisible) return undefined;

    // Scrolls INSIDE the tooltip must not dismiss it — that is how
    // overflowing explainer content is read (the tooltip is viewport-height
    // capped and scrolls). Page scrolls and resizes still dismiss.
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
  }, [hideTooltipNow, isVisible]);

  const showTooltip = useCallback(
    (event: React.SyntheticEvent<HTMLElement>) => {
      cancelScheduledHide();
      const trigger = event.currentTarget.querySelector('button');
      if (trigger instanceof HTMLElement) {
        setPlacement(resolveExplainerPlacement(trigger, side));
        setIsVisible(true);
      }
    },
    [cancelScheduledHide, side],
  );

  // Grace period so the pointer can travel from the trigger into the
  // tooltip to scroll overflowing content without the tooltip vanishing.
  const hideTooltip = useCallback(() => {
    cancelScheduledHide();
    hideTimeoutRef.current = window.setTimeout(() => setIsVisible(false), 160);
  }, [cancelScheduledHide]);

  const tooltipMarkup = isMounted && isVisible
    ? createPortal(
      <span
        role="tooltip"
        ref={tooltipRef}
        onMouseEnter={cancelScheduledHide}
        onMouseLeave={hideTooltipNow}
        className={cn(
          // Above auxillaries/orbital portals (z-index 100) and surface chrome
          // (~10002) so rich hover tooltips paint on top of the workspace shell.
          // Vertical scroll only when height-capped; never x-scroll — long paths
          // and unbroken tokens wrap (break-words / break-all on chips).
          'pointer-events-auto fixed z-[10100] min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain border border-white/10 bg-[rgba(4,8,18,0.98)] px-4 py-4 text-left text-sm font-normal normal-case tracking-normal opacity-100 shadow-[0_24px_56px_rgba(0,0,0,0.42)] transition duration-150 ease-out',
        )}
        style={tooltipPositionStyle(placement)}
      >
        <span
          className={cn(
            'absolute h-0 w-0',
            tooltipArrowClassName(placement),
          )}
          style={{ left: placement.arrowLeft }}
        />
        {explainer.kicker ? (
          <span className="relative block text-[0.62rem] font-medium uppercase tracking-[0.18em] text-emerald-300/80">{explainer.kicker}</span>
        ) : null}
        <strong className="relative mt-2 block break-words text-sm font-semibold tracking-[0.01em] text-white">{title}</strong>
        <span className="relative mt-2 block break-words text-sm font-normal normal-case tracking-normal leading-6 text-neutral-200">{summary}</span>
        {detail ? (
          <span className="relative mt-3 block break-words border-t border-white/8 pt-3 text-sm font-normal normal-case tracking-normal leading-6 text-neutral-400">
            {detail}
          </span>
        ) : null}
        {points.length ? (
          <div className="relative mt-3 border-t border-white/8 pt-3">
            <span className="block text-[0.62rem] uppercase tracking-[0.18em] text-emerald-300/75">Use this to</span>
            <ul className="mt-2 space-y-1.5 text-sm font-normal normal-case tracking-normal leading-6 text-neutral-200">
            {points.map((point) => (
              <li key={`${title}-${point}`} className="flex gap-2">
                <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 bg-emerald-300/70" />
                <span className="min-w-0 break-words">{point}</span>
              </li>
            ))}
            </ul>
          </div>
        ) : null}
        {sourceRefs.length || canonRefs.length ? (
          <div className="relative mt-3 min-w-0 border-t border-white/8 pt-3">
            {sourceRefs.length ? (
              <div className="mt-2 min-w-0">
                <span className="block text-[0.62rem] uppercase tracking-[0.18em] text-emerald-300/75">
                  Current source
                </span>
                <div className="mt-2 flex min-w-0 flex-col gap-1.5">
                  {sourceRefs.map((ref) => (
                    <span
                      key={`${title}-source-${ref}`}
                      className="max-w-full min-w-0 break-all border border-white/10 bg-white/5 px-2 py-1 text-[0.58rem] uppercase leading-4 tracking-[0.14em] text-neutral-200"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {canonRefs.length ? (
              <div className="mt-2 min-w-0">
                <span className="block text-[0.62rem] uppercase tracking-[0.18em] text-emerald-300/75">
                  Current canon
                </span>
                <div className="mt-2 flex min-w-0 flex-col gap-1.5">
                  {canonRefs.map((ref) => (
                    <span
                      key={`${title}-canon-${ref}`}
                      className="max-w-full min-w-0 break-all border border-white/10 bg-white/5 px-2 py-1 text-[0.58rem] uppercase leading-4 tracking-[0.14em] text-neutral-200"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </span>,
      document.body,
    )
    : null;

  return (
    <span
      className={cn('relative inline-flex items-center', className)}
      onBlur={hideTooltip}
      onFocus={showTooltip}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onTouchStart={showTooltip}
    >
      <button
        type="button"
        aria-label={triggerAriaLabel || `Explain ${title}`}
        onClick={(event) => event.preventDefault()}
        className={cn(
          'inline-flex h-[1.125rem] min-h-[1.125rem] w-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center border border-white/12 bg-white/5 text-[0.62rem] font-semibold leading-none text-neutral-300 transition hover:border-emerald-300/35 hover:bg-emerald-400/10 hover:text-emerald-100 focus-visible:border-emerald-300/35 focus-visible:bg-emerald-400/10 focus-visible:text-emerald-100 focus-visible:outline-none',
          triggerClassName,
        )}
      >
        i
      </button>
      {tooltipMarkup}
    </span>
  );
}
