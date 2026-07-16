"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

type SettleDeliveryItem = {
  url?: string;
  number?: number;
  title?: string;
  description?: string;
};

type FileDiff = { path: string; added: number; removed: number };

export interface SettleDeliveryDoc {
  pullRequest?: SettleDeliveryItem | null;
  fileChanges?: {
    edited: number;
    created: number;
    deleted: number;
    paths: string[];
    fileDiffs?: FileDiff[];
  } | null;
  summary?: string | null;
}

export interface SettleDeliveryDocPanelProps {
  settleDelivery: SettleDeliveryDoc;
  summaryOpen: boolean;
  onToggleSummary: () => void;
}

/**
 * Renders settle delivery summary (buyer PR when present) plus synthesis summary.
 * PR shipping is settle-asset-pack-pipeline only — not SDIVF Finish.
 */
export function SettleDeliveryDocPanel({ settleDelivery, summaryOpen, onToggleSummary }: SettleDeliveryDocPanelProps) {
  const tldr: React.ReactNode[] = [];
  if (settleDelivery.pullRequest?.title) tldr.push(<span key="pr">Settled pull request</span>);

  return (
    <div className="relative flex flex-col space-y-8 w-full max-w-4.5xl mx-auto">
      {/* TL;DR row */}
      <div className="mt-4 flex items-center justify-between px-5 py-4 bg-black/40 border border-emerald-500/10">
        <div className="flex-1 text-sm text-gray-200 flex flex-wrap items-center gap-1">
          <span className="font-bold text-lg text-purple-300 mr-2 uppercase">TL;DR:</span>
          {tldr.length > 0 ? (
            <>
              {tldr.map((n, i) => (
                <React.Fragment key={i}>
                  {n}
                  {i < tldr.length - 1 && ', '}
                </React.Fragment>
              ))}
              <span>. Read the full summary below.</span>
            </>
          ) : (
            <span>No settled delivery to summarize.</span>
          )}
        </div>
        <button onClick={onToggleSummary} className="ml-4 p-1 text-gray-300 hover:text-emerald-300 transition-transform">
          <svg className={`w-5 h-5 transform transition-transform duration-200 ${summaryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Summary markdown */}
      {summaryOpen && (
        <div className="mt-3 text-base text-gray-200 leading-relaxed space-y-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-4"></div>
          <ReactMarkdown className="prose prose-invert max-w-none prose-base prose-headings:mb-3 prose-headings:mt-5 prose-headings:font-semibold prose-headings:text-emerald-300 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-purple-300 prose-a:no-underline hover:prose-a:text-purple-200 hover:prose-a:underline prose-blockquote:border-l-emerald-300/50 prose-blockquote:bg-black/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:-md prose-pre:bg-black/30 prose-pre:p-3 prose-pre: prose-pre:border prose-pre:border-purple-500/10 prose-code:text-emerald-200 prose-code:bg-black/40 prose-code:px-1 prose-code:py-0.5 prose-code: prose-code:border prose-code:border-emerald-500/20 prose-strong:text-white prose-strong:font-semibold prose-em:text-purple-200 prose-li:marker:text-emerald-400 prose-ol:pl-6 prose-ol:my-4 prose-ul:pl-6 prose-ul:my-4 prose-li:my-1 prose-table:border-collapse prose-table:w-full prose-thead:bg-black/30 prose-th:p-2 prose-th:text-emerald-300 prose-th:font-medium prose-td:p-2 prose-td:border-t prose-td:border-purple-500/10 prose-img: prose-img:max-w-full prose-img:shadow-lg">
            {settleDelivery.summary || ''}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default SettleDeliveryDocPanel;
