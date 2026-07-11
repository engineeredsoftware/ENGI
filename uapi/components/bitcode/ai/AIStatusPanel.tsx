import { useAI } from '@/hooks/useAI';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';

const AIStatusPanel = () => {
  const { aiStatus, activeAgents, analysis, assistants } = useAI();

  const getStatusIcon = (status: 'initializing' | 'ready' | 'error') => {
    switch (status) {
      case 'initializing':
        return <Activity className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return 'text-yellow-400';
      case 'medium':
        return 'text-orange-400';
      case 'high':
        return 'text-red-400';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6">
      {/* AI System Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">AI System Status</h2>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(aiStatus)}
          <span className="text-sm text-gray-400 capitalize">{aiStatus}</span>
        </div>
      </div>

      {/* Active Agents */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400">Active Agents</h3>
        <AnimatePresence>
          {activeAgents.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800 rounded-md p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{agent.name}</span>
                <span className="text-xs text-gray-400 capitalize">{agent.status}</span>
              </div>
              {agent.status === 'working' && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-400">Latest Analysis</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-md p-4">
              <div className="text-sm text-gray-400 mb-1">Code Quality</div>
              <div className="text-2xl font-bold text-white">{analysis.codeQuality}%</div>
            </div>
            <div className="bg-gray-800 rounded-md p-4">
              <div className="text-sm text-gray-400 mb-1">Security Score</div>
              <div className="text-2xl font-bold text-white">{analysis.securityScore}%</div>
            </div>
            <div className="bg-gray-800 rounded-md p-4">
              <div className="text-sm text-gray-400 mb-1">Gas Efficiency</div>
              <div className="text-2xl font-bold text-white">{analysis.performanceMetrics.gasEfficiency}%</div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="bg-gray-800 rounded-md p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className={`w-4 h-4 ${getSeverityColor(suggestion.severity)}`} />
                  <span className="text-sm font-medium text-white">{suggestion.type}</span>
                </div>
                <p className="text-sm text-gray-400">{suggestion.message}</p>
                {suggestion.location && (
                  <div className="mt-2 text-xs text-gray-500">
                    {suggestion.location.file}:{suggestion.location.line}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Assistants */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400">Available Assistants</h3>
        <div className="grid grid-cols-1 gap-4">
          {assistants.map((assistant) => (
            <div
              key={assistant.id}
              className={`bg-gray-800 rounded-md p-4 border-l-4 ${
                assistant.isActive ? 'border-green-500' : 'border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{assistant.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    assistant.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {assistant.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {assistant.capabilities.map((capability, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded-full"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIStatusPanel;
