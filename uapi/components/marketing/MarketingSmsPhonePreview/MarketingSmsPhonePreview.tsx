"use client";

import React from 'react';

interface SmsPhonePreviewProps {
  className?: string;
  messages?: Array<{
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp?: string;
  }>;
}

export const SmsPhonePreview: React.FC<SmsPhonePreviewProps> = ({
  className = '',
  messages = [
    { id: '1', text: 'Hey! Can you help me with my project?', sender: 'user' },
    { id: '2', text: 'Absolutely! I\'d be happy to help. What kind of project are you working on?', sender: 'bot' },
    { id: '3', text: 'I read to build a dashboard for our analytics', sender: 'user' },
    { id: '4', text: 'Perfect! I can help you create a modern dashboard. Let me generate some components for you.', sender: 'bot' }
  ]
}) => {
  return (
    <div className={`relative mx-auto ${className}`}>
      {/* Phone Frame */}
      <div className="w-80 h-[600px] bg-black rounded-[3rem] p-2 shadow-2xl">
        <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
          {/* Status Bar */}
          <div className="h-6 bg-gray-50 flex justify-between items-center px-4 text-xs font-medium">
            <span>9:41 AM</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
              <div className="w-3 h-3 border border-gray-400 rounded-sm"></div>
            </div>
          </div>

          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-400 rounded-full"></div>
            <div>
              <div className="font-semibold">Bitcode Assistant</div>
              <div className="text-xs opacity-80">Online</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2">
                <span className="text-gray-400 text-sm">Type a message...</span>
              </div>
              <button className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
