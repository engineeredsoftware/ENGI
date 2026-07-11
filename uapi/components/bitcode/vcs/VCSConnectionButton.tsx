"use client";

import React, { useState } from 'react';
import { Button } from '@/components/shadcn/button';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { GitBranch, Server } from 'lucide-react';
import { VCSProviderType } from '@bitcode/vcs-core';
import { toast } from '@/components/shadcn/sonner';
import { BITCODE_GITHUB_APP_PUBLIC_URL } from '@/lib/github-app-url';

interface VCSConnectionButtonProps {
  provider: VCSProviderType;
  instanceUrl?: string;
  onConnect?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const providerConfig = {
  github: {
    icon: GitHubLogoIcon,
    label: 'GitHub',
    actionLabel: 'Install GitHub App',
    color: 'hover:bg-gray-900 hover:text-white'
  },
  gitlab: {
    icon: GitBranch,
    label: 'GitLab',
    actionLabel: 'Connect GitLab',
    color: 'hover:bg-orange-600 hover:text-white'
  },
  bitbucket: {
    icon: Server,
    label: 'Bitbucket',
    actionLabel: 'Connect Bitbucket',
    color: 'hover:bg-blue-600 hover:text-white'
  }
};

export function VCSConnectionButton({
  provider,
  instanceUrl,
  onConnect,
  className = '',
  variant = 'outline',
  size = 'default'
}: VCSConnectionButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const config = providerConfig[provider];
  const Icon = config.icon;
  
  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // GitHub is installed as a GitHub App so repository scope returns through
      // the setup/callback URLs with an installation ID. Other providers keep
      // the generic OAuth route.
      let oauthUrl = provider === 'github' && !instanceUrl
        ? BITCODE_GITHUB_APP_PUBLIC_URL
        : `/api/vcs/${provider}/oauth`;
      if (instanceUrl) {
        oauthUrl += `?instance_url=${encodeURIComponent(instanceUrl)}`;
      }
      
      // Trigger OAuth flow
      window.location.href = oauthUrl;
      
      if (onConnect) {
        onConnect();
      }
    } catch (error) {
      console.error('Failed to initiate connection:', error);
      toast.error(`Failed to connect to ${config.label}`);
      setIsConnecting(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleConnect}
      disabled={isConnecting}
      className={`${config.color} ${className}`}
    >
      <Icon className="mr-2 h-4 w-4" />
      {isConnecting ? 'Connecting...' : config.actionLabel}
    </Button>
  );
}
