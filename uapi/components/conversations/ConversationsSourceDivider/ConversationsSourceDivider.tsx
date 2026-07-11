import React from 'react';

interface Props {
  repoSlug: string;
  branch?: string | null;
  commitSha?: string | null;
}

export default function SourceDivider({ repoSlug, branch, commitSha }: Props) {
  return (
    <div className="flex items-center my-4">
      <div className="flex-grow border-t border-gray-600" />
      <div className="mx-3 text-xs text-gray-400 flex items-center gap-2">
        <span className="font-mono text-gray-300">{repoSlug}</span>
        {branch && <span className="px-1 bg-gray-700 rounded">{branch}</span>}
        {commitSha && <span className="font-mono text-gray-500">{commitSha.substring(0,7)}</span>}
      </div>
      <div className="flex-grow border-t border-gray-600" />
    </div>
  );
}
