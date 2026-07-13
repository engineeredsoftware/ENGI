'use client';

/**
 * BTD holding value visualization panel (metrics, efficiency, pattern mastery).
 */

import React from "react";
import { motion } from "framer-motion";
import type { ValueVisualization } from "./marketing-btd-investment-helpers";

export interface MarketingBtdValuePanelProps {
  valueVisualization: ValueVisualization;
  selectedTimeframe: "week" | "month" | "quarter";
  onSelectTimeframe: (timeframe: "week" | "month" | "quarter") => void;
  animatingValue: number;
  enhancementGlow: number;
}

export function MarketingBtdValuePanel({
  valueVisualization,
  selectedTimeframe,
  onSelectTimeframe,
  animatingValue,
  enhancementGlow,
}: MarketingBtdValuePanelProps) {
  return (
    <motion.div
      className="mb-4 pointer-events-auto"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div
        className="bg-gradient-to-br from-emerald-900/95 to-teal-900/95 backdrop-blur-xl
                   border border-emerald-400/30 rounded-xl p-4 w-80 shadow-2xl"
        style={{
          boxShadow: `0 0 40px rgba(16, 185, 129, ${enhancementGlow * 0.5}),
                     0 20px 40px -10px rgba(0, 0, 0, 0.6)`,
          filter: `drop-shadow(0 0 ${enhancementGlow * 15}px rgba(16, 185, 129, 0.6))`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-emerald-100 text-lg font-medium flex items-center space-x-2">
            <span>💰</span>
            <span>BTD Holding Signal</span>
          </h3>

          <div className="flex space-x-1">
            {(["week", "month", "quarter"] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => onSelectTimeframe(timeframe)}
                className={`px-2 py-1 text-xs rounded transition-all duration-200 ${
                  selectedTimeframe === timeframe
                    ? "bg-emerald-600/40 text-emerald-100"
                    : "bg-emerald-800/20 text-emerald-300 hover:bg-emerald-800/40"
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="text-xs text-emerald-300">Measured $BTD</div>
            <div className="text-xl font-bold text-emerald-100">
              {valueVisualization.totalInvested.toLocaleString()} $BTD
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-emerald-300">Fit Value</div>
            <div className="text-xl font-bold text-emerald-100">
              <motion.span
                key={animatingValue}
                initial={{ scale: 1.2, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(animatingValue).toLocaleString()} $BTD
              </motion.span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-emerald-300">Value Delta</div>
            <div
              className={`text-lg font-bold ${
                valueVisualization.roi > 0
                  ? "text-green-400"
                  : valueVisualization.roi < 0
                    ? "text-red-400"
                    : "text-emerald-100"
              }`}
            >
              {(valueVisualization.roi * 100).toFixed(1)}%
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-emerald-300">High-Fit Runs</div>
            <div className="text-lg font-bold text-yellow-400 flex items-center space-x-1">
              <span>✨</span>
              <span>{valueVisualization.highFitMoments}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-emerald-300">Efficiency Trend</div>
          <div className="flex items-end space-x-1 h-8">
            {valueVisualization.efficiencyTrend.map((efficiency, index) => (
              <motion.div
                key={index}
                className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-sm"
                style={{
                  height: `${Math.min(efficiency * 50, 100)}%`,
                  opacity: 0.6 + efficiency * 0.4,
                }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.min(efficiency * 50, 100)}%` }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-emerald-300">Pattern Mastery</span>
            <span className="text-emerald-100">
              {Math.round(valueVisualization.patternMastery * 100)}%
            </span>
          </div>
          <div className="w-full bg-emerald-900/50 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
              style={{
                boxShadow: `0 0 8px rgba(16, 185, 129, ${enhancementGlow})`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${valueVisualization.patternMastery * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
