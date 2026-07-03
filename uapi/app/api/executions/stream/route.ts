import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';

export const runtime = 'nodejs';
export const maxDuration = 300;

const POLL_INTERVAL_MS = 1000;
const MAX_TAIL_MS = 5 * 60 * 1000;
const TERMINAL_EVENT_TYPES = new Set(['completion', 'error']);
const TERMINAL_EXECUTION_STATUSES = new Set(['completed', 'failed', 'cancelled']);

/**
 * Row-backed frames carry the execution_events row's insert-time `created_at`
 * as the standard SSE `id:` line. The tail filters rows with
 * `created_at > cursor`, so the RECONNECT cursor must be that same insert
 * timestamp — the payload's own emit-time `timestamp` (stamped by the producer
 * before the row was inserted) drifts from it and causes duplicated or skipped
 * rows across reconnects.
 */
function encodeSse(payload: Record<string, unknown>, id?: string) {
  const idLine = id ? `id: ${id}\n` : '';
  return `${idLine}data: ${JSON.stringify(payload)}\n\n`;
}

/**
 * Live SSE tail over execution_events for a run the caller owns (V48 Gate 2,
 * QA ledger: pipeline-execution actualities). Previously this route returned
 * a single static "no live stream" message, so nothing in the product ever
 * actually streamed. It now polls execution_events past the caller's lastTs
 * cursor and ends on a terminal event, a terminal executions.status, client
 * abort, or the tail budget.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId')?.trim() || null;
  const lastTs = searchParams.get('lastTs')?.trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!runId || !user) {
    return new Response(
      encodeSse({
        type: 'status',
        runId,
        message: !user
          ? 'A Bitcode session is required to tail execution streams.'
          : 'A runId is required to tail an execution stream.',
      }),
      {
        headers: {
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'Content-Type': 'text/event-stream; charset=utf-8',
        },
      },
    );
  }

  const encoder = new TextEncoder();
  const startedAt = Date.now();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let cursor = lastTs && !Number.isNaN(Date.parse(lastTs)) ? lastTs : null;
      let closed = false;
      const send = (payload: Record<string, unknown>, id?: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(encodeSse(payload, id)));
        } catch {
          closed = true;
        }
      };
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {}
      };
      request.signal?.addEventListener?.('abort', close);

      // Ownership boundary: only the run owner may tail it. The run row may
      // lag the first events by a beat, so an absent row keeps tailing until
      // it appears; a row owned by someone else ends the stream.
      let ownershipVerified = false;
      let sawTerminalEvent = false;

      while (!closed && Date.now() - startedAt < MAX_TAIL_MS) {
        try {
          if (!ownershipVerified) {
            const { data: run } = await supabaseAdmin
              .from('executions')
              .select('id, user_id, status')
              .eq('id', runId)
              .maybeSingle();
            if (run) {
              if (run.user_id !== user.id) {
                send({ type: 'status', runId, message: 'Execution stream is not available for this account.' });
                break;
              }
              ownershipVerified = true;
            }
          }

          if (ownershipVerified) {
            let query = supabaseAdmin
              .from('execution_events')
              .select('id, event_type, event_data, created_at')
              .eq('run_id', runId)
              .order('created_at', { ascending: true })
              .limit(200);
            if (cursor) query = query.gt('created_at', cursor);
            const { data: events } = await query;

            for (const event of events || []) {
              cursor = event.created_at;
              send((event.event_data as Record<string, unknown>) || { type: event.event_type }, event.created_at);
              if (TERMINAL_EVENT_TYPES.has(String(event.event_type))) {
                sawTerminalEvent = true;
              }
            }

            if (sawTerminalEvent) break;

            const { data: run } = await supabaseAdmin
              .from('executions')
              .select('status')
              .eq('id', runId)
              .maybeSingle();
            if (run && TERMINAL_EXECUTION_STATUSES.has(String(run.status))) {
              // One more poll loop drains any final events, then ends.
              sawTerminalEvent = true;
              continue;
            }
          }
        } catch {
          // Transient read failures never kill the tail.
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      close();
    },
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-Accel-Buffering': 'no',
    },
  });
}
