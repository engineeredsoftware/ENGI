'use client';

import React, { useState, useEffect } from 'react';
import { ClockIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface InstructionConfidenceTimerProps {
  /**
   * Time remaining in seconds until agent proceeds autonomously
   */
  timeRemaining: number;

  /**
   * Confidence level for current instruction readiness
   * - high: Agent has high confidence, likely doesn't read intervention
   * - medium: Agent could benefit from guidance
   * - low: Agent needs instruction to proceed optimally
   */
  confidenceLevel: 'high' | 'medium' | 'low';

  /**
   * Whether the timer is actively counting down
   */
  isActive?: boolean;

  /**
   * Callback when timer expires
   */
  onTimerExpire?: () => void;

  /**
   * Callback when user provides instruction
   */
  onInstructionProvided?: () => void;

  /**
   * Current execution phase for context
   */
  currentPhase?: string;

  /**
   * Current agent name for context
   */
  currentAgent?: string;

  className?: string;
}

const confidenceConfig = {
  high: {
    color: 'emerald',
    label: 'High Confidence',
    description: 'Agent proceeding optimally',
    icon: CheckCircleIcon,
  },
  medium: {
    color: 'sky',
    label: 'Medium Confidence',
    description: 'Guidance may help',
    icon: ClockIcon,
  },
  low: {
    color: 'amber',
    label: 'Low Confidence',
    description: 'Instruction recommended',
    icon: AlertCircleIcon,
  },
};

const formatTime = (seconds: number): string => {
  if (seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const InstructionConfidenceTimer: React.FC<InstructionConfidenceTimerProps> = ({
  timeRemaining: initialTimeRemaining,
  confidenceLevel,
  isActive = true,
  onTimerExpire,
  onInstructionProvided,
  currentPhase,
  currentAgent,
  className = '',
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining);
  const [hasExpired, setHasExpired] = useState(false);

  const config = confidenceConfig[confidenceLevel];
  const Icon = config.icon;

  // Countdown timer
  useEffect(() => {
    if (!isActive || hasExpired || timeRemaining <= 0) {
      if (timeRemaining <= 0 && !hasExpired) {
        setHasExpired(true);
        onTimerExpire?.();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setHasExpired(true);
          onTimerExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, hasExpired, timeRemaining, onTimerExpire]);

  // Reset when initial time changes (new phase/agent)
  useEffect(() => {
    setTimeRemaining(initialTimeRemaining);
    setHasExpired(false);
  }, [initialTimeRemaining, currentPhase, currentAgent]);

  // Calculate urgency (percentage of time elapsed)
  const urgency = 1 - (timeRemaining / initialTimeRemaining);
  const isUrgent = urgency > 0.7;
  const isCritical = urgency > 0.9;

  // Color classes based on confidence and urgency
  const getColorClasses = () => {
    if (hasExpired) {
      return {
        bg: 'bg-gray-700/40',
        border: 'border-gray-600/50',
        text: 'text-gray-400',
        icon: 'text-gray-400',
        progress: 'bg-gray-500',
      };
    }

    if (isCritical) {
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-300',
        icon: 'text-red-400',
        progress: 'bg-red-500',
      };
    }

    if (isUrgent) {
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-300',
        icon: 'text-amber-400',
        progress: 'bg-amber-500',
      };
    }

    const colorMap = {
      emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-300',
        icon: 'text-emerald-400',
        progress: 'bg-emerald-500',
      },
      sky: {
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/30',
        text: 'text-sky-300',
        icon: 'text-sky-400',
        progress: 'bg-sky-500',
      },
      amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-300',
        icon: 'text-amber-400',
        progress: 'bg-amber-500',
      },
    };

    return colorMap[config.color as keyof typeof colorMap];
  };

  const colors = getColorClasses();

  return (
    <div className={`${className}`}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={` border ${colors.border} ${colors.bg} overflow-hidden`}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${colors.icon}`} />
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${colors.text}`}>
                {hasExpired ? 'Agent Proceeding' : config.label}
              </span>
              <span className="text-xs text-gray-400">
                {hasExpired ? 'Continuing autonomously' : config.description}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Context Info */}
            {currentPhase && (
              <div className="text-right">
                <div className="text-xs text-gray-400">Phase</div>
                <div className="text-sm font-medium text-gray-200">{currentPhase}</div>
              </div>
            )}

            {/* Timer Display */}
            <div className="text-right min-w-[80px]">
              <div className="text-xs text-gray-400">
                {hasExpired ? 'Elapsed' : 'Time Remaining'}
              </div>
              <div className={`text-2xl font-mono font-bold ${colors.text}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-800">
          <motion.div
            className={`h-full ${colors.progress}`}
            initial={{ width: '0%' }}
            animate={{ width: `${urgency * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Instruction Prompt (only show if not high confidence and not expired) */}
        <AnimatePresence>
          {!hasExpired && confidenceLevel !== 'high' && urgency > 0.5 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-700/50 px-4 py-3 bg-gray-800/30"
            >
              <div className="flex items-start gap-2">
                <AlertCircleIcon className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-300">
                    {confidenceLevel === 'low' ? (
                      <>Provide on-the-fly instructions to guide the agent's next actions.</>
                    ) : (
                      <>Optional: Provide guidance to refine the agent's approach.</>
                    )}
                  </p>
                  {currentAgent && (
                    <p className="text-xs text-gray-400 mt-1">
                      Current agent: <span className="font-mono text-gray-300">{currentAgent}</span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Instructions Note */}
      {!hasExpired && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-gray-500 mt-2 text-center"
        >
          Agent will proceed autonomously when timer expires. Provide instructions anytime to adjust course.
        </motion.p>
      )}
    </div>
  );
};

export default InstructionConfidenceTimer;
