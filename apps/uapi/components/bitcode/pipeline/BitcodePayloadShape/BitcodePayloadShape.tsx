'use client';

import React from 'react';

import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer';
import BitcodeDetailCollection from '@/components/bitcode/pipeline/BitcodeDetailCollection/BitcodeDetailCollection';
import BitcodeMetricGrid, { type BitcodeMetric } from '@/components/bitcode/pipeline/BitcodeMetricGrid/BitcodeMetricGrid';
import { BITCODE_PAYLOAD_INSPECTOR_EXPLAINERS } from '@/components/bitcode/pipeline/BitcodeTransactionExplainers/bitcode-transaction-explainers';

type BitcodePayloadShapeItem = {
  id: string;
  title: string;
  summary: string;
  supportingText?: string;
};

interface BitcodePayloadShapeProps {
  payload: unknown;
  className?: string;
  maxItems?: number;
}

function getValueKind(value: unknown) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value === 'object' ? 'object' : typeof value;
}

function summarizeValue(value: unknown) {
  const kind = getValueKind(value);

  if (kind === 'null') return 'null';
  if (kind === 'string') {
    const text = String(value);
    return text.length > 64 ? `${text.slice(0, 61)}...` : text;
  }
  if (kind === 'number' || kind === 'boolean' || kind === 'bigint') {
    return String(value);
  }
  if (kind === 'undefined') return 'undefined';
  if (kind === 'function') return 'function';
  if (kind === 'symbol') return 'symbol';
  if (kind === 'array') {
    return `${(value as unknown[]).length} item${(value as unknown[]).length === 1 ? '' : 's'}`;
  }
  if (kind === 'object') {
    return `${Object.keys(value as Record<string, unknown>).length} field${
      Object.keys(value as Record<string, unknown>).length === 1 ? '' : 's'
    }`;
  }

  return kind;
}

function buildPayloadShape(
  payload: unknown,
  maxItems: number,
): {
  metrics: BitcodeMetric[];
  items: BitcodePayloadShapeItem[];
} {
  const rootKind = getValueKind(payload);

  if (rootKind === 'array') {
    const arrayPayload = payload as unknown[];
    const previewItems = arrayPayload.slice(0, maxItems).map((value, index) => ({
      id: `index-${index}`,
      title: `[${index}]`,
      summary: summarizeValue(value),
      supportingText: `type: ${getValueKind(value)}`,
    }));

    if (arrayPayload.length > maxItems) {
      previewItems.push({
        id: 'remaining-array-items',
        title: `+${arrayPayload.length - maxItems} more items`,
        summary: 'Additional array items are present in the payload.',
        supportingText: 'type: summary',
      });
    }

    return {
      metrics: [
        { label: 'Root kind', value: 'array' },
        { label: 'Top-level items', value: String(arrayPayload.length) },
        {
          label: 'Composite items',
          value: String(arrayPayload.filter((value) => {
            const kind = getValueKind(value);
            return kind === 'array' || kind === 'object';
          }).length),
        },
      ],
      items: previewItems,
    };
  }

  if (rootKind === 'object') {
    const objectPayload = payload as Record<string, unknown>;
    const entries = Object.entries(objectPayload);
    const previewItems = entries.slice(0, maxItems).map(([key, value]) => ({
      id: key,
      title: key,
      summary: summarizeValue(value),
      supportingText: `type: ${getValueKind(value)}`,
    }));

    if (entries.length > maxItems) {
      previewItems.push({
        id: 'remaining-object-fields',
        title: `+${entries.length - maxItems} more fields`,
        summary: 'Additional fields are present in the payload.',
        supportingText: 'type: summary',
      });
    }

    return {
      metrics: [
        { label: 'Root kind', value: 'object' },
        { label: 'Top-level fields', value: String(entries.length) },
        {
          label: 'Composite fields',
          value: String(
            entries.filter(([, value]) => {
              const kind = getValueKind(value);
              return kind === 'array' || kind === 'object';
            }).length,
          ),
        },
      ],
      items: previewItems,
    };
  }

  return {
    metrics: [
      { label: 'Root kind', value: rootKind },
      { label: 'Value preview', value: summarizeValue(payload) },
    ],
    items: [
      {
        id: 'root-value',
        title: 'value',
        summary: summarizeValue(payload),
        supportingText: `type: ${rootKind}`,
      },
    ],
  };
}

export default function BitcodePayloadShape({
  payload,
  className,
  maxItems = 8,
}: BitcodePayloadShapeProps) {
  if (payload === undefined) return null;

  const { metrics, items } = buildPayloadShape(payload, maxItems);

  return (
    <div className={` border border-white/8 bg-white/5 px-3 py-3 ${className || ''}`.trim()}>
      <div className="flex items-center gap-2">
        <p className="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-500">Structured payload shape</p>
        <BitcodeInlineExplainer
          explainer={BITCODE_PAYLOAD_INSPECTOR_EXPLAINERS.structuredPayload}
          side="top"
        />
      </div>

      <BitcodeMetricGrid
        metrics={metrics}
        className="mt-3"
        columnsClassName="sm:grid-cols-3"
        itemClassName=" border border-white/8 bg-[rgba(4,8,18,0.68)] px-3 py-2.5"
        labelClassName="text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500"
        valueClassName="mt-2 text-sm font-semibold text-white"
      />

      <BitcodeDetailCollection
        items={items}
        className="mt-3"
        itemClassName=" border border-white/8 bg-[rgba(4,8,18,0.68)] px-3 py-2.5"
        titleClassName="font-medium text-white"
        summaryClassName="mt-1 text-neutral-200"
        supportingTextClassName="mt-1 text-neutral-500"
      />
    </div>
  );
}
