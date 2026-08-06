'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircledIcon, 
  CrossCircledIcon, 
  InfoCircledIcon,
  ExclamationTriangleIcon 
} from '@radix-ui/react-icons';

export interface ThinkingLogEntry {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  content: string;
  timestamp: Date;
}

interface ThinkingLogProps {
  entries: ThinkingLogEntry[];
  className?: string;
  maxHeight?: string;
  showTimestamps?: boolean;
}

export const ThinkingLog: React.FC<ThinkingLogProps> = ({
  entries,
  className = '',
  maxHeight = '200px',
  showTimestamps = true
}) => {
  const getIcon = (type: ThinkingLogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircledIcon className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <CrossCircledIcon className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />;
      case 'info':
      default:
        return <InfoCircledIcon className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTypeStyles = (type: ThinkingLogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-500/5';
      case 'error':
        return 'border-red-500/20 bg-red-500/5';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/5';
      case 'info':
      default:
        return 'border-blue-500/20 bg-blue-500/5';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (entries.length === 0) {
    return null;
  }

  return (
    <div 
      className={`thinking-log ${className}`}
      style={{ maxHeight, overflowY: 'auto' }}
    >
      <AnimatePresence initial={false}>
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`
              thinking-log-entry 
              flex items-start gap-2 p-2 mb-1 
              rounded-md border 
              ${getTypeStyles(entry.type)}
            `}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(entry.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 break-words">
                {entry.content}
              </p>
            </div>
            {showTimestamps && (
              <div className="flex-shrink-0 text-xs text-gray-500">
                {formatTimestamp(entry.timestamp)}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};