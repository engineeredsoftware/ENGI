"use client";

import React from 'react';
import MetalPlate from '@/components/bitcode/MetalPlate/MetalPlate';
import RichBodyPane from '@/components/shippables/RichBodyPane/RichBodyPane';

export interface ReviewData {
  number: number;
  status?: string;
  createdAt?: string;
  content?: string;
  url?: string;
  referencedPr?: number;
}

interface Props {
  review: ReviewData;
}

const ReviewCard: React.FC<Props> = ({ review }) => {
  return (
    <MetalPlate
      headline={`PR Review #${review.number}`}
      icon={
        <svg className="w-5 h-5 text-purple-300 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
      linkUrl={review.url}
      linkTitle="View PR Review"
      className="flex flex-col h-full"
      mainColor="#6ee7b7"
      glowColor="#a855f7"
    >
      <div className="mt-1 text-gray-200 flex flex-col h-full">
        {review.referencedPr && (
          <div className="mb-1 text-xs font-medium text-emerald-300/80 flex items-center space-x-1">
            <svg className="w-3 h-3 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4 4 4" />
            </svg>
            <span>PR #{review.referencedPr}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded-full text-sm font-medium">
            {review.status || 'Reviewed'}
          </span>
          {review.createdAt && <span className="text-xs text-gray-500">{review.createdAt}</span>}
        </div>


        {review.content && (
          <RichBodyPane accent="emerald" size="sm" maxHeight={100}>
            {review.content.length > 120 ? `${review.content.substring(0, 120)}…` : review.content}
          </RichBodyPane>
        )}
      </div>
    </MetalPlate>
  );
};

export default ReviewCard;
