'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ExecutionContextPillRow } from '@/components/bitcode/pipeline/ExecutionContextPillRow/ExecutionContextPillRow';
import {
  buildTerminalFailurePreviewFromEvents,
  isTerminalFailureStatus,
  type TerminalFailurePreview,
} from '@/components/bitcode/pipeline/TerminalFailurePreview/terminal-failure-preview';

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'completed') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  }
  if (normalized === 'error' || normalized === 'failed' || normalized === 'interrupted') {
    return 'border-red-500/30 bg-red-500/10 text-red-200';
  }
  if (normalized === 'cancelled') {
    return 'border-amber-500/40 bg-amber-500/10 text-amber-100';
  }
  return 'border-amber-500/30 bg-amber-500/10 text-amber-100';
}

interface TransactionStatusHoverBadgeProps {
  runId: string;
  status: string;
  /** Immediate error text from the executions row (no fetch needed). */
  errorMessage?: string | null;
  summary?: string | null;
}

/**
 * Status pill for pipeline table rows. On failed/cancelled/interrupted,
 * hover loads the last handful of call-chain events (`?tail=24`) and shows
 * error + phase→agent→step→failsafe→generation lines.
 */
export function TransactionStatusHoverBadge({
  runId,
  status,
  errorMessage,
  summary,
}: TransactionStatusHoverBadgeProps) {
  const showPreview = isTerminalFailureStatus(status);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<TerminalFailurePreview | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const cacheRef = useRef<TerminalFailurePreview | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const loadPreview = useCallback(async () => {
    if (cacheRef.current) {
      setPreview(cacheRef.current);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(
        `/api/executions/history/${encodeURIComponent(runId)}?tail=24`,
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`,
        );
      }
      const runError =
        (data?.run?.error &&
          typeof data.run.error === 'object' &&
          typeof data.run.error.message === 'string' &&
          data.run.error.message) ||
        (typeof data?.run?.summary === 'string' && data.run.summary) ||
        errorMessage ||
        summary ||
        null;
      const next = buildTerminalFailurePreviewFromEvents(data?.events || [], {
        errorMessage: runError,
        limit: 5,
      });
      cacheRef.current = next;
      setPreview(next);
    } catch (error) {
      setFetchError(
        error instanceof Error ? error.message : 'Unable to load run tail.',
      );
      setPreview({
        errorMessage: errorMessage || summary || null,
        lines: [],
      });
    } finally {
      setLoading(false);
    }
  }, [errorMessage, runId, summary]);

  useEffect(() => {
    if (!open || !showPreview) return;
    void loadPreview();
  }, [loadPreview, open, showPreview]);

  useEffect(
    () => () => {
      clearCloseTimer();
    },
    [],
  );

  const badge = (
    <span
      className={`border px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.18em] ${statusTone(status)}`}
      data-testid="transaction-status-badge"
      data-status={status}
    >
      {status}
    </span>
  );

  if (!showPreview) return badge;

  return (
    <span
      className="relative inline-flex"
      data-testid="transaction-status-hover"
      onMouseEnter={() => {
        clearCloseTimer();
        setOpen(true);
      }}
      onMouseLeave={() => {
        clearCloseTimer();
        closeTimerRef.current = setTimeout(() => setOpen(false), 120);
      }}
      onFocus={() => {
        clearCloseTimer();
        setOpen(true);
      }}
      onBlur={() => {
        clearCloseTimer();
        closeTimerRef.current = setTimeout(() => setOpen(false), 120);
      }}
    >
      <button
        type="button"
        className="cursor-help border-0 bg-transparent p-0"
        aria-label={`${status} status — show last log lines and error`}
        aria-expanded={open}
        onClick={(event) => {
          // Keep row selection; only toggle the preview.
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        {badge}
      </button>
      {open ? (
        <div
          role="tooltip"
          data-testid="transaction-status-failure-preview"
          className="absolute left-0 top-[calc(100%+0.4rem)] z-40 w-[min(28rem,calc(100vw-2rem))] border border-white/12 bg-[rgba(4,8,18,0.98)] px-3 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.55)]"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            Last call chain
          </p>
          {loading && !preview ? (
            <p className="mt-2 text-xs text-neutral-400">Loading tail…</p>
          ) : null}
          {fetchError ? (
            <p className="mt-2 text-xs text-amber-200/90">{fetchError}</p>
          ) : null}
          {preview?.errorMessage ? (
            <p
              className="mt-2 border border-rose-400/25 bg-rose-400/10 px-2 py-2 text-xs leading-5 text-rose-100"
              data-testid="transaction-status-failure-error"
            >
              {preview.errorMessage}
            </p>
          ) : !loading ? (
            <p className="mt-2 text-xs text-neutral-500">No error message stored.</p>
          ) : null}
          {preview && preview.lines.length > 0 ? (
            <ul className="mt-3 space-y-2" data-testid="transaction-status-failure-lines">
              {preview.lines.map((line, index) => (
                <li
                  key={`${line.phase}-${line.agent}-${line.generation}-${index}`}
                  className="border border-white/8 bg-black/30 px-2 py-1.5"
                >
                  <ExecutionContextPillRow
                    phase={line.phase}
                    agent={line.agent}
                    step={line.step}
                    failsafe={line.failsafe}
                    generation={line.generation}
                    className="flex flex-wrap gap-1"
                  />
                </li>
              ))}
            </ul>
          ) : !loading ? (
            <p className="mt-2 text-xs text-neutral-500">
              No phase/agent/step/failsafe/generation rows in the event tail.
            </p>
          ) : null}
        </div>
      ) : null}
    </span>
  );
}

export default TransactionStatusHoverBadge;
