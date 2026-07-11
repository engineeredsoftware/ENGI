"use client";

import { AnimatePresence, motion, HTMLMotionProps } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from '@bitcode/styling';

interface WordRotateProps {
  words: string[];
  activeIndex: number;
  framerProps?: HTMLMotionProps<"div">;
  className?: string;
  marquee?: boolean;
  marqueeSpeed?: number;
  width?: number;
}

export default function WordRotate({
  words,
  activeIndex,
  framerProps = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.2, ease: "easeOut" },
  },
  className,
  marquee = false,
  marqueeSpeed = 1, // 1 = normal speed, 2 = twice as fast, 0.5 = half speed
  width,
}: WordRotateProps) {
  const currentIndex = activeIndex % words.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [shouldMarquee, setShouldMarquee] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!marquee) return;

    const updateWidths = () => {
      if (containerRef.current && contentRef.current) {
        // Force a reflow to ensure we get accurate measurements
        const cWidth = containerRef.current.getBoundingClientRect().width;
        const textWidth = contentRef.current.scrollWidth;

        // Add a small buffer to ensure we catch edge cases
        const shouldScroll = textWidth > (cWidth + 2); // 2px buffer

        // Batch state updates to prevent multiple re-renders
        setContainerWidth(cWidth);
        setContentWidth(textWidth);
      }
    };

    // Initial check
    updateWidths();

    // Check again after a short delay to catch any post-render changes
    const timeoutId = setTimeout(updateWidths, 100);

    // Watch for resize
    const debouncedUpdate = debounce(updateWidths, 100);
    window.addEventListener("resize", debouncedUpdate);

    // Watch for content changes
    const resizeObserver = new ResizeObserver(debouncedUpdate);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [marquee]); // Only re-run when marquee prop changes, not on every word change

  // Simple debounce function
  function debounce(fn: Function, ms: number) {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(null, args), ms);
    };
  }

  // Calculate base duration based on content width (20px per second)
  const baseDuration = contentWidth / 2;

  // Animation configurations
  const animations = {
    // Marquee animation for overflow
    marquee: {
      initial: { x: 0 },
      animate: { x: -(contentWidth - 40) },
      transition: {
        duration: baseDuration / marqueeSpeed,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop" as const,
        delay: 0.2,
      }
    },

    // Fade animation for marquee mode
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 }
    }
  };

  // Only use marquee animation if shouldMarquee is true AND we're not showing the base word (index 0)
  const isMarqueeActive = shouldMarquee && activeIndex !== 0 && marquee;
  const activeAnimation = isMarqueeActive ? animations.marquee : framerProps;

  return (
    <div
      ref={containerRef}
      style={{
        width: width ? `${width}px` : undefined,
        minWidth: width ? `${width}px` : undefined,
        maxWidth: width ? `${width}px` : undefined,
        display: 'inline-block',
        position: 'relative',
        overflowY: 'hidden'
      }}
      className={cn(
        "relative overflow-x-hidden overflow-y-visible",
        marquee && "max-w-full",
        isMarqueeActive && "before:absolute before:left-0 before:top-0 before:h-full before:w-3 before:bg-gradient-to-r before:from-background before:via-background/33 before:to-transparent before:z-10 before:pointer-events-none after:absolute after:right-0 after:top-0 after:h-full after:w-3 after:bg-gradient-to-l after:from-background after:via-background/33 after:to-transparent after:z-10 after:pointer-events-none"
      )}
    >
      {/* Debug overlay for development */}
      {/*process.env.NODE_ENV === 'development' && (
        <div className="absolute inset-0 pointer-events-none border border-red-500/20 z-50" />
      )*/}
      <AnimatePresence mode="wait">
        <motion.div
          ref={contentRef}
          key={`${words[currentIndex]}-${shouldMarquee}`}
          className={cn(
            "relative whitespace-nowrap",
            className
          )}
          style={{
            fontSize: 'inherit',
            lineHeight: 'inherit',
            display: 'inline-flex',
            gap: '.75rem'
          }}
          {...activeAnimation}
        >
          <span className="whitespace-nowrap">{words[currentIndex]}</span>
          {shouldMarquee && (
            <>
              <span className="whitespace-nowrap">{words[currentIndex]}</span>
              <span className="whitespace-nowrap">{words[currentIndex]}</span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
