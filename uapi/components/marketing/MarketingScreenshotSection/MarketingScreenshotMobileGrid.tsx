"use client";

/**
 * Mobile staggered screenshot collage for the marketing screenshot section.
 */
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MOBILE_HERO_SHOTS,
  SCREENSHOT_FRAME_CLASS,
} from "./marketing-screenshot-data";

export function MarketingScreenshotMobileGrid() {
  const [large, medium1, medium2, small1, small2, small3] = MOBILE_HERO_SHOTS;

  return (
    <div className="block laptop:hidden px-4 py-6 space-y-2">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={SCREENSHOT_FRAME_CLASS}
        style={{ filter: "drop-shadow(0 0 20px rgba(101,254,183,0.3))" }}
      >
        <Image
          src={large.src}
          alt={large.alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
      </motion.div>

      <div className="grid grid-cols-2 gap-2">
        {[medium1, medium2].map((shot, idx) => (
          <motion.div
            key={shot.src}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1 * (idx + 1), ease: "easeOut" }}
            className={SCREENSHOT_FRAME_CLASS}
            style={{ filter: "drop-shadow(0 0 16px rgba(59,130,246,0.25))" }}
          >
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              className="object-cover"
              sizes="50vw"
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[small1, small2, small3].map((shot, idx) => (
          <motion.div
            key={shot.src}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, delay: 0.15 * (idx + 1), ease: "easeOut" }}
            className="relative w-full aspect-video overflow-hidden rounded-lg shadow"
            style={{ filter: "drop-shadow(0 0 12px rgba(147,51,234,0.25))" }}
          >
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              className="object-cover"
              sizes="33vw"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
