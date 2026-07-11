'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhasePoetry {
  phase: 'planning' | 'creating' | 'refining' | 'testing' | 'delivering' | 'celebrating';
  emotion: 'anticipation' | 'flow' | 'focus' | 'confidence' | 'triumph' | 'fulfillment';
  narrative: string[];
  visualMetaphor: 'seed' | 'growing' | 'blooming' | 'crystallizing' | 'radiating' | 'transcending';
  timeInPhase: number;
  previousPhases: string[];
}

interface ShippableContext {
  name: string;
  category: 'component' | 'service' | 'feature' | 'refactor' | 'test' | 'documentation';
  complexity: 'simple' | 'moderate' | 'complex' | 'epic';
  patterns: string[];
  userIntent: string;
  creativeEnergy: number; // 0-1
  technicalDepth: number; // 0-1
}

interface PipelinePhasePoetryProps {
  /** Current phase of the AssetPack pipeline */
  currentPhase: PhasePoetry['phase'];
  
  /** Context about the Shippable being delivered from AssetPack evidence. */
  shippableContext: ShippableContext;
  
  /** Time spent in current phase (seconds) */
  timeInPhase?: number;
  
  /** Previous phases completed */
  completedPhases?: PhasePoetry['phase'][];
  
  /** Show poetry overlay */
  isVisible?: boolean;
  
  /** Poetry style and intensity */
  poetryStyle?: 'minimal' | 'flowing' | 'epic';
  
  /** Show emotional journey visualization */
  showEmotionalJourney?: boolean;
  
  /** Show phase progression visualization */
  showPhaseProgression?: boolean;
  
  /** Performance controls */
  respectReducedMotion?: boolean;
  
  /** Callbacks */
  onPhaseTransition?: (fromPhase: string, toPhase: string) => void;
  onEmotionalStateChange?: (emotion: string, intensity: number) => void;
  onNarrativeComplete?: (phase: string, narrative: string[]) => void;
}

// Poetry generation engine based on phase and context
const PHASE_POETRY_TEMPLATES = {
  planning: {
    anticipation: [
      "In the quiet space before creation...",
      "Ideas crystallize like morning dew",
      "Your vision takes its first breath",
      "The architecture of dreams begins"
    ],
    technical: [
      "Mapping the pathways of logic",
      "Each requirement a stepping stone",
      "Structure emerges from possibility",
      "The blueprint of excellence unfolds"
    ],
    creative: [
      "Imagination sparks to life",
      "Infinite possibilities dance",
      "The canvas awaits your vision",
      "Creation stirs in the depths of thought"
    ]
  },
  creating: {
    flow: [
      "Fingers dance across keys like rain",
      "Code flows like water finding its course", 
      "Each line builds upon the last",
      "The rhythm of creation carries you forward"
    ],
    focus: [
      "Deep in the zone of pure creation",
      "Time dissolves in focused flow",
      "Logic and artistry unite",
      "The work becomes meditation"
    ],
    energy: [
      "Electric with creative force",
      "Ideas cascade into reality",
      "The keyboard sings your vision",
      "Momentum builds with every keystroke"
    ]
  },
  refining: {
    craftsmanship: [
      "Polishing each edge to perfection",
      "Details matter in the pursuit of beauty",
      "Refinement reveals true elegance",
      "Excellence lives in the small touches"
    ],
    clarity: [
      "Complexity gives way to clarity",
      "Each iteration brings greater truth",
      "Simplicity emerges from complexity",
      "The essence shines through"
    ],
    mastery: [
      "The master's touch in every detail",
      "Years of learning guide each choice",
      "Wisdom transforms the ordinary",
      "Craft becomes art"
    ]
  },
  testing: {
    confidence: [
      "Trust builds with every passing test",
      "Confidence grows through validation",
      "Each green light a small victory",
      "Quality assurance becomes assurance of soul"
    ],
    resilience: [
      "Breaking to become unbreakable",
      "Edge cases reveal inner strength",
      "Every bug fixed makes us stronger",
      "Robustness through rigorous trial"
    ],
    precision: [
      "Measuring twice, coding once",
      "Precision in every assertion",
      "Testing the bounds of possibility",
      "Certainty through careful verification"
    ]
  },
  delivering: {
    triumph: [
      "The moment of truth arrives",
      "Your creation ready to serve",
      "From concept to reality complete",
      "The gift of your work enters the world"
    ],
    completion: [
      "The circle closes with delivery",
      "Purpose fulfilled in working code",
      "Your vision now lives and breathes",
      "The Shippable reaches its destination"
    ],
    impact: [
      "Ripples of change begin to spread",
      "Your work touches other lives",
      "Impact radiates from this moment",
      "The future shifts with your contribution"
    ]
  },
  celebrating: {
    fulfillment: [
      "Pause to honor what you've built",
      "Satisfaction settles in your soul",
      "The journey was worth every step",
      "Achievement tastes sweet and true"
    ],
    gratitude: [
      "Grateful for the gift of creation",
      "Thankful for the chance to build",
      "Appreciation for the path traveled",
      "Blessed to bring ideas to life"
    ],
    transcendence: [
      "You are more than when you started",
      "Growth lives in every line written",
      "The creator and creation both transformed",
      "Excellence becomes part of your being"
    ]
  }
};

const EMOTIONAL_COLORS = {
  anticipation: '#a78bfa', // purple
  flow: '#34d399', // emerald
  focus: '#06b6d4', // cyan
  confidence: '#67feb7', // brand emerald
  triumph: '#f59e0b', // amber
  fulfillment: '#ec4899', // pink
  craftsmanship: '#8b5cf6', // violet
  clarity: '#10b981', // emerald
  mastery: '#d97706', // orange
  resilience: '#ef4444', // red
  precision: '#3b82f6', // blue
  completion: '#67feb7', // brand emerald
  impact: '#f59e0b', // amber
  gratitude: '#ec4899', // pink
  transcendence: '#a855f7' // purple
};

// Device capability detection
const POETRY_QUALITY = (() => {
  if (typeof navigator === 'undefined') return 1;
  
  const mem = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  
  if (reducedMotion) return 0.3;
  
  const lowSpec = (mem && mem <= 4) || (cores && cores <= 4);
  return lowSpec ? 0.6 : 1;
})();

export const MarketingPipelinePhasePoetry = ({
  currentPhase,
  shippableContext,
  timeInPhase = 0,
  completedPhases = [],
  isVisible = true,
  poetryStyle = 'flowing',
  showEmotionalJourney = true,
  showPhaseProgression = true,
  respectReducedMotion = true,
  onPhaseTransition,
  onEmotionalStateChange,
  onNarrativeComplete
}: PipelinePhasePoetryProps) => {
  const [currentNarrative, setCurrentNarrative] = useState<string[]>([]);
  const [activeEmotion, setActiveEmotion] = useState<string>('anticipation');
  const [emotionalIntensity, setEmotionalIntensity] = useState(0.5);
  const [narrativeIndex, setNarrativeIndex] = useState(0);
  const [showFullPoetry, setShowFullPoetry] = useState(false);
  const poetryRef = useRef<HTMLDivElement>(null);
  const narrativeTimeoutRef = useRef<NodeJS.Timeout>();

  // Generate contextual poetry based on phase and Shippable context.
  const generatePoetry = useMemo(() => {
    const templates = PHASE_POETRY_TEMPLATES[currentPhase] as Record<string, string[]> | undefined;
    if (!templates) return [];

    // Choose poetry type based on Shippable context.
    let poetryType = '';
    
    switch (currentPhase) {
      case 'planning':
        poetryType = shippableContext.creativeEnergy > 0.7 ? 'creative' :
                    shippableContext.technicalDepth > 0.7 ? 'technical' : 'anticipation';
        break;
      case 'creating':
        poetryType = timeInPhase > 600 ? 'flow' : // 10+ minutes = flow state
                    shippableContext.creativeEnergy > 0.8 ? 'energy' : 'focus';
        break;
      case 'refining':
        poetryType = shippableContext.complexity === 'epic' ? 'mastery' :
                    shippableContext.technicalDepth > 0.8 ? 'craftsmanship' : 'clarity';
        break;
      case 'testing':
        poetryType = shippableContext.complexity === 'complex' ? 'resilience' :
                    completedPhases.length > 3 ? 'precision' : 'confidence';
        break;
      case 'delivering':
        poetryType = shippableContext.category === 'feature' ? 'impact' :
                    completedPhases.length > 4 ? 'completion' : 'triumph';
        break;
      case 'celebrating':
        poetryType = shippableContext.complexity === 'epic' ? 'transcendence' :
                    timeInPhase > 1800 ? 'fulfillment' : 'gratitude'; // 30+ minutes total
        break;
      default:
        poetryType = Object.keys(templates)[0] || '';
    }

    setActiveEmotion(poetryType);
    
    // Calculate emotional intensity based on context
    const intensity = Math.min(1, 
      (shippableContext.creativeEnergy + 
       shippableContext.technicalDepth + 
       (timeInPhase / 1800) + // normalize to 30 minutes
       (completedPhases.length / 6)) / 4 // 6 phases max
    );
    setEmotionalIntensity(intensity);
    
    return templates[poetryType] || [];
  }, [currentPhase, shippableContext, timeInPhase, completedPhases]);

  // Progressive narrative reveal
  useEffect(() => {
    if (!isVisible || generatePoetry.length === 0) return;
    
    setCurrentNarrative([]);
    setNarrativeIndex(0);
    
    const revealNarrative = () => {
      if (narrativeIndex < generatePoetry.length) {
        setCurrentNarrative(prev => [...prev, generatePoetry[narrativeIndex]]);
        setNarrativeIndex(prev => prev + 1);
        
        const delay = poetryStyle === 'minimal' ? 1000 :
                     poetryStyle === 'flowing' ? 2000 : 3000;
        
        narrativeTimeoutRef.current = setTimeout(revealNarrative, delay);
      } else {
        onNarrativeComplete?.(currentPhase, generatePoetry);
        
        // Show full poetry panel after individual lines
        setTimeout(() => setShowFullPoetry(true), 1000);
      }
    };
    
    revealNarrative();
    
    return () => {
      if (narrativeTimeoutRef.current) clearTimeout(narrativeTimeoutRef.current);
    };
  }, [generatePoetry, poetryStyle, isVisible, currentPhase, onNarrativeComplete]);

  // Notify emotional state changes
  useEffect(() => {
    onEmotionalStateChange?.(activeEmotion, emotionalIntensity);
  }, [activeEmotion, emotionalIntensity, onEmotionalStateChange]);

  // Phase transition detection
  const prevPhaseRef = useRef(currentPhase);
  useEffect(() => {
    if (prevPhaseRef.current !== currentPhase) {
      onPhaseTransition?.(prevPhaseRef.current, currentPhase);
      setShowFullPoetry(false);
      setNarrativeIndex(0);
      prevPhaseRef.current = currentPhase;
    }
  }, [currentPhase, onPhaseTransition]);

  // Generate phase progression visualization
  const phaseProgress = useMemo(() => {
    const allPhases: PhasePoetry['phase'][] = ['planning', 'creating', 'refining', 'testing', 'delivering', 'celebrating'];
    const currentIndex = allPhases.indexOf(currentPhase);
    
    return allPhases.map((phase, index) => ({
      phase,
      status: index < currentIndex ? 'completed' :
              index === currentIndex ? 'active' : 'upcoming',
      progress: index <= currentIndex ? 1 : 0
    }));
  }, [currentPhase, completedPhases]);

  // Emotional color for current state
  const emotionalColor = EMOTIONAL_COLORS[activeEmotion as keyof typeof EMOTIONAL_COLORS] || '#67feb7';

  if (!isVisible || POETRY_QUALITY < 0.3) return null;

  return (
    <div className="pipeline-phase-poetry fixed top-4 right-4 z-40 max-w-md">
      {/* Individual narrative lines */}
      <AnimatePresence>
        {currentNarrative.map((line, index) => (
          <motion.div
            key={`${currentPhase}-${index}`}
            className="mb-3"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            <div 
              className="bg-brand-cosmic-light/90 backdrop-blur-md border rounded-lg p-4 shadow-xl"
              style={{ 
                borderColor: `${emotionalColor}40`,
                boxShadow: `0 0 20px ${emotionalColor}20`
              }}
            >
              <div 
                className="text-sm italic font-light leading-relaxed"
                style={{ color: emotionalColor }}
              >
                {line}
              </div>
              
              {/* Emotional indicator */}
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-gray-400 capitalize">
                  {currentPhase}
                </span>
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: emotionalColor }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Phase progression indicator */}
      {showPhaseProgression && POETRY_QUALITY > 0.6 && (
        <motion.div
          className="mt-6 bg-brand-cosmic-dark/80 backdrop-blur-md border border-gray-700/30 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-xs text-gray-400 mb-3">Creative Journey</div>
          <div className="flex items-center space-x-2">
            {phaseProgress.map((phase, index) => (
              <div key={phase.phase} className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    phase.status === 'completed' ? 'bg-green-400' :
                    phase.status === 'active' ? 'bg-brand-emerald animate-pulse' :
                    'bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: phase.status === 'active' ? emotionalColor : undefined
                  }}
                />
                {index < phaseProgress.length - 1 && (
                  <div 
                    className={`w-4 h-px transition-all duration-500 ${
                      phase.status === 'completed' ? 'bg-green-400/50' : 'bg-gray-600/50'
                    }`} 
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            <span className="capitalize text-brand-emerald">{currentPhase}</span>
            {timeInPhase > 0 && (
              <span className="ml-2">
                {Math.floor(timeInPhase / 60)}:{String(timeInPhase % 60).padStart(2, '0')}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Emotional journey visualization */}
      {showEmotionalJourney && showFullPoetry && POETRY_QUALITY > 0.7 && (
        <motion.div
          className="mt-4 bg-brand-cosmic-dark/80 backdrop-blur-md border border-gray-700/30 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <div className="text-xs text-gray-400 mb-3">Emotional State</div>
          
          {/* Emotion indicator */}
          <div className="flex items-center space-x-3 mb-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ 
                backgroundColor: emotionalColor,
                boxShadow: `0 0 12px ${emotionalColor}60`
              }}
            />
            <div>
              <div 
                className="text-sm font-medium capitalize"
                style={{ color: emotionalColor }}
              >
                {activeEmotion}
              </div>
              <div className="text-xs text-gray-400">
                Intensity: {Math.round(emotionalIntensity * 100)}%
              </div>
            </div>
          </div>
          
          {/* Intensity bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full"
              style={{ backgroundColor: emotionalColor }}
              initial={{ width: 0 }}
              animate={{ width: `${emotionalIntensity * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}

      {/* Full poetry panel for epic style */}
      {poetryStyle === 'epic' && showFullPoetry && (
        <motion.div
          className="mt-4 bg-brand-cosmic-dark/90 backdrop-blur-xl border border-gray-700/30 rounded-lg p-6 max-w-sm"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
        >
          <div className="text-xs text-gray-400 mb-4">Complete Journey</div>
          <div className="space-y-3">
            {generatePoetry.map((line, index) => (
              <motion.div
                key={index}
                className="text-sm italic font-light leading-relaxed opacity-80"
                style={{ color: emotionalColor }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 0.8, x: 0 }}
                transition={{ delay: 1.7 + index * 0.2 }}
              >
                {line}
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700/30">
            <div className="text-xs text-gray-400">
              Shippable: <span className="text-brand-emerald">{shippableContext.name}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Complexity: <span className="text-brand-emerald capitalize">{shippableContext.complexity}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MarketingPipelinePhasePoetry;
