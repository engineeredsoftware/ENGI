'use client';

/**
 * PIPELINE LOGS COMPACT RENDERER - ULTRA INLINE COMPACT MODE
 * 
 * Pipeline log visualization in ultra-compact inline mode.
 * Perfect for when "2 pipelines got started" and we want inline log views.
 */


import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ConversationRichResponseRendererProps, 
  PipelineLogsCompactData,
  ConversationRichAction 
} from '../../../types/conversations-rich-response';
import { usePipelineStream } from '../../../hooks/usePipelineStream';
import { ProcessingIndicator } from '@/components/conversations/ProcessingIndicator/ProcessingIndicator';

export const PipelineLogsCompactRenderer: React.FC<ConversationRichResponseRendererProps> = ({
  richResponse,
  messageId,
  conversationId,
  onAction,
  onUpdate,
  className = ''
}) => {
  const data = richResponse.data as PipelineLogsCompactData;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLive, setIsLive] = useState(data.status === 'running');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Real-time pipeline updates
  const { pipelineEvents, metrics } = usePipelineStream(data.runId, {
    enabled: isLive,
    onUpdate: (updateData) => {
      onUpdate?.(updateData);
    }
  });

  // Auto-scroll to latest logs when expanded
  useEffect(() => {
    if (isExpanded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data.recentLogs, isExpanded]);

  // Stop live updates when pipeline completes
  useEffect(() => {
    if (data.status !== 'running') {
      setIsLive(false);
    }
  }, [data.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-400 bg-blue-400/10';
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      case 'cancelled': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  const handleAction = (action: ConversationRichAction) => {
    onAction(action, { richResponseId: richResponse.id, pipelineId: data.runId });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`conversations-pipeline-logs-compact border border-border/50 rounded-lg bg-background/50 backdrop-blur-sm ${className}`}
    >
      {/* Compact Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {data.status === 'running' && (
              <ProcessingIndicator 
                status="thinking" 
                size="sm"
                className="w-4 h-4" 
              />
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
              {data.status.toUpperCase()}
            </span>
          </div>

          {/* Pipeline Info */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {data.pipelineType.charAt(0).toUpperCase() + data.pipelineType.slice(1)} Pipeline
            </span>
            <span className="text-xs text-muted-foreground">
              {data.currentPhase} • {data.progress.percentage}% complete
            </span>
          </div>
        </div>

        {/* Compact Metrics */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{formatDuration(data.metrics.duration)}</span>
          <span>{data.metrics.tokensUsed.toLocaleString()} tokens</span>
          <span>{data.metrics.btdConsumed.toFixed(3)} $BTD</span>
          
          {/* Expand/Collapse Icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground"
          >
            ↓
          </motion.div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-3 pb-3">
        <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${data.progress.percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Expanded Logs */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border/30"
          >
            {/* Recent Logs */}
            <div 
              ref={scrollRef}
              className="max-h-64 overflow-y-auto p-3 space-y-1"
            >
              <div className="text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-background/80 backdrop-blur-sm">
                Recent Activity
              </div>
              
              {data.recentLogs.map((log, index) => (
                <motion.div
                  key={`${log.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-2 text-xs py-1 hover:bg-muted/20 rounded px-2 -mx-2"
                >
                  <span className="text-muted-foreground font-mono min-w-[60px]">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  
                  <span className={`font-medium min-w-[50px] ${getLogLevelColor(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  
                  {log.phase && (
                    <span className="text-muted-foreground min-w-[80px] bg-muted/30 px-1 rounded">
                      {log.phase}
                    </span>
                  )}
                  
                  {log.agent && (
                    <span className="text-blue-400 min-w-[60px] bg-blue-400/10 px-1 rounded">
                      {log.agent}
                    </span>
                  )}
                  
                  <span className="text-foreground flex-1">
                    {log.message}
                  </span>
                </motion.div>
              ))}
              
              {data.recentLogs.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No recent logs available
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="border-t border-border/30 p-3 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction({
                    id: 'view_detailed',
                    type: 'navigate',
                    label: 'View Detailed Logs',
                    handler: 'view_detailed_logs'
                  })}
                  className="text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-2 py-1 rounded transition-colors"
                >
                  Detailed View
                </button>
                
                <button
                  onClick={() => handleAction({
                    id: 'download_logs',
                    type: 'download',
                    label: 'Download Logs',
                    handler: 'download_pipeline_logs'
                  })}
                  className="text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 px-2 py-1 rounded transition-colors"
                >
                  Download
                </button>
                
                {data.status === 'running' && (
                  <button
                    onClick={() => handleAction({
                      id: 'stop_pipeline',
                      type: 'execute',
                      label: 'Stop Pipeline',
                      handler: 'stop_pipeline',
                      config: {
                        confirmation: {
                          required: true,
                          message: 'Are you sure you want to stop this pipeline?'
                        }
                      }
                    })}
                    className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2 py-1 rounded transition-colors"
                  >
                    Stop
                  </button>
                )}
              </div>

              {/* Live Update Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Live</span>
                <motion.button
                  onClick={() => setIsLive(!isLive)}
                  disabled={data.status !== 'running'}
                  className={`w-8 h-4 rounded-full transition-colors ${
                    isLive && data.status === 'running' 
                      ? 'bg-green-500' 
                      : 'bg-muted'
                  } ${data.status !== 'running' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <motion.div
                    animate={{ x: isLive && data.status === 'running' ? 16 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-3 h-3 bg-white rounded-full shadow-sm"
                  />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Connection Indicator */}
      {isLive && data.status === 'running' && (
        <div className="absolute top-2 right-2">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-2 h-2 bg-green-400 rounded-full"
          />
        </div>
      )}
    </motion.div>
  );
};

export default PipelineLogsCompactRenderer;
