'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VCSProviderType } from '@bitcode/vcs-core';
import { Github, GitBranch } from 'lucide-react';
import { cn } from '@bitcode/styling';
import { pillStyles } from '@/styles/select-styles';

interface VCSIconSelectorProps {
  value: VCSProviderType | null;
  connections: any[];
  onChange: (provider: VCSProviderType | null) => void;
  disabled?: boolean;
  className?: string;
}

const providerConfig = {
  github: {
    label: 'GitHub',
    icon: Github,
  },
  gitlab: {
    label: 'GitLab', 
    icon: GitBranch,
  },
  bitbucket: {
    label: 'Bitbucket',
    icon: GitBranch,
  }
} as const;

export function VCSIconSelector({
  value,
  connections,
  onChange,
  disabled = false,
  className
}: VCSIconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-select logic:
    // 1. If only one connection, select it
    // 2. Otherwise fallback to GitHub if available
    if (!value && connections.length > 0) {
      if (connections.length === 1) {
        onChange(connections[0].provider as VCSProviderType);
      } else {
        // Fallback to GitHub if available
        const githubConnection = connections.find(c => c.provider === 'github');
        if (githubConnection) {
          onChange('github');
        } else {
          // Select first available provider
          onChange(connections[0].provider as VCSProviderType);
        }
      }
    }
  }, [connections, value, onChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Always show the selector, default to GitHub icon when no connections
  const selectedProvider = value || 
    (connections.length === 1 ? connections[0].provider : 
     connections.find(c => c.provider === 'github')?.provider || 
     connections[0]?.provider || 
     'github');
  const Icon = providerConfig[selectedProvider as VCSProviderType]?.icon || Github;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center w-9 h-9 transition-all",
          "bg-[rgba(3,8,22,0.9)] border border-[rgba(103,254,183,0.1)]",
          "hover:border-[rgba(103,254,183,0.3)] hover:shadow-[0_0_12px_rgba(103,254,183,0.2)]",
          "cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "border-[rgba(103,254,183,0.3)] shadow-[0_0_12px_rgba(103,254,183,0.2)]",
          className
        )}
        aria-label="Select VCS Provider"
      >
        <Icon className="w-3 h-3 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 z-50 min-w-[150px] border border-gray-700 bg-[#030816] shadow-lg">
          {Object.entries(providerConfig).map(([providerKey, config]) => {
            const provider = providerKey as VCSProviderType;
            const ItemIcon = config.icon;
            const isSelected = provider === value;
            const hasConnection = connections.some(c => c.provider === provider);

            return (
              <button
                key={provider}
                onClick={() => {
                  if (hasConnection) {
                    onChange(provider);
                    setIsOpen(false);
                  }
                }}
                disabled={!hasConnection}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors",
                  hasConnection ? "hover:bg-white/10 cursor-pointer" : "opacity-40 cursor-not-allowed",
                  isSelected && "bg-white/5"
                )}
              >
                <ItemIcon className="w-3 h-3 opacity-70" />
                <span className="text-gray-300">{config.label}</span>
                {isSelected && (
                  <svg className="w-3 h-3 ml-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
