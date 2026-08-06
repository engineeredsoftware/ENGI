/**
 * Prepared-context types and pure helpers for the PrepareConciseContext failsafe.
 *
 * These types live with failsafes: selection, chunking, and token-budget projection
 * over Execution state keys. There is no separate Context state bag — process defaults
 * are a process-root Execution (@bitcode/generic-executions).
 */

export type ContextSelector = {
  namespace: string;
  key: string;
  sizeEstimate: number;
};

export type PreparedContext = Partial<{
  files: string[];
  dependencies: string[];
  constraints: string[];
  context: Record<string, any>;
  metadata: Record<string, any>;
}>;

export interface PrepareConciseContextOptions {
  /** Maximum tokens downstream LLM can ingest. */
  tokenLimit: number;
  /**
   * Approximate characters per token. Defaults to 4 which maps well to GPT-style
   * tokenisers and keeps chunk sizes conservative.
   */
  approxCharsPerToken?: number;
}

export interface PrepareConciseContextResult {
  preparedContexts: PreparedContext[];
  chunked: boolean;
  chunkCount: number;
  contextSize: number;
}

const DEFAULT_CHARS_PER_TOKEN = 4;

export function estimateSerializedSize(value: unknown): number {
  try {
    return JSON.stringify(value).length;
  } catch {
    return 0;
  }
}

export function createContextSelectors(
  namespaces: Array<{ namespace: string; data?: Map<string, unknown> | Record<string, unknown> | null | undefined }>,
  extras: Array<{ namespace: string; key: string; value: unknown }> = []
): ContextSelector[] {
  const selectors: ContextSelector[] = [];

  const pushEntries = (namespace: string, entries: Iterable<[string, unknown]> | undefined) => {
    if (!entries) return;
    for (const [key, value] of entries) {
      selectors.push({
        namespace,
        key: String(key),
        sizeEstimate: estimateSerializedSize(value)
      });
    }
  };

  namespaces.forEach(({ namespace, data }) => {
    if (!data) return;
    if (data instanceof Map) {
      pushEntries(namespace, data.entries());
      return;
    }
    pushEntries(namespace, Object.entries(data));
  });

  extras.forEach(({ namespace, key, value }) => {
    selectors.push({
      namespace,
      key,
      sizeEstimate: estimateSerializedSize(value)
    });
  });

  return selectors;
}

export function chunkContext<T extends Record<string, any>>(
  context: T,
  options: PrepareConciseContextOptions
): Array<T & { id: string }> {
  const approxCharsPerToken = options.approxCharsPerToken ?? DEFAULT_CHARS_PER_TOKEN;
  const chunkSize = Math.max(1000, options.tokenLimit * approxCharsPerToken * 2);
  const serialized = estimateSerializedSize(context);

  if (serialized <= chunkSize) {
    return [{ ...(context as Record<string, any>), id: '1' } as T & { id: string }];
  }

  const keys = Object.keys(context);
  const chunks: Array<T & { id: string }> = [];
  let currentChunk: Record<string, any> = { id: String(chunks.length + 1) };
  let currentSize = 0;

  for (const key of keys) {
    const value = (context as Record<string, any>)[key];
    const valueSize = estimateSerializedSize(value);

    if (currentSize > 0 && currentSize + valueSize > chunkSize) {
      chunks.push(currentChunk as T & { id: string });
      currentChunk = { id: String(chunks.length + 1) };
      currentSize = 0;
    }

    currentChunk[key] = value;
    currentSize += valueSize;
  }

  if (Object.keys(currentChunk).length > 1) {
    chunks.push(currentChunk as T & { id: string });
  }

  if (chunks.length === 0) {
    chunks.push({ ...(context as Record<string, any>), id: '1' } as T & { id: string });
  }

  return chunks;
}

export function prepareConciseContext<T extends Record<string, any>>(
  context: T,
  options: PrepareConciseContextOptions
): PrepareConciseContextResult {
  const contextSize = estimateSerializedSize(context);
  const chunks = chunkContext(context, options);
  const chunked = chunks.length > 1;

  const fallbackFiles = Array.isArray((context as PreparedContext).files) ? (context as PreparedContext).files : [];
  const fallbackDependencies = Array.isArray((context as PreparedContext).dependencies) ? (context as PreparedContext).dependencies : [];
  const fallbackConstraints = Array.isArray((context as PreparedContext).constraints) ? (context as PreparedContext).constraints : [];

  const preparedContexts: PreparedContext[] = chunks.map((chunk) => {
    const chunkFiles = Array.isArray((chunk as PreparedContext).files) ? (chunk as PreparedContext).files : fallbackFiles;
    const chunkDependencies = Array.isArray((chunk as PreparedContext).dependencies) ? (chunk as PreparedContext).dependencies : fallbackDependencies;
    const chunkConstraints = Array.isArray((chunk as PreparedContext).constraints) ? (chunk as PreparedContext).constraints : fallbackConstraints;

    const metadata = {
      ...(typeof (chunk as PreparedContext).metadata === 'object' ? (chunk as PreparedContext).metadata : undefined),
      chunkId: chunk.id
    };

    return {
      files: chunkFiles,
      dependencies: chunkDependencies,
      constraints: chunkConstraints,
      context: chunk as Record<string, any>,
      metadata
    };
  });

  return {
    preparedContexts,
    chunked,
    chunkCount: preparedContexts.length,
    contextSize
  };
}
