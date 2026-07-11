"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Command,
  Blocks,
  Brain,
  Cpu,
  Network,
  Fingerprint,
  Shield,
  BarChart3,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { DockContainer } from '../DockContainer';
import { useWeb3 } from '@/hooks/useWeb3';
import { useAI } from '@/hooks/useAI';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const { account, networkStatus } = useWeb3() as {
    account?: string;
    networkStatus?: string;
  };
  const bitcodeBalance = 0;
  const { aiStatus, activeAgents } = useAI();
  const [showCommandPalette, setShowCommandPalette] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);

  // Enterprise-grade keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // System status monitoring
  const systemStatus = {
    blockchain: networkStatus === 'connected' ? 'operational' : 'degraded',
    ai: aiStatus === 'ready' ? 'operational' : 'degraded',
    workflows: activeAgents.length > 0 ? 'operational' : 'standby',
    security: 'operational'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Enterprise Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm"
          >
            <div className="w-full max-w-2xl bg-gray-900/90 rounded-lg border border-gray-800 shadow-2xl">
              <div className="p-4">
                <div className="flex items-center space-x-2 text-gray-400 mb-4">
                  <Command className="w-4 h-4" />
                  <span>Command Palette</span>
                </div>
                <input
                  type="text"
                  placeholder="Search commands, features, or ask AI assistant..."
                  className="w-full bg-gray-800 border-0 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>
              <div className="border-t border-gray-800 p-2">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Brain, label: 'AI Assistance', shortcut: '⌘ A' },
                    { icon: Cpu, label: 'Workflow Control', shortcut: '⌘ G' },
                    { icon: Network, label: 'Network Status', shortcut: '⌘ N' },
                    { icon: Shield, label: 'Security Center', shortcut: '⌘ S' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-800 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <item.icon className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-300">{item.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{item.shortcut}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enterprise Status Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-40">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Blocks className="w-5 h-5 text-purple-500" />
              <span className="text-white font-medium">Bitcode Enterprise</span>
            </div>
            <div className="hidden laptop:flex items-center space-x-4 text-sm">
              {Object.entries(systemStatus).map(([key, status]) => (
                <div key={key} className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'operational' ? 'bg-green-500' :
                    status === 'degraded' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-gray-400 capitalize">{key}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {account ? (
              <span className="hidden laptop:inline text-xs text-gray-500">
                {bitcodeBalance} BTD
              </span>
            ) : null}
            <button
              onClick={() => setShowCommandPalette(true)}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-800 rounded-md hover:bg-gray-700"
            >
              <Command className="w-4 h-4" />
              <span className="hidden laptop:inline">Command</span>
              <span className="text-xs text-gray-500">⌘K</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-12 pb-20">
        {children}
      </div>

      {/* Enterprise Dock */}
      <DockContainer className="z-50" />

      {/* Enterprise Notifications */}
      <div className="fixed bottom-24 right-4 z-40 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 max-w-sm"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                  <p className="text-sm text-gray-400">{notification.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
