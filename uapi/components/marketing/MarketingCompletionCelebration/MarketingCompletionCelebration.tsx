'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompletionMilestone {
  id: string;
  name: string;
  category: 'component' | 'service' | 'test' | 'refactor' | 'feature' | 'bug' | 'documentation';
  complexity: 'simple' | 'moderate' | 'complex' | 'epic';
  timeSpent: number; // in seconds
  measuredBtd: number;
  patterns: string[];
  quality: number; // 0-1
  timestamp: Date;
  achievements?: string[];
}

interface RepositoryContext {
  language?: string;
  architecture?: string;
  testCoverage?: number;
  componentCount?: number;
  totalShippables?: number;
  streakCount?: number;
  qualityAverage?: number;
}

interface CompletionCelebrationProps {
  /** Trigger the celebration with milestone data */
  milestone?: CompletionMilestone;
  
  /** Repository context for intelligent celebration */
  repositoryContext?: RepositoryContext;
  
  /** Show celebration overlay */
  isVisible?: boolean;
  
  /** Callback when celebration completes */
  onCelebrationComplete?: () => void;
  
  /** Callback when user dismisses celebration */
  onDismiss?: () => void;
  
  /** Visual enhancement controls */
  intensityLevel?: 'subtle' | 'moderate' | 'enhanced';
  
  /** Show achievement badges */
  showAchievements?: boolean;
  
  /** Show repository insights */
  showRepositoryInsights?: boolean;
  
  /** Show pattern recognition insights */
  showPatternInsights?: boolean;
  
  /** Performance mode */
  respectReducedMotion?: boolean;
}

// Device capability detection
const CELEBRATION_QUALITY = (() => {
  if (typeof navigator === 'undefined') return 1;
  
  const mem = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  
  if (reducedMotion) return 0.3;
  
  const lowSpec = (mem && mem <= 4) || (cores && cores <= 4);
  return lowSpec ? 0.6 : 1;
})();

const CELEBRATION_MESSAGES = {
  component: [
    "🎨 Beautiful component created!",
    "✨ Component mastery achieved!",
    "🔥 Outstanding component work!",
    "🌟 Component excellence unlocked!"
  ],
  service: [
    "⚡ Service architecture perfected!",
    "🚀 Backend brilliance delivered!",
    "🔧 Service engineering mastery!",
    "💎 Robust service created!"
  ],
  test: [
    "🧪 Testing excellence achieved!",
    "✅ Quality assurance champion!",
    "🎯 Perfect test coverage!",
    "🛡️ Bulletproof testing deployed!"
  ],
  refactor: [
    "🔄 Code transformation complete!",
    "✨ Refactoring mastery unlocked!",
    "🏗️ Architecture improvement achieved!",
    "💫 Code elegance perfected!"
  ],
  feature: [
    "🎉 Feature milestone reached!",
    "🌈 User experience enhanced!",
    "🚀 Innovation delivered!",
    "⭐ Feature excellence achieved!"
  ],
  bug: [
    "🐛 Bug vanquished successfully!",
    "🔥 Problem solving mastery!",
    "🎯 Debug precision achieved!",
    "💪 Code reliability restored!"
  ],
  documentation: [
    "📚 Documentation excellence!",
    "✍️ Knowledge sharing champion!",
    "📖 Clarity and precision achieved!",
    "💡 Developer experience enhanced!"
  ]
};

const ACHIEVEMENT_DEFINITIONS = {
  'first-completion': '🎯 First Completion',
  'speed-demon': '⚡ Speed Demon',
  'quality-champion': '👑 Quality Champion',
  'pattern-master': '🧠 Pattern Master',
  'streak-warrior': '🔥 Streak Warrior',
  'efficiency-guru': '💎 Efficiency Guru',
  'architecture-sage': '🏗️ Architecture Sage',
  'testing-legend': '🧪 Testing Legend',
  'refactor-specialist': '✨ Refactor Specialist',
  'innovation-pioneer': '🚀 Innovation Pioneer'
};

export const MarketingCompletionCelebration = ({
  milestone,
  repositoryContext,
  isVisible = false,
  onCelebrationComplete,
  onDismiss,
  intensityLevel = 'enhanced',
  showAchievements = true,
  showRepositoryInsights = true,
  showPatternInsights = true,
  respectReducedMotion = true
}: CompletionCelebrationProps) => {
  const [celebrationPhase, setCelebrationPhase] = useState<'entering' | 'celebrating' | 'insights' | 'exiting'>('entering');
  const [visibleParticles, setVisibleParticles] = useState<Array<{ id: string; x: number; y: number; delay: number; color: string }>>([]);
  const [achievementBadges, setAchievementBadges] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(false);
  const celebrationRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Calculate achievements based on milestone
  const calculateAchievements = useMemo(() => {
    if (!milestone || !repositoryContext) return [];
    
    const achievements: string[] = [];
    
    // First completion
    if (repositoryContext.totalShippables === 1) {
      achievements.push('first-completion');
    }
    
    // Speed demon (completed quickly)
    if (milestone.timeSpent < 300) { // 5 minutes
      achievements.push('speed-demon');
    }
    
    // Quality champion (high quality score)
    if (milestone.quality >= 0.95) {
      achievements.push('quality-champion');
    }
    
    // Pattern master (multiple patterns recognized)
    if (milestone.patterns.length >= 3) {
      achievements.push('pattern-master');
    }
    
    // Streak warrior (consecutive completions)
    if (repositoryContext.streakCount && repositoryContext.streakCount >= 5) {
      achievements.push('streak-warrior');
    }
    
    // Efficiency guru (low $BTD for complexity)
    if (milestone.complexity === 'complex' && milestone.measuredBtd < 150) {
      achievements.push('efficiency-guru');
    }
    
    // Architecture sage (service/architecture work)
    if (milestone.category === 'service' && milestone.complexity === 'complex') {
      achievements.push('architecture-sage');
    }
    
    // Testing legend (test category with high quality)
    if (milestone.category === 'test' && milestone.quality >= 0.9) {
      achievements.push('testing-legend');
    }
    
    // Refactor specialist (refactor with high quality)
    if (milestone.category === 'refactor' && milestone.quality >= 0.9) {
      achievements.push('refactor-specialist');
    }
    
    // Innovation pioneer (new feature with multiple patterns)
    if (milestone.category === 'feature' && milestone.patterns.length >= 2) {
      achievements.push('innovation-pioneer');
    }
    
    return achievements;
  }, [milestone, repositoryContext]);

  // Generate celebration message
  const celebrationMessage = useMemo(() => {
    if (!milestone) return "🎉 Shippable delivered!";
    
    const messages = CELEBRATION_MESSAGES[milestone.category];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [milestone]);

  // Generate celebration particles
  const generateParticles = useMemo(() => {
    if (!milestone || intensityLevel === 'subtle') return [];
    
    const particleCount = intensityLevel === 'enhanced' ? 50 : 30;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: `particle-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1000,
        color: milestone.category === 'component' ? '#67feb7' :
               milestone.category === 'service' ? '#a78bfa' :
               milestone.category === 'test' ? '#34d399' :
               milestone.category === 'refactor' ? '#f59e0b' :
               milestone.category === 'feature' ? '#ec4899' :
               milestone.category === 'bug' ? '#ef4444' :
               '#60a5fa'
      });
    }
    
    return particles;
  }, [milestone, intensityLevel]);

  // Celebration sequence
  useEffect(() => {
    if (!isVisible || !milestone) return;
    
    setAchievementBadges(calculateAchievements);
    setVisibleParticles(generateParticles);
    
    const sequence = async () => {
      // Phase 1: Entering
      setCelebrationPhase('entering');
      
      // Phase 2: Celebrating
      await new Promise(resolve => setTimeout(resolve, 800));
      setCelebrationPhase('celebrating');
      
      // Phase 3: Show insights
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCelebrationPhase('insights');
      setShowStats(true);
      
      // Auto-dismiss after showing insights
      timeoutRef.current = setTimeout(() => {
        setCelebrationPhase('exiting');
        
        setTimeout(() => {
          onCelebrationComplete?.();
        }, 600);
      }, 3000);
    };
    
    sequence();
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isVisible, milestone, calculateAchievements, generateParticles, onCelebrationComplete]);

  // Format time duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  // Quality score color
  const getQualityColor = (quality: number) => {
    if (quality >= 0.9) return 'text-green-400';
    if (quality >= 0.7) return 'text-yellow-400';
    return 'text-orange-400';
  };

  if (!isVisible || !milestone) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={celebrationRef}
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onDismiss}
        />
        
        {/* Celebration particles */}
        {intensityLevel !== 'subtle' && CELEBRATION_QUALITY > 0.3 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <AnimatePresence>
              {celebrationPhase === 'celebrating' && visibleParticles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    backgroundColor: particle.color,
                    boxShadow: `0 0 8px ${particle.color}`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    y: [0, -100, -200],
                    x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: particle.delay / 1000,
                    ease: "easeOut"
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Main celebration content */}
        <motion.div
          className="relative bg-brand-cosmic-light/95 backdrop-blur-xl border border-brand-emerald/30 
                     rounded-xl shadow-2xl max-w-md mx-4 p-8 text-center"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ 
            scale: celebrationPhase === 'celebrating' ? 1.05 : 1,
            opacity: 1,
            y: 0
          }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Celebration header */}
          <motion.div
            className="mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-3xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-brand-emerald mb-2">
              {celebrationMessage}
            </h2>
            <p className="text-sm text-gray-400">
              {milestone.name}
            </p>
          </motion.div>
          
          {/* Achievement badges */}
          <AnimatePresence>
            {showAchievements && achievementBadges.length > 0 && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-sm text-gray-400 mb-3">Achievements Unlocked</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {achievementBadges.map((achievement, index) => (
                    <motion.div
                      key={achievement}
                      className="bg-ai-celebration-gold/20 text-ai-celebration-gold 
                                 border border-ai-celebration-gold/40 rounded-full px-3 py-1 text-xs"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      {ACHIEVEMENT_DEFINITIONS[achievement as keyof typeof ACHIEVEMENT_DEFINITIONS]}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Completion stats */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                className="mb-6 grid grid-cols-2 gap-4 text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-brand-cosmic-dark/50 rounded-lg p-3">
                  <div className="text-gray-400">Time</div>
                  <div className="text-brand-emerald font-medium">
                    {formatDuration(milestone.timeSpent)}
                  </div>
                </div>
                
                <div className="bg-brand-cosmic-dark/50 rounded-lg p-3">
                  <div className="text-gray-400">$BTD</div>
                  <div className="text-brand-emerald font-medium">
                    {milestone.measuredBtd} $BTD
                  </div>
                </div>
                
                <div className="bg-brand-cosmic-dark/50 rounded-lg p-3">
                  <div className="text-gray-400">Quality</div>
                  <div className={`font-medium ${getQualityColor(milestone.quality)}`}>
                    {Math.round(milestone.quality * 100)}%
                  </div>
                </div>
                
                <div className="bg-brand-cosmic-dark/50 rounded-lg p-3">
                  <div className="text-gray-400">Patterns</div>
                  <div className="text-brand-emerald font-medium">
                    {milestone.patterns.length}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Pattern insights */}
          <AnimatePresence>
            {showPatternInsights && milestone.patterns.length > 0 && showStats && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.8 }}
              >
                <div className="text-sm text-gray-400 mb-3">Patterns Recognized</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {milestone.patterns.map((pattern, index) => (
                    <motion.div
                      key={pattern}
                      className="bg-ai-pattern-recognition/20 text-ai-pattern-recognition 
                                 border border-ai-pattern-recognition/40 rounded-full px-3 py-1 text-xs"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      {pattern}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Repository insights */}
          <AnimatePresence>
            {showRepositoryInsights && repositoryContext && showStats && (
              <motion.div
                className="mb-6 bg-brand-cosmic-dark/30 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 1.0 }}
              >
                <div className="text-sm text-gray-400 mb-3">Repository Impact</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {repositoryContext.totalShippables && (
                    <div>
                      <span className="text-gray-400">Total Shippables:</span>
                      <span className="text-brand-emerald ml-2">{repositoryContext.totalShippables}</span>
                    </div>
                  )}
                  {repositoryContext.streakCount && (
                    <div>
                      <span className="text-gray-400">Streak:</span>
                      <span className="text-brand-emerald ml-2">{repositoryContext.streakCount}</span>
                    </div>
                  )}
                  {repositoryContext.qualityAverage && (
                    <div>
                      <span className="text-gray-400">Avg Quality:</span>
                      <span className="text-brand-emerald ml-2">{Math.round(repositoryContext.qualityAverage * 100)}%</span>
                    </div>
                  )}
                  {repositoryContext.testCoverage && (
                    <div>
                      <span className="text-gray-400">Test Coverage:</span>
                      <span className="text-brand-emerald ml-2">{repositoryContext.testCoverage}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Dismiss button */}
          <motion.button
            className="text-sm text-gray-400 hover:text-brand-emerald transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            onClick={onDismiss}
          >
            Continue to next Read →
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MarketingCompletionCelebration;
