"use client";

import React, { FC, useCallback, useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { cn } from '@bitcode/styling';

type TooltipSide = "bottom" | "top" | "right" | "left";
type TooltipAlign = "start" | "center" | "end";

interface ResolvedTooltipPlacement {
  side: TooltipSide;
  align: TooltipAlign;
  left: number;
  width: number;
  maxHeight: number;
  arrowLeft?: number;
  arrowTop?: number;
  top?: number;
  bottom?: number;
}

interface DisabledTooltipWrapperProps {
  /** Tooltip text shown while the child element is hovered */
  tooltip: string;
  /** The disabled control (e.g. button) */
  children: React.ReactNode;
  /** Additional classes for the wrapper */
  className?: string;
  /** Optional positioning override – defaults to bottom-center */
  placement?: TooltipSide;

  /** Colour theme.  Defaults to emerald (Bitcode green) but can be switched to
   *  'purple' for marketing / coming-soon variants. */
  variant?: "emerald" | "purple";
}

const tooltipViewportMargin = 16;
const tooltipMaxWidth = 544;
const tooltipMinVerticalRoom = 160;
const tooltipGap = 16;
const tooltipMinHeight = 120;
const tooltipMinWidth = 220;

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

function resolveTooltipPlacement(trigger: HTMLElement, preferredSide: TooltipSide): ResolvedTooltipPlacement {
  if (typeof window === 'undefined') {
    return {
      side: preferredSide,
      align: 'center',
      left: tooltipViewportMargin,
      width: tooltipMaxWidth,
      maxHeight: 320,
      arrowLeft: tooltipMaxWidth / 2,
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
  const spaceLeft = rect.left;
  const spaceRight = viewportWidth - rect.right;

  let side = preferredSide;
  if (preferredSide === 'bottom' && spaceBelow < tooltipMinVerticalRoom && spaceAbove > spaceBelow) {
    side = 'top';
  } else if (preferredSide === 'top' && spaceAbove < tooltipMinVerticalRoom && spaceBelow > spaceAbove) {
    side = 'bottom';
  } else if (preferredSide === 'right' && spaceRight < tooltipWidth && spaceLeft > spaceRight) {
    side = 'left';
  } else if (preferredSide === 'left' && spaceLeft < tooltipWidth && spaceRight > spaceLeft) {
    side = 'right';
  }

  if (
    (side === 'right' && spaceRight < tooltipMinWidth + tooltipGap && spaceLeft < tooltipMinWidth + tooltipGap) ||
    (side === 'left' && spaceLeft < tooltipMinWidth + tooltipGap && spaceRight < tooltipMinWidth + tooltipGap)
  ) {
    side = spaceBelow >= spaceAbove ? 'bottom' : 'top';
  }

  let align: TooltipAlign = 'center';
  if (side === 'right' || side === 'left') {
    const availableWidth = side === 'right'
      ? viewportWidth - rect.right - tooltipGap - tooltipViewportMargin
      : rect.left - tooltipGap - tooltipViewportMargin;
    const width = Math.max(
      tooltipMinWidth,
      Math.min(tooltipMaxWidth, availableWidth, viewportWidth - tooltipViewportMargin * 2),
    );
    const left = side === 'right'
      ? rect.right + tooltipGap
      : rect.left - tooltipGap - width;
    const maxHeight = viewportHeight - tooltipViewportMargin * 2;
    const top = clamp(
      rect.top + rect.height / 2 - Math.min(maxHeight, 260) / 2,
      tooltipViewportMargin,
      viewportHeight - tooltipViewportMargin - maxHeight,
    );

    return {
      side,
      align,
      left: clamp(left, tooltipViewportMargin, viewportWidth - tooltipViewportMargin - width),
      width,
      maxHeight,
      top,
      arrowTop: clamp(rect.top + rect.height / 2 - top, 18, maxHeight - 18),
    };
  }

  if (centerX - tooltipWidth / 2 < tooltipViewportMargin) {
      align = 'start';
  } else if (centerX + tooltipWidth / 2 > viewportWidth - tooltipViewportMargin) {
      align = 'end';
  }

  const left = clamp(
    centerX - tooltipWidth / 2,
    tooltipViewportMargin,
    viewportWidth - tooltipViewportMargin - tooltipWidth,
  );
  const arrowLeft = clamp(centerX - left, 18, tooltipWidth - 18);

  if (side === 'top') {
    return {
      side,
      align,
      left,
      width: tooltipWidth,
      maxHeight: Math.max(tooltipMinHeight, rect.top - tooltipGap - tooltipViewportMargin),
      arrowLeft,
      bottom: viewportHeight - rect.top + tooltipGap,
    };
  }

  const top = rect.bottom + tooltipGap;
  return {
    side,
    align,
    left,
    width: tooltipWidth,
    maxHeight: Math.max(tooltipMinHeight, viewportHeight - top - tooltipViewportMargin),
    arrowLeft,
    top,
  };
}

function tooltipPositionStyle(placement: ResolvedTooltipPlacement): React.CSSProperties {
  return {
    left: placement.left,
    width: placement.width,
    maxHeight: placement.maxHeight,
    ...(placement.top !== undefined ? { top: placement.top } : { bottom: placement.bottom }),
  };
}

function arrowClassName({ side }: ResolvedTooltipPlacement) {
  if (side === 'right') {
    return '-left-[7px] -translate-y-1/2 border-y-[7px] border-r-[7px] border-y-transparent border-r-[rgba(3,7,18,0.95)]';
  }

  if (side === 'left') {
    return '-right-[7px] -translate-y-1/2 border-y-[7px] border-l-[7px] border-y-transparent border-l-[rgba(3,7,18,0.95)]';
  }

  const sideClassName =
    side === 'bottom'
      ? '-top-[7px] border-x-[7px] border-b-[7px] border-x-transparent border-b-[rgba(3,7,18,0.95)]'
      : '-bottom-[7px] border-x-[7px] border-t-[7px] border-x-transparent border-t-[rgba(3,7,18,0.95)]';

  return `-translate-x-1/2 ${sideClassName}`;
}

/**
 * Wraps a disabled control and shows an animated “coming soon” tooltip on
 * hover.  The wrapper itself receives the hover state – this allows the
 * wrapped control to keep `pointer-events-none` if desired while still
 * revealing the tooltip.
 */
export const DisabledTooltipWrapper: FC<DisabledTooltipWrapperProps> = ({
  tooltip,
  children,
  className = "",
  placement = "bottom",
  variant = "emerald",
}) => {
  const [resolvedPlacement, setResolvedPlacement] = useState<ResolvedTooltipPlacement>({
    side: placement,
    align: 'center',
    left: tooltipViewportMargin,
    width: tooltipMaxWidth,
    maxHeight: 320,
    arrowLeft: tooltipMaxWidth / 2,
    top: tooltipViewportMargin,
  });
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isVisible) return undefined;

    const hideTooltip = () => setIsVisible(false);
    window.addEventListener('scroll', hideTooltip, true);
    window.addEventListener('resize', hideTooltip);
    return () => {
      window.removeEventListener('scroll', hideTooltip, true);
      window.removeEventListener('resize', hideTooltip);
    };
  }, [isVisible]);

  const updatePlacement = useCallback(
    (event: React.SyntheticEvent<HTMLElement>) => {
      setResolvedPlacement(resolveTooltipPlacement(event.currentTarget, placement));
      setIsVisible(true);
    },
    [placement],
  );
  const hideTooltip = useCallback(() => {
    setIsVisible(false);
  }, []);

  const tooltipMarkup = isMounted && isVisible
    ? createPortal(
      <div
        className="pointer-events-none fixed z-[95]"
        style={tooltipPositionStyle(resolvedPlacement)}
      >
        {/* Entrance / exit animation */}
        <div
          className="w-full translate-y-0 scale-100 opacity-100 transition-all duration-300 ease-out"
          style={{ transformOrigin: "center" }}
        >
          {/* Bubble with a triangle-only pointer so no inner diamond edge is visible. */}
          <div className="relative w-full">
            <div
              className={cn(
                "absolute z-0 h-0 w-0",
                arrowClassName(resolvedPlacement),
              )}
              style={{
                ...(resolvedPlacement.side === 'left' || resolvedPlacement.side === 'right'
                  ? { top: resolvedPlacement.arrowTop }
                  : { left: resolvedPlacement.arrowLeft }),
                filter:
                  variant === 'purple'
                    ? 'drop-shadow(0 0 6px rgba(186,84,236,0.5))'
                    : 'drop-shadow(0 0 6px rgba(101,254,183,0.5))',
                }}
            />

            {/* Bubble */}
            <div
              className={cn(
                "relative z-20 max-h-[inherit] w-full overflow-y-auto rounded-md bg-gray-950/95 px-4 py-3 text-left text-xs font-light leading-5 backdrop-blur-sm tablet:text-sm",
                variant === 'purple'
                  ? 'text-purple-200 ring-purple-500/20 shadow-[0_0_8px_rgba(186,84,236,0.35)]'
                  : 'text-emerald-200 ring-emerald-500/20 shadow-[0_0_8px_rgba(101,254,183,0.45)]'
              )}
            >
              {tooltip}
            </div>
          </div>
        </div>
      </div>,
      document.body,
    )
    : null;

  return (
    <div
      className={cn("relative inline-block", className)}
      onBlur={hideTooltip}
      onFocus={updatePlacement}
      onMouseEnter={updatePlacement}
      onMouseLeave={hideTooltip}
      onTouchStart={updatePlacement}
    >
      {children}
      {tooltipMarkup}
    </div>
  );
};
