/**
 * Small floating screenshot cards that flank the desktop hero panels.
 */
"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export interface FloatingShot {
  readonly src: string;
  readonly border: string;
  readonly glow: string;
  readonly rotate: number;
  readonly style: React.CSSProperties;
}

export interface MarketingScreenshotFloatingTrioProps {
  shots: readonly FloatingShot[];
  shouldAnimate: boolean;
  screenshotsAnimated: boolean;
  /** Base delay before the first floating shot enters. */
  delayBase: number;
  /** Horizontal transform of the trio container (e.g. translateX(-80%)). */
  containerTransform: string;
}

export function MarketingScreenshotFloatingTrio({
  shots,
  shouldAnimate,
  screenshotsAnimated,
  delayBase,
  containerTransform,
}: MarketingScreenshotFloatingTrioProps) {
  return (
    <div
      className="absolute -bottom-40 w-[20rem] h-[11rem] pointer-events-none z-[70]"
      style={{ left: "50%", transform: containerTransform }}
    >
      {shots.map((shot, i) => (
        <motion.div
          key={shot.src}
          initial={
            screenshotsAnimated
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 30, scale: 0.9 }
          }
          animate={
            shouldAnimate
              ? { opacity: 1, y: 0, scale: 1 }
              : {
                  opacity: screenshotsAnimated ? 1 : 0,
                  y: screenshotsAnimated ? 0 : 30,
                  scale: screenshotsAnimated ? 1 : 0.9,
                }
          }
          transition={
            shouldAnimate
              ? {
                  duration: 1,
                  delay: delayBase + i * 0.14,
                  ease: [0.22, 0.85, 0.36, 1],
                }
              : { duration: 0 }
          }
          className="absolute rounded-lg pointer-events-none"
          style={{
            ...shot.style,
            rotate: `${shot.rotate}deg`,
          }}
        >
          <div className="relative">
            <Image
              src={shot.src}
              alt="Bitcode feature screenshot"
              className={`w-32 laptop:w-36 desktop:w-40 rounded-lg object-cover border-2 ${shot.border}`}
              style={{ filter: `drop-shadow(0 0 14px ${shot.glow})` }}
              width={160}
              height={90}
              priority={false}
            />
          </div>
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              boxShadow:
                "inset 0 0 0 4px rgba(0,0,0,0.9), " +
                "inset 0 0 22px 4px rgba(0,0,0,0.9)",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
