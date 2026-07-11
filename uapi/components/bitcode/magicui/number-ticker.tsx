"use client";

import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useCallback, memo } from "react";

const NumberTicker = memo(function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
}: {
  value: number;
  direction?: "up" | "down";
  className?: string;
  delay?: number; // delay in s
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    isInView &&
      setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value);
      }, delay * 1000);
  }, [motionValue, isInView, delay, value, direction]);

  const handleSpringChange = useCallback((latest: number) => {
    if (ref.current) {
      ref.current.textContent = Intl.NumberFormat("en-US").format(
        latest.toFixed(0),
      );
    }
  }, []);

  useEffect(
    () => springValue.on("change", handleSpringChange),
    [springValue, handleSpringChange],
  );

  return (
    <span
      className={`inline-block tabular-nums text-black dark:text-white ${className}`}
      ref={ref}
      style={{ contain: 'layout' }}
    />
  );
});

export default NumberTicker;
