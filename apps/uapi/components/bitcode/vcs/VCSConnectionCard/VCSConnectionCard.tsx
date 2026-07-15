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
  /** Pulse Install GitHub App (purple attention after wallet Connect). */
  installAttentionActive?: boolean;
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
    description: 'Install the Bitcode GitHub App to grant repository scope for Read and Deposit work.',
    color: 'bg-violet-950/80',
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
  installAttentionActive = false,
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
        // Never leave the card in a hard-loading/broken state after provider
        // errors (e.g. uninstalled GitHub App inventory failures).
        console.error('[bitcode-github-connection] status not ok', {
          status: response.status,
          data,
        });
        setStatus({ connected: false, valid: false });
        onConnectionChange?.(false);
        return;
      }

      if (!data || typeof data.connected !== 'boolean') {
        console.error('[bitcode-github-connection] malformed response', { data });
        setStatus({ connected: false, valid: false });
        onConnectionChange?.(false);
        return;
      }

      if (data.claimedInstallation?.claimed) {
        toast.success(
          data.claimedInstallation.account
            ? `GitHub App installation linked for ${data.claimedInstallation.account}`
            : 'GitHub App installation linked to Bitcode',
        );
      } else if (data.claimedInstallation?.error === 'session_required') {
        toast.info(
          'GitHub App is installed but Bitcode still needs a Connected identity to finish linking. Connect wallet/session, then Refresh.',
        );
      } else if (data.claimedInstallation?.error) {
        const errorClass =
          typeof data.claimedInstallation.errorClass === 'string'
            ? data.claimedInstallation.errorClass
            : null;
        const classHint =
          errorClass === 'app_mismatch'
            ? ' (this install is not visible to this deployment’s GitHub App — Disconnect and reconnect)'
            : errorClass === 'credentials'
              ? ' (GitHub App credentials missing or invalid on this deploy)'
              : errorClass === 'cookie'
                ? ' (staged install cookie missing — retry Install from this host)'
                : '';
        toast.error(
          `Could not finish GitHub App install: ${String(data.claimedInstallation.error).slice(0, 160)}${classHint}`,
        );
      }
      
      setStatus(data);
      // Report attached (even if invalid) so Externals can show reconnect UX.
      onConnectionChange?.(Boolean(data.connected));
    } catch (error) {
      console.error('[bitcode-github-connection] check failed', error);
      setStatus({ connected: false, valid: false });
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

  // Surface GitHub App callback outcomes that land back on Externals
  // (?vcsConnection=installation_staged|failed|installation_connected).
  useEffect(() => {
    if (provider !== 'github' || typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const vcsConnection = params.get('vcsConnection');
      const account = params.get('account');
      const vcsError = params.get('vcsError');
      if (!vcsConnection) return;

      if (vcsConnection === 'installation_connected') {
        toast.success(
          account
            ? `GitHub App connected for ${account}`
            : 'GitHub App connected to Bitcode',
        );
      } else if (vcsConnection === 'installation_staged') {
        toast.info(
          'GitHub App installed. Connect to Bitcode if needed — Bitcode will finish linking automatically.',
        );
        // Claim now that a session may exist on this page load.
        void checkConnection();
      } else if (vcsConnection === 'failed') {
        const vcsErrorDescription = params.get('vcsErrorDescription');
        const vcsErrorClass = params.get('vcsErrorClass');
        const classHint =
          vcsErrorClass === 'app_mismatch'
            ? ' This installation is not owned by the GitHub App configured on this deploy — Disconnect in Bitcode and reinstall against the current app.'
            : vcsErrorClass === 'credentials'
              ? ' GitHub App credentials are missing or invalid on this deploy.'
              : '';
        const detail = [vcsError, vcsErrorDescription].filter(Boolean).join(' — ');
        console.error('[bitcode-github-connection] callback failed', {
          vcsError,
          vcsErrorDescription,
          vcsErrorClass,
          installationId: params.get('installation_id'),
        });
        toast.error(
          detail
            ? `GitHub connection failed: ${detail}.${classHint}`
            : `GitHub connection failed. Try reconnect or a personal access token.${classHint}`,
        );
      }

      // Clean query noise so reloads do not re-toast.
      params.delete('vcsConnection');
      params.delete('vcsError');
      params.delete('vcsErrorDescription');
      params.delete('vcsErrorClass');
      params.delete('vcsSession');
      params.delete('vcsProvider');
      params.delete('installation_id');
      params.delete('setup_action');
      params.delete('account');
      params.delete('repository_selection');
      const next = params.toString();
      const path = `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash || ''}`;
      window.history.replaceState({}, '', path);
    } catch {
      // ignore malformed URL handling
    }
    // Intentionally once per mount for github cards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);
  
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
  
  const isGitHubCard = provider === 'github';

  return (
    <Card
      className={
        isGitHubCard
          ? 'github-connection-card min-w-0 rounded-none border-violet-300/28 bg-violet-950/40 text-violet-50'
          : undefined
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${isGitHubCard ? 'text-violet-50' : ''}`}>
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
        <CardDescription className={isGitHubCard ? 'text-violet-100/72' : undefined}>
          {config.description}
        </CardDescription>
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

            {/* V48-Gate3-F34/F35: Refresh retries installation-token
                regeneration silently — if it still fails, surface WHY
                (source-safe: GitHub's own API error text, no tokens).
                Bitcode uses ONE GitHub App (`bitcode-github-auxiliary`) on
                every environment; a 404 usually means the installation was
                removed or credentials on this deploy do not match that app.
                Disconnect + reconnect against the same app is the recovery. */}
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
                    A 40x usually means the GitHub App installation is gone or
                    this deployment&apos;s App credentials are wrong. Bitcode
                    uses a single app (
                    <span className="font-mono">bitcode-github-auxiliary</span>
                    ). Try Disconnect, then Install GitHub App again.
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
              <p className={`text-sm ${isGitHubCard ? 'text-violet-100/70' : 'text-muted-foreground'}`}>
                Features:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {config.features.map((feature) => (
                  <li
                    key={feature}
                    className={isGitHubCard ? 'text-violet-100/68' : 'text-muted-foreground'}
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <VCSConnectionButton
              provider={provider}
              instanceUrl={instanceUrl}
              onConnect={() => checkConnection()}
              attentionActive={isGitHubCard && installAttentionActive}
              className={[
                'w-full',
                isGitHubCard
                  ? 'github-install-button rounded-none border border-violet-300/50 bg-violet-500/14 text-violet-50 hover:border-violet-200/70 hover:bg-violet-500/22'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
