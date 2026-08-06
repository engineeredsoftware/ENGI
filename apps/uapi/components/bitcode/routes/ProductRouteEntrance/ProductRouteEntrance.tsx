/**
 * Shared entrance motion for Packs / Reads / Deposits master-detail surfaces.
 *
 * Page load: staggered header → body (marketing entranceEase).
 * Detail drill-in: soft rise + de-blur via ProductDetailStage.
 * Honors prefers-reduced-motion (instant settle, no transform).
 */

"use client";

import React from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";

/** Matches marketing `entranceEase` / nav / auxillaries. */
export const productEntranceEase = [0.16, 1, 0.3, 1] as const;

const COMPOSITOR_STYLE: React.CSSProperties = {
  willChange: "transform, opacity",
  transform: "translateZ(0)",
  backfaceVisibility: "hidden",
};

/** Jest / reduced-motion: settle instantly (no lingering exit trees). */
function shouldReduceMotion(prefersReduced: boolean | null): boolean {
  if (prefersReduced) return true;
  if (typeof process !== "undefined" && process.env.JEST_WORKER_ID) return true;
  return false;
}

export const productEntranceContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

export const productEntranceItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.58,
      ease: productEntranceEase,
    },
  },
};

type ProductRouteEntranceProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Stagger host for the route shell (header band, then body). Mount once per
 * navigation into Packs / Reads / Deposits.
 */
export function ProductRouteEntrance({
  children,
  className,
}: ProductRouteEntranceProps) {
  const reduceMotion = shouldReduceMotion(useReducedMotion());

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={productEntranceContainerVariants}
      style={COMPOSITOR_STYLE}
    >
      {children}
    </motion.div>
  );
}

type ProductEntranceItemProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "header" | "section";
};

/** One staggered band inside ProductRouteEntrance. */
export function ProductEntranceItem({
  children,
  className,
  as = "div",
}: ProductEntranceItemProps) {
  const reduceMotion = shouldReduceMotion(useReducedMotion());
  const MotionTag = motion[as];

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={productEntranceItemVariants}
      style={COMPOSITOR_STYLE}
    >
      {children}
    </MotionTag>
  );
}

type ProductDetailStageProps = {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  testId?: string;
  /** Stable key when swapping compose vs run detail within open stage. */
  stageKey?: string;
  /** Optional data-* attributes (compose/locked) for tests and chrome. */
  dataAttrs?: Record<string, string | undefined>;
};

/**
 * Master → detail drill-in surface. Enters under the always-mounted master
 * table with a soft rise; exits cleanly on Back.
 */
export function ProductDetailStage({
  open,
  children,
  className,
  testId,
  stageKey = "detail",
  dataAttrs,
}: ProductDetailStageProps) {
  const reduceMotion = shouldReduceMotion(useReducedMotion());
  const dataset = Object.fromEntries(
    Object.entries(dataAttrs || {}).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );

  // Instant mount/unmount for reduced motion and unit tests — no exit lag.
  if (reduceMotion) {
    if (!open) return null;
    return (
      <section
        data-testid={testId}
        className={className}
        {...dataset}
      >
        {children}
      </section>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <motion.section
          key={stageKey}
          data-testid={testId}
          className={className}
          {...dataset}
          initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          exit={{
            opacity: 0,
            y: 12,
            filter: "blur(4px)",
            transition: { duration: 0.22, ease: productEntranceEase },
          }}
          transition={{
            duration: 0.5,
            ease: productEntranceEase,
          }}
          style={COMPOSITOR_STYLE}
        >
          {children}
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
