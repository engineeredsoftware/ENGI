/**
 * BTD investment types, value multipliers, and efficiency coaching helpers.
 */
export interface BtdInvestment {
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

export interface ValueVisualization {
  totalInvested: number;
  totalReturned: number;
  roi: number; // Fit-value delta over measured BTD
  efficiencyTrend: number[]; // Last 10 investments
  learningAcceleration: number; // 0-1
  patternMastery: number; // 0-1
  highFitMoments: number; // Count of exceptional high-fit runs
  extendedValue: number; // Higher-order value beyond raw measured-BTD volume
}

export interface EfficiencyCoaching {
  insight: string;
  suggestion: string;
  potentialSavings: number;
  fitGuidance: string;
  guidanceLevel: 'baseline' | 'steady' | 'elevated' | 'critical';
}

export interface BtdInvestmentExperienceProps {
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

export const getEstimatedBtd = (investment: BtdInvestment): number =>
  investment.measuredBtdEstimate;

export const getActualBtd = (investment: BtdInvestment): number =>
  investment.measuredBtd;

// Value-multiplier formulas for measured-BTD efficiency.
export const calculateFitValueMultiplier = (investment: BtdInvestment): number => {
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
export const generateEfficiencyCoaching = (
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
export const VISUAL_SIGNAL_QUALITY = (() => {
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

