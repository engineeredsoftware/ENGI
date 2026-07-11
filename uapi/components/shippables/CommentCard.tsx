"use client";

import React from 'react';
import MetalPlate from '@/components/bitcode/metal-plate';
import RichBodyPane from './RichBodyPane';

export interface CommentData {
  number: number;
  createdAt?: string;
  body?: string;
  url?: string;
  referencedIssue?: number;
}

interface Props {
  comment: CommentData;
}

const CommentCard: React.FC<Props> = ({ comment }) => {
  return (
    <MetalPlate
      headline={`Comment on #${comment.number}`}
      icon={
        <svg className="w-5 h-5 text-yellow-300 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      }
      linkUrl={comment.url}
      linkTitle="View Comment"
      className="flex flex-col h-full"
      mainColor="#60a5fa"
      glowColor="#fde047"
    >
      <div className="mt-1 text-gray-200 flex flex-col h-full">
        {comment.referencedIssue && (
          <div className="mb-1 text-xs font-medium text-sky-300/80 flex items-center space-x-1">
            <svg className="w-3 h-3 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Issue #{comment.referencedIssue}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-300 rounded-full text-sm font-medium">
            Commented
          </span>
          {comment.createdAt && <span className="text-xs text-gray-500">{comment.createdAt}</span>}
        </div>


        {comment.body && (
          <RichBodyPane accent="blue" size="sm" maxHeight={80}>
            {comment.body}
          </RichBodyPane>
        )}
      </div>
    </MetalPlate>
  );
};

export default CommentCard;
