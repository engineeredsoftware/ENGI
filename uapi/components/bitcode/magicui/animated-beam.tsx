"use client";

import { cn } from '@bitcode/styling';
import { motion, useReducedMotion } from "framer-motion";
import { RefObject, useEffect, useId, useState } from "react";

export interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement>; // Container ref
  fromRef: RefObject<HTMLElement>;
  toRef: RefObject<HTMLElement>;
  curvature?: number;
  /** Axis of curvature: 'y' for vertical curves (horizontal beams), 'x' for horizontal curves (vertical beams) */
  axis?: 'x' | 'y';
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false, // Include the reverse prop
  duration = Math.random() * 3 + 4,
  axis = 'y',
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffffff",
  gradientStopColor =  "#65feb7",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}) => {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  // Calculate gradient coordinates depending on the primary travel axis of the
  // beam.  For beams that predominantly travel horizontally (axis === "y") we
  // animate along the X-axis.  For vertical beams (axis === "x") we animate
  // along the Y-axis so the light appears to flow from source→destination.

  const gradientCoordinates = (() => {
    if (axis === "y") {
      // Horizontal travel — animate left→right (or reverse)
      return reverse
        ? {
            x1: ["90%", "-10%"],
            x2: ["100%", "0%"],
            y1: ["0%", "0%"],
            y2: ["0%", "0%"],
          }
        : {
            x1: ["10%", "110%"],
            x2: ["0%", "100%"],
            y1: ["0%", "0%"],
            y2: ["0%", "0%"],
          };
    }
    // Vertical travel — animate top→bottom (or reverse)
    return reverse
      ? {
          x1: ["0%", "0%"],
          x2: ["0%", "0%"],
          y1: ["90%", "-10%"],
          y2: ["100%", "0%"],
        }
      : {
          x1: ["0%", "0%"],
          x2: ["0%", "0%"],
          y1: ["10%", "110%"],
          y2: ["0%", "100%"],
        };
  })();

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const startX =
          rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY =
          rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX =
          rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY =
          rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        let controlX: number;
        let controlY: number;
        if (axis === 'y') {
          controlY = startY - curvature;
          controlX = (startX + endX) / 2;
        } else {
          controlX = startX - curvature;
          controlY = (startY + endY) / 2;
        }
        // Ensure the SVG canvas is always large enough to encompass the
        // full beam after accounting for any external transforms (e.g.
        // the 1.5× scale applied on the motherboard illustration).
        //
        // Rather than tying the canvas size to the container (which stays
        // at the original scale), we size it dynamically based on the
        // actual start / end coordinates so nothing gets clipped.

        const svgWidth = Math.max(startX, endX) + 40; // extra breathing room
        const svgHeight = Math.max(startY, endY) + 40;

        // Only update state when a real change occurred.  This prevents a
        // cascade of unnecessary React renders when the ResizeObserver fires
        // many times in quick succession with identical geometry (a common
        // scenario while the user is resizing or when a container has
        // stabilised).

        setSvgDimensions((prev) =>
          prev.width === svgWidth && prev.height === svgHeight
            ? prev
            : { width: svgWidth, height: svgHeight }
        );

        const d = `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`;
        setPathD((prev) => (prev === d ? prev : d));
      }
    };

    // ---------------------------------------------------------------------
    //              ResizeObserver → rAF-throttled updatePath
    // ---------------------------------------------------------------------
    let rafId = 0;
    const handleResize: ResizeObserverCallback = (_entries) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePath);
    };

    const resizeObserver = new ResizeObserver(handleResize);

    // Observe the container element (it encloses both ends of the beam).
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Initial path computation
    updatePath();

    // -----------------------------------------------------------------
    // Auto-disconnect the ResizeObserver after the first stable frame to
    // avoid continuous geometry callbacks while nothing moves. We still
    // listen to the global window "resize" event for rare viewport
    // changes.
    // -----------------------------------------------------------------

    const stableTimeout = window.setTimeout(() => resizeObserver.disconnect(), 500);

    const handleWindowResize = () => updatePath();
    window.addEventListener('resize', handleWindowResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      window.clearTimeout(stableTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
    axis,
  ]);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2",
        className,
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        strokeWidth={pathWidth}
        stroke={`url(#${id})`}
        strokeOpacity="1"
        strokeLinecap="round"
      />
      <defs>
        <motion.linearGradient
          className="transform-gpu"
          id={id}
          gradientUnits={"userSpaceOnUse"}
          animate={
            prefersReducedMotion
              ? undefined // static gradient – no animation
              : {
                  x1: gradientCoordinates.x1,
                  x2: gradientCoordinates.x2,
                  y1: gradientCoordinates.y1,
                  y2: gradientCoordinates.y2,
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  delay,
                  duration,
                  ease: [0.16, 1, 0.3, 1], // https://easings.net/#easeOutExpo
                  repeat: Infinity,
                  repeatDelay: 0,
                }
          }
        >
          <stop stopColor={gradientStartColor} stopOpacity="0"></stop>
          <stop stopColor={gradientStartColor}></stop>
          <stop offset="32.5%" stopColor={gradientStopColor}></stop>
          <stop
            offset="100%"
            stopColor={gradientStopColor}
            stopOpacity="0"
          ></stop>
        </motion.linearGradient>
      </defs>
    </svg>
  );
};
