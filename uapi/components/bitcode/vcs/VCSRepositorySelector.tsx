'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { GitFork, Lock } from 'lucide-react';
import { VCSProviderType, VCSRepository } from '@bitcode/vcs-core';
import { toast } from '@/components/shadcn/sonner';
import { SearchableSelect, type SearchableSelectItem } from '@/components/bitcode/forms/SearchableSelect';

interface VCSRepositorySelectorProps {
  provider: VCSProviderType;
  instanceUrl?: string;
  value?: string;
  onSelect: (repository: VCSRepository | null) => void;
  placeholder?: string;
  className?: string;
  repositories?: VCSRepository[] | null;
  loading?: boolean;
  /** When true, the selector is non-interactive (run-detail lock). */
  disabled?: boolean;
}

export function VCSRepositorySelector({
  provider,
  instanceUrl,
  value,
  onSelect,
  placeholder = 'Select repository...',
  className,
  repositories: providedRepositories,
  loading: providedLoading,
  disabled = false,
}: VCSRepositorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [fetchedRepositories, setFetchedRepositories] = useState<VCSRepository[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const repositories = providedRepositories ?? fetchedRepositories;
  const isLoading = providedLoading ?? isFetching;

  const readJsonResponse = async (response: Response) => {
    const contentType = response.headers?.get?.('content-type') || '';
    if (contentType && !contentType.includes('application/json')) {
      return null;
    }

    return response.json().catch(() => null);
  };
  
  const fetchRepositories = async () => {
    setIsFetching(true);
    
    try {
      let url = `/api/vcs/${provider}/repositories`;
      if (instanceUrl) {
        url += `?instance_url=${encodeURIComponent(instanceUrl)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      
      const data = await readJsonResponse(response);
      if (!data) {
        throw new Error('The repositories endpoint returned an invalid response');
      }

      setFetchedRepositories(data.repositories || []);
    } catch {
      toast.error('Failed to load repositories');
      setFetchedRepositories([]);
    } finally {
      setIsFetching(false);
    }
  };
  
  useEffect(() => {
    if (!providedRepositories && open && fetchedRepositories.length === 0) {
      fetchRepositories();
    }
  }, [fetchedRepositories.length, open, providedRepositories]);

  const selectedRepo = useMemo(
    () => (value ? repositories.find((repo) => repo.fullName === value || repo.id === value) || null : null),
    [repositories, value],
  );

  const items = useMemo<SearchableSelectItem[]>(
    () =>
      repositories.map((repo) => ({
        key: repo.fullName,
        label: repo.fullName,
        description: repo.description || null,
        badge: repo.language || null,
        meta: repo.updatedAt ? `Updated ${new Date(repo.updatedAt).toLocaleDateString()}` : null,
        icon: (
          <>
            {repo.private && <Lock className="h-3 w-3 shrink-0" />}
            {repo.fork && <GitFork className="h-3 w-3 shrink-0" />}
          </>
        ),
      })),
    [repositories],
  );

  const handleSelect = (key: string | null) => {
    const repo = key ? repositories.find((candidate) => candidate.fullName === key) || null : null;
    onSelect(repo);
  };

  return (
    <SearchableSelect
      items={items}
      value={selectedRepo?.fullName ?? null}
      onSelect={handleSelect}
      placeholder={placeholder}
      searchPlaceholder="Search repositories..."
      emptyMessage="No repositories found."
      loading={isLoading}
      loadingMessage="Loading repositories..."
      className={className}
      open={disabled ? false : open}
      onOpenChange={disabled ? undefined : setOpen}
      disabled={disabled}
    />
  );
}
