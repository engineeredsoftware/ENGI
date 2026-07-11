"use client";

import React, { useEffect, useState } from 'react';
import { MixerHorizontalIcon } from "@radix-ui/react-icons";

interface ConversationsItem {
  id: string;
  title: string;
  updated_at: string;
}

async function searchConversations(q: string, limit = 20): Promise<ConversationsItem[]> {
  const url = `/api/conversations?limit=${limit}&search=${encodeURIComponent(q || '')}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load conversations');
  const data = await res.json();
  return data.data as ConversationsItem[];
}

async function branchConversationApi(sourceConversationId: string, title?: string) {
  const res = await fetch('/api/conversations/branch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceConversationId, title })
  });
  if (!res.ok) throw new Error('Branch failed');
  return res.json();
}

export function BranchMenuButton({
  onBranched,
  className
}: {
  onBranched?: (newConversation: ConversationsItem) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ConversationsItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    searchConversations(search).then(
      (rows) => { if (active) setItems(rows); },
      (e) => { if (active) setError(String(e?.message || e)); }
    ).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search]);

  return (
    <div className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="fullscreen-button inline-flex items-center gap-1 px-2 py-1 rounded text-sm hover:bg-emerald-500/10"
        title="Split / Branch from conversation"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        <MixerHorizontalIcon />
        <span className="button-text">Split</span>
      </button>
      {open && (
        <div className="z-50 absolute right-0 mt-2 w-96 rounded border border-emerald-600/30 bg-black/80 backdrop-blur p-2 shadow-xl">
          <div className="mb-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full px-2 py-1 rounded bg-black/40 border border-emerald-600/30 focus:outline-none"
            />
          </div>
          <div className="max-h-80 overflow-auto custom-scrollbar">
            {loading && <div className="p-2 text-sm opacity-70">Loading…</div>}
            {error && <div className="p-2 text-sm text-red-400">{error}</div>}
            {!loading && !error && items.length === 0 && (
              <div className="p-2 text-sm opacity-70">No conversations</div>
            )}
            {items.map((c) => (
              <button
                key={c.id}
                className="w-full text-left px-2 py-1 rounded hover:bg-emerald-500/10"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const created = await branchConversationApi(c.id);
                    onBranched?.(created);
                    setOpen(false);
                  } catch (e: any) {
                    setError(String(e?.message || e));
                  }
                }}
                title={new Date(c.updated_at).toLocaleString()}
              >
                <div className="truncate">{c.title}</div>
                <div className="text-xs opacity-60">Updated {new Date(c.updated_at).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BranchMenuButton;

