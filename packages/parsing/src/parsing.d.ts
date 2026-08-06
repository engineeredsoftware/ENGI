import { z } from 'zod';
/**
 * Generic function to extract JSON content from LLM responses with fallbacks
 */
export declare function extractJsonFromResponse(response: string): string;
/**
 * Extract all JSON object candidates from a response.
 * Tries code blocks first; then scans for balanced-brace objects (any nesting
 * depth) and returns all matches.
 */
export declare function extractAllJsonObjects(response: string): string[];
/**
 * Generic response parser with schema validation and a schema-shaped fallback
 * chain. Parsing is a SINGLE deterministic pass: the input string is immutable,
 * so re-parse retries on it are dead latency and were removed.
 */
export declare function parseResponse<T>(response: string, schema: z.ZodType<T>, fallback: () => T): Promise<T>;
/**
 * Helper to create a safe fallback object matching a schema. This is the last fallback after at least a few parsing methods have failed and
* will attempt to build the right object key by key.
 */
export declare function createFallbackResponse<T>(schema: z.ZodType<T>, error: Error, taskType?: string): T;
