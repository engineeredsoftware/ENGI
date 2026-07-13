/**
 * Highlighted Bitcode advantage card shown with the competitor matrix.
 */
import React from 'react';
import { motion } from 'framer-motion';
import type { CrushCopy } from './marketing-competitor-table-data';

export function MarketingBitcodeAdvantageCard({
  content,
  variant = 'excellence',
}: {
  // never null – we always pass some copy
  content: CrushCopy;
  variant?: 'excellence' | 'elimination';
}) {
  const isElimination = variant === 'elimination';
  const borderClass = isElimination
    ? 'border-red-500/25'
    : 'border-brand-emerald-glow-subtle';
  const bgClass = isElimination
    ? 'bg-red-500/5'
    : 'bg-brand-emerald-glow-subtle/20';
  const gradientClass = isElimination
    ? 'from-red-500/10'
    : 'from-brand-emerald-glow-subtle/40';
  const headlineColorClass = isElimination ? 'text-red-400' : 'text-brand-emerald';

  return (
    <motion.div
      className="w-full h-full"
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1], scale: { duration: 0.4 } }}
    >
      <motion.div
        className={`relative rounded-lg border ${borderClass} ${bgClass} backdrop-blur-sm p-4 overflow-hidden h-full w-full z-10`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
      >
        {/* Ambient glow */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${gradientClass} to-transparent pointer-events-none`}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        <div className="relative h-full flex flex-col justify-start space-y-2">
          {/* Headline */}
          <motion.h3
            key={content.headline}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.35 }}
            className={`${headlineColorClass} font-medium text-base`}
          >
            {content.headline}
          </motion.h3>

          {/* Bullet list */}
          <motion.ul
            key={content.headline + '-list'}
            initial="hidden"
            animate="show"
            exit="exit"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.06, delayChildren: 0.05 },
              },
              exit: {
                transition: { staggerChildren: 0.04, staggerDirection: -1 },
              },
            }}
            className="space-y-1 text-gray-300 text-base"
          >
            {content.points.map((p) => (
              <motion.li
                key={p}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
                  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
                }}
                className="flex items-start"
              >
                {isElimination ? (
                  <XCircleIcon className="w-3.5 h-3.5 mr-2 text-red-400 flex-shrink-0 mt-[2px]" />
                ) : (
                  <CheckCircleIcon className="w-3.5 h-3.5 mr-2 text-brand-emerald flex-shrink-0 mt-[2px]" />
                )}
                <span>{p}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

