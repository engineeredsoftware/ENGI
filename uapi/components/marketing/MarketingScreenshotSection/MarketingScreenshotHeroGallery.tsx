/**
 * Desktop three-panel hero screenshot gallery with floating flanking cards.
 */
"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  LEFT_FLOATING_SHOTS,
  RIGHT_FLOATING_SHOTS,
} from "./marketing-screenshot-data";
import { MarketingScreenshotFloatingTrio } from "./MarketingScreenshotFloatingTrio";

export interface MarketingScreenshotHeroGalleryProps {
  shouldAnimate: boolean;
  screenshotsAnimated: boolean;
  onEntranceComplete: () => void;
}

export function MarketingScreenshotHeroGallery({
  shouldAnimate,
  screenshotsAnimated,
  onEntranceComplete,
}: MarketingScreenshotHeroGalleryProps) {
  return (
    <div className="hidden laptop:flex flex-col laptop:flex-row items-start justify-center overflow-visible w-screen">
      {/* Left screenshot */}
      <motion.div
        style={{ willChange: "transform, opacity" }}
        initial={
          screenshotsAnimated
            ? { opacity: 1, y: 5, scale: 1 }
            : { opacity: 0, y: 70, scale: 0.985 }
        }
        animate={
          shouldAnimate
            ? {
                opacity: [0, 0.8, 1],
                y: [70, -4, 5],
                scale: [0.985, 1.005, 1],
              }
            : {
                opacity: screenshotsAnimated ? 1 : 0,
                y: screenshotsAnimated ? 5 : 70,
                scale: screenshotsAnimated ? 1 : 0.985,
              }
        }
        transition={
          shouldAnimate
            ? {
                duration: 1.6,
                delay: 0,
                times: [0, 0.55, 1],
                ease: [0.22, 0.85, 0.36, 1],
              }
            : { duration: 0 }
        }
        className="relative w-full laptop:w-1/4 flex-shrink-0 laptop:-mr-32 mb-6 laptop:mb-0 z-0"
      >
        <motion.div
          className="absolute inset-0 rounded-xl"
          initial={
            screenshotsAnimated
              ? { opacity: 0.4, scale: 1 }
              : { opacity: 0, scale: 0.96 }
          }
          animate={
            shouldAnimate
              ? { opacity: [0, 1, 0.4], scale: [0.99, 1.005, 1] }
              : { opacity: 0.4, scale: 1 }
          }
          transition={
            shouldAnimate
              ? { duration: 1.2, times: [0, 0.35, 1], ease: "easeOut" }
              : { duration: 0 }
          }
          style={{
            background:
              "radial-gradient(circle at center, rgba(249,168,38,0.5), transparent 70%)",
            filter: "blur(60px)",
            willChange: "opacity, transform",
          }}
        />
        <Image
          src="/screenshots/asset-pack-page-maximal-state.png"
          alt="Left Bitcode screenshot"
          className="relative w-full rounded-xl object-cover border-2 border-orange-400"
          width={800}
          height={600}
          priority
          fetchPriority="high"
        />
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-50"
          style={{
            boxShadow:
              "inset 0 0 0 7px rgba(0,0,0,0.9), " +
              "inset 0 0 35px 8px rgba(0,0,0,0.9)",
          }}
        />
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-60"
          style={{ boxShadow: "0 0 12px 2px #fb923c" }}
        />
        <MarketingScreenshotFloatingTrio
          shots={LEFT_FLOATING_SHOTS}
          shouldAnimate={shouldAnimate}
          screenshotsAnimated={screenshotsAnimated}
          delayBase={1.05}
          containerTransform="translateX(-80%)"
        />
      </motion.div>

      {/* Center screenshot */}
      <motion.div className="relative w-full laptop:w-2/4 flex-shrink-0 mb-6 laptop:mb-0 z-20">
        <motion.div
          style={{ willChange: "transform, opacity" }}
          initial={
            screenshotsAnimated
              ? { opacity: 1, y: -10, scale: 1 }
              : { opacity: 0, y: 70, scale: 0.985 }
          }
          animate={
            shouldAnimate
              ? {
                  opacity: [0, 0.8, 1],
                  y: [70, -5, -10],
                  scale: [0.985, 1.01, 1],
                }
              : {
                  opacity: screenshotsAnimated ? 1 : 0,
                  y: screenshotsAnimated ? -10 : 70,
                  scale: screenshotsAnimated ? 1 : 0.985,
                }
          }
          transition={
            shouldAnimate
              ? {
                  duration: 1.8,
                  delay: 0.12,
                  times: [0, 0.52, 1],
                  ease: [0.22, 0.85, 0.36, 1],
                }
              : { duration: 0 }
          }
          onAnimationComplete={onEntranceComplete}
        >
          <motion.div
            className="absolute inset-0 rounded-2xl"
            initial={
              screenshotsAnimated
                ? { opacity: 0.45, scale: 1 }
                : { opacity: 0, scale: 0.96 }
            }
            animate={
              shouldAnimate
                ? { opacity: [0, 1, 0.45], scale: [0.99, 1.008, 1] }
                : { opacity: 0.45, scale: 1 }
            }
            transition={
              shouldAnimate
                ? { duration: 1.5, times: [0, 0.35, 1], ease: "easeOut" }
                : { duration: 0 }
            }
            style={{
              background:
                "radial-gradient(circle at center, rgba(52,211,153,0.5), transparent 70%)",
              filter: "blur(120px)",
              willChange: "opacity, transform",
            }}
          />
          <Image
            src="/screenshots/asset-pack-page-minimal-state.png"
            alt="Center Bitcode screenshot"
            className="relative w-full rounded-2xl object-cover border-2 border-green-400"
            width={900}
            height={600}
            priority
            sizes="(min-width:1024px) 45vw, 90vw"
          />
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none z-50"
            style={{
              boxShadow:
                "inset 0 0 0 7px rgba(0,0,0,0.9), " +
                "inset 0 0 35px 8px rgba(0,0,0,0.9)",
            }}
          />
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none z-60"
            style={{ boxShadow: "0 0 12px 2px #4ade80" }}
          />
        </motion.div>
      </motion.div>

      {/* Right screenshot */}
      <motion.div className="relative w-full laptop:w-1/4 flex-shrink-0 laptop:-ml-32 mb-6 laptop:mb-0 z-0">
        <motion.div
          style={{ willChange: "transform, opacity" }}
          initial={
            screenshotsAnimated
              ? { opacity: 1, y: 15, scale: 1 }
              : { opacity: 0, y: 70, scale: 0.985 }
          }
          animate={
            shouldAnimate
              ? {
                  opacity: [0, 0.8, 1],
                  y: [70, -3, 15],
                  scale: [0.985, 1.005, 1],
                }
              : {
                  opacity: screenshotsAnimated ? 1 : 0,
                  y: screenshotsAnimated ? 15 : 70,
                  scale: screenshotsAnimated ? 1 : 0.985,
                }
          }
          transition={
            shouldAnimate
              ? {
                  duration: 1.6,
                  delay: 0.24,
                  times: [0, 0.55, 1],
                  ease: [0.22, 0.85, 0.36, 1],
                }
              : { duration: 0 }
          }
        >
          <motion.div
            className="absolute inset-0 rounded-xl"
            initial={
              screenshotsAnimated
                ? { opacity: 0.4, scale: 1 }
                : { opacity: 0, scale: 0.96 }
            }
            animate={
              shouldAnimate
                ? { opacity: [0, 1, 0.4], scale: [0.99, 1.005, 1] }
                : { opacity: 0.4, scale: 1 }
            }
            transition={
              shouldAnimate
                ? { duration: 1.2, times: [0, 0.35, 1], ease: "easeOut" }
                : { duration: 0 }
            }
            style={{
              background:
                "radial-gradient(circle at center, rgba(192,132,252,0.5), transparent 70%)",
              filter: "blur(60px)",
              willChange: "opacity, transform",
            }}
          />
          <Image
            src="/screenshots/conversations-fullscreen.png"
            alt="Right Bitcode screenshot"
            className="relative w-full rounded-xl object-cover border-2 border-purple-500"
            width={800}
            height={600}
            priority={false}
            fetchPriority="low"
            sizes="(min-width:1024px) 22vw, 45vw"
          />
          <div
            className="absolute inset-0 rounded-xl pointer-events-none z-50"
            style={{
              boxShadow:
                "inset 0 0 0 7px rgba(0,0,0,0.9), " +
                "inset 0 0 35px 8px rgba(0,0,0,0.9)",
            }}
          />
          <div
            className="absolute inset-0 rounded-xl pointer-events-none z-60"
            style={{ boxShadow: "0 0 12px 2px #a855f7" }}
          />
          <MarketingScreenshotFloatingTrio
            shots={RIGHT_FLOATING_SHOTS}
            shouldAnimate={shouldAnimate}
            screenshotsAnimated={screenshotsAnimated}
            delayBase={1.35}
            containerTransform="translateX(-20%)"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
