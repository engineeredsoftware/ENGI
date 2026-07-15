'use client';

// File: apps/uapi/components/bitcode/layout/sidebars/left-sidebar.tsx


import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SidebarToggle, SidebarOption } from '@/components/bitcode/layout/sidebars/SidebarToggle/SidebarToggle';
import {
  sidebarBase,
  sidebarBg,
  sidebarBorderColor,
  sidebarLeft,
  sidebarW19,
  sidebarShadowLeft,
} from '@/components/bitcode/layout/sidebars/SidebarClasses/sidebarClasses';
import useOnboardingLock from '@/hooks/useOnboardingLock';
import FlipText from '@/components/bitcode/layout/sidebars/FlipText/FlipText';
import {
  fetchPipelineExecutionHistory,
} from '@/networking/api-client';

function renderDocToggleIcon(className?: string) {
  return <div className={className}>📄</div>;
}
import type {
  PipelineExecution,
} from '@/types/api';
const sidebarOptions: [SidebarOption, SidebarOption] = [
  {
    id: 'asset-packs',
    label: 'AssetPacks',
    icon: renderDocToggleIcon(),
  },
  {
    id: 'measure',
    label: 'Read Measurement',
    icon: renderDocToggleIcon(),
  }
];

export default function LeftSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<'asset-packs' | 'measure'>('asset-packs');
  // Items mode removed; show runs only
  const [assetPackRuns, setAssetPackRuns] = useState<PipelineExecution[]>([]);

  const router = useRouter();

  // Details drawer removed; navigation goes to /executions detail page

  // Fetch sidebar data in parallel on mount
  useEffect(() => {
    /**
     * We fetch all data sources in one Promise.all so the browser can
     * perform the requests in parallel. This shaves off a few round-trip
     * milliseconds compared to the previous sequential `fetch*` calls
     * without changing any behaviour.
     */
    const fetches = [
      fetchPipelineExecutionHistory(),
    ];

    Promise.all(fetches)
      .then(
        (results) => {
          const [runs] = results as any[];
          setAssetPackRuns(runs || []);
        },
      )
      .catch(console.error);
  }, []);

  // Extract the runId search param once and memoise the result so we don't
  // repeatedly construct `URLSearchParams` inside render loops.
  const runIdParam = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('runId')
    : null;

  // Memoised filtered lists – avoids O(n) filtering on every render when
  // the underlying arrays haven't changed.
  // Items mode removed – no item filtering necessary

  const onboardingLocked = useOnboardingLock();

  const sidebarTransition = { duration: 0.25, ease: 'easeInOut' } as const;

  return (
    <div data-testid="sidebar-left-container">
      <SidebarToggle
        position="left"
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        options={sidebarOptions}
        activeOption={activeSidebar}
        onOptionChange={(optionId) => setActiveSidebar(optionId as 'asset-packs' | 'measure')}
        onboardingLocked={onboardingLocked}
      />
      {/* Sticky header inside the sidebar when open */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="sidebar-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={sidebarTransition}
            className="fixed top-0 left-0 w-[19rem] z-[51] flex items-center gap-2 px-4 py-2 border-b border-emerald-500/20 bg-[#0a1428]/90 backdrop-blur-xl"
          >
            {activeSidebar === 'asset-packs' ? (
              <div className="flex items-center gap-2">
                {renderDocToggleIcon("w-4 h-4 text-gray-300 sidebar-text")}
                <FlipText
                  text={'AssetPack Executions'}
                  className="text-sm font-semibold text-emerald-300 sidebar-text"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {renderDocToggleIcon("w-4 h-4 text-gray-300 sidebar-text")}
                <FlipText
                  text={'Read Measurement Executions'}
                  className="text-sm font-semibold text-emerald-300 sidebar-text"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeSidebar === 'asset-packs' ? (
          isSidebarOpen ? (
            <motion.div
              className={`${sidebarBase} ${sidebarBg} ${sidebarLeft} ${sidebarW19} ${sidebarBorderColor} ${sidebarShadowLeft} z-50`}
              key="asset-pack-runs"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={sidebarTransition}
            >
              <div className="p-2 space-y-1 mt-11">
                {assetPackRuns.map((run) => {
                  const summaryText = (() => {
                    let ctx: any = run.context;
                    if (typeof ctx === 'string') {
                      try {
                        ctx = JSON.parse(
                          ctx.replace(/^E'/, '').replace(/^'/, '').replace(/'$/, '')
                        );
                      } catch {
                        ctx = undefined;
                      }
                    }
                    const od: any = (run as any).output || (run as any).output_data || {};
                    const postprocessed = (od?.postprocessed) || (ctx?.postprocessed?.result || ctx?.postprocessed) || undefined;
                    const assetPackCompletionSummary =
                      od?.asset_pack_completion?.assetPackSynthesisArtifacts?.summary ||
                      od?.asset_pack_completion?.writtenAssets?.summary ||
                      undefined;
                    return (
                      postprocessed?.title || assetPackCompletionSummary || ctx?.summary || `Run ${run.id}`
                    );
                  })();

                  const ctx: any = typeof (run as any).context === 'string' ? undefined : (run as any).context;
                    const od: any = (run as any).output || (run as any).output_data || {};
                    const pp: any = (od?.postprocessed) || (ctx?.postprocessed?.result || ctx?.postprocessed) || undefined;
                    return (
                    <div key={run.id} className="w-full">
                      <button
                        className="block w-full px-3 py-2 rounded text-left bg-gray-800 text-gray-300 hover:bg-emerald-700 hover:text-white transition-colors"
                        onClick={() => router.push(`/executions?type=agentic-execution:asset-pack&postprocessingType=agentic-execution:asset-pack&executionId=${run.id}&runId=${run.id}&highlight=postprocessed`)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium truncate">
                            {summaryText}
                          </div>
                          <span className="shrink-0 text-[10px] text-emerald-300/70">run</span>
                        </div>
                        {/* Small postprocessed preview */}
                        {pp && (
                          <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                            {pp.repository ? (<span className="mr-1">{pp.repository}</span>) : null}
                            {pp.summary ? (<span className="opacity-80">• {String(pp.summary).slice(0, 80)}</span>) : null}
                          </div>
                        )}
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {new Date(run.created_at).toLocaleString()}
                        </div>
                      </button>
                    </div>
                    );
                  })}
                {assetPackRuns.length === 0 && (
                  <div className="text-xs text-gray-500">No runs yet</div>
                )}
              </div>
            </motion.div>
          ) : null
        ) : isSidebarOpen ? (
          <motion.div
            className={`${sidebarBase} ${sidebarBg} ${sidebarLeft} ${sidebarW19} ${sidebarBorderColor} ${sidebarShadowLeft} z-50`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={sidebarTransition}
          >
            <div className="p-2 space-y-1 mt-11">
              {assetPackRuns.map((run) => {
                let ctx: any = (run as any).context;
                if (typeof ctx === 'string') {
                  try { ctx = JSON.parse(ctx.replace(/^E'/, '').replace(/^'/, '').replace(/'$/, '')); } catch { ctx = undefined; }
                }
                const postprocessed = ctx?.postprocessed?.result || ctx?.postprocessed || undefined;
                const summaryText = postprocessed?.title || (run as any).summary || `Run ${run.id}`;
                return (
                  <div key={run.id} className="w-full">
                    <button
                      className="block w-full px-3 py-2 rounded text-left bg-gray-800 text-gray-300 hover:bg-emerald-700 hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium truncate">
                          {summaryText}
                        </div>
                        <span className="shrink-0 text-[10px] text-emerald-300/70">run</span>
                      </div>
                      {postprocessed && (
                        <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                          {postprocessed.repository ? (<span className="mr-1">{postprocessed.repository}</span>) : null}
                          {postprocessed.output ? (<span className="opacity-80">• {String(postprocessed.output).slice(0, 80)}</span>) : null}
                        </div>
                      )}
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {new Date(run.created_at).toLocaleString()}
                      </div>
                    </button>
                  </div>
                );
              })}
              {assetPackRuns.length === 0 && (
                <div className="text-xs text-gray-500">No runs yet</div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {/* Details Drawer removed; navigation routes to /executions */}
    </div>
  );
}
