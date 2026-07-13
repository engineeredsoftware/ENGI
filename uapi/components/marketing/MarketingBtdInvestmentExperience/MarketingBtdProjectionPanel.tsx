/**
 * Upcoming Read measurement projection panel for BTD investment experience.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import type { ValueVisualization } from "./marketing-btd-investment-helpers";

export interface MarketingBtdProjectionPanelProps {
  projectedNeed: { name: string; measuredBtdEstimate: number };
  projectedUpcomingBtd: number | null;
  valueVisualization: ValueVisualization;
  enhancementGlow: number;
}

export function MarketingBtdProjectionPanel({
  projectedNeed,
  projectedUpcomingBtd,
  valueVisualization,
  enhancementGlow,
}: MarketingBtdProjectionPanelProps) {
  return (
    <motion.div
      className="mb-4 pointer-events-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div
        className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-xl
                   border border-indigo-400/30 rounded-xl p-4 w-80"
        style={{
          boxShadow: `0 0 25px rgba(99, 102, 241, ${enhancementGlow * 0.4})`,
        }}
      >
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl">◇</span>
          <h4 className="text-indigo-100 font-medium">Read Measurement Projection</h4>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-indigo-300">Next Read</div>
            <div className="text-sm font-medium text-indigo-100">{projectedNeed.name}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-indigo-300">Measured $BTD Estimate</div>
              <div className="text-lg font-bold text-indigo-100">
                {projectedUpcomingBtd} $BTD
              </div>
            </div>

            <div>
              <div className="text-xs text-indigo-300">Projected Fit Value</div>
              <div className="text-lg font-bold text-green-400">
                {projectedUpcomingBtd !== null
                  ? Math.round(projectedUpcomingBtd * (1 + valueVisualization.roi))
                  : "n/a"}{" "}
                $BTD
              </div>
            </div>
          </div>

          <div className="text-xs text-indigo-300">
            Based on your {(valueVisualization.roi * 100).toFixed(1)}% average value delta
          </div>
        </div>
      </div>
    </motion.div>
  );
}
