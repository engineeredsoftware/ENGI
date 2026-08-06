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
export declare class SupabaseStream implements DataStreamLike {
    private readonly runId;
    private readonly supabase;
    private buffer;
    private timer?;
    private readonly flushBatchSize;
    private readonly flushIntervalMs;
    constructor(runId: string, supabase?: import("@supabase/supabase-js").SupabaseClient<any, "public", any>, opts?: SupabaseStreamOptions);
    /**
     * writeData conforms to the `DataStream` contract used across the code-base.
     * It accepts either a raw string (newline-delimited JSON) or an object.
     */
    writeData(chunk: unknown): Promise<void>;
    /** Force-flush remaining buffered events. */
    flush(): Promise<void>;
}
/**
 * Helper that ensures all buffered data is flushed before process exit. Useful
 * for long-runner CLI scripts that may terminate immediately after the last
 * pipeline message.
 */
export declare function flushAndExit(stream: SupabaseStream, code?: number): Promise<void>;
