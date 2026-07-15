'use client';

import React from 'react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer';
import BitcodePayloadShape from '@/components/bitcode/pipeline/BitcodePayloadShape/BitcodePayloadShape';
import BitcodePayloadTree from '@/components/bitcode/pipeline/BitcodePayloadTree/BitcodePayloadTree';
import { BITCODE_PAYLOAD_INSPECTOR_EXPLAINERS } from '@/components/bitcode/pipeline/BitcodeTransactionExplainers/bitcode-transaction-explainers';

type BitcodePayloadInspectorMode = 'visual' | 'raw';

interface BitcodePayloadInspectorProps {
  kicker: string;
  title: string;
  summary: string;
  payload: unknown;
  children: ReactNode;
  className?: string;
  rawLabel?: string;
  emptyRawMessage?: string;
}

function stringifyPayload(payload: unknown) {
  if (payload === undefined) return null;

  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return null;
  }
}

function buildPayloadMeta(rawPayload: string | null) {
  if (!rawPayload) {
    return {
      characterCount: 0,
      lineCount: 0,
    };
  }

  return {
    characterCount: rawPayload.length,
    lineCount: rawPayload.split('\n').length,
  };
}

export default function BitcodePayloadInspector({
  kicker,
  title,
  summary,
  payload,
  children,
  className,
  rawLabel = 'Raw JSON payload',
  emptyRawMessage = 'No raw payload is surfaced for this Bitcode detail yet.',
}: BitcodePayloadInspectorProps) {
  const [mode, setMode] = useState<BitcodePayloadInspectorMode>('visual');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'unavailable'>('idle');
  const rawPayload = useMemo(() => stringifyPayload(payload), [payload]);
  const payloadMeta = useMemo(() => buildPayloadMeta(rawPayload), [rawPayload]);

  useEffect(() => {
    if (copyState === 'idle') return undefined;
    const timeout = globalThis.setTimeout(() => setCopyState('idle'), 1600);
    return () => globalThis.clearTimeout(timeout);
  }, [copyState]);

  const handleCopyRawPayload = async () => {
    if (!rawPayload) return;

    if (!globalThis.navigator?.clipboard?.writeText) {
      setCopyState('unavailable');
      return;
    }

    try {
      await globalThis.navigator.clipboard.writeText(rawPayload);
      setCopyState('copied');
    } catch {
      setCopyState('unavailable');
    }
  };

  const copyLabel =
    copyState === 'copied'
      ? 'Copied'
      : copyState === 'unavailable'
        ? 'Copy unavailable'
        : 'Copy JSON';

  return (
    <div className={` border border-white/8 bg-black/20 p-4 ${className || ''}`.trim()}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">{kicker}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <BitcodeInlineExplainer explainer={BITCODE_PAYLOAD_INSPECTOR_EXPLAINERS.modes} />
          </div>
          <p className="mt-2 text-sm leading-6 text-neutral-300">{summary}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex border border-white/10 bg-white/5 p-1 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-300">
            <button
              type="button"
              onClick={() => setMode('visual')}
              aria-pressed={mode === 'visual'}
              className={` px-3 py-1.5 transition ${
                mode === 'visual' ? 'bg-emerald-400/15 text-emerald-100' : 'hover:bg-white/10'
              }`}
            >
              Visual
            </button>
            <button
              type="button"
              onClick={() => setMode('raw')}
              aria-pressed={mode === 'raw'}
              className={` px-3 py-1.5 transition ${
                mode === 'raw' ? 'bg-emerald-400/15 text-emerald-100' : 'hover:bg-white/10'
              }`}
            >
              Raw JSON
            </button>
          </div>

          <BitcodeInlineExplainer explainer={BITCODE_PAYLOAD_INSPECTOR_EXPLAINERS.rawPayload} />
        </div>
      </div>

      <div className="mt-4">
        {mode === 'visual' ? (
          <div className="grid gap-3 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-3">
              {children}
              {payload !== undefined ? <BitcodePayloadShape payload={payload} /> : null}
            </div>
            {payload !== undefined ? <BitcodePayloadTree payload={payload} /> : null}
          </div>
        ) : rawPayload ? (
          <div className=" border border-white/8 bg-[rgba(2,6,16,0.92)] px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-500">{rawLabel}</p>
                  <BitcodeInlineExplainer explainer={BITCODE_PAYLOAD_INSPECTOR_EXPLAINERS.rawPayload} side="top" />
                </div>
                <p className="mt-2 text-[0.68rem] uppercase tracking-[0.16em] text-neutral-500">
                  {payloadMeta.lineCount} lines · {payloadMeta.characterCount.toLocaleString('en-US')} chars
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleCopyRawPayload()}
                title="Copy the raw JSON payload"
                className=" border border-white/10 bg-white/5 px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-200 transition hover:border-emerald-300/35 hover:bg-emerald-400/10"
              >
                {copyLabel}
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-emerald-100">
              {rawPayload}
            </pre>
          </div>
        ) : (
          <div className=" border border-white/8 bg-white/5 px-4 py-4 text-sm leading-6 text-neutral-300">
            {emptyRawMessage}
          </div>
        )}
      </div>
    </div>
  );
}
