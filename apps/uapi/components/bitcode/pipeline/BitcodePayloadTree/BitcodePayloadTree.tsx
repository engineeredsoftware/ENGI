'use client';

import React from 'react';

import { cn } from '@bitcode/styling';

import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer';
import { BITCODE_PAYLOAD_INSPECTOR_EXPLAINERS } from '@/components/bitcode/pipeline/BitcodeTransactionExplainers/bitcode-transaction-explainers';

interface BitcodePayloadTreeProps {
  payload: unknown;
  className?: string;
  maxDepth?: number;
  maxChildrenPerLevel?: number;
}

interface RenderPayloadTreeNodeProps {
  label: string;
  value: unknown;
  depth: number;
  maxDepth: number;
  maxChildrenPerLevel: number;
  defaultOpen?: boolean;
}

function getValueKind(value: unknown) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value === 'object' ? 'object' : typeof value;
}

function summarizePrimitive(value: unknown) {
  const kind = getValueKind(value);

  if (kind === 'string') {
    const text = String(value);
    return text.length > 64 ? `${text.slice(0, 61)}...` : text;
  }

  if (kind === 'number' || kind === 'boolean' || kind === 'bigint') {
    return String(value);
  }

  if (kind === 'undefined') return 'undefined';
  if (kind === 'null') return 'null';
  if (kind === 'symbol') return 'symbol';
  if (kind === 'function') return 'function';

  return kind;
}

function summarizeComposite(value: unknown) {
  if (Array.isArray(value)) {
    return `${value.length} item${value.length === 1 ? '' : 's'}`;
  }

  if (value && typeof value === 'object') {
    const fieldCount = Object.keys(value as Record<string, unknown>).length;
    return `${fieldCount} field${fieldCount === 1 ? '' : 's'}`;
  }

  return summarizePrimitive(value);
}

function buildChildren(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry, index) => ({
      key: `[${index}]`,
      value: entry,
    }));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).map(([key, entry]) => ({
      key,
      value: entry,
    }));
  }

  return [];
}

function renderTypeBadge(kind: string) {
  return (
    <span className=" border border-white/10 bg-white/5 px-2 py-1 text-[0.58rem] uppercase tracking-[0.16em] text-neutral-400">
      {kind}
    </span>
  );
}

function renderPayloadTreeNode({
  label,
  value,
  depth,
  maxDepth,
  maxChildrenPerLevel,
  defaultOpen = false,
}: RenderPayloadTreeNodeProps) {
  const kind = getValueKind(value);
  const isComposite = kind === 'array' || kind === 'object';

  if (!isComposite) {
    return (
      <div className=" border border-white/8 bg-[rgba(4,8,18,0.66)] px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-white">{label}</span>
          {renderTypeBadge(kind)}
        </div>
        <p className="mt-2 break-words font-mono text-xs leading-6 text-emerald-100">{summarizePrimitive(value)}</p>
      </div>
    );
  }

  const children = buildChildren(value);
  const visibleChildren = children.slice(0, maxChildrenPerLevel);
  const remainingChildCount = Math.max(children.length - visibleChildren.length, 0);
  const depthLimited = depth >= maxDepth;

  return (
    <details
      className=" border border-white/8 bg-[rgba(4,8,18,0.66)]"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-white">{label}</span>
          {renderTypeBadge(kind)}
          <span className="text-[0.68rem] uppercase tracking-[0.16em] text-neutral-500">{summarizeComposite(value)}</span>
        </div>
      </summary>

      <div className="space-y-3 border-t border-white/8 px-3 py-3">
        {depthLimited ? (
          <div className=" border border-dashed border-white/10 bg-black/20 px-3 py-3 text-xs leading-6 text-neutral-400">
            Maximum visual depth reached. Use raw JSON for the remaining nested payload.
          </div>
        ) : (
          visibleChildren.map((child) => (
            <React.Fragment key={`${label}-${child.key}`}>
              {renderPayloadTreeNode({
                label: child.key,
                value: child.value,
                depth: depth + 1,
                maxDepth,
                maxChildrenPerLevel,
              })}
            </React.Fragment>
          ))
        )}

        {remainingChildCount ? (
          <div className=" border border-dashed border-white/10 bg-black/20 px-3 py-3 text-xs leading-6 text-neutral-400">
            +{remainingChildCount} more {kind === 'array' ? 'items' : 'fields'} remain in this payload branch.
          </div>
        ) : null}
      </div>
    </details>
  );
}

export default function BitcodePayloadTree({
  payload,
  className,
  maxDepth = 3,
  maxChildrenPerLevel = 6,
}: BitcodePayloadTreeProps) {
  if (payload === undefined) return null;

  return (
    <div className={cn(' border border-white/8 bg-white/5 px-3 py-3', className)}>
      <div className="flex items-center gap-2">
        <p className="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-500">Payload field tree</p>
        <BitcodeInlineExplainer
          explainer={BITCODE_PAYLOAD_INSPECTOR_EXPLAINERS.payloadTree}
          side="top"
        />
      </div>

      <div className="mt-3">
        {renderPayloadTreeNode({
          label: 'root',
          value: payload,
          depth: 0,
          maxDepth,
          maxChildrenPerLevel,
          defaultOpen: true,
        })}
      </div>
    </div>
  );
}
