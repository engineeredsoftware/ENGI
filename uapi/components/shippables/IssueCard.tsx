"use client";

import React from 'react';
import MetalPlate from '@/components/bitcode/metal-plate';
import RichBodyPane from './RichBodyPane';

export interface IssueData {
  number: number;
  status?: string;
  createdAt?: string;
  title?: string;
  description?: string;
  url?: string;
  labels?: string[];
}

interface Props {
  issue: IssueData;
}

const IssueCard: React.FC<Props> = ({ issue }) => {
  return (
    <MetalPlate
      headline={`Issue #${issue.number}`}
      mainColor="#3b82f6" /* blue-500 */
      glowColor="#60a5fa"
      intense
      icon={
        <svg className="w-5 h-5 text-sky-300 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
      linkUrl={issue.url}
      linkTitle="View Issue"
      className="flex flex-col"
    >
      <div className="mt-3 text-gray-200 flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 bg-sky-500/10 text-sky-300 rounded-full text-sm font-medium">
            {issue.status || 'Open'}
          </span>
          {issue.createdAt && <span className="text-xs text-gray-500">{issue.createdAt}</span>}
        </div>
        {issue.title && (
          <div className="font-semibold text-sm md:text-base text-sky-300 mt-2 line-clamp-2">{issue.title}</div>
        )}

        {issue.description && (
          <RichBodyPane accent="sky">{issue.description}</RichBodyPane>
        )}

        {issue.labels && issue.labels.length > 0 && (
          <div className="flex items-center justify-end space-x-2 mt-auto">
            {issue.labels.slice(0, 2).map((label) => (
              <span
                key={label}
                className="text-xs px-2 py-1 bg-sky-500/5 text-sky-300/80 rounded-md border border-sky-500/10"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </MetalPlate>
  );
};

export default IssueCard;
