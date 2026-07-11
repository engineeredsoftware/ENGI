'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePatternRecognition } from '../hooks/usePatternRecognition';

interface ReadDefinitionInputProps {
  /** Core functionality */
  value: string;
  onChange: (value: string) => void;
  onEnhance?: () => void;
  
  /** Intelligence layer */
  repositoryContext?: {
    language?: string;
    architecture?: string;
    testCoverage?: number;
    componentCount?: number;
    codeStyle?: string;
  };
  
  attachments?: Array<{
    type: 'file' | 'url' | 'github_issue' | 'github_pr' | 'figma' | 'notion';
    content?: string;
    metadata?: Record<string, any>;
  }>;
  
  /** Visual enhancement controls */
  showPatternInsights?: boolean;
  showEnhancementSuggestions?: boolean;
  intensityLevel?: 'subtle' | 'moderate' | 'enhanced';
  
  /** State */
  disabled?: boolean;
  placeholder?: string;
  
  /** Callbacks */
  onPatternRecognized?: (patterns: any[]) => void;
  onConfidenceChange?: (confidence: number) => void;
  onBtdEstimated?: (btdAmount: number) => void;
  
  /** Styling */
  className?: string;
}

export const ReadDefinitionInput = ({
  value,
  onChange,
  onEnhance,
  repositoryContext,
  attachments = [],
  showPatternInsights = true,
  showEnhancementSuggestions = true,
  intensityLevel = 'moderate',
  disabled = false,
  placeholder = "Define what you want to create...",
  onPatternRecognized,
  onConfidenceChange,
  onBtdEstimated,
  className = ''
}: ReadDefinitionInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showPatternCelebration, setShowPatternCelebration] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Pattern recognition hook
  const {
    patterns,
    isAnalyzing,
    error: patternError,
    confidence,
    suggestedBtd,
    suggestedDuration,
    learningInsights,
  } = usePatternRecognition(value, attachments, repositoryContext, {
    mockMode: true, // Enable for demo/storybook
    enableLearning: true,
  });
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    const newHeight = Math.max(366, Math.min(600, textarea.scrollHeight));
    textarea.style.height = `${newHeight}px`;
  }, [value]);
  
  // Pattern recognition celebration
  useEffect(() => {
    if (patterns.length > 0 && patterns.some(p => p.confidence > 0.8)) {
      setShowPatternCelebration(true);
      const timer = setTimeout(() => setShowPatternCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [patterns]);
  
  // Notify parent components of changes
  useEffect(() => {
    onPatternRecognized?.(patterns);
  }, [patterns, onPatternRecognized]);
  
  useEffect(() => {
    onConfidenceChange?.(confidence);
  }, [confidence, onConfidenceChange]);
  
  useEffect(() => {
    onBtdEstimated?.(suggestedBtd);
  }, [suggestedBtd, onBtdEstimated]);
  
  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    
    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    return () => container?.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Enhanced writing simulation
  const handleEnhance = async () => {
    if (!value.trim() || isEnhancing) return;
    
    setIsEnhancing(true);
    
    try {
      // Simulate enhancement based on patterns
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let enhancedText = value;
      
      // Add pattern-specific enhancements
      if (patterns.some(p => p.type === 'component')) {
        if (!value.includes('props') && repositoryContext?.language === 'TypeScript') {
          enhancedText += '\n\nRequirements:\n- TypeScript props interface with proper typing';
        }
        if (!value.includes('test') && repositoryContext?.testCoverage && repositoryContext.testCoverage > 80) {
          enhancedText += '\n- Comprehensive test suite with edge cases';
        }
      }
      
      if (patterns.some(p => p.type === 'service')) {
        if (!value.includes('error') && !value.includes('exception')) {
          enhancedText += '\n- Proper error handling and validation';
        }
      }
      
      // Add architectural guidance
      if (repositoryContext?.architecture === 'hexagonal' && !value.includes('port') && !value.includes('adapter')) {
        enhancedText += '\n- Follow hexagonal architecture with clear ports and adapters';
      }
      
      onChange(enhancedText);
      
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  };
  
  return (
    <div
      ref={containerRef}
      className={`read-definition-input relative ${className}`}
      style={{
        '--mouse-x': `${mousePos.x}%`,
        '--mouse-y': `${mousePos.y}%`,
        '--confidence': confidence,
      } as React.CSSProperties}
    >
      {/* Interactive background with intelligence glow */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base background */}
        <div className="absolute inset-0 bg-brand-cosmic-light/50 rounded-lg" />
        
        {/* Intelligence glow based on confidence */}
        {confidence > 0.3 && intensityLevel !== 'subtle' && (
          <div
            className="absolute inset-0 rounded-lg opacity-20"
            style={{
              background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), 
                ${confidence > 0.8 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(103, 254, 183, 0.2)'} 0%, 
                transparent 60%)`
            }}
          />
        )}
        
        {/* Pattern celebration overlay */}
        {showPatternCelebration && intensityLevel === 'enhanced' && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)`,
              animation: 'pattern-celebration 3s ease-out'
            }}
          />
        )}
      </div>
      
      {/* Main textarea */}
      <textarea
        ref={textareaRef}
        className="w-full min-h-[366px] px-6 py-6 bg-transparent text-gray-100 
                   placeholder-gray-500 font-mono resize-none focus:outline-none 
                   rounded-lg relative z-10 leading-relaxed"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          caretColor: confidence > 0.8 ? '#F59E0B' : '#65FEB7',
        }}
      />
      
      {/* Enhanced action buttons */}
      <div className="absolute right-4 top-6 flex flex-col space-y-3 z-20">
        {/* Enhance button with intelligence */}
        <button
          onClick={handleEnhance}
          disabled={isEnhancing || disabled || !value.trim()}
          className={`
            group relative flex items-center justify-center w-12 h-12 rounded-full
            transition-all duration-300 transform hover:scale-110 active:scale-95
            ${isEnhancing ? 'bg-ai-thinking/30' : 'bg-ai-thinking/10'}
            border border-ai-thinking/20 hover:border-ai-thinking/40
            ${value.trim() && patterns.length > 0 ? 'shadow-glow-ai-thinking' : ''}
            disabled:opacity-30 disabled:cursor-not-allowed
          `}
          aria-label="Enhance with AI"
        >
          {isEnhancing ? (
            <div className="relative">
              <svg className="animate-spin h-6 w-6 text-ai-thinking" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <div className="relative">
              <svg
                className="h-6 w-6 text-ai-thinking group-hover:text-ai-pattern-recognition transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              
              {/* Intelligence particles for high confidence */}
              {confidence > 0.8 && intensityLevel === 'enhanced' && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-ai-celebration-gold rounded-full animate-float"
                      style={{
                        top: `${-5 + i * 2}px`,
                        left: `${20 + i * 3}px`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          )}
          
          {/* Confidence ring */}
          {confidence > 0.3 && (
            <div className="absolute inset-0 rounded-full">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="rgba(52, 211, 153, 0.2)"
                  strokeWidth="1"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="125.66"
                  strokeDashoffset={125.66 * (1 - confidence)}
                  className="text-ai-thinking transition-all duration-1000"
                />
              </svg>
            </div>
          )}
        </button>
      </div>
      
      {/* Pattern insights panel */}
      <AnimatePresence>
        {showPatternInsights && (patterns.length > 0 || isAnalyzing) && (
          <motion.div
            className="absolute -bottom-2 left-0 right-0 translate-y-full z-30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-brand-cosmic-light/95 backdrop-blur-sm border border-brand-emerald-glow-subtle 
                           rounded-lg p-4 shadow-xl">
              {isAnalyzing ? (
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-ai-thinking rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300">Analyzing patterns...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Recognized patterns */}
                  {patterns.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-brand-emerald mb-2">
                        Recognized Patterns
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {patterns.map((pattern, index) => (
                          <motion.div
                            key={index}
                            className={`
                              px-3 py-1 rounded-full text-xs flex items-center space-x-1
                              ${pattern.confidence > 0.8 ? 
                                'bg-ai-celebration-gold/20 text-ai-celebration-gold border border-ai-celebration-gold/40' :
                                'bg-ai-thinking/20 text-ai-thinking border border-ai-thinking/40'
                              }
                            `}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <span className="capitalize">{pattern.type}</span>
                            <span className="text-xs opacity-70">
                              {Math.round(pattern.confidence * 100)}%
                            </span>
                            {pattern.confidence > 0.9 && <span>⭐</span>}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Cost estimation */}
                  {suggestedBtd && (
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Estimated: {suggestedBtd} $BTD, ~{suggestedDuration}min</span>
                      <span className={`
                        px-2 py-1 rounded
                        ${confidence > 0.8 ? 'bg-green-500/20 text-green-400' :
                          confidence > 0.6 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }
                      `}>
                        {Math.round(confidence * 100)}% confidence
                      </span>
                    </div>
                  )}
                  
                  {/* Learning insights */}
                  {learningInsights.length > 0 && intensityLevel === 'enhanced' && (
                    <div className="border-t border-gray-700 pt-2">
                      <div className="text-xs text-gray-400 italic">
                        💡 {learningInsights[0]}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Pattern celebration notification */}
      <AnimatePresence>
        {showPatternCelebration && intensityLevel !== 'subtle' && (
          <motion.div
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-40"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="bg-ai-celebration-gold/90 backdrop-blur-sm text-black px-4 py-2 
                           rounded-full text-sm font-medium shadow-xl flex items-center space-x-2">
              <span>✨</span>
              <span>Pattern mastery detected!</span>
              <span>⭐</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReadDefinitionInput;
