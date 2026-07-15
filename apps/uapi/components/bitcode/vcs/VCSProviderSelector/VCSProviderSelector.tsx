'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { VCSProviderType, VCSConnection } from '@bitcode/vcs-generics-core';
import { Github, GitBranch, Check } from 'lucide-react';
import { cn } from '@bitcode/styling';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/Select/Select';
import { Badge } from '@/components/shadcn/Badge/Badge';

interface VCSProviderSelectorProps {
  value?: VCSProviderType;
  onValueChange: (provider: VCSProviderType) => void;
  className?: string;
  disabled?: boolean;
  showUsername?: boolean;
}

const providerConfig = {
  github: {
    label: 'GitHub',
    icon: Github,
    color: 'bg-gray-900 text-white',
    borderColor: 'border-gray-700'
  },
  gitlab: {
    label: 'GitLab',
    icon: GitBranch,
    color: 'bg-orange-600 text-white',
    borderColor: 'border-orange-500'
  },
  bitbucket: {
    label: 'Bitbucket',
    icon: GitBranch,
    color: 'bg-blue-600 text-white',
    borderColor: 'border-blue-500'
  }
} as const;

export function VCSProviderSelector({
  value,
  onValueChange,
  className,
  disabled = false,
  showUsername = true
}: VCSProviderSelectorProps) {
  const [connections, setConnections] = useState<VCSConnection[]>([]);
  const [loading, setLoading] = useState(true);
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
        .eq('userid', user.id);

      if (error) throw error;
      
      setConnections(data || []);
      
      // Auto-select if only one connection
      if (data && data.length === 1 && !value) {
        onValueChange(data[0].provider as VCSProviderType);
      }
    } catch (error) {
      console.error('Failed to load VCS connections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("h-10 bg-muted animate-pulse", className)} />
    );
  }

  if (connections.length === 0) {
    return (
      <div className={cn(
        "text-sm text-muted-foreground italic",
        className
      )}>
        No VCS connected
      </div>
    );
  }

  if (connections.length === 1) {
    const connection = connections[0];
    const provider = connection.provider as VCSProviderType;
    const config = providerConfig[provider];
    const Icon = config.icon;

    return (
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 border",
        config.borderColor,
        className
      )}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{config.label}</span>
        {showUsername && connection.providerusername && (
          <span className="text-sm text-muted-foreground">
            @{connection.providerusername}
          </span>
        )}
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-[200px]", className)}>
        <SelectValue placeholder="Select VCS provider" />
      </SelectTrigger>
      <SelectContent>
        {connections.map((connection) => {
          const provider = connection.provider as VCSProviderType;
          const config = providerConfig[provider];
          const Icon = config.icon;

          return (
            <SelectItem key={connection.id} value={provider}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{config.label}</span>
                {showUsername && connection.providerusername && (
                  <span className="text-muted-foreground">
                    @{connection.providerusername}
                  </span>
                )}
                {connection.instanceurl && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {new URL(connection.instanceurl).hostname}
                  </Badge>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
