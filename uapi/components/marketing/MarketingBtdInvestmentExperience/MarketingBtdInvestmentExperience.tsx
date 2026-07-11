'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BtdInvestment {
  id: string;
  assetPackName?: string;
  measuredBtdEstimate: number;
  measuredBtd: number;
  efficiency: number; // 0-1, calculated as measuredBtdEstimate / measuredBtd
  timeSpent: number; // in seconds
  complexity: 'simple' | 'moderate' | 'complex' | 'epic';
  category: 'component' | 'service' | 'feature' | 'refactor' | 'test' | 'documentation';
  patterns: string[];
  learningValue: number; // 0-1
  reuseablilityPotential: number; // 0-1
  businessImpact: number; // 0-1
  fitValueMultiplier: number; // 1-3, value multiplier for exceptional efficiency
  timestamp: Date;
}

interface ValueVisualization {
  totalInvested: number;
  totalReturned: number;
  roi: number; // Fit-value delta over measured BTD
  efficiencyTrend: number[]; // Last 10 investments
  learningAcceleration: number; // 0-1
  patternMastery: number; // 0-1
  highFitMoments: number; // Count of exceptional high-fit runs
  extendedValue: number; // Higher-order value beyond raw measured-BTD volume
}

interface EfficiencyCoaching {
  insight: string;
  suggestion: string;
  potentialSavings: number;
  fitGuidance: string;
  guidanceLevel: 'baseline' | 'steady' | 'elevated' | 'critical';
}

interface BtdInvestmentExperienceProps {
  /** Recent measured-BTD allocations */
  investments: BtdInvestment[];
  
  /** Current BTD balance */
  currentBalance: number;
  
  /** Upcoming Read/AssetPack estimation. */
  upcomingNeed?: {
    name: string;
    measuredBtdEstimate: number;
    complexity: string;
    patterns: string[];
  };
  
  /** User's measured-BTD allocation patterns */
  investmentPatterns?: {
    averageEfficiency: number;
    preferredComplexity: string;
    riskTolerance: 'conservative' | 'balanced' | 'aggressive';
    learningFocus: string[];
  };
  
  /** Show different visualization modes */
  showValueVisualization?: boolean;
  showEfficiencyCoaching?: boolean;
  showFitInsights?: boolean;
  showROIProjections?: boolean;
  
  /** Visual enhancement level */
  visualIntensity?: 'minimal' | 'standard' | 'rich' | 'maximum';
  
  /** Performance controls */
  respectReducedMotion?: boolean;
  
  /** Callbacks */
  onInvestmentOptimized?: (optimization: EfficiencyCoaching) => void;
  onHighFitMoment?: (moment: string) => void;
  onValueInsight?: (insight: string) => void;
  onBtdProjection?: (projection: number) => void;
}

const getEstimatedBtd = (investment: BtdInvestment): number =>
  investment.measuredBtdEstimate;

const getActualBtd = (investment: BtdInvestment): number =>
  investment.measuredBtd;

// Value-multiplier formulas for measured-BTD efficiency.
const calculateFitValueMultiplier = (investment: BtdInvestment): number => {
  let multiplier = 1;
  
  // Efficiency bonus
  if (investment.efficiency > 1.5) multiplier += 0.8; // Measured 50% below estimate
  else if (investment.efficiency > 1.2) multiplier += 0.5; // Measured 20% below estimate
  else if (investment.efficiency > 1.0) multiplier += 0.2; // Measured at or below estimate
  
  // Learning value bonus
  multiplier += investment.learningValue * 0.5;
  
  // Reusability bonus
  multiplier += investment.reuseablilityPotential * 0.3;
  
  // Business impact bonus
  multiplier += investment.businessImpact * 0.4;
  
  // Complexity achievement bonus
  if (investment.complexity === 'epic' && investment.efficiency > 1.0) multiplier += 0.6;
  else if (investment.complexity === 'complex' && investment.efficiency > 1.2) multiplier += 0.4;
  
  return Math.min(multiplier, 3); // Cap at 3x
};

// Generate efficiency coaching insights
const generateEfficiencyCoaching = (
  investments: BtdInvestment[],
  patterns: any
): EfficiencyCoaching => {
  const recentInvestments = investments.slice(-10);
  const avgEfficiency = recentInvestments.reduce((sum, inv) => sum + inv.efficiency, 0) / recentInvestments.length;
  
  // Analyze patterns for insights
  const inefficientCategories = recentInvestments
    .filter(inv => inv.efficiency < 0.8)
    .reduce((acc, inv) => {
      acc[inv.category] = (acc[inv.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const topInefficient = Object.entries(inefficientCategories)
    .sort(([,a], [,b]) => b - a)[0];
  
  let insight = '';
  let suggestion = '';
  let potentialSavings = 0;
  let guidanceLevel: EfficiencyCoaching['guidanceLevel'] = 'baseline';
  let fitGuidance = '';
  
  if (avgEfficiency < 0.7) {
    insight = 'Recent AssetPack runs are measuring above their expected $BTD range';
    suggestion = 'Focus on smaller, well-defined Reads to build momentum and confidence';
    potentialSavings = Math.round(
      recentInvestments.reduce((sum, inv) => sum + (getActualBtd(inv) - getEstimatedBtd(inv)), 0) * 0.3
    );
    guidanceLevel = 'critical';
    fitGuidance = 'Tighten Read scope before attempting broader AssetPack synthesis.';
  } else if (avgEfficiency < 0.9) {
    insight = `Pattern detected: ${topInefficient?.[0] || 'certain types'} of work measuring above expectation`;
    suggestion = `Consider breaking down ${topInefficient?.[0] || 'complex'} Reads into smaller, more predictable components`;
    potentialSavings = Math.round(
      recentInvestments.reduce((sum, inv) => sum + Math.max(0, getActualBtd(inv) - getEstimatedBtd(inv)), 0) * 0.2
    );
    guidanceLevel = 'elevated';
    fitGuidance = 'Precise Read framing improves measured-BTD predictability.';
  } else if (avgEfficiency > 1.3) {
    insight = 'Exceptional measured-BTD efficiency detected across recent AssetPacks';
    suggestion = 'Consider taking on more complex challenges to maximize your validated capabilities';
    potentialSavings = 0;
    guidanceLevel = 'critical';
    fitGuidance = 'Use this efficiency window to attempt more complex Reads.';
  } else {
    insight = 'Your measured-BTD allocation pattern is balanced and improving';
    suggestion = 'Continue current practices while watching for optimization opportunities';
    potentialSavings = Math.round(
      recentInvestments.reduce((sum, inv) => sum + Math.max(0, getActualBtd(inv) - getEstimatedBtd(inv)), 0) * 0.1
    );
    guidanceLevel = 'steady';
    fitGuidance = 'Steady fit-quality improvement compounds across AssetPacks.';
  }
  
  return {
    insight,
    suggestion,
    potentialSavings,
    fitGuidance,
    guidanceLevel
  };
};

// Device capability detection for visual effects.
const VISUAL_SIGNAL_QUALITY = (() => {
  if (typeof navigator === 'undefined') return 1;
  
  const mem = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const hour = new Date().getHours();
  
  if (reducedMotion) return 0.3;
  
  // Enhanced visual effects during peak creativity hours.
  const isCreativeHour = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16) || (hour >= 20 && hour <= 22);
  const timeMultiplier = isCreativeHour ? 1.2 : 1;
  
  const lowSpec = (mem && mem <= 4) || (cores && cores <= 4);
  return (lowSpec ? 0.6 : 1) * timeMultiplier;
})();

export const MarketingBtdInvestmentExperience = ({
  investments,
  currentBalance,
  upcomingNeed,
  investmentPatterns,
  showValueVisualization = true,
  showEfficiencyCoaching = true,
  showFitInsights = true,
  showROIProjections = true,
  visualIntensity = 'rich',
  respectReducedMotion = true,
  onInvestmentOptimized,
  onHighFitMoment,
  onValueInsight,
  onBtdProjection
}: BtdInvestmentExperienceProps) => {
  const projectedNeed = upcomingNeed;
  const projectedUpcomingBtd = projectedNeed?.measuredBtdEstimate ?? null;

  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [showCoachingInsight, setShowCoachingInsight] = useState(false);
  const [fitParticles, setFitParticles] = useState<Array<{
    id: string;
    x: number;
    y: number;
    symbol: string;
    color: string;
    value: number;
  }>>([]);
  const [animatingValue, setAnimatingValue] = useState(0);
  
  const coachingTimeoutRef = useRef<NodeJS.Timeout>();
  const particleIntervalRef = useRef<NodeJS.Timeout>();
  
  // Calculate value visualization metrics
  const valueVisualization = useMemo((): ValueVisualization => {
    const timeframeDays = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 90;
    const cutoffDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);
    const relevantInvestments = investments.filter(inv => inv.timestamp >= cutoffDate);
    
    const totalInvested = relevantInvestments.reduce((sum, inv) => sum + getActualBtd(inv), 0);
    
    // Calculate fit value over measured-BTD allocations.
    const totalReturned = relevantInvestments.reduce((sum, inv) => {
      const baseValue = getActualBtd(inv);
      const learningValue = baseValue * inv.learningValue * 0.5;
      const reuseValue = baseValue * inv.reuseablilityPotential * 0.3;
      const businessValue = baseValue * inv.businessImpact * 0.7;
      const fitValueBonus = baseValue * (inv.fitValueMultiplier - 1);
      
      return sum + baseValue + learningValue + reuseValue + businessValue + fitValueBonus;
    }, 0);
    
    const roi = totalInvested > 0 ? (totalReturned - totalInvested) / totalInvested : 0;
    
    const efficiencyTrend = relevantInvestments.slice(-10).map(inv => inv.efficiency);
    
    const learningAcceleration = relevantInvestments.reduce((sum, inv) => sum + inv.learningValue, 0) / relevantInvestments.length || 0;
    
    const patternMastery = relevantInvestments.reduce((sum, inv) => {
      const masteryScore = inv.patterns.length * inv.efficiency * inv.learningValue;
      return sum + masteryScore;
    }, 0) / (relevantInvestments.length * 10) || 0; // Normalize to 0-1
    
    const highFitMoments = relevantInvestments.filter(inv => inv.fitValueMultiplier > 2).length;
    
    const extendedValue = relevantInvestments.reduce((sum, inv) => {
      return sum + (inv.learningValue + inv.reuseablilityPotential + inv.businessImpact) * inv.fitValueMultiplier;
    }, 0);
    
    return {
      totalInvested,
      totalReturned,
      roi,
      efficiencyTrend,
      learningAcceleration,
      patternMastery,
      highFitMoments,
      extendedValue
    };
  }, [investments, selectedTimeframe]);
  
  // Generate efficiency coaching
  const efficiencyCoaching = useMemo(() => 
    generateEfficiencyCoaching(investments, investmentPatterns), 
    [investments, investmentPatterns]
  );
  
  // Generate particles for value visualization.
  const generateFitParticles = useCallback(() => {
    if (visualIntensity === 'minimal' || VISUAL_SIGNAL_QUALITY < 0.5) return;
    
    const recentInvestments = investments.slice(-5);
    const particles = recentInvestments.map((investment, index) => ({
      id: `particle-${investment.id}`,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      symbol: investment.efficiency > 1.5 ? '💎' : 
              investment.efficiency > 1.2 ? '✨' :
              investment.efficiency > 1.0 ? '💫' : '⚡',
      color: investment.efficiency > 1.5 ? '#f59e0b' : 
             investment.efficiency > 1.2 ? '#8b5cf6' :
             investment.efficiency > 1.0 ? '#10b981' : '#06b6d4',
      value: getActualBtd(investment)
    }));
    
    setFitParticles(particles);
  }, [investments, visualIntensity]);
  
  // Animate value counters
  useEffect(() => {
    if (!showValueVisualization) return;
    
    const targetValue = valueVisualization.totalReturned;
    const duration = 2000;
    const steps = 60;
    const increment = targetValue / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnimatingValue(increment * currentStep);
      
      if (currentStep >= steps) {
        setAnimatingValue(targetValue);
        clearInterval(interval);
      }
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, [valueVisualization.totalReturned, showValueVisualization]);
  
  // Efficiency coaching display
  useEffect(() => {
    if (!showEfficiencyCoaching) return;
    
    setShowCoachingInsight(true);
    onInvestmentOptimized?.(efficiencyCoaching);
    
    coachingTimeoutRef.current = setTimeout(() => {
      setShowCoachingInsight(false);
    }, 8000);
    
    return () => {
      if (coachingTimeoutRef.current) clearTimeout(coachingTimeoutRef.current);
    };
  }, [efficiencyCoaching, showEfficiencyCoaching, onInvestmentOptimized]);
  
  // Value particle generation.
  useEffect(() => {
    if (!showFitInsights) return;
    
    generateFitParticles();
    
    particleIntervalRef.current = setInterval(() => {
      generateFitParticles();
    }, 5000);
    
    return () => {
      if (particleIntervalRef.current) clearInterval(particleIntervalRef.current);
    };
  }, [generateFitParticles, showFitInsights]);
  
  // High-fit run detection.
  useEffect(() => {
    const exceptionalInvestments = investments.filter(inv => inv.fitValueMultiplier > 2);
    if (exceptionalInvestments.length > 0) {
      const latestHighFit = exceptionalInvestments[exceptionalInvestments.length - 1];
      onHighFitMoment?.(`High-fit AssetPack recorded for ${latestHighFit.assetPackName || 'AssetPack'}: ${latestHighFit.fitValueMultiplier.toFixed(1)}x value multiplier`);
    }
  }, [investments, onHighFitMoment]);

  useEffect(() => {
    if (projectedUpcomingBtd === null) return;
    onBtdProjection?.(projectedUpcomingBtd);
  }, [onBtdProjection, projectedUpcomingBtd]);
  
  // Calculate visual enhancement factor.
  const visualEnhancement = visualIntensity === 'maximum' ? 1.0 :
                            visualIntensity === 'rich' ? 0.8 :
                            visualIntensity === 'standard' ? 0.6 : 0.3;
  
  const enhancementGlow = VISUAL_SIGNAL_QUALITY * visualEnhancement;
  
  return (
    <div className="btd-holding-experience fixed bottom-6 right-6 z-30 pointer-events-none">
      {/* Value Visualization Panel */}
      {showValueVisualization && (
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
              filter: `drop-shadow(0 0 ${enhancementGlow * 15}px rgba(16, 185, 129, 0.6))`
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-emerald-100 text-lg font-medium flex items-center space-x-2">
                <span>💰</span>
                <span>BTD Holding Signal</span>
              </h3>
              
              <div className="flex space-x-1">
                {(['week', 'month', 'quarter'] as const).map(timeframe => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-2 py-1 text-xs rounded transition-all duration-200 ${
                      selectedTimeframe === timeframe
                        ? 'bg-emerald-600/40 text-emerald-100'
                        : 'bg-emerald-800/20 text-emerald-300 hover:bg-emerald-800/40'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Measured-BTD metrics */}
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
                <div className={`text-lg font-bold ${
                  valueVisualization.roi > 0 ? 'text-green-400' : 
                  valueVisualization.roi < 0 ? 'text-red-400' : 'text-emerald-100'
                }`}>
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
            
            {/* Efficiency trend */}
            <div className="space-y-2">
              <div className="text-xs text-emerald-300">Efficiency Trend</div>
              <div className="flex items-end space-x-1 h-8">
                {valueVisualization.efficiencyTrend.map((efficiency, index) => (
                  <motion.div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-sm"
                    style={{ 
                      height: `${Math.min(efficiency * 50, 100)}%`,
                      opacity: 0.6 + (efficiency * 0.4)
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(efficiency * 50, 100)}%` }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
              </div>
            </div>
            
            {/* Pattern mastery progress */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-300">Pattern Mastery</span>
                <span className="text-emerald-100">{Math.round(valueVisualization.patternMastery * 100)}%</span>
              </div>
              <div className="w-full bg-emerald-900/50 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
                  style={{
                    boxShadow: `0 0 8px rgba(16, 185, 129, ${enhancementGlow})`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${valueVisualization.patternMastery * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Efficiency Coaching Insight */}
      <AnimatePresence>
        {showCoachingInsight && showEfficiencyCoaching && (
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
                ${efficiencyCoaching.guidanceLevel === 'critical' ? 
                  'bg-gradient-to-br from-purple-900/95 to-pink-900/95 border-purple-400/40' :
                efficiencyCoaching.guidanceLevel === 'elevated' ?
                  'bg-gradient-to-br from-yellow-900/95 to-orange-900/95 border-yellow-400/40' :
                efficiencyCoaching.guidanceLevel === 'steady' ?
                  'bg-gradient-to-br from-blue-900/95 to-cyan-900/95 border-blue-400/40' :
                  'bg-gradient-to-br from-gray-900/95 to-slate-900/95 border-gray-400/40'
                }
              `}
              style={{
                boxShadow: `0 0 30px ${
                  efficiencyCoaching.guidanceLevel === 'critical' ? 'rgba(147, 51, 234, 0.5)' :
                  efficiencyCoaching.guidanceLevel === 'elevated' ? 'rgba(245, 158, 11, 0.5)' :
                  efficiencyCoaching.guidanceLevel === 'steady' ? 'rgba(59, 130, 246, 0.5)' :
                  'rgba(107, 114, 128, 0.3)'
                }`
              }}
            >
              <div className="flex items-start space-x-3">
                <div 
                  className="text-2xl animate-pulse"
                  style={{
                    filter: `drop-shadow(0 0 8px ${
                      efficiencyCoaching.guidanceLevel === 'critical' ? '#a855f7' :
                      efficiencyCoaching.guidanceLevel === 'elevated' ? '#f59e0b' :
                      efficiencyCoaching.guidanceLevel === 'steady' ? '#3b82f6' : '#6b7280'
                    })`
                  }}
                >
                  {efficiencyCoaching.guidanceLevel === 'critical' ? '🔮' :
                   efficiencyCoaching.guidanceLevel === 'elevated' ? '⭐' :
                   efficiencyCoaching.guidanceLevel === 'steady' ? '💫' : '✨'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white mb-2">
                    Efficiency Guidance
                  </div>
                  <div className="text-sm text-gray-200 leading-relaxed mb-3">
                    {efficiencyCoaching.insight}
                  </div>
                  <div className="text-sm text-gray-300 mb-3">
                    <strong>Suggestion:</strong> {efficiencyCoaching.suggestion}
                  </div>
                  {efficiencyCoaching.potentialSavings > 0 && (
                    <div className="text-sm text-green-400 mb-3">
                      <strong>Potential measured-BTD reduction:</strong> {efficiencyCoaching.potentialSavings} $BTD
                    </div>
                  )}
                  <div className="text-sm italic text-purple-300 border-l-2 border-purple-400/30 pl-3">
                    {efficiencyCoaching.fitGuidance}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Upcoming Read Projection */}
      {showROIProjections && projectedNeed && (
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
              boxShadow: `0 0 25px rgba(99, 102, 241, ${enhancementGlow * 0.4})`
            }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">◇</span>
              <h4 className="text-indigo-100 font-medium">Read Measurement Projection</h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs text-indigo-300">Next Read</div>
                <div className="text-sm font-medium text-indigo-100">
                  {projectedNeed.name}
                </div>
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
                      : 'n/a'}{' '}
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
      )}
      
      {/* Fit-value particles */}
      {showFitInsights && visualIntensity !== 'minimal' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {fitParticles.map(particle => (
              <motion.div
                key={particle.id}
                className="absolute text-lg opacity-60"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  color: particle.color,
                  textShadow: `0 0 8px ${particle.color}`,
                  filter: `drop-shadow(0 0 4px ${particle.color})`
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 0.6, 
                  scale: [1, 1.2, 1],
                  y: [0, -20, -40]
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  duration: 3,
                  scale: { repeat: Infinity, duration: 2 },
                  y: { duration: 3, ease: "easeOut" }
                }}
              >
                {particle.symbol}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Current Balance Display */}
      <motion.div
        className="pointer-events-auto"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div 
          className="bg-gradient-to-r from-green-900/95 to-emerald-900/95 backdrop-blur-xl 
                     border border-green-400/30 rounded-lg px-4 py-3 text-center"
          style={{
            boxShadow: `0 0 20px rgba(34, 197, 94, ${enhancementGlow * 0.4})`
          }}
        >
          <div className="text-xs text-green-300 mb-1">$BTD Holdings</div>
          <div className="text-2xl font-bold text-green-100 flex items-center justify-center space-x-2">
            <span>💎</span>
            <span>{currentBalance.toLocaleString()}</span>
          </div>
          {valueVisualization.roi > 0 && (
            <div className="text-xs text-green-400 mt-1">
              +{(valueVisualization.roi * 100).toFixed(1)}% value-delta trend
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MarketingBtdInvestmentExperience;
