'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileTextIcon, CodeIcon, BookOpenIcon, CheckCircleIcon } from 'lucide-react';
import type { Gate } from '@bitcode/pipelines-generics';

export interface GuideIndicatorProps {
  currentGuide: Gate;
  completedGuides?: Gate[];
  collaborative?: boolean;
  className?: string;
  compact?: boolean;
}

const GUIDE_CONFIG = {
  Design: {
    icon: FileTextIcon,
    color: 'sky',
    label: 'Design',
    description: 'Iterating on PRODUCT.md',
    bgGradient: 'from-sky-700/25 to-sky-700/10',
    borderColor: 'border-sky-500/30',
    textColor: 'text-sky-200',
    iconColor: 'text-sky-400',
    dotColor: 'bg-sky-500',
  },
  Develop: {
    icon: CodeIcon,
    color: 'emerald',
    label: 'Develop',
    description: 'Implementing code changes',
    bgGradient: 'from-emerald-700/25 to-emerald-700/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-200',
    iconColor: 'text-emerald-400',
    dotColor: 'bg-emerald-500',
  },
  Digest: {
    icon: BookOpenIcon,
    color: 'amber',
    label: 'Digest',
    description: 'Capturing learnings in AGENTS.md',
    bgGradient: 'from-amber-700/25 to-amber-700/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-200',
    iconColor: 'text-amber-400',
    dotColor: 'bg-amber-500',
  },
};

export const GuideIndicator: React.FC<GuideIndicatorProps> = ({
  currentGuide,
  completedGuides = [],
  collaborative = false,
  className = '',
  compact = false,
}) => {
  const config = GUIDE_CONFIG[currentGuide];
  const Icon = config.icon;
  const guides: Gate[] = ['Design', 'Develop', 'Digest'];

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`h-2 w-2 ${config.dotColor} animate-pulse`} />
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.label}
        </span>
        {collaborative && (
          <span className="text-xs text-gray-400">(Collaborative)</span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-gradient-to-r from-gray-800/50 to-gray-900/50
        border border-gray-700/50
        px-6 py-4
        ${className}
      `}
    >
      {/* Stepwise Guide Indicator - Always shows all 3 guides */}
      <div className="flex items-center justify-center gap-8 mb-3">
        {guides.map((guide, index) => {
          const isActive = guide === currentGuide;
          const isComplete = completedGuides.includes(guide);
          const guideConfig = GUIDE_CONFIG[guide];
          const GuideIcon = guideConfig.icon;

          return (
            <div key={guide} className="flex items-center">
              {/* Guide Step */}
              <div className="flex flex-col items-center">
                {/* Step Number/Status */}
                <div className={`
                  relative flex items-center justify-center
                  w-10 h-10 font-bold text-sm
                  transition-all duration-300
                  ${isComplete
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? `${guideConfig.dotColor} text-white animate-pulse`
                      : 'bg-gray-700 text-gray-400 border-2 border-gray-600'
                  }
                `}>
                  {isComplete ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}

                  {/* Active pulse effect */}
                  {isActive && (
                    <motion.div
                      className={`absolute inset-0 ${guideConfig.dotColor}`}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </div>

                {/* Guide Label */}
                <div className={`mt-2 text-xs font-medium ${
                  isActive ? guideConfig.textColor :
                  isComplete ? 'text-green-400' :
                  'text-gray-500'
                }`}>
                  {guideConfig.label}
                </div>
              </div>

              {/* Connector Line */}
              {index < guides.length - 1 && (
                <div className={`
                  w-16 h-0.5 mx-2
                  ${isComplete ? 'bg-green-500' : 'bg-gray-700'}
                  ${isComplete && !completedGuides.includes(guides[index + 1]) ?
                    'bg-gradient-to-r from-green-500 to-gray-700' : ''}
                `} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Guide Details */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-700/50">
        {/* Icon with pulse animation */}
        <div className="relative">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>

        {/* Guide info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${config.textColor}`}>
              {config.label} Guide
            </span>
            {collaborative && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-700/50 text-gray-300 border border-gray-600/50">
                Collaborative
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{config.description}</p>
        </div>
      </div>

      {/* File restrictions hint */}
      {currentGuide === 'Design' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 pt-2 border-t border-gray-700/50"
        >
          <p className="text-xs text-sky-300/80">
            📝 Editing <span className="font-mono">.docs/PRODUCT.md</span> only
          </p>
        </motion.div>
      )}

      {currentGuide === 'Digest' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 pt-2 border-t border-gray-700/50"
        >
          <p className="text-xs text-amber-300/80">
            🧠 Update <span className="font-mono">.docs/AGENTS.md</span> with new learnings
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GuideIndicator;
