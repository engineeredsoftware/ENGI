import { createClient } from '@bitcode/supabase/ssr/server';
import {
  formatAgenticExecutionLabel,
  normalizeAgenticExecutionType,
} from '@bitcode/api/src/executions/agentic-execution';
import {
  attachConversationStreamEvent,
  buildConversationPipelineLogEvent,
  buildConversationStreamEvent,
} from '@bitcode/api/src/conversations/stream-events';
import type {
  ConversationStreamEvent,
  ConversationStreamEventKind,
} from '@bitcode/api/src/conversations/stream-events';

import { ENABLE_MOCKS, MOCK_CHAT_STREAM } from '../../../config/featureFlags';
import { buildMockReviewUser, isAuxillariesMockMode } from '../../../lib/mock-review-mode';

type ConversationToken = {
  type?: string;
  value?: string;
  metadata?: Record<string, unknown>;
};

type MockConversationStreamQueueEvent = {
  type: string;
  data: unknown;
  conversationStreamEvent?: ConversationStreamEvent;
};

type MockConversationRow = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  attachment_count: number;
  last_message: string | null;
};

const MOCK_USER = buildMockReviewUser();
const MOCK_CONVERSATIONS: MockConversationRow[] = [
  {
    id: 'conv-bitcode-proof-closure',
    user_id: MOCK_USER.id,
    title: 'Bitcode proof closure plan',
    created_at: '2026-04-16T11:14:00.000Z',
    updated_at: '2026-04-16T12:07:00.000Z',
    message_count: 14,
    attachment_count: 3,
    last_message: 'Bound the remaining V26 proof layers to conversations, runs, asset packs, and settlement evidence.',
  },
  {
    id: 'conv-terminal-convergence',
    user_id: MOCK_USER.id,
    title: 'Terminal convergence',
    created_at: '2026-04-16T10:40:00.000Z',
    updated_at: '2026-04-16T11:42:00.000Z',
    message_count: 9,
    attachment_count: 1,
    last_message: 'Keep fullscreen conversations, activity runs, and write-side reservoirs aligned with the Terminal route.',
  },
  {
    id: 'conv-run-shippable-reuse',
    user_id: MOCK_USER.id,
    title: 'Run and asset-pack inward reuse',
    created_at: '2026-04-16T09:08:00.000Z',
    updated_at: '2026-04-16T10:21:00.000Z',
    message_count: 7,
    attachment_count: 2,
    last_message: 'Preserve Terminal and Exchange reading surfaces while removing peer-product routing and sealing output destinations.',
  },
];

function getMockConversationRows() {
  return [...MOCK_CONVERSATIONS].sort((left, right) => right.updated_at.localeCompare(left.updated_at));
}

export function isConversationMockMode() {
  return isAuxillariesMockMode() || (ENABLE_MOCKS && MOCK_CHAT_STREAM);
}

export function getEmptyConversationPage() {
  return {
    data: [],
    hasMore: false,
    nextCursor: null,
  };
}

export function listMockConversations(options: {
  limit?: number;
  cursor?: string | null;
  search?: string | null;
}) {
  const limit = Math.max(1, Math.min(options.limit ?? 25, 100));
  const search = String(options.search || '').trim().toLowerCase();

  let rows = getMockConversationRows();

  if (search) {
    rows = rows.filter((row) => row.title.toLowerCase().includes(search) || (row.last_message || '').toLowerCase().includes(search));
  }

  if (options.cursor) {
    rows = rows.filter((row) => row.updated_at < options.cursor!);
  }

  const data = rows.slice(0, limit);
  const hasMore = rows.length > limit;
  const nextCursor = hasMore ? data[data.length - 1]?.updated_at ?? null : null;

  return {
    data,
    hasMore,
    nextCursor,
  };
}

export function createMockConversation(title?: string) {
  const timestamp = new Date().toISOString();
  return {
    id: `conv-${Date.now()}`,
    user_id: MOCK_USER.id,
    title: (title || 'New Bitcode Terminal conversation').trim(),
    created_at: timestamp,
    updated_at: timestamp,
    message_count: 0,
    attachment_count: 0,
    last_message: null,
  };
}

export function getMockConversation(conversationId?: string) {
  const row = getMockConversationRows().find((candidate) => candidate.id === conversationId);
  if (!row) {
    return null;
  }

  return {
    ...row,
    messages: [
      {
        id: `msg-${row.id}-user`,
        conversation_id: row.id,
        role: 'user',
        content: `Resume the ${row.title.toLowerCase()} workstream inside the Bitcode Terminal.`,
        created_at: row.created_at,
        message_attachments: [],
      },
      {
        id: `msg-${row.id}-assistant`,
        conversation_id: row.id,
        role: 'assistant',
        content: row.last_message || 'Bitcode mock mode is active for this conversation.',
        created_at: row.updated_at,
        message_attachments: [],
      },
    ],
  };
}

export function branchMockConversation(sourceConversationId: string, title?: string) {
  const source = getMockConversationRows().find((row) => row.id === sourceConversationId);
  return createMockConversation(title || `${source?.title || 'Bitcode conversation'} (branch)`);
}

export async function getConversationRouteUserId() {
  if (isConversationMockMode()) {
    return MOCK_USER.id;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

function buildMockAssistantReply(content: string) {
  const normalized = content.trim();

  if (!normalized) {
    return 'Bitcode mock mode is active. Ask for read measurement, AssetPack execution, source attachment, or settlement-bound output to inspect the fullscreen conversation flow.';
  }

  return `Bitcode mock mode received "${normalized}". The conversation surface is now mounted inside the Bitcode Terminal and can bind source attachments, asset packs, output destinations, and settlement-bound proofs as V26 converges.`;
}

function deriveConversationTitle(content: string) {
  const normalized = content.trim();
  if (!normalized) {
    return 'New Bitcode Terminal conversation';
  }
  return normalized.length <= 72 ? normalized : `${normalized.slice(0, 69)}...`;
}

function normalizeConversationExecutionType(token?: ConversationToken) {
  const normalized = String(token?.type || '').trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized === 'asset_pack') {
    return 'agentic-execution:asset-pack';
  }

  if (normalized === 'read_measurement') {
    return 'agentic-execution:read-measurement';
  }

  return normalizeAgenticExecutionType(normalized);
}

function buildPipelineEvents(tokens: ConversationToken[]) {
  const pipelineToken = tokens.find((token) => Boolean(normalizeConversationExecutionType(token)));

  if (!pipelineToken) {
    return null;
  }

  const runId = `run-${Date.now()}`;
  const pipelineType = normalizeConversationExecutionType(pipelineToken)!;
  const executionLabel = formatAgenticExecutionLabel(pipelineType);

  return {
    runId,
    pipelineType,
    events: [
      {
        type: 'pipeline_triggered',
        data: { runId, pipelineType },
      },
      {
        type: 'pipeline_event',
        data: {
          runId,
          event: {
            type: 'phase',
            phase: 'mock_execution',
            title: 'Mock Bitcode agentic execution',
            summary: `Prepared ${executionLabel} evidence under the current Bitcode Terminal.`,
          },
        },
      },
      {
        type: 'pipeline_complete',
        data: {
          runId,
          success: true,
          summary: `Mock ${executionLabel} completed for the current Bitcode Terminal review.`,
        },
      },
    ],
  };
}

export function createMockConversationStreamResponse(input: {
  content?: string;
  tokens?: ConversationToken[];
  conversationId?: string;
}) {
  const encoder = new TextEncoder();
  const envelope = buildMockConversationStreamEnvelope(input);

  let closed = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let index = 0;

      const pushNext = () => {
        if (closed) {
          return;
        }

        if (index >= envelope.queue.length) {
          closed = true;
          controller.close();
          return;
        }

        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(envelope.queue[index])}\n\n`));
        } catch {
          closed = true;
          return;
        }

        index += 1;
        timeoutId = setTimeout(pushNext, index <= (envelope.pipeline?.events.length || 0) ? 70 : 45);
      };

      pushNext();
    },
    cancel() {
      // Browser-driven tests and route changes can close the stream before the
      // delayed mock queue is exhausted. Treat that as normal SSE lifecycle.
      closed = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

export function buildMockConversationStreamEnvelope(input: {
  content?: string;
  tokens?: ConversationToken[];
  conversationId?: string;
}) {
  const content = String(input.content || '');
  const tokens = Array.isArray(input.tokens) ? input.tokens : [];
  const assistantReply = buildMockAssistantReply(content);
  const messageId = `msg-${Date.now()}`;
  const conversationId = String(input.conversationId || createMockConversation(deriveConversationTitle(content)).id);
  const pipeline = buildPipelineEvents(tokens);
  const tokenChunks = assistantReply.match(/.{1,28}/g) || [assistantReply];
  let sequence = 0;
  const streamEvent = (eventKind: ConversationStreamEventKind, legacySseType: string, collapsedStatus: string, metadata: Record<string, unknown> = {}, runId?: string | null) =>
    buildConversationStreamEvent({
      eventKind,
      legacySseType,
      collapsedStatus,
      metadata,
      runId: runId || pipeline?.runId || null,
      conversationId,
      sequence: ++sequence,
    });
  const pipelineEvents: MockConversationStreamQueueEvent[] = pipeline?.events.flatMap<MockConversationStreamQueueEvent>((event) => {
    if (event.type === 'pipeline_triggered') {
      const triggerEvent = streamEvent('tool_call', 'pipeline_triggered', 'Mock execution admitted for conversation stream', {
        pipelineType: pipeline.pipelineType,
      }, pipeline.runId);
      const retrievalEvent = streamEvent('retrieval_summary', 'pipeline_event', 'Mock conversation context summarized', {
        tokenCount: tokens.length,
      }, pipeline.runId);
      const proofEvent = streamEvent('proof_root', 'pipeline_event', 'Mock stream proof roots anchored', {
        promptDisclosurePosture: 'prompt_template_id_only',
        resultDisclosurePosture: 'parsed_result_shape_only',
      }, pipeline.runId);
      return [
        attachConversationStreamEvent(event, triggerEvent),
        {
          type: 'pipeline_event',
          data: {
            runId: pipeline.runId,
            event: buildConversationPipelineLogEvent(retrievalEvent),
          },
          conversationStreamEvent: retrievalEvent,
        },
        {
          type: 'pipeline_event',
          data: {
            runId: pipeline.runId,
            event: buildConversationPipelineLogEvent(proofEvent),
          },
          conversationStreamEvent: proofEvent,
        },
      ];
    }

    if (event.type === 'pipeline_event') {
      const retryEvent = streamEvent('retry_state', 'pipeline_event', 'Mock retry posture available for route-local history', {
        routeLocalHistory: true,
        retryAllowed: true,
      }, pipeline.runId);
      return [{
        type: 'pipeline_event',
        data: {
          runId: pipeline.runId,
          event: buildConversationPipelineLogEvent(retryEvent),
        },
        conversationStreamEvent: retryEvent,
      }];
    }

    if (event.type === 'pipeline_complete') {
      return [attachConversationStreamEvent(event, streamEvent('completion_decision', 'pipeline_complete', 'Mock execution completed', {
        success: true,
      }, pipeline.runId))];
    }

    return [event];
  }) || [];
  const queue = [
    ...pipelineEvents,
    ...tokenChunks.map((chunk) => attachConversationStreamEvent({
      type: 'token',
      data: chunk,
    }, streamEvent('model_delta', 'token', 'Mock assistant model delta streamed', {
      chunkLength: chunk.length,
      hasExecution: Boolean(pipeline),
    }))),
    attachConversationStreamEvent({
      type: 'message_complete',
      data: {
        messageId,
        content: assistantReply,
        conversationId,
      },
    }, streamEvent('completion_decision', 'message_complete', 'Mock assistant message persisted', {
      messageId,
      persisted: true,
    })),
  ];

  return {
    assistantReply,
    messageId,
    conversationId,
    pipeline,
    queue,
  };
}
