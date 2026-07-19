"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AfterOnboardingOverlay } from '@/components/auxillaries/shared/AfterOnboardingOverlay/AfterOnboardingOverlay';

// Re-use the existing repository data-sharing shape across Externals and Wallet-adjacent reads.
export interface DataShareRepo {
  fullName: string;
  branch: string;
  commit: string;
  enabled: boolean;
  lastAnalysisAt?: string | null;
  latestAnalysisResult?: any;
  // Optional list of additional snapshots/commits for drill-down – not yet returned
  snapshots?: {
    commit: string;
    enabled: boolean;
    lastAnalysisAt?: string | null;
  }[];
}

/** Per-page limit for the per-repo share table (not “enable all”). */
const REPO_PAGE_SIZE = 10;

interface AuxillariesDataSharingPanelProps {
  className?: string;
  /** When true, the panel is visually disabled/blurred for onboarding */
  overlayed?: boolean;
}

export default function AuxillariesDataSharingPanel({ className = "", overlayed = false }: AuxillariesDataSharingPanelProps) {
  const [repos, setRepos] = useState<DataShareRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [enableAll, setEnableAll] = useState(false);
  const [updatingAll, setUpdatingAll] = useState(false);
  const [page, setPage] = useState(0);

  // Fetch on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auxillaries/user/data-share");
        const json = await res.json();
        if (!cancelled && json.success && Array.isArray(json.repos)) {
          setRepos(json.repos);
          // Empty inventory must not light the master toggle (Array.every is true on []).
          setEnableAll(
            json.repos.length > 0 && json.repos.every((r: DataShareRepo) => r.enabled),
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pageCount = Math.max(1, Math.ceil(repos.length / REPO_PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRepos = useMemo(() => {
    const start = safePage * REPO_PAGE_SIZE;
    return repos.slice(start, start + REPO_PAGE_SIZE).map((repo, offset) => ({
      repo,
      absoluteIndex: start + offset,
    }));
  }, [repos, safePage]);

  // Keep page in range when inventory shrinks (disconnect / filter).
  useEffect(() => {
    if (page > pageCount - 1) {
      setPage(Math.max(0, pageCount - 1));
    }
  }, [page, pageCount]);

  // Toggle all repos
  const handleToggleAll = async () => {
    const newValue = !enableAll;
    setEnableAll(newValue);
    setUpdatingAll(true);
    setRepos((prev) => prev.map((r) => ({ ...r, enabled: newValue })));
    try {
      // Toggle each repository individually until the backend owns a bulk action.
      await Promise.all(
        repos.map((repo) =>
          fetch("/api/auxillaries/user/data-share", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "toggle",
              repoFullName: repo.fullName,
              branch: repo.branch,
              commit: repo.commit,
              enabled: newValue,
            }),
          })
        )
      );
    } catch (err) {
      // Rollback UI if request fails
      setRepos((prev) => prev.map((r) => ({ ...r, enabled: !newValue })));
      setEnableAll(!newValue);
    } finally {
      setUpdatingAll(false);
    }
  };

  const toggleRepo = async (idx: number) => {
    const repo = repos[idx];
    const newEnabled = !repo.enabled;
    // Optimistic UI – update and derive master toggle in one pass
    setRepos((prev) => {
      const updated = prev.map((r, i) => (i === idx ? { ...r, enabled: newEnabled } : r));
      setEnableAll(updated.every((r) => r.enabled));
      return updated;
    });
    try {
      await fetch("/api/auxillaries/user/data-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          repoFullName: repo.fullName,
          branch: repo.branch,
          commit: repo.commit,
          enabled: newEnabled,
        }),
      });
      // No additional state changes required on success – already handled
    } catch (err) {
      // Revert on failure and restore master toggle state
      setRepos((prev) => {
        const reverted = prev.map((r, i) => (i === idx ? { ...r, enabled: !newEnabled } : r));
        setEnableAll(reverted.every((r) => r.enabled));
        return reverted;
      });
    }
  };

  return (
    <AfterOnboardingOverlay disabled={overlayed} className={className}>
      <div className="relative w-full">
        {/*
          Section title/copy live on the Externals card subtitle so this panel
          is controls-only (no second "Read-space knowledge sharing" heading).
        */}
      {/* Enable All toggle */}
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-medium text-slate-200">Set it and forget it</span>
        <label className="relative inline-flex cursor-pointer select-none items-center">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enableAll}
            onChange={handleToggleAll}
            disabled={loading || updatingAll}
          />
          <div
            className="h-6 w-11 rounded-none border border-slate-600 bg-slate-700 transition-all duration-200 peer-checked:border-violet-300/55 peer-checked:bg-violet-500 peer-checked:shadow-[0_0_14px_rgba(167,139,250,0.45),0_0_0_1px_rgba(196,181,253,0.2)_inset]"
          ></div>
          <span
            className="absolute left-0.5 top-0.5 h-5 w-5 transform rounded-none bg-white shadow transition-transform duration-200 peer-checked:translate-x-5 peer-checked:bg-violet-50"
          ></span>
        </label>
        {loading ? <span className="text-sm text-slate-400">loading…</span> : null}
      </div>

        {enableAll ? (
        <div className="text-sm font-medium text-violet-200/90 bg-violet-400/10 border border-violet-300/25 rounded-none px-4 py-3">
          All current and future Externals-approved repositories will sync into read-space automatically.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-none border border-slate-700/60 bg-slate-800/40 backdrop-blur-md [mask-image:linear-gradient(black,black)]">
            <table className="min-w-full text-sm whitespace-nowrap" data-testid="externals-data-share-repositories">
              <thead className="text-slate-300 font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Repository</th>
                  <th className="py-3 px-4 text-left hidden laptop:table-cell">Branch</th>
                  <th className="py-3 px-4 text-left hidden laptop:table-cell">Commit</th>
                  <th className="py-3 px-4 text-center">Share</th>
                </tr>
              </thead>
              <tbody>
                {pageRepos.map(({ repo, absoluteIndex }) => (
                  <tr
                    key={repo.fullName + repo.commit}
                    data-testid="externals-data-share-repo-row"
                    data-repo-full-name={repo.fullName}
                    className="border-t border-slate-700/60 hover:bg-[#1A2335] group transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-200 flex items-center gap-2">
                      {repo.fullName}
                    </td>
                    <td className="py-3 px-4 hidden laptop:table-cell text-slate-300">{repo.branch}</td>
                    <td className="py-3 px-4 hidden laptop:table-cell text-slate-400 font-mono text-xs">
                      {repo.commit.slice(0, 7)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={repo.enabled}
                          onChange={() => toggleRepo(absoluteIndex)}
                          disabled={loading}
                        />
                        <div className="w-9 h-5 rounded-none border border-slate-600 peer bg-slate-700 peer-checked:bg-teal-400 transition-colors" />
                        <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-none shadow transform peer-checked:translate-x-4 transition-transform" />
                      </label>
                    </td>
                  </tr>
                ))}
                {!loading && repos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 px-4 text-center text-slate-400">
                      No eligible repositories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {repos.length > REPO_PAGE_SIZE ? (
            <div
              className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400"
              data-testid="externals-data-share-pagination"
            >
              <p>
                Showing {safePage * REPO_PAGE_SIZE + 1}–
                {Math.min((safePage + 1) * REPO_PAGE_SIZE, repos.length)} of {repos.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-none border border-slate-600/80 bg-slate-800/60 px-3 py-1.5 font-semibold uppercase tracking-[0.14em] text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-700/70 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage <= 0 || loading}
                  aria-label="Previous repository page"
                >
                  Previous
                </button>
                <span className="min-w-[4.5rem] text-center tabular-nums text-slate-300">
                  {safePage + 1} / {pageCount}
                </span>
                <button
                  type="button"
                  className="rounded-none border border-slate-600/80 bg-slate-800/60 px-3 py-1.5 font-semibold uppercase tracking-[0.14em] text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-700/70 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={safePage >= pageCount - 1 || loading}
                  aria-label="Next repository page"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
        )}
      </div>
    </AfterOnboardingOverlay>
  );
}
