'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { VCSProviderType, VCSConnection, VCSRepository } from '@bitcode/vcs-generics-core';
import { Github, GitBranch, ChevronDown, X } from 'lucide-react';
import { cn } from '@bitcode/styling';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/Popover/Popover';
import { Badge } from '@/components/shadcn/Badge/Badge';
import { Button } from '@/components/shadcn/Button/Button';
import { VCSRepositorySelector } from '@/components/bitcode/vcs/VCSRepositorySelector/VCSRepositorySelector';

interface VCSSourceBadgeProps {
  value?: {
    provider: VCSProviderType;
    repository: VCSRepository;
  };
  onChange: (source: {
    provider: VCSProviderType;
    repository: VCSRepository;
  } | undefined) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  allowClear?: boolean;
}

const providerConfig = {
  github: {
    label: 'GitHub',
    icon: Github,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-900',
    borderColor: 'border-gray-300',
    hoverColor: 'hover:bg-gray-200'
  },
  gitlab: {
    label: 'GitLab',
    icon: GitBranch,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    hoverColor: 'hover:bg-orange-100'
  },
  bitbucket: {
    label: 'Bitbucket',
    icon: GitBranch,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    hoverColor: 'hover:bg-blue-100'
  }
} as const;

export function VCSSourceBadge({
  value,
  onChange,
  className,
  variant = 'default',
  allowClear = true
}: VCSSourceBadgeProps) {
  const [open, setOpen] = useState(false);
  const [connections, setConnections] = useState<VCSConnection[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<VCSProviderType | undefined>(
    value?.provider
  );
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_vcs_connections')
        .select('*')
        .eq('userId', user.id);

      if (error) throw error;
      
      setConnections(data || []);
      
      // Auto-select if only one connection and no value
      if (data && data.length === 1 && !value) {
        setSelectedProvider(data[0].provider as VCSProviderType);
      }
    } catch (error) {
      console.error('Failed to load VCS connections:', error);
    }
  };

  const handleRepositorySelect = (repository: VCSRepository) => {
    if (selectedProvider) {
      onChange({ provider: selectedProvider, repository });
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setSelectedProvider(undefined);
  };

  if (connections.length === 0) {
    return null;
  }

  // If value is set, show the selected repository
  if (value) {
    const config = providerConfig[value.provider];
    const Icon = config.icon;

    if (variant === 'minimal') {
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1 pr-1",
            config.borderColor,
            className
          )}
        >
          <Icon className="h-3 w-3" />
          <span className="text-xs">{value.repository.name}</span>
          {allowClear && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Badge>
      );
    }

    return (
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">
          {variant === 'compact' ? value.repository.name : value.repository.fullName}
        </span>
        {allowClear && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 hover:bg-transparent"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  // Show selector
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2",
            variant === 'minimal' && "h-7 px-2 text-xs",
            className
          )}
        >
          <GitBranch className={cn(
            "text-muted-foreground",
            variant === 'minimal' ? "h-3 w-3" : "h-4 w-4"
          )} />
          <span>Select repository</span>
          <ChevronDown className={cn(
            "text-muted-foreground",
            variant === 'minimal' ? "h-3 w-3" : "h-4 w-4"
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-3" align="start">
        <div className="space-y-3">
          <div className="text-sm font-medium">Select source repository</div>
          
          {/* Provider tabs if multiple connections */}
          {connections.length > 1 && (
            <div className="flex gap-1 p-1 bg-muted">
              {connections.map((connection) => {
                const provider = connection.provider as VCSProviderType;
                const config = providerConfig[provider];
                const Icon = config.icon;
                const isSelected = selectedProvider === provider;

                return (
                  <button
                    key={connection.id}
                    onClick={() => setSelectedProvider(provider)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors",
                      isSelected ? cn("bg-background shadow-sm", config.textColor) : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {config.label}
                    {connection.providerUsername && (
                      <span className="text-xs opacity-70">
                        @{connection.providerUsername}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Repository selector */}
          {selectedProvider && (
            <VCSRepositorySelector
              provider={selectedProvider}
              onSelect={handleRepositorySelect}
              placeholder="Search repositories..."
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
