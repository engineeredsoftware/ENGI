// Relative import — never `@bitcode/supabase` from inside this package.
// Sandbox tsx loads file:// package entrypoints; pnpm does not self-link
// packages/supabase, so the package name fails to resolve mid-load.
import { supabaseAdmin } from './clients';

export interface DataStreamLike {
  writeData(chunk: unknown): Promise<void>;
}

/**
 * SupabaseStream is a thin adapter that fulfils the `DataStream` interface
 * expected by Bitcode's streaming helpers (`writeStreamMessage`, `writeData`, …)
 * and persists every chunk as execution-event evidence so existing SSE
 * consumers continue to work unchanged.  All writes are
 * best-effort – a failed insert will throw to the caller so pipeline logic
 * can surface the failure to the user.
 *
 * To avoid the overhead of a network round-trip for each chunk the
 * implementation buffers events for a short window (default 100 ms or a
 * max batch size) and then performs a single `insert([...])` statement.
 */

export interface SupabaseStreamOptions {
  /**
   * Number of events after which the buffer is flushed immediately.
   * Default: 50.
   */
  flushBatchSize?: number;

  /**
   * Maximum time (ms) events may stay in the buffer before being flushed.
   * Default: 100 ms.
   */
  flushIntervalMs?: number;
}

export class SupabaseStream implements DataStreamLike {
  private buffer: any[] = [];
  private timer?: NodeJS.Timeout;
  private readonly flushBatchSize: number;
  private readonly flushIntervalMs: number;

  constructor(
    private readonly runId: string,
    private readonly supabase = supabaseAdmin,
    opts: SupabaseStreamOptions = {}
  ) {
    this.flushBatchSize = opts.flushBatchSize ?? 50;
    this.flushIntervalMs = opts.flushIntervalMs ?? 100;
  }

  /**
   * writeData conforms to the `DataStream` contract used across the code-base.
   * It accepts either a raw string (newline-delimited JSON) or an object.
   */
  async writeData(chunk: unknown): Promise<void> {
    // Normalise to object so we can safely attach the runId server-side.
    let payload: any;
    if (typeof chunk === 'string') {
      try {
        payload = JSON.parse(chunk);
      } catch {
        // If the chunk is not valid JSON we still store it in the DB so that
        // clients receive the raw text.
        payload = { raw: chunk };
      }
    } else {
      payload = chunk;
    }

    payload.runId = this.runId;

    this.buffer.push(payload);

    if (this.buffer.length >= this.flushBatchSize) {
      await this.flush();
      return;
    }

    // (Re)start debounce timer
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.flush().catch(() => {/* swallow, will surface on next write */ });
      }, this.flushIntervalMs);
    }
  }

  /** Force-flush remaining buffered events. */
  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    if (this.buffer.length === 0) return;

    const rows = this.buffer.map((event) => ({
      run_id: this.runId,
      event,
    }));

    this.buffer = [];

    const { error } = await this.supabase.from('stream_logs').insert(rows.map(r => ({
      run_id: r.run_id,
      type: 'stream_event',
      message: typeof r.event === 'string' ? r.event : JSON.stringify(r.event),
      metadata: typeof r.event === 'object' ? r.event : null,
    })));
    if (error) throw error;
  }
}

/**
 * Helper that ensures all buffered data is flushed before process exit. Useful
 * for long-runner CLI scripts that may terminate immediately after the last
 * pipeline message.
 */
export async function flushAndExit(stream: SupabaseStream, code = 0): Promise<void> {
  try {
    await stream.flush();
  } finally {
    // eslint-disable-next-line no-process-exit
    process.exit(code);
  }
}
