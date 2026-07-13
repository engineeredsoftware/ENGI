/**
 * Education / crush copy panel for competitor table column hover.
 */
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function MarketingCompetitorDocBox({
  content,
}: {
  content:
  | {
    title: string;
    subtitle?: string;
    body: string;
  }
  | null;
}) {
  return (
    <motion.div
      className="w-full h-full"
      initial={false}
      animate={{ opacity: content ? 1 : 0, scale: content ? 1 : 0.97 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1], scale: { duration: 0.4 } }}
    >
      <motion.div
        /*
         * Keep the internal card height consistent while the content swaps so
         * Framer-motion doesn’t have to recalc layout on every hover.  This was
         * already the case in the source header components but was
         * accidentally stripped when we copied the component into the
         * marketing competitors section, which resulted in a small ‘jump’ /
         * flicker mid-transition. Restoring the fixed height plus absolute
         * positioning brings the behaviour back in line with the original
         * implementation.
         */
        className="relative h-full rounded-lg border border-brand-emerald-glow-subtle bg-black/40 backdrop-blur-sm p-4 overflow-hidden"
        animate={{
          boxShadow: content ? "0 0 25px theme(colors.brand.purple-glow)" : "0 0 0 theme(colors.brand.purple-glow)",
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Ambient glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-brand-purple-glow/20 to-transparent"
          animate={{ opacity: content ? 1 : 0, scale: content ? 1 : 1.1 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        />

        <div className="relative h-full">
          <AnimatePresence mode="sync">
            {content && (
              <motion.div
                key={content.title + (content.subtitle || "")}
                initial={{ opacity: 0, y: 15, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.97 }}
                transition={{
                  duration: 0.3,
                  ease: [0.23, 1, 0.32, 1],
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.3 },
                }}
                className="absolute inset-0 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <motion.h3
                    className="text-brand-purple font-medium text-base"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {content.title}
                  </motion.h3>
                  {content.subtitle && (
                    <motion.p
                      className="text-gray-400 text-sm font-medium ml-2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                    >
                      {content.subtitle}
                    </motion.p>
                  )}
                </div>
                <motion.p
                  className="text-gray-300 text-base leading-relaxed mt-4"
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
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Bitcode Advantage Card                                                     */
/* -------------------------------------------------------------------------- */

