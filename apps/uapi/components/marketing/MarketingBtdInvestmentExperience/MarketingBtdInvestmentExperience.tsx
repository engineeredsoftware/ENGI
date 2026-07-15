'use client';

/**
 * Interactive BTD investment value experience for marketing.
 * Calculations and coaching helpers are co-located pure modules.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  getEstimatedBtd,
  getActualBtd,
  calculateFitValueMultiplier,
  generateEfficiencyCoaching,
  VISUAL_SIGNAL_QUALITY,
  type BtdInvestment,
  type BtdInvestmentExperienceProps,
  type ValueVisualization,
  type EfficiencyCoaching,
} from './marketing-btd-investment-helpers';
import { MarketingBtdValuePanel } from './MarketingBtdValuePanel';
import { MarketingBtdCoachingPanel } from './MarketingBtdCoachingPanel';
import { MarketingBtdProjectionPanel } from './MarketingBtdProjectionPanel';


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
        <MarketingBtdValuePanel
          valueVisualization={valueVisualization}
          selectedTimeframe={selectedTimeframe}
          onSelectTimeframe={setSelectedTimeframe}
          animatingValue={animatingValue}
          enhancementGlow={enhancementGlow}
        />
      )}
      
      {/* Efficiency Coaching Insight */}
      <MarketingBtdCoachingPanel
        show={showCoachingInsight && showEfficiencyCoaching}
        coaching={efficiencyCoaching}
      />
      
      {/* Upcoming Read Projection */}
      {showROIProjections && projectedNeed && (
        <MarketingBtdProjectionPanel
          projectedNeed={projectedNeed}
          projectedUpcomingBtd={projectedUpcomingBtd}
          valueVisualization={valueVisualization}
          enhancementGlow={enhancementGlow}
        />
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
