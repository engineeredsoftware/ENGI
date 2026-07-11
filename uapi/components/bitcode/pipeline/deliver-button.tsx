'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuantumButton from '@/components/bitcode/quantum-button';

interface DeliverButtonProps {
  /** Core functionality */
  onDeliver: () => void;
  disabled?: boolean;
  
  /** Intelligence layer */
  readDefinitionQuality?: number; // 0-1 assessment of Definition of Read quality
  contextConfidence?: number; // 0-1 based on attachments and repository context
  measuredBtdEstimate?: number;
  estimatedDuration?: number; // in minutes
  
  /** Pattern recognition */
  recognizedPatterns?: {
    type: 'component' | 'service' | 'test' | 'refactor' | 'documentation';
    confidence: number;
    previousSuccess?: boolean;
  }[];
  
  /** Repository awareness */
  repositoryContext?: {
    language?: string;
    testCoverage?: number;
    architecture?: string;
  };
  
  /** Visual enhancement controls */
  showPreview?: boolean;
  intensityLevel?: 'subtle' | 'moderate' | 'enhanced';
  
  /** Styling */
  className?: string;
}

// Device capability detection for performance optimization
const DELIGHT_QUALITY_MULTIPLIER = (() => {
  if (typeof navigator === 'undefined') return 1;
  
  const mem = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  
  if (reducedMotion) return 0;
  
  const lowSpec = (mem && mem <= 4) || (cores && cores <= 4);
  return lowSpec ? 0.6 : 1;
})();

export const DeliverButton = ({
  onDeliver,
  disabled = false,
  readDefinitionQuality = 0,
  contextConfidence = 0,
  measuredBtdEstimate,
  estimatedDuration,
  recognizedPatterns = [],
  repositoryContext,
  showPreview = true,
  intensityLevel = 'moderate',
  className = '',
}: DeliverButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPredictivePreview, setShowPredictivePreview] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Calculate overall confidence
  const overallConfidence = useMemo(() => {
    const baseConfidence = (readDefinitionQuality * 0.6 + contextConfidence * 0.4);
    const patternBonus = recognizedPatterns.length > 0 ? 
      recognizedPatterns.reduce((sum, p) => sum + p.confidence, 0) / recognizedPatterns.length * 0.2 : 0;
    return Math.min(baseConfidence + patternBonus, 1.0);
  }, [readDefinitionQuality, contextConfidence, recognizedPatterns]);
  
  // Determine confidence level for styling
  const confidenceLevel = useMemo(() => {
    if (overallConfidence >= 0.8) return 'high';
    if (overallConfidence >= 0.6) return 'medium';
    return 'low';
  }, [overallConfidence]);
  
  // Enhanced button text based on confidence and patterns
  const buttonText = useMemo(() => {
    if (disabled) return 'Deliver';
    
    if (overallConfidence >= 0.9 && recognizedPatterns.some(p => p.previousSuccess)) {
      return 'Create Excellence';
    }
    
    if (overallConfidence >= 0.8) {
      return 'Deliver';
    }
    
    if (overallConfidence >= 0.6) {
      return 'Deliver';
    }
    
    return 'Deliver';
  }, [disabled, overallConfidence, recognizedPatterns]);
  
  // Predictive preview trigger
  useEffect(() => {
    if (!showPreview || intensityLevel === 'subtle') return;
    
    if (isHovered && overallConfidence > 0.7 && DELIGHT_QUALITY_MULTIPLIER > 0.5) {
      const timer = setTimeout(() => setShowPredictivePreview(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowPredictivePreview(false);
    }
  }, [isHovered, overallConfidence, showPreview, intensityLevel]);
  
  // Generate predicted artifacts based on patterns
  const predictedArtifacts = useMemo(() => {
    const artifacts: Array<{ icon: string; label: string; confidence?: number }> = [];
    
    recognizedPatterns.forEach(pattern => {
      switch (pattern.type) {
        case 'component':
          artifacts.push({ 
            icon: '⚛️', 
            label: `${repositoryContext?.language || 'React'} Component`,
            confidence: pattern.confidence 
          });
          break;
        case 'service':
          artifacts.push({ 
            icon: '🛠️', 
            label: `${repositoryContext?.architecture || 'Service'} Module`,
            confidence: pattern.confidence 
          });
          break;
        case 'test':
          artifacts.push({ 
            icon: '🧪', 
            label: 'Test Suite',
            confidence: pattern.confidence 
          });
          break;
        case 'refactor':
          artifacts.push({ 
            icon: '✨', 
            label: 'Code Refinement',
            confidence: pattern.confidence 
          });
          break;
        case 'documentation':
          artifacts.push({ 
            icon: '📚', 
            label: 'Documentation',
            confidence: pattern.confidence 
          });
          break;
      }
    });
    
    // Always include PR if confidence is high
    if (overallConfidence > 0.7) {
      artifacts.push({ icon: '🔄', label: 'Pull Request' });
    }
    
    return artifacts;
  }, [recognizedPatterns, repositoryContext, overallConfidence]);
  
  return (
    <div className="deliver-button-container relative" ref={buttonRef}>
      {/* Enhanced Quantum Button with confidence styling */}
      <QuantumButton
        onClick={onDeliver}
        disabled={disabled || overallConfidence < 0.3}
        className={`
          deliver-button
          ${confidenceLevel === 'high' ? 'confidence-high' : ''}
          ${confidenceLevel === 'medium' ? 'confidence-medium' : ''}
          ${confidenceLevel === 'low' ? 'confidence-low' : ''}
          ${className}
        `}
        style={{
          '--confidence': overallConfidence,
          '--measured-btd-estimate': measuredBtdEstimate || 50,
          '--estimated-duration': estimatedDuration || 3,
        } as React.CSSProperties}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabledTooltip={
          overallConfidence < 0.3 ? 
            'Add more context or improve Definition of Read quality' : 
            undefined
        }
      >
        {buttonText}
      </QuantumButton>
      
      {/* Confidence visualization ring */}
      {!disabled && overallConfidence > 0.3 && DELIGHT_QUALITY_MULTIPLIER > 0 && (
        <div className="confidence-ring-container absolute inset-0 pointer-events-none">
          <svg
            className="confidence-ring w-full h-full"
            viewBox="0 0 120 60"
            style={{ transform: 'scale(1.1)' }}
          >
            {/* Background ring */}
            <ellipse
              cx="60"
              cy="30"
              rx="55"
              ry="25"
              fill="none"
              stroke="rgba(103, 254, 183, 0.1)"
              strokeWidth="1"
              className="opacity-30"
            />
            {/* Confidence progress ring */}
            <ellipse
              cx="60"
              cy="30"
              rx="55"
              ry="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="251.33"
              strokeDashoffset={251.33 * (1 - overallConfidence)}
              className={`
                transition-all duration-1000 ease-out
                ${confidenceLevel === 'high' ? 'text-ai-celebration-gold' : 'text-brand-emerald'}
              `}
              style={{
                filter: `drop-shadow(0 0 3px ${
                  confidenceLevel === 'high' ? 
                    'rgba(245, 158, 11, 0.6)' : 
                    'rgba(103, 254, 183, 0.4)'
                })`
              }}
            />
          </svg>
        </div>
      )}
      
      {/* Resource indicator */}
      {(measuredBtdEstimate || estimatedDuration) && overallConfidence > 0.5 && (
        <div className="resource-indicator absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="text-xs text-gray-400 bg-brand-cosmic-light/80 backdrop-blur-sm 
 px-2 py-1 border border-brand-emerald-glow-subtle
 flex items-center space-x-2">
            {measuredBtdEstimate && (
              <span className="text-brand-emerald">
                {measuredBtdEstimate} measured $BTD
              </span>
            )}
            {estimatedDuration && (
              <span className="text-gray-300">
                ~{estimatedDuration}m
              </span>
            )}
            {overallConfidence > 0.8 && (
              <span className="text-ai-celebration-gold">✨</span>
            )}
          </div>
        </div>
      )}
      
      {/* Predictive preview */}
      <AnimatePresence>
        {showPredictivePreview && predictedArtifacts.length > 0 && (
          <motion.div
            className="delivery-preview absolute -top-20 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-brand-cosmic-light/95 backdrop-blur-md border border-brand-emerald-glow-subtle 
 p-3 shadow-xl max-w-xs">
              <div className="text-center mb-2">
                <span className="text-xs font-medium text-brand-emerald">Ready to create:</span>
              </div>
              
              <div className="space-y-1">
                {predictedArtifacts.slice(0, 3).map((artifact, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-2 text-xs"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-sm">{artifact.icon}</span>
                    <span className="text-gray-300">{artifact.label}</span>
                    {artifact.confidence && artifact.confidence > 0.8 && (
                      <span className="text-ai-celebration-gold ml-auto">⭐</span>
                    )}
                  </motion.div>
                ))}
                
                {predictedArtifacts.length > 3 && (
                  <div className="text-xs text-gray-400 text-center pt-1">
                    +{predictedArtifacts.length - 3} more...
                  </div>
                )}
              </div>
              
              {/* Confidence indicator */}
              <div className="flex items-center justify-center mt-2 pt-2 border-t border-brand-emerald-glow-subtle">
                <div className="flex items-center space-x-1 text-xs">
                  <div className={`w-2 h-2 ${
                    confidenceLevel === 'high' ? 'bg-ai-celebration-gold' :
                    confidenceLevel === 'medium' ? 'bg-brand-emerald' :
                    'bg-yellow-500'
                  }`} />
                  <span className="text-gray-400">
                    {Math.round(overallConfidence * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>
            
            {/* Preview arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-2 h-2 bg-brand-cosmic-light border-r border-b 
 border-brand-emerald-glow-subtle transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* High confidence glow enhancement */}
      {!disabled && confidenceLevel === 'high' && DELIGHT_QUALITY_MULTIPLIER > 0.7 && (
        <div className="confidence-ambient-glow absolute inset-[-8px] pointer-events-none">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)`,
              animation: `confidence-pulse 2s ease-in-out infinite`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DeliverButton;
