'use client';

/**
 * Dual-thumbnail strip used by the acceleration feature cards.
 */

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export const MarketingAccelerationThumbnailStrip: React.FC<{
  images: string[];
  onThumbClick: (index: number) => void;
}> = ({ images, onThumbClick }) => {
  const prefersReducedMotion = useReducedMotion();
  // Ensure we always have two thumbnails by duplicating the final image as needed
  const padded =
    images.length >= 2
      ? images.slice(0, 2)
      : [...images, ...Array(2 - images.length).fill(images[images.length - 1] ?? images[0])];

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.12, // snappier
        staggerDirection: -1 // bottom thumbnail enters first
      }
    },
    exit: {
      transition: {
        staggerChildren: 0.08,
        staggerDirection: 1 // top thumbnail exits first (bottom leaves last)
      }
    }
  } as const;

  const itemVariants = {
    initial: { opacity: 0, y: 40, scale: 0.85 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 450, damping: 26 }
    },
    exit: {
      opacity: 0,
      y: -30,
      scale: 0.85,
      transition: { duration: 0.22, ease: 'easeInOut' }
    }
  } satisfies Parameters<typeof motion.div>[0]['variants'];

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0">
        <MarketingThumbnailStack
          images={padded}
          onThumbClick={onThumbClick}
          pad={false}
          className="!w-full !h-full grid grid-cols-2 !grid-rows-1 gap-[2px]"
        />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key={padded.join('|')}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="absolute inset-0"
      >
        <motion.div variants={itemVariants} className="w-full h-full">
          <MarketingThumbnailStack
            images={padded}
            onThumbClick={onThumbClick}
            pad={false}
            className="!w-full !h-full grid grid-cols-2 !grid-rows-1 gap-[2px]"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
// DocBox: hover-driven detailed view (formerly EducationCard)
// Replicates AssetPack and evidence-document header visual/animation language
