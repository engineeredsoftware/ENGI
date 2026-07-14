'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/Tabs/Tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/Card/Card';
import { Input } from '@/components/shadcn/Input/Input';
import { Label } from '@/components/shadcn/Label/Label';
import { Button } from '@/components/shadcn/Button/Button';
import { VCSConnectionCard } from '@/components/bitcode/vcs/VCSConnectionCard/VCSConnectionCard';
import { PersonalAccessTokenForm } from '@/components/bitcode/vcs/PersonalAccessTokenForm/PersonalAccessTokenForm';
import { VCSProviderType } from '@bitcode/vcs-generics-core';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { GitBranch, Server, Info } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/shadcn/Alert/Alert';

interface VCSIntegrationPanelProps {
  showGitHub?: boolean;
  showGitLab?: boolean;
  showBitbucket?: boolean;
  /** Purple Install GitHub App attention cue (Externals after wallet Connect). */
  githubInstallAttentionActive?: boolean;
  onConnectionChange?: (provider: VCSProviderType, connected: boolean) => void;
}

const providerInfo = {
  github: {
    icon: GitHubLogoIcon,
    label: 'GitHub',
    patUrl: 'https://github.com/settings/tokens',
    patScopes: ['repo', 'user', 'admin:repo_hook'],
    patDocs: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token'
  },
  gitlab: {
    icon: GitBranch,
    label: 'GitLab',
    patUrl: 'https://gitlab.com/-/profile/personal_access_tokens',
    patScopes: ['api', 'read_user', 'read_repository', 'write_repository'],
    patDocs: 'https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html'
  },
  bitbucket: {
    icon: Server,
    label: 'Bitbucket',
    patUrl: 'https://bitbucket.org/account/settings/app-passwords/',
    patScopes: ['account', 'repository', 'repository:write', 'pullrequest', 'pullrequest:write', 'webhook'],
    patDocs: 'https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/'
  }
};

export function VCSIntegrationPanel({
  showGitHub = true,
  showGitLab = false,
  showBitbucket = false,
  githubInstallAttentionActive = false,
  onConnectionChange
}: VCSIntegrationPanelProps) {
  const [gitlabInstanceUrl, setGitlabInstanceUrl] = useState('');
  const [showGitlabSelfHosted, setShowGitlabSelfHosted] = useState(false);
  
  const providers = [
    ...(showGitHub ? ['github' as const] : []),
    ...(showGitLab ? ['gitlab' as const] : []),
    ...(showBitbucket ? ['bitbucket' as const] : [])
  ];
  
  const handleConnectionChange = (provider: VCSProviderType, connected: boolean) => {
    if (onConnectionChange) {
      onConnectionChange(provider, connected);
    }
  };
  
  if (providers.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No VCS providers enabled</AlertTitle>
        <AlertDescription>
          Please enable at least one VCS provider to continue.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="github-vcs-panel min-w-0 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-violet-50">Version Control System Integrations</h3>
        <p className="text-sm text-violet-100/68">
          Install the Bitcode GitHub App so Bitcode can read permitted repository
          context for Read, Deposit, and proof follow-through.
        </p>
      </div>
      
      <Tabs defaultValue="oauth" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none border border-violet-300/22 bg-violet-950/40">
          <TabsTrigger
            value="oauth"
            className="rounded-none data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-50"
          >
            GitHub App
          </TabsTrigger>
          <TabsTrigger
            value="pat"
            className="rounded-none data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-50"
          >
            Personal Access Token
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="oauth" className="space-y-4">
          <Alert className="rounded-none border-violet-300/24 bg-violet-500/10 text-violet-50">
            <Info className="h-4 w-4 text-violet-200" />
            <AlertTitle className="text-violet-50">Recommended</AlertTitle>
            <AlertDescription className="text-violet-100/78">
              The GitHub App returns an installation ID to Bitcode after install,
              then Bitcode stores only the installation-scoped connection needed
              for permitted repository reads.
            </AlertDescription>
          </Alert>
          
          <div className="grid min-w-0 gap-4 md:grid-cols-1">
            {showGitHub && (
              <VCSConnectionCard
                provider="github"
                installAttentionActive={githubInstallAttentionActive}
                onConnectionChange={(connected) => handleConnectionChange('github', connected)}
              />
            )}
            
            {showGitLab && (
              <div className="space-y-4">
                <VCSConnectionCard
                  provider="gitlab"
                  onConnectionChange={(connected) => handleConnectionChange('gitlab', connected)}
                />
                
                {!showGitlabSelfHosted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGitlabSelfHosted(true)}
                    className="w-full"
                  >
                    Connect Self-Hosted GitLab
                  </Button>
                )}
                
                {showGitlabSelfHosted && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Self-Hosted GitLab</CardTitle>
                      <CardDescription>
                        Connect to your organization's GitLab instance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="gitlab-instance">Instance URL</Label>
                        <Input
                          id="gitlab-instance"
                          type="url"
                          placeholder="https://gitlab.company.com"
                          value={gitlabInstanceUrl}
                          onChange={(e) => setGitlabInstanceUrl(e.target.value)}
                        />
                      </div>
                      
                      {gitlabInstanceUrl && (
                        <VCSConnectionCard
                          provider="gitlab"
                          instanceUrl={gitlabInstanceUrl}
                          onConnectionChange={(connected) => handleConnectionChange('gitlab', connected)}
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            {showBitbucket && (
              <VCSConnectionCard
                provider="bitbucket"
                onConnectionChange={(connected) => handleConnectionChange('bitbucket', connected)}
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pat" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Alternative Method</AlertTitle>
            <AlertDescription>
              Use personal access tokens if OAuth is not available in your organization.
              This method requires manual token management and renewal.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            {providers.map((provider) => (
              <PersonalAccessTokenForm
                key={provider}
                provider={provider}
                providerInfo={providerInfo[provider]}
                onSuccess={() => handleConnectionChange(provider, true)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
