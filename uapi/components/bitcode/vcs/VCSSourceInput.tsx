'use client';

import React from 'react';
import { VCSProviderType, VCSRepository } from '@bitcode/vcs-core';
import { VCSSourceBadge } from './VCSSourceBadge';
import { cn } from '@bitcode/styling';

interface VCSSourceInputProps {
  value?: {
    provider: VCSProviderType;
    repository: VCSRepository;
  };
  onChange: (source: {
    provider: VCSProviderType;
    repository: VCSRepository;
  } | undefined) => void;
  className?: string;
  placeholder?: string;
  label?: string;
  helperText?: string;
  required?: boolean;
}

export function VCSSourceInput({
  value,
  onChange,
  className,
  placeholder = "Select a repository from your connected VCS",
  label = "Source Repository",
  helperText,
  required = false
}: VCSSourceInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <VCSSourceBadge
          value={value}
          onChange={onChange}
          variant="default"
          className="w-full justify-between"
        />
      </div>
      
      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

// Compact version for inline use in text areas
export function VCSSourceInline({
  value,
  onChange,
  className
}: {
  value?: {
    provider: VCSProviderType;
    repository: VCSRepository;
  };
  onChange: (source: {
    provider: VCSProviderType;
    repository: VCSRepository;
  } | undefined) => void;
  className?: string;
}) {
  return (
    <VCSSourceBadge
      value={value}
      onChange={onChange}
      variant="minimal"
      className={cn("inline-flex", className)}
    />
  );
}
