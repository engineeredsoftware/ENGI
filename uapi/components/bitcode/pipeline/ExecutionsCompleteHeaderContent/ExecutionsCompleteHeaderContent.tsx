/* eslint-disable react/no-multi-comp */
"use client";

import React from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from "next/dynamic";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

type Shippable = {
  url: string;
  number?: number;
  title?: string;
  content?: string;
  createdAt?: string;
};

type FileChanges = {
  edited: number;
  created: number;
  deleted: number;
  paths: string[];
  fileDiffs?: { path: string; added: number; removed: number }[];
  charDiff?: { edited: number; created: number; deleted: number };
};

export type HeaderShippables = {
  pullRequest?: Shippable | null;
  fileChanges?: FileChanges | null;
  summary?: string | null;
};

export type HeaderModelUsageStat = {
  provider: string;
  model: string;
  callCount: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalCostUsd: number;
  averageLatencyMs: number | null;
};

export type HeaderProcessingStats = {
  time: string;
  tokens?: { input: number; output: number; total: number };
  measuredBtd?: number;
  btdSemantics?: string;
  feeAsset?: 'BTC' | string;
  btcFeesPaid?: number | null;
  btcFeeUsdEquivalent?: number;
  averageLatencyMs?: number | null;
  modelUsage?: HeaderModelUsageStat[];
  guide?: string | null;
  phase?: string | null;
  agent?: string | null;
  iteration?: number | null;
  confidence?: number | null;
  selfInstruction?: string | null;
  suggestions?: string[];
  latestIterationTimestamp?: string | null;
  timeoutSeconds?: number | undefined;
  timeRemainingSeconds?: number | undefined;
  awaitingInstruction?: boolean | undefined;
  runId?: string;
  digest?: {
    agentsDocUpdated: boolean;
    readyToFinish: boolean;
    summary?: string | null;
    questionsAnswered?: number;
    patternsDocumented?: number;
    capturedAt?: string;
  };
};

export type RepoSnapshot = { org: string; repo: string; branch: string; commit: string };

export type HeaderAssetPackCompletion = {
  summary?: string | null;
  shippables?: HeaderShippables;
  assetPackSynthesisArtifacts?: HeaderShippables;
  writtenAssets?: HeaderShippables;
  deliveryMechanism?: HeaderShippables;
  read?: string | null;
  writtenAssetType?: string | null;
  assetPack?: {
    read?: string | null;
    writtenAssetType?: string | null;
    definitionOfRead?: string | null;
    deliveryTarget?: string | null;
  };
  processingStats?: HeaderProcessingStats;
  repoSnapshot?: RepoSnapshot;
  guide?: string | null;
};

const formatWrittenAssetType = (type?: string | null) => {
  switch (type) {
    case 'read-satisfaction-asset-pack':
      return 'Read-Satisfaction AssetPack';
    default:
      return undefined;
  }
};

export function CompleteHeaderContent({
  shippables,
  processingStats,
  repoSnapshot,
  postprocessed,
  executionType,
}: {
  shippables?: HeaderShippables;
  processingStats?: HeaderProcessingStats;
  repoSnapshot?: RepoSnapshot;
  postprocessed?: any;
  executionType?: 'agentic-execution:asset-pack';
}) {
  const router = useRouter();
  const search = useSearchParams();
  // E2E alignment note:
  // - processingStats and repoSnapshot are sourced from server-computed asset_pack_completion objects
  //   emitted by both pipelines. The UI renders only server-provided values.
  const [showFileDetails, setShowFileDetails] = React.useState(false);
  const finishDeliveredShippables = shippables || {};
  const tldr: React.ReactNode[] = [];
  if (finishDeliveredShippables?.pullRequest) {
    const pr = finishDeliveredShippables.pullRequest;
    tldr.push(
      <a key={`pr-${pr.number}`} href={pr.url} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-emerald-200">
        PR: {pr.title || `#${pr.number}`}
      </a>
    );
  }
  const headerTitle = 'Written Asset Ready';
  const digestStatus = processingStats?.digest || null;

  return (
    <div className="relative flex flex-col space-y-6 w-full max-w-4.5xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-4xl font-bold tracking-tight leading-normal">{headerTitle}</h1>
        <div className="flex items-center gap-2">
          {/* Kind pill */}
          <span className="px-2 py-0.5 text-[11px] rounded-full border border-emerald-400/40 text-emerald-300 bg-emerald-900/20">
            Shippable
          </span>
          {/* Quick action chips: prefill toggles */}
          <>
            <button
              className="px-2 py-0.5 text-[11px] rounded border border-emerald-500/30 text-emerald-200 hover:bg-emerald-900/20"
              onClick={() => {
                const params = new URLSearchParams(Array.from(search.entries()));
                params.set('preprocess', 'multi');
                router.replace(`/executions?${params.toString()}`);
              }}
            >Multi</button>
            <button
              className="px-2 py-0.5 text-[11px] rounded border border-emerald-500/30 text-emerald-200 hover:bg-emerald-900/20"
              onClick={() => {
                const params = new URLSearchParams(Array.from(search.entries()));
                params.set('preprocess', 'compute');
                router.replace(`/executions?${params.toString()}`);
              }}
            >Compute</button>
          </>
        </div>
      </div>

      {/* Summary + TLDR */}
      {finishDeliveredShippables?.summary && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-5 py-4 bg-black/40 rounded-md border border-emerald-500/10">
            <div className="flex-1 text-sm text-gray-200 flex flex-wrap items-center gap-1">
              <span className="font-bold text-lg text-purple-300 mr-2 uppercase">TL;DR:</span>
              {tldr.length > 0 ? (
                tldr.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {item}
                    {idx < tldr.length - 1 && <span className="text-gray-500">,</span>}
                  </React.Fragment>
                ))
              ) : (
                <span className="text-gray-400">No delivery surfaces to summarize</span>
              )}
              <span>.</span>
            </div>
          </div>
          <div className="rounded-md border border-emerald-500/10 bg-black/30 p-4">
            <ReactMarkdown className="prose prose-invert max-w-none">{finishDeliveredShippables.summary}</ReactMarkdown>
          </div>
          {/* Unified postprocessed details shown beneath TL;DR */}
          {postprocessed && (
            <PostprocessedSummary postprocessed={postprocessed} />
          )}
        </div>
      )}

      {digestStatus && (
        <div className="rounded-md border border-sky-500/30 bg-sky-500/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-sky-200">Digest Guide</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${digestStatus.agentsDocUpdated ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'}`}>
              {digestStatus.agentsDocUpdated ? 'AGENTS.md updated' : 'AGENTS.md pending'}
            </span>
          </div>
          {digestStatus.summary && (
            <p className="text-sm text-sky-100 whitespace-pre-wrap">{digestStatus.summary}</p>
          )}
          <p className="text-xs text-sky-200/80">
            Questions answered: {digestStatus.questionsAnswered ?? 0} · Patterns documented: {digestStatus.patternsDocumented ?? 0}
          </p>
        </div>
      )}

      {/* Metrics Card */}
      <div className="grid grid-cols-1 laptop:grid-cols-3 gap-6">
        {/* Processing */}
        <div className="space-y-3">
          <h3 className="text-emerald-300 text-sm font-medium uppercase tracking-wider border-b border-emerald-500/20 pb-2">Processing</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Completion Time</span>
            <span className="text-emerald-300 font-medium text-sm">{processingStats?.time || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Tokens</span>
            {processingStats?.tokens ? (
              <div className="flex flex-col items-end text-sm">
                <span className="text-emerald-300">{processingStats.tokens.total.toLocaleString()}</span>
                <span className="text-xs text-gray-500">
                  {processingStats.tokens.input.toLocaleString()} in / {processingStats.tokens.output.toLocaleString()} out
                </span>
              </div>
            ) : (
              <span className="text-gray-500">—</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Measured $BTD</span>
            <span className="text-emerald-300 font-medium text-sm">{processingStats?.measuredBtd ?? 1}</span>
          </div>
          {typeof processingStats?.btcFeeUsdEquivalent === 'number' && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">BTC Fee Basis</span>
              <span className="text-emerald-300 font-medium text-sm">${processingStats.btcFeeUsdEquivalent.toFixed(2)}</span>
            </div>
          )}
          {typeof processingStats?.btcFeesPaid === 'number' && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">BTC Fees Paid</span>
              <span className="text-emerald-300 font-medium text-sm">{processingStats.btcFeesPaid.toFixed(8)} BTC</span>
            </div>
          )}
          {typeof processingStats?.averageLatencyMs === 'number' && Number.isFinite(processingStats.averageLatencyMs) && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Avg Latency</span>
              <span className="text-emerald-300 font-medium text-sm">{processingStats.averageLatencyMs} ms</span>
            </div>
          )}
          {processingStats?.modelUsage && processingStats.modelUsage.length > 0 && (
            <div className="pt-2 border-t border-emerald-500/10 space-y-1">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-500">Model Usage</div>
              {processingStats.modelUsage.map((usage) => (
                <div key={`${usage.provider}:${usage.model}`} className="flex items-center justify-between text-xs text-gray-300">
                  <span className="text-gray-400">{usage.provider}/{usage.model}</span>
                  <span className="text-emerald-300">
                    {usage.totalTokens.toLocaleString()} tok · ${usage.totalCostUsd.toFixed(2)}
                    {typeof usage.averageLatencyMs === 'number' && Number.isFinite(usage.averageLatencyMs) ? ` · ${usage.averageLatencyMs}ms` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <h3 className="text-emerald-300 text-sm font-medium uppercase tracking-wider border-b border-emerald-500/20 pb-2">Input Assets</h3>
          {/* Files changed summary if present */}
          {finishDeliveredShippables?.fileChanges ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-emerald-300 text-lg font-medium">{finishDeliveredShippables.fileChanges.edited}</div>
                <div className="text-xs text-gray-400">Edited</div>
              </div>
              <div>
                <div className="text-emerald-300 text-lg font-medium">{finishDeliveredShippables.fileChanges.created}</div>
                <div className="text-xs text-gray-400">Created</div>
              </div>
              <div>
                <div className="text-emerald-300 text-lg font-medium">{finishDeliveredShippables.fileChanges.deleted}</div>
                <div className="text-xs text-gray-400">Deleted</div>
              </div>
            </div>
          ) : null}

          {/* Toggleable details */}
          {finishDeliveredShippables?.fileChanges && (finishDeliveredShippables.fileChanges.fileDiffs?.length || finishDeliveredShippables.fileChanges.paths?.length) ? (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowFileDetails(v => !v)}
                className="text-xs px-2 py-1 rounded-md border border-emerald-500/20 text-emerald-300 hover:text-emerald-200 hover:border-emerald-500/40 transition-colors"
              >
                {showFileDetails ? 'Hide Changed Files' : 'Show Changed Files'}
              </button>
              {showFileDetails && (
                <div className="mt-2 max-h-40 overflow-auto pr-2 border border-emerald-500/10 rounded-md bg-black/20">
                  {(finishDeliveredShippables.fileChanges.fileDiffs && finishDeliveredShippables.fileChanges.fileDiffs.length > 0
                    ? finishDeliveredShippables.fileChanges.fileDiffs
                    : (finishDeliveredShippables.fileChanges.paths || []).map(path => ({ path, added: 0, removed: 0 }))
                  ).slice(0, 50).map((diff: any, idx: number) => (
                    <div key={idx} className="px-2 py-1 text-xs text-gray-300 flex items-center justify-between border-b border-gray-800/30 last:border-0">
                      <span className="truncate mr-2">{diff.path}</span>
                      <span className="ml-2 whitespace-nowrap">
                        {typeof diff.added === 'number' || typeof diff.removed === 'number' ? (
                          <>
                            <span className="text-green-300">+{diff.added || 0}</span>
                            <span className="text-gray-500 mx-1">/</span>
                            <span className="text-red-300">-{diff.removed || 0}</span>
                          </>
                        ) : null}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No file change data</div>
          )}
        </div>

        {/* Repo Snapshot */}
        <div className="space-y-3">
          <h3 className="text-emerald-300 text-sm font-medium uppercase tracking-wider border-b border-emerald-500/20 pb-2">Repository</h3>
          {repoSnapshot ? (
            <div className="text-sm text-gray-300 space-y-1">
              <div>{repoSnapshot.org}/{repoSnapshot.repo}</div>
              <div>Branch: {repoSnapshot.branch}</div>
              <div>Commit: {repoSnapshot.commit}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No repo snapshot</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function getHeaderWrittenAssets(
  assetPackCompletion?: HeaderAssetPackCompletion | null,
): HeaderShippables | null {
  return (
    assetPackCompletion?.assetPackSynthesisArtifacts ||
    assetPackCompletion?.writtenAssets ||
    null
  );
}

export function getHeaderShippables(
  assetPackCompletion?: HeaderAssetPackCompletion | null,
): HeaderShippables | null {
  return (
    assetPackCompletion?.shippables ||
    assetPackCompletion?.deliveryMechanism ||
    null
  );
}

export const getHeaderDeliveryMechanism = getHeaderShippables;

export function mergeHeaderShippables(
  writtenAssets?: HeaderShippables | null,
  deliveryMechanism?: HeaderShippables | null,
): HeaderShippables | null {
  if (!writtenAssets && !deliveryMechanism) return null;

  return {
    pullRequest: deliveryMechanism?.pullRequest ?? null,
    fileChanges: writtenAssets?.fileChanges ?? null,
    summary: writtenAssets?.summary ?? deliveryMechanism?.summary ?? null,
  };
}

function PostprocessedSummary({ postprocessed }: { postprocessed: any }) {
  // Read highlight flag from URL
  let highlight = false;
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      highlight = (params.get('highlight') || '') === 'postprocessed';
    }
  } catch {}
  // Clear highlight param after a short delay
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if ((params.get('highlight') || '') === 'postprocessed') {
      const timer = setTimeout(() => {
        params.delete('highlight');
        const url = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', url);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  const kind = postprocessed?.kind;
  const isShippable = kind === 'shippable';
  const isMultiShippable = kind === 'multi-shippable';
  const isEvidenceDocument = postprocessed?.kind === 'evidence_document';
  const evidenceDocumentType = postprocessed?.evidenceDocumentType;
  const series: any[] = Array.isArray(postprocessed?.entries)
    ? postprocessed.entries
    : (Array.isArray(postprocessed?.series) ? postprocessed.series : []);
  const [seriesIndex, setSeriesIndex] = React.useState(0);
  const selected = series.length > 0 ? series[Math.min(seriesIndex, series.length - 1)] : null;

  // Initialize selected entry from URL param `entry` (0-based index)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const idxStr = params.get('entry');
    if (!idxStr) return;
    const idx = Math.max(0, Math.min(series.length - 1, parseInt(idxStr, 10)));
    if (!Number.isNaN(idx)) setSeriesIndex(idx);
  }, [series.length]);
  return (
    <div className={`mt-4 rounded-md ${highlight ? 'border-emerald-400/60 animate-pulse' : 'border-emerald-500/10'} border bg-black/30 p-4`}
      style={{ animationDuration: highlight ? '1.8s' : undefined }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-emerald-300">Postprocessed</div>
        {postprocessed?.repository && (
          <div className="text-[11px] text-gray-400">{postprocessed.repository}</div>
        )}
      </div>
      {postprocessed?.validationReady && (
        <div className="mb-3 text-xs">
          <span className={`inline-flex items-center px-2 py-0.5 rounded border mr-2 ${postprocessed.validationReady.approved ? 'border-emerald-500/40 text-emerald-300' : 'border-yellow-500/40 text-yellow-300'}`}>
            Ready To Finish: {postprocessed.validationReady.approved ? 'Approved' : 'Not Approved'}
          </span>
          {typeof postprocessed.validationReady.confidence === 'number' && (
            <span className="text-gray-400">Confidence: {(postprocessed.validationReady.confidence * 100).toFixed(0)}%</span>
          )}
        </div>
      )}
      {(isShippable || isMultiShippable) && (
        <div className="text-sm text-gray-300">
          {postprocessed?.title && <div className="text-emerald-200 mb-1">{postprocessed.title}</div>}
          {formatWrittenAssetType(postprocessed?.writtenAssetType) && (
            <div className="text-[11px] text-gray-400 mb-1">
              Written Asset: {formatWrittenAssetType(postprocessed?.writtenAssetType)}
            </div>
          )}
          {postprocessed?.summary && <div className="opacity-90">{postprocessed.summary}</div>}
          {postprocessed?.artifacts && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white/5 rounded px-2 py-1">
                <div className="text-gray-500">Files Modified</div>
                <div className="text-white text-sm">{postprocessed.artifacts.filesModified?.length ?? 0}</div>
              </div>
              <div className="bg-white/5 rounded px-2 py-1">
                <div className="text-gray-500">Files Created</div>
                <div className="text-white text-sm">{postprocessed.artifacts.filesCreated?.length ?? 0}</div>
              </div>
              <div className="bg-white/5 rounded px-2 py-1">
                <div className="text-gray-500">Tests Added</div>
                <div className="text-white text-sm">{postprocessed.artifacts.testsAdded ?? 0}</div>
              </div>
              <div className="bg-white/5 rounded px-2 py-1">
                <div className="text-gray-500">Documentation</div>
                <div className="text-white text-sm">{postprocessed.artifacts.documentation?.length ?? 0}</div>
              </div>
            </div>
          )}
          {series.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] text-gray-400">Series ({series.length})</div>
                {selected?.repository && (
                  <div className="text-[11px] text-gray-500">{selected.repository}</div>
                )}
              </div>
              {/* Selector chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {series.slice(0, 10).map((s: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSeriesIndex(idx);
                      try {
                        const params = new URLSearchParams(window.location.search);
                        params.set('entry', String(idx));
                        const url = `${window.location.pathname}?${params.toString()}`;
                        window.history.replaceState({}, '', url);
                      } catch {}
                    }}
                    className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${
                      idx === seriesIndex
                        ? 'border-emerald-400/60 text-emerald-200 bg-emerald-900/20'
                        : 'border-emerald-500/20 text-gray-300 hover:border-emerald-500/40 hover:text-emerald-200'
                    }`}
                    aria-label={`Select shippable ${idx + 1}`}
                  >
                    {s?.title ? s.title.slice(0, 28) : `Shippable ${idx + 1}`}
                  </button>
                ))}
                {series.length > 10 && (
                  <span className="px-2 py-0.5 text-[11px] rounded border border-emerald-500/10 text-gray-400">…{series.length - 10} more</span>
                )}
              </div>
              {/* Selected entry brief */}
              {selected && (
                <div className="text-[12px] text-gray-300 bg-black/20 border border-emerald-500/10 rounded p-2">
                  {selected.title && (
                    <div className="text-emerald-200 mb-1">{selected.title}</div>
                  )}
                  {selected.summary && (
                    <div className="opacity-90 whitespace-pre-wrap">{selected.summary}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {isEvidenceDocument && (
        <div className="text-sm text-gray-300">
          <div className="text-emerald-200 mb-1">{postprocessed?.title || 'Evidence Document'}</div>
          {evidenceDocumentType && (
            <div className="text-[11px] text-gray-400 mb-1">Type: {evidenceDocumentType}</div>
          )}
          {postprocessed?.output && (
            <pre className="text-[11px] text-gray-300 whitespace-pre-wrap max-h-56 overflow-auto border border-emerald-500/10 rounded p-2 bg-black/20">
              {String(postprocessed.output).slice(0, 1600)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
