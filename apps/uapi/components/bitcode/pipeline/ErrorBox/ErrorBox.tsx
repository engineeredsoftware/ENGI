import React from 'react';
import { ReloadIcon } from "@radix-ui/react-icons";

interface ErrorBoxProps {
  error: string;
  onRetry: () => void;
  onDismiss: () => void;
}

export function ErrorBox({ error, onRetry, onDismiss }: ErrorBoxProps) {
  return (
    <div className="mt-6 mb-12 max-w-4xl mx-auto w-full px-12">
      <div className="relative w-full">
        <div className="absolute -inset-[2px] bg-gradient-to-r from-red-500/30 via-red-500/20 to-red-400/30 blur-lg opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-400/10 opacity-50" />
        <div className="relative px-6 py-4 bg-[#030816]/95 backdrop-blur-sm border border-red-500/20 text-red-400 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.02] via-red-500/[0.05] to-red-500/[0.02] animate-gradient opacity-80" />
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <div className="absolute inset-0 bg-red-400/20 blur-sm animate-pulse-slow" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="relative h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0
                  11-2 0 1 1 0 012 0zm-1-9a1 1 0
                  00-1 1v4a1 1 0 102 0V6a1 1 0
                  00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium tracking-wide text-lg">There was an error</span>
          </div>
          <div className="mt-3 mb-4">
            <div className="px-4 py-3 bg-red-500/5 border border-red-500/10">
              <p className="text-sm font-mono leading-relaxed break-words text-red-300">
                {error}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onRetry}
              className="relative group/error-btn min-w-[80px] px-3 py-1.5
 border border-red-500/20
 text-red-400
 hover:shadow-[0_0_12px_rgba(239,68,68,0.3)]
 hover:bg-red-500/5 transition-colors
 flex items-center justify-center"
            >
              <ReloadIcon className="mr-1.5 h-4 w-4 group-hover/error-btn:animate-spin" />
              <span>Retry</span>
            </button>
            <button
              onClick={onDismiss}
              className="relative group/error-btn min-w-[80px] px-3 py-1.5
 border border-red-500/20
 text-red-400
 hover:shadow-[0_0_12px_rgba(239,68,68,0.3)]
 hover:bg-red-500/5 transition-colors
 flex items-center justify-center"
            >
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

