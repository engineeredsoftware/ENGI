/**
 * Education copy panel for acceleration feature hover state.
 */
"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export function MarketingAccelerationDocBox({ content, className = '' }: { className: string, content: { title: string; subtitle?: string; body: string } | null }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`w-full h-full ` + className}
      initial={false}
      animate={prefersReducedMotion ? undefined : { opacity: content ? 1 : 0, scale: content ? 1 : 0.97 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.3, ease: [0.23, 1, 0.32, 1], scale: { duration: 0.4 } }}
    >
      <motion.div
        className="relative rounded-lg border border-emerald-500/20 bg-black/40 backdrop-blur-sm p-4 overflow-hidden h-full w-full"
        animate={{ boxShadow: content ? '0 0 25px rgba(186, 84, 236, 0.05)' : '0 0 0 rgba(186, 84, 236, 0)' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Ambient glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"
          animate={prefersReducedMotion ? undefined : { opacity: content ? 1 : 0, scale: content ? 1 : 1.1 }}
          transition={prefersReducedMotion ? undefined : { duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        />

        <div className="relative h-full">
          <AnimatePresence mode="sync">
            {content && (
              <motion.div
                key={content.title + (content.subtitle || '')}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 15, scale: 0.97 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -15, scale: 0.97 }}
                transition={prefersReducedMotion ? undefined : { duration: 0.3, ease: [0.23, 1, 0.32, 1], opacity: { duration: 0.2 }, scale: { duration: 0.3 } }}
                className="absolute inset-0 space-y-0 tablet:space-y-2"
              >
                <div className="flex justify-between items-start">
                  <motion.h3
                    className="hidden tablet:block text-purple-300 font-medium text-base"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {content.title}
                  </motion.h3>
                  {content.subtitle && (
                    <motion.p
                      className="text-gray-400 text-xs font-medium ml-2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                    >
                      {content.subtitle}
                    </motion.p>
                  )}
                </div>
                <motion.p
                  className="text-gray-300 text-[13px] tablet:text-sm laptop:text-base leading-relaxed mt-0 tablet:mt-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {content.body}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
          <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500/20 rounded-full" />
          <div className="absolute top-2 right-6 w-1 h-1 bg-purple-500/10 rounded-full" />
        </div>
      </motion.div>
    </motion.div>
  );
}

