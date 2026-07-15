'use client';

import React, { useState, useEffect } from 'react';
import { IntelligentProcessingIndicator } from '../intelligent-processing-indicator';

/**
 * Demo component showing how to integrate the Intelligent Processing Indicator
 * with the Bitcode AssetPack execution pipeline
 */
export const IntelligentProcessingDemo = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'setup' | 'discovery' | 'implementation' | 'validation' | 'finish'>('setup');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [recognizedPattern, setRecognizedPattern] = useState<any>(null);

  // Simulate processing pipeline
  const startProcessing = () => {
    setIsProcessing(true);
    setCurrentPhase('setup');
    setPhaseProgress(0);
    
    // Simulate pattern recognition after a moment
    setTimeout(() => {
      setRecognizedPattern({
        type: 'component',
        confidence: 0.85,
        previousSuccess: true,
        complexity: 'moderate'
      });
    }, 1500);
    
    // Simulate phase progression
    const phases: typeof currentPhase[] = ['setup', 'discovery', 'implementation', 'validation', 'finish'];
    let phaseIndex = 0;
    
    const progressInterval = setInterval(() => {
      setPhaseProgress(prev => {
        if (prev >= 1) {
          phaseIndex++;
          if (phaseIndex >= phases.length) {
            clearInterval(progressInterval);
            setIsProcessing(false);
            return 1;
          }
          setCurrentPhase(phases[phaseIndex]);
          return 0;
        }
        return prev + 0.1;
      });
    }, 300);
  };

  return (
    <div className="p-8 space-y-6 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-light text-brand-emerald mb-4">
          Intelligent Processing Demo
        </h2>
        
        <button
          onClick={startProcessing}
          disabled={isProcessing}
          className="px-6 py-3 bg-brand-cosmic-light border border-brand-emerald-glow rounded-lg
                     text-brand-emerald hover:bg-brand-cosmic-lighter transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Start Demo'}
        </button>
      </div>
      
      {isProcessing && (
        <div className="flex justify-center">
          <IntelligentProcessingIndicator
            repositoryContext={{
              language: 'TypeScript',
              architecture: 'React/Next.js',
              testCoverage: 94,
              componentCount: 247
            }}
            recognizedPattern={recognizedPattern}
            currentPhase={currentPhase}
            phaseProgress={phaseProgress}
            userPatternLearned={true}
            qualityConfidence={0.9}
            showIntelligence={true}
            intensityLevel="enhanced"
          />
        </div>
      )}
      
      {isProcessing && (
        <div className="text-center space-y-2 text-sm text-gray-400">
          <div>Phase: <span className="text-brand-emerald capitalize">{currentPhase}</span></div>
          <div>Progress: <span className="text-brand-emerald">{Math.round(phaseProgress * 100)}%</span></div>
          {recognizedPattern && (
            <div>Pattern: <span className="text-ai-pattern-recognition">
              {recognizedPattern.type} ({Math.round(recognizedPattern.confidence * 100)}% confidence)
            </span></div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntelligentProcessingDemo;
