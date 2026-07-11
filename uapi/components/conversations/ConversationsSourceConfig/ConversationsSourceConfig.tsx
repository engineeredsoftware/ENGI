"use client";

import React, { useState, useEffect } from 'react';

interface Repo {
  slug: string; // org/repo
  defaultBranch?: string;
}

interface Props {
  initialRepoSlug?: string;
  initialBranch?: string | null;
  initialCommit?: string | null;
  onChange: (cfg: { repoSlug: string; branch?: string | null; commitSha?: string | null }) => void;
}

export default function SourceConfig({ initialRepoSlug, initialBranch, initialCommit, onChange }: Props) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repoSlug, setRepoSlug] = useState(initialRepoSlug ?? '');
  const [branch, setBranch] = useState<string | ''>(initialBranch ?? '');
  const [commitSha, setCommitSha] = useState<string | ''>(initialCommit ?? '');

  // fetch repos (placeholder route)
  useEffect(() => {
    fetch('/api/user-connections').then(r => r.json()).then(setRepos).catch(() => setRepos([]));
  }, []);

  useEffect(() => {
    onChange({ repoSlug, branch: branch || null, commitSha: commitSha || null });
  }, [repoSlug, branch, commitSha]);

  return (
    <div className="flex flex-col gap-2 text-xs text-gray-200 bg-gray-800 p-2 rounded-md">
      <div className="flex flex-col">
        <label className="mb-1">Repository</label>
        <select value={repoSlug} onChange={e => setRepoSlug(e.target.value)} className="bg-gray-900 p-1 rounded">
          <option value="">Select repo</option>
          {repos.map(r => (
            <option key={r.slug} value={r.slug}>{r.slug}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="mb-1">Branch</label>
        <input value={branch} onChange={e => setBranch(e.target.value)} placeholder="main" className="bg-gray-900 p-1 rounded" />
      </div>
      <div className="flex flex-col">
        <label className="mb-1">Commit (optional)</label>
        <input value={commitSha} onChange={e => setCommitSha(e.target.value)} placeholder="SHA" className="bg-gray-900 p-1 rounded" />
      </div>
    </div>
  );
}
