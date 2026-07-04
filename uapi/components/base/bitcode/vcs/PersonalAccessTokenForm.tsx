'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/base/shadcn/card';
import { Input } from '@/components/base/shadcn/input';
import { Label } from '@/components/base/shadcn/label';
import { Button } from '@/components/base/shadcn/button';
import { Badge } from '@/components/base/shadcn/badge';
import { VCSProviderType } from '@bitcode/vcs-core';
import { ExternalLink, Eye, EyeOff, Info } from 'lucide-react';
import { toast } from '@/components/base/shadcn/sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/base/shadcn/collapsible';

interface PersonalAccessTokenFormProps {
  provider: VCSProviderType;
  providerInfo: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    patUrl: string;
    patScopes: string[];
    patDocs: string;
  };
  instanceUrl?: string;
  onSuccess?: () => void;
}

export function PersonalAccessTokenForm({
  provider,
  providerInfo,
  instanceUrl,
  onSuccess
}: PersonalAccessTokenFormProps) {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const Icon = providerInfo.icon;

  const readJsonResponse = async (response: Response) => {
    const contentType = response.headers?.get?.('content-type') || '';
    if (contentType && !contentType.includes('application/json')) {
      return null;
    }

    return response.json().catch(() => null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      toast.error('Please enter a token');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let url = `/api/vcs/${provider}/connect-token`;
      
      const body: any = { token: token.trim() };
      if (instanceUrl) {
        body.instanceUrl = instanceUrl;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const data = await readJsonResponse(response);
      
      if (!response.ok) {
        throw new Error((data && typeof data.error === 'string' && data.error) || 'Failed to connect');
      }

      if (!data) {
        throw new Error('The connection endpoint returned an invalid response');
      }
      
      toast.success(`Successfully connected to ${providerInfo.label}`);
      setToken('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {providerInfo.label} Personal Access Token
          {instanceUrl && (
            <Badge variant="secondary" className="ml-2">
              Self-hosted
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Connect using a personal access token for environments where OAuth is not available.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  How to create a token
                </span>
                <span className="text-xs text-muted-foreground">
                  {showInstructions ? 'Hide' : 'Show'}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-3">
              <div className=" border p-4 space-y-3">
                <p className="text-sm">
                  1. Go to your {providerInfo.label} token settings:
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(providerInfo.patUrl, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open {providerInfo.label} Token Settings
                </Button>
                
                <p className="text-sm">
                  2. Create a new token with these required scopes:
                </p>
                <div className="flex flex-wrap gap-2">
                  {providerInfo.patScopes.map((scope) => (
                    <Badge key={scope} variant="secondary">
                      {scope}
                    </Badge>
                  ))}
                </div>
                
                <p className="text-sm">
                  3. Copy the token and paste it below. Make sure to save it securely
                  as you won't be able to see it again.
                </p>
                
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => window.open(providerInfo.patDocs, '_blank')}
                  className="p-0 h-auto"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  View detailed documentation
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <div className="space-y-2">
            <Label htmlFor={`${provider}-token`}>Personal Access Token</Label>
            <div className="relative">
              <Input
                id={`${provider}-token`}
                type={showToken ? 'text' : 'password'}
                placeholder="Paste your token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting || !token.trim()}
            className="w-full"
          >
            {isSubmitting ? 'Connecting...' : `Connect ${providerInfo.label}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
