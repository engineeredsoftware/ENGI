/**
 * CONVERSATIONS LEARNING DEMO - INTERACTIVE DOCUMENTATION EXPERIENCE
 * 
 * Adapted from marketing chat-experience.tsx but specifically tuned for learning.
 * Embedded in documentation to provide hands-on learning experience.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, BookOpen, Zap, Target, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface LearningMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLearningPoint?: boolean;
  richResponse?: {
    type: 'pipeline_logs' | 'code_diff' | 'data_table';
    data: any;
  };
}

interface LearningLesson {
  id: string;
  title: string;
  description: string;
  prompt: string;
  expectedLearning: string[];
  category: 'basics' | 'workflows' | 'advanced';
}

const LEARNING_LESSONS: LearningLesson[] = [
  {
    id: 'first-chat',
    title: 'Your First Chat',
    description: 'Learn how natural conversation becomes software',
    prompt: 'Add dark mode to my React app',
    expectedLearning: [
      'Natural language input processing',
      'Context gathering and clarification',
      'Pipeline creation from conversation'
    ],
    category: 'basics'
  },
  {
    id: 'rich-responses',
    title: 'Rich Response System',
    description: 'See how Conversations returns rich, interactive content',
    prompt: 'What are all the pipelines running right now?',
    expectedLearning: [
      'Auto-rich text replacement',
      'Real-time pipeline status cards',
      'Interactive data visualization'
    ],
    category: 'basics'
  },
  {
    id: 'otf-instructions',
    title: 'On-The-Fly Instructions',
    description: 'Learn to deposit live instructions to running pipelines',
    prompt: 'Send to all pipelines: use TypeScript strict mode',
    expectedLearning: [
      'Active execution targeting',
      'Real-time instruction delivery',
      'Cross-system coordination'
    ],
    category: 'advanced'
  },
  {
    id: 'asset-pack-workflow',
    title: 'AssetPack Workflow',
    description: 'Complete feature development from idea to PR',
    prompt: 'Create a user authentication system with JWT',
    expectedLearning: [
      'End-to-end workflow automation',
      'Code generation and review',
      'Pull request creation'
    ],
    category: 'workflows'
  },
  {
    id: 'conversation-management',
    title: 'Conversation Management',
    description: 'Organize and reference conversations effectively',
    prompt: 'Reference the auth conversation and add password reset',
    expectedLearning: [
      'Conversation referencing syntax',
      'Context preservation',
      'Building on previous work'
    ],
    category: 'workflows'
  }
];

interface Props {
  mode?: 'learning' | 'showcase';
  userId?: string;
  lessonPath?: string;
  enableSandbox?: boolean;
  progressTracking?: boolean;
  className?: string;
}

export const ConversationLearningDemo: React.FC<Props> = ({
  mode = 'learning',
  userId,
  lessonPath = 'getting-started',
  enableSandbox = true,
  progressTracking = true,
  className = ''
}) => {
  const [currentLesson, setCurrentLesson] = useState<LearningLesson | null>(null);
  const [messages, setMessages] = useState<LearningMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [learningProgress, setLearningProgress] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Filter lessons based on lesson path
  const availableLessons = LEARNING_LESSONS.filter(lesson => {
    if (lessonPath === 'getting-started') {
      return lesson.category === 'basics';
    }
    if (lessonPath === 'workflows') {
      return lesson.category === 'workflows';
    }
    if (lessonPath === 'advanced') {
      return lesson.category === 'advanced';
    }
    return true;
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'system',
        content: `Welcome to Conversations Learning! 🔥\n\nI'm your interactive guide to the future of software creation. Choose a lesson below or try your own prompts to see Conversations in action.\n\n${enableSandbox ? 'This is a safe sandbox environment - experiment freely!' : 'Connected to your real Conversations instance.'}`,
        timestamp: new Date(),
        isLearningPoint: true
      }]);
    }
  }, [enableSandbox]);

  const startLesson = (lesson: LearningLesson) => {
    setCurrentLesson(lesson);
    setInputValue(lesson.prompt);
    
    // Add lesson introduction
    const lessonIntro: LearningMessage = {
      id: `lesson-${lesson.id}`,
      type: 'system',
      content: `**Lesson: ${lesson.title}**\n\n${lesson.description}\n\nTry this prompt: "${lesson.prompt}"\n\n*Learning objectives:*\n${lesson.expectedLearning.map(obj => `• ${obj}`).join('\n')}`,
      timestamp: new Date(),
      isLearningPoint: true
    };

    setMessages(prev => [...prev, lessonIntro]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: LearningMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate Conversations response or use real API
    if (enableSandbox) {
      await simulateConversationResponse(userMessage.content);
    } else if (userId) {
      await sendToRealConversation(userMessage.content);
    }
  };

  const simulateConversationResponse = async (prompt: string) => {
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    let response: LearningMessage;

    // Generate contextual learning responses
    if (prompt.toLowerCase().includes('dark mode')) {
      response = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: `I'll help you add dark mode to your React app! Let me gather some context first.\n\n**Questions for you:**\n1. Are you using a specific UI library (Material-UI, Tailwind, etc.)?\n2. Do you want system preference detection?\n3. Should this persist user preference?\n\nI'm creating an AssetPack pipeline that will:\n• Set up theme context\n• Add toggle component\n• Update existing components\n• Add persistence logic`,
        timestamp: new Date(),
        richResponse: {
          type: 'pipeline_logs',
          data: {
            status: 'running',
            phase: 'discovery',
            progress: 25
          }
        }
      };
    } else if (prompt.toLowerCase().includes('pipelines running')) {
      response = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: `Here are your currently active pipelines:`,
        timestamp: new Date(),
        richResponse: {
          type: 'data_table',
          data: {
            columns: ['Pipeline', 'Type', 'Status', 'Progress'],
            rows: [
              ['Dark Mode Feature', 'AssetPack', 'Running', '45%'],
              ['Auth System Upgrade', 'Upgrade', 'Pending', '0%'],
              ['Database Migration', 'AssetPack', 'Completed', '100%']
            ]
          }
        }
      };
    } else if (prompt.toLowerCase().includes('send to all')) {
      response = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: `Broadcasting instruction to all active pipelines...\n\n✅ **Instruction sent successfully to 3 pipelines:**\n• Dark Mode Feature (AssetPack)\n• Auth System Upgrade (upgrade)\n• API Documentation (AssetPack)\n\nAll pipelines will now use TypeScript strict mode for enhanced type safety.`,
        timestamp: new Date()
      };
    } else {
      response = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: `Great question! I understand you want to ${prompt.toLowerCase()}.\n\nIn a real Conversations environment, I would:\n1. Analyze your request and gather context\n2. Create appropriate pipelines\n3. Execute the work with real-time updates\n4. Provide rich, interactive results\n\n*This is a learning demo - try the suggested lessons to see specific Conversations capabilities!*`,
        timestamp: new Date()
      };
    }

    setMessages(prev => [...prev, response]);
    setIsTyping(false);

    // Mark lesson as completed if it matches
    if (currentLesson && prompt === currentLesson.prompt) {
      setCompletedLessons(prev => new Set([...prev, currentLesson.id]));
      setLearningProgress(prev => ({ ...prev, [currentLesson.id]: true }));
    }
  };

  const sendToRealConversation = async (prompt: string) => {
    // Implementation for real Conversations API
    // This would use the actual /api/chat/stream endpoint
    setIsTyping(false);
  };

  const resetDemo = () => {
    setMessages([]);
    setCurrentLesson(null);
    setInputValue('');
    setIsTyping(false);
    // Re-initialize with welcome message
    setTimeout(() => {
      setMessages([{
        id: 'welcome-reset',
        type: 'system',
        content: `Demo reset! Ready for another round of learning? 🚀`,
        timestamp: new Date(),
        isLearningPoint: true
      }]);
    }, 100);
  };

  const renderRichResponse = (richResponse: any) => {
    switch (richResponse.type) {
      case 'pipeline_logs':
        return (
          <div className="mt-3 bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Pipeline Status: {richResponse.data.status}</span>
            </div>
            <div className="space-y-1">
              <div>Phase: {richResponse.data.phase}</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${richResponse.data.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      
      case 'data_table':
        return (
          <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {richResponse.data.columns.map((col: string, idx: number) => (
                    <th key={idx} className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {richResponse.data.rows.map((row: string[], idx: number) => (
                  <tr key={idx} className="border-t dark:border-gray-600">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`conversations-learning-demo bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Conversations Learning Demo</h3>
              <p className="text-sm text-emerald-100">
                {enableSandbox ? 'Safe Sandbox Environment' : 'Connected to Real Conversations'}
              </p>
            </div>
          </div>
          <button
            onClick={resetDemo}
            className="text-white/80 hover:text-white transition-colors"
            title="Reset Demo"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Learning Lessons */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Choose a Lesson:
        </h4>
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-2">
          {availableLessons.map(lesson => (
            <button
              key={lesson.id}
              onClick={() => startLesson(lesson)}
              className={`text-left p-3 rounded-lg border transition-all ${
                completedLessons.has(lesson.id)
                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{lesson.title}</div>
                  <div className="text-xs opacity-75">{lesson.description}</div>
                </div>
                {completedLessons.has(lesson.id) ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowRight className="w-4 h-4 opacity-50" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg p-3 ${
              message.type === 'user'
                ? 'bg-blue-600 text-white'
                : message.type === 'system'
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
                : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
            }`}>
              <div className="whitespace-pre-wrap text-sm">
                {message.content}
              </div>
              {message.richResponse && renderRichResponse(message.richResponse)}
              {message.isLearningPoint && (
                <div className="mt-2 flex items-center gap-1 text-xs opacity-75">
                  <Target className="w-3 h-3" />
                  Learning Point
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Conversations anything, or try a lesson above..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {progressTracking && completedLessons.size > 0 && (
          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            Progress: {completedLessons.size}/{availableLessons.length} lessons completed
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationLearningDemo;
