'use client';

/**
 * VCSFileTreePicker — a multi-select file-tree picker over the SELECTED
 * repository·branch·commit. Directories lazy-load their children through the
 * VCS `tree` resource (`/api/vcs?resource=tree`); selecting a directory
 * selects its prefix (`dir/`), selecting a file selects the exact path.
 *
 * Two pickers can be made MUTUALLY EXCLUSIVE by passing each other's
 * selections as `conflictingPaths`: conflicting rows are disabled with the
 * given conflict label. Square theme, no card-in-card chrome.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import type { VCSProviderType } from '@bitcode/vcs-generics-core';

interface VCSFileTreePickerTreeItem {
  path: string;
  type: 'blob' | 'tree';
}

interface VCSFileTreePickerProps {
  provider: VCSProviderType;
  repositoryFullName: string | null;
  /** Commit sha (preferred) or branch name the tree is read at. */
  treeRef?: string | null;
  selectedPaths: string[];
  onChange: (nextPaths: string[]) => void;
  /** Paths selected by the counterpart picker — disabled here. */
  conflictingPaths?: string[];
  /** Why a conflicting row is disabled (e.g. 'Already a Permissible sources'). */
  conflictLabel?: string;
  emptyLabel?: string;
  /** When true, selection is frozen (run-detail lock). Expand still works. */
  disabled?: boolean;
  'aria-label'?: string;
}

function directoryKey(path: string) {
  return `${path.replace(/\/+$/u, '')}/`;
}

function baseName(path: string) {
  const trimmed = path.replace(/\/+$/u, '');
  const index = trimmed.lastIndexOf('/');
  return index === -1 ? trimmed : trimmed.slice(index + 1);
}

function normalizeTreeItems(raw: unknown): VCSFileTreePickerTreeItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item: { path?: unknown; type?: unknown }) =>
        typeof item?.path === 'string' &&
        (item?.type === 'blob' || item?.type === 'tree'),
    )
    .map((item: { path: string; type: 'blob' | 'tree' }) => ({
      path: item.path,
      type: item.type,
    }))
    .sort((a, b) =>
      a.type === b.type
        ? a.path.localeCompare(b.path)
        : a.type === 'tree'
          ? -1
          : 1,
    );
}

export function VCSFileTreePicker({
  provider,
  repositoryFullName,
  treeRef,
  selectedPaths,
  onChange,
  conflictingPaths = [],
  conflictLabel = 'selected in the other picker',
  emptyLabel = 'Connect a repository to browse its files.',
  disabled = false,
  'aria-label': ariaLabel,
}: VCSFileTreePickerProps) {
  // Children by directory path ('' = repository root); null while loading.
  const [childrenByPath, setChildrenByPath] = useState<
    Record<string, VCSFileTreePickerTreeItem[] | null>
  >({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  // Bumped on every tree-identity change (repo/ref) and on unmount so
  // in-flight fetches from a prior package cannot write empty/error results
  // over a later successful load (the flicker-to-empty race). Same pattern
  // DepositSourceSelection uses with its disposed flags.
  const loadGenerationRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [owner, repo] = useMemo(() => {
    const [ownerPart, repoPart] = (repositoryFullName || '').split('/');
    return [ownerPart || null, repoPart || null];
  }, [repositoryFullName]);

  const conflictSet = useMemo(
    () => new Set(conflictingPaths),
    [conflictingPaths],
  );
  const selectedSet = useMemo(() => new Set(selectedPaths), [selectedPaths]);

  const loadDirectory = useCallback(
    async (path: string, generation: number, signal: AbortSignal) => {
      if (!owner || !repo) return;
      // Only mark loading when we don't already have items for this path —
      // keeps the tree painted during a soft re-fetch of an expanded dir.
      setChildrenByPath((previous) =>
        previous[path] === undefined
          ? { ...previous, [path]: null }
          : previous,
      );
      try {
        const params = new URLSearchParams({
          resource: 'tree',
          provider,
          owner,
          repo,
        });
        if (path) params.set('path', path);
        if (treeRef) params.set('ref', treeRef);
        const response = await fetch(`/api/vcs?${params.toString()}`, {
          signal,
        });
        if (generation !== loadGenerationRef.current || signal.aborted) return;
        const payload = response?.ok
          ? await response.json().catch(() => null)
          : null;
        if (generation !== loadGenerationRef.current || signal.aborted) return;
        if (!payload) {
          // Failed read: keep any previously-good paint; only write empty
          // when we never had items (null/undefined). Avoids the
          // success→stale-failure→Empty directory flicker.
          setChildrenByPath((previous) => {
            const existing = previous[path];
            if (Array.isArray(existing) && existing.length > 0) return previous;
            return { ...previous, [path]: [] };
          });
          setLoadError('Unable to read the repository file tree.');
          return;
        }
        const items = normalizeTreeItems(payload.items);
        setChildrenByPath((previous) => ({ ...previous, [path]: items }));
        setLoadError(null);
      } catch (error) {
        const aborted =
          signal.aborted ||
          (error instanceof Error && error.name === 'AbortError');
        if (generation !== loadGenerationRef.current || aborted) {
          return;
        }
        setChildrenByPath((previous) => {
          const existing = previous[path];
          if (Array.isArray(existing) && existing.length > 0) return previous;
          return { ...previous, [path]: [] };
        });
        setLoadError('Unable to read the repository file tree.');
      }
    },
    [owner, provider, repo, treeRef],
  );

  // Reset + load the root whenever the source package (owner/repo/ref) changes.
  // treeRef thrashing is expected: DepositSourceSelection publishes branch
  // first, then head commit once commits load — without abort + generation
  // guards the branch-fetch can land after the commit-fetch and wipe it.
  useEffect(() => {
    const generation = loadGenerationRef.current + 1;
    loadGenerationRef.current = generation;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setExpanded({});
    setLoadError(null);
    if (!owner || !repo) {
      setChildrenByPath({});
      return () => {
        controller.abort();
      };
    }

    // Root reloads to Loading (null), not Empty ([]). Keeping a prior tree
    // painted during ref hops would flash the wrong revision, so clear —
    // but never seed with [] (that is the "Empty directory" state).
    setChildrenByPath({ '': null });
    void loadDirectory('', generation, controller.signal);

    return () => {
      // Invalidate every in-flight response for this package.
      if (loadGenerationRef.current === generation) {
        loadGenerationRef.current = generation + 1;
      }
      controller.abort();
    };
  }, [loadDirectory, owner, repo]);

  const toggleExpanded = (path: string) => {
    setExpanded((previous) => {
      const next = { ...previous, [path]: !previous[path] };
      return next;
    });
    if (childrenByPath[path] === undefined) {
      const controller = abortControllerRef.current;
      if (controller && !controller.signal.aborted) {
        void loadDirectory(path, loadGenerationRef.current, controller.signal);
      }
    }
  };

  const toggleSelected = (selectionPath: string) => {
    if (conflictSet.has(selectionPath)) return;
    onChange(
      selectedSet.has(selectionPath)
        ? selectedPaths.filter((path) => path !== selectionPath)
        : [...selectedPaths, selectionPath],
    );
  };

  // Select all / clear all — root-level only. A directory selection is
  // already a PREFIX match downstream (isPathExcluded/inventory filtering),
  // so selecting every root-level file + top-level directory prefix covers
  // the entire repository without recursively fetching every subtree.
  const rootItems = childrenByPath[''] ?? [];
  const rootSelectionPaths = rootItems.map((item) =>
    item.type === 'tree' ? directoryKey(item.path) : item.path,
  );
  const canSelectAll = rootSelectionPaths.some(
    (path) => !conflictSet.has(path) && !selectedSet.has(path),
  );
  const handleSelectAll = () => {
    const additions = rootSelectionPaths.filter(
      (path) => !conflictSet.has(path) && !selectedSet.has(path),
    );
    if (additions.length) onChange([...selectedPaths, ...additions]);
  };
  const handleClearAll = () => onChange([]);

  const renderItems = (path: string, depth: number): React.ReactNode => {
    const items = childrenByPath[path];
    if (items === null || items === undefined) {
      return (
        <p
          className="py-1 text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500"
          style={{ paddingLeft: depth * 16 }}
        >
          Loading…
        </p>
      );
    }
    if (items.length === 0) {
      return (
        <p
          className="py-1 text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500"
          style={{ paddingLeft: depth * 16 }}
        >
          Empty directory
        </p>
      );
    }
    return items.map((item) => {
      const isDirectory = item.type === 'tree';
      const selectionPath = isDirectory ? directoryKey(item.path) : item.path;
      const isSelected = selectedSet.has(selectionPath);
      const isConflicting = conflictSet.has(selectionPath);
      const isExpanded = Boolean(expanded[item.path]);
      return (
        <React.Fragment key={item.path}>
          <div
            className="flex items-center gap-1"
            style={{ paddingLeft: depth * 16 }}
          >
            {isDirectory ? (
              <button
                type="button"
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.path}`}
                onClick={() => toggleExpanded(item.path)}
                className="flex h-5 w-5 shrink-0 items-center justify-center text-neutral-400 transition hover:text-emerald-200"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            ) : (
              <span className="h-5 w-5 shrink-0" aria-hidden="true" />
            )}
            <button
              type="button"
              onClick={() => toggleSelected(selectionPath)}
              disabled={disabled || isConflicting}
              title={
                disabled
                  ? 'Configuration locked for this run'
                  : isConflicting
                    ? conflictLabel
                    : undefined
              }
              aria-pressed={isSelected}
              className={`flex min-w-0 flex-1 items-center gap-1.5 border px-1.5 py-0.5 text-left font-mono text-xs transition ${
                isSelected
                  ? 'border-emerald-300/35 bg-emerald-300/10 text-emerald-100'
                  : isConflicting || disabled
                    ? 'cursor-not-allowed border-transparent text-neutral-600 line-through'
                    : 'border-transparent text-neutral-200 hover:border-white/15 hover:bg-white/5'
              }`}
            >
              {isDirectory ? (
                <Folder className="h-3 w-3 shrink-0 text-neutral-500" aria-hidden="true" />
              ) : (
                <FileText className="h-3 w-3 shrink-0 text-neutral-500" aria-hidden="true" />
              )}
              <span className="truncate">
                {baseName(item.path)}
                {isDirectory ? '/' : ''}
              </span>
            </button>
          </div>
          {isDirectory && isExpanded ? renderItems(item.path, depth + 1) : null}
        </React.Fragment>
      );
    });
  };

  return (
    <div aria-label={ariaLabel}>
      {owner && repo ? (
        <div className="mb-1.5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={disabled || !canSelectAll}
            className="border border-white/10 px-1.5 py-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-neutral-300 transition hover:border-emerald-300/35 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled || selectedPaths.length === 0}
            className="border border-white/10 px-1.5 py-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-neutral-300 transition hover:border-rose-300/35 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear all
          </button>
        </div>
      ) : null}
      {selectedPaths.length ? (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {selectedPaths.map((path) => (
            <button
              key={path}
              type="button"
              onClick={() =>
                disabled
                  ? undefined
                  : onChange(selectedPaths.filter((entry) => entry !== path))
              }
              disabled={disabled}
              className="border border-emerald-300/25 bg-emerald-300/10 px-1.5 py-0.5 font-mono text-[0.66rem] text-emerald-100 transition hover:border-emerald-200/45 hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Remove ${path}`}
            >
              {path} ×
            </button>
          ))}
        </div>
      ) : null}
      <div className="max-h-56 overflow-y-auto overscroll-contain border border-white/10 bg-black/30 px-2 py-1.5">
        {!owner || !repo ? (
          <p className="py-1 text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500">
            {emptyLabel}
          </p>
        ) : (
          renderItems('', 0)
        )}
      </div>
      {loadError ? (
        <p className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-amber-200/80">
          {loadError}
        </p>
      ) : null}
    </div>
  );
}
