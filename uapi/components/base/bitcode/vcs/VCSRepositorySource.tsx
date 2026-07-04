'use client';

import React, { useState, useEffect } from 'react';
import { VCSProviderType, VCSRepository } from '@bitcode/vcs-core';
import { VCSProviderSelector } from './VCSProviderSelector';
import { VCSRepositorySelector } from './VCSRepositorySelector';
import { Github, GitBranch, GitCommit, Folder } from 'lucide-react';
import { cn } from '@bitcode/styling';
import { Badge } from '@/components/base/shadcn/badge';

interface VCSRepositorySourceProps {
  value?: {
    provider: VCSProviderType;
    repository: VCSRepository;
    branch?: string;
    path?: string;
  };
  onChange: (source: {
    provider: VCSProviderType;
    repository: VCSRepository;
    branch?: string;
    path?: string;
  } | undefined) => void;
  className?: string;
  showBranchSelector?: boolean;
  showPathInput?: boolean;
  placeholder?: string;
}

const providerConfig = {
  github: {
    label: 'GitHub',
    icon: Github,
    color: 'bg-gray-900',
    textColor: 'text-gray-900',
    borderColor: 'border-gray-300'
  },
  gitlab: {
    label: 'GitLab',
    icon: GitBranch,
    color: 'bg-orange-600',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-300'
  },
  bitbucket: {
    label: 'Bitbucket',
    icon: GitBranch,
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-300'
  }
} as const;

export function VCSRepositorySource({
  value,
  onChange,
  className,
  showBranchSelector = false,
  showPathInput = false,
  placeholder = "Select a repository from your connected VCS"
}: VCSRepositorySourceProps) {
  const [selectedProvider, setSelectedProvider] = useState<VCSProviderType | undefined>(
    value?.provider
  );
  const [selectedRepository, setSelectedRepository] = useState<VCSRepository | undefined>(
    value?.repository
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(
    value?.branch || 'main'
  );
  const [selectedPath, setSelectedPath] = useState<string>(
    value?.path || ''
  );

  useEffect(() => {
    if (selectedProvider && selectedRepository) {
      onChange({
        provider: selectedProvider,
        repository: selectedRepository,
        branch: showBranchSelector ? selectedBranch : undefined,
        path: showPathInput ? selectedPath : undefined
      });
    } else {
      onChange(undefined);
    }
  }, [selectedProvider, selectedRepository, selectedBranch, selectedPath]);

  const handleProviderChange = (provider: VCSProviderType) => {
    setSelectedProvider(provider);
    setSelectedRepository(undefined); // Reset repository when provider changes
  };

  const handleRepositoryChange = (repository: VCSRepository) => {
    setSelectedRepository(repository);
    setSelectedBranch(repository.defaultBranch || 'main');
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Provider Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Source:</label>
        <VCSProviderSelector
          value={selectedProvider}
          onValueChange={handleProviderChange}
          showUsername={true}
        />
      </div>

      {/* Repository Selector */}
      {selectedProvider && (
        <div className="space-y-2">
          <VCSRepositorySelector
            provider={selectedProvider}
            value={selectedRepository}
            onSelect={handleRepositoryChange}
            placeholder={placeholder}
          />
          
          {/* Show selected repository details */}
          {selectedRepository && (
            <div className="p-3 border bg-muted/50">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = providerConfig[selectedProvider].icon;
                      return <Icon className="h-4 w-4 text-muted-foreground" />;
                    })()}
                    <span className="font-medium">{selectedRepository.fullName}</span>
                    {selectedRepository.private && (
                      <Badge variant="outline" className="text-xs">Private</Badge>
                    )}
                  </div>
                  {selectedRepository.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedRepository.description}
                    </p>
                  )}
                </div>
                <Badge 
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    providerConfig[selectedProvider].textColor
                  )}
                >
                  {providerConfig[selectedProvider].label}
                </Badge>
              </div>

              {/* Branch selector */}
              {showBranchSelector && (
                <div className="mt-3 flex items-center gap-2">
                  <GitCommit className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    placeholder="Branch name"
                    className="flex-1 px-2 py-1 text-sm border"
                  />
                </div>
              )}

              {/* Path input */}
              {showPathInput && (
                <div className="mt-2 flex items-center gap-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={selectedPath}
                    onChange={(e) => setSelectedPath(e.target.value)}
                    placeholder="Path (optional, e.g., /src)"
                    className="flex-1 px-2 py-1 text-sm border"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
