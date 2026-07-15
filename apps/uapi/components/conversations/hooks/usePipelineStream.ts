import { useMemo } from 'react';

interface UsePipelineStreamOptions {
  enabled?: boolean;
  onUpdate?: (update: unknown) => void;
}

export function usePipelineStream(_runId?: string, options?: UsePipelineStreamOptions) {
  return useMemo(
    () => ({
      pipelineEvents: [] as unknown[],
      metrics: null as unknown,
      enabled: options?.enabled ?? true,
    }),
    [options?.enabled],
  );
}
