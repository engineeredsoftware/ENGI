'use client';

import { ProcessingIndicator } from '@/components/bitcode/indicators/ProcessingIndicator/ProcessingIndicator';
import TypingAnimation from '@/components/bitcode/TypingAnimation/TypingAnimation';
import React, { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RepositoryContext {
  language?: string;
  architecture?: string;
  testCoverage?: number;
  componentCount?: number;
  codeStyle?: string;
}

interface RecognizedPattern {
  type: 'component' | 'service' | 'utility' | 'refactor' | 'test';
  confidence: number;
  previousSuccess?: boolean;
  complexity?: 'simple' | 'moderate' | 'complex';
  estimatedTime?: number;
}

interface IntelligentProcessingProps {
  // Standard processing indicator props
  label?: string;
  
  // Intelligence layer
  repositoryContext?: RepositoryContext;
  recognizedPattern?: RecognizedPattern;
  currentPhase?: 'setup' | 'discovery' | 'implementation' | 'validation' | 'finish';
  phaseProgress?: number; // 0-1
  
  // Learning indicators
  userPatternLearned?: boolean;
  qualityConfidence?: number; // 0-1
  
  // Visual enhancement controls
  showIntelligence?: boolean;
  intensityLevel?: 'subtle' | 'moderate' | 'enhanced';
}

// Device capability detection for performance optimization
const DELIGHT_QUALITY_MULTIPLIER = (() => {
  if (typeof navigator === 'undefined') return 1;
  
  const mem = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  
  if (reducedMotion) return 0; // Respect accessibility
  
  const lowSpec = (mem && mem <= 4) || (cores && cores <= 4);
  return lowSpec ? 0.6 : 1;
})();

export const MarketingIntelligentProcessingIndicator = ({
  label = 'Processing',
  repositoryContext,
  recognizedPattern,
  currentPhase = 'setup',
  phaseProgress = 0,
  userPatternLearned = false,
  qualityConfidence = 0.7,
  showIntelligence = true,
  intensityLevel = 'moderate'
}: IntelligentProcessingProps) => {
  const orbRef = useRef<HTMLDivElement>(null);
  const intelligenceRef = useRef<HTMLDivElement>(null);
  const [showPatternRecognition, setShowPatternRecognition] = useState(false);
  
  // Intelligence-driven label generation
  const intelligentLabel = useMemo(() => {
    if (!showIntelligence) return label;
    
    // Repository-aware messaging
    if (recognizedPattern?.type === 'component' && repositoryContext?.language) {
      return `Crafting ${repositoryContext.language} component...`;
    }
    
    if (recognizedPattern?.type === 'test' && repositoryContext?.testCoverage) {
      return `Testing to ${repositoryContext.testCoverage}% standards...`;
    }
    
    // Phase-aware intelligence
    switch (currentPhase) {
      case 'discovery':
        if (repositoryContext?.architecture) {
          return `Analyzing your ${repositoryContext.architecture} patterns...`;
        }
        return userPatternLearned ? 'Recognizing familiar patterns...' : 'Discovering architecture...';
        
      case 'implementation':
        if (recognizedPattern?.previousSuccess) {
          return 'Applying your proven patterns...';
        }
        if (recognizedPattern?.complexity === 'complex') {
          return 'Building sophisticated solution...';
        }
        return 'Implementing with your style...';
        
      case 'validation':
        return `Validating against your quality gates...`;
        
      case 'finish':
        return qualityConfidence > 0.8 ? 'Preparing Shippable evidence...' : 'Finalizing AssetPack receipt...';
        
      default:
        return label;
    }
  }, [
    currentPhase, 
    repositoryContext, 
    recognizedPattern, 
    label, 
    userPatternLearned, 
    qualityConfidence,
    showIntelligence
  ]);
  
  // Enhanced particle configuration based on intelligence
  const intelligenceConfig = useMemo(() => {
    if (!showIntelligence || DELIGHT_QUALITY_MULTIPLIER === 0) {
      return { particleCount: 6, particleSpeed: 1.0, glowIntensity: 1.0 };
    }
    
    const baseParticles = 6;
    const confidenceBonus = (recognizedPattern?.confidence || 0) * 4;
    const phaseBonus = currentPhase === 'implementation' ? 2 : 0;
    const learningBonus = userPatternLearned ? 3 : 0;
    
    return {
      particleCount: Math.round((baseParticles + confidenceBonus + phaseBonus + learningBonus) * DELIGHT_QUALITY_MULTIPLIER),
      particleSpeed: currentPhase === 'implementation' ? 1.3 : 1.0,
      glowIntensity: qualityConfidence * 0.5 + 0.5,
      ringSpeed: recognizedPattern?.previousSuccess ? 1.2 : 1.0
    };
  }, [recognizedPattern, currentPhase, userPatternLearned, qualityConfidence, showIntelligence]);
  
  // Pattern recognition animation trigger
  useEffect(() => {
    if (recognizedPattern && recognizedPattern.confidence > 0.6) {
      setShowPatternRecognition(true);
      const timer = setTimeout(() => setShowPatternRecognition(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [recognizedPattern]);
  
  // Enhanced CSS custom properties for intelligence layer
  useEffect(() => {
    if (!intelligenceRef.current || DELIGHT_QUALITY_MULTIPLIER === 0) return;
    
    intelligenceRef.current.style.setProperty('--intelligence-level', `${qualityConfidence}`);
    intelligenceRef.current.style.setProperty('--phase-progress', `${phaseProgress}`);
    intelligenceRef.current.style.setProperty('--particle-count', `${intelligenceConfig.particleCount}`);
    intelligenceRef.current.style.setProperty('--particle-speed', `${intelligenceConfig.particleSpeed}`);
    intelligenceRef.current.style.setProperty('--glow-intensity', `${intelligenceConfig.glowIntensity}`);
  }, [qualityConfidence, phaseProgress, intelligenceConfig]);
  
  return (
    <div className="intelligent-processing-container relative" ref={intelligenceRef}>
      {/* Base processing indicator */}
      <ProcessingIndicator label={intelligentLabel} />
      
      {/* Intelligence enhancement layer */}
      {showIntelligence && DELIGHT_QUALITY_MULTIPLIER > 0 && (
        <>
          {/* Pattern recognition celebration */}
          <AnimatePresence>
            {showPatternRecognition && (
              <motion.div
                className="pattern-recognition-indicator absolute -top-8 left-0 right-0 text-center"
                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="text-xs text-ai-pattern-recognition font-light">
                  ✨ Pattern recognized ({Math.round((recognizedPattern?.confidence || 0) * 100)}%)
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Intelligence particles */}
          {intelligenceConfig.particleCount > 6 && (
            <div className="intelligence-particle-layer absolute inset-0 pointer-events-none">
              {[...Array(intelligenceConfig.particleCount - 6)].map((_, i) => (
                <div
                  key={i}
                  className={`intelligence-particle intelligence-particle-${i}`}
                  style={{
                    '--delay': `${i * 0.3}s`,
                    '--speed': `${intelligenceConfig.particleSpeed}`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}
          
          {/* Phase progress ring */}
          {phaseProgress > 0 && intensityLevel !== 'subtle' && (
            <div className="phase-progress-container absolute inset-0 pointer-events-none">
              <svg
                className="phase-progress-ring w-full h-full"
                viewBox="0 0 24 24"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-brand-emerald-glow-subtle opacity-30"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="62.83"
                  strokeDashoffset={62.83 * (1 - phaseProgress)}
                  className="text-brand-emerald transition-all duration-500 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 2px theme('colors.brand.emerald-glow'))`
                  }}
                />
              </svg>
            </div>
          )}
          
          {/* Learning indicator */}
          {userPatternLearned && intensityLevel === 'enhanced' && (
            <div className="learning-indicator absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="text-xs text-ai-thinking font-light opacity-70">
                <TypingAnimation
                  text="Learning your patterns"
                  duration={100}
                  className="!text-xs !font-light"
                />
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Enhanced ambient glow based on intelligence */}
      {showIntelligence && qualityConfidence > 0.8 && DELIGHT_QUALITY_MULTIPLIER > 0.5 && (
        <div className="intelligence-ambient-glow absolute inset-[-4px] pointer-events-none">
          <div
            className="absolute inset-0 rounded-lg opacity-20"
            style={{
              background: `radial-gradient(circle, theme('colors.ai.thinking') 0%, transparent 70%)`,
              animation: `intelligence-pulse 3s ease-in-out infinite`,
            }}
          />
        </div>
      )}
    </div>
  );
};

// Export with memoization for performance
export default memo(MarketingIntelligentProcessingIndicator);
