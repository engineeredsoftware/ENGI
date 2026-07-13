'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/Card/Card';
import { Button } from '@/components/shadcn/Button/Button';
import { Badge } from '@/components/shadcn/Badge/Badge';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { GitBranch, Server, CheckCircle2, XCircle, RefreshCw, Trash2 } from 'lucide-react';
import { VCSProviderType } from '@bitcode/vcs-generics-core';
import { VCSConnectionButton } from '@/components/bitcode/vcs/VCSConnectionButton/VCSConnectionButton';
import { toast } from '@/components/shadcn/Sonner/Sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/shadcn/AlertDialog/AlertDialog';

interface VCSConnectionCardProps {
  provider: VCSProviderType;
  instanceUrl?: string;
  onConnectionChange?: (connected: boolean) => void;
}

interface ConnectionStatus {
  connected: boolean;
  valid?: boolean;
  username?: string;
  instanceUrl?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

const providerConfig = {
  github: {
    icon: GitHubLogoIcon,
    label: 'GitHub',
    description: 'Install the Bitcode GitHub App to grant repository scope for Terminal Read and Deposit work.',
    color: 'bg-gray-900',
    features: ['Installation-scoped repository access', 'Source inventory reads', 'Pull requests', 'Webhooks']
  },
  gitlab: {
    icon: GitBranch,
    label: 'GitLab',
    description: 'Connect your GitLab account to manage projects and merge requests.',
    color: 'bg-orange-600',
    features: ['Project access', 'Merge requests', 'CI/CD pipelines', 'Self-hosted support']
  },
  bitbucket: {
    icon: Server,
    label: 'Bitbucket',
    description: 'Connect your Bitbucket account to work with repositories and pull requests.',
    color: 'bg-blue-600',
    features: ['Repository access', 'Pull requests', 'Pipelines', 'App passwords']
  }
};

export function VCSConnectionCard({
  provider,
  instanceUrl,
  onConnectionChange
}: VCSConnectionCardProps) {
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  
  const config = providerConfig[provider];
  const Icon = config.icon;

  const readJsonResponse = async (response: Response) => {
    const contentType = response.headers?.get?.('content-type') || '';
    if (contentType && !contentType.includes('application/json')) {
      return null;
    }

    return response.json().catch(() => null);
  };
  
  const checkConnection = async () => {
    try {
      let url = `/api/vcs/${provider}/connection`;
      if (instanceUrl) {
        url += `?instance_url=${encodeURIComponent(instanceUrl)}`;
      }
      
      const response = await fetch(url);
      const data = await readJsonResponse(response);

      if (!response.ok) {
        setStatus({ connected: false });
        onConnectionChange?.(false);
        return;
      }

      if (!data || typeof data.connected !== 'boolean') {
        setStatus({ connected: false });
        onConnectionChange?.(false);
        return;
      }
      
      setStatus(data);
      onConnectionChange?.(data.connected);
    } catch {
      setStatus({ connected: false });
      onConnectionChange?.(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    
    try {
      let url = `/api/vcs/${provider}/connection`;
      if (instanceUrl) {
        url += `?instance_url=${encodeURIComponent(instanceUrl)}`;
      }
      
      const response = await fetch(url, {
        method: 'DELETE'
      });

      const data = await readJsonResponse(response);
      
      if (!response.ok) {
        throw new Error((data && typeof data.error === 'string' && data.error) || 'Failed to disconnect');
      }
      
      setStatus({ connected: false });
      toast.success(`Disconnected from ${config.label}`);
      onConnectionChange?.(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to disconnect from ${config.label}`);
    } finally {
      setIsDisconnecting(false);
    }
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    checkConnection();
  };
  
  useEffect(() => {
    checkConnection();
  }, [provider, instanceUrl]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {config.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {config.label}
            {instanceUrl && (
              <Badge variant="secondary" className="ml-2">
                Self-hosted
              </Badge>
            )}
          </CardTitle>
          {status.connected && (
            <div className="flex items-center gap-2">
              <Badge 
                variant={status.valid ? "success" : "destructive"}
                className="flex items-center gap-1"
              >
                {status.valid ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {status.valid ? 'Connected' : 'Invalid'}
              </Badge>
            </div>
          )}
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {status.connected ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-medium">{status.username}</span>
              </div>
              {status.instanceUrl && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Instance:</span>
                  <span className="font-medium truncate max-w-[200px]">
                    {status.instanceUrl}
                  </span>
                </div>
              )}
              {status.expiresAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Token expires:</span>
                  <span className="font-medium">
                    {new Date(status.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* V48-Gate3-F34/F35: Refresh already retries installation-token
                regeneration silently — if it still fails, surface WHY
                (source-safe: GitHub's own API error text, no tokens) instead
                of leaving "Invalid" with no explanation. A 404 here does NOT
                reliably mean the installation was removed from GitHub — it
                also happens when this connection's stored installation
                belongs to a DIFFERENT Bitcode GitHub App than the one this
                deployment is configured with (there can be more than one:
                production vs. a staging/test app registration). GitHub still
                showing the app installed does not rule this out. Disconnect
                + reconnect is the cheap thing to try first — it re-runs the
                install/authorize flow against THIS deployment's app and
                writes a fresh installation id, no GitHub-side changes
                needed. */}
            {!status.valid && status.metadata?.last_regeneration_error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <p className="font-medium">Last reconnect attempt failed:</p>
                <p className="mt-1 break-words">
                  {status.metadata.last_regeneration_error === 'github_app_credentials_not_configured'
                    ? 'The Bitcode GitHub App credentials are not configured on this deployment.'
                    : String(status.metadata.last_regeneration_error)}
                </p>
                {/\b40[134]\b/.test(String(status.metadata.last_regeneration_error)) && (
                  <p className="mt-1 text-destructive/80">
                    A 40x here usually means this connection&apos;s stored GitHub
                    App installation isn&apos;t one this deployment can use —
                    even if GitHub still shows an app installed. Try
                    Disconnect below, then reconnect (no need to touch
                    anything on GitHub first).
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {/* V48-Gate3-F36: explicit type="button" — shadcn's Button doesn't
                  default one, so a bare <button> falls back to the browser's
                  native type="submit". No <form> ancestor was found for this
                  card, so this shouldn't currently matter, but it's a
                  zero-risk hardening against exactly that class of bug (a
                  click "doing nothing"/submitting instead of firing onClick)
                  regardless of whether it's the cause of the live hang. */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDisconnecting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect {config.label}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove your {config.label} connection. You'll read to reconnect
                      to access your repositories again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDisconnect}>
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Features:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {config.features.map((feature) => (
                  <li key={feature} className="text-muted-foreground">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <VCSConnectionButton
              provider={provider}
              instanceUrl={instanceUrl}
              onConnect={() => checkConnection()}
              className="w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
