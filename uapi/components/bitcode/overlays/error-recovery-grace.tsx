'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorContext {
  id: string;
  type: 'syntax' | 'type' | 'runtime' | 'network' | 'logic' | 'build' | 'deployment' | 'permission';
  message: string;
  location?: {
    file: string;
    line?: number;
    column?: number;
  };
  stackTrace?: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  context: {
    userAction?: string;
    affectedComponents?: string[];
    relatedPatterns?: string[];
    environmentDetails?: string;
  };
}

interface LearningMoment {
  insight: string;
  explanation: string;
  preventionTip: string;
  relatedConcepts: string[];
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  expertGuidance: string;
}

interface RecoveryGuidance {
  primarySolution: {
    title: string;
    steps: string[];
    confidence: number;
    estimatedTime: string;
  };
  alternativeSolutions: Array<{
    title: string;
    description: string;
    confidence: number;
    complexity: 'simple' | 'moderate' | 'complex';
  }>;
  preventiveMeasures: string[];
  learningResources: Array<{
    title: string;
    type: 'documentation' | 'tutorial' | 'example' | 'reference';
    url?: string;
    description: string;
  }>;
}

interface ErrorPattern {
  id: string;
  errorType: string;
  frequency: number;
  lastSeen: Date;
  resolutionSuccess: number; // 0-1, how often user successfully resolves this type
  learningProgress: number; // 0-1, how much user has learned from this error type
  mastery: 'struggling' | 'learning' | 'comfortable' | 'mastered';
}

interface ErrorRecoveryGraceProps {
  /** Current error context */
  error?: ErrorContext;
  
  /** Historical error patterns for learning */
  errorPatterns?: ErrorPattern[];
  
  /** User's overall error recovery skill level */
  recoveryMastery?: {
    overallLevel: number; // 0-1
    strongAreas: string[];
    improvementAreas: string[];
    recentProgress: number; // 0-1, improvement over time
  };
  
  /** Repository context for better guidance */
  repositoryContext?: {
    language: string;
    framework: string;
    complexity: number;
    commonPatterns: string[];
  };
  
  /** Visual presentation controls */
  graceStyle?: 'gentle' | 'encouraging' | 'instructional' | 'intensive';
  showLearningMoments?: boolean;
  showRecoveryGuidance?: boolean;
  showPatternInsights?: boolean;
  showExpertGuidance?: boolean;
  
  /** Supportive enhancement level */
  graceIntensity?: 'subtle' | 'standard' | 'deep' | 'intensive';
  
  /** Performance controls */
  respectReducedMotion?: boolean;
  
  /** Callbacks */
  onErrorResolved?: (resolution: { method: string; timeToResolve: number; learned: boolean }) => void;
  onLearningMoment?: (moment: LearningMoment) => void;
  onPatternRecognized?: (pattern: string) => void;
  onGuidanceAccepted?: (guidance: string) => void;
}

// Intelligent error analysis and learning synthesis
const analyzeErrorForLearning = (error: ErrorContext, patterns: ErrorPattern[], context: any): LearningMoment => {
  const errorPattern = patterns.find(p => p.errorType === error.type);
  const isRecurring = errorPattern && errorPattern.frequency > 3;
  const userMastery = errorPattern?.mastery || 'struggling';
  
  let insight = '';
  let explanation = '';
  let preventionTip = '';
  let relatedConcepts: string[] = [];
  let masteryLevel: LearningMoment['masteryLevel'] = 'beginner';
  let expertGuidance = '';
  
  switch (error.type) {
    case 'syntax':
      insight = isRecurring ? 
        'This syntax pattern seems to be a recurring challenge - let\'s break it down step by step' :
        'Syntax errors are the compiler\'s way of asking for clarification in our conversation';
      explanation = `The ${context?.language || 'language'} compiler expected different syntax at this location. Think of it as a grammar check for code.`;
      preventionTip = 'Enable syntax highlighting and real-time error checking in your editor to catch these early';
      relatedConcepts = ['syntax-highlighting', 'linting', 'parser-rules', 'language-grammar'];
      masteryLevel = userMastery === 'struggling' ? 'beginner' : 'intermediate';
      expertGuidance = '✨ Every experienced engineer has fixed syntax errors - it\'s the beginning of fluency, not a failure';
      break;
      
    case 'type':
      insight = isRecurring ?
        'Type mismatches suggest an opportunity to deepen your understanding of the type system' :
        'Type errors are your static guardrails, protecting you from runtime surprises';
      explanation = 'The type system is catching a potential mismatch between what you\'re providing and what the code expects. This is actually helpful!';
      preventionTip = 'Consider adding explicit type annotations to make your intentions clear to both TypeScript and future you';
      relatedConcepts = ['type-safety', 'type-inference', 'type-annotations', 'static-analysis'];
      masteryLevel = userMastery === 'mastered' ? 'advanced' : 'intermediate';
      expertGuidance = '◇ Types are not constraints but clarity - they make the invisible visible and the implicit explicit';
      break;
      
    case 'runtime':
      insight = 'Runtime errors reveal the gap between our assumptions and reality - valuable debugging moments';
      explanation = 'Something unexpected happened while your code was running. This gives us clues about edge cases or data flows we might not have considered.';
      preventionTip = 'Add defensive programming techniques like null checks, try-catch blocks, and input validation';
      relatedConcepts = ['defensive-programming', 'error-handling', 'edge-cases', 'debugging'];
      masteryLevel = 'intermediate';
      expertGuidance = '⚡ Runtime errors are diagnostic signals - they show us the paths our code actually travels, not just the ones we intended';
      break;
      
    case 'logic':
      insight = 'Logic errors are the most educational - they reveal the difference between what we meant and what we said';
      explanation = 'The code runs without crashing, but doesn\'t produce the expected result. This is a great opportunity to step through the logic systematically.';
      preventionTip = 'Use debugger breakpoints or console logging to trace the actual flow vs. expected flow';
      relatedConcepts = ['debugging', 'logical-reasoning', 'step-through-debugging', 'unit-testing'];
      masteryLevel = 'advanced';
      expertGuidance = '💡 Logic errors are mismatches worth isolating - solving them strengthens both coding skill and verification discipline';
      break;
      
    default:
      insight = 'Every error is a teacher - this one is showing us something we hadn\'t considered';
      explanation = 'Let\'s examine this error as a learning opportunity rather than a roadblock.';
      preventionTip = 'Document what you learn from this error to build your personal knowledge base';
      relatedConcepts = ['problem-solving', 'debugging', 'learning'];
      masteryLevel = 'intermediate';
      expertGuidance = '💫 In production code, every error is evidence for a clearer guardrail';
  }
  
  return {
    insight,
    explanation,
    preventionTip,
    relatedConcepts,
    masteryLevel,
    expertGuidance
  };
};

// Generate contextual recovery guidance
const generateRecoveryGuidance = (error: ErrorContext, context: any): RecoveryGuidance => {
  const baseGuidance: RecoveryGuidance = {
    primarySolution: {
      title: 'Investigate and Resolve',
      steps: [
        'Examine the error message carefully for clues',
        'Check the line and column indicated if available',
        'Look for typos or missing characters',
        'Verify that all imports and dependencies are correct',
        'Test the fix and ensure it works as expected'
      ],
      confidence: 0.7,
      estimatedTime: '5-15 minutes'
    },
    alternativeSolutions: [
      {
        title: 'Consult Documentation',
        description: 'Look up the specific error or pattern in official documentation',
        confidence: 0.8,
        complexity: 'simple'
      },
      {
        title: 'Search Community Resources',
        description: 'Check Stack Overflow or GitHub issues for similar problems',
        confidence: 0.6,
        complexity: 'simple'
      }
    ],
    preventiveMeasures: [
      'Enable real-time error checking in your editor',
      'Use linting tools to catch common issues early',
      'Write unit tests to catch regressions'
    ],
    learningResources: []
  };
  
  // Customize guidance based on error type
  switch (error.type) {
    case 'syntax':
      baseGuidance.primarySolution.title = 'Fix Syntax Error';
      baseGuidance.primarySolution.steps = [
        'Check for missing brackets, parentheses, or semicolons',
        'Verify proper indentation and code structure',
        'Look for typos in keywords or identifiers',
        'Ensure string quotes are properly closed',
        'Save and test the corrected code'
      ];
      baseGuidance.primarySolution.confidence = 0.9;
      baseGuidance.primarySolution.estimatedTime = '2-5 minutes';
      break;
      
    case 'type':
      baseGuidance.primarySolution.title = 'Resolve Type Mismatch';
      baseGuidance.primarySolution.steps = [
        'Identify what type is expected vs. what you\'re providing',
        'Add explicit type annotations if helpful',
        'Convert the value to the expected type if appropriate',
        'Consider if the type expectation itself needs adjustment',
        'Verify the fix resolves the type error'
      ];
      baseGuidance.primarySolution.confidence = 0.85;
      baseGuidance.primarySolution.estimatedTime = '5-10 minutes';
      break;
      
    case 'runtime':
      baseGuidance.primarySolution.title = 'Debug Runtime Issue';
      baseGuidance.primarySolution.steps = [
        'Add console.log statements to trace the execution flow',
        'Check for null or undefined values',
        'Verify that required data is available when needed',
        'Add error handling with try-catch if appropriate',
        'Test edge cases and boundary conditions'
      ];
      baseGuidance.primarySolution.confidence = 0.75;
      baseGuidance.primarySolution.estimatedTime = '10-30 minutes';
      break;
  }
  
  return baseGuidance;
};

// Device capability detection for graceful effects
const GRACE_QUALITY = (() => {
  if (typeof navigator === 'undefined') return 1;
  
  const mem = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  
  if (reducedMotion) return 0.3;
  
  const lowSpec = (mem && mem <= 4) || (cores && cores <= 4);
  return lowSpec ? 0.6 : 1;
})();

export const ErrorRecoveryGrace = ({
  error,
  errorPatterns = [],
  recoveryMastery = {
    overallLevel: 0.5,
    strongAreas: [],
    improvementAreas: [],
    recentProgress: 0.1
  },
  repositoryContext,
  graceStyle = 'instructional',
  showLearningMoments = true,
  showRecoveryGuidance = true,
  showPatternInsights = true,
  showExpertGuidance = true,
  graceIntensity = 'deep',
  respectReducedMotion = true,
  onErrorResolved,
  onLearningMoment,
  onPatternRecognized,
  onGuidanceAccepted
}: ErrorRecoveryGraceProps) => {
  const [showGrace, setShowGrace] = useState(false);
  const [gracefulParticles, setGracefulParticles] = useState<Array<{
    id: string;
    x: number;
    y: number;
    symbol: string;
    color: string;
    opacity: number;
  }>>([]);
  const [resolutionStartTime, setResolutionStartTime] = useState<Date | null>(null);
  const [learningExpanded, setLearningExpanded] = useState(false);
  
  const graceTimeoutRef = useRef<NodeJS.Timeout>();
  const particleIntervalRef = useRef<NodeJS.Timeout>();
  
  // Generate learning moment from current error
  const learningMoment = useMemo(() => {
    if (!error) return null;
    return analyzeErrorForLearning(error, errorPatterns, repositoryContext);
  }, [error, errorPatterns, repositoryContext]);
  
  // Generate recovery guidance
  const recoveryGuidance = useMemo(() => {
    if (!error) return null;
    return generateRecoveryGuidance(error, repositoryContext);
  }, [error, repositoryContext]);
  
  // Show grace when error appears
  useEffect(() => {
    if (error) {
      setShowGrace(true);
      setResolutionStartTime(new Date());
      
      graceTimeoutRef.current = setTimeout(() => {
        setShowGrace(false);
      }, 30000); // Auto-hide after 30 seconds
      
      return () => {
        if (graceTimeoutRef.current) clearTimeout(graceTimeoutRef.current);
      };
    } else {
      setShowGrace(false);
      
      // If error was resolved, track it
      if (resolutionStartTime) {
        const resolutionTime = Date.now() - resolutionStartTime.getTime();
        onErrorResolved?.({
          method: 'user-resolved',
          timeToResolve: resolutionTime,
          learned: learningExpanded
        });
        setResolutionStartTime(null);
      }
    }
  }, [error, resolutionStartTime, learningExpanded, onErrorResolved]);
  
  // Generate graceful particles
  const generateGracefulParticles = useCallback(() => {
    if (graceIntensity === 'subtle' || GRACE_QUALITY < 0.5) return;
    
    const particles = Array.from({ length: 5 }, (_, index) => ({
      id: `grace-particle-${index}`,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      symbol: ['✨', '🌟', '💫', '◇', '⭐'][index % 5],
      color: graceStyle === 'intensive' ? '#a855f7' :
             graceStyle === 'instructional' ? '#10b981' :
             graceStyle === 'encouraging' ? '#3b82f6' : '#6b7280',
      opacity: 0.6
    }));
    
    setGracefulParticles(particles);
  }, [graceIntensity, graceStyle]);
  
  // Particle effects
  useEffect(() => {
    if (showGrace && graceIntensity !== 'subtle') {
      generateGracefulParticles();
      
      particleIntervalRef.current = setInterval(() => {
        generateGracefulParticles();
      }, 4000);
      
      return () => {
        if (particleIntervalRef.current) clearInterval(particleIntervalRef.current);
      };
    }
  }, [showGrace, generateGracefulParticles, graceIntensity]);
  
  // Learning moment callback
  useEffect(() => {
    if (learningMoment && learningExpanded) {
      onLearningMoment?.(learningMoment);
    }
  }, [learningMoment, learningExpanded, onLearningMoment]);
  
  // Calculate grace enhancement factor
  const graceEnhancement = graceIntensity === 'intensive' ? 1.0 :
                          graceIntensity === 'deep' ? 0.8 :
                          graceIntensity === 'standard' ? 0.6 : 0.3;
  
  const enhancementGlow = GRACE_QUALITY * graceEnhancement;
  
  if (!error || !showGrace) return null;
  
  return (
    <div className="error-recovery-grace fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      {/* Main Grace Panel */}
      <motion.div
        className="pointer-events-auto max-w-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div 
          className={`
            backdrop-blur-xl rounded-2xl p-6 border shadow-2xl
            ${graceStyle === 'intensive' ? 
              'bg-gradient-to-br from-purple-900/95 to-indigo-900/95 border-purple-400/40' :
            graceStyle === 'instructional' ?
              'bg-gradient-to-br from-emerald-900/95 to-teal-900/95 border-emerald-400/40' :
            graceStyle === 'encouraging' ?
              'bg-gradient-to-br from-blue-900/95 to-cyan-900/95 border-blue-400/40' :
              'bg-gradient-to-br from-slate-900/95 to-gray-900/95 border-slate-400/40'
            }
          `}
          style={{
            boxShadow: `0 0 40px ${
              graceStyle === 'intensive' ? 'rgba(147, 51, 234, 0.4)' :
              graceStyle === 'instructional' ? 'rgba(16, 185, 129, 0.4)' :
              graceStyle === 'encouraging' ? 'rgba(59, 130, 246, 0.4)' :
              'rgba(107, 114, 128, 0.3)'
            }`
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div 
                className="text-3xl"
                style={{
                  filter: `drop-shadow(0 0 8px ${
                    graceStyle === 'intensive' ? '#a855f7' :
                    graceStyle === 'instructional' ? '#10b981' :
                    graceStyle === 'encouraging' ? '#3b82f6' : '#6b7280'
                  })`
                }}
              >
                {graceStyle === 'intensive' ? '◇' :
                 graceStyle === 'instructional' ? '💡' :
                 graceStyle === 'encouraging' ? '💫' : '✨'}
              </div>
              <div>
                <h3 className="text-xl font-medium text-white">
                  Recovery Grace
                </h3>
                <p className="text-sm opacity-80 text-gray-200">
                  Every error is a step toward mastery
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowGrace(false)}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              ✕
            </button>
          </div>
          
          {/* Error Summary */}
          <div className="mb-6 p-4 bg-black/20 rounded-lg border border-white/10">
            <div className="flex items-start space-x-3">
              <div className={`
                text-lg mt-1
                ${error.severity === 'critical' ? 'text-red-400' :
                  error.severity === 'error' ? 'text-orange-400' :
                  error.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                }
              `}>
                {error.severity === 'critical' ? '🚨' :
                 error.severity === 'error' ? '⚠️' :
                 error.severity === 'warning' ? '💡' : 'ℹ️'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white mb-2">
                  {error.type.charAt(0).toUpperCase() + error.type.slice(1)} Error
                </div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  {error.message}
                </div>
                {error.location && (
                  <div className="text-xs text-gray-400 mt-2">
                    📁 {error.location.file}
                    {error.location.line && `:${error.location.line}`}
                    {error.location.column && `:${error.location.column}`}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Learning Moment */}
          {showLearningMoments && learningMoment && (
            <div className="mb-6">
              <button
                onClick={() => {
                  setLearningExpanded(!learningExpanded);
                  if (!learningExpanded) onGuidanceAccepted?.(learningMoment.expertGuidance);
                }}
                className="w-full text-left p-4 bg-emerald-500/10 hover:bg-emerald-500/20 
                         border border-emerald-400/30 rounded-lg transition-all duration-200
                         flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <div className="text-sm font-medium text-emerald-100">
                      Learning Moment
                    </div>
                    <div className="text-xs text-emerald-300">
                      {learningMoment.insight}
                    </div>
                  </div>
                </div>
                <div className={`text-emerald-300 transition-transform duration-200 ${
                  learningExpanded ? 'rotate-180' : ''
                }`}>
                  ⌄
                </div>
              </button>
              
              <AnimatePresence>
                {learningExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 p-4 bg-emerald-500/5 border border-emerald-400/20 rounded-lg"
                  >
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-emerald-300 mb-1">Understanding</div>
                        <div className="text-sm text-emerald-100 leading-relaxed">
                          {learningMoment.explanation}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium text-emerald-300 mb-1">Prevention</div>
                        <div className="text-sm text-emerald-100 leading-relaxed">
                          {learningMoment.preventionTip}
                        </div>
                      </div>
                      
                      {showExpertGuidance && (
                        <div className="pt-3 border-t border-emerald-400/20">
                          <div className="text-sm italic text-purple-300 leading-relaxed">
                            {learningMoment.expertGuidance}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Recovery Guidance */}
          {showRecoveryGuidance && recoveryGuidance && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg">🛠️</span>
                  <div className="text-sm font-medium text-blue-100">
                    {recoveryGuidance.primarySolution.title}
                  </div>
                  <div className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded">
                    {Math.round(recoveryGuidance.primarySolution.confidence * 100)}% confidence
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  {recoveryGuidance.primarySolution.steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <div className="text-blue-400 mt-0.5">{index + 1}.</div>
                      <div className="text-blue-100">{step}</div>
                    </div>
                  ))}
                </div>
                
                <div className="text-xs text-blue-300">
                  ⏱️ Estimated time: {recoveryGuidance.primarySolution.estimatedTime}
                </div>
              </div>
              
              {recoveryGuidance.alternativeSolutions.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                  {recoveryGuidance.alternativeSolutions.map((solution, index) => (
                    <div key={index} className="p-3 bg-gray-500/10 border border-gray-400/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-100">
                          {solution.title}
                        </div>
                        <div className="text-xs text-gray-300 bg-gray-500/20 px-2 py-1 rounded">
                          {solution.complexity}
                        </div>
                      </div>
                      <div className="text-xs text-gray-300 leading-relaxed">
                        {solution.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Graceful Particles */}
      {graceIntensity !== 'subtle' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {gracefulParticles.map(particle => (
              <motion.div
                key={particle.id}
                className="absolute text-lg"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  color: particle.color,
                  textShadow: `0 0 8px ${particle.color}`,
                  filter: `drop-shadow(0 0 4px ${particle.color})`
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: particle.opacity, 
                  scale: [1, 1.2, 1],
                  y: [0, -15, -30]
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  duration: 4,
                  scale: { repeat: Infinity, duration: 2 },
                  y: { duration: 4, ease: "easeOut" }
                }}
              >
                {particle.symbol}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ErrorRecoveryGrace;