"use client";

import useSWRInfinite from 'swr/infinite';
import { useMemo } from 'react';

export interface ConversationRow {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  // Enhanced fields from conversation_details view
  message_count: number;
  last_message: string | null;
  attachment_count: number;
}

interface ConversationPage {
  data: ConversationRow[];
  nextCursor: string | null;
  hasMore: boolean;
}

const PAGE_SIZE = 25;

function fetcher(url: string) {
  return fetch(url, { credentials: 'include' }).then(res => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  });
}

/** 
 * React hook that wraps the new /api/conversations endpoint with infinite
 * loading and optional search. 
 * 
 * Updated to use the new first-class conversations API.
 */
export function useConversationPages(searchQuery: string) {
  const getKey = (pageIndex: number, previousPageData: ConversationPage | null) => {
    if (previousPageData && !previousPageData.hasMore) return null; // reached end
    const cursorParam = pageIndex === 0 ? '' : `&cursor=${encodeURIComponent(previousPageData!.nextCursor!)}`;
    const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
    return `/api/conversations?limit=${PAGE_SIZE}${cursorParam}${searchParam}`;
  };

  const swr = useSWRInfinite<ConversationPage>(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  const conversations = useMemo(
    () => (swr.data ? swr.data.flatMap((p: ConversationPage) => p.data) : []),
    [swr.data]
  );

  return { ...swr, conversations };
}
