"use client";

import React from 'react';
import MetalPlate from '@/components/bitcode/metal-plate';
import RichBodyPane from './RichBodyPane';

export interface FileDiff {
  path: string;
  additions: number;
  deletions: number;
}

export interface FileChangesSummary {
  edited: number;
  created: number;
  deleted: number;
  paths?: string[];
  fileDiffs?: FileDiff[];
}

export interface PullRequestData {
  number: number;
  status?: string;
  createdAt?: string;
  title?: string;
  description?: string;
  url?: string;
  fileChanges?: FileChangesSummary;
}

interface Props {
  pr: PullRequestData;
}

const PullRequestCard: React.FC<Props> = ({ pr }) => {
  return (
    <MetalPlate
      headline="Pull Request"
      mainColor="#34d399"
      glowColor="#6ee7b7"
      intense
      icon={
        <svg className="w-5 h-5 text-emerald-300 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4" />
        </svg>
      }
      linkUrl={pr.url}
      linkTitle="View Pull Request"
      className="flex flex-col"
    >
      <div className="mt-3 flex flex-col space-y-3 text-gray-200">
        {/* header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-base text-emerald-300 font-semibold mr-2">#{pr.number}</div>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-full text-sm font-medium">
              {pr.status || 'Open'}
            </span>
          </div>
          {pr.createdAt && <span className="text-xs text-gray-500">{pr.createdAt}</span>}
        </div>

        {/* title */}
        {pr.title && (
          <div className="font-semibold text-sm md:text-base text-emerald-300 line-clamp-2">{pr.title}</div>
        )}

        {/* description */}
        {pr.description && <RichBodyPane accent="emerald">{pr.description}</RichBodyPane>}

        {/* file changes summary */}
        {pr.fileChanges && (
          <div className="bg-black/20 p-3 rounded-md">
            <div className="text-sm font-medium text-emerald-300 mb-2">Files Changed</div>
            <div className="grid grid-cols-3 gap-2 text-center mb-2">
              <div className="text-gray-200">
                <div className="text-emerald-300 text-sm font-medium">{pr.fileChanges.edited}</div>
                <div className="text-xs opacity-80">Edited</div>
              </div>
              <div className="text-gray-200">
                <div className="text-emerald-300 text-sm font-medium">{pr.fileChanges.created}</div>
                <div className="text-xs opacity-80">Created</div>
              </div>
              <div className="text-gray-200">
                <div className="text-emerald-300 text-sm font-medium">{pr.fileChanges.deleted}</div>
                <div className="text-xs opacity-80">Deleted</div>
              </div>
            </div>

            {pr.fileChanges.fileDiffs && pr.fileChanges.fileDiffs.length > 0 && (
              <div className="max-h-[80px] overflow-y-auto custom-scrollbar pr-2">
                {pr.fileChanges.fileDiffs.slice(0, 3).map((diff, idx) => (
                  <div key={idx} className="text-xs text-gray-300 mb-1 flex items-start hover:bg-black/30 p-1 rounded">
                    <span className="text-emerald-300/70 mr-1.5 mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                    <span className="truncate flex-grow">{diff.path}</span>
                    <span className="ml-2 text-emerald-400">+{diff.additions}</span>
                    <span className="ml-1 text-red-400">-{diff.deletions}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MetalPlate>
  );
};

export default PullRequestCard;
