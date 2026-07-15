'use client';

/**
 * Efficiency coaching insight panel for BTD investment experience.
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EfficiencyCoaching } from "./marketing-btd-investment-helpers";

export interface MarketingBtdCoachingPanelProps {
  show: boolean;
  coaching: EfficiencyCoaching;
}

export function MarketingBtdCoachingPanel({
  show,
  coaching,
}: MarketingBtdCoachingPanelProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="mb-4 pointer-events-auto"
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className={`
              backdrop-blur-xl rounded-xl p-4 w-80 border
              ${
                coaching.guidanceLevel === "critical"
                  ? "bg-gradient-to-br from-purple-900/95 to-pink-900/95 border-purple-400/40"
                  : coaching.guidanceLevel === "elevated"
                    ? "bg-gradient-to-br from-yellow-900/95 to-orange-900/95 border-yellow-400/40"
                    : coaching.guidanceLevel === "steady"
                      ? "bg-gradient-to-br from-blue-900/95 to-cyan-900/95 border-blue-400/40"
                      : "bg-gradient-to-br from-gray-900/95 to-slate-900/95 border-gray-400/40"
              }
            `}
            style={{
              boxShadow: `0 0 30px ${
                coaching.guidanceLevel === "critical"
                  ? "rgba(147, 51, 234, 0.5)"
                  : coaching.guidanceLevel === "elevated"
                    ? "rgba(245, 158, 11, 0.5)"
                    : coaching.guidanceLevel === "steady"
                      ? "rgba(59, 130, 246, 0.5)"
                      : "rgba(107, 114, 128, 0.3)"
              }`,
            }}
          >
            <div className="flex items-start space-x-3">
              <div
                className="text-2xl animate-pulse"
                style={{
                  filter: `drop-shadow(0 0 8px ${
                    coaching.guidanceLevel === "critical"
                      ? "#a855f7"
                      : coaching.guidanceLevel === "elevated"
                        ? "#f59e0b"
                        : coaching.guidanceLevel === "steady"
                          ? "#3b82f6"
                          : "#6b7280"
                  })`,
                }}
              >
                {coaching.guidanceLevel === "critical"
                  ? "🔮"
                  : coaching.guidanceLevel === "elevated"
                    ? "⭐"
                    : coaching.guidanceLevel === "steady"
                      ? "💫"
                      : "✨"}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white mb-2">
                  Efficiency Guidance
                </div>
                <div className="text-sm text-gray-200 leading-relaxed mb-3">
                  {coaching.insight}
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  <strong>Suggestion:</strong> {coaching.suggestion}
                </div>
                {coaching.potentialSavings > 0 && (
                  <div className="text-sm text-green-400 mb-3">
                    <strong>Potential measured-BTD reduction:</strong>{" "}
                    {coaching.potentialSavings} $BTD
                  </div>
                )}
                <div className="text-sm italic text-purple-300 border-l-2 border-purple-400/30 pl-3">
                  {coaching.fitGuidance}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
